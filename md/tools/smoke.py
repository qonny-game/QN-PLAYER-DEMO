# smoke.py — 曲追加・フォルダ作成・パネル切替・アプリ切替(tuner/pitch/youtube/player)でページエラーが出ないか（PC 1280/1920、SP 390/360）
# 使い方: python3 -I md/tools/smoke.py <ルート>      0件なら合格(終了コード0)。外部通信は遮断しているのでYouTubeは画面が開くかまで
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qnbrowser import QNBrowser

args = [a for a in sys.argv[1:] if not a.startswith("--")]
root = args[0] if args else "."
only = None
for a in sys.argv[1:]:
    if a.startswith("--only="):
        only = a.split("=", 1)[1].split(",")   # 例: --only=PC,SP-S （並列実行用）
bad = 0
with QNBrowser(root) as qb:
    for name, (w, h) in {"PC": (1280, 800), "PC-L": (1920, 1080), "SP": (390, 844), "SP-S": (360, 740)}.items():
        if only and name not in only:
            continue
        pg = qb.new_page(width=w, height=h)
        qb.goto(pg)
        qb.add_track(pg)
        rows = pg.evaluate("()=>document.querySelectorAll('#playlistBox .playlistItem').length")
        try:
            pg.evaluate("()=>addPlaylistFolderInteractive()")
        except Exception as e:
            print(name, "フォルダ作成に失敗:", str(e)[:80]); bad += 1
        pg.wait_for_timeout(400)
        folders = pg.evaluate("()=>document.querySelectorAll('#playlistBox .playlistFolderHeader').length")
        missed = []
        for lab in qb.icon_labels(pg):
            if not lab:
                continue
            try:
                qb.open_panel(pg, lab, wait_ms=300)
            except Exception:
                missed.append(lab)
        apps = []
        for app in ("tuner", "pitch", "youtube", "player"):
            try:
                qb.open_app(pg, app, wait_ms=700)
            except Exception as e:
                apps.append(app)
        errs = qb.errors(pg)
        ok = rows == 1 and folders >= 1 and not errs and not apps
        print("%s: 曲%d 行 / フォルダ%d / パネル押せず%s / アプリ失敗%s / エラー%d件 -> %s" % (name, rows, folders, missed or "なし", apps or "なし", len(errs), "OK" if ok else "NG"))
        for e in errs[:5]:
            print("   ", e)
        bad += 0 if ok else 1
sys.exit(1 if bad else 0)
