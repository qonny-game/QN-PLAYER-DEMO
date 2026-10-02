# QN-PLAYER 大型ファイル目次

大きいファイルの「どこに何があるか」。**行番号はすぐズレるので、まず`grep -n "関数名"`で実際の位置を確認する。**
関数名は実コードから拾ったもの。名前を変えた/消した時はここも直す（古い目次は誤誘導になる）。

---

## JS/player-ui-pc-v2.js（約2300行。IIFE 2つ：本体 ＋ 末尾の旧PC用処理）

### 骨組み・初期化（起動時に1回）
- `build()` — DOM骨組み全体（アイコンバー`ICON_ITEMS`・パネル・波形エリア・下段バー・PLAY/MARKERアンカータブ）を組み立て、`.app-container`直後に挿入。**新しいサイドメニュー項目・下段バーのボタンを足す起点。**
- `el(html)` — HTML文字列から要素を作る小さなヘルパー。
- `initPanels()` — Control/Markers/Library/Text等の中身の初期構築。

### レイアウト同期（SP⇔PC幅切替でも呼ばれる）
- `isSpWidthNow()` — SP幅(≤900px)判定（この判定は必ずこれを使う）。
- `syncBottomBarPosition()` — 下段バーとアンカータブを、SP幅では`#pcV2Layout`内（アイコンバー直前）、PC幅では`#pcV2Layout`末尾（右カラム下端）へDOM移動。**下段バー周辺に要素を足したら一緒に見直す。**
- `isCollapsed()` / `setCollapsed(on)` / `applyCollapse()` — PC幅のパネル格納（`#pcV2Layout.pcv2-collapsed`、`qn_panel_collapsed`）。
- `syncTimeRowPosition()` / `pcv2SkipBy()` / `updateIconBarScrollHint()` / `setupIconBarScrollHint()` / `updatePcv2BottomBarsHeightVar()` — 時刻行の位置、±10s、アイコンバーの横スクロールヒント、バー高さのCSS変数反映。

### パネル開閉・切替
- `handleIconClick(item)` — アイコン押下の分岐（`"action"`=Add File、`"close"`、他は`openPanelOverlay`）。
- `openPanelOverlay(panelId)` / `closePanelOverlay()` — パネルの開閉（SP幅はオーバーレイ）。
- `switchPanel(panelId)` — **最大の関数。** パネル中身をControl/Markers/Library/Text/Export/Backup/Import/Keyboard/Colorへ切替。新しいパネル種別はここに分岐を足す。Backup/Importは`qnBackupMount`で借りる（`build()`は部品を`qnBackupParts()`で取得）。
- `getPanelStash()` / `stashPanelContents(panelBody)` — 切替時、使い回す実体を`#pcV2PanelStash`へ退避（パネルに新しい実体を足したら対象に加える）。
- `buildPanelFab(panelId)` — 右下FAB（ADD AUDIO/ADD MARKER/EDIT/Delete）。

### EDITモード・削除
- `toggleEditMode(panelId)` / `attachDisableGuard` / `getListContainer` / `getRowItems`
- `attachSelectionHandlers(panelId)` — **削除選択（丸チェック）の実処理。`.del-btn`/`.playlist-del-zone`をキャプチャ段階で奪う。**
- `clearSelectionVisuals` / `deleteSelectedItems`（フェード演出）/ `performDelete`（実データ削除。IndexedDBも消す）

### 下段バーのエフェクトボタン・その他連携
- `appendEqDivider` / `toggleBottomBarEffect` / `syncBottomBarEffectButton` / `syncAllBottomBarEffectButtons` / `setupControlPanelEffectSync` — Controlパネルのトグルと下段バーのSpeed/Key/EQボタンの同期。
- `setupTextPanelHeaderControls()` — Textパネルのヘッダー操作。
- `qnSectionSelector` / `tryClaimQnSections` / `renderQnMenuSectionPanel` — `player-theme.js`のKeyboard/Colorセクションをパネルとして表示。
- `activate()` — PC v2構築(`build()`)＋`body.pc-v2-active`付与。常時有効で、旧レイアウトへ戻す処理は無い。

### 波形描画
- `pcv2DrawWaveform(force)`は`QNBars.draw()`への委譲、`pcv2WaveLoop()`（`requestAnimationFrame`を100ms間隔に間引き）。描画本体は下記player-bars.js。

### ファイル末尾（旧player-ui-pc.js由来）
- 曲追加のD&D（トップレベルの`dragover`/`drop`）。
- 2つ目のIIFE：`#topControls`のPlay系/Marker系を1行へフラット化（`build()`が先にフラット化済みを前提）。並び・グルーピングを変える時だけ目を通す。

---

## CSS（PC v2系）

- **`style-layout-pc-v2.css`（PC幅のシェル）**：`#pcV2Root`/`#pcV2Layout`（PC=3カラム×2行grid、2行目は下段バー）、アイコンバー、波形エリア・シークバー（`.vbar`は高さ固定せずflexで等分）、下段バー（`.pcv2-ctrl-group`/`.tripleNavBtn-*`/`.loopbtn`/プリロールステッパー）、パネル格納。`@media (min-width:901px)`で囲んだ範囲がPC専用。
- **`style-layout-pc-v2-sp.css`（続き）**：`@media (max-width:900px)`の縦積み組み替え（`#pcV2Layout`をflex縦積み、アイコンバー最下部固定、パネル全面オーバーレイ、アンカータブ表示）と、その後ろの下段バー追記（Speed/Keyステッパー、ラベル）。**SP幅の見た目はまずここ。** SP幅の表示順は`order`（整数のみ）：`waveArea:1 → timeRow:2 → anchorTabs:3 → bottomBar:4 → iconBar:5`。
- **`style-pcv2-panels.css`（パネルの中身）**：`#pcV2PanelHeader`、FAB(`.panel-fab-btn`)、`#pcV2PanelBody`配下（Markers/Playlistの削除選択UI、`.pcv2-panel-<id>`ごとの中身、Backup/Importの共通部品、Control/EQの見出し）、スクロールバー。`@media`は基本不要。

---

## JS/qn-apps.js（アプリ枠）

`player-ui-pc-v2.js`の`build()`が作った`#pcV2IconBar`に**後から**項目を差し込む（`waitForSidebar`でMutationObserver）。`player-ui-pc-v2.js`は変更していない。

- `register(def)` / `open(id)` / `close()` — アプリ登録・表示・本体へ戻る。`layoutHost()`が`#qnAppHost`(fixed)の位置を実測で決める（PC=アイコンバーの右〜下端、SP=ヘッダー直下〜アイコンバー直上）。
- `buildBadge()` / `updateBadge()` — ヘッダーのロゴ`#qnAppLogoBtn`(押下で開閉・アプリ名表示)。`ensureFlyout()` / `renderAppItems()` / `positionFlyout()` / `openFlyout()` / `closeFlyout()` / `bindFlyoutGlobal()` — フライアウト（PCはhoverで開く、SP/タッチはタップ開閉。閉じる経路は外側タップ・Esc・項目選択・スクロール・resize）。開閉状態は`flyoutOpen`変数。
- `renderAppSideItems()` / `setSideActive(id|null)` / `refreshSidebar()` — アプリ表示中のサイドバー（`#pcV2IconBar.qn-app-sidebar`。選択は`.qn-app-active`）。
- `initColorKeeper()` / `openColorPop()` / `closeColorPop()` / `positionColorPop()` — アプリ中のColorパネル(`#qnColorPop`)。本体のテーマ切替セクションを借りて閉じたら戻す。
- `renderShortcuts(hostEl, id)` / `fillShortcutRows()` — 共通のKeyboard表。`toast(text)` — 共通トースト。`saveLastApp` / `scheduleRestore` — 再読み込み時の復元（`qn_last_app`）。

## JS/qn-app-youtube.js（YouTubeアプリ。IIFE、約2150行）

機能ごとの目安（`grep -n "// ----------"`で見出しが出る）。
- データ：`loadItems/saveItems/findItem/findMarker/persistMarkers/persistLoop/sortMarkers`
- プレイヤー：`requestApi/createPlayer/openVideo/seekTo/applyDesiredRate/renderSpeed/handleEnded/playerMostlyVisible`
- シークバー・マーカー：`buildTracks/positionMarker/fillMarkerLabel/attachMarkerDrag/attachTrackSeek/jumpMarker`、ポップアップ`showSeekPop`
- Library：`renderList/playItem/attachReorder`、EDIT：`updateFab/setEditMode/toggleEdit/toggleSelect/deleteSelected`
- Markers：`renderMarkers/startMemoEdit/markerColorHex/markerText/addMarkerHere`、チャプター：`parseChapters/addChapters`
- ループ：`setLoopMode/sectionRangeAt`、`preRoll`
- Backup/Import：`window.QNYouTubeBackup`（`list/buildExport/parseImport/exists/titleOf/applyImport`）。画面は`player-track-backup.js`が提供。
- ショートカット：`SHORTCUTS`配列＋`onSpaceKey`（`QNApps.register`の`shortcuts`にも渡す）

## その他
- `JS/qn-wakelock.js` — `QNWake.set(key,on)`。audio再生/停止/終了をフックし、visibilitychangeで再取得。
- `JS/qn-marker-core.js` — `QNMarkerCore`：区間の決め方・プリロール込みの許容範囲・前後マーカー移動・A-B範囲外判定（PLAYER/YouTube共通）。
- `JS/player-marker-presets.js` — プリセット/自動カラー/カスタムプリセット、`startPinMemoEdit`（メモ編集のプリセットポップアップ）。
- `CSS/style-apps.css` — アプリ枠（サイドバー・フライアウト・トースト・`#qnAppHost`）。`CSS/style-youtube.css` — `.qn-yt*`（レイアウトPC/SP、シークバー、Library/Markers、Backup/Import、チャプター、コントロールバー、`.qn-yt-seekpop`）。

## JS/qn-app-tuner.js（TUNERアプリ。IIFE、約650行）／JS/qn-pitch-core.js
`grep -n "// ----------"`で見出しが出る。構造はYouTubeアプリと同じ（`TEMPLATE`→`mount`、`SIDEBAR`/`setPanel`/`onSidebar`、`onShow`/`onHide`）。
- 表示：`displayStyles`（gauge / guitar-meter。`render/update`）、`tuningState`（±5¢=just/±20¢=close/他=far）、`renderMainDisplay/resetReadout`
- マイク：`startMic/stopMic/toggleMic/onMicFrame`（解析ループは`qn-pitch-core.js`の`createAnalysisSession`。約30fpsに間引き）
- Tone：`playTone/stopTone/closeToneAudio/currentStrings`、`renderPresetTabs/renderTuningTabs/renderStringList`
- 感度/表示：`setSens/setSmooth/syncSliders`、`renderDisplayChoices/setDisplay/cycleDisplay`
- ショートカット：`SHORTCUTS`配列＋`onKey`（`QNApps.register`の`shortcuts`にも渡す）
- `CSS/style-tuner.css` — `.qn-tn*`（パネル・メーター・下段バー。下段バーの寸法は`#pcV2BottomBar`と同仕様）

## JS/qn-app-pitch.js（PITCHアプリ。IIFE、約1050行）／JS/qn-pitch-filters.js
`grep -n "// ----------"`で見出しが出る。構造はYouTube/TUNERアプリと同じ（`TEMPLATE`→`mount`、`SIDEBAR`/`setPanel`/`onSidebar`、`onShow`/`onHide`）。
- ロール：`setupSize`（行高・canvas幅の計算。非表示中は何もしない→ResizeObserver/onShowで再実行）、`redraw(forceLeft)`（見えている範囲だけ描く仮想スクロール）、`scheduleRedraw`
- 録音：`startRec/endRec/onFrame`（getUserMediaは1回。`session.stream`をMediaRecorderと共有）。再生：`loadPlayback/playAudio/pauseAudio/tick/seekTo/stopPlayback`
- 保存：`openSave/doSave/closeSave`（`save`は一時パネル）、`onClear`（2回タップ）。DB：`dbAdd/dbGet/dbList/dbDelete`
- Recordings：`renderList/refreshList`、EDIT/削除は`setEditMode/updateFab/deleteSelected`（YouTubeアプリと同じ）、改名は`names`(localStorage)
- Filters：`FILTER_UI`（設定項目の定義）→`buildFilters`。設定の実体・保存は`qn-pitch-filters.js`（`QNPitchFilters.set/reset`）
- `CSS/style-pitch.css` — `.qn-pt*`（パネル・ロール・下段バー。下段バーの寸法は`#pcV2BottomBar`と同仕様）

## JS/player-bars.js（QNBars）
`grep -n "// ----------"`で見出し。`measure/ensureRows/addRow/releaseRow`（寸法・仮想スクロール・行の再利用）、`rowOf/pctInRow/timeFromPoint/timeInRow`（時刻⇔行。行番号は0始まり）、`rowPeaks/paintRow/draw`（波形、行ごとの署名で再描画を最小化）、`followTick/ensureVisible`（再生位置追従）、`setSec/createGearButton/openPop`（秒数設定）、`startEdgeScroll`（ドラッグ中の端スクロール）。行ができたら`decorateBarRow`（player-markers.js）が線・A/B・区間を付ける。

- v3.37.0: `ICON_ITEMS`に`settings`(hidden、歯車から`openPanelOverlay("settings")`)。`ensureSettingsBody()/syncSettingsBody()`が設定パネルを作る(stashPanelContentsの退避対象に`settingsBody`)。Backup/Import/Transferの`ICON_ITEMS`はhidden:true(switchPanel/handleIconClickの参照用に残す)。`syncTimeRowPosition()`は常に波形ヘッダーの歯車の左へ。

- v3.44.0: `JS/qn-settings-ui.js`(設定部品、player-controls.jsの後・player-ui-pc-v2.jsの前に読む)、`CSS/style-settings.css`(設定CSS)を追加。
