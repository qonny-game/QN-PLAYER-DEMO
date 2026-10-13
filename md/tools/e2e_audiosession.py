# e2e_audiosession.py — iOSのaudioSession衝突の再現確認。navigator.audioSessionを擬似し、type="playback"のままgetUserMediaすると
# iOSと同じInvalidStateErrorにする。TUNER開始中は"play-and-record"、停止後は"playback"に戻ることを見る。実機iOSの代わりにはならない。
# 使い方(ルートで): python3 -I md/tools/e2e_audiosession.py
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qnbrowser import QNBrowser

FAKE = r"""
(() => {
  const as = { type: "playback" }; window.__as = as;
  Object.defineProperty(navigator, "audioSession", { value: as, configurable: true });
  const wrap = () => {
    const md = navigator.mediaDevices; if (!md || md.__w) return;
    const orig = md.getUserMedia.bind(md); md.__w = 1;
    md.getUserMedia = function (c) {
      if (as.type === "playback") { const e = new Error("AudioSession category is not compatible with audio capture."); e.name = "InvalidStateError"; return Promise.reject(e); }
      window.__asAtGum = as.type; return orig(c);
    };
  };
  wrap(); document.addEventListener("DOMContentLoaded", wrap);
})();
"""
ok = True
def check(name, cond, info=""):
    global ok
    print(("OK  " if cond else "NG  ") + name, info)
    ok = ok and cond

with QNBrowser(".") as qb:
    pg = qb.new_page(width=390, height=844, mic=True, init_script=FAKE)
    qb.goto(pg)
    check("起動時はplayback", pg.evaluate("__as.type") == "playback")
    qb.open_app(pg, "tuner", 2000)
    check("TUNER開始中はplay-and-record", pg.evaluate("__as.type") == "play-and-record", pg.evaluate("__as.type"))
    check("getUserMedia時点でplay-and-record", pg.evaluate("window.__asAtGum") == "play-and-record")
    qb.open_app(pg, "player", 1000)
    check("TUNER離脱後はplaybackへ戻る", pg.evaluate("__as.type") == "playback", pg.evaluate("__as.type"))
    qb.open_app(pg, "pitch", 1500)
    pg.evaluate("document.querySelector('[data-pt=recBtn]').click()")
    pg.wait_for_timeout(1500)
    check("PITCH開始中はplay-and-record", pg.evaluate("__as.type") == "play-and-record", pg.evaluate("__as.type"))
    qb.open_app(pg, "player", 1000)
    check("PITCH離脱後はplaybackへ戻る", pg.evaluate("__as.type") == "playback", pg.evaluate("__as.type"))
    errs = qb.errors(pg)
    check("ページエラーなし", not errs, errs)
sys.exit(0 if ok else 1)
