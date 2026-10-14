// player-stem.js — Stemパネル(v4.16.0, PC専用)。再生中のローカル曲を、ブラウザ内でDemucsにより4パート(drums/bass/other/vocals)へ分離し、パート別の音量/ミュート/ソロで鳴らす。
// - 分離: JS/player-stem-worker.js(module worker)。WebGPUがあれば優先、無ければWASM単スレッド(遅い)。モデルはCache API、結果(16bit WAV×4)はIndexedDB "qn_stem_db"に曲キー(名前|サイズ)で保存。
// - 再生: マスターは既存の<audio>(#audio)をそのまま時計に使う(シーク/A-Bループ/マーカー/速度は従来通り)。Stemモード中はマスターをmutedにし、4本の<audio>(各stem WAV)を
//   マスターのcurrentTime/playbackRate/再生状態へ追従させる(ズレ>60msでcurrentTimeを合わせ直す)。EQ/Key(SoundTouch経路)はStemモード中は効かない。
// - 録音(v4.17.0): マイクをMediaRecorderで録り、デコードして16bit WAV(mono)にして保持。再生はstemと同じ追従方式で、録音開始時の曲位置(startPos)・録音時のrate・遅延補正offset(ms)から位置を決める(曲ごとにIndexedDBのキー rec|曲キー へ保存、4トラック)。
// - YouTube/iPhone(SP幅)は非対応。window.QNStem.mount(host)をplayer-ui-pc-v2.jsのswitchPanel("stem")が呼ぶ。
(function () {
  "use strict";

  var ORT_BASE = window.QN_STEM_ORT_BASE || "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/";
  // モード "4"=htdemucs(drums/bass/other/vocals) / "6"=htdemucs_6s(+guitar/piano)。6はStemSplitio/htdemucs-6s-onnxのfp16重み版(MIT)
  var MODEL_URLS = {
    "4": window.QN_STEM_MODEL_URL || "https://huggingface.co/timcsy/demucs-web-onnx/resolve/main/htdemucs_embedded.onnx",
    "6": window.QN_STEM_MODEL_URL_6 || "https://huggingface.co/StemSplitio/htdemucs-6s-onnx/resolve/main/htdemucs_6s_fp16weights.onnx"
  };
  // 6パートのWebGPU用(WebGPUで動かない演算を除いたfp32版、約285MB。CPU用は上の軽いfp16重み版)
  var MODEL_URL_6_GPU = window.QN_STEM_MODEL_URL_6_GPU || "https://huggingface.co/kramp/htdemucs-6s-webgpu-onnx/resolve/main/htdemucs_6s.onnx";
  var MODEL_MBS = { "4": 172, "6": 136 };
  function modelMB() { return st.mode === "6" && gpuOk !== false ? 285 : MODEL_MBS[st.mode]; }
  var MAX_SECS = { "4": 720, "6": 600 }; // 6は出力が6本ぶんでメモリを食うので短め
  var MODE_KEY = "qn_stem_mode";
  var VOL_UNITY = 0.7, BOOST = 3; // スライダー70%=原音、100%=3倍(約+9.5dB)。ブースト分はWeb Audio(GainNode)＋ソフトリミッターで出す
  var DB_NAME = "qn_stem_db", STORE = "stems", KEEP_MAX = 6;
  var PARTS4 = [
    { id: "vocals", label: "Vocals" },
    { id: "drums", label: "Drums" },
    { id: "bass", label: "Bass" },
    { id: "other", label: "Other" }
  ];
  var PARTS6 = [
    { id: "vocals", label: "Vocals" },
    { id: "guitar", label: "Guitar" },
    { id: "piano", label: "Piano" },
    { id: "drums", label: "Drums" },
    { id: "bass", label: "Bass" },
    { id: "other", label: "Other" }
  ];
  function parts() { return st.mode === "6" ? PARTS6 : PARTS4; }
  function ckey() { return st.key + (st.mode === "6" ? "|6" : ""); } // 保存キー(4パートは従来のまま)

  var st = {
    key: "", name: "",
    mode: (function () { try { return localStorage.getItem("qn_stem_mode") === "6" ? "6" : "4"; } catch (e) { return "4"; } })(),
    phase: "idle",          // idle | decoding | working | ready | error
    stage: "", ep: "", msg: "",
    prog: 0, dl: null, seg: 0, segTotal: 0, t0: 0,
    blobs: null, cached: false,
    active: false, els: null, urls: null,
    vol: { vocals: 0.7, drums: 0.7, bass: 0.7, other: 0.7, guitar: 0.7, piano: 0.7 }, // スライダー位置(0〜1)。0.7=原音レベル(ゲイン1.0)、1.0=ブースト上限(BOOST倍)
    peaks: null,
    mute: {}, solo: {}
  };
  var gpuOk = null; // null=確認中 / true / false(requestAdapterで実際に取れるか)
  var worker = null, root = null, recRoot = null, syncTimer = 0, tickTimer = 0, wired = false;

  function A() { return document.getElementById("audio") || (typeof audio !== "undefined" ? audio : null); }
  function curTrack() {
    try { return (typeof playlist !== "undefined" && typeof currentPlaylistIndex !== "undefined" && currentPlaylistIndex >= 0) ? playlist[currentPlaylistIndex] : null; } catch (e) { return null; }
  }
  // lastModifiedは入れない(ライブラリ復元時にFileが作り直されて毎回変わる)
  function keyOf(f) { return f ? [f.name || "", f.size || 0].join("|") : ""; }
  function isSp() { return window.matchMedia && window.matchMedia("(max-width: 900px)").matches; }

  // ---------- IndexedDB ----------
  function db() {
    return new Promise(function (res, rej) {
      var r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore(STORE, { keyPath: "key" }); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function idb(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (res, rej) {
        var tx = d.transaction(STORE, mode), out = fn(tx.objectStore(STORE));
        tx.oncomplete = function () { d.close(); res(out && out.result); };
        tx.onerror = tx.onabort = function () { d.close(); rej(tx.error); };
      });
    });
  }
  function cacheGet(key) { return idb("readonly", function (s) { return s.get(key); }).catch(function () { return null; }); }
  function cachePut(rec) {
    return idb("readwrite", function (s) { return s.put(rec); }).then(function () {
      return idb("readonly", function (s) { return s.getAll(); });
    }).then(function (all) {
      all = (all || []).filter(function (x) { return x.key.indexOf("rec|") !== 0; }).sort(function (a, b) { return b.ts - a.ts; });
      var drop = all.slice(KEEP_MAX);
      if (!drop.length) return;
      return idb("readwrite", function (s) { drop.forEach(function (x) { s.delete(x.key); }); });
    }).catch(function () {});
  }
  function cacheDel(key) { return idb("readwrite", function (s) { s.delete(key); }).catch(function () {}); }

  // ---------- 再生(stem 4本 + 録音トラックを、マスターaudioへ追従) ----------
  // ---------- 出力バス(各<audio>→GainNode→ソフトリミッター→出力)。<audio>.volumeは1.0までなのでブーストはGainNodeで行う。PC専用なのでWeb Audio経由でよい ----------
  var bus = null;
  function getBus() {
    if (bus) return bus;
    var C = window.AudioContext || window.webkitAudioContext;
    var ctx = new C({ latencyHint: "interactive" });
    var shaper = ctx.createWaveShaper(), n = 4096, curve = new Float32Array(n);
    for (var i = 0; i < n; i++) { // |x|<=0.8は素通し、それ以上はtanhで0.95付近へ丸める(ブースト時の割れ防止)
      var x = i / (n - 1) * 2 - 1, ax = Math.abs(x);
      curve[i] = ax <= 0.8 ? x : (x < 0 ? -1 : 1) * (0.8 + 0.2 * Math.tanh((ax - 0.8) / 0.2));
    }
    shaper.curve = curve; shaper.oversample = "2x";
    shaper.connect(ctx.destination);
    bus = { ctx: ctx, out: shaper };
    return bus;
  }
  function busResume() { if (bus && bus.ctx.state === "suspended") bus.ctx.resume().catch(function () {}); }
  function wireEl(e) {
    var b = getBus();
    e._qnSrc = b.ctx.createMediaElementSource(e);
    e._qnGain = b.ctx.createGain();
    e._qnSrc.connect(e._qnGain); e._qnGain.connect(b.out);
    busResume();
  }
  function unwireEl(e) { try { if (e._qnSrc) e._qnSrc.disconnect(); if (e._qnGain) e._qnGain.disconnect(); } catch (x) {} e._qnSrc = e._qnGain = null; }
  function gainOf(pos) { pos = Math.max(0, Math.min(1, pos)); return pos <= VOL_UNITY ? pos / VOL_UNITY : 1 + (pos - VOL_UNITY) / (1 - VOL_UNITY) * (BOOST - 1); }
  function setGain(e, g) { if (e && e._qnGain) e._qnGain.gain.value = g; }

  function applyVol() {
    if (st.els) {
      var anySolo = parts().some(function (p) { return st.solo[p.id]; });
      parts().forEach(function (p) {
        var on = anySolo ? !!st.solo[p.id] : !st.mute[p.id];
        setGain(st.els[p.id], on ? gainOf(st.vol[p.id]) : 0);
      });
    }
    rec.tracks.forEach(function (t) { var g = (t.mute || rec.cur === t.id) ? 0 : gainOf(t.vol); t.clips.forEach(function (c) { setGain(c.el, g); }); });
  }
  // target: その要素の再生位置(秒)。範囲外(録音開始前/終了後)・マスター停止中は止める
  function syncEl(e, target, rate, hard, m) {
    if (e.playbackRate !== rate) e.playbackRate = rate;
    var dur = e.duration;
    if (m.paused || target < 0 || (isFinite(dur) && target >= dur)) {
      if (!e.paused) e.pause();
      if (target < 0 && e.currentTime > 0.01) { try { e.currentTime = 0; } catch (x) {} }
      return;
    }
    if (hard || Math.abs(e.currentTime - target) > 0.06) { try { e.currentTime = target; } catch (x) {} }
    if (e.paused && e.readyState >= 2) e.play().catch(function () {});
  }
  function followAll(hard) {
    var m = A();
    if (!m) return;
    if (st.els) parts().forEach(function (p) { syncEl(st.els[p.id], m.currentTime, m.playbackRate, hard, m); });
    rec.tracks.forEach(function (t) {
      t.clips.forEach(function (c) {
        if (!c.el) return;
        // 録音は実時間(録音時のrate)で収録されているので、曲位置→録音内位置へ換算。offset(ms)は遅れて録れた分だけ前へ詰める
        var r = c.rate || 1;
        syncEl(c.el, (m.currentTime - c.startPos) / r + t.offset / 1000, m.playbackRate / r, hard, m);
      });
    });
  }
  // 【v4.55.0 省電力】80msの追従タイマーは「再生中で、Stemのパートか録音クリップがある」間だけ(以前は起動時から常時)。
  // 開始/停止は armSync() が毎回その場で判定する。パート/クリップを作る・壊す所と、マスターの再生イベントから呼ぶ
  function syncNeeded() {
    var m = A();
    if (!m || m.paused) return false;
    if (st.els) return true;
    return rec.tracks.some(function (t) { return t.clips.some(function (c) { return !!c.el; }); });
  }
  function armSync() {
    var need = syncNeeded();
    if (need && !syncTimer) syncTimer = setInterval(function () { if (syncNeeded()) followAll(false); else armSync(); }, 80);
    else if (!need && syncTimer) { clearInterval(syncTimer); syncTimer = 0; }
  }
  var masterEvents = ["play", "pause", "seeked", "ratechange", "waiting", "playing"];
  function onMaster(ev) { if (ev.type === "play") busResume(); followAll(ev.type === "seeked" || ev.type === "play"); armSync(); }
  function enable() {
    var m = A();
    if (!m || !st.blobs || st.active) return;
    st.urls = {}; st.els = {};
    parts().forEach(function (p) {
      var u = URL.createObjectURL(st.blobs[p.id]);
      var e = new Audio();
      e.preload = "auto"; e.src = u;
      try { e.preservesPitch = true; } catch (x) {}
      wireEl(e);
      st.urls[p.id] = u; st.els[p.id] = e;
    });
    st.active = true;
    m.muted = true;
    applyVol();
    followAll(true);
    armSync();
  }
  function disable() {
    var m = A();
    if (m) m.muted = false;
    if (st.els) parts().forEach(function (p) { unwireEl(st.els[p.id]); });
    if (st.els) parts().forEach(function (p) { try { st.els[p.id].pause(); st.els[p.id].removeAttribute("src"); st.els[p.id].load(); } catch (x) {} });
    if (st.urls) parts().forEach(function (p) { URL.revokeObjectURL(st.urls[p.id]); });
    st.els = st.urls = null; st.active = false;
    armSync();
  }

  // ---------- 録音トラック(4本)。1トラック=クリップ(WAV1本+曲上の開始位置)の並び。新しい録音が重なった部分は古い方を切る(パンチイン) ----------
  // クリップ: {blob(16bit mono WAV), startPos(曲の秒), rate(録音時の再生速度), dur(WAVの秒), el, url}。曲上の範囲=[startPos, startPos+dur*rate]
  var REC_N = 4, OFFSET_KEY = "qn_rec_offset_ms", REC_LIMIT_SEC = 600, CLIP_MIN = 0.05;
  var rec = { tracks: [], cur: -1, mr: null, stream: null, t0: 0, tick: 0, sel: null };
  function lastOffset() { try { return parseInt(localStorage.getItem(OFFSET_KEY), 10) || 0; } catch (e) { return 0; } }
  function newRecTracks() {
    rec.tracks = []; rec.sel = null;
    for (var i = 0; i < REC_N; i++) rec.tracks.push({ id: i, clips: [], offset: lastOffset(), vol: VOL_UNITY, mute: false });
  }
  newRecTracks();
  function clipEnd(c) { return c.startPos + c.dur * (c.rate || 1); }
  function clipFree(c) {
    if (c.el) { try { c.el.pause(); } catch (x) {} unwireEl(c.el); try { c.el.removeAttribute("src"); c.el.load(); } catch (x) {} }
    if (c.url) URL.revokeObjectURL(c.url);
    c.el = null; c.url = "";
    armSync();
  }
  function clipMakeEl(c) {
    clipFree(c);
    c.url = URL.createObjectURL(c.blob);
    c.el = new Audio(); c.el.preload = "auto"; c.el.src = c.url;
    try { c.el.preservesPitch = true; } catch (x) {}
    wireEl(c.el);
    armSync();
  }
  function sortClips(t) { t.clips.sort(function (a, b) { return a.startPos - b.startPos; }); }
  function recTotal() { var s = 0; rec.tracks.forEach(function (t) { t.clips.forEach(function (c) { s += c.dur; }); }); return s; }
  function hasClips() { return rec.tracks.some(function (t) { return t.clips.length; }); }
  function recClear() {
    if (rec.cur >= 0) recAbort();
    rec.tracks.forEach(function (t) { t.clips.forEach(clipFree); });
    newRecTracks();
    if (wsel >= 0) { wsel = -1; wpk = null; redrawBars(); }
  }
  function recSave() {
    if (!st.key) return Promise.resolve();
    var k = "rec|" + st.key;
    if (!hasClips()) return cacheDel(k);
    return idb("readwrite", function (s) {
      return s.put({ key: k, ts: Date.now(), recs: rec.tracks.map(function (t) {
        return { id: t.id, v2: true, v3: true, vol: t.vol, mute: t.mute, offset: t.offset, clips: t.clips.map(function (c) { return { blob: c.blob, startPos: c.startPos, rate: c.rate, dur: c.dur }; }) };
      }) });
    }).catch(function () {});
  }
  function wavDur(blob) { // 旧データ(クリップ化前)用。自前WAVは44バイトヘッダ+16bit mono
    return blob.slice(0, 44).arrayBuffer().then(function (ab) { var sr = new DataView(ab).getUint32(24, true) || 44100; return Math.max(0, (blob.size - 44) / 2 / sr); });
  }
  function recLoad(key) {
    return cacheGet("rec|" + key).then(function (r) {
      if (!r || st.key !== key) return;
      var jobs = [];
      r.recs.forEach(function (x) {
        var t = rec.tracks[x.id]; if (!t) return;
        t.vol = x.v2 ? x.vol : VOL_UNITY; t.mute = !!x.mute; t.offset = x.offset || 0; // v2無し=旧単位の音量なので原音レベルに戻す
        if (Array.isArray(x.clips)) {
          x.clips.forEach(function (c) { var n = { blob: c.blob, startPos: c.startPos, rate: c.rate || 1, dur: c.dur, el: null, url: "" }; clipMakeEl(n); t.clips.push(n); });
          sortClips(t);
        } else if (x.blob) { // クリップ化前: 1トラック1WAV
          jobs.push(wavDur(x.blob).then(function (d) { var n = { blob: x.blob, startPos: x.startPos || 0, rate: x.rate || 1, dur: d, el: null, url: "" }; clipMakeEl(n); t.clips.push(n); }));
        }
      });
      return Promise.all(jobs);
    }).then(function () { applyVol(); followAll(true); render(); refreshWave(); });
  }
  function wavFromI16(i16, sr) {
    var n = i16.length, out = new ArrayBuffer(44 + n * 2), v = new DataView(out);
    var w = function (o, str) { for (var i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
    w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt ");
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    w(36, "data"); v.setUint32(40, n * 2, true);
    new Int16Array(out, 44, n).set(i16);
    return new Blob([out], { type: "audio/wav" });
  }
  function wavMono(f32, sr) {
    var n = f32.length, i16 = new Int16Array(n);
    for (var i = 0; i < n; i++) { var a = Math.max(-1, Math.min(1, f32[i])); i16[i] = a < 0 ? a * 32768 : a * 32767; }
    return wavFromI16(i16, sr);
  }
  // クリップの曲上の範囲[from,to]だけを切り出した新しいクリップ(WAVも切り詰めるので、上書きで消えた分の容量は残らない)
  function sliceClip(c, from, to) {
    var r = c.rate || 1;
    return c.blob.arrayBuffer().then(function (ab) {
      var v = new DataView(ab), sr = v.getUint32(24, true) || 44100, n = (ab.byteLength - 44) >> 1;
      var s0 = Math.max(0, Math.min(n, Math.floor((from - c.startPos) / r * sr)));
      var s1 = Math.max(s0, Math.min(n, Math.ceil((to - c.startPos) / r * sr)));
      var out = new Int16Array(ab, 44, n).slice(s0, s1);
      return { blob: wavFromI16(out, sr), startPos: c.startPos + s0 / sr * r, rate: r, dur: out.length / sr, el: null, url: "" };
    });
  }
  // [s,e]に重なる既存クリップを切る(完全に隠れるものは消え、はみ出す分だけ残る)
  function punch(t, s, e) {
    var keep = [], jobs = [];
    t.clips.forEach(function (c) {
      var cs = c.startPos, ce = clipEnd(c);
      if (ce <= s + 1e-3 || cs >= e - 1e-3) { keep.push(c); return; }
      clipFree(c);
      if (cs < s - CLIP_MIN) jobs.push(sliceClip(c, cs, s));
      if (ce > e + CLIP_MIN) jobs.push(sliceClip(c, e, ce));
    });
    return Promise.all(jobs).then(function (ps) {
      ps.forEach(function (p) { if (p.dur >= CLIP_MIN) { clipMakeEl(p); keep.push(p); } });
      t.clips = keep; sortClips(t);
    });
  }
  function recAdd(t, c) {
    return punch(t, c.startPos, clipEnd(c)).then(function () { clipMakeEl(c); t.clips.push(c); sortClips(t); });
  }
  function recCleanup() {
    clearInterval(rec.tick);
    if (rec.stream) { rec.stream.getTracks().forEach(function (x) { x.stop(); }); }
    rec.stream = null; rec.mr = null; rec.cur = -1;
    recMicRelease();
  }
  var recMicHeld = false; // iOS: 録音中だけaudioSessionを"play-and-record"にする(qn-wakelock.js)。"playback"のままだとマイクを開けない
  function recMicRelease() { if (recMicHeld) { recMicHeld = false; try { QNWake.micOff(); } catch (e) {} } }
  function recAbort() {
    var mr = rec.mr;
    if (mr) { mr.onstop = null; try { mr.stop(); } catch (x) {} }
    recCleanup(); applyVol(); render();
  }
  function recStart(i) {
    var m = A(), t = rec.tracks[i];
    if (!m || rec.cur >= 0 || !t) return;
    if (!navigator.mediaDevices || !window.MediaRecorder) { st.recMsg = "Recording is not supported in this browser"; render(); return; }
    if (recTotal() >= REC_LIMIT_SEC) { st.recMsg = "Recording limit reached (" + fmtT(REC_LIMIT_SEC) + " per song). Delete a clip to record more."; render(); return; }
    st.recMsg = "";
    if (!recMicHeld && window.QNWake && QNWake.micOn) { recMicHeld = true; QNWake.micOn(); }
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).then(function (stream) {
      var chunks = [], mr = new MediaRecorder(stream), sp = 0, rt = 1;
      rec.stream = stream; rec.mr = mr; rec.cur = i; rec.t0 = Date.now();
      mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      mr.onstart = function () {
        sp = m.currentTime; rt = m.playbackRate || 1;
        if (m.paused) m.play().catch(function () {});
        applyVol(); // 録音中のトラックは鳴らさない(重ねて録る前の音が混ざらない)
      };
      mr.onstop = function () {
        var type = mr.mimeType;
        recCleanup(); st.recMsg = "Processing recording…"; render();
        new Blob(chunks, { type: type }).arrayBuffer().then(function (ab) {
          return new OfflineAudioContext(1, 44100, 44100).decodeAudioData(ab);
        }).then(function (buf) {
          var had = t.clips.length;
          var c = { blob: wavMono(buf.getChannelData(0), buf.sampleRate), startPos: sp, rate: rt, dur: buf.duration, el: null, url: "" };
          if (!had) t.offset = lastOffset();
          return recAdd(t, c);
        }).then(function () {
          applyVol(); followAll(true); st.recMsg = ""; recSave(); render(); refreshWave();
        }).catch(function () { applyVol(); st.recMsg = "Could not process the recording"; render(); });
      };
      mr.start();
      rec.tick = setInterval(function () {
        var el = (Date.now() - rec.t0) / 1000;
        var e = recRoot && recRoot.querySelector(".qn-rec-time"); if (e) e.textContent = fmtT(el);
        if (recTotal() + el >= REC_LIMIT_SEC) { st.recMsg = "Recording limit reached (" + fmtT(REC_LIMIT_SEC) + " per song)"; recStop(); }
      }, 500);
      render();
    }).catch(function (err) {
      recMicRelease();
      st.recMsg = (err && err.name === "NotAllowedError") ? "Microphone access was denied" : "Could not access the microphone";
      render();
    });
  }
  function recStop() { if (rec.mr && rec.mr.state !== "inactive") rec.mr.stop(); }
  function recDelete(i) { // トラックの録音をすべて消す
    var t = rec.tracks[i];
    t.clips.forEach(clipFree); t.clips = [];
    if (rec.sel && rec.sel.t === i) rec.sel = null;
    recSave(); render(); refreshWave();
  }
  function recDeleteClip(t, c) {
    clipFree(c); t.clips = t.clips.filter(function (x) { return x !== c; });
    rec.sel = null; recSave(); render(); refreshWave();
  }
  function recNudge(t, c, dt) { // クリップを前後へ動かす。動かした先で重なる部分は、動かした方が勝つ
    var np = Math.max(0, c.startPos + dt);
    if (np === c.startPos) return;
    t.clips = t.clips.filter(function (x) { return x !== c; });
    c.startPos = np;
    punch(t, c.startPos, clipEnd(c)).then(function () { t.clips.push(c); sortClips(t); followAll(true); recSave(); render(); refreshWave(); });
  }

  // ---------- シークバーの波形を録音に切り替える(Rec 1〜4のボタン)。-1=曲そのまま ----------
  var wsel = -1, wpk = null;
  window.QNWaveOverride = function () { return wsel >= 0 ? wpk : null; };
  function redrawBars() {
    window.__qnWaveformDrawCount = (window.__qnWaveformDrawCount || 0) + 1;
    try { QNBars.sync(); QNBars.draw(true); } catch (e) {}
  }
  function refreshWave() {
    if (wsel < 0) return Promise.resolve();
    var m = A(), N = (typeof waveformPeaks !== "undefined" && waveformPeaks) ? waveformPeaks.length : 0;
    if (!m || !isFinite(m.duration) || !N) { wpk = null; return Promise.resolve(); }
    var t = rec.tracks[wsel], k = N / m.duration, mine = wsel, pk = new Float32Array(N);
    wpk = pk; redrawBars(); // 計算が終わるまでは無音の行
    return Promise.all(t.clips.map(function (c) {
      return c.blob.arrayBuffer().then(function (ab) {
        var sr = new DataView(ab).getUint32(24, true) || 44100, n = (ab.byteLength - 44) >> 1, d = new Int16Array(ab, 44, n), r = c.rate || 1;
        for (var j = 0; j < n; j++) {
          var a = d[j] < 0 ? -d[j] / 32768 : d[j] / 32768;
          if (a === 0) continue;
          var b = Math.floor((c.startPos + j / sr * r) * k);
          if (b >= 0 && b < N && a > pk[b]) pk[b] = a;
        }
      });
    })).then(function () {
      if (wsel !== mine || wpk !== pk) return;
      var mx = 0, i;
      for (i = 0; i < N; i++) if (pk[i] > mx) mx = pk[i];
      if (mx > 0) for (i = 0; i < N; i++) pk[i] /= mx;
      wpk = new Float32Array(pk); // 参照が変わらないとシークバー側の行キャッシュが更新されない
      redrawBars();
    });
  }
  function setWaveSel(i) {
    wsel = i; wpk = null;
    if (i < 0) redrawBars(); else refreshWave();
    render();
  }

  // ---------- 書き出し(録音トラックのミックス。withSong=曲も入れる) ----------
  function wavStereo(buf) {
    var n = buf.length, ch = buf.numberOfChannels, L = buf.getChannelData(0), R = ch > 1 ? buf.getChannelData(1) : L, sr = buf.sampleRate;
    var peak = 0, i;
    for (i = 0; i < n; i++) { var a = Math.abs(L[i]), b = Math.abs(R[i]); if (a > peak) peak = a; if (b > peak) peak = b; }
    var g = peak > 0.98 ? 0.98 / peak : 1;
    var out = new ArrayBuffer(44 + n * 4), v = new DataView(out);
    var w = function (o, str) { for (var k = 0; k < str.length; k++) v.setUint8(o + k, str.charCodeAt(k)); };
    w(0, "RIFF"); v.setUint32(4, 36 + n * 4, true); w(8, "WAVE"); w(12, "fmt ");
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true);
    w(36, "data"); v.setUint32(40, n * 4, true);
    var o = 44;
    for (i = 0; i < n; i++) {
      var l = Math.max(-1, Math.min(1, L[i] * g)), r = Math.max(-1, Math.min(1, R[i] * g));
      v.setInt16(o, l < 0 ? l * 32768 : l * 32767, true); v.setInt16(o + 2, r < 0 ? r * 32768 : r * 32767, true); o += 4;
    }
    return new Blob([out], { type: "audio/wav" });
  }
  function exportMix(withSong) {
    var m = A();
    if (!m || !isFinite(m.duration) || !hasClips()) return;
    st.recMsg = "Exporting…"; render();
    var sr = 44100, len = Math.ceil(m.duration * sr), ctx = new OfflineAudioContext(2, len, sr);
    var songP = withSong ? fetch(m.currentSrc || m.src).then(function (r) { return r.arrayBuffer(); }).then(function (ab) { return ctx.decodeAudioData(ab); }) : Promise.resolve(null);
    var clipPs = [];
    rec.tracks.forEach(function (t) {
      if (t.mute) return;
      t.clips.forEach(function (c) { clipPs.push(c.blob.arrayBuffer().then(function (ab) { return ctx.decodeAudioData(ab); }).then(function (b) { return { t: t, c: c, b: b }; })); });
    });
    Promise.all([songP, Promise.all(clipPs)]).then(function (res) {
      var song = res[0];
      if (song) { var s = ctx.createBufferSource(); s.buffer = song; s.connect(ctx.destination); s.start(0); }
      res[1].forEach(function (x) {
        var src = ctx.createBufferSource(), g = ctx.createGain();
        src.buffer = x.b; g.gain.value = gainOf(x.t.vol); src.connect(g); g.connect(ctx.destination);
        var at = x.c.startPos - x.t.offset / 1000 * (x.c.rate || 1), skip = 0; // 再生と同じ位置関係(Delayぶん前へ詰める)
        if (at < 0) { skip = -at; at = 0; }
        if (skip < x.b.duration) src.start(at, skip);
      });
      return ctx.startRendering();
    }).then(function (buf) {
      var url = URL.createObjectURL(wavStereo(buf)), a = document.createElement("a");
      a.href = url; a.download = (st.name || "track").replace(/\.[^.]+$/, "") + (withSong ? " - mix" : " - rec") + ".wav";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      st.recMsg = ""; render();
    }).catch(function () { st.recMsg = "Could not export"; render(); });
  }

  // ---------- 分離 ----------
  function decode(file) {
    return file.arrayBuffer().then(function (ab) {
      var ctx = new OfflineAudioContext(2, 44100, 44100);
      return ctx.decodeAudioData(ab);
    }).then(function (buf) {
      var l = buf.getChannelData(0).slice();
      var r = (buf.numberOfChannels > 1 ? buf.getChannelData(1) : buf.getChannelData(0)).slice();
      return { l: l, r: r, dur: buf.duration };
    });
  }
  function stop() {
    if (worker) { worker.terminate(); worker = null; }
    st.phase = "idle"; st.stage = ""; render();
  }
  function start() {
    var tr = curTrack();
    if (!tr || !tr.file) return;
    var key = keyOf(tr.file), mode = st.mode;
    st.key = key; st.name = tr.name || tr.file.name || "";
    st.phase = "decoding"; st.msg = ""; st.note = ""; st.prog = 0; st.dl = null; st.seg = 0; st.segTotal = 0; st.t0 = Date.now();
    render();
    decode(tr.file).then(function (d) {
      if (st.key !== key || st.phase !== "decoding") return;
      if (d.dur > MAX_SECS[st.mode]) throw new Error("This track is too long (limit: " + Math.round(MAX_SECS[st.mode] / 60) + " min)");
      st.phase = "working"; st.stage = "download"; st.t0 = Date.now(); render();
      worker = new Worker("JS/player-stem-worker.js", { type: "module" });
      worker.onmessage = function (e) {
        var d2 = e.data;
        if (st.key !== key) return;
        if (d2.type === "download") st.dl = d2;
        else if (d2.type === "status") { st.stage = d2.stage; if (d2.ep) st.ep = d2.ep; st.note = d2.note || st.note; if (d2.stage === "separate") st.t0 = Date.now(); }
        else if (d2.type === "progress") { st.prog = d2.p; st.seg = d2.seg; st.segTotal = d2.total; }
        else if (d2.type === "error") { worker.terminate(); worker = null; st.phase = "error"; st.msg = d2.message; }
        else if (d2.type === "done") {
          worker.terminate(); worker = null;
          st.blobs = d2.stems; st.ep = d2.ep; st.phase = "ready"; st.cached = true;
          cachePut({ key: key + (mode === "6" ? "|6" : ""), name: st.name, ts: Date.now(), stems: d2.stems });
        }
        render();
      };
      worker.onerror = function (e) { if (worker) worker.terminate(); worker = null; st.phase = "error"; st.msg = (e && e.message) || "Worker failed"; render(); };
      worker.postMessage({ ortBase: ORT_BASE, modelUrl: MODEL_URLS[mode], modelUrlGpu: mode === "6" ? MODEL_URL_6_GPU : MODEL_URLS[mode], mode: mode, left: d.l, right: d.r, useGpu: true }, [d.l.buffer, d.r.buffer]);
    }).catch(function (err) {
      if (st.key !== key) return;
      st.phase = "error"; st.msg = (err && err.message) || "Could not decode this file"; render();
    });
  }

  // ---------- 曲の切替追従 ----------
  function onTrackChange() {
    var tr = curTrack(), key = tr && tr.file ? keyOf(tr.file) : "";
    if (key === st.key) return;
    if (st.active) disable();
    if (worker) { worker.terminate(); worker = null; }
    recClear();
    st.key = key; st.name = tr ? (tr.name || (tr.file && tr.file.name) || "") : "";
    st.blobs = null; st.cached = false; st.phase = "idle"; st.msg = ""; st.solo = {}; st.mute = {};
    if (key) recLoad(key);
    loadStems();
    render();
  }
  function loadStems() {
    var key = st.key, ck = ckey();
    if (!key) return;
    cacheGet(ck).then(function (rec) {
      if (rec && st.key === key && ckey() === ck && st.phase === "idle") { st.blobs = rec.stems; st.cached = true; st.phase = "ready"; render(); }
    });
  }
  function setMode(m) {
    if (m === st.mode || st.phase === "working" || st.phase === "decoding") return;
    if (st.active) disable();
    st.mode = m;
    try { localStorage.setItem(MODE_KEY, m); } catch (e) {}
    st.blobs = null; st.cached = false; st.phase = "idle"; st.msg = ""; st.solo = {}; st.mute = {};
    loadStems();
    render();
  }
  function wire() {
    if (wired) return;
    var m = A();
    if (!m) return;
    wired = true;
    ["loadedmetadata", "emptied"].forEach(function (n) { m.addEventListener(n, function () { setTimeout(onTrackChange, 0); }); });
    masterEvents.forEach(function (n) { m.addEventListener(n, onMaster); });
    m.addEventListener("ended", function () { if (rec.cur >= 0) recStop(); });
  }

  // ---------- UI ----------
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function fmtT(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }

  function render() { renderStem(); renderRecPanel(); }
  function renderStem() {
    if (!root || !root.isConnected) return;
    clearInterval(tickTimer);
    root.textContent = "";
    var tr = curTrack();
    if (isSp()) { root.appendChild(h("p", "qn-stem-note", "Stem is available on PC only for now.")); return; }
    if (!tr || !tr.file) { root.appendChild(h("p", "qn-stem-note", "Load a track in Library to separate it into parts.")); return; }

    var head = h("div", "qn-stem-track");
    head.appendChild(h("small", "", "Track"));
    head.appendChild(h("span", "", st.name || tr.name || tr.file.name));
    root.appendChild(head);

    if (st.phase === "idle" || st.phase === "error" || st.phase === "ready") {
      var seg = h("div", "qn-stem-seg");
      [["4", "4 parts"], ["6", "6 parts"]].forEach(function (o) {
        var sb = h("button", "qn-stem-segbtn" + (st.mode === o[0] ? " is-on" : ""), o[1]); sb.type = "button";
        sb.addEventListener("click", function () { setMode(o[0]); });
        seg.appendChild(sb);
      });
      root.appendChild(seg);
    }
    if (st.phase === "idle" || st.phase === "error") {
      if (st.phase === "error") root.appendChild(h("p", "qn-stem-err", st.msg));
      var gpu = gpuOk !== false;
      root.appendChild(h("p", "qn-stem-note", gpu
        ? "Runs in this browser (WebGPU). The first run downloads a model of about " + modelMB() + " MB."
        : "WebGPU is not available here, so processing runs on the CPU and can take a very long time. The first run downloads a model of about " + modelMB() + " MB."));
      var b = h("button", "qn-stem-btn is-primary", st.mode === "6" ? "Separate into 6 parts" : "Separate into 4 parts");
      b.type = "button";
      b.addEventListener("click", start);
      root.appendChild(b);
    } else if (st.phase === "decoding") {
      root.appendChild(h("p", "qn-stem-note", "Decoding audio…"));
    } else if (st.phase === "working") {
      var label = st.stage === "download" ? "Downloading model" : st.stage === "load" ? "Loading model" : st.stage === "encode" ? "Preparing parts" : "Separating";
      var pct = 0, info = "";
      if (st.stage === "download" && st.dl) {
        var tot = st.dl.total || modelMB() * 1048576;
        pct = Math.min(1, st.dl.loaded / tot);
        info = st.dl.cached ? "Using the saved model" : Math.round(st.dl.loaded / 1048576) + " / " + Math.round(tot / 1048576) + " MB";
      } else if (st.stage === "separate") {
        pct = st.prog;
        var el = (Date.now() - st.t0) / 1000;
        info = (st.ep === "webgpu" ? "WebGPU" : "CPU") + (st.segTotal ? "  " + st.seg + " / " + st.segTotal : "") +
          (st.prog > 0.02 ? "  about " + fmtT(el / st.prog - el) + " left" : "");
      }
      root.appendChild(h("div", "qn-stem-label", label));
      var bar = h("div", "qn-stem-bar"), fill = h("i"); fill.style.width = Math.round(pct * 100) + "%"; bar.appendChild(fill);
      root.appendChild(bar);
      root.appendChild(h("p", "qn-stem-note", info));
      if (st.note) root.appendChild(h("p", "qn-stem-err", st.note + ". Using the CPU instead."));
      var c = h("button", "qn-stem-btn", "Cancel"); c.type = "button"; c.addEventListener("click", stop);
      root.appendChild(c);
      tickTimer = setInterval(render, 1000);
    } else if (st.phase === "ready") {
      var row = h("div", "qn-set-row");
      var lab = h("div", "qn-set-label"); lab.appendChild(h("span", "", "Stem mode")); lab.appendChild(h("small", "", "Play the separated parts instead of the original"));
      var ctl = h("div", "qn-set-ctl");
      var sw = h("button", "qn-set-switch" + (st.active ? " is-on" : "")); sw.type = "button"; sw.appendChild(h("span"));
      sw.addEventListener("click", function () { if (st.active) disable(); else enable(); render(); });
      ctl.appendChild(sw); row.appendChild(lab); row.appendChild(ctl);
      root.appendChild(row);

      var mix = h("div", "qn-stem-mix" + (st.active ? "" : " is-off"));
      parts().forEach(function (p) {
        var box = h("div", "qn-stem-partbox");
        var r = h("div", "qn-stem-part");
        r.appendChild(h("span", "qn-stem-name", p.label));
        var mb = h("button", "qn-stem-ms" + (st.mute[p.id] ? " is-on" : ""), "M"); mb.type = "button"; mb.title = "Mute";
        var sb = h("button", "qn-stem-ms" + (st.solo[p.id] ? " is-on is-solo" : ""), "S"); sb.type = "button"; sb.title = "Solo";
        var rg = h("input", "qn-set-range"); rg.type = "range"; rg.min = 0; rg.max = 100; rg.step = 1; rg.value = Math.round(st.vol[p.id] * 100);
        rg.title = "70 = original level, up to 100 = boost";
        var val = h("em", "qn-stem-vol", String(rg.value));
        var paint = function () { rg.style.setProperty("--p", rg.value + "%"); val.textContent = rg.value; };
        paint();
        rg.addEventListener("input", function () { st.vol[p.id] = parseFloat(rg.value) / 100; paint(); applyVol(); });
        rg.addEventListener("dblclick", function () { rg.value = VOL_UNITY * 100; st.vol[p.id] = VOL_UNITY; paint(); applyVol(); });
        mb.addEventListener("click", function () { st.mute[p.id] = !st.mute[p.id]; applyVol(); mb.classList.toggle("is-on", !!st.mute[p.id]); box.classList.toggle("is-muted", !!st.mute[p.id]); });
        sb.addEventListener("click", function () { st.solo[p.id] = !st.solo[p.id]; applyVol(); sb.classList.toggle("is-on", !!st.solo[p.id]); sb.classList.toggle("is-solo", !!st.solo[p.id]); });
        r.appendChild(mb); r.appendChild(sb); r.appendChild(rg); r.appendChild(val);
        box.appendChild(r);
        var wv = h("div", "qn-stem-wave"); wv.dataset.part = p.id;
        wv.appendChild(h("canvas")); wv.appendChild(h("i", "qn-stem-head"));
        wv.addEventListener("click", function (ev) {
          var m = A(); if (!m || !m.duration) return;
          var rc = wv.getBoundingClientRect(); m.currentTime = Math.max(0, Math.min(1, (ev.clientX - rc.left) / rc.width)) * m.duration;
        });
        box.appendChild(wv);
        mix.appendChild(box);
      });
      root.appendChild(mix);
      ensurePeaks(); startWaveLoop();
      root.appendChild(h("p", "qn-stem-note", "EQ and Key do not apply in stem mode. Speed, seek and loop work as usual."));
      var del = h("button", "qn-stem-btn", "Delete saved parts"); del.type = "button";
      del.addEventListener("click", function () {
        if (st.active) disable();
        var k = ckey(); st.blobs = null; st.cached = false; st.phase = "idle";
        cacheDel(k).then(render);
      });
      root.appendChild(del);
    }
  }

  // ---------- パートごとの波形(1行) ----------
  var PEAK_N = 900, waveRaf = 0;
  function peaksOf(blob) {
    return blob.arrayBuffer().then(function (ab) {
      var pcm = new Int16Array(ab, 44, Math.floor((ab.byteLength - 44) / 2)), frames = pcm.length >> 1, out = new Float32Array(PEAK_N);
      for (var b = 0; b < PEAK_N; b++) {
        var i0 = Math.floor(b * frames / PEAK_N), i1 = Math.max(i0 + 1, Math.floor((b + 1) * frames / PEAK_N)), mx = 0;
        for (var i = i0; i < i1; i++) { var a = pcm[i * 2], c = pcm[i * 2 + 1]; if (a < 0) a = -a; if (c < 0) c = -c; if (a > mx) mx = a; if (c > mx) mx = c; }
        out[b] = mx / 32768;
      }
      return out;
    });
  }
  function ensurePeaks() {
    if (!st.blobs) return;
    if (st.peaks && st.peaksFor === st.blobs) { paintWaves(); return; }
    var blobs = st.blobs; st.peaks = {}; st.peaksFor = blobs;
    Promise.all(Object.keys(blobs).map(function (k) { return peaksOf(blobs[k]).then(function (pk) { if (st.blobs === blobs) st.peaks[k] = pk; }); }))
      .then(function () { if (st.blobs === blobs) paintWaves(); });
  }
  function paintWaves() {
    if (!root || !st.peaks) return;
    var color = getComputedStyle(root).getPropertyValue("--accent-primary").trim() || "#3b82f6";
    root.querySelectorAll(".qn-stem-wave").forEach(function (wv) {
      var pk = st.peaks[wv.dataset.part], cv = wv.firstChild;
      if (!pk || !wv.clientWidth) return;
      var dpr = window.devicePixelRatio || 1, w = Math.floor(wv.clientWidth * dpr), hh = Math.floor(wv.clientHeight * dpr);
      cv.width = w; cv.height = hh;
      var g = cv.getContext("2d"); g.clearRect(0, 0, w, hh); g.fillStyle = color;
      var mid = hh / 2, bw = Math.max(1, Math.floor(2 * dpr)), step = bw + Math.max(1, Math.floor(dpr)); // 棒グラフ(メインのバー波形に合わせた細い棒)
      for (var x = 0, n = 0; x < w; x += step, n++) {
        var v = pk[Math.min(PEAK_N - 1, Math.floor(x / w * PEAK_N))];
        var bh = Math.max(dpr, Math.sqrt(v) * hh * 0.95); // sqrtで小さい音も見えるように
        g.fillRect(x, mid - bh / 2, bw, bh);
      }
    });
  }
  function waveLoop() {
    waveRaf = 0;
    if (!root || !root.isConnected || !st.blobs) return;
    var m = A();
    if (m && m.duration) {
      var left = (m.currentTime / m.duration * 100) + "%";
      root.querySelectorAll(".qn-stem-head").forEach(function (e) { e.style.left = left; });
    }
    waveRaf = requestAnimationFrame(waveLoop);
  }
  function startWaveLoop() { if (!waveRaf) waveRaf = requestAnimationFrame(waveLoop); }

  function slider(min, max, step, val, onInput) {
    var rg = h("input", "qn-set-range"); rg.type = "range"; rg.min = min; rg.max = max; rg.step = step; rg.value = val;
    var paint = function () { rg.style.setProperty("--p", Math.round((rg.value - min) / (max - min) * 100) + "%"); };
    paint();
    rg.addEventListener("input", function () { paint(); onInput(parseFloat(rg.value)); });
    return rg;
  }
  function fmtMs(v) { return (v > 0 ? "+" : "") + v + " ms"; }
  function renderRecPanel() {
    if (!recRoot || !recRoot.isConnected) return;
    recRoot.textContent = "";
    var tr = curTrack();
    if (!tr || !tr.file) { recRoot.appendChild(h("p", "qn-stem-note", "Load a track in Library to record.")); return; }
    var head = h("div", "qn-stem-track");
    head.appendChild(h("small", "", "Track"));
    head.appendChild(h("span", "", st.name || tr.name || tr.file.name));
    recRoot.appendChild(head);
    renderRec();
  }
  function renderRec() {
        recRoot.appendChild(h("p", "qn-stem-note", "Records from the microphone while the track plays. Use headphones. A new recording replaces what it overlaps on the same track. Tap a Rec number to show its waveform on the seek bar. If a take sounds late or early, adjust its Delay."));
    if (st.recMsg) recRoot.appendChild(h("p", "qn-stem-err", st.recMsg));
    var m = A(), sdur = m && isFinite(m.duration) ? m.duration : 0;
    // 波形の切り替え: Song / 1〜4
    var sw = h("div", "qn-rec-wsw"); sw.appendChild(h("span", "", "Waveform"));
    var mk = function (label, idx) {
      var b = h("button", "qn-rec-wbtn" + (wsel === idx ? " is-on" : ""), label); b.type = "button";
      if (idx >= 0 && !rec.tracks[idx].clips.length) b.classList.add("is-empty");
      b.addEventListener("click", function () { setWaveSel(wsel === idx ? -1 : idx); });
      sw.appendChild(b);
    };
    mk("Song", -1); for (var q = 0; q < REC_N; q++) mk(String(q + 1), q);
    recRoot.appendChild(sw);
    rec.tracks.forEach(function (t, i) {
      var recording = rec.cur === i, busy = rec.cur >= 0 && !recording, has = t.clips.length > 0;
      var card = h("div", "qn-rec" + (recording ? " is-rec" : ""));
      var top = h("div", "qn-rec-top");
      var nm = h("button", "qn-stem-name qn-rec-name" + (wsel === i ? " is-on" : ""), "Rec " + (i + 1)); nm.type = "button"; nm.title = "Show on the seek bar";
      nm.addEventListener("click", function () { setWaveSel(wsel === i ? -1 : i); });
      top.appendChild(nm);
      if (recording) top.appendChild(h("span", "qn-rec-time", "0:00"));
      var rb = h("button", "qn-stem-btn qn-rec-btn" + (recording ? " is-stop" : " is-primary"), recording ? "Stop" : "Record");
      rb.type = "button"; rb.disabled = busy;
      rb.addEventListener("click", function () { if (recording) recStop(); else recStart(i); });
      top.appendChild(rb);
      if (has && !recording) {
        var mb = h("button", "qn-stem-ms" + (t.mute ? " is-on" : ""), "M"); mb.type = "button"; mb.title = "Mute";
        mb.addEventListener("click", function () { t.mute = !t.mute; applyVol(); mb.classList.toggle("is-on", t.mute); recSave(); });
        var db2 = h("button", "qn-stem-ms", "×"); db2.type = "button"; db2.title = "Delete all recordings on this track";
        db2.addEventListener("click", function () { recDelete(i); });
        top.appendChild(mb); top.appendChild(db2);
      }
      card.appendChild(top);
      if (has && !recording) {
        // クリップの帯(曲の長さに対する位置)。タップで選ぶと、前後へ動かす/消すができる
        var strip = h("div", "qn-rec-strip");
        var span = Math.max(sdur, t.clips.reduce(function (a2, c) { return Math.max(a2, clipEnd(c)); }, 0)) || 1;
        t.clips.forEach(function (c) {
          var blk = h("button", "qn-rec-clip" + (rec.sel === c ? " is-on" : "")); blk.type = "button";
          blk.style.left = (c.startPos / span * 100) + "%"; blk.style.width = Math.max(0.8, c.dur * (c.rate || 1) / span * 100) + "%";
          blk.title = fmtT(c.startPos) + " - " + fmtT(clipEnd(c));
          blk.addEventListener("click", function () { rec.sel = rec.sel === c ? null : c; render(); });
          strip.appendChild(blk);
        });
        card.appendChild(strip);
        if (rec.sel && t.clips.indexOf(rec.sel) >= 0) {
          var c0 = rec.sel, cl = h("div", "qn-rec-clipbar");
          cl.appendChild(h("span", "", fmtT(c0.startPos) + " - " + fmtT(clipEnd(c0))));
          [["-0.1 s", -0.1], ["+0.1 s", 0.1]].forEach(function (x) {
            var nb = h("button", "qn-stem-ms qn-rec-nudge", x[0]); nb.type = "button";
            nb.addEventListener("click", function () { recNudge(t, c0, x[1]); });
            cl.appendChild(nb);
          });
          var dc = h("button", "qn-stem-ms qn-rec-nudge", "Delete clip"); dc.type = "button";
          dc.addEventListener("click", function () { recDeleteClip(t, c0); });
          cl.appendChild(dc);
          card.appendChild(cl);
        }
        var r1 = h("div", "qn-rec-line"); r1.appendChild(h("span", "", "Volume"));
        var vv = h("em", "", String(Math.round(t.vol * 100)));
        r1.appendChild(slider(0, 100, 1, Math.round(t.vol * 100), function (v) { t.vol = v / 100; vv.textContent = String(v); applyVol(); }));
        r1.lastChild.addEventListener("change", recSave);
        r1.lastChild.title = "70 = original level, up to 100 = boost";
        r1.appendChild(vv);
        card.appendChild(r1);
        var r2 = h("div", "qn-rec-line"); r2.appendChild(h("span", "", "Delay"));
        var val = h("em", "", fmtMs(t.offset));
        r2.appendChild(slider(-500, 500, 1, t.offset, function (v) {
          t.offset = v; val.textContent = fmtMs(v);
          try { localStorage.setItem(OFFSET_KEY, String(v)); } catch (x) {}
          followAll(true);
        }));
        r2.lastChild.addEventListener("change", recSave);
        r2.appendChild(val);
        card.appendChild(r2);
      }
      recRoot.appendChild(card);
    });
    // 合計と書き出し
    var tot = h("div", "qn-rec-foot");
    tot.appendChild(h("span", "", "Total " + fmtT(recTotal()) + " / " + fmtT(REC_LIMIT_SEC)));
    var e1 = h("button", "qn-stem-btn", "Export recordings"); e1.type = "button"; e1.disabled = !hasClips() || rec.cur >= 0;
    e1.addEventListener("click", function () { exportMix(false); });
    var e2 = h("button", "qn-stem-btn", "Export with song"); e2.type = "button"; e2.disabled = !hasClips() || rec.cur >= 0;
    e2.addEventListener("click", function () { exportMix(true); });
    tot.appendChild(e1); tot.appendChild(e2);
    recRoot.appendChild(tot);
    recRoot.appendChild(h("p", "qn-stem-note", "Exports are WAV files at 1x speed. Recordings made while the speed was changed are not time-stretched."));
  }

  window.QNStem = {
    mount: function (host) {
      if (!root) root = h("div", "qn-stem");
      host.appendChild(root);
      wire();
      if (gpuOk === null) {
        gpuOk = false;
        try { if (navigator.gpu) navigator.gpu.requestAdapter().then(function (a) { gpuOk = !!a; render(); }, function () {}); } catch (e) {}
      }
      onTrackChange();
      render();
    },
    mountRec: function (host) {
      if (!recRoot) recRoot = h("div", "qn-stem qn-rec-panel");
      host.appendChild(recRoot);
      wire();
      onTrackChange();
      render();
    },
    // 【v4.57.0】Tabが使う: 分離済みのパート(WAVのBlob)を返す。無ければnull。key=keyOf(ファイル)。表示中の分離結果→6パート版の保存→4パート版の保存の順に探す
    getPart: function (id, key) {
      var pick = function (b) { return b && b[id] ? b[id] : null; };
      if (st.key === key && pick(st.blobs)) return Promise.resolve(pick(st.blobs));
      return cacheGet(key + "|6").then(function (r) { return pick(r && r.stems) || cacheGet(key).then(function (r2) { return pick(r2 && r2.stems); }); }).catch(function () { return null; });
    },
    state: st
  };
  // 録音の再生はパネルを開かなくても曲に追従させる(Recパネルを開く前から、保存済みの録音が鳴る)
  setTimeout(function () { wire(); onTrackChange(); }, 0);
})();
