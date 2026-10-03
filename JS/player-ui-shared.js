// player-ui-shared.js — PC/SP共通のUI操作。player-core.jsの後に読み込む。isMobileLayout()でPC/SP分岐する関数あり(renderPins等)。SECTIONコメントは将来分割時の切り出し目安


// welcomeOverlayは撤去済み(+ADD AUDIOへ一本化)。hideWelcomeOverlay()はloadFile等から呼ばれるので残す。要素が無ければ何もしない
function hideWelcomeOverlay() {
  const overlay = document.getElementById("welcomeOverlay");
  if (overlay) overlay.classList.add("hidden");
}



async function decodeForWaveform(arrayBuffer) {
  const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (OfflineCtx) {
    for (const rate of [8000, 22050]) {
      try {
        const offline = new OfflineCtx(1, 1, rate);
        return await offline.decodeAudioData(arrayBuffer.slice(0));
      } catch (err) {
      }
    }
  }
  const ctx = getAudioCtx();
  return await ctx.decodeAudioData(arrayBuffer.slice(0));
}

async function decodeWaveform(file, token) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    if (token !== waveformDecodeToken) return;
    // 【v2.13.4 負荷対策】共有AudioContext(getAudioCtx)でデコードしない(通常再生でWeb Audioが常駐しiOS Safariで問題)。波形は低解像度で足りるので低サンプルレートのOfflineAudioContextでデコードしメモリを約1/5に
    const audioBuffer = await decodeForWaveform(arrayBuffer);

    if (token !== waveformDecodeToken) return;

    const channelCount = audioBuffer.numberOfChannels;
    const rawLength = audioBuffer.length;
    // 【v3.58.0】5秒1本でも滑らかに見えるよう毎秒160ピーク(下限4000・上限480000=約50分)。QNBarsが1本あたりの区間で最大値を取って間引く
    const samples = Math.max(4000, Math.min(480000, Math.round(audioBuffer.duration * 160)));
    const blockSize = Math.max(1, Math.floor(rawLength / samples));
    const peaks = new Float32Array(samples);

    const channelData = [];
    for (let c = 0; c < channelCount; c++) {
      channelData.push(audioBuffer.getChannelData(c));
    }

    for (let i = 0; i < samples; i++) {
      const start = i * blockSize;
      const end = Math.min(rawLength, start + blockSize);
      let max = 0;
      for (let j = start; j < end; j++) {
        for (let c = 0; c < channelCount; c++) {
          const v = Math.abs(channelData[c][j]);
          if (v > max) max = v;
        }
      }
      peaks[i] = max;
    }

    let peakMax = 0;
    for (let i = 0; i < samples; i++) {
      if (peaks[i] > peakMax) peakMax = peaks[i];
    }
    if (peakMax > 0) {
      for (let i = 0; i < samples; i++) {
        peaks[i] = peaks[i] / peakMax;
      }
    }

    if (token !== waveformDecodeToken) return;

    waveformPeaks = peaks;
    drawWaveform();
  } catch (err) {
    console.warn("Waveform decode failed:", err);
    waveformPeaks = null;
  }
}

// 実描画はQNBars(player-bars.js)。ここは「波形/長さが確定した」合図で、行の作り直し+再描画を依頼する
function drawWaveform() {
  if (!waveformPeaks || !audio.duration) return;
  window.__qnWaveformDrawCount = (window.__qnWaveformDrawCount || 0) + 1;
  QNBars.sync();
  QNBars.draw(true);
}

window.addEventListener("resize", () => {
  if (waveformPeaks) drawWaveform();
});

const savedVolume = localStorage.getItem("mp3player_volume");
if (savedVolume !== null) {
  audio.volume = parseFloat(savedVolume);
} else {
  audio.volume = 0.8;
}

const volumeDisplay = document.getElementById("volumeDisplay");
const controlVolumeDisplay = document.getElementById("controlVolumeDisplay");
if (volumeDisplay) volumeDisplay.textContent = audio.volume.toFixed(2);
if (controlVolumeDisplay) controlVolumeDisplay.textContent = audio.volume.toFixed(2);

function updateAvToggleValue(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

updateAvToggleValue("volToggleValue", Math.round(audio.volume * 100) + "%");

function applyVolumeChange(val) {
  audio.volume = val;
  if (volumeDisplay) volumeDisplay.textContent = val.toFixed(2);
  if (controlVolumeDisplay) controlVolumeDisplay.textContent = val.toFixed(2);
  updateAvToggleValue("volToggleValue", Math.round(val * 100) + "%");
  localStorage.setItem("mp3player_volume", val);
}

[document.getElementById("volume"), document.getElementById("controlVolume")].forEach(input => {
  if (!input) return;
  input.value = audio.volume;
  input.oninput = e => {
    const otherInput = input.id === "volume" ? document.getElementById("controlVolume") : document.getElementById("volume");
    const val = parseFloat(e.target.value);
    if (otherInput) otherInput.value = val;
    applyVolumeChange(val);
  };
});

document.getElementById("fileInput").onchange = e => addFilesToPlaylist(Array.from(e.target.files));



// 直前のobjectURL。曲切替時にrevokeObjectURL()で必ず解放(忘れると曲数×サイズ分メモリが積み上がりモバイルでクラッシュ)
let currentObjectUrl = null;

// 曲のマーカー/ABループ/テキストメモをlocalStorageから読み込んで画面へ。曲切替(loadFile)と、同期で他端末の内容を取り込んだ時(player-sync.js)の両方から呼ぶ
function loadTrackUserData(fileName) {
  const savedPins = localStorage.getItem("mp3_pins_" + fileName);
  if (savedPins) {
    try {
      const raw = JSON.parse(savedPins);
      pins = raw.map(p => typeof p === 'number' ? { t: p, enabled: true, memo: "", color: null } : { t: p.t, enabled: p.enabled !== false, memo: p.memo || "", color: p.color || null });
    } catch (e) { pins = []; }
  } else {
    pins = [];
  }
  loadABFor(fileName);
  if (typeof renderPinList === "function") renderPinList();

  // noteTextAreaEl(player-text.js)に依存せず都度DOM取得(読み込み順非依存)。フルスクリーン表示中ならそちらも更新
  const noteTextForLoad = localStorage.getItem("mp3_text_" + fileName) || "";
  const noteTextAreaElForLoad = document.getElementById("noteTextArea");
  if (noteTextAreaElForLoad) noteTextAreaElForLoad.value = noteTextForLoad;
  const noteTextAreaFsForLoad = document.getElementById("noteTextAreaFullscreen");
  if (noteTextAreaFsForLoad) noteTextAreaFsForLoad.value = noteTextForLoad;
}

function loadFile(file) {
  if (!file) return;
  
  setAppTitle(file.name);
  hideWelcomeOverlay();

  loopActiveMarkerIndex = null;

  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }

  const url = URL.createObjectURL(file);
  currentObjectUrl = url;
  audio.src = url;
  audio.load();
  updatePlaybackRate();

  // setupAudioGraph()は曲読込時に呼ばない(常時Web Audio接続だとiOS Safariで長時間再生後にクラッシュ。Safari固有)。EQボタン等の実操作時のみ(setupAudioGraphOnDemand)

  waveformPeaks = null;
  waveformDecodeToken++;
  decodeWaveform(file, waveformDecodeToken);

  // 【v2.13.6】マーカー/テキストメモ読込は曲切替の瞬間に同期で行う(loadedmetadata待ちだと失敗時に曲名だけ新しく本文が前の曲のままになり、編集すると新しい曲名キーで保存される。GOTCHAS.md)
  loadTrackUserData(file.name);

  audio.onloadedmetadata = () => {
    prevTime = audio.currentTime;
    QNBars.sync();
    QNBars.onTrackLoaded();
    drawWaveform();

    renderPins();
    renderSegments();
    renderPinList();
    if (window.__qnAudioCtx && window.__qnAudioCtx.state === "suspended") {
      window.__qnAudioCtx.resume().catch(() => {});
    }
    // 読込後は自動再生しない(Play待ち)
    updatePlayButtonState();
  };
}



function updatePlayButtonState() {
  const playBtn = document.getElementById("playToggle");
  updateMediaSessionPlaybackState();
  if (!playBtn) return;

  const label = playBtn.querySelector(".top-controls-btn-label");
  const labelText = label ? label.textContent : "";

  if (!audio.paused) {
    playBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    // v3.54.0: 再生中も停止中と同じ色(緑のグラデにしない)
    playBtn.style.background = "";
    playBtn.style.boxShadow = "";
  } else {
    playBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    playBtn.style.background = "";
    playBtn.style.boxShadow = "";
  }

  const newLabel = document.createElement("span");
  newLabel.className = "top-controls-btn-label";
  newLabel.textContent = labelText || "Play";
  playBtn.appendChild(newLabel);
}

function togglePlay() {
  hapticTap();
  // ユーザー操作の直接起点でAudioContextをresume
  if (window.__qnAudioCtx && window.__qnAudioCtx.state === "suspended") {
    window.__qnAudioCtx.resume().catch(() => {});
  }

  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
  updatePlayButtonState();
}

function updateMediaSessionMetadata(name) {
  if (!("mediaSession" in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: name || "QNPLAYER",
      artist: "QNPLAYER"
    });
  } catch (e) {
  }
}

function updateMediaSessionPlaybackState() {
  if (!("mediaSession" in navigator)) return;
  navigator.mediaSession.playbackState = audio.paused ? "paused" : "playing";
}

if ("mediaSession" in navigator) {
  navigator.mediaSession.setActionHandler("play", () => togglePlay());
  navigator.mediaSession.setActionHandler("pause", () => togglePlay());
  navigator.mediaSession.setActionHandler("previoustrack", () => {
    const prevIndex = findEnabledTrackIndex(currentPlaylistIndex, -1, false);
    if (prevIndex !== -1) playTrackAt(prevIndex);
  });
  navigator.mediaSession.setActionHandler("nexttrack", () => {
    const nextIndex = findEnabledTrackIndex(currentPlaylistIndex, 1, false);
    if (nextIndex !== -1) playTrackAt(nextIndex);
  });
}

let audioContextWatchTimer = null;
function startAudioContextWatch() {
  if (audioContextWatchTimer) return;
  audioContextWatchTimer = setInterval(() => {
    if (window.__qnAudioCtx && window.__qnAudioCtx.state === "suspended") {
      console.warn("AudioContext became suspended during playback — attempting to resume.");
      window.__qnAudioCtx.resume().catch(err => console.warn("AudioContext resume failed:", err));
    }
  }, 2000);
}
function stopAudioContextWatch() {
  if (audioContextWatchTimer) {
    clearInterval(audioContextWatchTimer);
    audioContextWatchTimer = null;
  }
}

audio.onplay = () => {
  updatePlayButtonState();
  startAudioContextWatch();
};
audio.onpause = () => {
  updatePlayButtonState();
  stopAudioContextWatch();
};
audio.onended = () => {
  // iOSはBluetooth瞬断等で曲の途中に"ended"が誤発火する。currentTimeがdurationの1秒以内か確認し、途中なら次曲へ進まず同位置から再開
  const dur = audio.duration;
  const ct = audio.currentTime;
  const reallyEnded = !dur || !isFinite(dur) || (dur - ct) < 1;

  if (!reallyEnded) {
    console.warn(`Spurious 'ended' event detected at ${ct.toFixed(1)}s / ${dur.toFixed(1)}s — resuming playback instead of advancing.`);
    audio.play().catch(err => console.warn("Resume after spurious ended failed:", err));
    updatePlayButtonState();
    return;
  }

  updatePlayButtonState();

  if (repeatMode === "one") {
    audio.currentTime = 0;
    audio.play();
    updatePlayButtonState();
    return;
  }

  const wrapAround = repeatMode === "all";
  const nextIndex = findEnabledTrackIndex(currentPlaylistIndex, 1, wrapAround);
  if (nextIndex !== -1) {
    playTrackAt(nextIndex);
  } else {
    // 次のON曲が無く停止する場合は再生中監視も明示的に止める(onpauseが発火しないため)
    stopAudioContextWatch();
  }
};

// 【v2.13.5 保険】読込失敗時はIndexedDBから読み直して1回だけ再試行(GOTCHAS.md)
let lastAudioRecoveryName = null;
audio.addEventListener("error", async () => {
  if (typeof currentPlaylistIndex === "undefined" || currentPlaylistIndex < 0) return;
  const track = playlist[currentPlaylistIndex];
  if (!track || !track.file) return;
  const name = track.file.name;
  if (lastAudioRecoveryName === name) return; // 同じ曲で無限再試行しない
  lastAudioRecoveryName = name;
  console.warn("Audio load failed — reloading track data from storage:", name);
  const fresh = typeof reloadTrackFileFromDB === "function" ? await reloadTrackFileFromDB(name) : null;
  if (!fresh || playlist[currentPlaylistIndex] !== track) return;
  track.file = fresh;
  loadFile(fresh);
  audio.play().catch(() => {});
});
audio.addEventListener("loadedmetadata", () => { lastAudioRecoveryName = null; });

document.getElementById("playToggle").onclick = togglePlay;



const prevTrackBtn = document.getElementById("prevTrackBtn");
if (prevTrackBtn) prevTrackBtn.onclick = () => playPrevTrack();

const nextTrackBtn = document.getElementById("nextTrackBtn");
if (nextTrackBtn) nextTrackBtn.onclick = () => playNextTrack();

document.addEventListener("keydown", e => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  // アプリ(YouTube等)表示中は本体ショートカットを無効(qn-apps.js参照)
  if (document.body.classList.contains("qn-app-open")) return;

  const activePins = pins.filter(p => p.enabled);

  if (e.code === "Space" || e.key === " ") {
    e.preventDefault();
    togglePlay();
  }
  else if (e.key === "Enter") {
    e.preventDefault();
    if (typeof seekToTrackStart === "function") seekToTrackStart();
  }
  else if (e.key === "l" || e.key === "L") {
    e.preventDefault();
    const loopBtn = document.getElementById("loopToggleBtn");
    if (loopBtn) loopBtn.click();
  }
  else if (e.ctrlKey && (e.key === "r" || e.key === "R")) {
    e.preventDefault();
    const speedResetBtnEl = document.getElementById("controlSpeedResetBtn");
    if (speedResetBtnEl && !speedResetBtnEl.disabled) speedResetBtnEl.click();
    const keyResetBtnEl = document.getElementById("controlKeyResetBtn");
    if (keyResetBtnEl && !keyResetBtnEl.disabled) keyResetBtnEl.click();
  }
  else if (e.key === "r" || e.key === "R") {
    e.preventDefault();
    const allRepeatBtn = document.getElementById("allRepeatToggleBtn");
    if (allRepeatBtn) allRepeatBtn.click();
  }
  else if (e.key === "p" || e.key === "P" || e.key === "m" || e.key === "M") {
    e.preventDefault();
    addCurrentPin();
  }
  else if (e.ctrlKey && e.key === "ArrowRight") {
    e.preventDefault();
    setSpeed(currentSpeed + 0.01);
  }
  else if (e.ctrlKey && e.key === "ArrowLeft") {
    e.preventDefault();
    setSpeed(currentSpeed - 0.01);
  }
  else if (e.ctrlKey && e.key === "ArrowUp") {
    e.preventDefault();
    const keyUpBtnEl = document.getElementById("keyUpBtn");
    if (!keyUpBtnEl || !keyUpBtnEl.disabled) setKeySemitones(currentKeySemitones + 1);
  }
  else if (e.ctrlKey && e.key === "ArrowDown") {
    e.preventDefault();
    const keyDownBtnEl = document.getElementById("keyDownBtn");
    if (!keyDownBtnEl || !keyDownBtnEl.disabled) setKeySemitones(currentKeySemitones - 1);
  }
  else if (e.key === "ArrowRight") {
    e.preventDefault();
    jumpToNextMarker();
  }
  else if (e.key === "ArrowLeft") {
    e.preventDefault();
    jumpToPrevMarker();
  }
  else if (e.key === "ArrowUp") {
    if (activePins.length > 0) {
      e.preventDefault();
      beginSeek();
      audio.currentTime = activePins[0].t;
      prevTime = activePins[0].t;
      audio.play();
      updatePlayButtonState();
      renderSegments(getActiveSegment(activePins[0].t));
      setTimeout(() => { isSeeking = false; }, 150);
    }
  }
  else if (e.key === "ArrowDown") {
    if (activePins.length > 0) {
      e.preventDefault();
      beginSeek();
      audio.currentTime = activePins[activePins.length - 1].t;
      prevTime = activePins[activePins.length - 1].t;
      audio.play();
      updatePlayButtonState();
      renderSegments(getActiveSegment(activePins[activePins.length - 1].t));
      setTimeout(() => { isSeeking = false; }, 150);
    }
  }
  else if (e.ctrlKey && e.key >= "1" && e.key <= "9") {
    e.preventDefault();
    const index = parseInt(e.key) - 1;
    if (pins[index] !== undefined) {
      pins[index].enabled = !pins[index].enabled;
      renderPins();
      renderSegments();
      renderPinList();
      savePins();
    }
  }
  else if (!e.ctrlKey && e.key >= "1" && e.key <= "9") {
    const index = parseInt(e.key) - 1;
    if (pins[index] !== undefined) {
      e.preventDefault();
      beginSeek();
      audio.currentTime = pins[index].t;
      prevTime = pins[index].t;
      audio.play();
      updatePlayButtonState();
      renderSegments(getActiveSegment(pins[index].t));
      setTimeout(() => { isSeeking = false; }, 150);
    }
  }
});







// updateBarsは毎フレーム呼ばれる: 配列/DOM参照は使い回す(GC抑制)。時刻表示はUPDATE_BARS_VISUAL_INTERVAL_MSで間引く。マーカー区間ループの折り返し判定は精度のため間引かず毎フレーム
const updateBarsCurrentValEl = document.getElementById("currentTimeVal");
const updateBarsDurationValEl = document.getElementById("durationVal");
const UPDATE_BARS_VISUAL_INTERVAL_MS = 100;
let lastVisualUpdateTime = 0;
let lastCurrentTimeText = null;
let lastDurationText = null;

function updateBars() {
  requestAnimationFrame(updateBars);
  if (!audio.duration) return;

  const dur = audio.duration;
  const ct = audio.currentTime;
  const now = performance.now();

  if (now - lastVisualUpdateTime >= UPDATE_BARS_VISUAL_INTERVAL_MS) {
    lastVisualUpdateTime = now;

    if (updateBarsCurrentValEl && updateBarsDurationValEl) {
      const ctText = formatTime(ct);
      const durText = formatTime(dur);
      if (ctText !== lastCurrentTimeText) {
        updateBarsCurrentValEl.textContent = ctText;
        lastCurrentTimeText = ctText;
      }
      if (durText !== lastDurationText) {
        updateBarsDurationValEl.textContent = durText;
        lastDurationText = durText;
      }
    }
  }

  // 折り返し判定は毎フレーム(間引かない)。loopEnabled判定を先に(OFFなら配列生成しない)。v3.7.0〜: A-Bループはloop WrapAB()
  if (loopEnabled && loopMode === "ab" && !isSeeking && !isJumping && !audio.paused) {
    const abr = getABRange();
    if (abr) loopWrapAB(abr, ct);
  }

  if (loopEnabled && loopMode !== "ab" && !isSeeking && !isJumping && !audio.paused) {
    const activePinObjs = pins.filter(p => p.enabled);
    const activePins = activePinObjs.map(p => p.t);
    if (activePins.length >= 2) {
      const preroll = typeof loopPreRollSeconds === "number" ? loopPreRollSeconds : 0;

      // 対象区間未決定、またはctがpre/post-roll込みの許容範囲外なら現在地から再計算(個別イベントを検知せずとも区間外なら自動追従)。判定ルールはYouTubeと共通(qn-marker-core.js)
      const inCurrentRange = QNMarkerCore.inSectionRange(activePins, loopActiveMarkerIndex, ct, preroll, audio.duration);

      if (!inCurrentRange) {
        const foundIndex = QNMarkerCore.pickSectionIndex(activePins, ct);
        loopActiveMarkerIndex = foundIndex;
      }

      const i = loopActiveMarkerIndex;
      const start = activePins[i];
      const end = activePins[i + 1];
      const jumpTarget = Math.max(0, start - preroll);
      const endPlayback = Math.min(audio.duration || end, end + preroll);

      if (prevTime < endPlayback && ct >= endPlayback) {
        let stoppedByShareware = false;
        if (typeof isUnlocked === "function" && !isUnlocked()) {
          swAbLoopCount++;
          swUpdateLoopCounterUI();
          if (swAbLoopCount >= SW_LIMITS.AB_LOOP_MAX_COUNT) {
            loopEnabled = false;
            swAbLoopCount = 0;
            if (typeof applyLoopButtonUI === "function") applyLoopButtonUI();
            swUpdateLoopCounterUI();
            swShowUnlockToast(`無料版のAB間ループは${SW_LIMITS.AB_LOOP_MAX_COUNT}回で自動停止します。`);
            stoppedByShareware = true;
          }
        }
        if (!stoppedByShareware) {
          audio.currentTime = jumpTarget;
          isJumping = true;
          // 開始側マーカーのcolorを引き継ぐ({start,end}だけだとcolor undefinedでrenderSegmentsがデフォルト色になり2周目以降で色が消える)
          renderSegments({ start, end, color: activePinObjs[i].color || null });
          notifyLoopCompleted();
          setTimeout(() => {
            isJumping = false;
          }, 200);
        }
      }
    }
  }

  // 【v3.46.0】スキップ区間: 再生が自然にスキップ開始マーカーを跨いだ時だけ、次の(スキップでない)マーカーへ飛ぶ。ループ中・シーク中・ジャンプ中は対象外(ユーザーがタップして入った区間はそのまま再生される)
  if (!loopEnabled && !isSeeking && !isJumping && !audio.paused && typeof getSkipRanges === "function") {
    const cur = audio.currentTime;
    if (cur > prevTime && cur - prevTime < 0.5) {
      const ranges = getSkipRanges();
      let target = -1;
      for (let k = 0; k < ranges.length; k++) {
        if (prevTime < ranges[k].start && cur >= ranges[k].start && cur < ranges[k].end) { target = ranges[k].end; break; }
      }
      if (target >= 0) {
        // 連続するスキップ区間(終点が次のスキップの始点)は続けて飛ぶ
        let moved = true;
        while (moved) { moved = false; for (let k = 0; k < ranges.length; k++) if (Math.abs(ranges[k].start - target) < 0.001) { target = ranges[k].end; moved = true; } }
        audio.currentTime = target;
        prevTime = target;
        isJumping = true;
        renderSegments();
        setTimeout(() => { isJumping = false; }, 200);
        return;
      }
    }
  }

  prevTime = audio.currentTime;
}

updateBars();

function loopWrapAB(abr, ct) {
  const preroll = typeof loopPreRollSeconds === "number" ? loopPreRollSeconds : 0;
  const jumpTarget = Math.max(0, abr.start - preroll);
  const endPlayback = Math.min(audio.duration || abr.end, abr.end + preroll);
  if (!(prevTime < endPlayback && ct >= endPlayback)) return;

  if (typeof isUnlocked === "function" && !isUnlocked()) {
    swAbLoopCount++;
    swUpdateLoopCounterUI();
    if (swAbLoopCount >= SW_LIMITS.AB_LOOP_MAX_COUNT) {
      loopEnabled = false;
      swAbLoopCount = 0;
      if (typeof applyLoopButtonUI === "function") applyLoopButtonUI();
      swUpdateLoopCounterUI();
      swShowUnlockToast(`無料版のAB間ループは${SW_LIMITS.AB_LOOP_MAX_COUNT}回で自動停止します。`);
      return;
    }
  }
  audio.currentTime = jumpTarget;
  isJumping = true;
  renderSegments({ start: abr.start, end: abr.end, color: abr.color });
  notifyLoopCompleted();
  setTimeout(() => { isJumping = false; }, 200);
}

function abLeaveIfOutside(t) {
  if (!loopEnabled || loopMode !== "ab") return;
  const abr = typeof getABRange === "function" ? getABRange() : null;
  if (!abr) return;
  if (!QNMarkerCore.isOutsideAB(abr.start, abr.end, t)) return;
  if (typeof setLoopModeState === "function") setLoopModeState("off", true);
  else { loopEnabled = false; if (typeof applyLoopButtonUI === "function") applyLoopButtonUI(); }
}

// 行(.vbar)のタップでシーク。行は仮想スクロールで作り直されるので、親(#vbarRows)で受ける(委譲)
document.getElementById("vbarRows").addEventListener("click", e => {
  const bar = e.target.closest ? e.target.closest(".vbar") : null;
  if (!bar || !audio.duration) return;
  if (typeof lastPinTapAt !== "undefined" && Date.now() - lastPinTapAt < 400) return;

  const clickedTime = QNBars.timeInRow(bar, parseInt(bar.dataset.row, 10), e.clientX);
  if (clickedTime === null) return;
  beginSeek();
  abLeaveIfOutside(clickedTime);

  audio.currentTime = clickedTime;
  prevTime = clickedTime;

  renderSegments(getActiveSegment(clickedTime));
  audio.play();
  updatePlayButtonState();

  setTimeout(() => {
    isSeeking = false;
  }, 150);

  if (typeof showPinPopup === "function") showPinPopup(clickedTime, bar, e.clientX, null);
});


// 【v3.45.0】波形のジェスチャー(タップ=従来どおりシーク+再生)
//  長押し(0.5秒): その位置にマーカー追加 / 横スワイプ: 再生位置をスクラブ(行の幅=バー長の秒数) / ダブルタップ(再生中): その位置で停止
//  マーカーの線・A/B旗の上から始めた操作は対象外(それぞれ独自のドラッグ/タップ)。#vbarRowsはCSSでtouch-action:pan-y(横方向はこちらで処理)
(function () {
  const rowsEl = document.getElementById("vbarRows");
  if (!rowsEl) return;
  const LONG_MS = 500, MOVE_PX = 10, DBL_MS = 320, DBL_PX = 36;
  let g = null, suppressUntil = 0, lastTap = { at: 0, x: 0, y: 0 };

  function clearTimer() { if (g && g.timer) { clearTimeout(g.timer); g.timer = 0; } }

  rowsEl.addEventListener("pointerdown", e => {
    if (!audio.duration || (e.pointerType === "mouse" && e.button !== 0)) return;
    if (e.target.closest && e.target.closest(".vbar-line, .vbar-label, .vbar-ab-pt")) return;
    const bar = e.target.closest ? e.target.closest(".vbar") : null;
    if (!bar) return;
    g = { id: e.pointerId, x0: e.clientX, y0: e.clientY, bar: bar, mode: null, startT: audio.currentTime, timer: 0, touch: e.pointerType !== "mouse" };
    g.timer = setTimeout(() => {
      if (!g || g.mode) return;
      g.mode = "long";
      const t = QNBars.timeInRow(g.bar, parseInt(g.bar.dataset.row, 10), g.x0);
      suppressUntil = Date.now() + 700;
      if (t !== null && typeof addPinAt === "function") addPinAt(t);
    }, LONG_MS);
  });

  rowsEl.addEventListener("pointermove", e => {
    if (!g || e.pointerId !== g.id) return;
    const dx = e.clientX - g.x0, dy = e.clientY - g.y0;
    if (!g.mode) {
      if (Math.abs(dx) < MOVE_PX && Math.abs(dy) < MOVE_PX) return;
      clearTimer();
      if (g.touch && Math.abs(dx) > Math.abs(dy) * 1.5) {
        g.mode = "scrub";
        g.startT = audio.currentTime;
        try { rowsEl.setPointerCapture(e.pointerId); } catch (err) {}
        beginSeek();
        if (typeof hidePinPopup === "function") hidePinPopup();
      } else { g.mode = "other"; return; }
    }
    if (g.mode === "scrub") {
      const w = g.bar.getBoundingClientRect().width || 1;
      const t = Math.max(0, Math.min(audio.duration, g.startT + dx / w * QNBars.getSec()));
      audio.currentTime = t;
      prevTime = t;
    }
  });

  function end(e) {
    if (!g || e.pointerId !== g.id) return;
    clearTimer();
    if (g.mode === "scrub") {
      suppressUntil = Date.now() + 400;
      setTimeout(() => { isSeeking = false; }, 150);
    }
    g = null;
  }
  rowsEl.addEventListener("pointerup", end);
  rowsEl.addEventListener("pointercancel", end);

  // 長押し/スクラブ直後のclickは無効化。ダブルタップ(2回目)は再生中ならその位置で停止して通常のシーク+再生を止める(captureで先に受ける)
  rowsEl.addEventListener("click", e => {
    if (Date.now() < suppressUntil) { e.stopImmediatePropagation(); e.preventDefault(); return; }
    const now = Date.now();
    const dbl = now - lastTap.at < DBL_MS && Math.abs(e.clientX - lastTap.x) < DBL_PX && Math.abs(e.clientY - lastTap.y) < DBL_PX;
    lastTap = { at: now, x: e.clientX, y: e.clientY };
    if (dbl && !audio.paused) {
      e.stopImmediatePropagation();
      lastTap.at = 0;
      if (typeof hidePinPopup === "function") hidePinPopup();
      if (typeof hapticTap === "function") hapticTap();
      audio.pause();
      updatePlayButtonState();
    }
  }, true);
})();




const isMobileLayout = () => window.matchMedia("(max-width: 768px)").matches;



const mobileTabBtns = document.querySelectorAll(".mobile-tab-btn");
let currentMobileTab = "playlist";

function applyMobileTabLayout() {
  document.querySelectorAll(".mobile-tab-panel").forEach(panel => {
    const tabName = panel.getAttribute("data-tab-panel");
    panel.classList.toggle("mobile-tab-active", tabName === currentMobileTab);
  });
}

function setMobileTab(tabName) {
  currentMobileTab = tabName;
  mobileTabBtns.forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-tab") === tabName);
  });
  applyMobileTabLayout();
  if (typeof updateSidebarHeightForTextTab === "function") {
    updateSidebarHeightForTextTab();
  }
}


const sidebarSection = document.getElementById("sidebarSection");

// EQセクションは常にEQモーダル内に留める(SPでスクロールとEQスライダーのドラッグが競合するため)
const eqInlineSection = document.getElementById("eqInlineSection");
let eqInlineOrigin = null;
if (eqInlineSection) {
  eqInlineOrigin = {
    parent: eqInlineSection.parentNode,
    nextSibling: eqInlineSection.nextSibling
  };
}

function applyEqInlineLayout() {
  if (!eqInlineSection || !eqInlineOrigin) return;
  if (eqInlineSection.parentNode !== eqInlineOrigin.parent) {
    eqInlineOrigin.parent.insertBefore(eqInlineSection, eqInlineOrigin.nextSibling);
  }
}

mobileTabBtns.forEach(btn => {
  btn.onclick = () => {
    hapticTap();
    setMobileTab(btn.getAttribute("data-tab"));
  };
});

setMobileTab("playlist");
applyEqInlineLayout();

function syncAllMobileLayout() {
  applyEqInlineLayout();
}
window.addEventListener("resize", syncAllMobileLayout);

function syncTopControlsSpacerHeight() {
  const topControls = document.getElementById("topControls");
  const spacer = document.getElementById("topControlsSpacer");
  const sidebarSection = document.querySelector(".sidebar-section");
  const mobileTabPanels = document.querySelectorAll(".mobile-tab-panel");
  if (!topControls || !spacer) return;

  const h = topControls.getBoundingClientRect().height;

  // topControlsはfixed。body下端にその高さ分の余白を確保(無いと最下部の項目が裏に隠れる)
  spacer.style.height = h + "px";

  // 各要素が実際に.app-container内に留まっているかで判定する(body.pc-v2-activeでの判定は読み込み順で取りこぼす。PC v2は要素を#pcV2PanelBody内へ移すので、移動済み要素にpadding-bottomを付けると不要な余白になる)
  mobileTabPanels.forEach(panel => {
    const stillInAppContainer = !!panel.closest(".app-container");
    if (!stillInAppContainer) {
      panel.style.paddingBottom = "";
      return;
    }
    if (isMobileLayout()) {
      // SP幅はbodyがoverflow:hiddenでスクロールしない。実スクロールは.sidebar-section内の.mobile-tab-panelなので、そちらにtopControls高さ分の余白(.sidebar-sectionにpaddingしても無効)
      panel.style.paddingBottom = (h + 8) + "px";
    } else {
      panel.style.paddingBottom = "";
    }
  });

  if (isMobileLayout()) {
    if (sidebarSection) sidebarSection.style.paddingBottom = "";
    document.body.style.paddingBottom = "";
  } else {
    document.body.style.paddingBottom = "";
    if (sidebarSection) sidebarSection.style.paddingBottom = "";
  }
}
syncTopControlsSpacerHeight();
window.addEventListener("resize", syncTopControlsSpacerHeight);

window.onload = async () => {
  updatePlayButtonState();
  syncTopControlsSpacerHeight();

  const splashStart = Date.now();
  const splashMinDurationMs = 1400;

  try {
    await restorePlaylistFromStorage();
  } catch (e) {
    // 復元失敗でもスプラッシュは必ず消す(エラーはconsole)
    console.error("restorePlaylistFromStorage failed:", e);
  }

  const elapsed = Date.now() - splashStart;
  const remaining = Math.max(0, splashMinDurationMs - elapsed);
  setTimeout(hideSplashOverlay, remaining);
};

function hideSplashOverlay() {
  const splash = document.getElementById("splashOverlay");
  if (!splash) return;
  splash.classList.add("splash-fade-out");
  setTimeout(() => {
    splash.style.display = "none";
  }, 550);
}

// 起動時にIndexedDBの全曲を復元。自動再生しない(ユーザー操作なしplay()はブロックされ、意図せず鳴るのも避ける)。IndexedDBへ書き戻さない
async function restorePlaylistFromStorage() {
  const savedTracks = await loadAllPlaylistTracks();
  // 復元が終わったら同期(player-sync.js)へ知らせる(曲が0件でも。復元前に同期すると「ローカルに曲が無い」と誤認するため)
  if (savedTracks.length === 0) { if (typeof window.qnLibSyncReady === "function") window.qnLibSyncReady(); return; }

  savedTracks.forEach(({ file, enabled, title, artist, favorite, folder }) => {
    playlist.push({ file, name: file.name, enabled, title: title || null, artist: artist || null, duration: null, favorite: !!favorite, folder: folder || null });
  });
  if (typeof normalizePlaylistGrouping === "function") normalizePlaylistGrouping();
  renderPlaylist();

  playlist.forEach(track => {
    if (typeof readAudioDuration === "function") {
      readAudioDuration(track.file).then(dur => {
        if (dur) {
          track.duration = dur;
          renderPlaylist();
        }
      });
    }
  });

  // 1曲目を選曲済みにする(autoplay:false)
  playTrackAt(0, false);
  if (typeof window.qnLibSyncReady === "function") window.qnLibSyncReady();
}

// ハプティクス(非対応は無視): tap=押下/タブ切替/ポップアップ開閉/スウォッチ選択、tick=スライダー目盛り跨ぎ(呼び出し側で間引く)、success=マーカー追加/Export完了、warning=削除確認/エラー/上限下限到達
function hapticTap() {
  if (navigator.vibrate) navigator.vibrate(10);
}
function hapticTick() {
  if (navigator.vibrate) navigator.vibrate(6);
}
function hapticSuccess() {
  if (navigator.vibrate) navigator.vibrate([15, 40, 15]);
}
function hapticWarning() {
  if (navigator.vibrate) navigator.vibrate([20, 60, 20, 60, 20]);
}



(function syncRangeProgressLoop() {
  const targets = Array.from(document.querySelectorAll(".control-card input[type=\"range\"], .eq-vslider"));
  const lastValues = new Map();
  let lastTickAt = 0;
  function tick(now) {
    requestAnimationFrame(tick);
    if (document.hidden || (now - lastTickAt) < 200) return;
    lastTickAt = now;
    targets.forEach(input => {
      if (lastValues.get(input) !== input.value) {
        lastValues.set(input, input.value);
        const min = parseFloat(input.min) || 0;
        const max = parseFloat(input.max) || 100;
        const val = parseFloat(input.value);
        const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
        input.style.setProperty("--range-progress", String(pct));
      }
    });
  }
  if (targets.length > 0) requestAnimationFrame(tick);
})();
