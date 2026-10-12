// qn-chord-core.js — コード(和音)解析の計算部分。DOM操作なし。ブラウザ(player-chords.js / qn-chord-worker.js)とNodeの両方で読める。
// 流れ: mono波形 → chroma(): STFT→ピーク抽出→12音のクロマ(重い。Workerで実行) → classify(): テンプレート照合＋Viterbi平滑化(軽い。メインスレッドで実行)。
// 分けてある理由: 「詳細度」などの設定を変えた時はclassify()だけやり直せば済み、重い解析を繰り返さない。
// 精度の限界(仕様): 拍・ベース音は見ていない。窓が約0.5秒なので切り替わり位置は±0.25秒ほどずれうる。ビートの強いバンド音源ほど誤りやすい。
(function (root) {
  "use strict";

  const SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
  const FLAT_KEYS = [5, 10, 3, 8, 1, 6]; // 主音がこれなら♭表記(F, Bb, Eb, Ab, Db, Gb)。短調は平行調(+3)で判定

  // iv=構成音(根音からの半音数。9thは2、13thは9)、w=テンプレートの重み、bias=複雑なコードを選びにくくする下駄(cosine類似度に足す)
  const BIAS_SCALE = 0.6;   // 複雑なコードへの下駄の強さ(合成音源での調整値。大きいほど単純なコードを選びやすい)
  const T3 = [1, 0.9, 0.8];
  const T4 = [1, 0.9, 0.8, 0.75];
  const QUALITIES = {
    maj:   { suf: "",      iv: [0, 4, 7],        w: T3,                    bias: 0 },
    min:   { suf: "m",     iv: [0, 3, 7],        w: T3,                    bias: 0 },
    dom7:  { suf: "7",     iv: [0, 4, 7, 10],    w: T4,                    bias: -0.035 },
    maj7:  { suf: "maj7",  iv: [0, 4, 7, 11],    w: T4,                    bias: -0.05 },
    min7:  { suf: "m7",    iv: [0, 3, 7, 10],    w: T4,                    bias: -0.04 },
    dim:   { suf: "dim",   iv: [0, 3, 6],        w: T3,                    bias: -0.06 },
    sus4:  { suf: "sus4",  iv: [0, 5, 7],        w: T3,                    bias: -0.06 },
    // ここから「テンション」系(Fullのみ)。足した音(9th/6th)は弱めに重み付け
    add9:  { suf: "add9",  iv: [0, 2, 4, 7],     w: [1, 0.6, 0.9, 0.8],    bias: -0.06 },
    six:   { suf: "6",     iv: [0, 4, 7, 9],     w: [1, 0.9, 0.8, 0.65],   bias: -0.07 },
    min6:  { suf: "m6",    iv: [0, 3, 7, 9],     w: [1, 0.9, 0.8, 0.65],   bias: -0.08 },
    dom9:  { suf: "9",     iv: [0, 2, 4, 7, 10], w: [1, 0.55, 0.9, 0.8, 0.7], bias: -0.08 },
    maj9:  { suf: "maj9",  iv: [0, 2, 4, 7, 11], w: [1, 0.55, 0.9, 0.8, 0.7], bias: -0.09 },
    min9:  { suf: "m9",    iv: [0, 2, 3, 7, 10], w: [1, 0.55, 0.9, 0.8, 0.7], bias: -0.09 },
    m7b5:  { suf: "m7b5",  iv: [0, 3, 6, 10],    w: T4,                    bias: -0.07 },
    dim7:  { suf: "dim7",  iv: [0, 3, 6, 9],     w: T4,                    bias: -0.09 },
    aug:   { suf: "aug",   iv: [0, 4, 8],        w: T3,                    bias: -0.09 },
    sus2:  { suf: "sus2",  iv: [0, 2, 7],        w: T3,                    bias: -0.07 },
    s7sus4:{ suf: "7sus4", iv: [0, 5, 7, 10],    w: T4,                    bias: -0.08 },
    pow:   { suf: "5",     iv: [0, 7],           w: [1, 0.9],              bias: -0.10 }
  };
  const LEVELS = {
    basic: ["maj", "min"],
    extended: ["maj", "min", "dom7", "maj7", "min7", "dim", "sus4"],
    full: ["maj", "min", "dom7", "maj7", "min7", "dim", "sus4", "add9", "six", "min6", "dom9", "maj9", "min9", "m7b5", "dim7", "aug", "sus2", "s7sus4", "pow"]
  };

  const KEY_MAJ = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
  const KEY_MIN = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

  const TARGET_SR = 8000;
  const FMIN = 55, FMAX = 2100;
const BASS_MAX = 260;   // ベース音として見る上限(Hz)

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
    const out = { chroma: new Float32Array(frames * 12), bass: new Float32Array(frames * 12), rms: new Float32Array(frames), hop: hopS / sr, win: N / sr, frames: frames, tuning: 0 };
    if (!frames) return out;

    const fft = makeFFT(N);
    const win = new Float64Array(N);
    for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1));
    const re = new Float64Array(N), im = new Float64Array(N), mag = new Float64Array(N / 2 + 1);
    const kMin = Math.max(2, Math.floor(FMIN * N / sr)), kMax = Math.min(N / 2 - 2, Math.ceil(FMAX * N / sr));
    const MAXP = 60;
    const pf = new Float32Array(frames * MAXP), pw = new Float32Array(frames * MAXP), pn = new Uint8Array(frames);
    const MAXB = 8;
    const bf = new Float32Array(frames * MAXB), bw = new Float32Array(frames * MAXB), bn = new Uint8Array(frames);
    const kBmax = Math.min(kMax, Math.ceil(BASS_MAX * N / sr));

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
      // ベース帯(FMIN〜BASS_MAX)だけ、その帯の最大値を基準にしたピーク(低音は全体の最大に埋もれやすいので別に集める)
      let bmx = 0;
      for (let k = kMin; k <= kBmax; k++) if (mag[k] > bmx) bmx = mag[k];
      let bc = 0;
      if (bmx > 1e-9) {
        for (let k = kMin; k <= kBmax && bc < MAXB; k++) {
          const b = mag[k];
          if (b < bmx * 0.25 || b <= mag[k - 1] || b < mag[k + 1]) continue;
          const la = Math.log(mag[k - 1] + 1e-12), lb = Math.log(b + 1e-12), lc = Math.log(mag[k + 1] + 1e-12);
          const den = la - 2 * lb + lc;
          const dl = den < 0 ? 0.5 * (la - lc) / den : 0;
          bf[f * MAXB + bc] = (k + dl) * sr / N;
          bw[f * MAXB + bc] = b / bmx;
          bc++;
        }
      }
      bn[f] = bc;
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
      const bc2 = out.bass;
      for (let j = 0; j < bn[f]; j++) {
        const fr = bf[f * MAXB + j];
        const p = 12 * Math.log2(fr / 440) + 9 - tun;
        const fl = Math.floor(p), frac = p - fl;
        const w = Math.pow(bw[f * MAXB + j], 1.5);      // 強い低音だけが効くよう強調
        bc2[base + (((fl % 12) + 12) % 12)] += w * (1 - frac);
        bc2[base + ((((fl + 1) % 12) + 12) % 12)] += w * frac;
      }
      let sb = 0;
      for (let i = 0; i < 12; i++) sb += bc2[base + i] * bc2[base + i];
      sb = Math.sqrt(sb);
      if (sb > 1e-9) for (let i = 0; i < 12; i++) bc2[base + i] /= sb;
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

  // 手動指定/推定のキーを正規化: { tonic(0-11), minor, flats, name }
  function makeKey(tonic, minor) {
    tonic = ((tonic % 12) + 12) % 12;
    const maj = minor ? (tonic + 3) % 12 : tonic;
    const flats = FLAT_KEYS.indexOf(maj) >= 0;
    return { tonic: tonic, minor: !!minor, flats: flats, name: (flats ? FLAT : SHARP)[tonic] + (minor ? " minor" : " major") };
  }

  function scaleSet(key) {
    const maj = key.minor ? (key.tonic + 3) % 12 : key.tonic;
    const s = new Set([0, 2, 4, 5, 7, 9, 11].map(i => (maj + i) % 12));
    if (key.minor) s.add((key.tonic + 11) % 12);   // 和声的短音階の導音(V7などを許す)
    return s;
  }

  // ---------- 3) 分類 ----------
  // opts: { detail:"basic"|"extended"|"full", key:(省略時は推定), bass:true(既定。オンベース検出), alts:3(候補数) }
  // 戻り値: { segments:[{t0,t1,name,root,q,bass,conf,alts:[{name,score}]}], key, detail }。name="N"は無音/コード無し
  // name=コード名(オンベースならC/E形式)。alts=ほかの有力候補(スコアの高い順。名前はベース音なし)
  // 区間の境目を拍に合わせる。候補=境目の近くの拍と、拍の真ん中(裏拍)。
  // 点数 = その位置で区切った時のコードの当てはまり + そこで音が立ち上がっているか - 裏拍/グリッド外の罰。
  // 裏拍に決まった境目は seg.sync=true(コードが拍より先に入る/遅れて入るシンコペ)
  const SN_ON = 0.25, SN_ONCAP = 3, SN_OFF = 0.30, SN_FREE = 0.45, SN_DIST = 0.4;
  function snapSegs(segs, meta, gr, ev, S, silent, ch) {
    const T = gr.times, M = gr.mid, O = gr.on, P = gr.period;
    if (!T || T.length < 4 || !(P > 0)) return;
    const hop = ch.hop, c0 = ch.win / 2;
    const R = Math.min(0.42, P * 0.85);
    const med = function (a) { if (!a || !a.length) return 0; const v = Array.from(a).sort(function (x, y) { return x - y; }); return v[v.length >> 1]; };
    const mO = med(O), mM = med(M);     // 拍/裏拍それぞれの普段の立ち上がり。これを超えた分だけ加点
    const evAt = function (f, st) { return st === S ? (silent[f] ? 1 : -0.4) : ev[f * S + st]; };
    const lowerBound = function (x) { let lo = 0, hi = T.length; while (lo < hi) { const m = (lo + hi) >> 1; if (T[m] < x) lo = m + 1; else hi = m; } return lo; };
    for (let i = 1; i < segs.length; i++) {
      const A = meta[i - 1], B = meta[i];
      const tb = segs[i].t0;
      const cost = function (t) {
        const k = Math.max(A.a, Math.min(B.f, Math.ceil((t - c0) / hop)));
        let c = 0;
        for (let f = A.a; f < k; f++) c += evAt(f, A.s);
        for (let f = k; f < B.f; f++) c += evAt(f, B.s);
        return c;
      };
      const lo = segs[i - 1].t0 + 0.15, hi = (i + 1 < segs.length ? segs[i + 1].t0 : segs[i].t1) - 0.15;
      let bestT = tb, bestS = cost(tb) - SN_FREE, sync = !!segs[i].sync;
      sync = false;
      const k0 = Math.max(0, lowerBound(tb - R) - 1);
      for (let k = k0; k < T.length && T[k] - R <= tb; k++) {
        const tests = [[T[k], O ? Math.max(0, O[k] - mO) : 0, 0]];
        if (k + 1 < T.length && M) tests.push([(T[k] + T[k + 1]) / 2, Math.max(0, M[k] - mM), SN_OFF]);
        for (let j = 0; j < tests.length; j++) {
          const t = tests[j][0];
          if (Math.abs(t - tb) > R || t < lo || t > hi) continue;
          const sc = cost(t) + SN_ON * Math.min(SN_ONCAP, tests[j][1]) - tests[j][2] - SN_DIST * Math.abs(t - tb);
          if (sc > bestS) { bestS = sc; bestT = t; sync = tests[j][2] > 0; }
        }
      }
      segs[i].t0 = bestT; segs[i - 1].t1 = bestT;
      if (sync) segs[i].sync = true;
    }
  }

  function classify(ch, dur, opts) {
    opts = opts || {};
    const detail = LEVELS[opts.detail] ? opts.detail : "extended";
    const useBass = opts.bass !== false;
    const nAlts = opts.alts === undefined ? 3 : opts.alts;
    const qs = LEVELS[detail];
    const key = opts.key ? makeKey(opts.key.tonic, opts.key.minor) : estimateKey(ch);
    const names = key.flats ? FLAT : SHARP;
    const F = ch.frames;
    const res = { segments: [], key: key, detail: detail };
    if (!F) return res;
    const scale = scaleSet(key);

    // テンプレート(L2正規化)と事前スコア(複雑さの下駄＋キーに合うコードへの加点)
    const S = 12 * qs.length;
    const tpl = new Float32Array(S * 12), prior = new Float32Array(S);
    const tone = new Uint8Array(S * 12);     // 構成音(オンベース判定用)
    for (let qi = 0; qi < qs.length; qi++) {
      const Q = QUALITIES[qs[qi]];
      for (let r = 0; r < 12; r++) {
        const s = qi * 12 + r;
        let n = 0, diat = true;
        for (let j = 0; j < Q.iv.length; j++) {
          const pc = (r + Q.iv[j]) % 12;
          tpl[s * 12 + pc] = Q.w[j];
          tone[s * 12 + pc] = 1;
          n += Q.w[j] * Q.w[j];
          if (!scale.has(pc)) diat = false;
        }
        n = Math.sqrt(n);
        for (let i = 0; i < 12; i++) tpl[s * 12 + i] /= n;
        prior[s] = Q.bias * BIAS_SCALE + (diat ? +(typeof process !== "undefined" && process.env.DIAT || 0.03) : 0);
      }
    }

    // 時間方向に3フレーム平均(打楽器などの単発ノイズを均す)
    const sm = new Float32Array(F * 12), smB = new Float32Array(F * 12);
    for (let f = 0; f < F; f++) {
      const a = Math.max(0, f - 1), b = Math.min(F - 1, f + 1);
      for (let i = 0; i < 12; i++) {
        let s = 0, sb = 0;
        for (let g = a; g <= b; g++) { s += ch.chroma[g * 12 + i]; sb += ch.bass ? ch.bass[g * 12 + i] : 0; }
        sm[f * 12 + i] = s / (b - a + 1);
        smB[f * 12 + i] = sb / (b - a + 1);
      }
    }

    // 無音判定: 全体の音量の中央値に対して小さいフレーム
    const sorted = Array.from(ch.rms).sort((x, y) => x - y);
    const med = sorted[Math.floor(sorted.length / 2)] || 0;
    const silent = new Uint8Array(F);
    for (let f = 0; f < F; f++) if (ch.rms[f] < Math.max(1e-4, med * 0.06)) silent[f] = 1;

    // フレームごとの各コードの評価値(ev)。類似度＋事前スコア＋「最低音が根音」ボーナス(Am7とC6のように構成音が同じコードを分ける)
    const BASSW = useBass && ch.bass ? 0.10 : 0;
    const ev = new Float32Array(F * S), sim = new Float32Array(F * S);
    for (let f = 0; f < F; f++) {
      for (let s = 0; s < S; s++) {
        let dot = 0;
        for (let i = 0; i < 12; i++) dot += sm[f * 12 + i] * tpl[s * 12 + i];
        sim[f * S + s] = dot;
        ev[f * S + s] = dot + prior[s] + BASSW * smB[f * 12 + (s % 12)];
      }
    }

    // Viterbi: 状態=S個のコード+N。同じ状態に居続けるのは無料、移るにはSWITCHを払う
    const BETA = 9, SWITCH = +(typeof process !== "undefined" && process.env.SWITCH || 6);
    const NS = S + 1;
    // 拍に同期: 拍の近くでは乗り換えやすく、拍と拍の間(特に拍から遠い所)では乗り換えにくくする
    const envN = function (k, d) { return +(typeof process !== "undefined" && process.env[k] || d); };
    const swOn = envN("SW_ON", 0.7), swOff = envN("SW_OFF", 2.2), swWin = envN("SW_WIN", 0.08);
    const swF = new Float32Array(F).fill(1);
    if (opts.grid && opts.grid.times && opts.grid.times.length > 3) {
      const Tg = opts.grid.times, Mg = opts.grid.period || 0.5;
      let k = 0;
      for (let f = 0; f < F; f++) {
        const t = ch.win / 2 + f * ch.hop;
        while (k + 1 < Tg.length && Tg[k + 1] <= t) k++;
        let d = Math.abs(t - Tg[k]);
        if (k + 1 < Tg.length) d = Math.min(d, Math.abs(Tg[k + 1] - t));
        const dh = Math.abs(t - (Tg[k] + (k + 1 < Tg.length ? Tg[k + 1] - Tg[k] : Mg) / 2));
        swF[f] = d <= swWin ? swOn : (dh <= swWin ? 1.2 : swOff);
      }
    }
    let prev = new Float64Array(NS), cur = new Float64Array(NS);
    const back = new Int16Array(F * NS);
    for (let f = 0; f < F; f++) {
      let bestPrev = 0, bestPrevS = 0;
      if (f > 0) { bestPrev = -1e18; for (let s = 0; s < NS; s++) if (prev[s] > bestPrev) { bestPrev = prev[s]; bestPrevS = s; } }
      for (let s = 0; s < NS; s++) {
        const em = s === S ? (silent[f] ? 1.0 * BETA : -0.4 * BETA) : (silent[f] ? -0.4 * BETA : ev[f * S + s] * BETA);
        if (f === 0) { cur[s] = em; back[s] = s; continue; }
        const stay = prev[s], jump = bestPrev - SWITCH * swF[f];
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
    const segs = [], meta = [];
    let a = 0;
    for (let f = 1; f <= F; f++) {
      if (f < F && path[f] === path[a]) continue;
      const s = path[a];
      const t0 = a === 0 ? 0 : c0 + (a - 0.5) * hop;
      const t1 = f === F ? dur : c0 + (f - 0.5) * hop;
      const seg = { t0: t0, t1: Math.min(dur, t1), name: "N", root: -1, q: "", bass: -1, conf: 0, alts: [] };
      if (s !== S) {
        const qi = Math.floor(s / 12);
        const root = s % 12;
        const n = f - a;
        seg.root = root;
        seg.q = qs[qi];
        let nm = names[root] + QUALITIES[qs[qi]].suf;
        for (let g = a; g < f; g++) seg.conf += sim[g * S + s];
        seg.conf /= n;
        // オンベース: 区間の低音の平均が、根音以外の構成音に強く出ていれば「コード/ベース」にする
        if (BASSW) {
          const mb = new Float64Array(12);
          for (let g = a; g < f; g++) for (let i = 0; i < 12; i++) mb[i] += smB[g * 12 + i];
          let bi = 0;
          for (let i = 1; i < 12; i++) if (mb[i] > mb[bi]) bi = i;
          const bs = mb[bi] / n, rs = mb[root] / n;
          if (bi !== root && tone[s * 12 + bi] && bs > 0.45 && bs > rs * 1.6) { seg.bass = bi; nm += "/" + names[bi]; }
        }
        seg.name = nm;
        // 候補: 区間内の平均評価値が高い別のコード(同じ根音+質の重複は除く)。差が小さいものだけ
        if (nAlts > 0) {
          const avg = new Float64Array(S);
          for (let g = a; g < f; g++) for (let k = 0; k < S; k++) avg[k] += ev[g * S + k];
          const order = [];
          for (let k = 0; k < S; k++) if (k !== s) order.push(k);
          order.sort((x, y) => avg[y] - avg[x]);
          const top = avg[s];
          for (let k = 0; k < order.length && seg.alts.length < nAlts; k++) {
            const o = order[k];
            const gap = (top - avg[o]) / n;
            if (gap > 0.12) break;                   // 本命と差が大きい候補は出さない
            seg.alts.push({ root: o % 12, q: qs[Math.floor(o / 12)], name: names[o % 12] + QUALITIES[qs[Math.floor(o / 12)]].suf, score: 1 - gap });
          }
        }
      }
      segs.push(seg);
      meta.push({ a: a, f: f, s: s });
      a = f;
    }
    if (opts.grid && segs.length > 1) snapSegs(segs, meta, opts.grid, ev, S, silent, ch);
    res.segments = segs.filter(s => s.t1 > s.t0);
    return res;
  }

  // ---------- 4) 拍・小節 ----------
  // beats(): オンセット(音の立ち上がり)の強さ → テンポ(自己相関) → 動的計画法で拍の位置を追跡(Ellis 2007)。小節頭は bars() が別に決める。
  // 戻り値: { times:Float32Array(拍の秒), low:Float32Array(拍ごとの低音の立ち上がり 0〜1), bpm, period(秒), conf }
  const B_N = 512, B_HOP = 80;      // 8kHzで64ms窓・10msごと
  const B_TIGHT = 1000;              // 拍の間隔がテンポからずれることへの罰の強さ(大きいほど等間隔)
  const B_LOWW = 1.0;               // 低音の立ち上がりを拍の手がかりに足す重み
  const B_BPM_MAX = 240;             // 拍として取るテンポの上限(BPM)。速い8ビートの曲は拍=8分音符側で取る
  const B_DBL_BELOW = 120;           // この値より遅いテンポは、倍(1拍=半分の長さ)で取る(1小節=4拍=スネア2回=8ビートの定義に合わせる)
  const B_DBL_RATIO = 0.7;           // 倍にする条件: 半分の間隔での自己相関が、元の間隔の自己相関の何割以上あるか
  const B_LAT = 0.001;              // フレームの位置→実際の音の立ち上がりの時刻の補正(合成音源で測った値)

  function beats(mono, sr, onProgress) {
    const d = decimate(mono, sr);
    const x = d.x;
    sr = d.sr;
    const hop = Math.round(B_HOP * sr / 8000), N = B_N;
    const F = Math.max(0, Math.floor((x.length - N) / hop) + 1);
    const out = { times: new Float32Array(0), low: new Float32Array(0), on: new Float32Array(0), mid: new Float32Array(0), hi: new Float32Array(0), bpm: 0, period: 0, conf: 0 };
    if (F < 300) return out;                                   // 3秒未満は無理
    const fps = sr / hop;
    const fft = makeFFT(N);
    const win = new Float64Array(N);
    for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1));
    const re = new Float64Array(N), im = new Float64Array(N);
    const kMid0 = Math.floor(1000 * N / sr), kLo0 = Math.max(1, Math.floor(40 * N / sr)), kLo1 = Math.floor(200 * N / sr), kHi1 = Math.min(N / 2 - 1, Math.floor(3500 * N / sr));
    let prev = new Float64Array(kHi1 + 1), cur = new Float64Array(kHi1 + 1);
    const on = new Float32Array(F), low = new Float32Array(F), hiB = new Float32Array(F);
    for (let f = 0; f < F; f++) {
      const o = f * hop;
      for (let i = 0; i < N; i++) { re[i] = x[o + i] * win[i]; im[i] = 0; }
      fft(re, im);
      let fl = 0, lw = 0, hw = 0;
      for (let k = kLo0; k <= kHi1; k++) {
        const v = Math.log(1 + 100 * Math.sqrt(re[k] * re[k] + im[k] * im[k]) / N * 8);
        cur[k] = v;
        const df = v - prev[k];
        if (df > 0 && f > 0) { fl += df; if (k <= kLo1) lw += df; else if (k >= kMid0) hw += df; }
      }
      on[f] = fl; low[f] = lw; hiB[f] = hw;
      const t = prev; prev = cur; cur = t;
      if (onProgress && (f & 255) === 0) onProgress(f / F * 0.5);
    }
    // 正規化: 0.6秒の移動平均を引いて負を切り、標準偏差で割る
    const norm = (a) => {
      const w = Math.round(fps * 0.6), pre = new Float64Array(a.length + 1);
      for (let i = 0; i < a.length; i++) pre[i + 1] = pre[i] + a[i];
      const r = new Float32Array(a.length);
      let ss = 0;
      for (let i = 0; i < a.length; i++) {
        const l = Math.max(0, i - w), h = Math.min(a.length, i + w + 1);
        const v = Math.max(0, a[i] - (pre[h] - pre[l]) / (h - l));
        r[i] = v; ss += v * v;
      }
      const sd = Math.sqrt(ss / a.length) || 1;
      for (let i = 0; i < a.length; i++) r[i] /= sd;
      return r;
    };
    const oB = norm(on), oLow = norm(low), oHi = norm(hiB);
    const LW = +(typeof process !== "undefined" && process.env.LW || B_LOWW);
    const o1 = Float32Array.from(oB, (v, i) => v + LW * oLow[i]);   // 拍の手がかり = 全帯域 + 低音(キック/ベース)。裏拍のコードやハットに引っ張られにくくする

    // テンポ: 自己相関(60〜200BPM)。120BPM付近を好む事前分布と、倍/半のテンポも足し合わせて拍子の階層を拾う
    const envF = function (k, d) { return +(typeof process !== "undefined" && process.env[k] || d); };   // Nodeでの検証用
    const lagMin = Math.round(fps * 60 / B_BPM_MAX), lagMax = Math.round(fps * 60 / 60);
    const ac = new Float64Array(lagMax * 2 + 2);
    for (let l = Math.max(2, Math.floor(lagMin / 2)); l <= lagMax * 2; l++) {      // 下限の半分から計算する(速い拍の「半分の間隔」の項が0になって、速いテンポが不利になるのを防ぐ)
      let s = 0;
      for (let i = 0; i + l < F; i++) s += o1[i] * o1[i + l];
      ac[l] = s / (F - l);
    }
    let bestL = lagMin, bestV = -1e18;
    for (let l = lagMin; l <= lagMax; l++) {
      const bpm = 60 * fps / l;
      const prior = Math.exp(-0.5 * Math.pow(Math.log2(bpm / 120) / 0.9, 2));
      const v = (ac[l] + 0.5 * ac[2 * l] + 0.25 * (ac[Math.round(l / 2)] || 0)) * prior;
      if (v > bestV) { bestV = v; bestL = l; }
    }
    // 遅いテンポ(120BPM未満)は倍で取る: 半分の間隔にも同じくらい周期があれば、1拍をその半分にする(上限240BPM)
    const dblBelow = envF("DBLBELOW", B_DBL_BELOW), dblRatio = envF("DBLRATIO", B_DBL_RATIO);
    if (60 * fps / bestL < dblBelow) {
      const h = Math.round(bestL / 2);
      if (h >= lagMin && ac[h] >= dblRatio * ac[bestL]) { let bh = h; for (let l = h - 1; l <= h + 1; l++) if (l >= lagMin && ac[l] > ac[bh]) bh = l; bestL = bh; }
    }
    // 放物線補間で端数のラグへ
    const y0 = ac[bestL - 1], y1 = ac[bestL], y2 = ac[bestL + 1];
    const den = y0 - 2 * y1 + y2;
    let p = bestL + (den < 0 ? 0.5 * (y0 - y2) / den : 0);       // 拍の間隔(フレーム)

    // 拍追跡(動的計画法): 各フレームの得点 = 立ち上がりの強さ(少しぼかす) + 直前の拍からの最良の累積。間隔がpから外れるほど罰
    const loc = new Float32Array(F);
    for (let i = 0; i < F; i++) {
      let s = 0;
      for (let k = -3; k <= 3; k++) { const j = i + k; if (j >= 0 && j < F) s += o1[j] * Math.exp(-0.5 * k * k / 2.25); }
      loc[i] = s;
    }
    // テンポの精密化: 自己相関は10ms刻みなので、曲全体で「等間隔の櫛」が立ち上がりに最も重なる間隔を±3%・0.02%刻みで探す(端数フレーム。誤差が累積して数秒ずれるのを防ぐ)
    if (envF("REFINE", 1)) {
      const R = envF("RSPAN", 0.03), RS = envF("RSTEP", 0.0002);
      const interp = (x) => { const i = Math.floor(x); if (i < 0 || i + 1 >= F) return 0; const fr = x - i; return loc[i] * (1 - fr) + loc[i + 1] * fr; };
      let bestS = -1, bestP = p;
      for (let q = p * (1 - R); q <= p * (1 + R); q += p * RS) {
        let bs = 0;
        for (let ph = 0; ph < q; ph += 0.5) { let sc = 0; for (let x = ph; x < F - 1; x += q) sc += interp(x); if (sc > bs) bs = sc; }
        if (bs > bestS) { bestS = bs; bestP = q; }
      }
      p = bestP;
    }
    const cum = new Float64Array(F), link = new Int32Array(F).fill(-1);
    const TIGHT = +(typeof process !== "undefined" && process.env.TIGHT || B_TIGHT), wMin = Math.max(1, Math.round(p / 2)), wMax = Math.round(p * 2);
    const pen = new Float64Array(wMax + 1);
    for (let t = wMin; t <= wMax; t++) pen[t] = -TIGHT * Math.pow(Math.log(t / p), 2);
    for (let i = 0; i < F; i++) {
      let best = 0, bj = -1;
      for (let t = wMin; t <= wMax; t++) {
        const j = i - t;
        if (j < 0) break;
        const v = cum[j] + pen[t];
        if (bj < 0 || v > best) { best = v; bj = j; }
      }
      cum[i] = loc[i] + (bj >= 0 ? best : 0);
      link[i] = bj;
      if (onProgress && (i & 1023) === 0) onProgress(0.5 + i / F * 0.5);
    }
    // 終点: 最後の2拍分のうち累積が最大の所から逆にたどる
    let end = F - 1;
    for (let i = Math.max(0, F - Math.round(p * 2)); i < F; i++) if (cum[i] > cum[end]) end = i;
    const keep = [];
    for (let i = end; i >= 0; i = link[i]) { keep.push(i); if (link[i] < 0) break; }
    keep.reverse();
    out.times = Float32Array.from(keep, i => (i * hop + N / 2) / sr - B_LAT);
    out.low = Float32Array.from(keep, i => { let m = 0; for (let k = -4; k <= 4; k++) { const j = i + k; if (j >= 0 && j < F && oLow[j] > m) m = oLow[j]; } return m; });
    // 拍の位置と、拍と拍の真ん中(8分音符の裏)の立ち上がりの強さ(シンコペ判定用)
    const pk = (c) => { let m = 0; const i0 = Math.round(c); for (let k = -3; k <= 3; k++) { const j = i0 + k; if (j >= 0 && j < F && o1[j] > m) m = o1[j]; } return m; };
    out.on = Float32Array.from(keep, i => pk(i));
    out.mid = Float32Array.from(keep, (i, n) => pk(i + (n + 1 < keep.length ? keep[n + 1] - i : p) / 2));
    out.hi = Float32Array.from(keep, i => { let m = 0; for (let k = -4; k <= 4; k++) { const j = i + k; if (j >= 0 && j < F && oHi[j] > m) m = oHi[j]; } return m; });
    out.period = p * hop / sr;
    out.bpm = 60 / out.period;
    // 確信度: 拍の位置の立ち上がりの平均 / 全体の平均
    let sb = 0;
    keep.forEach(i => { sb += o1[i]; });
    out.conf = keep.length ? sb / keep.length : 0;
    if (onProgress) onProgress(1);
    return out;
  }

  // テンポの倍/半の補正と、拍子・小節頭の決定。bt={tempo:-1|0|1 (÷2/自動/×2), bpb:0(自動)|2..7, shift:小節頭を拍単位でずらす}
  // segs=コード区間(自動判定ぶん。コード変化の位置が小節頭の手がかり)。戻り値: { times:Float32Array, bar:Uint8Array(拍の小節内の番号。0=小節頭), m(拍子), phase }
  // マーカーなどの手動の小節頭(秒の配列)に合わせて縦線を作り直す。隣り合う小節頭の間は、小節数を検出テンポから決めて等間隔に割る(拍追跡が半拍ずれた区間・テンポが揺れた区間を直す)。
  // 最初の小節頭より前と最後より後は、それぞれ隣の区間の間隔で延ばす。近すぎる小節頭(1小節足らず)は使わない
  function applyAnchors(r, anchors, dur) {
    const n = r.times.length;
    if (n < 4) return r;
    const M = r.m || 4, tt = Array.from(r.times);
    const gAll = (tt[n - 1] - tt[0]) / (n - 1);
    const local = (a, b) => {
      const d = []; for (let i = 1; i < n; i++) if (tt[i - 1] >= a - 1e-6 && tt[i] <= b + 1e-6) d.push(tt[i] - tt[i - 1]);
      if (d.length < 3) return gAll;
      d.sort((x, y) => x - y); return d[d.length >> 1];
    };
    let A = anchors.filter(x => isFinite(x) && x >= 0).sort((x, y) => x - y), keep = [];
    for (const x of A) {
      if (!keep.length) { keep.push(x); continue; }
      const prev = keep[keep.length - 1];
      if (x - prev >= 0.75 * M * local(prev, x)) keep.push(x);
    }
    A = keep;
    if (!A.length) return r;
    const T = [], B = [], end = Math.max(dur || 0, tt[n - 1] + gAll);
    const put = (x, k) => { if (x >= -1e-6 && x <= end + 1e-6) { T.push(x); B.push(((k % M) + M) % M); } };
    const pFirst = A.length > 1 ? local(A[0], A[1]) : local(A[0], A[0] + 20 * gAll);
    const pLast = A.length > 1 ? local(A[A.length - 2], A[A.length - 1]) : pFirst;
    const backs = []; for (let k = 1; A[0] - k * pFirst >= -1e-6; k++) backs.push([A[0] - k * pFirst, -k]);
    backs.reverse().forEach(v => put(v[0], v[1]));
    for (let i = 0; i < A.length; i++) {
      const a = A[i];
      if (i + 1 < A.length) {
        const b = A[i + 1], per = local(a, b), bars = Math.max(1, Math.round((b - a) / (M * per))), cnt = bars * M, step = (b - a) / cnt;
        for (let k = 0; k < cnt; k++) put(a + k * step, k);
      } else {
        for (let k = 0; a + k * pLast <= end + 1e-6; k++) put(a + k * pLast, k);
      }
    }
    r.times = Float32Array.from(T); r.bar = Uint8Array.from(B); r.phase = 0; r.manual = 3;
    r.bpm = T.length > 1 ? 60 * (T.length - 1) / (T[T.length - 1] - T[0]) : r.bpm;
    return r;
  }

  function bars(bi, segs, bt, dur) {
    const r = barsBase(bi, segs, bt, dur);
    return bt && bt.anchors && bt.anchors.length ? applyAnchors(r, bt.anchors.concat(bt.anchor >= 0 ? [bt.anchor] : []), dur) : r;
  }

  function barsBase(bi, segs, bt, dur) {
    bt = bt || {};
    let t = Array.from(bi.times), low = Array.from(bi.low), hi = Array.from(bi.hi && bi.hi.length === bi.times.length ? bi.hi : bi.low.map(() => 0));
    // テンポの倍/半の自動補正(bt.tempo=0の時だけ)。拍だけでは決められない倍/半の取り違えを、低音の強弱の交互パターンとコードが変わる間隔(拍数)で直す
    let tempo = bt.tempo | 0, auto = 0;
    if (!tempo && t.length >= 8) {
      const per0 = (t[t.length - 1] - t[0]) / (t.length - 1), bpm0 = 60 / per0;
      const mean = (ph) => { let s = 0, c = 0; for (let i = ph; i < low.length; i += 2) { s += low[i]; c++; } return c ? s / c : 0; };
      const m0 = mean(0), m1 = mean(1), alt = Math.max(m0, m1) / Math.max(0.05, Math.min(m0, m1));
      let Lmed = 0;
      if (segs) {
        const d = segs.filter(x => x.name !== "N" && x.t1 > x.t0).map(x => (x.t1 - x.t0) / per0).sort((a, b) => a - b);
        if (d.length >= 4) Lmed = d[d.length >> 1];
      }
      if (bpm0 > 135 && alt > 2.0) auto = -1;                       // キック/ベースが1拍おき=本当の拍は半分
      else if (Lmed > 0 && ((Lmed <= 1.3 && bpm0 < 80) || (Lmed <= 2.2 && bpm0 < 72))) auto = 1;   // コードが1〜2拍で変わる遅い拍=倍
      tempo = auto;
    }
    if (tempo === 1) {                         // ×2: 拍と拍の真ん中に拍を足す
      const nt = [], nl = [], nh = [];
      for (let i = 0; i < t.length; i++) { nt.push(t[i]); nl.push(low[i]); nh.push(hi[i]); if (i + 1 < t.length) { nt.push((t[i] + t[i + 1]) / 2); nl.push(0); nh.push(0); } }
      t = nt; low = nl; hi = nh;
    } else if (tempo === -1) {                 // ÷2: 1つおきに残す(低音の強い方の位相を採る)
      let s0 = 0, s1 = 0;
      for (let i = 0; i < low.length; i++) if (i % 2) s1 += low[i]; else s0 += low[i];
      const off = s1 > s0 ? 1 : 0;
      t = t.filter((_, i) => i % 2 === off); low = low.filter((_, i) => i % 2 === off); hi = hi.filter((_, i) => i % 2 === off);
    }
    const n = t.length;
    const res = { times: Float32Array.from(t), bar: new Uint8Array(n), m: 4, phase: 0, auto: auto, bpm: n > 1 ? 60 * (n - 1) / (t[n - 1] - t[0]) : 0 };
    if (n < 4) return res;
    // 各拍がコード変化の位置に近いか
    const period = (t[n - 1] - t[0]) / (n - 1);
    const chg = new Float32Array(n);
    if (segs) {
      for (let k = 1; k < segs.length; k++) {
        const b = segs[k].t0;
        if (segs[k].name === "N" || segs[k - 1].name === "N") continue;
        // 最も近い拍
        let lo = 0, hi = n - 1;
        while (lo < hi) { const mid = (lo + hi) >> 1; if (t[mid] < b) lo = mid + 1; else hi = mid; }
        for (const j of [lo - 1, lo]) if (j >= 0 && j < n && Math.abs(t[j] - b) < period * 0.3) chg[j] = Math.max(chg[j], 1 - Math.abs(t[j] - b) / (period * 0.3));
      }
    }
    const score = (M, ph) => {
      let s = 0, c = 0;
      for (let i = ph; i < n; i += M) { s += 0.8 * low[i] + 2.2 * chg[i]; c++; }
      return c ? s / c : 0;
    };
    // 最初に鳴ったコードの頭は、小節頭であることが多い(出だしが小節の途中でも、コードは1拍目から始まる曲が大半)。小節頭の候補が拮抗した時の決め手にする
    let j0 = -1;
    if (segs) {
      for (let k = 0; k < segs.length; k++) {
        if (segs[k].name === "N") continue;
        let best = 0;
        for (let i = 1; i < n; i++) if (Math.abs(t[i] - segs[k].t0) < Math.abs(t[best] - segs[k].t0)) best = i;
        if (Math.abs(t[best] - segs[k].t0) < period * 0.4) j0 = best;
        break;
      }
    }
    const J0T = +(typeof process !== "undefined" && process.env.J0T || 0.9);
    const contrast = (M) => {
      let best = -1e9, bp = 0, sum = 0;
      const sc = [];
      for (let ph = 0; ph < M; ph++) { const v = score(M, ph); sc.push(v); sum += v; if (v > best) { best = v; bp = ph; } }
      if (j0 >= 0) {
        const want = ((j0 % M) + M) % M;
        if (want !== bp && sc[want] >= J0T * best) bp = want;
      }
      return { c: best - sum / M, ph: bp };
    };
    let M = bt.bpb >= 2 ? bt.bpb : 4, cc = contrast(M);
    if (!(bt.bpb >= 2)) {
      const c3 = contrast(3);
      if (c3.c > cc.c * 1.35) { M = 3; cc = c3; }                 // 4拍子を優先。3拍子の方がはっきり良い時だけ3
    }
    res.m = M;
    res.phase = ((cc.ph + (bt.shift || 0)) % M + M) % M;
    for (let i = 0; i < n; i++) res.bar[i] = ((i - res.phase) % M + M) % M;
    // 手動の小節頭(bt.anchor=秒)。検出した拍の近く(拍間隔の12%以内)ならその拍を小節頭にする。
    // 拍と拍の間なら、検出した拍は使わず「小節頭を起点に、検出テンポ(拍の最小二乗直線)で曲の端まで等間隔」の縦線にする
    if (bt.anchor >= 0) {
      let j = 0;
      for (let i = 1; i < n; i++) if (Math.abs(t[i] - bt.anchor) < Math.abs(t[j] - bt.anchor)) j = i;
      if (Math.abs(t[j] - bt.anchor) <= period * 0.12) {
        res.phase = j % M;
        for (let i = 0; i < n; i++) res.bar[i] = ((i - j) % M + M) % M;
        res.manual = 1;
        return res;
      }
      let sx = 0, sy = 0, sxx = 0, sxy = 0;
      for (let i = 0; i < n; i++) { sx += i; sy += t[i]; sxx += i * i; sxy += i * t[i]; }
      const den = n * sxx - sx * sx;
      const p = den > 0 ? (n * sxy - sx * sy) / den : period;
      const end = Math.max(dur || 0, t[n - 1] + p);
      const k0 = -Math.floor(bt.anchor / p), k1 = Math.ceil((end - bt.anchor) / p);
      const T = [], B = [];
      for (let k = k0; k <= k1; k++) { const x = bt.anchor + k * p; if (x < -1e-6 || x > end + 1e-6) continue; T.push(x); B.push(((k % M) + M) % M); }
      res.times = Float32Array.from(T);
      res.bar = Uint8Array.from(B);
      res.phase = 0;
      res.manual = 2;
    }
    return res;
  }

  // ---------- 表示名 ----------
  // seg={root,q,bass}。key=推定/指定のキー。opts.shift=半音(プレイヤーのKey操作に合わせて移調)、opts.mode="letter"(C Am7)|"degree"(I vi7。ローマ数字)
  const ROMAN_MAJ = ["I", "bII", "II", "bIII", "III", "IV", "#IV", "V", "bVI", "VI", "bVII", "VII"];
  const ROMAN_MIN = ["I", "bII", "II", "III", "#III", "IV", "bV", "V", "VI", "#VI", "VII", "#VII"];
  const MINOR_Q = { min: 1, min7: 1, min6: 1, min9: 1, m7b5: 1, dim: 1, dim7: 1 };
  const DEG_SUF = { min: "", min7: "7", min6: "6", min9: "9", m7b5: "ø7", dim: "°", dim7: "°7" };

  function label(seg, key, opts) {
    if (!seg || seg.root < 0 || !seg.q) return "N";
    opts = opts || {};
    const shift = opts.shift || 0;
    const Q = QUALITIES[seg.q];
    if (opts.mode === "degree") {
      const tab = key.minor ? ROMAN_MIN : ROMAN_MAJ;
      const low = !!MINOR_Q[seg.q];
      const rn = function (pc) {
        const r = tab[((pc - key.tonic) % 12 + 12) % 12];
        return low ? r.replace(/[IV]+/, function (m) { return m.toLowerCase(); }) : r;
      };
      let t = rn(seg.root) + (DEG_SUF[seg.q] !== undefined ? DEG_SUF[seg.q] : Q.suf);
      if (seg.bass >= 0) t += "/" + tab[((seg.bass - key.tonic) % 12 + 12) % 12];
      return t;
    }
    const k2 = makeKey(key.tonic + shift, key.minor);
    const nm = k2.flats ? FLAT : SHARP;
    let t = nm[((seg.root + shift) % 12 + 12) % 12] + Q.suf;
    if (seg.bass >= 0) t += "/" + nm[((seg.bass + shift) % 12 + 12) % 12];
    return t;
  }

  const api = { beats: beats, bars: bars, chroma: chroma, classify: classify, estimateKey: estimateKey, makeKey: makeKey, label: label, LEVELS: LEVELS, QUALITIES: QUALITIES };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.QNChordCore = api;
})(typeof self !== "undefined" ? self : this);
