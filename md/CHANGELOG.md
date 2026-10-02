# QN-PLAYER バージョン履歴

`window.QN_APP_VERSION`更新ごとに**末尾へ1行追記**（`- 版 一言`）。経緯・不具合の詳細は書かない（再発しうる教訓だけ`GOTCHAS.md`）。

- 〜3.20.0 PLAYER(PC v2)＋アプリ基盤(QNApps)＋YouTubeアプリ(Library/Markers/3行シークバー/A-B/Auto Next/Backup・Import共通画面)まで実装済み。詳細は各mdの現行仕様を参照。
- 3.20.1 未使用JS関数・未使用CSSクラスを削除（動的クラス`.is-a/.is-b`・`.pcv2-panel-*`は残す）。
- 3.20.2 未使用id削除、重複関数統合、大型ファイル分割(`style-youtube.css`/`style-layout-pc-v2-sp.css`/`player-marker-presets.js`)、md整理。`player-ui-pc-v2.js`/`qn-app-youtube.js`は共有変数が多く分割しない。
- 3.20.3 JS/CSS/HTMLのコメントを「注意・禁止・規約・順序依存・仕様メモ」だけに圧縮。検証用swDebugコード(JS/CSS)と無効なCSSルール(`.tripleNavBtn`重複)を削除。
- 3.20.4 YouTubeに無断アップロード禁止の注意書きを再表示、Set A/Bのツールチップ修正。Backup/Importの外枠(モーダル)とPC v2の旧レイアウト復元処理(`deactivate`/anchor)を削除し、Backup/Import表示を`qnBackupMount`に一本化。
- 3.21.0 TUNERアプリを追加(qn-app-tuner.js/qn-pitch-core.js/style-tuner.css)。Mic Tuner(Gauge/Guitar Meter)・Tone Generator・Sensitivity・Display。PLAYERのパネル/下段バー/部品デザインで統一。QNPITCH(旧アプリ)から移植、保存キーはqn_tuner_*で新規。
- 3.22.0 PITCHアプリを追加(qn-app-pitch.js/qn-pitch-filters.js/style-pitch.css)。ピッチロール(仮想スクロール)・録音(MediaRecorder+解析で1本のマイク共有)・再生・スコア・Filters・Recordings(EDIT/削除/改名)。QNPITCH(旧アプリ)から移植、保存キーはqn_pitch_*・DBはqn_pitch_dbで新規。Backup/Importは次段階。
- 3.23.0 PITCHのBackup/Importを追加。共通Backup/Import画面(player-track-backup.js)にPITCH録音の枠を追加(pitch.json+pitch/音声をZIPへ。PLAYER/YouTubeと同じZIPに同梱可・Import自動判定・重複は上書き/スキップ)。PITCHアプリのサイドバーにBackup/Import。
- 3.23.1 TUNER/PITCHのマイク使用中表示を追加(ステージ右上/左上の「MIC ON」「REC」ピル+入力レベル、サイドバーのアプリバッジに赤丸)。PITCHのStopアイコン修正。
- 3.23.2 テーマ色背景のボタン(サイドバーのホバー/アプリ名バッジ/フライアウト等)の文字・アイコン色を黒→白に変更(--sidebar-on-accent)。
- 3.24.0 ライブラリをフォルダ分け可能に(1階層・1曲=1フォルダ。データはネスト拡張可能な形)。見出しの開閉、NEW FOLDERで作成、EDITで改名/▲▼並び替え/✕削除(中の曲は未分類へ)、曲を選んでMOVEで移動。Auto Nextの範囲を「フォルダ内/全体」で切替(Libraryヘッダーの NEXT ボタン。前/次ボタン・メディアキーも同じ範囲)。Backup/Importにフォルダ名を含む(旧バックアップはそのまま読める)。無料版はフォルダ作成・移動を不可。
- 3.25.0 YouTubeタイトル自動取得。Saveのタイトル欄は空欄OK(空欄=oEmbedで自動取得。手入力済みでも空欄Saveで自動に戻る)。手入力は`customTitle`に分離(旧`title`は起動時に自動移行、"(無題)"は破棄)。YouTube由来タイトルは端末ローカルに28日キャッシュ(`qn_yt_title_cache`)、起動時/アプリ表示時に期限切れを削除。Backup/Importは`customTitle`のみ(旧`title`も読める)。
- 3.26.0 YouTube Libraryの同期(自分のUIDのみ)。Firestore `users/{uid}/sync/youtube`、動画ごとのupdatedAt・削除tombstone・並びorderAtで合体。`player-auth.js`に`syncTransact`/`isSyncUser`を追加。Libraryに同期状態表示。詳細md/SYNC.md。
- 3.26.1 手動同期: Libraryの「☁ 同期済み HH:MM ↻」をタップで今すぐ同期(いつでも可。同期中は無効)。
- 3.26.2 Libraryの鉛筆(タイトル編集)が見えない不具合を修正(`.playlistItem button`のpaddingが鉛筆に勝ってアイコン幅0pxになっていた)。
- 3.27.0 ライブラリのドラッグ操作を拡張。曲のつまみを別フォルダ(折りたたみ中・未分類含む)の範囲まで運ぶと、そのフォルダへ移動(移動先をハイライト、ドロップ先の無い所では従来の同フォルダ内並び替え)。フォルダ見出しにつまみを追加し、ドラッグでフォルダを並び替え(ドラッグ中は全フォルダを見出しだけに畳む。未分類は末尾固定)。リスト端でドラッグすると自動スクロール。無料版は両方ブロック。
- 3.28.0 本体Library(曲ごとの情報)の端末間同期を追加(player-sync.js)。曲名/アーティスト/ON-OFF/お気に入り/フォルダ/マーカー/AB/メモ+フォルダ+並び順を同期(MP3は同期しない)。他端末にMP3が無い曲は「未インポート」表示、MP3を入れると設定が自動で付く(ファイル名+サイズで照合)。Library下部に同期ステータス(タップで手動同期)。`QN_AUTH`に`syncTx/syncGetMany`、`loadTrackUserData()`を追加。 同期中は「☁ 同期中… 120/2000」と件数を表示。
- 3.29.0 MP3の端末間P2P転送を追加(player-p2p.js)。未インポートの曲を選び6文字コードで接続→WebRTCで直接転送(サーバー非経由)。取り込み後は同期で設定が自動で付く。 入口はサイドバー下段のTransfer(Backup/Importの隣)。
- 3.30.0 MarkersパネルのタイトルとMarkersリストの間に、再生中の曲をライブラリと同じ行デザインで表示(並び替えつまみ無し。`buildPlaylistRow()`をライブラリと共用、`renderNowPlaying()`が`renderPlaylist()`末尾で更新)。
- 3.30.1 サイドバーのMarkersアイコンを「リスト＋プラス」に変更(PLAYER/YouTube共通)。ADD MARKERボタンのプラスは従来のまま。
- 3.30.2 YouTubeステージ右下にMARKERボタン追加(PLの波形エリア右下と同位置・プレイヤー外の通常フロー)。FAB/ウェーブのラベルをADD/NEW付きからAUDIO/MARKER/FOLDERに簡略化。
- 3.30.3 YouTubeのURL入力欄を編集したらタイトル入力欄を空にする。
- 3.30.4 YouTube: SPでプレイヤーを左右・上いっぱいに配置。埋め込み枠を動画の縦横比(oEmbedの幅/高さ)に合わせる(4:3等の左右黒帯を解消。端末にキャッシュ)。
- 3.31.0 YouTube: Libraryにフォルダ(PLと同じ操作: FOLDER/EDIT+MOVE/開閉/改名/並び替え/削除。フォルダ・所属は同期、開閉は端末ごと。Auto Next/前後は表示順)。Playlistsパネル追加(YouTube Data APIで再生リストを取得→一覧表示、クリックで再生、選択してLibraryへ追加。取得結果は保存しない。APIキーは端末のlocalStorageまたはwindow.QN_YT_API_KEY)。
- 3.31.1 Playlists: My Playlistsボタン追加(ログイン中のGoogleアカウントの再生リスト+高評価を取得。youtube.readonlyの確認ポップアップ→トークンはメモリのみ)。URL入力+APIキーでの取得も残す。
- 3.32.0 SP: パネルを下からスライドで開閉(閉じるボタン・上端アクセント線・つまみで開いている目印)。YT SPのプレイヤー縮小は上端固定で滑らかに。PC幅1400px以上: アプリ名バッジ/アプリ一覧を「アイコン＋文字」1行に(サイドバー136px)。
- 3.32.1 SPシート: 開閉アニメ中も下段バー/アイコンバーの背面に出入り。見出し(つまみ)を下へドラッグで閉じる(QNApps.sheetDrag)。
- 3.33.0 SP: Library/Markers(PLAYER・YouTube)の行を横スワイプで□ボタン(EDIT/SKIP・HIDE/DELETE。削除は2タップ)。PCのサイドバー幅/バッジは3.31.1の見た目に戻し、アプリ一覧(フライアウト)だけ1行・広め。
- 3.33.1 スワイプ判定を緩和、タイトルEnter確定でアーティスト入力へ移行、SPは行の編集/HIDEアイコン非表示、マーカー行・再生中の曲の左余白をタイトルに合わせ。
- 3.34.0 MP3埋め込みジャケット(ID3 APIC)をライブラリ行・Now Playing行のサムネに表示(端末内メモリのみ、保存・同期なし)。
- 3.35.0 スワイプ後ボタンが2回押し必要だった不具合を修正、プリセットポップアップが入力欄に被らないよう配置を修正、PLマーカー行にA/Bボタン追加、A/Bをブロック型デザインに変更(PL/YT共通)。
- 3.36.0 シークバーを可変長に変更。1本=5/10/15/30/60秒(波形エリア右上の歯車で切替、`qn_bar_sec`、既定5秒)で曲末まで縦に並べ、縦スクロール(見えている行だけ描画する仮想スクロール)。行の左に開始時刻。再生中は再生行が見える位置へ自動スクロール(手動スクロール後6秒、再生/シークで再開)。新規JS/player-bars.js・CSS/style-bars.css。波形ピークは毎秒40個に細分化。
- 3.37.0 シークバー改良。波形を隙間なしの連続描画に変更(点を約1.5px間隔に細分化)。時刻表示(現在/全体)を波形ヘッダーの歯車の左へ移動(PC/SP共通、`#pcV2TimeRow`は常時非表示)。歯車は設定パネル(Settings)を開く: バー長、追従ON/OFF(`qn_bar_follow`)、手動スクロール後の追従停止秒数(`qn_bar_follow_pause`、1〜30、既定6)、ループのプリロード秒(下部バーから移設)、速度±ボタンの刻み(`qn_speed_step_pct`、1/2/5/10%、既定5)、Backup/Import/Transfer(サイドバーから移設、サイドバーのPLAYER側は削除)。
