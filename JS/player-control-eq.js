// player-control-eq.js — 10バンドEQ(バンド値/プリセット/ドラッグ描画/EQモーダル開閉)。依存: player-core.js(EQ_FREQS,setupAudioGraph), player-ui-shared.js(haptic*)


let eqEffectEnabled = true;

function setEqBandValue(bandIndex, gain) {
  gain = Math.max(-15, Math.min(15, Math.round(gain)));
  const slider = document.getElementById("eqBand" + bandIndex);
  const gainLabel = document.getElementById("eqGain" + bandIndex);
  if (slider) slider.value = gain;
  if (gainLabel) gainLabel.textContent = (gain > 0 ? "+" : "") + gain;
  const filter = eqFilters[bandIndex];
  if (filter) filter.gain.value = eqEffectEnabled ? gain : 0;
}

function setEqEffectEnabled(enabled) {
  eqEffectEnabled = enabled;
  for (let i = 0; i < EQ_FREQS.length; i++) {
    const slider = document.getElementById("eqBand" + i);
    const gain = slider ? parseFloat(slider.value) : 0;
    const filter = eqFilters[i];
    if (filter) filter.gain.value = eqEffectEnabled ? gain : 0;
  }
}

const eqLastTickValues = new Array(EQ_FREQS.length).fill(0);
for (let i = 0; i < EQ_FREQS.length; i++) {
  const slider = document.getElementById("eqBand" + i);
  if (slider) {
    slider.oninput = e => {
      const gain = parseFloat(e.target.value);
      if (gain !== eqLastTickValues[i]) {
        hapticTick();
        eqLastTickValues[i] = gain;
      }
      setEqBandValue(i, gain);
    };
  }
}

const EQ_PRESETS = {
  flat:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  bass:   [8, 7, 6, 4, 2, 0, 0, 0, 0, 0],
  vocal:  [-2, -2, -1, 1, 4, 5, 4, 2, 0, -1],
  treble: [0, 0, 0, 0, 0, 1, 3, 5, 6, 7],
  vshape: [7, 6, 3, 0, -3, -4, -3, 0, 4, 6]
};

function applyEqPreset(presetName) {
  const values = EQ_PRESETS[presetName];
  if (!values) return;
  values.forEach((gain, i) => setEqBandValue(i, gain));
}

function setActiveEqPresetButton(name) {
  document.querySelectorAll(".eq-preset-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-preset") === name);
  });
}

document.querySelectorAll(".eq-preset-btn").forEach(btn => {
  btn.onclick = () => {
    hapticTap();
    const preset = btn.getAttribute("data-preset");
    applyEqPreset(preset);
    setActiveEqPresetButton(preset);
  };
});

const controlEqResetBtn = document.getElementById("controlEqResetBtn");
if (controlEqResetBtn) {
  controlEqResetBtn.onclick = () => {
    hapticTap();
    applyEqPreset("flat");
    setActiveEqPresetButton("flat");
  };
}

const EQ_CUSTOM_PRESETS_KEY = "qnplayer_eq_custom_presets";

function loadCustomEqPresets() {
  try {
    const raw = localStorage.getItem(EQ_CUSTOM_PRESETS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveCustomEqPresets(list) {
  try {
    localStorage.setItem(EQ_CUSTOM_PRESETS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("saveCustomEqPresets failed:", e);
  }
}

function getCurrentEqValues() {
  return EQ_FREQS.map((_, i) => {
    const slider = document.getElementById(`eqBand${i}`);
    return slider ? parseInt(slider.value, 10) : 0;
  });
}

function renderCustomEqPresetButtons() {
  const container = document.getElementById("eqCustomPresetButtons");
  if (!container) return;
  container.innerHTML = "";
  const presets = loadCustomEqPresets();
  presets.forEach(preset => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "eq-preset-btn eq-preset-btn-custom";
    btn.dataset.presetCustomId = preset.id;
    btn.title = "Click to apply, long-press or right-click to delete";

    const label = document.createElement("span");
    label.textContent = preset.name;
    btn.appendChild(label);

    const delBtn = document.createElement("span");
    delBtn.className = "eq-preset-custom-del";
    delBtn.textContent = "✕";
    delBtn.title = "Delete this preset";
    delBtn.onclick = (e) => {
      e.stopPropagation();
      const list = loadCustomEqPresets().filter(p => p.id !== preset.id);
      saveCustomEqPresets(list);
      renderCustomEqPresetButtons();
    };
    btn.appendChild(delBtn);

    btn.onclick = () => {
      hapticTap();
      preset.values.forEach((gain, i) => setEqBandValue(i, gain));
      setActiveEqPresetButton(null);
      document.querySelectorAll(".eq-preset-btn-custom").forEach(b => {
        b.classList.toggle("active", b.dataset.presetCustomId === preset.id);
      });
    };
    container.appendChild(btn);
  });
}

const saveEqPresetBtn = document.getElementById("eqSavePresetBtn");
if (saveEqPresetBtn) {
  saveEqPresetBtn.onclick = () => {
    const name = prompt("Preset name", "My Preset");
    if (!name || !name.trim()) return;
    const values = getCurrentEqValues();
    const list = loadCustomEqPresets();
    list.push({ id: "custom-" + Date.now(), name: name.trim(), values });
    saveCustomEqPresets(list);
    renderCustomEqPresetButtons();
    hapticSuccess();
  };
}

renderCustomEqPresetButtons();

for (let i = 0; i < EQ_FREQS.length; i++) {
  const slider = document.getElementById("eqBand" + i);
  if (slider) {
    slider.addEventListener("input", () => {
      setActiveEqPresetButton(null);
    });
  }
}

const eqBandsEl = document.getElementById("eqBands");
if (eqBandsEl) {
  let eqDragging = false;

  function applyEqDragAt(clientX, clientY) {
    const bandEls = eqBandsEl.querySelectorAll(".eq-band");
    let changed = false;
    bandEls.forEach((bandEl, i) => {
      const track = bandEl.querySelector(".eq-slider-track");
      if (!track) return;
      const rect = track.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right) {
        const ratio = 1 - (clientY - rect.top) / rect.height;
        const gain = -15 + Math.max(0, Math.min(1, ratio)) * 30;
        setEqBandValue(i, gain);
        changed = true;
      }
    });
    if (changed) {
      setActiveEqPresetButton(null);
    }
  }

  eqBandsEl.addEventListener("mousedown", e => {
    eqDragging = true;
    applyEqDragAt(e.clientX, e.clientY);
    e.preventDefault();
  });

  document.addEventListener("mousemove", e => {
    if (!eqDragging) return;
    applyEqDragAt(e.clientX, e.clientY);
  });

  document.addEventListener("mouseup", () => {
    eqDragging = false;
  });

  eqBandsEl.addEventListener("touchstart", e => {
    eqDragging = true;
    const t = e.touches[0];
    applyEqDragAt(t.clientX, t.clientY);
  }, { passive: true });

  eqBandsEl.addEventListener("touchmove", e => {
    if (!eqDragging) return;
    const t = e.touches[0];
    applyEqDragAt(t.clientX, t.clientY);
    e.preventDefault();
  }, { passive: false });

  eqBandsEl.addEventListener("touchend", () => {
    eqDragging = false;
  });
}

const eqModalOverlay = document.getElementById("eqModalOverlay");
const eqModalCloseBtn = document.getElementById("eqModalCloseBtn");

function openEqModal() {
  hapticTap();
  setupAudioGraph().catch(err => console.warn("setupAudioGraph failed:", err));
  if (eqModalOverlay) eqModalOverlay.classList.add("open");
}

function closeEqModal() {
  hapticTap();
  if (eqModalOverlay) eqModalOverlay.classList.remove("open");
}

if (eqModalCloseBtn) {
  eqModalCloseBtn.onclick = () => closeEqModal();
}
if (eqModalOverlay) {
  eqModalOverlay.onclick = (e) => {
    if (e.target === eqModalOverlay) closeEqModal();
  };
}
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && eqModalOverlay && eqModalOverlay.classList.contains("open")) {
    closeEqModal();
  }
});

const controlEqEnableToggle = document.getElementById("controlEqEnableToggle");
if (controlEqEnableToggle) {
  controlEqEnableToggle.onclick = () => {
    if (typeof isUnlocked === "function" && !isUnlocked()) {
      swShowUnlockToast("無料版ではEQを利用できません。");
      return;
    }
    hapticTap();
    setEqEffectEnabled(!eqEffectEnabled);
    controlEqEnableToggle.setAttribute("aria-checked", String(eqEffectEnabled));
  };
}
