// player-exact-seek.js — exact seeking. VBR MP3 seeks in Chromium can land up to ~0.8 s away from the requested time and keep that error afterwards.
// On the first seek of a track the file is decoded to PCM, wrapped as a WAV blob and swapped into the same <audio> element at the indicated time,
// so every later seek is sample-accurate. Tracks longer than MAX_SEC keep the original source. Load after player-ui-shared.js.
(function () {
  "use strict";
  var MAX_SEC = 1500;      // longer tracks stay on the original source (WAV is ~10 MB/min)
  var RATE = 44100;
  var KEY = "qn_exact_seek";
  function enabled() { try { return localStorage.getItem(KEY) !== "0"; } catch (e) { return true; } }
  var st = { file: null, token: 0, preparing: false, swapped: false, wavUrl: null, wav: null, target: null };

  function clear() {
    st.token++;
    st.preparing = false; st.swapped = false; st.wav = null; st.target = null;
    if (st.wavUrl) { try { URL.revokeObjectURL(st.wavUrl); } catch (e) {} st.wavUrl = null; }
  }

  function encodeWav(buf) {
    var nch = Math.min(2, buf.numberOfChannels), n = buf.length, sr = buf.sampleRate;
    var data = new ArrayBuffer(44 + n * nch * 2), v = new DataView(data);
    function s(o, t) { for (var i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); }
    s(0, "RIFF"); v.setUint32(4, 36 + n * nch * 2, true); s(8, "WAVE"); s(12, "fmt ");
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, nch, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * nch * 2, true); v.setUint16(32, nch * 2, true); v.setUint16(34, 16, true);
    s(36, "data"); v.setUint32(40, n * nch * 2, true);
    var pcm = new Int16Array(n * nch);                       // little-endian devices only (all current phones/PCs)
    for (var c = 0; c < nch; c++) {
      var ch = buf.getChannelData(c);
      for (var i = 0, o = c; i < n; i++, o += nch) { var x = ch[i]; x = x < -1 ? -1 : x > 1 ? 1 : x; pcm[o] = x < 0 ? x * 32768 : x * 32767; }
    }
    return new Blob([new Uint8Array(data, 0, 44), pcm], { type: "audio/wav" });
  }

  async function decode(file) {
    var ab = await file.arrayBuffer();
    var Off = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    return await new Off(2, 1, RATE).decodeAudioData(ab);
  }

  function prepare() {
    if (st.preparing || st.swapped || !st.file) return;
    if (!(audio.duration > 0) || audio.duration > MAX_SEC) return;
    st.preparing = true;
    var tok = st.token, file = st.file;
    decode(file).then(function (buf) {
      if (tok !== st.token) return;
      st.wav = encodeWav(buf);
      st.preparing = false;
      if (audio.paused) swap();          // while playing, the swap waits for the next jump (it would cut the sound)
    }).catch(function () { if (tok === st.token) st.preparing = false; });
  }

  function swap() {
    if (!st.wav || st.swapped) return;
    var tok = st.token, wasPlaying = !audio.paused && !audio.ended;
    var t = audio.currentTime;
    var url = URL.createObjectURL(st.wav);
    var oldUrl = st.wavUrl; st.wavUrl = url; st.swapped = true;
    var keepMeta = audio.onloadedmetadata;
    audio.onloadedmetadata = null;
    var done = false;
    function ready() {
      if (done) return; done = true;
      audio.removeEventListener("loadedmetadata", ready);
      audio.onloadedmetadata = keepMeta;
      if (tok !== st.token) return;
      try { audio.currentTime = Math.min(t, Math.max(0, (audio.duration || t) - 0.05)); } catch (e) {}
      if (typeof updatePlaybackRate === "function") updatePlaybackRate();
      if (wasPlaying) audio.play().catch(function () {});
    }
    audio.addEventListener("loadedmetadata", ready);
    audio.src = url;
    audio.load();
    if (oldUrl) setTimeout(function () { try { URL.revokeObjectURL(oldUrl); } catch (e) {} }, 2000);
  }

  audio.addEventListener("seeking", function () {
    if (st.swapped || !st.file || !enabled()) return;
    if (st.wav) swap(); else prepare();
  });

  window.QNExact = {
    onLoad: function (file) {
      clear(); st.file = file;
      var tok = st.token;
      // prepare in the background shortly after loading, so the first jump is already exact (decoding can take 10 s+ on a phone)
      audio.addEventListener("loadedmetadata", function () {
        setTimeout(function () { if (tok === st.token && enabled()) prepare(); }, 1200);
      }, { once: true });
    },
    prepare: prepare,
    isExact: function () { return st.swapped; },
    getEnabled: enabled,
    setEnabled: function (on) { try { localStorage.setItem(KEY, on ? "1" : "0"); } catch (e) {} }
  };
})();
