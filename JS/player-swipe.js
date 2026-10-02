// player-swipe.js — PLAYERのLibrary/Markers一覧(SP幅)の横スワイプボタン。実体は qn-apps.js の QNApps.swipeRows。YouTube側は qn-app-youtube.js で同じ仕組みを使う
(function () {
  "use strict";

  function bind() {
    if (!window.QNApps || typeof window.QNApps.swipeRows !== "function") return;
    var box = document.getElementById("playlistBox");
    var pins = document.getElementById("pinList");
    function inEdit(cls) {
      var b = document.getElementById("pcV2PanelBody");
      return !!(b && b.classList.contains(cls));
    }
    function idxOf(row) { return parseInt(row.dataset.index, 10); }

    if (box) {
      window.QNApps.swipeRows(box, {
        rowSel: ".playlistItem[data-index]:not(.is-nowplaying)",
        disabled: function () { return inEdit("playlist-edit-mode"); },
        actions: function (row) {
          var i = idxOf(row), t = (typeof playlist !== "undefined") ? playlist[i] : null;
          if (!t) return [];
          return [
            { kind: "edit", run: function () { var b = row.querySelector(".playlist-hover-edit-btn"); if (b) b.click(); } },
            { kind: "skip", on: !t.enabled, run: function () { t.enabled = !t.enabled; renderPlaylist(); persistPlaylistOrder(); } },
            { kind: "del", run: function () { removeTrackAt(idxOf(row)); } }
          ];
        }
      });
    }
    if (pins) {
      window.QNApps.swipeRows(pins, {
        rowSel: ".pinItem",
        disabled: function () { return inEdit("markers-edit-mode"); },
        actions: function (row) {
          var disabled = row.classList.contains("disabled");
          return [
            { kind: "edit", run: function () { var b = row.querySelector(".pin-edit-btn"); if (b) b.click(); } },
            { kind: "hide", on: disabled, run: function () { var b = row.querySelector(".toggle-btn"); if (b && !b.disabled) b.click(); } },
            { kind: "del", run: function () { var d = row.querySelector(".del-btn"); if (d) { d.click(); d.click(); } } }
          ];
        }
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
