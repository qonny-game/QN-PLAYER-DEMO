// player-controls.js — Speed/AutoSpeed/Key/VOL・SPEED・KEYポップアップ/Loop/Repeat。依存: player-core.js(setupAudioGraph,updatePlaybackRate), player-ui-shared.js(haptic*,updateAvToggleValue,renderSegments)

const speedDisplay = document.getElementById("speedDisplay");
const controlSpeedRange = document.getElementById("controlSpeedRange");
const controlSpeedDisplay = document.getElementById("controlSpeedDisplay");
const spStatusSpeedValue = document.getElementById("spStatusSpeedValue");
const SPEED_MIN = 0.5;
const SPEED_MAX = 1.5;
const SPEED_SNAPS = [0.5, 0.75, 1, 1.25, 1.5];
const SPEED_SNAP_RANGE = 0.02;

function syncSpeedDisplays() {
  if (speedDisplay) speedDisplay.textContent = currentSpeed.toFixed(2);
  if (controlSpeedRange) controlSpeedRange.value = currentSpeed;
  if (controlSpeedDisplay) controlSpeedDisplay.textContent = currentSpeed.toFixed(2);
  if (spStatusSpeedValue) spStatusSpeedValue.textContent = currentSpeed.toFixed(2) + "x";
  updateAvToggleValue("speedToggleValue", currentSpeed.toFixed(2) + "x");
}
// updateAvToggleValueはplayer-ui-shared.js側。読み込み順依存(index.htmlでshared先が望ましい)
syncSpeedDisplays();

function setSpeed(value) {
  if (typeof isUnlocked === "function" && !isUnlocked() && value !== 1.0) {
    swShowUnlockToast("無料版ではSpeed変更を利用できません。");
    syncSpeedDisplays();
    return;
  }
  currentSpeed = Math.round(Math.max(SPEED_MIN, Math.min(SPEED_MAX, value)) * 100) / 100;
  syncSpeedDisplays();
  updatePlaybackRate();
}

let lastSpeedTickValue = currentSpeed;
// iOS Safari: ドラッグ中のplaybackRate高頻度更新は音がぶつ切り。表示だけ即更新、実反映はinput停止90ms後に1回
let speedApplyDebounceTimer = null;
function handleSpeedRangeInput(e) {
  if (typeof isUnlocked === "function" && !isUnlocked()) {
    e.target.value = 1.0;
    syncSpeedDisplays();
    swShowUnlockToast("無料版ではSpeed変更を利用できません。");
    return;
  }

  // スライダー操作時にWeb Audio接続を試みる(未操作なら接続しない設計を維持)
  setupAudioGraph().catch(err => console.warn("setupAudioGraph failed:", err));

  let rawSpeed = parseFloat(e.target.value);
  // 0.50/0.75/1.00/1.25/1.50の近くでカチッとはまる(PCバーのミキサーも同じ入口)
  for (let i = 0; i < SPEED_SNAPS.length; i++) {
    if (Math.abs(rawSpeed - SPEED_SNAPS[i]) <= SPEED_SNAP_RANGE) { rawSpeed = SPEED_SNAPS[i]; break; }
  }
  e.target.value = rawSpeed;
  currentSpeed = rawSpeed;
  if (currentSpeed !== lastSpeedTickValue) {
    hapticTick();
    lastSpeedTickValue = currentSpeed;
  }
  syncSpeedDisplays();

  clearTimeout(speedApplyDebounceTimer);
  speedApplyDebounceTimer = setTimeout(() => {
    updatePlaybackRate();
  }, 90);
}
if (controlSpeedRange) controlSpeedRange.oninput = handleSpeedRangeInput;

// 速度±ボタンの刻み(%)。設定パネルで変更(localStorage qn_speed_step_pct)。キーボードCtrl+←→の1%は別
const SPEED_STEP_OPTIONS = [1, 2, 5, 10];
const SPEED_STEP_KEY = "qn_speed_step_pct";
let speedStepPct = 5;
try {
  const v = parseInt(localStorage.getItem(SPEED_STEP_KEY), 10);
  if (SPEED_STEP_OPTIONS.indexOf(v) >= 0) speedStepPct = v;
} catch (e) {}
function getSpeedStepPct() { return speedStepPct; }
function setSpeedStepPct(v) {
  if (SPEED_STEP_OPTIONS.indexOf(v) < 0) return;
  speedStepPct = v;
  try { localStorage.setItem(SPEED_STEP_KEY, String(v)); } catch (e) {}
  const d = document.getElementById("controlSpeedDownBtn");
  const u = document.getElementById("controlSpeedUpBtn");
  if (d) d.title = "Speed −" + v + "%";
  if (u) u.title = "Speed +" + v + "%";
}
function snapSpeedStep(dir) {
  const step = speedStepPct / 100;
  const q = currentSpeed / step;
  const n = dir > 0 ? Math.floor(q + 1e-6) + 1 : Math.ceil(q - 1e-6) - 1;
  return Math.round(n * step * 100) / 100;
}
const controlSpeedDownBtn = document.getElementById("controlSpeedDownBtn");
const controlSpeedUpBtn = document.getElementById("controlSpeedUpBtn");
setSpeedStepPct(speedStepPct);
function stepSpeed(dir) {
  hapticTap();
  setupAudioGraph().catch(err => console.warn("setupAudioGraph failed:", err));
  setSpeed(snapSpeedStep(dir));
}
if (controlSpeedDownBtn) controlSpeedDownBtn.onclick = () => stepSpeed(-1);
if (controlSpeedUpBtn) controlSpeedUpBtn.onclick = () => stepSpeed(1);

function resetSpeed() {
  currentSpeed = 1.0;
  syncSpeedDisplays();
  updatePlaybackRate();
}
const controlSpeedResetBtn = document.getElementById("controlSpeedResetBtn");
if (controlSpeedResetBtn) controlSpeedResetBtn.onclick = resetSpeed;

const autoSpeedToggleBtns = [document.getElementById("autoSpeedToggleBtn"), document.getElementById("controlAutoSpeedToggleBtn")].filter(Boolean);
const autoSpeedSettingsEls = [document.getElementById("autoSpeedSettings"), document.getElementById("controlAutoSpeedSettings")].filter(Boolean);
const autoSpeedCardEls = [document.getElementById("controlAutoSpeedCard")].filter(Boolean);
const autoSpeedEveryNInputs = [document.getElementById("autoSpeedEveryN"), document.getElementById("controlAutoSpeedEveryN")].filter(Boolean);
const autoSpeedStepPercentInputs = [document.getElementById("autoSpeedStepPercent"), document.getElementById("controlAutoSpeedStepPercent")].filter(Boolean);
const autoSpeedLimitInputs = [document.getElementById("autoSpeedLimit"), document.getElementById("controlAutoSpeedLimit")].filter(Boolean);
const autoSpeedStatusEls = [document.getElementById("autoSpeedStatus"), document.getElementById("controlAutoSpeedStatus")].filter(Boolean);
const autoSpeedDirBtns = document.querySelectorAll(".auto-speed-dir-btn");

let autoSpeedEnabled = false;
let autoSpeedDirection = "up";
let autoSpeedLoopCount = 0;

function getAutoSpeedEveryN() {
  const n = parseInt(autoSpeedEveryNInputs[0].value, 10);
  return Number.isFinite(n) && n >= 1 ? n : 5;
}

function getAutoSpeedStepPercent() {
  const p = parseFloat(autoSpeedStepPercentInputs[0].value);
  return Number.isFinite(p) && p > 0 ? p : 5;
}

function getAutoSpeedLimitRatio() {
  const p = parseFloat(autoSpeedLimitInputs[0].value);
  const clamped = Number.isFinite(p) ? Math.max(50, Math.min(150, p)) : 150;
  return clamped / 100;
}

const spStatusAutoSpeedValue = document.getElementById("spStatusAutoSpeedValue");
const spStatusAutoSpeedLimit = document.getElementById("spStatusAutoSpeedLimit");

function updateAutoSpeedStatus() {
  const everyN = getAutoSpeedEveryN();
  let text;
  if (!autoSpeedEnabled) {
    text = `Loop progress: 0 / ${everyN}`;
  } else {
    const limitRatio = getAutoSpeedLimitRatio();
    const reachedLimit = autoSpeedDirection === "up"
      ? currentSpeed >= limitRatio - 0.001
      : currentSpeed <= limitRatio + 0.001;
    text = reachedLimit
      ? `Limit reached (${(limitRatio * 100).toFixed(0)}%) — looping`
      : `Loop progress: ${autoSpeedLoopCount} / ${everyN}`;
  }
  autoSpeedStatusEls.forEach(el => { el.textContent = text; });

  if (spStatusAutoSpeedValue) {
    if (!autoSpeedEnabled) {
      spStatusAutoSpeedValue.textContent = "Off";
    } else {
      const stepPercent = getAutoSpeedStepPercent();
      const sign = autoSpeedDirection === "up" ? "+" : "-";
      spStatusAutoSpeedValue.textContent = `${autoSpeedLoopCount}/${everyN} ${sign}${stepPercent}%`;
    }
  }
  if (spStatusAutoSpeedLimit) {
    const limitRatio = getAutoSpeedLimitRatio();
    spStatusAutoSpeedLimit.textContent = autoSpeedEnabled ? `limit ${limitRatio.toFixed(2)}x` : "";
  }
}

function setAutoSpeedEnabled(enabled) {
  autoSpeedEnabled = enabled;
  autoSpeedLoopCount = 0;
  autoSpeedToggleBtns.forEach(btn => btn.setAttribute("aria-checked", String(enabled)));
  autoSpeedSettingsEls.forEach(el => el.classList.toggle("open", enabled));
  autoSpeedCardEls.forEach(el => el.classList.toggle("auto-speed-active", enabled));
  updateAutoSpeedStatus();
}

autoSpeedToggleBtns.forEach(btn => {
  btn.onclick = () => {
    hapticTap();
    setAutoSpeedEnabled(!autoSpeedEnabled);
  };
});

autoSpeedDirBtns.forEach(btn => {
  btn.onclick = () => {
    hapticTap();
    autoSpeedDirection = btn.getAttribute("data-dir");
    autoSpeedDirBtns.forEach(b => b.classList.toggle("active", b.getAttribute("data-dir") === autoSpeedDirection));
    updateAutoSpeedStatus();
  };
});

[...autoSpeedEveryNInputs, ...autoSpeedStepPercentInputs, ...autoSpeedLimitInputs].forEach(input => {
  input.addEventListener("input", () => {
    const pairArrays = [autoSpeedEveryNInputs, autoSpeedStepPercentInputs, autoSpeedLimitInputs];
    const pair = pairArrays.find(arr => arr.includes(input));
    if (pair) pair.forEach(el => { if (el !== input) el.value = input.value; });
  });
  input.addEventListener("change", () => {
    autoSpeedLoopCount = 0;
    updateAutoSpeedStatus();
  });
});

function notifyLoopCompleted() {
  if (!autoSpeedEnabled) return;

  const limitRatio = getAutoSpeedLimitRatio();
  const alreadyAtLimit = autoSpeedDirection === "up"
    ? currentSpeed >= limitRatio - 0.001
    : currentSpeed <= limitRatio + 0.001;
  if (alreadyAtLimit) {
    updateAutoSpeedStatus();
    return;
  }

  autoSpeedLoopCount++;
  const everyN = getAutoSpeedEveryN();
  if (autoSpeedLoopCount >= everyN) {
    autoSpeedLoopCount = 0;
    const stepRatio = getAutoSpeedStepPercent() / 100;
    const delta = autoSpeedDirection === "up" ? stepRatio : -stepRatio;
    let nextSpeed = currentSpeed + delta;
    nextSpeed = autoSpeedDirection === "up"
      ? Math.min(nextSpeed, limitRatio)
      : Math.max(nextSpeed, limitRatio);
    setSpeed(nextSpeed);
    hapticSuccess();
  }
  updateAutoSpeedStatus();
}

updateAutoSpeedStatus();

const keyDisplay = document.getElementById("keyDisplay");
const controlKeyDisplay = document.getElementById("controlKeyDisplay");
const controlKeyRange = document.getElementById("controlKeyRange");
const KEY_MIN = -12;
const KEY_MAX = 12;

function renderKeyDisplay() {
  const text = (currentKeySemitones > 0 ? "+" : "") + currentKeySemitones;
  if (keyDisplay) keyDisplay.textContent = text;
  if (controlKeyDisplay) controlKeyDisplay.textContent = text;
  if (controlKeyRange) {
    controlKeyRange.value = currentKeySemitones;
    controlKeyRange.style.setProperty("--range-progress", String(((currentKeySemitones - KEY_MIN) / (KEY_MAX - KEY_MIN)) * 100));
  }
  const spStatusKeyValue = document.getElementById("spStatusKeyValue");
  if (spStatusKeyValue) spStatusKeyValue.textContent = text;
  updateAvToggleValue("keyToggleValue", text);
}

function setKeySemitones(value) {
  if (typeof isUnlocked === "function" && !isUnlocked() && value !== 0) {
    swShowUnlockToast("無料版ではKey変更を利用できません。");
    return;
  }

  // ステッパー操作時にWeb Audio接続を試みる
  setupAudioGraph().catch(err => console.warn("setupAudioGraph failed:", err));

  const clamped = Math.max(KEY_MIN, Math.min(KEY_MAX, value));
  if (clamped !== currentKeySemitones) {
    hapticTick();
  } else if (value !== clamped) {
    hapticWarning();
  }
  currentKeySemitones = clamped;
  renderKeyDisplay();
  updatePlaybackRate();
}

const keyUpBtn = document.getElementById("keyUpBtn");
const keyDownBtn = document.getElementById("keyDownBtn");
if (keyUpBtn) keyUpBtn.onclick = () => setKeySemitones(currentKeySemitones + 1);
if (keyDownBtn) keyDownBtn.onclick = () => setKeySemitones(currentKeySemitones - 1);

const keyResetBtn = document.getElementById("keyResetBtn");
if (keyResetBtn) keyResetBtn.onclick = () => setKeySemitones(0);

const controlKeyUpBtn = document.getElementById("controlKeyUpBtn");
const controlKeyDownBtn = document.getElementById("controlKeyDownBtn");
if (controlKeyUpBtn) controlKeyUpBtn.onclick = () => setKeySemitones(currentKeySemitones + 1);
if (controlKeyDownBtn) controlKeyDownBtn.onclick = () => setKeySemitones(currentKeySemitones - 1);

if (controlKeyRange) controlKeyRange.oninput = () => { setKeySemitones(parseInt(controlKeyRange.value, 10)); renderKeyDisplay(); };

const controlKeyResetBtn = document.getElementById("controlKeyResetBtn");
if (controlKeyResetBtn) controlKeyResetBtn.onclick = () => setKeySemitones(0);

renderKeyDisplay();

// ピッチシフト準備完了でKEY/SPEED有効化。非対応(AudioWorklet無し)は無効のまま。トグルごと触れなくする
function updateKeyControlAvailability() {
  const keyElements = [controlKeyUpBtn, controlKeyDownBtn, controlKeyResetBtn, controlKeyEnableToggle, controlKeyRange];
  const speedElements = [controlSpeedRange, controlSpeedResetBtn, controlSpeedEnableToggle, controlSpeedDownBtn, controlSpeedUpBtn];

  if (pitchShiftAvailable) {
    keyElements.forEach(el => {
      if (el) {
        el.disabled = false;
        el.classList.remove("key-disabled");
        el.removeAttribute("title");
      }
    });
    speedElements.forEach(el => {
      if (el) {
        el.disabled = false;
        el.classList.remove("key-disabled");
        el.removeAttribute("title");
      }
    });
  } else {
    keyElements.forEach(el => {
      if (el) {
        el.disabled = true;
        el.classList.add("key-disabled");
        el.title = "Key change is unavailable in this browser (AudioWorklet not supported)";
      }
    });
    speedElements.forEach(el => {
      if (el) {
        el.disabled = true;
        el.classList.add("key-disabled");
        el.title = "Speed change is unavailable in this browser (AudioWorklet not supported)";
      }
    });
  }
}


const loopToggleBtn = document.getElementById("loopToggleBtn");

const LOOP_ENABLED_STORAGE_KEY = "mp3player_loop_enabled";

// LOOP: OFF→A-B→Section→OFF。A/B未設定ならA-Bを飛ばす。保存: LOOP_MODE_STORAGE_KEY(off|ab|sec)、旧LOOP_ENABLED_STORAGE_KEYも書き続ける
const LOOP_MODE_STORAGE_KEY = "mp3player_loop_mode";

function applyLoopButtonUI() {
  if (!loopToggleBtn) return;
  loopToggleBtn.classList.toggle("is-active", loopEnabled);
  const lbl = loopToggleBtn.querySelector(".top-controls-btn-label");
  if (lbl) lbl.textContent = !loopEnabled ? "Loop" : (loopMode === "ab" ? "A-B Loop" : "Section");
  loopToggleBtn.title = !loopEnabled ? "Loop OFF (click: A-B / Section)" : (loopMode === "ab" ? "A-B Loop (click: Section)" : "Section Loop (click: OFF)");
}

function setLoopModeState(mode, persist) {
  loopEnabled = mode !== "off";
  if (mode !== "off") loopMode = mode;
  if (persist) {
    try {
      localStorage.setItem(LOOP_MODE_STORAGE_KEY, mode);
      localStorage.setItem(LOOP_ENABLED_STORAGE_KEY, loopEnabled ? "1" : "0");
    } catch (e) {}
  }
  if (typeof swAbLoopCount !== "undefined") swAbLoopCount = 0;
  if (typeof swUpdateLoopCounterUI === "function") swUpdateLoopCounterUI();
  loopActiveMarkerIndex = null;
  applyLoopButtonUI();
  renderSegments();
}

function syncLoopModeWithAB() {
  if (loopEnabled && loopMode === "ab" && !getABRange()) setLoopModeState("off", false);
}

if (loopToggleBtn) {
  try {
    const savedMode = localStorage.getItem(LOOP_MODE_STORAGE_KEY);
    if (savedMode === "ab" || savedMode === "sec") {
      loopMode = savedMode; loopEnabled = true;
    } else if (savedMode === "off") {
      loopEnabled = false;
    } else {
      loopEnabled = localStorage.getItem(LOOP_ENABLED_STORAGE_KEY) === "1";
      loopMode = "sec";
    }
  } catch (e) {}
  applyLoopButtonUI();

  loopToggleBtn.onclick = () => {
    hapticTap();
    let next;
    if (!loopEnabled) next = getABRange() ? "ab" : "sec";
    else if (loopMode === "ab") next = "sec";
    else next = "off";
    setLoopModeState(next, true);
  };
}

let loopPreRollSeconds = 0;
const LOOP_PREROLL_STORAGE_KEY = "mp3player_loop_preroll_seconds";
const LOOP_PREROLL_MIN = 0;
const LOOP_PREROLL_MAX = 5;

const loopPreRollControl = document.getElementById("loopPreRollControl");
const loopPreRollMinusBtn = document.getElementById("loopPreRollMinus");
const loopPreRollPlusBtn = document.getElementById("loopPreRollPlus");
const loopPreRollValueEl = document.getElementById("loopPreRollValue");

function applyLoopPreRollUI() {
  if (loopPreRollValueEl) {
    loopPreRollValueEl.firstChild.textContent = String(loopPreRollSeconds);
  }
  if (loopPreRollControl) {
    loopPreRollControl.classList.toggle("is-active", loopPreRollSeconds > 0);
  }
  if (loopPreRollMinusBtn) loopPreRollMinusBtn.disabled = loopPreRollSeconds <= LOOP_PREROLL_MIN;
  if (loopPreRollPlusBtn) loopPreRollPlusBtn.disabled = loopPreRollSeconds >= LOOP_PREROLL_MAX;
}

function setLoopPreRollSeconds(value) {
  loopPreRollSeconds = Math.max(LOOP_PREROLL_MIN, Math.min(LOOP_PREROLL_MAX, value));
  try { localStorage.setItem(LOOP_PREROLL_STORAGE_KEY, String(loopPreRollSeconds)); } catch (e) {}
  applyLoopPreRollUI();
  if (typeof renderSegments === "function") renderSegments();
}

if (loopPreRollControl) {
  try {
    const stored = parseInt(localStorage.getItem(LOOP_PREROLL_STORAGE_KEY), 10);
    if (!isNaN(stored)) loopPreRollSeconds = Math.max(LOOP_PREROLL_MIN, Math.min(LOOP_PREROLL_MAX, stored));
  } catch (e) {}
  applyLoopPreRollUI();

  if (loopPreRollMinusBtn) {
    loopPreRollMinusBtn.onclick = () => {
      hapticTap();
      setLoopPreRollSeconds(loopPreRollSeconds - 1);
    };
  }
  if (loopPreRollPlusBtn) {
    loopPreRollPlusBtn.onclick = () => {
      hapticTap();
      setLoopPreRollSeconds(loopPreRollSeconds + 1);
    };
  }
}

const allRepeatToggleBtn = document.getElementById("allRepeatToggleBtn");

const REPEAT_MODE_STORAGE_KEY = "mp3player_repeat_mode";

const REPEAT_ICON_OFF = '<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>';
const REPEAT_ICON_ALL = '<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>';
const REPEAT_ICON_ONE = '<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg><span class="repeat-one-badge">1</span>';

function applyRepeatModeUI() {
  if (!allRepeatToggleBtn) return;

  const iconHtml = repeatMode === "one" ? REPEAT_ICON_ONE : repeatMode === "all" ? REPEAT_ICON_ALL : REPEAT_ICON_OFF;
  const labelText = repeatMode === "one" ? "Repeat 1" : repeatMode === "all" ? "Repeat All" : "Repeat";

  allRepeatToggleBtn.innerHTML = iconHtml;
  const label = document.createElement("span");
  label.className = "top-controls-btn-label";
  label.textContent = labelText;
  allRepeatToggleBtn.appendChild(label);

  const isActive = repeatMode !== "off";
  allRepeatToggleBtn.classList.toggle("is-active", isActive);
  allRepeatToggleBtn.title = repeatMode === "one" ? "Repeat One (click to cycle)" : repeatMode === "all" ? "Repeat All (click to cycle)" : "Repeat Off (click to cycle)";
}

if (allRepeatToggleBtn) {
  try {
    const savedRepeatMode = localStorage.getItem(REPEAT_MODE_STORAGE_KEY);
    if (savedRepeatMode === "one" || savedRepeatMode === "all" || savedRepeatMode === "off") {
      repeatMode = savedRepeatMode;
    }
  } catch (e) {}
  if (typeof isUnlocked === "function" && !isUnlocked() && repeatMode !== "off") {
    repeatMode = "off";
    try { localStorage.setItem(REPEAT_MODE_STORAGE_KEY, "off"); } catch (e) {}
  }

  allRepeatToggleBtn.onclick = () => {
    if (typeof isUnlocked === "function" && !isUnlocked()) {
      swShowUnlockToast("無料版ではトラックリピートを利用できません。");
      return;
    }
    hapticTap();
    repeatMode = repeatMode === "off" ? "one" : repeatMode === "one" ? "all" : "off";
    try { localStorage.setItem(REPEAT_MODE_STORAGE_KEY, repeatMode); } catch (e) {}
    applyRepeatModeUI();
  };
  applyRepeatModeUI();
}


const controlSpeedEnableToggle = document.getElementById("controlSpeedEnableToggle");
if (controlSpeedEnableToggle) {
  controlSpeedEnableToggle.onclick = () => {
    if (typeof isUnlocked === "function" && !isUnlocked()) {
      swShowUnlockToast("無料版ではSpeed変更を利用できません。");
      return;
    }
    hapticTap();
    speedEffectEnabled = !speedEffectEnabled;
    controlSpeedEnableToggle.setAttribute("aria-checked", String(speedEffectEnabled));
    if (controlSpeedRange) controlSpeedRange.classList.toggle("is-effect-off", !speedEffectEnabled);
    updatePlaybackRate();
  };
}

const controlKeyEnableToggle = document.getElementById("controlKeyEnableToggle");
if (controlKeyEnableToggle) {
  controlKeyEnableToggle.onclick = () => {
    if (typeof isUnlocked === "function" && !isUnlocked()) {
      swShowUnlockToast("無料版ではKey変更を利用できません。");
      return;
    }
    hapticTap();
    keyEffectEnabled = !keyEffectEnabled;
    controlKeyEnableToggle.setAttribute("aria-checked", String(keyEffectEnabled));
    if (controlKeyRange) controlKeyRange.classList.toggle("is-effect-off", !keyEffectEnabled);
    updatePlaybackRate();
  };
}
