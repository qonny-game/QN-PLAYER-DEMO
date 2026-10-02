# QN-PLAYER クイックスタート（作業開始時に最初に読む）

新しいセッションで修正依頼を受けたら、コードを開く前にこの手順で進める。

## 0. 最初に確認すること
- 添付が**全体ZIP**か**部分ファイル**か。全体ZIPなら`index.html`の`window.QN_APP_VERSION`と`md/CHANGELOG.md`末尾で現在地を確認。部分ファイルなら、判断に必要なファイル名を具体的に挙げて送付を依頼する（推測で進めない）。
- スクリーンショットがあれば、文章より先に見る（`md/UI_TERMINOLOGY.md`）。
- ユーザーはコード素人。専門用語は噛み砕き、口調はタメ口でフレンドリー。判断は任せてもらう。

## 1. 依頼の種類 → 最初に開くファイル（`md/`）
| 依頼 | 見るもの |
|---|---|
| SP/スマホで◯◯がおかしい | `AI_ASSISTANT_PROJECT_CONTEXT.md`§2（PC v2が唯一の実UI）、`CSS/style-layout-pc-v2-sp.css` |
| 再生できない・フリーズ・不安定 | `GOTCHAS.md`§1・§3 |
| 削除・選択・EDITモード | `GOTCHAS.md`§5（`attachSelectionHandlers`が奪う） |
| ループ・マーカー・シーク | `GOTCHAS.md`§2、`JS/qn-marker-core.js` |
| レイアウト・表示順 | `GOTCHAS.md`§4、`PC_V2_FILE_INDEX.md` |
| 新しいモーダル/パネル/ボタン | `GOTCHAS.md`、`DOM_ID_REFERENCE.md`、`PC_V2_FILE_INDEX.md` |
| YouTubeアプリ | **`YOUTUBE_APP.md`（最優先。§2の規約ルール）** |
| TUNERアプリ | `TUNER_APP.md` |
| PITCHアプリ | `PITCH_APP.md` |
| 新しいアプリ（PITCH）／アプリ共通の見た目 | `AI_ASSISTANT_PROJECT_CONTEXT.md`§6、`PC_V2_FILE_INDEX.md`（qn-apps.js） |
| マーカーメモのプリセット／Colorパネル | `JS/player-marker-presets.js` |
| 保存されるデータ・キー | `AI_ASSISTANT_PROJECT_CONTEXT.md`§3 |
| 「あのボタン」が指す場所が曖昧 | `UI_TERMINOLOGY.md` |

## 2. 進め方
1. 該当ファイルを`grep -n`で確認（`PC_V2_FILE_INDEX.md`で当たりを付ける）。
2. 既知の落とし穴（`GOTCHAS.md`）と重なっていないか照らす。**既存のCSS/処理を探してから足す。**
3. 検証：`AI_ASSISTANT_PROJECT_CONTEXT.md`§4のコマンド＋ローカルHTTPサーバーとPlaywright。見た目を変えない作業は計算済みスタイルの前後比較。**実機で確認できていない範囲は正直に伝える。**
4. `index.html`の`window.QN_APP_VERSION`を上げる（機能追加=マイナー、修正/お掃除=パッチ）。`md/CHANGELOG.md`の末尾に追記。構成・保存キー・ID・目次が変わったら該当mdも直す。
5. **納品の標準＝変更ファイルだけのパッチZIP**（フォルダ構成を保つ、`PATCH_FILES.txt`は作らない）、名前は`QNPLAYER_v<版>_patch.zip`。まとめ作業で「完全版で」と言われたら完全版ZIP。

## 3. いま未確認・要判断のこと（実機で見てもらうもの）
- 直近の下段バー変更（v3.12〜3.16）後のSP幅の見た目。YouTubeの実再生（プリロール中に別区間へ飛ぶ件の修正）。アプリ一覧フライアウトがPCで「シュッ」と出るか（OSの「視覚効果を減らす」設定の影響の可能性）。
