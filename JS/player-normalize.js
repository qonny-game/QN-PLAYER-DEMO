// player-normalize.js — 自動ノーマライズ(曲ごとの音量差を自動で揃える)。依存: player-core.js(setupAudioGraph,normGainNode,normLimiterNode,audioGraphSetupDone), player-ui-shared.js(decodeWaveform から measure を呼ぶ)
// 仕組み: 波形用デコード時に「ゲート付きRMS音量(dBFS)」とピークを測り、目標レベルとの差を GainNode で補正。ピークが飛びすぎないよう DynamicsCompressor をリミッタとして直列に置く。
// 計測結果はファイル名キーでlocalStorageに保存(2回目以降は読込直後から効く)。既定はOFF(ONにすると Web Audio 常時接続になる=GOTCHAS参照)。VIDEO(YouTube)は音声データに触れない規約なので対象外。
(function () {
  "use strict";
  const KEY_ON = "qn_norm_on", KEY_TGT = "qn_norm_target", KEY_LV = "qn_norm_lv_";
  const TARGETS = [-24, -21, -18, -15, -12];
  const MAX_BOOST = 20, MAX_CUT = -12, PEAK_CEIL = 6; // gain(dB)の上限/下限、補正後ピークの上限(dBFS。リミッタが受け止める範囲)
  let on = false, target = -18;
  try { on = localStorage.getItem(KEY_ON) === "1"; const t = parseInt(localStorage.getItem(KEY_TGT), 10); if (TARGETS.indexOf(t) >= 0) target = t; } catch (e) {}
  let cur = null; // {name, l, p} 現在の曲の計測値(未計測はnull)
  let curName = null;

  function readCache(name) {
    try { const o = JSON.parse(localStorage.getItem(KEY_LV + name)); if (o && isFinite(o.l) && isFinite(o.p)) return o; } catch (e) {}
    return null;
  }
  function writeCache(name, o) { try { localStorage.setItem(KEY_LV + name, JSON.stringify(o)); } catch (e) {} }

  // 0.4秒ブロックのゲート付きRMS(絶対ゲート-60dB→相対ゲート-10dB。BS.1770に近い手順だがK特性なし)。ピークはサンプル最大
  function analyze(buf) {
    const ch = buf.numberOfChannels, sr = buf.sampleRate, n = buf.length;
    const blk = Math.max(1, Math.round(sr * 0.4));
    const data = []; for (let c = 0; c < ch; c++) data.push(buf.getChannelData(c));
    const ms = []; let peak = 0;
    for (let s = 0; s < n; s += blk) {
      const e = Math.min(n, s + blk); let sum = 0;
      for (let c = 0; c < ch; c++) {
        const d = data[c]; let acc = 0;
        for (let i = s; i < e; i++) { const v = d[i]; acc += v * v; const a = v < 0 ? -v : v; if (a > peak) peak = a; }
        sum += acc / (e - s);
      }
      if (e - s >= blk * 0.5) ms.push(sum / ch);
    }
    const db = x => 10 * Math.log10(x);
    const abs = ms.filter(x => x > 0 && db(x) > -60);
    if (!abs.length || peak <= 0) return null;
    const mean1 = abs.reduce((a, b) => a + b, 0) / abs.length;
    const rel = abs.filter(x => db(x) > db(mean1) - 10);
    const use = rel.length ? rel : abs;
    const l = db(use.reduce((a, b) => a + b, 0) / use.length);
    return { l: Math.round(l * 10) / 10, p: Math.round(db(peak * peak) * 10) / 10 };
  }

  function gainDb() {
    if (!on || !cur) return 0;
    let g = target - cur.l;
    g = Math.min(g, PEAK_CEIL - cur.p);
    return Math.max(MAX_CUT, Math.min(MAX_BOOST, g));
  }

  function apply() {
    if (!normGainNode || !normLimiterNode) return;
    const ctx = normGainNode.context, t = ctx.currentTime;
    const g = gainDb();
    try {
      const lin = Math.pow(10, g / 20);
      if (ctx.state === "running") normGainNode.gain.setTargetAtTime(lin, t, 0.05); else normGainNode.gain.value = lin; // 停止中のctxは時間が進まないので直接代入
      // OFF/補正なしの時は素通し(thresholdを最大・ratio1)、ONの時だけリミッタとして働かせる
      const lim = on;
      normLimiterNode.threshold.setValueAtTime(lim ? -1 : 0, t);
      normLimiterNode.knee.setValueAtTime(0, t);
      normLimiterNode.ratio.setValueAtTime(lim ? 20 : 1, t);
      normLimiterNode.attack.setValueAtTime(0.003, t);
      normLimiterNode.release.setValueAtTime(0.1, t);
    } catch (e) { console.warn('QNNorm.apply', e); }
  }

  function ensureGraph() {
    if (!on || audioGraphSetupDone) return;
    setupAudioGraph().then(apply).catch(err => console.warn("normalize: setupAudioGraph failed", err));
  }

  const API = {
    TARGETS: TARGETS,
    apply: apply,
    isOn: () => on,
    setOn(v) {
      on = !!v;
      try { localStorage.setItem(KEY_ON, on ? "1" : "0"); } catch (e) {}
      if (on) { if (curName && !cur) cur = readCache(curName); ensureGraph(); }
      apply();
    },
    getTarget: () => target,
    setTarget(v) {
      if (TARGETS.indexOf(v) < 0) return;
      target = v;
      try { localStorage.setItem(KEY_TGT, String(v)); } catch (e) {}
      apply();
    },
    // 曲を読み込んだ瞬間(loadFile): 保存済みの計測値があれば即適用
    onLoad(name) {
      curName = name; cur = readCache(name);
      apply(); ensureGraph();
    },
    // 波形デコード完了(decodeWaveform): 計測して保存・適用。tokenが古い(別の曲に切替済み)なら捨てる
    measure(name, audioBuffer, stale) {
      let r = null;
      try { r = analyze(audioBuffer); } catch (e) { return; }
      if (!r) return;
      writeCache(name, r);
      if (stale && stale()) return;
      if (name === curName) { cur = r; apply(); }
    },
    info: () => ({ on: on, target: target, measured: cur, gainDb: gainDb() })
  };
  window.QNNorm = API;

  // 起動後の最初の再生(ユーザー操作)でグラフを用意(読込時にはWeb Audioに触れない設計)
  audio.addEventListener("play", ensureGraph);
})();
