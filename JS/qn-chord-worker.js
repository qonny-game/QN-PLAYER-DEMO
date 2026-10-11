// qn-chord-worker.js — コード解析(クロマ)と拍の検出の重い部分をメインスレッドの外で動かす。計算本体は qn-chord-core.js。
// 受信: { mono: Float32Array(転送), sr }  送信: { type:"progress", p } / { type:"done", chroma, bass, rms, hop, win, frames, tuning, beats:{times,low,on,mid,bpm,period,conf}|null } / { type:"error", message }
importScripts("qn-chord-core.js");

self.onmessage = function (e) {
  try {
    const d = e.data;
    let last = 0;
    const post = function (p) {
      const now = Date.now();
      if (now - last > 100 || p >= 1) { last = now; self.postMessage({ type: "progress", p: p }); }
    };
    const core = self.QNChordCore;
    const r = core.chroma(d.mono, d.sr, function (p) { post(p * 0.7); });
    let b = null;
    try { b = core.beats(d.mono, d.sr, function (p) { post(0.7 + p * 0.3); }); } catch (err) { b = null; }   // 拍が取れなくてもコードは返す
    const tr = [r.chroma.buffer, r.bass.buffer, r.rms.buffer];
    if (b) { tr.push(b.times.buffer, b.low.buffer); }
    self.postMessage({ type: "done", chroma: r.chroma, bass: r.bass, rms: r.rms, hop: r.hop, win: r.win, frames: r.frames, tuning: r.tuning, beats: b }, tr);
  } catch (err) {
    self.postMessage({ type: "error", message: (err && err.message) || "Chord analysis failed" });
  }
};
