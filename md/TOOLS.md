# 用意してある道具（`md/tools/`）

作業の事故を減らすためのPythonスクリプト。全部 `python3 -I md/tools/<名前>.py ...` で動く（プロジェクトのルートで実行）。ブラウザを使うものはPlaywright(Python)とChromiumが要る。外部ドメインは遮断して動かすので、ログイン・YouTube再生・Stemのモデル取得は確認できない。

| 道具 | 何をするか |
|---|---|
| `release.py` | リリース作業を1本に。`check`（構文・CSS括弧・id重複・版とCHANGELOG・参照ファイル・許可リスト外の混入を確認）／`bump 版 "一言"`（index.htmlの版とCHANGELOGを更新）／`zip`（前回渡した版からの変更ファイルだけのパッチZIP）／`full`（完全版ZIP）／`ship 版 "一言"`（bump→check→記録→zipを一気に）／`status`（変更ファイルと関数名の増減）／`record`（その版を基準として登録） |
| `smoke.py` | 曲追加・フォルダ作成・全パネル切替・アプリ切替(tuner/pitch/youtube/player)をPC 1280/1920・SP 390/360で実行し、JSエラー0を確認 |
| `snap.py` ＋ `compare_snap.py` | 全要素の計算済みスタイルを書き出し、前後で比較（見た目を変えない作業の確認） |
| `i18n_check.py` | 英語表示にして、日本語が残っている文言とページエラーを洗い出す |
| `qnbrowser.py` | ブラウザ確認の共通土台（サーバー起動・PC/SP・無料版解除・言語指定・テスト音声生成・外部遮断・エラー収集・スクショ）。新しい確認スクリプトはこれを使って書く |
| `guide_shots.py` | **ガイド用スクショの撮り直し**（`python3 -I md/tools/guide_shots.py <src> [出力先] [画像名...]`）。デモ曲3つ・フォルダ Band・マーカー5個を投入し、日本語UIで PC(1440x860@1.5)/SP(390x780@2) を撮って guide/img/*.webp に書く。pc-overview と sp-overview-ann は番号バッジ付き（ガイドの表と対応）。UI変更後はこれを回す |
| `qa.py` | **出荷前チェックの一括実行**（smoke4画面＋i18n＋md_audit＋js_unused＋css_audit＋release checkを並列で）。結果は1項目1行、NGだけ詳細。`--quick`=smokeをPC/SP-Sだけ・約20秒（作業の途中確認用）。`--ship 版 "一言"`=全部OKならそのまま`release.py ship`→パッチZIPの中身をツリーと照合。全チェックは約2分(2コア)なので、ツール呼び出しのtimeoutは300秒にする |
| `try.py` | **画面の動作確認を1コマンドで**（その場でPlaywrightスクリプトを書かない）。`--app tuner --mic --size pc sp --panel X --click css --mic-set tone=0.001,noise=0.002 --eval "js" --shot 名前`。PC/SP複数サイズを一度に、eval結果・ページエラー・スクショ(/tmp/qnshots/)を出力。`--mic`は擬似マイク(qnbrowser.pyの擬似マイク定義) |
| `where.py` | **用語・ID・文言がどのmd/guide/コードにあるか**を一覧（mdとguideは該当行、コードは件数）。名前やUIを変えた時の、直すべきドキュメントの拾い漏れ防止 |
| `css_audit.py` / `js_unused.py` / `md_audit.py` | お掃除用。引数なしならカレントがルート。未使用のCSS／未参照の関数／mdが挙げる名前がコードに残っているか（`CLEANUP.md`） |

## 標準の流れ
1. 作業する（コード・必要なmdを直す）。名前やUIを変えたら `where.py <語>` でmd/guideの直し漏れを拾う。
2. 動作を確認する：新しい挙動は `try.py`（スクショ付き）、途中の健全性は `qa.py --quick`、見た目を変えない作業は `snap.py` を前後で出して `compare_snap.py`。
3. `qa.py --ship <新しい版> "<CHANGELOGの一言>"`（全チェック→ship→ZIP照合を一気に）→ 出力された `QNPLAYER_v<版>_patch.zip` を渡す。
4. 完全版を頼まれたら `release.py full`。

## 基準（前回渡した版）の仕組み
- `md/release_manifest.json` に、渡した版ごとの全ファイルのSHA-256を直近3版ぶん持つ。`ship`が自動で更新し、パッチZIPにも入る。パッチを適用すると基準も一緒に進む。
- 記録が無い場合（別の経路で渡した版など）は、その版の状態で `release.py record` を1回実行してから `ship` する。`--since 版` で基準の版を指定できる。
- 納品ルール（変更ファイルだけ・フォルダ構造維持・`PATCH_FILES.txt`なし・名前固定）はスクリプトが守る。ZIPに入れてよいファイルの許可リストは `release.py` の `ALLOW_*`。

## 調整用(必要な時だけ)
| 道具 | 何をするか |
|---|---|
| `chord_pos.js` | `node md/tools/chord_pos.js <ルート> <モノf32le> <sr>`。コードの区切りが拍・小節頭にどれだけ乗っているか、snap有無の区間数・当てはまり(conf)・一致率を出す。`HEAD_MUL`/`BEAT_MUL`/`SW_MID`/`SN_OFF`などを環境変数で振れる。解析結果は`/tmp/ccache_*`に保存して2回目以降を速くする |
