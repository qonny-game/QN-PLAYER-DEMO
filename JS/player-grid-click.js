// player-grid-click.js — Grid click: 再生中、縦線(QNChords.grid())の位置で小節頭=高い音・拍=低い音を鳴らす(グリッドを耳で確認する用)。ON/OFFはQNChords.getClick()/setClick()。
// 仕組み: audio.currentTime は約24ms刻みの階段状にしか進まない(読んだ瞬間の値は最大で1段ぶん古い)。そこで8msごとに (ctx.currentTime − audio.currentTime/rate) を測り、
//   直近の最小値=「階段の段差の直後」に読めた値を、再生時計とAudioContextの対応(off)とする。シーク/再生開始/速度変更のたびに取り直し、取り直し中(CALIB秒)は鳴らさず、予約済みのクリックも取り消す。
// クリックは曲と同じ経路(SoundTouch→EQ→ゲイン→リミッター→出力)の入口へ入れ、処理遅延と出力遅延を曲と同じにする(通さないとSoundTouchの遅延ぶんクリックが先に鳴る)。
(function () {
  "use strict";
  const AHEAD = 0.25;          // 何秒先(曲の時間)まで予約するか
  const TICK_MS = 40, SAMPLE_MS = 8;
  const CALIB = 0.3;           // 再生開始/シーク後、対応を取り直すのに使う秒数(この間は鳴らさない)
  const WINDOW = 0.8;          // 対応(off)を求める時に見る直近の秒数
  const OFFSET_KEY = "qn_click_offset";   // 端末ごとの手動の補正(ms)。Bluetoothなど出力の遅れが端末で違う時に、耳で合わせる
  let userOffset = 0;
  try { userOffset = (parseInt(localStorage.getItem(OFFSET_KEY), 10) || 0) / 1000; } catch (e) {}
  window.QNClickOffset = {
    get: () => Math.round(userOffset * 1000),
    set: ms => { userOffset = Math.max(-500, Math.min(500, ms | 0)) / 1000; try { localStorage.setItem(OFFSET_KEY, String(Math.round(userOffset * 1000))); } catch (e) {} if (timer) reset(); }
  };
  const TRIM = -0.003;         // 実測の微調整(秒)。Chromiumで実測した「クリックが10〜36ms先に鳴る」の中間あたりを打ち消す
  let timer = 0, sampler = 0, last = -1, lastGridVer = -1;
  let ring = [];               // [ctx時刻, off候補]
  let calibFrom = 0;           // 取り直しを始めたctx時刻
  let live = [];               // 予約済み(まだ鳴っていない)クリック: { o, g, when }

  // 曲と同じ経路の入口: SoundTouch(Speed/Key)があればその入口、無ければ最初のEQ、無ければゲイン。
  function target(ctx) {
    if (typeof soundTouchNode !== "undefined" && soundTouchNode) return soundTouchNode;
    if (typeof eqFilters !== "undefined" && eqFilters && eqFilters[0]) return eqFilters[0];
    if (typeof normGainNode !== "undefined" && normGainNode) return normGainNode;
    return ctx.destination;
  }

  function click(ctx, when, head) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = head ? 1760 : 988;
    const peak = head ? 0.5 : 0.3;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(peak, when + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.06);
    o.connect(g); g.connect(target(ctx));
    o.start(when); o.stop(when + 0.08);
    live.push({ o: o, g: g, when: when });
  }

  // 予約済みで未発音のクリックを取り消す(シーク直後に古い位置のクリックが鳴らないように)
  function cancelPending(ctx) {
    const now = ctx ? ctx.currentTime : 0;
    live = live.filter(function (c) {
      if (c.when > now - 0.001) { try { c.o.stop(); c.o.disconnect(); c.g.disconnect(); } catch (e) {} return false; }
      return c.when > now - 0.1;
    });
  }

  function reset() {
    const ctx = window.__qnAudioCtx;
    ring = []; last = -1;
    calibFrom = ctx ? ctx.currentTime : 0;
    cancelPending(ctx);
  }

  function sample() {
    if (typeof audio === "undefined" || audio.paused || audio.seeking) return;
    const ctx = window.__qnAudioCtx;
    if (!ctx || ctx.state !== "running") return;
    const rate = audio.playbackRate > 0 ? audio.playbackRate : 1, now = ctx.currentTime;
    ring.push([now, now - audio.currentTime / rate]);
    while (ring.length && ring[0][0] < now - WINDOW) ring.shift();
  }

  function tick() {
    if (!QNChords.getClick() || typeof audio === "undefined" || audio.paused || audio.seeking) return;
    const gd = QNChords.grid();
    if (!gd || !gd.times || !gd.times.length) return;
    const ctx = window.__qnAudioCtx;
    if (!ctx || ctx.state !== "running") return;
    const now = ctx.currentTime;
    if (!ring.length || now - calibFrom < CALIB) return;          // 対応を取り直し中
    let off = Infinity;
    for (let i = 0; i < ring.length; i++) if (ring[i][1] < off) off = ring[i][1];
    off += TRIM + userOffset;
    const rate = audio.playbackRate > 0 ? audio.playbackRate : 1;
    const cur = (now - off) * rate;                                // 今、曲のどこが入口を通っているか
    if (QNChords.gridVersion() !== lastGridVer) { lastGridVer = QNChords.gridVersion(); last = cur - 0.001; }
    if (last < 0 || cur < last - 0.3 || cur > last + 1) last = cur - 0.001;
    const t = gd.times, end = cur + AHEAD * rate;
    let lo = 0, hi = t.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (t[m] <= last) lo = m + 1; else hi = m; }
    for (let i = lo; i < t.length && t[i] <= end; i++) {
      const when = off + t[i] / rate;
      if (when >= now - 0.01) click(ctx, Math.max(when, now), gd.bar[i] === 0);
      last = t[i];
    }
    live = live.filter(function (c) { return c.when > now - 0.2; });      // 鳴り終えたものを手放す
  }

  function sync() {
    const on = QNChords.getClick();
    if (on && !timer) {
      reset();
      timer = setInterval(tick, TICK_MS);
      sampler = setInterval(sample, SAMPLE_MS);
    } else if (!on && timer) {
      clearInterval(timer); clearInterval(sampler); timer = sampler = 0;
      cancelPending(window.__qnAudioCtx);
    }
  }
  ["seeking", "seeked", "play", "playing", "pause", "ratechange", "waiting", "emptied"].forEach(function (ev) {
    if (typeof audio !== "undefined") audio.addEventListener(ev, function () { if (timer) reset(); });
  });
  QNChords.onChange(function (kind) { if (kind === "click") sync(); });
  sync();
})();
