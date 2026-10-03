// player-marker-presets.js — player-markers.jsの続き: メモのプリセット/自動カラー(Marker Memo Colors)/カスタムプリセット/startPinMemoEdit。player-markers.jsの直後に読み込む(グローバル共有)

const MARKER_PRESET_COLORS_KEY = "qn_marker_preset_colors_v1";
const MARKER_PRESET_COLOR_DEFAULTS = {
  "Intro": "emerald",
  "Verse": "sky",
  "Pre-chorus": "violet",
  "Chorus": "red",
  "Last Chorus": "pink",
  "Bridge": "lime",
  "Solo": "amber",
  "Outro": "indigo"
};

const MARKER_CUSTOM_PRESETS_KEY = "qn_marker_custom_presets_v1";
const MARKER_CUSTOM_PRESET_MAX = 30;
const MARKER_CUSTOM_LABEL_MAXLEN = 30;

function loadMarkerCustomPresets() {
  let arr = [];
  try {
    const raw = localStorage.getItem(MARKER_CUSTOM_PRESETS_KEY);
    if (raw) arr = JSON.parse(raw);
  } catch (e) { arr = []; }
  if (!Array.isArray(arr)) arr = [];
  return arr
    .filter(x => x && typeof x.label === "string" && x.label.trim())
    .map(x => ({ label: x.label.trim().slice(0, MARKER_CUSTOM_LABEL_MAXLEN), color: x.color || null }))
    .slice(0, MARKER_CUSTOM_PRESET_MAX);
}

function saveMarkerCustomPresets(list) {
  const clean = list
    .filter(x => x && x.label && x.label.trim())
    .map(x => ({ label: x.label.trim(), color: x.color || null }));
  try { localStorage.setItem(MARKER_CUSTOM_PRESETS_KEY, JSON.stringify(clean)); } catch (e) {}
}

function getValidMarkerCustomPresets() {
  const seen = new Set(MARKER_LABEL_PRESETS.map(l => l.toLowerCase()));
  const out = [];
  loadMarkerCustomPresets().forEach(x => {
    const k = x.label.toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    out.push(x);
  });
  return out;
}

function getAllMarkerPresetLabels() {
  return MARKER_LABEL_PRESETS.concat(getValidMarkerCustomPresets().map(x => x.label));
}

function getMarkerPresetColors() {
  let saved = {};
  try {
    const raw = localStorage.getItem(MARKER_PRESET_COLORS_KEY);
    if (raw) saved = JSON.parse(raw) || {};
  } catch (e) { saved = {}; }
  const result = {};
  MARKER_LABEL_PRESETS.forEach(label => {
    result[label] = Object.prototype.hasOwnProperty.call(saved, label)
      ? saved[label]
      : (MARKER_PRESET_COLOR_DEFAULTS[label] || null);
  });
  getValidMarkerCustomPresets().forEach(x => { result[x.label] = x.color || null; });
  return result;
}

function setMarkerPresetColor(label, colorName) {
  const current = getMarkerPresetColors();
  current[label] = colorName || null;
  try { localStorage.setItem(MARKER_PRESET_COLORS_KEY, JSON.stringify(current)); } catch (e) {}
}

function renderMarkerPresetColorSettings() {
  const rowsEl = document.getElementById("qnMarkerPresetColorRows");
  if (!rowsEl) return;
  rowsEl.innerHTML = "";
  const colors = getMarkerPresetColors();
  MARKER_LABEL_PRESETS.forEach(label => {
    const colorName = colors[label];
    const hex = colorName && MARKER_COLOR_PALETTE[colorName] ? MARKER_COLOR_PALETTE[colorName] : null;

    const row = document.createElement("div");
    row.className = "qn-marker-preset-color-row";

    const name = document.createElement("span");
    name.className = "qn-marker-preset-color-name";
    name.textContent = label;

    const swatchBtn = document.createElement("button");
    swatchBtn.type = "button";
    swatchBtn.className = "marker-color-swatch qn-marker-preset-color-swatch" + (hex ? "" : " marker-color-none");
    swatchBtn.title = hex ? colorName : "No color";
    if (hex) swatchBtn.style.background = hex;
    swatchBtn.onclick = (e) => {
      e.stopPropagation();
      if (typeof hapticTap === "function") hapticTap();
      openColorChoicePopup(swatchBtn, colorName || null, (picked) => {
        setMarkerPresetColor(label, picked);
        renderMarkerPresetColorSettings();
      });
    };

    row.appendChild(name);
    row.appendChild(swatchBtn);
    rowsEl.appendChild(row);
  });

  // ---------- カスタム行（入力欄＋色）。末尾には常に空欄の行を1つ置く ----------
  const customs = loadMarkerCustomPresets();
  customs.push({ label: "", color: null });
  const state = customs;

  function persist() { saveMarkerCustomPresets(state); }

  function buildCustomRow(entry) {
    const row = document.createElement("div");
    row.className = "qn-marker-preset-color-row qn-marker-custom-row";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "qn-marker-custom-input";
    input.placeholder = "Custom memo";
    input.maxLength = MARKER_CUSTOM_LABEL_MAXLEN;
    input.value = entry.label;
    input.setAttribute("aria-label", "Custom memo text");

    const swatchBtn = document.createElement("button");
    swatchBtn.type = "button";
    swatchBtn.className = "marker-color-swatch qn-marker-preset-color-swatch";
    function paint() {
      const hex = entry.color && MARKER_COLOR_PALETTE[entry.color] ? MARKER_COLOR_PALETTE[entry.color] : null;
      swatchBtn.classList.toggle("marker-color-none", !hex);
      swatchBtn.style.background = hex || "";
      swatchBtn.title = hex ? entry.color : "No color";
    }
    paint();
    swatchBtn.onclick = (e) => {
      e.stopPropagation();
      if (typeof hapticTap === "function") hapticTap();
      openColorChoicePopup(swatchBtn, entry.color || null, (picked) => {
        entry.color = picked || null;
        paint();
        persist();
      });
    };

    input.addEventListener("input", () => {
      entry.label = input.value;
      persist();
      if (entry === state[state.length - 1] && entry.label.trim() && state.length < MARKER_CUSTOM_PRESET_MAX + 1) {
        const blank = { label: "", color: null };
        state.push(blank);
        rowsEl.appendChild(buildCustomRow(blank));
      }
    });
    input.addEventListener("change", () => {
      const last = state[state.length - 1];
      const hasEmptyMiddle = state.some((x, i) => i < state.length - 1 && !x.label.trim());
      if (hasEmptyMiddle || (last && last.label.trim())) renderMarkerPresetColorSettings();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); input.blur(); }
      e.stopPropagation();
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "qn-marker-custom-del";
    delBtn.title = "Delete";
    delBtn.setAttribute("aria-label", "Delete custom memo");
    delBtn.textContent = "\u00d7";
    function syncDel() { delBtn.style.visibility = entry.label.trim() ? "visible" : "hidden"; }
    syncDel();
    input.addEventListener("input", syncDel);
    delBtn.onclick = (e) => {
      e.stopPropagation();
      if (typeof hapticTap === "function") hapticTap();
      const i = state.indexOf(entry);
      if (i >= 0) state.splice(i, 1);
      persist();
      renderMarkerPresetColorSettings();
    };

    row.appendChild(input);
    row.appendChild(swatchBtn);
    row.appendChild(delBtn);
    return row;
  }

  customs.forEach(entry => rowsEl.appendChild(buildCustomRow(entry)));
}
renderMarkerPresetColorSettings();
document.addEventListener("DOMContentLoaded", renderMarkerPresetColorSettings);

var activePinMemoPresetPopup = null; // var: renderPinList()から先に参照され得る(TDZ回避)
function closePinMemoPresetPopup() {
  if (activePinMemoPresetPopup) {
    activePinMemoPresetPopup.popup.remove();
    window.removeEventListener("scroll", activePinMemoPresetPopup.reposition, true);
    window.removeEventListener("resize", activePinMemoPresetPopup.reposition);
    activePinMemoPresetPopup = null;
  }
}

// プリセットポップアップを入力欄に重ねず、広い側(下/上)に置く。収まらない分はポップアップ内スクロール。キーボード表示中はvisualViewportの範囲で計算
function qnPlacePresetPopup(input, popup) {
  const vv = window.visualViewport;
  const vTop = vv ? vv.offsetTop : 0;
  const vBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
  const vLeft = vv ? vv.offsetLeft : 0;
  const vRight = vv ? vv.offsetLeft + vv.width : window.innerWidth;
  const r = input.getBoundingClientRect();
  popup.style.maxHeight = "";
  popup.style.maxWidth = Math.max(120, vRight - vLeft - 16) + "px";
  popup.style.overflowY = "auto";
  const h = popup.scrollHeight + 2;
  const below = vBottom - r.bottom - 12;
  const above = r.top - vTop - 12;
  let top, room;
  if (h <= below || below >= above) { top = r.bottom + 6; room = below; }
  else { room = above; top = r.top - 6 - Math.min(h, room); }
  popup.style.maxHeight = Math.max(60, room) + "px";
  const w = popup.offsetWidth;
  let left = r.left;
  if (left + w > vRight - 8) left = vRight - w - 8;
  left = Math.max(vLeft + 8, left);
  popup.style.top = Math.max(vTop + 4, top) + "px";
  popup.style.left = left + "px";
}

function startPinMemoEdit(itemDiv, infoSpan, pinObj, index) {
  if (itemDiv.querySelector(".pin-memo-input")) return;

  const input = document.createElement("input");
  input.type = "text";
  input.className = "pin-memo-input";
  input.value = pinObj.memo || "";
  input.placeholder = `${pinObj.t.toFixed(2)}s`;
  input.maxLength = 60;

  infoSpan.style.display = "none";
  infoSpan.parentNode.insertBefore(input, infoSpan);
  input.focus();
  input.select();
  // 【v3.53.1】編集中は一覧を再描画しない(再描画で入力欄とプリセットが消えるのを防ぐ)。終了時(commit/cancel/applyPreset)に解除
  window.qnPinMemoEditing = true;
  const startedAt = Date.now();

  const presetPopup = document.createElement("div");
  presetPopup.className = "pin-memo-preset-popup";
  const presetColors = getMarkerPresetColors();
  let presetPointerActive = false;

  let finished = false;
  function commit() {
    if (finished) return;
    finished = true;
    window.qnPinMemoEditing = false;
    closePinMemoPresetPopup();
    pinObj.memo = input.value.trim();
    savePins();
    renderPinList();
  }
  function cancel() {
    if (finished) return;
    finished = true;
    window.qnPinMemoEditing = false;
    closePinMemoPresetPopup();
    renderPinList();
  }
  function applyPreset(label) {
    if (finished) return;
    finished = true;
    window.qnPinMemoEditing = false;
    closePinMemoPresetPopup();
    pinObj.memo = label;
    const colorName = presetColors[label];
    let colorChanged = false;
    if (colorName && MARKER_COLOR_PALETTE[colorName]) {
      pinObj.color = colorName;
      colorChanged = true;
    }
    savePins();
    renderPinList();
    if (colorChanged) {
      renderPins();
      renderSegments();
    }
    if (typeof hapticTap === "function") hapticTap();
  }

  getAllMarkerPresetLabels().forEach(label => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "pin-memo-preset-chip";
    const colorName = presetColors[label];
    const hex = colorName && MARKER_COLOR_PALETTE[colorName] ? MARKER_COLOR_PALETTE[colorName] : null;
    if (hex) {
      const dot = document.createElement("span");
      dot.className = "pin-memo-preset-dot";
      dot.style.background = hex;
      chip.appendChild(dot);
    }
    chip.appendChild(document.createTextNode(label));
    chip.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      presetPointerActive = true;
      window.addEventListener("pointerup", () => {
        setTimeout(() => {
          if (!presetPointerActive) return;
          presetPointerActive = false;
          if (!finished && document.activeElement !== input) commit();
        }, 80);
      }, { once: true });
    });
    chip.addEventListener("click", (e) => {
      e.stopPropagation();
      presetPointerActive = false;
      applyPreset(label);
    });
    presetPopup.appendChild(chip);
  });
  presetPopup.addEventListener("click", e => e.stopPropagation());

  function reposition() {
    if (!input.isConnected) { closePinMemoPresetPopup(); return; }
    qnPlacePresetPopup(input, presetPopup);
  }

  closePinMemoPresetPopup();
  document.body.appendChild(presetPopup);
  activePinMemoPresetPopup = { popup: presetPopup, reposition };
  reposition();
  requestAnimationFrame(reposition);
  window.addEventListener("scroll", reposition, true);
  window.addEventListener("resize", reposition);
  if (window.visualViewport) { window.visualViewport.addEventListener("resize", reposition); window.visualViewport.addEventListener("scroll", reposition); }

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  });
  input.addEventListener("blur", () => {
    // 開いた直後(スワイプのトレイが閉じる/キーボードが出る間)の一瞬のblurは無視して入力欄に戻す
    if (!finished && Date.now() - startedAt < 400) { setTimeout(() => { if (!finished && input.isConnected) input.focus(); }, 0); return; }
    // iOSでpointerdownのpreventDefaultが効かない場合の対策: チップ押下中のblurでは確定しない(確定はapplyPreset())
    setTimeout(() => {
      if (presetPointerActive) return;
      commit();
    }, 0);
  });
  input.addEventListener("click", e => e.stopPropagation());
}

if (typeof swRegisterRefreshCallback === "function") {
  swRegisterRefreshCallback(() => {
    if (typeof renderPinList === "function") renderPinList();
    if (typeof renderPins === "function") renderPins();
  });
}
