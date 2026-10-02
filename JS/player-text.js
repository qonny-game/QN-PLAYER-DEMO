// player-text.js — Textタブ(ファイル名キーで自動保存/フルスクリーン/文字サイズ)。依存: player-core.js(saveNoteText), player-ui-shared.js(hapticTap,sidebarSection,currentMobileTab)

const noteTextAreaEl = document.getElementById("noteTextArea");
if (noteTextAreaEl) {
  noteTextAreaEl.addEventListener("input", saveNoteText);
}

function updateSidebarHeightForTextTab() {
  if (!sidebarSection) return;
  if (currentMobileTab !== "text") {
    sidebarSection.classList.remove("text-tab-active");
    sidebarSection.style.height = "";
    return;
  }
  sidebarSection.classList.add("text-tab-active");
  const topControls = document.querySelector(".top-controls");
  const rect = sidebarSection.getBoundingClientRect();
  const bottomLimit = topControls ? topControls.getBoundingClientRect().top : window.innerHeight;
  const available = bottomLimit - rect.top;
  if (available > 0) {
    sidebarSection.style.height = available + "px";
  }
}

window.addEventListener("resize", () => {
  if (currentMobileTab === "text") updateSidebarHeightForTextTab();
});

(function () {
  const FONT_SIZE_KEY = "mp3player_text_fullscreen_fontsize";
  const FONT_SIZE_MIN = 14;
  const FONT_SIZE_MAX = 40;
  const FONT_SIZE_STEP = 2;
  const FONT_SIZE_DEFAULT = 20;

  const overlay = document.getElementById("textFullscreenOverlay");
  const mainArea = document.getElementById("noteTextArea");
  const fsArea = document.getElementById("noteTextAreaFullscreen");
  const openBtn = document.getElementById("noteTextFullscreenBtn");
  const closeBtn = document.getElementById("noteTextFullscreenCloseBtn");
  const decBtn = document.getElementById("noteTextFontDecBtn");
  const incBtn = document.getElementById("noteTextFontIncBtn");

  if (!overlay || !mainArea || !fsArea) return;

  function loadFontSize() {
    const saved = parseInt(localStorage.getItem(FONT_SIZE_KEY), 10);
    return Number.isFinite(saved) ? saved : FONT_SIZE_DEFAULT;
  }

  function applyFontSize(size) {
    const clamped = Math.max(FONT_SIZE_MIN, Math.min(FONT_SIZE_MAX, size));
    fsArea.style.fontSize = clamped + "px";
    localStorage.setItem(FONT_SIZE_KEY, String(clamped));
    return clamped;
  }

  let currentFontSize = loadFontSize();
  applyFontSize(currentFontSize);

  if (openBtn) {
    openBtn.onclick = () => {
      fsArea.value = mainArea.value;
      overlay.classList.add("open");
      hapticTap();
      // focus()しない(ソフトキーボードが開く/スクロールが末尾寄りになる)。value再代入後は選択範囲も先頭へ戻す
      fsArea.setSelectionRange(0, 0);
      fsArea.scrollTop = 0;
    };
  }

  if (closeBtn) {
    closeBtn.onclick = () => {
      overlay.classList.remove("open");
      hapticTap();
    };
  }

  fsArea.addEventListener("input", () => {
    mainArea.value = fsArea.value;
    saveNoteText();
  });

  if (decBtn) {
    decBtn.onclick = () => {
      currentFontSize = applyFontSize(currentFontSize - FONT_SIZE_STEP);
      hapticTap();
    };
  }
  if (incBtn) {
    incBtn.onclick = () => {
      currentFontSize = applyFontSize(currentFontSize + FONT_SIZE_STEP);
      hapticTap();
    };
  }
})();
