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
| シークバーのコード表示（Chordモード） | `CHORD_MODE.md` |
| 新しいアプリ（PITCH）／アプリ共通の見た目 | `AI_ASSISTANT_PROJECT_CONTEXT.md`§6、`PC_V2_FILE_INDEX.md`（qn-apps.js） |
| マーカーメモのプリセット／Colorパネル | `JS/player-marker-presets.js` |
| 保存されるデータ・キー | `AI_ASSISTANT_PROJECT_CONTEXT.md`§3 |
| Library同期・Transfer（端末間） | `SYNC.md`、`GOTCHAS.md`§8 |
| Stem・録音トラック | `GOTCHAS.md`（末尾の「Stem」項）、`JS/player-stem.js`冒頭 |
| 英語/日本語の切り替え・文言の追加 | `I18N_HANDOFF.md` |
| **ガイド・利用規約・プライバシー・料金ページ** | **`USER_DOCS.md`（機能やデータの扱いを変えたら見直す）** |
| 「あのボタン」が指す場所が曖昧 | `UI_TERMINOLOGY.md` |
| **確認・納品の道具（`md/tools/`）** | **`TOOLS.md`（`release.py ship`でチェック→版上げ→パッチZIP）** |
| **定期お掃除・不要コード整理** | **`CLEANUP.md`（掃除ルール。お掃除のたびに更新）** |

## 2. 進め方
1. 該当ファイルを`grep -n`で確認（`PC_V2_FILE_INDEX.md`で当たりを付ける）。
2. 既知の落とし穴（`GOTCHAS.md`）と重なっていないか照らす。**既存のCSS/処理を探してから足す。**
3. 検証：`AI_ASSISTANT_PROJECT_CONTEXT.md`§4のコマンド＋ローカルHTTPサーバーとPlaywright。見た目を変えない作業は計算済みスタイルの前後比較。**実機で確認できていない範囲は正直に伝える。**
4. `index.html`の`window.QN_APP_VERSION`を上げる（機能追加=マイナー、修正/お掃除=パッチ）。`md/CHANGELOG.md`の末尾に追記。構成・保存キー・ID・目次が変わったら該当mdも直す。ユーザーに見える機能や、通信・保存の仕方が変わったら`USER_DOCS.md`に沿ってガイド・規約・プライバシーも直す。
5. **納品の標準＝変更ファイルだけのパッチZIP**（`md/tools/release.py ship <版> "<一言>"`で自動。`TOOLS.md`）（フォルダ構成を保つ、`PATCH_FILES.txt`は作らない）、名前は`QNPLAYER_v<版>_patch.zip`。まとめ作業で「完全版で」と言われたら完全版ZIP。

## 3. いま未確認・要判断のこと（解決したら消す）
実機で見てもらうもの：
- v4.21.0〜4.22.0のUI変更（PC版サイドバーのControl下段移設、SPのMoreが波形に重なって開く／5秒で自動で閉じる）。
- Stem（WebGPU／WASMそれぞれの実機での速度、6パートのモデル取得）と録音トラック。

料金・規約まわりで食い違っているもの（ユーザー判断が要る。コードと文書の事実が合っていない）：
- **広告視聴で解放（TimePass）**：`pricing.html`と`terms.html`第4条は載せているが、`player-shareware.js`の「広告1時間/24時間」ボタンは広告を見せずに即解放する。`privacy.html`は「現在、広告配信サービスは使用していない」。`guide/plan.html`はTimePassに触れていない。
- **Stripeの購入リンクがテスト用**：`player-shareware.js`の月額/年額ボタンが`buy.stripe.com/test_...`。本番リンクに替わっているか公開前に確認。
- **`terms.html`第4条1項の「買い切り型のライセンス」**：料金ページに買い切りプランは無い。
- **同期・Transferの「先行提供」**：範囲を広げたら、ガイド（`data.html`/`reference.html`）・規約第2条3項・プライバシー第2条3項の「一部のアカウント」を直す。
- **Stemは無料版でも使える**（`isUnlocked`の判定が無い）。意図通りか確認。使えないようにするなら`guide/plan.html`・`pricing.html`の機能比較にも追記。
- ガイドのスクリーンショットは、サイドメニューの並び（Stem追加・Control移動）やSPのMoreの変更前のものが残っている可能性がある（`USER_DOCS.md`§4）。
