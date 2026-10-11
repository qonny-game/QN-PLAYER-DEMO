# QN-PLAYER お掃除ルール（定期お掃除の前に読む）

**このファイルは随時更新する。** お掃除のたびに、新しく分かったルール・踏んだ失敗・残置の判断をここへ反映する（古くなった記述は直す／消す。履歴は`CHANGELOG.md`に書く）。

過去のお掃除（3.20.1〜3.20.3）と`GOTCHAS.md`・`AI_ASSISTANT_PROJECT_CONTEXT.md`に散らばっていたルールを1か所にまとめたもの。

---

## 1. 基本方針
- **見た目と動作を変えない。** お掃除は中身の整理だけ。仕様変更・機能追加は混ぜない（別版にする）。
- **迷ったら消さない。** 動的に使われている可能性が少しでもあるものは残し、§5「残置リスト」に理由を書く。
- バージョンは**パッチを上げる**（例 4.0.0 → 4.0.1）。`md/CHANGELOG.md`の末尾に1〜数行追記。
- 納品は原則**変更ファイルだけのパッチZIP**（`QNPLAYER_v<版>_patch.zip`、フォルダ構成を保つ、`PATCH_FILES.txt`は作らない）。ユーザーが「完全版で」と言ったら完全版ZIP。

## 2. 掃除の対象
| 対象 | やること |
|---|---|
| 未使用のJS関数・変数 | 呼び出しが無いものを削除 |
| 未使用のCSSクラス | 参照が無いものを削除（動的クラスに注意。§3） |
| 未使用・重複のid | `index.html`と`JS`の双方から参照が無いものを削除。重複idは必ず解消 |
| 重複した関数・処理 | 1つに統合（共通ヘルパーの定位置は`player-core.js`） |
| 無効・重複のCSSルール | 削除（例：重複していた`.tripleNavBtn`） |
| 検証用・デバッグ用コード | 削除（例：swDebug） |
| コメント | 規約外のものを削除・圧縮（§4） |
| md | 現状と食い違う記述を直す／消す。目次・保存キー・ID表・ファイルマップの更新漏れを埋める（`md/tools/md_audit.py`で、mdが挙げるファイル名・関数名・idがコードに残っているかを機械的に確認できる） |
| ガイド・利用規約・プライバシー・料金ページ | 実装と食い違う記述を直す。手順と確認項目は`USER_DOCS.md` |
| 大きくなりすぎたファイル | 分割できるものだけ分割（§3の例外に注意） |

## 2.5 洗い出しのコツ（4.0.2で確立）
- JS：`function 名`／`const 名 = ...=>`を全JS＋`index.html`で検索し、参照が宣言1か所だけのものを候補にする。**`(function 名() {...})();`形式の即時関数は実行されているので未使用ではない**（名前の参照が無いだけ）。
- CSS：クラス・idをCSSから抜き出し、HTML/JSに無いものを候補にする。複数セレクタのうち一部だけが死んでいる場合は、その行だけ外す（残りは触らない）。
- 要素が無いのにCSSだけ残っている、が一番多い（旧下段バーの`.pcv2-ctrl-btn`、旧ヘッダーナビ、`#eqToggleBtn`等）。
- 消したあとにもう一度洗い出す（消した関数だけが使っていた変数・関数が新たに孤立する。例：`keyStepperFill`を消したら`pct`/`left`が残った）。

- 道具（`md/tools/`。いずれも`python3 -I <script> <プロジェクトのルート>`で実行）：`css_audit.py`＝CSSのクラス/idでHTML・JSに参照が無いもの（`is-`＋種別、`pcv2-panel-*`は動的なので候補から外す）／`js_unused.py`＝宣言のみで参照が無い関数／`md_audit.py`＝mdが挙げる名前の存在確認／`snap.py`＝PC幅・SP幅で全要素の計算済みスタイルを書き出し（前後2回出力してJSONを比較）／`smoke.py`＝曲追加・フォルダ作成・パネル切替のスモークテスト。Playwright(Python)とChromiumが要る。外部ドメインは遮断して動かすので、ネットワーク由来のエラーは出ない前提。ほかの道具（`release.py`・`compare_snap.py`・`i18n_check.py`・`qnbrowser.py`）は`TOOLS.md`。

## 3. 消してはいけないもの・触らないもの
- **動的に組み立てられるクラス名・idは、単純な文字列検索で未使用と決めない。** 例：`"is-" + kind`（`.is-a/.is-b`）、`"pcv2-panel-" + panelId`（`.pcv2-panel-*`）、`eqBand0〜9`。
- `JS/jszip.min.js`（外部ライブラリ。触らない）。
- **分割しないファイル**：`player-ui-pc-v2.js`・`qn-app-youtube.js`（1つのIIFE内で多数の変数を共有。分割すると作り直しになる）。
- **読み込み順**（`index.html`のCSS/JS。順序で上書き・グローバル参照が決まる）。並べ替えない。
- 他アプリ・他端末から参照される保存キー・IndexedDB名（互換性が壊れる）。
- 旧UIの「死んでいるように見えるコード」は、まず`AI_ASSISTANT_PROJECT_CONTEXT.md`§2と`GOTCHAS.md`を読んでから判断する（PC v2が唯一の実UIで、旧SP要素は`body.pc-v2-active`で非表示）。

## 4. コメント規約（お掃除でもこれに揃える）
- JS/CSS/HTMLのコメントは「**注意・禁止・規約・順序依存・仕様メモ**」だけを最小限の言葉で書く。
- 経緯・版履歴・機能の説明文は書かない（書くなら`CHANGELOG.md`か`GOTCHAS.md`）。
- アプリ内の文言（ラベル・説明・トースト）に砕けた口調・絵文字は使わない（簡潔・中立）。※チャットの口調とは別。

## 5. 残置リスト（消さずに残している既知のもの）
お掃除の候補になりやすいが、理由があって残しているもの。判断が変わったら更新する。
- 各アプリ（YouTube/PITCH/TUNER）内の旧backup/import/keyboardセクション：未使用のまま残置。**削除候補。** 消す場合は参照元（`qn-apps.js`の設定一覧）を先に確認する。
- 旧「SP専用UI」（`.app-container`直下の要素）：実質死んでいるが、削除の影響範囲が大きいため未着手。**削除候補。** 着手時は`style-layout-sp.css`との関係も確認する。
- `style-layout-sp.css`：SP幅の少量の上書き（ヘッダー・ロゴ・`.export-modal`）のみ。
- `openEqModal()`（`player-control-eq.js`）：どこからも呼ばれない。ただし`#eqModalOverlay`内の`#eqInlineSection`がEQ UIの定位置（`player-ui-shared.js`が元の位置を覚え、PC v2が`#eqModalOverlay`を参照する）なので、オーバーレイごとは消せない。消すなら先にEQ UIの置き場所を決める。
- `.export-modal*`・`.export-section*`・`.export-run-btn`などの`export-`接頭辞：Export撤去後は共通モーダルの器になっている。名前だけが実態と合わない。変える場合はCSS・index.html・JS（`player-track-backup.js`ほか）を一括で置換し、計算済みスタイルの前後比較で差分0を確認する。`CSS/style-export.css`のファイル名も同時に変える。
- `swUnlockPremium()`（`player-shareware.js`。どこからも呼ばれないが、テスト用にコンソールから使う可能性があるため残置）。
- `#keyDisplay`など、JS側は要素がnullでも動く保護付きで、要素だけが無い箇所は、機能の有無を確認してから消す。

## 6. 手順
1. **現在地の確認**：`index.html`の`window.QN_APP_VERSION`と`md/CHANGELOG.md`末尾。添付が全体ZIPか部分ファイルかを確認（部分なら必要なファイル名を挙げて送付を依頼）。
2. **候補の洗い出し**：JS関数・CSSクラス・idをそれぞれ参照検索。**動的組み立て（§3）を必ず考慮**して、判断に迷うものは残す。
3. **作業前のスナップショット**：直前の版のコピーを取り、後で`diff`できるようにする。
4. **掃除を実施**。1種類ずつ（JS→CSS→id→コメント→md）進めると差分を追いやすい。
5. **意図しない削除の確認**：直前の版と**関数名・トップレベル変数を`diff`**する（`node --check`では見つからない。大きな文字列置換で無関係なコードを巻き込んで消した実績あり）。
6. **検証**（`AI_ASSISTANT_PROJECT_CONTEXT.md`§4）：
   ```bash
   for f in JS/*.js; do node --check "$f" || echo "FAIL: $f"; done
   for f in CSS/*.css; do python3 -c "t=open('$f',encoding='utf-8').read();print('MISMATCH $f') if t.count('{')!=t.count('}') else None"; done
   grep -o 'id="[a-zA-Z0-9_]*"' index.html | sort | uniq -c | awk '$1>1'
   ```
   さらにローカルHTTPサーバー（`file://`不可）＋Playwrightで、ページエラー0・音声読み込み→Backup→Importが通ることを確認。見た目を変えない作業は計算済みスタイルの前後比較で差分0を確認する（PC幅1280・SP幅390、初期表示＋アイコンバーの各パネルを開いた状態。**プロパティ名をソートして比較する**＝カスタムプロパティの並びが版で変わるため。アニメ途中の揺れは無視）。**ヘッドレスでしか確認できていない範囲は正直に伝える。**
7. **バージョンと記録**：`QN_APP_VERSION`をパッチで上げ、`CHANGELOG.md`に追記。構成・保存キー・ID・目次が変わったら該当mdも直す。このファイルの§5と§7も更新する。
8. **納品**：パッチZIP（§1）。

## 7. お掃除の記録（要点のみ。詳細は`CHANGELOG.md`）
- 3.20.1：未使用JS関数・未使用CSSクラスを削除。動的クラスは残す。
- 3.20.2：未使用id削除、重複関数の統合、大型ファイルの分割、md整理。IIFE系の2ファイルは分割しない判断。
- 3.20.3：コメントを規約の範囲に圧縮、検証用コードと無効CSSの削除。
- 4.0.1：お掃除ルールをこのファイルに集約。
- 4.0.2：未使用JS関数3つ(`clearAB`/`openMarkerColorPicker`/`canHover`)、`keyStepperFill`関連、死んでいたCSS(旧下段バー`.pcv2-ctrl-btn`・旧ヘッダーナビ・`.key-stepper*`・旧トグル系id・`.qn-yt-btn.danger`等)、未使用id2つを削除。見た目の差分0を確認(同版で追加した「操作ガイド」「波形右下のバー設定の帯」「`.vbar`の幅修正」は見た目が変わる別件)。
- 4.0.3：旧Transferモーダルの専用CSS(`.qn-p2p-modal`系)を削除(パネル化に伴う)。
- 4.22.1：旧Export機能の残りCSS(`.export-format-*`/`.export-marker-*`/`.export-checkbox-row`ほか)、旧ミキサーの`.pcv2-mix-btn`/`.pcv2-mix-keyrow`、`.av-toggle-btn`、`.qn-yt-mix-head/-label`、`.skip-off`、Auto Nextスコープボタン一式(JS・CSS)を削除。計算済みスタイルの前後比較は差分0（PC1280/SP390、初期表示＋全パネル）。ガイド・利用規約・プライバシーを実装に合わせて更新し、md全体の食い違いを修正、`USER_DOCS.md`と`md/tools/`を追加。
