# QN-PLAYER プロジェクトコンテキスト

QN-PLAYER（QNシリーズのブラウザ完結型MP3プレイヤー）の設計の前提をまとめたもの。
修正依頼の前に該当節を見て、同じ調査・同じ失敗を繰り返さないようにする。

**関連ファイル（`md/`）：** `QUICK_START.md`（最初に読む）／`GOTCHAS.md`（落とし穴）／`PC_V2_FILE_INDEX.md`（大きいファイルの目次）／
`YOUTUBE_APP.md`（YouTubeアプリの仕様＋規約ルール。最優先）／`TUNER_APP.md`（TUNERアプリの仕様）／`PITCH_APP.md`（PITCHアプリの仕様）／`CHORD_MODE.md`（シークバーのコード表示）／`SYNC.md`（Library同期・Transfer）／`I18N_HANDOFF.md`（和英切替）／`USER_DOCS.md`（ガイド・利用規約・プライバシー・料金ページの更新ルール）／`DOM_ID_REFERENCE.md`／`UI_TERMINOLOGY.md`／`CLEANUP.md`（お掃除ルール）／`TOOLS.md`（確認・納品の道具）／`CHANGELOG.md`

---

## 1. ファイルマップ

```text
index.html                    HTML骨格・モーダル類・<script>/<link>の読み込み順・window.QN_APP_VERSION
JS/
  qn-i18n.js / qn-i18n-apps.js / qn-i18n-ja.js   和英切替（辞書方式。I18N_HANDOFF.md）
  jszip.min.js                外部ライブラリ（触らない）
  player-shareware.js         無料版の機能制限・アンロック（SW_LIMITS / isUnlocked()）・課金モーダル・解約
  qn-marker-core.js           PLAYERとYouTube共通の「区間・ループ・前後マーカー」判定（QNMarkerCore。秒数だけを扱う純粋関数）
  player-core.js              中核の状態（audio, pins, playlist）、IndexedDB(qnaudio_playlist_db)、beginSeek()、hexToRgba()、SoundTouch読込
  player-bars.js              シークバー(QNBars)：1本=N秒(1秒刻み)の行を曲末まで縦に並べる仮想スクロール、波形描画、再生位置追従、歯車/秒数ポップアップ
  player-ui-shared.js         loadFile / updateBars（毎フレームのループ判定）/ togglePlay / キーボードショートカット
  player-normalize.js         自動ノーマライズ（曲ごとの音量差を揃える。既定OFF）
  qn-chord-core.js            【v4.27.0 プロトタイプ】コード解析の計算(QNChordCore。chroma=STFT→12音クロマ / classify=テンプレート照合＋Viterbi / beats・bars=拍と小節(v4.30.0)。DOMなし。Nodeでも動く)
  qn-chord-worker.js          上のchroma()をWorkerで実行(重いのでメインスレッド外)
  player-chords.js            コード解析の窓口QNChords(offer/ensure/segments/setDetail/手動修正setChord・splitAt・mergeNext・reset/保存。コードモードの時だけ解析。CHORD_MODE.md)
  player-chord-edit.js        コード修正ポップアップQNChordEdit(Editモードでブロックをタップ)
  player-grid-click.js        Grid click(再生中、縦線の位置で小節頭=高音・拍=低音を鳴らす確認用。ON/OFFはSettings>Grid click、QNChords.getClick/setClick)
  player-id3.js               ID3v2タグ（Title/Artist）
  player-playlist.js          ライブラリ：追加/削除/並び替え/お気に入り/フォルダ見出し・Auto Next範囲
  player-track-backup.js      Backup/Import（本体・YouTube・PITCH共通の画面。qnBackupMount/qnBackupMountInto/qnBackupParts）
  player-sync.js              本体Libraryの端末間同期（QNLibSync。SYNC.md）
  player-p2p.js               MP3の端末間直接転送（Transfer。WebRTC。SYNC.md）
  player-markers.js           マーカー：追加/削除/ドラッグ/波形上のポップアップ/A-B点/Color
  player-marker-presets.js    マーカーメモのプリセット・自動カラー・カスタムプリセット・メモ編集ポップアップ（player-markers.jsの続き）
  player-control-eq.js        EQ
  player-controls.js          Speed/AutoSpeed/Key/Loop/プリロールのつまみ
  qn-settings-ui.js           設定パネルの共通部品（QNSettingsUI。PLAYERとアプリが共用）
  player-text.js              Textタブ
  player-stem.js              Stemパネル(分離UI/4・6パート再生/録音トラック/IndexedDB保存)。player-stem-worker.js=Demucs実行ワーカー、JS/stem/=demucs-web(MIT)
  player-ui-pc-v2.js          【最大】唯一のUI実装。DOM組み立て・パネル・下段バー・波形（IIFE）。目次はPC_V2_FILE_INDEX.md
  player-quickpop.js          下部コントロールの長押しクイック設定
  qn-wakelock.js              再生中の画面スリープ防止 QNWake.set(key,on)
  qn-apps.js                  アプリ枠：ヘッダーのロゴ切替・フライアウト・#qnAppHost・Colorパネル借用・QNApps.register()・横スワイプ行
  player-swipe.js             PLAYERのLibrary/Markers一覧(SP幅)の横スワイプボタン（実体はqn-apps.jsのQNApps.swipeRows）
  qn-app-youtube.js           YouTubeアプリ本体（IIFE）
  qn-pitch-core.js            TUNER/PITCH共通：マイク入力・ピッチ検出(自己相関)・音名変換（QNPitchCore。DOM操作なし）
  qn-app-tuner.js             TUNERアプリ本体（IIFE。Mic Tuner/Tone Generator/Sensitivity/Display）
  qn-pitch-filters.js         PITCH用：ノイズ除去/ビブラート/ズレ検出/スコア＋フィルタ設定（QNPitchFilters。DOM操作なし）
  qn-app-pitch.js             PITCHアプリ本体（IIFE。ピッチロール/録音/再生/Filters/Recordings/Backup窓口QNPitchBackup）
  player-theme.js             カラーテーマ・ショートカット一覧・ハンバーガーメニュー
  player-auth.js              Firebase Auth（module）
CSS/
  style-core.css              :root トークン＋PC/SP共通デザイン
  style-playlist / markers / control-eq / controls / text / auth / shareware / theme .css   機能ごと（名前でJSが分かる）
  style-export.css            共通モーダルの器（.export-modal*。名前はExport由来だがEQ・解約・Backup/Importが共用）
  style-layout-sp.css         SP(≤768px)の少量の上書き（ヘッダー・ロゴ・.export-modal）
  style-layout-pc-v2.css      PC v2のシェル（アイコンバー・波形エリア・下段バー・3カラムgrid）…PC幅
  style-layout-pc-v2-sp.css   上の続き：SP幅(≤900px)の縦積み組み替え＋下段バーの追記
  style-pcv2-panels.css       中央パネル(#pcV2PanelBody)の中身
  style-bars.css              シークバー行(#vbarScroll/#vbarRows/.vbar)・歯車・秒数ポップアップ。寸法は#vbarContainerの--qn-bar-*
  style-settings.css          設定UIの共通部品（.qn-set-*。JSはqn-settings-ui.js）
  style-stem.css              Stemパネル（.qn-stem*）
  style-quickpop.css          長押しクイック設定ポップアップ
  style-apps.css              アプリ枠（ロゴ切替・フライアウト・トースト・#qnAppHost）
  style-youtube.css           YouTubeアプリ専用（.qn-yt*）
  style-tuner.css             TUNERアプリ専用（.qn-tn*）
  style-pitch.css             PITCHアプリ専用（.qn-pt*）
  style-chords.css            コード修正ポップアップ(.qn-ce*)と編集中のシークバー(.qn-chord-editing)
favicon/  guide/  md/  index.html  terms.html  privacy.html  pricing.html  pricing-en.html  QUICK_START.md  CNAME
guide/                        アプリ内ガイド（静的HTML8枚＋guide.css/guide.js＋img/*.webp）。更新ルールはUSER_DOCS.md
```

**読み込み順（`index.html`）。順序で上書きが決まる／グローバルでつながるので変えない：**
- CSS：core → playlist → markers → control-eq → controls → export → text → layout-sp → layout-pc-v2 → **layout-pc-v2-sp** → pcv2-panels → **bars** → settings → stem → quickpop → auth → shareware → theme → apps → **youtube** → tuner → pitch
- JS：qn-i18n → qn-i18n-apps → qn-i18n-ja → jszip.min → player-shareware → qn-marker-core → player-core → **player-bars** → player-ui-shared → player-normalize → **qn-chord-core → player-chords → player-chord-edit → player-grid-click** → player-id3 → player-playlist → player-track-backup → player-sync → player-p2p → player-markers → **player-marker-presets** → player-control-eq → player-controls → qn-settings-ui → player-text → player-stem → player-ui-pc-v2 → player-quickpop → qn-wakelock → qn-apps → player-swipe → qn-app-youtube → qn-pitch-core → qn-app-tuner → qn-pitch-filters → qn-app-pitch → player-theme → player-auth

新しい関数を他ファイルから使う時は「呼ぶ側より前に定義されているか」を確認する。共通ヘルパーは`player-core.js`が定位置。
`player-ui-pc-v2.js`と`qn-app-youtube.js`は、それぞれ1つのIIFEの中で多数の変数を共有している。**ファイル分割はしない**（変数の持ち方から作り直しになるため）。

---

## 2. 最重要の設計事実：PC v2が唯一の実UI

- PC v2は**常に有効**（画面幅で切り替えない）。`player-ui-pc-v2.js`の`activate()`が起動時に1回`build()`し`body.pc-v2-active`を付ける。旧レイアウトへ戻す処理は無い。
- 旧来の「SP専用UI」（`.app-container`直下の要素）は`body.pc-v2-active`で`display:none`になり、**実質死んでいる**。
- SP幅（≤900px）の見た目は、**同じDOMを`style-layout-pc-v2-sp.css`の`@media (max-width:900px)`で縦積みに組み替えたもの**。PC専用は`@media (min-width:901px)`。
- 「SPがおかしい」系は、まず`style-layout-pc-v2-sp.css`を疑う。`style-layout-sp.css`はほぼ無関係。
- 削除・選択のUIロジックは、SP版のonclickではなく`player-ui-pc-v2.js`の`attachSelectionHandlers`が奪っている（`GOTCHAS.md`§5）。
- 下段バー(`#pcV2BottomBar`)：PC幅は`#pcV2Layout`の2行目（右カラム下端）。SP幅は`syncBottomBarPosition()`がJSでDOMごとアイコンバー直上へ移動する。この周辺に要素を足したら同関数も更新する。

---

## 3. データ・状態（保存先）

| 何 | どこ | キー／備考 |
|---|---|---|
| `playlist`配列 | メモリ（`player-core.js`） | `{file,name,title,artist,duration,enabled,favorite}`。並び順＝表示順＝再生順 |
| 音声実体 | IndexedDB `qnaudio_playlist_db` / `tracks`（keyPath `name`） | **書いたら書き直さない**（`GOTCHAS.md`§1）。接続はキャッシュして使い回す |
| ライブラリのメタ（並び・ON/OFF・表示名・お気に入り） | localStorage | `qn_playlist_meta_v1`＝`{ファイル名:{savedAt,enabled,title,artist,favorite,folder}}` |
| ライブラリのフォルダ | localStorage | `qn_folders_v1`＝`[{id,name,parentId(将来のネスト用・今はnull),collapsed}]`(配列順=表示順)／曲の所属は上記メタのfolder(フォルダid|null=未分類) |
| マーカー | localStorage | `mp3_pins_<ファイル名>`（`pins`配列。曲切替時に`loadFile()`が同期で読む） |
| A/B点 | localStorage | `mp3_ab_<ファイル名>`＝`{a,b}`（秒数だけ。マーカーに紐づかない） |
| テキストメモ | localStorage | `mp3_text_<ファイル名>` |
| ループ設定 | localStorage | `mp3player_loop_mode` / `mp3player_loop_enabled` / `mp3player_loop_preroll_seconds`（0〜5秒）／`mp3player_repeat_mode` |
| マーカーメモのプリセット色／カスタムプリセット | localStorage | `qn_marker_preset_colors_v1`（`{名前:色キー|null}`、初期値`MARKER_PRESET_COLOR_DEFAULTS`）／`qn_marker_custom_presets_v1`（`[{label,color}]`最大30）。PLAYERとYouTubeで共用（`getAllMarkerPresetLabels()`） |
| シークバー1本の秒数 | localStorage | `qn_bar_sec`（1秒刻みの整数、既定5。上限＝曲長÷「Rows Autoで画面に入る行数」） |
| シークバー追従ON/OFF | localStorage | `qn_bar_follow`（"0"でOFF、既定ON） |
| 波形の形 | localStorage | `qn_bar_wave`（`mirror`既定\|`bottom`） |
| シークバーの表示 | localStorage | `qn_bar_view`（`wave`既定\|`chord`\|`degree`）、`qn_chord_detail`（`basic`\|`extended`既定\|`full`）、`qn_chord_alts`（候補表示。既定ON）、`qn_chord_snap`（コード境目の拍合わせ。既定ON）、`qn_grid`（拍・小節の縦線 `off`\|`bar`\|`beat`既定）。曲ごとの解析結果は `qn_chords_<ファイル名>`（拍`beats`と手動補正`bt`も含む） |
| コード解析・手動修正 | localStorage | `qn_chords_<ファイル名>`（解析結果＋手動修正。`player-chords.js`） |
| 手動スクロール後の追従停止秒数 | localStorage | `qn_bar_follow_pause`（1〜30、既定6） |
| シークバーの1画面の本数 | localStorage | `qn_bar_rows`（0=自動/3〜12、既定0） |
| 送り戻しボタンの秒数 | localStorage | `qn_skip_sec`（5/10/15/30/60、既定10） |
| 表示言語 | localStorage | `qn_lang`（`auto`既定\|`ja`\|`en`。autoはブラウザ言語がjaなら日本語）。`JS/qn-i18n.js` |
| 速度±ボタンの刻み(%) | localStorage | `qn_speed_step_pct`（1/2/5/10、既定5） |
| YouTubeの送り戻し秒数 | localStorage | `qn_yt_skip_sec`（5/10/15/30/60、既定10） |
| SPのMore(設定帯Bar length/Rows)の開閉 | localStorage | `qn_sp_more`（"1"で開く、既定は閉。v4.11.0〜ドックの上に開く） |
| パネル格納／最後のアプリ | localStorage | `qn_panel_collapsed`（PLAYER）／`qn_yt_panel_collapsed`／`qn_last_app` |
| TUNER | localStorage | `qn_tuner_display` `qn_tuner_sens` `qn_tuner_smooth` `qn_tuner_panel_collapsed`（詳細は`TUNER_APP.md`） |
| PITCH | localStorage／IndexedDB | `qn_pitch_filters` `qn_pitch_rec_meta`(録音の改名) `qn_pitch_panel_collapsed`／IndexedDB `qn_pitch_db`(録音実体。レコードは再putしない)（詳細は`PITCH_APP.md`） |
| YouTube | localStorage | `qn_yt_items` `qn_yt_rate` `qn_yt_repeat` `qn_yt_preroll`（詳細は`YOUTUBE_APP.md`§4） |
| 本体Library同期 | localStorage | `qn_libsync_meta_v1`（`player-sync.js`。詳細は`SYNC.md`） |
| Stem／録音 | localStorage／IndexedDB／Cache API | `qn_stem_mode`(4\|6)・`qn_rec_offset_ms`／IndexedDB `qn_stem_db`(分離結果・録音トラック。キーは`名前\|サイズ`、6パートは`\|6`付き)／モデルはCache API `qn-stem-model-v1`。バックアップ・同期の対象外 |
| 自動ノーマライズ | localStorage | `qn_norm_on` `qn_norm_target` `qn_norm_lv_<ファイル名>`（`player-normalize.js`） |
| テーマ／Glow／EQ自作プリセット／伸縮方式 | localStorage | `qn_theme` `qn_glow`／`qnplayer_eq_custom_presets`／`qn_stretch_engine`(st\|native。URLの`?stretch=`でも切替) |
| 無料版/アンロック | localStorage | `qnplayer_unlock_until` ほか`qnplayer_*`（`player-shareware.js`） |

- `loopActiveMarkerIndex` / `isSeeking`はループ折り返し判定のグローバル状態。シーク系を足す時は`beginSeek()`経由にして整合を保つ。
- お気に入り：`toggleTrackFavorite()`が`playlist`内の「お気に入りグループ末尾」へ実際に移動させる（表示だけのソートではない）。

---

## 4. 作業ルール

1. **着手前**：依頼の症状に近いものが`GOTCHAS.md`にないか確認。新しいUI・アニメ・ポップアップ・音声/保存処理は`GOTCHAS.md`を一通り見てから書く。
2. 機能を足す/直す時は「見た目（メモリ）」と「永続化（IndexedDB/localStorage）」を分けて、更新漏れがないか確認する。全曲ループの処理は「Blobごと書き直していないか」を自問する。
3. 修正のたびに`index.html`の`window.QN_APP_VERSION`を上げ（機能追加=マイナー、修正/お掃除=パッチ）、`md/CHANGELOG.md`に1〜数行追記。構成・保存キー・ID・目次が変わったら該当するmdも直す（過去の記述が事実と食い違ったら消す／直す。履歴としては残さない）。
4. 納品の標準：**変更ファイルだけのパッチZIP**（フォルダ構成を保つ。`PATCH_FILES.txt`は作らない）`QNPLAYER_v<版>_patch.zip`。まとめての大掃除など、ユーザーが「完全版で」と言った時は完全版ZIP。
5. **ユーザー向け文書**：ユーザーに見える機能、通信先、保存するデータが変わったら、ガイド・利用規約・プライバシー・料金ページも直す（`USER_DOCS.md`）。
6. **コメント規約**：JS/CSS/HTMLのコメントは「注意・禁止・規約・順序依存・仕様メモ」だけを最小限の言葉で書く。経緯・版履歴・機能の説明文は書かない（書くなら`CHANGELOG.md`か`GOTCHAS.md`）。
7. 検証（納品前）：
   ```bash
   for f in JS/*.js; do node --check "$f" || echo "FAIL: $f"; done           # JS構文
   for f in CSS/*.css; do python3 -c "t=open('$f',encoding='utf-8').read();print('MISMATCH $f') if t.count('{')!=t.count('}') else None"; done   # CSS波括弧
   grep -o 'id="[a-zA-Z0-9_]*"' index.html | sort | uniq -c | awk '$1>1'   # id重複
   ```
   さらに、ローカルHTTPサーバー（`file://`不可）＋Playwrightで、ページエラー0・音声読み込み→Backup→Importが通ることを確認する。見た目を変えない作業は、計算済みスタイルの前後比較で差分0を確認する。**ヘッドレスでしか確認できていない範囲は正直に伝える。**

---

## 5. UIデザインの統一ルール

角丸・文字サイズ・ボタン寸法は`style-core.css`の`:root`トークンを使う（px直書きしない）。

| 用途 | トークン | 値 |
|---|---|---|
| 文字入りボタン・チップ・トグル・ステッパー・バッジ | `--radius-pill` | 999px |
| アイコンだけのボタン | `--radius-round` | 50% |
| 入力欄・ドロップゾーン | `--radius-field` | 10px |
| ポップアップ・カード | `--radius-popup` | 14px |
| モーダル | `--radius-modal` | 20px |
| パネル見出し／セクション見出し／本文／補足／極小 | `--fs-title`/`--fs-heading`/`--fs-body`/`--fs-small`/`--fs-micro` | 20/15/14/12/11px |
| 二次ボタン／主ボタン | `--fs-btn`・`--btn-h`・`--btn-pad-x` ／ `--fs-btn-primary` | 12px・30px・14px ／ 14px |
| 二次ボタンの枠線 | `--border-strong` | rgba(255,255,255,0.14) |

- リストの行・区切りは角丸の枠でなく**線（`--border-subtle`）**で区切る。
- 例外：下段バー（文字入り・大きめ）、アイコンバーのラベル、ロゴ・スプラッシュ、波形上のマーカーラベル、テキストのフルスクリーン、料金モーダルの大見出し、2〜4pxの細部。
- テーマ色（`--accent-primary`）：フローティングボタン(`.panel-fab-btn`)の背景とパネル見出しの文字。EDIT中(OK)は「白地＋テーマ色の文字」に反転。Deleteは常に赤（`--danger`）。
- アイコンSVGは`fill: currentColor`。状態を持つ下段バーのボタンは「通常＝`--icon-muted`、ON＝`--accent-primary`」。ホバーの明色化はマウス環境限定。
- シークバーの行(`.vbar`)の寸法は`#vbarContainer`の`--qn-bar-h/-gap/-label-w`等（style-bars.css）が唯一の元。行は固定高さで、曲の長さ÷秒数ぶん縦に並ぶ（`#vbarScroll`がスクロール）。

---

## 6. アプリ（YouTube／TUNER／PITCH）共通ルール

`QNApps.register({id,label,icon,order,ready,sidebar,onSidebar,shortcuts,shortcutsNote,mount,onShow,onHide})`（`qn-apps.js`冒頭にコメントあり）で足す。共通部品：`QNApps.renderShortcuts(hostEl,id)` / `setSideActive` / `toast` / Colorパネル借用。

- **サイドバー**：上段＝アプリ固有項目、下段＝Backup / Import / Keyboard / Color（本体と同じ並び）。アプリ切替はヘッダーのロゴ`#qnAppLogoBtn`(V付き)のドロップダウンから。
- **Color**：アプリ側で別実装しない。`qn-apps.js`が本体のテーマ切替セクションを`#qnColorPop`へ借りて表示し、閉じたら戻す。
- **Backup/Import/Keyboard**：本体の部品を借りる（`qnBackupMountInto`、`renderShortcuts`）。アプリ側はデータの出し入れ（YouTubeは`window.QNYouTubeBackup`）やショートカット一覧を渡すだけ。
- **PLAYERと同じ部品・同じ操作**：リスト行・EDIT→OK・丸チェック削除・カラーパレット・プリセットチップ・シークバー(`.vbar`/`.vfill`)は本体のクラスを流用。本体CSSが`#pcV2PanelBody`スコープなら、アプリ側に同等ルールを写す。
- **SP幅**：映像を持つアプリは、パネルを開いても映像を隠さない（YouTubeは`max(200px,30dvh)`・最低200px）。`data-qn-keep-visible`を付けた要素はColorパネルも覆わない。
- **状態**：`qn_<アプリ名>_*`のlocalStorageキー。音声実体は持たない。`qn_last_app`で再読み込み時に復元（`ready:true`で自動対象）。
- **画面スリープ防止**：再生中`QNWake.set("<アプリ名>",true)`、停止・非表示で`false`。
- **表示中はPLAYER側を止める**：`body.qn-app-open`でaudio一時停止・下段バー非表示・ショートカット無効・曲追加D&D無効。

## Exact seek (4.39.0, JS/player-exact-seek.js)
- Chromium seeks in VBR MP3 land up to ~0.8 s off and the error persists. On the first seek of a track (duration <= 1500 s) the file is decoded to 44.1 kHz PCM, wrapped as a WAV blob and swapped into the same <audio> element at the indicated time (QNExact; loadFile calls QNExact.onLoad). Later seeks are exact (measured spread <= 1.5 ms). Tracks over 1500 s keep the original source.
- Markers placed before this version may carry per-seek errors; re-place them if they look off.

## Marker snap / lock (4.40.0, JS/player-markers.js)
- Settings: "Marker snap to bars" / "Marker snap to beats" (localStorage qn_pin_snap_bar / qn_pin_snap_beat, default off, QNPinSnap.get/set). snapPinTime(t, dir) uses QNChords.grid() (times/bar); applies to marker drag and the popup nudge (nudge jumps to the next/previous snap point). Turning snap on triggers the grid analysis (needGrid() in player-chords.js). Not applied when adding a marker.
- Lock: pin.locked (popup "Lock" button). Locked markers cannot be dragged, nudged or deleted (popup and list); tap/seek, color, hide and skip still work. Lock glyph under the marker number. Stored with the pin in localStorage; not part of cloud sync (cleanState).
- Loader (loadTrackUserData) now keeps pin.skip and pin.locked (skip used to be dropped on reload).
- Bar-head grid line alpha 0.24 -> 0.55, 1 px wider.
