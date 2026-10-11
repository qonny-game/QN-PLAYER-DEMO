// qn-chord-worker.js — コード解析の重い部分(クロマ抽出)をメインスレッドの外で動かす。計算本体は qn-chord-core.js。
// 受信: { mono: Float32Array(転送), sr }  送信: { type:"progress", p } / { type:"done", chroma, rms, hop, win, frames, tuning } / { type:"error", message }
importScripts("qn-chord-core.js");

self.onmessage = function (e) {
  try {
    const d = e.data;
    let last = 0;
    const r = self.QNChordCore.chroma(d.mono, d.sr, function (p) {
      const now = Date.now();
      if (now - last > 100 || p >= 1) { last = now; self.postMessage({ type: "progress", p: p }); }
    });
    self.postMessage({ type: "done", chroma: r.chroma, rms: r.rms, hop: r.hop, win: r.win, frames: r.frames, tuning: r.tuning }, [r.chroma.buffer, r.rms.buffer]);
  } catch (err) {
    self.postMessage({ type: "error", message: (err && err.message) || "Chord analysis failed" });
  }
};
