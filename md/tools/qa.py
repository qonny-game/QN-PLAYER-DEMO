# qa.py — 出荷前チェックを並列で一括実行。結果は1画面(各項目の末尾だけ)。全部通ったら --ship で出荷まで。
# 使い方(プロジェクトのルートで):
#   python3 -I md/tools/qa.py                       全チェック(約1分。smokeは4画面を並列)
#   python3 -I md/tools/qa.py --quick               smokeをPCとSP-Sだけ、i18n/監査は省略(作業の途中確認用)
#   python3 -I md/tools/qa.py --ship 4.27.0 "一言" [--out DIR]   全チェックOKなら release.py ship → パッチZIPの中身をツリーと照合
# 終了コード0=全部OK。NGが出た項目だけ詳細(末尾20行)を表示。
import concurrent.futures as cf, hashlib, os, subprocess, sys, zipfile

here = os.path.dirname(os.path.abspath(__file__))
py = [sys.executable, "-I"]
args = sys.argv[1:]
quick = "--quick" in args
ship = None
out = "/home/claude/work/out"
if "--ship" in args:
    i = args.index("--ship")
    ship = (args[i + 1], args[i + 2])
if "--out" in args:
    out = args[args.index("--out") + 1]


def tool(*c):
    return py + [os.path.join(here, c[0])] + list(c[1:])


jobs = []
for v in (["PC", "SP-S"] if quick else ["PC", "PC-L", "SP", "SP-S"]):
    jobs.append(("smoke " + v, tool("smoke.py", ".", "--only=" + v), 300))
if not quick:
    jobs += [("i18n", tool("i18n_check.py"), 300), ("md_audit", tool("md_audit.py"), 120),
             ("js_unused", tool("js_unused.py"), 120), ("css_audit", tool("css_audit.py"), 120)]
jobs.append(("release check", tool("release.py", "check"), 120))


def run(j):
    name, cmd, to = j
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=to)
        o = (r.stdout + r.stderr).strip().splitlines()
        return name, r.returncode, o
    except subprocess.TimeoutExpired:
        return name, 99, ["時間切れ(%ds)" % to]


bad = 0
with cf.ThreadPoolExecutor(max_workers=6) as ex:
    results = list(ex.map(run, jobs))
for name, rc, o in results:
    last = o[-1] if o else ""
    # 監査系は終了コードが常に0なので、文言で判定する
    ng = rc != 0 or (name == "md_audit" and "指摘合計(CLEANUP除く): 0" not in "\n".join(o)) \
        or (name == "i18n" and "日本語が残っている文言: 0 件 / ページエラー 0 件" not in "\n".join(o)) \
        or (name.startswith("smoke") and "NG" in "\n".join(o))
    info = " | ".join(x.strip() for x in o[-2:])[:150] if name in ("js_unused", "css_audit") else last[:150]
    print("%-14s %s  %s" % (name, "NG" if ng else "OK", info))
    if ng:
        bad += 1
        print("\n".join("    " + x for x in o[-20:]))
print("\n結果: %s" % ("すべてOK" if not bad else "%d項目NG" % bad))
if bad or not ship:
    sys.exit(1 if bad else 0)

# ---- 出荷 ----
ver, msg = ship
r = subprocess.run(py + [os.path.join(here, "release.py"), "ship", ver, msg, "--out", out], capture_output=True, text=True)
print("\n".join((r.stdout + r.stderr).strip().splitlines()[-14:]))
if r.returncode != 0:
    sys.exit(1)
zp = os.path.join(out, "QNPLAYER_v%s_patch.zip" % ver)
miss = 0
with zipfile.ZipFile(zp) as z:
    names = [n for n in z.namelist() if not n.endswith("/")]
    for n in names:
        if hashlib.sha256(z.read(n)).hexdigest() != hashlib.sha256(open(n, "rb").read()).hexdigest():
            print("  不一致:", n); miss += 1
    if any(n.endswith("PATCH_FILES.txt") for n in names):
        print("  PATCH_FILES.txtが入っている"); miss += 1
print("パッチZIP照合: %s (%dファイル)  %s" % (zp, len(names), "OK" if not miss else "NG"))
sys.exit(1 if miss else 0)
