// qn-chord-core.js — コード(和音)解析の計算部分。DOM操作なし。ブラウザ(player-chords.js / qn-chord-worker.js)とNodeの両方で読める。
// 流れ: mono波形 → chroma(): STFT→ピーク抽出→12音のクロマ(重い。Workerで実行) → classify(): テンプレート照合＋Viterbi平滑化(軽い。メインスレッドで実行)。
// 分けてある理由: 「詳細度」などの設定を変えた時はclassify()だけやり直せば済み、重い解析を繰り返さない。
// 精度の限界(仕様): 拍・ベース音は見ていない。窓が約0.5秒なので切り替わり位置は±0.25秒ほどずれうる。ビートの強いバンド音源ほど誤りやすい。
(function (root) {
  "use strict";

  const SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
  const FLAT_KEYS = [5, 10, 3, 8, 1, 6]; // 主音がこれなら♭表記(F, Bb, Eb, Ab, Db, Gb)。短調は平行調(+3)で判定

  // iv=構成音(根音からの半音数)、w=テンプレートの重み、bias=複雑なコードを選びにくくする下駄(cosine類似度に足す)
  const QUALITIES = {
    maj:  { suf: "",     iv: [0, 4, 7],     w: [1, 0.9, 0.8],       bias: 0 },
    min:  { suf: "m",    iv: [0, 3, 7],     w: [1, 0.9, 0.8],       bias: 0 },
    dom7: { suf: "7",    iv: [0, 4, 7, 10], w: [1, 0.9, 0.8, 0.75], bias: -0.035 },
    maj7: { suf: "maj7", iv: [0, 4, 7, 11], w: [1, 0.9, 0.8, 0.75], bias: -0.05 },
    min7: { suf: "m7",   iv: [0, 3, 7, 10], w: [1, 0.9, 0.8, 0.75], bias: -0.04 },
    dim:  { suf: "dim",  iv: [0, 3, 6],     w: [1, 0.9, 0.8],       bias: -0.06 },
    sus4: { suf: "sus4", iv: [0, 5, 7],     w: [1, 0.9, 0.8],       bias: -0.06 }
  };
  const LEVELS = {
    basic: ["maj", "min"],
    extended: ["maj", "min", "dom7", "maj7", "min7", "dim", "sus4"]
  };

  const KEY_MAJ = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
  const KEY_MIN = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

  const TARGET_SR = 8000;
  const FMIN = 65, FMAX = 2100;

  // ---------- FFT(複素・基数2・反復) ----------
  function makeFFT(n) {
    const levels = Math.round(Math.log2(n));
    const rev = new Uint32Array(n);
    for (let i = 0; i < n; i++) {
      let x = i, r = 0;
      for (let b = 0; b < levels; b++) { r = (r << 1) | (x & 1); x >>= 1; }
      rev[i] = r;
    }
    const cos = new Float64Array(n / 2), sin = new Float64Array(n / 2);
    for (let i = 0; i < n / 2; i++) { cos[i] = Math.cos(2 * Math.PI * i / n); sin[i] = Math.sin(2 * Math.PI * i / n); }
    return function (re, im) {
      for (let i = 0; i < n; i++) {
        const j = rev[i];
        if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
      }
      for (let size = 2; size <= n; size <<= 1) {
        const half = size >> 1, step = n / size;
        for (let i = 0; i < n; i += size) {
          for (let j = i, k = 0; j < i + half; j++, k += step) {
            const l = j + half;
            const tr = re[l] * cos[k] + im[l] * sin[k];
            const ti = -re[l] * sin[k] + im[l] * cos[k];
            re[l] = re[j] - tr; im[l] = im[j] - ti;
            re[j] += tr; im[j] += ti;
          }
        }
      }
    };
  }

  // sr>=12000なら整数倍の平均で間引いて約8kHzにする(chromaは高域を使わないので十分。FFTも軽くなる)
  function decimate(mono, sr) {
    const k = Math.max(1, Math.round(sr / TARGET_SR));
    if (k === 1) return { x: mono, sr: sr };
    const n = Math.floor(mono.length / k);
    const y = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      let s = 0;
      for (let j = 0; j < k; j++) s += mono[i * k + j];
      y[i] = s / k;
    }
    return { x: y, sr: sr / k };
  }

  // ---------- 1) クロマ ----------
  // 戻り値: { chroma: Float32Array(frames*12, フレームごとL2正規化), rms: Float32Array(frames), hop(秒), win(秒), frames, tuning(半音。-0.5〜0.5) }
  function chroma(mono, sr, onProgress) {
    const d = decimate(mono, sr);
    const x = d.x;
    sr = d.sr;
    let N = 1;
    while (N < sr * 0.5) N <<= 1;           // 約0.5秒の窓(8kHzなら4096)
    if (Math.abs(N / 2 - sr * 0.5) < Math.abs(N - sr * 0.5)) N >>= 1;
    const hopS = N >> 2;
    const frames = Math.max(0, Math.floor((x.length - N) / hopS) + 1);
    const out = { chroma: new Float32Array(frames * 12), rms: new Float32Array(frames), hop: hopS / sr, win: N / sr, frames: frames, tuning: 0 };
    if (!frames) return out;

    const fft = makeFFT(N);
    const win = new Float64Array(N);
    for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1));
    const re = new Float64Array(N), im = new Float64Array(N), mag = new Float64Array(N / 2 + 1);
    const kMin = Math.max(2, Math.floor(FMIN * N / sr)), kMax = Math.min(N / 2 - 2, Math.ceil(FMAX * N / sr));
    const MAXP = 60;
    const pf = new Float32Array(frames * MAXP), pw = new Float32Array(frames * MAXP), pn = new Uint8Array(frames);

    // 第1パス: FFT→ピーク(周波数と相対強度)。同時にチューニングのずれを集計
    let tc = 0, ts = 0;
    for (let f = 0; f < frames; f++) {
      const o = f * hopS;
      let e = 0;
      for (let i = 0; i < N; i++) { const v = x[o + i]; re[i] = v * win[i]; im[i] = 0; e += v * v; }
      out.rms[f] = Math.sqrt(e / N);
      fft(re, im);
      let mx = 0;
      for (let k = kMin - 1; k <= kMax + 1; k++) { const m = Math.sqrt(re[k] * re[k] + im[k] * im[k]); mag[k] = m; if (m > mx) mx = m; }
      let cnt = 0;
      if (mx > 1e-9) {
        const thr = mx * 0.04;
        for (let k = kMin; k <= kMax && cnt < MAXP; k++) {
          const b = mag[k];
          if (b < thr || b <= mag[k - 1] || b < mag[k + 1]) continue;
          const la = Math.log(mag[k - 1] + 1e-12), lb = Math.log(b + 1e-12), lc = Math.log(mag[k + 1] + 1e-12);
          const den = la - 2 * lb + lc;
          const dl = den < 0 ? 0.5 * (la - lc) / den : 0;
          const fr = (k + dl) * sr / N;
          const rel = b / mx;
          pf[f * MAXP + cnt] = fr;
          pw[f * MAXP + cnt] = rel;
          cnt++;
          if (rel > 0.15 && fr > 100 && fr < 1500) {
            const p = 12 * Math.log2(fr / 440);
            const dev = p - Math.round(p);
            tc += rel * Math.cos(2 * Math.PI * dev);
            ts += rel * Math.sin(2 * Math.PI * dev);
          }
        }
      }
      pn[f] = cnt;
      if (onProgress && (f & 31) === 0) onProgress(f / frames * 0.9);
    }
    out.tuning = (tc || ts) ? Math.atan2(ts, tc) / (2 * Math.PI) : 0;

    // 第2パス: チューニング補正してピッチクラスへ。強い音を抑えめにして(^0.6)、高域は少し弱める
    const tun = out.tuning;
    for (let f = 0; f < frames; f++) {
      const c = out.chroma;
      const base = f * 12;
      for (let j = 0; j < pn[f]; j++) {
        const fr = pf[f * MAXP + j];
        const w = Math.pow(pw[f * MAXP + j], 0.6) / (1 + (fr / 1200) * (fr / 1200));
        const p = 12 * Math.log2(fr / 440) + 9 - tun;      // C=0
        const fl = Math.floor(p);
        const frac = p - fl;
        const a = ((fl % 12) + 12) % 12, b = (a + 1) % 12;
        c[base + a] += w * (1 - frac);
        c[base + b] += w * frac;
      }
      let s = 0;
      for (let i = 0; i < 12; i++) s += c[base + i] * c[base + i];
      s = Math.sqrt(s);
      if (s > 1e-9) for (let i = 0; i < 12; i++) c[base + i] /= s;
    }
    if (onProgress) onProgress(1);
    return out;
  }

  // ---------- 2) キー推定 ----------
  function corr(a, b) {
    let ma = 0, mb = 0;
    for (let i = 0; i < 12; i++) { ma += a[i]; mb += b[i]; }
    ma /= 12; mb /= 12;
    let n = 0, da = 0, db = 0;
    for (let i = 0; i < 12; i++) { const x = a[i] - ma, y = b[i] - mb; n += x * y; da += x * x; db += y * y; }
    return da > 0 && db > 0 ? n / Math.sqrt(da * db) : 0;
  }

  function estimateKey(ch) {
    const m = new Float64Array(12);
    for (let f = 0; f < ch.frames; f++) for (let i = 0; i < 12; i++) m[i] += ch.chroma[f * 12 + i];
    let best = { tonic: 0, minor: false, score: -2 };
    for (let t = 0; t < 12; t++) {
      const rot = (prof) => { const r = new Array(12); for (let i = 0; i < 12; i++) r[i] = prof[(i - t + 12) % 12]; return r; };
      const a = corr(m, rot(KEY_MAJ)), b = corr(m, rot(KEY_MIN));
      if (a > best.score) best = { tonic: t, minor: false, score: a };
      if (b > best.score) best = { tonic: t, minor: true, score: b };
    }
    const maj = best.minor ? (best.tonic + 3) % 12 : best.tonic;
    best.flats = FLAT_KEYS.indexOf(maj) >= 0;
    const names = best.flats ? FLAT : SHARP;
    best.name = names[best.tonic] + (best.minor ? " minor" : " major");
    return best;
  }

  function scaleSet(key) {
    const maj = key.minor ? (key.tonic + 3) % 12 : key.tonic;
    const s = new Set([0, 2, 4, 5, 7, 9, 11].map(i => (maj + i) % 12));
    if (key.minor) s.add((key.tonic + 11) % 12);   // 和声的短音階の導音(V7などを許す)
    return s;
  }

  // ---------- 3) 分類 ----------
  // opts: { detail:"basic"|"extended", key:(省略時は推定) }
  // 戻り値: { segments:[{t0,t1,name,root,q,conf}], key, detail }。name="N"は無音/コード無し
  function classify(ch, dur, opts) {
    opts = opts || {};
    const detail = LEVELS[opts.detail] ? opts.detail : "extended";
    const qs = LEVELS[detail];
    const key = opts.key || estimateKey(ch);
    const names = key.flats ? FLAT : SHARP;
    const F = ch.frames;
    const res = { segments: [], key: key, detail: detail };
    if (!F) return res;
    const scale = scaleSet(key);

    // テンプレート(L2正規化)と事前スコア(複雑さの下駄＋キーに合うコードへの加点)
    const S = 12 * qs.length;
    const tpl = new Float32Array(S * 12), prior = new Float32Array(S);
    for (let qi = 0; qi < qs.length; qi++) {
      const Q = QUALITIES[qs[qi]];
      for (let r = 0; r < 12; r++) {
        const s = qi * 12 + r;
        let n = 0, diat = true;
        for (let j = 0; j < Q.iv.length; j++) {
          const pc = (r + Q.iv[j]) % 12;
          tpl[s * 12 + pc] = Q.w[j];
          n += Q.w[j] * Q.w[j];
          if (!scale.has(pc)) diat = false;
        }
        n = Math.sqrt(n);
        for (let i = 0; i < 12; i++) tpl[s * 12 + i] /= n;
        prior[s] = Q.bias + (diat ? 0.03 : 0);
      }
    }

    // 時間方向に3フレーム平均(打楽器などの単発ノイズを均す)
    const sm = new Float32Array(F * 12);
    for (let f = 0; f < F; f++) {
      const a = Math.max(0, f - 1), b = Math.min(F - 1, f + 1);
      for (let i = 0; i < 12; i++) {
        let s = 0;
        for (let g = a; g <= b; g++) s += ch.chroma[g * 12 + i];
        sm[f * 12 + i] = s / (b - a + 1);
      }
    }

    // 無音判定: 全体の音量の中央値に対して小さいフレーム
    const sorted = Array.from(ch.rms).sort((x, y) => x - y);
    const med = sorted[Math.floor(sorted.length / 2)] || 0;
    const silent = new Uint8Array(F);
    for (let f = 0; f < F; f++) if (ch.rms[f] < Math.max(1e-4, med * 0.06)) silent[f] = 1;

    // Viterbi: 状態=S個のコード+N。同じ状態に居続けるのは無料、移るにはSWITCHを払う
    const BETA = 9, SWITCH = 1.6;
    const NS = S + 1;
    let prev = new Float64Array(NS), cur = new Float64Array(NS);
    const back = new Int16Array(F * NS);   // 直前の状態(-1相当は自分自身=stay)。stayならs、jumpなら最良の前状態
    const sim = new Float32Array(F * S);
    for (let f = 0; f < F; f++) {
      let em;
      let bestPrev = 0, bestPrevS = 0;
      if (f > 0) { bestPrev = -1e18; for (let s = 0; s < NS; s++) if (prev[s] > bestPrev) { bestPrev = prev[s]; bestPrevS = s; } }
      for (let s = 0; s < NS; s++) {
        if (s === S) em = silent[f] ? 1.0 * BETA : -0.4 * BETA;
        else {
          let dot = 0;
          for (let i = 0; i < 12; i++) dot += sm[f * 12 + i] * tpl[s * 12 + i];
          sim[f * S + s] = dot;
          em = silent[f] ? -0.4 * BETA : (dot + prior[s]) * BETA;
        }
        if (f === 0) { cur[s] = em; back[s] = s; continue; }
        const stay = prev[s], jump = bestPrev - SWITCH;
        if (stay >= jump) { cur[s] = stay + em; back[f * NS + s] = s; }
        else { cur[s] = jump + em; back[f * NS + s] = bestPrevS; }
      }
      const t = prev; prev = cur; cur = t;
    }
    let st = 0;
    for (let s = 1; s < NS; s++) if (prev[s] > prev[st]) st = s;
    const path = new Int16Array(F);
    for (let f = F - 1; f >= 0; f--) { path[f] = st; st = back[f * NS + st]; }

    // 区間にまとめる。フレームfの中心=f*hop+win/2、境界は隣のフレーム中心の中間
    const hop = ch.hop, c0 = ch.win / 2;
    const segs = [];
    let a = 0;
    for (let f = 1; f <= F; f++) {
      if (f < F && path[f] === path[a]) continue;
      const s = path[a];
      const t0 = a === 0 ? 0 : c0 + (a - 0.5) * hop;
      const t1 = f === F ? dur : c0 + (f - 0.5) * hop;
      let name = "N", root = -1, q = "", conf = 0;
      if (s !== S) {
        const qi = Math.floor(s / 12);
        root = s % 12;
        q = qs[qi];
        name = names[root] + QUALITIES[q].suf;
        for (let g = a; g < f; g++) conf += sim[g * S + s];
        conf /= (f - a);
      }
      segs.push({ t0: t0, t1: Math.min(dur, t1), name: name, root: root, q: q, conf: conf });
      a = f;
    }
    res.segments = segs.filter(s => s.t1 > s.t0);
    return res;
  }

  const api = { chroma: chroma, classify: classify, estimateKey: estimateKey, LEVELS: LEVELS, QUALITIES: QUALITIES };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.QNChordCore = api;
})(typeof self !== "undefined" ? self : this);
