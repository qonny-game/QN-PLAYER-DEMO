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
  var worker = null, root = null, syncTimer = 0, tickTimer = 0, wired = false;

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
    rec.tracks.forEach(function (t) { if (t.el) setGain(t.el, t.mute ? 0 : gainOf(t.vol)); });
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
      if (!t.el) return;
      // 録音は実時間(録音時のrate)で収録されているので、曲位置→録音内位置へ換算。offset(ms)は遅れて録れた分だけ前へ詰める
      var r = t.rate || 1;
      syncEl(t.el, (m.currentTime - t.startPos) / r + t.offset / 1000, m.playbackRate / r, hard, m);
    });
  }
  var masterEvents = ["play", "pause", "seeked", "ratechange", "waiting", "playing"];
  function onMaster(ev) { if (ev.type === "play") busResume(); followAll(ev.type === "seeked" || ev.type === "play"); }
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
  }
  function disable() {
    var m = A();
    if (m) m.muted = false;
    if (st.els) parts().forEach(function (p) { unwireEl(st.els[p.id]); });
    if (st.els) parts().forEach(function (p) { try { st.els[p.id].pause(); st.els[p.id].removeAttribute("src"); st.els[p.id].load(); } catch (x) {} });
    if (st.urls) parts().forEach(function (p) { URL.revokeObjectURL(st.urls[p.id]); });
    st.els = st.urls = null; st.active = false;
  }

  // ---------- 録音トラック(4本) ----------
  var REC_N = 4, OFFSET_KEY = "qn_rec_offset_ms";
  var rec = { tracks: [], cur: -1, mr: null, stream: null, t0: 0, tick: 0 };
  function lastOffset() { try { return parseInt(localStorage.getItem(OFFSET_KEY), 10) || 0; } catch (e) { return 0; } }
  function newRecTracks() {
    rec.tracks = [];
    for (var i = 0; i < REC_N; i++) rec.tracks.push({ id: i, blob: null, url: "", el: null, startPos: 0, rate: 1, offset: lastOffset(), vol: VOL_UNITY, mute: false });
  }
  newRecTracks();
  function recMakeEl(t) {
    if (t.el) { try { t.el.pause(); } catch (x) {} unwireEl(t.el); }
    if (t.url) URL.revokeObjectURL(t.url);
    t.el = null; t.url = "";
    if (!t.blob) return;
    t.url = URL.createObjectURL(t.blob);
    t.el = new Audio(); t.el.preload = "auto"; t.el.src = t.url;
    try { t.el.preservesPitch = true; } catch (x) {}
    wireEl(t.el);
  }
  function recClear() {
    if (rec.cur >= 0) recAbort();
    rec.tracks.forEach(function (t) { if (t.el) { try { t.el.pause(); } catch (x) {} unwireEl(t.el); } if (t.url) URL.revokeObjectURL(t.url); });
    newRecTracks();
  }
  function recSave() {
    if (!st.key) return Promise.resolve();
    var has = rec.tracks.some(function (t) { return t.blob; });
    var k = "rec|" + st.key;
    if (!has) return cacheDel(k);
    return idb("readwrite", function (s) {
      return s.put({ key: k, ts: Date.now(), recs: rec.tracks.map(function (t) { return { id: t.id, blob: t.blob, startPos: t.startPos, rate: t.rate, offset: t.offset, vol: t.vol, v2: true, mute: t.mute }; }) });
    }).catch(function () {});
  }
  function recLoad(key) {
    return cacheGet("rec|" + key).then(function (r) {
      if (!r || st.key !== key) return;
      r.recs.forEach(function (x) {
        var t = rec.tracks[x.id]; if (!t) return;
        t.blob = x.blob; t.startPos = x.startPos; t.rate = x.rate; t.offset = x.offset; t.vol = x.v2 ? x.vol : VOL_UNITY; t.mute = x.mute; // v2無し=旧単位の音量なので原音レベルに戻す
        recMakeEl(t);
      });
      applyVol(); followAll(true); render();
    });
  }
  function wavMono(f32, sr) {
    var n = f32.length, out = new ArrayBuffer(44 + n * 2), v = new DataView(out);
    var w = function (o, str) { for (var i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
    w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt ");
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    w(36, "data"); v.setUint32(40, n * 2, true);
    for (var i = 0; i < n; i++) { var a = Math.max(-1, Math.min(1, f32[i])); v.setInt16(44 + i * 2, a < 0 ? a * 32768 : a * 32767, true); }
    return new Blob([out], { type: "audio/wav" });
  }
  function recCleanup() {
    clearInterval(rec.tick);
    if (rec.stream) { rec.stream.getTracks().forEach(function (x) { x.stop(); }); }
    rec.stream = null; rec.mr = null; rec.cur = -1;
  }
  function recAbort() {
    var mr = rec.mr;
    if (mr) { mr.onstop = null; try { mr.stop(); } catch (x) {} }
    recCleanup(); render();
  }
  function recStart(i) {
    var m = A(), t = rec.tracks[i];
    if (!m || rec.cur >= 0 || !t) return;
    if (!navigator.mediaDevices || !window.MediaRecorder) { st.recMsg = "Recording is not supported in this browser"; render(); return; }
    st.recMsg = "";
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).then(function (stream) {
      var chunks = [], mr = new MediaRecorder(stream);
      rec.stream = stream; rec.mr = mr; rec.cur = i; rec.t0 = Date.now();
      mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      mr.onstart = function () {
        t.startPos = m.currentTime; t.rate = m.playbackRate || 1;
        if (m.paused) m.play().catch(function () {});
      };
      mr.onstop = function () {
        var type = mr.mimeType;
        recCleanup(); st.recMsg = "Processing recording…"; render();
        new Blob(chunks, { type: type }).arrayBuffer().then(function (ab) {
          return new OfflineAudioContext(1, 44100, 44100).decodeAudioData(ab);
        }).then(function (buf) {
          t.blob = wavMono(buf.getChannelData(0), buf.sampleRate);
          t.offset = lastOffset();
          recMakeEl(t); applyVol(); followAll(true); st.recMsg = ""; recSave(); render();
        }).catch(function () { st.recMsg = "Could not process the recording"; render(); });
      };
      mr.start();
      rec.tick = setInterval(function () {
        var e = root && root.querySelector(".qn-rec-time"); if (e) e.textContent = fmtT((Date.now() - rec.t0) / 1000);
      }, 500);
      render();
    }).catch(function (err) {
      st.recMsg = (err && err.name === "NotAllowedError") ? "Microphone access was denied" : "Could not access the microphone";
      render();
    });
  }
  function recStop() { if (rec.mr && rec.mr.state !== "inactive") rec.mr.stop(); }
  function recDelete(i) {
    var t = rec.tracks[i];
    if (t.el) { try { t.el.pause(); } catch (x) {} unwireEl(t.el); }
    if (t.url) URL.revokeObjectURL(t.url);
    t.blob = null; t.el = null; t.url = "";
    recSave(); render();
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
    syncTimer = setInterval(function () { followAll(false); }, 150);
    m.addEventListener("ended", function () { if (rec.cur >= 0) recStop(); });
  }

  // ---------- UI ----------
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function fmtT(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }

  function render() {
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
    renderRec();
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
  function renderRec() {
    root.appendChild(h("div", "qn-stem-sec", "Record"));
    root.appendChild(h("p", "qn-stem-note", "Records from the microphone while the track plays. Use headphones. If a take sounds late or early, adjust its Delay."));
    if (st.recMsg) root.appendChild(h("p", "qn-stem-err", st.recMsg));
    rec.tracks.forEach(function (t, i) {
      var recording = rec.cur === i, busy = rec.cur >= 0 && !recording;
      var card = h("div", "qn-rec" + (recording ? " is-rec" : ""));
      var top = h("div", "qn-rec-top");
      top.appendChild(h("span", "qn-stem-name", "Rec " + (i + 1)));
      if (recording) top.appendChild(h("span", "qn-rec-time", "0:00"));
      var rb = h("button", "qn-stem-btn qn-rec-btn" + (recording ? " is-stop" : " is-primary"), recording ? "Stop" : (t.blob ? "Re-record" : "Record"));
      rb.type = "button"; rb.disabled = busy;
      rb.addEventListener("click", function () { if (recording) recStop(); else recStart(i); });
      top.appendChild(rb);
      if (t.blob && !recording) {
        var mb = h("button", "qn-stem-ms" + (t.mute ? " is-on" : ""), "M"); mb.type = "button"; mb.title = "Mute";
        mb.addEventListener("click", function () { t.mute = !t.mute; applyVol(); mb.classList.toggle("is-on", t.mute); recSave(); });
        var db2 = h("button", "qn-stem-ms", "×"); db2.type = "button"; db2.title = "Delete";
        db2.addEventListener("click", function () { recDelete(i); });
        top.appendChild(mb); top.appendChild(db2);
      }
      card.appendChild(top);
      if (t.blob && !recording) {
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
      root.appendChild(card);
    });
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
    state: st
  };
})();
