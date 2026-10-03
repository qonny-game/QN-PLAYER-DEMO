// player-track-backup.js — PC v2サイドメニューのBackup/Import(PLAYERとYouTube共通の1画面)。
// Backup: 曲選択→含める項目(音声/設定)→Download。音声あり=ZIP(markers.json+audio/)、音声なし=markers.json単体。設定オフ=nameのみ。YouTubeがあればyoutube.jsonも、PITCH録音があればpitch.json+pitch/(音声)も同梱(window.QNYouTubeBackup / window.QNPitchBackup)。ZIP名: qnplayer_library_backup_YYYYMMDD.zip(.json)。
// Import: ZIP/JSONを自動判定(markers.json=PLAYER, youtube.json=YouTube, pitch.json=PITCH。旧形式も可)。同名曲は曲ごとに上書き/スキップ。JSON単体は音声なし→既存曲の上書きのみ。完了後ImportボタンはCloseに変わる。
// YouTube/PITCHアプリはwindow.qnBackupMountInto(mode,hostEl,onDismiss)でこの画面を借りる。
// 依存: player-core.js(playlist,savePlaylistTrack), player-ui-shared.js(hapticTap), player-playlist.js(renderPlaylist,persistPlaylistOrder)。JSZip(JS/jszip.min.js)を先に読み込む

// ---------- Backup/Import画面 ----------
// 実体は#trackBackupHome/#trackImportHome(hidden)内のbody+footerが各1つだけ。表示時はqnBackupMount()でPC v2パネル/YouTubeパネルへ移す(複製しない=idが一意)。
const trackBackupBodyNode = document.querySelector("#trackBackupHome .export-modal-body");
const trackBackupFooterNode = document.querySelector("#trackBackupHome .export-modal-footer");
const trackImportBodyNode = document.querySelector("#trackImportHome .export-modal-body");
const trackImportFooterNode = document.querySelector("#trackImportHome .export-modal-footer");

// 閉じる/完了の戻り先: YouTube借用中=window.qnBackupExternalDismiss(Libraryへ戻す)、他=PC v2パネル(Libraryへ)
function qnBackupDismissCurrent() {
  if (typeof window.qnBackupExternalDismiss === "function") window.qnBackupExternalDismiss();
  else if (typeof window.qnPcv2DismissAuxPanel === "function") window.qnPcv2DismissAuxPanel();
}

// stash退避用: 現在のbody/footer(PC v2のstashPanelContentsが使う)
window.qnBackupParts = function () {
  return { backupBody: trackBackupBodyNode, backupFooter: trackBackupFooterNode, importBody: trackImportBodyNode, importFooter: trackImportFooterNode };
};
// 表示の入口: 状態を初期化(prepare*)してからbody/footerをhostElへ移す。mode="backup"|"import"
window.qnBackupMount = function (mode, hostEl) {
  if (!hostEl) return;
  const isBackup = mode === "backup";
  if (isBackup) prepareBackupView(); else prepareImportView();
  const body = isBackup ? trackBackupBodyNode : trackImportBodyNode;
  const footer = isBackup ? trackBackupFooterNode : trackImportFooterNode;
  if (body) hostEl.appendChild(body);
  if (footer) hostEl.appendChild(footer);
};
// YouTubeパネル用: 閉じる時の戻り先(onDismiss)も渡して借りる
window.qnBackupMountInto = function (mode, hostEl, onDismiss) {
  if (!hostEl) return;
  window.qnBackupExternalDismiss = typeof onDismiss === "function" ? onDismiss : null;
  window.qnBackupMount(mode, hostEl);
};
// YouTube側がパネル切替時に呼ぶ(借用中だけのフックを外す)
window.qnBackupReleaseExternal = function () { window.qnBackupExternalDismiss = null; };

// YouTubeアプリ用の窓口(無ければnull)
function ytBackupApi() {
  return (window.QNYouTubeBackup && typeof window.QNYouTubeBackup.list === "function") ? window.QNYouTubeBackup : null;
}
// PITCHアプリ用の窓口(無ければnull)。list()はキャッシュ(同期)、refresh()でIndexedDBから読み直す(Promise)
function ptBackupApi() {
  return (window.QNPitchBackup && typeof window.QNPitchBackup.list === "function") ? window.QNPitchBackup : null;
}
const trackBackupCancelBtn = document.getElementById("trackBackupCancelBtn");
const trackBackupRunBtn = document.getElementById("trackBackupRunBtn");
const trackBackupStatusEl = document.getElementById("trackBackupStatus");

const trackBackupTrackListEl = document.getElementById("trackBackupTrackList");
const trackBackupSelectAllBtn = document.getElementById("trackBackupSelectAllBtn");
const trackBackupSelectNoneBtn = document.getElementById("trackBackupSelectNoneBtn");
const trackBackupSelectedCountEl = document.getElementById("trackBackupSelectedCount");
const trackBackupTotalSizeEl = document.getElementById("trackBackupTotalSize");

const trackBackupIncludeAudioEl = document.getElementById("trackBackupIncludeAudio");
const trackBackupIncludeSettingsEl = document.getElementById("trackBackupIncludeSettings");
const trackBackupIncludeYoutubeEl = document.getElementById("trackBackupIncludeYoutube");
// 「YouTube各種データ」にチェックが入っていればLibrary全動画(マーカー・A/B・フォルダ含む)を出力。件数を返す
function ytIncludeCount() {
  const y = ytBackupApi();
  return (trackBackupIncludeYoutubeEl && trackBackupIncludeYoutubeEl.checked && y) ? y.list().length : 0;
}
if (trackBackupIncludeYoutubeEl) trackBackupIncludeYoutubeEl.addEventListener("change", () => updateTrackBackupSelectionSummary());

let trackBackupSelectedNames = new Set();
// YouTube動画のチェック状態(キー=item.id)。開くたび全選択でリセット
let trackBackupSelectedYtIds = new Set();
// PITCH録音のチェック状態(キー=録音のDB id)
let trackBackupSelectedPtIds = new Set();

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 0.1) {
    const kb = bytes / 1024;
    return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  }
  return `${mb.toFixed(mb < 10 ? 1 : 1)} MB`;
}

function updateTrackBackupSelectionSummary() {
  if (!Array.isArray(playlist)) return;
  const selectedTracks = playlist.filter(t => trackBackupSelectedNames.has(t.name));
  // YouTubeは曲単位で選ばず「YouTube各種データ」の1項目で丸ごと(v3.61.0)
  const ytCount = ytIncludeCount();
  const pt = ptBackupApi();
  const ptSel = pt ? pt.list().filter(it => trackBackupSelectedPtIds.has(it.id)) : [];
  const ptCount = ptSel.length;
  if (trackBackupSelectedCountEl) {
    // 曲(PLAYER)・動画(YouTube)・録音(PITCH)を数える
    const parts = [];
    if (selectedTracks.length > 0) parts.push(`${selectedTracks.length}曲`);
    if (ptCount > 0) parts.push(`${ptCount}録音`);
    trackBackupSelectedCountEl.textContent = parts.length ? parts.join(" + ") + "選択中" : "0曲選択中";
  }
  if (trackBackupTotalSizeEl) {
    const totalBytes = selectedTracks.reduce((sum, t) => sum + (t.file && t.file.size ? t.file.size : 0), 0)
      + ptSel.reduce((sum, it) => sum + (it.size || 0), 0);
    trackBackupTotalSizeEl.textContent = formatFileSize(totalBytes);
  }
  if (trackBackupRunBtn) {
    trackBackupRunBtn.disabled = selectedTracks.length === 0 && ytCount === 0 && ptCount === 0;
  }
}

function makeTrackBackupGroupLabel(text) {
  const label = document.createElement("div");
  label.className = "track-backup-group-label";
  label.textContent = text;
  return label;
}

function renderTrackBackupTrackList() {
  if (!trackBackupTrackListEl) return;
  trackBackupTrackListEl.innerHTML = "";

  const tracks = Array.isArray(playlist) ? playlist : [];
  const yt = ytBackupApi();
  const ptApi = ptBackupApi();
  const ptList = ptApi ? ptApi.list() : [];
  // 【v3.55.0】Audio / YouTube / Pitch はそれぞれ独立した枠(見出し+一覧)にする
  let host = trackBackupTrackListEl;
  function startGroup(text) {
    host = document.createElement("div");
    host.className = "track-backup-group";
    host.appendChild(makeTrackBackupGroupLabel(text));
    const rows = document.createElement("div");
    rows.className = "track-backup-group-rows";
    host.appendChild(rows);
    trackBackupTrackListEl.appendChild(host);
    host = rows;
  }
  if (tracks.length > 0) startGroup("Audio");

  tracks.forEach(track => {
    const row = document.createElement("label");
    row.className = "track-backup-track-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = trackBackupSelectedNames.has(track.name);
    checkbox.onchange = () => {
      if (checkbox.checked) {
        trackBackupSelectedNames.add(track.name);
      } else {
        trackBackupSelectedNames.delete(track.name);
      }
      updateTrackBackupSelectionSummary();
    };
    row.appendChild(checkbox);

    const nameSpan = document.createElement("span");
    nameSpan.className = "track-backup-track-name";
    nameSpan.textContent = track.title || track.name;
    nameSpan.title = track.title || track.name;
    row.appendChild(nameSpan);

    const sizeSpan = document.createElement("span");
    sizeSpan.className = "track-backup-track-size";
    sizeSpan.textContent = formatFileSize(track.file && track.file.size);
    row.appendChild(sizeSpan);

    host.appendChild(row);
  });

  if (ptList.length > 0) {
    startGroup("Pitch");
    ptList.forEach(it => {
      const row = document.createElement("label");
      row.className = "track-backup-track-row";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = trackBackupSelectedPtIds.has(it.id);
      checkbox.onchange = () => {
        if (checkbox.checked) trackBackupSelectedPtIds.add(it.id);
        else trackBackupSelectedPtIds.delete(it.id);
        updateTrackBackupSelectionSummary();
      };
      row.appendChild(checkbox);

      const nameSpan = document.createElement("span");
      nameSpan.className = "track-backup-track-name";
      nameSpan.textContent = it.title;
      nameSpan.title = it.title;
      row.appendChild(nameSpan);

      const sizeSpan = document.createElement("span");
      sizeSpan.className = "track-backup-track-size";
      sizeSpan.textContent = formatFileSize(it.size);
      row.appendChild(sizeSpan);

      host.appendChild(row);
    });
  }
}

if (trackBackupSelectAllBtn) {
  trackBackupSelectAllBtn.onclick = () => {
    hapticTap();
    trackBackupSelectedNames = new Set((Array.isArray(playlist) ? playlist : []).map(t => t.name));
    const ytA = ytBackupApi();
    trackBackupSelectedYtIds = new Set(ytA ? ytA.list().map(it => it.id) : []);
    const ptA = ptBackupApi();
    trackBackupSelectedPtIds = new Set(ptA ? ptA.list().map(it => it.id) : []);
    renderTrackBackupTrackList();
    updateTrackBackupSelectionSummary();
  };
}
if (trackBackupSelectNoneBtn) {
  trackBackupSelectNoneBtn.onclick = () => {
    hapticTap();
    trackBackupSelectedNames = new Set();
    trackBackupSelectedYtIds = new Set();
    trackBackupSelectedPtIds = new Set();
    renderTrackBackupTrackList();
    updateTrackBackupSelectionSummary();
  };
}

function prepareBackupView() {
  if (!trackBackupBodyNode) return;

  trackBackupSelectedNames = new Set((Array.isArray(playlist) ? playlist : []).map(t => t.name));
  const ytOpen = ytBackupApi();
  trackBackupSelectedYtIds = new Set(ytOpen ? ytOpen.list().map(it => it.id) : []);
  const ptOpen = ptBackupApi();
  trackBackupSelectedPtIds = new Set(ptOpen ? ptOpen.list().map(it => it.id) : []);
  // PITCH録音はIndexedDBなので非同期で読み直し、届いたら全選択で描き直す
  if (ptOpen && typeof ptOpen.refresh === "function") {
    ptOpen.refresh().then(() => {
      trackBackupSelectedPtIds = new Set(ptOpen.list().map(it => it.id));
      renderTrackBackupTrackList();
      updateTrackBackupSelectionSummary();
    }).catch(() => {});
  }
  if (trackBackupIncludeAudioEl) trackBackupIncludeAudioEl.checked = true;
  if (trackBackupIncludeSettingsEl) trackBackupIncludeSettingsEl.checked = true;
  if (trackBackupIncludeYoutubeEl) trackBackupIncludeYoutubeEl.checked = true;

  renderTrackBackupTrackList();
  updateTrackBackupSelectionSummary();

  if (trackBackupRunBtn) trackBackupRunBtn.textContent = "Download";
  if (trackBackupStatusEl) trackBackupStatusEl.textContent = "";
}

if (trackBackupCancelBtn) trackBackupCancelBtn.onclick = qnBackupDismissCurrent;

function loadStoredPinsFor(fileName) {
  try {
    const raw = localStorage.getItem("mp3_pins_" + fileName);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function loadStoredABFor(fileName) {
  const out = { a: null, b: null };
  try {
    const o = JSON.parse(localStorage.getItem("mp3_ab_" + fileName) || "null");
    if (o && typeof o.a === "number") out.a = o.a;
    if (o && typeof o.b === "number") out.b = o.b;
  } catch (e) {}
  return out;
}

function loadStoredNoteTextFor(fileName) {
  try {
    return localStorage.getItem("mp3_text_" + fileName) || "";
  } catch (e) {
    return "";
  }
}

function downloadBlobAs(blob, name) {
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

async function runTrackBackup() {
  const targetTracks = (Array.isArray(playlist) ? playlist : []).filter(t => trackBackupSelectedNames.has(t.name));
  const yt = ytBackupApi();
  const ytIds = (yt && ytIncludeCount() > 0) ? yt.list().map(it => it.id) : [];
  const ptApi = ptBackupApi();
  const ptIds = ptApi ? ptApi.list().map(it => it.id).filter(id => trackBackupSelectedPtIds.has(id)) : [];
  if (targetTracks.length === 0 && ytIds.length === 0 && ptIds.length === 0) {
    if (trackBackupStatusEl) trackBackupStatusEl.textContent = "曲・動画・録音を1つ以上選択してください。";
    return;
  }

  const opts = {
    audio: trackBackupIncludeAudioEl ? trackBackupIncludeAudioEl.checked : false,
    settings: trackBackupIncludeSettingsEl ? trackBackupIncludeSettingsEl.checked : false
  };

  // PLAYER曲があるのに何も含めない設定は不可(YouTubeのみならURLだけ出力OK)
  if (targetTracks.length > 0 && !opts.audio && !opts.settings) {
    if (trackBackupStatusEl) trackBackupStatusEl.textContent = "少なくとも1項目を選択してください。";
    return;
  }

  // ZIP化が必要か: PLAYER音声を含める/PLAYERとYouTube同時
  const hasPlayer = targetTracks.length > 0;
  const hasYt = ytIds.length > 0;
  const hasPt = ptIds.length > 0;
  const includeAudio = hasPlayer && opts.audio;
  // PITCH録音は音声を含める時だけファイルが増える(点列・名前はpitch.jsonに常に入る)
  const sources = (hasPlayer ? 1 : 0) + (hasYt ? 1 : 0) + (hasPt ? 1 : 0);
  const needZip = includeAudio || (hasPt && opts.audio) || sources > 1;
  if (needZip && typeof JSZip === "undefined") {
    if (trackBackupStatusEl) trackBackupStatusEl.textContent = "JSZipが読み込まれていません。";
    return;
  }

  hapticTap();
  if (trackBackupRunBtn) {
    trackBackupRunBtn.disabled = true;
    trackBackupRunBtn.textContent = "Preparing...";
  }
  if (trackBackupStatusEl) trackBackupStatusEl.textContent = "";

  try {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");

    // ---------- PLAYER側のmarkers.json（従来と同じ形式） ----------
    let markersJsonText = null;
    if (hasPlayer) {
      const tracksForExport = targetTracks.map(track => {
        const trackData = { name: track.name };

        if (opts.settings) {
          const storedPins = loadStoredPinsFor(track.name);
          trackData.title = track.title || null;
          trackData.artist = track.artist || null;
          trackData.markers = storedPins.map(p => ({
            time: p.t,
            enabled: p.enabled !== false,
            color: p.color || null,
            memo: p.memo || "",
            skip: p.skip ? true : undefined
          }));
          const storedAB = loadStoredABFor(track.name);
          trackData.abA = storedAB.a;
          trackData.abB = storedAB.b;
          trackData.noteText = loadStoredNoteTextFor(track.name);
          // 【v3.24.0】所属フォルダは名前で持つ(idは端末ごと)。未分類=null。古い版は無視、古いバックアップ(キー無し)は読み込み側で触らない
          const folderNameForExport = typeof trackFolderId === "function" && typeof getPlaylistFolder === "function" && trackFolderId(track) ? getPlaylistFolder(track.folder).name : null;
          trackData.folder = folderNameForExport;
        }

        return trackData;
      });

      markersJsonText = JSON.stringify({
        version: "1.0",
        exportDate: new Date().toISOString(),
        tracks: tracksForExport
      }, null, 2);
    }

    // ---------- YouTube側のJSON（YouTubeアプリの形式。設定データ=タイトル・マーカー・AB点） ----------
    const ytJsonText = hasYt ? JSON.stringify(yt.buildExport(ytIds, true), null, 2) : null;

    // ---------- PITCH側(pitch.json + pitch/音声ファイル) ----------
    const ptExport = hasPt ? await ptApi.buildExport(ptIds, opts.audio) : null;
    const ptJsonText = ptExport ? JSON.stringify(ptExport.json) : null;

    if (needZip) {
      // PLAYER(markers.json+audio/)とYouTube(youtube.json)を1つのZIPへ。PLAYER側構成は従来と同じ(古い版はyoutube.jsonを無視して読める)
      const zip = new JSZip();
      if (hasPlayer) {
        zip.file("markers.json", markersJsonText);
        if (includeAudio) {
          const audioFolder = zip.folder("audio");
          targetTracks.forEach(track => audioFolder.file(track.name, track.file));
        }
      }
      if (hasYt) zip.file("youtube.json", ytJsonText);
      if (hasPt) {
        zip.file("pitch.json", ptJsonText);
        if (ptExport.files.length) {
          const pitchFolder = zip.folder("pitch");
          ptExport.files.forEach(f => pitchFolder.file(f.name, f.blob));
        }
      }
      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlobAs(blob, sources > 1
        ? `qnplayer_backup_${dateStr}.zip`
        : (hasPt ? `qn-pitch_backup_${dateStr}.zip` : `qnplayer_library_backup_${dateStr}.zip`));
    } else if (hasPlayer) {
      downloadBlobAs(new Blob([markersJsonText], { type: "application/json" }),
        `qnplayer_library_backup_${dateStr}.json`);
    } else if (hasYt) {
      // YouTubeのみ: JSON単体
      downloadBlobAs(new Blob([ytJsonText], { type: "application/json" }),
        `qn-youtube-library_${dateStr}.json`);
    } else {
      // PITCHのみ・音声なし: JSON単体(音声なしの新規は取り込めない=既存録音の名前上書き専用)
      downloadBlobAs(new Blob([ptJsonText], { type: "application/json" }),
        `qn-pitch_backup_${dateStr}.json`);
    }

    hapticSuccess();
    qnBackupDismissCurrent();
  } catch (err) {
    console.warn("runTrackBackup failed:", err);
    if (trackBackupStatusEl) trackBackupStatusEl.textContent = "バックアップの作成に失敗しました。";
  } finally {
    if (trackBackupRunBtn) {
      trackBackupRunBtn.disabled = false;
      trackBackupRunBtn.textContent = "Download";
    }
  }
}

if (trackBackupRunBtn) trackBackupRunBtn.onclick = runTrackBackup;

// ---------- Importモーダル ----------
const trackImportCancelBtn = document.getElementById("trackImportCancelBtn");
const trackImportRunBtn = document.getElementById("trackImportRunBtn");
const trackImportStatusEl = document.getElementById("trackImportStatus");

const trackImportDropZoneEl = document.getElementById("trackImportDropZone");
const trackImportFileInputEl = document.getElementById("trackImportFileInput");
const trackImportLoadedInfoEl = document.getElementById("trackImportLoadedInfo");
const trackImportLoadedFileNameEl = document.getElementById("trackImportLoadedFileName");
const trackImportLoadedFileCountEl = document.getElementById("trackImportLoadedFileCount");
const trackImportDuplicateListEl = document.getElementById("trackImportDuplicateList");
const trackImportDuplicateRowsEl = document.getElementById("trackImportDuplicateRows");
const trackImportSummaryEl = document.getElementById("trackImportSummary");
const trackImportBulkToggle = document.getElementById("trackImportBulkToggle");
const trackImportBulkToggleLabelEl = document.getElementById("trackImportBulkToggleLabel");

let trackImportParsedData = null;
let trackImportAudioFiles = null;
let trackImportDuplicateChoices = new Map();
// 読み込んだYouTube分(整形済みリスト。無ければnull)。重複選択はtrackImportDuplicateChoicesに"yt:<videoId>"キー(PLAYER曲名キーと衝突回避)
let trackImportYtList = null;
// 読み込んだPITCH録音(整形済み。無ければnull)と音声(ファイル名→Blob)。重複選択キーは"pt:<createdAt>"
let trackImportPtList = null;
let trackImportPtAudio = null;

function updateTrackImportCancelBtnMode() {
  if (!trackImportCancelBtn) return;
  if (trackImportParsedData) {
    trackImportCancelBtn.textContent = "Back";
    trackImportCancelBtn.onclick = resetImportState;
    trackImportCancelBtn.dataset.mode = "back";
  } else {
    trackImportCancelBtn.textContent = "Cancel";
    trackImportCancelBtn.onclick = qnBackupDismissCurrent;
    trackImportCancelBtn.dataset.mode = "cancel";
  }
}

function setTrackImportRunBtnMode(mode) {
  if (!trackImportRunBtn) return;
  if (mode === "importing") {
    trackImportRunBtn.disabled = true;
    trackImportRunBtn.textContent = "Importing...";
    trackImportRunBtn.onclick = null;
  } else if (mode === "close") {
    trackImportRunBtn.disabled = false;
    trackImportRunBtn.textContent = "Close";
    trackImportRunBtn.onclick = qnBackupDismissCurrent;
  } else {
    trackImportRunBtn.disabled = !trackImportParsedData;
    trackImportRunBtn.textContent = "Import";
    trackImportRunBtn.onclick = runTrackImport;
  }
}

function prepareImportView() {
  if (!trackImportBodyNode) return;
  resetImportState();
  if (trackImportStatusEl) trackImportStatusEl.textContent = "";
  // 重複判定用にPITCH録音の一覧を最新化(非同期。ファイル選択までには終わる)
  const ptOpen = ptBackupApi();
  if (ptOpen && typeof ptOpen.refresh === "function") ptOpen.refresh().catch(() => {});
}

function resetImportState() {
  trackImportParsedData = null;
  trackImportAudioFiles = null;
  trackImportYtList = null;
  trackImportPtList = null;
  trackImportPtAudio = null;
  trackImportDuplicateChoices = new Map();
  if (trackImportDropZoneEl) trackImportDropZoneEl.style.display = "flex";
  if (trackImportLoadedInfoEl) trackImportLoadedInfoEl.style.display = "none";
  if (trackImportDuplicateListEl) trackImportDuplicateListEl.style.display = "none";
  if (trackImportDuplicateRowsEl) trackImportDuplicateRowsEl.innerHTML = "";
  if (trackImportBulkToggle) trackImportBulkToggle.setAttribute("aria-checked", "true");
  if (trackImportBulkToggleLabelEl) trackImportBulkToggleLabelEl.textContent = "すべて上書き";
  if (trackImportSummaryEl) {
    trackImportSummaryEl.style.display = "none";
    trackImportSummaryEl.textContent = "";
  }
  if (trackImportFileInputEl) trackImportFileInputEl.value = "";
  setTrackImportRunBtnMode("import");
  updateTrackImportCancelBtnMode();
}

if (trackImportDropZoneEl) {
  trackImportDropZoneEl.addEventListener("click", () => {
    if (trackImportFileInputEl) trackImportFileInputEl.click();
  });
  trackImportDropZoneEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
    trackImportDropZoneEl.classList.add("dragover");
  });
  trackImportDropZoneEl.addEventListener("dragleave", (e) => {
    e.stopPropagation();
    trackImportDropZoneEl.classList.remove("dragover");
  });
  trackImportDropZoneEl.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    trackImportDropZoneEl.classList.remove("dragover");
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleTrackImportFileSelected(file);
  });
}

if (trackImportFileInputEl) {
  trackImportFileInputEl.addEventListener("change", () => {
    const file = trackImportFileInputEl.files && trackImportFileInputEl.files[0];
    if (file) handleTrackImportFileSelected(file);
  });
}

async function handleTrackImportFileSelected(file) {
  const isZip = /\.zip$/i.test(file.name);
  const isJson = /\.json$/i.test(file.name);
  if (!isZip && !isJson) {
    if (trackImportStatusEl) trackImportStatusEl.textContent = "ZIPまたはJSONファイルを選択してください。";
    return;
  }
  if (isZip && typeof JSZip === "undefined") {
    if (trackImportStatusEl) trackImportStatusEl.textContent = "JSZipが読み込まれていません。";
    return;
  }

  resetImportState();
  if (trackImportStatusEl) trackImportStatusEl.textContent = "読み込み中...";

  try {
    let parsed = null;
    let ytList = null;
    let ptList = null;
    const ptAudio = new Map();
    const audioMap = new Map();
    const yt = ytBackupApi();
    const pt = ptBackupApi();

    if (isZip) {
      const zip = await JSZip.loadAsync(file);
      const markersEntry = zip.file("markers.json");
      const ytEntry = zip.file("youtube.json");
      const ptEntry = zip.file("pitch.json");
      if (!markersEntry && !ytEntry && !ptEntry) {
        if (trackImportStatusEl) trackImportStatusEl.textContent = "markers.json・youtube.json・pitch.jsonのいずれも見つかりません。";
        return;
      }
      if (markersEntry) {
        parsed = JSON.parse(await markersEntry.async("string"));

        const audioFolderFiles = zip.folder("audio") ? zip.folder("audio").file(/.*/) : [];
        for (const entry of audioFolderFiles) {
          const blob = await entry.async("blob");
          const baseName = entry.name.split("/").pop();
          audioMap.set(baseName, blob);
        }
      }
      if (ytEntry && yt) {
        ytList = yt.parseImport(JSON.parse(await ytEntry.async("string")));
      }
      if (ptEntry && pt) {
        ptList = pt.parseImport(JSON.parse(await ptEntry.async("string")));
        const pitchFolder = zip.folder("pitch");
        const pitchFiles = pitchFolder ? pitchFolder.file(/.*/) : [];
        for (const entry of pitchFiles) {
          ptAudio.set(entry.name.split("/").pop(), await entry.async("blob"));
        }
      }
    } else {
      // JSON単体インポート: tracks配列=PLAYER、format:qn-youtube-library=YouTubeと自動判定。PLAYERのJSON単体は音声なし→既存曲の上書き(メタ/マーカー/メモ)専用(音声なし新規はrunTrackImportがスキップ)
      const raw = JSON.parse(await file.text());
      if (raw && Array.isArray(raw.tracks)) {
        parsed = raw;
      } else if (pt && raw && raw.format === "qn-pitch-recordings") {
        ptList = pt.parseImport(raw);
      } else if (yt) {
        ytList = yt.parseImport(raw);
      }
    }

    const hasPlayerData = !!(parsed && Array.isArray(parsed.tracks));
    const hasYtData = !!(ytList && ytList.length);
    const hasPtData = !!(ptList && ptList.length);
    if (!hasPlayerData && !hasYtData && !hasPtData) {
      if (trackImportStatusEl) trackImportStatusEl.textContent = "ファイルの内容を読み取れませんでした。";
      return;
    }
    // YouTubeのみでも後続共通処理のため空tracksを持たせる
    if (!hasPlayerData) parsed = { tracks: [] };
    trackImportYtList = hasYtData ? ytList : null;
    trackImportPtList = hasPtData ? ptList : null;
    trackImportPtAudio = hasPtData ? ptAudio : null;

    trackImportParsedData = parsed;
    trackImportAudioFiles = audioMap;

    if (trackImportStatusEl) trackImportStatusEl.textContent = "";

    if (trackImportDropZoneEl) trackImportDropZoneEl.style.display = "none";
    if (trackImportLoadedInfoEl) trackImportLoadedInfoEl.style.display = "flex";
    if (trackImportLoadedFileNameEl) trackImportLoadedFileNameEl.textContent = file.name;
    if (trackImportLoadedFileCountEl) {
      const parts = [];
      if (parsed.tracks.length > 0 || (!hasYtData && !hasPtData)) parts.push(`PLAYER ${parsed.tracks.length}曲`);
      if (hasYtData) parts.push(`YouTube ${ytList.length}件`);
      if (hasPtData) parts.push(`PITCH ${ptList.length}件`);
      trackImportLoadedFileCountEl.textContent = parts.join(" / ");
    }
    setTrackImportRunBtnMode("import");
    updateTrackImportCancelBtnMode();

    const existingNames = new Set((Array.isArray(playlist) ? playlist : []).map(t => t.name));
    const duplicateEntries = parsed.tracks
      .map(t => t.name)
      .filter(name => existingNames.has(name))
      .map(name => ({ key: name, label: name }));
    if (trackImportYtList && yt) {
      trackImportYtList.forEach(x => {
        if (yt.exists(x.videoId)) {
          duplicateEntries.push({ key: "yt:" + x.videoId, label: "[YouTube] " + (x.customTitle || yt.titleOf(x.videoId) || x.videoId) });
        }
      });
    }

    if (trackImportPtList && pt) {
      trackImportPtList.forEach(x => {
        if (pt.exists(x.key)) duplicateEntries.push({ key: "pt:" + x.key, label: "[Pitch] " + (pt.titleOf(x.key) || x.name) });
      });
    }

    if (duplicateEntries.length > 0) {
      duplicateEntries.forEach(e => trackImportDuplicateChoices.set(e.key, "overwrite"));
      renderTrackImportDuplicateRows(duplicateEntries);
      if (trackImportDuplicateListEl) trackImportDuplicateListEl.style.display = "flex";
    }
  } catch (err) {
    console.warn("handleTrackImportFileSelected failed:", err);
    if (trackImportStatusEl) trackImportStatusEl.textContent = "ファイルの読み込みに失敗しました。";
  }
}

function renderTrackImportDuplicateRows(entries) {
  if (!trackImportDuplicateRowsEl) return;
  trackImportDuplicateRowsEl.innerHTML = "";

  entries.forEach(entry => {
    const row = document.createElement("div");
    row.className = "track-import-duplicate-row";

    const nameSpan = document.createElement("span");
    nameSpan.className = "track-import-duplicate-name";
    nameSpan.textContent = entry.label;
    nameSpan.title = entry.label;
    row.appendChild(nameSpan);

    row.appendChild(createTrackImportChoiceToggle(entry.key));

    trackImportDuplicateRowsEl.appendChild(row);
  });
}

function createTrackImportChoiceToggle(name) {
  const wrap = document.createElement("div");
  wrap.className = "track-import-choice-wrap";

  const label = document.createElement("span");
  label.className = "track-import-choice-label";

  const isOverwrite = trackImportDuplicateChoices.get(name) !== "skip";
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "glow-switch track-import-choice-switch";
  toggle.dataset.name = name;
  toggle.setAttribute("role", "switch");
  toggle.setAttribute("aria-checked", String(isOverwrite));
  toggle.innerHTML = '<span class="glow-switch-knob"></span>';

  function applyState(overwrite) {
    label.textContent = overwrite ? "上書き" : "スキップ";
    label.classList.toggle("is-skip", !overwrite);
    toggle.setAttribute("aria-checked", String(overwrite));
    toggle.title = overwrite ? "スキップに切り替え" : "上書きに切り替え";
  }
  applyState(isOverwrite);

  toggle.onclick = () => {
    const nextOverwrite = toggle.getAttribute("aria-checked") !== "true";
    trackImportDuplicateChoices.set(name, nextOverwrite ? "overwrite" : "skip");
    applyState(nextOverwrite);
  };

  wrap.appendChild(label);
  wrap.appendChild(toggle);
  return wrap;
}

function setAllTrackImportDuplicateChoices(choice) {
  if (!trackImportDuplicateRowsEl) return;
  const overwrite = choice !== "skip";
  trackImportDuplicateRowsEl.querySelectorAll(".track-import-choice-switch").forEach(toggle => {
    const name = toggle.dataset.name;
    trackImportDuplicateChoices.set(name, choice);
    toggle.setAttribute("aria-checked", String(overwrite));
    const label = toggle.previousElementSibling;
    if (label && label.classList.contains("track-import-choice-label")) {
      label.textContent = overwrite ? "上書き" : "スキップ";
      label.classList.toggle("is-skip", !overwrite);
      toggle.title = overwrite ? "スキップに切り替え" : "上書きに切り替え";
    }
  });
}

if (trackImportBulkToggle) {
  trackImportBulkToggle.setAttribute("aria-checked", "true");
  trackImportBulkToggle.onclick = () => {
    const nextOverwrite = trackImportBulkToggle.getAttribute("aria-checked") !== "true";
    trackImportBulkToggle.setAttribute("aria-checked", String(nextOverwrite));
    if (trackImportBulkToggleLabelEl) {
      trackImportBulkToggleLabelEl.textContent = nextOverwrite ? "すべて上書き" : "すべてスキップ";
    }
    trackImportBulkToggle.title = nextOverwrite ? "すべてスキップに切り替え" : "すべて上書きに切り替え";
    setAllTrackImportDuplicateChoices(nextOverwrite ? "overwrite" : "skip");
  };
}

async function runTrackImport() {
  if (!trackImportParsedData) return;

  hapticTap();
  setTrackImportRunBtnMode("importing");
  if (trackImportStatusEl) trackImportStatusEl.textContent = "";

  let addedCount = 0;
  let overwrittenCount = 0;
  let skippedCount = 0;
  let noAudioSkippedCount = 0;
  let folderTouched = false;

  // バックアップのフォルダ名→このライブラリのフォルダid(無ければ作る)。null/空=未分類
  function importFolderIdFor(name) {
    if (typeof name !== "string" || !name.trim() || typeof findOrCreatePlaylistFolderByName !== "function") return null;
    return findOrCreatePlaylistFolderByName(name).id;
  }

  try {
    const existingByName = new Map((Array.isArray(playlist) ? playlist : []).map(t => [t.name, t]));
    // 変更された曲(新規/上書き)だけ都度IndexedDBへ直列保存。persistPlaylistOrder()を使うな(全曲のsavedAt振り直し＋Blob再保存で重く、再生不能/フリーズの原因)。インポートでは並び順は変わらない

    for (const trackData of trackImportParsedData.tracks) {
      const name = trackData.name;
      if (!name) continue;

      const isDuplicate = existingByName.has(name);
      const choice = isDuplicate ? (trackImportDuplicateChoices.get(name) || "overwrite") : null;

      if (isDuplicate && choice === "skip") {
        skippedCount++;
        continue;
      }

      const audioBlob = trackImportAudioFiles ? trackImportAudioFiles.get(name) : null;

      if (isDuplicate) {
        // ---------- 重複曲の上書き ----------
        const existingTrack = existingByName.get(name);
        if (trackData.title !== undefined) existingTrack.title = trackData.title;
        if (trackData.artist !== undefined) existingTrack.artist = trackData.artist;
        if (trackData.folder !== undefined) { existingTrack.folder = importFolderIdFor(trackData.folder); folderTouched = true; }
        if (audioBlob) {
          existingTrack.file = new File([audioBlob], name, { type: audioBlob.type || "audio/mpeg" });
        }
        // 1曲だけ保存(savedAt維持)。【v2.13.5】音声ごと差し替え時のみIndexedDBの音声レコードを書き直す。メタのみ上書きならIndexedDBに触れない(GOTCHAS.md)
        if (audioBlob && typeof savePlaylistTrackAudioKeepingOrder === "function") {
          await savePlaylistTrackAudioKeepingOrder(existingTrack);
        } else if (typeof savePlaylistMetadataFor === "function") {
          await savePlaylistMetadataFor(existingTrack);
        }
        applyImportedMarkersAndText(name, trackData);
        overwrittenCount++;
      } else {
        // ---------- 新規追加 ----------
        if (!audioBlob) {
          noAudioSkippedCount++;
          continue;
        }
        const newFile = new File([audioBlob], name, { type: audioBlob.type || "audio/mpeg" });
        const newTrack = {
          file: newFile,
          name,
          title: trackData.title || null,
          artist: trackData.artist || null,
          duration: null,
          enabled: true,
          favorite: false,
          folder: trackData.folder !== undefined ? importFolderIdFor(trackData.folder) : null
        };
        if (newTrack.folder) folderTouched = true;
        playlist.push(newTrack);
        if (typeof savePlaylistTrack === "function") {
          await savePlaylistTrack(newTrack.file, undefined, newTrack.enabled, newTrack.title, newTrack.artist, newTrack.favorite);
        }
        if (newTrack.folder && typeof savePlaylistMetadataFor === "function") await savePlaylistMetadataFor(newTrack);
        applyImportedMarkersAndText(name, trackData);
        addedCount++;
      }
    }

    // フォルダが変わった曲があればグループ順へ並べ直してメタ保存(フォルダ指定の無い旧バックアップでは何もしない)
    if (folderTouched && typeof normalizePlaylistGrouping === "function") {
      normalizePlaylistGrouping();
      if (typeof persistPlaylistOrder === "function") await persistPlaylistOrder(); // localStorageのメタのみ(Blobに触れない)。folderも一緒に保存される
    }
    if (typeof renderPlaylist === "function") renderPlaylist();

    // ---------- YouTube分（YouTubeアプリの保存先へ反映） ----------
    let ytResult = null;
    const ytApi = ytBackupApi();
    if (trackImportYtList && ytApi) {
      const ytChoices = {};
      trackImportYtList.forEach(x => {
        const c = trackImportDuplicateChoices.get("yt:" + x.videoId);
        if (c) ytChoices[x.videoId] = c;
      });
      ytResult = ytApi.applyImport(trackImportYtList, ytChoices);
    }

    // ---------- PITCH分（PITCHアプリの保存先へ反映） ----------
    let ptResult = null;
    const ptApi = ptBackupApi();
    if (trackImportPtList && ptApi) {
      const ptChoices = {};
      trackImportPtList.forEach(x => {
        const c = trackImportDuplicateChoices.get("pt:" + x.key);
        if (c) ptChoices[x.key] = c;
      });
      ptResult = await ptApi.applyImport(trackImportPtList, trackImportPtAudio, ptChoices);
    }

    const hasPlayerPart = trackImportParsedData.tracks.length > 0 || !(ytResult || ptResult);
    const sections = [];
    if (hasPlayerPart) {
      let t = `新規追加: ${addedCount}件\n上書き: ${overwrittenCount}件\nスキップ: ${skippedCount}件`;
      if (noAudioSkippedCount > 0) t += `\n音声なしのためスキップ: ${noAudioSkippedCount}件`;
      sections.push(["PLAYER", t]);
    }
    if (ytResult) sections.push(["YouTube", `新規追加: ${ytResult.added}件\n上書き: ${ytResult.over}件\nスキップ: ${ytResult.skipped}件`]);
    if (ptResult) {
      let t = `新規追加: ${ptResult.added}件\n上書き: ${ptResult.over}件\nスキップ: ${ptResult.skipped}件`;
      if (ptResult.noAudio > 0) t += `\n音声なしのためスキップ: ${ptResult.noAudio}件`;
      sections.push(["PITCH", t]);
    }
    const summary = sections.length === 1 ? sections[0][1] : sections.map(x => `【${x[0]}】\n${x[1]}`).join("\n");
    if (trackImportSummaryEl) {
      trackImportSummaryEl.textContent = summary;
      trackImportSummaryEl.style.display = "block";
    }
    setTrackImportRunBtnMode("close");
    hapticSuccess();
  } catch (err) {
    console.warn("runTrackImport failed:", err);
    if (trackImportStatusEl) trackImportStatusEl.textContent = "インポートに失敗しました。";
    setTrackImportRunBtnMode("import");
  }
}

// マーカー/メモをlocalStorageへ反映。trackData.markers無し=マーカーに触れない(消さない)、noteTextがundefined=メモに触れない
function applyImportedMarkersAndText(name, trackData) {
  if (Array.isArray(trackData.markers)) {
    const pinsToSave = trackData.markers.map(m => ({
      t: typeof m.time === "number" ? m.time : 0,
      enabled: m.enabled !== false,
      memo: m.memo || "",
      color: m.color || null,
      skip: m.skip ? true : undefined
    }));
    try {
      localStorage.setItem("mp3_pins_" + name, JSON.stringify(pinsToSave));
    } catch (e) {}
  }
  // v3.8.0〜: abA/abBがある時だけ反映(古いバックアップは触らない)
  if (trackData.abA !== undefined || trackData.abB !== undefined) {
    const a = typeof trackData.abA === "number" ? trackData.abA : null;
    const b = typeof trackData.abB === "number" ? trackData.abB : null;
    try { localStorage.setItem("mp3_ab_" + name, JSON.stringify({ a: a, b: b })); } catch (e) {}
  }
  if (typeof trackData.noteText === "string") {
    try {
      localStorage.setItem("mp3_text_" + name, trackData.noteText);
    } catch (e) {}
  }
}
