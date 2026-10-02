// qn-pitch-core.js — TUNER/PITCH共通: マイク入力・ピッチ検出(自己相関)・音名変換。DOM操作なし。公開: window.QNPitchCore
// 【規約】解析ループは約30fpsに間引く(GOTCHAS §3)。毎フレームの配列/文字列の新規生成をしない(バッファは再利用)。マイク用AudioContextはstop()で必ずclose
(function () {
  "use strict";

  var NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  var A4 = 440;
  var FRAME_MS = 33;

  function freqToMidi(freq) { return 69 + 12 * Math.log2(freq / A4); }
  function noteToFreq(midi) { return A4 * Math.pow(2, (midi - 69) / 12); }
  function midiToNoteName(midi) {
    return NOTE_NAMES[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1);
  }
  function freqToNote(freq) {
    var midi = freqToMidi(freq);
    var rounded = Math.round(midi);
    return {
      noteName: NOTE_NAMES[((rounded % 12) + 12) % 12],
      octave: Math.floor(rounded / 12) - 1,
      cents: Math.round((midi - rounded) * 100),
      midi: rounded
    };
  }

  // 自己相関法。corrは呼び出し側が持つ再利用バッファ(長さ>=buf.length)
  function autoCorrelate(buf, sampleRate, corr) {
    var SIZE = buf.length, i, j;
    var rms = 0;
    for (i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return { freq: -1, rms: rms };

    var r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (i = 0; i < SIZE / 2; i++) if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    for (i = 1; i < SIZE / 2; i++) if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }
    var t = buf.subarray(r1, r2);
    var n = t.length;
    if (n < 2) return { freq: -1, rms: rms };

    for (i = 0; i < n; i++) {
      var s = 0;
      for (j = 0; j < n - i; j++) s += t[j] * t[j + i];
      corr[i] = s;
    }

    var d = 0;
    while (d < n - 1 && corr[d] > corr[d + 1]) d++;
    var maxVal = -1, maxPos = -1;
    for (i = d; i < n; i++) if (corr[i] > maxVal) { maxVal = corr[i]; maxPos = i; }
    var T0 = maxPos;
    if (T0 <= 0) return { freq: -1, rms: rms };

    var x1 = corr[T0 - 1] || corr[T0], x2 = corr[T0], x3 = corr[T0 + 1] || corr[T0];
    var a = (x1 + x3 - 2 * x2) / 2, b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);
    return { freq: sampleRate / T0, rms: rms };
  }

  // 解析セッション。startFromMic()はクリック等の操作内で呼ぶ(iOSのAudioContext制約)
  function createAnalysisSession(options) {
    var opts = options || {};
    var fftSize = opts.fftSize || 2048;
    var onFrame = typeof opts.onFrame === "function" ? opts.onFrame : function () {};
    var ctx = null, stream = null, analyser = null, dataBuf = null, corrBuf = null;
    var rafId = 0, lastAt = 0, running = false;

    function tick(now) {
      if (!running) return;
      rafId = requestAnimationFrame(tick);
      if (document.hidden || now - lastAt < FRAME_MS) return;
      lastAt = now;
      analyser.getFloatTimeDomainData(dataBuf);
      var r = autoCorrelate(dataBuf, ctx.sampleRate, corrBuf);
      onFrame(r);
    }

    async function startFromMic(constraints) {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      ctx = new Ctx();
      if (ctx.state === "suspended") { try { ctx.resume(); } catch (e) {} }
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints || {
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
        });
      } catch (err) {
        try { ctx.close(); } catch (e) {}
        ctx = null;
        throw err;
      }
      var src = ctx.createMediaStreamSource(stream);
      analyser = ctx.createAnalyser();
      analyser.fftSize = fftSize;
      src.connect(analyser);
      dataBuf = new Float32Array(analyser.fftSize);
      corrBuf = new Float32Array(analyser.fftSize);
      running = true;
      lastAt = 0;
      rafId = requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
      if (ctx) { try { ctx.close(); } catch (e) {} ctx = null; }
      analyser = null; dataBuf = null; corrBuf = null;
    }

    // streamは録音(MediaRecorder)と共有する用。getUserMediaを二重に開かない
    return { startFromMic: startFromMic, stop: stop, get stream() { return stream; } };
  }

  window.QNPitchCore = {
    NOTE_NAMES: NOTE_NAMES, A4: A4,
    freqToMidi: freqToMidi, freqToNote: freqToNote, noteToFreq: noteToFreq, midiToNoteName: midiToNoteName,
    autoCorrelate: autoCorrelate, createAnalysisSession: createAnalysisSession
  };
})();
