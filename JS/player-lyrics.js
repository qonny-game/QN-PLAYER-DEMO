// player-lyrics.js — 歌詞表示(v4.51.0)。元データはTextメモ(mp3_text_<曲>)。メモの各行に開始時刻を付け、シークバーの下に現在の行を出す。
// 時刻は別キー mp3_lyt_<曲>(JSON [[行の文字, 秒],...])に端末だけで保存(Firebase同期の対象外。バックアップには含める)。
// 歌詞の行 = 空行でなく先頭が「#」でない行。「#」の行は見出し/コメント扱いで時刻を付けない。上限: メモ10000字・歌詞300行・1行120字(表示)
(function () {
  "use strict";
  var NOTE_MAX = 10000, LINE_MAX = 300, SHOW_KEY = "qn_lyrics_show", TAP_LAG = 0.15;
  var VIEW_CLASS = "qn-ly-view";

  var lines = [];        // {s:文字, ly:歌詞の行か, t:秒|null}
  var lyIdx = [];        // 歌詞の行のlines内位置
  var syncOn = false, ptr = 0, editing = false;
  var elBox = null, elList = null, elTap = null, elBar = null, elSwitch = null, elShow = null;
  var elDisp = null, dispLines = [];
  var lastActive = -2, timer = 0;

  function name() { return typeof currentFileName === "string" && currentFileName !== "No file loaded" ? currentFileName : ""; }
  function key() { return "mp3_lyt_" + name(); }
  function toast(t) { if (window.QNApps && typeof window.QNApps.toast === "function") window.QNApps.toast(t); }
  function showPref() { try { return localStorage.getItem(SHOW_KEY) !== "0"; } catch (e) { return true; } }
  function fmt(t) {
    if (t == null) return "--";
    var m = Math.floor(t / 60), s = t - m * 60;
    return m + ":" + (s < 10 ? "0" : "") + s.toFixed(1);
  }

  // ---------- データ ----------
  function readText() { var a = document.getElementById("noteTextArea"); return a ? a.value : ""; }
  function readStored() {
    if (!name()) return [];
    try {
      var a = JSON.parse(localStorage.getItem(key()) || "[]");
      return Array.isArray(a) ? a.filter(function (e) { return Array.isArray(e) && typeof e[0] === "string" && typeof e[1] === "number" && e[1] >= 0; }) : [];
    } catch (e) { return []; }
  }
  function save() {
    if (!name()) return;
    var out = [];
    lines.forEach(function (l) { if (l.ly && l.t != null) out.push([l.s, Math.round(l.t * 10) / 10]); });
    try { if (out.length) localStorage.setItem(key(), JSON.stringify(out)); else localStorage.removeItem(key()); } catch (e) {}
  }
  // メモ→行。保存済みの時刻は「同じ文字の行」へ前から順に当てはめる(編集で消えた行の時刻だけ落ちる)
  function rebuild(stored) {
    var src = (readText() || "").split(/\r?\n/);
    var st = stored || lines.filter(function (l) { return l.ly && l.t != null; }).map(function (l) { return [l.s, l.t]; });
    var p = 0, n = 0;
    lines = []; lyIdx = [];
    src.forEach(function (raw) {
      var s = raw.trim();
      var ly = s !== "" && s.charAt(0) !== "#" && n < LINE_MAX;
      var o = { s: s, ly: ly, t: null };
      if (ly) {
        n++;
        for (var k = p; k < st.length; k++) if (st[k][0] === s) { o.t = st[k][1]; p = k + 1; break; }
        lyIdx.push(lines.length);
      }
      lines.push(o);
    });
    if (ptr >= lyIdx.length) ptr = Math.max(0, lyIdx.length - 1);
  }
  function load() { ptr = 0; syncOn = false; rebuild(readStored()); render(); lastActive = -2; tick(true); if (typeof syncTimer === "function") syncTimer(); }
  function timedCount() { return lines.reduce(function (a, l) { return a + (l.ly && l.t != null ? 1 : 0); }, 0); }

  // ---------- Textパネル(行の一覧・タップ打ち) ----------
  function build() {
    var body = document.querySelector('.mobile-tab-panel[data-tab-panel="text"]');
    var ta = document.getElementById("noteTextArea");
    if (!body || !ta || elBox) return;
    ta.maxLength = NOTE_MAX;
    var fs = document.getElementById("noteTextAreaFullscreen"); if (fs) fs.maxLength = NOTE_MAX;
    var warned = 0;
    [ta, fs].forEach(function (a) {
      if (!a) return;
      a.addEventListener("input", function () {
        if (a.value.length >= NOTE_MAX && Date.now() - warned > 3000) { warned = Date.now(); toast("Text limit reached (" + NOTE_MAX + " characters)"); }
        if (a === ta) { rebuild(); save(); render(); lastActive = -2; tick(true); syncTimer(); }
      });
    });
    if (fs) fs.addEventListener("input", function () { setTimeout(function () { rebuild(); save(); render(); lastActive = -2; tick(true); syncTimer(); }, 0); });

    elBox = document.createElement("div"); elBox.id = "qnLyBox";
    elBar = document.createElement("div"); elBar.className = "qn-ly-bar";
    elShow = mkSwitch("Show under bar", showPref(), function (on) { try { localStorage.setItem(SHOW_KEY, on ? "1" : "0"); } catch (e) {} lastActive = -2; tick(true); });
    var bSync = mkBtn("Sync", function () { toggleSync(); }); bSync.id = "qnLySyncBtn";
    var bClr = mkBtn("Clear times", function () {
      if (!timedCount()) return;
      lines.forEach(function (l) { l.t = null; }); ptr = 0; save(); render(); lastActive = -2; tick(true);
    });
    elBar.appendChild(elShow); elBar.appendChild(bSync); elBar.appendChild(bClr);
    elList = document.createElement("div"); elList.id = "qnLyList";
    elTap = document.createElement("div"); elTap.className = "qn-ly-tapbar"; elTap.hidden = true;
    var tap = mkBtn("Tap", function () { stamp(); }); tap.className = "qn-ly-tap";
    var undo = mkBtn("Undo", function () { undoStamp(); }); undo.className = "qn-ly-undo";
    elTap.appendChild(undo); elTap.appendChild(tap);
    elBox.appendChild(elBar); elBox.appendChild(elList); elBox.appendChild(elTap);
    ta.parentNode.insertBefore(elBox, ta.nextSibling);
    body.classList.add(VIEW_CLASS);
    elList.addEventListener("click", function (e) {
      var r = e.target.closest(".qn-ly-row"); if (!r) return;
      var i = +r.dataset.i, l = lines[i];
      if (!l || !l.ly) return;
      if (syncOn) { ptr = lyIdx.indexOf(i); render(); return; }
      if (l.t != null && typeof audio !== "undefined" && audio.duration) { audio.currentTime = l.t; if (audio.paused) audio.play(); }
    });
    render();
  }
  function mkBtn(t, fn) { var b = document.createElement("button"); b.type = "button"; b.className = "qn-ly-btn"; b.textContent = t; b.addEventListener("click", fn); return b; }
  function mkSwitch(t, on, fn) {
    var l = document.createElement("label"); l.className = "qn-ly-switch";
    var c = document.createElement("input"); c.type = "checkbox"; c.checked = on;
    var s = document.createElement("span"); s.textContent = t;
    c.addEventListener("change", function () { fn(c.checked); });
    l.appendChild(c); l.appendChild(s); return l;
  }
  function toggleSync() {
    if (!syncOn && !lyIdx.length) { toast("Add lyrics with Edit first"); return; }
    syncOn = !syncOn;
    if (syncOn) { var f = lyIdx.findIndex(function (i) { return lines[i].t == null; }); ptr = f < 0 ? 0 : f; }
    render();
  }
  function stamp() {
    if (!lyIdx.length || typeof audio === "undefined") return;
    var l = lines[lyIdx[ptr]];
    l.t = Math.max(0, Math.round((audio.currentTime - TAP_LAG) * 10) / 10);
    if (ptr < lyIdx.length - 1) ptr++;
    save(); render(); lastActive = -2; tick(true);
  }
  function undoStamp() {
    if (!lyIdx.length) return;
    var cur = lines[lyIdx[ptr]];
    var i = ptr;
    if (cur.t == null && ptr > 0) i = ptr - 1;
    lines[lyIdx[i]].t = null; ptr = i;
    save(); render(); lastActive = -2; tick(true);
  }
  function render() {
    if (!elList) return;
    elList.textContent = "";
    var frag = document.createDocumentFragment();
    if (!lyIdx.length) {
      var e = document.createElement("div"); e.className = "qn-ly-empty"; e.textContent = "Edit to add lyrics"; frag.appendChild(e);
    }
    lines.forEach(function (l, i) {
      var r = document.createElement("div");
      if (!l.ly) {
        r.className = "qn-ly-row is-plain" + (l.s === "" ? " is-blank" : "");
        r.dataset.i = i; r.textContent = l.s;
      } else {
        r.className = "qn-ly-row" + (l.t != null ? " is-timed" : "") + (syncOn && lyIdx[ptr] === i ? " is-ptr" : "");
        r.dataset.i = i;
        var t = document.createElement("span"); t.className = "qn-ly-t"; t.textContent = fmt(l.t);
        var s = document.createElement("span"); s.className = "qn-ly-s"; s.textContent = l.s;
        r.appendChild(t); r.appendChild(s);
      }
      frag.appendChild(r);
    });
    elList.appendChild(frag);
    elTap.hidden = !syncOn;
    var sb = document.getElementById("qnLySyncBtn"); if (sb) { sb.textContent = syncOn ? "Done" : "Sync"; sb.classList.toggle("is-on", syncOn); }
    if (syncOn) { var p = elList.querySelector(".is-ptr"); if (p && p.scrollIntoView) p.scrollIntoView({ block: "nearest" }); }
  }
  function setEditing(on) {
    editing = !!on;
    var body = document.querySelector('.mobile-tab-panel[data-tab-panel="text"]');
    if (body) body.classList.toggle(VIEW_CLASS, !editing);
    if (editing && syncOn) { syncOn = false; render(); }
  }

  // ---------- シークバー下の表示 ----------
  function ensureDisp() {
    if (elDisp) return elDisp;
    var area = document.getElementById("pcV2WaveArea"), vb = document.getElementById("vbarContainer");
    if (!area || !vb) return null;
    elDisp = document.createElement("div"); elDisp.id = "pcV2Lyrics"; elDisp.hidden = true;
    elDisp.setAttribute("aria-live", "off");
    dispLines = [0, 1, 2].map(function (k) {
      var d = document.createElement("div"); d.className = "qn-lyd-line " + (k === 1 ? "is-cur" : "is-side"); elDisp.appendChild(d); return d;
    });
    vb.parentNode.insertBefore(elDisp, vb.nextSibling);
    return elDisp;
  }
  function activeLine(cur) {
    var best = -1, bt = -1;
    for (var k = 0; k < lyIdx.length; k++) {
      var l = lines[lyIdx[k]];
      if (l.t != null && l.t <= cur + 0.02 && l.t >= bt) { best = k; bt = l.t; }
    }
    return best;
  }
  function tick(force) {
    var d = ensureDisp(); if (!d) return;
    var show = showPref() && timedCount() > 0;
    if (!show) { if (!d.hidden) { d.hidden = true; lastActive = -2; } return; }
    var cur = typeof audio !== "undefined" ? audio.currentTime : 0;
    var a = activeLine(cur);
    if (!force && a === lastActive && !d.hidden) return;
    lastActive = a;
    d.hidden = false;
    var at = function (k) { return k >= 0 && k < lyIdx.length ? lines[lyIdx[k]].s : ""; };
    var first = a < 0 ? 0 : a;
    dispLines[0].textContent = a < 0 ? "" : at(a - 1);
    dispLines[1].textContent = a < 0 ? "" : at(a);
    dispLines[2].textContent = at(first + (a < 0 ? 0 : 1));
    if (a < 0) dispLines[2].textContent = at(0);
    d.classList.toggle("is-pre", a < 0);
  }
  // 【v4.55.0 省電力】120msタイマーは「再生中・表示中・時刻付きの歌詞がある」時だけ(以前は常時)。シークや曲の読み込みはイベントでtick(true)する
  function syncTimer() {
    var need = typeof audio !== "undefined" && !audio.paused && !document.hidden && showPref() && timedCount() > 0;
    if (need && !timer) timer = setInterval(function () { tick(false); }, 120);
    else if (!need && timer) { clearInterval(timer); timer = 0; }
  }

  // ---------- バックアップ ----------
  function exportFor(n) {
    try { var a = JSON.parse(localStorage.getItem("mp3_lyt_" + n) || "null"); return Array.isArray(a) && a.length ? a : undefined; } catch (e) { return undefined; }
  }
  function importFor(n, arr) {
    if (!Array.isArray(arr)) return;
    var ok = arr.filter(function (e) { return Array.isArray(e) && typeof e[0] === "string" && typeof e[1] === "number"; }).slice(0, LINE_MAX);
    try { if (ok.length) localStorage.setItem("mp3_lyt_" + n, JSON.stringify(ok)); else localStorage.removeItem("mp3_lyt_" + n); } catch (e) {}
  }

  window.QNLyrics = { load: load, setEditing: setEditing, exportFor: exportFor, importFor: importFor, NOTE_MAX: NOTE_MAX };

  function init() {
    build(); ensureDisp(); load(); syncTimer();
    if (typeof audio !== "undefined") ["play", "playing", "pause", "ended"].forEach(function (ev) { audio.addEventListener(ev, function () { syncTimer(); tick(true); }); });
    document.addEventListener("visibilitychange", syncTimer);
    if (typeof audio !== "undefined") ["seeked", "loadedmetadata"].forEach(function (ev) { audio.addEventListener(ev, function () { tick(true); }); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 0); });
  else setTimeout(init, 0);
})();
