# QN-PLAYER UI用語集

ユーザーの呼び方と、実際の要素・コード上の名前の対応。呼び方が食い違うと手戻りになる（例：「曲名の上」＝ヘッダー直下だと思ったら波形エリア上部の`#appTitle`直上だった）。**迷ったらスクリーンショットを最優先で見る**。新しい行き違いが起きたらここに1行足す。

## 画面の場所
| 呼び方 | 実体 | 備考 |
|---|---|---|
| 曲名／曲名・アーティスト | `#appTitle` | 波形エリア(`#pcV2WaveArea`)内。ヘッダーのロゴとは別物 |
| ヘッダー／ロゴ | `#appHeader`（「QNPLAYER vX.X.X」） | ページ最上部 |
| ライブラリ | Playlistパネル（`#playlistBox`） | サイドメニューでは「Library」 |
| 下部コントロール／コントロールバー | `#pcV2BottomBar` | PC幅＝右カラム下端（波形の真下）。幅が足りなければ横スクロール／SP幅＝アイコンバー直上の横スクロール列 |
| サイドバー／サイドメニュー／アイコンバー | `#pcV2IconBar` | Library/Markers/Text/Control/Backup/Import/Keyboard/Color等 |
| 波形エリア／シークバー | `#pcV2WaveArea` / `#vbarContainer` | 曲名・シークバー（縦スクロールの行）・マーカーラベルを含む |
| アンカータブ（PLAY/MARKER） | `.pcv2-anchor-tab`（SP幅のみ） | 下段バーの横スクロール位置へジャンプ |
| アプリ名バッジ（＞付き） | `#qnAppBadge` | サイドバー先頭。ホバー(PC)/タップ(SP)で`#qnAppFlyout`（PLAYER/YOUTUBE/TUNER/PITCH）が開く |
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
