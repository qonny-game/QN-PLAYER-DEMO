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

  // d = {title, rows} (設定パネルと同じ行) または {title, build(ctx)} (リスト/チップ/±調整の独自本体。ctx.close()で閉じる)
  function show(anchor, d) {
    close();
    if (!window.QNSettingsUI) return;
    pop = document.createElement("div");
    pop.className = "qn-quickpop";
    if (d.build) {
      var sec = el("div", "qn-set-sec");
      sec.appendChild(el("div", "qn-set-sec-title", d.title));
      sec.appendChild(d.build({ close: close, place: function () { place(anchor); } }));
      var body = el("div", "qn-set-body");
      body.appendChild(sec);
      pop.appendChild(body);
    } else {
      pop.appendChild(window.QNSettingsUI.build([{ title: d.title, rows: d.rows }]).el);
    }
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

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var CHEV_L = '<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
  var CHEV_R = '<svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>';
  function hap() { if (typeof hapticTap === "function") { try { hapticTap(); } catch (e) {} } }

  // 「‹ 値 ›」の±調整行(連続値用)。onReset: 値部分のタップで初期値へ
  function adjustRow(label, hint, text, onDec, onInc, onReset) {
    var row = el("div", "qn-set-row");
    var lab = el("div", "qn-set-label"); lab.appendChild(el("span", null, label));
    if (hint) lab.appendChild(el("small", null, hint));
    var ctl = el("div", "qn-set-ctl");
    var st = el("div", "qn-stepper");
    var b1 = el("button", "qn-stepper-btn"); b1.type = "button"; b1.innerHTML = CHEV_L;
    var val = el("span", "qn-stepper-val"); if (onReset) val.style.cursor = "pointer";
    var b2 = el("button", "qn-stepper-btn"); b2.type = "button"; b2.innerHTML = CHEV_R;
    st.appendChild(b1); st.appendChild(val); st.appendChild(b2);
    ctl.appendChild(st); row.appendChild(lab); row.appendChild(ctl);
    function sync() { val.textContent = text(); }
    b1.onclick = function () { hap(); onDec(); sync(); };
    b2.onclick = function () { hap(); onInc(); sync(); };
    if (onReset) val.onclick = function () { hap(); onReset(); sync(); };
    sync();
    row.sync = sync;
    return row;
  }
  // 項目リスト: items=[{label, sub, color, dim, on, run}]
  function listBody(items, ctx, emptyText) {
    var wrap = el("div", "qn-qp-list");
    if (!items.length) wrap.appendChild(el("div", "qn-qp-empty", emptyText || "Nothing here"));
    items.forEach(function (it) {
      var b = el("button", "qn-qp-item" + (it.on ? " is-on" : "") + (it.dim ? " is-dim" : "")); b.type = "button";
      if (it.color) { var dot = el("i", "qn-qp-dot"); dot.style.background = it.color; b.appendChild(dot); }
      b.appendChild(el("span", "qn-qp-item-label", it.label));
      if (it.sub) b.appendChild(el("span", "qn-qp-item-sub", it.sub));
      b.onclick = function () { hap(); ctx.close(); it.run(); };
      wrap.appendChild(b);
    });
    return wrap;
  }
  function fmtT(t) { return typeof formatTime === "function" ? formatTime(t) : t.toFixed(1) + "s"; }
  function round1(v) { return Math.round(v * 10) / 10; }
  function hasAudio() { return typeof audio !== "undefined" && audio && isFinite(audio.duration) && audio.duration > 0; }
  function seekPlay(t) {
    beginSeek(); audio.currentTime = t; prevTime = t; audio.play(); updatePlayButtonState();
    renderSegments(getActiveSegment(t)); setTimeout(function () { isSeeking = false; }, 150);
  }

  var seconds = function (v) { return v + "s"; };
  var DEFS = {
    // Play長押し: Speed / Key(再生しながら調整。値のタップで初期値)
    play: function () {
      return { title: "Speed / Key", build: function () {
        var host = el("div");
        host.appendChild(adjustRow("Speed", "Tap value to reset",
          function () { return currentSpeed.toFixed(2) + "x"; },
          function () { setSpeed(currentSpeed - getSpeedStepPct() / 100); },
          function () { setSpeed(currentSpeed + getSpeedStepPct() / 100); },
          function () { setSpeed(1); }));
        host.appendChild(adjustRow("Key", "Semitones",
          function () { return currentKeySemitones > 0 ? "+" + currentKeySemitones : String(currentKeySemitones); },
          function () { setKeySemitones(currentKeySemitones - 1); },
          function () { setKeySemitones(currentKeySemitones + 1); },
          function () { setKeySemitones(0); }));
        return host;
      } };
    },
    // 前/次マーカー長押し: マーカー一覧からジャンプ
    markers: function () {
      return { title: "Jump to marker", build: function (ctx) {
        var cur = hasAudio() ? audio.currentTime : -1, nearest = -1;
        pins.forEach(function (p, i) { if (p.t <= cur + 0.05) nearest = i; });
        var items = pins.map(function (p, i) {
          return { label: (i + 1) + " - " + (p.memo || fmtT(p.t)), sub: p.memo ? fmtT(p.t) : "", dim: !p.enabled, on: i === nearest,
            color: p.color && MARKER_COLOR_PALETTE[p.color] ? MARKER_COLOR_PALETTE[p.color] : null,
            run: function () { if (hasAudio()) seekPlay(p.t); } };
        });
        return listBody(items, ctx, "No markers yet");
      } };
    },
    // A/B長押し: 0.1秒単位の微調整
    ab: function (target) {
      var kind = target && target.id === "setBBtn" ? "B" : "A";
      var get = function () { return kind === "A" ? abA : abB; };
      var put = function (v) { if (kind === "A") abA = v; else abB = v; afterABChange(); };
      return { title: kind + " point", build: function (ctx) {
        var host = el("div");
        function nudge(d) { var c = get(); if (c === null) c = audio.currentTime; put(Math.max(0, Math.min(audio.duration, round1(c + d)))); }
        var row = adjustRow("Position", "Tap value to set here",
          function () { return get() === null ? "Not set" : round1(get()).toFixed(1) + "s"; },
          function () { nudge(-0.1); }, function () { nudge(0.1); },
          function () { if (hasAudio()) put(round1(audio.currentTime)); });
        host.appendChild(row);
        var chips = el("div", "qn-qp-chips");
        [["−1s", -1], ["+1s", 1]].forEach(function (c) {
          var b = el("button", "pin-memo-preset-chip", c[0]); b.type = "button";
          b.onclick = function () { hap(); nudge(c[1]); row.sync(); }; chips.appendChild(b);
        });
        var clr = el("button", "pin-memo-preset-chip", "Clear"); clr.type = "button";
        clr.onclick = function () { hap(); put(null); ctx.close(); };
        chips.appendChild(clr);
        host.appendChild(chips);
        return host;
      } };
    },
    // +Marker長押し: プリセットを選んでその場でラベル付きマーカーを追加
    addpin: function () {
      return { title: "Add marker as", build: function (ctx) {
        var colors = getMarkerPresetColors();
        var chips = el("div", "qn-qp-chips");
        getAllMarkerPresetLabels().forEach(function (label) {
          var b = el("button", "pin-memo-preset-chip"); b.type = "button";
          var cn = colors[label];
          if (cn && MARKER_COLOR_PALETTE[cn]) { var d = el("span", "pin-memo-preset-dot"); d.style.background = MARKER_COLOR_PALETTE[cn]; b.appendChild(d); }
          b.appendChild(document.createTextNode(label));
          b.onclick = function () {
            if (!hasAudio()) return;
            hapticSuccess();
            pins.push({ t: audio.currentTime, enabled: true, memo: label, color: cn && MARKER_COLOR_PALETTE[cn] ? cn : null });
            pins.sort(function (a, b2) { return a.t - b2.t; });
            loopActiveMarkerIndex = null;
            renderPins(); renderSegments(); renderPinList(); savePins();
            ctx.close();
          };
          chips.appendChild(b);
        });
        return chips;
      } };
    },
    // Track前/次長押し: フォルダ一覧(無ければ曲一覧)から飛ぶ
    tracks: function () {
      return { title: playlistFolders.length ? "Jump to folder" : "Jump to track", build: function (ctx) {
        var items = [];
        if (playlistFolders.length) {
          var buckets = new Map(); playlistFolders.forEach(function (f) { buckets.set(f.id, []); }); buckets.set(null, []);
          playlist.forEach(function (t, i) { var k = trackFolderId(t); (buckets.get(k) || buckets.get(null)).push(i); });
          var curF = currentPlaylistIndex >= 0 ? trackFolderId(playlist[currentPlaylistIndex]) : undefined;
          playlistFolders.concat([{ id: null, name: "Unsorted" }]).forEach(function (f) {
            var idx = buckets.get(f.id) || []; if (!idx.length) return;
            items.push({ label: f.name, sub: String(idx.length), on: f.id === curF, run: function () { playTrackAt(idx[0]); } });
          });
        } else {
          playlist.forEach(function (t, i) { items.push({ label: t.title || t.name, on: i === currentPlaylistIndex, dim: !t.enabled, run: function () { playTrackAt(i); } }); });
        }
        return listBody(items, ctx, "Library is empty");
      } };
    },
    // Libraryの行長押し: お気に入り/Skip/フォルダ移動/名前変更/削除
    libitem: function (target) {
      var i = parseInt(target.dataset.index, 10), t = playlist[i];
      return { title: t ? (t.title || t.name) : "Track", build: function (ctx) {
        var armed = false;
        var items = [
          { label: t && t.favorite ? "Unpin from top" : "Pin to top", run: function () { toggleTrackFavorite(i); } },
          { label: t && t.enabled ? "Skip this track" : "Include in auto-advance", run: function () { t.enabled = !t.enabled; renderPlaylist(); persistPlaylistOrder(); } },
          { label: "Move to folder", run: function () {
              if (typeof isUnlocked === "function" && !isUnlocked()) { swShowUnlockToast("無料版ではフォルダへの移動はできません。"); return; }
              showFolderPicker(target, function (fid) {
                var dest = fid === "__new__" ? createPlaylistFolder("").id : fid;
                moveTracksToFolder([i], dest); renderPlaylist();
              });
            } },
          { label: "Rename", run: function () { var f = target.querySelector(".playlist-title"); if (f && f.startEdit) f.startEdit(); } }
        ];
        var wrap = listBody(items, ctx);
        var del = el("button", "qn-qp-item is-danger"); del.type = "button";
        del.appendChild(el("span", "qn-qp-item-label", "Delete"));
        del.onclick = function () {
          hap();
          if (!armed) { armed = true; del.firstChild.textContent = "Tap again to delete"; return; }
          ctx.close(); removeTrackAt(i);
        };
        wrap.appendChild(del);
        return wrap;
      } };
    },
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
    ["#playToggle, #pcV2DockPlay", "play"],
    ["#prevMarkerBtn, #nextMarkerBtn, #pcV2DockPrevMarker, #pcV2DockNextMarker", "markers"],
    ["#setABtn, #setBBtn", "ab"],
    ["#addPinBtn, #pcV2DockAdd", "addpin"],
    ["#prevTrackBtn, #nextTrackBtn", "tracks"],
    ["#playlistBox .playlistItem:not(.is-nowplaying)", "libitem"],
    ["#loopToggleBtn, #pcV2DockLoop", "loop"],
    ["#pcV2SkipBackBtn, #pcV2SkipFwdBtn", "skip"],
    ["#allRepeatToggleBtn", "repeat"],
    ["#timeDisplay, .vbar-time", "bars"]
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
    if (t.kind === "libitem") {
      var body = document.getElementById("pcV2PanelBody");
      if ((body && body.classList.contains("playlist-edit-mode")) || e.target.closest(".playlist-drag-handle, button, input, textarea")) return;
    }
    // 波形行の時刻ラベルは行(シーク)の子。長押し/タップで行のシークが走らないよう、ここで止める
    if (e.target.closest && e.target.closest(".vbar-time")) e.stopPropagation();
    if (pop && pop.contains(e.target)) return;
    cancelTimer();
    startX = e.clientX; startY = e.clientY;
    timer = setTimeout(function () {
      timer = null;
      var d = DEFS[t.kind](t.el);
      swallow = t.el;
      setTimeout(function () { if (swallow === t.el) swallow = null; }, 1200);
      show(t.el, d);
    }, HOLD_MS);
  }, true);
  document.addEventListener("pointermove", function (e) {
    if (timer && (Math.abs(e.clientX - startX) > MOVE_PX || Math.abs(e.clientY - startY) > MOVE_PX)) cancelTimer();
  }, true);
  ["pointerup", "pointercancel"].forEach(function (n) { document.addEventListener(n, cancelTimer, true); });
  // 長押し成立後に指を離した時のclick(=本来の操作)は発火させない
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".vbar-time")) { e.stopPropagation(); swallow = null; return; }
    if (swallow && swallow.contains(e.target)) { e.stopPropagation(); e.preventDefault(); swallow = null; }
  }, true);
  // 長押しで出るOS標準メニュー/選択を抑止
  document.addEventListener("contextmenu", function (e) { var t = findTarget(e.target); if (t) e.preventDefault(); }, true);

  window.QNQuickPop = { show: show, close: close };
})();
