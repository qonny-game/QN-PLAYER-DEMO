// player-bars.js — 可変長シークバー。1本=BAR_SEC秒(1秒刻みの整数)を曲末まで縦に並べ、見えている行だけDOM化する(仮想スクロール)。スクロール入れ物=#vbarScroll、行の親=#vbarRows。
// 規約: 行番号は0始まり。行内の横位置は「行の開始からBAR_SEC秒=0〜100%」(最終行は途中まで)。他ファイルは行DOMを直接探さず QNBars.* を使う。
// 描画はpcv2WaveLoop(player-ui-pc-v2.js、100ms間引き)から draw() を呼ぶ。rAFループを新設しない。依存: player-core.js(audio, pins, waveformPeaks, hexToRgba, MARKER_COLOR_PALETTE)。
// 行が作られたら decorateBarRow(el,row)(player-markers.js)が線/A-B/区間ハイライトを付ける。

const QNBars = (function () {
  // バー長は1秒刻みの整数。上限=曲長/「Rows Autoで画面に収まる行数」(=一番俯瞰で見られる秒数)。曲が決まるまでは240
  const SEC_MAX_LIMIT = 3600;
  const fmtSec = (v) => v >= 60 ? (v % 60 ? Math.floor(v / 60) + "m" + (v % 60) + "s" : (v / 60) + "min") : v + "s"; // 60s以上は分表記(保存値は秒)
  const STORE_KEY = "qn_bar_sec";
  const ROWS_KEY = "qn_bar_rows";
  const ROWS_OPTIONS = [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];   // 0=自動(CSSの既定寸法)。1画面に並べる本数
  const GAP_RATIO = 28 / 44;
  const DEFAULT_SEC = 5;
  const BUFFER_ROWS = 2;
  const BAR_STEP_CSS = 0.5;
  const FOLLOW_KEY = "qn_bar_follow";
  const WAVE_KEY = "qn_bar_wave";
  let waveShape = "mirror";
  try { if (localStorage.getItem(WAVE_KEY) === "bottom") waveShape = "bottom"; } catch (e) {}
  // 【v4.27.0 プロトタイプ】表示モード: wave=波形 / chord=コード名(C Am7) / degree=ディグリー(I vi7)。コードは QNChords(player-chords.js)の区間を波形の代わりに描く
  const VIEW_KEY = "qn_bar_view";
  let viewMode = "wave";
  try { const v = localStorage.getItem(VIEW_KEY); if (v === "chord" || v === "degree") viewMode = v; } catch (e) {}
  let fontCache = null;
  let editMode = false;   // コード修正モード。ONの間、行のタップはシークでなくコード修正ポップアップ(player-chord-edit.js)を開く
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
  let rowsVisible = readRows();
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
      if (v >= 1 && v <= SEC_MAX_LIMIT) return v;
    } catch (e) {}
    return DEFAULT_SEC;
  }

  function readRows() {
    try {
      const v = parseInt(localStorage.getItem(ROWS_KEY), 10);
      if (ROWS_OPTIONS.indexOf(v) >= 0) return v;
    } catch (e) {}
    return 0;
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
    // 本数指定: 画面の高さにN本ちょうど収まるよう、バー高と行間をカスタムプロパティで上書き(指定なしなら上書きを外してCSS既定へ)
    if (rowsVisible > 0 && scrollEl.clientHeight > 0) {
      const cs0 = getComputedStyle(containerEl);
      const pt = parseFloat(cs0.getPropertyValue("--qn-bar-pad-top")) || 26;
      const pb = parseFloat(cs0.getPropertyValue("--qn-bar-pad-bottom")) || 12;
      const avail = scrollEl.clientHeight - pt - pb;
      const n = rowsVisible;
      const bh = Math.max(14, Math.floor(avail / (n + (n - 1) * GAP_RATIO)));
      const gp = n > 1 ? Math.max(8, Math.floor((avail - n * bh) / (n - 1))) : 0;
      containerEl.style.setProperty("--qn-bar-h", bh + "px");
      containerEl.style.setProperty("--qn-bar-gap", gp + "px");
    } else {
      containerEl.style.removeProperty("--qn-bar-h");
      containerEl.style.removeProperty("--qn-bar-gap");
    }
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
    el.querySelectorAll(".vbar-line, .vbar-ab-pt, .segmentHighlight, .segmentHighlight-preroll, .segmentSkip").forEach(n => n.remove());
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
      if (dur) { const mx = Math.max(1, maxSec()); if (sec > mx) sec = mx; } // 短い曲では俯瞰上限を超えない(保存値は書き換えない)
      rebuild();
      notifyRange();
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
    if (viewMode !== "wave") {
      const segs = chordSegs();
      if (segs) { paintChordRow(el, r, played, accent, segs); return; }
    }
    const vals = rowPeaks(r);
    if (!vals) return;
    const n = vals.length;
    const step = W / g.nBars;
    const minH = Math.max(1, g.dpr);
    const path = new Path2D();
    // 【v3.58.0】Mirror=中心線から上下対称(DAWの波形に近い)、Bottom=従来の下揃え。点は0.5CSSpx刻みなので直線でつないでも角は見えない
    if (waveShape === "mirror") {
      const mid = H / 2, amp = H * 0.46;
      const dy = i => Math.max(minH / 2, vals[i] * amp);
      path.moveTo(0, mid - dy(0));
      for (let i = 0; i < n; i++) path.lineTo((i + 0.5) * step, mid - dy(i));
      path.lineTo(n * step, mid - dy(n - 1));
      path.lineTo(n * step, mid + dy(n - 1));
      for (let i = n - 1; i >= 0; i--) path.lineTo((i + 0.5) * step, mid + dy(i));
      path.lineTo(0, mid + dy(0));
      path.closePath();
    } else {
      path.moveTo(0, H);
      path.lineTo(0, H - Math.max(minH, vals[0] * H * 0.85));
      for (let i = 0; i < n; i++) path.lineTo((i + 0.5) * step, H - Math.max(minH, vals[i] * H * 0.85));
      path.lineTo(n * step, H - Math.max(minH, vals[n - 1] * H * 0.85));
      path.lineTo(n * step, H);
      path.closePath();
    }

    // コードモードの解析待ち中は波形を薄く出しておく
    if (viewMode !== "wave") cx.globalAlpha = 0.3;
    fillPath(el, r, played, accent, path, n);
    cx.globalAlpha = 1;
  }

  // 行の輪郭(path)を、色が変わる区間(再生済み/未再生/マーカー色)ごとにclipして塗る。波形・コードで共通
  function fillPath(el, r, played, accent, path, n) {
    const cx = el._cx;
    const H = el._cv.height;
    const W = el._cv.width;
    const step = W / g.nBars;
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

  // ---------- コードモードの描画 ----------
  // プレイヤーのKey操作(半音)。コード名(letter)だけ移調して表示する。ディグリーは変わらない
  function keyShift() {
    return (typeof keyEffectEnabled !== "undefined" && keyEffectEnabled && typeof currentKeySemitones !== "undefined") ? currentKeySemitones : 0;
  }

  function chordSegs() {
    if (typeof QNChords === "undefined") return null;
    const s = QNChords.segments();
    return s && s.length ? s : null;
  }

  // 左右の丸み(rl/rr)を別々に指定できる角丸四角。行の端で切れている側は丸めない
  function blockPath(path, x, y, w, h, rl, rr) {
    rl = Math.min(rl, w / 2, h / 2);
    rr = Math.min(rr, w / 2, h / 2);
    path.moveTo(x + rl, y);
    path.lineTo(x + w - rr, y);
    if (rr) path.arcTo(x + w, y, x + w, y + rr, rr); else path.lineTo(x + w, y);
    path.lineTo(x + w, y + h - rr);
    if (rr) path.arcTo(x + w, y + h, x + w - rr, y + h, rr); else path.lineTo(x + w, y + h);
    path.lineTo(x + rl, y + h);
    if (rl) path.arcTo(x, y + h, x, y + h - rl, rl); else path.lineTo(x, y + h);
    path.lineTo(x, y + rl);
    if (rl) path.arcTo(x, y, x + rl, y, rl); else path.lineTo(x, y);
    path.closePath();
  }

  function markerColorAt(t) {
    let hex = null;
    for (let i = 0; i < markersList.length && markersList[i].t <= t; i++) hex = (markersList[i].color && MARKER_COLOR_PALETTE[markersList[i].color]) || null;
    return hex;
  }

  // 塗りの色が明るい時は黒、それ以外は白の文字にする(#rrggbbのみ判定。他の書式は白)
  function textOn(fill) {
    const m = /^#([0-9a-f]{6})$/i.exec(fill || "");
    if (!m) return "#fff";
    const v = parseInt(m[1], 16);
    const lum = (0.299 * (v >> 16) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255)) / 255;
    return lum > 0.62 ? "#111" : "#fff";
  }

  function paintChordRow(el, r, played, accent, segs) {
    const cx = el._cx;
    const W = el._cv.width;
    const H = el._cv.height;
    const t0 = r * sec;
    const t1 = t0 + sec;
    const barDur = sec / g.nBars;
    const n = Math.max(1, Math.min(g.nBars, Math.ceil((dur - t0) / barDur - 1e-9)));
    const xOf = t => (t - t0) / sec * W;
    const xEnd = Math.min(W, xOf(Math.min(dur, t1)));
    const gap = Math.max(1, 1.5 * g.dpr);
    const by = H * 0.14;
    const bh = H * 0.72;
    const rad = Math.min(6 * g.dpr, bh / 3);
    let lo = 0;
    let hi = segs.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (segs[m].t1 <= t0) lo = m + 1; else hi = m; }
    const path = new Path2D();
    const vis = [];
    for (let i = lo; i < segs.length && segs[i].t0 < t1; i++) {
      const s = segs[i];
      const startsHere = s.t0 >= t0 - 1e-6;
      const endsHere = s.t1 <= t1 + 1e-6;
      const x0 = Math.max(0, xOf(s.t0)) + (startsHere ? gap / 2 : 0);
      const x1 = Math.min(xEnd, xOf(s.t1)) - (endsHere ? gap / 2 : 0);
      if (x1 - x0 < 1) continue;
      if (s.name === "N") {                       // コード無し/無音は細い線だけ
        const lh = Math.max(1, g.dpr);
        path.rect(x0, H / 2 - lh / 2, x1 - x0, lh);
        continue;
      }
      blockPath(path, x0, by, x1 - x0, bh, startsHere ? rad : 0, endsHere ? rad : 0);
      vis.push({ s: s, x0: x0, x1: x1 });
    }
    cx.globalAlpha = 1;
    fillPath(el, r, played, accent, path, n);

    // コード名(と候補)。ブロックの塗り(再生済み=アクセント/マーカー色、未再生=薄い白)に合わせて文字色を決める
    const mode = viewMode === "degree" ? "degree" : "letter";
    const shift = mode === "letter" ? keyShift() : 0;
    const twoLine = chordAlts() && bh >= 30 * g.dpr;           // 高さに余裕がある時だけ候補を2行目に出す
    const fs = Math.min(bh * (twoLine ? 0.4 : 0.52), 20 * g.dpr);
    if (fs < 9 * g.dpr) return;
    const fs2 = Math.max(8 * g.dpr, fs * 0.62);
    if (!fontCache) fontCache = getComputedStyle(document.body).fontFamily || "sans-serif";
    const f1 = "600 " + fs + "px " + fontCache, f2 = "500 " + fs2 + "px " + fontCache;
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    for (let i = 0; i < vis.length; i++) {
      const v = vis[i];
      const avail = v.x1 - v.x0 - 8 * g.dpr;
      const full = QNChords.label(v.s, mode, shift);
      const tm = (Math.max(v.s.t0, t0) + Math.min(v.s.t1, t1)) / 2;
      const bi = Math.min(n - 1, Math.floor((tm - t0) / barDur));
      const mc = markerColorAt(tm);
      const on = bi < played ? textOn(mc || accent) : "rgba(255,255,255,0.88)";
      if (v.s.u && v.x1 - v.x0 > 12 * g.dpr) {                    // 手動で直したコードには左上に小さな点
        cx.fillStyle = on;
        cx.beginPath();
        cx.arc(v.x0 + 6 * g.dpr, by + 6 * g.dpr, 2 * g.dpr, 0, 6.2832);
        cx.fill();
      }
      cx.font = f1;
      let label = full;
      if (cx.measureText(label).width > avail) {
        label = full.split("/")[0];                               // 入りきらない時はオンベースを省く
        if (cx.measureText(label).width > avail && mode === "letter") label = label.match(/^[A-G][#b]?/)[0];   // それでも駄目なら根音だけ
        if (cx.measureText(label).width > avail) continue;
      }
      const cxm = (v.x0 + v.x1) / 2;
      let alt = "";
      if (twoLine && v.s.alts && v.s.alts.length) {
        cx.font = f2;
        for (let k = 0; k < v.s.alts.length && k < 2; k++) {
          const cand = alt ? alt + " " + QNChords.label(v.s.alts[k], mode, shift) : QNChords.label(v.s.alts[k], mode, shift);
          if (cx.measureText(cand).width > avail) break;
          alt = cand;
        }
      }
      cx.font = f1;
      cx.fillStyle = on;
      if (alt) {
        cx.fillText(label, cxm, by + bh * 0.36);
        cx.font = f2;
        cx.globalAlpha = 0.6;
        cx.fillText(alt, cxm, by + bh * 0.74);
        cx.globalAlpha = 1;
      } else {
        cx.fillText(label, cxm, by + bh / 2 + g.dpr * 0.5);
      }
    }
  }

  function chordAlts() { return typeof QNChords !== "undefined" && QNChords.getAlts(); }

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

    const sig = accent + "|" + ms + "|" + peaksVer + "|" + g.nBars + "|" + g.barW + "|" + g.barH + "|" + g.dpr + "|" + sec + "|" + waveShape + "|" + (window.__qnWaveformDrawCount || 0) + "|" + viewMode + "|" + keyShift() + "|" + (typeof QNChords !== "undefined" ? QNChords.version() : 0);
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

  function getRows() { return rowsVisible; }

  function setRows(n) {
    if (ROWS_OPTIONS.indexOf(n) < 0 || n === rowsVisible) return;
    rowsVisible = n;
    try { localStorage.setItem(ROWS_KEY, String(n)); } catch (e) {}
    geomDirty = true;
    if (dur) { const mx = Math.max(1, maxSec()); if (sec > mx) setSec(mx); } // 行数が増えて上限が縮んだら、今のバー長を上限へ丸める
    notifyRange();
    draw(true);
    if (dur && scrollEl.clientHeight) scrollEl.scrollTop = Math.max(0, playheadScrollTarget(audio.currentTime || 0));
    resumeFollow();
  }

  function setSec(n) {
    n = Math.round(n);
    if (!(n >= 1) || n > Math.max(1, maxSec()) || n === sec) return;
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

  // Rows=Auto(CSS既定の寸法)で画面に入る行数。Rows指定中でも既定寸法で数える
  function autoVis() {
    if (!scrollEl || !scrollEl.clientHeight) return 0;
    const h0 = containerEl.style.getPropertyValue("--qn-bar-h"), g0 = containerEl.style.getPropertyValue("--qn-bar-gap");
    containerEl.style.removeProperty("--qn-bar-h");
    containerEl.style.removeProperty("--qn-bar-gap");
    const cs = getComputedStyle(containerEl);
    const num = (name, def) => { const v = parseFloat(cs.getPropertyValue(name)); return isFinite(v) ? v : def; };
    const bh = num("--qn-bar-h", 44), gp = num("--qn-bar-gap", 28), pt = num("--qn-bar-pad-top", 26), pb = num("--qn-bar-pad-bottom", 12);
    if (h0) containerEl.style.setProperty("--qn-bar-h", h0);
    if (g0) containerEl.style.setProperty("--qn-bar-gap", g0);
    return Math.max(1, Math.floor((scrollEl.clientHeight - pt - pb + gp) / (bh + gp)));
  }
  function maxSec() {
    if (!dur) return 240;
    const v = rowsVisible > 0 ? rowsVisible : autoVis(); // Rows指定ならその本数、Autoなら画面に入る本数
    return v ? Math.max(2, Math.ceil(dur / v - 1e-6)) : 240;
  }
  // スライダー/ステッパーの値(1秒刻み、1〜maxSec)。現在値が範囲外なら末尾に足して表示を崩さない
  function secValues() {
    const mx = Math.max(1, maxSec()), a = [];
    for (let i = 1; i <= mx; i++) a.push(i);
    if (sec > mx) a.push(sec);
    return a;
  }
  function notifyRange() { if (typeof window.qnBarStripSync === "function") window.qnBarStripSync(); }

  // Fit: 曲全体が今の画面に収まる最小のバー長(Rows指定があればその本数、Autoなら画面に入る本数)
  function fit() {
    syncDur();
    if (!dur) return;
    if (geomDirty) measure();
    const vis = rowsVisible > 0 ? rowsVisible : Math.max(1, Math.floor((g.viewH - g.padTop - g.padBottom + g.gap) / g.pitch));
    setSec(Math.max(1, Math.min(maxSec(), Math.ceil(dur / vis - 1e-6))));
    scrollEl.scrollTop = 0;
  }

  function getWaveShape() { return waveShape; }
  function setWaveShape(v) {
    waveShape = v === "bottom" ? "bottom" : "mirror";
    try { localStorage.setItem(WAVE_KEY, waveShape); } catch (e) {}
    peakCache.clear(); geomDirty = true;
  }
  function getFollow() { return followOn; }

  // 表示モード(wave/chord)。chordにした時だけコード解析を始める。選択は端末に保存
  function getViewMode() { return viewMode; }
  function getEditMode() { return editMode; }
  function setEditMode(on) {
    on = !!on && viewMode !== "wave";
    if (on === editMode) return;
    editMode = on;
    containerEl.classList.toggle("qn-chord-editing", on);
    if (!on && typeof QNChordEdit !== "undefined") QNChordEdit.close();
    if (typeof window.qnBarStripSync === "function") window.qnBarStripSync();
  }
  function setViewMode(v) {
    v = v === "chord" || v === "degree" ? v : "wave";
    if (v === viewMode) return;
    viewMode = v;
    if (v === "wave") setEditMode(false);
    try { localStorage.setItem(VIEW_KEY, v); } catch (e) {}
    if (v !== "wave" && typeof QNChords !== "undefined") QNChords.ensure();
    draw(true);
    if (typeof window.qnBarViewSync === "function") window.qnBarViewSync();
  }

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
        roRaf = requestAnimationFrame(() => { roRaf = 0; draw(true); notifyRange(); });
      }).observe(scrollEl);
    }
    window.addEventListener("resize", () => { geomDirty = true; });
  }
  // コード修正モード: 行のタップ/長押し/スワイプ開始を、他のハンドラ(シーク・マーカー追加。player-ui-shared.js)より先に奪って修正ポップアップを開く。マーカーの線・A/B旗の操作は奪わない
  if (rowsEl) {
    const editHit = e => editMode && viewMode !== "wave" && !(e.target.closest && e.target.closest(".vbar-line, .vbar-label, .vbar-ab-pt"));
    rowsEl.addEventListener("pointerdown", e => { if (editHit(e)) e.stopPropagation(); }, true);
    rowsEl.addEventListener("click", e => {
      if (!editHit(e)) return;
      e.stopPropagation();
      e.preventDefault();
      const bar = e.target.closest ? e.target.closest(".vbar") : null;
      if (!bar || typeof QNChordEdit === "undefined") return;
      const t = timeInRow(bar, parseInt(bar.dataset.row, 10), e.clientX);
      if (t !== null) QNChordEdit.open(t, e.clientX, e.clientY);
    }, true);
  }
  if (typeof audio !== "undefined" && audio) {
    audio.addEventListener("seeked", resumeFollow);
    audio.addEventListener("play", resumeFollow);
  }

  return {
    secValues,
    fmtSec,
    fit,
    getSec,
    setSec,
    ROWS_OPTIONS,
    getRows,
    setRows,
    sync: syncDur,
    draw,
    markGeomDirty() { geomDirty = true; },
    ensureRows,
    onTrackLoaded,
    createGearButton,
    setOpenSettings(fn) { openSettingsFn = fn; },
    getFollow, setFollow, getPause, setPause, getWaveShape, setWaveShape, getViewMode, setViewMode, getEditMode, setEditMode,
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
