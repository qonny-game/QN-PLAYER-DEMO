// tab_core_check.js — JS/qn-tab-core.js の確認(DOMなし)。使い方: node md/tools/tab_core_check.js [ルート]
// 確認: 候補の列挙 / 割り当ての整合(音高・弦の重複・和音の幅) / 手の移動量が「最低フレット優先」より小さい / 手動固定の反映 / cleanup(倍音・音域・余韻の再検出)
"use strict";
var path = require("path");
var root = path.resolve(process.argv[2] || process.cwd());
var Core = require(path.join(root, "JS", "qn-tab-core.js"));
var fails = 0;
function ok(name, cond, extra) { if (!cond) fails++; console.log((cond ? "OK   " : "NG   ") + name + (extra ? "  " + extra : "")); }

var T = Core.STD_TUNING;
function midiOf(s, f) { return Core.openOf(T, s) + f; }

// 乱数(固定シード)
var seed = 12345;
function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }

// 1) 候補
(function () {
  var c = Core.candidates(64, T, 0, 21).map(function (x) { return x.s + ":" + x.f; }).join(",");
  ok("candidates E4(64)", c === "1:0,2:5,3:9,4:14,5:19", c);
  ok("candidates below range", Core.candidates(39, T, 0, 21).length === 0);
  ok("candidates above range", Core.candidates(86, T, 0, 21).length === 0);
  ok("candidates capo 2", Core.candidates(66, T, 2, 21).some(function (x) { return x.s === 1 && x.f === 0; }));
})();

// 2) フレーズ: ポジションを動かしながら弾くランダムな単音+和音(正解の弦・フレットが分かる)
function makePhrase(n) {
  var notes = [], t = 0, pos = 5, id = 1;
  for (var i = 0; i < n; i++) {
    pos = Math.max(0, Math.min(15, pos + Math.round((rnd() - 0.5) * 4)));
    var chord = rnd() < 0.15;
    var strs = chord ? [4, 3, 2].slice(0, 2 + Math.floor(rnd() * 2)) : [1 + Math.floor(rnd() * 6)];
    var base = pos + Math.floor(rnd() * 3);
    strs.forEach(function (s) {
      var f = Math.min(21, base + Math.floor(rnd() * 3));
      notes.push({ id: id++, t: t + (chord ? 0 : 0), d: 0.3, midi: midiOf(s, f), vel: 0.7, tr: { s: s, f: f } });
    });
    t += 0.25 + rnd() * 0.5;
  }
  return notes;
}
(function () {
  var notes = makePhrase(400);
  var pos = Core.assign(notes, {});
  var badPitch = 0, none = 0, dupStr = 0, moveSum = 0, moveN = 0, exact = 0;
  notes.forEach(function (n, i) {
    var p = pos[i];
    if (!p) { none++; return; }
    if (midiOf(p.s, p.f) !== n.midi) badPitch++;
    if (p.s === n.tr.s && p.f === n.tr.f) exact++;
  });
  // 同時音で弦が重複していないか
  var byT = {};
  notes.forEach(function (n, i) { if (pos[i]) (byT[n.t] = byT[n.t] || []).push(pos[i].s); });
  Object.keys(byT).forEach(function (k) { if (new Set(byT[k]).size !== byT[k].length) dupStr++; });
  ok("assign: all notes placed", none === 0, "unplaced=" + none);
  ok("assign: pitch consistent", badPitch === 0, "bad=" + badPitch);
  ok("assign: no duplicate strings in chords", dupStr === 0);

  // 手の移動量(単音の連なりでの押弦フレット差の平均)を、最低フレット優先と比べる
  function hand(posArr) {
    var prev = null, sum = 0, cnt = 0;
    notes.forEach(function (n, i) {
      var p = posArr[i]; if (!p || p.f === 0) return;
      if (prev != null) { sum += Math.abs(p.f - prev); cnt++; }
      prev = p.f;
    });
    return sum / Math.max(1, cnt);
  }
  var naive = notes.map(function (n) { var c = Core.candidates(n.midi, T, 0, 21); c.sort(function (a, b) { return a.f - b.f; }); return c[0] || null; });
  var truth = notes.map(function (n) { return n.tr; });
  var hv = hand(pos), hn = hand(naive), ht = hand(truth);
  ok("assign: hand movement <= lowest-fret baseline", hv <= hn, "viterbi=" + hv.toFixed(2) + " naive=" + hn.toFixed(2) + " truth=" + ht.toFixed(2));
  console.log("INFO exact match with the source TAB: " + (100 * exact / notes.length).toFixed(1) + "% (same pitch can be played at several positions, so this is only a reference)");
})();

// 3) 和音の幅
(function () {
  var notes = [
    { id: 1, t: 0, d: 1, midi: midiOf(6, 3), vel: 1 }, { id: 2, t: 0, d: 1, midi: midiOf(5, 2), vel: 1 },
    { id: 3, t: 0, d: 1, midi: midiOf(4, 0), vel: 1 }, { id: 4, t: 0, d: 1, midi: midiOf(3, 0), vel: 1 },
    { id: 5, t: 0, d: 1, midi: midiOf(2, 1), vel: 1 }, { id: 6, t: 0, d: 1, midi: midiOf(1, 0), vel: 1 }
  ];
  var pos = Core.assign(notes, {});
  var fr = pos.filter(function (p) { return p && p.f > 0; }).map(function (p) { return p.f; });
  var span = fr.length ? Math.max.apply(null, fr) - Math.min.apply(null, fr) : 0;
  ok("chord (C major open) fits in a hand", pos.every(Boolean) && span <= 4, JSON.stringify(pos));
})();

// 4) 手動固定
(function () {
  var notes = [];
  for (var i = 0; i < 6; i++) notes.push({ id: i + 1, t: i * 0.4, d: 0.3, midi: 64, vel: 1, edited: false, hidden: false });
  Core.fingering(notes, {});
  var before = notes[2].string + ":" + notes[2].fret;
  notes[2].string = 3; notes[2].fret = 9; notes[2].edited = true;
  Core.fingering(notes, {});
  ok("edited note stays fixed", notes[2].string === 3 && notes[2].fret === 9, "auto was " + before);
  ok("others still placed", notes.every(function (n) { return n.string >= 1; }));
  notes[4].hidden = true;
  Core.fingering(notes, {});
  ok("hidden note is skipped", notes[4].string >= 0);
})();

// 5) cleanup
(function () {
  var raw = [
    { t: 0.00, d: 0.50, midi: 52, vel: 0.80 },
    { t: 0.00, d: 0.08, midi: 64, vel: 0.27 },   // +12の倍音
    { t: 0.01, d: 0.13, midi: 100, vel: 0.33 },  // 音域外
    { t: 0.51, d: 0.50, midi: 52, vel: 0.75 },   // 余韻の再検出(前の音の終わりに連続・弱い)
    { t: 2.00, d: 0.20, midi: 57, vel: 0.70 },
    { t: 2.20, d: 0.20, midi: 57, vel: 0.90 }    // 強い再アタックは残す
  ];
  var r = Core.cleanup(raw, {});
  var s = r.notes.map(function (n) { return n.midi + "@" + n.t; }).join(" ");
  ok("cleanup: overtone, range, merge, re-attack", r.dropped.overtone === 1 && r.dropped.range === 1 && r.dropped.merged === 1 && r.notes.length === 3, s + " " + JSON.stringify(r.dropped));
  ok("cleanup: merged note is extended", Math.abs(r.notes[0].d - 1.01) < 1e-9, "d=" + r.notes[0].d);
  var r2 = Core.cleanup([{ t: 0, d: 0.5, midi: 52, vel: 0.8 }, { t: 0, d: 0.5, midi: 64, vel: 0.7 }], {});
  ok("cleanup: strong octave double stays", r2.notes.length === 2);
})();

(function () {
  var r = Core.cleanup([
    { t: 0.0, d: 1.0, midi: 57, vel: 0.8 },
    { t: 0.0, d: 0.2, midi: 85, vel: 0.3 },    // +28(同時)
    { t: 0.4, d: 0.1, midi: 69, vel: 0.25 },   // +12(遅れて立ち上がる倍音)
    { t: 0.5, d: 0.3, midi: 69, vel: 0.7 },    // 強い同音は残す(別の音として弾かれた)
    { t: 3.0, d: 0.1, midi: 69, vel: 0.25 }    // 低い音が鳴り終わった後は倍音扱いしない
  ], {});
  ok("cleanup: late/high harmonics removed, real notes kept", r.dropped.overtone === 2 && r.notes.length === 3, JSON.stringify(r.dropped) + " kept=" + r.notes.map(function (n) { return n.midi + "@" + n.t; }).join(" "));
})();

// 6) mergeEdited
(function () {
  var fresh = [{ id: 1, t: 1, d: 0.3, midi: 60 }, { id: 2, t: 2, d: 0.3, midi: 62 }];
  var old = [{ id: 9, t: 1.02, d: 0.3, midi: 60, string: 2, fret: 1, edited: true }, { id: 10, t: 5, d: 0.3, midi: 70, hidden: true }];
  var m = Core.mergeEdited(fresh, old);
  ok("mergeEdited keeps edits and adds unmatched", m.length === 3 && m.some(function (n) { return n.id === 9; }) && !m.some(function (n) { return n.id === 1; }));
})();

// 7) 速度: 5000音
(function () {
  var notes = makePhrase(4000);
  var t0 = Date.now(); Core.assign(notes, {}); var ms = Date.now() - t0;
  ok("assign speed (" + notes.length + " notes)", ms < 3000, ms + " ms");
})();

console.log(fails ? "\nFAILED: " + fails : "\nALL OK");
process.exit(fails ? 1 : 0);
