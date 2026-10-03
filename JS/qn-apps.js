// qn-apps.js — ヘッダーのロゴ兼アプリ切替(#qnAppLogoBtn)・アプリ一覧ドロップダウン(#qnAppFlyout)・アプリ表示領域(#qnAppHost)。
// PC/SP共通: ロゴ(QN＋アプリ名＋V)を押すと直下にアプリ一覧(再押下・外側タップ・Escで閉じる)。アプリ名はBRAND(QNだけ色付き)。アプリ選択で#qnAppHostがそのアプリ画面に。PLAYER選択で本体へ戻る。
// 【アプリ追加】JS/qn-app-xxx.jsでQNApps.register({id, label, icon(24x24 svg path), order(小さいほど上), ready(falseで準備中トースト), sidebar:[{id,label,icon}], onSidebar(itemId)(選択表示はQNApps.setSideActive(itemId|null)), settings:[{title,rows:[...]}](Settingsパネルの先頭に出る行。書式はJS/qn-settings-ui.jsのbuild。配列か、それを返す関数), shortcuts:[{key,action}]("Space / K"形式で複数キー可), shortcutsNote, mount(viewEl)(初回のみ), onShow(), onHide()})。Keyboardパネルの中身はQNApps.renderShortcuts(hostEl,"<id>")。index.htmlにqn-apps.jsより後で<script>追加。同idのregisterは置き換え。準備中アプリ(PITCH)は末尾のregister。
// 【接点】#pcV2IconBar/#pcV2IconBarBottom/#pcV2IconBarSpacer/#pcV2Layout(player-ui-pc-v2.js build()が作る。出来上がるのを待つ)。アプリ表示中はbody.qn-app-open(player-ui-shared.jsのショートカット無効化に使う)。アプリを開く時QNPLAYERのaudioは一時停止
(function () {
  "use strict";

  var MORE_ICON = '<path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>';
  var CHEVRON_ICON = '<path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>';
  var PLAYER_ICON = '<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>';

  var SP_QUERY = "(max-width: 900px)";

  // 表示名(ヘッダーのロゴ・一覧)。先頭の「QN」は常に色付き。YouTubeアプリは規約上グレーになりうるため名前に「YouTube」を入れない(変えるならここだけ)
  var BRAND = { player: "PLAYER", youtube: "VIDEO", tuner: "TUNER", pitch: "PITCH" };
  function brandName(app) { return (app && BRAND[app.id]) || (app ? app.label.toUpperCase() : "PLAYER"); }
  function brandHtml(app) { return '<span class="qn-brand-qn">QN</span>' + brandName(app); }

  var apps = [];
  var current = null;
  var iconBar = null, host = null, logoBtn = null, flyout = null, scrim = null, flyoutOpen = false, flyoutHideTimer = null, flyoutTimer = null, toastEl = null, toastTimer = null;
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
      btn.querySelector("span").innerHTML = brandHtml(app);
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

  // ロゴ(#qnAppLogoBtn)の真下に左揃えで出す(PC/SP共通)
  function positionFlyout() {
    if (!flyout || !logoBtn) return;
    var lb = logoBtn.getBoundingClientRect();
    var w = flyout.offsetWidth || 220;
    flyout.style.left = Math.max(0, Math.min(lb.left, window.innerWidth - w - 4)) + "px";
    flyout.style.right = "auto";
    flyout.style.top = lb.bottom + "px";
    flyout.style.bottom = "auto";
  }

  // 【v3.48.0】PC/SP共通: アプリ一覧の表示中はアプリ表示領域(#qnAppHost)をメニューの高さ分だけ下へずらし、YouTubeプレイヤーを覆わない(規約)。サイズは変えずtransformだけ、はみ出す下側はclip-pathで切る(アイコンバーに被らせない。プレイヤーは上側なので切れない)
  var shiftCover = null, shiftCoverTimer = null;
  function shiftHostForFlyout(on) {
    if (!host) return;
    var h = 0;
    if (on && current && flyout) {
      // アニメ途中のtransformに左右されないよう、style値とoffsetHeightで計算
      h = Math.max(0, Math.ceil((parseFloat(flyout.style.top) || 0) + flyout.offsetHeight - (parseFloat(host.style.top) || 0)));
    }
    host.style.transition = "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)";
    host.style.transform = h ? "translateY(" + h + "px)" : "";
    host.style.clipPath = h ? "inset(0 0 " + h + "px 0)" : "";
    // ずらして空いた隙間は背景色で塞ぐ(裏のPLAYERが映り込まないように)。ホストより奥(z149)なので、戻る時はホストが上から重なる
    if (!shiftCover) {
      shiftCover = document.createElement("div");
      shiftCover.id = "qnAppShiftCover";
      shiftCover.hidden = true;
      document.body.appendChild(shiftCover);
    }
    if (shiftCoverTimer) { clearTimeout(shiftCoverTimer); shiftCoverTimer = null; }
    if (h) {
      shiftCover.style.top = (parseFloat(host.style.top) || 0) + "px";
      shiftCover.style.left = (parseFloat(host.style.left) || 0) + "px";
      shiftCover.style.height = h + "px";
      shiftCover.hidden = false;
    } else if (!shiftCover.hidden) {
      shiftCoverTimer = setTimeout(function () { shiftCoverTimer = null; if (shiftCover) shiftCover.hidden = true; }, 240);
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
    if (logoBtn) { logoBtn.classList.add("qn-badge-open"); logoBtn.setAttribute("aria-expanded", "true"); }
    shiftHostForFlyout(true);
  }

  function closeFlyout() {
    cancelFlyoutClose();
    if (!flyout || !flyoutOpen) return;
    flyoutOpen = false;
    flyout.classList.remove("qn-flyout-in");
    if (scrim) scrim.classList.remove("qn-scrim-in");
    if (logoBtn) { logoBtn.classList.remove("qn-badge-open"); logoBtn.setAttribute("aria-expanded", "false"); }
    shiftHostForFlyout(false);
    if (flyoutHideTimer) clearTimeout(flyoutHideTimer);
    flyoutHideTimer = setTimeout(function () {
      flyoutHideTimer = null;
      if (flyoutOpen) return;
      flyout.hidden = true;
      if (scrim) scrim.hidden = true;
    }, 280);
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
    var colorBtn = bottomBox ? bottomBox.querySelector('[data-panel-id="settings"]') : null;
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

  // ---------- ヘッダーのロゴ兼アプリ切替(#qnAppLogoBtn。index.htmlにある)。押すと直下にアプリ一覧 ----------
  function buildBadge() {
    logoBtn = $("qnAppLogoBtn");
    if (!logoBtn || logoBtn.__qnBound) return;
    logoBtn.__qnBound = true;
    logoBtn.addEventListener("click", function () {
      haptic();
      if (flyoutOpen) closeFlyout(); else openFlyout();
    });
  }

  function updateBadge() {
    if (!logoBtn) return;
    var app = current || findApp("player");
    if (!app) return;
    var nm = $("appLogoName");
    if (nm && nm.textContent !== brandName(app)) nm.textContent = brandName(app);
    logoBtn.title = "QN" + brandName(app) + " — switch app";
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

  // 【v3.42.0】アプリ表示中の「Settings」パネル(旧Color用ポップを拡張)。一覧(Backup/Import/Color/Keyboard/Transfer)→下層ビュー(戻るボタンで一覧へ)。
  // Backup/Importは本体共通画面(qnBackupMountInto)、Keyboardはrender Shortcuts、Colorは本体のテーマセクションを借りる。閉じる/切替時は借りたものを元へ戻す。関数名のcolorPopは互換のため据え置き
  var colorPop = null, colorSec = null, colorHome = null, colorNext = null, setView = "root", setUI = null;
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

  // 借りている要素を元の場所へ戻す(Color)/退避する(Backup/Importの共通画面)
  function releaseSetView() {
    if (colorSec && colorHome && colorHome.isConnected) {
      if (colorNext && colorNext.parentNode === colorHome) colorHome.insertBefore(colorSec, colorNext);
      else colorHome.appendChild(colorSec);
    }
    colorSec = colorHome = colorNext = null;
    if (typeof window.qnBackupReleaseExternal === "function") window.qnBackupReleaseExternal();
    if (typeof window.qnBackupParts === "function" && colorPop) {
      var parts = window.qnBackupParts();
      var stash = $("pcV2PanelStash");
      if (!stash) { stash = document.createElement("div"); stash.id = "pcV2PanelStash"; stash.style.display = "none"; stash.setAttribute("aria-hidden", "true"); document.body.appendChild(stash); }
      for (var k in parts) if (parts[k] && colorPop.contains(parts[k])) stash.appendChild(parts[k]);
    }
  }

  function setActiveBtn(on) {
    var b = document.querySelector('#pcV2IconBarBottom [data-panel-id="settings"]');
    if (b) b.classList.toggle("qn-app-active", !!on);
  }

  function closeColorPop() {
    if (!colorPop || colorPop.hidden) return;
    releaseSetView();
    colorPop.hidden = true;
    setView = "root";
    setActiveBtn(false);
  }

  var rootScroll = 0; // 一覧から下層へ入る時のスクロール位置(戻ったら復元。一覧を開き直す時は0)
  function showSetView(name, restore) {
    if (!colorPop) return;
    if (name !== "root" && setView === "root") rootScroll = colorPop.querySelector(".qn-colorpanel-body").scrollTop;
    releaseSetView();
    setView = name;
    var head = colorPop.querySelector(".qn-colorpanel-head");
    var body = colorPop.querySelector(".qn-colorpanel-body");
    head.textContent = "";
    body.textContent = "";
    if (name !== "root") {
      var back = QNSettingsUI.backButton(function () { showSetView("root", true); });
      head.appendChild(back);
    }
    var title = document.createElement("span");
    title.className = "pcv2-panel-header-title";
    title.textContent = name === "root" ? "Settings" : QNSettingsUI.LABELS[name];
    head.appendChild(title);
    if (name === "root") {
      // アプリ固有の設定行(register({settings}) = セクション配列 or それを返す関数)を上に、共通の一覧(More)を下に。部品はQNSettingsUI(PLAYER本体と共用)
      var secs = current && current.settings;
      if (typeof secs === "function") secs = secs();
      setUI = QNSettingsUI.build(secs || []);
      var host = setUI.el;
      var ids = ["backup", "import", "color", "keyboard", "transfer"].filter(function (id) {
        if (id === "transfer") return !!(window.QNLibSync && window.QNLibSync.isActive());
        if (id === "color") return !!findColorSection();
        return true;
      });
      host.appendChild(QNSettingsUI.list(ids, function (id) {
        if (id === "transfer") { if (window.QNP2P) window.QNP2P.open(); return; }
        showSetView(id);
      }));
      host.appendChild(QNSettingsUI.versionLine());
      body.appendChild(host);
    } else if (name === "color") {
      var sec = findColorSection();
      if (sec) {
        colorSec = sec; colorHome = sec.parentNode; colorNext = sec.nextSibling;
        body.appendChild(sec);
      }
    } else if (name === "keyboard") {
      var box = document.createElement("div");
      body.appendChild(box);
      renderShortcuts(box, current ? current.id : null);
    } else if (name === "backup" || name === "import") {
      var hostEl = document.createElement("div");
      hostEl.className = name === "backup" ? "qn-pt-sec-backup" : "qn-pt-sec-import";
      body.appendChild(hostEl);
      if (typeof window.qnBackupMountInto === "function") window.qnBackupMountInto(name, hostEl, function () { showSetView("root", true); });
    }
    body.scrollTop = (name === "root" && restore) ? rootScroll : 0;
  }

  function openColorPop() {
    if (!colorPop) {
      colorPop = document.createElement("div");
      colorPop.id = "qnColorPop";
      colorPop.hidden = true;
      colorPop.innerHTML = '<div class="qn-colorpanel-head"></div><div class="qn-colorpanel-body"></div>';
      document.body.appendChild(colorPop);
      iconBar.addEventListener("click", function (e) {
        if (e.target.closest && e.target.closest('[data-panel-id="settings"]')) return;
        closeColorPop();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeColorPop();
      });
      window.addEventListener("resize", positionColorPop);
    }
    showSetView("root");
    colorPop.hidden = false;
    positionColorPop();
    setActiveBtn(true);
  }

  function initColorKeeper() {
    var bottom = $("pcV2IconBarBottom");
    if (!bottom || bottom.__qnColor) return;
    bottom.__qnColor = true;
    bottom.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest('[data-panel-id="settings"]');
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
      if (t && t.closest && (t.closest("#qnAppFlyout") || t.closest("#qnAppLogoBtn"))) return;
      closeFlyout();
    }, true);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeFlyout();
    });
    window.addEventListener("resize", function () { if (flyoutOpen) { positionFlyout(); shiftHostForFlyout(true); } });
    window.addEventListener("orientationchange", closeFlyout);
    iconBar.addEventListener("click", closeFlyout);
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
      mount: def.mount, onShow: def.onShow, onHide: def.onHide,
      settings: def.settings || null
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
  // アイコン・ラベルはplayer-markers.jsのwindow.QN_ROW_ACT(PLAYERのマーカー行のボタンと共通)
  var SW_ICON = window.QN_ROW_ACT.icons;
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
        var kind = a.kind;
        b.className = "qn-swipe-btn is-" + kind;
        b.innerHTML = window.QN_ROW_ACT.html(kind, a.on);
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
              b.querySelector("span").textContent = "Delete";
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
