// qn-pitch-filters.js — PITCHアプリ用: ノイズ除去フィルタ・音程ズレ/ビブラート検出・スコア判定+フィルタ設定の保存。DOM操作なし。公開: window.QNPitchFilters
// 入力のtrackは [{t,midi,cents,rms,voiced}](tは秒、昇順)。元の配列は書き換えない(変更点だけ新オブジェクト)。保存キーは qn_pitch_filters(JSON)
(function () {
  "use strict";

  var KEY = "qn_pitch_filters";
  var DEFAULTS = {
    jumpWindowMs: 150,
    jumpSemitones: 2,
    spikeRemoval: true,
    rmsThreshold: 0,
    pitchDriftEnabled: false,
    pitchDriftDurationMs: 400,
    pitchDriftCents: 20,
    vibratoEnabled: true,
    vibratoMinRateHz: 3,
    vibratoMaxRateHz: 8,
    vibratoMinCents: 15,
    scoreCentsThreshold: 25
  };

  var settings = load();

  function load() {
    var s = Object.assign({}, DEFAULTS);
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var p = JSON.parse(raw);
        for (var k in DEFAULTS) if (p && typeof p[k] === typeof DEFAULTS[k]) s[k] = p[k];
      }
    } catch (e) {}
    s.rmsThreshold = Math.max(0, Math.min(0.5, s.rmsThreshold));
    return s;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (e) {} }
  function set(key, value) { if (key in DEFAULTS) { settings[key] = value; save(); } }
  function reset() { settings = Object.assign({}, DEFAULTS); save(); }

  function applyFilters(track) {
    if (!track.length) return track;
    var i, j, p;
    var rmsTh = settings.rmsThreshold;
    var out = track;
    if (rmsTh > 0) {
      out = track.map(function (q) {
        return (q.voiced && (q.rms === undefined || q.rms < rmsTh)) ? Object.assign({}, q, { voiced: false }) : q;
      });
    }

    var windowSec = settings.jumpWindowMs / 1000;
    if (settings.jumpSemitones > 0 && windowSec > 0) {
      var src = out;
      out = src.map(function (q, idx) {
        if (!q.voiced) return q;
        for (var k = idx - 1; k >= 0; k--) {
          var prev = src[k];
          if (q.t - prev.t > windowSec) break;
          if (!prev.voiced) continue;
          if (Math.abs(q.midi - prev.midi) >= settings.jumpSemitones) return Object.assign({}, q, { voiced: false });
        }
        return q;
      });
    }

    if (settings.spikeRemoval) {
      var s2 = out;
      out = s2.map(function (q, idx) {
        if (!q.voiced) return q;
        var prev = null, next = null, a, b;
        for (a = idx - 1; a >= 0; a--) if (s2[a].voiced) { prev = s2[a]; break; }
        for (b = idx + 1; b < s2.length; b++) if (s2[b].voiced) { next = s2[b]; break; }
        if (prev && next) {
          var dPrev = Math.abs(q.midi - prev.midi), dNext = Math.abs(q.midi - next.midi), dPN = Math.abs(next.midi - prev.midi);
          if (dPrev > 1.5 && dNext > 1.5 && dPN < 1.0) return Object.assign({}, q, { voiced: false });
        }
        return q;
      });
    }
    return out;
  }

  function detectSustainedRegions(track, minDurationSec) {
    var regions = [], i = 0;
    while (i < track.length) {
      if (!track[i].voiced) { i++; continue; }
      var note = Math.round(track[i].midi), j = i;
      while (j < track.length) {
        var p = track[j];
        if (p.voiced && Math.round(p.midi) !== note) break;
        j++;
      }
      var end = j - 1;
      while (end > i && !track[end].voiced) end--;
      var startT = track[i].t, endT = track[end].t;
      if (endT - startT >= minDurationSec) regions.push({ startT: startT, endT: endT, startIdx: i, endIdx: end });
      i = j;
    }
    return regions;
  }

  function isVibrato(track, startIdx, endIdx) {
    var pts = [], k;
    for (k = startIdx; k <= endIdx; k++) if (track[k].voiced) pts.push(track[k]);
    if (pts.length < 6) return false;
    var crossings = [];
    for (k = 1; k < pts.length; k++) {
      var a = pts[k - 1].cents, b = pts[k].cents;
      if ((a >= 0 && b < 0) || (a < 0 && b >= 0)) crossings.push(pts[k].t);
    }
    if (crossings.length < 3) return false;
    var sum = 0;
    for (k = 1; k < crossings.length; k++) sum += crossings[k] - crossings[k - 1];
    var avgHalf = sum / (crossings.length - 1);
    if (avgHalf <= 0) return false;
    var rateHz = 1 / (avgHalf * 2);
    var abs = 0;
    for (k = 0; k < pts.length; k++) abs += Math.abs(pts[k].cents);
    return rateHz >= settings.vibratoMinRateHz && rateHz <= settings.vibratoMaxRateHz && abs / pts.length >= settings.vibratoMinCents;
  }

  function meanCents(track, r) {
    var sum = 0, count = 0;
    for (var k = r.startIdx; k <= r.endIdx; k++) if (track[k].voiced) { sum += track[k].cents; count++; }
    return count ? sum / count : null;
  }

  function detectDriftRegions(track) {
    if (!settings.pitchDriftEnabled || !track.length) return [];
    var out = [];
    detectSustainedRegions(track, settings.pitchDriftDurationMs / 1000).forEach(function (r) {
      if (settings.vibratoEnabled && isVibrato(track, r.startIdx, r.endIdx)) return;
      var m = meanCents(track, r);
      if (m !== null && Math.abs(m) > settings.pitchDriftCents) out.push({ startT: r.startT, endT: r.endT });
    });
    return out;
  }

  function detectVibratoRegions(track) {
    if (!settings.vibratoEnabled || !track.length) return [];
    var out = [];
    detectSustainedRegions(track, settings.pitchDriftDurationMs / 1000).forEach(function (r) {
      if (isVibrato(track, r.startIdx, r.endIdx)) out.push({ startT: r.startT, endT: r.endT });
    });
    return out;
  }

  // 持続音のうち許容ズレ以内の割合(%)。対象が無ければnull。ビブラート区間は除外
  function calcScore(track) {
    var sustained = detectSustainedRegions(track, settings.pitchDriftDurationMs / 1000);
    var scored = settings.vibratoEnabled ? sustained.filter(function (r) { return !isVibrato(track, r.startIdx, r.endIdx); }) : sustained;
    if (!scored.length) return null;
    var ok = 0;
    scored.forEach(function (r) {
      var m = meanCents(track, r);
      if (m !== null && Math.abs(m) <= settings.scoreCentsThreshold) ok++;
    });
    return Math.round(ok / scored.length * 100);
  }

  window.QNPitchFilters = {
    DEFAULTS: DEFAULTS,
    get settings() { return settings; },
    set: set, reset: reset,
    applyFilters: applyFilters, detectDriftRegions: detectDriftRegions, detectVibratoRegions: detectVibratoRegions, calcScore: calcScore
  };
})();
