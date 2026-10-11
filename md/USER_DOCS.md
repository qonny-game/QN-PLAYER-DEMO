# ユーザー向け文書の更新ルール（ガイド・利用規約・プライバシーポリシー・料金ページ）

アプリの機能やデータの扱いを変えたら、コードと一緒にここも見直す。食い違いは、ユーザーへの誤案内や、規約違反の表示（プライバシーに書いていない送信など）になる。

## 1. 対象ファイル
| ファイル | 内容 | 言語 |
|---|---|---|
| `guide/*.html`（index/start/screen/operations/data/apps/plan/reference）＋`guide/img/*.webp` | アプリ内ガイド。設定の「More」から別タブで開く。スタイルは`guide/guide.css`、テーマ色反映とライトボックスは`guide/guide.js` | 日本語のみ |
| `terms.html` | 利用規約 | 日本語のみ |
| `privacy.html` | プライバシーポリシー | 日本語のみ |
| `pricing.html` / `pricing-en.html` | 料金ページ（サービス紹介側）。規約第1条3項により規約の一部扱い | 日英 |

## 2. 変更の種類 → 見る場所
| 変更 | 更新先 |
|---|---|
| 画面の並び・ボタン名・設定項目の追加/変更 | `guide/screen.html`（番号表・サイドメニュー表）、`guide/operations.html`、`guide/reference.html`（Settings表）。スクリーンショットが古くなるので§4を確認 |
| 新しいパネル/機能（Stemなど） | `guide/index.html`の「主な機能」、`guide/operations.html`に節、`guide/screen.html`のサイドメニュー表 |
| 保存先が増える（localStorage/IndexedDB/Cache） | `guide/data.html`の保存先表（バックアップ・同期の対象かどうかも書く）、`privacy.html`第2条4項 |
| 無料版の制限（`SW_LIMITS`ほか）・価格・プラン | `guide/plan.html`、`pricing.html`、`pricing-en.html`、`terms.html`第4条。**4か所を同時に直す** |
| バックアップ/インポート/同期/Transferの仕様 | `guide/data.html`、`privacy.html`第2条3・6項 |
| 新しいアプリ（QN◯◯） | `guide/apps.html`、`guide/index.html`、`guide/screen.html`のロゴ行、`terms.html`第1条・`privacy.html`第1条の「含みます」 |
| ショートカット | `guide/reference.html`の表、`player-theme.js`の`QN_SHORTCUTS`と一致させる |

## 3. 規約・プライバシーを必ず見直すトリガー
- **新しい外部サービスに通信する**（CDN、モデル配信、API、フォント、決済、広告、解析）→ `privacy.html`第4条に事業者と送る情報を書く。確認コマンド：`grep -ohE "https?://[A-Za-z0-9._/-]+" JS/*.js index.html | sort -u`
- **新しい情報を取得・保存する**（マイク、カメラ、位置、アカウント情報、同期データの追加）→ `privacy.html`第2条。端末内だけか、サーバーに送るかを明記する。
- **広告・アクセス解析を入れる** → `privacy.html`第4条・第5条は「導入するときは事前に改定する」と約束している。先に改定する。
- 機能の名前や範囲が変わる → `terms.html`第2条（サービス内容）、第1条（含むアプリ）。
- 改定したら、`terms.html`と`privacy.html`の「最終改定日」を直す（制定日は変えない）。重要な変更はアプリ上でお知らせする（規約第13条）。
- 法的な文言の変更は、公開前に専門家（弁護士など）に確認してもらうのが望ましい。ここでの更新は、実装との事実の照合まで。

## 4. スクリーンショット（`guide/img/*.webp`）
- 画面の並びやアイコンが変わると古くなる。サイドメニューの並び、ドック、Moreが写っているもの（`pc-overview` `sp-overview-ann` `sp-more` `pc-settings*` `pc-flyout`など）は特に注意。
- 文章だけ先に直し、画像の差し替えが必要なものは`QUICK_START.md`の「要判断」に書き残す。

## 5. 文体
- ガイド・規約は丁寧語。簡潔・中立で、絵文字は使わない。ガイドはUIの英語ラベルをそのまま太字で書く（日本語UIでも英語のまま残るラベルがあるため。`I18N_HANDOFF.md`）。
- 数値（無料版の上限・価格・秒数・範囲）は、書く前にコードで確かめる：`SW_LIMITS`（`player-shareware.js`）、バー長/行数（`player-bars.js`）、`qn_skip_sec`の選択肢、Stemの上限（`MAX_SECS`）など。

## 6. 検証
```bash
# HTMLの閉じ忘れ（ガイド・規約・プライバシー）
python3 -I - <<'PY'
import html.parser,glob
V=('meta','link','img','br','input','hr','source')
class P(html.parser.HTMLParser):
    def __init__(s): super().__init__(); s.st=[]; s.err=[]
    def handle_starttag(s,t,a):
        if t not in V: s.st.append(t)
    def handle_endtag(s,t):
        if t in V: return
        if s.st and s.st[-1]==t: s.st.pop()
        else: s.err.append((t,s.getpos()))
for f in glob.glob('guide/*.html')+['terms.html','privacy.html']:
    p=P(); p.feed(open(f,encoding='utf-8').read()); print(f,p.st[:3],p.err[:2])
PY
```
