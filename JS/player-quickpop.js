// player-quickpop.js — 下部コントロールの長押しクイック設定ポップアップ(v3.54.0)。
// Loop(長押し)=プリロール秒 / ±skip=送り戻し秒 / Repeat=Library範囲 / 時間表示=Bar length系。部品は設定パネルと同じQNSettingsUI(「‹ 値 ›」)。
// 押下はdocument委譲(下部バー/ドックが作り直されても効く)。長押し成立後のclickは握りつぶす。依存: qn-settings-ui.js, player-ui-pc-v2.js(window.QNSkip), player-controls.js, player-bars.js
(function () {
  "use strict";
  var HOLD_MS = 450, MOVE_PX = 10;
  var pop = null, popAnchor = null;

  function close() {
    if (pop) { pop.remove(); pop = null; popAnchor = null; }
    document.removeEventListener("pointerdown", onOutside, true);
    document.removeEventListener("keydown", onKey, true);
    window.removeEventListener("resize", close);
  }
  function onOutside(e) { if (pop && !pop.contains(e.target)) close(); }
  function onKey(e) { if (e.key === "Escape") close(); }

  function place(anchor) {
    var r = anchor.getBoundingClientRect();
    var vw = window.innerWidth, vh = window.innerHeight;
    pop.style.left = "0px"; pop.style.top = "0px";
    var w = pop.offsetWidth, h = pop.offsetHeight;
    var left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), vw - w - 8);
    var top = r.top - h - 10;
    if (top < 8) top = Math.min(r.bottom + 10, vh - h - 8);
    pop.style.left = left + "px";
    pop.style.top = Math.max(8, top) + "px";
  }

  function show(anchor, title, rows) {
    close();
    if (!window.QNSettingsUI) return;
    var secs = [{ title: title, rows: rows }];
    var ui = window.QNSettingsUI.build(secs);
    pop = document.createElement("div");
    pop.className = "qn-quickpop";
    pop.appendChild(ui.el);
    document.body.appendChild(pop);
    popAnchor = anchor;
    place(anchor);
    if (typeof hapticTap === "function") { try { hapticTap(); } catch (e) {} }
    setTimeout(function () {
      document.addEventListener("pointerdown", onOutside, true);
      document.addEventListener("keydown", onKey, true);
      window.addEventListener("resize", close);
    }, 0);
  }

  var seconds = function (v) { return v + "s"; };
  var DEFS = {
    loop: function () {
      var vals = []; for (var i = LOOP_PREROLL_MIN; i <= LOOP_PREROLL_MAX; i++) vals.push(i);
      return { title: "Loop pre-roll", rows: [
        { label: "Pre/post-roll", hint: "Seconds added around loop", type: "stepper", values: function () { return vals; },
          get: function () { return loopPreRollSeconds; }, set: function (v) { setLoopPreRollSeconds(v); }, fmt: seconds }
      ] };
    },
    skip: function () {
      var S = window.QNSkip;
      return { title: "Skip buttons", rows: [
        { label: "Skip time", hint: "Seconds for back / forward", type: "stepper", values: function () { return S.options; },
          get: function () { return S.get(); }, set: function (v) { S.set(v); }, fmt: seconds }
      ] };
    },
    repeat: function () {
      return { title: "Repeat", rows: [
        { label: "Library repeat range", hint: "Auto Next / Repeat scope", type: "stepper", values: function () { return ["folder", "all"]; },
          get: function () { return getAutoNextScope(); },
          set: function (v) { setAutoNextScope(v); if (typeof syncAutoNextScopeButton === "function") syncAutoNextScopeButton(); },
          fmt: function (v) { return v === "folder" ? "Folder" : "All"; } }
      ] };
    },
    bars: function () {
      var B = QNBars;
      return { title: "Bars", rows: [
        { label: "Bar length", hint: "1 bar = seconds", type: "stepper", values: function () { return B.OPTIONS; }, get: function () { return B.getSec(); }, set: function (v) { B.setSec(v); }, fmt: seconds },
        { label: "Bars on screen", hint: "Rows shown at once", type: "stepper", values: function () { return B.ROWS_OPTIONS; }, get: function () { return B.getRows(); }, set: function (v) { B.setRows(v); }, fmt: function (v) { return v === 0 ? "Auto" : String(v); } },
        { label: "Follow playhead", hint: "Auto-scroll while playing", type: "switch", get: function () { return B.getFollow(); }, set: function (on) { B.setFollow(on); } }
      ] };
    }
  };

  // 長押しの対象(セレクタ → 定義名)。ドックのLoopも同じ
  var TARGETS = [
    ["#loopToggleBtn, #pcV2DockLoop", "loop"],
    ["#pcV2SkipBackBtn, #pcV2SkipFwdBtn", "skip"],
    ["#allRepeatToggleBtn", "repeat"],
    ["#timeDisplay", "bars"]
  ];
  function findTarget(el) {
    for (var i = 0; i < TARGETS.length; i++) {
      var hit = el.closest ? el.closest(TARGETS[i][0]) : null;
      if (hit) return { el: hit, kind: TARGETS[i][1] };
    }
    return null;
  }

  var timer = null, startX = 0, startY = 0, swallow = null;
  function cancelTimer() { if (timer) { clearTimeout(timer); timer = null; } }

  document.addEventListener("pointerdown", function (e) {
    if (e.button > 0) return;
    var t = findTarget(e.target);
    if (!t) return;
    if (pop && pop.contains(e.target)) return;
    cancelTimer();
    startX = e.clientX; startY = e.clientY;
    timer = setTimeout(function () {
      timer = null;
      var d = DEFS[t.kind]();
      swallow = t.el;
      setTimeout(function () { if (swallow === t.el) swallow = null; }, 1200);
      show(t.el, d.title, d.rows);
    }, HOLD_MS);
  }, true);
  document.addEventListener("pointermove", function (e) {
    if (timer && (Math.abs(e.clientX - startX) > MOVE_PX || Math.abs(e.clientY - startY) > MOVE_PX)) cancelTimer();
  }, true);
  ["pointerup", "pointercancel"].forEach(function (n) { document.addEventListener(n, cancelTimer, true); });
  // 長押し成立後に指を離した時のclick(=本来の操作)は発火させない
  document.addEventListener("click", function (e) {
    if (swallow && swallow.contains(e.target)) { e.stopPropagation(); e.preventDefault(); swallow = null; }
  }, true);
  // 長押しで出るOS標準メニュー/選択を抑止
  document.addEventListener("contextmenu", function (e) { if (findTarget(e.target)) e.preventDefault(); }, true);

  window.QNQuickPop = { show: show, close: close };
})();
