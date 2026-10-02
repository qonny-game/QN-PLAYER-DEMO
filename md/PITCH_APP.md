# QNPLAYER PITCHアプリ 仕様

ピッチロール表示・録音・再生・スコア判定。QNPITCH（旧アプリ）のPITCHMODEを移植し、PLAYERのデザイン・部品に揃えたもの。保存キー/DBは新規（旧`qnpitch_*`は引き継がない）。

- 実装：`JS/qn-app-pitch.js`（本体）／`JS/qn-pitch-filters.js`（フィルタ・スコア）／`JS/qn-pitch-core.js`（ピッチ検出。TUNERと共通）／`CSS/style-pitch.css`（見た目）
- 共通ルールは`AI_ASSISTANT_PROJECT_CONTEXT.md`§6。Color/Keyboardは本体の部品を借りる。

## 現在の仕様
- **入口**：ヘッダーのロゴ(V付き)→PITCH。サイドバーは上段「Filters / Recordings」、下段「Keyboard / Color」。Backup / Importは本体共通画面を借りる（YouTubeアプリと同じ）。
- **メイン画面**：上=音名・セント（±12¢=緑／±30¢=琥珀／それ以外=`--danger`）とヒント文、中央=ピッチロール（C線はテーマ色・鍵盤ラベルは左固定）、下=音量ライン、再生中は再生情報行（名前/SCORE/時間/シークバー/✕）。
- **録音**：Recで開始/停止。点列は`{t,midi,cents,rms,voiced}`。停止すると未保存の録音として読み込まれ（自動再生はしない）、Playで再生、Saveで保存。
- **Save**：左パネルに一時パネル「Save Recording」（名前入力、既定`REC MM/DD HH:MM`）。Cancel/Saveでパネルを元に戻す。
- **Clear**：2回タップ（1回目で「Sure?」、3秒以内にもう一度で消去）。
- **Recordings**：PL共通の`.playlistItem`行。行タップで再生（同じ行ならPlay/Pause）、鉛筆で改名、EDIT→OK＋丸チェック→Deleteで一括削除（YouTubeアプリと同じ）。並びは新しい順。
- **Filters**：急変スキップ／スパイク除去／音量ゲート／音程ズレハイライト／ビブラート検出／スコア許容ズレ。変更は即ロールに反映、`qn_pitch_filters`に保存。スコアは「持続音のうち許容ズレ以内の割合」（ビブラート区間は除外）。再生中の表示は現在のフィルタで計算し直す。一覧の%は保存時の値。
- **下段バー**（`#pcV2BottomBar`と同デザイン・同寸法）：Rec（中央・録音中は赤）｜Play｜Save｜Clear。SP幅は横スクロール、パネルを開くとステージごと隠れてパネルが全面。
- **ショートカット**（表示中のみ）：Space=Play/Pause、R=Rec/Stop、S=Save。

## Backup / Import（本体共通画面。`player-track-backup.js` ⇔ `window.QNPitchBackup`）
- 共通画面の一覧に「PITCH」グループが出る（PLAYER/YouTubeアプリのBackupからも見える）。ZIPは`pitch.json`＋`pitch/<createdAt>.<webm|m4a|ogg>`。PLAYER/YouTubeと同時選択なら1つのZIP(`qnplayer_backup_*.zip`)、PITCHだけなら`qn-pitch_backup_*.zip`（音声オフなら`qn-pitch_backup_*.json`）。
- `pitch.json`: `{format:"qn-pitch-recordings",version:1,items:[{name,createdAt,duration,score,file?,track:[[t,midi,cents,rms,voiced(0/1)],...]}]}`。点列は常に入る。共通画面の「音声データ」チェックが音声ファイルの有無を決める（「設定データ」はPITCHには効かない）。
- 同一性は`createdAt`。Importの重複は上書き/スキップ（共通の切替）。上書き＝古いレコードを消して新規add（再putしない）。音声なしJSONは「既存録音の名前の上書き」だけ可能、新規は「音声なしのためスキップ」。
- `QNPitchBackup`: `list()`(同期・キャッシュ) / `refresh()`(IndexedDBから読み直し) / `buildExport(ids,withAudio)`(async) / `parseImport(raw)` / `exists(key)` / `titleOf(key)` / `applyImport(list,audioMap,choices)`(async)。アプリを一度も開いていなくても、共通画面を開く時に`refresh()`される。

- **マイク使用中の表示**：`QNApps.setMic(on)`でロゴ(アプリ切替)に赤丸(`body.qn-mic-on`)、`.qn-mic-pill`(赤ピル+レベル5段。`QNApps.setMicLevel(pill,0〜5)`)をステージに置く。静止表示のみ。マイクを使うアプリは`onHide`で必ずOFFに戻す。

## 規約（守る）
- マイク・録音・再生は**表示中だけ**。`onHide`で録音を止め（未保存の録音はメモリに残りSaveできる）、再生は一時停止。マイクは1回の`getUserMedia`を解析とMediaRecorderで共有（`createAnalysisSession().stream`）。
- ロールは**仮想スクロール**：canvasはビューポート幅だけ。内容幅は`.qn-pt-content`のwidthで作り、canvasと鍵盤列は`position:sticky`。iOSのcanvas面積上限があるので、全長ぶんのcanvasを作らない。
- 描画負荷：録音中の再描画は約10fps（`REC_REDRAW_MS`）、再生中の更新は約15fps（`TICK_MS`の`setInterval`。`rAF`ループは使わない）。フィルタは見えている範囲＋前後2秒だけに適用。DOMは値が変わった時だけ書く。
- **IndexedDBの録音レコードは再putしない**（`GOTCHAS.md`§1）。改名は`localStorage`の`qn_pitch_rec_meta`（`{id:名前}`）。一覧は`openCursor`でメタ情報だけ読み、音声・点列は選んだ時に`dbGet`。
- 録音は`audio/webm`、非対応(iOS)は`audio/mp4`。再生の進捗は`audio.duration`（webmはInfinityになる）でなく点列から出した`duration`を使う。
- 画面スリープ防止：録音中・再生中だけ`QNWake.set("pitch",true)`。

## データ
| 保存先 | キー | 内容 |
|---|---|---|
| localStorage | `qn_pitch_filters` | フィルタ設定(JSON。既定は`QNPitchFilters.DEFAULTS`) |
| localStorage | `qn_pitch_rec_meta` | 録音の改名 `{id:名前}` |
| localStorage | `qn_pitch_panel_collapsed` | PC幅のパネル格納 |
| IndexedDB | `qn_pitch_db` / `recordings` | `{id,name,blob,track,duration,score,createdAt}`（autoIncrement id、index `createdAt`） |
