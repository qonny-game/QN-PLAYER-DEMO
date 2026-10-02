// player-bars.js — 可変長シークバー。1本=BAR_SEC秒(5/10/15/30/60)を曲末まで縦に並べ、見えている行だけDOM化する(仮想スクロール)。スクロール入れ物=#vbarScroll、行の親=#vbarRows。
// 規約: 行番号は0始まり。行内の横位置は「行の開始からBAR_SEC秒=0〜100%」(最終行は途中まで)。他ファイルは行DOMを直接探さず QNBars.* を使う。
// 描画はpcv2WaveLoop(player-ui-pc-v2.js、100ms間引き)から draw() を呼ぶ。rAFループを新設しない。依存: player-core.js(audio, pins, waveformPeaks, hexToRgba, MARKER_COLOR_PALETTE)。
// 行が作られたら decorateBarRow(el,row)(player-markers.js)が線/A-B/区間ハイライトを付ける。

const QNBars = (function () {
  const OPTIONS = [5, 10, 15, 30, 60];
  const STORE_KEY = "qn_bar_sec";
  const DEFAULT_SEC = 5;
  const BUFFER_ROWS = 2;
  const BAR_STEP_CSS = 1.5;
  const FOLLOW_KEY = "qn_bar_follow";
  const PAUSE_KEY = "qn_bar_follow_pause";
  const PAUSE_DEFAULT = 6;
  const PAUSE_MIN = 1;
  const PAUSE_MAX = 30;
  const PROG_SCROLL_MS = 800;
  const UNPLAYED = "rgba(255, 255, 255, 0.16)";
  const GEAR_SVG = '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>';

  const containerEl = document.getElementById("vbarContainer");
  const scrollEl = document.getElementById("vbarScroll");
  const rowsEl = document.getElementById("vbarRows");

  let sec = readSec();
  let followOn = readFollow();
  let pauseSec = readPause();
  let dur = 0;
  let rowCount = 0;
  const g = { padTop: 26, padBottom: 12, barH: 44, gap: 28, pitch: 72, labelW: 44, padRight: 12, barW: 300, viewH: 300, dpr: 1, nBars: 75 };
  let geomDirty = true;
  const rows = new Map();
  const pool = [];
  let firstRow = 0;
  let lastRow = -1;
  let keptRow = false;
  let progUntil = 0;
  let suspendUntil = 0;
  let lastInputAt = -1e9;
  let lastFollowCt = -1;
  let accentCache = null;
  let accentAt = 0;
  let lastPeaksRef = null;
  let peaksVer = 0;
  let markersSig = "";
  let markersList = [];
  const peakCache = new Map();
  const rgbaCache = new Map();
  let curRowEl = null;
  let roRaf = 0;

  function readSec() {
    try {
      const v = parseInt(localStorage.getItem(STORE_KEY), 10);
      if (OPTIONS.indexOf(v) >= 0) return v;
    } catch (e) {}
    return DEFAULT_SEC;
  }

  function readFollow() {
    try { return localStorage.getItem(FOLLOW_KEY) !== "0"; } catch (e) { return true; }
  }

  function readPause() {
    try {
      const v = parseInt(localStorage.getItem(PAUSE_KEY), 10);
      if (v >= PAUSE_MIN && v <= PAUSE_MAX) return v;
    } catch (e) {}
    return PAUSE_DEFAULT;
  }

  function reduceMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function rgbaFor(hex, alpha) {
    const key = hex + "|" + alpha;
    let v = rgbaCache.get(key);
    if (v === undefined) {
      v = hexToRgba(hex, alpha);
      rgbaCache.set(key, v);
    }
    return v;
  }

  function fmtLabel(t) {
    const s = Math.floor(t);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = String(s % 60).padStart(2, "0");
    if (dur >= 3600) return h + ":" + String(m).padStart(2, "0") + ":" + ss;
    return m + ":" + ss;
  }

  // ---------- 寸法 ----------
  function measure() {
    if (!scrollEl || !scrollEl.clientWidth) { geomDirty = true; return false; }
    const cs = getComputedStyle(containerEl);
    const num = (name, def) => {
      const v = parseFloat(cs.getPropertyValue(name));
      return isFinite(v) ? v : def;
    };
    g.barH = num("--qn-bar-h", 44);
    g.gap = num("--qn-bar-gap", 28);
    g.padTop = num("--qn-bar-pad-top", 26);
    g.padBottom = num("--qn-bar-pad-bottom", 12);
    g.padRight = num("--qn-bar-pad-right", 12);
    g.labelW = num("--qn-bar-label-w", 44);
    g.pitch = g.barH + g.gap;
    g.dpr = window.devicePixelRatio || 1;
    g.viewH = scrollEl.clientHeight;
    g.barW = Math.max(40, scrollEl.clientWidth - g.labelW - g.padRight);
    const nb = Math.max(8, Math.floor(g.barW / BAR_STEP_CSS));
    if (nb !== g.nBars) { g.nBars = nb; peakCache.clear(); }
    geomDirty = false;
    return true;
  }

  function totalHeight() {
    return rowCount ? g.padTop + rowCount * g.pitch - g.gap + g.padBottom : 0;
  }

  function sizeCanvas(el) {
    const w = Math.max(1, Math.floor(g.barW * g.dpr));
    const h = Math.max(1, Math.floor(g.barH * g.dpr));
    if (el._cv.width !== w) el._cv.width = w;
    if (el._cv.height !== h) el._cv.height = h;
  }

  function relayoutRows() {
    rowsEl.style.height = totalHeight() + "px";
    rows.forEach((el, r) => {
      el.style.top = (g.padTop + r * g.pitch) + "px";
      sizeCanvas(el);
      el._sig = "";
    });
    firstRow = 0;
    lastRow = -1;
    ensureRows();
  }

  // ---------- 行の生成・回収 ----------
  function createRowEl() {
    const el = document.createElement("div");
    el.className = "vbar";
    const cv = document.createElement("canvas");
    cv.className = "vwave";
    const tm = document.createElement("span");
    tm.className = "vbar-time";
    el.appendChild(cv);
    el.appendChild(tm);
    el._cv = cv;
    el._cx = cv.getContext("2d");
    el._tm = tm;
    el._sig = "";
    return el;
  }

  function stripRow(el) {
    el.querySelectorAll(".vbar-line, .vbar-ab-pt, .segmentHighlight, .segmentHighlight-preroll").forEach(n => n.remove());
  }

  function releaseRow(r) {
    const el = rows.get(r);
    if (!el) return;
    stripRow(el);
    if (el.parentNode) el.parentNode.removeChild(el);
    el.classList.remove("is-current");
    if (curRowEl === el) curRowEl = null;
    rows.delete(r);
    pool.push(el);
  }

  function releaseAll() {
    Array.from(rows.keys()).forEach(releaseRow);
    firstRow = 0;
    lastRow = -1;
  }

  function addRow(r) {
    const el = pool.pop() || createRowEl();
    const t0 = r * sec;
    el._row = r;
    el._sig = "";
    el.dataset.row = String(r);
    el.style.top = (g.padTop + r * g.pitch) + "px";
    el.style.setProperty("--row-frac", (Math.max(0, Math.min(1, (dur - t0) / sec)) * 100) + "%");
    el._tm.textContent = fmtLabel(t0);
    sizeCanvas(el);
    rowsEl.appendChild(el);
    rows.set(r, el);
    if (typeof decorateBarRow === "function") decorateBarRow(el, r);
  }

  // 描画範囲(見えている行+前後BUFFER_ROWS)を満たす。ドラッグ中の線/A-B旗を持つ行は回収しない(掴んだ要素をDOMから消さない: GOTCHAS.md)
  function ensureRows(force) {
    if (!rowCount || !scrollEl || !scrollEl.clientHeight) return false;
    const st = scrollEl.scrollTop;
    const vh = scrollEl.clientHeight;
    const a = Math.max(0, Math.floor((st - g.padTop) / g.pitch) - BUFFER_ROWS);
    const b = Math.min(rowCount - 1, Math.floor((st + vh - g.padTop) / g.pitch) + BUFFER_ROWS);
    if (!force && a === firstRow && b === lastRow) return false;
    firstRow = a;
    lastRow = b;
    keptRow = false;
    Array.from(rows.keys()).forEach(r => {
      if (r >= a && r <= b) return;
      const el = rows.get(r);
      if (el && el.querySelector(".is-dragging, .vbar-ab-pt.dragging")) { keptRow = true; return; }
      releaseRow(r);
    });
    for (let r = a; r <= b; r++) {
      if (!rows.has(r)) addRow(r);
    }
    return true;
  }

  // 曲の長さ・秒数設定が変わった時の作り直し
  function rebuild() {
    releaseAll();
    rowCount = dur > 0 ? Math.max(1, Math.ceil(dur / sec - 1e-9)) : 0;
    containerEl.classList.toggle("qn-bars-hours", dur >= 3600);
    peakCache.clear();
    measure();
    progUntil = performance.now() + 300;
    rowsEl.style.height = totalHeight() + "px";
    ensureRows(true);
  }

  function syncDur() {
    const d = audio.duration;
    const v = (isFinite(d) && d > 0) ? d : 0;
    if (v !== dur) {
      dur = v;
      rebuild();
    }
  }

  // ---------- 時刻 <-> 行 ----------
  function rowOf(t) {
    syncDur();
    if (!rowCount) return 0;
    return Math.max(0, Math.min(rowCount - 1, Math.floor(t / sec + 1e-9)));
  }

  function pctInRow(t) {
    const r = rowOf(t);
    return Math.max(0, Math.min(100, ((t - r * sec) / sec) * 100));
  }

  function timeFromPoint(clientX, clientY) {
    syncDur();
    if (!rowCount) return null;
    if (geomDirty) measure();
    const rect = scrollEl.getBoundingClientRect();
    const y = clientY - rect.top + scrollEl.scrollTop - g.padTop;
    const row = Math.max(0, Math.min(rowCount - 1, Math.floor((y + g.gap / 2) / g.pitch)));
    const ratio = Math.max(0, Math.min(1, (clientX - (rect.left + g.labelW)) / g.barW));
    return Math.min(dur, row * sec + ratio * sec);
  }

  // 行要素bar上のclientXから時刻。曲の終わりより右(最終行の空白)はnull
  function timeInRow(barEl, row, clientX) {
    const rect = barEl.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const t = row * sec + ratio * sec;
    if (t > dur + 0.001) return null;
    return Math.min(dur, t);
  }

  // ---------- 描画 ----------
  function rowPeaks(r) {
    let v = peakCache.get(r);
    if (v) return v;
    const peaks = waveformPeaks;
    if (!peaks || !peaks.length || !dur) return null;
    const nB = g.nBars;
    const t0 = r * sec;
    const barDur = sec / nB;
    const pps = peaks.length / dur;
    const filled = Math.max(1, Math.min(nB, Math.ceil((dur - t0) / barDur - 1e-9)));
    v = new Float32Array(filled);
    for (let i = 0; i < filled; i++) {
      const a = t0 + i * barDur;
      const z = Math.min(dur, a + barDur);
      const i0 = Math.min(peaks.length - 1, Math.floor(a * pps));
      const i1 = Math.min(peaks.length, Math.max(i0 + 1, Math.ceil(z * pps)));
      let m = 0;
      for (let j = i0; j < i1; j++) if (peaks[j] > m) m = peaks[j];
      v[i] = m;
    }
    peakCache.set(r, v);
    return v;
  }

  // 連続した波形(隙間なし)。1行ぶんの輪郭を1本のPathにして、色が変わる区間(再生済み/未再生/マーカー色)ごとにclipして塗る
  function paintRow(el, r, played, accent) {
    const cv = el._cv;
    const cx = el._cx;
    const W = cv.width;
    const H = cv.height;
    cx.clearRect(0, 0, W, H);
    const vals = rowPeaks(r);
    if (!vals) return;
    const n = vals.length;
    const step = W / g.nBars;
    const minH = Math.max(1, g.dpr);
    const path = new Path2D();
    path.moveTo(0, H);
    path.lineTo(0, H - Math.max(minH, vals[0] * H * 0.85));
    for (let i = 0; i < n; i++) path.lineTo((i + 0.5) * step, H - Math.max(minH, vals[i] * H * 0.85));
    path.lineTo(n * step, H - Math.max(minH, vals[n - 1] * H * 0.85));
    path.lineTo(n * step, H);
    path.closePath();

    const barDur = sec / g.nBars;
    const t0 = r * sec;
    const ms = markersList;
    let ptr = -1;
    while (ptr + 1 < ms.length && ms[ptr + 1].t <= t0) ptr++;
    let runStart = 0;
    let runFill = null;
    const flush = (endI) => {
      if (runFill === null || endI <= runStart) return;
      cx.save();
      cx.beginPath();
      cx.rect(runStart * step, 0, (endI - runStart) * step + 0.5, H);
      cx.clip();
      cx.fillStyle = runFill;
      cx.fill(path);
      cx.restore();
    };
    for (let i = 0; i < n; i++) {
      const bt = t0 + i * barDur;
      while (ptr + 1 < ms.length && ms[ptr + 1].t <= bt) ptr++;
      const f = ptr >= 0 ? ms[ptr] : null;
      const mc = (f && f.color && MARKER_COLOR_PALETTE[f.color]) || null;
      const isPlayed = i < played;
      const fill = mc ? (isPlayed ? mc : rgbaFor(mc, 0.35)) : (isPlayed ? accent : UNPLAYED);
      if (fill !== runFill) {
        flush(i);
        runStart = i;
        runFill = fill;
      }
    }
    flush(n);
  }

  function playedBars(r, ct) {
    const t0 = r * sec;
    if (ct >= t0 + sec) return g.nBars;
    if (ct < t0) return 0;
    return Math.min(g.nBars, Math.floor((ct - t0) / (sec / g.nBars)) + 1);
  }

  function draw(force) {
    if (!scrollEl) return;
    syncDur();
    if (!rowCount || !scrollEl.clientWidth) return;
    if (geomDirty) { if (measure()) { peakCache.clear(); relayoutRows(); force = true; } else return; }
    if (keptRow) ensureRows(true);

    const now = performance.now();
    const ct = audio.currentTime || 0;
    followTick(now, ct);

    // 現在行の時刻ラベルを明るく
    const cr = rows.get(rowOf(ct)) || null;
    if (cr !== curRowEl) {
      if (curRowEl) curRowEl.classList.remove("is-current");
      if (cr) cr.classList.add("is-current");
      curRowEl = cr;
    }

    const peaks = (typeof waveformPeaks !== "undefined") ? waveformPeaks : null;
    if (!peaks) return;
    if (peaks !== lastPeaksRef) { lastPeaksRef = peaks; peaksVer++; peakCache.clear(); }

    if (!accentCache || now - accentAt > 500) {
      accentCache = getComputedStyle(document.body).getPropertyValue("--accent-primary").trim() || "#3b82f6";
      accentAt = now;
    }
    const accent = window.__qnGlowBaseAccent || accentCache;

    let ms = "";
    for (let i = 0; i < pins.length; i++) {
      if (pins[i].enabled) ms += pins[i].t + ":" + (pins[i].color || "") + ",";
    }
    if (ms !== markersSig) {
      markersSig = ms;
      markersList = pins.filter(p => p.enabled).sort((a, b) => a.t - b.t);
    }

    const sig = accent + "|" + ms + "|" + peaksVer + "|" + g.nBars + "|" + g.barW + "|" + g.barH + "|" + g.dpr + "|" + sec + "|" + (window.__qnWaveformDrawCount || 0);
    rows.forEach((el, r) => {
      const played = playedBars(r, ct);
      const rs = sig + "|" + played;
      if (!force && el._sig === rs) return;
      el._sig = rs;
      paintRow(el, r, played, accent);
    });
  }

  // ---------- 再生位置の追従 ----------
  function scrollToTop(target, now) {
    const max = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
    target = Math.max(0, Math.min(target, max));
    if (Math.abs(target - scrollEl.scrollTop) < 1) return;
    const smooth = !reduceMotion();
    progUntil = now + (smooth ? PROG_SCROLL_MS : 200);
    try {
      scrollEl.scrollTo({ top: target, behavior: smooth ? "smooth" : "auto" });
    } catch (e) {
      scrollEl.scrollTop = target;
    }
  }

  function playheadScrollTarget(t) {
    return g.padTop + rowOf(t) * g.pitch - g.padTop - g.pitch;
  }

  function ensureVisible(t, now) {
    const top = g.padTop + rowOf(t) * g.pitch;
    const st = scrollEl.scrollTop;
    if (top - g.gap * 0.7 >= st && top + g.barH <= st + scrollEl.clientHeight) return;
    scrollToTop(playheadScrollTarget(t), now);
  }

  function followTick(now, ct) {
    if (!followOn || now < progUntil || now < suspendUntil) return;
    if (Math.abs(ct - lastFollowCt) < 0.0005) return;
    lastFollowCt = ct;
    ensureVisible(ct, now);
  }

  function resumeFollow() {
    suspendUntil = 0;
    lastFollowCt = -1;
  }

  function onTrackLoaded() {
    if (!scrollEl) return;
    syncDur();
    progUntil = performance.now() + 300;
    scrollEl.scrollTop = 0;
    resumeFollow();
    ensureRows(true);
  }

  // ---------- 設定 ----------
  function getSec() { return sec; }

  function setSec(n) {
    if (OPTIONS.indexOf(n) < 0 || n === sec) return;
    sec = n;
    try { localStorage.setItem(STORE_KEY, String(n)); } catch (e) {}
    syncDur();
    if (dur) {
      rebuild();
      if (scrollEl.clientHeight) {
        scrollEl.scrollTop = Math.max(0, playheadScrollTarget(audio.currentTime || 0));
        ensureRows(true);
      }
      resumeFollow();
      draw(true);
    }
  }

  function getFollow() { return followOn; }

  function setFollow(on) {
    followOn = !!on;
    try { localStorage.setItem(FOLLOW_KEY, followOn ? "1" : "0"); } catch (e) {}
    if (followOn) resumeFollow();
  }

  function getPause() { return pauseSec; }

  function setPause(n) {
    n = Math.max(PAUSE_MIN, Math.min(PAUSE_MAX, Math.round(n)));
    pauseSec = n;
    try { localStorage.setItem(PAUSE_KEY, String(n)); } catch (e) {}
  }

  // ---------- 歯車ボタン(押すと設定パネルを開く。パネル本体は player-ui-pc-v2.js) ----------
  let gearBtn = null;
  let openSettingsFn = null;

  function createGearButton() {
    if (gearBtn) return gearBtn;
    gearBtn = document.createElement("button");
    gearBtn.type = "button";
    gearBtn.id = "qnBarGearBtn";
    gearBtn.className = "qn-bar-gear";
    gearBtn.title = "Settings";
    gearBtn.setAttribute("aria-label", "Settings");
    gearBtn.innerHTML = GEAR_SVG;
    gearBtn.addEventListener("click", e => {
      e.stopPropagation();
      if (typeof hapticTap === "function") hapticTap();
      if (openSettingsFn) openSettingsFn();
    });
    return gearBtn;
  }

  // ---------- ドラッグ中の端スクロール(50ms間引きのタイマー。rAFは使わない) ----------
  function startEdgeScroll(getPt, onScrolled) {
    const ZONE = 40;
    const MAX = 16;
    const timer = setInterval(() => {
      if (!rowCount) return;
      const p = getPt();
      if (!p) return;
      const r = scrollEl.getBoundingClientRect();
      let dy = 0;
      if (p.y < r.top + ZONE) dy = -Math.ceil(MAX * Math.min(1, (r.top + ZONE - p.y) / ZONE));
      else if (p.y > r.bottom - ZONE) dy = Math.ceil(MAX * Math.min(1, (p.y - (r.bottom - ZONE)) / ZONE));
      if (!dy) return;
      const before = scrollEl.scrollTop;
      scrollEl.scrollTop = before + dy;
      if (scrollEl.scrollTop !== before) {
        ensureRows();
        if (onScrolled) onScrolled(p);
      }
    }, 50);
    return () => clearInterval(timer);
  }

  // ---------- イベント ----------
  if (scrollEl) {
    // 手動スクロール判定: 直前に利用者の入力(ホイール/タッチ/バー操作)があった、またはプログラムによるスクロール期間(progUntil)外
    const markInput = () => { lastInputAt = performance.now(); };
    ["wheel", "touchstart", "touchmove", "pointerdown"].forEach(n => scrollEl.addEventListener(n, markInput, { passive: true }));
    scrollEl.addEventListener("scroll", () => {
      const now = performance.now();
      if (now >= progUntil || now - lastInputAt < 1000) suspendUntil = now + pauseSec * 1000;
      if (ensureRows()) draw(false);
    }, { passive: true });

    if (typeof ResizeObserver === "function") {
      new ResizeObserver(() => {
        geomDirty = true;
        if (roRaf) return;
        roRaf = requestAnimationFrame(() => { roRaf = 0; draw(true); });
      }).observe(scrollEl);
    }
    window.addEventListener("resize", () => { geomDirty = true; });
  }
  if (typeof audio !== "undefined" && audio) {
    audio.addEventListener("seeked", resumeFollow);
    audio.addEventListener("play", resumeFollow);
  }

  return {
    OPTIONS,
    getSec,
    setSec,
    sync: syncDur,
    draw,
    markGeomDirty() { geomDirty = true; },
    ensureRows,
    onTrackLoaded,
    createGearButton,
    setOpenSettings(fn) { openSettingsFn = fn; },
    getFollow, setFollow, getPause, setPause,
    PAUSE_MIN, PAUSE_MAX,
    rowOf,
    pctInRow,
    rowStart(r) { return r * sec; },
    rowEl(r) { syncDur(); return rows.get(r) || null; },
    eachRow(fn) { rows.forEach((el, r) => fn(el, r)); },
    timeFromPoint,
    timeInRow,
    startEdgeScroll
  };
})();
