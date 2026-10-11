# snap.py — 画面の計算済みスタイルを丸ごと保存（掃除・CSS変更の前後比較用）
# 使い方: python3 -I md/tools/snap.py <ルート> <出力.json>
#         前と後で2回出力し、compare_snap.py で比べる。PC幅1280とSP幅390、初期表示＋アイコンバーの各パネル。
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qnbrowser import QNBrowser

JS = """
() => {
  const res = {}; let i = 0;
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el); const props = [];
    for (let k = 0; k < cs.length; k++) { const p = cs[k]; if (p.startsWith('--')) continue; props.push(p + ':' + cs.getPropertyValue(p)); }
    props.sort();
    const path = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\\s+/).join('.') : '');
    res[(i++) + ' ' + path] = props.join(';');
  }
  return res;
}
"""
root, out = sys.argv[1], sys.argv[2]
result = {}
with QNBrowser(root) as qb:
    for name, (w, h) in {"pc": (1280, 800), "sp": (390, 844)}.items():
        pg = qb.new_page(width=w, height=h)
        qb.goto(pg)
        result[name + "_init"] = pg.evaluate(JS)
        labels = qb.icon_labels(pg)
        for idx, lab in enumerate(labels):
            if not lab:
                continue
            try:
                qb.open_panel(pg, lab, wait_ms=700)
                result["%s_panel_%d_%s" % (name, idx, lab)] = pg.evaluate(JS)
            except Exception:
                pass
        result[name + "_errors"] = qb.errors(pg)
json.dump(result, open(out, "w"))
n = sum(len(v) for v in result.values() if isinstance(v, dict))
print("保存:", out, "/ 要素", n, "/ ページエラー", {k: len(v) for k, v in result.items() if k.endswith("_errors")})
