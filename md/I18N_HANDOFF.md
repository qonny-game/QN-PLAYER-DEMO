# 多言語化(日本語/English)

QNPLAYER v3.57.0時点の実装メモ。第1段階(PLAYER本体)・第2段階(YouTube/PITCH/TUNER)完了。

## 仕組み(`JS/qn-i18n.js`)
- ソース内の文言は**日本語のまま**。英語表示の時だけDOMを英語へ差し替える(日本語文字列をキーにした辞書方式)。`data-i18n`やキー名は使わない。
- 英語表示中のみ MutationObserver が動く(日本語表示中はobserverなし)。後から作られるDOM・トースト・ポップアップ・モーダルも自動で英語になる。
- 対象はテキストノードと `title` / `aria-label` / `placeholder`。元の日本語はノード/要素(`__qnJa` / `__qnJaAttrs`)に保持し、日本語へ戻す時に復元する。
- 変換は `DICT`(完全一致) → `RULES`(数字入りの断片を順に置換)。**訳せない文字列は日本語のまま表示**(誤訳より安全)。結果に日本語が残る場合も元の日本語を表示。
- `alert` / `confirm` の本文も英語化。JS側で文字列を組み立てて直接使う時は `QNI18N.t("日本語")`。
- API: `QNI18N.getLang()`(実効: ja|en) / `getPref()`(auto|ja|en) / `setPref(v)` / `apply()` / `OPTIONS`。切替時に `qn-lang-change` イベント。
- 保存: localStorage `qn_lang`(auto|ja|en、既定auto。autoはブラウザ言語がjaなら日本語、他は英語)。
- 設定UI: Settings > General > Language(`player-ui-pc-v2.js` の `ensureSettingsBody` の `rowsLang`)。

## 文言を足す時
1. 日本語をそのままコードに書く。
2. `qn-i18n.js`(PLAYER本体)または `qn-i18n-apps.js`(YouTube/PITCH/TUNER)の `DICT`(固定文)/`RULES`(数字入り)に英訳を足す。`QNI18N.addDict(obj)` / `addRules(arr)` でも足せる。
   - 同じテキストノードに文字列を連結して出している場合は、連結後の全文がキーになる。
3. 英語はUIルール: 先頭大文字・以後小文字(略語MP3/ZIP/EQ等・音名・単位は例外)、簡潔・中立、絵文字なし。
4. 検証: `localStorage.qn_lang="en"` で読み込み、日本語が残っていないか確認(下記スニペット)。

```js
// 英語表示で日本語が残っているテキスト/属性を列挙
const o=new Set(),w=document.createTreeWalker(document.body,4);let n;
while(n=w.nextNode()){if(/[぀-ヿ一-鿿]/.test(n.nodeValue))o.add(n.nodeValue.trim())}
console.log([...o])
```

## 注意
- 英語は日本語より長い。SP幅(390px)ではみ出しを確認する。
- コードが `textContent === "日本語"` のように表示文を比較していると、英語表示で外れる。状態はDOM文字列でなくデータで持つこと。
- アプリ内の文言は丁寧すぎ・砕けすぎを避け、簡潔で中立に。

## 残り
- アプリメニュー/ログイン周りは第1段階の辞書で対応済み。新しいアプリや画面を足したら、英語表示で日本語が残っていないか上のスニペットで確認する。
