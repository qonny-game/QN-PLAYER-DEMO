// qn-settings-ui.js — 設定パネルの共通部品(PLAYER本体=player-ui-pc-v2.js / アプリ=qn-apps.jsの「Settings」が共用)。見た目はCSS/style-settings.css。
// 使い方: const ui = QNSettingsUI.build([{ title, rows:[ {label,hint,type:"stepper",values(),get(),set(v),fmt(v)} | {label,hint,type:"switch",get(),set(on)} | {label,hint,type:"node",node} | {label,hint,type:"range",min,max,step,dec,unit,get(),set(v),mark,markLabel}(連続値のバー。markで既定値に縦線とmarkLabelを表示、ダブルクリック/ダブルタップでmarkへ戻す。項目名・説明は上、バーと値は下の段) | {label,type:"note"}(説明文だけ。操作部なし) ] }]); host.appendChild(ui.el); 値が変わりうる時 ui.sync()。
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
    transfer: '<path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>',
    guide: '<path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>'
  };
  var LABELS = { backup: "Backup", import: "Import", color: "Color", keyboard: "Keyboard", transfer: "Transfer", guide: "Guide" };

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

  function syncInfo(i) {
    var d = i.def;
    if (d.type === "stepper") {
      var vals = d.values(), cur = d.get();
      i.ctl.querySelector(".qn-stepper-val").textContent = d.fmt ? d.fmt(cur) : String(cur);
      i.ctl.querySelector('[data-d="-1"]').disabled = vals.length < 2; // 端でループするので無効にしない(v3.61.0)
      i.ctl.querySelector('[data-d="1"]').disabled = vals.length < 2;
    } else if (d.type === "slider") {
      var sv = d.values(), sc = Math.max(0, sv.indexOf(d.get())), inp = i.ctl.querySelector("input");
      inp.min = "0"; inp.max = String(Math.max(0, sv.length - 1)); inp.step = "1";
      if (document.activeElement !== inp || +inp.value !== sc) inp.value = String(sc);
      i.ctl.querySelector(".qn-set-slider-val").textContent = d.fmt ? d.fmt(sv[sc]) : String(sv[sc]);
      inp.style.setProperty("--p", sv.length > 1 ? (sc / (sv.length - 1) * 100) + "%" : "0%");
    } else if (d.type === "range") {
      var rv = d.get(), rin = i.ctl.querySelector("input");
      rin.min = String(d.min); rin.max = String(d.max); rin.step = String(d.step);
      if (+rin.value !== rv) rin.value = String(rv);
      rangeView(i.ctl, d, rv);
    } else if (d.type === "switch") {
      var on = !!d.get();
      i.ctl.classList.toggle("is-on", on);
      i.ctl.setAttribute("aria-checked", on ? "true" : "false");
    }
    if (d.disabledWhen) i.row.classList.toggle("is-disabled", !!d.disabledWhen());
  }

  // 連続値バーの見た目(値の表示とつまみ位置の塗り)
  function rangeView(ctl, d, v) {
    var inp = ctl.querySelector("input");
    ctl.querySelector(".qn-set-range-val").textContent = (d.dec ? Number(v).toFixed(d.dec) : String(v)) + (d.unit || "");
    inp.style.setProperty("--p", d.max > d.min ? ((v - d.min) / (d.max - d.min) * 100) + "%" : "0%");
    var mk = ctl.querySelector(".qn-set-range-mark");
    if (mk) {
      mk.style.setProperty("--m", d.max > d.min ? ((d.mark - d.min) / (d.max - d.min)) : 0);
      mk.classList.toggle("is-on", Math.abs(v - d.mark) < (d.step || 1) / 2);
    }
  }

  // ボタンが行の操作部なら値を変えてtrueを返す(build/inline共通)
  function applyClick(infos, btn) {
    for (var k = 0; k < infos.length; k++) {
      var i = infos[k], d = i.def;
      if (!i.ctl || !i.ctl.contains(btn)) continue;
      if (d.type === "stepper" && btn.dataset.d) {
        var vals = d.values(), n = vals.indexOf(d.get()) + parseInt(btn.dataset.d, 10);
        if (vals.length > 1) { n = (n + vals.length) % vals.length; haptic(); d.set(vals[n]); } // 端でループ(v3.61.0)
      } else if (d.type === "switch") {
        haptic();
        d.set(!d.get());
      }
      return true;
    }
    return false;
  }

  function newControl(r) {
    if (r.type === "stepper") return stepper();
    if (r.type === "slider") return make('<div class="qn-set-slider"><input type="range" class="qn-set-range" aria-label=""><span class="qn-set-slider-val"></span></div>');
    if (r.type === "switch") return make('<button type="button" class="qn-set-switch" role="switch" aria-checked="false"><span></span></button>');
    return null;
  }

  function build(sections) {
    var root = make('<div class="qn-set-body"></div>');
    var rowsInfo = [];
    sections.forEach(function (sec) {
      var secEl = make('<div class="qn-set-sec"><div class="qn-set-sec-title"></div></div>');
      secEl.querySelector(".qn-set-sec-title").textContent = sec.title;
      sec.rows.forEach(function (r) {
        if (r.type === "note") { var note = make('<div class="qn-set-note"></div>'); note.textContent = r.label; secEl.appendChild(note); return; }
        var rowEl = make('<div class="qn-set-row"><div class="qn-set-label"><span></span><small></small></div><div class="qn-set-ctl"></div></div>');
        rowEl.querySelector(".qn-set-label span").textContent = r.label;
        var sm = rowEl.querySelector("small");
        if (r.hint) sm.textContent = r.hint; else sm.remove();
        var ctl = rowEl.querySelector(".qn-set-ctl");
        var info = { def: r, row: rowEl };
        if (r.type === "stepper") { info.ctl = stepper(); ctl.appendChild(info.ctl); }
        else if (r.type === "switch") { info.ctl = make('<button type="button" class="qn-set-switch" role="switch" aria-checked="false"><span></span></button>'); ctl.appendChild(info.ctl); }
        else if (r.type === "range") {
          rowEl.classList.add("is-range");
          info.ctl = make('<div class="qn-set-range-wrap"><div class="qn-set-range-box"><input type="range" class="qn-set-range" aria-label=""></div><span class="qn-set-range-val"></span></div>');
          if (typeof r.mark === "number") {
            var mk = make('<span class="qn-set-range-mark"><i></i><b></b></span>');
            mk.querySelector("b").textContent = r.markLabel || "";
            info.ctl.querySelector(".qn-set-range-box").appendChild(mk);
            if (typeof bindDoubleReset === "function") bindDoubleReset(info.ctl.querySelector("input"), function () { r.set(r.mark); sync(); if (sections.onChange) sections.onChange(); });
          }
          info.ctl.querySelector("input").setAttribute("aria-label", r.label);
          rowEl.appendChild(info.ctl);
          ctl.remove();
        }
        else if (r.type === "node" && r.node) ctl.appendChild(r.node);
        rowsInfo.push(info);
        secEl.appendChild(rowEl);
      });
      root.appendChild(secEl);
    });

    function sync() { rowsInfo.forEach(syncInfo); }

    root.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest("button") : null;
      if (!btn || !applyClick(rowsInfo, btn)) return;
      sync();
      if (sections.onChange) sections.onChange();
    });
    // 連続値バー: つまみを動かすたびに値を反映(行の表示はsyncで揃える)
    root.addEventListener("input", function (e) {
      var inp = e.target;
      if (!inp || !inp.classList || !inp.classList.contains("qn-set-range")) return;
      for (var k = 0; k < rowsInfo.length; k++) {
        var i = rowsInfo[k];
        if (!i.ctl || !i.ctl.contains(inp) || i.def.type !== "range") continue;
        var v = parseFloat(inp.value);
        if (!isNaN(v)) i.def.set(v);
        break;
      }
      sync();
      if (sections.onChange) sections.onChange();
    });
    sync();
    return { el: root, sync: sync };
  }

  // ラベル+操作部だけを横に並べた小さな帯(波形エリアの常時表示用)。rowsはbuildと同じ定義({label,type,values,get,set,fmt})。変更後にonChange()
  function inline(rows, onChange) {
    var root = make('<div class="qn-set-inline"></div>');
    var infos = [];
    rows.forEach(function (r) {
      var item = make('<div class="qn-set-inline-item"><span class="qn-set-inline-label"></span></div>');
      item.querySelector("span").textContent = r.label;
      if (r.type === "slider") item.classList.add("is-slider");
      if (r.cls) item.classList.add(r.cls); // 項目ごとの追加クラス(見た目の微調整用)
      if (r.spHide) item.classList.add("qn-sp-hide"); // スマホ幅では出さない項目(Settingsパネルには残る)
      var ctl = newControl(r);
      if (ctl) item.appendChild(ctl);
      // action: {label,title,run} = スライダー横の小ボタン(Fitなど)。値は変えず run() を呼ぶだけ
      if (r.action) {
        var ab = make('<button type="button" class="qn-set-fit"></button>');
        ab.textContent = r.action.label; if (r.action.title) ab.title = r.action.title;
        item.classList.add("has-fit"); item.appendChild(ab);
      }
      infos.push({ def: r, row: item, ctl: ctl });
      root.appendChild(item);
    });
    function sync() { infos.forEach(syncInfo); }
    function onClick(e) {
      var btn = e.target.closest ? e.target.closest("button") : null;
      if (btn && btn.classList.contains("qn-set-fit")) {
        for (var k = 0; k < infos.length; k++) {
          if (infos[k].def.action && infos[k].row.contains(btn)) { haptic(); infos[k].def.action.run(); sync(); if (onChange) onChange(); break; }
        }
        return;
      }
      if (!btn || !applyClick(infos, btn)) return;
      sync();
      if (onChange) onChange();
    }
    root.addEventListener("click", onClick);
    // スライダー(FAB帯専用。設定パネルの行は従来どおり「‹ 値 ›」): つまみの位置=values()の添字。1段ごとに触覚フィードバック
    root.addEventListener("input", function (e) {
      var inp = e.target;
      if (!inp || !inp.classList || !inp.classList.contains("qn-set-range")) return;
      for (var k = 0; k < infos.length; k++) {
        var i = infos[k];
        if (!i.ctl || !i.ctl.contains(inp) || i.def.type !== "slider") continue;
        var vals = i.def.values(), v = vals[parseInt(inp.value, 10)];
        if (v !== undefined && v !== i.def.get()) { haptic(); i.def.set(v); }
        break;
      }
      sync();
      if (onChange) onChange();
    });
    sync();
    return { el: root, sync: sync, onClick: onClick };   // onClick: 項目を別の場所へ移した時、その入れ物のclickから呼ぶ(移した項目はrootの外になるため)
  }

  // 階層に入る行の一覧(Backup/Import/Color/Keyboard/Transfer/Guide)。onPick(id)。Guideだけは別タブでguide/index.htmlを開く(再生を止めない。onPickは呼ばない)
  function list(ids, onPick) {
    var wrap = make('<div class="qn-set-sec"><div class="qn-set-sec-title">More</div><div class="qn-set-list"></div></div>');
    var host = wrap.querySelector(".qn-set-list");
    ids.forEach(function (id) {
      var b = make('<button type="button" class="qn-set-list-item" data-panel-id="' + id + '"><svg class="qn-set-list-ico" viewBox="0 0 24 24">' + ICONS[id] + '</svg><span></span><svg class="qn-set-list-chev" viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg></button>');
      b.querySelector("span").textContent = LABELS[id];
      b.addEventListener("click", function () { haptic(); if (id === "guide") { window.open("guide/index.html", "_blank", "noopener"); return; } onPick(id); });
      host.appendChild(b);
    });
    return wrap;
  }

  function backButton(onClick) {
    var back = make('<button type="button" class="pcv2-panel-back" title="Back" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg></button>');
    back.addEventListener("click", function () { haptic(); onClick(); });
    return back;
  }

  // 利用規約・プライバシーポリシーへのリンク(設定の最下段、バージョン表記の上)。別タブで開く(再生を止めない)。ページはルート直下のterms.html / privacy.html
  function legalLinks() {
    var d = make('<div class="qn-set-legal"><a href="terms.html" target="_blank" rel="noopener">Terms of Service</a><a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a></div>');
    d.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("a")) haptic(); });
    return d;
  }

  // 設定の最下段に出すバージョン表記(SPではヘッダーのバージョンを省くため、ここで確認できる)
  function versionLine() {
    var d = make('<div class="qn-set-version"></div>');
    d.textContent = "QNPLAYER v" + (window.QN_APP_VERSION || "");
    return d;
  }

  return { legalLinks: legalLinks, versionLine: versionLine, build: build, inline: inline, list: list, backButton: backButton, LABELS: LABELS, ICONS: ICONS };
})();
