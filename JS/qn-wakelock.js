// qn-wakelock.js — 再生中のスクリーンWake Lock＋PLAYERのバックグラウンド再生維持。非対応環境は何もしない。公開: window.QNWake.set(理由キー, true/false)。PLAYER(audio)/YouTube再生中に保持、一時停止・終了・画面非表示で解放(復帰で再取得)
(function () {
  "use strict";
  // PLAYERのバックグラウンド再生が再び止まるならWAKE_FOR_PLAYERをfalseに(YouTube側は影響なし)
  var ENABLE_WAKE_LOCK = true;
  var WAKE_FOR_PLAYER = true;
  var reasons = {};
  var sentinel = null;
  var pending = false;

  function wanted() {
    for (var k in reasons) if (reasons[k]) return true;
    return false;
  }

  function release() {
    if (!sentinel) return;
    try { sentinel.release(); } catch (e) {}
    sentinel = null;
  }

  function acquire() {
    if (!ENABLE_WAKE_LOCK || sentinel || pending) return;
    if (!("wakeLock" in navigator) || document.visibilityState !== "visible") return;
    pending = true;
    navigator.wakeLock.request("screen").then(function (s) {
      pending = false;
      sentinel = s;
      s.addEventListener("release", function () { if (sentinel === s) sentinel = null; });
      if (!wanted()) release();
    }).catch(function () { pending = false; });
  }

  function sync() { if (wanted()) acquire(); else release(); }

  function set(key, on) {
    if (key === "player" && !WAKE_FOR_PLAYER) on = false;
    reasons[key] = !!on;
    sync();
  }

  // 隠れる時はOSに任せず自分から先に解放(バックグラウンド再生を邪魔しない)
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") sync(); else release();
  });
  window.addEventListener("pagehide", release);
  window.addEventListener("pageshow", function () { if (document.visibilityState === "visible") sync(); });

  function hookAudio() {
    if (typeof audio === "undefined" || !audio || !audio.addEventListener) return false;
    audio.addEventListener("play", function () { set("player", true); });
    audio.addEventListener("playing", function () { set("player", true); });
    audio.addEventListener("pause", function () { set("player", false); });
    audio.addEventListener("ended", function () { set("player", false); });
    if (!audio.paused) set("player", true);
    return true;
  }

  // PLAYER再生中は画面ロック/別アプリでも鳴らし続ける: navigator.audioSession.type="playback"を設定。EQ/Speed/KeyでAudioContext経由の時、OSに止められ得るので、復帰時に再生中なのに止まっていれば再開。ロック画面操作(mediaSession)はplayer-ui-shared.jsで設定済み。YouTubeは対象外(規約: 隠れている間は再生しない)
  try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}

  function keepAudioAlive() {
    try {
      if (typeof audio === "undefined" || !audio || audio.paused) return;
      var ctx = window.__qnAudioCtx;
      if (ctx && ctx.state !== "running") ctx.resume().catch(function () {});
    } catch (e) {}
  }
  document.addEventListener("visibilitychange", keepAudioAlive);
  window.addEventListener("pagehide", keepAudioAlive);
  window.addEventListener("pageshow", keepAudioAlive);

  window.QNWake = { set: set };
  if (!hookAudio()) document.addEventListener("DOMContentLoaded", hookAudio);
})();
