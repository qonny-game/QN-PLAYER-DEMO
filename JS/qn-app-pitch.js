// qn-app-pitch.js — PITCHアプリ(ピッチロール表示・録音・再生・スコア判定・Recordings)。QNApps.register({id:"pitch"})。
// idは使わずdata-pt属性+qnPt*名前空間。UI部品はPLAYER/YouTube/TUNERと共通(.control-card/.mini-reset-btn/.glow-switch/.playlistItem/.panel-fab-btn/下段バー)。スタイルはCSS/style-pitch.cssの.qn-pt*。
// 【規約】マイク・録音・再生は表示中だけ。onHideで録音を止め再生を一時停止する(未保存の録音はメモリに残りSaveできる)。マイクは1回のgetUserMediaをMediaRecorderと解析で共有。
// 【規約】描画は「見えている範囲だけ」を描く仮想スクロール(canvasはビューポート幅。iOSのcanvas面積上限対策)。録音中の再描画は約10fps、再生中のカーソル更新は約15fps。値が変わった時だけDOMを書く(GOTCHAS §3)。
// 【規約】IndexedDBの録音レコードは再putしない(GOTCHAS §1)。改名はlocalStorage(qn_pitch_rec_meta)。保存キー: qn_pitch_*(フィルタはqn-pitch-filters.js)。DB: qn_pitch_db/recordings
(function () {
  "use strict";

  var core = window.QNPitchCore, F = window.QNPitchFilters;
  var KEY_COLLAPSE = "qn_pitch_panel_collapsed", KEY_META = "qn_pitch_rec_meta";
  var DB_NAME = "qn_pitch_db", STORE = "recordings";

  var FULL = { min: 24, max: 108 }, VISIBLE_ROWS = 22, PPS = 60, INIT_SEC = 30, FOCUS = { min: 48, max: 72 };
  var KEY_W = 52;            // 鍵盤ラベル列の幅(px)。style-pitch.cssの--qn-pt-keywと一致させる
  var REC_REDRAW_MS = 100, TICK_MS = 66;
  var JUST_CENTS = 12, CLOSE_CENTS = 30; // 歌/演奏の音程ズレ判定(しきい値)。±12¢以内=just / ±30¢以内=close / それ以外=far

  var PITCH_ICON = '<path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>';
  var ICON = {
    rec: '<circle cx="12" cy="12" r="8"/>',
    stop: '<path d="M6 6h12v12H6z"/>',
    play: '<path d="M8 5v14l11-7z"/>',
    pause: '<path d="M6 5h4v14H6zm8 0h4v14h-4z"/>',
    save: '<path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>',
    clear: '<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>',
    filters: '<path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>',
    list: '<path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>',
    keyboard: '<path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM11 8h2v2h-2V8zM11 11h2v2h-2v-2zM8 8h2v2H8V8zM8 11h2v2H8v-2zM5 8h2v2H5V8zm0 3h2v2H5v-2zm10 6H9v-2h6v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/>',
    pencil: '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>',
    close: '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>'
  };

  // ---------- 状態 ----------
  var root = null, refs = {}, shown = false;
  var panelState = null, saveReturn = null;
  var track = [];                 // 表示中のピッチ点列 [{t,midi,cents,rms,voiced}]
  var recording = false, starting = false, recStart = 0, lastRecDraw = 0;
  var micSession = null, recorder = null, chunks = [];
  var pending = null;             // 未保存の録音 {blob,track,duration,name}
  var playback = null;            // {id,audio,url,duration,name,score}
  var tickTimer = 0, lastCt = -1, loadToken = 0;
  var rowH = 22, canvasH = 0, cw = 0, totalSec = INIT_SEC, focusDone = false;
  var ctx = null, volCtx = null, rafPending = false;
  var colors = { accent: "#3b82f6", just: "#34d399", close: "#f59e0b", far: "#ef4444" }, colorsDirty = true;
  var themeObs = null, resizeObs = null, resizeRaf = 0;
  var clearArmed = 0, clearTimer = 0;
  var recList = [], names = loadMeta();
  var editMode = false, selected = {};

  // ---------- 小物 ----------
  function haptic() { if (typeof hapticTap === "function") { try { hapticTap(); } catch (e) {} } }
  function toast(t) { if (window.QNApps) window.QNApps.toast(t); }
  function isSp() { return window.matchMedia("(max-width: 900px)").matches; }
  function setText(el, v) { if (el && el._v !== v) { el._v = v; el.textContent = v; } }
  function setAttr(el, name, v) {
    if (!el) return;
    var k = "_a" + name;
    if (el[k] === v) return;
    el[k] = v;
    if (v === null || v === false) el.removeAttribute(name); else el.setAttribute(name, v === true ? "" : v);
  }
  function setRangeProgress(input) {
    var min = parseFloat(input.min) || 0, max = parseFloat(input.max) || 100;
    input.style.setProperty("--range-progress", String(max > min ? ((input.value - min) / (max - min)) * 100 : 0));
  }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function fmtTime(sec) { sec = Math.max(0, sec || 0); return Math.floor(sec / 60) + ":" + pad2(Math.floor(sec % 60)); }
  function fmtDateTime(ts) { var d = new Date(ts); return pad2(d.getMonth() + 1) + "/" + pad2(d.getDate()) + " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes()); }
  function defaultName() { return "REC " + fmtDateTime(Date.now()); }
  function r2(v) { return Math.round(v * 100) / 100; }
  function r3(v) { return Math.round(v * 1000) / 1000; }
  function r4(v) { return Math.round(v * 10000) / 10000; }
  function centsState(cents) { var a = Math.abs(cents); return a <= JUST_CENTS ? "just" : (a <= CLOSE_CENTS ? "close" : "far"); }
  function syncWake() {
    try { if (window.QNWake) window.QNWake.set("pitch", !!(recording || (playback && !playback.audio.paused))); } catch (e) {}
  }

  // 改名はlocalStorage(IndexedDBのレコードは再putしない)
  function loadMeta() { try { var o = JSON.parse(localStorage.getItem(KEY_META) || "{}"); return (o && typeof o === "object") ? o : {}; } catch (e) { return {}; } }
  function saveMeta() { try { localStorage.setItem(KEY_META, JSON.stringify(names)); } catch (e) {} }
  function nameOf(rec) { return names[rec.id] || rec.name || ""; }

  // ---------- IndexedDB(録音の実体) ----------
  var dbPromise = null;
  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true }).createIndex("createdAt", "createdAt");
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { dbPromise = null; reject(req.error); };
    });
    return dbPromise;
  }
  function dbAdd(rec) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var req = db.transaction(STORE, "readwrite").objectStore(STORE).add(rec);
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }
  function dbGet(id) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var req = db.transaction(STORE).objectStore(STORE).get(id);
        req.onsuccess = function () { resolve(req.result || null); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }
  function dbDelete(ids) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readwrite"), st = tx.objectStore(STORE);
        ids.forEach(function (id) { st.delete(id); });
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }
  // 一覧はメタ情報だけ保持(音声・点列は選んだ時にdbGet)
  function dbList() {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var out = [], req = db.transaction(STORE).objectStore(STORE).openCursor();
        req.onsuccess = function () {
          var c = req.result;
          if (c) {
            var v = c.value;
            out.push({ id: v.id, name: v.name, createdAt: v.createdAt, duration: v.duration, score: v.score, size: v.blob ? v.blob.size : 0 });
            c.continue();
          } else {
            out.sort(function (a, b) { return b.createdAt - a.createdAt; });
            resolve(out);
          }
        };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  // ---------- 画面の骨組み ----------
  function bbtn(ref, cls, icon, label, title) {
    return '<button type="button" data-pt="' + ref + '" class="qn-pt-bbtn' + (cls ? " " + cls : "") + '" title="' + title + '">' +
      '<svg viewBox="0 0 24 24">' + icon + '</svg><span>' + label + '</span></button>';
  }
  var BAR_HTML =
    '<div class="qn-pt-bar">' +
      '<div class="qn-pt-bgroup">' + bbtn("recBtn", "center", ICON.rec, "Rec", "録音 開始/停止 (R)") + '</div>' +
      '<div class="qn-pt-bdiv"></div>' +
      '<div class="qn-pt-bgroup">' +
        bbtn("playBtn", "", ICON.play, "Play", "再生/一時停止 (Space)") +
        bbtn("saveBtn", "", ICON.save, "Save", "録音を保存 (S)") +
        bbtn("clearBtn", "", ICON.clear, "Clear", "ピッチロールを消去(2回タップ)") +
      '</div>' +
    '</div>';

  var TEMPLATE =
    '<div class="qn-pt" data-panel="recordings">' +
      '<aside class="qn-pt-panel">' +
        '<div class="qn-pt-panel-header"><span class="pcv2-panel-header-title" data-pt="panelTitle">Recordings</span></div>' +
        '<div class="qn-pt-panel-scroll">' +
          '<section class="qn-pt-sec qn-pt-sec-filters"><div class="control-list" data-pt="filtersBox"></div></section>' +
          '<section class="qn-pt-sec qn-pt-sec-recordings">' +
            '<div class="qn-pt-recbox" data-pt="recBox"></div>' +
            '<p class="qn-pt-empty" data-pt="recEmpty" hidden>まだ録音がありません。下のRecで録音して、Saveで保存できます。</p>' +
          '</section>' +
          '<section class="qn-pt-sec qn-pt-sec-save">' +
            '<div class="export-section"><label class="export-section-label">Name</label>' +
              '<input type="text" class="export-filename-input" data-pt="saveName" maxlength="30" autocomplete="off"></div>' +
            '<div class="qn-pt-save-footer">' +
              '<button type="button" class="export-cancel-btn" data-pt="saveCancel">Cancel</button>' +
              '<button type="button" class="export-run-btn" data-pt="saveOk">Save</button>' +
            '</div>' +
          '</section>' +
          // Backup / Import: 本体共通画面を借りる(実体player-track-backup.js。setPanel()がqnBackupMountInto()で差し込む)
          '<section class="qn-pt-sec qn-pt-sec-backup"><div data-pt="bkHost"></div></section>' +
          '<section class="qn-pt-sec qn-pt-sec-import"><div data-pt="imHost"></div></section>' +
          '<section class="qn-pt-sec qn-pt-sec-keyboard"><div data-pt="kbdBox"></div></section>' +
        '</div>' +
        '<div class="qn-pt-fab">' +
          '<button type="button" class="panel-fab-btn panel-fab-delete-btn" data-pt="fabDel" disabled>' +
            '<svg viewBox="0 0 24 24">' + ICON.clear + '</svg><span>Delete</span></button>' +
          '<button type="button" class="panel-fab-btn panel-edit-btn" data-pt="fabEdit" title="Edit">' +
            '<svg viewBox="0 0 24 24">' + ICON.pencil + '</svg><span data-pt="fabEditLabel">EDIT</span></button>' +
        '</div>' +
      '</aside>' +
      '<section class="qn-pt-stage">' +
        '<div class="qn-pt-readout">' +
          '<div class="qn-mic-pill" data-pt="micPill" hidden><i class="qn-mic-dot"></i><span>REC</span><span class="qn-mic-lv"><b></b><b></b><b></b><b></b><b></b></span></div>' +
          '<div class="qn-pt-note" data-pt="note">--</div>' +
          '<div class="qn-pt-cents" data-pt="cents">-- ¢</div>' +
          '<div class="qn-pt-hint" data-pt="hint"></div>' +
        '</div>' +
        '<div class="qn-pt-roll" data-pt="roll">' +
          '<div class="qn-pt-scroll" data-pt="scroll"><div class="qn-pt-content" data-pt="content">' +
            '<div class="qn-pt-keys" data-pt="keys"></div><canvas class="qn-pt-canvas" data-pt="canvas"></canvas>' +
          '</div></div>' +
        '</div>' +
        '<div class="qn-pt-vol"><div class="qn-pt-vol-label">VOL</div><canvas data-pt="volCanvas"></canvas></div>' +
        '<div class="qn-pt-pb" data-pt="pb" hidden>' +
          '<div class="qn-pt-pb-top"><span class="qn-pt-pb-name" data-pt="pbName"></span>' +
            '<span class="qn-pt-pb-score" data-pt="pbScore"></span><span class="qn-pt-pb-time" data-pt="pbTime">0:00 / 0:00</span>' +
            '<button type="button" class="qn-pt-pb-close" data-pt="pbClose" title="閉じる"><svg viewBox="0 0 24 24">' + ICON.close + '</svg></button></div>' +
          '<div class="qn-pt-pb-track" data-pt="pbTrack"><div class="qn-pt-pb-fill" data-pt="pbFill"></div></div>' +
        '</div>' +
      '</section>' +
      BAR_HTML +
    '</div>';

  // ---------- ピッチロール(仮想スクロール: canvasは見えている範囲だけ) ----------
  function totalRows() { return FULL.max - FULL.min + 1; }
  function midiToY(m) { return (FULL.max - Math.max(FULL.min, Math.min(FULL.max, m))) * rowH; }

  function buildKeys() {
    var frag = document.createDocumentFragment();
    for (var m = FULL.min; m <= FULL.max; m++) {
      var nn = core.NOTE_NAMES[((m % 12) + 12) % 12];
      var d = document.createElement("div");
      d.className = "qn-pt-key" + (nn.indexOf("#") >= 0 ? " sharp" : "") + (nn === "C" ? " is-c" : "");
      d.style.top = midiToY(m) + "px";
      d.style.height = rowH + "px";
      d.textContent = core.midiToNoteName(m);
      frag.appendChild(d);
    }
    refs.keys.textContent = "";
    refs.keys.appendChild(frag);
    refs.keys.style.height = canvasH + "px";
  }

  function applyContentWidth() {
    var minSec = Math.max(INIT_SEC, cw / PPS + 1);
    if (totalSec < minSec) totalSec = minSec;
    refs.content.style.width = (KEY_W + Math.ceil(totalSec * PPS)) + "px";
  }
  function ensureSec(t) {
    if (t + 5 > totalSec) { totalSec = t + 20; applyContentWidth(); }
  }

  function scrollToRange(range) {
    var h = refs.scroll.clientHeight;
    var y = midiToY((range.min + range.max) / 2) - h / 2 + rowH / 2;
    refs.scroll.scrollTop = Math.max(0, Math.min(canvasH - h, y));
  }

  // 非表示中(clientが0)は何もしない。表示された時にResizeObserver/onShowから再実行される
  function setupSize() {
    if (!root || !refs.scroll) return;
    var h = refs.scroll.clientHeight, w = refs.scroll.clientWidth;
    if (!h || !w) return;
    var newRow = Math.max(14, Math.floor(h / VISIBLE_ROWS));
    var newCw = Math.max(60, w - KEY_W);
    var rowChanged = newRow !== rowH || !canvasH;
    if (!rowChanged && newCw === cw) return;
    var ratio = canvasH ? newRow / rowH : 1;
    rowH = newRow; canvasH = totalRows() * rowH; cw = newCw;
    refs.canvas.width = cw; refs.canvas.height = canvasH;
    refs.canvas.style.width = cw + "px"; refs.canvas.style.height = canvasH + "px";
    refs.content.style.height = canvasH + "px";
    var vh = refs.volCanvas.parentNode.clientHeight || 56;
    refs.volCanvas.width = cw; refs.volCanvas.height = vh;
    refs.volCanvas.style.width = cw + "px"; refs.volCanvas.style.height = vh + "px";
    if (rowChanged) buildKeys();
    applyContentWidth();
    if (!focusDone) { focusDone = true; scrollToRange(FOCUS); }
    else if (ratio !== 1) refs.scroll.scrollTop = refs.scroll.scrollTop * ratio;
    redraw();
  }

  function readColors() {
    colorsDirty = false;
    try {
      var cs = getComputedStyle(document.body);
      var a = cs.getPropertyValue("--accent-primary").trim();
      if (a) colors.accent = a;
      var ps = getComputedStyle(root.firstChild);
      colors.just = ps.getPropertyValue("--qn-pt-just").trim() || colors.just;
      colors.close = ps.getPropertyValue("--qn-pt-close").trim() || colors.close;
      colors.far = ps.getPropertyValue("--danger").trim() || colors.far;
    } catch (e) {}
  }

  function lowerBound(arr, t) {
    var lo = 0, hi = arr.length;
    while (lo < hi) { var mid = (lo + hi) >> 1; if (arr[mid].t < t) lo = mid + 1; else hi = mid; }
    return lo;
  }

  function scheduleRedraw() {
    if (rafPending || !shown) return;
    rafPending = true;
    requestAnimationFrame(function () { rafPending = false; redraw(); });
  }

  function redraw(forceLeft) {
    if (!ctx || !cw || !canvasH || !shown) return;
    if (colorsDirty) readColors();
    var left = forceLeft != null ? forceLeft : refs.scroll.scrollLeft;
    var m, y, i, p, x;

    // 背景(行)
    ctx.clearRect(0, 0, cw, canvasH);
    for (m = FULL.min; m <= FULL.max; m++) {
      y = midiToY(m);
      var nn = core.NOTE_NAMES[((m % 12) + 12) % 12];
      ctx.fillStyle = nn.indexOf("#") >= 0 ? "rgba(255,255,255,0.018)" : "rgba(255,255,255,0.05)";
      ctx.fillRect(0, y, cw, rowH);
      ctx.fillStyle = nn === "C" ? colors.accent : "rgba(255,255,255,0.07)";
      ctx.globalAlpha = nn === "C" ? 0.45 : 1;
      ctx.fillRect(0, y, cw, 1);
      ctx.globalAlpha = 1;
    }

    var vw = volCtx ? refs.volCanvas.width : 0, vh = volCtx ? refs.volCanvas.height : 0;
    if (volCtx) {
      volCtx.clearRect(0, 0, vw, vh);
      volCtx.fillStyle = "rgba(255,255,255,0.08)";
      volCtx.fillRect(0, vh - 1, vw, 1);
    }

    if (track.length >= 2) {
      var i0 = lowerBound(track, left / PPS - 2), i1 = lowerBound(track, (left + cw) / PPS + 2);
      var raw = track.slice(i0, i1);
      var tr = F.applyFilters(raw);

      var vib = F.detectVibratoRegions(tr);
      ctx.fillStyle = "rgba(167,139,250,0.18)";
      vib.forEach(function (r) { ctx.fillRect(r.startT * PPS - left, 0, Math.max(2, (r.endT - r.startT) * PPS), canvasH); });
      var dr = F.detectDriftRegions(tr);
      ctx.fillStyle = "rgba(248,113,113,0.22)";
      dr.forEach(function (r) { ctx.fillRect(r.startT * PPS - left, 0, Math.max(2, (r.endT - r.startT) * PPS), canvasH); });

      ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = colors.accent;
      ctx.beginPath();
      var started = false;
      for (i = 0; i < tr.length; i++) {
        p = tr[i];
        if (!p.voiced) { started = false; continue; }
        x = p.t * PPS - left; y = midiToY(p.midi) + rowH / 2;
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
      ctx.stroke();

      var pj = new Path2D(), pc = new Path2D(), pf = new Path2D();
      for (i = 0; i < tr.length; i++) {
        p = tr[i];
        if (!p.voiced) continue;
        x = p.t * PPS - left; y = midiToY(p.midi) + rowH / 2;
        var a = Math.abs(p.cents);
        (a > CLOSE_CENTS ? pf : (a > JUST_CENTS ? pc : pj)).rect(x - 1.5, y - 1.5, 3, 3);
      }
      ctx.fillStyle = colors.just; ctx.fill(pj);
      ctx.fillStyle = colors.close; ctx.fill(pc);
      ctx.fillStyle = colors.far; ctx.fill(pf);

      if (volCtx) {
        volCtx.lineWidth = 1.5; volCtx.lineCap = "round"; volCtx.strokeStyle = colors.accent;
        volCtx.beginPath();
        for (i = 0; i < raw.length; i++) {
          p = raw[i];
          var lv = Math.max(0, Math.min(1, (p.rms || 0) * 4));
          x = p.t * PPS - left; y = vh - lv * (vh - 2) - 1;
          if (i === 0) volCtx.moveTo(x, y); else volCtx.lineTo(x, y);
        }
        volCtx.stroke();
      }
    }

    if (playback) {
      x = playback.audio.currentTime * PPS - left;
      if (x >= -2 && x <= cw + 2) {
        ctx.fillStyle = colors.accent;
        ctx.fillRect(x - 1, 0, 2, canvasH);
        if (volCtx) { volCtx.fillStyle = colors.accent; volCtx.fillRect(x - 1, 0, 2, vh); }
      }
    }
  }

  // ---------- 表示・ボタン状態 ----------
  var hintText = "";
  function setHint(text, live) {
    hintText = text;
    setText(refs.hint, text);
    setAttr(refs.hint, "data-live", live ? "1" : null);
  }
  function idleHint() {
    if (pending) return "録音完了 — Playで再生、保存はSave";
    return "Recで録音を開始。歌う・弾くと音程がロールに描かれます";
  }

  var uiRec = null, uiPlay = null;
  function updateButtons() {
    if (!refs.recBtn) return;
    if (uiRec !== recording) {
      uiRec = recording;
      refs.recBtn.classList.toggle("is-rec", recording);
      refs.recBtn.querySelector("svg").innerHTML = recording ? ICON.stop : ICON.rec;
      setText(refs.recBtn.querySelector("span"), recording ? "Stop" : "Rec");
    }
    var playing = !!(playback && !playback.audio.paused);
    if (uiPlay !== playing) {
      uiPlay = playing;
      refs.playBtn.querySelector("svg").innerHTML = playing ? ICON.pause : ICON.play;
      setText(refs.playBtn.querySelector("span"), playing ? "Pause" : "Play");
    }
    refs.micPill.hidden = !recording;
    if (!recording) window.QNApps.setMicLevel(refs.micPill, 0);
    window.QNApps.setMic(recording);
    refs.playBtn.disabled = recording || !(playback || pending);
    refs.saveBtn.disabled = recording || !pending;
    refs.clearBtn.disabled = recording || !(track.length || playback || pending);
    if (!clearArmed) setText(refs.clearBtn.querySelector("span"), "Clear");
    syncWake();
  }

  function showPb() {
    var on = !!playback;
    refs.pb.hidden = !on;
    if (!on) return;
    setText(refs.pbName, playback.name);
    var sc = F.calcScore(F.applyFilters(track));
    setText(refs.pbScore, sc === null ? "" : "SCORE " + sc + "%");
    setText(refs.pbTime, fmtTime(0) + " / " + fmtTime(playback.duration));
    refs.pbFill.style.width = "0%"; refs.pbFill._w = "0";
  }
  function refreshScore() {
    if (!playback) return;
    var sc = F.calcScore(F.applyFilters(track));
    setText(refs.pbScore, sc === null ? "" : "SCORE " + sc + "%");
  }

  // ---------- 録音 ----------
  function pickMime() {
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) return "";
    var c = ["audio/webm", "audio/mp4"];
    for (var i = 0; i < c.length; i++) if (MediaRecorder.isTypeSupported(c[i])) return c[i];
    return "";
  }

  function onFrame(res) {
    if (!recording) return;
    var now = performance.now(), t = (now - recStart) / 1000, freq = res.freq;
    window.QNApps.setMicLevel(refs.micPill, res.rms < 0.005 ? 0 : Math.min(5, 1 + Math.floor(res.rms * 15)));
    if (freq > 50 && freq < 1200) {
      var midi = core.freqToMidi(freq), rm = Math.round(midi), cents = Math.round((midi - rm) * 100);
      track.push({ t: r3(t), midi: r2(midi), cents: cents, rms: r4(res.rms), voiced: true });
      setText(refs.note, core.midiToNoteName(rm));
      setText(refs.cents, (cents > 0 ? "+" : "") + cents + " ¢");
      setAttr(refs.cents, "data-state", centsState(cents));
    } else {
      track.push({ t: r3(t), midi: 0, cents: 0, rms: r4(res.rms), voiced: false });
      setText(refs.note, "--"); setText(refs.cents, "-- ¢"); setAttr(refs.cents, "data-state", null);
    }
    if (now - lastRecDraw >= REC_REDRAW_MS) {
      lastRecDraw = now;
      ensureSec(t);
      refs.scroll.scrollLeft = Math.max(0, t * PPS - cw + 120);
      redraw(refs.scroll.scrollLeft);
    }
  }

  async function startRec() {
    if (recording || starting) return;
    starting = true;
    stopPlayback(true);
    var session = core.createAnalysisSession({ fftSize: 2048, onFrame: onFrame });
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error("nomedia");
      await session.startFromMic({ audio: true });
    } catch (err) {
      starting = false;
      session.stop();
      var name = err && err.name;
      setHint((err && err.message === "nomedia") ? "マイクを使えません（HTTPSで開いてください）"
        : (name === "NotFoundError" ? "マイクが見つかりません" : "マイクへのアクセスが許可されませんでした"), false);
      updateButtons();
      return;
    }
    starting = false;
    if (!shown) { session.stop(); return; }
    var rec;
    try {
      var mime = pickMime();
      rec = new MediaRecorder(session.stream, mime ? { mimeType: mime } : undefined);
    } catch (e) {
      session.stop();
      setHint("このブラウザは録音に対応していません", false);
      updateButtons();
      return;
    }
    chunks = [];
    rec.ondataavailable = function (e) { if (e.data && e.data.size > 0) chunks.push(e.data); };
    pending = null;
    track = [];
    totalSec = INIT_SEC;
    applyContentWidth();
    refs.scroll.scrollLeft = 0;
    micSession = session; recorder = rec;
    recStart = performance.now(); lastRecDraw = 0;
    recording = true;
    rec.start(250);
    setHint("録音中...", true);
    redraw(0);
    updateButtons();
  }

  async function endRec() {
    if (!recording) return;
    recording = false;
    var rec = recorder, ms = micSession;
    recorder = null; micSession = null;
    var finalTrack = track.slice();
    updateButtons();
    await new Promise(function (resolve) {
      if (!rec || rec.state === "inactive") { resolve(); return; }
      rec.onstop = resolve;
      try { rec.stop(); } catch (e) { resolve(); }
    });
    if (ms) ms.stop();
    setText(refs.note, "--"); setText(refs.cents, "-- ¢"); setAttr(refs.cents, "data-state", null);
    var blob = new Blob(chunks, { type: (chunks[0] && chunks[0].type) || (rec && rec.mimeType) || "audio/webm" });
    chunks = [];
    if (!finalTrack.length || !blob.size) {
      setHint("録音できませんでした", false);
      updateButtons();
      return;
    }
    var duration = finalTrack[finalTrack.length - 1].t;
    pending = { blob: blob, track: finalTrack, duration: duration, name: defaultName() };
    loadPlayback({ id: null, name: pending.name, blob: blob, track: finalTrack, duration: duration }, false);
    setHint(idleHint(), false);
    updateButtons();
  }

  function toggleRec() { if (recording) endRec(); else startRec(); }

  // ---------- 再生 ----------
  function loadPlayback(rec, autoplay) {
    stopPlayback(true);
    var url = URL.createObjectURL(rec.blob);
    var audio = new Audio(url);
    playback = { id: rec.id, audio: audio, url: url, duration: rec.duration, name: rec.name };
    audio.addEventListener("ended", onEnded);
    track = rec.track;
    totalSec = Math.max(INIT_SEC, rec.duration + 5);
    applyContentWidth();
    refs.scroll.scrollLeft = 0;
    lastCt = -1;
    showPb();
    redraw(0);
    renderList();
    if (autoplay) playAudio(); else updateButtons();
  }

  function playAudio() {
    if (!playback) return;
    var pr = playback.audio.play();
    if (pr && pr.catch) pr.catch(function () {});
    startTick();
    updateButtons();
  }
  function pauseAudio() {
    if (!playback) return;
    playback.audio.pause();
    stopTick();
    updateButtons();
  }
  function onEnded() {
    stopTick();
    updateButtons();
    redraw();
  }
  function togglePlay() {
    if (recording) return;
    if (playback) { if (playback.audio.paused) playAudio(); else pauseAudio(); return; }
    if (pending) {
      loadPlayback({ id: null, name: pending.name, blob: pending.blob, track: pending.track, duration: pending.duration }, true);
    }
  }

  function startTick() { if (!tickTimer) tickTimer = setInterval(tick, TICK_MS); }
  function stopTick() { if (tickTimer) { clearInterval(tickTimer); tickTimer = 0; } }
  function tick() {
    if (!playback || document.hidden) return;
    var ct = playback.audio.currentTime;
    if (ct === lastCt) return;
    lastCt = ct;
    var dur = playback.duration || 1;
    var w = Math.min(100, ct / dur * 100).toFixed(1);
    if (refs.pbFill._w !== w) { refs.pbFill._w = w; refs.pbFill.style.width = w + "%"; }
    setText(refs.pbTime, fmtTime(ct) + " / " + fmtTime(dur));
    var left = Math.max(0, ct * PPS - cw / 2);
    refs.scroll.scrollLeft = left;
    redraw(left);
  }

  // quiet=true: 再描画/一覧更新を省く(続けて別の処理が描画する時)
  function stopPlayback(quiet) {
    stopTick();
    if (playback) {
      try { playback.audio.pause(); } catch (e) {}
      playback.audio.removeEventListener("ended", onEnded);
      URL.revokeObjectURL(playback.url);
      playback = null;
    }
    refs.pb.hidden = true;
    if (!quiet) { redraw(); renderList(); }
    updateButtons();
  }

  function seekTo(e) {
    if (!playback) return;
    var rect = refs.pbTrack.getBoundingClientRect();
    var f = Math.max(0, Math.min(1, (e.clientX - rect.left) / (rect.width || 1)));
    playback.audio.currentTime = f * playback.duration;
    lastCt = -1;
    tick();
    if (playback.audio.paused) redraw();
  }

  // 一覧の行から再生。同じ行ならPlay/Pause。レコードはここで初めて読む(blob+点列)
  function playSaved(item) {
    if (playback && playback.id === item.id) { togglePlay(); return; }
    var token = ++loadToken;
    dbGet(item.id).then(function (rec) {
      if (token !== loadToken || !rec || recording) return;
      loadPlayback({ id: rec.id, name: nameOf(rec), blob: rec.blob, track: rec.track || [], duration: rec.duration || 0 }, true);
      if (isSp()) setPanel("none");
    }).catch(function () { toast("読み込みに失敗しました"); });
  }

  // ---------- 保存 / 消去 ----------
  function openSave() {
    if (!pending || recording) return;
    saveReturn = panelState;
    setPanel("save");
    refs.saveName.value = pending.name;
    try { refs.saveName.focus(); refs.saveName.select(); } catch (e) {}
  }
  function closeSave() {
    var back = saveReturn;
    saveReturn = null;
    setPanel(back && back !== "save" ? back : (isSp() ? "none" : "recordings"));
  }
  function doSave() {
    if (!pending) { closeSave(); return; }
    var nm = refs.saveName.value.trim() || pending.name;
    var sc = F.calcScore(F.applyFilters(pending.track));
    refs.saveOk.disabled = true;
    dbAdd({ name: nm, blob: pending.blob, track: pending.track, duration: pending.duration, score: sc, createdAt: Date.now() })
      .then(function (id) {
        refs.saveOk.disabled = false;
        pending = null;
        if (playback && playback.id === null) { playback.id = id; playback.name = nm; setText(refs.pbName, nm); }
        setHint(idleHint(), false);
        updateButtons();
        refreshList();
        closeSave();
        toast("Saved");
      }).catch(function () {
        refs.saveOk.disabled = false;
        toast("保存に失敗しました");
      });
  }

  function clearAll() {
    stopPlayback(true);
    track = []; pending = null;
    totalSec = INIT_SEC; applyContentWidth();
    refs.scroll.scrollLeft = 0;
    setText(refs.note, "--"); setText(refs.cents, "-- ¢"); setAttr(refs.cents, "data-state", null);
    setHint(idleHint(), false);
    redraw(0);
    renderList();
    updateButtons();
  }
  function onClear() {
    if (recording) return;
    if (!clearArmed) {
      clearArmed = 1;
      setText(refs.clearBtn.querySelector("span"), "Sure?");
      refs.clearBtn.classList.add("is-armed");
      clearTimer = setTimeout(disarmClear, 3000);
      return;
    }
    disarmClear();
    clearAll();
  }
  function disarmClear() {
    clearArmed = 0;
    if (clearTimer) { clearTimeout(clearTimer); clearTimer = 0; }
    if (refs.clearBtn) { refs.clearBtn.classList.remove("is-armed"); setText(refs.clearBtn.querySelector("span"), "Clear"); }
  }

  // ---------- Recordings一覧(PL共通の.playlistItem行 / EDIT→OK + 丸チェック削除はYouTubeアプリと同じ作り) ----------
  function selectedCount() { var n = 0; for (var k in selected) if (selected[k]) n++; return n; }
  function updateFab() {
    if (!root) return;
    var pt = root.firstChild;
    if (editMode) pt.setAttribute("data-edit", "recordings"); else pt.removeAttribute("data-edit");
    refs.fabEdit.classList.toggle("active", editMode);
    setText(refs.fabEditLabel, editMode ? "OK" : "EDIT");
    refs.fabDel.disabled = selectedCount() === 0;
  }
  function setEditMode(on) {
    editMode = !!on; selected = {};
    updateFab(); renderList();
  }
  function deleteSelected() {
    if (!editMode || !selectedCount()) return;
    refs.fabDel.disabled = true;
    var rows = refs.recBox.children, delay = 0, ids = [];
    for (var i = 0; i < rows.length; i++) {
      if (selected[rows[i].dataset.id]) { rows[i].classList.add("pcv2-row-deleting"); delay = 260; ids.push(parseInt(rows[i].dataset.id, 10)); }
    }
    refs.recBox.style.pointerEvents = "none";
    setTimeout(function () {
      refs.recBox.style.pointerEvents = "";
      dbDelete(ids).then(function () {
        ids.forEach(function (id) { delete names[id]; });
        saveMeta();
        if (playback && ids.indexOf(playback.id) >= 0) stopPlayback(true);
        recList = recList.filter(function (x) { return ids.indexOf(x.id) < 0; });
        selected = {};
        updateFab(); renderList(); redraw(); updateButtons();
      }).catch(function () {
        toast("削除に失敗しました");
        refs.fabDel.disabled = false;
      });
    }, delay);
  }

  function refreshList() {
    return dbList().then(function (list) { recList = list; renderList(); }).catch(function () { recList = []; renderList(); });
  }

  function makeEditableText(value, onCommit) {
    // PLAYER共通のmakeEditableText(player-playlist.js)をそのまま使う(YouTubeアプリと同じ)
    return window.makeEditableText(value, "playlist-title", "", onCommit);
  }

  function renderList() {
    if (!root || !refs.recBox) return;
    var box = refs.recBox;
    box.textContent = "";
    refs.recEmpty.hidden = recList.length > 0;
    for (var k in selected) if (!recList.some(function (r) { return String(r.id) === k; })) delete selected[k];
    var edit = editMode;

    recList.forEach(function (it) {
      var row = document.createElement("div");
      row.className = "playlistItem";
      row.dataset.id = String(it.id);
      if (playback && playback.id === it.id) row.classList.add("playing");
      if (!edit) {
        row.addEventListener("click", function (e) {
          if (e.target.closest("button, input, .playlist-editable-input")) return;
          playSaved(it);
        });
      }

      var thumb = document.createElement("div");
      thumb.className = "playlist-thumb";
      thumb.innerHTML = '<svg viewBox="0 0 24 24">' + ICON.play + '</svg>';
      row.appendChild(thumb);

      var info = document.createElement("div");
      info.className = "playlist-info-block";
      info.addEventListener("click", function (e) {
        if (e.target.closest(".playlist-editable-input, .playlist-hover-edit-btn")) return;
        if (!edit) playSaved(it);
      });
      var titleRow = document.createElement("div");
      titleRow.className = "playlist-title-row";
      var titleField = makeEditableText(nameOf(it), function (v) {
        if (!v) { renderList(); return; }
        names[it.id] = v; saveMeta();
        if (playback && playback.id === it.id) { playback.name = v; setText(refs.pbName, v); }
        renderList();
      });
      titleRow.appendChild(titleField);
      if (!edit) {
        var pen = document.createElement("button");
        pen.type = "button"; pen.className = "playlist-hover-edit-btn"; pen.title = "Edit title";
        pen.innerHTML = '<svg viewBox="0 0 24 24">' + ICON.pencil + '</svg>';
        pen.addEventListener("click", function (e) { e.stopPropagation(); titleField.startEdit(); });
        titleRow.appendChild(pen);
      }
      info.appendChild(titleRow);
      var meta = document.createElement("div");
      meta.className = "playlist-artist";
      meta.textContent = fmtDateTime(it.createdAt) + " ・ " + fmtTime(it.duration) + (it.score !== null && it.score !== undefined ? " ・ " + it.score + "%" : "");
      info.appendChild(meta);
      row.appendChild(info);

      if (edit) {
        var zone = document.createElement("div");
        zone.className = "playlist-del-zone";
        var del = document.createElement("button");
        del.type = "button"; del.className = "del-btn"; del.tabIndex = -1; del.textContent = "✕";
        if (selected[String(it.id)]) del.classList.add("pcv2-selected");
        zone.appendChild(del);
        zone.addEventListener("click", function (e) {
          e.stopPropagation();
          var key = String(it.id);
          if (selected[key]) { delete selected[key]; del.classList.remove("pcv2-selected"); }
          else { selected[key] = true; del.classList.add("pcv2-selected"); }
          updateFab();
        });
        row.appendChild(zone);
        titleField.startEdit();
      }
      box.appendChild(row);
    });
  }

  // ---------- Filtersパネル(設定はQNPitchFilters。ここは画面だけ) ----------
  var FILTER_UI = [
    { key: "jumpWindowMs", label: "急変スキップ：時間窓", unit: " ms", min: 0, max: 500, step: 10, dec: 0 },
    { key: "jumpSemitones", label: "急変スキップ：音程変化量", unit: " 半音", min: 0, max: 12, step: 1, dec: 0 },
    { key: "spikeRemoval", label: "スパイク除去", toggle: true },
    { key: "rmsThreshold", label: "音量ゲート：最低音量", unit: "", min: 0, max: 0.5, step: 0.01, dec: 2 },
    { key: "pitchDriftEnabled", label: "音程ズレハイライト", toggle: true, subs: [
      { key: "pitchDriftDurationMs", label: "最低保持期間", unit: " ms", min: 100, max: 2000, step: 50, dec: 0 },
      { key: "pitchDriftCents", label: "平均ズレ閾値", unit: " ¢", min: 1, max: 50, step: 1, dec: 0 }
    ] },
    { key: "vibratoEnabled", label: "ビブラート検出", toggle: true, subs: [
      { key: "vibratoMinRateHz", label: "揺れ周期（下限）", unit: " Hz", min: 1, max: 10, step: 0.5, dec: 1 },
      { key: "vibratoMaxRateHz", label: "揺れ周期（上限）", unit: " Hz", min: 1, max: 12, step: 0.5, dec: 1 },
      { key: "vibratoMinCents", label: "最低揺れ幅", unit: " ¢", min: 5, max: 50, step: 1, dec: 0 }
    ] },
    { key: "scoreCentsThreshold", label: "スコア判定：許容ズレ閾値", unit: " ¢", min: 1, max: 50, step: 1, dec: 0, reset: true }
  ];

  function sliderHtml(c, sub) {
    var v = F.settings[c.key];
    return '<div' + (sub ? ' class="qn-pt-sub"' : '') + '>' +
      '<label' + (sub ? ' class="qn-pt-sublabel"' : '') + '>' + c.label + ' <span class="qn-pt-white" data-fv="' + c.key + '">' + v.toFixed(c.dec) + '</span>' + c.unit +
        (c.reset ? '<button type="button" class="mini-reset-btn" data-pt="filterReset" title="Reset all filters">RESET</button>' : '') + '</label>' +
      '<input type="range" data-f="' + c.key + '" min="' + c.min + '" max="' + c.max + '" step="' + c.step + '" value="' + v + '">' +
    '</div>';
  }
  function buildFilters() {
    var html = "";
    FILTER_UI.forEach(function (c) {
      html += '<div class="control-card">';
      if (c.toggle) {
        html += '<label>' + c.label + '<button type="button" class="glow-switch control-effect-toggle" data-ft="' + c.key +
          '" role="switch" aria-checked="' + F.settings[c.key] + '"><span class="glow-switch-knob"></span></button></label>';
        (c.subs || []).forEach(function (s) { html += sliderHtml(s, true); });
      } else {
        html += sliderHtml(c, false);
      }
      html += '</div>';
    });
    refs.filtersBox.innerHTML = html;
    var ranges = refs.filtersBox.querySelectorAll("input[type=range]");
    for (var i = 0; i < ranges.length; i++) setRangeProgress(ranges[i]);
    refs.filterReset = refs.filtersBox.querySelector('[data-pt="filterReset"]');
  }
  function onFilterChange() {
    refreshScore();
    scheduleRedraw();
  }

  // ---------- サイドバー・パネル。PC=パネル常時表示(アイコンで切替・再押下で格納)、SP=全面オーバーレイ ----------
  var SIDEBAR = [
    { id: "filters", label: "Filters", icon: ICON.filters },
    { id: "recordings", label: "Recordings", icon: ICON.list },
    { id: "backup", bottom: true, label: "Backup", icon: '<path d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13zM8 13h8v2H8v-2zm0 4h5v2H8v-2z"/>' },
    { id: "import", bottom: true, label: "Import", icon: '<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>' },
    { id: "keyboard", bottom: true, label: "Keyboard", icon: ICON.keyboard }
  ];
  var PANEL_TITLES = { filters: "Filters", recordings: "Recordings", backup: "Backup", import: "Import", keyboard: "Keyboard", save: "Save Recording" };
  var panelCollapsed = (function () { try { return localStorage.getItem(KEY_COLLAPSE) === "1"; } catch (e) { return false; } })();
  function isCollapsed() { return panelCollapsed && !isSp() && panelState !== "save"; }

  function setPanel(id) {
    if (!isSp() && id === "none") id = "recordings";
    panelState = id;
    if (!root) return;
    if (id !== "recordings" && editMode) setEditMode(false);
    root.firstChild.setAttribute("data-panel", id);
    if (id === "keyboard") window.QNApps.renderShortcuts(refs.kbdBox, "pitch");
    if (id === "recordings") refreshList();
    if (id === "backup" || id === "import") {
      if (typeof window.qnBackupMountInto === "function") {
        window.qnBackupMountInto(id, id === "backup" ? refs.bkHost : refs.imHost, function () { setPanel(isSp() ? "none" : "recordings"); });
      }
    } else if (typeof window.qnBackupReleaseExternal === "function") {
      window.qnBackupReleaseExternal();
    }
    if (id !== "none") setText(refs.panelTitle, PANEL_TITLES[id] || "");
    applyCollapse();
  }
  function syncSideActive() {
    if (window.QNApps) window.QNApps.setSideActive((!panelState || panelState === "none" || panelState === "save" || isCollapsed()) ? null : panelState);
  }
  function applyCollapse() {
    if (!root) return;
    root.firstChild.classList.toggle("qn-pt-collapsed", isCollapsed());
    syncSideActive();
    scheduleSize();
  }
  function setCollapsed(on) {
    panelCollapsed = !!on;
    try { localStorage.setItem(KEY_COLLAPSE, panelCollapsed ? "1" : "0"); } catch (e) {}
    applyCollapse();
  }
  function onSidebar(id) {
    if (isSp()) { setPanel(panelState === id ? "none" : id); return; }
    if (panelCollapsed) { setCollapsed(false); setPanel(id); return; }
    if (panelState === id) { setCollapsed(true); return; }
    setPanel(id);
  }
  function scheduleSize() {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(function () { resizeRaf = 0; if (shown) setupSize(); });
  }

  // ---------- ショートカット(表示中のみ) ----------
  var SHORTCUTS = [
    { key: "Space", action: "Play / Pause" },
    { key: "R", action: "Rec / Stop" },
    { key: "S", action: "Save Recording" }
  ];
  function isTypingTarget(el) {
    if (!el || !el.tagName) return false;
    var tag = el.tagName;
    if (tag === "INPUT") return el.type !== "range" && el.type !== "button" && el.type !== "checkbox";
    return tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
  }
  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (isTypingTarget(e.target) || isTypingTarget(document.activeElement)) return;
    var k = e.key;
    if (e.code === "Space" || k === " ") {
      e.preventDefault();
      if (e.type === "keyup" || e.repeat) return;
      togglePlay();
      return;
    }
    if (e.type !== "keydown" || e.repeat) return;
    var lk = k.length === 1 ? k.toLowerCase() : k;
    if (lk === "r") { e.preventDefault(); toggleRec(); }
    else if (lk === "s") { e.preventDefault(); openSave(); }
  }
  var keyBound = false;
  function bindKeys(on) {
    if (on === keyBound) return;
    keyBound = on;
    var f = on ? "addEventListener" : "removeEventListener";
    window[f]("keydown", onKey, true);
    window[f]("keyup", onKey, true);
  }

  // ---------- マウント・表示/非表示 ----------
  function bindEvents() {
    refs.recBtn.addEventListener("click", function () { haptic(); toggleRec(); });
    refs.playBtn.addEventListener("click", function () { haptic(); togglePlay(); });
    refs.saveBtn.addEventListener("click", function () { haptic(); openSave(); });
    refs.clearBtn.addEventListener("click", function () { haptic(); onClear(); });
    refs.pbClose.addEventListener("click", function () { haptic(); stopPlayback(); });
    refs.pbTrack.addEventListener("click", seekTo);
    refs.fabEdit.addEventListener("click", function () { haptic(); setEditMode(!editMode); });
    refs.fabDel.addEventListener("click", function () { haptic(); deleteSelected(); });
    refs.saveOk.addEventListener("click", function () { haptic(); doSave(); });
    refs.saveCancel.addEventListener("click", function () { haptic(); closeSave(); });
    refs.saveName.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); doSave(); }
      else if (e.key === "Escape") { e.preventDefault(); closeSave(); }
    });
    refs.scroll.addEventListener("scroll", function () { if (!recording) scheduleRedraw(); }, { passive: true });

    refs.filtersBox.addEventListener("input", function (e) {
      var inp = e.target.closest("input[data-f]");
      if (!inp) return;
      var key = inp.getAttribute("data-f"), cfg = findCfg(key);
      var v = parseFloat(inp.value);
      F.set(key, v);
      setRangeProgress(inp);
      var lab = refs.filtersBox.querySelector('[data-fv="' + key + '"]');
      if (lab && cfg) setText(lab, v.toFixed(cfg.dec));
      onFilterChange();
    });
    refs.filtersBox.addEventListener("click", function (e) {
      var rs = e.target.closest('[data-pt="filterReset"]');
      if (rs) { haptic(); F.reset(); buildFilters(); onFilterChange(); return; }
      var tg = e.target.closest("[data-ft]");
      if (!tg) return;
      haptic();
      var key = tg.getAttribute("data-ft"), on = !F.settings[key];
      F.set(key, on);
      tg.setAttribute("aria-checked", String(on));
      onFilterChange();
    });

    if (window.ResizeObserver) {
      resizeObs = new ResizeObserver(scheduleSize);
      resizeObs.observe(refs.roll);
    }
    window.addEventListener("resize", function () { if (shown) { applyCollapse(); } });
  }
  function findCfg(key) {
    for (var i = 0; i < FILTER_UI.length; i++) {
      var c = FILTER_UI[i];
      if (c.key === key) return c;
      for (var j = 0; c.subs && j < c.subs.length; j++) if (c.subs[j].key === key) return c.subs[j];
    }
    return null;
  }

  function mount(view) {
    root = view;
    root.innerHTML = TEMPLATE;
    var nodes = root.querySelectorAll("[data-pt]");
    for (var i = 0; i < nodes.length; i++) refs[nodes[i].getAttribute("data-pt")] = nodes[i];
    ctx = refs.canvas.getContext("2d");
    volCtx = refs.volCanvas.getContext("2d");
    buildFilters();
    bindEvents();
    setHint(idleHint(), false);
    updateFab();
    updateButtons();
    refreshList();
  }

  function onShow() {
    shown = true;
    bindKeys(true);
    colorsDirty = true;
    if (!themeObs) themeObs = new MutationObserver(function () { colorsDirty = true; scheduleRedraw(); });
    themeObs.observe(document.body, { attributes: true, attributeFilter: ["data-qn-theme", "style"] });
    setPanel(panelState && panelState !== "save" ? panelState : (isSp() ? "none" : "recordings"));
    applyCollapse();
    setupSize();
    redraw();
  }

  function onHide() {
    shown = false;
    bindKeys(false);
    if (themeObs) themeObs.disconnect();
    disarmClear();
    if (recording) endRec().then(pauseAudio); else pauseAudio();
    stopTick();
    syncWake();
  }

  // ---------- 共通Backup/Import画面への窓口(player-track-backup.jsが使う。アプリを開く前でも使える) ----------
  // 形式: pitch.json {format:"qn-pitch-recordings",version:1,items:[{name,createdAt,duration,score,file?,track:[[t,midi,cents,rms,voiced(0/1)],...]}]} + pitch/<file>(音声)
  // 録音の同一性はcreatedAt。上書き=古いレコードを消して新規add(再putしない=GOTCHAS §1)。名前はlocalStorage(qn_pitch_rec_meta)
  var BK_FORMAT = "qn-pitch-recordings";
  function extOf(type) { return /mp4|aac|m4a/.test(type || "") ? "m4a" : (/ogg/.test(type || "") ? "ogg" : "webm"); }
  function mimeOf(file) { return /\.m4a$/i.test(file) ? "audio/mp4" : (/\.ogg$/i.test(file) ? "audio/ogg" : "audio/webm"); }
  function findByCreatedAt(key) {
    for (var i = 0; i < recList.length; i++) if (String(recList[i].createdAt) === String(key)) return recList[i];
    return null;
  }
  function isNum(v) { return typeof v === "number" && isFinite(v); }

  window.QNPitchBackup = {
    list: function () {
      return recList.map(function (r) { return { id: r.id, title: nameOf(r), size: r.size || 0, duration: r.duration }; });
    },
    refresh: function () { return dbList().then(function (l) { recList = l; if (root) renderList(); return l; }); },
    // ids: DBのid配列。withAudio=falseなら音声ファイルを含めない
    buildExport: async function (ids, withAudio) {
      var items = [], files = [];
      for (var i = 0; i < ids.length; i++) {
        var rec = await dbGet(ids[i]);
        if (!rec) continue;
        var o = {
          name: nameOf(rec), createdAt: rec.createdAt, duration: rec.duration,
          score: (rec.score === undefined ? null : rec.score),
          track: (rec.track || []).map(function (p) { return [p.t, p.midi, p.cents, p.rms, p.voiced ? 1 : 0]; })
        };
        if (withAudio && rec.blob) {
          var fn = rec.createdAt + "." + extOf(rec.blob.type);
          o.file = fn;
          files.push({ name: fn, blob: rec.blob });
        }
        items.push(o);
      }
      return { json: { format: BK_FORMAT, version: 1, exportedAt: new Date().toISOString(), items: items }, files: files };
    },
    // 形式が違う/空ならnull。壊れた値は捨てる。戻りの各要素に重複判定用のkey(=createdAt文字列)
    parseImport: function (raw) {
      if (!raw || raw.format !== BK_FORMAT || !Array.isArray(raw.items)) return null;
      var out = [], seen = {};
      raw.items.forEach(function (r) {
        if (!r || !isNum(r.createdAt) || !Array.isArray(r.track) || !r.track.length || r.track.length > 300000) return;
        var key = String(r.createdAt);
        if (seen[key]) return;
        var tr = [];
        for (var i = 0; i < r.track.length; i++) {
          var a = r.track[i];
          if (!Array.isArray(a) || !isNum(a[0]) || !isNum(a[1]) || !isNum(a[2]) || !isNum(a[3])) continue;
          tr.push({ t: a[0], midi: a[1], cents: a[2], rms: a[3], voiced: a[4] === 1 });
        }
        if (!tr.length) return;
        seen[key] = true;
        out.push({
          key: key, createdAt: r.createdAt,
          name: (typeof r.name === "string" && r.name.trim() ? r.name.trim() : "REC").slice(0, 60),
          duration: isNum(r.duration) ? r.duration : tr[tr.length - 1].t,
          score: isNum(r.score) ? r.score : null,
          file: typeof r.file === "string" ? r.file.split("/").pop().slice(0, 100) : "",
          track: tr
        });
      });
      return out.length ? out : null;
    },
    exists: function (key) { return !!findByCreatedAt(key); },
    titleOf: function (key) { var r = findByCreatedAt(key); return r ? nameOf(r) : ""; },
    // audioMap: ファイル名→Blob(ZIPのpitch/)。戻り {added,over,skipped,noAudio}
    applyImport: async function (list, audioMap, choices) {
      var added = 0, over = 0, skipped = 0, noAudio = 0;
      for (var i = 0; i < list.length; i++) {
        var x = list[i], ex = findByCreatedAt(x.key);
        var raw = audioMap && x.file ? audioMap.get(x.file) : null;
        var blob = raw ? new Blob([raw], { type: mimeOf(x.file) }) : null;
        if (ex) {
          if (choices && choices[x.key] === "skip") { skipped++; continue; }
          if (blob) {
            await dbDelete([ex.id]);
            delete names[ex.id];
            var nid = await dbAdd({ name: x.name, blob: blob, track: x.track, duration: x.duration, score: x.score, createdAt: x.createdAt });
            names[nid] = x.name;
          } else {
            names[ex.id] = x.name; // 音声なし=名前だけ上書き
          }
          over++;
        } else {
          if (!blob) { noAudio++; continue; }
          await dbAdd({ name: x.name, blob: blob, track: x.track, duration: x.duration, score: x.score, createdAt: x.createdAt });
          added++;
        }
      }
      saveMeta();
      await window.QNPitchBackup.refresh();
      if (playback && playback.id !== null && !recList.some(function (r) { return r.id === playback.id; })) stopPlayback(true);
      return { added: added, over: over, skipped: skipped, noAudio: noAudio };
    }
  };

  if (window.QNApps) {
    window.QNApps.register({
      id: "pitch",
      label: "Pitch",
      icon: PITCH_ICON,
      order: 30,
      ready: true,
      sidebar: SIDEBAR,
      shortcuts: SHORTCUTS,
      shortcutsNote: "録音後のPlayは、録音した音声と同じ位置にカーソルが動きます。",
      onSidebar: onSidebar,
      mount: mount,
      onShow: onShow,
      onHide: onHide
    });
  } else {
    console.error("qn-app-pitch.js: qn-apps.js が先に読み込まれていません");
  }
})();
