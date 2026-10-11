# QNPLAYER YouTubeアプリ 仕様と規約ルール

現行のYouTubeアプリの仕様書 兼 規約遵守ルール。

- 実装：`JS/qn-app-youtube.js`（本体）／`CSS/style-youtube.css`（見た目）／`JS/qn-apps.js`（ロゴ切替・フライアウト・表示領域）／`JS/qn-marker-core.js`（PLAYERと共通のループ判定）
- **YouTube関連の変更をする時は、まず§2（規約遵守ルール）を読む。** 便利さのために§2を破る実装は入れない。

---

## 0. 目的と方針

最終目標：YouTube規約に照らして健全なページを作り、将来的に広告収益を得る。規約的にグレーになり得る実装は最初から採用しない（§2が最優先）。

- 使うのは**YouTube公式のIFrame Player API（埋め込みプレイヤー）のみ**。
- 音声・映像の抽出／ダウンロード／保存／Web Audio接続は**一切しない**。そのためYouTubeでは波形・ピッチ変更・EQは**できない**。
- 永続保存するのは「URL・**利用者が手入力したタイトル(`customTitle`)**・マーカー（秒数・メモ・色）・A/B点」だけ。YouTube由来のタイトルは端末ローカルの短期キャッシュ(28日で削除)のみ。
- 本体（PLAYER）と同じ操作・見た目に揃える（§3）。

---

## 1. 現在の仕様

### 入口
- ヘッダーのロゴ(V付き)を押す→一覧でQNVIDEOを選ぶ。サイドバーは上段「Library / Markers」、下段「Backup / Import / Keyboard / Color」（本体と同じ並び）。
- アプリ表示中は`body.qn-app-open`：本体のaudio一時停止、下段バー非表示、本体のショートカットと曲追加D&Dを無効化。Colorは常駐（PLAYERと同じパネル。Marker Memo Colorsも表示）。

### URL読み込み
- 対応：`youtube.com/watch?v=` / `youtu.be/` / `youtube.com/shorts/` / `youtube.com/embed/`。不正URLはエラー表示。
- IFrame APIは**初めて動画を読み込む時まで取得しない**。埋め込み禁止の動画は`onError`で「埋め込み再生できません」（回避策は作らない）。
- **Save**＝読み込み＋保存（同じ動画があればタイトル更新、なければ新規）。保存後は入力欄を空に戻す。**タイトル欄は空欄OK**：空欄ならYouTubeのタイトルをoEmbedで自動取得して表示（既に手入力タイトルがあっても、空欄でSaveすると手入力を消して自動取得に戻る）。Libraryの鉛筆編集も同じ（空欄で確定＝自動に戻す）。表示タイトル＝`customTitle`→キャッシュ済みYouTubeタイトル→`youtu.be/<id>`。

### Library（本体のLibraryと同じ行・操作）
- 行：つかみ（ドラッグ並べ替え）／サムネイル（`i.ytimg.com/vi/<id>/mqdefault.jpg`を`<img>`で**表示のみ**・保存しない・加工しない）／タイトル（鉛筆で編集）。行クリックで再生。
- 行右はPLAYERと同じ□タイル（`.playlist-act-cell > .playlist-act-btn`のSKIP。SKIPはAuto Nextで飛ばす。`QN_ROW_ACT`のアイコン/ラベル）。右下FAB **Edit**：タイトルが入力欄になり、行に選択タイル（Select）が出る。FABは Move / **Cancel**（編集を抜ける）/ OK。選択が1件以上あるとOKが**Delete**に変わり一括削除（PLAYERと同じ）。
- **Repeat**（v4.14.0〜。旧Auto Nextの切替は廃止し次動画への自動再生は標準搭載）：PLと同じ Off→One→Folder→All（`qn_yt_repeat`、バッジ1/F）。動画終了時 Off=Libraryの次へ進み最後で止まる／One=同じ動画をもう一度／Folder=今のフォルダ内を折り返す／All=全体を折り返す。SKIPは飛ばす。前/次Trackも同じ範囲(Folder/Allは折り返し)。判定は`neighborItem()`の1箇所。

### Libraryのフォルダ（v3.31.0〜）
PLのLibraryと同じ操作。FOLDERで作成→名前入力、見出しクリックで開閉(端末ごと・同期しない)、EDITで改名/▲▼並び替え/✕削除(2タップ、中の動画は未分類へ)、見出し左のつまみ(`.playlist-folder-grip`、PLと同じ)のドラッグでもフォルダを並び替え(`attachFolderReorder`。つかむと動画行を`folder-drag-hidden`で畳み、離した位置=他の見出しの中心を越えた数に確定。未分類は末尾固定でつまみ無し)、動画を選んでMoveで移動、つかみのドラッグでも別フォルダへ移動可(見出しにドロップ=その先頭)。データは`qn_yt_folders`=`{list:[{id,name}],at}`と各item.folder。Auto Next/Track前後はフォルダ順の表示順で進む。同期はドキュメントに`folders`/`foldersAt`(一覧は新しい方を丸ごと採用)を追加、動画の所属は`folder`(動画のupdatedAtで合体)。

### Playlists（v3.31.0〜）
YouTube Data API v3(`playlists`/`playlistItems`、最大500件)で公開/限定公開の再生リストを取得して一覧表示。APIキーは`window.QN_YT_API_KEY`(index.html)か、パネルの「API Key」から入れた端末のlocalStorage(`qn_yt_api_key`)。結果は**メモリのみ**(保存しない)。行クリックで再生(Libraryに無くても可)、チェック→Add to Libraryで追加(フォルダがあれば移動先ピッカー)。追加した動画はvideoIdと、28日キャッシュ経由のタイトルだけ保存。URL+APIキー方式では非公開リスト・Mix(RD)・高評価/後で見るは取れない。**My Playlists**(v3.31.1〜)はログイン中アカウントに`youtube.readonly`の確認ポップアップ(`QN_AUTH.getYtToken`=`reauthenticateWithPopup`)を出し、アクセストークン(メモリのみ・約1時間)で自分の再生リスト一覧(`playlists?mine=true`)と高評価(`LL`)を取得。APIキー不要。要件: Google CloudでYouTube Data API v3の有効化、OAuth同意画面でテストユーザー登録(未審査の間)。

### Markers（本体のMarkersと同じ行・操作）
- 行：色の丸／「番号 - メモ」／□タイル（`.pin-act-cell > .pin-act-btn`：SKIP・HIDE、EDITモードのみ編集と削除選択タイル）。編集はメモ入力＋プリセットチップ（プリセットを選ぶと色も自動。カスタムプリセットも並ぶ）。A/Bは行から外した（PLAYERと同じ。シークバーのポップアップ/下段バー/長押しで設定）。FAB：ADD MARKER・Edit（編集中はCancel・OK→選択ありでDelete）。
- 非表示マーカーはシークバーにも出さず、前/次マーカー移動でも飛ばす。
- **チャプター貼り付け**（Markersパネル上部）：利用者が説明欄からコピーした`時間 タイトル`を貼ると1行ずつ解析してマーカー化（`0:00 タイトル`／`1:02:03 - タイトル`／`[2:45] タイトル`／`- 0:45 Aメロ`、全角可。同時刻の重複と動画長超えはスキップ。プリセット名と一致するメモは色を自動付与）。YouTubeからは何も取得しない。

### シークバー（プレイヤーの外・自前）
- 見た目は本体の`.vbar`に寄せる（角丸なし・#111の帯・再生済みはテーマ色・現在位置は白線）。**波形は使わない。** 3行に分割（全長を3等分）。どの行でもクリック/ドラッグで`seekTo`。
- マーカーは縦線（マーカー色）＋番号＋メモ。ドラッグで位置変更（行またぎ可）、動かさず離すとジャンプ。
- **バーのクリック＝シーク＋再生**（利用者操作起点で`playVideo()`）。動かさずに押して離すと位置の真上にポップアップ：空き位置＝`A / B / ＋Marker`、マーカー上＝`A / B / － / Color / Hide`、A/B点上＝`－ Point`。`－`は2回タップ（1回目Sure?）。Colorは「ラベル入力＋プリセット＋色」のセット（PLAYERと共通）。

### ループ（`QNMarkerCore`でPLAYERと判定共通）
- **A/B点**：マーカーではない独立した「使い捨ての区切り位置」（秒数のみ。動画ごとに`loopA/loopB`）。旗（A=右、B=左）をドラッグで移動。同位置(±0.5秒)でもう一度押す／`－ Point`で解除。マーカーを消しても残る。
- **LOOPボタン（1つで3モード）**：OFF → A-B → Section → OFF（A/B未設定ならA-Bを飛ばす）。`current.loopMode`=`off|ab|sec`。
- **Section**：表示ONのマーカー〜次の表示ONのマーカー。マーカー2つ未満だと動かない。区間は再生位置に追従（許容範囲を外れたら位置の区間へ切替）。保存はしない。
- **プリロール/ポストロール**：Loopの右の`−／＋`（前後共通、0〜5秒・1秒刻み、`qn_yt_preroll`）。折り返しは「区間の終わり＋秒数」まで再生し「区間の開始−秒数」へ戻る。
- A-Bループ中にA〜Bの外をクリック（シークバー・マーカー・A/B点・マーカー一覧）するとLOOP OFF（A/B点は残る）。
- 前/次マーカー：現在位置基準（区間ループ中のプリ/ポスト再生中は区間の内側として扱う）。次が無ければ最初、前が無ければ最後へ。

### 下段コントロールバー（`.qn-yt-bar`）
PLAYERの`#pcV2BottomBar`と同じ「アイコン＋ラベル」のフラットなデザイン。並び：再生系（Track / −10s / Play / +10s / Track / Repeat）│マーカー系（Marker / ＋Marker / Marker / Set A / Set B / Loop / Clear AB）│スピード（− 1x Speed ＋。アイコンを押すと1xに戻る）。
PC幅はステージの下端に吸着、SP幅はアイコンバー直上に固定して横スクロール。パネルを開いている間はSP幅では隠す。再生ボタンは`updatePlayBtn`がPlay/Pause表示を差し替える。

### 長押しクイック設定（v4.1.0〜）
下段バーの◢付きボタンを長押しすると設定ポップアップ（PLAYERと共通の`QNQuickPop`。VIDEO側は`qn-app-youtube.js`末尾で`QNQuickPop.add(selector, fn)`により登録）。Play=Speed（値タップで1x）／前・次Marker=前・次の動画へ(ポップアップ無しの即実行。`QNQuickPop.add`の定義が`{action}`を返す。v4.23.0〜)／A・B=±0.1秒微調整＋±1s＋Clear（動画読み込み後のみ）／＋Marker=プリセットを選んで追加／前・次Track=Library一覧ジャンプ／Loop=プリロール秒／−10s・+10s=スキップ秒。対象を増やす時は`style-quickpop.css`の◢セレクタも揃える。

### シークバーの行数（v4.1.0〜）
Settings > Seek bar > Rows（Off/Auto/3〜12、既定3、`qn_yt_segs`）。`setSegs`が行を作り直して再描画する。Off=`.qn-yt-noseek`でシークバーを隠す（内部の行数は1のまま。0除算回避）。PC幅はプレイヤーが残り高さを使うので自動で広がる。

### ステージのURL入力（v4.2.0〜）
ステージ右下のFAB行（`.qn-yt-stage-fab`）にURL欄+Save。Libraryを開かずに保存でき、中身は`saveFromInputs`を流用。既に登録済みの動画は手入力タイトルを保ったまま。結果は`ytToast`で通知。

### マーカー区間のSKIP（v4.2.0〜）
`marker.skip=true`のマーカーから次の有効マーカーまでを再生中に飛ばす（PLAYER 3.46.0と同仕様）。行のSKIPボタン/SPスワイプの`mskip`で切替。`poll`が「開始点を自然に跨いだ時（前回位置との差が2秒未満）」だけ`seekTo(終端)`。ループ中・手動シーク（差が大きい）では飛ばさない。シークバーには斜線(`.segmentSkip`)。`skip`はBackup/Import/同期にも含む。

### 行・FABのPLAYER部品流用（v4.4.0〜）
Library/Markersの行ボタン・選択タイル・Cancel/OK→Deleteは**PLAYERの部品とCSSをそのまま使う**。CSSは`style-markers.css`/`style-pcv2-panels.css`の`#pcV2PanelBody …`限定ルールを`:is(PLAYER側, .qn-yt側)`に拡張してある（VIDEO側は`.qn-yt[data-edit="library"] .qn-yt-libbox`/`.qn-yt[data-edit="markers"] .qn-yt-pinbox`）。**PLAYERの行デザインを変える時はこの`:is()`の両側に効く**。VIDEO専用の行CSSは増やさない。

### ステージFAB・下段バー（v4.4.0〜）
ステージFAB行は URL入力／Rows(`QNSettingsUI.inline`。段数はSettingsと連動)／Save／Marker。PC幅の下段バーはPLAYERの`#pcV2BottomBar`(v3.59.0)に寄せた寸法（ボタン最小幅・左右余白・区切り余白はウィンドウ幅に応じて縮み、広い窓でPLAYERと同じ）。バーとSPドックは`.qn-yt-controls`で1つのstickyにまとめる（PC幅は`display:contents`）。

### SPメインドック（v4.3.0〜）
SP幅だけ`.qn-yt-dock`（Prev/Loop/再生/Marker/Next/More。PLAYERの`#pcV2SpDock`と同寸法、ボタンは共通の`.pcv2-dock-btn`）。押す先は下段バーの既存ボタン（`data-yt`のref経由で中継）で、再生アイコンとLoopの状態は`MutationObserver`で下段バーから写す。Moreで下段バー(`.qn-yt-bar`)を開閉（既定は閉、`qn_yt_more`。クラス`.qn-yt-more-open`）。パネルを開いている間はドックも隠す。PC幅は非表示。長押しクイック設定の対象はドック側の`data-dock`も含む。

### スピード
プレイヤーの**外**の自前UI。倍率は`getAvailablePlaybackRates()`、変更は`setPlaybackRate()`のみ。`qn_yt_rate`に保存。

### ショートカット（アプリ表示中のみ。`onShow`で登録、`onHide`で解除）
YouTube本家準拠：Space/K 再生⇄一時停止、J/L ±10秒、←/→ ±5秒、↑/↓ 音量±5%、M ミュート、0〜9 動画の0〜90%へ、Home/End、`,` `.` 一時停止中の1フレーム、`<` `>` 速度、Shift+P/N Libraryの前/次。F/T/C/Iなどiframe内部の機能は入れない。文字入力中・Ctrl/Meta/Alt併用は無視。変更は`QNApps.toast()`で一言表示。Keyboardパネルの表は`QNApps.renderShortcuts(hostEl,"youtube")`（元データは`SHORTCUTS`）。

### Backup / Import
実体は`JS/player-track-backup.js`（本体と共通の1画面）。YouTubeは`window.QNYouTubeBackup`（`list/buildExport/parseImport/exists/titleOf/applyImport`）でデータの出し入れだけ提供。
- Backupの曲リストに「PLAYER」「YouTube」の見出しで両方が並ぶ。両方選ぶと**1つのZIP**（`markers.json`＋`audio/`＋`youtube.json`）、YouTubeだけなら`qn-youtube-library_YYYYMMDD.json`。
- Importは中身を自動判定（`markers.json`＝PLAYER／`youtube.json`またはformat=`qn-youtube-library`＝YouTube）。重複は上書き/スキップ（行ごと＋一括）。値は検証・整形して取り込む（`normalizeImport`）。

### SP幅
パネルを開いても**プレイヤーは画面上部に残す**（`max(200px,30dvh)`、最低200px、覆わない）。パネルはその下。パネル中は自前シークバー等とフッターを隠す。Colorパネルもプレイヤーの直下から始まる。プレイヤーの要素には`data-qn-keep-visible`が付いている。PC幅は、サイドアイコンの再押下でパネルを格納できる（`qn_yt_panel_collapsed`。プレイヤーの幅は`--qn-yt-player-w`で固定）。

### 同期（v3.26.0〜）
ログイン中の自分のUIDだけ、LibraryをFirestoreで端末間同期（動画ID・URL・customTitle・マーカー・A/B点・skip・並び順。YouTube由来タイトルは含めない）。未ログインは従来どおりローカル完結。仕組み・ルール・合体規則は`md/SYNC.md`。Libraryに「☁ 同期済み HH:MM」を表示。

### フッター・その他
- `.qn-yt-legal`（Libraryパネル内）：「権利者に無断でアップロードされた動画は使用しないでください」の注意書き(§2-6)、YouTube API Services利用の明示、YouTube利用規約・Googleプライバシーポリシーへのリンク、「保存データは端末内のみ・YouTubeと通信する」旨。
- 画面スリープ防止：`QNWake`（再生中PLAYINGだけ保持）。
- 広告：コード無し。`.qn-yt-ad-slot`で枠だけ確保（今は表示していない）。
- 他アプリ：TUNER / PITCH は別アプリ（`TUNER_APP.md` / `PITCH_APP.md`）。

---

## 2. 規約遵守ルール（最優先・破らない）

根拠：YouTube API Services Developer Policies（<https://developers.google.com/youtube/terms/developer-policies>）とRequired Minimum Functionality。規約は更新されるため、公開・収益化の前に必ず原文を再確認すること。

### 2-1. 埋め込みプレイヤーには手を加えない
- 公式のIFrame Player APIで表示し、**YouTube標準のコントロールをそのまま表示**（`controls: 1`。`controls: 0`は使わない）。
- プレイヤーの上にUIを**重ねない**（オーバーレイ、透明レイヤー、`pointer-events`での操作ブロックも禁止）。
- CSSでプレイヤーを**切り抜かない・隠さない・歪めない**（`overflow`・`clip-path`・`opacity`・極小化・画面外配置。プレイヤー枠に`overflow:hidden`や角丸も付けない）。
- YouTubeのロゴ・リンク・帰属表示を隠さない、変更しない。
- プレイヤーは**常に画面内に表示**。非表示で音だけ流す（バックグラウンド再生）は禁止 → アプリを閉じる/隠す時は`pauseVideo()`。**SP幅でもパネルで覆わない。**
- サイズは**最低200×200px**。iframeを入れ子にしない。

### 2-2. 自前UIは「埋め込みの外」に置く
- 自前シークバー・マーカーUI・スピードUIはプレイヤーの**外側（下）**に余白を空けて置く。
- 呼んでよいのは**公式ドキュメントに載っているメソッドだけ**。現在使用：`seekTo` / `getCurrentTime` / `getDuration` / `loadVideoById` / `cueVideoById` / `playVideo`（利用者操作起点のみ）/ `pauseVideo` / `setPlaybackRate` / `getPlaybackRate` / `getAvailablePlaybackRates`／`getPlayerState` / `getVolume` / `setVolume` / `isMuted` / `mute` / `unMute`（ショートカット用）。タイトル取得用に、YouTube公開の`oembed`エンドポイントも`fetch`している（`fetchYtTitle`。結果は端末ローカルの28日キャッシュのみ）。新しいメソッドは公式ドキュメントで確認してから。
- 非公式・未文書のAPIやYouTubeページのDOM操作には頼らない。再生/停止は標準コントロールを使い、自前の再生・停止ボタンは**付けない**（下段バーのPlayは、利用者操作起点で公式メソッドを呼ぶだけの補助）。
- 再生開始は**利用者の操作起点**（`autoplay: 0`）。マーカーのクリックによるジャンプは利用者操作なのでOK。
- **次動画への自動再生は標準搭載**（v4.14.0〜。利用者の要望でON/OFF切替を廃止。Repeat=OneはもとのRepeat設定で同じ動画をもう一度）。規約リスク: 初期OFF/利用者がONにした時だけ、という安全側の運用から外れている。自動再生は「プレイヤーが見えていて半分超が見えている」時に限る（別タブ/アプリ非表示/半分以上隠れている時は進まない：`playerMostlyVisible()`）。
- 画面スリープ防止は「画面が見えている間だけ」画面を消さないためのもの。バックグラウンド再生を作らない。

### 2-3. 音声・映像データ／YouTubeのデータに触れない
- 音声・映像のダウンロード、キャッシュ、保存、オフライン再生は**作らない**。音声と映像の分離、Web Audioへの接続、`captureStream`等の取り込みは**やらない**。
- スクレイピングはしない。YouTube Data APIも使わない（チャプター自動取得は見送り。**利用者が貼り付けた文字列**を処理するだけ）。

### 2-4. 保存するデータを最小限にする
- 保存してよい：`videoId` / URL / **利用者が付けたタイトル** / マーカー（秒数・メモ・色・有効/無効）/ A/B点 / PLAY・SKIP。
- **YouTubeから自動取得したタイトルは端末ローカルの短期キャッシュ(`qn_yt_title_cache`＝`{videoId:{title,fetchedAt}}`)にだけ置く。28日経過で削除**：起動時とアプリ表示時に`purgeTitleCache`が期限切れ・壊れたエントリ・Libraryに無い動画の分をまとめて削除し、読み出し時も期限切れなら消す。Library削除時もその動画の分を消す。**Backup/Import・サーバー同期には含めない**（同期するのは`customTitle`だけ）。サムネイル・再生数などは引き続き保存しない。iOSでキャッシュが消えても再取得されるだけなので「消える前提」。

### 2-5. 広告・課金（収益化を見据えて）
- 広告はプレイヤーの外に置く（上・中・重なる位置・直接隣接は不可）。「YouTubeのコンテンツしかないページ」にならない（マーカー管理・リスト管理・ローカル再生など独自機能が価値になること）。
- ポップアップ・全画面インタースティシャル・誤クリックを誘う配置は使わない。**YouTube動画の視聴そのものを有料にしない・条件付けしない。** チャンネル登録・高評価・シェアを視聴条件やポイント付与にしない。広告ネットワーク側の独自審査も別途確認。

### 2-6. 著作権への配慮
- 権利者に無断でアップロードされた動画の利用を助長しない。画面に注意書きを置くこと（`.qn-yt-legal`に表示済み）。

### 2-7. 一般公開する時に必要なもの（メモ）
- 独自の利用規約に「YouTube利用規約への同意」を明記しリンク表示。プライバシーポリシー（常時見える位置。YouTube API Services利用・Googleプライバシーポリシーへのリンク・第三者コンテンツの開示・Cookie/ローカルストレージ利用）。
- 埋め込む動画の「子ども向け」判定の扱い（子ども向け動画ではトラッキング停止が必要）。公開前に調査して設計する。HTTPS配信。広告ネットワークの審査。

---

## 3. 本体（PLAYER）との違い

| 項目 | PLAYER | YOUTUBE |
|---|---|---|
| 波形 | あり | **なし**（#111の帯＋テーマ色の塗り） |
| 再生/停止 | 自前ボタン | YouTube標準コントロール（下段バーのPlayは補助） |
| サムネイル | ID3の画像 | `<img>`で表示のみ（保存しない） |
| エフェクト | Web Audio（Speed/Key/EQ） | 不可。スピードのみ`setPlaybackRate` |
| Library行 / Markers行 | `.playlistItem` / `.pinItem` | 同じクラスを流用 |
| マーカーの保存先 | `mp3_pins_<ファイル名>` | `qn_yt_items`内の各動画の`markers` |
| A/B点の保存先 | `mp3_ab_<ファイル名>` | 各動画の`loopA/loopB` |
| FAB / EDITモード | `player-ui-pc-v2.js` | `qn-app-youtube.js`が自前実装（`.qn-yt[data-edit]`とCSS） |

本体のCSSは`#pcV2PanelBody …`で限定されているものが多い。YouTube側は`style-youtube.css`の「Library / Markers」の節に同等ルールを`.qn-yt[data-edit]`付きで再掲している。**本体のCSSを直したらこちらも合わせる。**

---

## 4. データ構造

### localStorage
| キー | 内容 |
|---|---|
| `qn_yt_items` | Libraryの配列（下記） |
| `qn_yt_sync_meta` | 同期の補助情報(削除tombstone・並びorderAt・最終同期) |
| `qn_yt_folders` | Libraryのフォルダ一覧(同期対象) |
| `qn_yt_folder_collapsed` | フォルダの開閉(端末ローカル) |
| `qn_yt_api_key` | Playlists用のYouTube Data APIキー(端末ローカル) |
| `qn_yt_aspect_v1` | 動画の縦横比キャッシュ(28日) |
| `qn_yt_title_cache` | YouTube由来タイトルの短期キャッシュ(28日で削除。Backup/同期対象外) |
| `qn_yt_rate` / `qn_yt_repeat` / `qn_yt_preroll` / `qn_yt_panel_collapsed` | 再生スピード / Auto Next / プリロール秒(0〜5) / PC幅のパネル格納 |
| `qn_marker_preset_colors_v1` / `qn_marker_custom_presets_v1` | 本体と共通のメモプリセット色／カスタムプリセット |

```json
[{ "id": "item_xxx", "type": "youtube", "videoId": "xxxxxxxxxxx", "url": "https://youtu.be/xxxxxxxxxxx",
   "customTitle": "利用者が手入力したタイトル(任意。無ければYouTube由来を表示)", "skip": true, "updatedAt": 1790000000000,
   "markers": [{ "id": "m_xxx", "time": 83.5, "label": "Chorus", "color": "red", "enabled": false }],
   "loopA": 60.0, "loopB": null, "createdAt": 1790000000000 }]
```
- `customTitle`・`skip`・`color`・`enabled`は**付いている時だけ**保存。旧形式の`title`は読み込み時に`customTitle`へ移行("(無題)"は破棄)。`time`は0.1秒刻み。`loopA/loopB`は秒数（旧形式のマーカーIDは`abTimeOf`で変換）。音声・映像・YouTube由来のタイトル/サムネイルは一切含めない。

### Backup / Import形式
`{ "format": "qn-youtube-library", "version": 1, "exportedAt": "...", "items": [{ videoId, url, customTitle?, markers?[{id,time,label,color?,enabled?}], loopA?, loopB? }] }`（旧形式の`title`も読める。`color`は`MARKER_COLOR_PALETTE`にある名前のみ。結合ZIPでは`youtube.json`）。

---

## 5. 技術方針
- HTML／CSS／JSのみ。IFrame Player API（`https://www.youtube.com/iframe_api`）を公式の方法で初回に取得。`playerVars: { controls: 1, autoplay: 0, playsinline: 1, disablekb: 0 }`。
- 現在位置は`setInterval`で`getCurrentTime()`をポーリング（このアプリが表示中だけ）。シークバー操作中は表示更新を止める。
- `file://`ではIFrame埋め込みがエラーになることがある。ローカルサーバー経由で確認。開発時の動作確認は`iframe_api`を偽の`YT.Player`に差し替えたPlaywrightで行う（実YouTube再生は実機確認が必要）。

---

## 6. 変更後の受け入れチェックリスト

**規約（すべてチェックが付くこと）**
- [ ] 標準コントロール表示（`controls: 1`）／プレイヤーの上に何も重なっていない（パネル・Colorパネル・ポップアップ含む。SP幅も）
- [ ] プレイヤーがCSSで切り抜かれ/隠されていない／SPで200px以上
- [ ] 見えないまま音だけ流れる状態がない（閉じる/隠す時は一時停止）／自動再生していない（次動画への自動再生は見えている時だけ）
- [ ] 使用APIが§2-2の公式メソッドだけ／永続保存・BackupにYouTube由来のタイトル・サムネイル・音声・映像がない（タイトルは28日キャッシュのみ・起動時に期限切れ削除）／ダウンロード・書き出し機能がない
- [ ] 権利者への注意書き(`.qn-yt-legal`)が消えていない

**機能**
- [ ] URL読み込み／不正URLのエラー／Saveで保存（入力欄が空に戻る）／リロード後も残る／タイトル空欄Saveで自動取得（手入力済みでも空欄Saveで自動に戻る）
- [ ] Library：並べ替え、EDIT→PLAY/SKIP・選択削除、Repeat(Off/One/Folder/All)
- [ ] Markers：追加、色、メモ＋プリセット、表示/非表示、選択削除、チャプター貼り付け、A/B・Loop 3モード
- [ ] シークバー：クリック/ドラッグ、マーカーのドラッグ、前/次マーカー、ポップアップ
- [ ] Backup→Importで元に戻る／SP幅でパネル開閉してもプレイヤーが隠れない

## シークバーの行数・秒数・スクロール(v4.6.0)
- Rows=窓に出す行数(1〜6、Settingsでは0=Off)。Bar length=1行の秒数(Fit / 5s〜5m)。Fit=全長をRows等分(従来動作、スクロールなし)。秒数指定=全長÷秒数の行を作り、Rows行ぶんの高さの窓で縦スクロール(`.qn-yt-seek.is-scroll`、高さはJSのlayoutSeek)。
- 行数が変わる時(Rows/Bar length変更・動画の長さ確定・動画切替)だけ`ensureRows`で作り直す。updateDisplayは前回行〜今回行だけ更新(行が多くても軽くする)。
- Follow: 再生位置の行が窓から出たらスクロール(`followTo`)。ユーザーがスクロールしたら「Pause after scrolling」秒だけ追従停止。自分のスクロール/作り直し由来のscrollイベントは`progUntil`で無視。
- タッチ: スクロール時の行は`touch-action:pan-y`(縦=スクロール、横=シーク。縦に取られたらpointercancelでシーク解除)。
- ステージFAB: [Seek bar(ON/OFF) / Bar length / Rows / Follow] の帯(スライダー+スイッチ)、URL欄+Saveは連結、Markerは右端。Clear ABは撤去(A/Bのクリアはマーカー操作側)。
- 制約: 1行の秒数は最大2000行まで(それ以上は行が増えないので末尾に届かない場合は秒数を大きくする)。

## シークバーの寸法(v4.7.0)
- 波形が無いので高さは半分(PC 20px / SP 18px)。行の間隔24pxはマーカーの番号/メモを置く場所。タップ範囲は`::after`で上下6px拡張。
- スクロールする窓の左右はpadding(14px、SPは右34px=縦スクロール専用)。マーカー層(`.qn-yt-marker-layer`)も同じ分だけ内側に寄せる(位置は幅の%なのでバーと幅を揃える)。

## Rows=Auto(v4.7.2)
- `qn_yt_segs=-1`。`autoRows()`=シークバー上端〜(ステージ帯+下段バー)の手前までに入る行数(2〜12)。`recalcAuto()`をリサイズ/ResizeObserver(シークバー・プレイヤー枠)/マウント直後に呼ぶ。Rowsの選択肢は Off(0)・1〜8・Auto(-1)。
- SPのステージは`flex:1 0 auto`、ステージ帯は`margin-top:auto`で下段バーの直上に固定(余白はシークバー側)。

## Text・行の開始時刻・Bar length(v4.8.0)
- Textパネル(サイドバー4つ目): 動画ID単位のメモ。`localStorage qn_yt_texts` = {videoId: 本文}(最大2万字)。Library未保存の動画でも書ける。FABはFullのみ(全画面は`#qnYtTextFs`、PLAYERの`.text-fullscreen-overlay`のCSSと文字サイズ設定`mp3player_text_fullscreen_fontsize`を共用)。Backupのexport/importは`text`を含む(同期=Firebaseには含めない)。
- 各行の左に`.qn-yt-track-time`(行の開始時刻。PLの`.vbar-time`と同じ見た目)。シーク領域の左paddingは`--qn-yt-tpad`(46px)で、マーカー層も同じ分だけ内側に寄せる。押すとその行頭へシーク。
- Bar length: 1秒刻み(1〜上限)。上限=動画長÷現在の行数(Rows指定ならその本数、Autoなら画面に入る本数。切り上げ、最小2)=その行数で全体が収まる秒数(v4.19.1〜。動画長が決まるまでは240。行数が増えて上限が縮んだら現在値を丸める)。スライダー横のFit(v4.15.0〜)=動画全体が今の行数(Autoなら画面に入る数)に収まる最小の長さを選ぶ(`fitRowSec`)。
- SPのFAB帯: Follow(PL/VIDEO)とSeek barスイッチ(VIDEO)は`spHide:true`で非表示(Settingsには残る)。

SP幅(≤900px)ではFAB行(`.qn-yt-stage-fab`)をJS(matchMedia)で`.qn-yt-controls`の先頭へ移し、下段バー/ドックと一緒にstickyで下端固定する。PC幅は元のステージ内に戻す。パネルを開いている間は非表示。
SPではFAB行はMore(`.qn-yt-more-open`)が開いている間だけ表示する。

## SP幅のMore/レイアウト（v4.14.0〜）
PLの#pcV2MorePanelと同じ構成。下段バー(.qn-yt-bar)はSPでは出さずDOMに残す(中継元)。-10s/+10sはSPでは廃止(PCは従来どおり)。
- タイトル行の右: Track前/次・Repeat(`.qn-yt-headbtns`。バーのボタンへclick中継+svg/バッジ/点灯のミラー)
- シークバー直下: A/B(`.qn-yt-abrow`。Set A/Bへ中継、has-pointとラベルをミラー。長押しクイック設定は`data-dock`=abA/abB)
- More(.qn-yt-stage-fab): Bar length/Rows帯 + `.qn-yt-mixcard`(URL+Save、Speedスライダー+リセット。値はYouTubeが許す段階にスナップ)。Volume/Keyは無し
- `[data-yt]`はrefsで同名だと後勝ち。ミラーには別名(headPrev/abA等)を付ける
