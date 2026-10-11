# where.py — 用語・ID・クラス名・文言が、どのmd/guide/コードに出てくるかを一覧する。UIや名前を変えたとき、直すべきドキュメントを漏れなく拾う。
# 使い方: python3 -I md/tools/where.py <語> [<語>...]     mdとguideは該当行を表示、JS/CSS/htmlは件数だけ(行は --code で表示)
import os, re, sys
terms = [t for t in sys.argv[1:] if not t.startswith("--")]
show_code = "--code" in sys.argv
root = "."
skip = {"CHANGELOG.md", "release_manifest.json"}
for t in terms:
    print("== %s ==" % t)
    for dp, dn, fn in os.walk(root):
        dn[:] = [d for d in dn if d not in (".git", "node_modules", "__pycache__")]
        for f in sorted(fn):
            if f in skip or not f.endswith((".md", ".html", ".js", ".css")):
                continue
            p = os.path.join(dp, f)
            try:
                lines = open(p, encoding="utf-8").read().splitlines()
            except Exception:
                continue
            hits = [(i + 1, l) for i, l in enumerate(lines) if t in l]
            if not hits:
                continue
            doc = f.endswith(".md") or p.startswith("./guide/")
            if doc or show_code:
                for n, l in hits[:8]:
                    print("  %s:%d  %s" % (p[2:], n, l.strip()[:140]))
                if len(hits) > 8:
                    print("  %s … 他%d件" % (p[2:], len(hits) - 8))
            else:
                print("  %s  (%d件)" % (p[2:], len(hits)))
