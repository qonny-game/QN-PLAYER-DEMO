// player-chord-edit.js — コードの手動修正ポップアップ QNChordEdit。シークバーのコードモードで「Edit」をONにして、コードのブロックをタップすると開く。
// 変更は即反映・即保存(QNChords.setChord/splitAt/mergeNext/resetSeg が保存まで行う)。元に戻す=Reset(その区間)/Reset all(曲全体)。
// 開くのは player-bars.js の編集モード用タップ処理から QNChordEdit.open(時刻, x, y)。PC幅=タップ位置の近く、SP幅(≤900px)=下から出るシート。
// 依存: player-chords.js(QNChords)、qn-chord-core.js(QNChordCore.makeKey/QUALITIES)。

var QNChordEdit = (function () {
  const SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
  const TYPES = ["maj", "min", "dom7", "maj7", "min7", "sus4", "dim", "add9", "six", "min6", "dom9", "maj9", "min9", "m7b5", "dim7", "aug", "sus2", "s7sus4", "pow"];
  const X_SVG = '<svg viewBox="0 0 24 24"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';

  let el = null;
  let tapT = 0;
  let isOpen = false;

  const fmtT = t => { const s = Math.floor(t), m = Math.floor(s / 60); return m + ":" + String(s % 60).padStart(2, "0"); };
  const names = () => { const k = QNChords.key(); return k && k.flats ? FLAT : SHARP; };
  const suf = q => (q && QNChordCore.QUALITIES[q]) ? QNChordCore.QUALITIES[q].suf : "";
  const chipLabel = q => QNChordCore.QUALITIES[q].suf || "maj";

  function build() {
    el = document.createElement("div");
    el.id = "qnChordEdit";
    el.className = "qn-ce";
    el.hidden = true;
    el.innerHTML =
      '<div class="qn-ce-head"><div class="qn-ce-title"><span class="qn-ce-time"></span><span class="qn-ce-name"></span></div>' +
      '<button type="button" class="qn-ce-x" data-a="close" aria-label="Close">' + X_SVG + '</button></div>' +
      '<div class="qn-ce-sec" data-s="alts"><div class="qn-ce-lab">Candidates</div><div class="qn-ce-chips" data-k="alts"></div></div>' +
      '<div class="qn-ce-sec"><div class="qn-ce-lab">Root</div><div class="qn-ce-chips qn-ce-roots" data-k="root"></div></div>' +
      '<div class="qn-ce-sec"><div class="qn-ce-lab">Type</div><div class="qn-ce-chips" data-k="type"></div></div>' +
      '<div class="qn-ce-sec"><div class="qn-ce-lab">Bass</div><div class="qn-ce-chips qn-ce-roots" data-k="bass"></div></div>' +
      '<div class="qn-ce-actions">' +
        '<button type="button" class="qn-ce-btn" data-a="play">Play from here</button>' +
        '<button type="button" class="qn-ce-btn" data-a="none">No chord</button>' +
        '<button type="button" class="qn-ce-btn" data-a="split">Split here</button>' +
        '<button type="button" class="qn-ce-btn" data-a="merge">Merge next</button>' +
        '<button type="button" class="qn-ce-btn" data-a="reset">Reset</button>' +
        '<button type="button" class="qn-ce-btn" data-a="resetall">Reset all</button>' +
      '</div>';
    document.body.appendChild(el);
    el.addEventListener("click", onClick);
    document.addEventListener("pointerdown", e => { if (isOpen && el && !el.contains(e.target) && !(e.target.closest && e.target.closest("#vbarRows"))) close(); }, true);
    document.addEventListener("keydown", e => { if (isOpen && e.key === "Escape") close(); });
    QNChords.onChange(kind => { if (isOpen && kind === "state") render(); });
  }

  function chip(label, attrs, on) {
    return '<button type="button" class="qn-ce-chip' + (on ? " is-on" : "") + '" ' + attrs + '>' + label + '</button>';
  }

  function cur() { return QNChords.segAt(tapT); }

  function render() {
    const s = cur();
    if (!s) { close(); return; }
    const nm = names();
    const mode = QNBars.getViewMode() === "degree" ? "degree" : "letter";
    const lab = s.root < 0 ? "No chord" : QNChords.label(s, "letter", 0) + (mode === "degree" ? "  (" + QNChords.label(s, "degree", 0) + ")" : "");
    el.querySelector(".qn-ce-time").textContent = fmtT(s.t0) + " - " + fmtT(s.t1);
    el.querySelector(".qn-ce-name").textContent = lab + (s.u ? "  edited" : "");
    const alts = (s.alts || []);
    el.querySelector('[data-s="alts"]').style.display = alts.length ? "" : "none";
    el.querySelector('[data-k="alts"]').innerHTML = alts.map((a, i) => chip(QNChords.label(a, "letter", 0), 'data-alt="' + i + '"', false)).join("");
    el.querySelector('[data-k="root"]').innerHTML = nm.map((n, i) => chip(n, 'data-root="' + i + '"', s.root === i)).join("");
    el.querySelector('[data-k="type"]').innerHTML = TYPES.map(q => chip(chipLabel(q), 'data-q="' + q + '"', s.q === q)).join("");
    el.querySelector('[data-k="bass"]').innerHTML = chip("none", 'data-bass="-1"', s.bass < 0) + nm.map((n, i) => chip(n, 'data-bass="' + i + '"', s.bass === i)).join("");
    el.querySelector('[data-a="reset"]').disabled = !s.u;
    el.querySelector('[data-a="resetall"]').disabled = !QNChords.hasUser();
    const segs = QNChords.segments() || [];
    el.querySelector('[data-a="merge"]').disabled = segs.indexOf(s) < 0 || segs.indexOf(s) >= segs.length - 1;
    el.querySelector('[data-a="none"]').classList.toggle("is-on", s.root < 0);
  }

  function onClick(e) {
    const b = e.target.closest ? e.target.closest("button") : null;
    if (!b || b.disabled) return;
    if (typeof hapticTap === "function") { try { hapticTap(); } catch (err) {} }
    const s = cur();
    if (!s) return;
    const a = b.dataset.a;
    if (a === "close") { close(); return; }
    if (a === "play") {                                        // タップした位置から再生(編集中はタップでシークしないため)
      if (typeof beginSeek === "function") beginSeek();
      audio.currentTime = tapT;
      if (typeof prevTime !== "undefined") prevTime = tapT;
      audio.play();
      if (typeof updatePlayButtonState === "function") updatePlayButtonState();
      return;
    }
    if (a === "none") { QNChords.setChord(s, { root: -1, q: "", bass: -1 }); return; }
    if (a === "split") { QNChords.splitAt(Math.round(tapT * 10) / 10); return; }
    if (a === "merge") { QNChords.mergeNext(s); return; }
    if (a === "reset") { QNChords.resetSeg(s); return; }
    if (a === "resetall") { QNChords.resetAll(); return; }
    const c = { root: s.root, q: s.q || "maj", bass: s.bass };
    if (b.dataset.alt !== undefined) {
      const al = (s.alts || [])[parseInt(b.dataset.alt, 10)];
      if (!al) return;
      c.root = al.root; c.q = al.q; c.bass = -1;
    } else if (b.dataset.root !== undefined) {
      c.root = parseInt(b.dataset.root, 10);
      if (!s.q) c.q = "maj";
    } else if (b.dataset.q !== undefined) {
      c.q = b.dataset.q;
      if (c.root < 0) c.root = 0;
    } else if (b.dataset.bass !== undefined) {
      c.bass = parseInt(b.dataset.bass, 10);
      if (c.root < 0) return;
    } else return;
    QNChords.setChord(s, c);
  }

  function place(x, y) {
    if (window.innerWidth <= 900) { el.style.left = el.style.top = ""; return; }   // SP: CSSの下シート
    const w = el.offsetWidth, h = el.offsetHeight, m = 8;
    let left = x + 14, top = y + 14;
    if (left + w > window.innerWidth - m) left = Math.max(m, x - w - 14);
    if (top + h > window.innerHeight - m) top = Math.max(m, window.innerHeight - h - m);
    el.style.left = left + "px";
    el.style.top = top + "px";
  }

  function open(t, x, y) {
    if (typeof QNChords === "undefined" || !QNChords.segments()) return;
    if (!el) build();
    tapT = t;
    el.hidden = false;
    isOpen = true;
    render();
    place(x, y);
  }

  function close() {
    isOpen = false;
    if (el) el.hidden = true;
  }

  return { open: open, close: close, isOpen() { return isOpen; } };
})();
