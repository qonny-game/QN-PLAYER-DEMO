// player-playlist.js — ファイル追加/一覧描画/削除/ドラッグ並び替え/playTrackAt/前後送り。関数宣言のみなので読込順は実行時に影響しない(推奨: core→playlist→ui-shared)。
// 依存: hapticTap,hapticWarning,loadFile,updatePlayButtonState(ui-shared)、savePlaylistTrack,deletePlaylistTrack,persistPlaylistOrder,setAppTitle(core)

function addFilesToPlaylist(files) {
  const audioFiles = files.filter(f => f.type.startsWith("audio/") || /\.(mp3|wav|ogg|oga|m4a|aac|flac|webm|opus)$/i.test(f.name));
  if (audioFiles.length === 0) return;

  // 無料版: ライブラリ3曲まで。超過時はアンロックモーダルでブロック(既存は消さない)
  if (typeof isUnlocked === "function" && !isUnlocked() && playlist.length >= SW_LIMITS.LIBRARY_MAX_TRACKS) {
    swShowUnlockToast(`無料版はライブラリに${SW_LIMITS.LIBRARY_MAX_TRACKS}曲までしか保存できません。`);
    return;
  }

  const wasEmpty = playlist.length === 0;
  audioFiles.forEach(file => {
    const track = { file, name: file.name, title: null, artist: null, duration: null, enabled: true, favorite: false, folder: null };
    playlist.push(track);
    // IndexedDBへ自動保存(非同期。失敗しても再生に影響しないので待たない)
    savePlaylistTrack(file);

    if (typeof readId3Tags === "function") {
      readId3Tags(file).then(tags => {
        if (tags.title) track.title = tags.title;
        if (tags.artist) track.artist = tags.artist;
        if (tags.title || tags.artist) {
          renderPlaylist();
          savePlaylistMetadataFor(track);
        }
      });
    }
    if (typeof readAudioDuration === "function") {
      readAudioDuration(file).then(dur => {
        if (dur) {
          track.duration = dur;
          renderPlaylist();
        }
      });
    }
  });
  renderPlaylist();

  if (wasEmpty) {
    playTrackAt(0);
  }
}

function formatTrackDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// MP3埋め込みジャケット(ID3 APIC)。メモリ上のBlob URLのみ(保存・同期しない)。曲ごとに1回だけ読み、未取得なら非同期で読んでonReady(url)。取得済みはURLを返す
const trackArtCache = new WeakMap();
function getTrackArt(track, onReady) {
  if (!track || !track.file || typeof readId3Art !== "function") return null;
  const c = trackArtCache.get(track);
  if (c) { if (!c.url && onReady) c.waiters.push(onReady); return c.url || null; }
  const entry = { url: null, waiters: [onReady] };
  trackArtCache.set(track, entry);
  readId3Art(track.file).then((blob) => {
    if (!blob) return;
    entry.url = URL.createObjectURL(blob);
    entry.waiters.forEach((f) => f(entry.url));
  });
  return null;
}

function makeEditableText(value, className, placeholder, onCommit) {
  const wrapper = document.createElement("span");
  wrapper.className = "playlist-editable-field " + className;

  const display = document.createElement("span");
  display.className = "playlist-editable-display";
  display.textContent = value || placeholder || "";
  if (!value && placeholder) display.classList.add("playlist-editable-placeholder");

  wrapper.appendChild(display);

  wrapper.startEdit = () => {
    if (wrapper.querySelector(".playlist-editable-input")) return;
    const input = document.createElement("input");
    input.type = "text";
    input.className = "playlist-editable-input";
    input.value = value;
    input.placeholder = placeholder || "";
    input.addEventListener("click", (e) => e.stopPropagation());
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const next = wrapper.onEnter;
        input.blur();
        if (next) next();
      } else if (e.key === "Escape") {
        input.value = value;
        input.blur();
      }
    });
    input.addEventListener("blur", () => {
      const newVal = input.value.trim();
      wrapper.replaceChild(display, input);
      if (newVal !== value) {
        value = newVal;
        display.textContent = value || placeholder || "";
        display.classList.toggle("playlist-editable-placeholder", !value && !!placeholder);
        onCommit(newVal);
      }
    });
    wrapper.replaceChild(input, display);
    input.focus();
    input.select();
  };

  return wrapper;
}

// 曲1行のDOM。renderPlaylist()(ライブラリ)と、Markersパネルの「再生中の曲」(renderNowPlaying)で共用。nowPlaying=true: 並び替えつまみ無し・クリックで再生し直さない・編集モード無効(デザインはライブラリと同じ)
function buildPlaylistRow(track, i, editMode, nowPlaying) {
  if (nowPlaying) editMode = false;
  const item = document.createElement("div");
  item.className = "playlistItem" + (nowPlaying ? " is-nowplaying" : "");
  item.dataset.index = i;
  item.dataset.folder = trackFolderId(track) || "";
  if (i === currentPlaylistIndex) item.classList.add("playing");
  if (!track.enabled) item.classList.add("disabled");

  const isLockedTrack = typeof isUnlocked === "function" && !isUnlocked() && i >= SW_LIMITS.LIBRARY_MAX_TRACKS;
  if (isLockedTrack) item.classList.add("sw-locked");

  if (!editMode && !nowPlaying) {
    item.addEventListener("click", (e) => {
      if (e.target.closest("button, input, textarea, .playlist-drag-handle, .playlist-info-block")) return;
      if (isLockedTrack) {
        if (e.target.closest(".playlist-thumb")) return;
        swShowUnlockToast(`無料版はライブラリの${SW_LIMITS.LIBRARY_MAX_TRACKS}曲目までしか再生できません。`);
        return;
      }
      playTrackAt(parseInt(item.dataset.index, 10));
    });
  }

  const dragHandle = document.createElement("span");
  dragHandle.className = "playlist-drag-handle";
  dragHandle.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>';
  if (!nowPlaying) item.appendChild(dragHandle);

  const thumb = document.createElement("div");
  thumb.className = "playlist-thumb";
  const artUrl = track.thumbnailUrl || getTrackArt(track, (url) => {
    thumb.style.backgroundImage = `url("${url}")`;
    const ic = thumb.querySelector(":scope > svg");
    if (ic) ic.remove();
  });
  if (artUrl) {
    thumb.style.backgroundImage = `url("${artUrl}")`;
  } else {
    thumb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>';
  }
  if (isLockedTrack) {
    const lockIcon = document.createElement("span");
    lockIcon.className = "sw-lock-icon";
    lockIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17a2 2 0 0 0 2-2 2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5 5 5 0 0 1 5 5v2h1M12 3a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3z"/></svg>';
    thumb.appendChild(lockIcon);
    thumb.onclick = () => swShowUnlockToast(`無料版はライブラリの${SW_LIMITS.LIBRARY_MAX_TRACKS}曲目までしか再生できません。`);
  }
  item.appendChild(thumb);

  const infoBlock = document.createElement("div");
  infoBlock.className = "playlist-info-block";
  infoBlock.onclick = (e) => {
    // 編集中(input化中)のクリックだけスキップ。.playlist-editable-fieldは常在ラッパーなので判定に使うな(通常時も無効化される)
    if (nowPlaying) return;
    if (e.target.closest(".playlist-editable-input")) return;
    if (e.target.closest(".playlist-hover-edit-btn")) return;
    if (isLockedTrack) {
      swShowUnlockToast(`無料版はライブラリの${SW_LIMITS.LIBRARY_MAX_TRACKS}曲目までしか再生できません。`);
      return;
    }
    playTrackAt(parseInt(item.dataset.index, 10));
  };

  const titleRow = document.createElement("div");
  titleRow.className = "playlist-title-row";
  const titleField = makeEditableText(
    track.title || track.name,
    "playlist-title",
    "",
    (newVal) => { track.title = newVal; savePlaylistMetadataFor(track); if (nowPlaying) renderPlaylist(); }
  );
  titleRow.appendChild(titleField);
  // タイトルをEnterで確定したらそのままアーティスト入力へ(行が再描画されていたら新しい行のアーティスト欄を開く)
  if (!editMode) titleField.onEnter = () => {
    let f = artistField;
    if (!f.isConnected) {
      const row = document.querySelector('.playlistItem[data-index="' + item.dataset.index + '"]' + (nowPlaying ? ".is-nowplaying" : ":not(.is-nowplaying)"));
      f = row && row.querySelector(".playlist-artist");
    }
    if (f && f.startEdit) f.startEdit();
  };
  if (!editMode) {
    const titleHoverBtn = document.createElement("button");
    titleHoverBtn.className = "playlist-hover-edit-btn";
    titleHoverBtn.title = "Edit title";
    titleHoverBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
    titleHoverBtn.onclick = (e) => { e.stopPropagation(); titleField.startEdit(); };
    titleRow.appendChild(titleHoverBtn);
  }
  infoBlock.appendChild(titleRow);

  const artistRow = document.createElement("div");
  artistRow.className = "playlist-artist-row";
  const artistField = makeEditableText(
    track.artist || "",
    "playlist-artist",
    "Artist",
    (newVal) => { track.artist = newVal; savePlaylistMetadataFor(track); if (nowPlaying) renderPlaylist(); }
  );
  artistRow.appendChild(artistField);
  if (!editMode) {
    const artistHoverBtn = document.createElement("button");
    artistHoverBtn.className = "playlist-hover-edit-btn";
    artistHoverBtn.title = "Edit artist";
    artistHoverBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
    artistHoverBtn.onclick = (e) => { e.stopPropagation(); artistField.startEdit(); };
    artistRow.appendChild(artistHoverBtn);
  }
  infoBlock.appendChild(artistRow);

  item.appendChild(infoBlock);

  if (editMode) {
    titleField.startEdit();
    artistField.startEdit();
  }

  // 編集モードはdurationを出さない(PLAY/SKIPトグルと削除チェックの場所が要る)
  if (!editMode) {
    const durationSpan = document.createElement("span");
    durationSpan.className = "playlist-duration";
    durationSpan.textContent = formatTrackDuration(track.duration);
    item.appendChild(durationSpan);

    const favoriteBtn = document.createElement("button");
    favoriteBtn.type = "button";
    favoriteBtn.className = "playlist-favorite-btn";
    favoriteBtn.classList.toggle("is-favorite", !!track.favorite);
    favoriteBtn.title = track.favorite ? "お気に入りから外す" : "お気に入りに追加（リスト上段に固定）";
    favoriteBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>';
    favoriteBtn.onclick = (e) => {
      e.stopPropagation();
      toggleTrackFavorite(parseInt(item.dataset.index, 10));
    };
    item.appendChild(favoriteBtn);
  }

  if (editMode) {
    // 編集モード: PLAY/SKIPトグル(自動送りに含めるか)。.del-btn選択が1件でもあれば押せない(renderPlaylist()がDOMを作り直すと選択表示が消えるため。window.playlistHasSelectedItemsはplayer-ui-pc-v2.js公開)
    const hasSelection = typeof window.playlistHasSelectedItems === "function" && window.playlistHasSelectedItems();
    const skipToggle = document.createElement("button");
    skipToggle.className = "playlist-skip-toggle";
    skipToggle.classList.toggle("skip-off", track.enabled);
    skipToggle.disabled = hasSelection;
    const baseTitle = track.enabled ? "Included in auto-advance (click to skip)" : "Skipped during auto-advance (click to include)";
    skipToggle.dataset.baseTitle = baseTitle;
    skipToggle.title = hasSelection ? "削除の選択中は切り替えられません" : baseTitle;
    skipToggle.innerHTML = '<span class="playlist-skip-toggle-label">' + (track.enabled ? "PLAY" : "SKIP") + '</span>';
    skipToggle.onclick = (e) => {
      e.stopPropagation();
      if (hasSelection) return;
      track.enabled = !track.enabled;
      renderPlaylist();
      persistPlaylistOrder();
    };
    item.appendChild(skipToggle);

    const delZone = document.createElement("div");
    delZone.className = "playlist-del-zone";

    const delBtn = document.createElement("button");
    delBtn.textContent = "✕";
    delBtn.className = "del-btn";
    delBtn.tabIndex = -1;
    delBtn.onclick = (e) => {
      e.stopPropagation();
      if (delBtn.classList.contains("confirm")) {
        hapticWarning();
        removeTrackAt(parseInt(item.dataset.index, 10));
      } else {
        hapticTap();
        delBtn.classList.add("confirm");
        delBtn.textContent = "✓";
        clearTimeout(delBtn._confirmTimer);
        delBtn._confirmTimer = setTimeout(() => {
          delBtn.classList.remove("confirm");
          delBtn.textContent = "✕";
        }, 3000);
      }
    };
    delZone.appendChild(delBtn);
    item.appendChild(delZone);
  }

  return item;
}

// Markersパネルのタイトル直下に「再生中の曲」をライブラリと同じ行デザインで表示(並び替えつまみ無し)。曲が無ければ非表示
function renderNowPlaying() {
  const host = document.getElementById("markersNowPlaying");
  if (!host) return;
  host.innerHTML = "";
  const track = currentPlaylistIndex >= 0 ? playlist[currentPlaylistIndex] : null;
  host.style.display = track ? "" : "none";
  if (track) host.appendChild(buildPlaylistRow(track, currentPlaylistIndex, false, true));
}

function renderPlaylist() {
  const box = document.getElementById("playlistBox");
  const info = document.getElementById("playlistInfo");
  if (info) info.textContent = `${playlist.length} track${playlist.length === 1 ? "" : "s"}`;
  if (!box) return;

  const editMode = typeof isPlaylistEditMode === "function" && isPlaylistEditMode();

  box.innerHTML = "";
  const buildRow = (track, i) => buildPlaylistRow(track, i, editMode, false);

  // フォルダが無ければ従来どおり全曲を並べるだけ。有れば「フォルダ見出し→その曲」をフォルダ順に、未分類は末尾。編集モードは全フォルダを展開(移動/削除の対象を隠さない)
  const frag = document.createDocumentFragment();
  if (playlistFolders.length === 0) {
    playlist.forEach((track, i) => frag.appendChild(buildRow(track, i)));
  } else {
    const buckets = new Map();
    playlistFolders.forEach(f => buckets.set(f.id, []));
    buckets.set(null, []);
    playlist.forEach((track, i) => buckets.get(trackFolderId(track)).push(i));
    playlistFolders.forEach((folder, fi) => {
      const idxs = buckets.get(folder.id);
      frag.appendChild(buildFolderHeader(folder, idxs.length, fi, editMode));
      if (!folder.collapsed || editMode) idxs.forEach(i => frag.appendChild(buildRow(playlist[i], i)));
    });
    const loose = buckets.get(null);
    if (loose.length) {
      frag.appendChild(buildFolderHeader(null, loose.length, -1, editMode));
      loose.forEach(i => frag.appendChild(buildRow(playlist[i], i)));
    }
  }
  box.appendChild(frag);
  // 本体Library同期(player-sync.js): 「未インポート」セクションと同期ステータス行
  if (window.QNLibSync) window.QNLibSync.decorateLibrary(box, editMode);
  renderNowPlaying();

  syncAutoNextScopeButton();
  setupPlaylistDragReorder(box);
  setupFolderDragReorder(box);
  if (typeof window.playlistReapplySelection === "function") window.playlistReapplySelection();
}

// フォルダ見出し行(folder=nullは「未分類」。操作ボタン無し)。通常: クリックで開閉+ホバー鉛筆で改名。編集モード: 名前は常時入力、▲▼で順序、✕で削除(中の曲は未分類へ)
function buildFolderHeader(folder, count, folderIdx, editMode) {
  const head = document.createElement("div");
  head.className = "playlistFolderHeader";
  if (!folder) head.classList.add("is-loose");
  if (folder && folder.collapsed && !editMode) head.classList.add("is-collapsed");
  head.dataset.folderId = folder ? folder.id : "";

  // フォルダのドラッグ並び替えつまみ(未分類は末尾固定でつまみ無し)。曲のつまみ(.playlist-drag-handle)とはクラスを分ける(曲側のドラッグが拾わないように)
  if (folder) {
    const grip = document.createElement("span");
    grip.className = "playlist-folder-grip";
    grip.title = "ドラッグでフォルダを並び替え";
    grip.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>';
    head.appendChild(grip);
  }

  const chev = document.createElement("span");
  chev.className = "playlist-folder-chev";
  chev.innerHTML = folder
    ? '<svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>'
    : '<svg viewBox="0 0 24 24"><path d="M3 5h18v2H3zm0 6h18v2H3zm0 6h18v2H3z"/></svg>';
  head.appendChild(chev);

  const nameWrap = document.createElement("div");
  nameWrap.className = "playlist-folder-name-wrap";
  if (folder) {
    const nameField = makeEditableText(folder.name, "playlist-folder-name", "", (newVal) => {
      if (newVal) renamePlaylistFolder(folder.id, newVal);
      renderPlaylist();
    });
    nameWrap.appendChild(nameField);
    if (editMode) {
      nameField.startEdit();
    } else {
      const pen = document.createElement("button");
      pen.type = "button";
      pen.className = "playlist-hover-edit-btn";
      pen.title = "フォルダ名を変更";
      pen.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
      pen.onclick = (e) => { e.stopPropagation(); nameField.startEdit(); };
      nameWrap.appendChild(pen);
    }
  } else {
    const label = document.createElement("span");
    label.className = "playlist-folder-name";
    label.textContent = "未分類";
    nameWrap.appendChild(label);
  }
  head.appendChild(nameWrap);

  const cnt = document.createElement("span");
  cnt.className = "playlist-folder-count";
  cnt.textContent = String(count);
  head.appendChild(cnt);

  if (folder && editMode) {
    const mk = (cls, title, html, onClick, disabled) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "playlist-folder-btn " + cls;
      b.title = title;
      b.innerHTML = html;
      b.disabled = !!disabled;
      b.onclick = (e) => { e.stopPropagation(); onClick(b); };
      return b;
    };
    head.appendChild(mk("is-up", "上へ", '<svg viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/></svg>', () => {
      hapticTap(); clearPlaylistSelectionForRegroup(); movePlaylistFolder(folder.id, -1); persistPlaylistOrder(); renderPlaylist();
    }, folderIdx === 0));
    head.appendChild(mk("is-down", "下へ", '<svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>', () => {
      hapticTap(); clearPlaylistSelectionForRegroup(); movePlaylistFolder(folder.id, 1); persistPlaylistOrder(); renderPlaylist();
    }, folderIdx === playlistFolders.length - 1));
    // 削除は2タップ確認(曲の✕と同じ流儀)
    head.appendChild(mk("is-del", "フォルダを削除（中の曲は未分類へ戻ります）", "✕", (b) => {
      if (b.classList.contains("confirm")) {
        hapticWarning();
        clearPlaylistSelectionForRegroup();
        deletePlaylistFolder(folder.id);
        persistPlaylistOrder();
        renderPlaylist();
      } else {
        hapticTap();
        b.classList.add("confirm");
        b.textContent = "✓";
        clearTimeout(b._confirmTimer);
        b._confirmTimer = setTimeout(() => { b.classList.remove("confirm"); b.textContent = "✕"; }, 3000);
      }
    }));
  }

  if (folder && !editMode) {
    head.addEventListener("click", (e) => {
      if (e.target.closest("button, input, .playlist-folder-grip")) return;
      hapticTap();
      togglePlaylistFolderCollapsed(folder.id);
      renderPlaylist();
    });
  }
  return head;
}

// フォルダ操作で配列indexが変わる前に、PC v2側の削除選択を捨てる(indexがズレるため)
function clearPlaylistSelectionForRegroup() {
  if (typeof window.playlistClearSelection === "function") window.playlistClearSelection();
}

// 新規フォルダ(FABのNEW FOLDERから)。作った直後は名前入力状態にする
function addPlaylistFolderInteractive() {
  hapticTap();
  const folder = createPlaylistFolder("");
  renderPlaylist();
  const box = document.getElementById("playlistBox");
  const field = box && box.querySelector('.playlistFolderHeader[data-folder-id="' + folder.id + '"] .playlist-editable-field');
  if (field && typeof field.startEdit === "function") field.startEdit();
  return folder;
}

// Auto Nextの範囲ボタン(Libraryの見出し行)。フォルダが1つも無い間は隠す
function syncAutoNextScopeButton() {
  const btn = document.getElementById("playlistScopeBtn");
  if (!btn) return;
  const has = playlistFolders.length > 0;
  btn.hidden = !has;
  if (!has) return;
  const scope = getAutoNextScope();
  const label = scope === "folder" ? "NEXT: FOLDER" : "NEXT: ALL";
  const txt = btn.querySelector(".playlist-scope-label");
  if (txt && txt.textContent !== label) txt.textContent = label;
  btn.dataset.scope = scope;
  btn.title = scope === "folder" ? "Auto Next: 同じフォルダ内だけ（タップで全体に切替）" : "Auto Next: ライブラリ全体（タップでフォルダ内に切替）";
}

(function setupAutoNextScopeButton() {
  const btn = document.getElementById("playlistScopeBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    hapticTap();
    setAutoNextScope(getAutoNextScope() === "folder" ? "all" : "folder");
    syncAutoNextScopeButton();
  });
})();

// 曲の移動先ピッカー(EDIT時のMOVEボタンから)。anchorの上に小さなメニュー。onPick(folderId|null)
function showFolderPicker(anchor, onPick) {
  closeFolderPicker();
  const menu = document.createElement("div");
  menu.className = "playlist-folder-picker";
  menu.id = "playlistFolderPicker";
  const add = (label, folderId, cls) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "playlist-folder-picker-item" + (cls ? " " + cls : "");
    b.textContent = label;
    b.onclick = (e) => { e.stopPropagation(); closeFolderPicker(); onPick(folderId); };
    menu.appendChild(b);
  };
  playlistFolders.forEach(f => add(f.name, f.id));
  add("未分類", null, "is-loose");
  add("＋ 新しいフォルダへ", "__new__", "is-new");
  document.body.appendChild(menu);
  // 開いた瞬間に1回だけ位置計算(ループ内では測らない)
  const r = anchor.getBoundingClientRect();
  const mh = menu.offsetHeight, mw = menu.offsetWidth;
  const left = Math.max(8, Math.min(window.innerWidth - mw - 8, r.right - mw));
  const top = r.top - mh - 8 >= 8 ? r.top - mh - 8 : Math.min(window.innerHeight - mh - 8, r.bottom + 8);
  menu.style.left = left + "px";
  menu.style.top = top + "px";
  setTimeout(() => {
    document.addEventListener("pointerdown", folderPickerOutside, true);
  }, 0);
  document.addEventListener("keydown", folderPickerKey, true);
  window.addEventListener("resize", closeFolderPicker);
}
function folderPickerKey(e) {
  if (e.key === "Escape") { e.stopPropagation(); closeFolderPicker(); }
}
function folderPickerOutside(e) {
  const m = document.getElementById("playlistFolderPicker");
  if (m && !m.contains(e.target)) closeFolderPicker();
}
function closeFolderPicker() {
  const m = document.getElementById("playlistFolderPicker");
  if (m) m.remove();
  document.removeEventListener("pointerdown", folderPickerOutside, true);
  document.removeEventListener("keydown", folderPickerKey, true);
  window.removeEventListener("resize", closeFolderPicker);
}

// お気に入り: ONは「お気に入り群の末尾」、OFFは「非お気に入り群の先頭」へ配列内を実際に移動。ドラッグ並び替えは変更しない(群をまたいだらピンを押し直すと境界へ戻る)
function toggleTrackFavorite(index) {
  if (index < 0 || index >= playlist.length) return;
  hapticTap();

  const currentTrackRef = currentPlaylistIndex !== -1 ? playlist[currentPlaylistIndex] : null;

  const track = playlist[index];
  track.favorite = !track.favorite;

  playlist.splice(index, 1);
  // 同じフォルダ内(グループ内)だけで上段/下段を入れ替える。フォルダ無し(全曲未分類)なら従来と同じ
  const fid = trackFolderId(track);
  let gStart = playlist.length, gEnd = 0;
  playlist.forEach((t, i) => { if (trackFolderId(t) === fid) { if (i < gStart) gStart = i; gEnd = i + 1; } });
  if (gStart > gEnd) { gStart = gEnd = index; }
  let insertAt;
  if (track.favorite) {
    insertAt = gEnd;
    for (let i = gStart; i < gEnd; i++) { if (!playlist[i].favorite) { insertAt = i; break; } }
  } else {
    let lastFavoriteIndex = gStart - 1;
    for (let i = gStart; i < gEnd; i++) { if (playlist[i].favorite) lastFavoriteIndex = i; }
    insertAt = lastFavoriteIndex + 1;
  }
  playlist.splice(insertAt, 0, track);

  if (currentTrackRef) {
    currentPlaylistIndex = playlist.indexOf(currentTrackRef);
  }

  renderPlaylist();
  persistPlaylistOrder();
}

function removeTrackAt(index) {
  if (index < 0 || index >= playlist.length) return;

  const removingCurrent = index === currentPlaylistIndex;
  const removedName = playlist[index].name;
  playlist.splice(index, 1);
  deletePlaylistTrack(removedName);

  if (removingCurrent) {
    if (playlist.length === 0) {
      currentPlaylistIndex = -1;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      setAppTitle("No file loaded");
      updatePlayButtonState();
    } else {
      const nextIndex = Math.min(index, playlist.length - 1);
      playTrackAt(nextIndex);
      return;
    }
  } else if (index < currentPlaylistIndex) {
    currentPlaylistIndex--;
  }

  renderPlaylist();
}

function playTrackAt(index, autoplay = true) {
  if (index < 0 || index >= playlist.length) return;
  // 【v2.16.8】無料版ロック曲(index>=LIBRARY_MAX_TRACKS)の最終防衛ライン(GOTCHAS.md)。前/次ボタン・mediaSession・audio.onended等がplayTrackAt()を直接呼ぶので、ここで一律ブロックする
  const isLockedTrack = typeof isUnlocked === "function" && !isUnlocked() && index >= SW_LIMITS.LIBRARY_MAX_TRACKS;
  if (isLockedTrack) {
    swShowUnlockToast(`無料版はライブラリの${SW_LIMITS.LIBRARY_MAX_TRACKS}曲目までしか再生できません。`);
    return;
  }
  currentPlaylistIndex = index;
  loadFile(playlist[index].file);
  if (autoplay) {
    // audio.play()はタップのコールスタック内で同期的に呼ぶ(loadedmetadata待ちだと自動再生ポリシーでブロック＝SPで1タップ目が再生されない)。renderPlaylist()より必ず先に呼ぶ(後だと曲数多い時に間隔が開き再発)
    audio.play().catch(() => {});
  }
  renderPlaylist();
}

function findEnabledTrackIndex(fromIndex, direction, wrapAround) {
  if (playlist.length === 0) return -1;
  // 【v3.24.0】Auto Next範囲: フォルダがあり設定が"folder"なら、今の曲と同じフォルダ(連続グループ)内だけで進む/戻る/ラップする
  let lo = 0, hi = playlist.length - 1;
  if (playlistFolders.length > 0 && getAutoNextScope() === "folder" && playlist[fromIndex]) {
    const fid = trackFolderId(playlist[fromIndex]);
    lo = hi = fromIndex;
    while (lo > 0 && trackFolderId(playlist[lo - 1]) === fid) lo--;
    while (hi < playlist.length - 1 && trackFolderId(playlist[hi + 1]) === fid) hi++;
  }
  const span = hi - lo + 1;
  let i = fromIndex + direction;
  for (let steps = 0; steps < span; steps++) {
    if (i < lo || i > hi) {
      if (!wrapAround) return -1;
      i = i < lo ? hi : lo;
    }
    if (playlist[i] && playlist[i].enabled !== false) return i;
    i += direction;
  }
  return -1;
}

function seekToTrackStart() {
  if (!audio.duration) return;
  hapticTap();
  beginSeek();
  audio.currentTime = 0;
  prevTime = 0;
  renderSegments(getActiveSegment(0));
  setTimeout(() => { isSeeking = false; }, 150);
}

function playPrevTrack() {
  if (currentPlaylistIndex < 0) return;
  hapticTap();
  const wrapAround = repeatMode === "all";
  const prevIndex = findEnabledTrackIndex(currentPlaylistIndex, -1, wrapAround);
  if (prevIndex !== -1) playTrackAt(prevIndex);
}

function playNextTrack() {
  if (currentPlaylistIndex < 0) return;
  hapticTap();
  const wrapAround = repeatMode === "all";
  const nextIndex = findEnabledTrackIndex(currentPlaylistIndex, 1, wrapAround);
  if (nextIndex !== -1) playTrackAt(nextIndex);
}

// ドラッグ用の共通部品。測定はドラッグ開始時に1回だけ(ドラッグ中にgetBoundingClientRect/getComputedStyleを呼ばない)。座標は「スクロール量を足した内容座標」で持つ
function findPlaylistScroller(box) {
  for (let el = box.parentElement; el && el !== document.body; el = el.parentElement) {
    const oy = getComputedStyle(el).overflowY;
    if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight) return el;
  }
  return document.scrollingElement || document.documentElement;
}
function scrollerViewRect(scroller) {
  if (scroller === document.scrollingElement || scroller === document.documentElement) return { top: 0, bottom: window.innerHeight };
  const r = scroller.getBoundingClientRect();
  return { top: r.top, bottom: r.bottom };
}
// フォルダごとのまとまり(見出し+その曲行)の縦範囲。span=次のまとまりの先頭までの高さ(最後は自分の下端まで)
function measureFolderBlocks(box, scroller) {
  const sTop = scroller.scrollTop, blocks = [];
  let cur = null;
  Array.from(box.children).forEach(el => {
    const r = el.getBoundingClientRect();
    if (el.classList.contains("playlistFolderHeader")) {
      cur = { id: el.dataset.folderId || "", head: el, els: [el], rows: [], top: r.top + sTop, bottom: r.bottom + sTop };
      blocks.push(cur);
    } else if (cur && !el.classList.contains("qn-lib-extra")) {
      cur.els.push(el);
      if (el.classList.contains("playlistItem")) cur.rows.push(el);
      cur.bottom = r.bottom + sTop;
    }
  });
  blocks.forEach((b, i) => { b.span = (i + 1 < blocks.length ? blocks[i + 1].top : b.bottom) - b.top; });
  return blocks;
}
const PLAYLIST_AUTOSCROLL_EDGE = 36;   // スクロール領域の端からこのpx以内でドラッグすると自動スクロール
const PLAYLIST_AUTOSCROLL_STEP = 10;   // 1回(50ms)あたりのpx。ドラッグ中、端にいる間だけ動く間引きタイマー(rAFループは使わない)

function setupPlaylistDragReorder(box) {
  const handles = box.querySelectorAll(".playlist-drag-handle");

  handles.forEach(handle => {
    let dragging = false;
    let draggedItem = null;
    let startY = 0;
    let startIndex = 0;
    let itemHeight = 0;
    let itemCount = 0;
    // 曲→別フォルダへのドロップ(フォルダがある時だけ)。blocks=開始時に測ったフォルダごとの縦範囲、hoverBlock=今ポインタが乗っている別フォルダ
    let blocks = null, hoverBlock = null, scroller = null, scrollStart = 0, viewRect = null;
    let edgeTimer = 0, autoDir = 0, lastClientY = 0;

    function setHoverBlock(b) {
      if (b === hoverBlock) return;
      if (hoverBlock) { hoverBlock.head.classList.remove("drop-target"); hoverBlock.rows.forEach(r => r.classList.remove("drop-target-row")); }
      hoverBlock = b;
      if (hoverBlock) { hoverBlock.head.classList.add("drop-target"); hoverBlock.rows.forEach(r => r.classList.add("drop-target-row")); }
    }
    function stopEdgeTimer() { if (edgeTimer) { clearInterval(edgeTimer); edgeTimer = 0; } autoDir = 0; }

    // ドラッグは同じフォルダ内だけ(見出し行を跨ぐと高さ計算が崩れる＆所属変更は移動UIで行う)
    function getItems() {
      const all = Array.from(box.querySelectorAll(".playlistItem"));
      return draggedItem ? all.filter(el => el.dataset.folder === draggedItem.dataset.folder) : all;
    }

    // ドラッグ中アイテム以外を最終位置へ。draggedItemはtransformのみ、DOM順変更はonEndで1回だけ(ドラッグ中のinsertBeforeは基準がズレて複数要素が一気に動く)
    function onMove(clientY) {
      if (!dragging || !draggedItem) return;
      lastClientY = clientY;
      const scrolled = scroller.scrollTop - scrollStart;   // 自動スクロール分も含めて、つまんだ行がポインタに付いてくるように
      const dy = clientY - startY + scrolled;
      draggedItem.style.transform = `translateY(${dy}px)`;

      // 端に寄ったら自動スクロール(間引きタイマー。端を離れたら止める)
      const dir = clientY < viewRect.top + PLAYLIST_AUTOSCROLL_EDGE ? -1 : (clientY > viewRect.bottom - PLAYLIST_AUTOSCROLL_EDGE ? 1 : 0);
      if (dir !== autoDir) {
        stopEdgeTimer();
        autoDir = dir;
        if (dir !== 0) edgeTimer = setInterval(() => { scroller.scrollTop += autoDir * PLAYLIST_AUTOSCROLL_STEP; onMove(lastClientY); }, 50);
      }

      // 別フォルダの範囲(見出し〜曲行。折りたたみ中は見出し)に乗っている間は、そのフォルダへ移動する扱い(ハイライト)。同じフォルダの範囲なら従来の並び替え
      if (blocks) {
        const y = clientY + scroller.scrollTop;
        const own = draggedItem.dataset.folder || "";
        let hit = null;
        for (let i = 0; i < blocks.length; i++) { if (y >= blocks[i].top && y <= blocks[i].bottom) { hit = blocks[i]; break; } }
        if (hit && hit.id !== own) {
          if (!hoverBlock) { getItems().forEach(item => { if (item !== draggedItem) item.style.transform = ""; }); }
          setHoverBlock(hit);
          draggedItem.dataset.dragTargetIndex = startIndex;
          return;
        }
        setHoverBlock(null);
      }

      if (itemHeight <= 0) return;

      const moveSteps = Math.round(dy / itemHeight);
      let targetIndex = startIndex + moveSteps;
      targetIndex = Math.max(0, Math.min(itemCount - 1, targetIndex));

      const items = getItems();
      items.forEach((item, currentIndex) => {
        if (item === draggedItem) return;
        // 手前にあり移動先がその位置以下→1つ下へ、後ろにあり移動先がその位置以上→1つ上へ(transformのみ。確定はonEnd)
        const originalIndex = parseInt(item.dataset.dragOriginalIndex, 10);
        let shift = 0;
        if (originalIndex < startIndex && originalIndex >= targetIndex) {
          shift = 1;
        } else if (originalIndex > startIndex && originalIndex <= targetIndex) {
          shift = -1;
        }
        item.style.transform = shift !== 0 ? `translateY(${shift * itemHeight}px)` : "translateY(0px)";
      });

      draggedItem.dataset.dragTargetIndex = targetIndex;
    }

    function onEnd() {
      if (!dragging) return;
      dragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);

      const targetIndex = draggedItem ? parseInt(draggedItem.dataset.dragTargetIndex || startIndex, 10) : startIndex;
      stopEdgeTimer();
      const dropBlock = hoverBlock;
      setHoverBlock(null);

      if (draggedItem) {
        draggedItem.classList.remove("dragging");
        draggedItem.style.transform = "";
      }
      getItems().forEach(item => { item.style.transform = ""; });

      // 別フォルダ(未分類含む)の上で離した → そのフォルダの末尾へ移動(再生中の曲は参照で追従)
      if (dropBlock && draggedItem) {
        hapticTap();
        clearPlaylistSelectionForRegroup();
        moveTracksToFolder([parseInt(draggedItem.dataset.index, 10)], dropBlock.id || null);
        renderPlaylist();
        return;
      }

      if (targetIndex !== startIndex) {
        const itemsInOrder = getItems()
          .slice()
          .sort((a, b) => parseInt(a.dataset.dragOriginalIndex, 10) - parseInt(b.dataset.dragOriginalIndex, 10));
        const slots = itemsInOrder.map(el => parseInt(el.dataset.index, 10));
        const originalOrder = itemsInOrder.map(el => playlist[parseInt(el.dataset.index, 10)]);

        const movedTrack = originalOrder[startIndex];
        originalOrder.splice(startIndex, 1);
        originalOrder.splice(targetIndex, 0, movedTrack);

        // グループが占める配列スロットへ並べ直して書き戻す(他フォルダの曲は動かさない)
        const playingTrack = currentPlaylistIndex >= 0 ? playlist[currentPlaylistIndex] : null;
        slots.forEach((slot, k) => { playlist[slot] = originalOrder[k]; });
        if (playingTrack) {
          currentPlaylistIndex = playlist.indexOf(playingTrack);
        }

        persistPlaylistOrder();
      }

      renderPlaylist();
    }

    function onMouseMove(e) { onMove(e.clientY); }
    function onMouseUp() { onEnd(); }
    function onTouchMove(e) {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      onMove(e.touches[0].clientY);
    }
    function onTouchEnd() { onEnd(); }

    function startDrag(clientY) {
      // 無料版: 並び替え不可。ドラッグ開始させずミニポップアップ
      if (typeof isUnlocked === "function" && !isUnlocked()) {
        swShowUnlockToast("無料版ではライブラリの並び替え・フォルダ移動はできません。");
        return;
      }

      draggedItem = handle.closest(".playlistItem");
      if (!draggedItem) return;

      const items = getItems();
      itemCount = items.length;
      startIndex = items.indexOf(draggedItem);
      if (startIndex === -1) return;

      // ドラッグ開始時の並びをdatasetに固定記録(onMove位置計算の基準。ドラッグ中DOM順は変えない)
      items.forEach((item, i) => { item.dataset.dragOriginalIndex = i; });

      // スクロール領域・フォルダの縦範囲を1回だけ測る(フォルダが無ければ従来どおり)
      scroller = findPlaylistScroller(box);
      scrollStart = scroller.scrollTop;
      viewRect = scrollerViewRect(scroller);
      blocks = box.querySelector(".playlistFolderHeader") ? measureFolderBlocks(box, scroller) : null;
      hoverBlock = null;

      const rect = draggedItem.getBoundingClientRect();
      if (items.length > 1) {
        const otherIndex = startIndex === 0 ? 1 : startIndex - 1;
        const otherRect = items[otherIndex].getBoundingClientRect();
        itemHeight = Math.abs(otherRect.top - rect.top) || rect.height;
      } else {
        itemHeight = rect.height;
      }

      dragging = true;
      startY = clientY;
      draggedItem.classList.add("dragging");
      draggedItem.dataset.dragTargetIndex = startIndex;
      hapticTap();
    }

    handle.addEventListener("mousedown", e => {
      e.preventDefault();
      startDrag(e.clientY);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });

    handle.addEventListener("touchstart", e => {
      if (e.touches.length !== 1) return;
      startDrag(e.touches[0].clientY);
      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", onTouchEnd);
    }, { passive: true });
  });
}

// フォルダ自体のドラッグ並び替え(見出しのつまみ。未分類は末尾固定でつまみ無し)。ドラッグ中は全フォルダを見出しだけに畳み、つかんだ見出しがポインタに付いてくる。他の見出しは確定位置へtransformだけでずれる(DOM順の変更はonEndで1回だけ)
function setupFolderDragReorder(box) {
  box.querySelectorAll(".playlist-folder-grip").forEach(grip => {
    let dragging = false, head = null, startY = 0;
    let scroller = null, scrollStart = 0, viewRect = null;
    let blocks = null, dragBlock = null, others = null, targetIdx = 0;
    let edgeTimer = 0, autoDir = 0, lastClientY = 0;

    function stopEdgeTimer() { if (edgeTimer) { clearInterval(edgeTimer); edgeTimer = 0; } autoDir = 0; }

    // 並びが変わった時だけ、他のまとまりを確定位置へずらす(transformのみ)
    function layoutOthers(newIdx) {
      const order = others.slice();
      order.splice(newIdx, 0, dragBlock);
      let cum = blocks[0].top;
      order.forEach(b => {
        if (b !== dragBlock) {
          const shift = cum - b.top;
          const t = shift ? `translateY(${shift}px)` : "";
          b.els.forEach(el => { el.style.transform = t; });
        }
        cum += b.span;
      });
    }

    function onMove(clientY) {
      if (!dragging) return;
      lastClientY = clientY;
      const dy = clientY - startY + (scroller.scrollTop - scrollStart);
      head.style.transform = `translateY(${dy}px)`;

      const dir = clientY < viewRect.top + PLAYLIST_AUTOSCROLL_EDGE ? -1 : (clientY > viewRect.bottom - PLAYLIST_AUTOSCROLL_EDGE ? 1 : 0);
      if (dir !== autoDir) {
        stopEdgeTimer();
        autoDir = dir;
        if (dir !== 0) edgeTimer = setInterval(() => { scroller.scrollTop += autoDir * PLAYLIST_AUTOSCROLL_STEP; onMove(lastClientY); }, 50);
      }

      // つかんだ見出しの中心が、他のまとまりの中心を超えた数=新しい位置
      const center = dragBlock.top + dragBlock.span / 2 + dy;
      let newIdx = 0;
      others.forEach(b => { if (b.top + b.span / 2 < center) newIdx++; });
      if (newIdx !== targetIdx) { targetIdx = newIdx; layoutOthers(newIdx); }
    }

    function onEnd() {
      if (!dragging) return;
      dragging = false;
      stopEdgeTimer();
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);

      const ids = others.map(b => b.id);
      ids.splice(targetIdx, 0, dragBlock.id);
      head.classList.remove("dragging");
      head.style.transform = "";
      blocks.forEach(b => b.els.forEach(el => { el.style.transform = ""; }));

      clearPlaylistSelectionForRegroup();
      if (setPlaylistFolderOrder(ids)) persistPlaylistOrder();
      renderPlaylist();
    }

    function onMouseMove(e) { onMove(e.clientY); }
    function onMouseUp() { onEnd(); }
    function onTouchMove(e) {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      onMove(e.touches[0].clientY);
    }
    function onTouchEnd() { onEnd(); }

    function startDrag(clientY) {
      if (typeof isUnlocked === "function" && !isUnlocked()) {
        swShowUnlockToast("無料版ではフォルダの並び替えはできません。");
        return false;
      }
      head = grip.closest(".playlistFolderHeader");
      if (!head) return false;

      scroller = findPlaylistScroller(box);
      // 全フォルダの曲行を一時的に畳んで「見出しだけの一覧」にしてから並び替える(展開中の大きいフォルダを跨ぐのに長くドラッグしなくて済む)。畳んでもつかんだ見出しが指の下から動かないよう、スクロールを補正してから測る。確定時のrenderPlaylist()で元に戻る
      const oldTop = head.getBoundingClientRect().top;
      box.querySelectorAll(".playlistItem").forEach(el => el.classList.add("folder-drag-hidden"));
      scroller.scrollTop += head.getBoundingClientRect().top - oldTop;
      scrollStart = scroller.scrollTop;
      viewRect = scrollerViewRect(scroller);
      const all = measureFolderBlocks(box, scroller);
      blocks = all.filter(b => b.id !== "");   // 未分類は動かさない(末尾固定)
      dragBlock = blocks.find(b => b.head === head);
      if (!dragBlock) { box.querySelectorAll(".folder-drag-hidden").forEach(el => el.classList.remove("folder-drag-hidden")); return false; }
      others = blocks.filter(b => b !== dragBlock);
      targetIdx = blocks.indexOf(dragBlock);

      dragging = true;
      startY = clientY;
      head.classList.add("dragging");
      hapticTap();
      return true;
    }

    grip.addEventListener("mousedown", e => {
      e.preventDefault();
      e.stopPropagation();
      if (!startDrag(e.clientY)) return;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
    grip.addEventListener("touchstart", e => {
      if (e.touches.length !== 1) return;
      if (!startDrag(e.touches[0].clientY)) return;
      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", onTouchEnd);
    }, { passive: true });
  });
}

if (typeof swRegisterRefreshCallback === "function") {
  swRegisterRefreshCallback(() => { if (typeof renderPlaylist === "function") renderPlaylist(); });
}
