# e2e_tab_sources.py — Tabのソース切替(Bass/Guitar/Vocals)の通し確認。合成した分離結果をStemのキャッシュ(IndexedDB qn_stem_db)へ入れ、
# 未分離のメッセージ → 解析 → 結果(ベースは4弦TAB、ヴォーカルは五線紙)を見る。使い方(ルートで): python3 -I md/tools/e2e_tab_sources.py [bass vocals guitar mix]
# 注意: 合成音なので音程の確認用。実際の分離音の精度は実機・実曲で見る。スクショは/tmp/qnshots/tabsrc_<ソース>.png
import sys, os, struct, math, base64, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qnbrowser import QNBrowser
SR = 44100
def wav(notes, total, harm):
    n = int(total * SR); buf = [0.0] * n
    for f, t0, d in notes:
        for i in range(int(t0 * SR), min(n, int((t0 + d) * SR))):
            tt = i / SR; env = min(1, (tt - t0) * 40) * min(1, (t0 + d - tt) * 20)
            buf[i] += env * sum(a * math.sin(2 * math.pi * f * (k + 1) * tt) for k, a in enumerate(harm)) * 0.3
    pcm = b"".join(struct.pack("<hh", int(max(-1, min(1, v)) * 32000), int(max(-1, min(1, v)) * 32000)) for v in buf)
    hdr = b"RIFF" + struct.pack("<I", 36 + len(pcm)) + b"WAVEfmt " + struct.pack("<IHHIIHH", 16, 1, 2, SR, SR * 4, 4, 16) + b"data" + struct.pack("<I", len(pcm))
    return base64.b64encode(hdr + pcm).decode()
bass = [(41.2, 0.2, 0.8), (55.0, 1.2, 0.8), (49.0, 2.2, 0.8), (73.4, 3.2, 0.8)]            # E1 A1 G1 D2
voc = [(220.0, 0.3, 0.6), (246.9, 1.0, 0.6), (261.6, 1.7, 0.6), (293.7, 2.4, 0.6), (277.2, 3.1, 0.6)]  # A3 B3 C4 D4 C#4
B64 = {"bass": wav(bass, 4.5, [1, .5, .25]), "vocals": wav(voc, 4.5, [1, .4, .2]), "guitar": wav(voc, 4.5, [1, .4, .2]), "drums": wav([], 4.5, [1]), "other": wav([], 4.5, [1])}
wp = os.path.join(tempfile.mkdtemp(), "tabsrc_test.wav")
open(wp, "wb").write(base64.b64decode(B64["vocals"]))
os.makedirs("/tmp/qnshots", exist_ok=True)
which = sys.argv[1:] or ["bass", "vocals"]
with QNBrowser(".") as qb:
    pg = qb.new_page(width=1280, height=800)
    qb.goto(pg); qb.add_track(pg, wp); qb.open_panel(pg, "Tab"); pg.wait_for_timeout(1500)
    # 分離結果がまだ無い状態でBassを解析 -> メッセージ
    pg.evaluate("QNTab.state.src='mix'")
    # ステッパーを実際にクリックして切り替える(Mix->Bass)
    pg.locator(".qn-tab .qn-stepper-btn[data-d='1']").first.click(); pg.wait_for_timeout(400)
    print("src after click:", pg.evaluate("QNTab.state.src"))
    pg.click("text=Analyze"); pg.wait_for_timeout(2500)
    print("no-stem msg:", pg.evaluate("QNTab.state.msg"))
    # 分離結果をキャッシュへ入れる
    pg.evaluate("""async (B64) => {
      const tr = playlist[currentPlaylistIndex]; const key = tr.file.name + '|' + tr.file.size + '|6';
      const stems = {}; for (const k in B64) { const bin = atob(B64[k]); const u = new Uint8Array(bin.length); for (let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); stems[k] = new Blob([u], {type:'audio/wav'}); }
      await new Promise((res, rej) => { const r = indexedDB.open('qn_stem_db', 1); r.onupgradeneeded = () => r.result.createObjectStore('stems', {keyPath:'key'});
        r.onsuccess = () => { const tx = r.result.transaction('stems','readwrite'); tx.objectStore('stems').put({key, name: tr.name, ts: Date.now(), stems}); tx.oncomplete = res; tx.onerror = rej; }; });
    }""", B64)
    for src in which:
        idx = {"mix": 0, "bass": 1, "guitar": 2, "vocals": 3}[src]
        cur = pg.evaluate("['mix','bass','guitar','vocals'].indexOf(QNTab.state.src)")
        btn = pg.locator(".qn-tab .qn-stepper-btn[data-d='%d']" % (1 if idx > cur else -1)).first
        for _ in range(abs(idx - cur)): btn.click(); pg.wait_for_timeout(200)
        pg.wait_for_timeout(500)
        print("== source", pg.evaluate("QNTab.state.src"), "phase", pg.evaluate("QNTab.state.phase"))
        if pg.evaluate("QNTab.state.phase") != "ready":
            pg.click("text=Analyze")
            for i in range(150):
                pg.wait_for_timeout(1000)
                if pg.evaluate("QNTab.state.phase") in ("ready", "error"): break
        print("phase", pg.evaluate("QNTab.state.phase"), pg.evaluate("QNTab.state.msg"))
        print("notes:", pg.evaluate("(QNTab.state.rec?QNTab.state.rec.notes:[]).map(n=>[n.midi,n.string,n.fret,+n.t.toFixed(2),+n.d.toFixed(2)].join(':')).join(' ')"))
        pg.evaluate("audio.currentTime=1.3"); pg.wait_for_timeout(800)
        pg.screenshot(path="/tmp/qnshots/tabsrc_%s.png" % src)
    print("errors", qb.errors(pg))
