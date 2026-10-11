// player-chords.js — コード(和音)解析の窓口 QNChords。曲ごとの解析の開始・進捗・結果の保持、手動修正、保存。
// 計算本体は qn-chord-core.js(classify/label)と qn-chord-worker.js(chroma)。修正UIは player-chord-edit.js。
// 流れ: decodeWaveform(player-ui-shared.js)がデコード済みの波形を offer() で渡す → コードモードの時だけWorkerでクロマ抽出(ensure) → classify()でコード区間(auto)にする。
// 手動修正は「user」という上書きの層(時間範囲＋コード)としてautoと別に持つ。表示用の区間(segments)=autoにuserを重ねたもの。
//   → 詳細度やキーを変えて解析をやり直しても修正は消えない。「元に戻す」=その範囲のuserを消してautoに戻すだけ。
// 保存: localStorage "qn_chords_<ファイル名>" に auto結果＋userを保存(次に開いた時は再解析しない。曲の長さが0.6秒以上ずれていたら別物として捨てる)。
//   クロマ(重い生データ)は保存しない。詳細度/キーを変えた時だけ、読み込み時の波形から再解析する。
// 規約: 重い解析はコードモードを選んだ時だけ走る(波形モードのままなら何も計算しない)。DOMには触らない。依存: qn-chord-core.js(QNChordCore)。

var QNChords = (function () {
  const DETAIL_KEY = "qn_chord_detail";
  const ALTS_KEY = "qn_chord_alts";
  const SAVE_PREFIX = "qn_chords_";
  const SAVE_MAX_CHARS = 400000;   // 1曲あたりの保存サイズの上限(超えたら保存しない)
  const CACHE_MAX = 3;
  const DETAILS = ["basic", "extended", "full"];
  const MIN_PIECE = 0.08;          // これより短い区間は作らない(秒)

  let detail = "extended";
  let showAlts = true;
  let keySel = "auto";        // "auto" か "M<0-11>"(長調) / "m<0-11>"(短調)
  try {
    const v = localStorage.getItem(DETAIL_KEY);
    if (DETAILS.indexOf(v) >= 0) detail = v;
    showAlts = localStorage.getItem(ALTS_KEY) !== "0";
  } catch (e) {}

  let gen = 0;               // 曲が変わるたびに増やす。古いWorkerの返事を捨てる印
  let curId = null;
  let curName = "";
  let curDur = 0;
  let pending = null;        // { id, mono, sr, dur } まだ解析していないmono波形
  let phase = "idle";        // idle | queued | analyzing | ready | error
  let progress = 0;
  let errMsg = "";
  let result = null;         // classify()の結果(auto) { segments, key, detail }
  let user = [];             // 手動修正 [{t0,t1,root,q,bass}]。root=-1は「コード無し」
  let composed = null;       // autoにuserを重ねた表示用の区間
  let ver = 0;
  let worker = null;
  const cache = new Map();   // id -> { ch, dur }
  const listeners = [];

  function notify(kind) {
    listeners.forEach(fn => { try { fn(kind); } catch (e) {} });
  }
  function wanted() {
    return typeof QNBars !== "undefined" && QNBars.getViewMode && QNBars.getViewMode() !== "wave";
  }

  function downmix(buf) {
    const n = buf.length, c = buf.numberOfChannels;
    const out = new Float32Array(n);
    for (let ch = 0; ch < c; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < n; i++) out[i] += d[i];
    }
    if (c > 1) for (let i = 0; i < n; i++) out[i] /= c;
    return out;
  }

  function keyOverride() {
    if (keySel === "auto") return null;
    return { tonic: parseInt(keySel.slice(1), 10), minor: keySel[0] === "m" };
  }

  function stopWorker() {
    if (worker) { worker.terminate(); worker = null; }
  }

  // ---------- 表示用区間(auto + user) ----------
  function piece(A, t0, t1) {
    return { t0: t0, t1: t1, name: A.name, root: A.root, q: A.q, bass: A.bass, conf: A.conf, alts: A.alts, u: false };
  }

  function compose() {
    if (!result) { composed = null; return; }
    const auto = result.segments;
    if (!user.length) { composed = auto; return; }
    const U = user.slice().sort((a, b) => a.t0 - b.t0);
    const out = [];
    for (let i = 0; i < auto.length; i++) {
      const A = auto[i];
      let a0 = A.t0;
      for (let k = 0; k < U.length; k++) {
        const u = U[k];
        if (u.t1 <= a0 || u.t0 >= A.t1) continue;
        if (u.t0 - a0 >= MIN_PIECE) out.push(piece(A, a0, u.t0));
        a0 = Math.max(a0, u.t1);
      }
      if (A.t1 - a0 >= MIN_PIECE) out.push(piece(A, a0, A.t1));
    }
    U.forEach(u => out.push({ t0: u.t0, t1: u.t1, name: u.root < 0 ? "N" : "", root: u.root, q: u.q, bass: u.bass, conf: 1, alts: [], u: true }));
    out.sort((a, b) => a.t0 - b.t0);
    composed = out;
  }

  // ---------- 保存 ----------
  function saveKey() { return SAVE_PREFIX + curName; }
  function r3(x) { return Math.round(x * 1000) / 1000; }

  function save() {
    if (!curId || !curName) return;
    try {
      if (!result && !user.length) { localStorage.removeItem(saveKey()); return; }
      const o = { v: 1, dur: Math.round(curDur * 100) / 100, user: user.map(u => [r3(u.t0), r3(u.t1), u.root, u.q, u.bass]) };
      if (result) {
        o.detail = result.detail;
        o.keySel = keySel;
        o.key = [result.key.tonic, result.key.minor ? 1 : 0];
        o.segs = result.segments.map(s => [r3(s.t0), r3(s.t1), s.root, s.q, s.bass, Math.round(s.conf * 100) / 100, (s.alts || []).map(a => [a.root, a.q, Math.round(a.score * 100) / 100])]);
      }
      const str = JSON.stringify(o);
      if (str.length > SAVE_MAX_CHARS) return;
      localStorage.setItem(saveKey(), str);
    } catch (e) {}
  }

  function loadSaved() {
    try {
      const raw = localStorage.getItem(saveKey());
      if (!raw) return null;
      const o = JSON.parse(raw);
      if (!o || o.v !== 1 || Math.abs((o.dur || 0) - curDur) > 0.6) return null;
      return o;
    } catch (e) { return null; }
  }

  function hydrate(o) {
    if (!o.segs || !o.key || !window.QNChordCore) return null;
    const key = QNChordCore.makeKey(o.key[0], !!o.key[1]);
    const segs = o.segs.map(a => {
      const s = { t0: a[0], t1: a[1], root: a[2], q: a[3], bass: a[4], conf: a[5], alts: (a[6] || []).map(x => ({ root: x[0], q: x[1], score: x[2] })), name: "N", u: false };
      if (s.root >= 0) s.name = QNChordCore.label(s, key, {});
      return s;
    });
    return { segments: segs, key: key, detail: o.detail };
  }

  // ---------- 解析 ----------
  function classifyNow() {
    const c = cache.get(curId);
    if (!c || !window.QNChordCore) return;
    result = QNChordCore.classify(c.ch, c.dur, { detail: detail, key: keyOverride() });
    compose();
    ver++;
    phase = "ready";
    progress = 1;
    save();
    notify("state");
  }

  function fail(msg) {
    stopWorker();
    phase = "error";
    errMsg = msg || "Chord analysis failed";
    ver++;
    notify("state");
  }

  function done(id, myGen, ch, dur) {
    if (myGen !== gen) return;
    cache.set(id, { ch: ch, dur: dur });
    while (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
    classifyNow();
  }

  // Worker不可の環境向け: メインスレッドで実行(固まるのでWorkerが作れない時だけ)
  function runInline(p, myGen) {
    setTimeout(function () {
      if (myGen !== gen) return;
      try {
        const ch = QNChordCore.chroma(p.mono, p.sr, function (x) { progress = x; notify("progress"); });
        done(p.id, myGen, ch, p.dur);
      } catch (e) { fail(e && e.message); }
    }, 30);
  }

  function run() {
    const p = pending;
    if (!p || !window.QNChordCore) return;
    pending = null;
    phase = "analyzing";
    progress = 0;
    notify("state");
    const myGen = gen;
    let w = null;
    try { w = new Worker("JS/qn-chord-worker.js"); } catch (e) { w = null; }
    if (!w) { runInline(p, myGen); return; }
    worker = w;
    w.onmessage = function (e) {
      if (myGen !== gen) return;
      const d = e.data;
      if (d.type === "progress") { progress = d.p; notify("progress"); }
      else if (d.type === "error") fail(d.message);
      else if (d.type === "done") {
        stopWorker();
        done(p.id, myGen, { chroma: d.chroma, bass: d.bass, rms: d.rms, hop: d.hop, win: d.win, frames: d.frames, tuning: d.tuning }, p.dur);
      }
    };
    w.onerror = function () { if (myGen === gen) fail("Worker failed"); };
    w.postMessage({ mono: p.mono, sr: p.sr }, [p.mono.buffer]);
  }

  // 詳細度/キーが変わった後: クロマがあればclassifyだけやり直し、無ければ(保存結果から開いた曲)波形から再解析
  function reanalyze() {
    if (cache.has(curId)) classifyNow();
    else if (pending) { phase = "queued"; ver++; notify("state"); if (wanted()) run(); }
    else notify("state");
  }

  // ---------- 公開: 読み込み・解析 ----------
  // 曲を読み込み始めた時: 前の曲の解析を捨てる
  function reset() {
    gen++;
    stopWorker();
    pending = null;
    curId = null;
    curName = "";
    keySel = "auto";
    result = null;
    user = [];
    composed = null;
    phase = "idle";
    progress = 0;
    ver++;
    notify("state");
  }

  // デコード済みの波形を受け取る(player-ui-shared.jsのdecodeWaveformから)。保存済みなら即表示、コードモードなら続けて解析を始める
  function offer(id, audioBuffer) {
    curId = id;
    curName = id.slice(0, id.lastIndexOf("|"));
    curDur = audioBuffer.duration;
    pending = { id: id, mono: downmix(audioBuffer), sr: audioBuffer.sampleRate, dur: audioBuffer.duration };
    const saved = loadSaved();
    user = saved && Array.isArray(saved.user) ? saved.user.map(a => ({ t0: a[0], t1: a[1], root: a[2], q: a[3], bass: a[4] })) : [];
    if (saved && saved.keySel) keySel = saved.keySel;
    if (cache.has(id)) { classifyNow(); return; }
    // 保存済みの解析が今の設定(詳細度・キー)と合っていれば、再解析せずそのまま使う
    if (saved && saved.detail === detail && saved.keySel === keySel) {
      const h = hydrate(saved);
      if (h) { result = h; compose(); phase = "ready"; progress = 1; ver++; notify("state"); return; }
    }
    phase = "queued";
    compose();
    ver++;
    notify("state");
    if (wanted()) run();
  }

  // コードモードに切り替えた時: 未解析なら解析を始める
  function ensure() {
    if (phase === "queued" && pending) run();
  }

  function setDetail(d) {
    if (DETAILS.indexOf(d) < 0 || d === detail) return;
    detail = d;
    try { localStorage.setItem(DETAIL_KEY, d); } catch (e) {}
    reanalyze();
  }

  function setKeySel(v) {
    if (v === keySel) return;
    keySel = v;
    reanalyze();
  }

  // ---------- 公開: 手動修正 ----------
  function segAt(t) {
    const s = composed;
    if (!s) return null;
    for (let i = 0; i < s.length; i++) if (t >= s[i].t0 && t < s[i].t1) return s[i];
    return s.length && t >= s[s.length - 1].t1 - 1e-6 ? s[s.length - 1] : null;
  }

  function changed() {
    compose();
    ver++;
    save();
    notify("state");
  }

  // 範囲[t0,t1]のuserを一度空にして(はみ出す部分は残す)から、chordがあればその範囲をchordで埋める。保存・再描画は呼び出し側のchanged()
  function fillUser(t0, t1, chord) {
    const keep = [];
    user.forEach(u => {
      if (u.t1 <= t0 || u.t0 >= t1) { keep.push(u); return; }
      if (u.t0 < t0 - 1e-6) keep.push({ t0: u.t0, t1: t0, root: u.root, q: u.q, bass: u.bass });
      if (u.t1 > t1 + 1e-6) keep.push({ t0: t1, t1: u.t1, root: u.root, q: u.q, bass: u.bass });
    });
    if (chord) keep.push({ t0: t0, t1: t1, root: chord.root, q: chord.q || "", bass: chord.bass === undefined ? -1 : chord.bass });
    user = keep;
  }

  function chordOf(s) { return { root: s.root, q: s.q, bass: s.bass }; }

  // 区間seg(表示用)のコードを変える。root=-1でコード無し
  function setChord(seg, chord) { fillUser(seg.t0, seg.t1, chord); changed(); }

  // 時刻tで区間を2つに分ける(両方とも元のコードのまま。片方を後から変える)。分けられたらtrue
  function splitAt(t) {
    const s = segAt(t);
    if (!s || t - s.t0 < MIN_PIECE || s.t1 - t < MIN_PIECE) return false;
    const c = chordOf(s);
    const t0 = s.t0, t1 = s.t1;
    fillUser(t0, t1, null);
    user.push({ t0: t0, t1: t, root: c.root, q: c.q, bass: c.bass });
    user.push({ t0: t, t1: t1, root: c.root, q: c.q, bass: c.bass });
    changed();
    return true;
  }

  // segと次の区間を1つにする(segのコードを残す)。できたらtrue
  function mergeNext(seg) {
    const s = composed;
    if (!s) return false;
    const i = s.indexOf(seg);
    if (i < 0 || i >= s.length - 1) return false;
    fillUser(seg.t0, s[i + 1].t1, chordOf(seg));
    changed();
    return true;
  }

  // 区間の境目(prev=[p0,t]とnext=[t,n1])をtへ動かす。pc/ncは両側のコード。ドラッグ中は保存せず(final=falseで描き直しだけ)、離した時(final=true)に保存
  function moveBoundary(p0, n1, t, pc, nc, final) {
    if (t - p0 < MIN_PIECE || n1 - t < MIN_PIECE) return false;
    fillUser(p0, n1, null);
    user.push({ t0: p0, t1: t, root: pc.root, q: pc.q || "", bass: pc.bass });
    user.push({ t0: t, t1: n1, root: nc.root, q: nc.q || "", bass: nc.bass });
    compose();
    ver++;
    if (final) save();
    notify("state");
    return true;
  }

  // segの範囲の修正を全部消してautoに戻す
  function resetSeg(seg) { fillUser(seg.t0, seg.t1, null); changed(); }
  function resetAll() { user = []; changed(); }

  return {
    DETAILS: DETAILS,
    offer: offer,
    reset: reset,
    ensure: ensure,
    getDetail() { return detail; },
    setDetail: setDetail,
    getAlts() { return showAlts; },
    setAlts(on) {
      showAlts = !!on;
      try { localStorage.setItem(ALTS_KEY, showAlts ? "1" : "0"); } catch (e) {}
      ver++; notify("state");
    },
    KEYS: ["auto"].concat(Array.from({ length: 12 }, (_, i) => "M" + i), Array.from({ length: 12 }, (_, i) => "m" + i)),
    getKeySel() { return keySel; },
    setKeySel: setKeySel,
    keyName(v) {
      if (v === "auto") return result ? "Auto (" + result.key.name + ")" : "Auto";
      return QNChordCore.makeKey(parseInt(v.slice(1), 10), v[0] === "m").name;
    },
    phase() { return phase; },
    progress() { return progress; },
    error() { return errMsg; },
    version() { return ver; },
    segments() { return composed; },
    key() { return result ? result.key : null; },
    segAt: segAt,
    setChord: setChord,
    splitAt: splitAt,
    mergeNext: mergeNext,
    resetSeg: resetSeg,
    moveBoundary: moveBoundary,
    chordOf: chordOf,
    resetAll: resetAll,
    hasUser() { return user.length > 0; },
    // 表示名。mode="letter"|"degree"、shift=プレイヤーのKey操作の半音数(letterだけ移調。degreeは変わらない)
    label(seg, mode, shift) { return result ? QNChordCore.label(seg, result.key, { mode: mode, shift: shift }) : (seg && seg.name) || "N"; },
    onChange(fn) { listeners.push(fn); }
  };
})();

// 状態が変わったら: 設定帯の表示(進捗%)を更新し、結果が変わった時はシークバーを描き直す
QNChords.onChange(function (kind) {
  if (typeof window.qnBarStripSync === "function") window.qnBarStripSync();
  if (kind === "state" && typeof QNBars !== "undefined") QNBars.draw(true);
});
