# release.py — リリース作業を1本にまとめたスクリプト(確認 → 版上げ → パッチZIP/完全版ZIP)
# 使い方(プロジェクトのルートで):  python3 -I md/tools/release.py <サブコマンド> [引数]
#   status                 今のバージョン / 基準からの変更ファイル / (あれば)関数名の増減を表示
#   check                  公開前の機械チェック(下記)。NGがあれば終了コード1
#   bump <版> "<一言>"     index.htmlのQN_APP_VERSIONを更新し、CHANGELOGに「- <版> <一言>」を追記
#   zip [--since 版]       checkを通ったらパッチZIPを作る(基準からの変更ファイルだけ)
#   full                   checkを通ったら完全版ZIPを作る(許可リストのファイルだけ)
#   ship <版> "<一言>"     bump → check → record → zip を一気に行う(通常はこれ1つ)
#   record                 今の状態を「その版として渡した」と記録する(基準の登録。通常はshipが自動で行う)
# 共通オプション: --root DIR(既定は実行場所) / --out DIR(ZIPの出力先。既定はルートの親フォルダ)
#                 --base DIR(statusで関数名の増減を見る比較元。省略時は <ルート名>_base があれば使う)
# 基準の仕組み: md/release_manifest.json に「渡した版ごとの全ファイルのSHA-256」を持つ。
#   パッチZIPは「現在の版より前で一番新しい記録」との差分。直近3版ぶんだけ保持する。
#   記録が無い時は status/zip は動かない(最初は渡した版の状態で record する)。
# checkの内容: 版の形式 / CHANGELOG最新行との一致 / JS構文(node --check。ESモジュールは自動判別) /
#   CSSの{}数 / HTMLのid重複 / index.htmlが参照するファイルの存在 / 許可リスト外ファイルの混入 /
#   (警告)新しく増えたid・localStorageキーがmdに書かれているか。
# 納品ルール(固定): パッチZIPは変更ファイルだけ・フォルダ構造維持・PATCH_FILES.txtなし・名前 QNPLAYER_v<版>_patch.zip。
import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

MANIFEST = "md/release_manifest.json"
KEEP_VERSIONS = 3
# 本番に入れてよいもの(許可リスト)。ここに無いファイルはZIPに入らず、checkが警告する
ALLOW_TOP = {"index.html", "terms.html", "privacy.html", "pricing.html", "pricing-en.html",
             "CNAME", "QUICK_START.md"}
ALLOW_DIRS = ("CSS/", "JS/", "md/", "favicon/", "guide/")
DENY_PARTS = ("__pycache__", ".DS_Store", ".pyc", "PATCH_FILES.txt")
DENY_SUFFIX = (".zip", ".pyc", ".tmp", ".bak", ".orig")


def semver(v):
    m = re.fullmatch(r"(\d+)\.(\d+)\.(\d+)", v or "")
    return tuple(int(x) for x in m.groups()) if m else None


def allowed(rel):
    if any(p in rel for p in DENY_PARTS) or rel.endswith(DENY_SUFFIX):
        return False
    if rel in ALLOW_TOP:
        return True
    if rel.startswith("md/tools/"):
        return rel.endswith(".py")  # 道具はpyだけ(出力の画像やjsonは入れない)
    return rel.startswith(ALLOW_DIRS)


def walk(root):
    out = []
    for d, _, fs in os.walk(root):
        for f in fs:
            rel = os.path.relpath(os.path.join(d, f), root).replace(os.sep, "/")
            out.append(rel)
    return sorted(out)


def release_files(root):
    return [r for r in walk(root) if allowed(r) and r != MANIFEST]


def sha(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        h.update(f.read())
    return h.hexdigest()


def read(root, rel):
    with open(os.path.join(root, rel), encoding="utf-8") as f:
        return f.read()


def cur_version(root):
    m = re.search(r'window\.QN_APP_VERSION\s*=\s*"([^"]+)"', read(root, "index.html"))
    return m.group(1) if m else None


def load_manifest(root):
    p = os.path.join(root, MANIFEST)
    if os.path.exists(p):
        with open(p, encoding="utf-8") as f:
            return json.load(f)
    return {"versions": {}}


def save_manifest(root, mf):
    vs = sorted(mf["versions"], key=semver)[-KEEP_VERSIONS:]
    mf["versions"] = {v: mf["versions"][v] for v in vs}
    with open(os.path.join(root, MANIFEST), "w", encoding="utf-8") as f:
        json.dump(mf, f, ensure_ascii=False, indent=1, sort_keys=True)
        f.write("\n")


def baseline(root, ver, since=None, allow_equal=False):
    mf = load_manifest(root)
    if since:
        if since not in mf["versions"]:
            return None, None
        return since, mf["versions"][since]
    older = [v for v in mf["versions"] if semver(v) and (semver(v) < semver(ver) or (allow_equal and v == ver))]
    if not older:
        return None, None
    b = max(older, key=semver)
    return b, mf["versions"][b]


def changed_files(root, base):
    """基準(ファイル名→ハッシュ)との差。(追加・変更, 削除)を返す"""
    now = {r: sha(os.path.join(root, r)) for r in release_files(root)}
    changed = [r for r, h in now.items() if base.get(r) != h]
    removed = [r for r in base if r not in now]
    return sorted(changed), sorted(removed)


# ---------------- check ----------------
def strip_css(t):
    t = re.sub(r"/\*.*?\*/", "", t, flags=re.S)
    return re.sub(r'"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'', "", t)


def check(root, quiet=False):
    ng, warn = [], []
    ver = cur_version(root)
    if not semver(ver):
        ng.append("index.html の QN_APP_VERSION が読めない/形式が x.y.z ではない: %r" % ver)
    # CHANGELOG
    try:
        cl = read(root, "md/CHANGELOG.md")
        vers = re.findall(r"^- (\d+\.\d+\.\d+)\b", cl, flags=re.M)
        if not vers:
            ng.append("CHANGELOG に「- x.y.z …」の行が無い")
        elif vers[-1] != ver:
            ng.append("CHANGELOG の最新行(%s)と index.html の版(%s)が違う" % (vers[-1], ver))
    except OSError:
        ng.append("md/CHANGELOG.md が読めない")
    files = walk(root)
    # JS構文
    node = shutil.which("node")
    if not node:
        warn.append("node が無いのでJS構文チェックを飛ばした")
    for r in [f for f in files if f.startswith("JS/") and f.endswith(".js")]:
        if r.endswith(".min.js"):
            continue
        src = read(root, r)
        is_mod = bool(re.search(r"^\s*(import|export)\s", src, flags=re.M))
        if node:
            tmp = tempfile.mkdtemp()
            p = os.path.join(tmp, "x.mjs" if is_mod else "x.js")
            with open(p, "w", encoding="utf-8") as f:
                f.write(src)
            res = subprocess.run([node, "--check", p], capture_output=True, text=True)
            shutil.rmtree(tmp, ignore_errors=True)
            if res.returncode != 0:
                msg = (res.stderr.strip().splitlines() or ["?"])
                ng.append("JS構文エラー %s: %s" % (r, " / ".join(msg[:4])[:240]))
    # CSS括弧
    for r in [f for f in files if f.startswith("CSS/") and f.endswith(".css")]:
        t = strip_css(read(root, r))
        if t.count("{") != t.count("}"):
            ng.append("CSSの{}の数が合わない %s ( { %d / } %d )" % (r, t.count("{"), t.count("}")))
    # HTML: id重複・参照ファイル
    for r in [f for f in files if f.endswith(".html")]:
        t = read(root, r)
        ids = re.findall(r'\sid="([^"]+)"', t)
        dup = sorted({i for i in ids if ids.count(i) > 1})
        if dup:
            ng.append("idが重複 %s: %s" % (r, ", ".join(dup[:8])))
    t = read(root, "index.html")
    for ref in re.findall(r'<script[^>]+src="([^"]+)"|<link[^>]+href="([^"]+)"', t):
        u = ref[0] or ref[1]
        if re.match(r"(https?:)?//|data:|#|mailto:", u):
            continue
        p = u.split("?")[0].split("#")[0]
        if p and not os.path.exists(os.path.join(root, p)):
            ng.append("index.html が参照するファイルが無い: %s" % u)
    # 許可リスト外
    stray = [f for f in files if not allowed(f) and f != MANIFEST and "__pycache__" not in f
             and not f.endswith(".pyc")]
    if stray:
        warn.append("許可リスト外のファイル(ZIPには入らない): " + ", ".join(stray[:10]) + (" ほか" if len(stray) > 10 else ""))
    # md更新の警告(基準から変わったファイルが対象)
    b, base = baseline(root, ver or "0.0.0", allow_equal=True)
    if base is not None:
        ch, _ = changed_files(root, base)
        docs = "".join(read(root, f) for f in files if f.startswith("md/") and f.endswith(".md"))
        miss_ids, miss_keys = set(), set()
        for r in ch:
            if r.endswith(".html") and r == "index.html":
                for i in re.findall(r'\sid="([^"]+)"', read(root, r)):
                    if i not in docs:
                        miss_ids.add(i)
            if r.startswith("JS/") and r.endswith(".js"):
                for k in re.findall(r"(?:get|set|remove)Item\(\s*['\"]([\w.:-]+)['\"]", read(root, r)):
                    if k not in docs:
                        miss_keys.add(k)
        if miss_keys:
            warn.append("mdに載っていないlocalStorageキー: " + ", ".join(sorted(miss_keys)[:10]))
        # index.htmlのidは数が多いので、基準に無かったidだけ警告する
        # (基準側の中身は持っていないので、変更時のみ参考表示)
        if miss_ids and len(miss_ids) <= 12:
            warn.append("mdに載っていないid(要確認): " + ", ".join(sorted(miss_ids)))
    if not quiet:
        print("== check  版 %s ==" % ver)
        for w in warn:
            print("  [警告]", w)
        for n in ng:
            print("  [NG]  ", n)
        print("  結果: %s" % ("OK" if not ng else "NG %d件" % len(ng)))
    return not ng


# ---------------- bump / record / zip ----------------
def bump(root, new, line):
    old = cur_version(root)
    if not semver(new):
        sys.exit("版は x.y.z の形で指定してください: %r" % new)
    if not (semver(new) > semver(old)):
        sys.exit("新しい版(%s)が現在の版(%s)より大きくありません" % (new, old))
    if not line.strip():
        sys.exit("CHANGELOGに書く一言が空です")
    p = os.path.join(root, "index.html")
    t = read(root, "index.html")
    t2 = re.sub(r'(window\.QN_APP_VERSION\s*=\s*")[^"]+(")', r"\g<1>%s\g<2>" % new, t, count=1)
    cp = os.path.join(root, "md/CHANGELOG.md")
    cl = read(root, "md/CHANGELOG.md")
    if re.search(r"^- %s\b" % re.escape(new), cl, flags=re.M):
        sys.exit("CHANGELOGに %s の行が既にあります" % new)
    with open(p, "w", encoding="utf-8") as f:
        f.write(t2)
    with open(cp, "w", encoding="utf-8") as f:
        f.write(cl.rstrip("\n") + "\n- %s %s\n" % (new, line.strip()))
    print("版を %s → %s に更新し、CHANGELOGに追記した" % (old, new))


def record(root):
    ver = cur_version(root)
    mf = load_manifest(root)
    mf["versions"][ver] = {r: sha(os.path.join(root, r)) for r in release_files(root)}
    save_manifest(root, mf)
    print("版 %s を基準として記録した(%d ファイル) → %s" % (ver, len(mf["versions"][ver]), MANIFEST))


def make_zip(path, root, rels):
    if os.path.exists(path):
        os.remove(path)
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        for r in rels:
            z.write(os.path.join(root, r), r)
    # 納品ルールの最終確認
    with zipfile.ZipFile(path) as z:
        names = z.namelist()
    bad = [n for n in names if n.endswith("/") or "PATCH_FILES" in n or "__pycache__" in n]
    if bad:
        os.remove(path)
        sys.exit("ZIPの中身がルール違反: %s" % bad)
    return names


def do_zip(root, out, since=None, save_record=False):
    ver = cur_version(root)
    b, base = baseline(root, ver, since)
    if base is None:
        sys.exit("基準が無い(現在の版より前の記録が無い)。bump前なら先に版を上げる。記録が空なら、渡した版の状態で  release.py record  を実行")
    ch, removed = changed_files(root, base)
    ch = [c for c in ch if c != MANIFEST]
    if not ch:
        sys.exit("基準(%s)から変わったファイルが無い" % b)
    if ver == b:
        sys.exit("版が基準(%s)と同じ。bump してから" % b)
    if "index.html" not in ch or "md/CHANGELOG.md" not in ch:
        print("  [警告] index.html か CHANGELOG.md が変更に含まれていない")
    if save_record:
        record(root)
    rels = ch + ([MANIFEST] if os.path.exists(os.path.join(root, MANIFEST)) else [])
    path = os.path.join(out, "QNPLAYER_v%s_patch.zip" % ver)
    names = make_zip(path, root, rels)
    print("パッチZIP: %s  (基準 %s から %d ファイル)" % (path, b, len(names)))
    for n in names:
        print("   ", n)
    if removed:
        print("  [注意] 基準にあって今は無いファイル(ZIPでは消せない。手で削除): " + ", ".join(removed))
    return path


def do_full(root, out):
    ver = cur_version(root)
    rels = release_files(root) + ([MANIFEST] if os.path.exists(os.path.join(root, MANIFEST)) else [])
    path = os.path.join(out, "QNPLAYER_v%s.zip" % ver)
    names = make_zip(path, root, sorted(rels))
    print("完全版ZIP: %s  (%d ファイル)" % (path, len(names)))
    return path


# ---------------- status ----------------
def funcs(text):
    s = set(re.findall(r"function\s+([A-Za-z_$][\w$]*)\s*\(", text))
    s |= set(re.findall(r"(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>)", text))
    return s


def status(root, since, base_dir):
    ver = cur_version(root)
    b, base = baseline(root, ver, since, allow_equal=True)
    print("現在の版: %s / CHANGELOG最新: %s" % (ver, (re.findall(r"^- (\d+\.\d+\.\d+)\b", read(root, "md/CHANGELOG.md"), flags=re.M) or ["-"])[-1]))
    if base is None:
        print("基準の記録が無い(release.py record で登録)")
        return
    ch, removed = changed_files(root, base)
    ch = [c for c in ch if c != MANIFEST]
    print("基準 %s からの変更: %d ファイル" % (b, len(ch)))
    for c in ch:
        print("   変更/追加", c)
    for r in removed:
        print("   削除     ", r)
    if base_dir and os.path.isdir(base_dir):
        print("関数名の増減(比較元 %s):" % base_dir)
        for c in ch:
            if not c.endswith(".js"):
                continue
            new = funcs(read(root, c))
            old = funcs(open(os.path.join(base_dir, c), encoding="utf-8").read()) if os.path.exists(os.path.join(base_dir, c)) else set()
            add, rem = sorted(new - old), sorted(old - new)
            if add or rem:
                print("   %s  +%s  -%s" % (c, add, rem))


def main():
    ap = argparse.ArgumentParser(description="QNPLAYER リリース用スクリプト")
    ap.add_argument("cmd", choices=["status", "check", "bump", "zip", "full", "ship", "record"])
    ap.add_argument("args", nargs="*")
    ap.add_argument("--root", default=os.getcwd())
    ap.add_argument("--out")
    ap.add_argument("--since")
    ap.add_argument("--base")
    a = ap.parse_args()
    root = os.path.abspath(a.root)
    if not os.path.exists(os.path.join(root, "index.html")):
        sys.exit("index.html が見つからない。プロジェクトのルートで実行するか --root を指定してください")
    out = os.path.abspath(a.out) if a.out else os.path.dirname(root)
    os.makedirs(out, exist_ok=True)
    if a.cmd == "status":
        bd = a.base or (root.rstrip("/") + "_base")
        status(root, a.since, bd)
    elif a.cmd == "check":
        sys.exit(0 if check(root) else 1)
    elif a.cmd == "record":
        record(root)
    elif a.cmd == "bump":
        if len(a.args) != 2:
            sys.exit('使い方: bump <版> "<一言>"')
        bump(root, a.args[0], a.args[1])
    elif a.cmd == "zip":
        if not check(root):
            sys.exit(1)
        do_zip(root, out, a.since)
    elif a.cmd == "full":
        if not check(root):
            sys.exit(1)
        do_full(root, out)
    elif a.cmd == "ship":
        if len(a.args) != 2:
            sys.exit('使い方: ship <版> "<一言>"')
        ver0 = cur_version(root)
        b, base = baseline(root, a.args[0], a.since)
        if base is None:
            # 現在の版の記録があれば、それより前の基準を探す。無ければ先に止める
            sys.exit("基準が無い。渡した版の状態で  release.py record  を先に実行してください")
        bump(root, a.args[0], a.args[1])
        if not check(root):
            print("checkがNGなので記録・ZIP作成は行わない。直してから  release.py zip  を実行してください(版上げ済み)")
            sys.exit(1)
        do_zip(root, out, a.since, save_record=True)


if __name__ == "__main__":
    main()
