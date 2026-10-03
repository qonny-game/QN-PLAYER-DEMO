// player-ui-pc-v2.js — 左アイコンバー+中央パネル+右波形の3カラム(SP幅はCSS @media(max-width:900px)で縦積み。DOM/JSはPC/SP共通、常時有効)。
// 【方針】既存DOM(#pinList,#playlistBox,#noteTextArea,Control系input,EQバンド,Exportモーダル中身)はidで参照されるので複製せず、骨組み(#pcV2Layout)へ「移動」する(イベントはそのまま生きる)。
// 依存: player-core.js, player-ui-shared.js, player-control-eq.js, player-export.jsより後(setMobileTab,openEqModal,openExportModal等を呼ぶ)。末尾に旧player-ui-pc.js由来(D&D追加、flattenForPc/restoreForSp)を同居

(function () {
  let built = false;
  let currentPanel = "playlist";
  const PANEL_COLLAPSED_KEY = "qn_panel_collapsed";
  let panelCollapsed = false;
  try { panelCollapsed = localStorage.getItem(PANEL_COLLAPSED_KEY) === "1"; } catch (e) {}

  // アイコンバー項目。panelType: tab=既存.mobile-tab-panel表示 / eq=EQモーダル中身 / export=Exportモーダル中身 / action=即実行(現在該当なし、ロジックのみ残す) / close=開いていれば閉じる(現在該当なし)。並び: Library→Markers→Text→Control→Backup→Import(Exportは非表示。v3.48.0でSP専用のSeekbarタブは撤去)
  const ICON_ITEMS = [
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
      appendShortcutToTitle(loopToggleBtn, "Loop on/off");
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

      // 【v3.59.0】PC幅のみ: コントロール右に Volume / Speed / Key(スライダー+±)。操作は既存の applyVolumeChange / handleSpeedRangeInput / setKeySemitones に委譲、表示はpcv2WaveLoopから同期。SP幅はCSSで非表示
      const mixer = el('<div class="pcv2-ctrl-group pcv2-mixer" id="pcV2BarMixer">' +
        '<div class="pcv2-mix-item" data-mix="vol"><div class="pcv2-mix-head"><span class="pcv2-mix-label">Volume</span><span class="pcv2-mix-val" data-mixval="vol">80%</span></div><div class="pcv2-mix-volrow"><button type="button" class="pcv2-mix-mute" id="pcV2BarMute" aria-label="Mute" title="Mute"><svg viewBox="0 0 24 24" class="pcv2-mix-ico-on"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg><svg viewBox="0 0 24 24" class="pcv2-mix-ico-off"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg></button><input type="range" class="pcv2-mix-range" id="pcV2BarVol" min="0" max="1" step="0.01" aria-label="Volume"></div></div>' +
        '<div class="pcv2-mix-item" data-mix="speed"><div class="pcv2-mix-head"><span class="pcv2-mix-label" title="Click to reset to 1.00x">Speed</span><span class="pcv2-mix-val" data-mixval="speed">1.00x</span></div><input type="range" class="pcv2-mix-range" id="pcV2BarSpeed" min="0.5" max="1.5" step="0.01" aria-label="Speed"></div>' +
        '<div class="pcv2-mix-item pcv2-mix-key" data-mix="key"><div class="pcv2-mix-head"><span class="pcv2-mix-label" title="Click to reset to 0">Key</span></div><div class="pcv2-mix-keyrow"><button type="button" class="pcv2-mix-btn" id="pcV2BarKeyDown" aria-label="Key down" title="Key −1">−</button><span class="pcv2-mix-val pcv2-mix-keyval" data-mixval="key" title="Click to reset to 0">0</span><button type="button" class="pcv2-mix-btn" id="pcV2BarKeyUp" aria-label="Key up" title="Key +1">＋</button></div></div>' +
        '</div>');
      topControls.appendChild(el('<div class="pcv2-ctrl-divider pcv2-mixer-divider"></div>'));
      topControls.appendChild(mixer);
      const barVol = mixer.querySelector("#pcV2BarVol"), barSpeed = mixer.querySelector("#pcV2BarSpeed");
      const barMute = mixer.querySelector("#pcV2BarMute");
      barMute.addEventListener("click", () => { audio.muted = !audio.muted; if (typeof hapticTap === "function") hapticTap(); window.pcv2SyncBarMixer(true); });
      barVol.addEventListener("input", () => {
        if (audio.muted) { audio.muted = false; window.pcv2SyncBarMixer(true); }
        const v = parseFloat(barVol.value);
        [document.getElementById("volume"), document.getElementById("controlVolume")].forEach(i => { if (i) i.value = v; });
        applyVolumeChange(v);
      });
      barSpeed.addEventListener("input", () => {
        const sp = document.getElementById("controlSpeedRange");
        if (!sp) return;
        sp.value = barSpeed.value;
        handleSpeedRangeInput({ target: sp });
        barSpeed.value = sp.value;
      });
      mixer.querySelector('[data-mix="speed"] .pcv2-mix-label').addEventListener("click", () => setSpeed(1));
      mixer.querySelector('[data-mixval="speed"]').addEventListener("click", () => setSpeed(1));
      mixer.querySelector("#pcV2BarKeyDown").addEventListener("click", () => setKeySemitones(currentKeySemitones - 1));
      mixer.querySelector("#pcV2BarKeyUp").addEventListener("click", () => setKeySemitones(currentKeySemitones + 1));
      mixer.querySelector('[data-mix="key"] .pcv2-mix-label').addEventListener("click", () => setKeySemitones(0));
      mixer.querySelector('[data-mixval="key"]').addEventListener("click", () => setKeySemitones(0));
      let mixLast = "";
      window.pcv2SyncBarMixer = function (force) {
        const sig = audio.volume + "|" + currentSpeed + "|" + currentKeySemitones + "|" + audio.muted;
        if (sig === mixLast && !force) return;
        mixLast = sig;
        if (document.activeElement !== barVol) barVol.value = audio.volume;
        if (document.activeElement !== barSpeed) barSpeed.value = currentSpeed;
        mixer.querySelector('[data-mixval="vol"]').textContent = audio.muted ? "Mute" : Math.round(audio.volume * 100) + "%";
        barMute.classList.toggle("is-muted", audio.muted);
        barMute.title = audio.muted ? "Unmute" : "Mute";
        mixer.querySelector('[data-mixval="speed"]').textContent = currentSpeed.toFixed(2) + "x";
        mixer.querySelector('[data-mixval="key"]').textContent = (currentKeySemitones > 0 ? "+" : "") + currentKeySemitones;
      };
      window.pcv2SyncBarMixer();

      // 【v3.55.0】SP: 再生系/マーカー系の2ページ。左右端の矢印でスライド、スクロール位置でis-page-1を切替(PC幅はCSSで矢印非表示・通常配置)
      const chevR = '<svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>';
      const chevL = '<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
      const pageNext = el('<button type="button" class="pcv2-bar-page is-next" title="Marker controls" aria-label="Marker controls">' + chevR + '</button>');
      const pagePrev = el('<button type="button" class="pcv2-bar-page is-prev" title="Playback controls" aria-label="Playback controls">' + chevL + '</button>');
      topControls.appendChild(pagePrev);
      topControls.appendChild(pageNext);
      bottomBar.classList.add("is-page-1");
      pageNext.addEventListener("click", () => { if (typeof hapticTap === "function") hapticTap(); bottomBar.scrollTo({ left: bottomBar.clientWidth, behavior: "smooth" }); });
      pagePrev.addEventListener("click", () => { if (typeof hapticTap === "function") hapticTap(); bottomBar.scrollTo({ left: 0, behavior: "smooth" }); });
      bottomBar.addEventListener("scroll", () => { bottomBar.classList.toggle("is-page-1", bottomBar.scrollLeft < bottomBar.clientWidth / 2); }, { passive: true });

      bottomBar.appendChild(topControls);
    }

    const timeRow = el('<div id="pcV2TimeRow"></div>');

    // 【v3.48.0】下部バー右端のVolume/Speed/Key/EQボタンは撤去(操作はControlパネルのみ)

    layout.appendChild(timeRow);

    // ---------- pcV2Root：3カラム部分(layout)と下段バー(bottomBar)を縦に積む ----------
    const root = el('<div id="pcV2Root"></div>');
    root.appendChild(layout);

    // SP幅専用: PLAY/MARKERアンカータブ(#pcV2BottomBar直上)。押すと下段バーの横スクロールをgroup1/group2先頭へジャンプ。PC幅はCSSで非表示
    const anchorTabs = el('<div id="pcV2BottomBarAnchorTabs"></div>');
    const anchorTabPlay = el('<button type="button" class="pcv2-anchor-tab" data-anchor-target="pcV2BottomBarGroupPlay">Play</button>');
    const anchorTabMarker = el('<button type="button" class="pcv2-anchor-tab" data-anchor-target="pcV2BottomBarGroupMarker">Marker</button>');
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

    // 【v3.45.0】SP専用メインドック(#pcV2SpDock): 前マーカー/Loop/再生/+Marker/次マーカー + Moreトグル。押す先は既存ボタン(idとハンドラは不変。ドックは中継+状態ミラーだけ)。
    // 既存の下段バー(#pcV2BottomBar)は「More」で開閉(既定は閉。qn_sp_more)。PC幅はCSSで非表示
    const SP_MORE_KEY = "qn_sp_more";
    function buildSpDock() {
      const svgOf = (id) => { const b = document.getElementById(id); const sv = b && b.querySelector("svg"); return sv ? sv.outerHTML : ""; };
      const mk = (cls, id, title, iconHtml, label) => el('<button type="button" class="pcv2-dock-btn ' + cls + '" id="' + id + '" title="' + title + '">' + iconHtml + '<span>' + label + '</span></button>');
      const dock = el('<div id="pcV2SpDock"></div>');
      const prevM = mk("", "pcV2DockPrevMarker", "Previous marker", svgOf("prevMarkerBtn"), "Prev");
      const loop = mk("pcv2-dock-loop", "pcV2DockLoop", "Loop", svgOf("loopToggleBtn"), "Loop");
      const play = mk("pcv2-dock-play", "pcV2DockPlay", "Play / Pause", '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>', "");
      const add = mk("pcv2-dock-add", "pcV2DockAdd", "Add marker", '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>', "Marker");
      const nextM = mk("", "pcV2DockNextMarker", "Next marker", svgOf("nextMarkerBtn"), "Next");
      const more = mk("pcv2-dock-more", "pcV2DockMore", "More controls", '<svg viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>', "More");
      [prevM, loop, play, add, nextM, more].forEach(b => dock.appendChild(b));
      const click = (id) => { const b = document.getElementById(id); if (b) b.click(); };
      prevM.addEventListener("click", () => click("prevMarkerBtn"));
      nextM.addEventListener("click", () => click("nextMarkerBtn"));
      loop.addEventListener("click", () => click("loopToggleBtn"));
      add.addEventListener("click", () => { if (typeof hapticTap === "function") hapticTap(); if (typeof addCurrentPin === "function") addCurrentPin(); });
      play.addEventListener("click", () => { if (typeof togglePlay === "function") togglePlay(); });
      // 再生/停止アイコンのミラー
      const syncPlay = () => {
        const playing = !audio.paused;
        play.classList.toggle("is-playing", playing);
        play.innerHTML = '<svg viewBox="0 0 24 24"><path d="' + (playing ? "M6 19h4V5H6v14zm8-14v14h4V5h-4z" : "M8 5v14l11-7z") + '"/></svg>';
      };
      ["play", "pause", "ended", "emptied", "loadedmetadata"].forEach(n => audio.addEventListener(n, syncPlay));
      // Loopの状態(OFF / A-B / Section)のミラー: 本体ボタンのclass/ラベルを写す(rAFは使わずMutationObserver)
      const loopSrc = document.getElementById("loopToggleBtn");
      const loopLbl = loop.querySelector("span");
      const syncLoop = () => {
        if (!loopSrc) return;
        const on = loopSrc.classList.contains("is-active");
        loop.classList.toggle("is-active", on);
        const l = loopSrc.querySelector(".top-controls-btn-label");
        loopLbl.textContent = l ? l.textContent : "Loop";
      };
      if (loopSrc && typeof MutationObserver === "function") new MutationObserver(syncLoop).observe(loopSrc, { attributes: true, attributeFilter: ["class"], childList: true, subtree: true, characterData: true });
      syncLoop();
      // More: 既存の下段バーの開閉
      const setMore = (open) => {
        root.classList.toggle("qn-sp-more-open", open);
        more.classList.toggle("is-open", open);
        try { localStorage.setItem(SP_MORE_KEY, open ? "1" : "0"); } catch (e) {}
        if (document.getElementById("pcV2Layout")?.classList.contains("pcv2-panel-open")) updatePcv2BottomBarsHeightVar();
      };
      more.addEventListener("click", () => { if (typeof hapticTap === "function") hapticTap(); setMore(!root.classList.contains("qn-sp-more-open")); });
      let saved = false; try { saved = localStorage.getItem(SP_MORE_KEY) === "1"; } catch (e) {}
      setMore(saved);
      return dock;
    }

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
    root.appendChild(buildSpDock()); // 既存ボタンがdocumentに接続された後に作る(アイコン複製・ミラー用)

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
    // 【v3.56.3】上部の歯車ボタンは廃止(設定は下部ナビのSettings)。createGearButton APIは互換のため残す
    QNBars.setOpenSettings(() => openSettingsPanel());
    // 設定パネルの中身を先に作ってstashへ(プリロード操作要素を下部バーから外すため。let宣言より後に実行するrAF)
    requestAnimationFrame(() => { const sb = ensureSettingsBody(); if (!sb.parentNode) getPanelStash().appendChild(sb); });
    syncTimeRowPosition();

    const waveAddAudioBtn = el(
      '<button type="button" class="panel-fab-btn panel-addfile-btn" id="pcV2WaveAddAudioBtn" title="Add Audio">' +
        '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>' +
        '<span>Audio</span>' +
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
        '<span>Marker</span>' +
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
  // 【v3.54.0】長押しクイックポップアップ(player-quickpop.js)から使う
  window.QNSkip = { options: SKIP_OPTIONS, get: () => skipSec, set: setSkipSec };

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
    const dockEl = document.getElementById("pcV2SpDock");
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
      // ドックは下段バーの直前(アンカータブの手前)
      if (dockEl && (dockEl.nextSibling !== anchorTabs || dockEl.parentElement !== layoutEl)) layoutEl.insertBefore(dockEl, anchorTabs || bottomBar);
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
    const dockEl = document.getElementById("pcV2SpDock");
    const total = bottomBar.getBoundingClientRect().height + iconBar.getBoundingClientRect().height + (dockEl ? dockEl.getBoundingClientRect().height : 0);
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
          '<span>Audio</span>' +
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
          '<span>Folder</span>' +
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

    // 【v3.51.0】Markersパネルの+MARKERボタンは撤去(追加は下部ドック/波形のMARKER/長押し)

    fab.appendChild(addGroup);

    // 【v3.52.0】Markers/Library: 削除ボタンの位置はCancel(編集を抜ける)。選択が1件以上ある間は下のOKが「Delete」になり一括削除を実行する(syncEditBtn)
    let cancelBtn = null;
    {
      cancelBtn = el(
        '<button type="button" class="panel-fab-btn panel-fab-cancel-btn" id="pcV2' + (panelId === "markers" ? "Markers" : "Playlist") + 'CancelBtn">' +
          '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>' +
          '<span>Cancel</span>' +
        '</button>'
      );
      cancelBtn.addEventListener("click", () => { if (editModeState[panelId]) toggleEditMode(panelId); });
    }
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
    fab.appendChild(cancelBtn);

    const editBtn = el(
      '<button type="button" class="panel-fab-btn panel-edit-btn" id="pcV2' + (panelId === "markers" ? "Markers" : "Playlist") + 'EditBtn" title="Edit ' + panelId + '">' +
        '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>' +
        '<span>Edit</span>' +
      '</button>'
    );
    editBtn.addEventListener("click", () => {
      if (editModeState[panelId] && selectedIndices[panelId].size > 0) { deleteSelectedItems(panelId); return; }
      toggleEditMode(panelId);
    });
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
      { label: "Wave shape", hint: "Mirror is symmetric around the center", type: "stepper", values: () => ["mirror", "bottom"], get: () => QNBars.getWaveShape(), set: v => QNBars.setWaveShape(v), fmt: v => v === "mirror" ? "Mirror" : "Bottom" },
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
    const rowsLang = [
      { label: "Language", hint: "Interface text", type: "stepper", values: () => (window.QNI18N ? QNI18N.OPTIONS : ["auto"]),
        get: () => (window.QNI18N ? QNI18N.getPref() : "auto"), set: v => { if (window.QNI18N) QNI18N.setPref(v); },
        fmt: v => v === "auto" ? "Auto" : v === "ja" ? "日本語" : "English" }
    ];
    settingsUI = QNSettingsUI.build([{ title: "Seek bar", rows: rowsBar }, { title: "Playback", rows: rowsPlay }, { title: "General", rows: rowsLang }]);
    const body = settingsUI.el;
    body.id = "pcV2SettingsBody";
    const more = QNSettingsUI.list(["backup", "import", "color", "keyboard", "transfer"], openSettingsSub);
    const tr = more.querySelector('[data-panel-id="transfer"]');
    if (tr && !(window.QNLibSync && window.QNLibSync.isActive())) tr.style.display = "none";
    body.appendChild(more);
    body.appendChild(QNSettingsUI.versionLine());
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
      if (editBtnLabel) editBtnLabel.textContent = editModeState[panelId] ? "OK" : "Edit";
    }
    const cancelBtnEl = document.getElementById(panelId === "markers" ? "pcV2MarkersCancelBtn" : "pcV2PlaylistCancelBtn");
    if (cancelBtnEl) cancelBtnEl.style.display = editModeState[panelId] ? "flex" : "none";
    syncEditBtn(panelId);
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

  // 【v3.52.0】Markers編集中のFAB下ボタン: 選択0件=「OK」(編集を抜ける) / 1件以上=「Delete」(選択を一括削除)
  const ICON_OK_EDIT = '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>';
  const ICON_TRASH = '<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>';
  function syncEditBtn(panelId) {
    const btn = document.getElementById(panelId === "markers" ? "pcV2MarkersEditBtn" : "pcV2PlaylistEditBtn");
    if (!btn) return;
    const del = editModeState[panelId] && selectedIndices[panelId].size > 0;
    btn.classList.toggle("is-delete", del);
    const label = btn.querySelector("span");
    if (label) label.textContent = editModeState[panelId] ? (del ? "Delete" : "OK") : "Edit";
    const path = btn.querySelector("svg");
    if (path) path.innerHTML = del ? ICON_TRASH : ICON_OK_EDIT;
  }

  function syncSelectionButtons(panelId) {
    const n = selectedIndices[panelId].size;
    syncEditBtn(panelId);
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
          const toggle = item.querySelector(".playlist-skip-toggle, .playlist-act-btn");
          if (!toggle) return;
          toggle.disabled = hasSelection;
          toggle.title = hasSelection ? "削除の選択中は切り替えられません" : toggle.dataset.baseTitle || toggle.title;
        });
      } else if (panelId === "markers") {
        const hasSelection = selectedIndices.markers.size > 0;
        items.forEach(item => {
          item.querySelectorAll(".pin-act-btn").forEach(toggle => {
            if (!toggle.dataset.baseTitle) toggle.dataset.baseTitle = toggle.title;
            toggle.disabled = hasSelection;
            toggle.title = hasSelection ? "削除の選択中は切り替えられません" : toggle.dataset.baseTitle;
          });
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
        '<span>Edit</span>' +
      '</button>'
    );
    const editBtnLabel = editBtn.querySelector("span");
    editBtn.classList.toggle("active", textEditModeOn);
    if (fullscreenBtn) fullscreenBtn.style.display = textEditModeOn ? "none" : "flex";
    editBtn.addEventListener("click", () => {
      textEditModeOn = !textEditModeOn;
      textarea.readOnly = !textEditModeOn;
      editBtn.classList.toggle("active", textEditModeOn);
      if (editBtnLabel) editBtnLabel.textContent = textEditModeOn ? "OK" : "Edit";
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
    if (window.pcv2SyncBarMixer) window.pcv2SyncBarMixer();
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
