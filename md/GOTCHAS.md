# QN-PLAYER 落とし穴集（作る前・直す前に見る）

過去に実際に踏んだ不具合から、**これからも再発しうるものだけ**を残した。
静的チェック（`node --check`等）では見つからず、実機（特にiOS Safari）でしか症状が出ないものが多い。

## 1. 再生・音声・保存
- **IndexedDBの音声レコードは「書いたら二度と書き直さない」。** iOS(WebKit)ではBlobの中身が同じでも`put`し直すと実体が作り直され、メモリ上のFileが読めなくなる（並び替え後に再生不能になった原因）。並び順・ON/OFF・表示名・お気に入りなど頻繁に変わる情報は`localStorage`の`qn_playlist_meta_v1`へ。IndexedDBに書くのは「ユーザーが新しく与えた音声」だけ。全曲ループ処理を書く時は「Blobごと書き直していないか」を必ず疑う。
- **`audio.play()`はタップのコールスタック内で同期的に、重いDOM再構築より先に**呼ぶ（モバイルの自動再生ポリシー。`playTrackAt()`参照）。
- **削除は「メモリ上」と「永続化」の両方**を確認する。`playlist.splice()`の前に削除対象名を控え、`deletePlaylistTrack(name)`を呼ぶ。
- **曲名キーで保存するデータ（マーカー・テキスト）は、曲名を切り替えた同じ瞬間に同期で読み込む。** `loadedmetadata`待ちにすると、読み込み失敗時に前の曲の内容が残り、新しい曲名キーで保存されて複製される。
- **再生中の音声経路を差し替える処理（`createMediaElementSource`等）は、重い準備を全部先に終え、切り替えは`await`なしで一気に。** 間に非同期を挟むとその間だけ無音になる。
- デコードだけなら`OfflineAudioContext`（低サンプルレート）。`getAudioCtx()`は再生用のリアルタイムAudioContextを作るので、デコード目的で呼ばない。
- バックグラウンド再生はOS/ブラウザ次第（iOSはWeb Audio経由にすると止まりやすい）。ロック画面の一時停止と喧嘩するので、pauseを検知して自動`play()`し直す実装は避ける。実機でしか確認できない。
- 再生系コアが無変更なのに挙動が変わったら、追加ファイル（Wake Lock等）を1つずつ止めて切り分ける。

## 2. ループ・マーカー・シーク
- **シークを始める箇所は必ず`beginSeek()`を経由**（`isSeeking = true`を直接書かない）。`loopActiveMarkerIndex`（今ループ対象の区間）のリセット漏れで、シーク先が前の区間のループに引き戻される。
- プリロール/ポストロール中は、再生位置ではなく「今聴いている区間」を基準にする（前/次マーカー移動は`getMarkerNavReferenceTime()`。共通ルールは`JS/qn-marker-core.js`）。
- **ドラッグ中（特にタッチ）は、つかんでいる要素を削除・再生成しない。** 位置だけ更新し、再描画・保存は離した時に1回。タッチの後続イベントはdocumentではなくタッチ開始要素に付ける。ドラッグ直後の`click`でポップアップが出ないよう時刻ガード（`lastPinDragAt`/`lastPinTapAt`）を使う。
- 常にダブル処理を疑う：`pointerup`とそのあとの`click`で二重に動かない設計にする。

## 3. 負荷（PC v2はSPでも常に動く）
- `requestAnimationFrame`ループを新設しない／するなら間引き＋変化なしならスキップ＋ループ内で`getBoundingClientRect`・`getComputedStyle`・配列/文字列の新規生成をしない。（毎フレーム全再描画でiOSがプロセスを落とした実績あり。現在の波形は約10回/秒＋署名比較）
- `textContent`・`style.xxx`を定期的に書く処理は、値が変わった時だけ書く。
- **`infinite`のCSSアニメーションを常時表示の要素に付けない**（スタイル再計算が張り付く）。回数を限定し、動かすのは`transform`/`opacity`だけ。
- **`backdrop-filter`・`filter`・大きな`box-shadow`を持つ全画面要素は、非表示時に必ず`none`＋`visibility:hidden`**（`blur(0px)`でも合成コストが残る）。

## 4. CSS・レイアウト
- **iOS:** タップで動く要素（とその子孫）に、`:hover`で`display`/`visibility`を変えるCSSを書かない（1回目のタップが`click`にならない）。必要なら`@media (hover: hover) and (pointer: fine)`で囲む。
- **横スクロールする入れ物（SPの下段バー）の中の`position:absolute`ポップアップは切り取られる。** 最初から`document.body`直下＋`position:fixed`で作る。ドラッグはPointer Events（マウス/タッチ両対応）。
- **`overflow-y:auto`の要素の中で`flex:1`を何段にも重ねて「残り高さを埋める」構成にしない**（iOSで内容が重なる）。かさばる部分に上限つきの高さを与えて自前でスクロールさせる。内側スクロール領域を画面いっぱいにすると外側へのスクロール受け渡しが難しくなるので控えめに。SPの見た目はChromeだけでは保証されない。
- **`display:grid`＋固定`grid-template-columns`の親に、条件付きで子要素の個数を変えない**（列がズレる）。増減させたい物は既存の列に入る入れ物（wrapper）の中へ。
- **CSSの`order`は整数のみ有効**（小数は無視され`0`扱い）。間に挟む余地を持たせて10刻みで採番する。
- 一覧の行の中に一時的なUI（プリセット・入力補助）を足して行の高さを変えない。ポップアップ（body直下・fixed）にする。
- markers/playlist共通セレクタのCSSを変える時は、両パネルのタップ判定の違い（markers＝`.del-btn`、playlist＝`.playlist-del-zone`、`.pin-del-zone`）を壊していないか確認する。
- 汎用セレクタ（`.playlistItem button`等）より優先させたい時は、親クラスを前置して詳細度を上げる。**既存ルールを`grep`で探してから足す**（CSSの別の場所の既存ルールが原因のことが多い）。
- 共通の器`.export-modal-*`はExport/EQ/Backup/Import全部で流用。新しいモーダルはまずこれを使えないか確認する（名前は`export`だが用途はExportに限らない）。

## 5. PC v2の仕組み
- **EDITモード中の削除・選択は`player-ui-pc-v2.js`の`attachSelectionHandlers()`がキャプチャ段階で先に奪う。** `player-playlist.js`等の`delBtn.onclick`を直しても発火しない。
- **パネル切替で中身をdocumentから切り離さない。** `getElementById`で更新する要素は非表示でもdocument内に置く（`stashPanelContents()`が`#pcV2PanelStash`へ退避。パネルに新しい実体を足したら対象リストにも追加）。
- 下段バー/アイコンバー周辺に要素を足す時は`syncBottomBarPosition()`も見直す（SP⇔PCでDOM位置を移動する）。
- DOMを「借りて移す」実装（Color/Backup/Import）は、閉じる経路（他アイコン・Esc・再押下・`close()`・アプリ切替）を全部洗って必ず元に戻す。戻さないとPLAYER側が空になる。
- ポップアップを足したら閉じる経路（外側タップ・Esc・項目選択・スクロール・resize/回転・アプリ切替）を全部洗う。タッチに`hover`は頼れない。
- `hidden`属性は`display:none`で遷移が効かない。開閉状態は`hidden`ではなく変数で持ち、遅延`hidden`はタイマーを取り消せるようにする。

## 5.5 ライブラリのフォルダ（v3.24.0）
- **`playlist[]`は常に「フォルダ順にグループ化」した並びを保つ**（`normalizePlaylistGrouping()`。未分類は末尾）。だから行の`data-index`=配列indexのまま、選択/削除/ドラッグ/Auto Nextがindexベースで動く。配列を直接いじってフォルダを変えたら必ずnormalize→`persistPlaylistOrder()`。
- 行は`#playlistBox`の直下に見出し(`.playlistFolderHeader`)と交互に並ぶ。`container.children`のindexを行番号に使うな（`data-index`か`getRowItems()`を使う）。折りたたみ中は行を描画しない（編集モードは全展開）。
- フォルダ操作でindexがズレる前に`window.playlistClearSelection()`。indexが変わらない再描画は`playlistReapplySelection()`が選択表示を戻す。
- ドラッグ並び替えは同じフォルダ内だけ（そのグループの配列スロットへ書き戻す）。お気に入りの上段固定もフォルダ内。
- Auto Nextの範囲は`findEnabledTrackIndex()`の1箇所（前/次・メディアキー・曲終了が全部通る）。フォルダ定義は`qn_folders_v1`、曲の所属はメタの`folder`（localStorageのみ。IndexedDBの音声は書かない）。
- Backupのmarkers.jsonにはフォルダ**名**で入れる（idは端末ごと）。キーが無い旧バックアップはフォルダを触らない。
- **ドラッグ（v3.27.0）**：曲のつまみ=`.playlist-drag-handle`、フォルダのつまみ=`.playlist-folder-grip`（クラスを分けてある。曲側のドラッグが拾わない）。どちらも測定（`findPlaylistScroller`/`measureFolderBlocks`）はドラッグ開始時に1回だけ、ドラッグ中はtransformのみ・DOM順の変更と保存はonEndで1回。座標は「スクロール量を足した内容座標」。端では50ms間引きのタイマーで自動スクロール（rAFループは使わない）。
- 曲を別フォルダの範囲（見出し〜曲行。折りたたみ中は見出し）へ運んで離すと`moveTracksToFolder`（移動先の末尾）。同じフォルダの範囲なら従来の並び替え。フォルダのドラッグは全フォルダを見出しだけに畳んで行い（`.folder-drag-hidden`）、確定は`setPlaylistFolderOrder(ids)`→`persistPlaylistOrder()`→`renderPlaylist()`。無料版は両方`isUnlocked()`でブロック。

## 5.6 シークバー（v3.36.0）
- **行(.vbar)は仮想スクロールで作られ・回収・再利用される。** 行DOMを`getElementById`等で直接探さず`QNBars.rowEl/eachRow`を使い、行に付ける物は`decorateBarRow`経由で後から作られる行にも付くようにする。
- ドラッグ中の線/A-B旗は`.is-dragging`/`.dragging`を付け、その行は回収させない（掴んだ要素をDOMから消さない）。
- 手動スクロール判定は「入力(wheel/touch/pointer)の直後」または「プログラムのスクロール期間(progUntil)外」。追従は`seeked`/`play`で再開。

## 6. 制限（無料版）・アプリ
- **制限チェックは「みんなが通る一番奥の関数」に置く**（例：`playTrackAt()`）。入口ごとに書くと、新しい入口（前/次ボタン・メディアキー・自動送り）で素通りする。
- 無料版制限（`SW_LIMITS`）は「新しく増やす」操作にだけ掛かる。インポートは復元用途なので意図的に無制限。新機能ごとに適用するか明示的に決める。
- 本体のCSSは`#pcV2PanelBody …`で限定されているものが多い。本体のクラスをアプリ（`.qn-yt`等）で流用する時は、同等のルールをアプリ側に写す。本体のデザインを変えたらアプリ側も追随する。
- フォーカスを持つ入力欄は、行をDOMに追加する**前**に`startEdit()`する（追加後だと後続の描画がフォーカスを奪う）。
- SP幅でYouTubeのプレイヤーを隠さない（規約。`YOUTUBE_APP.md`）。

## 7. 作業の進め方で得た教訓
- **大きな文字列置換で無関係なコードを巻き込んで消した実績あり。** 大きく書き換えたら、直前の版と関数名・トップレベル変数を`diff`して意図しない削除がないか確認する（`node --check`では見つからない）。
- 症状はユーザーのスクリーンショットが最重要の手がかり。確認できていないことは正直に書く。
- 実ブラウザは使えない。確認はローカルHTTPサーバー＋Playwright（ヘッドレスChromium）まで。YouTubeのIFrame APIは実ネットワークに出られないと読み込めない（`iframe_api`をモックに差し替える）。`file://`では動かない。
- 動的に組み立てるクラス名・idがある（`"is-" + kind`、`"pcv2-panel-" + panelId`、`eqBand0〜9`等）。**未使用判定は単純な文字列検索だけで決めない。**

## 8. Library同期(player-sync.js)
- Firestoreは**配列の入れ子不可**。マーカー/ABは`[{t,e,m,c}]`/`{a,b}`のオブジェクトで持つ。
- 同期が`localStorage.setItem`を横取りして変更検知している。同期の反映中は`applying`で無視しないと「反映→検知→再同期」で無限ループする。反映側の書き込みは`origSetItem`か`applying`中に行う。
- 曲の削除は`deletePlaylistTrack`の明示呼び出しだけを削除として扱う。「ローカルに無い=削除」と判断すると、IndexedDB読み込み失敗時に全曲がクラウドから消える。
- ghost(未インポート)は`playlist[]`に入れない(行のdata-index=配列indexの前提・選択/ドラッグを壊すため)。描画は`.qn-lib-extra`クラスで曲行と区別し、`measureFolderBlocks`は`.qn-lib-extra`を最後のフォルダの範囲に含めない。
- 並びの主導権(`ou`)は「両端末にある曲の相対順が変わった時」だけ更新。曲の追加・取り込みで更新すると、取り込み順で相手の並びを上書きする。
- P2P転送(player-p2p.js): 合図は「経路候補が出そろってから1回だけ書く」(trickleにしない=書き込みと読み取りが増える)。DataChannelのメッセージは16KB以下、`bufferedAmount`が1MBを超えたら`bufferedamountlow`まで待つ(待たないとiOSでメモリが膨らむ/切断する)。空のライブラリへ最初の1曲を入れると`addFilesToPlaylist`が自動再生するので取り込み直後に`audio.pause()`する。
- アプリ内の文言はタメ口・絵文字にしない(簡潔な丁寧語)。ボタンは英語大文字(`text-transform: uppercase`)、新しいモーダルは`.export-modal*`・`.export-section*`・`.track-backup-row`・`.export-filename-input`・`.export-run-btn/.export-cancel-btn`を流用して独自デザインを作らない。

## 設定パネルとプリロード要素(v3.37.0)
- `#loopPreRollControl`は設定パネル内に置く(player-controls.jsのハンドラがこの要素に付いているので作り直さず移すだけ)。設定パネル本体は初回rAFでstashへ入れる(let宣言より後に走らせるため)。
- 速度±の刻みはplayer-controls.jsの`speedStepPct`(`setSpeedStepPct`)。無料版はSpeed変更がロックされるのでテストは`snapSpeedStep(dir)`で確認する。
- 波形は1行1本のPath2Dを色の区間ごとにclipして塗る(マーカー色/再生済み)。バー個別のfillRectに戻さない。

## 設定パネルの部品ルール(v3.43.0)
- 設定の選択肢は`.qn-stepper`(‹ 値 ›)だけを使う。ボタン列(セグメント)や別デザインの＋/−を新設しない。項目を足す時は`SETTING_DEFS`に{values,get,set,fmt}を足し、`settingsStepper(kind)`で置く。
- `#loopPreRollControl`はindex.htmlで`.qn-stepper`のマークアップ。`#loopPreRollValue`は`textNode + .qn-stepper-unit`構造(player-controls.jsが`firstChild.textContent`を書き換える)なので構造を変えない。

## 設定UIの共通化(v3.44.0)
- 設定の行/ステッパー/スイッチ/Moreの一覧は`JS/qn-settings-ui.js`(QNSettingsUI)だけで作る。CSSは`CSS/style-settings.css`だけ。PLAYER(player-ui-pc-v2.js)にもアプリ(qn-apps.js)にも個別の行ビルダーを書かない。
- アプリ固有の設定は`QNApps.register({settings: [{title, rows:[...]}] | () => [...]})`。`build()`が返す`el`のクリック処理は`el`自体に付くので、子要素だけ別の親へ移さない(動かなくなる)。
- 下層(Color/Keyboard等)から戻る時のスクロール位置は`settingsScroll`(PLAYER)/`rootScroll`(アプリ)で復元。

## SPメインドックと波形ジェスチャー(v3.45.0)
- `#pcV2SpDock`は既存ボタン(`#playToggle` `#loopToggleBtn` `#addPinBtn` `#prevMarkerBtn` `#nextMarkerBtn`)への中継とミラーだけ。ハンドラやidは既存側に残す。ドックは既存ボタンがdocumentに接続された後(`buildSpDock()`はroot挿入後)に作ること。
- 下段バー(`#pcV2BottomBar`)は`#pcV2Root.qn-sp-more-open`の時だけ表示(SP)。パネル高さ変数`--pcv2-bottom-bars-height`にはドックの高さも含める。アプリ表示中は`body.qn-app-open`でドックも非表示。
- 波形ジェスチャー(player-ui-shared.js)は`#vbarRows`で受ける。`touch-action: pan-y`(SPのCSS)が前提。マーカー線・A/B旗の上から始めた操作は対象外。長押し/スクラブ直後のclickは`suppressUntil`で無効化。ダブルタップ停止は再生中のみ。

## マーカーのスキップ(v3.46.0)
- `pins[i].skip=true` = そのマーカーから次の有効マーカーまでを飛ばす区間(`getSkipRanges()`)。再生側は`updateBars()`末尾で「自然に開始点を跨いだ時だけ」次へ飛ぶ(`prevTime<start<=currentTime`、差0.5秒未満)。シーク/ジャンプ中・ループ中は発火しない=ユーザーがタップして入った区間はそのまま再生。
- skipは`savePins`(localStorage)/トラックバックアップ(`skip`)/同期(`k`)に含める。新しいマーカー項目を足す時はこの3箇所とplayer-sync.jsの復元側を揃える。YouTubeアプリのマーカーは未対応。

## SPのアイコンバーとアプリ切替(v3.47.0)
- アプリ切替はヘッダーのロゴ`#qnAppLogoBtn`(index.htmlにある。PC/SP共通。v3.50.0〜サイドバーのバッジ`#qnAppBadge`とSPの`#qnAppSwitchBtn`は撤去済み)。フライアウトはロゴの真下に出るドロップダウン(`positionFlyout()`がロゴの矩形基準。z-index 450=サイドバー400より上。幕は透明)。**開いている間は`shiftHostForFlyout()`が`#qnAppHost`をtransformで下へずらす**(YouTubeプレイヤーを覆わない規約対応。はみ出す下側はclip-pathで切る。空いた上側は`#qnAppShiftCover`で塞ぎ裏のPLAYERを見せない)。フライアウトの高さや位置を変えたらこのずらし量も確認。外側タップ判定の除外に`#qnAppLogoBtn`を含めること。表示名はqn-apps.jsの`BRAND`(YouTubeアプリは規約上グレーになりうるので名前に「YouTube」を入れない)。
- SPのアイコンバーは`overflow-x:hidden`+各タブ`flex:1 1 0`(v3.48.0でSeekbarタブ撤去=5タブ)。ラベル(span)は`.active`/`.qn-app-active`以外を`visibility:hidden`(`display:none`にすると選択でバーの高さが変わる)。タブを増やす時は幅(6〜7個まで)を確認。
- SPヘッダーのバージョン表記(`#appVersion`)はCSSで非表示。確認は設定の最下段(`QNSettingsUI.versionLine()`)。

## Markersパネルの行(v3.51.0)
- `.pinItem`は4列grid(色丸/ラベル/`.pin-act-cell`/選択`.pin-del-zone`)。操作ボタン(`.pin-act-btn`: 編集`.pin-edit-btn`・SKIP`.pin-skip-btn`・HIDE`.toggle-btn`)は`.pin-act-cell`の中に入れる(子を増やさない)。編集ボタンはEDITモードだけ表示(CSS)。
- ボタン/スワイプトレイのアイコン・ラベルは`window.QN_ROW_ACT`(player-markers.js)だけで決める(qn-apps.jsのトレイも読む)。kind: edit / skip(曲) / mskip(マーカー区間) / hide / del。
- 行には`data-pin-index`と`row._qnEdit`(編集の起動)を持たせ、スワイプ(player-swipe.js)と色丸タップが同じ処理を呼ぶ。player-swipe.jsでDOM変数名に`pins`を使わない(グローバルのマーカー配列を隠す)。
- 削除用の選択中は`.pin-act-btn`を全部disabled(再描画で選択表示が消えるため)。YouTube側のマーカー行(`.qn-ab-block`等)は未変更。

## Markersパネルの行(v3.52.0の変更)
- 並びは`.pin-act-cell`内でSKIP→HIDE→編集、その右の`.pin-del-zone`が削除選択タイル(中に`.del-btn`+`.pin-del-tile`。`.del-btn`はEDIT中は非表示で`pcv2-selected`の持ち主、タイルは兄弟結合子`.del-btn.pcv2-selected + .pin-del-tile`で赤になる)。選択のクリックは従来通り`.pin-del-zone`をキャプチャで拾う。
- SKIP/HIDEは背景なし+`border-left`の区切り線。ON(`.is-on`)はsvg/spanをopacity .35。編集/削除タイルだけ背景付き。
- スワイプトレイ(player-swipe.jsのmarkers)は編集+削除のみ。`mskip`/`hide`のトレイ用スタイルは未使用(QN_ROW_ACT自体はボタン用に使用)。
- FAB(Markers): `#pcV2DeleteSelectedBtn`は作らず、同じ位置に`#pcV2MarkersCancelBtn`。`#pcV2MarkersEditBtn`は編集中に選択0=OK/1以上=Delete(`syncMarkersEditBtn`、`syncSelectionButtons`から呼ぶ)。Playlist側のFABは従来通り。
- v3.52.1: 行ボタンは50px正方形(行のmin-height 50px=ボタン高)。`.pinItem`のcolumn-gap 8pxは編集EDIT時に`.pin-act-cell{margin-right:-8px}`で打ち消し、タイル同士を密着。

## 文言ルールとLibraryの行(v3.53.0)
- UI文言は「先頭大文字・以後小文字」(例: Skip / Drop audio file here)。例外=ロゴ、略語・形式名(MP3/WAV/ZIP/EQ/OK/BPM等)、音名。CSSで`text-transform: uppercase`を新設しない(ロゴ以外)。ラベルは元の文字列を直接その表記で書く。
- Libraryの行(`.playlistItem`)も`.playlist-act-cell`(Skip)+編集中の`.playlist-del-zone`(中に`.del-btn`+`.playlist-del-tile`)。通常/編集とも正方形57px・隙間0(編集中は`.playlist-act-cell{margin-right:-8px}`でgrid gapを打ち消し)。Skip中は行全体でなく子要素だけopacity .4。旧`.playlist-skip-toggle`はPLAYERでは使わない(YouTube側は従来)。
- FAB(Markers/Library共通): `#pcV2MarkersCancelBtn`/`#pcV2PlaylistCancelBtn`がDeleteの位置、EditBtnは選択0=OK/1以上=Delete(`syncEditBtn`)。`#pcV2DeleteSelectedBtn`は廃止。
- v3.53.1: メモ編集中は`window.qnPinMemoEditing`でrenderPinList()を止める(commit/cancel/applyPresetで解除)。`.playlist-editable-input`はfont-size/weight/line-height等をinheritする(入力欄の既定13.3pxで編集モードの見た目が変わるため)。Libraryの`.playlist-del-tile`は輪/チェックの2svg(`.sel-off`/`.sel-on`)をCSSで切替。

## 長押しクイック設定(v3.54.0)
- `player-quickpop.js`が`document`のpointerdown(capture)委譲で拾う。対象は`TARGETS`(セレクタ→定義名)に1行足すだけ。行の定義は設定パネルと同じ`{label,hint,type,values,get,set,fmt}`で、見た目は`QNSettingsUI.build`の流用(新しい独自UIを作らない)。
- 長押し450ms/10px動いたら中止。成立後に指を離した時のclickは`swallow`で握りつぶす(ボタン本来の操作を発火させない)。対象には`user-select:none`と`contextmenu`抑止(iOSの選択/メニュー対策)。
- 送り秒数は`window.QNSkip`(player-ui-pc-v2.jsのクロージャ内skipSecの公開口)。QNBarsはグローバルのconst(`window.QNBars`ではない)。
- 再生中の見た目は停止中と同じ色(ドック/FAB/#playToggleとも緑のグラデ禁止)。

- **`#vbarRows .vbar`は`width:auto`必須**（style-core.cssの`.vbar{width:100%}`が`left/right`の指定を打ち消し、行が右へ約56px(ラベル幅+右余白)はみ出して右端のマーカー・波形が見切れた。JS側のバー幅`g.barW`は`clientWidth-labelW-padRight`で計算しているので、CSSの幅とずれると描画も歪む）。
- 波形右下の帯(`QNSettingsUI.inline`、`#pcV2WaveFabRow`内)は設定パネルのSeek bar項目と同じ値。変更は`settingsSections.onChange`/`window.qnBarStripSync`/`syncSettingsBody`で相互に同期する。項目を足す時は両方に足す。
- **設定パネルの「操作ガイド」**（`player-ui-pc-v2.js`の`rowsHold`/`rowsGesture`/`rowsSwipe`、日本語は`qn-i18n-ja.js`）は、長押し対象(`TARGETS`)・波形ジェスチャー・行スワイプを足す/変える時に**必ず文言も更新する**。アプリの売りなので、操作を追加したらここに書く。

## v3.55.0
- 長押し対象には右下◢(style-quickpop.cssの::after)。`player-quickpop.js`のTARGETSとCSSセレクタを必ず揃える。(v4.0.2で時刻ラベル/時間表示の長押しは撤去。Bar length/Rows/Followは波形右下の帯`#pcV2WaveFabRow`に常時表示)
- SPの下段バーは`#topControls`幅200%・各`.pcv2-ctrl-group`が50%(=1画面)のスナップ2ページ。矢印は`#topControls`直下のsticky(`.pcv2-bar-page`)。`is-page-1`クラスはscrollで付け替え。PC幅は矢印非表示・従来配置。
- Marker Memoのデフォルト項目は`MARKER_LABEL_PRESETS`(id=元の名前)+上書き`qn_marker_preset_labels_v1`。色(`qn_marker_preset_colors_v1`)もidキー。表示名は`markerPresetDisplay(id)`を通す(直接MARKER_LABEL_PRESETSを表示に使わない)。
- Backupの一覧は`.track-backup-group`(枠)ごと。枠を足す時は`startGroup(text)`。

## quickpop(3.56.0)
- `DEFS[kind](el)` は `{title, rows}` か `{title, build(ctx)}`(独自本文)を返す。対象を増やす時は TARGETS / `style-quickpop.css` の ◢ セレクタ(position:relative込み)/ no-select セレクタの3か所を揃える。
- libitem は Libraryの編集モード、ドラッグハンドル・button・input上では起動しない。
- 波形ポップアップの微調整は `pinPopNudge`(pin→pins再ソート+refreshAfterPinChange、A/B→afterABChange)。

## i18n(3.57.0)
- 表示文は日本語で書き、`qn-i18n.js`のDICT/RULESに英訳を足す(キー方式ではない)。辞書に無い文は日本語のまま出る。
- 表示文をコード側で比較(`textContent === "…"`)しない。英語表示で外れる。
- localStorageキー `qn_lang` を AI_ASSISTANT_PROJECT_CONTEXT.md のキー表に追記済みか確認すること。

## i18n 日本語表示(3.60.0)
- observerは日本語表示でも動く。自分の書き込みは`__qnTr`(訳した文)と現在値の一致で無視する。コード側が書き直した時だけ訳し直す。
- 英語のソース文言を足したら`qn-i18n-ja.js`に日本語を足す(辞書に無い英語はそのまま出る)。アイコンボタンのラベル/パネル見出しは足さない(KEEP_SEL)。
- ユーザーデータと同じクラスのボタンを作る時は`DATA_SEL`に当たらないか注意(例: プリセットチップ)。
- 【v3.61.0】設定のステッパー(`QNSettingsUI`)は端でループする(矢印は無効化しない)。Quickpopの連続値(±)はループさせない。
- 【v3.61.0】Speedは0.50/0.75/1.00/1.25/1.50の±0.02で吸着(`handleSpeedRangeInput`が入口。PCバーミキサーも同じ関数を通す)。Controlパネルの効果ON/OFFは`.glow-switch`、OFF時のバーは`.is-effect-off`(無彩色)。KeyはレンジのみでKey用の自作フィルバーは廃止。
- 【v3.61.0】Backup: YouTubeは曲単位で選ばず「YouTube各種データ」(`#trackBackupIncludeYoutube`)で全件出力。ラベルは「PLAYER音声データ」「ユーザー設定データ」。
