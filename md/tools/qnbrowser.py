# qnbrowser.py — ブラウザ確認の共通土台（smoke.py / snap.py / i18n_check.py が使う）
# 提供するもの: ローカルサーバー(同じプロセス内で動く=勝手に落ちない)、PC/SP幅のページ、外部通信の遮断、
#   無料版の解除、言語指定、テスト音声の自動生成、曲の追加、パネルを開く、エラー収集、スクショ保存。
# 使い方の例:
#   from qnbrowser import QNBrowser
#   with QNBrowser(root) as qb:
#       pg = qb.new_page(width=390, height=844)
#       qb.goto(pg)
#       qb.add_track(pg)
#       qb.open_panel(pg, "Library")
#       print(qb.errors(pg))
# 注意: Playwright(Python)とChromiumが要る。外部ドメイン(Firebase/YouTube/CDN)は遮断するので、
#   それらに依存する機能(ログイン・YouTube再生・Stemのモデル取得)は確認できない。
import functools
import http.server
import os
import socketserver
import struct
import tempfile
import threading
import wave
import math


# マイクの代わりになる擬似入力(getUserMediaを差し替える)。new_page(mic=True)で有効。
# ページ内で window.__mic = {freq, tone, noise} を書き換えると音を変えられる(qb.mic(pg, tone=..., noise=..., freq=...))
MIC_MOCK_JS = """
navigator.mediaDevices.getUserMedia = async function () {
  const c = new (window.AudioContext || webkitAudioContext)(); window.__ac = c;
  const o = c.createOscillator(); o.frequency.value = 110; const g = c.createGain(); g.gain.value = 0.3;
  const len = c.sampleRate * 2, nb = c.createBuffer(1, len, c.sampleRate), d0 = nb.getChannelData(0);
  for (let i = 0; i < len; i++) d0[i] = Math.random() * 2 - 1;
  const ns = c.createBufferSource(); ns.buffer = nb; ns.loop = true; const ng = c.createGain(); ng.gain.value = 0;
  const d = c.createMediaStreamDestination(); o.connect(g); g.connect(d); ns.connect(ng); ng.connect(d); o.start(); ns.start();
  window.__mic = { set freq(v) { o.frequency.value = v; }, set tone(v) { g.gain.value = v; }, set noise(v) { ng.gain.value = v; } };
  return d.stream;
};
"""


class _Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


class _Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


class QNBrowser:
    def __init__(self, root, out_dir=None):
        self.root = os.path.abspath(root)
        self.out_dir = out_dir or tempfile.mkdtemp(prefix="qnbrowser_")
        os.makedirs(self.out_dir, exist_ok=True)
        self._pages = []

    # ---- 開始・終了 ----
    def __enter__(self):
        from playwright.sync_api import sync_playwright
        handler = functools.partial(_Quiet, directory=self.root)
        self.server = _Server(("127.0.0.1", 0), handler)
        self.port = self.server.server_address[1]
        threading.Thread(target=self.server.serve_forever, daemon=True).start()
        self.base_url = "http://127.0.0.1:%d/" % self.port
        self._pw = sync_playwright().start()
        self.browser = self._pw.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
        return self

    def __exit__(self, *exc):
        try:
            self.browser.close()
            self._pw.stop()
        finally:
            self.server.shutdown()
            self.server.server_close()

    # ---- ページ ----
    def new_page(self, width=1280, height=800, unlock=True, lang=None, storage=None,
                 block_external=True, init_script=None, accept_downloads=True, mic=False, dpr=1):
        """storage: 起動前に入れるlocalStorageの辞書。unlock=Trueで無料版の制限を外す。lang: 'ja'|'en'|'auto'"""
        ctx = self.browser.new_context(viewport={"width": width, "height": height},
                                       accept_downloads=accept_downloads, device_scale_factor=dpr)
        items = dict(storage or {})
        if unlock:
            items["qnplayer_unlock_until"] = "-1"
        if lang:
            items["qn_lang"] = lang
        js = "try{" + "".join("localStorage.setItem(%r,%r);" % (k, str(v)) for k, v in items.items()) + "}catch(e){}"
        ctx.add_init_script(js)
        if mic:
            ctx.add_init_script(MIC_MOCK_JS)
        if init_script:
            ctx.add_init_script(init_script)
        pg = ctx.new_page()
        pg._qn_errors = []
        pg._qn_console = []
        pg.on("pageerror", lambda e: pg._qn_errors.append(str(e)[:300]))
        pg.on("console", lambda m: pg._qn_console.append(m.text[:300]) if m.type == "error" else None)
        if block_external:
            pg.route("**/*", lambda r: r.continue_() if r.request.url.startswith(self.base_url) else r.abort())
        self._pages.append(pg)
        return pg

    def mic(self, pg, tone=None, noise=None, freq=None, wait_ms=1200):
        """擬似マイクの音を変える(tone=音量0〜1 / noise=雑音量 / freq=Hz)。new_page(mic=True)が前提"""
        for k, v in (("freq", freq), ("tone", tone), ("noise", noise)):
            if v is not None:
                pg.evaluate("(v)=>{window.__mic.%s=v}" % k, v)
        pg.wait_for_timeout(wait_ms)

    def goto(self, pg, path="index.html", wait_ms=3000):
        pg.goto(self.base_url + path, wait_until="load")
        pg.wait_for_timeout(wait_ms)

    def errors(self, pg):
        """JSの実行時エラー(pageerror)。0件が合格。外部遮断由来の通信エラーは含めない"""
        return list(pg._qn_errors)

    # ---- 操作 ----
    def wav(self, seconds=60, name="test.wav"):
        """テスト用の音声を生成してパスを返す。短いと自動で次の曲へ進むので既定は60秒"""
        path = os.path.join(self.out_dir, name)
        rate = 22050
        w = wave.open(path, "wb")
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate)
        w.writeframes(b"".join(struct.pack("<h", int(8000 * math.sin(i / 20.0))) for i in range(rate * seconds)))
        w.close()
        return path

    def add_track(self, pg, path=None, wait_ms=2500):
        pg.set_input_files("#fileInput", path or self.wav())
        pg.wait_for_timeout(wait_ms)

    def icon_labels(self, pg):
        return pg.evaluate("()=>Array.from(document.querySelectorAll('#pcV2IconBar .pcv2-icon-item, #pcV2IconBarBottom .pcv2-icon-item')).map(e=>(e.innerText||'').trim().replace(/\\n/g,' '))")

    def open_panel(self, pg, label, wait_ms=500):
        """アイコンバーの項目を押す。すでに開いている時は閉じる動作になる点に注意"""
        pg.click('.pcv2-icon-item:has-text("%s")' % label, timeout=2000)
        pg.wait_for_timeout(wait_ms)

    def open_app(self, pg, app_id, wait_ms=1200):
        """アプリ枠のアプリを開く(tuner / pitch / youtube / player)"""
        pg.evaluate("(id)=>window.QNApps.open(id)", app_id)
        pg.wait_for_timeout(wait_ms)

    def shot(self, pg, name):
        path = os.path.join(self.out_dir, name if name.endswith(".png") else name + ".png")
        pg.screenshot(path=path)
        return path
