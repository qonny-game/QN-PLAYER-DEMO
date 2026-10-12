# QN-PLAYER UI用語集

ユーザーの呼び方と、実際の要素・コード上の名前の対応。呼び方が食い違うと手戻りになる（例：「曲名の上」＝ヘッダー直下だと思ったら波形エリア上部の`#appTitle`直上だった）。**迷ったらスクリーンショットを最優先で見る**。新しい行き違いが起きたらここに1行足す。

## 画面の場所
| 呼び方 | 実体 | 備考 |
|---|---|---|
| 曲名／曲名・アーティスト | `#pcV2HeadRow`（曲未選択時のみ`#appTitle`） | 波形エリア内。Libraryの1行(`buildPlaylistRow`)そのもの＋PCはSKIP/PIN/EDIT。ヘッダーのロゴとは別物 |
| ヘッダー／ロゴ | `#appHeader`（「QNPLAYER vX.X.X」） | ページ最上部 |
| ライブラリ | Playlistパネル（`#playlistBox`） | サイドメニューでは「Library」 |
| 下部コントロール／コントロールバー | `#pcV2BottomBar` | PC幅＝右カラム下端（波形の真下）。幅が足りなければ横スクロール／SP幅＝アイコンバー直上の横スクロール列 |
| サイドバー／サイドメニュー／アイコンバー | `#pcV2IconBar` | Library/Markers/Text/Chords/Stem/Rec(上段。StemはPC専用、RecはSPでも使える)・Control/Settings(下段)/Backup/Import/Keyboard/Color等 |
| 波形エリア／シークバー | `#pcV2WaveArea` / `#vbarContainer` | 曲名・シークバー（縦スクロールの行）・マーカーラベルを含む |
| アンカータブ（PLAY/MARKER） | `.pcv2-anchor-tab`（SP幅のみ） | 下段バーの横スクロール位置へジャンプ |
| ロゴ兼アプリ切替（V付き） | `#qnAppLogoBtn` | ヘッダー左。押すと直下に`#qnAppFlyout`（QNPLAYER/QNVIDEO/QNTUNER/QNPITCH）が開く |
| YouTubeの画面 | `#qnAppHost`内の`.qn-yt` | 左=Library/Markers等のパネル、右=プレイヤー＋3行シークバー＋下段バー |
| Colorパネル（アプリ中） | `#qnColorPop` | PLAYERと同じ見た目のパネル（ポップアップではない） |

## 機能名
| 呼び方 | コード上の名前 |
|---|---|
| プリロール／頭出し秒数（○秒ループを伸ばす） | `loopPreRollSeconds`（`player-controls.js`、0〜5秒）／YouTubeは`preRoll` |
| バックアップ／インポート | `trackBackup*` / `trackImport*`（`player-track-backup.js`） |
| EDITモード／編集モード | `editModeState.playlist` / `.markers`（`player-ui-pc-v2.js`） |
| 削除選択（丸いチェック） | `.del-btn` / `.playlist-del-zone` / `.pin-del-zone`、選択中は`.pcv2-selected` |
| 一括削除ボタン | `#pcV2DeleteSelectedBtn` |
| PLAY/SKIP トグル | `.playlist-skip-toggle`（自動送りに含めるか） |
| ピン留め | お気に入り（`track.favorite`）。画鋲アイコン |
| A/B／A-B Loop／Section | A/B点＝秒数だけの区切り（`mp3_ab_*`／YouTubeは`loopA/loopB`）。LOOPボタンで OFF→A-B→Section |
| Marker Memo Colors／カスタムメモ | Colorパネル内。プリセット色とカスタムプリセット（`player-marker-presets.js`） |
| 大手術 | PC v2レイアウトへの統一リファクタリング（旧SPレイアウトは廃止済み） |

## 「SP」「PC」「実機」
- 「SP／スマホ／モバイル」＝画面幅が狭い状態（`@media (max-width:900px)`）。**UIの実装はPC v2だけ**で、SP幅は同じDOMをCSSで組み替えたもの（`AI_ASSISTANT_PROJECT_CONTEXT.md`§2）。「SP版を直して」と言われたら`style-layout-pc-v2-sp.css`や`player-ui-pc-v2.js`を見る。
- 「実機」＝ユーザーが実際のiPhone等で確認したこと。モバイルSafari特有の挙動（自動再生・IndexedDB・hover）が絡む（`GOTCHAS.md`）。

## v4.45〜4.48 で増えた呼び方
| 呼び方 | 実体 | 備考 |
|---|---|---|
| 一般 | Settingsの一覧の先頭(`panelId "general"`、本体`#pcV2GeneralBody`) | 表示(背景)・シークバー・再生・言語・ヒント。全曲共通の設定 |
| 背景／ライト／ダーク | `QNBg`(`qn_bg`=dark/gray/beige)、`html[data-qn-bg]` | 色トークンは`CSS/style-modes.css` |
| Chordsパネル／この曲の設定 | `panelType "chords"`(`ensureChordsBody`) | 曲ごとに保存される設定(コードのキー・拍数・小節の頭など) |
| ロック／鍵 | マーカーの`locked`(波形のポップアップLK、Markers一覧のLockボタン) | 移動・削除不可。同期はしない(端末内のみ) |
| 拍数／Beats | マーカーの`bpb`(ポップアップBP) | そのマーカーから次のマーカーまでの1小節の拍数 |
| 調整帯／FAB帯 | `.qn-wave-bar-strip` | 波形エリア右下。View/Edit/バーの長さ/行数/追従。＋Audio/＋Markerは撤去済み |
| SPのクリック・吸着ボタン | `#pcV2FabClick` / `#pcV2FabSnap` | A/Bの右。吸着は小節と拍を同時に切り替える |
| 速度変更の方式 | `getStretchEngine()`(`qn_stretch_engine`) | 自動/ブラウザ標準/SoundTouch |
