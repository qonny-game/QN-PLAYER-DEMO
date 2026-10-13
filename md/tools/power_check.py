# power_check.py — 省電力の計測。場面ごとに「毎秒いくつコールバックが動くか(rAF/setInterval/setTimeout。登録元のファイル:行ごと)」と
# Chromeの処理量(CDP Performance: 処理時間・スクリプト時間・レイアウト/スタイル再計算の回数)を出す。電池の消費は直接測れないので、
# 「何もしていないのに動き続ける処理」を見つけて減らすための指標。実機の電池・発熱の確認は別(QUICK_STARTの「要判断」)。
# 使い方(ルートで): python3 -I md/tools/power_check.py [--root .] [--secs 5] [--size 390 844] [--only paused playing ...] [--top 8] [--json out.json]
# 場面: paused(曲を読み込んだだけ) / playing(再生中) / hidden(再生中にdocument.hiddenを真にする=バックグラウンドの想定) /
#       panel-<名前>(パネルを開いて停止) / app-tuner / app-pitch / tab-ready(Tabの結果を表示して再生)
# 注意: ヘッドレスChromiumではGPU描画・実音声出力・OSの電力制御は再現されない。回数と処理時間の「相対比較」に使う(前後でこのツールを2回回して比べる)。
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qnbrowser import QNBrowser

# 呼び出し元(JS/xxx.js:行)ごとにコールバックの実行回数を数える。登録時のスタックから元を決める
INSTRUMENT = r"""
(() => {
  const counts = {}; window.__pw = counts;
  const where = () => {
    const st = (new Error().stack || "").split("\n").slice(3);
    for (const l of st) { const m = l.match(/\/((?:JS|CSS)\/[\w.\-]+\.js):(\d+)/) || l.match(/\/(index\.html):(\d+)/); if (m) return m[1] + ":" + m[2]; }
    return "(other)";
  };
  const wrap = (kind, name) => {
    const orig = window[name];
    window[name] = function (cb, ...a) {
      if (typeof cb !== "function") return orig.call(this, cb, ...a);
      const key = kind + " " + where();
      const w = function (...x) { counts[key] = (counts[key] || 0) + 1; return cb.apply(this, x); };
      return orig.call(this, w, ...a);
    };
  };
  wrap("rAF", "requestAnimationFrame"); wrap("interval", "setInterval"); wrap("timeout", "setTimeout");
})();
"""
HIDE = "Object.defineProperty(document,'hidden',{get:()=>true,configurable:true});Object.defineProperty(document,'visibilityState',{get:()=>'hidden',configurable:true});document.dispatchEvent(new Event('visibilitychange'));"
SHOW = "delete document.hidden;delete document.visibilityState;document.dispatchEvent(new Event('visibilitychange'));"
KEYS = ["TaskDuration", "ScriptDuration", "LayoutCount", "RecalcStyleCount", "LayoutDuration", "RecalcStyleDuration"]


def metrics(cdp):
    return {m["name"]: m["value"] for m in cdp.send("Performance.getMetrics")["metrics"]}


def measure(pg, cdp, secs):
    pg.evaluate("for (const k in window.__pw) delete window.__pw[k]")
    a = metrics(cdp)
    pg.wait_for_timeout(int(secs * 1000))
    b = metrics(cdp)
    counts = pg.evaluate("window.__pw")
    d = {k: (b.get(k, 0) - a.get(k, 0)) / secs for k in KEYS}
    return {"cpu_pct": d["TaskDuration"] * 100, "script_pct": d["ScriptDuration"] * 100,
            "layout_per_s": d["LayoutCount"], "style_per_s": d["RecalcStyleCount"],
            "calls": {k: v / secs for k, v in counts.items()}}


def show(name, r, top):
    cs = sorted(r["calls"].items(), key=lambda kv: -kv[1])
    total = sum(v for _, v in cs)
    print("%-16s CPU %5.1f%%  script %5.1f%%  layout %5.1f/s  style %5.1f/s  callbacks %6.1f/s" % (
        name, r["cpu_pct"], r["script_pct"], r["layout_per_s"], r["style_per_s"], total))
    for k, v in cs[:top]:
        print("    %6.1f/s  %s" % (v, k))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=".")
    ap.add_argument("--secs", type=float, default=5)
    ap.add_argument("--size", nargs=2, type=int, default=[390, 844])
    ap.add_argument("--only", nargs="*")
    ap.add_argument("--top", type=int, default=8)
    ap.add_argument("--json")
    a = ap.parse_args()
    out = {}
    with QNBrowser(a.root) as qb:
        pg = qb.new_page(width=a.size[0], height=a.size[1], init_script=INSTRUMENT)
        cdp = pg.context.new_cdp_session(pg)
        cdp.send("Performance.enable")
        qb.goto(pg)
        qb.add_track(pg)
        want = lambda n: not a.only or n in a.only

        def run(name, setup=None, teardown=None):
            if not want(name):
                return
            if setup:
                setup()
            pg.wait_for_timeout(800)
            out[name] = measure(pg, cdp, a.secs)
            show(name, out[name], a.top)
            if teardown:
                teardown()

        pg.evaluate("audio.pause()")
        run("paused")
        run("playing", lambda: pg.evaluate("audio.play()"), None)
        run("hidden", lambda: pg.evaluate(HIDE), lambda: pg.evaluate(SHOW))
        pg.evaluate("audio.pause()")
        for label in ("Library", "Markers", "Text", "Chords", "Control", "Stem", "Rec", "Tab", "Settings"):
            n = "panel-" + label.lower()
            if want(n):
                def op(l=label):
                    try:
                        qb.open_panel(pg, l, 600)
                    except Exception as e:
                        print("  (パネル %s を開けず: %s)" % (l, str(e)[:60]))
                def cl(l=label):
                    try:
                        qb.open_panel(pg, l, 300)
                    except Exception:
                        pass
                run(n, op, cl)
        for app in ("tuner", "pitch"):
            if want("app-" + app):
                run("app-" + app, lambda ap_=app: qb.open_app(pg, ap_), lambda: qb.open_app(pg, "player"))
        print("エラー:", qb.errors(pg))
    if a.json:
        with open(a.json, "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
