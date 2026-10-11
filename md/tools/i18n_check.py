# i18n_check.py — 英語表示で日本語が残っている文言を洗い出す（和英切替の辞書の追加漏れ）
# 使い方: python3 -I md/tools/i18n_check.py <ルート>
# 仕組み: qn_lang=en で開き、各パネルとアプリ(tuner/pitch)を開いて、日本語を含むテキスト/属性を列挙する。
# 注意: 曲名・マーカーメモなどのユーザーデータは変換されない仕様。YouTubeアプリは外部API遮断のため対象外。
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qnbrowser import QNBrowser

JS = r"""
() => {
  const jp = /[぀-ヿ㐀-鿿]/, out = new Set();
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    const p = n.parentElement;
    if (!p || /^(SCRIPT|STYLE)$/.test(p.tagName)) continue;
    if (jp.test(n.nodeValue)) out.add('[text] ' + n.nodeValue.trim().slice(0, 80));
  }
  for (const el of document.querySelectorAll('[title],[aria-label],[placeholder]'))
    for (const a of ['title', 'aria-label', 'placeholder']) {
      const v = el.getAttribute(a); if (v && jp.test(v)) out.add('[' + a + '] ' + v.slice(0, 80));
    }
  return Array.from(out);
}
"""
root = sys.argv[1] if len(sys.argv) > 1 else "."
found = {}
with QNBrowser(root) as qb:
    pg = qb.new_page(width=1280, height=800, lang="en")
    qb.goto(pg)
    qb.add_track(pg)
    def grab(where):
        for s in pg.evaluate(JS):
            found.setdefault(s, where)
    grab("初期表示")
    for lab in qb.icon_labels(pg):
        if not lab:
            continue
        try:
            qb.open_panel(pg, lab, wait_ms=500)
            grab("パネル " + lab)
        except Exception:
            pass
    for app in ("tuner", "pitch"):
        try:
            qb.open_app(pg, app)
            grab("アプリ " + app)
            for lab in qb.icon_labels(pg):  # アプリ内の各パネル(Filters / Sensitivity など)も開いて確認
                if not lab or lab in ("Settings", "Keyboard", "Color"):
                    continue
                try:
                    qb.open_panel(pg, lab, wait_ms=400)
                    grab("アプリ " + app + " / " + lab)
                except Exception:
                    pass
        except Exception as e:
            print("アプリを開けず:", app, str(e)[:60])
    errs = qb.errors(pg)
for s, w in sorted(found.items(), key=lambda x: x[1]):
    print("%-14s %s" % (w, s))
print("日本語が残っている文言: %d 件 / ページエラー %d 件" % (len(found), len(errs)))
sys.exit(1 if found or errs else 0)
