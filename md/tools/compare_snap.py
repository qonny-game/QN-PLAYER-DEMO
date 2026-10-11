# compare_snap.py — snap.py の出力2つを比べる（掃除の前後で差分0を確認）
# 使い方: python3 -I md/tools/compare_snap.py <前.json> <後.json>     差分0なら終了コード0
# 注意: スプラッシュのアニメ途中のtransformの揺れは意図しない差ではない（要素が svg で transform だけ違う行は無視してよい）
import json, sys
a = json.load(open(sys.argv[1])); b = json.load(open(sys.argv[2]))
total = 0; real = 0
for k, x in a.items():
    if not isinstance(x, dict):
        continue
    y = b.get(k)
    if y is None:
        print("後に無い画面:", k); real += 1; continue
    if set(x) != set(y):
        print(k, "要素の数が違う:", len(x), "->", len(y)); real += 1
    for e in x:
        if e in y and x[e] != y[e]:
            pa = dict(s.split(":", 1) for s in x[e].split(";") if ":" in s)
            pb = dict(s.split(":", 1) for s in y[e].split(";") if ":" in s)
            props = [p for p in pa if pa[p] != pb.get(p)]
            total += 1
            anim = e.split(" ", 1)[1].startswith("svg") and props == ["transform"]
            if not anim:
                real += 1
            print(("(アニメ揺れ) " if anim else "") + k, e[:70], props[:5])
print("差分のある要素:", total, "/ 意図しない可能性:", real)
sys.exit(1 if real else 0)
