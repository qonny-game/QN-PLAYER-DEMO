# 多言語化(日本語/English)の引き継ぎメモ

別チャットで作業する前提のメモ。QNPLAYER v3.38.0時点。

## 目的
- 設定パネル(歯車)に「Language」を追加し、日本語/Englishで**文章系**の表示を切り替える。**ボタンのラベルは対象外**(現状ほぼ英語のまま)。
- 初期言語: ブラウザ言語(`navigator.languages`)が`ja`なら日本語、それ以外は英語。手動選択が優先。
- IPによる国判定は使わない(外部API必要・VPN/旅行で外れる)。必要なら後から追加。

## 方針
1. 辞書ファイル `JS/qn-i18n.js` を新設(`QNI18N.t(key, vars)`、`QNI18N.getLang()/setLang()`、`apply(root)`)。保存先localStorage `qn_lang`(`auto`/`ja`/`en`、既定`auto`)。
2. HTML固定文: `data-i18n="key"`(属性は`data-i18n-title`、`data-i18n-placeholder`等)を付け、`apply()`で差し替え。
3. JSが出す文(トースト、エラー、`title`、確認ダイアログ、動的ラベル): `t("key")`へ置換。
4. 辞書にenが無いキーは日本語へフォールバック。
5. 設定パネル(`ensureSettingsBody()` / `syncSettingsBody()` in `player-ui-pc-v2.js`)に`settingsSeg("lang", ["auto","ja","en"], ...)`を追加。言語変更時は`apply(document)`と、再描画が必要な箇所(ライブラリ件数など)を再実行。
6. 設定パネル自身の文言(Bar length等)も辞書化の対象。

## 範囲
- 第1段階: 本体PLAYER(`index.html`, `JS/player-*.js`, 設定パネル, Backup/Import画面, Sync/Transfer)。
- 第2段階: YouTube(`qn-app-youtube.js`)、PITCH(`qn-app-pitch.js`)、アプリメニュー/ログイン周り。

## 洗い出しのコツ
- 日本語を含む文字列を検索: `grep -nP "[\x{3040}-\x{30FF}\x{4E00}-\x{9FFF}]" index.html JS/*.js`(コメント行は除外して見る)。
- `title="..."`、`toast`/`showToast`系、`confirm(`、`alert(`、`placeholder=`、`aria-label=`が主な出所。
- アプリ内の文言は丁寧すぎ・砕けすぎを避け、簡潔で中立に。絵文字なし。

## 注意
- 既存のデザインを崩さない。英語は日本語より長くなりがちなので、SP幅(390px)でのはみ出しを確認する。
- `QN_APP_VERSION`を上げ、CHANGELOGに追記。localStorageキーはAI_ASSISTANT_PROJECT_CONTEXT.md §3の表に追記。
