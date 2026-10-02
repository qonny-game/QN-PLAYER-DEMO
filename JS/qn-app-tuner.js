// qn-app-tuner.js — TUNERアプリ(マイクチューナー+Tone Generator)。QNApps.register({id:"tuner"})。
// idは使わずdata-tn属性+qnTn*名前空間。UI部品はPLAYERと共通(.control-card/.mini-reset-btn/パネル/下段バーのデザイン)。スタイルはCSS/style-tuner.cssの.qn-tn*。
// 【規約】マイク・Tone・AudioContextは表示中だけ。onHideで必ず全停止(マイクを開いたまま他アプリへ行かない)。解析は間引き(qn-pitch-core.js)。DOM更新は値が変わった時だけ(GOTCHAS §3)。
// 保存キーは qn_tuner_*。音声実体は持たない。画面スリープ防止はQNWake.set("tuner")(マイクON中のみ)
(function () {
  "use strict";

  var core = window.QNPitchCore;
  var KEY_DISPLAY = "qn_tuner_display", KEY_SENS = "qn_tuner_sens", KEY_SMOOTH = "qn_tuner_smooth", COLLAPSE_KEY = "qn_tuner_panel_collapsed";

  var TUNER_ICON = '<path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>';
  var ICON = {
    mic: '<path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>',
    stop: '<path d="M6 6h12v12H6z"/>',
    display: '<path d="M4 5h16v10H4V5zm0 12h16v2H4v-2zM12 8l-3 3h6l-3-3z"/>',
    sens: '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>',
    smooth: '<path d="M3 12c2.5-7 4.5-7 6.5 0s4 7 6.5 0c.9-2.5 1.8-4 3-4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    tone: '<path d="M7 18h2V6H7v12zm4 4h2V2h-2v20zm-8-8h2v-4H3v4zm12 4h2V6h-2v12zm4-8v4h2v-4h-2z"/>',
    tune: '<path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>',
    keyboard: '<path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM11 8h2v2h-2V8zM11 11h2v2h-2v-2zM8 8h2v2H8V8zM8 11h2v2H8v-2zM5 8h2v2H5V8zm0 3h2v2H5v-2zm10 6H9v-2h6v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/>'
  };

  // ---------- プリセット(Tone Generator) ----------
  var BASE_STRINGS = {
    guitar: [76, 71, 67, 62, 57, 52],
    bass: [55, 50, 45, 40],
    ukulele: [69, 64, 60, 67]
  };
  var DROP_VARIANTS = [
    { key: "regular", label: "Regular", all: 0, last: 0 },
    { key: "half", label: "Half Down", all: -1, last: 0 },
    { key: "whole", label: "Whole Down", all: -2, last: 0 },
    { key: "dropD", label: "Drop D", all: 0, last: -2 },
    { key: "dropCs", label: "Drop C#", all: -1, last: -2 },
    { key: "dropC", label: "Drop C", all: -2, last: -2 }
  ];
  var TUNING_VARIANTS = { guitar: DROP_VARIANTS, bass: DROP_VARIANTS };
  var PRESETS = [
    { key: "guitar", label: "Guitar" }, { key: "bass", label: "Bass" },
    { key: "ukulele", label: "Ukulele" }, { key: "chromatic", label: "Wind" }
  ];

  function buildStringSet(instrument, variantKey) {
    var base = BASE_STRINGS[instrument];
    var variants = TUNING_VARIANTS[instrument] || [];
    var v = { all: 0, last: 0 };
    for (var i = 0; i < variants.length; i++) if (variants[i].key === variantKey) v = variants[i];
    return base.map(function (m, idx) {
      var midi = m + v.all + (idx === base.length - 1 ? v.last : 0);
      return { label: "String " + (idx + 1), note: core.midiToNoteName(midi), midi: midi };
    });
  }
  function chromaticList() {
    var arr = [];
    for (var m = 83; m >= 48; m--) arr.push({ label: core.midiToNoteName(m), note: core.midiToNoteName(m), midi: m });
    return arr;
  }

  // ---------- 状態 ----------
  var root = null, refs = {};
  var shown = false;
  var preset = "guitar", tuning = "regular";
  var sens = loadNum(KEY_SENS, 100), smooth = loadNum(KEY_SMOOTH, 100);
  var displayId = loadStr(KEY_DISPLAY, "gauge");
  var micSession = null, micRunning = false, micStarting = false;
  var silenceFrames = 0, smoothedFreq = null;
  var toneCtx = null, toneOsc = null, toneGain = null, tonePlayingRow = null, toneStopTimer = 0;
  var stringRows = [];

  function loadNum(key, def) {
    try {
      var v = parseInt(localStorage.getItem(key), 10);
      return isNaN(v) ? def : Math.max(0, Math.min(100, v));
    } catch (e) { return def; }
  }
  function loadStr(key, def) { try { return localStorage.getItem(key) || def; } catch (e) { return def; } }
  function saveVal(key, v) { try { localStorage.setItem(key, String(v)); } catch (e) {} }
  function haptic() { if (typeof hapticTap === "function") { try { hapticTap(); } catch (e) {} } }
  function toast(t) { if (window.QNApps) window.QNApps.toast(t); }
  function isSp() { return window.matchMedia("(max-width: 900px)").matches; }
  function setText(el, v) { if (el && el._v !== v) { el._v = v; el.textContent = v; } }
  function setState(el, s) {
    if (!el || el._s === s) return;
    el._s = s;
    if (s) el.setAttribute("data-state", s); else el.removeAttribute("data-state");
  }
  function setRangeProgress(input) {
    var min = parseFloat(input.min) || 0, max = parseFloat(input.max) || 100;
    input.style.setProperty("--range-progress", String(max > min ? ((input.value - min) / (max - min)) * 100 : 0));
  }

  // ---------- 下段バー(PLAYERの#pcV2BottomBarと同デザイン) ----------
  function bbtn(ref, cls, icon, label, title) {
    return '<button type="button" data-tn="' + ref + '" class="qn-tn-bbtn' + (cls ? " " + cls : "") + '" title="' + title + '">' +
      '<svg viewBox="0 0 24 24">' + icon + '</svg><span>' + label + '</span></button>';
  }
  function bstep(ref, icon, label, title) {
    return '<div class="qn-tn-bstep" title="' + title + '">' +
      '<button type="button" data-tn="' + ref + 'Down" class="qn-tn-bstep-btn" title="Decrease">−</button>' +
      '<div class="qn-tn-bstep-mid"><svg viewBox="0 0 24 24">' + icon + '</svg><span><b data-tn="' + ref + 'Val">100%</b> ' + label + '</span></div>' +
      '<button type="button" data-tn="' + ref + 'Up" class="qn-tn-bstep-btn" title="Increase">＋</button>' +
    '</div>';
  }
  var BAR_HTML =
    '<div class="qn-tn-bar">' +
      '<div class="qn-tn-bgroup">' +
        bbtn("micBtn", "center", ICON.mic, "Mic", "マイク ON/OFF (Space / M)") +
        bbtn("toneStopBtn", "", ICON.stop, "Stop Tone", "発信音を止める (Esc)") +
      '</div>' +
      '<div class="qn-tn-bdiv"></div>' +
      '<div class="qn-tn-bgroup">' +
        bbtn("displayBtn", "", ICON.display, "Gauge", "メイン表示の切り替え (D)") +
      '</div>' +
      '<div class="qn-tn-bspacer"></div>' +
      '<div class="qn-tn-bgroup">' +
        bstep("sens", ICON.sens, "Sens", "マイク感度") +
        bstep("smooth", ICON.smooth, "Smooth", "スムージング") +
      '</div>' +
    '</div>';

  // ---------- 画面の骨組み ----------
  var TEMPLATE =
    '<div class="qn-tn" data-panel="tone">' +
      '<aside class="qn-tn-panel">' +
        '<div class="qn-tn-panel-header"><span class="pcv2-panel-header-title" data-tn="panelTitle">Tone Generator</span></div>' +
        '<div class="qn-tn-panel-scroll">' +
          '<section class="qn-tn-sec qn-tn-sec-tone"><div class="control-list">' +
            '<div class="control-card" data-tn="toneNow" hidden>' +
              '<label>Now Playing <span class="qn-tn-white" data-tn="toneNowNote">—</span>' +
                '<button type="button" class="mini-reset-btn" data-tn="toneNowStop">Stop</button></label>' +
              '<div class="qn-tn-sub"><span data-tn="toneNowFreq">0.0</span> Hz</div>' +
            '</div>' +
            '<div class="control-card"><label>Preset</label>' +
              '<div class="qn-tn-chips" data-tn="presetTabs"></div>' +
              '<div class="qn-tn-chips" data-tn="tuningTabs"></div>' +
            '</div>' +
            '<div class="control-card"><label>Strings</label>' +
              '<div class="qn-tn-strings" data-tn="stringList"></div>' +
            '</div>' +
          '</div></section>' +
          '<section class="qn-tn-sec qn-tn-sec-sens"><div class="control-list">' +
            '<div class="control-card"><label>Sensitivity <span class="qn-tn-white" data-tn="sensLabel">100</span>%</label>' +
              '<input type="range" data-tn="sensRange" min="0" max="100" step="1" value="100"></div>' +
            '<div class="control-card"><label>Smoothing <span class="qn-tn-white" data-tn="smoothLabel">100</span>%</label>' +
              '<input type="range" data-tn="smoothRange" min="0" max="100" step="1" value="100"></div>' +
          '</div></section>' +
          '<section class="qn-tn-sec qn-tn-sec-display"><div class="qn-tn-dchoices" data-tn="displayChoices"></div></section>' +
          '<section class="qn-tn-sec qn-tn-sec-keyboard"><div data-tn="kbdBox"></div></section>' +
        '</div>' +
      '</aside>' +
      '<section class="qn-tn-stage">' +
        '<div class="qn-mic-pill" data-tn="micPill" hidden><i class="qn-mic-dot"></i><span>Mic on</span><span class="qn-mic-lv"><b></b><b></b><b></b><b></b><b></b></span></div>' +
        '<div class="qn-tn-prompt" data-tn="prompt">' +
          '<p>下のMicボタンを押すと、リアルタイムに音程を表示します</p>' +
          '<p class="qn-tn-error" data-tn="micError" role="status"></p>' +
        '</div>' +
        '<div class="qn-tn-display" data-tn="display" hidden></div>' +
      '</section>' +
      BAR_HTML +
    '</div>';

  // ---------- メイン表示(Gauge / Guitar Meter)。±5¢=just / ±20¢=close / それ以外=far。しきい値はstyle-tuner.cssのdata-stateと一致させる ----------
  function tuningState(cents) {
    var a = Math.abs(cents);
    return a <= 5 ? "just" : (a <= 20 ? "close" : "far");
  }

  var GAUGE_TICKS = [];
  for (var tc = -50; tc <= 50; tc += 10) GAUGE_TICKS.push(tc);
  function gaugeTicksSvg() {
    return GAUGE_TICKS.map(function (c) {
      var rad = ((c / 50) * 90 - 90) * Math.PI / 180;
      var major = c % 20 === 0, rIn = major ? 108 : 116;
      var cls = c === 0 ? "qn-tn-tick zero" : (major ? "qn-tn-tick major" : "qn-tn-tick");
      return '<line class="' + cls + '" x1="' + (150 + 130 * Math.cos(rad)).toFixed(1) + '" y1="' + (150 + 130 * Math.sin(rad)).toFixed(1) +
        '" x2="' + (150 + rIn * Math.cos(rad)).toFixed(1) + '" y2="' + (150 + rIn * Math.sin(rad)).toFixed(1) + '"/>';
    }).join("");
  }

  var GM_STEP_CENTS = 5, GM_STEPS = 10;
  var displayStyles = {
    gauge: {
      label: "Gauge", barLabel: "Gauge",
      render: function (box) {
        box.innerHTML =
          '<div class="qn-tn-meter" data-d="wrap">' +
            '<div class="qn-tn-gauge">' +
              '<svg class="qn-tn-gauge-svg" viewBox="0 0 300 165" aria-hidden="true">' +
                '<path class="qn-tn-g-track" d="M 20 150 A 130 130 0 0 1 280 150"/>' +
                '<path class="qn-tn-g-flat" d="M 20 150 A 130 130 0 0 1 95 35"/>' +
                '<path class="qn-tn-g-in" d="M 108 23 A 130 130 0 0 1 192 23"/>' +
                '<path class="qn-tn-g-sharp" d="M 205 35 A 130 130 0 0 1 280 150"/>' +
                gaugeTicksSvg() +
                '<g class="qn-tn-needle" data-d="needle" style="transform: rotate(0deg)"><line x1="150" y1="150" x2="150" y2="35"/><circle cx="150" cy="150" r="8"/></g>' +
              '</svg>' +
              '<div class="qn-tn-glabels"><span>♭</span><span>In tune</span><span>♯</span></div>' +
            '</div>' +
            '<div class="qn-tn-reading">' +
              '<div class="qn-tn-note" data-d="note">—</div>' +
              '<div class="qn-tn-freq"><span data-d="freq">0.0</span> Hz</div>' +
              '<div class="qn-tn-cents" data-d="cents">Play a note</div>' +
            '</div>' +
          '</div>';
        var q = function (n) { return box.querySelector('[data-d="' + n + '"]'); };
        return { wrap: q("wrap"), needle: q("needle"), note: q("note"), freq: q("freq"), cents: q("cents") };
      },
      update: function (d, r) {
        if (!r) {
          setText(d.note, "—"); setText(d.freq, "0.0"); setText(d.cents, "Play a note");
          if (d.needle._v !== 0) { d.needle._v = 0; d.needle.style.transform = "rotate(0deg)"; }
          setState(d.wrap, null);
          return;
        }
        setText(d.note, r.noteName + r.octave);
        setText(d.freq, r.freq.toFixed(1));
        setText(d.cents, (r.cents > 0 ? "+" : "") + r.cents + " cent");
        var deg = Math.round(Math.max(-50, Math.min(50, r.cents)) / 50 * 80 * 10) / 10;
        if (d.needle._v !== deg) { d.needle._v = deg; d.needle.style.transform = "rotate(" + deg + "deg)"; }
        setState(d.wrap, tuningState(r.cents));
      }
    },
    "guitar-meter": {
      label: "Guitar Meter", barLabel: "Meter",
      render: function (box) {
        var dots = "";
        for (var i = -GM_STEPS; i <= GM_STEPS; i++) dots += '<div class="qn-tn-dot' + (i === 0 ? " center" : "") + '" data-step="' + i + '"></div>';
        box.innerHTML =
          '<div class="qn-tn-gm" data-d="wrap">' +
            '<div class="qn-tn-gm-note" data-d="note">—</div>' +
            '<div class="qn-tn-gm-meter" data-d="meter">' + dots + '</div>' +
            '<div class="qn-tn-glabels"><span>♭</span><span>In tune</span><span>♯</span></div>' +
            '<div class="qn-tn-gm-freq" data-d="freq">0.0 Hz</div>' +
          '</div>';
        var q = function (n) { return box.querySelector('[data-d="' + n + '"]'); };
        var d = { wrap: q("wrap"), note: q("note"), freq: q("freq"), dots: [], step: null };
        var list = box.querySelectorAll(".qn-tn-dot");
        for (var k = 0; k < list.length; k++) d.dots.push({ el: list[k], step: parseInt(list[k].getAttribute("data-step"), 10), on: false });
        return d;
      },
      update: function (d, r) {
        if (!r) {
          setText(d.note, "—"); setText(d.freq, "0.0 Hz"); setState(d.wrap, null);
          lightDots(d, null);
          return;
        }
        setText(d.note, r.noteName + r.octave);
        setText(d.freq, r.freq.toFixed(1) + " Hz");
        lightDots(d, Math.round(Math.max(-50, Math.min(50, r.cents)) / GM_STEP_CENTS));
        setState(d.wrap, tuningState(r.cents));
      }
    }
  };
  function lightDots(d, step) {
    if (d.step === step) return;
    d.step = step;
    for (var i = 0; i < d.dots.length; i++) {
      var o = d.dots[i];
      var lit = step === null ? false : (o.step === 0 || (step > 0 ? (o.step > 0 && o.step <= step) : (step < 0 && o.step < 0 && o.step >= step)));
      if (o.on !== lit) { o.on = lit; o.el.classList.toggle("active", lit); }
    }
  }

  var dispRefs = null;
  function currentStyle() { return displayStyles[displayId] || displayStyles.gauge; }
  function renderMainDisplay() {
    if (!refs.display) return;
    dispRefs = currentStyle().render(refs.display);
    refs.display.hidden = !micRunning;
    refs.prompt.hidden = micRunning;
    setText(refs.displayBtn.querySelector("span"), currentStyle().barLabel);
  }
  function resetReadout() {
    smoothedFreq = null;
    if (dispRefs) currentStyle().update(dispRefs, null);
  }

  // ---------- マイク ----------
  function holdFrames() { return Math.round(3 + (100 - sens) / 100 * 12); }
  function smoothFactor() {
    var f = 0.1 + (smooth / 100) * 0.5;
    return 1 - (1 - f) * (1 - f);
  }
  function onMicFrame(res) {
    var freq = res.freq;
    window.QNApps.setMicLevel(refs.micPill, res.rms < 0.005 ? 0 : Math.min(5, 1 + Math.floor(res.rms * 15)));
    if (freq === -1 || freq < 30 || freq > 2000) {
      silenceFrames++;
      if (silenceFrames === holdFrames()) resetReadout();
      return;
    }
    silenceFrames = 0;
    if (smoothedFreq === null || Math.abs(freq - smoothedFreq) / smoothedFreq > 0.06) smoothedFreq = freq;
    else smoothedFreq += (freq - smoothedFreq) * smoothFactor();
    var n = core.freqToNote(smoothedFreq);
    if (dispRefs) currentStyle().update(dispRefs, { noteName: n.noteName, octave: n.octave, cents: n.cents, freq: smoothedFreq });
  }

  function updateMicUi() {
    if (!refs.micBtn) return;
    refs.micBtn.classList.toggle("is-active", micRunning);
    refs.display.hidden = !micRunning;
    refs.prompt.hidden = micRunning;
    refs.micPill.hidden = !micRunning;
    if (!micRunning) window.QNApps.setMicLevel(refs.micPill, 0);
    try { window.QNApps.setMic(micRunning); } catch (e) {}
    try { if (window.QNWake) window.QNWake.set("tuner", micRunning); } catch (e) {}
  }

  async function startMic() {
    if (micRunning || micStarting) return;
    micStarting = true;
    refs.micError.textContent = "";
    var session = core.createAnalysisSession({ fftSize: 2048, onFrame: onMicFrame });
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error("nomedia");
      await session.startFromMic();
    } catch (err) {
      micStarting = false;
      session.stop();
      var name = err && err.name;
      refs.micError.textContent = (err && err.message === "nomedia") ? "マイクを使えません（HTTPSで開いてください）"
        : (name === "NotFoundError" ? "マイクが見つかりません" : "マイクへのアクセスが許可されませんでした");
      updateMicUi();
      return;
    }
    micStarting = false;
    if (!shown) { session.stop(); return; }
    micSession = session;
    micRunning = true;
    silenceFrames = 0;
    resetReadout();
    updateMicUi();
  }

  function stopMic() {
    if (micSession) { micSession.stop(); micSession = null; }
    micRunning = false;
    resetReadout();
    updateMicUi();
  }

  function toggleMic() {
    if (micRunning) { stopMic(); toast("Mic OFF"); } else startMic();
  }

  // ---------- Tone Generator ----------
  function playTone(freq, note, row) {
    stopTone();
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!toneCtx) toneCtx = new Ctx();
    if (toneCtx.state === "suspended") { try { toneCtx.resume(); } catch (e) {} }
    toneOsc = toneCtx.createOscillator();
    toneGain = toneCtx.createGain();
    toneOsc.type = "triangle";
    toneOsc.frequency.value = freq;
    toneGain.gain.setValueAtTime(0, toneCtx.currentTime);
    toneGain.gain.linearRampToValueAtTime(0.7, toneCtx.currentTime + 0.03);
    toneOsc.connect(toneGain);
    toneGain.connect(toneCtx.destination);
    toneOsc.start();
    row.classList.add("is-playing");
    tonePlayingRow = row;
    showToneNow(note, freq);
  }

  function stopTone() {
    if (toneGain && toneCtx) toneGain.gain.linearRampToValueAtTime(0, toneCtx.currentTime + 0.03);
    if (toneOsc) {
      var osc = toneOsc;
      setTimeout(function () { try { osc.stop(); } catch (e) {} }, 50);
      toneOsc = null;
    }
    if (tonePlayingRow) { tonePlayingRow.classList.remove("is-playing"); tonePlayingRow = null; }
    showToneNow(null, 0);
  }

  function showToneNow(note, freq) {
    if (!refs.toneNow) return;
    var on = note !== null;
    refs.toneNow.hidden = !on;
    refs.toneStopBtn.disabled = !on;
    if (on) { refs.toneNowNote.textContent = note; refs.toneNowFreq.textContent = freq.toFixed(1); }
  }

  function closeToneAudio() {
    stopTone();
    if (toneCtx) {
      var c = toneCtx; toneCtx = null;
      setTimeout(function () { try { c.close(); } catch (e) {} }, 120);
    }
  }

  function currentStrings() {
    if (preset === "chromatic") return chromaticList();
    if (preset === "ukulele") return buildStringSet("ukulele", "regular");
    return buildStringSet(preset, tuning);
  }

  function toggleStringRow(i) {
    var s = stringRows[i];
    if (!s) return;
    if (tonePlayingRow === s.row) stopTone(); else playTone(s.freq, s.note, s.row);
  }

  function renderPresetTabs() {
    refs.presetTabs.innerHTML = "";
    PRESETS.forEach(function (p) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "qn-tn-chip" + (p.key === preset ? " is-active" : "");
      b.textContent = p.label;
      b.setAttribute("data-preset", p.key);
      refs.presetTabs.appendChild(b);
    });
  }
  function renderTuningTabs() {
    var variants = TUNING_VARIANTS[preset];
    refs.tuningTabs.hidden = !variants;
    refs.tuningTabs.innerHTML = "";
    if (!variants) return;
    variants.forEach(function (v) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "qn-tn-chip" + (v.key === tuning ? " is-active" : "");
      b.textContent = v.label;
      b.setAttribute("data-tuning", v.key);
      refs.tuningTabs.appendChild(b);
    });
  }
  function renderStringList() {
    refs.stringList.innerHTML = "";
    stringRows = [];
    currentStrings().forEach(function (item, index) {
      var freq = core.noteToFreq(item.midi);
      var row = document.createElement("button");
      row.type = "button";
      row.className = "qn-tn-string";
      row.innerHTML =
        '<span class="qn-tn-string-left"><span class="qn-tn-string-order">' + (index + 1) + '</span>' +
        '<span class="qn-tn-string-note">' + item.note + '</span>' +
        '<span class="qn-tn-string-label">' + item.label + '</span></span>' +
        '<span class="qn-tn-string-freq">' + freq.toFixed(1) + ' Hz</span>';
      row.addEventListener("click", function () { haptic(); toggleStringRow(index); });
      refs.stringList.appendChild(row);
      stringRows.push({ row: row, freq: freq, note: item.note });
    });
  }

  // ---------- 感度・スムージング ----------
  function syncSliders() {
    refs.sensRange.value = sens; refs.smoothRange.value = smooth;
    setRangeProgress(refs.sensRange); setRangeProgress(refs.smoothRange);
    refs.sensLabel.textContent = sens; refs.smoothLabel.textContent = smooth;
    setText(refs.sensVal, sens + "%"); setText(refs.smoothVal, smooth + "%");
  }
  function setSens(v) { sens = Math.max(0, Math.min(100, v)); saveVal(KEY_SENS, sens); syncSliders(); }
  function setSmooth(v) { smooth = Math.max(0, Math.min(100, v)); saveVal(KEY_SMOOTH, smooth); syncSliders(); }

  // ---------- Displayパネル(プレビュー付き選択カード) ----------
  function renderDisplayChoices() {
    var dots = "";
    for (var i = -5; i <= 5; i++) {
      var h = i === 0 ? 26 : (i % 2 === 0 ? 18 : 12);
      dots += '<rect class="qn-tn-pv-dot' + (i === 0 ? " center" : "") + '" x="' + (60 + i * 9 - 2) + '" y="' + (36 - h) + '" width="4" height="' + h + '" rx="2"/>';
    }
    refs.displayChoices.innerHTML =
      '<button type="button" class="qn-tn-dchoice" data-style="gauge">' +
        '<div class="qn-tn-dchoice-pv"><svg viewBox="0 0 120 66" aria-hidden="true">' +
          '<path class="qn-tn-pv-track" d="M 8 60 A 52 52 0 0 1 112 60"/><path class="qn-tn-pv-in" d="M 43 12 A 52 52 0 0 1 77 12"/>' +
          '<line class="qn-tn-pv-needle" x1="60" y1="60" x2="60" y2="16"/><circle class="qn-tn-pv-hub" cx="60" cy="60" r="4"/></svg></div>' +
        '<div class="qn-tn-dchoice-label"><span class="qn-tn-dchoice-title">Gauge</span><span class="qn-tn-dchoice-desc">半円メーターの針で音程のズレを表示</span></div>' +
        '<div class="qn-tn-dchoice-check"></div>' +
      '</button>' +
      '<button type="button" class="qn-tn-dchoice" data-style="guitar-meter">' +
        '<div class="qn-tn-dchoice-pv"><svg viewBox="0 0 120 40" aria-hidden="true">' + dots + '</svg></div>' +
        '<div class="qn-tn-dchoice-label"><span class="qn-tn-dchoice-title">Guitar Meter</span><span class="qn-tn-dchoice-desc">左右のメモリでセント単位のズレを表示</span></div>' +
        '<div class="qn-tn-dchoice-check"></div>' +
      '</button>';
    syncDisplayChoices();
  }
  function syncDisplayChoices() {
    var list = refs.displayChoices.querySelectorAll(".qn-tn-dchoice");
    for (var i = 0; i < list.length; i++) list[i].classList.toggle("is-active", list[i].getAttribute("data-style") === displayId);
  }
  function setDisplay(id) {
    if (!displayStyles[id] || id === displayId) return;
    displayId = id;
    saveVal(KEY_DISPLAY, id);
    syncDisplayChoices();
    renderMainDisplay();
    smoothedFreq = null;
  }
  function cycleDisplay() {
    var ids = Object.keys(displayStyles);
    setDisplay(ids[(ids.indexOf(displayId) + 1) % ids.length]);
    toast("Display: " + currentStyle().label);
  }

  // ---------- サイドバー・パネル。PC=パネル常時表示(アイコンで切替・再押下で格納)、SP=全面オーバーレイ(同アイコン再タップで閉じる) ----------
  var SIDEBAR = [
    { id: "tone", label: "Tone", icon: ICON.tone },
    { id: "sens", label: "Sensitivity", icon: ICON.tune },
    { id: "display", label: "Display", icon: ICON.display },
  ];
  var PANEL_TITLES = { tone: "Tone Generator", sens: "Sensitivity", display: "Display", keyboard: "Keyboard" };
  var panelState = null;
  var panelCollapsed = (function () { try { return localStorage.getItem(COLLAPSE_KEY) === "1"; } catch (e) { return false; } })();
  function isCollapsed() { return panelCollapsed && !isSp(); }

  function setPanel(id) {
    if (!isSp() && id === "none") id = "tone";
    panelState = id;
    if (!root) return;
    root.querySelector(".qn-tn").setAttribute("data-panel", id);
    if (id === "keyboard") window.QNApps.renderShortcuts(refs.kbdBox, "tuner");
    if (id !== "none") refs.panelTitle.textContent = PANEL_TITLES[id] || "";
    syncSideActive();
  }
  function syncSideActive() {
    if (window.QNApps) window.QNApps.setSideActive((!panelState || panelState === "none" || isCollapsed()) ? null : panelState);
  }
  function applyCollapse() {
    if (!root) return;
    root.querySelector(".qn-tn").classList.toggle("qn-tn-collapsed", isCollapsed());
    syncSideActive();
  }
  function setCollapsed(on) {
    panelCollapsed = !!on;
    saveVal(COLLAPSE_KEY, panelCollapsed ? "1" : "0");
    applyCollapse();
  }
  function onSidebar(id) {
    if (isSp()) { setPanel(panelState === id ? "none" : id); return; }
    if (panelCollapsed) { setCollapsed(false); setPanel(id); return; }
    if (panelState === id) { setCollapsed(true); return; }
    setPanel(id);
  }

  // ---------- ショートカット(表示中のみ。onShowで登録・onHideで解除) ----------
  var SHORTCUTS = [
    { key: "Space / M", action: "Mic on/off" },
    { key: "D", action: "Switch Display" },
    { key: "1 - 9", action: "Play String Tone" },
    { key: "Esc", action: "Stop Tone" }
  ];
  function isTypingTarget(el) {
    if (!el || !el.tagName) return false;
    var tag = el.tagName;
    if (tag === "INPUT") return el.type !== "range" && el.type !== "button" && el.type !== "checkbox";
    return tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
  }
  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (isTypingTarget(e.target) || isTypingTarget(document.activeElement)) return;
    var k = e.key;
    if (e.code === "Space" || k === " ") {
      e.preventDefault();
      if (e.type === "keyup" || e.repeat) return;
      toggleMic();
      return;
    }
    if (e.type !== "keydown" || e.repeat) return;
    var lk = k.length === 1 ? k.toLowerCase() : k;
    if (lk === "m") { e.preventDefault(); toggleMic(); }
    else if (lk === "d") { e.preventDefault(); cycleDisplay(); }
    else if (k === "Escape") { if (toneOsc) stopTone(); }
    else if (/^[1-9]$/.test(k)) { e.preventDefault(); toggleStringRow(parseInt(k, 10) - 1); }
  }
  var keyBound = false;
  function bindKeys(on) {
    if (on === keyBound) return;
    keyBound = on;
    var f = on ? "addEventListener" : "removeEventListener";
    window[f]("keydown", onKey, true);
    window[f]("keyup", onKey, true);
  }

  // ---------- マウント・表示/非表示 ----------
  function bindEvents() {
    refs.micBtn.addEventListener("click", function () { haptic(); toggleMic(); });
    refs.toneStopBtn.addEventListener("click", function () { haptic(); stopTone(); });
    refs.toneNowStop.addEventListener("click", function () { haptic(); stopTone(); });
    refs.displayBtn.addEventListener("click", function () { haptic(); cycleDisplay(); });
    refs.presetTabs.addEventListener("click", function (e) {
      var b = e.target.closest(".qn-tn-chip");
      if (!b) return;
      var key = b.getAttribute("data-preset");
      if (key === preset) return;
      haptic();
      preset = key; tuning = "regular";
      stopTone(); renderPresetTabs(); renderTuningTabs(); renderStringList();
    });
    refs.tuningTabs.addEventListener("click", function (e) {
      var b = e.target.closest(".qn-tn-chip");
      if (!b) return;
      var key = b.getAttribute("data-tuning");
      if (key === tuning) return;
      haptic();
      tuning = key;
      stopTone(); renderTuningTabs(); renderStringList();
    });
    refs.displayChoices.addEventListener("click", function (e) {
      var b = e.target.closest(".qn-tn-dchoice");
      if (!b) return;
      haptic();
      setDisplay(b.getAttribute("data-style"));
    });
    refs.sensRange.addEventListener("input", function () { setSens(parseInt(refs.sensRange.value, 10)); });
    refs.smoothRange.addEventListener("input", function () { setSmooth(parseInt(refs.smoothRange.value, 10)); });
    refs.sensDown.addEventListener("click", function () { haptic(); setSens(sens - 10); });
    refs.sensUp.addEventListener("click", function () { haptic(); setSens(sens + 10); });
    refs.smoothDown.addEventListener("click", function () { haptic(); setSmooth(smooth - 10); });
    refs.smoothUp.addEventListener("click", function () { haptic(); setSmooth(smooth + 10); });
    window.addEventListener("resize", function () { if (shown) { applyCollapse(); } });
  }

  function mount(view) {
    root = view;
    root.innerHTML = TEMPLATE;
    var nodes = root.querySelectorAll("[data-tn]");
    for (var i = 0; i < nodes.length; i++) refs[nodes[i].getAttribute("data-tn")] = nodes[i];
    bindEvents();
    renderPresetTabs(); renderTuningTabs(); renderStringList();
    renderDisplayChoices();
    syncSliders();
    renderMainDisplay();
    showToneNow(null, 0);
  }

  function onShow() {
    shown = true;
    bindKeys(true);
    setPanel(panelState || (isSp() ? "none" : "tone"));
    applyCollapse();
  }

  function onHide() {
    shown = false;
    bindKeys(false);
    closeToneAudio();
    if (micRunning || micSession) stopMic();
    try { if (window.QNWake) window.QNWake.set("tuner", false); } catch (e) {}
  }

  if (window.QNApps) {
    window.QNApps.register({
      id: "tuner",
      label: "Tuner",
      icon: TUNER_ICON,
      order: 20,
      ready: true,
      sidebar: SIDEBAR,
      shortcuts: SHORTCUTS,
      shortcutsNote: "1〜9は、Toneパネルで選んでいるプリセットの弦を上から順に鳴らします。",
      onSidebar: onSidebar,
      mount: mount,
      onShow: onShow,
      onHide: onHide
    });
  } else {
    console.error("qn-app-tuner.js: qn-apps.js が先に読み込まれていません");
  }
})();
