// qn-app-youtube.js — YOUTUBEアプリ(MOREのアプリ1つ)。
// idは使わずdata-yt属性+qnYt*名前空間(本体#loopToggleBtn等との衝突回避)。IFrame APIは初回オープン時に読込。位置ポーリングは表示中のみ、閉じたらpauseVideo()。削除確認はボタン2度押し。スタイルはCSS/style-youtube.cssの.qn-yt*。
// 【規約遵守ルール(最優先・破らない)】詳細md/YOUTUBE_APP.md
// - 公式IFrame Player APIのみ。標準コントロール表示のまま、プレイヤー上に何も重ねない・切り抜かない・隠さない
// - 自前UIはプレイヤーの外(下)。再生/停止の自前ボタン禁止
// - 呼ぶのは公式メソッドのみ: seekTo/getCurrentTime/getDuration/loadVideoById/cueVideoById/pauseVideo等
// - 音声・映像に触れない(Web Audio接続・ダウンロード・キャッシュ禁止)
// - 永続保存はvideoId/URL/手入力タイトル(customTitle)/マーカー(秒・ラベル)のみ。YouTube由来タイトルは端末ローカルの短期キャッシュ(28日で自動削除。起動時に期限切れを削除)だけ。Backup/将来の同期には含めない
// - 広告は.qn-yt-ad-slot(プレイヤーから離す)。現在広告コードなし
(function () {
  "use strict";

  var STORAGE_KEY = "qn_yt_items";
  // YouTube由来タイトルの端末ローカル短期キャッシュ {videoId:{title,fetchedAt}}。28日で削除(規約30日に余裕を持たせる)。Backup/同期に含めない
  var TITLE_CACHE_KEY = "qn_yt_title_cache";
  var TITLE_TTL_MS = 28 * 24 * 60 * 60 * 1000;
  var SEGS = 3;

  var SVG_GRIP = '<svg viewBox="0 0 24 24"><path d="M9 4h2v2H9zm4 0h2v2h-2zM9 9h2v2H9zm4 0h2v2h-2zM9 14h2v2H9zm4 0h2v2h-2zM9 19h2v2H9zm4 0h2v2h-2z"/></svg>';
  var FOLDERS_KEY = "qn_yt_folders", FOLDER_COLLAPSED_KEY = "qn_yt_folder_collapsed";
  var FLAG_KEY = "qn_yt_autonext", RATE_KEY = "qn_yt_rate";
  var FALLBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  var YT_ICON = '<path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.28 5 12 5 12 5s-6.28 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2C2 8.77 2 12 2 12s0 3.23.4 4.8a2.5 2.5 0 0 0 1.76 1.77C5.72 19 12 19 12 19s6.28 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77C22 15.23 22 12 22 12s0-3.23-.4-4.8zM10 15V9l5.2 3L10 15z"/>';

  // ---------- 状態 ----------
  var root = null;
  var refs = {};
  var items = loadItems();
  var current = null;
  var player = null, playerReady = false, apiRequested = false, apiReady = false;
  var pendingVideoId = null, pendingPlay = false;
  var duration = 0;
  var seeking = false;
  var pollTimer = null;
  var tracks = [], fills = [], heads = [], loopRanges = [], loopPres = [], loopJumpAt = 0;
  var titleFetchToken = 0;

  // ---------- ユーティリティ ----------
  function loadItems() {
    try {
      var a = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(a)) return [];
      // 旧形式(title=手入力)→customTitleへ移行。"(無題)"は旧プレースホルダなので捨てる(→自動取得)
      var migrated = false;
      a.forEach(function (it) {
        if (it && Object.prototype.hasOwnProperty.call(it, "title")) {
          var t = typeof it.title === "string" ? it.title.trim() : "";
          if (t && t !== "(無題)" && !it.customTitle) it.customTitle = t;
          delete it.title;
          migrated = true;
        }
      });
      if (migrated) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(a)); } catch (e2) {} }
      return a;
    } catch (e) { return []; }
  }
  function saveItems() {
    trackLocalChanges();
    scheduleSync();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); localStorage.setItem(FOLDERS_KEY, JSON.stringify(ytFolders)); }
    catch (e) { showMessage("保存に失敗しました(容量またはブラウザ設定を確認)"); }
  }

  // ---------- フォルダ(Library): ytFolders={list:[{id,name}],at}。動画側はitem.folder=フォルダid(無い/存在しないidは未分類)。開閉(collapsed)は端末ローカルで同期しない ----------
  function loadFolders() {
    var out = { list: [], at: 0 };
    try {
      var o = JSON.parse(localStorage.getItem(FOLDERS_KEY) || "null");
      if (o && Array.isArray(o.list)) {
        var seen = {};
        o.list.forEach(function (f) {
          if (f && typeof f.id === "string" && typeof f.name === "string" && !seen[f.id]) { seen[f.id] = true; out.list.push({ id: f.id.slice(0, 40), name: f.name.slice(0, 100) }); }
        });
        if (typeof o.at === "number" && isFinite(o.at)) out.at = o.at;
      }
    } catch (e) {}
    return out;
  }
  function loadCollapsed() {
    try { var o = JSON.parse(localStorage.getItem(FOLDER_COLLAPSED_KEY) || "{}"); return o && typeof o === "object" ? o : {}; } catch (e) { return {}; }
  }
  function saveCollapsed() { try { localStorage.setItem(FOLDER_COLLAPSED_KEY, JSON.stringify(collapsedMap)); } catch (e) {} }
  var ytFolders = loadFolders();
  var collapsedMap = loadCollapsed();
  function foldersSig() { return JSON.stringify(ytFolders.list); }
  function folderById(id) {
    for (var i = 0; i < ytFolders.list.length; i++) if (ytFolders.list[i].id === id) return ytFolders.list[i];
    return null;
  }
  // 動画の所属フォルダid(存在しない/未設定はnull=未分類)
  function folderIdOf(it) { return it && it.folder && folderById(it.folder) ? it.folder : null; }
  // 表示順(フォルダ順→各フォルダ内はitems順→未分類)。Auto Next/前後の動画はこの順で進む
  function orderedItems() {
    if (!ytFolders.list.length) return items.slice();
    var out = [];
    ytFolders.list.forEach(function (f) { items.forEach(function (it) { if (folderIdOf(it) === f.id) out.push(it); }); });
    items.forEach(function (it) { if (!folderIdOf(it)) out.push(it); });
    return out;
  }
  function createFolder(name) {
    var base = (name || "").trim() || "新しいフォルダ", fin = base, n = 2;
    while (ytFolders.list.some(function (f) { return f.name === fin; })) fin = base + " " + (n++);
    var f = { id: uid("f"), name: fin };
    ytFolders.list.push(f);
    saveItems();
    return f;
  }
  function deleteFolder(id) {
    items.forEach(function (it) { if (it.folder === id) delete it.folder; });
    ytFolders.list = ytFolders.list.filter(function (f) { return f.id !== id; });
    delete collapsedMap[id]; saveCollapsed();
    saveItems();
  }
  function moveFolder(id, dir) {
    var i = -1;
    ytFolders.list.forEach(function (f, k) { if (f.id === id) i = k; });
    var j = i + dir;
    if (i < 0 || j < 0 || j >= ytFolders.list.length) return;
    var t = ytFolders.list[i]; ytFolders.list[i] = ytFolders.list[j]; ytFolders.list[j] = t;
    saveItems();
  }
  function moveItemsToFolder(itemIds, fid) {
    items.forEach(function (it) {
      if (!itemIds[it.id]) return;
      if (fid) it.folder = fid; else delete it.folder;
    });
    saveItems();
  }
  function uid(p) { return p + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    var mm = (m < 10 ? "0" : "") + m, ss = (s < 10 ? "0" : "") + s;
    return h > 0 ? h + ":" + mm + ":" + ss : mm + ":" + ss;
  }
  function showMessage(text, ok) {
    if (!refs.message) return;
    refs.message.textContent = text || "";
    refs.message.className = "qn-yt-message" + (ok ? " ok" : "");
  }
  // ---------- YouTube由来タイトル: 端末ローカルの短期キャッシュ(28日) ----------
  function readTitleCache() {
    try {
      var o = JSON.parse(localStorage.getItem(TITLE_CACHE_KEY) || "{}");
      return o && typeof o === "object" && !Array.isArray(o) ? o : {};
    } catch (e) { return {}; }
  }
  function writeTitleCache(o) {
    try {
      if (Object.keys(o).length) localStorage.setItem(TITLE_CACHE_KEY, JSON.stringify(o));
      else localStorage.removeItem(TITLE_CACHE_KEY);
    } catch (e) {}
  }
  function titleEntryAlive(e, now) {
    return !!e && typeof e.title === "string" && e.title && typeof e.fetchedAt === "number" &&
      e.fetchedAt <= now + 60000 && now - e.fetchedAt < TITLE_TTL_MS;
  }
  // 期限切れ・壊れた・Libraryに無い動画のキャッシュを削除(「使わない」だけでなく「消す」)。起動時とアプリ表示時に実行
  function purgeTitleCache() {
    var c = readTitleCache(), now = Date.now(), changed = false;
    Object.keys(c).forEach(function (vid) {
      if (!titleEntryAlive(c[vid], now) || !findItemByVideoId(vid)) { delete c[vid]; changed = true; }
    });
    if (changed) writeTitleCache(c);
  }
  function getCachedTitle(vid) {
    var c = readTitleCache(), e = c[vid];
    if (titleEntryAlive(e, Date.now())) return e.title;
    if (e) { delete c[vid]; writeTitleCache(c); }
    return "";
  }
  function setCachedTitle(vid, title) {
    var c = readTitleCache();
    c[vid] = { title: title, fetchedAt: Date.now() };
    writeTitleCache(c);
  }
  function removeCachedTitles(videoIds) {
    var c = readTitleCache(), changed = false;
    videoIds.forEach(function (vid) { if (c[vid]) { delete c[vid]; changed = true; } });
    if (changed) writeTitleCache(c);
  }
  // 表示用タイトル: 手入力(customTitle)があればそれ、無ければYouTube由来キャッシュ、取得前はID
  function displayTitle(it) {
    return it.customTitle || getCachedTitle(it.videoId) || "youtu.be/" + it.videoId;
  }

  // 動画の縦横比: oEmbedの幅/高さ(旧4:3動画は200x150)。埋め込み枠をそれに合わせる(切り抜きでなく枠のリサイズ)。端末に永続キャッシュ。16:9付近・縦長・異常値は既定(16:9)扱い
  var ASPECT_KEY = "qn_yt_aspect_v1", aspectInflight = {};
  function aspectAlive(e) { return Array.isArray(e) && typeof e[1] === "number" && Date.now() - e[1] < TITLE_TTL_MS && e[1] <= Date.now() + 60000; }
  function readAspectCache() {
    try { var o = JSON.parse(localStorage.getItem(ASPECT_KEY) || "{}"); return o && typeof o === "object" ? o : {}; } catch (e) { return {}; }
  }
  function setCachedAspect(vid, w, h) {
    if (!(w > 0 && h > 0)) return;
    var r = Math.round(w / h * 1000) / 1000;
    if (!(r >= 1.2 && r <= 2.4) || Math.abs(r - 16 / 9) < 0.03) r = 0;
    var c = readAspectCache();
    c[vid] = [r, Date.now()];   // YouTube由来の値なのでタイトルと同じく28日で無効(取得し直す)
    var keys = Object.keys(c);
    if (keys.length > 500) delete c[keys[0]];
    try { localStorage.setItem(ASPECT_KEY, JSON.stringify(c)); } catch (e) {}
  }
  function applyAspect(videoId) {
    var yt = root && root.querySelector(".qn-yt");
    if (!yt) return;
    var e = readAspectCache()[videoId], r = aspectAlive(e) ? e[0] : 0;
    if (r) yt.style.setProperty("--qn-yt-ar", String(r)); else yt.style.removeProperty("--qn-yt-ar");
  }
  function ensureAspect(videoId) {
    if (aspectAlive(readAspectCache()[videoId])) { applyAspect(videoId); return; }
    applyAspect(videoId);
    if (aspectInflight[videoId] || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) return;
    aspectInflight[videoId] = true;
    fetch("https://www.youtube.com/oembed?format=json&url=" + encodeURIComponent("https://www.youtube.com/watch?v=" + videoId))
      .then(function (res) { if (!res.ok) throw new Error("oembed failed"); return res.json(); })
      .then(function (d) {
        setCachedAspect(videoId, d && d.width, d && d.height);
        if (current && current.videoId === videoId) applyAspect(videoId);
      })
      .catch(function () {})
      .then(function () { delete aspectInflight[videoId]; });
  }

  var titleInflight = {}, titleFailed = {}, listRefreshTimer = 0;
  // oEmbed(APIキー不要)でタイトル取得→キャッシュ。成功時はタイトル、失敗時は""を返すPromise。force=キャッシュを無視して再取得
  function fetchYtTitle(videoId, force) {
    if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) return Promise.resolve("");
    if (!force) {
      var hit = getCachedTitle(videoId);
      if (hit) return Promise.resolve(hit);
    }
    if (titleInflight[videoId]) return titleInflight[videoId];
    var oembedUrl = "https://www.youtube.com/oembed?format=json&url=" +
      encodeURIComponent("https://www.youtube.com/watch?v=" + videoId);
    var p = fetch(oembedUrl)
      .then(function (res) { if (!res.ok) throw new Error("oembed failed"); return res.json(); })
      .then(function (data) {
        var t = data && typeof data.title === "string" ? data.title.trim().slice(0, 300) : "";
        if (!t) throw new Error("no title");
        delete titleFailed[videoId];
        setCachedTitle(videoId, t);
        setCachedAspect(videoId, data.width, data.height);
        return t;
      })
      .catch(function () { titleFailed[videoId] = true; return ""; })
      .then(function (t) { delete titleInflight[videoId]; return t; });
    titleInflight[videoId] = p;
    return p;
  }
  // 取得結果をLibraryに反映。入力欄(鉛筆編集中・EDIT中)があるときは壊さないよう見送る(次のrenderListで反映)
  function scheduleListRefresh() {
    clearTimeout(listRefreshTimer);
    listRefreshTimer = setTimeout(function () {
      if (root && refs.itemList && !refs.itemList.querySelector("input")) renderList();
    }, 150);
  }
  // 手入力タイトルが無く、有効なキャッシュも無い動画のタイトルをまとめて取得(同時3件まで)
  function ensureTitles() {
    purgeTitleCache();
    var queue = items.filter(function (it) {
      return !it.customTitle && !titleFailed[it.videoId] && !getCachedTitle(it.videoId);
    }).map(function (it) { return it.videoId; });
    var active = 0;
    function next() {
      while (active < 3 && queue.length) {
        active++;
        fetchYtTitle(queue.shift()).then(function (t) {
          active--;
          if (t) scheduleListRefresh();
          next();
        });
      }
    }
    next();
  }

  function findItem(id) {
    for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i];
    return null;
  }
  function findItemByVideoId(vid) {
    for (var i = 0; i < items.length; i++) if (items[i].videoId === vid) return items[i];
    return null;
  }
  function findMarker(id) {
    if (!current || !id) return null;
    for (var i = 0; i < current.markers.length; i++) if (current.markers[i].id === id) return current.markers[i];
    return null;
  }

  function parseVideoId(input) {
    var s = (input || "").trim();
    if (!s) return null;
    if (!/^https?:\/\//i.test(s)) s = "https://" + s;
    var u;
    try { u = new URL(s); } catch (e) { return null; }
    var host = u.hostname.replace(/^www\.|^m\./, "");
    var id = null;
    if (host === "youtu.be") {
      id = u.pathname.split("/")[1];
    } else if (host === "youtube.com") {
      if (u.pathname === "/watch") id = u.searchParams.get("v");
      else {
        var m = u.pathname.match(/^\/(shorts|embed)\/([^/?#]+)/);
        if (m) id = m[2];
      }
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  }

  var BI = {
    prevTrack: '<path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>',
    nextTrack: '<path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2z"/>',
    back10: '<path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>',
    fwd10: '<path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>',
    play: '<path d="M8 5v14l11-7z"/>',
    pause: '<path d="M6 5h4v14H6zm8 0h4v14h-4z"/>',
    repeat: '<path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>',
    add: '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>',
    loop: '<path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>',
    setA: '<text x="12" y="18" text-anchor="middle" font-size="17" font-weight="700" font-family="Instrument Sans, sans-serif" fill="currentColor">A</text>',
    setB: '<text x="12" y="18" text-anchor="middle" font-size="17" font-weight="700" font-family="Instrument Sans, sans-serif" fill="currentColor">B</text>',
    clear: '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>',
    preroll: '<path d="M3 6h3v12H3zm15 0h3v12h-3zM9 9l-3 3 3 3v-2h6v2l3-3-3-3v2H9z"/>',
    speed: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 12L15.5 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/><circle cx="12" cy="12" r="1.4"/>'
  };
  function bbtn(ref, cls, icon, label, title) {
    return '<button type="button" data-yt="' + ref + '" class="qn-yt-bbtn' + (cls ? " " + cls : "") + '" title="' + title + '">' +
      '<svg viewBox="0 0 24 24">' + icon + '</svg><span>' + label + '</span></button>';
  }
  var BAR_HTML =
    '<div class="qn-yt-bar">' +
      '<div class="qn-yt-bgroup">' +
        bbtn("prevVideoBtn", "", BI.prevTrack, "Track", "Libraryの前の動画 (Shift+P)") +
        bbtn("skipBackBtn", "", BI.back10, "-10s", "10秒戻る (J)") +
        bbtn("playBtn", "center", BI.play, "Play", "再生 / 一時停止 (Space / K)") +
        bbtn("skipFwdBtn", "", BI.fwd10, "+10s", "10秒進む (L)") +
        bbtn("nextVideoBtn", "", BI.nextTrack, "Track", "Libraryの次の動画 (Shift+N)") +
        bbtn("autoNext", "", BI.repeat, "Auto Next", "終了したらLibraryの次の動画を読み込む（ON/OFF）") +
      '</div>' +
      '<div class="qn-yt-bdiv"></div>' +
      '<div class="qn-yt-bgroup">' +
        bbtn("prevMarkerBtn", "", BI.prevTrack, "Marker", "前のマーカーへ") +
        bbtn("addMarkerBtn", "center", BI.add, "Marker", "マーカーを追加") +
        bbtn("nextMarkerBtn", "", BI.nextTrack, "Marker", "次のマーカーへ") +
        bbtn("setABtn", "", BI.setA, "A --", "現在地をA点に設定") +
        bbtn("setBBtn", "", BI.setB, "B --", "現在地をB点に設定") +
        bbtn("loopToggleBtn", "", BI.loop, "Loop", "LOOP：OFF → A-B → 区間 → OFF") +
        bbtn("loopClearBtn", "", BI.clear, "Clear AB", "AB点をクリア") +
      '</div>' +
      '<div class="qn-yt-bspacer"></div>' +
      '<div class="qn-yt-bgroup">' +
        '<div class="qn-yt-bstep" title="再生スピード (&lt; / &gt;)">' +
          '<button type="button" data-yt="speedDown" class="qn-yt-bstep-btn" title="Slower (&lt;)">−</button>' +
          '<div class="qn-yt-bstep-mid"><svg viewBox="0 0 24 24">' + BI.speed + '</svg><span><b data-yt="speedVal">1x</b> Speed</span></div>' +
          '<button type="button" data-yt="speedUp" class="qn-yt-bstep-btn" title="Faster (&gt;)">＋</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  // ---------- 画面の骨組み ----------
  var TEMPLATE =
    '<div class="qn-yt">' +
      '<aside class="qn-yt-panel">' +
        '<div class="qn-yt-panel-header"><span class="pcv2-panel-header-title" data-yt="panelTitle">Library</span></div>' +
        '<button type="button" class="qn-sheet-close" data-yt="sheetClose" title="閉じる" aria-label="閉じる"><svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg></button>' +
        '<div class="qn-yt-panel-scroll">' +
          '<section class="qn-yt-sec qn-yt-sec-library">' +
            '<div class="qn-yt-sec-head"><h3>Library</h3><span class="qn-yt-count" data-yt="listCount">0</span></div>' +
            '<div class="qn-yt-input-block">' +
              '<ol class="qn-yt-hint" data-yt="emptyHint">' +
                '<li class="qn-yt-hint-1"><b>1</b><span>YouTubeのURLを下の欄に貼り付け</span></li>' +
                '<li class="qn-yt-hint-2"><b>2</b><span>Saveを押すとLibraryに保存されます</span></li>' +
              '</ol>' +
              '<div class="qn-yt-row">' +
                '<input data-yt="urlInput" class="qn-yt-input" type="text" placeholder="YouTube URL" autocomplete="off" spellcheck="false">' +
              '</div>' +
              '<div class="qn-yt-row">' +
                '<input data-yt="titleInput" class="qn-yt-input" type="text" placeholder="Title (blank = auto from YouTube)" autocomplete="off">' +
                '<button type="button" data-yt="saveBtn" class="qn-yt-btn primary">Save</button>' +
              '</div>' +
              '<div class="qn-yt-message" data-yt="message" role="status"></div>' +
              '<div class="qn-yt-sync" data-yt="syncStatus"></div>' +
            '</div>' +
            '<div class="qn-yt-libbox" data-yt="itemList"></div>' +
            '<p class="qn-yt-empty" data-yt="emptyList">保存した動画がここに並びます</p>' +
          '</section>' +
          '<section class="qn-yt-sec qn-yt-sec-markers">' +
            '<div class="qn-yt-sec-head"><h3>Markers</h3><span class="qn-yt-count" data-yt="markerCount">0</span></div>' +
            // チャプターは利用者が貼り付けたテキストを解析するだけ(YouTubeから取得しない)
            '<div class="qn-yt-chapter">' +
              '<button type="button" class="qn-yt-btn" data-yt="chapToggle">チャプターを貼り付け</button>' +
              '<div class="qn-yt-chapter-box" data-yt="chapBox" hidden>' +
                '<textarea class="qn-yt-input qn-yt-chapter-text" data-yt="chapText" rows="6" spellcheck="false" autocomplete="off" ' +
                  'placeholder="0:00 チャプタータイトル&#10;1:23 チャプタータイトル&#10;2:45 チャプタータイトル"></textarea>' +
                '<p class="qn-yt-hint">動画の説明欄のチャプターをコピーして貼り付けてください。「時間 タイトル」を1行ずつ読み取り、現在の動画のマーカーに追加します。</p>' +
                '<div class="qn-yt-row">' +
                  '<button type="button" class="qn-yt-btn primary" data-yt="chapAdd">マーカーに追加</button>' +
                  '<button type="button" class="qn-yt-btn" data-yt="chapClose">閉じる</button>' +
                '</div>' +
                '<div class="qn-yt-message" data-yt="chapMsg" role="status"></div>' +
              '</div>' +
            '</div>' +
            '<div class="qn-yt-pinbox" data-yt="markerList"></div>' +
            '<p class="qn-yt-empty" data-yt="emptyMarkers">マーカーはありません</p>' +
          '</section>' +
          // ---------- Playlists: YouTube公式の再生リストを取得して一覧表示(YouTube Data API。結果は端末に保存しない=メモリのみ) ----------
          '<section class="qn-yt-sec qn-yt-sec-playlists">' +
            '<div class="qn-yt-sec-head"><h3>Playlists</h3><span class="qn-yt-count" data-yt="plCount">0</span></div>' +
            '<div class="qn-yt-input-block">' +
              '<div class="qn-yt-row">' +
                '<input data-yt="plUrl" class="qn-yt-input" type="text" placeholder="YouTube Playlist URL" autocomplete="off" spellcheck="false">' +
                '<button type="button" data-yt="plLoad" class="qn-yt-btn primary">Load</button>' +
              '</div>' +
              '<div class="qn-yt-message" data-yt="plMsg" role="status"></div>' +
              '<div class="qn-yt-row qn-yt-plkey" data-yt="plKeyBox" hidden>' +
                '<input data-yt="plKey" class="qn-yt-input" type="text" placeholder="YouTube Data API key" autocomplete="off" spellcheck="false">' +
                '<button type="button" data-yt="plKeySave" class="qn-yt-btn">Save</button>' +
              '</div>' +
              '<div class="qn-yt-row qn-yt-plmine" data-yt="plMineRow">' +
                '<button type="button" data-yt="plMine" class="qn-yt-btn">My Playlists</button>' +
              '</div>' +
              '<button type="button" data-yt="plKeyToggle" class="qn-yt-linkbtn">API Key</button>' +
            '</div>' +
            '<div class="qn-yt-plhead" data-yt="plHead" hidden>' +
              '<span class="qn-yt-pltitle" data-yt="plTitle"></span>' +
              '<button type="button" data-yt="plAll" class="qn-yt-btn mini">All</button>' +
              '<button type="button" data-yt="plAdd" class="qn-yt-btn mini primary" disabled>Add to Library</button>' +
            '</div>' +
            '<div class="qn-yt-libbox qn-yt-pllist" data-yt="plList"></div>' +
          '</section>' +
          // ---------- Backup / Import: 本体共通画面を借りる(実体player-track-backup.js。setPanel()がqnBackupMountInto()で差し込む) ----------
          '<section class="qn-yt-sec qn-yt-sec-backup"><div data-yt="bkHost"></div></section>' +
          '<section class="qn-yt-sec qn-yt-sec-import"><div data-yt="imHost"></div></section>' +
          // ---------- Keyboard（YouTube本家と同じショートカットの一覧。中身は renderShortcuts() が入れる） ----------
          '<section class="qn-yt-sec qn-yt-sec-keyboard">' +
            '<div class="qn-yt-kbd" data-yt="kbdBox"></div>' +
          '</section>' +
          '<footer class="qn-yt-legal">' +
            '<p>権利者に無断でアップロードされた動画は使用しないでください。</p>' +
            '<p>このアプリはYouTube API Servicesを利用しています。</p>' +
            '<p><a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">YouTube利用規約</a>' +
            ' ・ <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Googleプライバシーポリシー</a></p>' +
            '<p>Libraryやマーカーなどの保存データは、この端末のブラウザにだけ保存されます。ログインして同期を有効にした場合のみ、動画ID・マーカー・A/B点・並び順・フォルダ・手入力タイトルがGoogle Firebaseにも保存されます(YouTube由来のタイトル・サムネイルは含みません)。' +
            '動画の再生・サムネイル・タイトルの表示のため、YouTubeと通信します。Playlistsでは再生リストの取得にYouTube Data APIを利用し、取得した内容は端末に保存せず、Libraryに追加した動画のIDとタイトルのみ保存します。</p>' +
          '</footer>' +
        '</div>' +
        '<div class="qn-yt-fab" data-yt="fab">' +
          '<div class="qn-yt-fab-add">' +
            '<button type="button" class="panel-fab-btn panel-addfile-btn" data-yt="fabAdd" title="Add Marker">' +
              '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg><span>MARKER</span>' +
            '</button>' +
          '</div>' +
          '<div class="qn-yt-fab-folder">' +
            '<button type="button" class="panel-fab-btn panel-addfile-btn" data-yt="fabFolder" title="Add Folder">' +
              '<svg viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-1 8h-3v3h-2v-3h-3v-2h3V9h2v3h3v2z"/></svg><span>FOLDER</span>' +
            '</button>' +
          '</div>' +
          '<button type="button" class="panel-fab-btn panel-fab-move-btn" data-yt="fabMove" disabled>' +
            '<svg viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 11l-4-4h3V9h2v4h3l-4 4z"/></svg><span>Move</span>' +
          '</button>' +
          '<button type="button" class="panel-fab-btn panel-fab-delete-btn" data-yt="fabDel" disabled>' +
            '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg><span>Delete</span>' +
          '</button>' +
          '<button type="button" class="panel-fab-btn panel-edit-btn" data-yt="fabEdit" title="Edit">' +
            '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg><span data-yt="fabEditLabel">EDIT</span>' +
          '</button>' +
        '</div>' +
      '</aside>' +
      '<section class="qn-yt-stage">' +
        // プレイヤーは標準コントロールのまま。上に何も重ねない(規約)
        '<div class="qn-yt-player-wrap" data-qn-keep-visible><div id="qnYtPlayer"></div></div>' +
        '<div class="qn-yt-custom">' +
          '<p class="qn-yt-fetched-title" data-yt="fetchedTitle"></p>' +
          '<div class="qn-yt-seek" data-yt="seekTracks"><div class="qn-yt-marker-layer" data-yt="markerLayer"></div></div>' +
        '</div>' +
        // PLの波形エリア右下(#pcV2WaveFabRow)と同位置のMARKERボタン。プレイヤーの外(下)・通常フロー(重ねない)
        '<div class="qn-yt-stage-fab">' +
          '<button type="button" class="panel-fab-btn panel-addfile-btn" data-yt="stageAddMarker" title="Add Marker">' +
            '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg><span>MARKER</span>' +
          '</button>' +
        '</div>' +
      '</section>' +
      BAR_HTML +
    '</div>';

  // ---------- サイドバー(Library/Markers)とパネル。PC=パネル常時表示(アイコンで中身切替)、SP=全面オーバーレイ(同アイコン再タップで閉じる) ----------
  var SIDEBAR = [
    { id: "library", label: "Library", icon: '<path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>' },
    { id: "markers", label: "Markers", icon: '<path d="M3 6h12v2H3V6zm0 4h12v2H3v-2zm0 4h7v2H3v-2zm13 0h2v3h3v2h-3v3h-2v-3h-3v-2h3v-3z"/>' },
    { id: "playlists", label: "Playlists", icon: '<path d="M4 6h12v2H4zm0 4h12v2H4zm0 4h8v2H4zm10 0v6l5-3z"/>' },
  ];
  var PANEL_TITLES = { library: "Library", markers: "Markers", playlists: "Playlists", backup: "Backup", import: "Import", keyboard: "Keyboard" };
  var panelState = null;

  function isSp() { return window.matchMedia("(max-width: 900px)").matches; }

  var sheetClosing = false, sheetSkipAnim = false;
  function setPanel(id) {
    if (!isSp() && id === "none") id = "library";
    // SP: 閉じる時は下へスライドしてから非表示(.qn-yt-closing中だけパネルを残す。プレイヤーもこの間に元の大きさへ戻る)
    if (id === "none" && isSp() && root && panelState && panelState !== "none" && !sheetSkipAnim) {
      if (sheetClosing) return;
      sheetClosing = true;
      root.querySelector(".qn-yt").classList.add("qn-yt-closing");
      setTimeout(function () {
        sheetClosing = false;
        if (root) root.querySelector(".qn-yt").classList.remove("qn-yt-closing");
        sheetSkipAnim = true;
        setPanel("none");
        sheetSkipAnim = false;
      }, 230);
      return;
    }
    panelState = id;
    if (!root) return;
    if (editMode && editMode !== id) { editMode = null; selected = {}; }
    var yt = root.querySelector(".qn-yt");
    yt.setAttribute("data-panel", id);
    updateFab();
    renderList();
    renderMarkers();
    // SP幅でパネルを開いてもプレイヤーは上部に小さく残る(覆わない)ので一時停止不要(CSS .qn-yt:not([data-panel="none"]))。Backup/Importは本体共通画面を借りる(他パネルでは借りを解除)
    if (id === "backup" || id === "import") {
      if (typeof window.qnBackupMountInto === "function") {
        window.qnBackupMountInto(id, id === "backup" ? refs.bkHost : refs.imHost, function () {
          setPanel(isSp() ? "none" : "library");
        });
      }
    } else if (typeof window.qnBackupReleaseExternal === "function") {
      window.qnBackupReleaseExternal();
    }
    if (id === "keyboard") renderShortcuts();
    updatePanelTitle();
    if (window.QNApps) window.QNApps.setSideActive((id === "none" || isCollapsed()) ? null : id);
  }

  function updatePanelTitle() {
    if (!root || !panelState || panelState === "none") return;
    var t = PANEL_TITLES[panelState] || "";
    if (panelState === "markers") t += " " + (current ? current.markers.length : 0);
    else if (panelState === "library") t += " " + items.length;
    refs.panelTitle.textContent = t;
  }

  function onSidebar(id) {
    if (isSp()) {
      if (panelState === id) setPanel("none"); else setPanel(id);
      return;
    }
    if (panelCollapsed) { setCollapsed(false); setPanel(id); return; }
    if (panelState === id) { setCollapsed(true); return; }
    setPanel(id);
  }

  // ---------- パネル格納(PC幅のみ・v3.4.0〜): アイコンバー右のパネルだけ格納。プレイヤー幅は格納直前で固定。状態はlocalStorage保存 ----------
  var COLLAPSE_KEY = "qn_yt_panel_collapsed";
  var panelCollapsed = (function () {
    try { return localStorage.getItem(COLLAPSE_KEY) === "1"; } catch (e) { return false; }
  })();
  function isCollapsed() { return panelCollapsed && !isSp(); }

  function applyCollapse() {
    if (!root) return;
    var yt = root.querySelector(".qn-yt");
    if (!yt) return;
    var on = isCollapsed();
    if (on) {
      var w = Math.min(1280, yt.clientWidth - 375 - 48);
      yt.style.setProperty("--qn-yt-player-w", Math.max(200, w) + "px");
    }
    yt.classList.toggle("qn-yt-collapsed", on);
    if (window.QNApps) window.QNApps.setSideActive((on || !panelState || panelState === "none") ? null : panelState);
  }

  function setCollapsed(on) {
    panelCollapsed = !!on;
    try { localStorage.setItem(COLLAPSE_KEY, panelCollapsed ? "1" : "0"); } catch (e) {}
    applyCollapse();
  }

  function closePanelOnSp() { if (isSp()) setPanel("none"); }

  function mount(view) {
    root = view;
    root.innerHTML = TEMPLATE;
    var nodes = root.querySelectorAll("[data-yt]");
    for (var i = 0; i < nodes.length; i++) refs[nodes[i].getAttribute("data-yt")] = nodes[i];

    window.addEventListener("resize", applyCollapse);
    buildTracks();
    if (window.ResizeObserver) {
      var roRaf = 0;
      new ResizeObserver(function () {
        cancelAnimationFrame(roRaf);
        roRaf = requestAnimationFrame(function () { if (current) renderMarkers(); });
      }).observe(refs.seekTracks);
    }
    bindEvents();
    refs.syncStatus.addEventListener("click", function () { if (syncUser && syncState !== "syncing") syncNow(); });
    setSyncStatus(syncState);
    updateDisplay(0);
    renderList();
    renderMarkers();
  }

  // ---------- 3分割シークバー: 全長をSEGS等分、各行が1/SEGS担当 ----------
  function buildTracks() {
    for (var i = 0; i < SEGS; i++) {
      var track = document.createElement("div");
      track.className = "qn-yt-track vbar";
      var fill = document.createElement("div"); fill.className = "qn-yt-fill vfill";
      var loop = document.createElement("div"); loop.className = "qn-yt-loop-range"; loop.hidden = true;
      var head = document.createElement("div"); head.className = "qn-yt-head"; head.style.display = "none";
      var preA = document.createElement("div"); preA.className = "qn-yt-loop-pre"; preA.hidden = true;
      var preB = document.createElement("div"); preB.className = "qn-yt-loop-pre"; preB.hidden = true;
      track.appendChild(fill); track.appendChild(preA); track.appendChild(preB); track.appendChild(loop); track.appendChild(head);
      loopPres.push([preA, preB]);
      refs.seekTracks.insertBefore(track, refs.markerLayer);
      tracks.push(track); fills.push(fill); loopRanges.push(loop); heads.push(head);
      attachTrackSeek(track);
    }
    heads[0].style.display = "";
  }

  function segIndex(t) {
    if (!duration) return 0;
    var i = Math.floor(t / (duration / SEGS));
    return Math.max(0, Math.min(SEGS - 1, i));
  }
  function segPct(i, t) {
    if (!duration) return 0;
    var len = duration / SEGS;
    return Math.min(100, Math.max(0, ((t - i * len) / len) * 100));
  }
  function timeFromPoint(e) {
    var best = 0, bestD = Infinity, i, r, d;
    for (i = 0; i < SEGS; i++) {
      r = tracks[i].getBoundingClientRect();
      d = e.clientY < r.top ? r.top - e.clientY : (e.clientY > r.bottom ? e.clientY - r.bottom : 0);
      if (d < bestD) { bestD = d; best = i; }
    }
    r = tracks[best].getBoundingClientRect();
    var ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    return (best + ratio) * (duration / SEGS);
  }
  function positionMarker(el, t) {
    var i = segIndex(t);
    var pct = segPct(i, t);
    el.style.left = pct + "%";
    el.style.top = tracks[i].offsetTop + "px";
    el.style.height = tracks[i].offsetHeight + "px";
    el.classList.toggle("flip", pct >= 80);
  }
  function markerLabelParts(m, idx) {
    return { num: String(idx + 1), memo: m.label || "" };
  }
  function fillMarkerLabel(el, m, idx) {
    var lab = el.querySelector(".qn-yt-marker-label");
    if (!lab) {
      lab = document.createElement("span");
      lab.className = "qn-yt-marker-label";
      lab.innerHTML = '<span class="n"></span><span class="memo"></span>';
      el.appendChild(lab);
    }
    var p = markerLabelParts(m, idx);
    lab.querySelector(".n").textContent = p.num;
    lab.querySelector(".memo").textContent = p.memo;
  }

  // ---------- YouTube IFrame API(公式の読込方法): 初めて動画を読む時だけスクリプト取得(開いただけではYouTubeへ通信しない) ----------
  function requestApi() {
    if (apiRequested) return;
    apiRequested = true;
    if (window.YT && window.YT.Player) { apiReady = true; return; }
    var prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (typeof prev === "function") { try { prev(); } catch (e) {} }
      apiReady = true;
      if (pendingVideoId) {
        createPlayer(pendingVideoId, pendingPlay);
        pendingVideoId = null; pendingPlay = false;
      }
    };
    var tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.onerror = function () { showMessage("YouTubeの読み込みに失敗しました(ネットワークを確認)"); apiRequested = false; };
    document.head.appendChild(tag);
  }

  // disablekb:0(既定)を明示。キー入力は奪わない
  function createPlayer(videoId, shouldPlay) {
    player = new YT.Player("qnYtPlayer", {
      videoId: videoId,
      playerVars: { controls: 1, autoplay: 0, playsinline: 1, disablekb: 0 },
      events: {
        onReady: function () {
          playerReady = true;
          if (shouldPlay) player.playVideo();
          refreshDuration();
          applyDesiredRate();
          renderSpeed();
        },
        onStateChange: function (e) {
          refreshDuration();
          updatePlayBtn(!!(e && e.data === 1));
          try { if (window.QNWake) window.QNWake.set("youtube", !!(e && e.data === 1)); } catch (err) {}
          if (e && e.data === 1) { applyDesiredRate(); renderSpeed(); }
          if (e && e.data === 0) handleEnded();
        },
        onPlaybackRateChange: function () { renderSpeed(); },
        onError: onPlayerError
      }
    });
  }

  function onPlayerError(e) {
    var c = e && e.data;
    if (c === 101 || c === 150) showMessage("この動画は埋め込み再生できません(投稿者が埋め込みを許可していません)");
    else if (c === 100) showMessage("動画が見つかりません(削除または非公開)");
    else if (c === 2) showMessage("動画IDが不正です");
    else showMessage("再生できませんでした(エラーコード: " + c + ")");
  }

  // ---------- ステージ見出し: YouTube由来タイトルを表示(キャッシュ利用。端末ローカルのみ) ----------
  function fetchTitleForDisplay(videoId) {
    var myToken = ++titleFetchToken;
    refs.fetchedTitle.textContent = getCachedTitle(videoId);
    fetchYtTitle(videoId).then(function (t) {
      if (myToken !== titleFetchToken) return;
      refs.fetchedTitle.textContent = t || "";
      if (t) scheduleListRefresh();
    });
  }

  function refreshDuration() {
    if (!player || !playerReady || typeof player.getDuration !== "function") return;
    var d = player.getDuration();
    if (d && d !== duration) {
      duration = d;
      if (refs.durTime) refs.durTime.textContent = fmt(d);
      renderMarkers();
      updateDisplay(currentPos());
    }
  }

  // play=false: cue(再生は利用者がYouTube標準コントロールで)。play=true: リストクリック等、利用者の明確な操作起点の時だけloadVideoById()
  function openVideo(videoId, url, itemId, opts) {
    var shouldPlay = !!(opts && opts.play);
    var item = itemId ? findItem(itemId) : findItemByVideoId(videoId);
    current = {
      videoId: videoId,
      url: url,
      itemId: item ? item.id : null,
      markers: item ? item.markers : [],
      loopA: item ? abTimeOf(item.loopA, item.markers) : null,
      loopB: item ? abTimeOf(item.loopB, item.markers) : null,
      looping: false,
      loopMode: "off",
      secRange: null
    };
    duration = 0;
    if (refs.durTime) refs.durTime.textContent = "00:00";
    updateDisplay(0);
    if (item) refs.titleInput.value = item.customTitle || "";
    showMessage("");
    fetchTitleForDisplay(videoId);
    ensureAspect(videoId);
    requestApi();
    if (player && playerReady) {
      if (shouldPlay) player.loadVideoById(videoId); else player.cueVideoById(videoId);
    } else if (!player) {
      pendingPlay = shouldPlay;
      if (apiReady) createPlayer(videoId, shouldPlay); else pendingVideoId = videoId;
    } else {
      var t = setInterval(function () {
        if (playerReady) {
          clearInterval(t);
          if (shouldPlay) player.loadVideoById(videoId); else player.cueVideoById(videoId);
        }
      }, 200);
    }
    renderMarkers();
    renderList();
  }

  // ---------- Playlists(YouTube Data API v3)。APIで得た動画情報(タイトル等)は画面表示だけに使いメモリにのみ保持。端末への保存は、Libraryへ追加した動画のvideoIdと(既存の28日キャッシュ経由の)タイトルだけ ----------
  var PL_KEY_STORE = "qn_yt_api_key", PL_LAST_KEY = "qn_yt_pl_last";
  var plState = { id: "", title: "", videos: [], sel: {}, loading: false };
  function getApiKey() {
    var k = typeof window.QN_YT_API_KEY === "string" ? window.QN_YT_API_KEY.trim() : "";
    if (k) return k;
    try { return (localStorage.getItem(PL_KEY_STORE) || "").trim(); } catch (e) { return ""; }
  }
  function parsePlaylistId(input) {
    var v = (input || "").trim();
    if (!v) return "";
    var id = "";
    if (/^[A-Za-z0-9_-]{13,64}$/.test(v) && !/^https?:/i.test(v)) id = v;
    else {
      try {
        var u = new URL(/^https?:\/\//i.test(v) ? v : "https://" + v);
        if (/(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(u.hostname)) id = u.searchParams.get("list") || "";
      } catch (e) {}
    }
    return /^[A-Za-z0-9_-]{13,64}$/.test(id) ? id : "";
  }
  function plSay(text, ok) {
    if (!refs.plMsg) return;
    refs.plMsg.textContent = text || "";
    refs.plMsg.className = "qn-yt-message" + (ok ? " ok" : "");
  }
  function apiErrorText(status, body) {
    var reason = "";
    try { reason = body.error.errors[0].reason || ""; } catch (e) {}
    if (reason === "quotaExceeded" || reason === "rateLimitExceeded") return "APIの利用上限に達しました(翌日以降に再試行してください)";
    if (reason === "keyInvalid" || reason === "API_KEY_INVALID" || status === 400) return "APIキーが無効です";
    if (reason === "accessNotConfigured" || reason === "forbidden" && status === 403) return "このAPIキーではYouTube Data APIを利用できません(キーの設定を確認してください)";
    if (reason === "playlistNotFound" || status === 404) return "再生リストが見つかりません(非公開のリストは取得できません)";
    if (reason === "playlistForbidden") return "この再生リストは取得できません";
    return "取得できませんでした(" + status + ")";
  }
  // auth={key}(公開リスト用APIキー) か {token}(自分のアカウント。OAuthアクセストークン)
  function ytApi(path, params, auth) {
    var q = Object.keys(params).map(function (k) { return k + "=" + encodeURIComponent(params[k]); }).join("&");
    var url = "https://www.googleapis.com/youtube/v3/" + path + "?" + q, opt = {};
    if (auth.token) opt.headers = { Authorization: "Bearer " + auth.token }; else url += "&key=" + encodeURIComponent(auth.key);
    return fetch(url, opt).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (body) {
        if (!res.ok) {
          var err = new Error(res.status === 401 && auth.token ? "ログインの権限が切れました。My Playlistsをもう一度押してください" : apiErrorText(res.status, body));
          err.api = true; err.status = res.status;
          throw err;
        }
        return body;
      });
    });
  }
  function loadPlaylist(id, key, token) {
    var out = { title: "", videos: [] }, seen = {}, auth = token ? { token: token } : { key: key };
    var head = id === "LL" ? Promise.resolve().then(function () { out.title = "Liked videos"; }) : ytApi("playlists", { part: "snippet", id: id }, auth).then(function (b) {
      if (b && b.items && b.items[0] && b.items[0].snippet) out.title = String(b.items[0].snippet.title || "").slice(0, 200);
      else { var e = new Error("再生リストが見つかりません(非公開のリストは取得できません)"); e.api = true; throw e; }
    });
    function page(token, n) {
      var params = { part: "snippet", maxResults: 50, playlistId: id };
      if (token) params.pageToken = token;
      return ytApi("playlistItems", params, auth).then(function (b) {
        (b.items || []).forEach(function (r) {
          var sn = r && r.snippet, vid = sn && sn.resourceId && sn.resourceId.videoId;
          if (!vid || !/^[A-Za-z0-9_-]{11}$/.test(vid) || seen[vid]) return;
          var t = String(sn.title || "");
          if (t === "Private video" || t === "Deleted video") return;
          seen[vid] = true;
          out.videos.push({ videoId: vid, title: t.slice(0, 300) });
        });
        if (b.nextPageToken && n < 10) return page(b.nextPageToken, n + 1);
      });
    }
    return head.then(function () { return page("", 0); }).then(function () { return out; });
  }
  function doLoadPlaylist() {
    if (plState.loading) return;
    var id = parsePlaylistId(refs.plUrl.value);
    if (!refs.plUrl.value.trim()) { plSay("再生リストのURLを入力してください"); return; }
    if (!id) { plSay("再生リストのURLとして認識できません"); return; }
    if (/^RD/.test(id)) { plSay("Mix(自動生成リスト)は取得できません"); return; }
    var key = getApiKey();
    if (!key) { refs.plKeyBox.hidden = false; plSay("先にYouTube Data APIキーを入力してください"); return; }
    try { localStorage.setItem(PL_LAST_KEY, refs.plUrl.value.trim()); } catch (e) {}
    runLoad(id, key, "");
  }
  function runLoad(id, key, token) {
    plState.loading = true;
    refs.plLoad.disabled = true; refs.plMine.disabled = true;
    plSay("読み込み中…", true);
    return loadPlaylist(id, key, token).then(function (r) {
      plState = { id: id, title: r.title, videos: r.videos, sel: {}, loading: false, mode: "videos", token: token };
      plSay(r.videos.length ? "" : "取得できる動画がありません");
      renderPlaylistPanel();
    }).catch(function (err) {
      plState.loading = false;
      plSay(err && err.api ? err.message : "通信に失敗しました");
    }).then(function () { refs.plLoad.disabled = false; refs.plMine.disabled = false; });
  }
  // 自分のアカウントの再生リスト一覧(OAuth)。クリック(ユーザー操作)から直接呼ぶ=ポップアップがブロックされない
  function doLoadMine() {
    var A = window.QN_AUTH;
    if (plState.loading) return;
    if (!A || !A.currentUser || typeof A.getYtToken !== "function") { plSay("先にGoogleでログインしてください"); return; }
    plState.loading = true;
    refs.plMine.disabled = true;
    plSay("権限を確認中…", true);
    A.getYtToken().then(function (token) {
      plSay("読み込み中…", true);
      var lists = [{ id: "LL", title: "Liked videos", count: -1 }];
      function page(tk, n) {
        var params = { part: "snippet,contentDetails", mine: "true", maxResults: 50 };
        if (tk) params.pageToken = tk;
        return ytApi("playlists", params, { token: token }).then(function (b) {
          (b.items || []).forEach(function (r) {
            if (r && r.id) lists.push({ id: r.id, title: String((r.snippet && r.snippet.title) || "").slice(0, 200), count: r.contentDetails ? r.contentDetails.itemCount : -1 });
          });
          if (b.nextPageToken && n < 10) return page(b.nextPageToken, n + 1);
        });
      }
      return page("", 0).then(function () {
        plState = { id: "", title: "My Playlists", videos: [], lists: lists, sel: {}, loading: false, mode: "lists", token: token };
        plSay("");
        renderPlaylistPanel();
      });
    }).catch(function (err) {
      plState.loading = false;
      var code = err && err.code ? String(err.code) : "";
      if (err && err.api) plSay(err.message);
      else if (/popup-closed|cancelled/.test(code)) plSay("キャンセルされました");
      else if (/popup-blocked/.test(code)) plSay("ポップアップがブロックされました");
      else plSay("権限を取得できませんでした");
    }).then(function () { refs.plMine.disabled = false; });
  }
  function plSelCount() { var n = 0; for (var k in plState.sel) if (plState.sel[k]) n++; return n; }
  function renderPlaylistPanel() {
    if (!root) return;
    var box = refs.plList, vids = plState.videos;
    box.textContent = "";
    var listMode = plState.mode === "lists";
    refs.plCount.textContent = String(listMode ? plState.lists.length : vids.length);
    refs.plHead.hidden = listMode ? false : !vids.length;
    refs.plTitle.textContent = plState.title;
    refs.plAll.hidden = listMode; refs.plAdd.hidden = listMode;
    refs.plAdd.disabled = plSelCount() === 0;
    if (listMode) {
      plState.lists.forEach(function (l) {
        var row = document.createElement("div");
        row.className = "playlistItem qn-yt-plrow qn-yt-pllistrow";
        var ic = document.createElement("span");
        ic.className = "qn-yt-plicon";
        ic.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 6h12v2H4zm0 4h12v2H4zm0 4h8v2H4zm10 0v6l5-3z"/></svg>';
        row.appendChild(ic);
        var info = document.createElement("div");
        info.className = "playlist-info-block";
        var t = document.createElement("span");
        t.className = "playlist-title"; t.textContent = l.title;
        info.appendChild(t);
        row.appendChild(info);
        var c = document.createElement("span");
        c.className = "playlist-folder-count"; c.textContent = l.count >= 0 ? String(l.count) : "";
        row.appendChild(c);
        row.addEventListener("click", function () { runLoad(l.id, "", plState.token); });
        box.appendChild(row);
      });
      return;
    }
    vids.forEach(function (v) {
      var row = document.createElement("div");
      row.className = "playlistItem qn-yt-plrow";
      var inLib = findItemByVideoId(v.videoId);
      if (current && current.videoId === v.videoId) row.classList.add("playing");
      if (inLib) row.classList.add("in-lib");
      var chk = document.createElement("button");
      chk.type = "button"; chk.className = "qn-yt-plcheck" + (plState.sel[v.videoId] ? " on" : "");
      chk.title = inLib ? "Libraryに追加済み" : "選択";
      chk.disabled = !!inLib;
      chk.innerHTML = inLib ? "✓" : "";
      chk.addEventListener("click", function (e) {
        e.stopPropagation();
        if (plState.sel[v.videoId]) delete plState.sel[v.videoId]; else plState.sel[v.videoId] = true;
        chk.classList.toggle("on", !!plState.sel[v.videoId]);
        refs.plAdd.disabled = plSelCount() === 0;
      });
      row.appendChild(chk);
      var thumb = document.createElement("div");
      thumb.className = "playlist-thumb qn-yt-thumb";
      thumb.innerHTML = SVG_PLAY_ICON;
      var img = document.createElement("img");
      img.alt = ""; img.loading = "lazy"; img.referrerPolicy = "no-referrer";
      img.onload = function () { thumb.classList.add("has-img"); };
      img.onerror = function () { if (img.parentNode) img.parentNode.removeChild(img); };
      img.src = "https://i.ytimg.com/vi/" + v.videoId + "/mqdefault.jpg";
      thumb.appendChild(img);
      row.appendChild(thumb);
      var info = document.createElement("div");
      info.className = "playlist-info-block";
      var t = document.createElement("span");
      t.className = "playlist-title"; t.textContent = v.title;
      info.appendChild(t);
      row.appendChild(info);
      row.addEventListener("click", function () {
        var url = "https://youtu.be/" + v.videoId, it = findItemByVideoId(v.videoId);
        refs.urlInput.value = url;
        openVideo(v.videoId, url, it ? it.id : null, { play: true });
        renderPlaylistPanel();
        closePanelOnSp();
      });
      box.appendChild(row);
    });
  }
  function plAddSelected(fid) {
    var add = plState.videos.filter(function (v) { return plState.sel[v.videoId] && !findItemByVideoId(v.videoId); });
    if (!add.length) return;
    var now = Date.now();
    add.forEach(function (v, i) {
      var it = { id: uid("item"), type: "youtube", videoId: v.videoId, url: "https://youtu.be/" + v.videoId, markers: [], loopA: null, loopB: null, createdAt: now + i };
      if (fid) it.folder = fid;
      items.push(it);
      setCachedTitle(v.videoId, v.title);
    });
    saveItems();
    plState.sel = {};
    renderPlaylistPanel();
    renderList();
    plSay(add.length + "件をLibraryに追加しました", true);
  }

  // ---------- イベント ----------
  function bindEvents() {
    function saveFromInputs() {
      var url = refs.urlInput.value.trim();
      var id = parseVideoId(url);
      if (!url) { showMessage("YouTubeのURLを入力してください"); return; }
      if (!id) { showMessage("YouTubeのURLとして認識できません"); return; }
      // 入力欄=手入力タイトル(customTitle)。空欄ならYouTubeのタイトルを自動取得して表示(既に手入力があっても空欄Saveで自動に戻す)
      var title = refs.titleInput.value.trim().slice(0, 200);
      var item = findItemByVideoId(id);
      var isNew = !item;
      if (item) {
        if (title) item.customTitle = title; else delete item.customTitle;
        item.url = url;
      } else {
        item = {
          id: uid("item"), type: "youtube", videoId: id, url: url,
          markers: [], loopA: null, loopB: null,
          createdAt: Date.now()
        };
        if (title) item.customTitle = title;
        items.push(item);
      }
      saveItems();
      if (current && current.videoId === id) {
        current.itemId = item.id;
        current.url = url;
        if (isNew) item.markers = current.markers;
        renderList();
      } else {
        openVideo(id, url, item.id);
      }
      refs.urlInput.value = "";
      refs.titleInput.value = "";
      if (!title) {
        titleFailed[id] = false;
        fetchYtTitle(id, true).then(function (t) {
          if (t) scheduleListRefresh();
          else showMessage("タイトルを取得できませんでした(後で自動で再取得します)");
        });
      }
      showMessage(isNew ? "リストに追加しました" : (title ? "タイトルを更新しました" : "タイトルを自動取得します"), true);
      closePanelOnSp();
    }
    refs.saveBtn.addEventListener("click", saveFromInputs);
    // Playlists
    try { refs.plUrl.value = localStorage.getItem(PL_LAST_KEY) || ""; } catch (e) {}
    refs.plKeyBox.hidden = true;
    refs.plLoad.addEventListener("click", doLoadPlaylist);
    refs.plMine.addEventListener("click", doLoadMine);
    refs.plUrl.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); doLoadPlaylist(); } });
    refs.plKeyToggle.addEventListener("click", function () { refs.plKeyBox.hidden = !refs.plKeyBox.hidden; if (!refs.plKeyBox.hidden) refs.plKey.focus(); });
    function saveKey() {
      var k = refs.plKey.value.trim();
      if (!k) { try { localStorage.removeItem(PL_KEY_STORE); } catch (e) {} plSay("APIキーを削除しました", true); refs.plKeyBox.hidden = true; return; }
      if (!/^[A-Za-z0-9_-]{20,80}$/.test(k)) { plSay("APIキーの形式が正しくありません"); return; }
      try { localStorage.setItem(PL_KEY_STORE, k); } catch (e) { plSay("保存に失敗しました"); return; }
      refs.plKey.value = ""; refs.plKeyBox.hidden = true;
      plSay("APIキーを保存しました", true);
    }
    refs.plKeySave.addEventListener("click", saveKey);
    refs.plKey.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); saveKey(); } });
    refs.plAll.addEventListener("click", function () {
      var free = plState.videos.filter(function (v) { return !findItemByVideoId(v.videoId); });
      var all = free.length && free.every(function (v) { return plState.sel[v.videoId]; });
      plState.sel = {};
      if (!all) free.forEach(function (v) { plState.sel[v.videoId] = true; });
      renderPlaylistPanel();
    });
    refs.plAdd.addEventListener("click", function () {
      if (!plSelCount()) return;
      if (!ytFolders.list.length) { plAddSelected(null); return; }
      showMovePicker(refs.plAdd, function (fid) {
        if (fid === "__new__") fid = createFolder("").id;
        plAddSelected(fid);
      });
    });
    // URL欄をユーザーが編集したらタイトル欄を空にする(別動画のタイトルが残らないように)。プログラムからのvalue代入ではinputは発火しない
    refs.urlInput.addEventListener("input", function () {
      refs.titleInput.value = "";
      var libSec = refs.emptyHint.closest(".qn-yt-sec-library");
      if (libSec) libSec.classList.toggle("has-url", !!refs.urlInput.value.trim());
    });
    refs.urlInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); refs.titleInput.focus(); }
    });
    refs.titleInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); saveFromInputs(); }
    });

    function addMarkerHere() {
      if (!current || !playerReady) { showMessage("先に動画を読み込んでください"); return; }
      var t = Math.round(clampTime(currentPos()) * 10) / 10;
      current.markers.push({ id: uid("m"), time: t, label: "" });
      sortMarkers();
      persistMarkers();
      renderMarkers();
    }
    refs.addMarkerBtn.addEventListener("click", addMarkerHere);
    refs.stageAddMarker.addEventListener("click", addMarkerHere);
    refs.fabAdd.addEventListener("click", function () {
      if (!current || !playerReady) { if (window.QNApps) window.QNApps.toast("先に動画を読み込んでください"); return; }
      addMarkerHere();
    });
    refs.chapToggle.addEventListener("click", function () {
      refs.chapBox.hidden = !refs.chapBox.hidden;
      if (!refs.chapBox.hidden) refs.chapText.focus();
    });
    refs.chapClose.addEventListener("click", function () { refs.chapBox.hidden = true; });
    refs.chapAdd.addEventListener("click", addChapters);
    refs.fabEdit.addEventListener("click", toggleEdit);
    refs.sheetClose.addEventListener("click", function () { setPanel("none"); });
    // SP: 行の横スワイプで編集/SKIP(HIDE)/削除のボタン(EDIT中は無効)
    if (window.QNApps && window.QNApps.swipeRows) {
      window.QNApps.swipeRows(refs.itemList, {
        rowSel: ".playlistItem[data-id]",
        disabled: function () { return !!editMode; },
        actions: function (row) {
          var it = findItem(row.dataset.id);
          if (!it) return [];
          return [
            { kind: "edit", run: function () { var b = row.querySelector(".playlist-hover-edit-btn"); if (b) b.click(); } },
            { kind: "skip", on: !!it.skip, run: function () { if (it.skip) delete it.skip; else it.skip = true; saveItems(); renderList(); } },
            { kind: "del", run: function () {
              removeCachedTitles([it.videoId]);
              items = items.filter(function (x) { return x !== it; });
              if (current && current.itemId === it.id) current.itemId = null;
              saveItems(); renderList(); renderMarkers();
            } }
          ];
        }
      });
      window.QNApps.swipeRows(refs.markerList, {
        rowSel: ".pinItem[data-id]",
        disabled: function () { return !!editMode; },
        actions: function (row) {
          var m = current ? findMarker(row.dataset.id) : null;
          if (!m) return [];
          return [
            { kind: "edit", run: function () { var b = row.querySelector(".pin-edit-btn"); if (b) b.click(); } },
            { kind: "hide", on: m.enabled === false, run: function () { if (m.enabled === false) delete m.enabled; else m.enabled = false; persistMarkers(); renderMarkers(); } },
            { kind: "del", run: function () {
              current.markers = current.markers.filter(function (x) { return x.id !== m.id; });
              var it = current.itemId ? findItem(current.itemId) : null;
              if (it) it.markers = current.markers;
              persistMarkers(); persistLoop(); renderMarkers();
            } }
          ];
        }
      });
    }
    if (window.QNApps && window.QNApps.sheetDrag) window.QNApps.sheetDrag(root.querySelector(".qn-yt-panel"), root.querySelector(".qn-yt-panel-header"), function () { setPanel("none"); });
    refs.fabFolder.addEventListener("click", addFolderInteractive);
    refs.fabMove.addEventListener("click", function () { moveSelectedToFolder(refs.fabMove); });
    refs.fabDel.addEventListener("click", deleteSelected);

    refs.skipBackBtn.addEventListener("click", function () {
      if (!current || !playerReady) return;
      seekTo(currentPos() - skipSec);
    });
    refs.skipFwdBtn.addEventListener("click", function () {
      if (!current || !playerReady) return;
      seekTo(currentPos() + skipSec);
    });
    applySkipLabels();

    function setFromBar(kind) {
      if (!current || !playerReady) { showMessage("先に動画を読み込んでください"); return; }
      setLoopPointAt(kind, clampTime(currentPos()));
    }
    refs.setABtn.addEventListener("click", function () { setFromBar("A"); });
    refs.setBBtn.addEventListener("click", function () { setFromBar("B"); });

    refs.loopToggleBtn.addEventListener("click", function () {
      if (!current || !duration) return;
      var m = current.loopMode || "off", next;
      if (m === "off") next = loopRangeTimes() ? "ab" : "sec";
      else if (m === "ab") next = "sec";
      else next = "off";
      if (next === "sec") {
        var r = sectionRangeAt(currentPos());
        if (!r) { next = "off"; ytToast("区間を決められません"); }
        else { current.secRange = r; }
      }
      setLoopMode(next);
      ytToast(next === "ab" ? "Loop: A-B" : next === "sec" ? "Loop: Section " + fmt(current.secRange.start) + " - " + fmt(current.secRange.end) : "Loop: OFF");
      updateLoopUI();
    });
    refs.playBtn.addEventListener("click", togglePlay);
    refs.prevVideoBtn.addEventListener("click", function () { gotoNeighbor(-1); });
    refs.nextVideoBtn.addEventListener("click", function () { gotoNeighbor(1); });
    updatePlayBtn(false);
    refs.prevMarkerBtn.addEventListener("click", function () { jumpMarker(-1); });
    refs.nextMarkerBtn.addEventListener("click", function () { jumpMarker(1); });
    syncAutoNextBtn();
    refs.autoNext.addEventListener("click", function () { setAutoNext(!autoNext); });
    refs.speedDown.addEventListener("click", function () { stepRate(-1, true); });
    var spMid = refs.speedVal && refs.speedVal.closest(".qn-yt-bstep-mid");
    if (spMid) {
      spMid.style.cursor = "pointer";
      spMid.title = "クリックで 1x に戻す";
      spMid.addEventListener("click", function () { resetRate(); });
    }
    refs.speedUp.addEventListener("click", function () { stepRate(1, true); });
    renderSpeed();

    refs.loopClearBtn.addEventListener("click", function () {
      if (!current) return;
      current.loopA = null; current.loopB = null; if (current.loopMode === "ab") setLoopMode("off");
      persistLoop();
      renderMarkers();
    });
  }

  // ---------- 前/次のマーカーへ移動（現在地を基準） ----------
  function jumpMarker(dir) {
    if (!current || !playerReady) { showMessage("先に動画を読み込んでください"); return; }
    var times = enabledTimes();
    if (!times.length) { showMessage("マーカーがありません"); return; }
    var t = currentPos(), idx = -1;
    if (current.loopMode === "sec" && current.secRange) idx = times.indexOf(current.secRange.start);
    var ref = QNMarkerCore.navRefTime(times, idx, t, preRoll, current.loopMode === "sec");
    var target = dir > 0 ? QNMarkerCore.nextTime(times, ref) : QNMarkerCore.prevTime(times, ref);
    showMessage("");
    userSeek(target);
  }

  // ---------- 再生スピード（プレイヤーの外の自前UI・公式メソッドのみ） ----------
  var desiredRate = loadRate();
  function loadRate() {
    try { var r = parseFloat(localStorage.getItem(RATE_KEY)); return r > 0 ? r : 1; } catch (e) { return 1; }
  }
  function availableRates() {
    try {
      if (player && playerReady && typeof player.getAvailablePlaybackRates === "function") {
        var a = player.getAvailablePlaybackRates();
        if (a && a.length) return a;
      }
    } catch (e) {}
    return FALLBACK_RATES;
  }
  function applyDesiredRate() {
    try {
      if (player && playerReady && typeof player.setPlaybackRate === "function" &&
          player.getPlaybackRate() !== desiredRate) {
        player.setPlaybackRate(desiredRate);
      }
    } catch (e) {}
  }
  function renderSpeed() {
    if (!root || !refs.speedVal) return;
    var actual = desiredRate;
    try { if (player && playerReady && player.getPlaybackRate) actual = player.getPlaybackRate(); } catch (e) {}
    refs.speedVal.textContent = actual + "x";
  }

  // Auto Next(規約): 自動再生は「プレイヤーが画面に見えていて半分超が見えている」時だけ。画面外・別タブ・アプリ非表示では行わない。初期OFF、ONにした時だけ動く
  var autoNext = (function () {
    try { return localStorage.getItem(FLAG_KEY) === "1"; } catch (e) { return false; }
  })();

  function setAutoNext(on) {
    autoNext = !!on;
    try { localStorage.setItem(FLAG_KEY, autoNext ? "1" : "0"); } catch (e) {}
    syncAutoNextBtn();
  }
  function syncAutoNextBtn() {
    if (!refs.autoNext) return;
    refs.autoNext.classList.toggle("is-active", !!autoNext);
    refs.autoNext.setAttribute("aria-pressed", String(!!autoNext));
  }

  function playerMostlyVisible() {
    if (document.visibilityState !== "visible") return false;
    if (!root || root.hidden) return false;
    var wrap = root.querySelector(".qn-yt-player-wrap");
    var host = document.getElementById("qnAppHost");
    if (!wrap || !host || host.hidden) return false;
    var r = wrap.getBoundingClientRect(), h = host.getBoundingClientRect();
    var w = Math.min(r.right, h.right) - Math.max(r.left, h.left);
    var ht = Math.min(r.bottom, h.bottom) - Math.max(r.top, h.top);
    if (w <= 0 || ht <= 0) return false;
    return (w * ht) / (r.width * r.height) > 0.5;
  }

  function handleEnded() {
    if (!autoNext || !current || !current.itemId) return;
    var idx = -1, ord = orderedItems();
    for (var i = 0; i < ord.length; i++) if (ord[i].id === current.itemId) idx = i;
    if (idx < 0) return;
    var next = null;
    for (var j = idx + 1; j < ord.length; j++) if (!ord[j].skip) { next = ord[j]; break; }
    if (!next) { showMessage("Libraryの最後の動画でした"); return; }
    if (!playerMostlyVisible()) return;
    refs.urlInput.value = next.url;
    openVideo(next.videoId, next.url, next.id, { play: true });
  }

  // ---------- 保存リスト。並べ替え: つかみをドラッグ。ドラッグ中はtransformのみ(ポインターキャプチャ維持)、離した時に配列を並べ替え ----------
  function attachReorder(grip, li) {
    var startY = 0, targetId = null, before = true;
    function clearMarks() {
      var m = refs.itemList.querySelectorAll(".drop-before,.drop-after");
      for (var i = 0; i < m.length; i++) m[i].classList.remove("drop-before", "drop-after");
    }
    grip.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      grip.setPointerCapture(e.pointerId);
      startY = e.clientY; targetId = null;
      li.classList.add("dragging");
    });
    grip.addEventListener("pointermove", function (e) {
      if (!grip.hasPointerCapture(e.pointerId)) return;
      li.style.transform = "translateY(" + (e.clientY - startY) + "px)";
      clearMarks();
      targetId = null;
      var rows = refs.itemList.children;
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (r === li) continue;
        var b = r.getBoundingClientRect();
        if (e.clientY >= b.top && e.clientY <= b.bottom) {
          if (r.classList.contains("playlistFolderHeader")) { targetId = "folder:" + r.dataset.folderId; before = false; r.classList.add("drop-after"); break; }
          targetId = r.dataset.id;
          before = e.clientY < b.top + b.height / 2;
          r.classList.add(before ? "drop-before" : "drop-after");
          break;
        }
      }
    });
    function finish(e, commit) {
      if (!grip.hasPointerCapture(e.pointerId)) return;
      grip.releasePointerCapture(e.pointerId);
      li.classList.remove("dragging"); li.style.transform = "";
      clearMarks();
      if (commit && targetId && targetId !== li.dataset.id) {
        var moving = findItem(li.dataset.id);
        items = items.filter(function (x) { return x !== moving; });
        if (targetId.indexOf("folder:") === 0) {
          // 見出しにドロップ=そのフォルダの先頭へ(空なら末尾)
          var fid = targetId.slice(7) || null, firstAt = -1;
          for (var k = 0; k < items.length; k++) if (folderIdOf(items[k]) === fid) { firstAt = k; break; }
          if (fid) moving.folder = fid; else delete moving.folder;
          items.splice(firstAt < 0 ? items.length : firstAt, 0, moving);
        } else {
          var pos = 0, tgt = null;
          for (var i = 0; i < items.length; i++) if (items[i].id === targetId) { pos = i; tgt = items[i]; }
          var tf = folderIdOf(tgt);
          if (tf) moving.folder = tf; else delete moving.folder;
          items.splice(before ? pos : pos + 1, 0, moving);
        }
        saveItems();
      }
      renderList();
    }
    grip.addEventListener("pointerup", function (e) { finish(e, true); });
    grip.addEventListener("pointercancel", function (e) { finish(e, false); });
  }

  // ---------- EDITモード: 右下EDIT→OK。PLAY/SKIPトグル+削除丸チェック、右下Deleteで一括削除 ----------
  var editMode = null;
  var selected = {};

  function selectedCount() {
    var n = 0;
    for (var k in selected) if (selected[k]) n++;
    return n;
  }
  function updateFab() {
    if (!root) return;
    var yt = root.querySelector(".qn-yt");
    if (editMode) yt.setAttribute("data-edit", editMode); else yt.removeAttribute("data-edit");
    refs.fabEdit.classList.toggle("active", !!editMode);
    refs.fabEditLabel.textContent = editMode ? "OK" : "EDIT";
    refs.fabDel.disabled = selectedCount() === 0;
    refs.fabMove.disabled = selectedCount() === 0;
  }
  function setEditMode(mode) {
    editMode = mode;
    selected = {};
    updateFab();
    renderList();
    renderMarkers();
  }
  function toggleEdit() {
    if (panelState !== "library" && panelState !== "markers") return;
    setEditMode(editMode === panelState ? null : panelState);
  }
  function toggleSelect(id, delBtn, container, toggleSel) {
    if (selected[id]) { delete selected[id]; delBtn.classList.remove("pcv2-selected"); }
    else { selected[id] = true; delBtn.classList.add("pcv2-selected"); }
    updateFab();
    var has = selectedCount() > 0;
    var ts = container.querySelectorAll(toggleSel);
    for (var i = 0; i < ts.length; i++) ts[i].disabled = has;
  }
  function deleteSelected() {
    var mode = editMode;
    if (!mode || !selectedCount()) return;
    refs.fabDel.disabled = true;
    var box = mode === "library" ? refs.itemList : refs.markerList;
    var rows = box.children, delay = 0;
    for (var i = 0; i < rows.length; i++) {
      if (selected[rows[i].dataset.id]) { rows[i].classList.add("pcv2-row-deleting"); delay = 260; }
    }
    box.style.pointerEvents = "none";
    setTimeout(function () {
      box.style.pointerEvents = "";
      if (mode === "library") {
        removeCachedTitles(items.filter(function (x) { return selected[x.id]; }).map(function (x) { return x.videoId; }));
        items = items.filter(function (x) { return !selected[x.id]; });
        if (current && current.itemId && selected[current.itemId]) current.itemId = null;
        saveItems();
      } else if (current) {
        current.markers = current.markers.filter(function (x) { return !selected[x.id]; });
        var it = current.itemId ? findItem(current.itemId) : null;
        if (it) it.markers = current.markers;
        persistMarkers(); persistLoop();
      }
      selected = {};
      updateFab();
      renderList();
      renderMarkers();
    }, delay);
  }

  function playItem(it) {
    refs.urlInput.value = it.url;
    openVideo(it.videoId, it.url, it.id, { play: true });
    closePanelOnSp();
  }

  var SVG_PLAY_ICON = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  var SVG_PENCIL = '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';

  function renderList() {
    if (!root) return;
    refs.itemList.textContent = "";
    refs.emptyList.style.display = items.length ? "none" : "";
    // 0件の間はURL入力→Saveの手順を目立たせる(.is-empty)。URL入力済みなら手順2を強調(.has-url)
    var libSec = refs.emptyHint.closest(".qn-yt-sec-library");
    if (libSec) {
      libSec.classList.toggle("is-empty", !items.length);
      libSec.classList.toggle("has-url", !!refs.urlInput.value.trim());
    }
    refs.listCount.textContent = String(items.length);
    updatePanelTitle();
    var edit = editMode === "library";
    for (var k in selected) if (!findItem(k) && !(current && findMarker(k))) delete selected[k];
    var box = refs.itemList;

    function addRow(it) {
      var row = document.createElement("div");
      row.className = "playlistItem";
      row.dataset.id = it.id;
      if (current && current.itemId === it.id) row.classList.add("playing");
      if (it.skip) row.classList.add("disabled");

      if (!edit) {
        row.addEventListener("click", function (e) {
          if (e.target.closest("button, input, .playlist-drag-handle, .playlist-info-block")) return;
          playItem(it);
        });
      }

      var grip = document.createElement("span");
      grip.className = "playlist-drag-handle"; grip.title = "ドラッグで並べ替え"; grip.innerHTML = SVG_GRIP;
      attachReorder(grip, row);
      row.appendChild(grip);

      // サムネは表示のみ(YouTube画像URLを<img>で直接参照)。保存/キャッシュ/切り抜き/加工しない(規約)。読めない時は再生アイコン
      var thumb = document.createElement("div");
      thumb.className = "playlist-thumb qn-yt-thumb";
      thumb.innerHTML = SVG_PLAY_ICON;
      if (/^[A-Za-z0-9_-]{11}$/.test(it.videoId)) {
        var img = document.createElement("img");
        img.alt = "";
        img.loading = "lazy";
        img.referrerPolicy = "no-referrer";
        img.onload = function () { thumb.classList.add("has-img"); };
        img.onerror = function () { if (img.parentNode) img.parentNode.removeChild(img); };
        img.src = "https://i.ytimg.com/vi/" + it.videoId + "/mqdefault.jpg";
        thumb.appendChild(img);
      }
      row.appendChild(thumb);

      var info = document.createElement("div");
      info.className = "playlist-info-block";
      info.addEventListener("click", function (e) {
        if (e.target.closest(".playlist-editable-input, .playlist-hover-edit-btn")) return;
        playItem(it);
      });
      var titleRow = document.createElement("div");
      titleRow.className = "playlist-title-row";
      var titleField = makeEditableText(displayTitle(it), "playlist-title", "", function (v) {
        // 空欄で確定=手入力を消してYouTubeのタイトル自動取得に戻す
        if (v) it.customTitle = v.slice(0, 200); else delete it.customTitle;
        if (current && current.itemId === it.id) refs.titleInput.value = it.customTitle || "";
        saveItems();
        updatePanelTitle();
        if (!v) {
          titleFailed[it.videoId] = false;
          fetchYtTitle(it.videoId, true).then(function (t) { if (t) scheduleListRefresh(); });
          if (!edit) renderList();
          else {
            var disp = titleField.querySelector(".playlist-editable-display");
            if (disp) disp.textContent = displayTitle(it);
          }
        }
      });
      titleRow.appendChild(titleField);
      if (!edit) {
        var pen = document.createElement("button");
        pen.type = "button"; pen.className = "playlist-hover-edit-btn"; pen.title = "Edit title";
        pen.innerHTML = SVG_PENCIL;
        pen.addEventListener("click", function (e) { e.stopPropagation(); titleField.startEdit(); });
        titleRow.appendChild(pen);
      }
      info.appendChild(titleRow);
      row.appendChild(info);

      if (edit) {
        var hasSel = selectedCount() > 0;
        var skip = document.createElement("button");
        skip.type = "button";
        skip.className = "playlist-skip-toggle" + (it.skip ? "" : " skip-off");
        skip.disabled = hasSel;
        skip.title = it.skip ? "Skipped during Auto Next (click to include)" : "Included in Auto Next (click to skip)";
        skip.innerHTML = '<span class="playlist-skip-toggle-label">' + (it.skip ? "SKIP" : "PLAY") + '</span>';
        skip.addEventListener("click", function (e) {
          e.stopPropagation();
          if (selectedCount() > 0) return;
          it.skip = !it.skip;
          if (!it.skip) delete it.skip;
          saveItems(); renderList();
        });
        row.appendChild(skip);

        var zone = document.createElement("div");
        zone.className = "playlist-del-zone";
        var del = document.createElement("button");
        del.type = "button"; del.className = "del-btn"; del.tabIndex = -1; del.textContent = "✕";
        if (selected[it.id]) del.classList.add("pcv2-selected");
        zone.appendChild(del);
        zone.addEventListener("click", function (e) {
          e.stopPropagation();
          toggleSelect(it.id, del, box, ".playlist-skip-toggle");
        });
        row.appendChild(zone);
      }
      if (edit) titleField.startEdit();
      box.appendChild(row);
    }

    // フォルダが無ければ従来どおり。有れば「見出し→その動画」をフォルダ順に、未分類は末尾。EDIT中は全フォルダ展開(移動/削除の対象を隠さない)
    if (!ytFolders.list.length) { items.forEach(addRow); return; }
    var buckets = {}, loose = [];
    ytFolders.list.forEach(function (f) { buckets[f.id] = []; });
    items.forEach(function (it) { var fid = folderIdOf(it); if (fid) buckets[fid].push(it); else loose.push(it); });
    ytFolders.list.forEach(function (f, fi) {
      box.appendChild(buildFolderHead(f, buckets[f.id].length, fi, edit));
      if (!collapsedMap[f.id] || edit) buckets[f.id].forEach(addRow);
    });
    if (loose.length) {
      box.appendChild(buildFolderHead(null, loose.length, -1, edit));
      loose.forEach(addRow);
    }
  }

  // フォルダ見出し(folder=nullは未分類)。通常: クリックで開閉+ホバー鉛筆で改名。EDIT: 名前は常時入力、▲▼で順序、✕で削除(2タップ確認。中の動画は未分類へ)
  function buildFolderHead(folder, count, fi, edit) {
    var head = document.createElement("div");
    head.className = "playlistFolderHeader";
    if (!folder) head.classList.add("is-loose");
    if (folder && collapsedMap[folder.id] && !edit) head.classList.add("is-collapsed");
    head.dataset.folderId = folder ? folder.id : "";
    var chev = document.createElement("span");
    chev.className = "playlist-folder-chev";
    chev.innerHTML = folder ? '<svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M3 5h18v2H3zm0 6h18v2H3zm0 6h18v2H3z"/></svg>';
    head.appendChild(chev);
    var nameWrap = document.createElement("div");
    nameWrap.className = "playlist-folder-name-wrap";
    if (folder) {
      var nameField = makeEditableText(folder.name, "playlist-folder-name", "", function (v) {
        if (v && v !== folder.name) { folder.name = v.slice(0, 100); saveItems(); }
        renderList();
      });
      nameWrap.appendChild(nameField);
      if (edit) nameField.startEdit();
      else {
        var pen = document.createElement("button");
        pen.type = "button"; pen.className = "playlist-hover-edit-btn"; pen.title = "フォルダ名を変更";
        pen.innerHTML = SVG_PENCIL;
        pen.addEventListener("click", function (e) { e.stopPropagation(); nameField.startEdit(); });
        nameWrap.appendChild(pen);
      }
    } else {
      var label = document.createElement("span");
      label.className = "playlist-folder-name";
      label.textContent = "未分類";
      nameWrap.appendChild(label);
    }
    head.appendChild(nameWrap);
    var cnt = document.createElement("span");
    cnt.className = "playlist-folder-count";
    cnt.textContent = String(count);
    head.appendChild(cnt);
    if (folder && edit) {
      var mk = function (cls, title, html, onClick, disabled) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "playlist-folder-btn " + cls; b.title = title; b.innerHTML = html; b.disabled = !!disabled;
        b.addEventListener("click", function (e) { e.stopPropagation(); onClick(b); });
        return b;
      };
      head.appendChild(mk("is-up", "上へ", '<svg viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/></svg>', function () { moveFolder(folder.id, -1); renderList(); }, fi === 0));
      head.appendChild(mk("is-down", "下へ", '<svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>', function () { moveFolder(folder.id, 1); renderList(); }, fi === ytFolders.list.length - 1));
      head.appendChild(mk("is-del", "フォルダを削除（中の動画は未分類へ戻ります）", "✕", function (b) {
        if (b.classList.contains("confirm")) { selected = {}; deleteFolder(folder.id); updateFab(); renderList(); }
        else {
          b.classList.add("confirm"); b.textContent = "✓";
          clearTimeout(b._confirmTimer);
          b._confirmTimer = setTimeout(function () { b.classList.remove("confirm"); b.textContent = "✕"; }, 3000);
        }
      }));
    }
    if (folder && !edit) {
      head.addEventListener("click", function (e) {
        if (e.target.closest("button, input")) return;
        if (collapsedMap[folder.id]) delete collapsedMap[folder.id]; else collapsedMap[folder.id] = true;
        saveCollapsed();
        renderList();
      });
    }
    return head;
  }

  // FOLDERボタン: 作成直後は名前入力状態
  function addFolderInteractive() {
    var f = createFolder("");
    renderList();
    var field = refs.itemList.querySelector('.playlistFolderHeader[data-folder-id="' + f.id + '"] .playlist-editable-field');
    if (field && typeof field.startEdit === "function") field.startEdit();
  }

  // 移動先ピッカー(MOVEボタンから)。onPick(folderId|null)
  function closeMovePicker() {
    var m = document.getElementById("qnYtFolderPicker");
    if (m && m.parentNode) m.parentNode.removeChild(m);
    document.removeEventListener("pointerdown", movePickerOutside, true);
    document.removeEventListener("keydown", movePickerKey, true);
  }
  function movePickerOutside(e) { var m = document.getElementById("qnYtFolderPicker"); if (m && !m.contains(e.target)) closeMovePicker(); }
  function movePickerKey(e) { if (e.key === "Escape") { e.stopPropagation(); closeMovePicker(); } }
  function showMovePicker(anchor, onPick) {
    closeMovePicker();
    var menu = document.createElement("div");
    menu.className = "playlist-folder-picker";
    menu.id = "qnYtFolderPicker";
    function add(label, fid, cls) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "playlist-folder-picker-item" + (cls ? " " + cls : ""); b.textContent = label;
      b.addEventListener("click", function (e) { e.stopPropagation(); closeMovePicker(); onPick(fid); });
      menu.appendChild(b);
    }
    ytFolders.list.forEach(function (f) { add(f.name, f.id); });
    add("未分類", null, "is-loose");
    add("＋ 新しいフォルダへ", "__new__", "is-new");
    document.body.appendChild(menu);
    var r = anchor.getBoundingClientRect(), mh = menu.offsetHeight, mw = menu.offsetWidth;
    menu.style.left = Math.max(8, Math.min(window.innerWidth - mw - 8, r.right - mw)) + "px";
    menu.style.top = (r.top - mh - 8 >= 8 ? r.top - mh - 8 : Math.min(window.innerHeight - mh - 8, r.bottom + 8)) + "px";
    setTimeout(function () { document.addEventListener("pointerdown", movePickerOutside, true); }, 0);
    document.addEventListener("keydown", movePickerKey, true);
  }
  function moveSelectedToFolder(btn) {
    if (!selectedCount()) return;
    showMovePicker(btn, function (fid) {
      if (fid === "__new__") fid = createFolder("").id;
      moveItemsToFolder(selected, fid);
      selected = {};
      updateFab();
      renderList();
    });
  }

  // ---------- マーカー ----------
  function persistMarkers() {
    if (current && current.itemId) saveItems();
  }
  function abTimeOf(v, markers) {
    if (typeof v === "number" && isFinite(v) && v >= 0) return v;
    if (typeof v === "string" && markers) {
      for (var i = 0; i < markers.length; i++) if (markers[i].id === v) return markers[i].time;
    }
    return null;
  }
  function persistLoop() {
    if (!current) return;
    var item = current.itemId ? findItem(current.itemId) : null;
    if (item) { item.loopA = current.loopA; item.loopB = current.loopB; saveItems(); }
  }
  function sortMarkers() {
    current.markers.sort(function (a, b) { return a.time - b.time; });
  }
  function clampTime(t) {
    if (t < 0) t = 0;
    if (duration && t > duration) t = duration;
    return t;
  }
  function currentPos() {
    return player && playerReady && player.getCurrentTime ? player.getCurrentTime() : 0;
  }
  function userSeek(t) {
    if (current && current.loopMode === "ab" && QNMarkerCore.isOutsideAB(current.loopA, current.loopB, t)) {
      setLoopMode("off"); persistLoop(); updateLoopUI();
    }
    seekTo(t);
    try { if (player && playerReady && player.playVideo) player.playVideo(); } catch (e) {}
  }
  function seekTo(t) {
    if (!player || !playerReady) return;
    player.seekTo(clampTime(t), true);
    updateDisplay(clampTime(t));
  }

  function markerColorHex(m) {
    return m.color && typeof MARKER_COLOR_PALETTE !== "undefined" && MARKER_COLOR_PALETTE[m.color] ? MARKER_COLOR_PALETTE[m.color] : null;
  }
  function markerText(m, i) {
    return (i + 1) + " - " + (m.label ? m.label : fmt(m.time));
  }

  function startMemoEdit(m, infoSpan, i) {
    if (infoSpan.parentNode.querySelector(".pin-memo-input")) return;
    var input = document.createElement("input");
    input.type = "text"; input.className = "pin-memo-input";
    input.value = m.label || ""; input.placeholder = fmt(m.time); input.maxLength = 60;
    infoSpan.style.display = "none";
    infoSpan.parentNode.insertBefore(input, infoSpan);
    input.focus(); input.select();

    var popup = document.createElement("div");
    popup.className = "pin-memo-preset-popup";
    var hasPresets = typeof getAllMarkerPresetLabels === "function" && typeof getMarkerPresetColors === "function";
    var presetColors = hasPresets ? getMarkerPresetColors() : {};
    var pointerActive = false, finished = false;

    function closePop() { if (typeof closePinMemoPresetPopup === "function") closePinMemoPresetPopup(); }
    function commit() {
      if (finished) return; finished = true; closePop();
      m.label = input.value.trim();
      persistMarkers(); renderMarkers();
    }
    function cancel() { if (finished) return; finished = true; closePop(); renderMarkers(); }
    function applyPreset(label) {
      if (finished) return; finished = true; closePop();
      m.label = label;
      var c = presetColors[label];
      if (c && MARKER_COLOR_PALETTE[c]) m.color = c;
      persistMarkers(); renderMarkers();
    }

    if (hasPresets) {
      getAllMarkerPresetLabels().forEach(function (label) {
        var chip = document.createElement("button");
        chip.type = "button"; chip.className = "pin-memo-preset-chip";
        var c = presetColors[label];
        if (c && MARKER_COLOR_PALETTE[c]) {
          var dot = document.createElement("span");
          dot.className = "pin-memo-preset-dot"; dot.style.background = MARKER_COLOR_PALETTE[c];
          chip.appendChild(dot);
        }
        chip.appendChild(document.createTextNode(label));
        chip.addEventListener("pointerdown", function (e) {
          e.preventDefault(); pointerActive = true;
          window.addEventListener("pointerup", function () {
            setTimeout(function () {
              if (!pointerActive) return;
              pointerActive = false;
              if (!finished && document.activeElement !== input) commit();
            }, 80);
          }, { once: true });
        });
        chip.addEventListener("click", function (e) { e.stopPropagation(); pointerActive = false; applyPreset(label); });
        popup.appendChild(chip);
      });
      popup.addEventListener("click", function (e) { e.stopPropagation(); });

      var reposition = function () {
        if (!input.isConnected) { closePop(); return; }
        qnPlacePresetPopup(input, popup);
      };
      closePop();
      document.body.appendChild(popup);
      window.activePinMemoPresetPopup = { popup: popup, reposition: reposition };
      reposition();
      window.addEventListener("scroll", reposition, true);
      window.addEventListener("resize", reposition);
      if (window.visualViewport) { window.visualViewport.addEventListener("resize", reposition); window.visualViewport.addEventListener("scroll", reposition); }
    }

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); commit(); }
      else if (e.key === "Escape") { e.preventDefault(); cancel(); }
    });
    input.addEventListener("blur", function () {
      setTimeout(function () { if (!pointerActive) commit(); }, 0);
    });
    input.addEventListener("click", function (e) { e.stopPropagation(); });
  }

  var SVG_EYE_ON = '<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>';
  var SVG_EYE_OFF = '<svg viewBox="0 0 24 24"><path d="M12 6.5c3.79 0 7.17 2.13 8.82 5.5-.59 1.2-1.42 2.25-2.42 3.11l1.42 1.42c1.39-1.23 2.49-2.77 3.18-4.53C21.27 7.61 17 4.5 12 4.5c-1.27 0-2.49.2-3.64.57l1.65 1.65c.62-.14 1.28-.22 1.99-.22zM2.71 3.16L1.29 4.57 4 7.27C2.36 8.53 1.07 10.15 0.18 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l3.01 3.01 1.41-1.41L2.71 3.16zM12 17c-2.76 0-5-2.24-5-5 0-.77.18-1.5.49-2.14l1.57 1.57c-.03.18-.06.37-.06.57 0 1.66 1.34 3 3 3 .2 0 .38-.03.57-.07l1.57 1.57c-.65.32-1.37.5-2.14.5zm2.97-5.33c-.15-1.4-1.25-2.49-2.64-2.64l2.64 2.64z"/></svg>';

  function paintMarkerRanges(ms) {
    var old = refs.seekTracks.querySelectorAll(".qn-yt-range");
    setTimeout(function () { paintPlayed(lastT); }, 0);
    for (var k = 0; k < old.length; k++) old[k].parentNode.removeChild(old[k]);
    if (!duration) return;
    var vis = ms.filter(function (m) { return m.enabled !== false; });
    var len = duration / SEGS;
    vis.forEach(function (m, idx) {
      var hex = markerColorHex(m);
      if (!hex) return;
      var start = m.time, end = idx + 1 < vis.length ? vis[idx + 1].time : duration;
      if (!(end > start)) return;
      for (var i = segIndex(start); i < SEGS; i++) {
        var a = Math.max(start, i * len), z = Math.min(end, (i + 1) * len);
        if (z <= a) { if (i * len >= end) break; continue; }
        var band = document.createElement("div");
        band.className = "qn-yt-range";
        band.style.left = ((a - i * len) / len * 100) + "%";
        band.style.width = ((z - a) / len * 100) + "%";
        var bg = document.createElement("div"); bg.className = "qn-yt-range-bg"; bg.style.background = hex;
        var on = document.createElement("div"); on.className = "qn-yt-range-on"; on.style.background = hex;
        band.appendChild(bg); band.appendChild(on);
        band._a = a; band._z = z;
        tracks[i].insertBefore(band, loopRanges[i]);
      }
    });
  }

  var lastT = 0;
  function paintPlayed(t) {
    lastT = t;
    if (!root) return;
    var bands = refs.seekTracks.querySelectorAll(".qn-yt-range");
    for (var k = 0; k < bands.length; k++) {
      var b = bands[k], r = (t - b._a) / (b._z - b._a);
      b.lastChild.style.width = (Math.max(0, Math.min(1, r)) * 100) + "%";
    }
  }

  function renderMarkers() {
    if (!root) return;
    if (typeof closePinMemoPresetPopup === "function") closePinMemoPresetPopup();
    refs.markerLayer.textContent = "";
    refs.markerList.textContent = "";
    var ms = current ? current.markers : [];
    refs.emptyMarkers.style.display = ms.length ? "none" : "";
    refs.markerCount.textContent = String(ms.length);
    updatePanelTitle();
    var edit = editMode === "markers";
    var box = refs.markerList;
    paintMarkerRanges(ms);

    ms.forEach(function (m, i) {
      var hex = markerColorHex(m);
      var el = document.createElement("div");
      if (m.enabled !== false) {
        el.className = "qn-yt-marker";
        el.dataset.mid = m.id;
        el.title = fmt(m.time) + " " + (m.label || "");
        if (hex) el.style.setProperty("--marker-color", hex);
        fillMarkerLabel(el, m, i);
        positionMarker(el, m.time);
        attachMarkerDrag(el, m);
        refs.markerLayer.appendChild(el);
      }

      var row = document.createElement("div");
      row.className = "pinItem" + (m.enabled === false ? " disabled" : "");
      row.dataset.id = m.id;

      var lead = document.createElement("div");
      lead.className = "pin-leading-cell";
      var cm = document.createElement("button");
      cm.type = "button"; cm.className = "pin-color-mark"; cm.title = "Set marker color";
      cm.style.background = hex || "#3a3a48";
      cm.addEventListener("click", function (e) {
        e.stopPropagation();
        if (typeof openColorChoicePopup !== "function") return;
        openColorChoicePopup(cm, m.color || null, function (name) {
          if (name) m.color = name; else delete m.color;
          persistMarkers(); renderMarkers();
        });
      });
      lead.appendChild(cm);
      row.appendChild(lead);

      var labelRow = document.createElement("div");
      labelRow.className = "pin-label-row";
      var infoSpan = document.createElement("span");
      infoSpan.className = "pin-info";
      infoSpan.textContent = markerText(m, i);
      if (m.label) infoSpan.title = m.label;
      infoSpan.addEventListener("click", function () { userSeek(m.time); });
      labelRow.appendChild(infoSpan);
      var pen = document.createElement("button");
      pen.type = "button"; pen.className = "pin-edit-btn"; pen.title = "Edit memo";
      pen.innerHTML = SVG_PENCIL;
      pen.addEventListener("click", function (e) { e.stopPropagation(); startMemoEdit(m, infoSpan, i); });
      labelRow.appendChild(pen);
      row.appendChild(labelRow);

      var ab = document.createElement("div");
      ab.className = "qn-yt-ab-cell";
      var abtnA = document.createElement("button");
      abtnA.type = "button";
      abtnA.className = "qn-ab-block" + (current.loopA === m.time ? " active-a" : "");
      abtnA.textContent = "A"; abtnA.title = "このマーカーの位置をA点(ループ開始)に（A/Bはマーカーとは別の点）";
      abtnA.addEventListener("click", function (e) { e.stopPropagation(); toggleLoopPoint("A", m.id); });
      var abtnB = document.createElement("button");
      abtnB.type = "button";
      abtnB.className = "qn-ab-block" + (current.loopB === m.time ? " active-b" : "");
      abtnB.textContent = "B"; abtnB.title = "このマーカーの位置をB点(ループ終了)に（A/Bはマーカーとは別の点）";
      abtnB.addEventListener("click", function (e) { e.stopPropagation(); toggleLoopPoint("B", m.id); });
      ab.appendChild(abtnA); ab.appendChild(abtnB);
      row.appendChild(ab);

      var tg = document.createElement("button");
      tg.type = "button"; tg.className = "toggle-btn";
      tg.title = m.enabled === false ? "Marker disabled (click to enable)" : "Marker enabled (click to disable)";
      tg.innerHTML = m.enabled === false ? SVG_EYE_OFF : SVG_EYE_ON;
      tg.disabled = edit && selectedCount() > 0;
      tg.addEventListener("click", function (e) {
        e.stopPropagation();
        if (selectedCount() > 0) return;
        if (m.enabled === false) delete m.enabled; else m.enabled = false;
        persistMarkers(); renderMarkers();
      });
      row.appendChild(tg);

      if (edit) {
        var zone = document.createElement("div");
        zone.className = "pin-del-zone";
        var del = document.createElement("button");
        del.type = "button"; del.className = "del-btn"; del.tabIndex = -1; del.textContent = "✕";
        if (selected[m.id]) del.classList.add("pcv2-selected");
        zone.appendChild(del);
        zone.addEventListener("click", function (e) {
          e.stopPropagation();
          toggleSelect(m.id, del, box, ".toggle-btn");
        });
        row.appendChild(zone);
      }
      box.appendChild(row);
    });

    [["A", current ? current.loopA : null], ["B", current ? current.loopB : null]].forEach(function (pt) {
      if (pt[1] === null || pt[1] === undefined || !duration) return;
      var a = document.createElement("div");
      a.className = "qn-yt-marker qn-yt-abpt is-" + pt[0].toLowerCase();
      a.title = pt[0] + " " + fmt(pt[1]);
      var tag = document.createElement("span");
      tag.className = "qn-yt-marker-ab";
      tag.textContent = pt[0];
      a.appendChild(tag);
      positionMarker(a, pt[1]);
      attachABDrag(a, pt[0]);
      refs.markerLayer.appendChild(a);
    });

    updateLoopUI();
  }

  // ---------- チャプター貼り付け(「0:00 タイトル」「1:02:03 - タイトル」「[2:45] タイトル」を1行ずつ) ----------
  function parseChapters(text) {
    var out = [];
    String(text || "").normalize("NFKC").split(/\r?\n/).forEach(function (line) {
      var m = line.match(/^\s*(?:[-*・•▶►]\s*)?[\[(（]?\s*((?:\d{1,2}:)?\d{1,3}:\d{2})(?:\.\d+)?\s*[\])）]?\s*[-–—―:：|｜]?\s*(.*?)\s*$/);
      if (!m) return;
      var parts = m[1].split(":").map(Number), sec;
      if (parts.length === 3) {
        if (parts[1] >= 60 || parts[2] >= 60) return;
        sec = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else {
        if (parts[1] >= 60) return;
        sec = parts[0] * 60 + parts[1];
      }
      out.push({ time: sec, label: m[2].slice(0, 60) });
    });
    return out;
  }

  function addChapters() {
    var msg = refs.chapMsg;
    function say(t, ok) { msg.textContent = t; msg.className = "qn-yt-message" + (ok ? " ok" : ""); }
    if (!current) { say("先に動画を読み込んでください"); return; }
    var list = parseChapters(refs.chapText.value);
    if (!list.length) { say("「時間 タイトル」の行が見つかりません（例: 1:23 Aメロ）"); return; }
    var presetColors = (typeof getMarkerPresetColors === "function") ? getMarkerPresetColors() : {};
    var added = 0, skipped = 0;
    list.forEach(function (c) {
      var t = Math.round(c.time * 10) / 10;
      var over = duration && t > duration + 0.5;
      var dup = current.markers.some(function (x) { return Math.abs(x.time - t) < 0.05; });
      if (over || dup) { skipped++; return; }
      var mk = { id: uid("m"), time: t, label: c.label };
      for (var name in presetColors) {
        if (name.toLowerCase() === c.label.toLowerCase() && presetColors[name] &&
            typeof MARKER_COLOR_PALETTE !== "undefined" && MARKER_COLOR_PALETTE[presetColors[name]]) {
          mk.color = presetColors[name]; break;
        }
      }
      current.markers.push(mk);
      added++;
    });
    sortMarkers();
    persistMarkers();
    renderMarkers();
    say(added + "件追加しました" + (skipped ? "（" + skipped + "件は重複/範囲外のためスキップ）" : ""), added > 0);
    if (added > 0) refs.chapText.value = "";
  }

  // ---------- ABループ: B点到達でA点へseekTo()。MarkersのA/Bボタン=そのマーカー位置をA/B点に(点はマーカーと別、再押下で解除) ----------
  function toggleLoopPoint(which, markerId) {
    if (!current) return;
    var m = findMarker(markerId);
    if (!m) return;
    var key = which === "A" ? "loopA" : "loopB";
    current[key] = (current[key] === m.time) ? null : m.time;
    if (current.loopA === null || current.loopB === null) { if (current.loopMode === "ab") setLoopMode("off"); }
    persistLoop();
    renderMarkers();
  }

  // ---------- プリロール/ポストロール(PLAYERと同じ前後共通秒数): 折り返しで開始の何秒前へ戻る/終了の何秒後まで再生 ----------
  var PREROLL_KEY = "qn_yt_preroll", PREROLL_MAX = 5, PREROLL_STEP = 1;
  var preRoll = (function () {
    try { var v = parseInt(localStorage.getItem(PREROLL_KEY), 10); return v >= 0 && v <= PREROLL_MAX ? v : 0; } catch (e) { return 0; }
  })();
  function setPreRoll(v) {
    preRoll = Math.max(0, Math.min(PREROLL_MAX, v));
    try { localStorage.setItem(PREROLL_KEY, String(preRoll)); } catch (e) {}
    updateLoopUI();
  }

  // ---------- 送り戻しボタンの秒数(PLAYERと同じ5/10/15/30/60。設定から変更) ----------
  var SKIP_KEY = "qn_yt_skip_sec", SKIP_OPTIONS = [5, 10, 15, 30, 60];
  var skipSec = (function () {
    try { var v = parseInt(localStorage.getItem(SKIP_KEY), 10); return SKIP_OPTIONS.indexOf(v) >= 0 ? v : 10; } catch (e) { return 10; }
  })();
  function setSkipSec(v) {
    if (SKIP_OPTIONS.indexOf(v) < 0) return;
    skipSec = v;
    try { localStorage.setItem(SKIP_KEY, String(v)); } catch (e) {}
    applySkipLabels();
  }
  function applySkipLabels() {
    if (!refs.skipBackBtn || !refs.skipFwdBtn) return;
    setBtnLabel(refs.skipBackBtn, "-" + skipSec + "s");
    setBtnLabel(refs.skipFwdBtn, "+" + skipSec + "s");
    refs.skipBackBtn.title = skipSec + "秒戻る (J)";
    refs.skipFwdBtn.title = skipSec + "秒進む (L)";
  }

  // ---------- Settings(アプリ共通のSettingsパネルに出る行。部品はQNSettingsUI) ----------
  function settingsSections() {
    return [{ title: "Playback", rows: [
      { label: "Skip buttons", hint: "Seconds for back / forward", type: "stepper", values: function () { return SKIP_OPTIONS; }, get: function () { return skipSec; }, set: setSkipSec, fmt: function (v) { return v + "s"; } },
      { label: "Loop pre/post-roll", hint: "Seconds added around loop", type: "stepper", values: function () { var a = []; for (var i = 0; i <= PREROLL_MAX; i += PREROLL_STEP) a.push(i); return a; }, get: function () { return preRoll; }, set: setPreRoll, fmt: function (v) { return v + "s"; } }
    ] }];
  }

  function setBtnLabel(btn, text) {
    var sp = btn && btn.querySelector("span");
    if (sp) sp.textContent = text;
  }

  function setLoopMode(m) {
    if (!current) return;
    current.loopMode = m;
    current.looping = (m !== "off");
    if (m !== "sec") current.secRange = null;
  }

  function enabledTimes() {
    return (current ? current.markers : []).filter(function (x) { return x.enabled !== false; })
      .map(function (x) { return x.time; }).sort(function (p, q) { return p - q; });
  }
  function sectionRangeAt(t) {
    if (!current || !duration) return null;
    var times = enabledTimes(), i = QNMarkerCore.pickSectionIndex(times, t);
    return i < 0 ? null : { start: times[i], end: times[i + 1] };
  }

  function activeLoopRange() {
    if (current && current.loopMode === "sec" && current.secRange) return current.secRange;
    return loopRangeTimes();
  }

  function loopRangeTimes() {
    if (!current || current.loopA === null || current.loopB === null) return null;
    var a = current.loopA, b = current.loopB;
    return a <= b ? { start: a, end: b } : { start: b, end: a };
  }

  function updateLoopUI() {
    if (!current) return;
    var ha = current.loopA !== null, hb = current.loopB !== null;
    setBtnLabel(refs.setABtn, "A " + (ha ? fmt(current.loopA) : "--"));
    setBtnLabel(refs.setBBtn, "B " + (hb ? fmt(current.loopB) : "--"));
    refs.setABtn.classList.toggle("has-point", ha);
    refs.setBBtn.classList.toggle("has-point", hb);

    var range = activeLoopRange();
    var lm = current.loopMode || "off";
    refs.loopToggleBtn.disabled = !duration;
    refs.loopToggleBtn.classList.toggle("is-active", lm !== "off");
    refs.loopToggleBtn.setAttribute("aria-pressed", String(lm !== "off"));
    var lbl = refs.loopToggleBtn.querySelector("span");
    if (lbl) lbl.textContent = lm === "ab" ? "A-B Loop" : lm === "sec" ? "Section" : "Loop";

    var len = duration ? duration / SEGS : 0;
    for (var i = 0; i < SEGS; i++) {
      var shown = false;
      if (range && duration) {
        var a = Math.max(range.start, i * len), b = Math.min(range.end, (i + 1) * len);
        if (b > a) {
          loopRanges[i].hidden = false;
          loopRanges[i].classList.toggle("is-on", lm !== "off");
          loopRanges[i].style.left = segPct(i, a) + "%";
          loopRanges[i].style.width = Math.max(0, segPct(i, b) - segPct(i, a)) + "%";
          shown = true;
        }
      }
      if (!shown) loopRanges[i].hidden = true;
      var pr = [null, null];
      if (range && duration && lm !== "off" && preRoll > 0) {
        pr[0] = [Math.max(0, range.start - preRoll), range.start];
        pr[1] = [range.end, Math.min(duration, range.end + preRoll)];
      }
      for (var k = 0; k < 2; k++) {
        var pe = loopPres[i][k], seg = pr[k], on = false;
        if (seg) {
          var pa = Math.max(seg[0], i * len), pb = Math.min(seg[1], (i + 1) * len);
          if (pb > pa) {
            pe.hidden = false;
            pe.style.left = segPct(i, pa) + "%";
            pe.style.width = Math.max(0, segPct(i, pb) - segPct(i, pa)) + "%";
            on = true;
          }
        }
        if (!on) pe.hidden = true;
      }
    }
  }

  function attachMarkerDrag(el, m) {
    var moved = false, startX = 0, startY = 0;
    el.addEventListener("pointerdown", function (e) {
      if (!duration) return;
      e.stopPropagation();
      el.setPointerCapture(e.pointerId);
      seeking = true; moved = false; startX = e.clientX; startY = e.clientY;
      el.classList.add("dragging");
    });
    el.addEventListener("pointermove", function (e) {
      if (!seeking || !el.hasPointerCapture(e.pointerId)) return;
      if (Math.abs(e.clientX - startX) > 3 || Math.abs(e.clientY - startY) > 3) moved = true;
      if (!moved) return;
      var t = Math.round(timeFromPoint(e) * 10) / 10;
      m.time = t;
      positionMarker(el, t);
      el.title = fmt(t) + " " + (m.label || "");
    });
    el.addEventListener("pointerup", function (e) {
      if (!el.hasPointerCapture(e.pointerId)) return;
      el.releasePointerCapture(e.pointerId);
      seeking = false;
      el.classList.remove("dragging");
      if (moved) { sortMarkers(); persistMarkers(); renderMarkers(); }
      else {
        userSeek(m.time);
        var er = el.getBoundingClientRect();
        showSeekPop(m.time, tracks[segIndex(m.time)].getBoundingClientRect(), er.left + er.width / 2, m);
      }
    });
  }

  function attachABDrag(el, kind) {
    var key = kind === "A" ? "loopA" : "loopB";
    var moved = false, startX = 0, startY = 0;
    el.addEventListener("pointerdown", function (e) {
      if (!duration) return;
      e.stopPropagation();
      el.setPointerCapture(e.pointerId);
      seeking = true; moved = false; startX = e.clientX; startY = e.clientY;
      el.classList.add("dragging");
    });
    el.addEventListener("pointermove", function (e) {
      if (!seeking || !el.hasPointerCapture(e.pointerId)) return;
      if (Math.abs(e.clientX - startX) > 3 || Math.abs(e.clientY - startY) > 3) moved = true;
      if (!moved) return;
      var t = Math.round(timeFromPoint(e) * 10) / 10;
      current[key] = t;
      positionMarker(el, t);
      el.title = kind + " " + fmt(t);
    });
    el.addEventListener("pointerup", function (e) {
      if (!el.hasPointerCapture(e.pointerId)) return;
      el.releasePointerCapture(e.pointerId);
      seeking = false;
      el.classList.remove("dragging");
      if (moved) { persistLoop(); renderMarkers(); }
      else {
        userSeek(current[key]);
        var er = el.getBoundingClientRect();
        showSeekPop(current[key], tracks[segIndex(current[key])].getBoundingClientRect(), er.left + er.width / 2, null, kind);
      }
    });
  }

  // ---------- 自前シークバー(3行それぞれで操作可能・ドラッグで行をまたげる) ----------
  function attachTrackSeek(track) {
    var downX = 0, downY = 0, dragged = false;
    track.addEventListener("pointerdown", function (e) {
      if (!duration) return;
      track.setPointerCapture(e.pointerId);
      seeking = true;
      dragged = false; downX = e.clientX; downY = e.clientY;
      updateDisplay(timeFromPoint(e));
    });
    track.addEventListener("pointermove", function (e) {
      if (!seeking || !track.hasPointerCapture(e.pointerId)) return;
      if (Math.abs(e.clientX - downX) > 4 || Math.abs(e.clientY - downY) > 4) dragged = true;
      updateDisplay(timeFromPoint(e));
    });
    track.addEventListener("pointerup", function (e) {
      if (!track.hasPointerCapture(e.pointerId)) return;
      track.releasePointerCapture(e.pointerId);
      var t = timeFromPoint(e);
      seeking = false;
      userSeek(t);
      if (!dragged) showSeekPop(t, track.getBoundingClientRect(), e.clientX);
    });
  }

  var seekPop = null, seekPopTimer = null, seekPopTime = 0, seekPopMarkerId = null;
  var SEEKPOP_SNAP = 0.5, SEEKPOP_MS = 4000;

  function ensureSeekPop() {
    if (seekPop) return seekPop;
    seekPop = document.createElement("div");
    seekPop.className = "qn-yt-seekpop";
    seekPop.hidden = true;
    seekPop.setAttribute("role", "menu");
    seekPop.innerHTML =
      '<div class="qn-yt-seekpop-time" data-pop="time">00:00</div>' +
      '<div class="qn-yt-seekpop-row">' +
        '<button type="button" class="qn-yt-seekpop-btn" data-pop="A" title="この位置をA点(ループ開始)に"><b>A</b><span>Start</span></button>' +
        '<button type="button" class="qn-yt-seekpop-btn" data-pop="B" title="この位置をB点(ループ終了)に"><b>B</b><span>End</span></button>' +
        '<button type="button" class="qn-yt-seekpop-btn" data-pop="M" title="この位置にマーカーを追加"><b>＋</b><span>Marker</span></button>' +
        '<button type="button" class="qn-yt-seekpop-btn qn-yt-seekpop-del" data-pop="X" title="このA/B点を削除" hidden><b>－</b><span>Point</span></button>' +
        '<button type="button" class="qn-yt-seekpop-btn qn-yt-seekpop-del" data-pop="D" title="このマーカーを削除" hidden><b>－</b><span>Marker</span></button>' +
        '<button type="button" class="qn-yt-seekpop-btn" data-pop="C" title="マーカーの色を変える" hidden><b><i class="qn-yt-seekpop-dot"></i></b><span>Color</span></button>' +
        '<button type="button" class="qn-yt-seekpop-btn" data-pop="H" title="このマーカーを非表示にする（Markersパネルの目で再表示）" hidden><b>' + SVG_EYE_ON + '</b><span>Hide</span></button>' +
      '</div>';
    document.body.appendChild(seekPop);
    seekPop.addEventListener("pointerdown", function (e) { e.stopPropagation(); resetSeekPopTimer(); });
    seekPop.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-pop]") : null;
      if (!b) return;
      var k = b.getAttribute("data-pop");
      if (k === "X") { seekPopClearPoint(); return; }
      if (k === "D") { seekPopDelete(b); return; }
      if (k === "C") { seekPopColor(); return; }
      if (k === "H") { seekPopHide(); return; }
      if (k === "A" || k === "B" || k === "M") seekPopAction(k);
    });
    document.addEventListener("pointerdown", function (e) {
      if (seekPop.hidden) return;
      if (e.target.closest && e.target.closest(".qn-yt-seekpop")) return;
      hideSeekPop();
    }, true);
    window.addEventListener("keydown", function (e) { if (e.key === "Escape") hideSeekPop(); }, true);
    window.addEventListener("resize", hideSeekPop);
    return seekPop;
  }

  function resetSeekPopTimer() {
    if (seekPopTimer) clearTimeout(seekPopTimer);
    seekPopTimer = setTimeout(hideSeekPop, SEEKPOP_MS);
  }

  function hideSeekPop() {
    armSeekPopDel(false);
    if (seekPopTimer) { clearTimeout(seekPopTimer); seekPopTimer = null; }
    if (seekPop) seekPop.hidden = true;
  }

  var seekPopAbKind = null;
  function showSeekPop(t, trackRect, clientX, marker, abKind) {
    if (!current || !duration) return;
    var pop = ensureSeekPop();
    seekPopTime = Math.round(clampTime(t) * 10) / 10;
    seekPopMarkerId = marker ? marker.id : null;
    pop.querySelector('[data-pop="time"]').textContent = fmt(seekPopTime);
    seekPopAbKind = abKind || null;
    pop.querySelector('[data-pop="X"]').hidden = !abKind;
    pop.querySelector('[data-pop="A"]').hidden = !!abKind;
    pop.querySelector('[data-pop="B"]').hidden = !!abKind;
    pop.querySelector('[data-pop="M"]').hidden = !!marker || !!abKind;
    pop.querySelector('[data-pop="D"]').hidden = !marker;
    pop.querySelector('[data-pop="C"]').hidden = !marker;
    pop.querySelector('[data-pop="H"]').hidden = !marker;
    pop.querySelector('[data-pop="A"]').classList.toggle("is-set", current.loopA !== null && Math.abs(current.loopA - seekPopTime) <= SEEKPOP_SNAP);
    pop.querySelector('[data-pop="B"]').classList.toggle("is-set", current.loopB !== null && Math.abs(current.loopB - seekPopTime) <= SEEKPOP_SNAP);
    if (marker) pop.querySelector(".qn-yt-seekpop-dot").style.background = markerColorHex(marker) || "#3a3a48";
    armSeekPopDel(false);
    pop.hidden = false;
    var w = pop.offsetWidth, h = pop.offsetHeight, gap = 10;
    var left = Math.min(Math.max(clientX - w / 2, 8), window.innerWidth - w - 8);
    var top = trackRect.top - h - gap;
    var below = top < 8;
    if (below) top = trackRect.bottom + gap;
    pop.classList.toggle("is-below", below);
    pop.style.left = left + "px";
    pop.style.top = top + "px";
    resetSeekPopTimer();
  }

  var seekPopDelArmed = false, seekPopDelTimer = null;
  function armSeekPopDel(on) {
    seekPopDelArmed = on;
    if (seekPopDelTimer) { clearTimeout(seekPopDelTimer); seekPopDelTimer = null; }
    if (!seekPop) return;
    var b = seekPop.querySelector('[data-pop="D"]');
    b.classList.toggle("is-armed", on);
    b.querySelector("span").textContent = on ? "Sure?" : "Marker";
    if (on) seekPopDelTimer = setTimeout(function () { armSeekPopDel(false); }, 3000);
  }
  function seekPopDelete() {
    if (!seekPopMarkerId) return;
    if (!seekPopDelArmed) { armSeekPopDel(true); resetSeekPopTimer(); return; }
    var id = seekPopMarkerId, m = findMarker(id);
    hideSeekPop();
    if (!current || !m) return;
    current.markers = current.markers.filter(function (x) { return x.id !== id; });
    if (current.loopMode === "sec") { var r = sectionRangeAt(currentPos()); if (r) current.secRange = r; else setLoopMode("off"); }
    var it = current.itemId ? findItem(current.itemId) : null;
    if (it) it.markers = current.markers;
    persistMarkers(); persistLoop();
    renderMarkers();
    ytToast("Marker削除 " + fmt(m.time));
  }

  function seekPopColor() {
    var id = seekPopMarkerId, m = id ? findMarker(id) : null;
    hideSeekPop();
    if (!m || typeof openMarkerStylePopup !== "function") return;
    var anchor = refs.markerLayer.querySelector('[data-mid="' + id + '"]');
    if (!anchor) return;
    openMarkerStylePopup(anchor, { label: m.label || "", color: m.color || null, placeholder: fmt(m.time) }, function (v) {
      m.label = v.label;
      if (v.color) m.color = v.color; else delete m.color;
      persistMarkers(); renderMarkers();
    });
  }

  function seekPopHide() {
    var id = seekPopMarkerId, m = id ? findMarker(id) : null;
    hideSeekPop();
    if (!m) return;
    m.enabled = false;
    persistMarkers(); renderMarkers();
    ytToast("Marker非表示 " + fmt(m.time) + "（Markersパネルの目で再表示）");
  }

  function seekPopClearPoint() {
    var kind = seekPopAbKind;
    hideSeekPop();
    if (!current || !kind) return;
    current[kind === "A" ? "loopA" : "loopB"] = null;
    if (current.loopMode === "ab") setLoopMode("off");
    persistLoop();
    renderMarkers();
    ytToast(kind + " 解除");
  }

  function seekPopAction(kind) {
    hideSeekPop();
    setLoopPointAt(kind, seekPopTime);
  }

  function setLoopPointAt(kind, t) {
    if (!current) return;
    var tt = Math.round(clampTime(t) * 10) / 10, msg;
    if (kind === "A" || kind === "B") {
      var key = kind === "A" ? "loopA" : "loopB";
      if (current[key] !== null && Math.abs(current[key] - tt) <= SEEKPOP_SNAP) {
        current[key] = null; msg = kind + " 解除";
      } else {
        current[key] = tt; msg = kind + " " + fmt(tt);
      }
      if (current.loopA === null || current.loopB === null) { if (current.loopMode === "ab") setLoopMode("off"); }
      persistLoop();
    } else {
      var i, near = null, best = SEEKPOP_SNAP + 1e-9;
      for (i = 0; i < current.markers.length; i++) {
        var d = Math.abs(current.markers[i].time - tt);
        if (d <= best) { best = d; near = current.markers[i]; }
      }
      if (near) {
        msg = "Markerは既にあります " + fmt(near.time);
      } else {
        current.markers.push({ id: uid("m"), time: tt, label: "" });
        sortMarkers(); persistMarkers();
        msg = "Marker " + fmt(tt);
      }
    }
    renderMarkers();
    ytToast(msg);
  }

  function updateDisplay(t) {
    if (!root) return;
    if (refs.curTime) refs.curTime.textContent = fmt(t);
    var active = segIndex(t);
    for (var i = 0; i < SEGS; i++) {
      var p = segPct(i, t) + "%";
      fills[i].style.width = p;
      heads[i].style.display = (i === active) ? "" : "none";
      heads[i].style.left = p;
    }
    paintPlayed(t);
  }

  // 位置ポーリング(ドラッグ中は更新しない)。ABループ中はB点到達でA点へseekTo()。画面表示中のみ
  function poll() {
    if (!player || !playerReady || seeking) return;
    if (!duration) refreshDuration();
    if (typeof player.getCurrentTime !== "function") return;
    var t = player.getCurrentTime();
    if (current && current.looping) {
      // 区間ループは再生位置に追従(PLAYERと同ルール): プリロール/ポストロール込みの区間外なら切替。自分の折り返し直後1.5秒は位置更新遅れのため判定しない
      if (current.loopMode === "sec" && current.secRange && Date.now() - loopJumpAt > 1500) {
        var sr = current.secRange;
        if (!QNMarkerCore.inRange(sr.start, sr.end, t, preRoll, duration)) {
          var nr = sectionRangeAt(t);
          if (nr && (nr.start !== sr.start || nr.end !== sr.end)) {
            current.secRange = nr;
            updateLoopUI();
            ytToast("Section " + fmt(nr.start) + " - " + fmt(nr.end));
          }
        }
      }
      var range = activeLoopRange();
      var endAt = Math.min(duration - 0.3, range.end + preRoll);
      if (range && t >= endAt) { loopJumpAt = Date.now(); seekTo(Math.max(0, range.start - preRoll)); return; }
    }
    updateDisplay(t);
  }


  // Backup/Import(形式JSON format:"qn-youtube-library")。含めるのはvideoId/URL/手入力タイトル/マーカー(秒・ラベル)/AB点のみ。YouTube由来データ(自動取得タイトル・サムネ等)は含めない(規約)
  var EXPORT_FORMAT = "qn-youtube-library";
  // 画面は本体共通。ここはYouTube側データの出し入れのみ(v3.17.0〜 window.QNYouTubeBackupとして公開、player-track-backup.jsが使う)
  function cleanStr(v, max) {
    return typeof v === "string" ? v.trim().slice(0, max) : "";
  }

  // JSONを検証・整形。壊れた/想定外の値は捨てる
  function normalizeImport(raw) {
    var list = Array.isArray(raw) ? raw : (raw && Array.isArray(raw.items) ? raw.items : null);
    if (!list) return null;
    var seen = {}, out = [];
    list.forEach(function (r) {
      if (!r || typeof r !== "object") return;
      var vid = typeof r.videoId === "string" && /^[A-Za-z0-9_-]{11}$/.test(r.videoId) ? r.videoId : parseVideoId(r.url);
      if (!vid || seen[vid]) return;
      seen[vid] = true;
      var url = typeof r.url === "string" && parseVideoId(r.url) === vid ? r.url.trim().slice(0, 300) : "https://youtu.be/" + vid;
      var o = { videoId: vid, url: url };
      // 新形式customTitle。旧形式のtitle(手入力だった)も読む。"(無題)"は旧プレースホルダなので無視
      var title = cleanStr(r.customTitle !== undefined ? r.customTitle : r.title, 200);
      if (title && title !== "(無題)") o.customTitle = title;
      if (Array.isArray(r.markers)) {
        var ids = {}, ms = [];
        r.markers.forEach(function (m) {
          if (!m || typeof m.time !== "number" || !isFinite(m.time) || m.time < 0 || m.time > 604800) return;
          var id = cleanStr(m.id, 40);
          if (!id || ids[id]) id = uid("m");
          ids[id] = true;
          var mo = { id: id, time: Math.round(m.time * 10) / 10, label: cleanStr(m.label, 200) };
          if (typeof m.color === "string" && typeof MARKER_COLOR_PALETTE !== "undefined" && MARKER_COLOR_PALETTE[m.color]) mo.color = m.color;
          if (m.enabled === false) mo.enabled = false;
          ms.push(mo);
        });
        ms.sort(function (a, b) { return a.time - b.time; });
        o.markers = ms;
        o.loopA = abTimeOf(typeof r.loopA === "string" ? cleanStr(r.loopA, 40) : r.loopA, ms);
        o.loopB = abTimeOf(typeof r.loopB === "string" ? cleanStr(r.loopB, 40) : r.loopB, ms);
      }
      out.push(o);
    });
    return out;
  }

  // ---------- 共通Backup/Import画面への窓口（v3.17.0〜） ----------
  function buildExportObject(ids, includeSettings) {
    var want = {};
    ids.forEach(function (id) { want[id] = true; });
    var sel = items.filter(function (it) { return want[it.id]; });
    return {
      format: EXPORT_FORMAT, version: 1, exportedAt: new Date().toISOString(),
      items: sel.map(function (it) {
        var o = { videoId: it.videoId, url: it.url };
        if (includeSettings) {
          if (it.customTitle) o.customTitle = it.customTitle;
          o.markers = it.markers.map(function (m) { var o2 = { id: m.id, time: m.time, label: m.label || "" }; if (m.color) o2.color = m.color; if (m.enabled === false) o2.enabled = false; return o2; });
          o.loopA = abTimeOf(it.loopA, it.markers);
          o.loopB = abTimeOf(it.loopB, it.markers);
        }
        return o;
      })
    };
  }

  function applyImportList(list, choices) {
    var added = 0, over = 0, skipped = 0;
    list.forEach(function (x) {
      var ex = findItemByVideoId(x.videoId);
      if (ex) {
        if (choices && choices[x.videoId] === "skip") { skipped++; return; }
        if (x.customTitle) ex.customTitle = x.customTitle;
        ex.url = x.url;
        if (x.markers) {
          ex.markers = x.markers; ex.loopA = x.loopA; ex.loopB = x.loopB;
          if (current && current.itemId === ex.id) {
            current.markers = ex.markers; current.loopA = ex.loopA; current.loopB = ex.loopB; setLoopMode("off");
          }
        }
        over++;
      } else {
        var ni = {
          id: uid("item"), type: "youtube", videoId: x.videoId, url: x.url,
          markers: x.markers || [],
          loopA: (typeof x.loopA === "number") ? x.loopA : null, loopB: (typeof x.loopB === "number") ? x.loopB : null, createdAt: Date.now()
        };
        if (x.customTitle) ni.customTitle = x.customTitle;
        items.push(ni);
        added++;
      }
    });
    saveItems();
    if (root) { renderList(); renderMarkers(); }
    ensureTitles();
    return { added: added, over: over, skipped: skipped };
  }

  window.QNYouTubeBackup = {
    list: function () {
      return items.map(function (it) { return { id: it.id, title: displayTitle(it), markerCount: it.markers.length }; });
    },
    buildExport: buildExportObject,
    // YouTube形式でなければnull
    parseImport: function (raw) {
      if (raw && !Array.isArray(raw) && raw.format && raw.format !== EXPORT_FORMAT) return null;
      var list = normalizeImport(raw);
      return list && list.length ? list : null;
    },
    exists: function (videoId) { return !!findItemByVideoId(videoId); },
    titleOf: function (videoId) { var it = findItemByVideoId(videoId); return it ? displayTitle(it) : ""; },
    applyImport: applyImportList
  };

  // ---------- スペースキー再生/一時停止: 公式playVideo()/pauseVideo()を利用者のキー操作起点で呼ぶだけ(規約OK)。文字入力中・修飾キー・リピートは無視 ----------
  function isTypingTarget(el) {
    if (!el || !el.tagName) return false;
    var tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
  }
  function togglePlay() {
    if (!player || !playerReady || typeof player.getPlayerState !== "function") return;
    try {
      if (player.getPlayerState() === 1) player.pauseVideo();
      else player.playVideo();
    } catch (err) {}
  }
  function updatePlayBtn(playing) {
    if (!refs.playBtn) return;
    refs.playBtn.innerHTML = '<svg viewBox="0 0 24 24">' + (playing ? BI.pause : BI.play) + '</svg><span>' + (playing ? "Pause" : "Play") + '</span>';
    refs.playBtn.classList.toggle("is-playing", !!playing);
  }
  function gotoNeighbor(dir) {
    if (!current || !current.itemId) { showMessage("Libraryの動画を選んでください"); return; }
    var idx = -1, i, ord = orderedItems();
    for (i = 0; i < ord.length; i++) if (ord[i].id === current.itemId) idx = i;
    if (idx < 0) return;
    var target = null;
    for (i = idx + dir; i >= 0 && i < ord.length; i += dir) if (!ord[i].skip) { target = ord[i]; break; }
    if (!target) { showMessage(dir > 0 ? "Libraryの最後の動画です" : "Libraryの最初の動画です"); return; }
    refs.urlInput.value = target.url;
    openVideo(target.videoId, target.url, target.id, { play: true });
  }

  // YouTube本家と同じキーボードショートカット(v3.1.0〜)。公式メソッド(playVideo/pauseVideo/seekTo/setVolume/mute/setPlaybackRate)を利用者のキー操作起点で呼ぶだけ(規約OK)。アプリ表示中のみ。文字入力中・Ctrl/Cmd/Alt併用・再生系のキーリピートは無視。iframeにフォーカス中はYouTube側が処理
  var SHORTCUTS = [
    { key: "Space / K", action: "Play / Pause" },
    { key: "J / L", action: "Back / Forward (Skip buttons)" },
    { key: "← / →", action: "Back / Forward 5s" },
    { key: "↑ / ↓", action: "Volume +5% / -5%" },
    { key: "M", action: "Mute / Unmute" },
    { key: "0 - 9", action: "Jump to 0% - 90%" },
    { key: "Home / End", action: "Start / End of video" },
    { key: ", / .", action: "Previous / Next frame (paused)" },
    { key: "< / >", action: "Slower / Faster (Shift + , / .)" },
    { key: "Shift + P / N", action: "Previous / Next video (Library)" }
  ];

  function ytToast(text) {
    try { if (window.QNApps && window.QNApps.toast) window.QNApps.toast(text); } catch (e) {}
  }

  function resetRate() {
    desiredRate = 1;
    try { localStorage.setItem(RATE_KEY, "1"); } catch (e) {}
    try { if (player && playerReady && player.setPlaybackRate) player.setPlaybackRate(1); } catch (e) {}
    renderSpeed();
    ytToast("Speed 1x");
  }
  function stepRate(dir, quiet) {
    var rates = availableRates(), actual = desiredRate, i, idx = -1;
    try { if (player && playerReady && player.getPlaybackRate) actual = player.getPlaybackRate(); } catch (e) {}
    for (i = 0; i < rates.length; i++) if (Math.abs(rates[i] - actual) < 0.001) idx = i;
    if (idx < 0) {
      idx = 0;
      for (i = 0; i < rates.length; i++) if (rates[i] <= actual) idx = i;
    }
    var n = Math.max(0, Math.min(rates.length - 1, idx + dir));
    desiredRate = rates[n];
    try { localStorage.setItem(RATE_KEY, String(desiredRate)); } catch (e) {}
    try { if (player && playerReady && player.setPlaybackRate) player.setPlaybackRate(desiredRate); } catch (e) {}
    renderSpeed();
    if (!quiet) ytToast("Speed " + desiredRate + "x");
  }

  function changeVolume(delta) {
    try {
      if (!player.getVolume || !player.setVolume) return;
      if (player.isMuted && player.isMuted() && delta > 0 && player.unMute) player.unMute();
      var v = Math.max(0, Math.min(100, Math.round(player.getVolume()) + delta));
      player.setVolume(v);
      ytToast("Volume " + v + "%");
    } catch (e) {}
  }

  function toggleMute() {
    try {
      if (!player.isMuted) return;
      if (player.isMuted()) { player.unMute(); ytToast("Unmuted"); }
      else { player.mute(); ytToast("Muted"); }
    } catch (e) {}
  }

  function onSpaceKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (isTypingTarget(e.target) || isTypingTarget(document.activeElement)) return;
    if (!player || !playerReady || typeof player.getPlayerState !== "function") return;
    var k = e.key, isSpace = (e.code === "Space" || k === " ");
    if (isSpace) {
      if (e.shiftKey) return;
      e.preventDefault();
      if (e.type === "keyup" || e.repeat) return;
      togglePlay();
      return;
    }
    if (e.type !== "keydown") return;
    var lk = (k || "").length === 1 ? k.toLowerCase() : k;
    var handled = true, t, st;
    if (e.shiftKey) {
      if (k === "<") stepRate(-1);
      else if (k === ">") stepRate(1);
      else if (lk === "n" && !e.repeat) gotoNeighbor(1);
      else if (lk === "p" && !e.repeat) gotoNeighbor(-1);
      else handled = false;
      if (handled) e.preventDefault();
      return;
    }
    if (lk === "k") { if (!e.repeat) togglePlay(); }
    else if (lk === "j") seekTo(currentPos() - skipSec);
    else if (lk === "l") seekTo(currentPos() + skipSec);
    else if (k === "ArrowLeft") seekTo(currentPos() - 5);
    else if (k === "ArrowRight") seekTo(currentPos() + 5);
    else if (k === "ArrowUp") changeVolume(5);
    else if (k === "ArrowDown") changeVolume(-5);
    else if (lk === "m") { if (!e.repeat) toggleMute(); }
    else if (k === "Home") seekTo(0);
    else if (k === "End") { if (duration) seekTo(duration); }
    else if (k >= "0" && k <= "9" && k.length === 1) {
      if (duration) seekTo(duration * (Number(k) / 10));
    }
    else if (k === "," || k === ".") {
      // 一時停止中のみ1フレーム(約1/30秒)ずつ。再生中は何もしない
      try { st = player.getPlayerState(); } catch (err) { st = -1; }
      if (st === 1) handled = false;
      else seekTo(currentPos() + (k === "." ? 1 : -1) / 30);
    }
    else handled = false;
    if (handled) e.preventDefault();
  }

  function renderShortcuts() {
    if (!refs.kbdBox) return;
    window.QNApps.renderShortcuts(refs.kbdBox, "youtube");
  }

  var spaceBound = false;
  function bindSpace(on) {
    if (on === spaceBound) return;
    spaceBound = on;
    var f = on ? "addEventListener" : "removeEventListener";
    window[f]("keydown", onSpaceKey, true);
    window[f]("keyup", onSpaceKey, true);
  }

  function onShow() {
    bindSpace(true);
    ensureTitles();
    syncIfStale();
    var want = panelState || "library";   // v3.39.0: 初回はSPでもLibraryパネルを開く(閉じた後はその状態を保つ)
    setPanel(want);
    applyCollapse();
    renderMarkers();
    updateDisplay(currentPos());
    if (!pollTimer) pollTimer = setInterval(poll, 250);
  }

  function onHide() {
    bindSpace(false);
    hideSeekPop();
    try { if (window.QNWake) window.QNWake.set("youtube", false); } catch (err) {}
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    // 画面を隠したまま音だけ流さない(規約)。公式メソッドで一時停止
    try {
      if (player && playerReady && typeof player.pauseVideo === "function") player.pauseVideo();
    } catch (e) {}
  }

  // ---------- 同期(ログイン中の自分だけ。Firestore users/{uid}/sync/youtube の1ドキュメント。詳細md/SYNC.md) ----------
  // ローカルが基本。同期するのはvideoId/URL/customTitle/マーカー/A・B点/skip/並び順だけ(YouTube由来タイトル・サムネは含めない)。
  // 合体ルール: 動画ごとにupdatedAtが新しい方(同時刻はサーバー側)。削除はtombstone(deleted)で伝える。並びはorderAtが新しい方。
  var SYNC_DOC = "youtube", SYNC_META_KEY = "qn_yt_sync_meta", TOMB_TTL_MS = 180 * 24 * 60 * 60 * 1000;
  var syncMeta = { tomb: {}, orderAt: 0, lastSync: 0 };
  var knownSigs = {}, knownOrder = "", localVersion = 0;
  var syncUser = false, syncing = false, syncAgain = false, syncTimer = 0, lastSyncTry = 0, syncState = "";

  function isFiniteNum(v) { return typeof v === "number" && isFinite(v); }
  // 同期用の整形(キー順固定=比較・署名に使う)。ローカルのitemもリモートの値もこれを通す
  function mkPayload(src) {
    var p = { videoId: src.videoId, url: src.url };
    if (src.customTitle) p.customTitle = src.customTitle;
    var ms = Array.isArray(src.markers) ? src.markers : [];
    p.markers = ms.map(function (m) {
      var o = { id: m.id, time: m.time, label: m.label || "" };
      if (m.color) o.color = m.color;
      if (m.enabled === false) o.enabled = false;
      return o;
    });
    p.loopA = abTimeOf(src.loopA, ms);
    p.loopB = abTimeOf(src.loopB, ms);
    if (src.skip) p.skip = true;
    if (typeof src.folder === "string" && src.folder) p.folder = src.folder.slice(0, 40);
    p.createdAt = isFiniteNum(src.createdAt) ? src.createdAt : 0;
    p.updatedAt = isFiniteNum(src.updatedAt) ? src.updatedAt : 0;
    return p;
  }
  function sigOf(it) { var p = mkPayload(it); p.updatedAt = 0; return JSON.stringify(p); }
  var knownFoldersSig = "";
  function orderSig() { return items.map(function (it) { return it.videoId; }).join(","); }

  function loadSyncMeta() {
    try {
      var m = JSON.parse(localStorage.getItem(SYNC_META_KEY) || "{}");
      if (m && typeof m === "object") {
        if (m.tomb && typeof m.tomb === "object") {
          Object.keys(m.tomb).forEach(function (k) { if (isFiniteNum(m.tomb[k])) syncMeta.tomb[k] = m.tomb[k]; });
        }
        if (isFiniteNum(m.orderAt)) syncMeta.orderAt = m.orderAt;
        if (isFiniteNum(m.lastSync)) syncMeta.lastSync = m.lastSync;
      }
    } catch (e) {}
  }
  function saveSyncMeta() {
    try { localStorage.setItem(SYNC_META_KEY, JSON.stringify(syncMeta)); } catch (e) {}
  }
  function persistItemsRaw() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); localStorage.setItem(FOLDERS_KEY, JSON.stringify(ytFolders)); } catch (e) {}
  }
  function initSyncState() {
    loadSyncMeta();
    var fixed = false;
    items.forEach(function (it) {
      if (!isFiniteNum(it.updatedAt)) { it.updatedAt = isFiniteNum(it.createdAt) ? it.createdAt : Date.now(); fixed = true; }
      knownSigs[it.videoId] = sigOf(it);
    });
    knownOrder = orderSig();
    knownFoldersSig = foldersSig();
    if (fixed) persistItemsRaw();
  }
  // saveItems()から呼ぶ: 前回との差分を見て、変わった動画のupdatedAt・消えた動画のtombstone・並び替えのorderAtを更新(各所の保存処理を個別に直さなくて済む)
  function trackLocalChanges() {
    var now = Date.now(), seen = {}, dirty = false;
    items.forEach(function (it) {
      seen[it.videoId] = true;
      var sig = sigOf(it);
      if (knownSigs[it.videoId] !== sig) {
        it.updatedAt = Math.max(now, (it.updatedAt || 0) + 1);
        knownSigs[it.videoId] = sig;
        if (syncMeta.tomb[it.videoId] !== undefined) delete syncMeta.tomb[it.videoId];
        dirty = true;
      }
    });
    Object.keys(knownSigs).forEach(function (vid) {
      if (!seen[vid]) { delete knownSigs[vid]; syncMeta.tomb[vid] = now; dirty = true; }
    });
    var os = orderSig();
    if (os !== knownOrder) { knownOrder = os; syncMeta.orderAt = now; dirty = true; }
    var fs2 = foldersSig();
    if (fs2 !== knownFoldersSig) { knownFoldersSig = fs2; ytFolders.at = Math.max(now, ytFolders.at + 1); dirty = true; }
    if (dirty) saveSyncMeta();
    localVersion++;
  }

  function buildLocalState() {
    var st = { items: {}, deleted: {}, order: [], orderAt: syncMeta.orderAt, folders: ytFolders.list.map(function (f) { return { id: f.id, name: f.name }; }), foldersAt: ytFolders.at };
    items.forEach(function (it) { st.items[it.videoId] = mkPayload(it); st.order.push(it.videoId); });
    Object.keys(syncMeta.tomb).forEach(function (k) { st.deleted[k] = syncMeta.tomb[k]; });
    return st;
  }
  // リモートのドキュメントを検証・整形(壊れた値は捨てる)
  function parseRemote(data) {
    var st = { items: {}, deleted: {}, order: [], orderAt: 0, folders: [], foldersAt: 0 };
    if (!data || typeof data !== "object") return st;
    if (Array.isArray(data.folders)) {
      var fseen = {};
      data.folders.forEach(function (f) {
        if (f && typeof f.id === "string" && f.id && typeof f.n === "string" && !fseen[f.id]) { fseen[f.id] = true; st.folders.push({ id: f.id.slice(0, 40), name: f.n.slice(0, 100) }); }
      });
    }
    if (isFiniteNum(data.foldersAt)) st.foldersAt = data.foldersAt;
    var ri = data.items && typeof data.items === "object" ? data.items : {};
    Object.keys(ri).forEach(function (vid) {
      if (!/^[A-Za-z0-9_-]{11}$/.test(vid) || !ri[vid] || typeof ri[vid] !== "object") return;
      var r = ri[vid];
      var norm = normalizeImport([{ videoId: vid, url: r.url, customTitle: r.customTitle, markers: Array.isArray(r.markers) ? r.markers : [], loopA: r.loopA, loopB: r.loopB }]);
      if (!norm || !norm[0]) return;
      var o = norm[0];
      o.skip = r.skip === true;
      if (typeof r.folder === "string" && r.folder) o.folder = r.folder.slice(0, 40);
      o.createdAt = r.createdAt;
      o.updatedAt = r.updatedAt;
      st.items[vid] = mkPayload(o);
    });
    var rd = data.deleted && typeof data.deleted === "object" ? data.deleted : {};
    Object.keys(rd).forEach(function (vid) { if (isFiniteNum(rd[vid])) st.deleted[vid] = rd[vid]; });
    if (Array.isArray(data.order)) data.order.forEach(function (vid) { if (typeof vid === "string" && st.items[vid] && st.order.indexOf(vid) < 0) st.order.push(vid); });
    if (isFiniteNum(data.orderAt)) st.orderAt = data.orderAt;
    return st;
  }
  function canonicalState(st) {
    function sortedObj(o) { var r = {}; Object.keys(o).sort().forEach(function (k) { r[k] = o[k]; }); return r; }
    return JSON.stringify({ items: sortedObj(st.items), deleted: sortedObj(st.deleted), order: st.order, orderAt: st.orderAt, folders: st.folders, foldersAt: st.foldersAt });
  }
  // 2つの状態を合体(純粋関数)。同時刻はリモート優先(両端末が同じ結果に収束してピンポン書き込みしないため)
  function mergeStates(L, R) {
    var now = Date.now(), deleted = {}, out = { items: {}, deleted: deleted, order: [], orderAt: Math.max(L.orderAt, R.orderAt) };
    var useRF = R.foldersAt >= L.foldersAt;   // フォルダ一覧は新しい方を丸ごと採用(同時刻はリモート)
    out.folders = (useRF ? R.folders : L.folders).map(function (f) { return { id: f.id, name: f.name }; });
    out.foldersAt = Math.max(L.foldersAt, R.foldersAt);
    [L.deleted, R.deleted].forEach(function (d) {
      Object.keys(d).forEach(function (vid) { if (deleted[vid] === undefined || d[vid] > deleted[vid]) deleted[vid] = d[vid]; });
    });
    var ids = {};
    Object.keys(L.items).forEach(function (v) { ids[v] = true; });
    Object.keys(R.items).forEach(function (v) { ids[v] = true; });
    Object.keys(ids).forEach(function (vid) {
      var l = L.items[vid], r = R.items[vid];
      var best = l && r ? (l.updatedAt > r.updatedAt ? l : r) : (l || r);
      if (deleted[vid] !== undefined && deleted[vid] >= best.updatedAt) return; // 削除の方が新しい
      out.items[vid] = best;
      delete deleted[vid];
    });
    Object.keys(deleted).forEach(function (vid) { if (now - deleted[vid] > TOMB_TTL_MS) delete deleted[vid]; });
    var useRemote = R.order.length && R.orderAt >= L.orderAt;
    var base = useRemote ? R.order : L.order, other = useRemote ? L.order : R.order, seen = {};
    function add(vid) { if (out.items[vid] && !seen[vid]) { seen[vid] = true; out.order.push(vid); } }
    base.forEach(add);
    other.forEach(add);
    Object.keys(out.items).filter(function (v) { return !seen[v]; })
      .sort(function (a, b) { return (out.items[a].createdAt - out.items[b].createdAt) || (a < b ? -1 : 1); })
      .forEach(add);
    return out;
  }
  function serializeState(st) {
    var items2 = {};
    Object.keys(st.items).forEach(function (vid) { var p = JSON.parse(JSON.stringify(st.items[vid])); delete p.videoId; items2[vid] = p; });
    return { v: 1, items: items2, deleted: st.deleted, order: st.order, orderAt: st.orderAt, folders: st.folders.map(function (f) { return { id: f.id, n: f.name }; }), foldersAt: st.foldersAt };
  }

  function syncBusy() {
    if (!root) return false;
    if (seeking) return true;
    return !!((refs.itemList && refs.itemList.querySelector("input")) || (refs.markerList && refs.markerList.querySelector("input")));
  }
  // 合体結果をローカルに反映。表示中の動画は(再生を止めずに)マーカー/A・Bだけ差し替える
  function applyMergedLocal(m) {
    var byVid = {};
    items.forEach(function (it) { byVid[it.videoId] = it; });
    var next = [];
    m.order.forEach(function (vid) {
      var P = JSON.parse(JSON.stringify(m.items[vid])), it = byVid[vid];
      if (it) {
        if (sigOf(it) !== sigOf(P)) {
          it.url = P.url;
          if (P.customTitle) it.customTitle = P.customTitle; else delete it.customTitle;
          it.markers = P.markers; it.loopA = P.loopA; it.loopB = P.loopB;
          if (P.skip) it.skip = true; else delete it.skip;
          if (P.folder) it.folder = P.folder; else delete it.folder;
          it.createdAt = P.createdAt;
        }
        it.updatedAt = P.updatedAt;
      } else {
        it = { id: uid("item"), type: "youtube", videoId: vid, url: P.url, markers: P.markers, loopA: P.loopA, loopB: P.loopB, createdAt: P.createdAt, updatedAt: P.updatedAt };
        if (P.customTitle) it.customTitle = P.customTitle;
        if (P.skip) it.skip = true;
        if (P.folder) it.folder = P.folder;
      }
      next.push(it);
    });
    items = next;
    knownSigs = {};
    items.forEach(function (it) { knownSigs[it.videoId] = sigOf(it); });
    knownOrder = orderSig();
    ytFolders = { list: m.folders.map(function (f) { return { id: f.id, name: f.name }; }), at: m.foldersAt };
    knownFoldersSig = foldersSig();
    syncMeta.tomb = m.deleted; syncMeta.orderAt = m.orderAt; syncMeta.lastSync = Date.now();
    saveSyncMeta();
    persistItemsRaw();
    if (current) {
      var cur = current.itemId ? findItem(current.itemId) : null;
      if (!cur) cur = findItemByVideoId(current.videoId);
      if (cur) {
        current.itemId = cur.id;
        current.markers = cur.markers;
        current.loopA = abTimeOf(cur.loopA, cur.markers);
        current.loopB = abTimeOf(cur.loopB, cur.markers);
      } else current.itemId = null;
    }
    if (root) { renderList(); renderMarkers(); updateDisplay(currentPos()); }
    ensureTitles();
  }

  function setSyncStatus(state) {
    syncState = state;
    if (!refs.syncStatus) return;
    var el = refs.syncStatus, t = "";
    el.classList.remove("err");
    el.classList.toggle("can", state === "ok" || state === "error");
    el.title = (state === "ok" || state === "error") ? "タップで今すぐ同期" : "";
    if (state === "syncing") t = "☁ 同期中…";
    else if (state === "ok") {
      var d = new Date(syncMeta.lastSync || Date.now());
      t = "☁ 同期済み " + (d.getHours() < 10 ? "0" : "") + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes() + "  ↻";
    } else if (state === "error") { t = "☁ 同期できませんでした(タップで再試行)"; el.classList.add("err"); }
    el.textContent = t;
  }

  function syncNow() {
    var A = window.QN_AUTH;
    if (!syncUser || !A || typeof A.syncTransact !== "function") return;
    if (syncing) { syncAgain = true; return; }
    syncing = true; lastSyncTry = Date.now();
    setSyncStatus("syncing");
    var startVer = localVersion, local = buildLocalState(), localCanon = canonicalState(local);
    A.syncTransact(SYNC_DOC, function (raw) {
      var remote = parseRemote(raw), merged = mergeStates(local, remote);
      var rc = canonicalState(remote), mc = canonicalState(merged);
      return { write: (rc !== mc || !raw) ? serializeState(merged) : null, result: { merged: merged, canon: mc } };
    }).then(function (res) {
      if (localVersion !== startVer) { syncAgain = true; return; }       // 通信中にローカルが変わった→もう一度
      if (syncBusy()) { setTimeout(syncNow, 3000); return; }             // 入力中/ドラッグ中は画面を壊さないよう後で反映
      if (res.canon !== localCanon) applyMergedLocal(res.merged);
      else { syncMeta.lastSync = Date.now(); saveSyncMeta(); }
      setSyncStatus("ok");
    }).catch(function (err) {
      console.error("[QN_YT_SYNC]", err);
      setSyncStatus("error");
    }).then(function () {
      syncing = false;
      if (syncAgain) { syncAgain = false; setTimeout(syncNow, 500); }
    });
  }
  function scheduleSync() {
    if (!syncUser) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(syncNow, 1500);
  }
  function syncIfStale() {
    if (syncUser && Date.now() - lastSyncTry > 20000) syncNow();
  }
  function onAuthChanged(user) {
    syncUser = !!(user && window.QN_AUTH && typeof window.QN_AUTH.isSyncUser === "function" && window.QN_AUTH.isSyncUser());
    if (syncUser) syncNow(); else setSyncStatus("");
  }
  window.addEventListener("qn-auth-changed", function (e) { onAuthChanged(e && e.detail && e.detail.user); });
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") syncIfStale(); });
  window.addEventListener("focus", syncIfStale);
  window.addEventListener("online", function () { if (syncUser) syncNow(); });
  initSyncState();
  if (window.QN_AUTH && window.QN_AUTH.currentUser) onAuthChanged(window.QN_AUTH.currentUser);

  // 起動時: 期限切れ(28日)のYouTube由来タイトルのキャッシュを必ず削除
  purgeTitleCache();

  // ---------- アプリ登録 ----------
  if (window.QNApps) {
    window.QNApps.register({
      id: "youtube",
      label: "YouTube",
      icon: YT_ICON,
      order: 10,
      ready: true,
      sidebar: SIDEBAR,
      settings: settingsSections,
      shortcuts: SHORTCUTS,
      shortcutsNote: "YouTube本家と同じキーです。文字入力中は動きません。",
      onSidebar: onSidebar,
      mount: mount,
      onShow: onShow,
      onHide: onHide
    });
  } else {
    console.error("qn-app-youtube.js: qn-apps.js が先に読み込まれていません");
  }
})();
