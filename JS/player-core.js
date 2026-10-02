// player-core.js — 音声処理/データ管理の中核。DOM操作なし(setAppTitleのみ例外・要素無しでも安全)。player-ui-shared.jsより先に読み込む

let audio = new Audio();
let pins = [];
let loopEnabled = false;
let loopMode = "sec";
let isSeeking = false;

// ループ対象マーカーペアのindex(固定)。null=未決定でupdateBarsが1回だけ算出。ジャンプのたび再計算するとプリロールで1個前にすり替わる。マーカー追加/削除/色変更/シーク/ループ切替/曲切替で必ずnullに戻す
let loopActiveMarkerIndex = null;

// isSeeking=trueは必ずこの関数経由(直接代入禁止)。経由しないとシーク先がループ区間のpre/post-roll内に着地した時に古い区間のループ判定が生き残る
function beginSeek() {
  isSeeking = true;
  loopActiveMarkerIndex = null;
}

// player-theme.jsより先に読まれるため、まず旧14色で初期化→applyMarkerColorPaletteFromThemes()でQN_THEMESに差し替え。オブジェクト参照は保つこと
const MARKER_COLOR_PALETTE = {
  red: "#ef4444",
  orange: "#f97316",
  amber: "#f59e0b",
  lime: "#84cc16",
  emerald: "#10b981",
  teal: "#14b8a6",
  cyan: "#06b6d4",
  sky: "#0ea5e9",
  blue: "#3b82f6",
  indigo: "#6366f1",
  purple: "#8b5cf6",
  violet: "#a855f7",
  pink: "#ec4899",
  rose: "#f43f5e"
};

function applyMarkerColorPaletteFromThemes() {
  if (!Array.isArray(window.QN_THEMES) || window.QN_THEMES.length === 0) return;
  Object.keys(MARKER_COLOR_PALETTE).forEach(key => delete MARKER_COLOR_PALETTE[key]);
  window.QN_THEMES.forEach(theme => {
    if (theme && theme.name && theme.primary) {
      MARKER_COLOR_PALETTE[theme.name] = theme.primary;
    }
  });
}
applyMarkerColorPaletteFromThemes();
document.addEventListener("DOMContentLoaded", applyMarkerColorPaletteFromThemes);

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

let repeatMode = "off";
let isJumping = false;
let prevTime = 0;

let playlist = [];
let currentPlaylistIndex = -1;

const PLAYLIST_DB_NAME = "qnaudio_playlist_db";
const PLAYLIST_DB_VERSION = 1;
const PLAYLIST_STORE_NAME = "tracks";

// DB接続は使い回す(Promise共有)。毎回open()するとiOS Safariで不安定
let cachedPlaylistDB = null;
let openPlaylistDBPromise = null;

function openPlaylistDB() {
  if (cachedPlaylistDB) return Promise.resolve(cachedPlaylistDB);
  if (openPlaylistDBPromise) return openPlaylistDBPromise;

  openPlaylistDBPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) { reject(new Error("IndexedDB not supported")); return; }
    const req = indexedDB.open(PLAYLIST_DB_NAME, PLAYLIST_DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PLAYLIST_STORE_NAME)) {
        db.createObjectStore(PLAYLIST_STORE_NAME, { keyPath: "name" });
      }
    };
    req.onsuccess = () => {
      cachedPlaylistDB = req.result;
      cachedPlaylistDB.onclose = () => { cachedPlaylistDB = null; };
      resolve(cachedPlaylistDB);
    };
    req.onerror = () => reject(req.error);
  }).finally(() => {
    openPlaylistDBPromise = null;
  });

  return openPlaylistDBPromise;
}

// 曲をBlobごと保存(同名は上書き)。
// 【v2.13.5】並び順・ON/OFF・タイトル・アーティスト・お気に入りはlocalStorage(PLAYLIST_META_KEY)に保存。iOS SafariはBlobを含むレコードをget→putするとBlob実体が作り直され、playlist配列内のFileが死ぬ(GOTCHAS.md)。IndexedDBの音声レコードは並び替え等で書かない
const PLAYLIST_META_KEY = "qn_playlist_meta_v1";

function readPlaylistMeta() {
  try {
    const raw = localStorage.getItem(PLAYLIST_META_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return obj && typeof obj === "object" ? obj : {};
  } catch (e) {
    return {};
  }
}

function writePlaylistMeta(meta) {
  try {
    localStorage.setItem(PLAYLIST_META_KEY, JSON.stringify(meta));
  } catch (e) {
    console.warn("writePlaylistMeta failed:", e);
  }
}

function updatePlaylistMetaEntry(name, fields) {
  const meta = readPlaylistMeta();
  const cur = meta[name] || {};
  Object.keys(fields).forEach(k => {
    if (fields[k] !== undefined) cur[k] = fields[k];
  });
  meta[name] = cur;
  writePlaylistMeta(meta);
}

function removePlaylistMetaEntry(name) {
  const meta = readPlaylistMeta();
  if (name in meta) {
    delete meta[name];
    writePlaylistMeta(meta);
  }
}

function getPlaylistMetaSavedAt(name) {
  const entry = readPlaylistMeta()[name];
  return entry && typeof entry.savedAt === "number" ? entry.savedAt : undefined;
}

async function savePlaylistTrack(file, savedAt, enabled, title, artist, favorite) {
  const effectiveSavedAt = typeof savedAt === "number" ? savedAt : Date.now();
  try {
    const db = await openPlaylistDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(PLAYLIST_STORE_NAME, "readwrite");
      const store = tx.objectStore(PLAYLIST_STORE_NAME);
      const getReq = store.get(file.name);
      getReq.onsuccess = () => {
        const existing = getReq.result || {};
        store.put({
          name: file.name,
          type: file.type,
          blob: file,
          savedAt: effectiveSavedAt,
          enabled: enabled !== false,
          title: title !== undefined ? title : existing.title,
          artist: artist !== undefined ? artist : existing.artist,
          favorite: favorite !== undefined ? favorite : (existing.favorite || false)
        });
      };
      getReq.onerror = () => reject(getReq.error);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("savePlaylistTrack failed:", err);
  }
  updatePlaylistMetaEntry(file.name, {
    savedAt: effectiveSavedAt,
    enabled: enabled !== false,
    title: title,
    artist: artist,
    favorite: favorite
  });
}

async function deletePlaylistTrack(name) {
  try {
    const db = await openPlaylistDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(PLAYLIST_STORE_NAME, "readwrite");
      tx.objectStore(PLAYLIST_STORE_NAME).delete(name);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("deletePlaylistTrack failed:", err);
  }
  removePlaylistMetaEntry(name);
}

async function loadAllPlaylistTracks() {
  try {
    const db = await openPlaylistDB();
    const records = await new Promise((resolve, reject) => {
      const tx = db.transaction(PLAYLIST_STORE_NAME, "readonly");
      const req = tx.objectStore(PLAYLIST_STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
    const meta = readPlaylistMeta();
    const pick = (m, key, fallback) => (m && m[key] !== undefined ? m[key] : fallback);
    const merged = records.map(r => {
      const m = meta[r.name];
      return {
        r,
        savedAt: pick(m, "savedAt", r.savedAt || 0),
        enabled: pick(m, "enabled", r.enabled) !== false,
        title: pick(m, "title", r.title) || null,
        artist: pick(m, "artist", r.artist) || null,
        favorite: pick(m, "favorite", r.favorite) === true,
        folder: pick(m, "folder", null) || null
      };
    });
    merged.sort((a, b) => (a.savedAt || 0) - (b.savedAt || 0));
    return merged.map(x => ({
      file: new File([x.r.blob], x.r.name, { type: x.r.type || x.r.blob.type }),
      enabled: x.enabled,
      title: x.title,
      artist: x.artist,
      favorite: x.favorite,
      folder: x.folder
    }));
  } catch (err) {
    console.warn("loadAllPlaylistTracks failed:", err);
    return [];
  }
}

// ---------- 【v3.24.0】ライブラリのフォルダ ----------
// 1曲=1フォルダ(track.folder=フォルダid|null=未分類)。フォルダ定義はqn_folders_v1=[{id,name,parentId,collapsed}](配列順=表示順)。parentIdは将来のネスト用に予約(今は常にnull、1階層のみ)。
// playlist[]は常に「フォルダ順にグループ化」した状態を保つ(normalizePlaylistGrouping)。→ 行のdata-index=配列indexのまま、選択/削除/ドラッグ/Auto Nextの既存ロジックがindexベースで動く。未分類は末尾グループ。
// 曲ごとのfolderはqn_playlist_meta_v1(localStorageのみ。IndexedDBの音声レコードは書かない=GOTCHAS)
const FOLDERS_KEY = "qn_folders_v1";
const AUTONEXT_SCOPE_KEY = "qn_autonext_scope";
let playlistFolders = readPlaylistFolders();

function readPlaylistFolders() {
  try {
    const arr = JSON.parse(localStorage.getItem(FOLDERS_KEY) || "[]");
    if (!Array.isArray(arr)) return [];
    const seen = new Set();
    return arr.filter(f => f && typeof f.id === "string" && f.id && !seen.has(f.id) && seen.add(f.id)).map(f => ({
      id: f.id,
      name: typeof f.name === "string" && f.name ? f.name : "フォルダ",
      parentId: typeof f.parentId === "string" ? f.parentId : null,
      collapsed: f.collapsed === true
    }));
  } catch (e) {
    return [];
  }
}

function writePlaylistFolders() {
  try {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(playlistFolders));
  } catch (e) {
    console.warn("writePlaylistFolders failed:", e);
  }
}

function getPlaylistFolder(id) {
  return playlistFolders.find(f => f.id === id) || null;
}

// 存在するフォルダidだけ返す(消えたフォルダを指す曲は未分類=null扱い)
function trackFolderId(track) {
  return track && track.folder && getPlaylistFolder(track.folder) ? track.folder : null;
}

function createPlaylistFolder(name) {
  const base = (name || "").trim() || "新しいフォルダ";
  let finalName = base, n = 2;
  while (playlistFolders.some(f => f.name === finalName)) finalName = base + " " + (n++);
  const folder = { id: "f" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: finalName, parentId: null, collapsed: false };
  playlistFolders.push(folder);
  writePlaylistFolders();
  return folder;
}

function findOrCreatePlaylistFolderByName(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) return null;
  const hit = playlistFolders.find(f => f.name === trimmed);
  return hit || createPlaylistFolder(trimmed);
}

function renamePlaylistFolder(id, name) {
  const f = getPlaylistFolder(id);
  const trimmed = (name || "").trim();
  if (!f || !trimmed || f.name === trimmed) return;
  f.name = trimmed;
  writePlaylistFolders();
}

function togglePlaylistFolderCollapsed(id) {
  const f = getPlaylistFolder(id);
  if (!f) return;
  f.collapsed = !f.collapsed;
  writePlaylistFolders();
}

// フォルダ表示順を1つ動かす(dir=-1上/+1下)。曲の並びも合わせて直す
function movePlaylistFolder(id, dir) {
  const i = playlistFolders.findIndex(f => f.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= playlistFolders.length) return;
  const tmp = playlistFolders[i];
  playlistFolders[i] = playlistFolders[j];
  playlistFolders[j] = tmp;
  writePlaylistFolders();
  normalizePlaylistGrouping();
}

// フォルダ削除: 中の曲は消さず未分類へ戻す
function deletePlaylistFolder(id) {
  const i = playlistFolders.findIndex(f => f.id === id);
  if (i < 0) return;
  playlist.forEach(t => { if (t.folder === id) t.folder = null; });
  playlistFolders.splice(i, 1);
  writePlaylistFolders();
  normalizePlaylistGrouping();
}

// playlist[]をフォルダ順(未分類は末尾)へ安定ソート。currentPlaylistIndexは曲の参照で追従。並びが変わったらtrueを返す(保存は呼び出し側のpersistPlaylistOrder)
function normalizePlaylistGrouping() {
  const rank = new Map();
  playlistFolders.forEach((f, i) => rank.set(f.id, i));
  const rankOf = t => {
    const id = trackFolderId(t);
    return id ? rank.get(id) : playlistFolders.length;
  };
  let sorted = true;
  for (let i = 1; i < playlist.length; i++) {
    if (rankOf(playlist[i - 1]) > rankOf(playlist[i])) { sorted = false; break; }
  }
  if (sorted) return false;
  const current = currentPlaylistIndex >= 0 ? playlist[currentPlaylistIndex] : null;
  const keyed = playlist.map((t, i) => ({ t, i, r: rankOf(t) }));
  keyed.sort((a, b) => a.r - b.r || a.i - b.i);
  playlist.length = 0;
  keyed.forEach(k => playlist.push(k.t));
  if (current) currentPlaylistIndex = playlist.indexOf(current);
  return true;
}

// 指定index群の曲を別フォルダ(null=未分類)の末尾へ移す
function moveTracksToFolder(indices, folderId) {
  const target = folderId && getPlaylistFolder(folderId) ? folderId : null;
  const set = new Set(indices);
  const moving = playlist.filter((t, i) => set.has(i));
  if (!moving.length) return;
  const current = currentPlaylistIndex >= 0 ? playlist[currentPlaylistIndex] : null;
  const rest = playlist.filter((t, i) => !set.has(i));
  moving.forEach(t => { t.folder = target; });
  playlist.length = 0;
  rest.forEach(t => playlist.push(t));
  moving.forEach(t => playlist.push(t));
  normalizePlaylistGrouping();
  if (current) currentPlaylistIndex = playlist.indexOf(current);
  persistPlaylistOrder();
}

// Auto Nextの範囲: "folder"=今の曲と同じフォルダ内だけ / "all"=ライブラリ全体。フォルダが無い間は結果が同じ
function getAutoNextScope() {
  try {
    return localStorage.getItem(AUTONEXT_SCOPE_KEY) === "all" ? "all" : "folder";
  } catch (e) {
    return "folder";
  }
}

function setAutoNextScope(scope) {
  try {
    localStorage.setItem(AUTONEXT_SCOPE_KEY, scope === "all" ? "all" : "folder");
  } catch (e) {}
}

// playlistの並びをsavedAtへ反映(連番)。Blobに触れず軽量更新のみ。savePlaylistTrack()で全曲書き直すと重くフリーズする
async function persistPlaylistOrder() {
  // IndexedDBへ書かない(GOTCHAS.md)。localStorageのメタのみ
  const meta = readPlaylistMeta();
  const base = Date.now();
  for (let i = 0; i < playlist.length; i++) {
    const track = playlist[i];
    const name = track.file ? track.file.name : track.name;
    if (!name) continue;
    const cur = meta[name] || {};
    cur.savedAt = base + i;
    cur.enabled = track.enabled !== false;
    cur.title = track.title;
    cur.artist = track.artist;
    cur.favorite = track.favorite || false;
    cur.folder = track.folder || null;
    meta[name] = cur;
  }
  writePlaylistMeta(meta);
}

// 1曲分のメタだけ保存(並び順は変えない)
async function savePlaylistMetadataFor(track) {
  // IndexedDBへ書かない(GOTCHAS.md)
  const name = track.file ? track.file.name : track.name;
  if (!name) return;
  updatePlaylistMetaEntry(name, {
    enabled: track.enabled !== false,
    title: track.title,
    artist: track.artist,
    favorite: track.favorite || false,
    folder: track.folder || null
  });
}

async function savePlaylistTrackAudioKeepingOrder(track) {
  const name = track.file.name;
  let keepSavedAt = getPlaylistMetaSavedAt(name);
  if (keepSavedAt === undefined) {
    await persistPlaylistOrder();
    keepSavedAt = getPlaylistMetaSavedAt(name);
  }
  await savePlaylistTrack(track.file, keepSavedAt, track.enabled, track.title, track.artist, track.favorite);
}

// Fileが読めなくなった時、IndexedDBから読み直して新Fileを返す。無ければnull
async function reloadTrackFileFromDB(name) {
  try {
    const db = await openPlaylistDB();
    const rec = await new Promise((resolve) => {
      const tx = db.transaction(PLAYLIST_STORE_NAME, "readonly");
      const req = tx.objectStore(PLAYLIST_STORE_NAME).get(name);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
    if (!rec || !rec.blob) return null;
    return new File([rec.blob], rec.name, { type: rec.type || rec.blob.type });
  } catch (e) {
    return null;
  }
}

let waveformPeaks = null;
let waveformDecodeToken = 0;

// 現在のファイル名。#appTitleはマーキー化されているのでtextContentを使わずこの変数を参照
let currentFileName = "No file loaded";

function setAppTitle(name) {
  currentFileName = name;
  updateMediaSessionMetadata(name);
  const appTitle = document.getElementById("appTitle");
  const appTitleText = document.getElementById("appTitleText");
  if (!appTitle || !appTitleText) return;

  const inner = document.getElementById("appTitleInner");
  if (inner) {
    inner.querySelectorAll(".marquee-clone").forEach(el => el.remove());
  }
  appTitleText.textContent = name;
  appTitle.classList.remove("marquee");

  requestAnimationFrame(() => {
    if (!appTitle || !appTitleText) return;
    const overflowing = appTitleText.scrollWidth > appTitle.clientWidth;
    if (overflowing && inner) {
      const clone = document.createElement("span");
      clone.id = "appTitleTextClone";
      clone.className = "marquee-clone";
      clone.textContent = name;
      inner.appendChild(clone);

      const duration = Math.max(6, name.length * 0.28);
      appTitle.style.setProperty("--marquee-duration", duration + "s");
      appTitle.classList.add("marquee");
    }
  });
}

function replayAppTitleMarquee() {
  const appTitle = document.getElementById("appTitle");
  const inner = document.getElementById("appTitleInner");
  if (!appTitle || !inner || !appTitle.classList.contains("marquee")) return;
  const running = inner.getAnimations ? inner.getAnimations().some(a => a.playState === "running") : false;
  if (running) return;
  inner.style.animation = "none";
  void inner.offsetWidth;
  inner.style.animation = "";
}
(function setupAppTitleMarqueeReplay() {
  const appTitle = document.getElementById("appTitle");
  if (!appTitle) return;
  appTitle.addEventListener("pointerenter", replayAppTitleMarquee);
  appTitle.addEventListener("click", replayAppTitleMarquee);
})();

function getAudioCtx() {
  if (!window.__qnAudioCtx) {
    window.__qnAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // 自動再生ポリシーでAudioContextがsuspendedのことがある。取得毎にresume
  if (window.__qnAudioCtx.state === "suspended") {
    window.__qnAudioCtx.resume().catch(() => {});
  }
  return window.__qnAudioCtx;
}




const SOUNDTOUCH_MODULE_URL = "https://cdn.jsdelivr.net/npm/@soundtouchjs/audio-worklet@2.1.1/+esm";
const SOUNDTOUCH_PROCESSOR_URL = "https://cdn.jsdelivr.net/npm/@soundtouchjs/audio-worklet@2.1.1/.dist/soundtouch-processor.js";

let soundTouchModulePromise = null;
function loadSoundTouchModule() {
  if (!soundTouchModulePromise) {
    soundTouchModulePromise = import(SOUNDTOUCH_MODULE_URL);
  }
  return soundTouchModulePromise;
}

let soundTouchWorkletRegistered = null;
async function ensureSoundTouchWorklet(audioContext, SoundTouchNode) {
  if (soundTouchWorkletRegistered === audioContext) return;
  await SoundTouchNode.register(audioContext, SOUNDTOUCH_PROCESSOR_URL);
  soundTouchWorkletRegistered = audioContext;
}


let audioGraphSetupDone = false;

const EQ_FREQS = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
let eqFilters = [];

let soundTouchNode = null;
let pitchShiftAvailable = false;

async function setupAudioGraph() {
  if (audioGraphSetupDone) return;
  audioGraphSetupDone = true;

  // 【v2.14.2】準備を全部終えてから最後に一瞬で差し替える順序(GOTCHAS.md)。先にcreateMediaElementSourceすると、destination接続までの待ち(CDN/AudioWorklet)で音が途切れる
  const ctx = getAudioCtx();

  const filters = EQ_FREQS.map(freq => {
    const filter = ctx.createBiquadFilter();
    filter.type = "peaking";
    filter.frequency.value = freq;
    filter.Q.value = 1.4;
    filter.gain.value = 0;
    return filter;
  });

  // SoundTouchJS初期化(完了まで通常経路で鳴らす)。setupAudioGraphはEQ/SPEED/KEY操作時にだけ呼ぶ設計(通常再生でWeb Audio非接続=Safari不具合回避)
  let stNode = null;
  try {
    if (!ctx.audioWorklet) throw new Error("AudioWorklet is not supported in this browser");
    const { SoundTouchNode } = await loadSoundTouchModule();
    await ensureSoundTouchWorklet(ctx, SoundTouchNode);
    stNode = new SoundTouchNode({ context: ctx });
  } catch (err) {
    console.warn("SoundTouchJS unavailable, Speed/Key features disabled:", err);
    stNode = null;
  }

  if (ctx.state !== "running") {
    try { await ctx.resume(); } catch (err) {}
  }

  let source;
  try {
    source = ctx.createMediaElementSource(audio);
  } catch (err) {
    console.warn("Audio graph setup failed:", err);
    return;
  }

  eqFilters = filters;
  soundTouchNode = stNode;
  pitchShiftAvailable = !!stNode;

  let node = source;
  if (pitchShiftAvailable && soundTouchNode) {
    node.connect(soundTouchNode);
    node = soundTouchNode;
  }
  eqFilters.forEach(filter => {
    node.connect(filter);
    node = filter;
  });
  node.connect(ctx.destination);

  if (typeof setEqEffectEnabled === "function" && typeof eqEffectEnabled !== "undefined") {
    setEqEffectEnabled(eqEffectEnabled);
  }

  updatePlaybackRate();
  updateKeyControlAvailability();
}

// Speed/KeyはSoundTouchJS(soundTouchNode)が一括処理。audio.playbackRateとsoundTouchNode.playbackRateに同値をセット。非対応環境は機能自体を出さない
let currentSpeed = 1.0;
let currentKeySemitones = 0;
let speedEffectEnabled = true;
let keyEffectEnabled = true;

function updatePlaybackRate() {
  const effectiveSpeed = speedEffectEnabled ? currentSpeed : 1.0;
  const effectiveKeySemitones = keyEffectEnabled ? currentKeySemitones : 0;
  if (pitchShiftAvailable && soundTouchNode) {
    audio.playbackRate = effectiveSpeed;
    try {
      soundTouchNode.playbackRate.value = effectiveSpeed;
      soundTouchNode.pitch.value = effectiveSpeed;
      const clampedSemitones = Math.max(-24, Math.min(24, effectiveKeySemitones));
      soundTouchNode.pitchSemitones.value = clampedSemitones;
    } catch (e) {
      pitchShiftAvailable = false;
      currentSpeed = 1.0;
      currentKeySemitones = 0;
      updateKeyControlAvailability();
      audio.playbackRate = 1.0;
    }
  } else {
    audio.playbackRate = 1.0;
  }
}

function savePins() {
  if (currentFileName && currentFileName !== "No file loaded") {
    localStorage.setItem("mp3_pins_" + currentFileName, JSON.stringify(pins));
  }
}

// Textメモをファイル名キーでlocalStorage保存。ファイル未読込時は保存しない
function saveNoteText() {
  if (currentFileName && currentFileName !== "No file loaded") {
    const el = document.getElementById("noteTextArea");
    if (el) localStorage.setItem("mp3_text_" + currentFileName, el.value);
  }
}

let abA = null;
let abB = null;
function saveAB() {
  if (currentFileName && currentFileName !== "No file loaded") {
    try { localStorage.setItem("mp3_ab_" + currentFileName, JSON.stringify({ a: abA, b: abB })); } catch (e) {}
  }
}
function loadABFor(fileName) {
  abA = null; abB = null;
  try {
    const raw = localStorage.getItem("mp3_ab_" + fileName);
    if (raw) {
      const o = JSON.parse(raw);
      if (o && typeof o.a === "number" && o.a >= 0) abA = o.a;
      if (o && typeof o.b === "number" && o.b >= 0) abB = o.b;
    }
  } catch (e) {}
}
function getABRange() {
  if (abA === null || abB === null) return null;
  return { start: Math.min(abA, abB), end: Math.max(abA, abB), color: null };
}

function getActiveSegment(atTime) {
  const dur = audio.duration;
  if (loopEnabled && loopMode === "ab") return dur ? getABRange() : null;
  const activePinObjs = pins.filter(p => p.enabled);
  const activePins = activePinObjs.map(p => p.t);
  if (!dur || activePins.length < 2) return null;

  const ct = atTime !== undefined ? atTime : audio.currentTime;

  function withColor(startIndex, endIndex) {
    return { start: activePins[startIndex], end: activePins[endIndex], color: activePinObjs[startIndex].color || null };
  }

  for (let i = 0; i < activePins.length - 1; i++) {
    const start = activePins[i];
    const end = activePins[i+1];

    if (i === activePins.length - 2) {
      if (ct >= start && ct <= end) return withColor(i, i + 1);
    } else {
      if (ct >= start && ct < end) return withColor(i, i + 1);
    }
  }

  if (ct < activePins[0]) return withColor(0, 1);
  if (ct > activePins[activePins.length - 1]) return withColor(activePins.length - 2, activePins.length - 1);

  return withColor(0, 1);
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00.0";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const sText = s.toFixed(1).padStart(4, '0');
  return `${String(m).padStart(2, '0')}:${sText}`;
}

function audioBufferToWavBlob(audioBuffer) {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const numFrames = audioBuffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numFrames * blockAlign;
  const headerSize = 44;
  const buffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buffer);

  function writeString(offset, str) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  const channelData = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channelData.push(audioBuffer.getChannelData(ch));
  }

  let offset = headerSize;
  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channelData[ch][i];
      sample = Math.max(-1, Math.min(1, sample));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function audioBufferToMp3Blob(audioBuffer, kbps) {
  if (typeof lamejs === "undefined" || !lamejs.Mp3Encoder) {
    throw new Error("MP3 encoder (lamejs) is not available");
  }

  const numChannels = Math.min(2, audioBuffer.numberOfChannels);
  const sampleRate = audioBuffer.sampleRate;
  const numFrames = audioBuffer.length;

  function toInt16Array(channelData) {
    const out = new Int16Array(numFrames);
    for (let i = 0; i < numFrames; i++) {
      let sample = Math.max(-1, Math.min(1, channelData[i]));
      out[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
    return out;
  }

  const left = toInt16Array(audioBuffer.getChannelData(0));
  const right = numChannels === 2 ? toInt16Array(audioBuffer.getChannelData(1)) : null;

  const encoder = new lamejs.Mp3Encoder(numChannels, sampleRate, kbps || 128);
  const mp3Chunks = [];
  const blockSize = 1152;

  for (let i = 0; i < numFrames; i += blockSize) {
    const leftChunk = left.subarray(i, i + blockSize);
    const mp3buf = numChannels === 2
      ? encoder.encodeBuffer(leftChunk, right.subarray(i, i + blockSize))
      : encoder.encodeBuffer(leftChunk);
    if (mp3buf.length > 0) mp3Chunks.push(mp3buf);
  }

  const finalBuf = encoder.flush();
  if (finalBuf.length > 0) mp3Chunks.push(finalBuf);

  return new Blob(mp3Chunks, { type: "audio/mp3" });
}

// OfflineAudioContextで範囲・エフェクト指定レンダリング(毎回再デコード)。範囲切り出しはSoundTouchに渡す前に行う
function sliceAudioBuffer(sourceBuffer, startTime, endTime) {
  const sampleRate = sourceBuffer.sampleRate;
  const startFrame = Math.max(0, Math.floor(startTime * sampleRate));
  const endFrame = Math.min(sourceBuffer.length, Math.ceil(endTime * sampleRate));
  const frameCount = Math.max(1, endFrame - startFrame);

  const sliced = new AudioBuffer({
    numberOfChannels: sourceBuffer.numberOfChannels,
    length: frameCount,
    sampleRate: sampleRate
  });

  const channelData = new Float32Array(frameCount);
  for (let ch = 0; ch < sourceBuffer.numberOfChannels; ch++) {
    sourceBuffer.copyFromChannel(channelData, ch, startFrame);
    sliced.copyToChannel(channelData, ch, 0);
  }

  return sliced;
}

async function renderExportBuffer(startTime, endTime, applySpeed, applyKey, applyEq, targetSampleRate) {
  if (currentPlaylistIndex < 0 || !playlist[currentPlaylistIndex]) {
    throw new Error("No file loaded");
  }
  const file = playlist[currentPlaylistIndex].file;
  const arrayBuffer = await file.arrayBuffer();

  const decodeCtx = getAudioCtx();
  const sourceBuffer = await decodeCtx.decodeAudioData(arrayBuffer.slice(0));

  const speed = applySpeed ? currentSpeed : 1.0;
  const keySemitones = applyKey ? currentKeySemitones : 0;
  const outputSampleRate = targetSampleRate || sourceBuffer.sampleRate;

  const clampedStart = Math.max(0, Math.min(startTime, sourceBuffer.duration));
  const clampedEnd = Math.max(clampedStart, Math.min(endTime, sourceBuffer.duration));
  const rangeDuration = clampedEnd - clampedStart;
  if (rangeDuration <= 0) {
    throw new Error("Invalid export range");
  }

  let workingBuffer = sliceAudioBuffer(sourceBuffer, clampedStart, clampedEnd);

  const needsSoundTouch = (applySpeed && speed !== 1.0) || (applyKey && keySemitones !== 0);
  if (needsSoundTouch && pitchShiftAvailable) {
    try {
      const { processOffline } = await loadSoundTouchModule();
      const effectivePlaybackRate = speed || 1.0;
      workingBuffer = await processOffline({
        input: workingBuffer,
        processorUrl: SOUNDTOUCH_PROCESSOR_URL,
        // pitchはplaybackRateと同値(実ピッチ=pitch÷rate)。1.0固定だとSpeed変更でズレる
        pitch: effectivePlaybackRate,
        pitchSemitones: keySemitones,
        playbackRate: effectivePlaybackRate
      });
    } catch (err) {
      console.warn("SoundTouchJS offline processing failed, falling back to simple resampling:", err);
      if (applySpeed && speed !== 1.0) {
        const fallbackLength = Math.max(1, Math.ceil((workingBuffer.length / speed)));
        const fallbackCtx = new OfflineAudioContext(
          workingBuffer.numberOfChannels,
          fallbackLength,
          workingBuffer.sampleRate
        );
        const fallbackSource = fallbackCtx.createBufferSource();
        fallbackSource.buffer = workingBuffer;
        fallbackSource.playbackRate.value = speed;
        fallbackSource.connect(fallbackCtx.destination);
        fallbackSource.start(0);
        workingBuffer = await fallbackCtx.startRendering();
      }
    }
  } else if (applySpeed && speed !== 1.0) {
    const fallbackLength = Math.max(1, Math.ceil((workingBuffer.length / speed)));
    const fallbackCtx = new OfflineAudioContext(
      workingBuffer.numberOfChannels,
      fallbackLength,
      workingBuffer.sampleRate
    );
    const fallbackSource = fallbackCtx.createBufferSource();
    fallbackSource.buffer = workingBuffer;
    fallbackSource.playbackRate.value = speed;
    fallbackSource.connect(fallbackCtx.destination);
    fallbackSource.start(0);
    workingBuffer = await fallbackCtx.startRendering();
  }

  const needsEq = applyEq && eqFilters.some(f => f.gain.value !== 0);
  const needsResample = outputSampleRate !== workingBuffer.sampleRate;
  if (!needsEq && !needsResample) {
    return workingBuffer;
  }

  const finalCtx = new OfflineAudioContext(
    workingBuffer.numberOfChannels,
    Math.max(1, Math.ceil(workingBuffer.duration * outputSampleRate)),
    outputSampleRate
  );
  const finalSource = finalCtx.createBufferSource();
  finalSource.buffer = workingBuffer;

  let currentNode = finalSource;
  if (needsEq) {
    for (let i = 0; i < eqFilters.length; i++) {
      const gain = eqFilters[i].gain.value;
      if (gain === 0) continue;
      const filter = finalCtx.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = EQ_FREQS[i];
      filter.Q.value = 1.4;
      filter.gain.value = gain;
      currentNode.connect(filter);
      currentNode = filter;
    }
  }

  currentNode.connect(finalCtx.destination);
  finalSource.start(0);

  const renderedBuffer = await finalCtx.startRendering();
  return renderedBuffer;
}

function suggestExportFileName() {
  if (!currentFileName || currentFileName === "No file loaded") return "output";
  const dot = currentFileName.lastIndexOf(".");
  return dot > 0 ? currentFileName.slice(0, dot) : currentFileName;
}

