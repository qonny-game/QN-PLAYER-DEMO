// player-ui-pc-v2.js — 左アイコンバー+中央パネル+右波形の3カラム(SP幅はCSS @media(max-width:900px)で縦積み。DOM/JSはPC/SP共通、常時有効)。
// 【方針】既存DOM(#pinList,#playlistBox,#noteTextArea,Control系input,EQバンド,Exportモーダル中身)はidで参照されるので複製せず、骨組み(#pcV2Layout)へ「移動」する(イベントはそのまま生きる)。
// 依存: player-core.js, player-ui-shared.js, player-control-eq.js, player-export.jsより後(setMobileTab,openEqModal,openExportModal等を呼ぶ)。末尾に旧player-ui-pc.js由来(D&D追加、flattenForPc/restoreForSp)を同居

(function () {
  let built = false;
  let currentPanel = "playlist";
  const PANEL_COLLAPSED_KEY = "qn_panel_collapsed";
  let panelCollapsed = false;
  try { panelCollapsed = localStorage.getItem(PANEL_COLLAPSED_KEY) === "1"; } catch (e) {}
  const bottomBarEffectButtons = {};

  // アイコンバー項目。panelType: tab=既存.mobile-tab-panel表示 / eq=EQモーダル中身 / export=Exportモーダル中身 / action=即実行(現在該当なし、ロジックのみ残す) / close=開いていれば閉じる(SP幅専用)。並び(v3.1.0〜): Library→Markers→Text→Control→Backup→Import(SeekbarはSP専用先頭、Exportは非表示)
  const ICON_ITEMS = [
    {
      id: "seekbar",
      label: "Seekbar",
      panelType: "close",
      icon: '<path d="M4 5h2v14H4zm4 3h2v8H8zm4-6h2v20h-2zm4 4h2v12h-2zm4 3h2v6h-2z"/>'
    },
    {
      id: "playlist",
      label: "Library",
      panelType: "tab",
      tabName: "playlist",
      icon: '<path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>'
    },
    {
      id: "markers",
      label: "Markers",
      panelType: "tab",
      tabName: "markers",
      icon: '<path d="M3 6h12v2H3V6zm0 4h12v2H3v-2zm0 4h7v2H3v-2zm13 0h2v3h3v2h-3v3h-2v-3h-3v-2h3v-3z"/>'
    },
    {
      id: "text",
      label: "Text",
      panelType: "tab",
      tabName: "text",
      icon: '<path d="M5 4v3h5.5v12h3V7H19V4z"/>'
    },
    {
      id: "control",
      label: "Control",
      panelType: "tab",
      tabName: "control",
      icon: '<path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>'
    },
    {
      id: "export",
      label: "Export",
      panelType: "export",
      icon: '<path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zM13 12.67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z"/>',
      hidden: true
    },
    {
      id: "backup",
      label: "Backup",
      bottom: true,
      hidden: true,
      panelType: "backup",
      icon: '<path d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13zM8 13h8v2H8v-2zm0 4h5v2H8v-2z"/>'
    },
    {
      id: "import",
      label: "Import",
      bottom: true,
      hidden: true,
      panelType: "import",
      icon: '<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>'
    },
    {
      // 端末間のMP3転送(player-p2p.js)。同期対象アカウントでログイン中だけ表示(player-sync.jsが表示を切り替える)。パネルは開かずモーダルを開く
      id: "transfer",
      label: "Transfer",
      bottom: true,
      hidden: true,
      panelType: "transfer",
      icon: '<path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>'
    },
    {
      // 【v3.41.0】設定パネル。波形ヘッダーの歯車とアイコンバー最下段(Colorの下)の両方から開く。Backup/Import/Color/Keyboardはここの下層ビュー(戻るボタンで戻る)。アイコンバーのボタンはbottomGroup構築の末尾で明示的に作る
      id: "settings",
      label: "Settings",
      hidden: true,
      panelType: "settings",
      icon: '<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>'
    }
  ];


  function el(html) {
    const div = document.createElement("div");
    div.innerHTML = html.trim();
    return div.firstChild;
  }

  function build() {
    if (built) return;
    built = true;

    const appContainer = document.querySelector(".app-container");
    if (!appContainer) { built = false; return; }

    // ---------- 骨組みDOMを作成（既存要素はまだ動かさず、器だけ用意する） ----------
    const layout = el('<div id="pcV2Layout"></div>');
    const iconBar = el('<div id="pcV2IconBar"></div>');
    const panel = el('<div id="pcV2Panel"></div>');
    const panelHeader = el('<div id="pcV2PanelHeader"></div>');
    const panelBody = el('<div id="pcV2PanelBody"></div>');
    const waveArea = el('<div id="pcV2WaveArea"></div>');

    panel.appendChild(panelHeader);
    panel.appendChild(panelBody);
    // SP幅のシート用: 見出し右端の閉じるボタン(PC幅はCSSで非表示)。ヘッダーは切替のたび作り直すのでパネル直下に1つだけ置く
    const sheetClose = el('<button type="button" class="qn-sheet-close" id="pcV2SheetClose" title="閉じる" aria-label="閉じる"><svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg></button>');
    sheetClose.addEventListener("click", () => { if (typeof closePanelOverlay === "function") closePanelOverlay(); });
    panel.appendChild(sheetClose);
    if (window.QNApps && window.QNApps.sheetDrag) window.QNApps.sheetDrag(panel, panelHeader, () => { if (typeof closePanelOverlay === "function") closePanelOverlay(); });

    ICON_ITEMS.forEach(item => {
      if (item.hidden || item.bottom) return;
      const displayLabel = item.shortLabel || item.label;
      const btn = el(
        '<button type="button" class="pcv2-icon-item" data-panel-id="' + item.id + '" title="' + item.label + '">' +
          '<svg viewBox="0 0 24 24">' + item.icon + '</svg>' +
          '<span>' + displayLabel + '</span>' +
        '</button>'
      );
      btn.addEventListener("click", () => handleIconClick(item));
      iconBar.appendChild(btn);
    });

    const spacer = el('<div id="pcV2IconBarSpacer"></div>');
    const bottomGroup = el('<div id="pcV2IconBarBottom"></div>');
    // 【v3.17.0】下段グループ: Backup/Import/Keyboard/Color(YouTubeと同じ並び)。Backup/ImportはICON_ITEMSのbottom:true項目
    ICON_ITEMS.filter(item => item.bottom && !item.hidden).forEach(item => {
      const btn = el(
        '<button type="button" class="pcv2-icon-item" data-panel-id="' + item.id + '" title="' + item.label + '">' +
          '<svg viewBox="0 0 24 24">' + item.icon + '</svg>' +
          '<span>' + (item.shortLabel || item.label) + '</span>' +
        '</button>'
      );
      btn.addEventListener("click", () => handleIconClick(item));
      if (item.panelType === "transfer" && !(window.QNLibSync && window.QNLibSync.isActive())) btn.style.display = "none";
      bottomGroup.appendChild(btn);
    });
    [
      { id: "keyboard", label: "Keyboard", icon: '<path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM11 8h2v2h-2V8zM11 11h2v2h-2v-2zM8 8h2v2H8V8zM8 11h2v2H8v-2zM5 8h2v2H5V8zm0 3h2v2H5v-2zm10 6H9v-2h6v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/>' },
      { id: "color", label: "Color", icon: '<path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.09-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>' }
    ].forEach(entry => {
      const btn = el(
        '<button type="button" class="pcv2-icon-item" data-panel-id="' + entry.id + '" title="' + entry.label + '">' +
          '<svg viewBox="0 0 24 24">' + entry.icon + '</svg>' +
          '<span>' + entry.label + '</span>' +
        '</button>'
      );
      btn.addEventListener("click", () => openPanelOverlay(entry.id));
      bottomGroup.appendChild(btn);
    });
    // 【v3.41.0】Settings(Colorの下=最下段)。PLAYER表示中はKeyboard/Colorボタンを隠す(CSS)ので実質ここだけが下段に残る。アプリ表示中はColorだけ残る(qn-apps.jsが使用)ので、Keyboard/ColorのDOMは消さない
    const settingsItem = ICON_ITEMS.find(i => i.id === "settings");
    const settingsIconBtn = el(
      '<button type="button" class="pcv2-icon-item" data-panel-id="settings" title="Settings">' +
        '<svg viewBox="0 0 24 24">' + settingsItem.icon + '</svg>' +
        '<span>Settings</span>' +
      '</button>'
    );
    settingsIconBtn.addEventListener("click", () => { if (typeof hapticTap === "function") hapticTap(); openSettingsPanel(); });
    bottomGroup.appendChild(settingsIconBtn);
    iconBar.appendChild(spacer);
    iconBar.appendChild(bottomGroup);

    // アイコンバー右端のスクロールヒント矢印(SP幅専用)。【重要】iconBarをラップするコンテナを作るな(syncBottomBarPosition()が#pcV2Layout直下の#pcV2IconBar直前へbottomBarを挿入するため壊れる)。矢印はlayout直下の子、CSSで絶対配置。表示切替はsetupIconBarScrollHint
    const iconBarScrollHint = el(
      '<div id="pcV2IconBarScrollHint" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>' +
      '</div>'
    );

    layout.appendChild(iconBar);
    layout.appendChild(iconBarScrollHint);
    layout.appendChild(panel);
    layout.appendChild(waveArea);

    // 下段バー構築。group1=Prev/Play/Next/Repeat系、group2=Marker系。playbackTripleBtn/markerNavBtn(3連ボタン)の単位は崩さない。.tripleNavBtnは解体せずgroup1/2に配置し、内部.tripleNavBtn-dividerをCSSで非表示にする
    const bottomBar = el('<div id="pcV2BottomBar"></div>');
    const topControls = document.getElementById("topControls");
    if (topControls) {
      // 【注意】この時点のtopControlsはdocument未接続。document.getElementByIdは不可、topControlsからquerySelectorすること
      const playbackTripleBtn = topControls.querySelector("#playbackTripleBtn");
      const allRepeatToggleBtn = topControls.querySelector("#allRepeatToggleBtn");
      const markerNavBtn = topControls.querySelector("#markerNavBtn");
      const loopToggleBtn = topControls.querySelector("#loopToggleBtn");

      // 【v3.16.0】Startボタン撤去。並び: Track(前)/-10s/Play/+10s/Track(次)/Repeat。Trackアイコンはindex.html元のSVG。頭出しはEnterキー(seekToTrackStart)
      const skipSvg = {
        back: '<path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>',
        fwd: '<path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>'
      };
      function makeSkipBtn(id, kind, label, title, sec) {
        const btn = el(
          '<button type="button" id="' + id + '" class="tripleNavBtn-third" title="' + title + '">' +
            '<svg viewBox="0 0 24 24">' + skipSvg[kind] + '</svg>' +
            '<span class="top-controls-btn-label">' + label + '</span>' +
          '</button>'
        );
        btn.addEventListener("click", () => pcv2SkipBy(sec * skipSec));
        return btn;
      }
      const skipBackBtn = makeSkipBtn("pcV2SkipBackBtn", "back", "-10s", "10秒戻る", -1);
      const skipFwdBtn = makeSkipBtn("pcV2SkipFwdBtn", "fwd", "+10s", "10秒進む", 1);
      const playToggleEl = playbackTripleBtn ? playbackTripleBtn.querySelector("#playToggle") : null;
      if (playbackTripleBtn && playToggleEl) {
        playbackTripleBtn.insertBefore(skipBackBtn, playToggleEl.previousElementSibling || playToggleEl);
        playbackTripleBtn.insertBefore(skipFwdBtn, playToggleEl.nextElementSibling ? playToggleEl.nextElementSibling.nextElementSibling : null);
      }

      // allRepeatToggleBtn/loopToggleBtnはplaybackTripleBtn/markerNavBtnの子にする
      if (playbackTripleBtn && allRepeatToggleBtn) {
        playbackTripleBtn.appendChild(allRepeatToggleBtn);
      }
      // v3.7.0〜: Set A/Set B。Loopの手前、markerNavBtnの子として入れる
      const abGlyph = ch => '<svg viewBox="0 0 24 24"><text x="12" y="18" text-anchor="middle" font-size="17" font-weight="700" font-family="Instrument Sans, sans-serif" fill="currentColor">' + ch + '</text></svg>';
      const setABtn = el('<button type="button" id="setABtn" class="loopbtn ab-set-btn" title="現在位置をA点に（もう一度押すと解除）">' + abGlyph("A") + '<span class="top-controls-btn-label">A --</span></button>');
      const setBBtn = el('<button type="button" id="setBBtn" class="loopbtn ab-set-btn" title="現在位置をB点に（もう一度押すと解除）">' + abGlyph("B") + '<span class="top-controls-btn-label">B --</span></button>');
      setABtn.addEventListener("click", () => { if (typeof setABFromCurrent === "function") setABFromCurrent("A"); });
      setBBtn.addEventListener("click", () => { if (typeof setABFromCurrent === "function") setABFromCurrent("B"); });
      if (markerNavBtn) {
        markerNavBtn.appendChild(setABtn);
        markerNavBtn.appendChild(setBBtn);
      }
      if (markerNavBtn && loopToggleBtn) {
        markerNavBtn.appendChild(loopToggleBtn);
      }
      // 【v3.37.0】loopPreRollControlは下部バーに置かない(設定パネルへ移設。要素は#topControlsに残し、設定パネルを作る時に移す)
      // 【v3.38.0】Clear ABボタンは撤去(A/Bのクリアはマーカー操作側)

      function appendShortcutToTitle(btn, actionLabel) {
        if (!btn || typeof window.QN_SHORTCUTS === "undefined") return;
        const found = window.QN_SHORTCUTS.find(s => s.action === actionLabel);
        if (found) btn.title = (btn.title || "").replace(/\s*\(.*\)$/, "") + " (" + found.key + ")";
      }
      appendShortcutToTitle(document.getElementById("playToggle"), "Play / Pause");
      appendShortcutToTitle(document.getElementById("addPinBtn"), "Add Marker");
      appendShortcutToTitle(loopToggleBtn, "Loop ON/OFF");
      appendShortcutToTitle(allRepeatToggleBtn, "Repeat");
      appendShortcutToTitle(document.getElementById("nextMarkerBtn"), "Next Marker");
      appendShortcutToTitle(document.getElementById("prevMarkerBtn"), "Prev Marker");

      const group1 = el('<div class="pcv2-ctrl-group" id="pcV2BottomBarGroupPlay"></div>');
      if (playbackTripleBtn) group1.appendChild(playbackTripleBtn);

      const timeControlsRow = document.querySelector(".player-section > .time-controls-row");
      if (timeControlsRow) {
        group1.appendChild(timeControlsRow);
      }

      const group2 = el('<div class="pcv2-ctrl-group" id="pcV2BottomBarGroupMarker"></div>');
      if (markerNavBtn) group2.appendChild(markerNavBtn);

      const divider = el('<div class="pcv2-ctrl-divider"></div>');

      Array.from(topControls.querySelectorAll(".top-controls-row")).forEach(row => {
        row.style.display = "none";
      });
      topControls.appendChild(group1);
      topControls.appendChild(divider);
      topControls.appendChild(group2);

      bottomBar.appendChild(topControls);
    }

    const timeRow = el('<div id="pcV2TimeRow"></div>');

    const rightGroup = el('<div class="pcv2-ctrl-group" id="pcV2BottomBarGroupRight"></div>');
    const volumeBtn = el(
      '<button type="button" class="pcv2-ctrl-btn" id="pcV2VolumeBtn" style="position:relative;" title="Volume">' +
        '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>' +
        '<span>Volume</span>' +
        '<div class="pcv2-volume-popup" id="pcV2VolumePopup">' +
          '<div class="pcv2-volume-slider-track"><div class="pcv2-volume-slider-fill" id="pcV2VolumeFill"></div><div class="pcv2-volume-slider-thumb" id="pcV2VolumeThumb"></div></div>' +
          '<div class="pcv2-volume-popup-icon"><svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg></div>' +
        '</div>' +
      '</button>'
    );
    rightGroup.appendChild(volumeBtn);

    [
      { id: "speed", label: "Speed", icon: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 12L15.5 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/><circle cx="12" cy="12" r="1.4"/>' },
      { id: "key", label: "Key", icon: '<path d="M12 5.83L15.17 9l1.41-1.41L12 3 7.41 7.59 8.83 9zm0 12.34L8.83 15l-1.41 1.41L12 21l4.59-4.59L15.17 15z"/>' },
      { id: "eq", label: "EQ", icon: '<path d="M3 6h11M17 6h4M3 12h5M9 12h12M3 18h14M20 18h1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/><circle cx="14" cy="6" r="2.2"/><circle cx="7" cy="12" r="2.2"/><circle cx="17" cy="18" r="2.2"/>' }
    ].forEach(entry => {
      const btn = el(
        '<button type="button" class="pcv2-ctrl-btn" id="pcV2Bottom' + entry.id.charAt(0).toUpperCase() + entry.id.slice(1) + 'Toggle" title="' + entry.label + ' ON/OFF (click to toggle, long-press or right-click to open Control panel)">' +
          '<svg viewBox="0 0 24 24">' + entry.icon + '</svg>' +
          '<span>' + entry.label + '</span>' +
        '</button>'
      );
      btn.addEventListener("click", () => {
        toggleBottomBarEffect(entry.id, btn);
      });
      btn.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        switchPanel("control");
      });
      if (entry.id === "speed" || entry.id === "key") {
        const cap = entry.id === "speed" ? "Speed" : "Key";
        const mk = (sign, dir) => {
          const b = el('<button type="button" class="pcv2-ctrl-btn pcv2-step-btn" title="' + cap + (dir < 0 ? " −" : " ＋") + '">' + sign + '</button>');
          b.addEventListener("click", () => {
            const t = document.getElementById("control" + cap + (dir < 0 ? "DownBtn" : "UpBtn"));
            if (t) t.click();
            updateBottomStepperValues();
          });
          return b;
        };
        const wrap = el('<div class="pcv2-stepper"></div>');
        wrap.appendChild(mk("−", -1));
        const lab = btn.querySelector("span");
        if (lab) lab.innerHTML = '<b>' + (entry.id === "speed" ? "1.00x" : "0") + '</b> ' + cap;
        wrap.appendChild(btn);
        wrap.appendChild(mk("＋", 1));
        rightGroup.appendChild(wrap);
        btn.dataset.stepKind = entry.id;
      } else {
        rightGroup.appendChild(btn);
      }
      bottomBarEffectButtons[entry.id] = btn;
      syncBottomBarEffectButton(entry.id, btn);
    });

    function updateBottomStepperValues() {
      const sp = bottomBarEffectButtons.speed, ky = bottomBarEffectButtons.key;
      if (sp && typeof currentSpeed === "number") {
        const l = sp.querySelector("b"); const v = currentSpeed.toFixed(2) + "x";
        if (l && l.textContent !== v) l.textContent = v;
      }
      if (ky && typeof currentKeySemitones === "number") {
        const l = ky.querySelector("b"); const v = (currentKeySemitones > 0 ? "+" : "") + currentKeySemitones;
        if (l && l.textContent !== v) l.textContent = v;
      }
    }
    updateBottomStepperValues();
    setInterval(updateBottomStepperValues, 250);

    setupControlPanelEffectSync();

    bottomBar.appendChild(el('<div class="pcv2-ctrl-spacer"></div>'));
    bottomBar.appendChild(el('<div class="pcv2-ctrl-divider pcv2-ctrl-divider-sp"></div>'));
    bottomBar.appendChild(rightGroup);

    layout.appendChild(timeRow);

    // ---------- pcV2Root：3カラム部分(layout)と下段バー(bottomBar)を縦に積む ----------
    const root = el('<div id="pcV2Root"></div>');
    root.appendChild(layout);

    // SP幅専用: PLAY/MARKERアンカータブ(#pcV2BottomBar直上)。押すと下段バーの横スクロールをgroup1/group2先頭へジャンプ。PC幅はCSSで非表示
    const anchorTabs = el('<div id="pcV2BottomBarAnchorTabs"></div>');
    const anchorTabPlay = el('<button type="button" class="pcv2-anchor-tab" data-anchor-target="pcV2BottomBarGroupPlay">PLAY</button>');
    const anchorTabMarker = el('<button type="button" class="pcv2-anchor-tab" data-anchor-target="pcV2BottomBarGroupMarker">MARKER</button>');
    function scrollBottomBarToAnchor(targetId) {
      const bar = document.getElementById("pcV2BottomBar");
      const target = document.getElementById(targetId);
      if (!bar || !target) return;
      // offsetLeftは頼れない。getBoundingClientRect差分でscrollLeft相対移動量を出す
      const barRect = bar.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const delta = targetRect.left - barRect.left;
      bar.scrollTo({ left: bar.scrollLeft + delta, behavior: "smooth" });
    }
    anchorTabPlay.addEventListener("click", () => {
      if (typeof hapticTap === "function") hapticTap();
      scrollBottomBarToAnchor("pcV2BottomBarGroupPlay");
    });
    anchorTabMarker.addEventListener("click", () => {
      if (typeof hapticTap === "function") hapticTap();
      scrollBottomBarToAnchor("pcV2BottomBarGroupMarker");
    });
    anchorTabs.appendChild(anchorTabPlay);
    anchorTabs.appendChild(anchorTabMarker);
    root.appendChild(anchorTabs);

    root.appendChild(bottomBar);

    // PLAYタブ位置を#playToggle真上へ動的に合わせる(実測。初期scrollLeft=0基準で1回。呼び出しはsyncBottomBarPosition()のDOM順確定後)
    function alignPlayAnchorTab() {
      const playBtn = document.getElementById("playToggle");
      if (!playBtn || !anchorTabs) return;
      const containerRect = anchorTabs.getBoundingClientRect();
      const playRect = playBtn.getBoundingClientRect();
      const containerPaddingLeft = parseFloat(getComputedStyle(anchorTabs).paddingLeft) || 0;
      const playCenter = playRect.left + playRect.width / 2 - containerRect.left - containerPaddingLeft;
      const tabWidth = anchorTabPlay.offsetWidth || 0;
      const left = Math.max(0, playCenter - tabWidth / 2);
      anchorTabPlay.style.marginLeft = left + "px";
    }

    appContainer.parentNode.insertBefore(root, appContainer.nextSibling);

    // 【SP幅】SPは「アイコンバー最下部、その上にコントロールバー」。bottomBarは#pcV2Root直下、iconBarは#pcV2Layout内で階層が違いCSS orderでは不可→JSでDOM移動。PC幅に戻る時は元位置(#pcV2Root直下、layoutの後)へ
    syncBottomBarPosition();
    window.addEventListener("resize", syncBottomBarPosition);

    requestAnimationFrame(alignPlayAnchorTab);
    window.addEventListener("resize", alignPlayAnchorTab);

    setupIconBarScrollHint();

    syncTimeRowPosition();
    window.addEventListener("resize", syncTimeRowPosition);

    const appTitle = document.getElementById("appTitle");
    const vbarContainer = document.getElementById("vbarContainer");


    const waveHead = el('<div id="pcV2WaveHead"></div>');
    if (appTitle) waveHead.appendChild(appTitle);
    waveArea.appendChild(waveHead);
    if (vbarContainer) waveArea.appendChild(vbarContainer);
    // waveHead確定後に時刻行の置き場所を確定(先のsyncTimeRowPosition()初回はwaveHead未生成で空振り)
    syncTimeRowPosition();
    // シークバー1本の秒数設定(歯車)。位置は常に右端(CSS order)。時刻行がSP⇔PCで出入りしても順序が崩れない
    waveHead.appendChild(QNBars.createGearButton());
    QNBars.setOpenSettings(() => openSettingsPanel());
    // 設定パネルの中身を先に作ってstashへ(プリロード操作要素を下部バーから外すため。let宣言より後に実行するrAF)
    requestAnimationFrame(() => { const sb = ensureSettingsBody(); if (!sb.parentNode) getPanelStash().appendChild(sb); });
    syncTimeRowPosition();

    const waveAddAudioBtn = el(
      '<button type="button" class="panel-fab-btn panel-addfile-btn" id="pcV2WaveAddAudioBtn" title="Add Audio">' +
        '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>' +
        '<span>AUDIO</span>' +
      '</button>'
    );
    waveAddAudioBtn.addEventListener("click", () => {
      const fileInputEl = document.getElementById("fileInput");
      if (fileInputEl) fileInputEl.click();
    });
    // 【v2.13.6】ADD AUDIOの右にADD MARKER。横並び入れ物#pcV2WaveFabRowに入れ、右下固定は入れ物側
    const waveAddMarkerBtn = el(
      '<button type="button" class="panel-fab-btn panel-addfile-btn" id="pcV2WaveAddMarkerBtn" title="Add Marker">' +
        '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>' +
        '<span>MARKER</span>' +
      '</button>'
    );
    waveAddMarkerBtn.addEventListener("click", () => {
      if (typeof addCurrentPin === "function") addCurrentPin();
    });
    const waveFabRow = el('<div id="pcV2WaveFabRow"></div>');
    waveFabRow.appendChild(waveAddAudioBtn);
    waveFabRow.appendChild(waveAddMarkerBtn);
    // 【v3.38.0】MARKERの右に再生/停止ボタン(#playToggleを押すのと同じ。アイコンはaudioのplay/pauseに追従)
    const waveFabPlayBtn = el(
      '<button type="button" class="panel-fab-btn panel-fab-play-btn" id="pcV2WaveFabPlayBtn" title="Play / Pause">' +
        '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' +
      '</button>'
    );
    waveFabPlayBtn.addEventListener("click", () => { if (typeof togglePlay === "function") togglePlay(); });
    const syncFabPlay = () => {
      const playing = !audio.paused;
      waveFabPlayBtn.classList.toggle("is-playing", playing);
      waveFabPlayBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="' + (playing ? "M6 19h4V5H6v14zm8-14v14h4V5h-4z" : "M8 5v14l11-7z") + '"/></svg>';
    };
    ["play", "pause", "ended", "emptied", "loadedmetadata"].forEach(n => audio.addEventListener(n, syncFabPlay));
    waveFabRow.appendChild(waveFabPlayBtn);
    waveArea.appendChild(waveFabRow);

    const basicPanelBox = document.querySelector(".basic-panel-box");
    if (basicPanelBox) basicPanelBox.style.display = "none";

    setupVolumeControl();

    initPanels();

    const isSpWidthInit = isSpWidthNow();
    if (isSpWidthInit) {
      closePanelOverlay();
    } else {
      switchPanel("playlist", { keepCollapsed: true });
    }
    applyCollapse();
    window.addEventListener("resize", applyCollapse);
  }

  // ---------- パネル格納（PC幅・v3.14.0） ----------
  function isSpWidthNow() {
    return window.matchMedia("(max-width: 900px)").matches;
  }
  function isCollapsed() {
    return panelCollapsed && !isSpWidthNow();
  }
  function applyCollapse() {
    const layoutEl = document.getElementById("pcV2Layout");
    if (!layoutEl) return;
    const collapsed = isCollapsed();
    layoutEl.classList.toggle("pcv2-collapsed", collapsed);
    document.querySelectorAll("#pcV2IconBar .pcv2-icon-item").forEach(btn => {
      btn.classList.toggle(
        "active",
        !collapsed && btn.getAttribute("data-panel-id") === currentPanel
      );
    });
  }
  function setCollapsed(on) {
    panelCollapsed = !!on;
    try { localStorage.setItem(PANEL_COLLAPSED_KEY, panelCollapsed ? "1" : "0"); } catch (e) {}
    applyCollapse();
  }

  function setupVolumeControl() {
    const btn = document.getElementById("pcV2VolumeBtn");
    const popup = document.getElementById("pcV2VolumePopup");
    const track = popup ? popup.querySelector(".pcv2-volume-slider-track") : null;
    const fill = document.getElementById("pcV2VolumeFill");
    const thumb = document.getElementById("pcV2VolumeThumb");
    if (!btn || !popup || !track) return;

    // 【v2.13.6】ポップアップはbody直下+position:fixed(SP幅の#pcV2BottomBarはoverflow-x:autoで内部のabsolute子が切り取られるため)
    document.body.appendChild(popup);

    function applyVisual(ratio) {
      const pct = Math.max(0, Math.min(1, ratio)) * 100;
      if (fill) fill.style.height = pct + "%";
      if (thumb) thumb.style.bottom = pct + "%";
    }

    function positionPopup() {
      const r = btn.getBoundingClientRect();
      popup.style.left = (r.left + r.width / 2) + "px";
      popup.style.top = (r.top - 10) + "px";
    }

    function closePopup() {
      popup.classList.remove("open");
      btn.classList.remove("is-open");
    }

    const controlVolumeEl = document.getElementById("controlVolume");
    applyVisual(controlVolumeEl ? parseFloat(controlVolumeEl.value) : (typeof audio !== "undefined" ? audio.volume : 0.8));

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (popup.classList.contains("open")) {
        closePopup();
      } else {
        applyVisual(typeof audio !== "undefined" ? audio.volume : 0.8);
        positionPopup();
        popup.classList.add("open");
        btn.classList.add("is-open");
      }
    });
    document.addEventListener("click", closePopup);
    popup.addEventListener("click", (e) => e.stopPropagation());
    window.addEventListener("resize", closePopup);
    const bottomBarEl = document.getElementById("pcV2BottomBar");
    if (bottomBarEl) bottomBarEl.addEventListener("scroll", closePopup, { passive: true });

    function setFromClientY(clientY) {
      const rect = track.getBoundingClientRect();
      const ratio = 1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      applyVisual(ratio);
      if (typeof audio !== "undefined") audio.volume = ratio;
      if (controlVolumeEl) {
        controlVolumeEl.value = ratio;
        controlVolumeEl.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }

    const dragArea = popup;
    dragArea.style.touchAction = "none";
    dragArea.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".pcv2-volume-popup-icon")) return;
      e.stopPropagation();
      e.preventDefault();
      setFromClientY(e.clientY);
      try { dragArea.setPointerCapture(e.pointerId); } catch (err) {}
      function move(ev) { setFromClientY(ev.clientY); }
      function up(ev) {
        dragArea.removeEventListener("pointermove", move);
        dragArea.removeEventListener("pointerup", up);
        dragArea.removeEventListener("pointercancel", up);
        try { dragArea.releasePointerCapture(ev.pointerId); } catch (err) {}
      }
      dragArea.addEventListener("pointermove", move);
      dragArea.addEventListener("pointerup", up);
      dragArea.addEventListener("pointercancel", up);
    });
  }

  let settingsBody, controlBody, markersBody, playlistBody, textBody, eqBody, exportBody, exportFooter;
  let backupBody, backupFooter, importBody, importFooter;

  function initPanels() {
    controlBody = document.querySelector('.mobile-tab-panel[data-tab-panel="control"]');
    markersBody = document.querySelector('.mobile-tab-panel[data-tab-panel="markers"]');
    playlistBody = document.querySelector('.mobile-tab-panel[data-tab-panel="playlist"]');
    textBody = document.querySelector('.mobile-tab-panel[data-tab-panel="text"]');

    const eqModal = document.getElementById("eqModalOverlay");
    eqBody = eqModal ? eqModal.querySelector(".export-modal-body") : null;

    const exportModal = document.getElementById("exportModalOverlay");
    exportBody = exportModal ? exportModal.querySelector(".export-modal-body") : null;
    exportFooter = exportModal ? exportModal.querySelector(".export-modal-footer") : null;


    if (typeof window.qnBackupParts === "function") {
      const bk = window.qnBackupParts();
      backupBody = bk.backupBody; backupFooter = bk.backupFooter;
      importBody = bk.importBody; importFooter = bk.importFooter;
    }

    const fullscreenBtn = document.getElementById("noteTextFullscreenBtn");
    let holder = document.getElementById("pcV2TextControlsHolder");
    if (!holder) {
      holder = el('<div id="pcV2TextControlsHolder" style="display:none;"></div>');
      document.body.appendChild(holder);
    }
    if (fullscreenBtn) holder.appendChild(fullscreenBtn);
  }

  // 【v3.38.0】送り戻しボタンの秒数(設定パネルで5/10/15/30/60。localStorage qn_skip_sec、既定10)。ボタンのラベル/タイトルもここで更新
  const SKIP_OPTIONS = [5, 10, 15, 30, 60];
  let skipSec = 10;
  try {
    const v = parseInt(localStorage.getItem("qn_skip_sec"), 10);
    if (SKIP_OPTIONS.indexOf(v) >= 0) skipSec = v;
  } catch (e) {}
  function applySkipLabels() {
    const bk = document.getElementById("pcV2SkipBackBtn");
    const fw = document.getElementById("pcV2SkipFwdBtn");
    if (bk) {
      const l = bk.querySelector(".top-controls-btn-label");
      if (l) l.textContent = "-" + skipSec + "s";
      bk.title = skipSec + "秒戻る";
    }
    if (fw) {
      const l = fw.querySelector(".top-controls-btn-label");
      if (l) l.textContent = "+" + skipSec + "s";
      fw.title = skipSec + "秒進む";
    }
  }
  function setSkipSec(v) {
    if (SKIP_OPTIONS.indexOf(v) < 0) return;
    skipSec = v;
    try { localStorage.setItem("qn_skip_sec", String(v)); } catch (e) {}
    applySkipLabels();
  }
  requestAnimationFrame(applySkipLabels);

  function pcv2SkipBy(sec) {
    if (typeof audio === "undefined" || !audio || !isFinite(audio.duration) || audio.duration <= 0) return;
    if (typeof hapticTap === "function") hapticTap();
    beginSeek();
    const t = Math.max(0, Math.min(audio.duration, audio.currentTime + sec));
    audio.currentTime = t;
    prevTime = t;
    setTimeout(() => { isSeeking = false; }, 150);
  }

  function syncBottomBarPosition() {
    const bottomBar = document.getElementById("pcV2BottomBar");
    const anchorTabs = document.getElementById("pcV2BottomBarAnchorTabs");
    const layoutEl = document.getElementById("pcV2Layout");
    const iconBar = document.getElementById("pcV2IconBar");
    const rootEl = document.getElementById("pcV2Root");
    if (!bottomBar || !layoutEl || !iconBar || !rootEl) return;

    const isSpWidth = isSpWidthNow();
    if (isSpWidth) {
      // anchorTabsはbottomBarの直前。bottomBarを先に動かし、その直前にanchorTabsを挿す
      if (bottomBar.nextSibling !== iconBar || bottomBar.parentElement !== layoutEl) {
        layoutEl.insertBefore(bottomBar, iconBar);
      }
      if (anchorTabs && (anchorTabs.nextSibling !== bottomBar || anchorTabs.parentElement !== layoutEl)) {
        layoutEl.insertBefore(anchorTabs, bottomBar);
      }
    } else {
      if (bottomBar.parentElement !== layoutEl || layoutEl.lastElementChild !== bottomBar) {
        layoutEl.appendChild(bottomBar);
      }
      if (anchorTabs && (anchorTabs.parentElement !== layoutEl || anchorTabs.nextSibling !== bottomBar)) {
        layoutEl.insertBefore(anchorTabs, bottomBar);
      }
    }
  }

  // スクロールヒント矢印: 右にスクロール余地がある間だけ表示(PC幅はCSSで常時非表示)
  function updateIconBarScrollHint() {
    const iconBar = document.getElementById("pcV2IconBar");
    const hint = document.getElementById("pcV2IconBarScrollHint");
    if (!iconBar || !hint) return;

    const remaining = iconBar.scrollWidth - iconBar.clientWidth - iconBar.scrollLeft;
    const canScrollMore = remaining > 1;
    hint.classList.toggle("visible", canScrollMore);
  }

  function setupIconBarScrollHint() {
    const iconBar = document.getElementById("pcV2IconBar");
    if (!iconBar) return;

    iconBar.addEventListener("scroll", updateIconBarScrollHint, { passive: true });
    window.addEventListener("resize", updateIconBarScrollHint);

    if (typeof ResizeObserver === "function") {
      const ro = new ResizeObserver(updateIconBarScrollHint);
      ro.observe(iconBar);
    }

    updateIconBarScrollHint();
    requestAnimationFrame(updateIconBarScrollHint);
  }

  // 【v3.37.0】時刻行(.time-controls-row)はPC/SPとも波形ヘッダー(#pcV2WaveHead)の歯車の左。#pcV2TimeRowは常に非表示の空コンテナ(互換のため残す)
  function syncTimeRowPosition() {
    // querySelector(".time-controls-row")だけだと別行(adjust-controls-row等)を誤取得する。#timeDisplayからclosestで取る
    const timeDisplay = document.getElementById("timeDisplay");
    const timeControlsRow = timeDisplay ? timeDisplay.closest(".time-controls-row") : null;
    const waveHead = document.getElementById("pcV2WaveHead");
    if (!timeControlsRow || !waveHead) return;
    const gear = document.getElementById("qnBarGearBtn");
    if (timeControlsRow.parentElement !== waveHead || (gear && gear.parentElement === waveHead && timeControlsRow.nextSibling !== gear)) {
      waveHead.insertBefore(timeControlsRow, gear && gear.parentElement === waveHead ? gear : null);
    }
  }

  function handleIconClick(item) {
    if (typeof hapticTap === "function") hapticTap();

    if (item.panelType === "action") {
      const fileInputEl = document.getElementById("fileInput");
      if (fileInputEl) fileInputEl.click();
      return;
    }

    if (item.panelType === "close") {
      closePanelOverlay();
      return;
    }

    if (item.panelType === "transfer") {
      if (window.QNP2P) window.QNP2P.open();
      return;
    }

    openPanelOverlay(item.id);
  }

  // SP幅: パネルはヘッダー直下〜下部バー直上のオーバーレイ(#pcV2Layoutの.pcv2-panel-openで切替。PC幅は常時表示)。同アイコン再タップで閉じる。アイコンバー上段/下段の共通入口
  function openPanelOverlay(panelId) {
    const layoutEl = document.getElementById("pcV2Layout");
    const isSpWidth = isSpWidthNow();
    if (isSpWidth && layoutEl) {
      const alreadyOpen = layoutEl.classList.contains("pcv2-panel-open");
      const isSamePanel = currentPanel === panelId;
      if (alreadyOpen && isSamePanel) {
        closePanelOverlay();
        return;
      }
      updatePcv2BottomBarsHeightVar();
      clearTimeout(sheetCloseTimer);
      layoutEl.classList.remove("pcv2-panel-closing");
      layoutEl.classList.add("pcv2-panel-open");
    } else if (!isSpWidth && layoutEl && !panelCollapsed && currentPanel === panelId) {
      setCollapsed(true);
      return;
    }

    switchPanel(panelId);
  }

  // パネル全面表示時にバーを隠さないよう、#pcV2BottomBar+#pcV2IconBarの実高さを--pcv2-bottom-bars-heightへ反映(開くたび実測。固定値だとバーが隠れ操作不能になる)
  function updatePcv2BottomBarsHeightVar() {
    const layoutEl = document.getElementById("pcV2Layout");
    const bottomBar = document.getElementById("pcV2BottomBar");
    const iconBar = document.getElementById("pcV2IconBar");
    if (!layoutEl || !bottomBar || !iconBar) return;
    const total = bottomBar.getBoundingClientRect().height + iconBar.getBoundingClientRect().height;
    layoutEl.style.setProperty("--pcv2-bottom-bars-height", total + "px");
  }

  window.addEventListener("resize", () => {
    if (document.getElementById("pcV2Layout")?.classList.contains("pcv2-panel-open")) {
      updatePcv2BottomBarsHeightVar();
    }
  });

  // 【v3.41.0】設定の下層ビュー(Backup/Import/Color/Keyboard)を開いている間true。ヘッダーに戻るボタンを出し、アイコンバーは「Settings」を点灯させる
  let settingsSub = false, settingsScroll = 0;
  function openSettingsPanel() {
    if (settingsSub) { switchPanel("settings"); return; }
    openPanelOverlay("settings");
  }
  function openSettingsSub(id) {
    if (id === "transfer") { if (window.QNP2P) window.QNP2P.open(); return; }
    const pb = document.getElementById("pcV2PanelBody");
    if (pb) settingsScroll = pb.scrollTop; // 戻った時に同じ位置を見せる
    settingsSub = true;
    switchPanel(id, { fromSettings: true });
  }
  function addSettingsBackBtn(panelHeader) {
    if (!settingsSub) return;
    const back = QNSettingsUI.backButton(() => switchPanel("settings"));
    panelHeader.appendChild(back);
  }

  // 閉じる時は下へスライドしてから非表示(.pcv2-panel-closing=アニメ中だけパネルを残す)。再度開く操作で中断できる
  let sheetCloseTimer = 0;
  function closePanelOverlay() {
    const layoutEl = document.getElementById("pcV2Layout");
    if (layoutEl && layoutEl.classList.contains("pcv2-panel-open") && !layoutEl.classList.contains("pcv2-panel-closing")) {
      layoutEl.classList.add("pcv2-panel-closing");
      clearTimeout(sheetCloseTimer);
      sheetCloseTimer = setTimeout(() => {
        layoutEl.classList.remove("pcv2-panel-open", "pcv2-panel-closing");
      }, 230);
    } else if (layoutEl) layoutEl.classList.remove("pcv2-panel-open", "pcv2-panel-closing");

    currentPanel = "seekbar";
    settingsSub = false;
    settingsScroll = 0;
    document.querySelectorAll("#pcV2IconBar .pcv2-icon-item").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-panel-id") === "seekbar");
    });
  }

  window.qnPcv2DismissAuxPanel = function () {
    if (currentPanel !== "backup" && currentPanel !== "import") return;
    if (settingsSub) { switchPanel("settings"); return; }
    const isSpWidth = isSpWidthNow();
    if (isSpWidth) {
      closePanelOverlay();
    } else {
      switchPanel("playlist");
    }
  };

  function buildPanelFab(panelId) {
    const fab = el('<div id="pcV2PanelFab"></div>');

    const addGroup = el('<div class="pcv2-fab-addgroup"></div>');

    if (panelId === "playlist") {
      const addFileBtn = el(
        '<button type="button" class="panel-fab-btn panel-addfile-btn" id="pcV2LibraryAddFileBtn" title="Add Audio">' +
          '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>' +
          '<span>AUDIO</span>' +
        '</button>'
      );
      addFileBtn.addEventListener("click", () => {
        const fileInputEl = document.getElementById("fileInput");
        if (fileInputEl) fileInputEl.click();
      });
      addGroup.appendChild(addFileBtn);

      // 【v3.24.0】フォルダ作成。作成直後は名前入力状態になる
      const newFolderBtn = el(
        '<button type="button" class="panel-fab-btn panel-addfile-btn" id="pcV2NewFolderBtn" title="New Folder">' +
          '<svg viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-1 8h-3v3h-2v-3h-3v-2h3V9h2v3h3v2z"/></svg>' +
          '<span>FOLDER</span>' +
        '</button>'
      );
      newFolderBtn.addEventListener("click", () => {
        if (typeof isUnlocked === "function" && !isUnlocked()) {
          if (typeof swShowUnlockToast === "function") swShowUnlockToast("無料版ではフォルダ分けはできません。");
          return;
        }
        if (typeof addPlaylistFolderInteractive === "function") addPlaylistFolderInteractive();
      });
      addGroup.appendChild(newFolderBtn);
    }

    if (panelId === "markers") {
      const addMarkerBtn = el(
        '<button type="button" class="panel-fab-btn panel-addfile-btn" id="pcV2AddMarkerBtn" title="Add Marker">' +
          '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>' +
          '<span>MARKER</span>' +
        '</button>'
      );
      addMarkerBtn.addEventListener("click", () => {
        if (typeof addCurrentPin === "function") addCurrentPin();
      });
      addGroup.appendChild(addMarkerBtn);
    }

    fab.appendChild(addGroup);

    const deleteBtn = el(
      '<button type="button" class="panel-fab-btn panel-fab-delete-btn" id="pcV2DeleteSelectedBtn" disabled>' +
        '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>' +
        '<span>Delete</span>' +
      '</button>'
    );
    deleteBtn.addEventListener("click", () => deleteSelectedItems(panelId));
    if (panelId === "playlist") {
      // 【v3.24.0】選択した曲をフォルダへ移動(編集モードのみ表示。Deleteと同じ選択を使う)
      const moveBtn = el(
        '<button type="button" class="panel-fab-btn panel-fab-move-btn" id="pcV2MoveSelectedBtn" disabled>' +
          '<svg viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 11l-4-4h3V9h2v4h3l-4 4z"/></svg>' +
          '<span>Move</span>' +
        '</button>'
      );
      moveBtn.addEventListener("click", () => moveSelectedItems(moveBtn));
      fab.appendChild(moveBtn);
    }
    fab.appendChild(deleteBtn);

    const editBtn = el(
      '<button type="button" class="panel-fab-btn panel-edit-btn" id="pcV2' + (panelId === "markers" ? "Markers" : "Playlist") + 'EditBtn" title="Edit ' + panelId + '">' +
        '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>' +
        '<span>EDIT</span>' +
      '</button>'
    );
    editBtn.addEventListener("click", () => toggleEditMode(panelId));
    fab.appendChild(editBtn);

    return fab;
  }

  function getPanelStash() {
    let stash = document.getElementById("pcV2PanelStash");
    if (!stash) {
      stash = el('<div id="pcV2PanelStash" style="display:none;" aria-hidden="true"></div>');
      document.body.appendChild(stash);
    }
    return stash;
  }

  function stashPanelContents(panelBody) {
    const stash = getPanelStash();
    const keep = [
      settingsBody, controlBody, eqDividerEl, markersBody, playlistBody, textBody, eqBody,
      exportBody, exportFooter, backupBody, backupFooter, importBody, importFooter,
      pcv2QnSections.color, pcv2QnSections.keyboard
    ];
    keep.forEach(node => {
      if (node && node.parentNode === panelBody) stash.appendChild(node);
    });
  }


  // ---------- 設定パネル(v3.37.0 / v3.44.0で共通部品化) ----------
  // 部品はJS/qn-settings-ui.js(アプリのSettingsと共用)。中身は初回に1度だけ作り、パネルを離れる時はstashへ退避(stashPanelContents)。
  // プリロード操作は既存の#loopPreRollControl要素をそのまま移す(player-controls.jsのハンドラを生かす)。新しい項目はここのrowsに足すだけ。
  let settingsUI = null;
  function ensureSettingsBody() {
    if (settingsBody) return settingsBody;
    const preCtl = document.getElementById("loopPreRollControl");
    const rowsBar = [
      { label: "Bar length", hint: "1 bar = seconds", type: "stepper", values: () => QNBars.OPTIONS, get: () => QNBars.getSec(), set: v => QNBars.setSec(v), fmt: v => v + "s" },
      { label: "Bars on screen", hint: "Rows shown at once", type: "stepper", values: () => QNBars.ROWS_OPTIONS, get: () => QNBars.getRows(), set: v => QNBars.setRows(v), fmt: v => v === 0 ? "Auto" : String(v) },
      { label: "Follow playhead", hint: "Auto-scroll while playing", type: "switch", get: () => QNBars.getFollow(), set: on => QNBars.setFollow(on) },
      { label: "Pause after scrolling", hint: "Seconds before follow resumes", type: "stepper",
        values: () => { const a = []; for (let i = QNBars.PAUSE_MIN; i <= QNBars.PAUSE_MAX; i++) a.push(i); return a; },
        get: () => QNBars.getPause(), set: v => QNBars.setPause(v), fmt: v => v + "s", disabledWhen: () => !QNBars.getFollow() }
    ];
    const rowsPlay = [
      { label: "Loop pre/post-roll", hint: "Seconds added around loop", type: "node", node: preCtl },
      { label: "Skip buttons", hint: "Seconds for back / forward", type: "stepper", values: () => SKIP_OPTIONS, get: () => skipSec, set: v => setSkipSec(v), fmt: v => v + "s" },
      { label: "Library repeat range", hint: "Auto Next / Repeat scope", type: "stepper", values: () => ["folder", "all"],
        get: () => (typeof getAutoNextScope === "function" ? getAutoNextScope() : "folder"), set: v => { if (typeof setAutoNextScope === "function") setAutoNextScope(v); }, fmt: v => v === "folder" ? "Folder" : "All" },
      { label: "Speed step", hint: "For the speed − / ＋ buttons", type: "stepper", values: () => (typeof SPEED_STEP_OPTIONS !== "undefined" ? SPEED_STEP_OPTIONS : [1, 2, 5, 10]),
        get: () => (typeof getSpeedStepPct === "function" ? getSpeedStepPct() : 5), set: v => { if (typeof setSpeedStepPct === "function") setSpeedStepPct(v); }, fmt: v => v + "%" }
    ];
    if (!preCtl) rowsPlay.shift();
    settingsUI = QNSettingsUI.build([{ title: "Seek bar", rows: rowsBar }, { title: "Playback", rows: rowsPlay }]);
    const body = settingsUI.el;
    body.id = "pcV2SettingsBody";
    const more = QNSettingsUI.list(["backup", "import", "color", "keyboard", "transfer"], openSettingsSub);
    const tr = more.querySelector('[data-panel-id="transfer"]');
    if (tr && !(window.QNLibSync && window.QNLibSync.isActive())) tr.style.display = "none";
    body.appendChild(more);
    settingsBody = body;
    return body;
  }

  function syncSettingsBody() {
    if (settingsUI) settingsUI.sync();
  }

  function switchPanel(panelId, opts) {
    currentPanel = panelId;
    if (!(opts && opts.fromSettings)) settingsSub = false;

    // 【v3.14.0】格納中に外部(右クリック・Backup完了等)から呼ばれたら必ず展開してから表示。初期表示のみkeepCollapsed:trueで格納維持
    if (panelCollapsed && !(opts && opts.keepCollapsed)) setCollapsed(false);

    syncAllBottomBarEffectButtons();

    if (panelId !== "markers" && editModeState.markers) {
      editModeState.markers = false;
    }
    if (panelId !== "playlist" && editModeState.playlist) {
      editModeState.playlist = false;
    }

    document.querySelectorAll("#pcV2IconBar .pcv2-icon-item").forEach(btn => {
      btn.classList.toggle("active", !isCollapsed() && btn.getAttribute("data-panel-id") === (settingsSub ? "settings" : panelId));
    });

    const panelBody = document.getElementById("pcV2PanelBody");
    const panelHeader = document.getElementById("pcV2PanelHeader");
    if (!panelBody || !panelHeader) return;

    const textControlsHolder = document.getElementById("pcV2TextControlsHolder");
    if (textControlsHolder) {
      const fullscreenBtnEl = document.getElementById("noteTextFullscreenBtn");
      if (fullscreenBtnEl && panelHeader.contains(fullscreenBtnEl)) {
        textControlsHolder.appendChild(fullscreenBtnEl);
      }
    }

    // 【v3.24.0】Library見出しに置いたAuto Nextスコープボタンを、ヘッダーを消す前に退避(innerHTML=""で破棄されるため)
    const scopeBtnEl = document.getElementById("playlistScopeBtn");
    if (scopeBtnEl && textControlsHolder && panelHeader.contains(scopeBtnEl)) {
      textControlsHolder.appendChild(scopeBtnEl);
    }

    // 【v2.15.1】前回の中身は#pcV2PanelStash(非表示の退避場所)へ移す。innerHTML=""で切り離すと#pinList/#playlistBox/#noteTextArea等がdocumentから消え、曲切替時の更新が空振りして前の曲が表示される(GOTCHAS.md)
    stashPanelContents(panelBody);
    panelBody.innerHTML = "";
    panelHeader.innerHTML = "";
    // pcv2-panel-*クラスだけ入れ替える(markers-edit-mode等には触れない)
    Array.from(panelBody.classList)
      .filter(c => c.indexOf("pcv2-panel-") === 0)
      .forEach(c => panelBody.classList.remove(c));
    panelBody.classList.add("pcv2-panel-" + panelId);
    if (panelId !== "markers") panelBody.classList.remove("markers-edit-mode");
    if (panelId !== "playlist") panelBody.classList.remove("playlist-edit-mode");

    if (panelId === "keyboard" || panelId === "color") {
      addSettingsBackBtn(panelHeader);
      const titleSpan = el('<span class="pcv2-panel-header-title"></span>');
      titleSpan.textContent = panelId === "keyboard" ? "Keyboard" : "Color";
      panelHeader.appendChild(titleSpan);
      renderQnMenuSectionPanel(panelId, panelBody);
      return;
    }

    const item = ICON_ITEMS.find(i => i.id === panelId);
    if (!item) return;

    addSettingsBackBtn(panelHeader);
    const titleSpan = el('<span class="pcv2-panel-header-title"></span>');
    titleSpan.textContent = item.label;
    panelHeader.appendChild(titleSpan);

    if (item.panelType === "tab") {
      if (panelId === "control") {
        if (controlBody) panelBody.appendChild(controlBody);
        if (eqBody) {
          if (typeof setupAudioGraph === "function") {
            setupAudioGraph().catch(err => console.warn("setupAudioGraph failed:", err));
          }
          appendEqDivider(panelBody);
          panelBody.appendChild(eqBody);
        }
      } else if (panelId === "markers") {
        if (markersBody) panelBody.appendChild(markersBody);
        attachDisableGuard("markers");
        panelBody.appendChild(buildPanelFab(panelId));
      } else if (panelId === "playlist") {
        if (playlistBody) panelBody.appendChild(playlistBody);
        attachDisableGuard("playlist");
        panelBody.appendChild(buildPanelFab(panelId));
        if (scopeBtnEl) panelHeader.appendChild(scopeBtnEl);
        if (typeof syncAutoNextScopeButton === "function") syncAutoNextScopeButton();
      } else if (panelId === "text") {
        if (textBody) panelBody.appendChild(textBody);
        setupTextPanelHeaderControls();
      }
      // 既存のタブ状態・関連ロジック(ハイライト、Text自動保存登録等)を呼び出し元と合わせる
      if (typeof setMobileTab === "function") setMobileTab(panelId);
    } else if (item.panelType === "export") {
      if (typeof openExportModal === "function") openExportModal();
      const exportModalOverlay = document.getElementById("exportModalOverlay");
      if (exportModalOverlay) exportModalOverlay.classList.remove("open");
      if (exportBody) panelBody.appendChild(exportBody);
      if (exportFooter) panelBody.appendChild(exportFooter);
    } else if (item.panelType === "settings") {
      panelBody.appendChild(ensureSettingsBody());
      syncSettingsBody();
      panelBody.scrollTop = settingsScroll; // 下層から戻った時は元の位置(通常の表示は0)
      settingsScroll = 0;
    } else if (item.panelType === "backup" || item.panelType === "import") {
      panelBody.classList.add("pcv2-panel-aux");
      if (typeof window.qnBackupMount === "function") window.qnBackupMount(item.panelType, panelBody);
    }
    if (item.panelType !== "backup" && item.panelType !== "import") {
      panelBody.classList.remove("pcv2-panel-aux");
    }

    if (typeof syncTopControlsSpacerHeight === "function") {
      syncTopControlsSpacerHeight();
    }
  }

  // Markers/PlaylistのEdit: 表示非表示・メモ編集を隠し.del-btnだけ表示。編集中の.del-btnクリックは選択トグル(赤丸+チェック)のみ、#pcV2DeleteSelectedBtnで一括削除。player-markers.js/player-playlist.jsのDOM生成・削除ロジックは触らず、キャプチャフェーズで.del-btnを奪う。editModeStateはwindow経由で読み取り専用判定を公開
  const editModeState = { markers: false, playlist: false };
  window.isPlaylistEditMode = () => editModeState.playlist;
  window.isMarkersEditMode = () => editModeState.markers;
  const selectedIndices = { markers: new Set(), playlist: new Set() };
  // 削除選択が1件でもある間はSKIP/PLAYを押せなくする(renderPlaylist()がDOMを作り直すと選択表示(pcv2-selected)が消える)
  window.playlistHasSelectedItems = () => selectedIndices.playlist.size > 0;
  window.markersHasSelectedItems = () => selectedIndices.markers.size > 0;

  function toggleEditMode(panelId) {
    if (!(panelId in editModeState)) return;
    editModeState[panelId] = !editModeState[panelId];
    selectedIndices[panelId].clear();

    const panelBody = document.getElementById("pcV2PanelBody");
    const editBtnId = panelId === "markers" ? "pcV2MarkersEditBtn" : "pcV2PlaylistEditBtn";
    const editBtn = document.getElementById(editBtnId);
    const deleteBtn = document.getElementById("pcV2DeleteSelectedBtn");
    const fab = document.getElementById("pcV2PanelFab");
    const addGroup = fab ? fab.querySelector(".pcv2-fab-addgroup") : null;
    const cssClass = panelId + "-edit-mode";
    if (panelBody) panelBody.classList.toggle(cssClass, editModeState[panelId]);
    if (editBtn) {
      editBtn.classList.toggle("active", editModeState[panelId]);
      const editBtnLabel = editBtn.querySelector("span");
      if (editBtnLabel) editBtnLabel.textContent = editModeState[panelId] ? "OK" : "EDIT";
    }
    if (addGroup) {
      addGroup.style.display = editModeState[panelId] ? "none" : "flex";
    }
    if (deleteBtn) {
      deleteBtn.style.display = editModeState[panelId] ? "flex" : "none";
      deleteBtn.disabled = true;
    }
    const moveBtnEl = document.getElementById("pcV2MoveSelectedBtn");
    if (moveBtnEl) {
      moveBtnEl.style.display = editModeState[panelId] ? "flex" : "none";
      moveBtnEl.disabled = true;
    }

    if (panelId === "playlist" && typeof renderPlaylist === "function") {
      renderPlaylist();
    } else if (panelId === "markers" && typeof renderPinList === "function") {
      renderPinList();
    }

    if (editModeState[panelId]) {
      attachSelectionHandlers(panelId);
    } else {
      clearSelectionVisuals(panelId);
    }
  }

  // 通常時はチェックボックス選択用要素だけ無効化。【重要】.toggle-btn(目)と.pin-edit-btn/.playlist-hover-edit-btnは対象外(含めると通常モードで目アイコンが効かない)
  const disableHandlers = { markers: null, playlist: null };

  function attachDisableGuard(panelId) {
    const container = getListContainer(panelId);
    if (!container || disableHandlers[panelId]) return;
    const handler = (e) => {
      if (editModeState[panelId]) return;
      return;
    };
    container.addEventListener("click", handler, true);
    disableHandlers[panelId] = handler;
  }

  function getListContainer(panelId) {
    return panelId === "markers" ? document.getElementById("pinList") : document.getElementById("playlistBox");
  }

  function getRowItems(panelId) {
    const container = getListContainer(panelId);
    if (!container) return [];
    // playlistはフォルダ見出し行(.playlistFolderHeader)が混ざるので曲の行だけ。行のindexはdata-index(=playlist[]のindex。折りたたみで行が省かれても一致)
    return Array.from(container.children).filter(c => panelId !== "playlist" || c.classList.contains("playlistItem"));
  }

  function rowIndexOf(panelId, items, row) {
    if (panelId === "playlist") return row && row.dataset ? parseInt(row.dataset.index, 10) : -1;
    return items.indexOf(row);
  }

  function syncSelectionButtons(panelId) {
    const n = selectedIndices[panelId].size;
    const deleteBtn = document.getElementById("pcV2DeleteSelectedBtn");
    if (deleteBtn) deleteBtn.disabled = n === 0;
    if (panelId === "playlist") {
      const moveBtn = document.getElementById("pcV2MoveSelectedBtn");
      if (moveBtn) moveBtn.disabled = n === 0;
    }
  }

  // 再描画(renderPlaylist)で消えた選択表示を、同じindexの行へ付け直す(開閉・タイトル読込などindexが変わらない再描画用)
  window.playlistReapplySelection = function () {
    if (!editModeState.playlist || selectedIndices.playlist.size === 0) return;
    const container = getListContainer("playlist");
    if (!container) return;
    getRowItems("playlist").forEach(row => {
      if (!selectedIndices.playlist.has(parseInt(row.dataset.index, 10))) return;
      const b = row.querySelector(".del-btn");
      if (b) b.classList.add("pcv2-selected");
    });
  };
  // フォルダ操作でindexがズレる前に選択を捨てる
  window.playlistClearSelection = function () {
    selectedIndices.playlist.clear();
    syncSelectionButtons("playlist");
  };

  function moveSelectedItems(btn) {
    if (typeof isUnlocked === "function" && !isUnlocked()) {
      if (typeof swShowUnlockToast === "function") swShowUnlockToast("無料版ではフォルダへの移動はできません。");
      return;
    }
    const indices = Array.from(selectedIndices.playlist).sort((a, b) => a - b);
    if (indices.length === 0 || typeof showFolderPicker !== "function") return;
    hapticTap();
    showFolderPicker(btn, (folderId) => {
      const target = folderId === "__new__" ? createPlaylistFolder("").id : folderId;
      moveTracksToFolder(indices, target);
      selectedIndices.playlist.clear();
      syncSelectionButtons("playlist");
      renderPlaylist();
    });
  }

  const selectionHandlers = { markers: null, playlist: null };

  function attachSelectionHandlers(panelId) {
    const container = getListContainer(panelId);
    if (!container) return;
    if (selectionHandlers[panelId]) {
      container.removeEventListener("click", selectionHandlers[panelId], true);
    }
    const handler = (e) => {
      const zoneSelector = panelId === "playlist" ? ".playlist-del-zone" : ".pin-del-zone";
      const zone = e.target.closest(zoneSelector);
      if (!zone || !container.contains(zone)) return;
      const delBtn = zone.querySelector(".del-btn");
      if (!delBtn) return;
      e.stopPropagation();
      e.preventDefault();
      const items = getRowItems(panelId);
      const index = rowIndexOf(panelId, items, zone.closest(".pinItem, .playlistItem"));
      if (index === -1 || Number.isNaN(index)) return;
      if (selectedIndices[panelId].has(index)) {
        selectedIndices[panelId].delete(index);
        delBtn.classList.remove("pcv2-selected");
      } else {
        selectedIndices[panelId].add(index);
        delBtn.classList.add("pcv2-selected");
      }
      syncSelectionButtons(panelId);
      if (panelId === "playlist") {
        const hasSelection = selectedIndices.playlist.size > 0;
        items.forEach(item => {
          const toggle = item.querySelector(".playlist-skip-toggle");
          if (!toggle) return;
          toggle.disabled = hasSelection;
          toggle.title = hasSelection ? "削除の選択中は切り替えられません" : toggle.dataset.baseTitle || toggle.title;
        });
      } else if (panelId === "markers") {
        const hasSelection = selectedIndices.markers.size > 0;
        items.forEach(item => {
          const toggle = item.querySelector(".toggle-btn");
          if (!toggle) return;
          if (!toggle.dataset.baseTitle) toggle.dataset.baseTitle = toggle.title;
          toggle.disabled = hasSelection;
          toggle.title = hasSelection ? "削除の選択中は切り替えられません" : toggle.dataset.baseTitle;
        });
      }
    };
    container.addEventListener("click", handler, true);
    selectionHandlers[panelId] = handler;
  }

  function clearSelectionVisuals(panelId) {
    const container = getListContainer(panelId);
    if (container) {
      container.querySelectorAll(".del-btn.pcv2-selected").forEach(b => b.classList.remove("pcv2-selected"));
      if (selectionHandlers[panelId]) {
        container.removeEventListener("click", selectionHandlers[panelId], true);
        selectionHandlers[panelId] = null;
      }
    }
    selectedIndices[panelId].clear();
  }

  function deleteSelectedItems(panelId) {
    const indices = Array.from(selectedIndices[panelId]).sort((a, b) => b - a);
    if (indices.length === 0) return;
    hapticWarning();

    const deleteBtn = document.getElementById("pcV2DeleteSelectedBtn");
    if (deleteBtn) deleteBtn.disabled = true;

    const container = getListContainer(panelId);
    const items = getRowItems(panelId);
    const fadingEls = indices.map(i => panelId === "playlist" ? items.find(r => parseInt(r.dataset.index, 10) === i) : items[i]).filter(Boolean);
    const FADE_MS = 260;

    if (container) container.style.pointerEvents = "none";
    fadingEls.forEach(el => el.classList.add("pcv2-row-deleting"));

    setTimeout(() => {
      if (container) container.style.pointerEvents = "";
      performDelete(panelId, indices);
    }, fadingEls.length > 0 ? FADE_MS : 0);
  }

  async function performDelete(panelId, indices) {
    if (panelId === "markers") {
      indices.forEach(i => pins.splice(i, 1));
      loopActiveMarkerIndex = null;
      renderPins();
      renderSegments();
      renderPinList();
      savePins();
    } else {
      // splice前にファイル名を控えてIndexedDBも削除(deletePlaylistTrack)。splice後のindex参照は別曲を指す。削除しないとアプリ再起動で復活する
      const removedNames = indices.map(i => playlist[i] && playlist[i].name).filter(Boolean);
      indices.forEach(i => playlist.splice(i, 1));
      for (const name of removedNames) {
        await deletePlaylistTrack(name);
      }
      if (typeof currentPlaylistIndex !== "undefined") {
        const removedBeforeCurrent = indices.filter(i => i < currentPlaylistIndex).length;
        if (indices.includes(currentPlaylistIndex)) {
          currentPlaylistIndex = -1;
        } else {
          currentPlaylistIndex -= removedBeforeCurrent;
        }
      }
      renderPlaylist();
    }
    selectedIndices[panelId].clear();
    syncSelectionButtons(panelId);
    attachSelectionHandlers(panelId);
  }

  let eqDividerEl = null;
  function appendEqDivider(container) {
    if (!eqDividerEl) {
      eqDividerEl = el(
        '<div class="pcv2-control-eq-heading">' +
          '<div class="pcv2-section-divider"></div>' +
          '<div class="pcv2-eq-heading-row">' +
            '<h3 class="pcv2-eq-heading-title">Equalizer</h3>' +
          '</div>' +
        '</div>'
      );
      const heading = eqDividerEl.querySelector(".pcv2-eq-heading-row");
      const eqResetBtn = document.getElementById("controlEqResetBtn");
      if (eqResetBtn) {
        heading.appendChild(eqResetBtn);
      }
      const eqToggle = document.getElementById("controlEqEnableToggle");
      if (eqToggle) {
        heading.appendChild(eqToggle);
      }
    }
    container.appendChild(eqDividerEl);
  }

  function toggleBottomBarEffect(id, btn) {
    hapticTap();
    if (id === "speed") {
      speedEffectEnabled = !speedEffectEnabled;
      if (typeof updatePlaybackRate === "function") updatePlaybackRate();
      const t = document.getElementById("controlSpeedEnableToggle");
      if (t) t.setAttribute("aria-checked", String(speedEffectEnabled));
    } else if (id === "key") {
      keyEffectEnabled = !keyEffectEnabled;
      if (typeof updatePlaybackRate === "function") updatePlaybackRate();
      const t = document.getElementById("controlKeyEnableToggle");
      if (t) t.setAttribute("aria-checked", String(keyEffectEnabled));
    } else if (id === "eq") {
      if (typeof setEqEffectEnabled === "function") setEqEffectEnabled(!eqEffectEnabled);
      const t = document.getElementById("controlEqEnableToggle");
      if (t) t.setAttribute("aria-checked", String(eqEffectEnabled));
    }
    syncBottomBarEffectButton(id, btn);
  }

  function syncBottomBarEffectButton(id, btn) {
    let enabled = true;
    if (id === "speed") enabled = typeof speedEffectEnabled === "undefined" || speedEffectEnabled;
    else if (id === "key") enabled = typeof keyEffectEnabled === "undefined" || keyEffectEnabled;
    else if (id === "eq") enabled = typeof eqEffectEnabled === "undefined" || eqEffectEnabled;
    btn.classList.toggle("effect-off", !enabled);
  }

  function syncAllBottomBarEffectButtons() {
    Object.keys(bottomBarEffectButtons).forEach(id => {
      syncBottomBarEffectButton(id, bottomBarEffectButtons[id]);
    });
  }

  let controlPanelEffectSyncSetup = false;
  function setupControlPanelEffectSync() {
    if (controlPanelEffectSyncSetup) return;
    controlPanelEffectSyncSetup = true;
    [
      ["speed", "controlSpeedEnableToggle"],
      ["key", "controlKeyEnableToggle"],
      ["eq", "controlEqEnableToggle"]
    ].forEach(([id, elId]) => {
      const toggle = document.getElementById(elId);
      if (!toggle) return;
      toggle.addEventListener("click", () => {
        const btn = bottomBarEffectButtons[id];
        if (btn) syncBottomBarEffectButton(id, btn);
      });
    });
  }

  let textEditModeOn = false;
  function setupTextPanelHeaderControls() {
    const panelHeader = document.getElementById("pcV2PanelHeader");
    const panelBody = document.getElementById("pcV2PanelBody");
    const textarea = document.getElementById("noteTextArea");
    if (!panelHeader || !panelBody || !textarea) return;

    textarea.readOnly = !textEditModeOn;

    const fab = el('<div id="pcV2PanelFab"></div>');

    // 【重要】fullscreenBtnはこの時点で取得した参照を使い回す。fab.appendChild後はdocument未接続でgetElementByIdがnullを返す(編集モード中にFullscreenボタンが隠れないバグ)
    const holder = document.getElementById("pcV2TextControlsHolder");
    const fullscreenBtn = document.getElementById("noteTextFullscreenBtn");
    if (holder && fullscreenBtn) {
      // 文字サイズ(+/-)はフルスクリーンオーバーレイ内の#noteTextAreaFullscreenだけに効く(player-text.js設計)。通常ヘッダーには置かない。FullscreenボタンだけFABへ移す
      fab.appendChild(fullscreenBtn);
    }

    const editBtn = el(
      '<button type="button" class="panel-fab-btn panel-edit-btn" id="pcV2TextEditBtn" title="Edit text">' +
        '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>' +
        '<span>EDIT</span>' +
      '</button>'
    );
    const editBtnLabel = editBtn.querySelector("span");
    editBtn.classList.toggle("active", textEditModeOn);
    if (fullscreenBtn) fullscreenBtn.style.display = textEditModeOn ? "none" : "flex";
    editBtn.addEventListener("click", () => {
      textEditModeOn = !textEditModeOn;
      textarea.readOnly = !textEditModeOn;
      editBtn.classList.toggle("active", textEditModeOn);
      if (editBtnLabel) editBtnLabel.textContent = textEditModeOn ? "OK" : "EDIT";
      if (fullscreenBtn) fullscreenBtn.style.display = textEditModeOn ? "none" : "flex";
      if (textEditModeOn) textarea.focus();
    });
    fab.appendChild(editBtn);

    panelBody.appendChild(fab);
  }

  const pcv2QnSections = { keyboard: null, color: null };

  function qnSectionSelector(panelId) {
    return panelId === "keyboard"
      ? '.qn-menu-section[data-qn-section="shortcuts"]'
      : '.qn-menu-section[data-qn-section="theme"]';
  }

  function tryClaimQnSections() {
    const mount = document.getElementById("qnMenuMount");
    if (!mount) return;
    if (!pcv2QnSections.keyboard) {
      const el2 = mount.querySelector(qnSectionSelector("keyboard"));
      if (el2) pcv2QnSections.keyboard = el2;
    }
    if (!pcv2QnSections.color) {
      const el2 = mount.querySelector(qnSectionSelector("color"));
      if (el2) pcv2QnSections.color = el2;
    }
  }

  function renderQnMenuSectionPanel(panelId, panelBody) {
    if (pcv2QnSections[panelId]) {
      panelBody.appendChild(pcv2QnSections[panelId]);
      return;
    }

    tryClaimQnSections();
    if (pcv2QnSections[panelId]) {
      panelBody.appendChild(pcv2QnSections[panelId]);
      return;
    }

    panelBody.appendChild(el('<div class="pcv2-qn-loading">読み込みに失敗しました。再読み込みしてお試しください。</div>'));
  }

  function activate() {
    build();
    document.body.classList.add("pc-v2-active");
    document.documentElement.classList.add("pc-v2-active-html");
    if (typeof syncTopControlsSpacerHeight === "function") {
      syncTopControlsSpacerHeight();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", activate);
  } else {
    activate();
  }

  let pcv2WaveRafId = null;

  // 【v2.13.4 負荷対策】毎フレーム全再描画がiOSで強制再読み込みの原因だった。波形/シークバーの描画本体はQNBars.draw()(player-bars.js。署名が同じ行はスキップ、見えている行だけ描画)。ここはPCV2_WAVE_INTERVAL_MS間隔に間引いた呼び出しと再描画の合図だけ。rAFループを増やさない
  const PCV2_WAVE_INTERVAL_MS = 100;
  let pcv2LastDrawAt = 0;

  function pcv2DrawWaveform(force) {
    QNBars.draw(!!force);
  }

  function pcv2WaveLoop(now) {
    pcv2WaveRafId = requestAnimationFrame(pcv2WaveLoop);
    if (document.hidden) return;
    if (!document.body.classList.contains("pc-v2-active")) return;
    if (now - pcv2LastDrawAt < PCV2_WAVE_INTERVAL_MS) return;
    pcv2LastDrawAt = now;
    pcv2DrawWaveform(false);
  }
  pcv2WaveRafId = requestAnimationFrame(pcv2WaveLoop);

  window.addEventListener("resize", () => {
    QNBars.markGeomDirty();
    if (document.body.classList.contains("pc-v2-active")) pcv2DrawWaveform(true);
  });

  if (typeof audio !== "undefined" && audio) {
    audio.addEventListener("seeked", () => {
      if (document.body.classList.contains("pc-v2-active")) pcv2DrawWaveform(false);
    });
  }
})();

// D&Dでのファイル追加と#topControlsのフラット化(build()が先にフラット化済みを前提)。player-core.js, player-ui-shared.jsの後に読み込む(addFilesToPlaylist等に依存)

document.addEventListener("dragover", e => {
  e.preventDefault();
  // ページ遷移防止のためpreventDefaultは常に呼ぶ
  // アプリ(YouTube等)表示中は曲追加D&D無効(アプリ側が自前で受ける)
  if (document.body.classList.contains("qn-app-open")) return;
  document.body.classList.add("dragover");
});

document.addEventListener("dragleave", e => {
  if (e.clientX === 0 && e.clientY === 0) {
    document.body.classList.remove("dragover");
  }
});

document.addEventListener("drop", e => {
  e.preventDefault();
  document.body.classList.remove("dragover");
  if (document.body.classList.contains("qn-app-open")) return;
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    addFilesToPlaylist(Array.from(e.dataTransfer.files));
  }
});

// #topControlsのPC幅: Track/Play/Track・Repeat・Marker×3・Loopを1行にフラット化。CSS display:contentsはブラウザ差で不可→JSでDOM組み替え。4要素(#playbackTripleBtn,#allRepeatToggleBtn,#markerNavBtn,#loopToggleBtn)を#topControls直下へ移し、空の.top-controls-rowは非表示。
(function () {
  const topControls = document.getElementById("topControls");
  const topControlsRows = topControls ? topControls.querySelectorAll(".top-controls-row") : [];
  const row1 = topControlsRows[0] || null;
  const row2 = topControlsRows[1] || null;
  const playbackTripleBtn = document.getElementById("playbackTripleBtn");
  const allRepeatToggleBtn = document.getElementById("allRepeatToggleBtn");
  const markerNavBtn = document.getElementById("markerNavBtn");
  const loopToggleBtn = document.getElementById("loopToggleBtn");

  if (!topControls || !row1 || !row2 || !playbackTripleBtn || !allRepeatToggleBtn || !markerNavBtn || !loopToggleBtn) {
    return;
  }

  // build()が先にフラット化済みなのを前提とする(順序依存)
  topControls.appendChild(playbackTripleBtn);
  topControls.appendChild(allRepeatToggleBtn);
  topControls.appendChild(markerNavBtn);
  topControls.appendChild(loopToggleBtn);
  row1.style.display = "none";
  row2.style.display = "none";
})();
