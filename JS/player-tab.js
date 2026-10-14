// player-tab.js — Tabパネル(v4.54.0)。再生中のローカル曲の音をブラウザ内で採譜(Basic Pitch)し、ギターTABとして再生位置に合わせて流す。
// 【v4.57.0】ソース切替: Mix(曲全体) / Bass(4弦TAB) / Guitar(6弦TAB) / Vocals(五線紙)。Bass/Guitar/VocalsはStemパネルで分けたパート(QNStem.getPart)を採譜する。保存キーは 曲|パート。
// 流れ: ファイルを22050Hzモノラルにデコード(メインスレッド) → Worker(player-tab-worker.js)でBasic Pitch → qn-tab-core.jsで整理・弦フレット割り当て → IndexedDB(qn_tab_db)に保存。
// 中身はswitchPanel("tab"系 panelType:"guitartab")がQNTab.mount(host)で呼ぶ。グローバル設定(感度など)はSettings>一般の「Tab」(QNTab.settingsRows())。
// 注意: 解析結果は曲の長さと別に持つので、Speed(再生速度)を変えても audio.currentTime(=原曲の秒)にそのまま合う。YouTube(ファイルが無い曲)は非対応。
(function () {
  "use strict";
  var DB_NAME = "qn_tab_db", STORE = "tabs", REC_LIMIT = 60, MAX_SEC = 900, SR = 22050;
  var K_SENS = "qn_tab_sens", K_MINLEN = "qn_tab_minlen", K_OVER = "qn_tab_overtone", K_ZOOM = "qn_tab_zoom", K_FOLLOW = "qn_tab_follow", K_SRC = "qn_tab_src";
  var SENS = { low: { onset: 0.4, frame: 0.35 }, normal: { onset: 0.25, frame: 0.25 }, high: { onset: 0.15, frame: 0.2 } };
  var SENS_LABEL = { low: "Low", normal: "Normal", high: "High" };
  var MINLEN = { 30: 3, 60: 5, 90: 8, 120: 10 }; // ms → フレーム数(86.13fps)
  var ZOOMS = [30, 45, 60, 90, 135, 200];         // 1秒あたりのpx
  var TUNING = QNTabCore.STD_TUNING, CAPO = 0;
  var LG = 22, Y0 = 34, VIEW_H = Y0 + LG * 5 + 26; // 弦の間隔 / 1弦のy / キャンバス高さ
  // ソースごとの設定。kind: tab=弦とフレット / staff=五線紙。Stemのパート名はpart
  var SOURCES = ["mix", "bass", "guitar", "vocals"];
  var SRC_LABEL = { mix: "Mix", bass: "Bass", guitar: "Guitar", vocals: "Vocals" };
  var INST = {
    mix: { kind: "tab", tuning: QNTabCore.STD_TUNING, maxFret: 21 },
    guitar: { kind: "tab", part: "guitar", tuning: QNTabCore.STD_TUNING, maxFret: 21 },
    bass: { kind: "tab", part: "bass", tuning: [28, 33, 38, 43], maxFret: 24, overtoneRatio: 0.9 }, // 低音は倍音が強く出るので、倍音とみなす強さの上限を上げる(再検出のつなぎはゆるめない: 同じ音の8分連打までつながってしまう)
    vocals: { kind: "staff", part: "vocals", lo: 40, hi: 88 }
  };
  var HS = 6, SD_LO = 22, SD_HI = 46, STAFF_TOP = 26; // 五線紙: 半音階でなく全音階の1段(=線と間の半分)のpx / 表示する段の範囲(D3〜G6) / 最上段のy。第1線(E4)がd=30
  var PLAY_X = 0.3;                               // 再生位置の横位置(幅に対する割合)
  var STALL_MS = 30000; // GPU(WebGL)の進捗がこの間動かなければCPUに切り替える
  var NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) {} }

  var st = {
    key: "", tkey: "", recs: {}, name: "", phase: "idle", // key=保存キー(曲|パート) / tkey=曲 / recs=この曲の全ソースの結果 / phase: idle | decoding | working | ready | error
    prog: 0, backend: "", msg: "", rec: null,
    sel: 0, edit: false, ver: 0,
    src: (function () { var v = lsGet(K_SRC, "mix"); return INST[v] ? v : "mix"; })(),
    follow: lsGet(K_FOLLOW, "1") !== "0",
    zi: Math.max(0, Math.min(ZOOMS.length - 1, parseInt(lsGet(K_ZOOM, "3"), 10) || 3))
  };
  var view = { t: 0, free: false, until: 0 };
  var job = null, root = null, els = null, wired = false, raf = 0, saveTimer = 0, maxD = 1;
  var lastSig = "", dragging = false;
  var cv = null, cx = null, cw = 0, ch = VIEW_H, dpr = 1, colors = null, ro = null;
  var R = null;                 // いま描いている譜面(パネルの小さな表示もPC幅の大きな表示も、描画は同じ関数。レーンごとにcx/cw/ch/Rを差し替える)
  var LANE_ORDER = ["vocals", "guitar", "bass", "mix"]; // 大きな表示の並び(上から)
  var score = null;             // PC幅で波形エリアに出す譜面表示 {el, lanes:[{src,wrap,cv,cx,cw,ch,rec}], key, ro}

  function A() { return document.getElementById("audio") || (typeof audio !== "undefined" ? audio : null); }
  function curTrack() {
    try { return (typeof playlist !== "undefined" && typeof currentPlaylistIndex !== "undefined" && currentPlaylistIndex >= 0) ? playlist[currentPlaylistIndex] : null; } catch (e) { return null; }
  }
  function keyOf(f) { return f ? [f.name || "", f.size || 0].join("|") : ""; }
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function fmtT(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }
  function fmtD(s) { var d = Math.floor(Math.max(0, s) * 10); return Math.floor(d / 600) + ":" + ("0" + Math.floor(d / 10) % 60).slice(-2) + "." + (d % 10); }
  function viewH(rec) { return rec && rec.kind === "staff" ? STAFF_TOP + (SD_HI - SD_LO) * HS + 18 : Y0 + LG * ((rec && rec.tuning ? rec.tuning.length : 6) - 1) + 26; }
  function noteName(m) { return NAMES[m % 12] + (Math.floor(m / 12) - 1); }

  // ---------- IndexedDB(解析結果。音声は入れない) ----------
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
  function recGet(key) { return idb("readonly", function (s) { return s.get(key); }).catch(function () { return null; }); }
  function recPut(rec) {
    rec.ts = Date.now();
    return idb("readwrite", function (s) { return s.put(rec); }).then(trim).catch(function () {});
  }
  function recDel(key) { return idb("readwrite", function (s) { return s.delete(key); }).catch(function () {}); }
  function trim() { // 古い順に捨てる(REC_LIMIT件まで)
    return idb("readonly", function (s) { return s.getAll(); }).then(function (all) {
      if (!all || all.length <= REC_LIMIT) return;
      all.sort(function (a, b) { return a.ts - b.ts; });
      var del = all.slice(0, all.length - REC_LIMIT);
      return idb("readwrite", function (s) { del.forEach(function (r) { s.delete(r.key); }); });
    }).catch(function () {});
  }
  function saveSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { if (st.rec) recPut(st.rec); }, 600);
  }

  // ---------- 解析 ----------
  function params() {
    var s = SENS[lsGet(K_SENS, "normal")] || SENS.normal, ml = parseInt(lsGet(K_MINLEN, "60"), 10);
    return { onset: s.onset, frame: s.frame, minFrames: MINLEN[ml] || 5, minLenSec: (MINLEN[ml] ? ml : 60) / 1000, overtones: lsGet(K_OVER, "1") !== "0" };
  }
  function toMono(ab) {
    var n = ab.length, ch0 = ab.getChannelData(0);
    if (ab.numberOfChannels === 1) return new Float32Array(ch0); // コピー(転送で元を空にしないため)
    var out = new Float32Array(n);
    for (var c = 0; c < ab.numberOfChannels; c++) { var d = ab.getChannelData(c); for (var i = 0; i < n; i++) out[i] += d[i]; }
    for (var j = 0; j < n; j++) out[j] /= ab.numberOfChannels;
    return out;
  }
  function hasWebGL() {
    try { var c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; }
  }
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = function () { rej(new Error("Could not load the analysis engine")); };
      document.head.appendChild(s);
    });
  }
  // Workerが使えない時の予備(メインスレッドで同じ処理。重い曲では画面が固まる)
  function runMain(j, samples, p) {
    var frames = [], onsets = [], my = j.run = (j.run || 0) + 1; // 世代番号: 切り替えた後の古い実行の結果・エラーは無視する
    loadScript("JS/basic-pitch/qn-basic-pitch.js").then(function () {
      var L = window.QNBasicPitchLib;
      return L.tf.ready().then(function () {
        j.backend = L.tf.getBackend(); sync(j);
        var bp = new L.BasicPitch("JS/basic-pitch/model/model.json");
        return bp.evaluateModel(samples, function (f, o) {
          for (var i = 0; i < f.length; i++) { frames.push(f[i]); onsets.push(o[i]); }
        }, function (pr) {
          if (my !== j.run) throw new Error("aborted"); // evaluateModelは進捗コールバックの例外で止められる
          if (pr !== j.prog) j.lastAt = Date.now();
          j.prog = pr; sync(j);
        });
      }).then(function () {
        if (my !== j.run) return;
        var nn = L.noteFramesToTime(L.outputToNotesPoly(frames, onsets, p.onset, p.frame, p.minFrames));
        finish(j, nn.map(function (n) { return [n.startTimeSeconds, n.durationSeconds, n.pitchMidi, n.amplitude]; }));
      });
    }).catch(function (e) {
      if (my !== j.run) return;
      // GPU(WebGL)での実行が失敗した時はCPUでやり直す
      if (j.backend === "webgl" && !j.cpuTried) { toCpu(j, "The GPU failed. Using the CPU, which is slower."); return; }
      fail(j, e);
    });
  }
  function sync(j) { // ジョブの状態を画面へ(表示中の曲のジョブだけ)
    if (st.key !== j.key) return;
    st.phase = j.phase; st.prog = j.prog; st.backend = j.backend || st.backend; st.note = j.note || "";
    renderStatus();
  }
  function fail(j, e) {
    if (j.timer) { clearInterval(j.timer); j.timer = 0; }
    if (j.cancel) return;
    job = null;
    if (st.key === j.key) { st.phase = st.rec ? "ready" : "error"; st.msg = (e && e.message) || "Analysis failed"; render(); }
  }
  function finish(j, raw) {
    if (j.timer) { clearInterval(j.timer); j.timer = 0; }
    if (j.cancel) return;
    job = null;
    var p = j.params;
    var I = j.inst, staff = I.kind === "staff";
    var cl = QNTabCore.cleanup(raw.map(function (n) { return { t: n[0], d: n[1], midi: n[2], vel: Math.min(1, n[3]) }; }),
      staff ? { lo: I.lo, hi: I.hi, minVel: 0.1, minLen: p.minLenSec, overtones: p.overtones }
        : { tuning: I.tuning, capo: CAPO, maxFret: I.maxFret, minVel: 0.1, minLen: p.minLenSec, overtones: p.overtones, overtoneRatio: I.overtoneRatio, mergeGap: I.mergeGap });
    var base = staff ? QNTabCore.monophonic(cl.notes) : cl.notes;
    var fresh = base.map(function (n) { return { id: 0, t: n.t, d: n.d, midi: n.midi, vel: n.vel, string: 0, fret: 0, edited: false, hidden: false }; });
    recGet(j.key).then(function (old) {
      var notes = old && old.notes && !staff ? QNTabCore.mergeEdited(fresh, old.notes) : fresh;
      notes.forEach(function (n, i) { n.id = i + 1; });
      if (!staff) QNTabCore.fingering(notes, { tuning: I.tuning, capo: CAPO, maxFret: I.maxFret });
      var rec = { key: j.key, name: j.name, v: 2, src: j.src, kind: I.kind, dur: j.dur, params: { onset: p.onset, frame: p.frame, minFrames: p.minFrames, overtones: p.overtones },
        tuning: staff ? null : I.tuning, maxFret: I.maxFret, shift: staff ? QNTabCore.staffShift(notes) : 0, capo: CAPO, notes: notes, dropped: cl.dropped, backend: j.backend || "" };
      recPut(rec);
      if (st.tkey === j.tkey) { st.recs[j.src] = rec; st.ver++; }
      if (st.key === j.key) { setRec(rec); st.phase = "ready"; st.msg = ""; render(); }
      syncScore();
    });
  }
  // CPU計算(またはWebGLが無い環境)用。Workerで実行して画面を止めない。cpu=trueならバックエンドをCPUに固定
  function runWorker(j, samples, cpu) {
    var w = null, got = false, my = j.run = (j.run || 0) + 1;
    try { w = new Worker("JS/player-tab-worker.js"); } catch (e) { w = null; }
    if (!w) { runMain(j, samples, j.params); return; }
    j.worker = w; j.backend = cpu ? "cpu" : j.backend;
    w.onmessage = function (ev) {
      var m = ev.data; got = true;
      if (my !== j.run) return;
      if (m.type === "backend") { j.backend = m.name; sync(j); }
      else if (m.type === "progress") { if (m.p !== j.prog) j.lastAt = Date.now(); j.prog = m.p; sync(j); }
      else if (m.type === "done") { w.terminate(); j.worker = null; finish(j, m.notes); }
      else if (m.type === "error") { w.terminate(); j.worker = null; fail(j, new Error(m.message)); }
    };
    // 転送するとsamplesが空になるので、Workerが起動できなかった時(メインスレッドで解析し直す)用に控えを複製しておく
    var spare = samples.slice(0);
    w.onerror = function (ev) {
      w.terminate(); j.worker = null;
      if (!got && !j.cancel) runMain(j, spare, j.params); else fail(j, new Error((ev && ev.message) || "Analysis failed"));
    };
    w.postMessage({ type: "run", samples: samples, params: j.params, cpu: !!cpu }, [samples.buffer]);
  }
  function toCpu(j, note) {
    if (j.cpuTried || j.cancel || !j.samples) return;
    j.cpuTried = true; j.prog = 0; j.lastAt = Date.now(); j.note = note; j.backend = "cpu";
    if (j.timer) { clearInterval(j.timer); j.timer = 0; }
    sync(j);
    runWorker(j, j.samples.slice(0), true); // 世代番号が進むので、止まったWebGLの実行は次の進捗コールバックで中断される
  }
  function analyze() {
    var tr = curTrack();
    if (job || !tr || !tr.file || !st.key) return;
    var src = st.src, I = INST[src];
    var j = { key: st.key, tkey: st.tkey, name: st.name, src: src, inst: I, phase: "decoding", prog: 0, backend: "", cancel: false, worker: null, params: params(), dur: 0 };
    job = j; st.msg = ""; sync(j); render();
    // Mixは曲のファイルそのもの。Bass/Guitar/VocalsはStemで分けたパート(未分離ならメッセージを出して止める)
    var getAb = !I.part ? tr.file.arrayBuffer() : (window.QNStem && QNStem.getPart ? QNStem.getPart(I.part, keyOf(tr.file)) : Promise.resolve(null)).then(function (b) {
      if (!b) throw new Error(src === "guitar" ? "Separate this track in the Stem panel first (Guitar needs the 6-part mode)." : "Separate this track in the Stem panel first.");
      return b.arrayBuffer();
    });
    getAb.then(function (ab) {
      return new OfflineAudioContext(1, 1, SR).decodeAudioData(ab);
    }).then(function (buf) {
      if (j.cancel) return;
      if (buf.duration > MAX_SEC) throw new Error("This track is too long for Tab (up to 15 minutes).");
      j.dur = buf.duration;
      var samples = toMono(buf);
      j.phase = "working"; sync(j);
      // WebGLが使える環境はメインスレッドで実行する(WebGLの計算自体はGPU側で非同期に進む)。WorkerのWebGLは進まず止まる環境があった(実機・ソフトウェアGLで確認)ので、Workerは使わない。
      // WebGLが無い環境(CPU計算)だけ、画面を止めないようWorkerで実行する
      j.samples = samples; j.lastAt = Date.now();
      if (hasWebGL()) {
        runMain(j, samples, j.params);
        // GPUが応答しない(進捗が30秒動かない)時はCPUに切り替える
        j.timer = setInterval(function () {
          if (job === j && !j.cpuTried && j.backend !== "cpu" && Date.now() - j.lastAt > STALL_MS) toCpu(j, "The GPU is not responding. Using the CPU, which is slower.");
        }, 2000);
        return;
      }
      runWorker(j, samples, false);
    }).catch(function (e) { fail(j, e); });
  }
  function cancel() {
    if (!job) return;
    job.cancel = true;
    if (job.timer) { clearInterval(job.timer); job.timer = 0; }
    if (job.worker) { job.worker.terminate(); job.worker = null; }
    job = null;
    st.phase = st.rec ? "ready" : "idle"; st.msg = "";
    render();
  }
  function clearRec() {
    if (!st.rec || job) return;
    if (!window.confirm("Delete the Tab for this track, including your edits?")) return;
    recDel(st.key);
    delete st.recs[st.src];
    st.rec = null; st.sel = 0; st.phase = "idle"; st.msg = "";
    render(); syncScore();
  }

  function setRec(rec) {
    st.rec = rec; st.sel = 0; st.ver++; lastSig = "";
    maxD = 1;
    rec.notes.forEach(function (n) { if (n.d > maxD) maxD = Math.min(n.d, 12); });
    if (els) resize();
  }
  function setSrc(v) {
    if (!INST[v] || v === st.src) return;
    st.src = v; lsSet(K_SRC, v);
    onTrackChange(); // 保存キーが 曲|パート に変わるので、そのソースの結果(あれば)を読み直す
    if (els) { resize(); els.ui.sync(); }
    lastSig = ""; render();
  }

  // ---------- 曲の切替追従 ----------
  function loadAll(tkey) { // この曲の全ソースの結果を読む(大きな譜面表示は全ソースのレーンを並べる)
    SOURCES.forEach(function (src) {
      var sfx = src === "mix" ? "" : "|" + src;
      recGet(tkey + sfx).then(function (rec) {
        if (!rec || st.tkey !== tkey || st.recs[src]) return;
        st.recs[src] = rec; st.ver++;
        if (src === st.src && !st.rec && st.key === tkey + sfx) { setRec(rec); if (st.phase === "idle") st.phase = "ready"; render(); }
        syncScore();
      });
    });
  }
  function onTrackChange() {
    var tr = curTrack(), tkey = tr && tr.file ? keyOf(tr.file) : "", key = tkey ? tkey + (st.src === "mix" ? "" : "|" + st.src) : "";
    if (key === st.key) return;
    st.key = key; st.name = tr ? (tr.name || (tr.file && tr.file.name) || "") : "";
    st.rec = null; st.sel = 0; st.msg = ""; st.phase = "idle"; view.free = false;
    if (tkey !== st.tkey) { st.tkey = tkey; st.recs = {}; if (tkey) loadAll(tkey); }
    if (job && job.key === key) { st.phase = job.phase; st.prog = job.prog; if (st.recs[st.src]) setRec(st.recs[st.src]); }
    else if (st.recs[st.src]) { setRec(st.recs[st.src]); st.phase = "ready"; }
    render(); syncScore();
  }
  function wire() {
    if (wired) return;
    var m = A();
    if (!m) return;
    wired = true;
    ["loadedmetadata", "emptied"].forEach(function (n) { m.addEventListener(n, function () { setTimeout(onTrackChange, 0); }); });
    ["play", "seeked"].forEach(function (n) { m.addEventListener(n, function () { view.free = false; }); });
  }

  // ---------- 修正 ----------
  function noteById(id) {
    var ns = st.rec ? st.rec.notes : [];
    for (var i = 0; i < ns.length; i++) if (ns[i].id === id) return ns[i];
    return null;
  }
  function refinger() {
    st.ver++;
    QNTabCore.fingering(st.rec.notes, { tuning: st.rec.tuning || TUNING, capo: st.rec.capo || 0, maxFret: st.rec.maxFret == null ? QNTabCore.MAX_FRET : st.rec.maxFret });
    saveSoon();
  }
  function renderEdit() {
    if (!els) return;
    els.edit.textContent = "";
    var n = st.edit && st.rec && st.rec.kind !== "staff" ? noteById(st.sel) : null;
    els.edit.hidden = !n;
    if (!n) return;
    var cands = QNTabCore.candidates(n.midi, st.rec.tuning || TUNING, st.rec.capo || 0, st.rec.maxFret == null ? QNTabCore.MAX_FRET : st.rec.maxFret);
    var keyOfC = function (c) { return c.s + ":" + c.f; };
    els.edit.appendChild(h("div", "qn-tab-selnote", noteName(n.midi) + "  ·  " + fmtD(n.t)));
    var ui = QNSettingsUI.build([{ title: "", rows: [
      { label: "Position", hint: "Other ways to play the same note.", type: "stepper",
        values: function () { return cands.map(keyOfC); },
        get: function () { return n.string + ":" + n.fret; },
        set: function (v) {
          var c = cands.filter(function (x) { return keyOfC(x) === v; })[0];
          if (!c) return;
          n.string = c.s; n.fret = c.f; n.edited = true; n.hidden = false; refinger(); renderEdit();
        },
        fmt: function (v) { var p = v.split(":"); return "String " + p[0] + " · Fret " + p[1]; } },
      { label: "Hide this note", hint: "For notes that were picked up by mistake.", type: "switch",
        get: function () { return !!n.hidden; },
        set: function (on) { n.hidden = !!on; refinger(); renderEdit(); } }
    ] }]);
    els.edit.appendChild(ui.el);
    var b = h("button", "qn-stem-btn", "Reset this note"); b.type = "button"; b.disabled = !n.edited && !n.hidden;
    b.addEventListener("click", function () { n.edited = false; n.hidden = false; refinger(); renderEdit(); });
    els.edit.appendChild(b);
  }

  // ---------- UI ----------
  function render() { renderStatus(); renderEdit(); }
  function renderStatus() {
    if (!els) return;
    var box = els.status, tr = curTrack();
    box.textContent = "";
    els.track.textContent = st.name || "—";
    var ph = st.phase;
    els.viewWrap.hidden = !(ph === "ready" && st.rec) && !(st.rec && (ph === "working" || ph === "decoding"));
    els.ctl.hidden = !(st.rec && ph === "ready");
    if (!tr || !tr.file) {
      box.appendChild(h("p", "qn-stem-note", tr ? "Tab works with audio files added to the Library. It can't analyze YouTube tracks." : "Play a track to use Tab."));
      return;
    }
    if (ph === "decoding" || ph === "working") {
      box.appendChild(h("div", "qn-stem-label", ph === "decoding" ? "Decoding audio…" : (st.prog > 0 ? "Analyzing…" : "Loading model…")));
      var bar = h("div", "qn-stem-bar"), fill = h("i"); fill.style.width = Math.round((ph === "decoding" ? 0.02 : st.prog) * 100) + "%"; bar.appendChild(fill); box.appendChild(bar);
      if (ph === "working" && st.prog > 0) box.appendChild(h("p", "qn-stem-note", Math.round(st.prog * 1000) / 10 + "%"));
      if (ph === "working" && st.note) box.appendChild(h("p", "qn-stem-note", st.note));
      else if (ph === "working" && st.backend) box.appendChild(h("p", "qn-stem-note", st.backend === "webgl" ? "Using the GPU." : "Using the CPU, which is slower."));
      var cb = h("button", "qn-stem-btn", "Cancel"); cb.type = "button"; cb.addEventListener("click", cancel); box.appendChild(cb);
      return;
    }
    if (st.msg) box.appendChild(h("p", "qn-stem-err", st.msg));
    if (ph === "ready" && st.rec) {
      var ns = st.rec.notes.filter(function (n) { return !n.hidden; }).length;
      box.appendChild(h("p", "qn-stem-note", ns + " notes"));
      var row = h("div", "qn-tab-btns");
      var rb = h("button", "qn-stem-btn", "Re-analyze"); rb.type = "button"; rb.disabled = !!job; rb.addEventListener("click", analyze); row.appendChild(rb);
      var xb = h("button", "qn-stem-btn", "Clear"); xb.type = "button"; xb.disabled = !!job; xb.addEventListener("click", clearRec); row.appendChild(xb);
      box.appendChild(row);
      return;
    }
    var si = INST[st.src];
    if (si.kind === "staff") {
      box.appendChild(h("p", "qn-stem-note", "Turn the vocal part into sheet music. It uses the Vocals part separated in the Stem panel, and the audio is not uploaded."));
      box.appendChild(h("p", "qn-stem-note", "Notes are placed by time and are not rounded to a rhythm. Bar lines show only after the chord analysis has run."));
    } else if (si.part) {
      box.appendChild(h("p", "qn-stem-note", st.src === "guitar" ? "Turn the guitar part into tab. It uses the Guitar part separated in the Stem panel (6-part mode), and the audio is not uploaded." : "Turn the bass part into 4-string tab. It uses the Bass part separated in the Stem panel, and the audio is not uploaded."));
      box.appendChild(h("p", "qn-stem-note", "Separate the track in the Stem panel first. You can fix notes in Edit mode."));
    } else {
      box.appendChild(h("p", "qn-stem-note", "Turn the notes in this track into guitar tab. Analysis runs in your browser and the audio is not uploaded."));
      box.appendChild(h("p", "qn-stem-note", "It works best on a single guitar or a simple mix. Chords and busy mixes will have mistakes, and you can fix notes in Edit mode."));
    }
    var ab = h("button", "qn-stem-btn is-primary", "Analyze"); ab.type = "button"; ab.disabled = !!job;
    ab.addEventListener("click", analyze);
    box.appendChild(ab);
    if (job && job.key !== st.key) box.appendChild(h("p", "qn-stem-note", "Another analysis is running."));
  }

  function build() {
    root = h("div", "qn-stem qn-tab");
    var t = h("div", "qn-stem-track"); t.appendChild(h("small", null, "Track")); var nm = h("span"); t.appendChild(nm); root.appendChild(t);
    var srcUi = QNSettingsUI.build([{ title: "", rows: [
      { label: "Source", hint: "Bass, Guitar and Vocals use the parts separated in the Stem panel.", type: "stepper",
        values: function () { return SOURCES; }, get: function () { return st.src; }, set: setSrc, fmt: function (v) { return SRC_LABEL[v]; } }
    ] }]);
    root.appendChild(srcUi.el);
    var status = h("div", "qn-tab-status"); root.appendChild(status);
    var vw = h("div", "qn-tab-view"); cv = h("canvas"); vw.appendChild(cv); root.appendChild(vw);
    var edit = h("div", "qn-tab-editbox"); root.appendChild(edit);
    var ctl = h("div", "qn-tab-ctl");
    var ui = QNSettingsUI.build([{ title: "", rows: [
      { label: "Follow", hint: "Keep the playing position in view.", type: "switch",
        get: function () { return st.follow; }, set: function (on) { st.follow = !!on; lsSet(K_FOLLOW, on ? "1" : "0"); if (on) view.free = false; } },
      { label: "Zoom", type: "stepper", values: function () { return ZOOMS.map(function (z, i) { return i; }); },
        get: function () { return st.zi; }, set: function (v) { st.zi = v; lsSet(K_ZOOM, v); },
        fmt: function (v) { return "x" + (ZOOMS[v] / 90).toFixed(1).replace(/\.0$/, ""); } },
      { label: "Edit", hint: "Tap a note to change where it is played, or hide it.", type: "switch", hiddenWhen: function () { return st.src === "vocals"; },
        get: function () { return st.edit; }, set: function (on) { st.edit = !!on; if (!on) st.sel = 0; renderEdit(); } }
    ] }]);
    ctl.appendChild(ui.el); root.appendChild(ctl);
    els = { track: nm, status: status, viewWrap: vw, edit: edit, ctl: ctl, ui: { sync: function () { ui.sync(); srcUi.sync(); } } };
    cx = cv.getContext("2d");
    cv.style.touchAction = "pan-y";
    attachPointer(cv, function () { return { cx: cx, cw: cw, ch: ch, rec: st.rec }; });
    if (window.ResizeObserver) { ro = new ResizeObserver(resize); ro.observe(vw); }
    document.addEventListener("qn-bg-change", function () { colors = null; lastSig = ""; });
    var rsT = 0; // 画面幅がPC⇔SPで変わった時に、大きな譜面表示の出し入れをやり直す
    window.addEventListener("resize", function () { clearTimeout(rsT); rsT = setTimeout(syncScore, 150); });
  }
  function resize() {
    if (!els) return;
    var w = els.viewWrap.clientWidth;
    if (!w) return;
    dpr = window.devicePixelRatio || 1; cw = w; ch = viewH(st.rec);
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
    cv.style.width = cw + "px"; cv.style.height = ch + "px";
  }
  function readColors() {
    var cs = getComputedStyle(root);
    function v(n, d) { var x = cs.getPropertyValue(n).trim(); return x || d; }
    var ov = v("--ov", "255,255,255");
    colors = { bg: v("--bg-0e0e13", "#0e0e13"), text: v("--text-bright", "#fff"), muted: v("--icon-muted", "#888"), accent: v("--accent-primary", "#3b82f6"),
      line: "rgba(" + ov + ",0.22)", faint: "rgba(" + ov + ",0.09)", ov: ov };
  }

  // ---------- 描画 ----------
  function lowerBound(ns, t) {
    var lo = 0, hi = ns.length;
    while (lo < hi) { var mid = (lo + hi) >> 1; if (ns[mid].t < t) lo = mid + 1; else hi = mid; }
    return lo;
  }
  function visible(fn) {
    var ns = R.notes, pps = ZOOMS[st.zi], px = cw * PLAY_X, vt = view.t, staff = R.kind === "staff";
    var t0 = vt - px / pps - 0.1, t1 = vt + (cw - px) / pps + 0.1;
    for (var i = lowerBound(ns, t0 - maxD); i < ns.length && ns[i].t <= t1; i++) {
      var n = ns[i];
      if (n.hidden && !st.edit) continue;
      if (staff) {
        if (n.t + n.d < t0) continue;
        fn(n, px + (n.t - vt) * pps, staffY(Math.max(SD_LO, Math.min(SD_HI, QNTabCore.staffPos(n.midi + (R.shift || 0)).d))));
        continue;
      }
      if (!n.string) continue;
      if (n.t + n.d < t0) continue;
      fn(n, px + (n.t - vt) * pps, Y0 + (n.string - 1) * LG);
    }
  }
  function staffY(d) { return STAFF_TOP + (SD_HI - d) * HS; }
  // ト音記号(線画)。g=第2線(G)のy。x=左端
  function drawClef(x, g, C) {
    var u = HS;
    cx.save(); cx.translate(x, g); cx.strokeStyle = C.text; cx.fillStyle = C.text; cx.lineWidth = 1.7; cx.lineCap = "round"; cx.lineJoin = "round";
    cx.beginPath();
    cx.moveTo(1.2 * u, -5.2 * u);                              // 上の山の頂点
    cx.bezierCurveTo(2.3 * u, -7.4 * u, 0.2 * u, -8.6 * u, -0.5 * u, -6.4 * u); // 山の左側(上端)
    cx.bezierCurveTo(-1.1 * u, -4.2 * u, 0.3 * u, -1.6 * u, 0.9 * u, 0.3 * u);  // 山から下へ(縦のS字の上半分)
    cx.lineTo(0.6 * u, 5.2 * u);                                // 縦線(下へ)
    cx.bezierCurveTo(0.45 * u, 7.6 * u, -1.9 * u, 7.4 * u, -1.9 * u, 5.8 * u);  // 下の巻き
    cx.stroke();
    cx.beginPath();                                             // 中央の渦(G線を巻く)
    cx.moveTo(0.9 * u, 0.3 * u);
    cx.bezierCurveTo(-2.7 * u, 1.9 * u, -2.2 * u, -1.9 * u, 0.5 * u, -1.5 * u);
    cx.bezierCurveTo(2.6 * u, -1.2 * u, 2.6 * u, 2.4 * u, 0.2 * u, 3.0 * u);
    cx.stroke();
    cx.beginPath(); cx.arc(-1.9 * u, 5.9 * u, 0.5 * u, 0, 6.2832); cx.fill();
    cx.restore();
  }
  function drawSharp(x, y, color) {
    cx.fillStyle = color;
    cx.fillRect(x - 2.6, y - 7.5, 1.3, 14); cx.fillRect(x + 1.6, y - 8.5, 1.3, 14);
    cx.beginPath(); cx.moveTo(x - 5, y - 2.2); cx.lineTo(x + 5, y - 4.6); cx.lineTo(x + 5, y - 2.4); cx.lineTo(x - 5, y + 0.1); cx.closePath(); cx.fill();
    cx.beginPath(); cx.moveTo(x - 5, y + 2.6); cx.lineTo(x + 5, y + 0.2); cx.lineTo(x + 5, y + 2.4); cx.lineTo(x - 5, y + 4.9); cx.closePath(); cx.fill();
  }
  // 五線紙の本体(線・小節線・音)。ノートは時間に比例して置く(リズムは丸めない)
  function drawStaffBody(cur, vt, pps, px, C) {
    var rec = R, shift = rec.shift || 0, w2 = cw, i;
    cx.fillStyle = C.line;
    for (i = 0; i < 5; i++) cx.fillRect(0, Math.round(staffY(30 + i * 2)), w2, 1);
    // 小節線(拍の解析があれば)
    try {
      var gd = window.QNChords && QNChords.grid ? QNChords.grid() : null;
      if (gd && gd.times && gd.bar) {
        var T = gd.times, B = gd.bar, t0 = vt - px / pps - 0.1, t1 = vt + (cw - px) / pps + 0.1, lo = 0, hi = T.length;
        while (lo < hi) { var mid = (lo + hi) >> 1; if (T[mid] < t0) lo = mid + 1; else hi = mid; }
        cx.fillStyle = C.line;
        for (i = lo; i < T.length && T[i] <= t1; i++) if (B[i] === 0) cx.fillRect(Math.round(px + (T[i] - vt) * pps), Math.round(staffY(38)), 1, Math.round(staffY(30) - staffY(38)) + 1);
      }
    } catch (e) {}
    // 再生位置
    cx.fillStyle = C.accent; cx.fillRect(Math.round(px) - 1, 14, 2, ch - 16);
    // 音(左の音部記号の領域には入れない)
    cx.save(); cx.beginPath(); cx.rect(40, 0, cw, ch); cx.clip();
    visible(function (n, x, y) {
      var on = cur >= n.t && cur < n.t + Math.max(n.d, 0.12), past = n.t + n.d < cur;
      var p = QNTabCore.staffPos(n.midi + shift), d = Math.max(SD_LO, Math.min(SD_HI, p.d));
      cx.globalAlpha = past && !on ? 0.45 : (n.vel < 0.3 ? 0.7 : 1);
      if (n.d * pps > 6) { cx.fillStyle = C.accent; cx.globalAlpha *= 0.55; cx.fillRect(x, y - 1, Math.min(n.d * pps, cw), 2); cx.globalAlpha = past && !on ? 0.45 : (n.vel < 0.3 ? 0.7 : 1); }
      cx.fillStyle = C.line;
      if (d < 30) for (var l = 28; l >= d - (d % 2 ? 1 : 0); l -= 2) { if (l < d) break; cx.fillRect(x - 10, Math.round(staffY(l)), 20, 1); }
      if (d > 38) for (var m = 40; m <= d; m += 2) cx.fillRect(x - 10, Math.round(staffY(m)), 20, 1);
      cx.fillStyle = on ? C.accent : C.text;
      cx.beginPath(); cx.ellipse(x, y, 6.2, 4.4, -0.35, 0, 6.2832); cx.fill();
      if (p.acc) drawSharp(x - 13, y, on ? C.accent : C.text);
      cx.globalAlpha = 1;
    });
    cx.restore();
    drawClef(8, staffY(32), C);
    if (shift) { cx.fillStyle = C.muted; cx.font = "10px system-ui, sans-serif"; cx.textAlign = "left"; cx.textBaseline = "alphabetic"; cx.fillText("8", 12, staffY(28) + 12); }
  }
  // 1レーン(パネルの小さな表示、または大きな表示の1段)を描く。cx/cw/ch/Rを差し替えて同じ描画関数を使う
  function paintLane(L, cur, vt, pps) {
    var scx = cx, scw = cw, sch = ch, sR = R;
    cx = L.cx; cw = L.cw; ch = L.ch; R = L.rec;
    try { paintBody(cur, vt, pps); } finally { cx = scx; cw = scw; ch = sch; R = sR; }
  }
  function paintBody(cur, vt, pps) {
    var px = cw * PLAY_X, C = colors;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.clearRect(0, 0, cw, ch);
    // 時間目盛り
    var step = pps >= 90 ? 1 : pps >= 45 ? 2 : 5;
    cx.font = "10px system-ui, sans-serif"; cx.textAlign = "left"; cx.textBaseline = "alphabetic";
    var ts = Math.max(0, Math.floor((vt - px / pps) / step) * step), te = vt + (cw - px) / pps;
    for (var s = ts; s <= te; s += step) {
      var x = px + (s - vt) * pps;
      cx.fillStyle = C.faint; cx.fillRect(Math.round(x), 16, 1, ch - 16 - 4);
      cx.fillStyle = C.muted; cx.fillText(fmtT(s), x + 3, 11);
    }
    // マーカー(Markersの印)
    try {
      if (typeof pins !== "undefined") pins.forEach(function (p) {
        if (p.enabled === false) return;
        var mx = px + (p.t - vt) * pps;
        if (mx < -2 || mx > cw + 2) return;
        cx.fillStyle = p.color || C.accent; cx.globalAlpha = 0.55; cx.fillRect(Math.round(mx), 16, 2, ch - 20); cx.globalAlpha = 1;
      });
    } catch (e) {}
    if (R.kind === "staff") { drawStaffBody(cur, vt, pps, px, C); return; }
    // 弦
    cx.fillStyle = C.line;
    var nStr = (R.tuning || TUNING).length;
    for (var i = 0; i < nStr; i++) cx.fillRect(0, Y0 + i * LG, cw, 1);
    // 再生位置(音より下に描く)
    cx.fillStyle = C.accent; cx.fillRect(Math.round(px) - 1, 14, 2, ch - 16);
    // 音
    cx.font = "600 13px system-ui, sans-serif"; cx.textAlign = "center"; cx.textBaseline = "middle";
    visible(function (n, x, y) {
      var on = cur >= n.t && cur < n.t + Math.max(n.d, 0.12), past = n.t + n.d < cur;
      if (n.d * pps > 6) { cx.fillStyle = C.accent; cx.globalAlpha = past ? 0.25 : 0.6; cx.fillRect(x, y - 1, Math.min(n.d * pps, cw), 2); cx.globalAlpha = 1; }
      var label = String(n.fret), w = Math.max(18, cx.measureText(label).width + 8);
      cx.globalAlpha = n.hidden ? 0.4 : (past && !on ? 0.5 : (n.vel < 0.3 ? 0.7 : 1));
      cx.fillStyle = on ? C.accent : C.bg;
      cx.fillRect(x - w / 2, y - 9, w, 18);
      if (n.hidden) { cx.strokeStyle = C.muted; cx.setLineDash([3, 2]); cx.strokeRect(x - w / 2 + 0.5, y - 8.5, w - 1, 17); cx.setLineDash([]); }
      cx.fillStyle = on ? "#fff" : C.text;
      cx.fillText(label, x, y + 0.5);
      cx.globalAlpha = 1;
      if (n.edited) { cx.fillStyle = C.accent; cx.beginPath(); cx.arc(x + w / 2 - 1, y - 8, 2.5, 0, 6.2832); cx.fill(); }
      if (st.edit && R === st.rec && n.id === st.sel) { cx.strokeStyle = C.accent; cx.lineWidth = 2; cx.strokeRect(x - w / 2 - 2, y - 11, w + 4, 22); cx.lineWidth = 1; }
    });
  }
  function draw() {
    var panelOk = st.rec && cw && !els.viewWrap.hidden, big = score && score.lanes.length && score.on;
    if (!panelOk && !big) return;
    if (!colors) readColors();
    var a = A(), cur = a ? a.currentTime : 0, pps = ZOOMS[st.zi];
    if (view.free && view.until && Date.now() > view.until) view.free = false;
    if (st.follow && !view.free) view.t = cur; // 追従OFFの間は位置を動かさない(ドラッグかタップで動く)
    var vt = view.t;
    // 【省電力】見た目に効く値が前回と同じなら描き直さない(停止中・操作なしは何もしない)
    var sig = [cur.toFixed(3), vt.toFixed(3), st.zi, st.edit ? 1 : 0, st.sel, cw, ch, dpr, st.ver, st.rec ? st.rec.notes.length : 0, pins.length, big ? score.sig : ""].join("|");
    if (sig === lastSig) return;
    lastSig = sig;
    if (panelOk) paintLane({ cx: cx, cw: cw, ch: ch, rec: st.rec }, cur, vt, pps);
    if (big) score.lanes.forEach(function (L) { if (L.cw) paintLane(L, cur, vt, pps); });
  }
  function loop() {
    raf = 0;
    if (!root || !root.isConnected) return;
    try { draw(); } catch (e) {}
    // 【省電力】ドラッグ中=rAF / 再生中=約30fps / 停止中=250ms / 非表示=1秒(以前は常に60fps)
    var a = A(), playing = a && !a.paused;
    if (document.hidden) raf = setTimeout(loop, 1000);
    else if (dragging) raf = requestAnimationFrame(loop);
    else raf = setTimeout(loop, playing ? 33 : 250);
  }

  // ---------- 操作(タップ=シーク/選択、ドラッグ=横スクロール) ----------
  function seekTo(t) {
    var a = A(); if (!a) return;
    if (typeof beginSeek === "function") beginSeek();
    a.currentTime = Math.max(0, Math.min(isFinite(a.duration) ? a.duration : t, t));
  }
  function withLane(L, fn) {
    var scx = cx, scw = cw, sch = ch, sR = R;
    cx = L.cx; cw = L.cw; ch = L.ch; R = L.rec;
    try { return fn(); } finally { cx = scx; cw = scw; ch = sch; R = sR; }
  }
  // cvEl=キャンバス、getLane=そのキャンバスの {cx,cw,ch,rec}。パネルの小さな表示も大きな表示の各レーンも同じ操作(タップ=シーク/選択、ドラッグ=横スクロール)
  function attachPointer(cvEl, getLane) {
    var down = null;
    cvEl.addEventListener("pointerdown", function (e) {
      var L = getLane();
      if (!L || !L.rec) return;
      down = { x: e.clientX, y: e.clientY, lx: e.clientX, moved: false, id: e.pointerId };
      dragging = true;
      try { cvEl.setPointerCapture(e.pointerId); } catch (er) {}
    });
    cvEl.addEventListener("pointermove", function (e) {
      if (!down || e.pointerId !== down.id) return;
      if (!down.moved && Math.abs(e.clientX - down.x) < 6) return;
      if (!down.moved) { down.moved = true; view.free = true; }
      var L = getLane(), pps = ZOOMS[st.zi], dur = (L && L.rec && L.rec.dur) || 0;
      view.t = Math.max(0, Math.min(dur || 1e9, view.t - (e.clientX - down.lx) / pps));
      down.lx = e.clientX;
      var a = A(); view.until = a && !a.paused ? Date.now() + 6000 : 0;
    });
    function end(e) {
      if (!down || e.pointerId !== down.id) return;
      var d = down; down = null; dragging = false;
      if (d.moved || e.type === "pointercancel") return;
      var L = getLane(); if (!L || !L.rec) return;
      var r = cvEl.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top, best = null, bd = 1e9, lcw = L.cw;
      withLane(L, function () {
        visible(function (n, x, y) {
          var dx = Math.abs(mx - x), dy = Math.abs(my - y);
          if (dx <= 16 && dy <= (R.kind === "staff" ? HS * 1.5 : LG / 2) && dx + dy < bd) { bd = dx + dy; best = n; }
        });
      });
      if (st.edit && L.rec === st.rec && L.rec.kind !== "staff") { st.sel = best ? best.id : 0; renderEdit(); return; }
      seekTo(best ? best.t : view.t + (mx - lcw * PLAY_X) / ZOOMS[st.zi]);
      view.free = false;
    }
    cvEl.addEventListener("pointerup", end);
    cvEl.addEventListener("pointercancel", end);
  }

  // ---------- 大きな譜面表示(PC幅。波形エリアに、解析済みのパートを1段ずつ並べる。Tabパネルを開いている間は波形を隠す) ----------
  function isPcWidth() { return !(window.matchMedia && window.matchMedia("(max-width: 900px)").matches); }
  function syncScore() {
    var wa = document.getElementById("pcV2WaveArea"), srcs = LANE_ORDER.filter(function (k) { return st.recs[k]; });
    var on = !!(wa && root && root.isConnected && isPcWidth() && srcs.length);
    if (wa) wa.classList.toggle("pcv2-score-mode", on);
    if (!on) { if (score) score.on = false; return; }
    if (!score) {
      score = { el: h("div", "qn-score"), lanes: [], key: "", on: false, sig: "", ro: null };
      score.el.id = "pcV2ScoreView";
      if (window.ResizeObserver) { score.ro = new ResizeObserver(resizeScore); score.ro.observe(score.el); }
    }
    if (score.el.parentNode !== wa) wa.appendChild(score.el);
    score.on = true;
    var key = srcs.join(",");
    if (key !== score.key) { // 並びが変わった時だけDOMを作り直す
      score.key = key; score.el.textContent = ""; score.lanes = [];
      srcs.forEach(function (src) {
        var wrap = h("div", "qn-score-lane"), lab = h("div", "qn-score-label", SRC_LABEL[src]), c = h("canvas");
        wrap.appendChild(lab); wrap.appendChild(c); score.el.appendChild(wrap);
        var L = { src: src, wrap: wrap, cv: c, cx: c.getContext("2d"), cw: 0, ch: 0, rec: null };
        c.style.touchAction = "pan-y";
        attachPointer(c, function () { return L; });
        score.lanes.push(L);
      });
    }
    score.lanes.forEach(function (L) { L.rec = st.recs[L.src]; });
    resizeScore();
    lastSig = "";
  }
  function resizeScore() {
    if (!score || !score.on) return;
    var sig = [];
    score.lanes.forEach(function (L) {
      var w = L.wrap.clientWidth;
      if (!w || !L.rec) return;
      var d = window.devicePixelRatio || 1, hgt = viewH(L.rec);
      if (L.cw !== w || L.ch !== hgt || dpr !== d) {
        dpr = d; L.cw = w; L.ch = hgt;
        L.cv.width = Math.round(w * d); L.cv.height = Math.round(hgt * d);
        L.cv.style.width = w + "px"; L.cv.style.height = hgt + "px";
      }
      sig.push(L.src + ":" + w + "x" + hgt + ":" + L.rec.notes.length);
    });
    score.sig = sig.join(",");
    lastSig = "";
  }

  // ---------- Settings>一般 の「Tab」行(グローバル設定。解析時に読む) ----------
  function settingsRows() {
    return [
      { label: "Tab sensitivity", hint: "Higher picks up more notes but also more mistakes. Applies the next time you analyze.", type: "stepper",
        values: function () { return ["low", "normal", "high"]; }, get: function () { var v = lsGet(K_SENS, "normal"); return SENS[v] ? v : "normal"; },
        set: function (v) { lsSet(K_SENS, v); }, fmt: function (v) { return SENS_LABEL[v]; } },
      { label: "Tab shortest note", hint: "Notes shorter than this are dropped.", type: "stepper",
        values: function () { return ["30", "60", "90", "120"]; }, get: function () { var v = lsGet(K_MINLEN, "60"); return MINLEN[v] ? v : "60"; },
        set: function (v) { lsSet(K_MINLEN, v); }, fmt: function (v) { return v + " ms"; } },
      { label: "Tab overtone filter", hint: "Remove weak notes an octave or more above a louder note.", type: "switch",
        get: function () { return lsGet(K_OVER, "1") !== "0"; }, set: function (on) { lsSet(K_OVER, on ? "1" : "0"); } }
    ];
  }

  window.QNTab = {
    mount: function (host) {
      if (!root) build();
      host.appendChild(root);
      wire();
      colors = null;
      onTrackChange();
      render();
      els.ui.sync();
      resize();
      syncScore();
      lastSig = ""; if (!raf) raf = setTimeout(loop, 0);
    },
    settingsRows: settingsRows,
    _setStallMs: function (v) { STALL_MS = v; }, // 動作確認用
    state: st
  };
})();
