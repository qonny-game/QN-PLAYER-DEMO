// player-export.js — 範囲書き出し(モーダル開閉/状態/レンダリング/保存)。依存: player-core.js(audioBufferToWavBlob,audioBufferToMp3Blob,renderExportBuffer,suggestExportFileName), player-ui-shared.js(haptic*)


// ---------- エクスポート処理本体：AudioBuffer -> WAV変換、OfflineAudioContextでのレンダリング ----------


// ---------- エクスポートモーダル：開閉と、Range/Effects/FileName等の状態管理 ----------
const exportToggleBtn = document.getElementById("exportToggleBtn");
const exportModalOverlay = document.getElementById("exportModalOverlay");
const exportModalCloseBtn = document.getElementById("exportModalCloseBtn");
const exportRangeAll = document.getElementById("exportRangeAll");
const exportRangeMarker = document.getElementById("exportRangeMarker");
const exportMarkerStartSelect = document.getElementById("exportMarkerStartSelect");
const exportMarkerEndSelect = document.getElementById("exportMarkerEndSelect");
const exportFileNameInput = document.getElementById("exportFileName");
const exportRunBtn = document.getElementById("exportRunBtn");
const exportStatusEl = document.getElementById("exportStatus");


function populateExportMarkerSelect() {
  const activePins = pins.filter(p => p.enabled).sort((a, b) => a.t - b.t);
  exportMarkerStartSelect.innerHTML = "";
  exportMarkerEndSelect.innerHTML = "";

  if (activePins.length < 2) {
    [exportMarkerStartSelect, exportMarkerEndSelect].forEach(sel => {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No markers available";
      sel.appendChild(opt);
      sel.disabled = true;
    });
    if (exportRangeMarker) exportRangeMarker.disabled = true;
    return;
  }

  if (exportRangeMarker) exportRangeMarker.disabled = false;
  activePins.forEach((pin, i) => {
    const label = `${i + 1} (${pin.t.toFixed(2)}s)`;

    const startOpt = document.createElement("option");
    startOpt.value = i;
    startOpt.textContent = label;
    exportMarkerStartSelect.appendChild(startOpt);

    const endOpt = document.createElement("option");
    endOpt.value = i;
    endOpt.textContent = label;
    exportMarkerEndSelect.appendChild(endOpt);
  });

  exportMarkerStartSelect.value = "0";
  exportMarkerEndSelect.value = String(activePins.length - 1);

  const enabled = exportRangeMarker && exportRangeMarker.checked;
  exportMarkerStartSelect.disabled = !enabled;
  exportMarkerEndSelect.disabled = !enabled;
}

function setExportStatus(text, kind) {
  exportStatusEl.textContent = text || "";
  exportStatusEl.classList.remove("error", "success");
  if (kind) exportStatusEl.classList.add(kind);
}

const exportFormatWav = document.getElementById("exportFormatWav");
const exportFormatMp3 = document.getElementById("exportFormatMp3");
const exportWavDetail = document.getElementById("exportWavDetail");
const exportMp3Detail = document.getElementById("exportMp3Detail");

function updateExportFormatDetailVisibility() {
  const isMp3 = exportFormatMp3 && exportFormatMp3.checked;
  if (exportWavDetail) exportWavDetail.style.display = isMp3 ? "none" : "";
  if (exportMp3Detail) exportMp3Detail.style.display = isMp3 ? "" : "none";
}

if (exportFormatWav) exportFormatWav.onchange = updateExportFormatDetailVisibility;
if (exportFormatMp3) exportFormatMp3.onchange = updateExportFormatDetailVisibility;

function openExportModal() {
  hapticTap();
  exportFileNameInput.value = suggestExportFileName();
  populateExportMarkerSelect();
  updateExportFormatDetailVisibility();
  setExportStatus("");
  exportModalOverlay.classList.add("open");
}

function closeExportModal() {
  hapticTap();
  exportModalOverlay.classList.remove("open");
}

if (exportToggleBtn) {
  exportToggleBtn.onclick = () => openExportModal();
}
if (exportModalCloseBtn) {
  exportModalCloseBtn.onclick = () => closeExportModal();
}
const exportCancelBtn = document.getElementById("exportCancelBtn");
if (exportCancelBtn) {
  exportCancelBtn.onclick = () => closeExportModal();
}
if (exportModalOverlay) {
  exportModalOverlay.onclick = (e) => {
    if (e.target === exportModalOverlay) closeExportModal();
  };
}
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && exportModalOverlay && exportModalOverlay.classList.contains("open")) {
    closeExportModal();
  }
});

if (exportRangeAll) {
  exportRangeAll.onchange = () => {
    exportMarkerStartSelect.disabled = true;
    exportMarkerEndSelect.disabled = true;
  };
}
if (exportRangeMarker) {
  exportRangeMarker.onchange = () => {
    const hasMarkers = exportMarkerStartSelect.options.length > 0 && exportMarkerStartSelect.options[0].value !== "";
    exportMarkerStartSelect.disabled = !exportRangeMarker.checked || !hasMarkers;
    exportMarkerEndSelect.disabled = !exportRangeMarker.checked || !hasMarkers;
  };
}

if (exportRunBtn) {
  exportRunBtn.onclick = async () => {
    hapticTap();

    if (currentPlaylistIndex < 0 || !playlist[currentPlaylistIndex]) {
      setExportStatus("No file loaded.", "error");
      return;
    }

    let startTime = 0;
    let endTime = audio.duration || 0;

    if (exportRangeMarker && exportRangeMarker.checked) {
      const startIndexRaw = exportMarkerStartSelect.value;
      const endIndexRaw = exportMarkerEndSelect.value;
      if (startIndexRaw === "" || startIndexRaw === null || endIndexRaw === "" || endIndexRaw === null) {
        setExportStatus("Please select start and end markers.", "error");
        return;
      }
      const activePins = pins.filter(p => p.enabled).sort((a, b) => a.t - b.t);
      const startIdx = parseInt(startIndexRaw, 10);
      const endIdx = parseInt(endIndexRaw, 10);
      if (!activePins[startIdx] || !activePins[endIdx]) {
        setExportStatus("Invalid marker selection.", "error");
        return;
      }
      const t1 = activePins[startIdx].t;
      const t2 = activePins[endIdx].t;
      if (t1 === t2) {
        setExportStatus("Start and end markers must be different.", "error");
        return;
      }
      startTime = Math.min(t1, t2);
      endTime = Math.max(t1, t2);
    }

    const applySpeed = !!(document.getElementById("exportApplySpeed") && document.getElementById("exportApplySpeed").checked);
    const applyKey = !!(document.getElementById("exportApplyKey") && document.getElementById("exportApplyKey").checked);
    const applyEq = !!(document.getElementById("exportApplyEq") && document.getElementById("exportApplyEq").checked);

    const fileNameBase = (exportFileNameInput.value || "output").trim() || "output";

    const isMp3 = exportFormatMp3 && exportFormatMp3.checked;
    const wavSampleRateChecked = document.querySelector('input[name="exportWavSampleRate"]:checked');
    const mp3BitrateChecked = document.querySelector('input[name="exportMp3Bitrate"]:checked');
    const wavSampleRate = parseInt((wavSampleRateChecked && wavSampleRateChecked.value) || "", 10) || 44100;
    const mp3Bitrate = parseInt((mp3BitrateChecked && mp3BitrateChecked.value) || "", 10) || 128;

    exportRunBtn.disabled = true;
    setExportStatus("Processing...");

    try {
      const renderedBuffer = await renderExportBuffer(startTime, endTime, applySpeed, applyKey, applyEq, isMp3 ? undefined : wavSampleRate);
      const blob = isMp3
        ? audioBufferToMp3Blob(renderedBuffer, mp3Bitrate)
        : audioBufferToWavBlob(renderedBuffer);
      const ext = isMp3 ? ".mp3" : ".wav";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileNameBase.toLowerCase().endsWith(ext) ? fileNameBase : fileNameBase + ext;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setExportStatus("Export complete.", "success");
      hapticSuccess();
    } catch (err) {
      console.warn("Export failed:", err);
      setExportStatus("Export failed: " + (err && err.message ? err.message : "unknown error"), "error");
      hapticWarning();
    } finally {
      exportRunBtn.disabled = false;
    }
  };
}
