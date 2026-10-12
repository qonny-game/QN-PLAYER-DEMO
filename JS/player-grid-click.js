// player-grid-click.js — Grid click: 再生中、縦線(QNChords.grid())の位置で小節頭=高い音・拍=低い音を鳴らす(グリッドを耳で確認する用)。ON/OFFはQNChords.getClick()/setClick()。
// 再生位置(audio.currentTime)から少し先の線をAudioContextの時刻に予約する。クリックは曲と同じ後段(ゲイン→リミッター→出力)へ入れて出力経路をそろえる。EQ/Speed/Key(SoundTouch)は通さないので、Speed/Key使用中はその処理遅延ぶん曲よりわずかに早く聞こえうる。
(function () {
  "use strict";
  const AHEAD = 0.25;          // 何秒先(曲の時間)まで予約するか
  const TICK_MS = 40;
  let timer = 0, last = -1, lastGridVer = -1;

  function click(ctx, when, head) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = head ? 1760 : 988;
    const peak = head ? 0.5 : 0.3;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(peak, when + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.06);
    o.connect(g); g.connect(typeof normGainNode !== "undefined" && normGainNode ? normGainNode : ctx.destination);
    o.start(when); o.stop(when + 0.08);
  }

  function tick() {
    if (!QNChords.getClick() || typeof audio === "undefined" || audio.paused) { last = -1; return; }
    const gd = QNChords.grid();
    if (!gd || !gd.times || !gd.times.length) return;
    const ctx = window.__qnAudioCtx;
    if (!ctx || ctx.state !== "running") return;
    const rate = audio.playbackRate > 0 ? audio.playbackRate : 1;
    const cur = audio.currentTime;
    if (QNChords.gridVersion() !== lastGridVer) { lastGridVer = QNChords.gridVersion(); last = cur - 0.001; }
    if (last < 0 || cur < last - 0.3 || cur > last + 1) last = cur - 0.001;       // 開始・シーク後は今の位置から
    const t = gd.times, end = cur + AHEAD * rate;
    let lo = 0, hi = t.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (t[m] <= last) lo = m + 1; else hi = m; }
    const now = ctx.currentTime;
    for (let i = lo; i < t.length && t[i] <= end; i++) {
      const when = now + (t[i] - cur) / rate;
      if (when >= now - 0.01) click(ctx, Math.max(when, now), gd.bar[i] === 0);
      last = t[i];
    }
  }

  function sync() {
    const on = QNChords.getClick();
    if (on && !timer) { last = -1; timer = setInterval(tick, TICK_MS); }
    else if (!on && timer) { clearInterval(timer); timer = 0; }
  }
  QNChords.onChange(function (kind) { if (kind === "click") sync(); });
  sync();
})();
