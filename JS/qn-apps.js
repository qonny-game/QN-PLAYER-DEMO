// qn-apps.js — アプリ名バッジ(#qnAppBadge)・アプリ一覧フライアウト(#qnAppFlyout)・アプリ表示領域(#qnAppHost)。
// PC幅=バッジhover/クリックでフライアウト、SP/タッチ=タップでアイコンバー上に一覧(再タップ・外側タップ・Escで閉じる)。アプリ選択で#qnAppHostがそのアプリ画面に。PLAYER選択で本体へ戻る。
// 【アプリ追加】JS/qn-app-xxx.jsでQNApps.register({id, label, icon(24x24 svg path), order(小さいほど上), ready(falseで準備中トースト), sidebar:[{id,label,icon}], onSidebar(itemId)(選択表示はQNApps.setSideActive(itemId|null)), shortcuts:[{key,action}]("Space / K"形式で複数キー可), shortcutsNote, mount(viewEl)(初回のみ), onShow(), onHide()})。Keyboardパネルの中身はQNApps.renderShortcuts(hostEl,"<id>")。index.htmlにqn-apps.jsより後で<script>追加。同idのregisterは置き換え。準備中アプリ(PITCH)は末尾のregister。
// 【接点】#pcV2IconBar/#pcV2IconBarBottom/#pcV2IconBarSpacer/#pcV2Layout(player-ui-pc-v2.js build()が作る。出来上がるのを待つ)。アプリ表示中はbody.qn-app-open(player-ui-shared.jsのショートカット無効化に使う)。アプリを開く時QNPLAYERのaudioは一時停止
(function () {
  "use strict";

  var MORE_ICON = '<path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>';
  var CHEVRON_ICON = '<path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>';
  var PLAYER_ICON = '<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>';

  var SP_QUERY = "(max-width: 900px)";

  var apps = [];
  var current = null;
  var iconBar = null, host = null, badgeBtn = null, flyout = null, scrim = null, flyoutOpen = false, flyoutHideTimer = null, flyoutTimer = null, toastEl = null, toastTimer = null;
  var views = {};
  var mounted = {};
  var resizeObs = null;

  function $(id) { return document.getElementById(id); }

  function haptic() {
    if (typeof hapticTap === "function") { try { hapticTap(); } catch (e) {} }
  }

  function findApp(id) {
    for (var i = 0; i < apps.length; i++) if (apps[i].id === id) return apps[i];
    return null;
  }

  function makeItemButton(attrs, iconPath, label, title) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pcv2-icon-item " + (attrs.cls || "");
    if (attrs.appId) btn.setAttribute("data-app-id", attrs.appId);
    btn.title = title || label;
    btn.innerHTML = '<svg viewBox="0 0 24 24">' + iconPath + "</svg><span></span>";
    btn.querySelector("span").textContent = label;
    return btn;
  }

  function ensureFlyout() {
    if (flyout) return flyout;
    flyout = document.createElement("div");
    flyout.id = "qnAppFlyout";
    flyout.hidden = true;
    flyout.setAttribute("role", "menu");
    document.body.appendChild(flyout);
    flyout.addEventListener("mouseenter", cancelFlyoutClose);
    flyout.addEventListener("mouseleave", scheduleFlyoutClose);
    return flyout;
  }

  function renderAppItems() {
    var fo = ensureFlyout();
    fo.innerHTML = "";
    apps.forEach(function (app) {
      var btn = makeItemButton(
        { cls: "qn-flyout-item" + (app.ready ? "" : " qn-app-soon"), appId: app.id },
        app.icon, app.label.toUpperCase(),
        app.ready ? app.label : app.label + " (coming soon)"
      );
      btn.setAttribute("role", "menuitem");
      btn.addEventListener("click", function () {
        haptic();
        closeFlyout();
        open(app.id);
      });
      fo.appendChild(btn);
    });
    syncActiveStates();
  }

  function syncActiveStates() {
    if (!flyout) return;
    var items = flyout.querySelectorAll(".qn-flyout-item");
    for (var i = 0; i < items.length; i++) {
      var id = items[i].getAttribute("data-app-id");
      var isActive = (current ? current.id === id : id === "player");
      items[i].classList.toggle("qn-app-active", isActive);
    }
  }

  function isSp() { return window.matchMedia(SP_QUERY).matches; }
  function canHover() { return window.matchMedia("(hover: hover) and (pointer: fine)").matches; }

  function positionFlyout() {
    if (!flyout || !iconBar || !badgeBtn) return;
    var br = iconBar.getBoundingClientRect();
    var sp = isSp();
    flyout.classList.toggle("qn-flyout-sp", sp);
    if (scrim) scrim.classList.toggle("qn-scrim-sp", sp);
    if (sp) {
      flyout.style.left = "0px";
      flyout.style.right = "0px";
      flyout.style.top = "auto";
      flyout.style.bottom = Math.max(0, window.innerHeight - br.top) + "px";
    } else {
      flyout.style.left = br.right + "px";
      flyout.style.right = "auto";
      flyout.style.top = br.top + "px";
      flyout.style.bottom = Math.max(0, window.innerHeight - br.bottom) + "px";
    }
  }

  function ensureScrim() {
    if (scrim) return scrim;
    scrim = document.createElement("div");
    scrim.id = "qnAppScrim";
    scrim.hidden = true;
    document.body.appendChild(scrim);
    return scrim;
  }

  function openFlyout() {
    if (!flyout || flyoutOpen) return;
    flyoutOpen = true;
    cancelFlyoutClose();
    if (flyoutHideTimer) { clearTimeout(flyoutHideTimer); flyoutHideTimer = null; }
    closeColorPop();
    ensureScrim();
    positionFlyout();
    flyout.hidden = false;
    scrim.hidden = false;
    void flyout.offsetWidth;
    flyout.classList.add("qn-flyout-in");
    scrim.classList.add("qn-scrim-in");
    if (badgeBtn) {
      badgeBtn.classList.add("qn-badge-open");
      badgeBtn.setAttribute("aria-expanded", "true");
    }
  }

  function closeFlyout() {
    cancelFlyoutClose();
    if (!flyout || !flyoutOpen) return;
    flyoutOpen = false;
    flyout.classList.remove("qn-flyout-in");
    if (scrim) scrim.classList.remove("qn-scrim-in");
    if (badgeBtn) {
      badgeBtn.classList.remove("qn-badge-open");
      badgeBtn.setAttribute("aria-expanded", "false");
    }
    if (flyoutHideTimer) clearTimeout(flyoutHideTimer);
    flyoutHideTimer = setTimeout(function () {
      flyoutHideTimer = null;
      if (flyoutOpen) return;
      flyout.hidden = true;
      if (scrim) scrim.hidden = true;
    }, 280);
  }

  function scheduleFlyoutClose() {
    if (!canHover() || isSp()) return;
    cancelFlyoutClose();
    flyoutTimer = setTimeout(closeFlyout, 160);
  }
  function cancelFlyoutClose() {
    if (flyoutTimer) { clearTimeout(flyoutTimer); flyoutTimer = null; }
  }

  function renderAppSideItems() {
    if (!iconBar) return;
    var old = document.querySelectorAll("#pcV2IconBar .qn-appside-item");
    for (var i = 0; i < old.length; i++) old[i].parentNode.removeChild(old[i]);
    if (!current || !current.sidebar) return;
    var spacer = $("pcV2IconBarSpacer");
    var bottomBox = $("pcV2IconBarBottom");
    var colorBtn = bottomBox ? bottomBox.querySelector('[data-panel-id="color"]') : null;
    current.sidebar.forEach(function (it) {
      var btn = makeItemButton({ cls: "qn-appside-item" }, it.icon, it.label, it.label);
      btn.setAttribute("data-side-id", it.id);
      btn.addEventListener("click", function () {
        haptic();
        if (typeof current.onSidebar === "function") current.onSidebar(it.id);
      });
      if (it.bottom && bottomBox) bottomBox.insertBefore(btn, colorBtn || null);
      else if (spacer) iconBar.insertBefore(btn, spacer); else iconBar.appendChild(btn);
    });
    setSideActive(sideActiveId);
  }

  var sideActiveId = null;
  function setSideActive(id) {
    sideActiveId = id;
    if (!iconBar) return;
    var items = iconBar.querySelectorAll(".qn-appside-item");
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle("qn-app-active", items[i].getAttribute("data-side-id") === id);
    }
  }

  // ---------- アプリ名バッジ(サイドバー先頭。「＞」=サブメニューあり)。PC=hover/クリック、SP/タッチ=タップ開閉 ----------
  function buildBadge() {
    if (!iconBar || $("qnAppBadge")) return;
    badgeBtn = makeItemButton({ cls: "qn-app-badge" }, PLAYER_ICON, "Player", "Apps");
    badgeBtn.id = "qnAppBadge";
    badgeBtn.setAttribute("aria-haspopup", "menu");
    badgeBtn.setAttribute("aria-expanded", "false");
    var chev = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    chev.setAttribute("viewBox", "0 0 24 24");
    chev.setAttribute("class", "qn-badge-chev");
    chev.setAttribute("aria-hidden", "true");
    chev.innerHTML = CHEVRON_ICON;
    badgeBtn.appendChild(chev);

    badgeBtn.addEventListener("mouseenter", function () {
      if (canHover() && !isSp()) openFlyout();
    });
    badgeBtn.addEventListener("mouseleave", scheduleFlyoutClose);
    badgeBtn.addEventListener("click", function () {
      haptic();
      if (flyoutOpen) {
        if (!(canHover() && !isSp())) closeFlyout();
      } else {
        openFlyout();
      }
    });
    iconBar.insertBefore(badgeBtn, iconBar.firstChild);
  }

  function updateBadge() {
    if (!badgeBtn) return;
    var app = current || findApp("player");
    if (!app) return;
    badgeBtn.querySelector("svg").innerHTML = app.icon;
    badgeBtn.querySelector("span").textContent = app.label.toUpperCase();
    badgeBtn.title = app.label + " — switch app";
  }

  function refreshSidebar() {
    if (!iconBar) return;
    updateBadge();
    iconBar.classList.toggle("qn-app-sidebar", !!current);
    renderAppSideItems();
    syncActiveStates();
    if (iconBar.scrollTo) iconBar.scrollTo(0, 0);
    window.dispatchEvent(new Event("resize"));
  }

  // #qnAppHostはfixed。PC=アイコンバー右〜下端、SP=ヘッダー直下〜アイコンバー直上。アプリ表示中は下段バー等をCSSで隠す(style-apps.css)ので#pcV2Layoutの矩形をそのまま使う
  function layoutHost() {
    if (!host) return;
    var layout = $("pcV2Layout"), bar = $("pcV2IconBar");
    if (!layout || !bar) return;
    var lr = layout.getBoundingClientRect();
    var br = bar.getBoundingClientRect();
    var sp = window.matchMedia(SP_QUERY).matches;
    host.style.top = lr.top + "px";
    if (sp) {
      host.style.left = "0px";
      host.style.right = "0px";
      host.style.bottom = Math.max(0, window.innerHeight - br.top) + "px";
    } else {
      host.style.left = br.right + "px";
      host.style.right = "0px";
      host.style.bottom = Math.max(0, window.innerHeight - lr.bottom) + "px";
    }
  }

  function ensureHost() {
    if (host) return host;
    host = document.createElement("div");
    host.id = "qnAppHost";
    host.hidden = true;
    document.body.appendChild(host);
    window.addEventListener("resize", function () { if (current) layoutHost(); });
    window.addEventListener("orientationchange", function () { if (current) layoutHost(); });
    return host;
  }

  function ensureView(app) {
    if (views[app.id]) return views[app.id];
    var v = document.createElement("div");
    v.className = "qn-app-view";
    v.setAttribute("data-app-view", app.id);
    v.hidden = true;
    ensureHost().appendChild(v);
    views[app.id] = v;
    return v;
  }

  // ---------- トースト ----------
  function toast(text) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.id = "qnAppToast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = text;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 1800);
  }

  // ---------- 開く / 閉じる ----------
  function pausePlayerAudio() {
    try { if (typeof audio !== "undefined" && audio && !audio.paused) audio.pause(); } catch (e) {}
  }

  // ---------- 最後に開いていたアプリを再読み込み後に復元 ----------
  var LAST_APP_KEY = "qn_last_app";
  function saveLastApp(id) { try { localStorage.setItem(LAST_APP_KEY, id); } catch (e) {} }
  var restoreScheduled = false;
  function scheduleRestore() {
    if (restoreScheduled) return;
    restoreScheduled = true;
    function run() {
      var id = null;
      try { id = localStorage.getItem(LAST_APP_KEY); } catch (e) {}
      var app = id && id !== "player" ? findApp(id) : null;
      // 準備中・不明なアプリは復元しない(本体のまま)
      if (app && app.ready && !current) open(id);
    }
    if (document.readyState === "complete") setTimeout(run, 0);
    else window.addEventListener("load", function () { setTimeout(run, 0); });
  }

  function open(id) {
    var app = findApp(id);
    if (!app) return;
    if (id === "player") { close(); return; }
    if (!app.ready) { toast(app.label + " is coming soon"); return; }
    if (current && current.id === id) return;

    if (current && typeof current.onHide === "function") {
      try { current.onHide(); } catch (e) { console.error(e); }
      views[current.id].hidden = true;
    }

    var view = ensureView(app);
    if (!mounted[id]) {
      mounted[id] = true;
      try { if (typeof app.mount === "function") app.mount(view); } catch (e) { console.error(e); }
    }

    current = app;
    saveLastApp(id);
    pausePlayerAudio();
    document.body.classList.add("qn-app-open");
    host.hidden = false;
    view.hidden = false;
    layoutHost();
    sideActiveId = null;
    refreshSidebar();
    requestAnimationFrame(layoutHost);

    if (typeof app.onShow === "function") {
      try { app.onShow(); } catch (e) { console.error(e); }
    }
  }

  function close() {
    closeColorPop();
    closeFlyout();
    if (!current) { syncActiveStates(); return; }
    saveLastApp("player");
    var app = current;
    current = null;
    if (typeof app.onHide === "function") {
      try { app.onHide(); } catch (e) { console.error(e); }
    }
    if (views[app.id]) views[app.id].hidden = true;
    if (host) host.hidden = true;
    document.body.classList.remove("qn-app-open");
    sideActiveId = null;
    refreshSidebar();
    window.dispatchEvent(new Event("resize"));
  }

  var colorPop = null, colorSec = null, colorHome = null, colorNext = null;

  function findColorSection() {
    return document.querySelector('.qn-menu-section[data-qn-section="theme"]');
  }

  // PLAYERパネルと同じ見た目・位置(PC=左カラム全高、SP=アイコンバー上)。SPで[data-qn-keep-visible]を持つ場合は覆わず直下から
  function positionColorPop() {
    if (!colorPop) return;
    var bar = $("pcV2IconBar"), layout = $("pcV2Layout");
    if (!bar || !layout) return;
    var bar_r = bar.getBoundingClientRect(), lr = layout.getBoundingClientRect();
    var sp = window.matchMedia(SP_QUERY).matches;
    colorPop.classList.toggle("qn-colorpanel-sp", sp);
    if (sp) {
      var top = lr.top;
      var keep = document.querySelector("#qnAppHost [data-qn-keep-visible]");
      if (keep && current) {
        var kr = keep.getBoundingClientRect();
        if (kr.width > 0) top = Math.max(top, kr.bottom + 8);
      }
      colorPop.style.left = "0px"; colorPop.style.right = "0px"; colorPop.style.width = "auto";
      colorPop.style.top = top + "px";
      colorPop.style.bottom = Math.max(0, window.innerHeight - bar_r.top) + "px";
    } else {
      colorPop.style.left = bar_r.right + "px"; colorPop.style.right = "auto";
      colorPop.style.width = "375px";
      colorPop.style.top = lr.top + "px";
      colorPop.style.bottom = Math.max(0, window.innerHeight - lr.bottom) + "px";
    }
  }

  function closeColorPop() {
    if (!colorPop || colorPop.hidden) return;
    colorPop.hidden = true;
    if (colorSec && colorHome && colorHome.isConnected) {
      if (colorNext && colorNext.parentNode === colorHome) colorHome.insertBefore(colorSec, colorNext);
      else colorHome.appendChild(colorSec);
    }
    var b = document.querySelector('#pcV2IconBarBottom [data-panel-id="color"]');
    if (b) b.classList.remove("qn-app-active");
    colorSec = colorHome = colorNext = null;
  }

  function openColorPop() {
    var sec = findColorSection();
    if (!sec) return;
    if (!colorPop) {
      colorPop = document.createElement("div");
      colorPop.id = "qnColorPop";
      colorPop.hidden = true;
      colorPop.innerHTML = '<div class="qn-colorpanel-head"><span class="pcv2-panel-header-title">Color</span></div>' +
        '<div class="qn-colorpanel-body"></div>';
      document.body.appendChild(colorPop);
      iconBar.addEventListener("click", function (e) {
        if (e.target.closest && e.target.closest('[data-panel-id="color"]')) return;
        closeColorPop();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeColorPop();
      });
      window.addEventListener("resize", positionColorPop);
    }
    colorSec = sec; colorHome = sec.parentNode; colorNext = sec.nextSibling;
    colorPop.querySelector(".qn-colorpanel-body").appendChild(sec);
    colorPop.hidden = false;
    positionColorPop();
    var b = document.querySelector('#pcV2IconBarBottom [data-panel-id="color"]');
    if (b) b.classList.add("qn-app-active");
  }

  function initColorKeeper() {
    var bottom = $("pcV2IconBarBottom");
    if (!bottom || bottom.__qnColor) return;
    bottom.__qnColor = true;
    bottom.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest('[data-panel-id="color"]');
      if (!b || !current) return;
      closeFlyout();
      e.stopImmediatePropagation();
      e.preventDefault();
      haptic();
      if (colorPop && !colorPop.hidden) closeColorPop(); else openColorPop();
    }, true);
  }

  // ---------- フライアウトを閉じる共通操作 ----------
  var flyoutGlobalBound = false;
  function bindFlyoutGlobal() {
    if (flyoutGlobalBound) return;
    flyoutGlobalBound = true;
    document.addEventListener("pointerdown", function (e) {
      if (!flyout || !flyoutOpen) return;
      var t = e.target;
      if (t && t.closest && (t.closest("#qnAppFlyout") || t.closest("#qnAppBadge"))) return;
      closeFlyout();
    }, true);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeFlyout();
    });
    window.addEventListener("resize", function () { if (flyoutOpen) positionFlyout(); });
    window.addEventListener("orientationchange", closeFlyout);
    iconBar.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("#qnAppBadge")) return;
      closeFlyout();
    });
    iconBar.addEventListener("scroll", closeFlyout, { passive: true });
  }

  // ---------- 起動：player-ui-pc-v2.js の build() 完了を待つ ----------
  function init() {
    iconBar = $("pcV2IconBar");
    if (!iconBar || !$("pcV2IconBarBottom")) return false;
    initColorKeeper();
    buildBadge();
    renderAppItems();
    bindFlyoutGlobal();
    updateBadge();
    ensureHost();
    var layout = $("pcV2Layout");
    if (layout && window.ResizeObserver && !resizeObs) {
      resizeObs = new ResizeObserver(function () { if (current) layoutHost(); });
      resizeObs.observe(layout);
    }
    scheduleRestore();
    return true;
  }

  function waitForSidebar() {
    if (init()) return;
    var mo = new MutationObserver(function () {
      if (init()) mo.disconnect();
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  // ---------- 公開API ----------
  function register(def) {
    if (!def || !def.id) return;
    var idx = -1;
    for (var i = 0; i < apps.length; i++) if (apps[i].id === def.id) idx = i;
    var app = {
      id: def.id,
      label: def.label || def.id,
      icon: def.icon || MORE_ICON,
      order: typeof def.order === "number" ? def.order : 100,
      ready: def.ready !== false,
      sidebar: def.sidebar || null, onSidebar: def.onSidebar,
      shortcuts: def.shortcuts || null, shortcutsNote: def.shortcutsNote || "",
      mount: def.mount, onShow: def.onShow, onHide: def.onHide
    };
    if (idx >= 0) apps[idx] = app; else apps.push(app);
    apps.sort(function (a, b) { return a.order - b.order; });
    renderAppItems();
  }

  // ---------- 共通ショートカット表(Keyboard): 各アプリは[{key,action}]+任意注記を渡すだけ。見た目は全アプリ共通 ----------
  var SHORTCUT_CONNECTORS = ["+", "/", "-"];
  function fillShortcutRows(tbody, list) {
    tbody.textContent = "";
    (list || []).forEach(function (row) {
      var tr = document.createElement("tr");
      var tdA = document.createElement("td");
      tdA.textContent = row.action;
      var tdK = document.createElement("td");
      String(row.key).split(" ").forEach(function (part, i) {
        if (i > 0) tdK.appendChild(document.createTextNode(" "));
        if (SHORTCUT_CONNECTORS.indexOf(part) >= 0) tdK.appendChild(document.createTextNode(part));
        else { var kbd = document.createElement("kbd"); kbd.textContent = part; tdK.appendChild(kbd); }
      });
      tr.appendChild(tdA); tr.appendChild(tdK);
      tbody.appendChild(tr);
    });
  }
  function renderShortcuts(hostEl, listOrAppId, note) {
    if (!hostEl) return;
    var list = listOrAppId;
    if (typeof listOrAppId === "string") {
      list = null;
      for (var i = 0; i < apps.length; i++) {
        if (apps[i].id === listOrAppId) { list = apps[i].shortcuts; if (note == null) note = apps[i].shortcutsNote; }
      }
    }
    hostEl.textContent = "";
    var sec = document.createElement("div");
    sec.className = "qn-menu-section";
    var table = document.createElement("table");
    table.className = "qn-shortcut-table";
    table.innerHTML = "<thead><tr><th>Action</th><th>Key</th></tr></thead><tbody></tbody>";
    fillShortcutRows(table.tBodies[0], list);
    sec.appendChild(table);
    if (note) {
      var p = document.createElement("p");
      p.className = "qn-yt-kbd-note";
      p.textContent = note;
      sec.appendChild(p);
    }
    hostEl.appendChild(sec);
  }

  // SP幅のシート: 見出しを下へドラッグ(スワイプ)で閉じる。panel=動かす要素、header=つかむ要素、onClose=閉じる処理(閉じるアニメは呼び先が担当。ドラッグ位置から続けて下へ出ていく)
  function sheetDrag(panel, header, onClose) {
    if (!panel || !header) return;
    var startY = 0, dy = 0, t0 = 0, active = false;
    header.addEventListener("pointerdown", function (e) {
      if (!isSp() || e.target.closest("button, input, a, textarea")) return;
      active = true; startY = e.clientY; dy = 0; t0 = Date.now();
      panel.style.transition = "none";
      panel.style.transform = "";
      try { header.setPointerCapture(e.pointerId); } catch (err) {}
    });
    header.addEventListener("pointermove", function (e) {
      if (!active) return;
      dy = Math.max(0, e.clientY - startY);
      panel.style.transform = "translateY(" + dy + "px)";
    });
    function end(e, commit) {
      if (!active) return;
      active = false;
      try { header.releasePointerCapture(e.pointerId); } catch (err) {}
      var v = dy / Math.max(1, Date.now() - t0);
      if (commit && (dy > 90 || (dy > 30 && v > 0.5))) {
        onClose();
        setTimeout(function () { panel.style.transform = ""; panel.style.transition = ""; }, 400);
      } else {
        panel.style.transition = "transform 180ms ease";
        panel.style.transform = "";
        setTimeout(function () { panel.style.transition = ""; }, 200);
      }
    }
    header.addEventListener("pointerup", function (e) { end(e, true); });
    header.addEventListener("pointercancel", function (e) { end(e, false); });
  }

  // SP幅のリスト行: 横にスワイプすると右に□アイコンボタン(編集/SKIP(HIDE)/削除)が出る。opts={rowSel, disabled():bool, actions(row):[{kind:"edit|skip|hide|del", on:bool(skip/hide: 今の状態=無効か), run(row)}]}。削除は2タップ確認。行が再描画されると自然に閉じる
  var SW_ICON = {
    edit: '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>',
    eyeOn: '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>',
    eyeOff: '<path d="M12 6.5c3.79 0 7.17 2.13 8.82 5.5-.59 1.2-1.42 2.25-2.42 3.11l1.42 1.42c1.39-1.23 2.49-2.77 3.18-4.53C21.27 7.61 17 4.5 12 4.5c-1.27 0-2.49.2-3.64.57l1.65 1.65c.62-.14 1.28-.22 1.99-.22zM2.71 3.16L1.29 4.57 4 7.27C2.36 8.53 1.07 10.15 0.18 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l3.01 3.01 1.41-1.41L2.71 3.16zM12 17c-2.76 0-5-2.24-5-5 0-.77.18-1.5.49-2.14l1.57 1.57c-.03.18-.06.37-.06.57 0 1.66 1.34 3 3 3 .2 0 .38-.03.57-.07l1.57 1.57c-.65.32-1.37.5-2.14.5zm2.97-5.33c-.15-1.4-1.25-2.49-2.64-2.64l2.64 2.64z"/>',
    del: '<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>',
    ok: '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>'
  };
  function swipeRows(container, opts) {
    if (!container || container._qnSwipe) return;
    container._qnSwipe = true;
    container.classList.add("qn-swipe-list");
    var openRow = null, st = null, swiped = 0;
    function setX(row, x, anim) {
      row.style.transition = anim ? "transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)" : "none";
      row.style.transform = x ? "translateX(" + x + "px)" : "";
    }
    function closeRow(row) {
      if (!row) return;
      setX(row, 0, true);
      row.classList.remove("qn-swipe-open");
      if (openRow === row) openRow = null;
    }
    function buildTray(row) {
      var tray = row._qnTray;
      if (tray && tray.parentNode === row) { return tray; }
      tray = document.createElement("div");
      tray.className = "qn-swipe-tray";
      (opts.actions(row) || []).forEach(function (a) {
        var b = document.createElement("button");
        b.type = "button";
        var kind = a.kind, icon, label;
        if (kind === "edit") { icon = SW_ICON.edit; label = "EDIT"; }
        else if (kind === "del") { icon = SW_ICON.del; label = "DELETE"; }
        else if (kind === "hide") { icon = a.on ? SW_ICON.eyeOn : SW_ICON.eyeOff; label = a.on ? "SHOW" : "HIDE"; }
        else { icon = a.on ? SW_ICON.eyeOn : SW_ICON.eyeOff; label = a.on ? "PLAY" : "SKIP"; }
        b.className = "qn-swipe-btn is-" + kind;
        b.innerHTML = '<svg viewBox="0 0 24 24">' + icon + "</svg><span>" + label + "</span>";
        b.addEventListener("click", function (e) {
          e.stopPropagation();
          if (kind === "del" && !b.classList.contains("confirm")) {
            haptic();
            b.classList.add("confirm");
            b.querySelector("svg").innerHTML = SW_ICON.ok;
            b.querySelector("span").textContent = "OK?";
            clearTimeout(b._t);
            b._t = setTimeout(function () {
              b.classList.remove("confirm");
              b.querySelector("svg").innerHTML = SW_ICON.del;
              b.querySelector("span").textContent = "DELETE";
            }, 3000);
            return;
          }
          haptic();
          closeRow(row);
          a.run(row);
        });
        tray.appendChild(b);
      });
      row.appendChild(tray);
      row._qnTray = tray;
      return tray;
    }
    container.addEventListener("pointerdown", function (e) {
      if (!isSp() || (opts.disabled && opts.disabled())) return;
      var row = e.target.closest(opts.rowSel);
      if (!row || !container.contains(row)) { if (openRow && !e.target.closest(".qn-swipe-tray")) closeRow(openRow); return; }
      if (e.target.closest(".qn-swipe-tray")) return;
      if (openRow && openRow !== row) closeRow(openRow);
      if (e.target.closest("input, textarea, .playlist-drag-handle, .pin-color-mark")) return;
      st = { row: row, x: e.clientX, y: e.clientY, dir: "", base: row.classList.contains("qn-swipe-open") ? -1 : 0, id: e.pointerId, w: 0, t: Date.now() };
      swiped = 0;
    });
    container.addEventListener("pointermove", function (e) {
      if (!st || e.pointerId !== st.id) return;
      var dx = e.clientX - st.x, dy = e.clientY - st.y;
      if (!st.dir) {
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
        if (Math.abs(dx) > Math.abs(dy) * 0.7) {
          st.dir = "h";
          var tray = buildTray(st.row);
          if (!tray.children.length) { st = null; return; }
          st.row.classList.add("qn-swipe-row");
          st.w = tray.offsetWidth;
          try { st.row.setPointerCapture(e.pointerId); } catch (err) {}
        } else { st.dir = "v"; return; }
      }
      if (st.dir !== "h") return;
      var x = Math.max(-st.w - 24, Math.min(0, st.base * st.w + dx));
      setX(st.row, x, false);
      swiped = Date.now();
    });
    function end(e, ok) {
      if (!st || e.pointerId !== st.id) return;
      var s = st; st = null;
      if (s.dir !== "h") return;
      swiped = Date.now();
      try { s.row.releasePointerCapture(e.pointerId); } catch (err) {}
      var m = /translateX\((-?[\d.]+)px\)/.exec(s.row.style.transform || ""), x = m ? parseFloat(m[1]) : 0;
      var flickOpen = !s.base && (-x) > 24 && (-x) / Math.max(1, Date.now() - s.t) > 0.35;
      if (ok && (flickOpen || x < (s.base ? -s.w * 0.7 : -s.w * 0.3))) {
        setX(s.row, -s.w, true);
        s.row.classList.add("qn-swipe-open");
        openRow = s.row;
      } else closeRow(s.row);
    }
    container.addEventListener("pointerup", function (e) { end(e, true); });
    container.addEventListener("pointercancel", function (e) { end(e, false); });
    // スワイプ直後のclickは行の通常動作(再生など)にしない
    container.addEventListener("click", function (e) {
      if (swiped && Date.now() - swiped < 400 && !e.target.closest(".qn-swipe-tray")) { swiped = 0; e.stopPropagation(); e.preventDefault(); } else swiped = 0;
    }, true);
  }

  window.QNApps = {
    swipeRows: swipeRows,
    sheetDrag: sheetDrag,
    register: register,
    open: open,
    close: close,
    toast: toast,
    renderShortcuts: renderShortcuts,
    fillShortcutRows: fillShortcutRows,
    setSideActive: setSideActive,
    // マイク使用中の表示(TUNER/PITCHが使う)。setMic=サイドバーのバッジに赤丸(body.qn-mic-on)、setMicLevel=.qn-mic-pill内のレベル(0〜5)。値が変わった時だけDOMを書く
    setMic: function (on) { document.body.classList.toggle("qn-mic-on", !!on); },
    setMicLevel: function (pill, lv) {
      if (!pill || pill._lv === lv) return;
      pill._lv = lv;
      var bars = pill._bars || (pill._bars = pill.querySelectorAll(".qn-mic-lv b"));
      for (var i = 0; i < bars.length; i++) bars[i].classList.toggle("on", i < lv);
    },
    getCurrentId: function () { return current ? current.id : null; },
    layout: layoutHost
  };

  register({ id: "player", label: "Player", icon: PLAYER_ICON, order: 0, ready: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForSidebar);
  } else {
    waitForSidebar();
  }
})();
