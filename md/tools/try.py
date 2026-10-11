# try.py — 画面の動作確認を1コマンドで。その場でスクリプトを書かなくて済む(トークン節約)。
# 使い方: python3 -I md/tools/try.py [--root .] [--size pc|pcl|sp|sps ...] [--app tuner|pitch|youtube|player] [--mic] [--lang en|ja]
#          [--track] [--panel "Sensitivity"] [--click "css"]... [--mic-set tone=0.001,noise=0.002,freq=110] [--wait 1500]
#          [--eval "js式"]... [--store key=val]... [--shot 名前]
# 出力: eval結果・ページエラー・スクショの場所(/tmp/qnshots/<名前>_<size>.png)。複数sizeを渡すと全部で実行する。
# 例: TUNERを開いてMICの自動ONと音名を見る →
#   python3 -I md/tools/try.py --app tuner --mic --size pc sp --eval "document.querySelector('[data-d=note]').textContent" --shot tn
import argparse, os, shutil, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qnbrowser import QNBrowser

SIZES = {"pc": (1280, 800), "pcl": (1920, 1080), "sp": (390, 844), "sps": (360, 740)}
ap = argparse.ArgumentParser()
ap.add_argument("--root", default=".")
ap.add_argument("--size", nargs="+", default=["pc"])
ap.add_argument("--app")
ap.add_argument("--mic", action="store_true")
ap.add_argument("--lang")
ap.add_argument("--track", action="store_true")
ap.add_argument("--panel")
ap.add_argument("--click", action="append", default=[])
ap.add_argument("--mic-set")
ap.add_argument("--wait", type=int, default=1500)
ap.add_argument("--eval", action="append", default=[])
ap.add_argument("--store", action="append", default=[])
ap.add_argument("--shot")
a = ap.parse_args()

os.makedirs("/tmp/qnshots", exist_ok=True)
bad = 0
with QNBrowser(a.root) as qb:
    for sz in a.size:
        w, h = SIZES[sz]
        store = dict(s.split("=", 1) for s in a.store)
        pg = qb.new_page(width=w, height=h, lang=a.lang, mic=a.mic, storage=store)
        qb.goto(pg)
        if a.track:
            qb.add_track(pg)
        if a.app:
            qb.open_app(pg, a.app, wait_ms=a.wait)
        if a.panel:
            qb.open_panel(pg, a.panel)
        for sel in a.click:
            pg.click(sel)
            pg.wait_for_timeout(400)
        if a.mic_set:
            kw = {k: float(v) for k, v in (p.split("=") for p in a.mic_set.split(","))}
            qb.mic(pg, **kw)
        pg.wait_for_timeout(300)
        for js in a.eval:
            try:
                print("[%s] %s => %s" % (sz, js[:60], pg.evaluate(js if js.lstrip().startswith("(") or "return" in js else "()=>" + js)))
            except Exception as e:
                print("[%s] %s => ERROR %s" % (sz, js[:60], str(e)[:120])); bad += 1
        errs = qb.errors(pg)
        print("[%s] ページエラー %d件" % (sz, len(errs)), *errs[:3])
        bad += len(errs)
        if a.shot:
            p = qb.shot(pg, "%s_%s" % (a.shot, sz))
            dst = "/tmp/qnshots/%s_%s.png" % (a.shot, sz)
            shutil.copy(p, dst)
            print("[%s] スクショ: %s" % (sz, dst))
sys.exit(1 if bad else 0)
