// player-markers.js — マーカー追加/前後ジャンプ/波形上のピン描画/ドラッグ(startDragPin。PC/SP共通)/カラーピッカー/メモ編集/ループ区間(segmentHighlight)。行(.vbar)はQNBars(player-bars.js)が仮想スクロールで作る: 装飾はdecorateBarRowで付け、行DOMは直接探さずQNBars.rowEl/eachRow経由。
// 依存: player-core.js(pins,savePins,hexToRgba,MARKER_COLOR_PALETTE), player-bars.js(QNBars), player-ui-shared.js(haptic*,isMobileLayout)。トップレベルでDOM取得するのでDOM構築後に読み込む

function addCurrentPin() {
  if (!audio.duration) return;
  hapticSuccess();
  pins.push({ t: audio.currentTime, enabled: true, memo: "", color: null });
  pins.sort((a, b) => a.t - b.t);
  loopActiveMarkerIndex = null;
  renderPins();
  renderSegments();
  renderPinList();
  savePins();
}

// 【v3.45.0】指定位置にマーカー追加(波形の長押し用)。±0.3秒以内に既存マーカーがあれば何もしない(falseを返す)
function addPinAt(t) {
  if (!audio.duration) return false;
  t = Math.max(0, Math.min(audio.duration, Math.round(t * 10) / 10));
  if (pins.some(p => Math.abs(p.t - t) <= 0.3)) return false;
  hapticSuccess();
  pins.push({ t: t, enabled: true, memo: "", color: null });
  pins.sort((a, b) => a.t - b.t);
  loopActiveMarkerIndex = null;
  renderPins();
  renderSegments();
  renderPinList();
  savePins();
  return true;
}

document.getElementById("addPinBtn").onclick = addCurrentPin;

function getMarkerNavReferenceTime() {
  const ct = audio.currentTime;
  if (!loopEnabled || loopActiveMarkerIndex === null) return ct;
  const preroll = typeof loopPreRollSeconds === "number" ? loopPreRollSeconds : 0;
  if (preroll <= 0) return ct;
  const activeTimes = pins.filter(p => p.enabled).map(p => p.t);
  return QNMarkerCore.navRefTime(activeTimes, loopActiveMarkerIndex, ct, preroll, loopEnabled);
}

function jumpToNextMarker() {
  const activePins = pins
    .map((p, i) => ({ p, i }))
    .filter(({ p, i }) => p.enabled && !p.skip && !(typeof isUnlocked === "function" && !isUnlocked() && i >= SW_LIMITS.MARKER_MAX_ACTIVE))
    .map(({ p }) => p);
  if (activePins.length === 0) return;
  hapticTap();

  const ct = getMarkerNavReferenceTime();
  const nextT = QNMarkerCore.nextTime(activePins.map(p => p.t), ct);
  const nextPin = activePins.find(p => p.t === nextT) || activePins[0];

  beginSeek();
  audio.currentTime = nextPin.t;
  prevTime = nextPin.t;
  audio.play();
  updatePlayButtonState();
  renderSegments(getActiveSegment(nextPin.t));
  setTimeout(() => { isSeeking = false; }, 150);
}

function jumpToPrevMarker() {
  const activePins = pins
    .map((p, i) => ({ p, i }))
    .filter(({ p, i }) => p.enabled && !p.skip && !(typeof isUnlocked === "function" && !isUnlocked() && i >= SW_LIMITS.MARKER_MAX_ACTIVE))
    .map(({ p }) => p);
  if (activePins.length === 0) return;
  hapticTap();

  const ct = getMarkerNavReferenceTime();

  const prevT = QNMarkerCore.prevTime(activePins.map(p => p.t), ct);
  const targetPin = activePins.find(p => p.t === prevT) || activePins[activePins.length - 1];

  beginSeek();
  audio.currentTime = targetPin.t;
  prevTime = targetPin.t;
  audio.play();
  updatePlayButtonState();
  renderSegments(getActiveSegment(targetPin.t));
  setTimeout(() => { isSeeking = false; }, 150);
}

const prevMarkerBtn = document.getElementById("prevMarkerBtn");
if (prevMarkerBtn) prevMarkerBtn.onclick = jumpToPrevMarker;

const nextMarkerBtn = document.getElementById("nextMarkerBtn");
if (nextMarkerBtn) nextMarkerBtn.onclick = jumpToNextMarker;

// ドラッグ中のマーカー/A-B旗。行が(スクロールで)後から作られる時の装飾(decorateBarRow)から除き、二重表示を防ぐ
let draggingPinIndex = -1;
let draggingABKind = null;

function createPinLine(pinObj, i) {
  const t = pinObj.t;
  const x = QNBars.pctInRow(t);

  const line = document.createElement("div");
  line.className = "vbar-line";
  if (!pinObj.enabled) {
    line.classList.add("disabled");
  }
  if (pinObj.skip) line.classList.add("is-skip");
  const isLockedMarker = typeof isUnlocked === "function" && !isUnlocked() && i >= SW_LIMITS.MARKER_MAX_ACTIVE;
  if (isLockedMarker) {
    line.classList.add("sw-locked");
  }
  line.style.left = `${x}%`;
  line.dataset.pinIndex = String(i);
  // 色あり→線のbackgroundに反映。disabled中はCSS優先(インライン上書き禁止)。.vbar-labelは常にCSS黒背景(インライン禁止)。--marker-colorはPC v2の::before用。line.style.backgroundはSP/旧PC用。両方set
  const applyMarkerColor = pinObj.color && MARKER_COLOR_PALETTE[pinObj.color] && pinObj.enabled;
  if (applyMarkerColor) {
    line.style.background = MARKER_COLOR_PALETTE[pinObj.color];
    line.style.setProperty("--marker-color", MARKER_COLOR_PALETTE[pinObj.color]);
  }

  const label = document.createElement("span");
  label.className = "vbar-label";
  // 右端付近はメモがはみ出すので左表示(.pcv2-label-flip、PC v2限定CSS)
  if (x >= 80) {
    label.classList.add("pcv2-label-flip");
  }
  const numSpan = document.createElement("span");
  numSpan.className = "vbar-label-num";
  numSpan.textContent = `${i + 1}`;
  label.appendChild(numSpan);
  if (pinObj.memo) {
    const memoSpan = document.createElement("span");
    memoSpan.className = "vbar-label-memo";
    memoSpan.textContent = pinObj.memo;
    label.appendChild(memoSpan);
  }

  function handleMarkerTapOrDrag(e) {
    e.stopPropagation();
    if (isLockedMarker) {
      swShowUnlockToast(`無料版はマーカーの先頭${SW_LIMITS.MARKER_MAX_ACTIVE}個までしか使用できません。`);
      return;
    }
    beginSeek();
    audio.currentTime = pinObj.t;
    prevTime = pinObj.t;
    audio.play();
    updatePlayButtonState();
    renderSegments(getActiveSegment(pinObj.t));
    setTimeout(() => { isSeeking = false; }, 150);
    if (Date.now() - lastPinDragAt > 400 && Date.now() - lastPinTapAt > 400) showPinPopup(pinObj.t, line.parentNode, e.clientX, pinObj);
  }

  label.onclick = handleMarkerTapOrDrag;
  line.onclick = handleMarkerTapOrDrag;

  // ドラッグ移動はstartDragPin(mouse/touch共通)。無料版ロック中マーカーはドラッグ不可
  if (!isLockedMarker) {
    label.onmousedown = startDragPin(i);
    line.onmousedown = startDragPin(i);
    label.ontouchstart = startDragPin(i);
    line.ontouchstart = startDragPin(i);
  }

  line.appendChild(label);
  return line;
}

function renderPins() {
  QNBars.sync();

  QNBars.eachRow(rowEl => {
    rowEl.querySelectorAll(".vbar-line").forEach(p => p.remove());
  });

  pins.forEach((pinObj, i) => {
    const rowEl = QNBars.rowEl(QNBars.rowOf(pinObj.t));
    if (rowEl) rowEl.appendChild(createPinLine(pinObj, i));
  });

  renderABPoints();
  if (typeof syncLoopModeWithAB === "function") syncLoopModeWithAB();
  updateABButtons();

  const activeCount = pins.filter(p => p.enabled).length;
  const loopInfo = document.getElementById("loopInfo");
  if (loopInfo) {
    loopInfo.textContent = `ACTIVE ${activeCount}/${pins.length}`;
  }
}

// 行がスクロールで作られた時にQNBarsが呼ぶ: その行に属する線・A/B旗・区間ハイライトを付ける
function decorateBarRow(rowEl, row) {
  pins.forEach((pinObj, i) => {
    if (i === draggingPinIndex) return;
    if (QNBars.rowOf(pinObj.t) === row) rowEl.appendChild(createPinLine(pinObj, i));
  });
  [["A", abA], ["B", abB]].forEach(([kind, v]) => {
    if (v === null || kind === draggingABKind) return;
    if (QNBars.rowOf(v) === row) rowEl.appendChild(createABPoint(kind, v));
  });
  paintSegmentsOnRow(rowEl, row);
}

// 区間ハイライト(segmentHighlight / プリロールの破線)。現在の区間をsegSpecに持ち、描画中の全行と、後から作られる行(decorateBarRow)に塗る。onClickSeek省略=クリック不可
let segSpec = null;

function paintSegmentsOnRow(rowEl, row) {
  if (!segSpec) return;
  const sec = QNBars.getSec();
  const rowStart = QNBars.rowStart(row);
  segSpec.forEach(s => {
    const overlapStart = Math.max(s.start, rowStart);
    const overlapEnd = Math.min(s.end, rowStart + sec);
    if (overlapStart >= overlapEnd) return;

    const leftPct = ((overlapStart - rowStart) / sec) * 100;
    const widthPct = ((overlapEnd - overlapStart) / sec) * 100;
    const colorHex = s.colorHex;

    const seg = document.createElement("div");
    seg.className = s.className;
    seg.style.left = leftPct + "%";
    seg.style.width = widthPct + "%";
    if (colorHex) {
      if (s.className === "segmentHighlight") {
        seg.style.background = hexToRgba(colorHex, 0.35);
        seg.style.borderTop = `2px solid ${colorHex}`;
        seg.style.borderBottom = `2px solid ${colorHex}`;
      } else {
        seg.style.background = hexToRgba(colorHex, 0.14);
        seg.style.borderTop = `2px dashed ${hexToRgba(colorHex, 0.6)}`;
        seg.style.borderBottom = `2px dashed ${hexToRgba(colorHex, 0.6)}`;
      }
    }

    if (s.onClickSeek !== undefined) {
      seg.onclick = () => {
        beginSeek();
        audio.currentTime = s.onClickSeek;
        prevTime = s.onClickSeek;
        audio.play();
        updatePlayButtonState();
        renderSegments({ start: s.start, end: s.end, color: s.colorKey || null });
        setTimeout(() => { isSeeking = false; }, 150);
      };
    }

    rowEl.appendChild(seg);
  });
}

// 【v3.46.0】スキップ区間: 有効なマーカーのうち skip=true のものから、次の有効マーカーまで(次が無ければ対象外)。再生は自然にその開始点を跨いだ時に次のマーカーへ飛ぶ(updateBars)
function getSkipRanges() {
  const act = pins.filter(p => p.enabled);
  const out = [];
  for (let i = 0; i < act.length - 1; i++) if (act[i].skip) out.push({ start: act[i].t, end: act[i + 1].t });
  return out;
}

function toggleSkipPin(pinObj) {
  if (!pinObj) return;
  pinObj.skip = !pinObj.skip;
  if (!pinObj.skip) delete pinObj.skip;
  loopActiveMarkerIndex = null;
  renderPins();
  renderSegments();
  renderPinList();
  savePins();
}

function renderSegments(overrideSegment) {
  const dur = audio.duration;
  if (!dur) return;

  QNBars.eachRow(rowEl => {
    rowEl.querySelectorAll(".segmentHighlight, .segmentHighlight-preroll, .segmentSkip").forEach(s => s.remove());
  });
  segSpec = null;

  // スキップ区間(マーカーの skip=true → 次のマーカーまで)。ループ状態に関係なく常に斜線で表示(クリック不可)
  const skipSpec = typeof getSkipRanges === "function" ? getSkipRanges().map(r => ({ start: r.start, end: r.end, className: "segmentSkip" })) : [];

  const spec = skipSpec.slice();
  const active = loopEnabled ? (overrideSegment || getActiveSegment()) : null;
  if (active) {
    const colorHex = active.color && MARKER_COLOR_PALETTE[active.color] ? MARKER_COLOR_PALETTE[active.color] : null;
    spec.push({ start: active.start, end: active.end, className: "segmentHighlight", colorHex: colorHex, onClickSeek: active.start, colorKey: active.color });

    // プリロール/ポストロール(薄い破線)。ステッパー0なら描画しない
    const preroll = typeof loopPreRollSeconds === "number" ? loopPreRollSeconds : 0;
    if (preroll > 0) {
      const prerollStart = Math.max(0, active.start - preroll);
      const postrollEnd = Math.min(dur, active.end + preroll);
      if (prerollStart < active.start) {
        spec.push({ start: prerollStart, end: active.start, className: "segmentHighlight-preroll", colorHex: colorHex });
      }
      if (active.end < postrollEnd) {
        spec.push({ start: active.end, end: postrollEnd, className: "segmentHighlight-preroll", colorHex: colorHex });
      }
    }
  }
  if (!spec.length) return;

  segSpec = spec;
  QNBars.eachRow((rowEl, row) => paintSegmentsOnRow(rowEl, row));
}

function startDragPin(index) {
  return function(e) {
    e.stopPropagation();
    const isTouch = e.type === "touchstart";
    if (isTouch) e.preventDefault();
    beginSeek();
    const dur = audio.duration;

    // 【v2.16.2】ドラッグ中はmarker線を作り直さない(left/行だけ更新、renderPinList等は離すまで保留)。iOS Safariは掴んだ要素がDOMから消えるとtouchmove/touchendがdocumentへ届かず1回で止まる(GOTCHAS.md)。touchイベントは開始要素自身に付ける
    const dragTarget = e.currentTarget;
    const lineEl = dragTarget && dragTarget.closest ? dragTarget.closest(".vbar-line") : null;
    const labelEl = lineEl ? lineEl.querySelector(".vbar-label") : null;
    draggingPinIndex = index;
    if (lineEl) lineEl.classList.add("is-dragging");

    const DRAG_THRESHOLD_PX = 6;
    const startClientX = isTouch ? e.touches[0].clientX : e.clientX;
    const startClientY = isTouch ? e.touches[0].clientY : e.clientY;
    const lastPt = { x: startClientX, y: startClientY };
    let hasDragged = false;
    let finished = false;
    let stopEdge = null;

    function placeLineAt(t) {
      if (!lineEl) return;
      const x = QNBars.pctInRow(t);
      const targetBar = QNBars.rowEl(QNBars.rowOf(t));
      if (targetBar && lineEl.parentNode !== targetBar) targetBar.appendChild(lineEl);
      lineEl.style.left = `${x}%`;
      if (labelEl) labelEl.classList.toggle("pcv2-label-flip", x >= 80);
    }

    function moveAt(clientX, clientY) {
      const t = QNBars.timeFromPoint(clientX, clientY);
      if (t === null) return;

      pins[index].t = Math.max(0, Math.min(dur, t));

      if (lineEl) {
        placeLineAt(pins[index].t);
      } else {
        renderPins();
      }
      renderSegments();
    }

    // 画面端でスクロール(行は仮想スクロール)。掴んだ線の行は回収されない(QNBars.ensureRows)
    function dragged(x, y) {
      lastPt.x = x;
      lastPt.y = y;
      moveAt(x, y);
      if (!stopEdge) stopEdge = QNBars.startEdgeScroll(() => lastPt, () => moveAt(lastPt.x, lastPt.y));
    }

    function move(ev) {
      if (Math.abs(ev.clientX - startClientX) > DRAG_THRESHOLD_PX || Math.abs(ev.clientY - startClientY) > DRAG_THRESHOLD_PX) {
        hasDragged = true;
      }
      if (hasDragged) dragged(ev.clientX, ev.clientY);
    }

    function moveTouch(ev) {
      if (ev.touches.length === 0) return;
      ev.preventDefault();
      const t = ev.touches[0];
      if (Math.abs(t.clientX - startClientX) > DRAG_THRESHOLD_PX || Math.abs(t.clientY - startClientY) > DRAG_THRESHOLD_PX) {
        hasDragged = true;
      }
      if (hasDragged) dragged(t.clientX, t.clientY);
    }

    function stop() {
      if (finished) return;
      finished = true;
      if (stopEdge) { stopEdge(); stopEdge = null; }
      if (hasDragged) lastPinDragAt = Date.now();
      pins.sort((a, b) => a.t - b.t);
      loopActiveMarkerIndex = null;
      draggingPinIndex = -1;
      if (lineEl) lineEl.classList.remove("is-dragging");

      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", stop);
      if (dragTarget) {
        dragTarget.removeEventListener("touchmove", moveTouch);
        dragTarget.removeEventListener("touchend", stop);
        dragTarget.removeEventListener("touchcancel", stop);
      }

      if (!hasDragged) {
        // 実質タップだった場合: touchはtouchstartのpreventDefaultでclick不発。mouseもstop()末尾のrenderPins()でmousedown要素が消えonclick不発のことがある(v3.5.0)。→ここでシーク＆再生＋ポップアップ。lastPinTapAtで二重ポップアップ防止
        const pinObj = pins[index];
        if (pinObj) {
          lastPinTapAt = Date.now();
          if (typeof abLeaveIfOutside === "function") abLeaveIfOutside(pinObj.t);
          audio.currentTime = pinObj.t;
          prevTime = pinObj.t;
          audio.play();
          updatePlayButtonState();
          renderSegments(getActiveSegment(pinObj.t));
          showPinPopup(pinObj.t, lineEl ? lineEl.parentNode : null, startClientX, pinObj);
        }
      } else {
        prevTime = audio.currentTime;
      }
      setTimeout(() => { isSeeking = false; }, 150);

      renderPins();
      renderSegments();
      renderPinList();
      savePins();
      QNBars.ensureRows(true);
    }

    if (isTouch) {
      dragTarget.addEventListener("touchmove", moveTouch, { passive: false });
      dragTarget.addEventListener("touchend", stop);
      dragTarget.addEventListener("touchcancel", stop);
    } else {
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", stop);
    }
  };
}

function renderPinList() {
  if (typeof closePinMemoPresetPopup === "function") closePinMemoPresetPopup();
  const list = document.getElementById("pinList");
  if (list) list.innerHTML = "";

  pins.forEach((pinObj, i) => {
    const div = document.createElement("div");
    div.className = "pinItem";
    if (!pinObj.enabled) {
      div.classList.add("disabled");
    }

    // 無料版: index>=MARKER_MAX_ACTIVEは保持・表示するが鍵アイコンでロック(タイムラインジャンプ不可)
    const isLockedMarker = typeof isUnlocked === "function" && !isUnlocked() && i >= SW_LIMITS.MARKER_MAX_ACTIVE;
    if (isLockedMarker) div.classList.add("sw-locked");

    const colorMark = document.createElement("button");
    colorMark.className = "pin-color-mark";
    colorMark.title = "Set marker color";
    colorMark.style.background = (pinObj.color && MARKER_COLOR_PALETTE[pinObj.color]) ? MARKER_COLOR_PALETTE[pinObj.color] : "#3a3a48";
    colorMark.onclick = (e) => {
      e.stopPropagation();
      if (typeof isUnlocked === "function" && !isUnlocked()) {
        swShowUnlockToast("無料版ではマーカーの色変更はできません。");
        return;
      }
      openMarkerColorPicker(colorMark, pinObj, i);
    };
    // 【v2.16.8】.pinItemはgrid4列固定(先頭セル/ラベル/目/削除)。子要素は必ず4個。鍵は.pin-leading-cellにcolorMarkと一緒に入れる(別要素で5個になると列がズレる。GOTCHAS.md)
    const leadingCell = document.createElement("div");
    leadingCell.className = "pin-leading-cell";
    if (isLockedMarker) {
      const lockIcon = document.createElement("span");
      lockIcon.className = "sw-lock-icon";
      lockIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17a2 2 0 0 0 2-2 2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5 5 5 0 0 1 5 5v2h1M12 3a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3z"/></svg>';
      leadingCell.appendChild(lockIcon);
    }
    leadingCell.appendChild(colorMark);
    div.appendChild(leadingCell);

    const labelRow = document.createElement("div");
    labelRow.className = "pin-label-row";

    const infoSpan = document.createElement("span");
    infoSpan.className = "pin-info";
    // メモがあれば時間の代わりに表示。番号は出すが#は出さない
    infoSpan.textContent = pinObj.memo
      ? `${i + 1} - ${pinObj.memo}`
      : `${i + 1} - ${pinObj.t.toFixed(2)}s`;
    if (pinObj.memo) infoSpan.title = pinObj.memo;

    infoSpan.onclick = () => { 
      if (isLockedMarker) {
        swShowUnlockToast(`無料版はマーカーの先頭${SW_LIMITS.MARKER_MAX_ACTIVE}個までしか使用できません。`);
        return;
      }
      beginSeek();
      audio.currentTime = pinObj.t; 
      prevTime = pinObj.t;
      audio.play(); 
      updatePlayButtonState();
      renderSegments(getActiveSegment(pinObj.t));
      setTimeout(() => { isSeeking = false; }, 150);
    };
    labelRow.appendChild(infoSpan);

    const editBtn = document.createElement("button");
    editBtn.className = "pin-edit-btn";
    editBtn.title = "Edit memo";
    editBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
    editBtn.onclick = (e) => {
      e.stopPropagation();
      if (typeof isUnlocked === "function" && !isUnlocked()) {
        swShowUnlockToast("無料版ではマーカーメモを利用できません。");
        return;
      }
      startPinMemoEdit(div, infoSpan, pinObj, i);
    };
    labelRow.appendChild(editBtn);

    // A/Bボタン(ブロック型)。この位置をA点/B点に設定(同位置をもう一度で解除)。labelRow内に置く(.pinItemは4列固定)
    const abCell = document.createElement("div");
    abCell.className = "pin-ab-cell";
    ["A", "B"].forEach(kind => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "qn-ab-block";
      b.dataset.abKind = kind;
      b.dataset.t = String(pinObj.t);
      b.textContent = kind;
      b.title = kind === "A" ? "このマーカーの位置をA点(ループ開始)に" : "このマーカーの位置をB点(ループ終了)に";
      b.onclick = (e) => {
        e.stopPropagation();
        if (isLockedMarker) {
          swShowUnlockToast(`無料版はマーカーの先頭${SW_LIMITS.MARKER_MAX_ACTIVE}個までしか使用できません。`);
          return;
        }
        hapticTap();
        setABAt(kind, pinObj.t);
      };
      abCell.appendChild(b);
    });
    // Skip: この区間(次のマーカーまで)を再生中に飛ばす。トグル
    const skipBtn = document.createElement("button");
    skipBtn.type = "button";
    skipBtn.className = "qn-ab-block qn-skip-block" + (pinObj.skip ? " is-skip" : "");
    skipBtn.textContent = "S";
    skipBtn.title = pinObj.skip ? "Skip ON: 次のマーカーまで飛ばして再生" : "Skip OFF: 押すとこの区間(次のマーカーまで)を飛ばして再生";
    skipBtn.onclick = (e) => {
      e.stopPropagation();
      if (isLockedMarker) {
        swShowUnlockToast(`無料版はマーカーの先頭${SW_LIMITS.MARKER_MAX_ACTIVE}個までしか使用できません。`);
        return;
      }
      hapticTap();
      toggleSkipPin(pinObj);
    };
    abCell.appendChild(skipBtn);
    labelRow.appendChild(abCell);
    updatePinABButtons(div);

    div.appendChild(labelRow);

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "toggle-btn";
    toggleBtn.title = pinObj.enabled ? "Marker enabled (click to disable)" : "Marker disabled (click to enable)";
    toggleBtn.innerHTML = pinObj.enabled
      ? '<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M12 6.5c3.79 0 7.17 2.13 8.82 5.5-.59 1.2-1.42 2.25-2.42 3.11l1.42 1.42c1.39-1.23 2.49-2.77 3.18-4.53C21.27 7.61 17 4.5 12 4.5c-1.27 0-2.49.2-3.64.57l1.65 1.65c.62-.14 1.28-.22 1.99-.22zM2.71 3.16L1.29 4.57 4 7.27C2.36 8.53 1.07 10.15 0.18 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l3.01 3.01 1.41-1.41L2.71 3.16zM12 17c-2.76 0-5-2.24-5-5 0-.77.18-1.5.49-2.14l1.57 1.57c-.03.18-.06.37-.06.57 0 1.66 1.34 3 3 3 .2 0 .38-.03.57-.07l1.57 1.57c-.65.32-1.37.5-2.14.5zm2.97-5.33c-.15-1.4-1.25-2.49-2.64-2.64l2.64 2.64z"/></svg>';
    const markersHasSelection = typeof window.markersHasSelectedItems === "function" && window.markersHasSelectedItems();
    toggleBtn.disabled = markersHasSelection;
    toggleBtn.onclick = (e) => {
      e.stopPropagation();
      if (typeof window.markersHasSelectedItems === "function" && window.markersHasSelectedItems()) return;
      pinObj.enabled = !pinObj.enabled;
      loopActiveMarkerIndex = null;
      renderPins();
      renderSegments();
      renderPinList();
      savePins();
    };
    div.appendChild(toggleBtn);

    const delBtn = document.createElement("button");
    delBtn.textContent = "✕";
    delBtn.className = "del-btn";
    delBtn.style.color = "#ef4444";
    delBtn.onclick = (e) => {
      e.stopPropagation();
      if (delBtn.classList.contains("confirm")) {
        hapticWarning();
        pins.splice(i, 1);
        loopActiveMarkerIndex = null;
        renderPins();
        renderSegments();
        renderPinList();
        savePins();
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
    const delZone = document.createElement("div");
    delZone.className = "pin-del-zone";
    delZone.appendChild(delBtn);
    div.appendChild(delZone);

    if (list) {
      list.appendChild(div);
    }
  });
}


// 【v3.5.0】シークバーポップアップ: 空き位置→+Marker / 既存マーカー→−/Color/Hide。シーク＆再生も従来どおり。見た目は.qn-yt-seekpop(style-youtube.css)と共通。PLAYERにA/Bは出さない
let lastPinDragAt = 0;
let lastPinTapAt = 0; // startDragPin stop()のタップ処理時刻(clickとの二重処理防止)
let pinPopEl = null, pinPopTimer = null, pinPopTime = 0, pinPopPin = null, pinPopAbKind = null;
let pinPopDelArmed = false, pinPopDelTimer = null;
const PINPOP_MS = 4000;

const PINPOP_EYE_ON = '<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>';
const PINPOP_EYE_OFF = '<svg viewBox="0 0 24 24"><path d="M12 6.5c3.79 0 7.17 2.13 8.82 5.5-.59 1.2-1.42 2.25-2.42 3.11l1.42 1.42c1.39-1.23 2.49-2.77 3.18-4.53C21.27 7.61 17 4.5 12 4.5c-1.27 0-2.49.2-3.64.57l1.65 1.65c.62-.14 1.28-.22 1.99-.22zM2.71 3.16L1.29 4.57 4 7.27C2.36 8.53 1.07 10.15 0.18 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l3.01 3.01 1.41-1.41L2.71 3.16zM12 17c-2.76 0-5-2.24-5-5 0-.77.18-1.5.49-2.14l1.57 1.57c-.03.18-.06.37-.06.57 0 1.66 1.34 3 3 3 .2 0 .38-.03.57-.07l1.57 1.57c-.65.32-1.37.5-2.14.5zm2.97-5.33c-.15-1.4-1.25-2.49-2.64-2.64l2.64 2.64z"/></svg>';

function refreshAfterPinChange() {
  loopActiveMarkerIndex = null;
  renderPins();
  renderSegments();
  renderPinList();
  savePins();
}

function ensurePinPopup() {
  if (pinPopEl) return pinPopEl;
  pinPopEl = document.createElement("div");
  pinPopEl.className = "qn-yt-seekpop qn-pl-seekpop";
  pinPopEl.hidden = true;
  pinPopEl.setAttribute("role", "menu");
  pinPopEl.innerHTML =
    '<div class="qn-yt-seekpop-time" data-pop="time">00:00.0</div>' +
    '<div class="qn-yt-seekpop-row">' +
      '<button type="button" class="qn-yt-seekpop-btn" data-pop="A" title="この位置をA点(ループ開始)に（もう一度押すと解除）"><b>A</b><span>Start</span></button>' +
      '<button type="button" class="qn-yt-seekpop-btn" data-pop="B" title="この位置をB点(ループ終了)に（もう一度押すと解除）"><b>B</b><span>End</span></button>' +
      '<button type="button" class="qn-yt-seekpop-btn" data-pop="M" title="この位置にマーカーを追加"><b>＋</b><span>Marker</span></button>' +
      '<button type="button" class="qn-yt-seekpop-btn" data-pop="L" title="この位置の区間(マーカーからマーカーまで)をループ"><b><svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg></b><span>Loop</span></button>' +
      '<button type="button" class="qn-yt-seekpop-btn qn-yt-seekpop-del" data-pop="X" title="このA/B点を削除" hidden><b>－</b><span>Point</span></button>' +
      '<button type="button" class="qn-yt-seekpop-btn qn-yt-seekpop-del" data-pop="D" title="このマーカーを削除" hidden><b>－</b><span>Marker</span></button>' +
      '<button type="button" class="qn-yt-seekpop-btn" data-pop="C" title="マーカーの色を変える" hidden><b><i class="qn-yt-seekpop-dot"></i></b><span>Color</span></button>' +
      '<button type="button" class="qn-yt-seekpop-btn" data-pop="K" title="このマーカーから次のマーカーまでを再生中に飛ばす" hidden><b><svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></b><span>Skip</span></button>' +
      '<button type="button" class="qn-yt-seekpop-btn" data-pop="H" title="マーカーのON/OFF" hidden><b></b><span>Hide</span></button>' +
    '</div>';
  document.body.appendChild(pinPopEl);
  pinPopEl.addEventListener("pointerdown", e => { e.stopPropagation(); resetPinPopTimer(); });
  pinPopEl.addEventListener("click", e => {
    e.stopPropagation();
    const b = e.target.closest ? e.target.closest("[data-pop]") : null;
    if (!b) return;
    const k = b.getAttribute("data-pop");
    if (k === "X") pinPopClearPoint();
    else if (k === "A" || k === "B") pinPopAB(k);
    else if (k === "M") pinPopAdd();
    else if (k === "L") pinPopLoop();
    else if (k === "D") pinPopDelete();
    else if (k === "C") pinPopColor();
    else if (k === "H") pinPopToggle();
    else if (k === "K") pinPopSkip();
  });
  document.addEventListener("pointerdown", e => {
    if (pinPopEl.hidden) return;
    if (e.target.closest && e.target.closest(".qn-pl-seekpop")) return;
    hidePinPopup();
  }, true);
  window.addEventListener("keydown", e => { if (e.key === "Escape") hidePinPopup(); }, true);
  window.addEventListener("resize", hidePinPopup);
  return pinPopEl;
}

function resetPinPopTimer() {
  if (pinPopTimer) clearTimeout(pinPopTimer);
  pinPopTimer = setTimeout(hidePinPopup, PINPOP_MS);
}

function armPinPopDel(on) {
  pinPopDelArmed = on;
  if (pinPopDelTimer) { clearTimeout(pinPopDelTimer); pinPopDelTimer = null; }
  if (!pinPopEl) return;
  const b = pinPopEl.querySelector('[data-pop="D"]');
  b.classList.toggle("is-armed", on);
  b.querySelector("span").textContent = on ? "Sure?" : "Marker";
  if (on) pinPopDelTimer = setTimeout(() => armPinPopDel(false), 3000);
}

function hidePinPopup() {
  armPinPopDel(false);
  if (pinPopTimer) { clearTimeout(pinPopTimer); pinPopTimer = null; }
  if (pinPopEl) pinPopEl.hidden = true;
}

function showPinPopup(t, barEl, clientX, pinObj, abKind) {
  if (!audio.duration || !barEl) return;
  const pop = ensurePinPopup();
  pinPopPin = pinObj || null;
  pinPopAbKind = abKind || null;
  pinPopTime = Math.max(0, Math.min(audio.duration, t));
  armPinPopDel(false);
  pop.querySelector('[data-pop="time"]').textContent = formatTime(pinPopTime);
  pop.querySelector('[data-pop="X"]').hidden = !abKind;
  pop.querySelector('[data-pop="A"]').hidden = !!abKind;
  pop.querySelector('[data-pop="B"]').hidden = !!abKind;
  pop.querySelector('[data-pop="M"]').hidden = !!pinObj || !!abKind;
  pop.querySelector('[data-pop="L"]').hidden = !!abKind;
  const loopOn = loopEnabled && loopMode === "sec";
  pop.querySelector('[data-pop="L"]').classList.toggle("is-set", loopOn);
  pop.querySelector('[data-pop="L"] span').textContent = loopOn ? "Loop ON" : "Loop";
  ["D", "C", "H", "K"].forEach(k => { pop.querySelector(`[data-pop="${k}"]`).hidden = !pinObj; });
  pop.querySelector('[data-pop="A"]').classList.toggle("is-set", abA !== null && Math.abs(abA - pinPopTime) <= AB_SNAP_SEC);
  pop.querySelector('[data-pop="B"]').classList.toggle("is-set", abB !== null && Math.abs(abB - pinPopTime) <= AB_SNAP_SEC);
  if (pinObj) {
    const hex = pinObj.color && MARKER_COLOR_PALETTE[pinObj.color] ? MARKER_COLOR_PALETTE[pinObj.color] : "#3a3a48";
    pop.querySelector(".qn-yt-seekpop-dot").style.background = hex;
    const hb = pop.querySelector('[data-pop="H"]');
    hb.querySelector("b").innerHTML = pinObj.enabled ? PINPOP_EYE_ON : PINPOP_EYE_OFF;
    hb.querySelector("span").textContent = pinObj.enabled ? "Hide" : "Show";
    const kb = pop.querySelector('[data-pop="K"]');
    kb.classList.toggle("is-set", !!pinObj.skip);
    kb.querySelector("span").textContent = pinObj.skip ? "Skip ON" : "Skip";
  }
  pop.hidden = false;
  const rect = barEl.getBoundingClientRect();
  const w = pop.offsetWidth, h = pop.offsetHeight, gap = 10;
  const left = Math.min(Math.max(clientX - w / 2, 8), window.innerWidth - w - 8);
  let top = rect.top - h - gap;
  const below = top < 8;
  if (below) top = rect.bottom + gap;
  pop.classList.toggle("is-below", below);
  pop.style.left = left + "px";
  pop.style.top = top + "px";
  resetPinPopTimer();
}

// 【v3.45.0】ポップアップのLoop: その位置を含む区間をSectionループにして再生(1タップでループ開始)
function pinPopLoop() {
  const t = pinPopTime;
  hidePinPopup();
  // Sectionループ中に押したらOFF(位置はそのまま再生を続ける)
  if (loopEnabled && loopMode === "sec") {
    hapticTap();
    if (typeof setLoopModeState === "function") setLoopModeState("off", true);
    return;
  }
  hapticSuccess();
  if (typeof setLoopModeState === "function") setLoopModeState("sec", true);
  beginSeek();
  audio.currentTime = t;
  prevTime = t;
  audio.play();
  updatePlayButtonState();
  renderSegments(getActiveSegment(t));
  setTimeout(() => { isSeeking = false; }, 150);
}

function pinPopSkip() {
  const pin = pinPopPin;
  hidePinPopup();
  if (!pin) return;
  hapticTap();
  toggleSkipPin(pin);
}

function pinPopAB(kind) {
  const t = pinPopTime;
  hidePinPopup();
  hapticTap();
  setABAt(kind, t);
}

function pinPopClearPoint() {
  const kind = pinPopAbKind;
  hidePinPopup();
  if (!kind) return;
  hapticTap();
  if (kind === "A") abA = null; else abB = null;
  afterABChange();
}

// 【v3.8.0】A/Bはマーカーではなく秒の独立点(abA/abB, player-core.js)。旗(.vbar-ab-pt)ドラッグで移動。setABAt: 同種の点が±0.5秒以内なら解除(トグル)
const AB_SNAP_SEC = 0.5;
function afterABChange() {
  saveAB();
  renderABPoints();
  if (typeof syncLoopModeWithAB === "function") syncLoopModeWithAB();
  updateABButtons();
  updatePinABButtons();
  renderSegments();
}

// マーカー行のA/Bボタンの点灯(abA/abBが±AB_SNAP_SEC以内のマーカー)。rootを省くとリスト全体
function updatePinABButtons(root) {
  (root || document).querySelectorAll(".pin-ab-cell .qn-ab-block").forEach(b => {
    const v = b.dataset.abKind === "A" ? abA : abB;
    const on = v !== null && v !== undefined && Math.abs(v - parseFloat(b.dataset.t)) <= AB_SNAP_SEC;
    b.classList.toggle("active-a", on && b.dataset.abKind === "A");
    b.classList.toggle("active-b", on && b.dataset.abKind === "B");
  });
}

function setABAt(kind, t) {
  if (!audio.duration) return;
  const tt = Math.max(0, Math.min(audio.duration, Math.round(t * 10) / 10));
  const cur = kind === "A" ? abA : abB;
  const next = (cur !== null && Math.abs(cur - tt) <= AB_SNAP_SEC) ? null : tt;
  if (kind === "A") abA = next; else abB = next;
  afterABChange();
}

function setABFromCurrent(kind) {
  hapticTap();
  setABAt(kind, audio.currentTime);
}

function fmtABTime(t) {
  const m = Math.floor(t / 60), s = Math.floor(t % 60);
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

function clearAB() {
  hapticTap();
  abA = null; abB = null;
  afterABChange();
}

function updateABButtons() {
  [["A", abA], ["B", abB]].forEach(([kind, v]) => {
    const btn = document.getElementById(kind === "A" ? "setABtn" : "setBBtn");
    if (!btn) return;
    const lbl = btn.querySelector(".top-controls-btn-label");
    if (lbl) lbl.textContent = kind + " " + (v !== null ? fmtABTime(v) : "--");
    btn.classList.toggle("has-point", v !== null);
  });
}

function createABPoint(kind, v) {
  const el = document.createElement("div");
  el.className = "vbar-ab-pt is-" + kind.toLowerCase();
  el.title = kind + " " + fmtABTime(v);
  const flag = document.createElement("span");
  flag.className = "vbar-ab-flag";
  flag.textContent = kind;
  el.appendChild(flag);
  el.style.left = QNBars.pctInRow(v) + "%";
  attachABDrag(el, kind);
  return el;
}

function renderABPoints() {
  QNBars.eachRow(rowEl => {
    rowEl.querySelectorAll(".vbar-ab-pt").forEach(e => e.remove());
  });
  const dur = audio.duration;
  if (!dur) return;
  [["A", abA], ["B", abB]].forEach(([kind, v]) => {
    if (v === null) return;
    const rowEl = QNBars.rowEl(QNBars.rowOf(v));
    if (rowEl) rowEl.appendChild(createABPoint(kind, v));
  });
}

function attachABDrag(el, kind) {
  let moved = false, startX = 0, startY = 0;
  let stopEdge = null;
  const lastPt = { x: 0, y: 0 };

  function applyMove(clientX, clientY) {
    const raw = QNBars.timeFromPoint(clientX, clientY);
    if (raw === null) return;
    const t = Math.round(raw * 10) / 10;
    if (kind === "A") abA = t; else abB = t;
    const bar = QNBars.rowEl(QNBars.rowOf(t));
    if (bar && el.parentNode !== bar) bar.appendChild(el);
    el.style.left = QNBars.pctInRow(t) + "%";
    el.title = kind + " " + fmtABTime(t);
    renderSegments();
  }

  function endDrag() {
    if (stopEdge) { stopEdge(); stopEdge = null; }
    draggingABKind = null;
    el.classList.remove("dragging");
  }

  el.addEventListener("pointerdown", e => {
    if (!audio.duration) return;
    e.stopPropagation();
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    moved = false; startX = e.clientX; startY = e.clientY;
    lastPt.x = e.clientX; lastPt.y = e.clientY;
    el.classList.add("dragging");
    draggingABKind = kind;
    beginSeek();
  });
  el.addEventListener("pointermove", e => {
    if (!el.hasPointerCapture(e.pointerId)) return;
    if (Math.abs(e.clientX - startX) > 4 || Math.abs(e.clientY - startY) > 4) moved = true;
    if (!moved) return;
    lastPt.x = e.clientX; lastPt.y = e.clientY;
    applyMove(e.clientX, e.clientY);
    if (!stopEdge) stopEdge = QNBars.startEdgeScroll(() => lastPt, () => applyMove(lastPt.x, lastPt.y));
  });
  el.addEventListener("pointerup", e => {
    if (!el.hasPointerCapture(e.pointerId)) return;
    el.releasePointerCapture(e.pointerId);
    endDrag();
    const v = kind === "A" ? abA : abB;
    if (moved) {
      lastPinTapAt = Date.now();
      afterABChange();
      prevTime = audio.currentTime;
    } else {
      lastPinTapAt = Date.now();
      audio.currentTime = v;
      prevTime = v;
      audio.play();
      updatePlayButtonState();
      renderSegments(getActiveSegment(v));
      showPinPopup(v, el.parentNode, e.clientX, null, kind);
    }
    setTimeout(() => { isSeeking = false; }, 150);
    QNBars.ensureRows(true);
  });
  el.addEventListener("pointercancel", () => {
    endDrag();
    afterABChange();
    setTimeout(() => { isSeeking = false; }, 150);
    QNBars.ensureRows(true);
  });
}

function pinPopAdd() {
  const t = pinPopTime;
  hidePinPopup();
  hapticSuccess();
  pins.push({ t: t, enabled: true, memo: "", color: null });
  pins.sort((a, b) => a.t - b.t);
  refreshAfterPinChange();
}

function pinPopDelete() {
  if (!pinPopPin) return;
  if (!pinPopDelArmed) { hapticTap(); armPinPopDel(true); resetPinPopTimer(); return; }
  const i = pins.indexOf(pinPopPin);
  hidePinPopup();
  if (i < 0) return;
  hapticWarning();
  pins.splice(i, 1);
  refreshAfterPinChange();
}

function pinPopColor() {
  const pin = pinPopPin;
  const i = pin ? pins.indexOf(pin) : -1;
  hidePinPopup();
  if (i < 0) return;
  if (typeof isUnlocked === "function" && !isUnlocked()) {
    swShowUnlockToast("無料版ではマーカーの色変更はできません。");
    return;
  }
  const anchor = document.querySelector(`.vbar-line[data-pin-index="${i}"]`);
  if (!anchor) return;
  openMarkerStylePopup(anchor, { label: pin.memo || "", color: pin.color || null, placeholder: fmtABTime(pin.t) }, (v) => {
    pin.memo = v.label;
    pin.color = v.color;
    savePins();
    renderPins();
    renderSegments();
    renderPinList();
  });
}

function pinPopToggle() {
  const pin = pinPopPin;
  hidePinPopup();
  if (!pin) return;
  hapticTap();
  pin.enabled = !pin.enabled;
  refreshAfterPinChange();
}

let activeMarkerColorPopup = null;
function closeMarkerColorPicker() {
  if (activeMarkerColorPopup) {
    activeMarkerColorPopup.remove();
    activeMarkerColorPopup = null;
    document.removeEventListener("click", closeMarkerColorPicker);
  }
}

function openColorChoicePopup(anchorBtn, currentColorName, onPick) {
  closeMarkerColorPicker();

  const popup = document.createElement("div");
  popup.className = "marker-color-popup";

  const noneSwatch = document.createElement("button");
  noneSwatch.type = "button";
  noneSwatch.className = "marker-color-swatch marker-color-none";
  noneSwatch.title = "No color";
  if (!currentColorName) noneSwatch.classList.add("active");
  noneSwatch.onclick = (e) => {
    e.stopPropagation();
    closeMarkerColorPicker();
    onPick(null);
  };
  popup.appendChild(noneSwatch);

  Object.keys(MARKER_COLOR_PALETTE).forEach(colorName => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "marker-color-swatch";
    swatch.style.background = MARKER_COLOR_PALETTE[colorName];
    swatch.title = colorName;
    if (currentColorName === colorName) swatch.classList.add("active");
    swatch.onclick = (e) => {
      e.stopPropagation();
      closeMarkerColorPicker();
      onPick(colorName);
    };
    popup.appendChild(swatch);
  });

  document.body.appendChild(popup);
  activeMarkerColorPopup = popup;

  const rect = anchorBtn.getBoundingClientRect();
  popup.style.position = "fixed";
  popup.style.top = `${rect.bottom + 6}px`;
  popup.style.left = `${rect.left}px`;

  requestAnimationFrame(() => {
    const popupRect = popup.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (popupRect.right > viewportWidth - 8) {
      popup.style.left = `${Math.max(8, viewportWidth - popupRect.width - 8)}px`;
    }
    if (popupRect.bottom > viewportHeight - 8) {
      popup.style.top = `${Math.max(8, rect.top - popupRect.height - 6)}px`;
    }
  });

  setTimeout(() => {
    document.addEventListener("click", closeMarkerColorPicker);
  }, 0);
  popup.onclick = e => e.stopPropagation();
}

function openMarkerColorPicker(anchorBtn, pinObj, index) {
  openColorChoicePopup(anchorBtn, pinObj.color || null, (colorName) => {
    pinObj.color = colorName;
    savePins();
    renderPins();
    renderSegments();
    renderPinList();
  });
}

// Colorポップアップ用の編集パネル(ラベル+プリセット+色。PLAYER/YouTube共通)。opts={label,color,placeholder}。変更毎にonChange({label,color})(パネルは開いたまま)
function openMarkerStylePopup(anchorEl, opts, onChange) {
  closeMarkerColorPicker();
  closePinMemoPresetPopup();
  const state = { label: opts.label || "", color: opts.color || null };
  const popup = document.createElement("div");
  popup.className = "qn-style-pop";
  popup.onclick = e => e.stopPropagation();

  const input = document.createElement("input");
  input.type = "text";
  input.className = "qn-style-input";
  input.maxLength = 60;
  input.placeholder = opts.placeholder || "Label";
  input.value = state.label;
  popup.appendChild(input);

  const chipsEl = document.createElement("div");
  chipsEl.className = "qn-style-chips";
  popup.appendChild(chipsEl);
  const swEl = document.createElement("div");
  swEl.className = "qn-style-swatches";
  popup.appendChild(swEl);

  function emit() { onChange({ label: state.label, color: state.color }); }
  function renderSwatches() {
    swEl.innerHTML = "";
    const none = document.createElement("button");
    none.type = "button";
    none.className = "marker-color-swatch marker-color-none" + (state.color ? "" : " active");
    none.title = "No color";
    none.onclick = e => { e.stopPropagation(); state.color = null; renderSwatches(); emit(); };
    swEl.appendChild(none);
    Object.keys(MARKER_COLOR_PALETTE).forEach(name => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "marker-color-swatch" + (state.color === name ? " active" : "");
      b.style.background = MARKER_COLOR_PALETTE[name];
      b.title = name;
      b.onclick = e => { e.stopPropagation(); state.color = name; renderSwatches(); emit(); };
      swEl.appendChild(b);
    });
  }
  const presetColors = getMarkerPresetColors();
  getAllMarkerPresetLabels().forEach(label => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "pin-memo-preset-chip";
    const c = presetColors[label];
    if (c && MARKER_COLOR_PALETTE[c]) {
      const dot = document.createElement("span");
      dot.className = "pin-memo-preset-dot";
      dot.style.background = MARKER_COLOR_PALETTE[c];
      chip.appendChild(dot);
    }
    chip.appendChild(document.createTextNode(label));
    chip.onclick = e => {
      e.stopPropagation();
      state.label = label;
      if (c && MARKER_COLOR_PALETTE[c]) state.color = c;
      input.value = label;
      renderSwatches();
      emit();
    };
    chipsEl.appendChild(chip);
  });
  renderSwatches();

  function commitLabel() {
    const v = input.value.trim();
    if (v === state.label) return;
    state.label = v;
    emit();
  }
  input.addEventListener("change", commitLabel);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); commitLabel(); closeMarkerColorPicker(); }
    else if (e.key === "Escape") { e.preventDefault(); closeMarkerColorPicker(); }
  });

  document.body.appendChild(popup);
  activeMarkerColorPopup = popup;
  const rect = anchorEl.getBoundingClientRect();
  popup.style.position = "fixed";
  popup.style.top = (rect.bottom + 6) + "px";
  popup.style.left = rect.left + "px";
  requestAnimationFrame(() => {
    const pr = popup.getBoundingClientRect();
    if (pr.right > window.innerWidth - 8) popup.style.left = Math.max(8, window.innerWidth - pr.width - 8) + "px";
    if (pr.bottom > window.innerHeight - 8) popup.style.top = Math.max(8, rect.top - pr.height - 6) + "px";
  });
  setTimeout(() => document.addEventListener("click", closeMarkerColorPicker), 0);
}

const MARKER_LABEL_PRESETS = [
  "Intro", "Verse", "Pre-chorus", "Chorus", "Last Chorus",
  "Bridge", "Solo", "Outro"
];
