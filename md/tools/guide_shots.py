# ガイド用スクリーンショットの撮影(guide/img/*.webp)。使い方: python3 -I md/tools/guide_shots.py <ルート> [出力フォルダ] [名前...]
# サンプル曲3つ(Sample Song/Practice Riff/Warm Up)とマーカー5つ(Intro〜Outro)を作り、日本語表示・2倍解像度で撮る。番号バッジはDOMへ重ねて撮る
import os, sys, math, struct, wave, io, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qnbrowser import QNBrowser

OUT_DEFAULT = None
MARKERS = [(14.0, "Intro", "emerald"), (34.0, "Verse", "sky"), (50.0, "Chorus", "red"), (68.0, "Bridge", "lime"), (82.0, "Outro", "indigo")]
TRACKS = [("Sample Song.mp3", "Sample Song", 96, "Band"), ("Practice Riff.mp3", "Practice Riff", 64, "Band"), ("Warm Up.mp3", "Warm Up", 48, None)]

def demo_wav(sec, bpm=120):
    rate = 22050; n = rate * sec; spb = 60.0 / bpm
    buf = io.BytesIO(); w = wave.open(buf, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate)
    out = bytearray()
    for i in range(n):
        t = i / rate; ph = (t % spb)
        sec_gain = 0.55 + 0.4 * math.sin(t / 9.0) ** 2
        env = math.exp(-ph * 7.0)
        v = math.sin(2 * math.pi * (70 + 40 * env) * ph) * env + 0.25 * math.sin(2 * math.pi * 220 * t) * math.exp(-ph * 3)
        out += struct.pack("<h", int(max(-1, min(1, v * sec_gain * 0.8)) * 30000))
    w.writeframes(bytes(out)); w.close()
    return buf.getvalue()

BADGE_JS = """(items)=>{
  document.querySelectorAll('.qn-shot-badge').forEach(e=>e.remove());
  items.forEach(([n,x,y])=>{const d=document.createElement('div');d.className='qn-shot-badge';d.textContent=n;
    d.style.cssText='position:fixed;z-index:99999;width:24px;height:24px;border-radius:50%;background:#f5a623;color:#111;font:700 13px/24px sans-serif;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.5);left:'+(x-12)+'px;top:'+(y-12)+'px;pointer-events:none';
    document.body.appendChild(d);});}"""

def setup(qb, pg):
    qb.goto(pg, wait_ms=1500)
    files = [{"name": n, "mimeType": "audio/wav", "buffer": demo_wav(s)} for n, _, s, _ in TRACKS]
    pg.set_input_files("#fileInput", files)
    pg.wait_for_timeout(4000)
    pg.evaluate("""(tr)=>{
      const f=createPlaylistFolder('Band');
      playlist.forEach(t=>{const m=tr.find(x=>x[0]===t.name); if(!m) return; t.title=m[1]; t.artist='QN Demo'; if(m[3]) t.folder=f.id; savePlaylistMetadataFor(t);});
      if (typeof normalizePlaylistGrouping==='function') normalizePlaylistGrouping();
      renderPlaylist();
    }""", [list(t) for t in TRACKS])
    pg.wait_for_timeout(500)
    # Sample Songを選ぶ
    pg.evaluate("()=>{const i=playlist.findIndex(t=>t.name==='Sample Song.mp3'); if(i>=0) loadFile(playlist[i].file)}")
    pg.wait_for_timeout(2500)
    pg.evaluate("""(mk)=>{pins.length=0; mk.forEach(m=>pins.push({t:m[0],enabled:true,memo:m[1],color:m[2]})); savePins(); renderPins(); renderSegments(); renderPinList();
      QNBars.setSec(15); QNBars.setRows(0); QNBars.setFollow(false);}""", [list(m) for m in MARKERS])
    pg.evaluate("()=>{audio.pause(); audio.currentTime=40;}")
    pg.wait_for_timeout(800)

def rect(pg, sel):
    return pg.evaluate("(s)=>{const e=document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}}", sel)

def main():
    root = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(root, "guide", "img")
    want = set(sys.argv[3:])
    os.makedirs(out, exist_ok=True)
    tmp = out.rstrip("/") + "_png"
    os.makedirs(tmp, exist_ok=True)
    def save(pg, name, clip=None):
        if want and name not in want: return
        p = os.path.join(tmp, name + ".png")
        if clip:
            clip = {"x": clip["x"], "y": clip["y"], "width": clip.get("w", clip.get("width")), "height": clip.get("h", clip.get("height"))}
        pg.screenshot(path=p, clip=clip)
        from PIL import Image
        Image.open(p).convert("RGB").save(os.path.join(out, name + ".webp"), "WEBP", quality=88)
    with QNBrowser(root) as qb:
        # ---- PC ----
        pg = qb.new_page(width=1440, height=860, lang="ja", dpr=1.5)
        setup(qb, pg)
        pg.evaluate("()=>{QNBars.setRows(5); QNBars.setSec(15); QNBars.setFollow(false); if(window.qnBarStripSync) window.qnBarStripSync();}"); pg.wait_for_timeout(500)  # Library panel is open by default (a click would close it)
        panel = lambda: rect(pg, "#pcV2Panel")
        pr = panel()
        r = lambda s: rect(pg, s)
        logo = r("#qnAppLogoBtn"); ver = r("#appVersion"); login = r("#authContainer")
        head = r("#pcV2HeadRow"); wave = r("#vbarContainer"); strip = r(".qn-wave-bar-strip"); bot = r("#pcV2BottomBar"); mix = r("#pcV2BarMixer")
        ib = r("#pcV2IconBar")
        badges = [(1, ver["x"] + ver["w"] + 16, ver["y"] + ver["h"] / 2), (2, login["x"] - 16, login["y"] + login["h"] / 2),
                  (3, ib["x"] + ib["w"] - 10, ib["y"] + 30), (4, pr["x"] + pr["w"] - 22, pr["y"] + 70)]
        if head: badges.append((5, head["x"] + 2, head["y"] + 4))
        if wave: badges.append((6, wave["x"] + 14, wave["y"] + 24))
        if head: badges.append((7, head["x"] + head["w"] - 250, head["y"] + 10))
        if strip: badges.append((8, strip["x"] - 12, strip["y"] + strip["h"] / 2))
        if bot: badges.append((9, bot["x"] + 6, bot["y"] + 6))
        if mix: badges.append((10, mix["x"] - 20, mix["y"] + 14))
        pg.evaluate(BADGE_JS, [list(b) for b in badges]); save(pg, "pc-overview"); pg.evaluate("()=>document.querySelectorAll('.qn-shot-badge').forEach(e=>e.remove())")
        save(pg, "pc-library", clip=pr)
        # Library Edit
        pg.click("#pcV2PlaylistEditBtn"); pg.wait_for_timeout(500)
        save(pg, "pc-library-edit", clip=panel())
        pg.click("#pcV2PlaylistCancelBtn"); pg.wait_for_timeout(300)
        # Markers
        pg.click('#pcV2IconBar [data-panel-id="markers"]'); pg.wait_for_timeout(500)
        save(pg, "pc-markers", clip=panel())
        pg.click("#pcV2MarkersEditBtn"); pg.wait_for_timeout(500)
        save(pg, "pc-markers-edit", clip=panel())
        pg.click("#pcV2MarkersCancelBtn"); pg.wait_for_timeout(300)
        # Control / Text
        pg.click('#pcV2IconBar [data-panel-id="control"]'); pg.wait_for_timeout(600); save(pg, "pc-control", clip=panel())
        pg.click('#pcV2IconBar [data-panel-id="text"]'); pg.wait_for_timeout(500); save(pg, "pc-text", clip=panel())
        # Settings
        pg.click('#pcV2IconBar [data-panel-id="settings"]'); pg.wait_for_timeout(500); save(pg, "pc-settings-bottom", clip=panel())
        pg.click('#pcV2PanelBody [data-panel-id="general"]'); pg.wait_for_timeout(500); save(pg, "pc-settings", clip=panel())
        pg.click("#pcV2PanelHeader .pcv2-panel-back"); pg.wait_for_timeout(300)
        pg.click('#pcV2PanelBody [data-panel-id="backup"]'); pg.wait_for_timeout(700); save(pg, "pc-backup", clip=panel())
        pg.click("#pcV2PanelHeader .pcv2-panel-back"); pg.wait_for_timeout(300)
        pg.click('#pcV2PanelBody [data-panel-id="import"]'); pg.wait_for_timeout(700); save(pg, "pc-import", clip=panel())
        # Chords panel
        pg.click('#pcV2IconBar [data-panel-id="chords"]'); pg.wait_for_timeout(700); save(pg, "pc-chords", clip=panel())
        pg.click('#pcV2IconBar [data-panel-id="playlist"]'); pg.wait_for_timeout(400)
        # flyout
        pg.click("#qnAppLogoBtn"); pg.wait_for_timeout(500); save(pg, "pc-flyout"); pg.keyboard.press("Escape"); pg.mouse.click(600, 400); pg.wait_for_timeout(300)
        # seekpop / markerpop
        info = pg.evaluate("""()=>{const rows=[...document.querySelectorAll('#vbarRows .vbar')]; return rows.slice(0,6).map(r=>{const b=r.getBoundingClientRect(); return [r.dataset.row,b.x,b.y,b.width,b.height]})}""")
        row = [x for x in info if x[0] == "1"][0] if info else None
        if row:
            pg.mouse.click(row[1] + row[3] * 0.45, row[2] + row[4] / 2); pg.wait_for_timeout(500)
            save(pg, "pc-seekpop")
            pg.keyboard.press("Escape"); pg.mouse.click(300, 600); pg.wait_for_timeout(300)
        # marker popup (tap a marker line)
        pos = pg.evaluate("""()=>{const t=34, r=QNBars.rowOf(t), el=QNBars.rowEl(r), b=el.getBoundingClientRect(); return [b.x+b.width*QNBars.pctInRow(t)/100, b.y+b.height/2]}""")
        pg.evaluate("()=>{audio.pause(); audio.currentTime=40;}")
        pg.evaluate("([x])=>{showPinPopup(34, QNBars.rowEl(QNBars.rowOf(34)), x, pins[1]);}", [pos[0]]); pg.wait_for_timeout(500)
        print("popup", pg.evaluate("()=>{const p=document.querySelector('.qn-pl-seekpop'); return [p.hidden, p.style.top, p.style.left, getComputedStyle(p).display]}"))
        save(pg, "pc-markerpop")
        pg.keyboard.press("Escape"); pg.mouse.click(300, 700); pg.wait_for_timeout(300)
        # memo edit
        pg.click('#pcV2IconBar [data-panel-id="markers"]'); pg.wait_for_timeout(500)
        pg.click('#pcV2PanelBody .pin-color-mark >> nth=1'); pg.wait_for_timeout(700)
        save(pg, "pc-memo-edit", clip=panel())
        pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
        # A-B loop
        pg.click('#pcV2IconBar [data-panel-id="playlist"]'); pg.wait_for_timeout(400)
        pg.evaluate("()=>{abA=34; abB=50; if(typeof afterABChange==='function') afterABChange(); audio.pause(); audio.currentTime=40;}"); pg.wait_for_timeout(700)
        save(pg, "pc-loop-ab")
        # ---- SP ----
        sp = qb.new_page(width=390, height=780, lang="ja", dpr=2)
        setup(qb, sp)
        sp.evaluate("()=>{QNBars.setRows(4); QNBars.setSec(15); QNBars.setFollow(false); if(window.qnBarStripSync) window.qnBarStripSync();}"); sp.wait_for_timeout(600)
        R = lambda q: rect(sp, q)
        lg = R("#qnAppLogoBtn"); au = R("#authContainer"); hd = R("#pcV2HeadRow"); wv = R("#pcV2WaveArea"); fb = R("#pcV2WaveFabRow")
        dk = R("#pcV2SpDock"); mo = R("#pcV2DockMore"); ib = R("#pcV2IconBar")
        sb = [(1, lg["x"] + lg["w"] + 2, lg["y"] + lg["h"] / 2 + 14), (2, au["x"] - 6, au["y"] + au["h"] + 6),
              (3, 168, hd["y"] + hd["h"] + 6), (4, 352, wv["y"] + 156),
              (5, fb["x"] + 14, fb["y"] - 8), (6, dk["x"] + 16, dk["y"] - 2), (7, mo["x"] + mo["w"] - 4, mo["y"] - 2),
              (8, ib["x"] + 16, ib["y"] + 14)]
        sp.evaluate(BADGE_JS, [list(b) for b in sb]); save(sp, "sp-overview-ann"); sp.evaluate("()=>document.querySelectorAll('.qn-shot-badge').forEach(e=>e.remove())")
    print("done")

if __name__ == "__main__":
    main()
