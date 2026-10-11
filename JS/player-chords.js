// player-chords.js — コード(和音)解析の窓口 QNChords。曲ごとの解析の開始・進捗・結果の保持。計算本体は qn-chord-core.js(classify)と qn-chord-worker.js(chroma)。
// 流れ: decodeWaveform(player-ui-shared.js)がデコード済みの波形を offer() で渡す → コードモードの時だけWorkerでクロマ抽出(ensure) → classify()でコード区間にする。
// 規約: 重い解析はコードモードを選んだ時だけ走る(波形モードのままなら何も計算しない)。クロマは曲ごとに最大CACHE_MAX曲ぶんメモリに保持。保存はしない(プロトタイプ)。
// 描画は player-bars.js が segments() を読む。依存: qn-chord-core.js(QNChordCore)。DOMには触らない。

var QNChords = (function () {
  const DETAIL_KEY = "qn_chord_detail";
  const CACHE_MAX = 3;
  const DETAILS = ["basic", "extended"];

  let detail = "extended";
  try { const v = localStorage.getItem(DETAIL_KEY); if (DETAILS.indexOf(v) >= 0) detail = v; } catch (e) {}

  let gen = 0;               // 曲が変わるたびに増やす。古いWorkerの返事を捨てる印
  let curId = null;
  let curDur = 0;
  let pending = null;        // { id, mono, sr, dur } まだ解析していないmono波形
  let phase = "idle";        // idle | queued | analyzing | ready | error
  let progress = 0;
  let errMsg = "";
  let result = null;         // classify()の結果 { segments, key, detail }
  let ver = 0;
  let worker = null;
  const cache = new Map();   // id -> { ch, dur }
  const listeners = [];

  function notify(kind) {
    listeners.forEach(fn => { try { fn(kind); } catch (e) {} });
  }
  function wanted() {
    return typeof QNBars !== "undefined" && QNBars.getViewMode && QNBars.getViewMode() === "chord";
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

  function stopWorker() {
    if (worker) { worker.terminate(); worker = null; }
  }

  function classifyNow() {
    const c = cache.get(curId);
    if (!c || !window.QNChordCore) return;
    result = QNChordCore.classify(c.ch, c.dur, { detail: detail });
    ver++;
    phase = "ready";
    progress = 1;
    notify("state");
  }

  function fail(msg) {
    stopWorker();
    phase = "error";
    errMsg = msg || "Chord analysis failed";
    result = null;
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
        done(p.id, myGen, { chroma: d.chroma, rms: d.rms, hop: d.hop, win: d.win, frames: d.frames, tuning: d.tuning }, p.dur);
      }
    };
    w.onerror = function () { if (myGen === gen) fail("Worker failed"); };
    w.postMessage({ mono: p.mono, sr: p.sr }, [p.mono.buffer]);
  }

  // ---------- 公開 ----------
  // 曲を読み込み始めた時: 前の曲の解析を捨てる
  function reset() {
    gen++;
    stopWorker();
    pending = null;
    curId = null;
    result = null;
    phase = "idle";
    progress = 0;
    ver++;
    notify("state");
  }

  // デコード済みの波形を受け取る(player-ui-shared.jsのdecodeWaveformから)。コードモードなら続けて解析を始める
  function offer(id, audioBuffer) {
    curId = id;
    curDur = audioBuffer.duration;
    if (cache.has(id)) { classifyNow(); return; }
    pending = { id: id, mono: downmix(audioBuffer), sr: audioBuffer.sampleRate, dur: audioBuffer.duration };
    phase = "queued";
    notify("state");
    if (wanted()) run();
  }

  // コードモードに切り替えた時: 未解析なら解析を始める
  function ensure() {
    if (phase === "queued" && pending) run();
    else if (phase === "error" && curId && !pending && !cache.has(curId)) { /* 再試行は曲を選び直す */ }
  }

  function setDetail(d) {
    if (DETAILS.indexOf(d) < 0 || d === detail) return;
    detail = d;
    try { localStorage.setItem(DETAIL_KEY, d); } catch (e) {}
    if (cache.has(curId)) classifyNow(); else notify("state");
  }

  return {
    DETAILS: DETAILS,
    offer: offer,
    reset: reset,
    ensure: ensure,
    getDetail() { return detail; },
    setDetail: setDetail,
    phase() { return phase; },
    progress() { return progress; },
    error() { return errMsg; },
    version() { return ver; },
    segments() { return result ? result.segments : null; },
    key() { return result ? result.key : null; },
    onChange(fn) { listeners.push(fn); }
  };
})();

// 状態が変わったら: 設定帯の表示(進捗%)を更新し、結果が変わった時はシークバーを描き直す
QNChords.onChange(function (kind) {
  if (typeof window.qnBarStripSync === "function") window.qnBarStripSync();
  if (kind === "state" && typeof QNBars !== "undefined") QNBars.draw(true);
});
