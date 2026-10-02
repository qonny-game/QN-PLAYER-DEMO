// qn-settings-ui.js — 設定パネルの共通部品(PLAYER本体=player-ui-pc-v2.js / アプリ=qn-apps.jsの「Settings」が共用)。見た目はCSS/style-settings.css。
// 使い方: const ui = QNSettingsUI.build([{ title, rows:[ {label,hint,type:"stepper",values(),get(),set(v),fmt(v)} | {label,hint,type:"switch",get(),set(on)} | {label,hint,type:"node",node} ] }]); host.appendChild(ui.el); 値が変わりうる時 ui.sync()。
// 行には disabledWhen():boolean を付けられる(trueの間は薄く操作不可)。階層に入る一覧は QNSettingsUI.list([{id,label,icon}], onPick)。
// ルール(GOTCHAS.md): 複数選択肢は必ず「‹ 値 ›」(stepper)、ON/OFFだけswitch。独自のボタン列やデザインを新設しない。依存なし(hapticTapがあれば使う)。
window.QNSettingsUI = (function () {
  "use strict";
  var CHEV_L = '<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
  var CHEV_R = '<svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>';

  var ICONS = {
    backup: '<path d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13zM8 13h8v2H8v-2zm0 4h5v2H8v-2z"/>',
    import: '<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>',
    color: '<path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.09-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>',
    keyboard: '<path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM11 8h2v2h-2V8zM11 11h2v2h-2v-2zM8 8h2v2H8V8zM8 11h2v2H8v-2zM5 8h2v2H5V8zm0 3h2v2H5v-2zm10 6H9v-2h6v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/>',
    transfer: '<path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>'
  };
  var LABELS = { backup: "Backup", import: "Import", color: "Color", keyboard: "Keyboard", transfer: "Transfer" };

  function haptic() { if (typeof hapticTap === "function") { try { hapticTap(); } catch (e) {} } }

  function make(html) {
    var t = document.createElement("div");
    t.innerHTML = html.trim();
    return t.firstChild;
  }

  function stepper() {
    return make('<div class="qn-stepper"><button type="button" class="qn-stepper-btn" data-d="-1" aria-label="Previous">' + CHEV_L +
      '</button><span class="qn-stepper-val"></span><button type="button" class="qn-stepper-btn" data-d="1" aria-label="Next">' + CHEV_R + '</button></div>');
  }

  function build(sections) {
    var root = make('<div class="qn-set-body"></div>');
    var rowsInfo = [];
    sections.forEach(function (sec) {
      var secEl = make('<div class="qn-set-sec"><div class="qn-set-sec-title"></div></div>');
      secEl.querySelector(".qn-set-sec-title").textContent = sec.title;
      sec.rows.forEach(function (r) {
        var rowEl = make('<div class="qn-set-row"><div class="qn-set-label"><span></span><small></small></div><div class="qn-set-ctl"></div></div>');
        rowEl.querySelector(".qn-set-label span").textContent = r.label;
        var sm = rowEl.querySelector("small");
        if (r.hint) sm.textContent = r.hint; else sm.remove();
        var ctl = rowEl.querySelector(".qn-set-ctl");
        var info = { def: r, row: rowEl };
        if (r.type === "stepper") { info.ctl = stepper(); ctl.appendChild(info.ctl); }
        else if (r.type === "switch") { info.ctl = make('<button type="button" class="qn-set-switch" role="switch" aria-checked="false"><span></span></button>'); ctl.appendChild(info.ctl); }
        else if (r.type === "node" && r.node) ctl.appendChild(r.node);
        rowsInfo.push(info);
        secEl.appendChild(rowEl);
      });
      root.appendChild(secEl);
    });

    function sync() {
      rowsInfo.forEach(function (i) {
        var d = i.def;
        if (d.type === "stepper") {
          var vals = d.values(), cur = d.get(), idx = vals.indexOf(cur);
          i.ctl.querySelector(".qn-stepper-val").textContent = d.fmt ? d.fmt(cur) : String(cur);
          i.ctl.querySelector('[data-d="-1"]').disabled = idx <= 0;
          i.ctl.querySelector('[data-d="1"]').disabled = idx < 0 || idx >= vals.length - 1;
        } else if (d.type === "switch") {
          var on = !!d.get();
          i.ctl.classList.toggle("is-on", on);
          i.ctl.setAttribute("aria-checked", on ? "true" : "false");
        }
        if (d.disabledWhen) i.row.classList.toggle("is-disabled", !!d.disabledWhen());
      });
    }

    root.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest("button") : null;
      if (!btn) return;
      for (var k = 0; k < rowsInfo.length; k++) {
        var i = rowsInfo[k], d = i.def;
        if (!i.ctl || !i.ctl.contains(btn)) continue;
        if (d.type === "stepper" && btn.dataset.d) {
          var vals = d.values(), n = vals.indexOf(d.get()) + parseInt(btn.dataset.d, 10);
          if (n >= 0 && n < vals.length) { haptic(); d.set(vals[n]); }
        } else if (d.type === "switch") {
          haptic();
          d.set(!d.get());
        }
        sync();
        if (sections.onChange) sections.onChange();
        return;
      }
    });
    sync();
    return { el: root, sync: sync };
  }

  // 階層に入る行の一覧(Backup/Import/Color/Keyboard/Transfer)。onPick(id)
  function list(ids, onPick) {
    var wrap = make('<div class="qn-set-sec"><div class="qn-set-sec-title">More</div><div class="qn-set-list"></div></div>');
    var host = wrap.querySelector(".qn-set-list");
    ids.forEach(function (id) {
      var b = make('<button type="button" class="qn-set-list-item" data-panel-id="' + id + '"><svg class="qn-set-list-ico" viewBox="0 0 24 24">' + ICONS[id] + '</svg><span></span><svg class="qn-set-list-chev" viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg></button>');
      b.querySelector("span").textContent = LABELS[id];
      b.addEventListener("click", function () { haptic(); onPick(id); });
      host.appendChild(b);
    });
    return wrap;
  }

  function backButton(onClick) {
    var back = make('<button type="button" class="pcv2-panel-back" title="Back" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg></button>');
    back.addEventListener("click", function () { haptic(); onClick(); });
    return back;
  }

  // 設定の最下段に出すバージョン表記(SPではヘッダーのバージョンを省くため、ここで確認できる)
  function versionLine() {
    var d = make('<div class="qn-set-version"></div>');
    d.textContent = "QNPLAYER v" + (window.QN_APP_VERSION || "");
    return d;
  }

  return { versionLine: versionLine, build: build, list: list, backButton: backButton, LABELS: LABELS, ICONS: ICONS };
})();
