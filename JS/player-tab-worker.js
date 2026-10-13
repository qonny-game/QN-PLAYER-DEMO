// player-tab-worker.js — Tab採譜のWorker(classic worker)。入力は22050Hzモノラルの Float32Array。出力は生のノート [開始秒, 長さ秒, midi, 強さ] の配列。
// 注意: AudioBuffer/AudioContextはWorkerに無いので、デコードとリサンプルはメインスレッド(player-tab.js)で済ませてから渡す。
"use strict";
var BASE = self.location.href.replace(/[^\/]*$/, "");
var L = null, bp = null, running = false;

function post(m) { self.postMessage(m); }

function load() {
  if (L) return;
  importScripts(BASE + "basic-pitch/qn-basic-pitch.js");
  L = self.QNBasicPitchLib;
}

self.onmessage = function (e) {
  var m = e.data;
  if (m.type !== "run" || running) return;
  running = true;
  var frames = [], onsets = [];
  Promise.resolve().then(function () {
    load();
    return L.tf.ready();
  }).then(function () {
    post({ type: "backend", name: L.tf.getBackend() });
    if (!bp) bp = new L.BasicPitch(BASE + "basic-pitch/model/model.json");
    return bp.evaluateModel(m.samples, function (f, o) {
      for (var i = 0; i < f.length; i++) { frames.push(f[i]); onsets.push(o[i]); } // contours(ピッチベンド用)は使わないので溜めない
    }, function (p) { post({ type: "progress", p: p }); });
  }).then(function () {
    var p = m.params || {};
    var notes = L.noteFramesToTime(L.outputToNotesPoly(frames, onsets, p.onset, p.frame, p.minFrames));
    var out = notes.map(function (n) { return [n.startTimeSeconds, n.durationSeconds, n.pitchMidi, n.amplitude]; });
    post({ type: "done", notes: out, frames: frames.length });
  }).catch(function (err) {
    post({ type: "error", message: (err && err.message) || String(err) });
  }).then(function () { running = false; });
};
