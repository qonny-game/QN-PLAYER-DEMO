// qn-tab-core.js — Tab採譜の計算(DOMなし。Nodeでも動く: md/tools/tab_core_check.js)。
// ノート {id,t,d,midi,vel,string,fret,edited,hidden}。t,dは原曲の秒。stringは1=最も高い弦。tuningは低→高(標準=[40,45,50,55,59,64])。
(function (root) {
  "use strict";

  var STD_TUNING = [40, 45, 50, 55, 59, 64];
  var MAX_FRET = 21;
  // 弦・フレット割り当てのコスト重み(仮置き。実曲で調整する)
  var W = { move: 1.0, str: 0.3, high: 0.2, span: 0.5, open: 0.4 };
  var CHORD_TOL = 0.03;   // 開始がこの秒以内なら同時音(和音)
  var MAX_SPAN = 4;       // 和音内の押弦フレット幅の上限(開放弦は除く)
  var GAP_HALF = 1.0;     // 前の音からこの秒以上空いたら移動コストを半分に
  var HARMONICS = [12, 19, 24, 28, 31, 34, 36]; // 倍音の音程差(半音)
  var MAX_STATES = 60;    // 和音グループごとに残す候補数

  function openOf(tuning, s) { return tuning[tuning.length - s]; }

  function candidates(midi, tuning, capo, maxFret) {
    var out = [], n = tuning.length;
    for (var s = 1; s <= n; s++) {
      var f = midi - (openOf(tuning, s) + capo);
      if (f >= 0 && f <= maxFret) out.push({ s: s, f: f });
    }
    return out;
  }

  function range(tuning, capo, maxFret) {
    return { lo: tuning[0] + capo, hi: tuning[tuning.length - 1] + capo + maxFret };
  }

  // 弦・フレット割り当て(ビタビ)。opts: tuning,capo,maxFret,weights,fixed({id:{s,f}}) 。戻り値: notesと同じ長さの [{s,f}|null]
  function assign(notes, opts) {
    opts = opts || {};
    var tuning = opts.tuning || STD_TUNING, capo = opts.capo | 0;
    var maxFret = opts.maxFret == null ? MAX_FRET : opts.maxFret;
    var w = {}; for (var k in W) w[k] = (opts.weights && opts.weights[k] != null) ? opts.weights[k] : W[k];
    var fixed = opts.fixed || {};
    var nStr = tuning.length;
    var out = new Array(notes.length);
    for (var z = 0; z < out.length; z++) out[z] = null;

    var order = [];
    for (var i = 0; i < notes.length; i++) order.push(i);
    order.sort(function (a, b) { return notes[a].t - notes[b].t || notes[b].midi - notes[a].midi; });

    var groups = [], cur = null;
    order.forEach(function (idx) {
      var t = notes[idx].t;
      if (cur && t - cur.t0 <= CHORD_TOL) cur.idx.push(idx);
      else { cur = { t0: t, idx: [idx] }; groups.push(cur); }
    });

    function candsFor(idx) {
      var nt = notes[idx], list = candidates(nt.midi, tuning, capo, maxFret);
      var fx = nt.id != null ? fixed[nt.id] : null;
      if (fx) {
        var hit = list.filter(function (c) { return c.s === fx.s && c.f === fx.f; });
        if (hit.length) return hit;
      }
      return list;
    }

    // 各グループの状態(割り当ての組み合わせ)を列挙
    var layers = [];
    groups.forEach(function (g) {
      var idxs = g.idx.filter(function (idx) { return candsFor(idx).length > 0; });
      if (idxs.length > nStr) {
        idxs.sort(function (a, b) { return (notes[b].vel || 0) - (notes[a].vel || 0); });
        idxs = idxs.slice(0, nStr);
      }
      if (!idxs.length) return;
      var lists = idxs.map(candsFor), states = [];
      var pick = new Array(idxs.length), used = {};
      (function dfs(d) {
        if (d === idxs.length) {
          var fr = [], sSum = 0, intra = 0;
          for (var q = 0; q < pick.length; q++) {
            sSum += pick[q].s;
            if (pick[q].f > 0) fr.push(pick[q].f); else intra -= w.open;
            if (pick[q].f > 12) intra += w.high * (pick[q].f - 12);
          }
          var span = 0, fMean = null;
          if (fr.length) {
            var mn = Math.min.apply(null, fr), mx = Math.max.apply(null, fr);
            span = mx - mn;
            if (span > MAX_SPAN) return;
            fMean = fr.reduce(function (a, b) { return a + b; }, 0) / fr.length;
          }
          intra += w.span * span;
          states.push({ pos: pick.slice(), fMean: fMean, sMean: sSum / pick.length, intra: intra });
          return;
        }
        var cl = lists[d];
        for (var c = 0; c < cl.length; c++) {
          if (used[cl[c].s]) continue;
          used[cl[c].s] = true; pick[d] = cl[c];
          dfs(d + 1);
          used[cl[c].s] = false;
        }
      })(0);
      if (!states.length) {
        // 和音の幅が収まらない時は低い音を優先して1音ずつに落とす
        var first = idxs[0];
        states = candsFor(first).map(function (c) { return { pos: [c], fMean: c.f > 0 ? c.f : null, sMean: c.s, intra: (c.f === 0 ? -w.open : 0) + (c.f > 12 ? w.high * (c.f - 12) : 0) }; });
        idxs = [first];
      }
      states.sort(function (a, b) { return a.intra - b.intra; });
      if (states.length > MAX_STATES) states.length = MAX_STATES;
      layers.push({ t0: g.t0, idxs: idxs, states: states });
    });

    // ビタビ(手の位置は各状態の最良の前任から引き継ぐ)
    var prev = null;
    layers.forEach(function (L, li) {
      L.states.forEach(function (st) {
        if (!prev) { st.cost = st.intra; st.back = -1; st.hand = st.fMean; return; }
        var gap = L.t0 - prev.t0, tf = gap >= GAP_HALF ? 0.5 : 1;
        var best = Infinity, bi = -1;
        for (var p = 0; p < prev.states.length; p++) {
          var ps = prev.states[p];
          var mv = (st.fMean == null || ps.hand == null) ? 0 : Math.abs(st.fMean - ps.hand);
          var c = ps.cost + st.intra + tf * (w.move * mv + w.str * Math.abs(st.sMean - ps.sMean));
          if (c < best) { best = c; bi = p; }
        }
        st.cost = best; st.back = bi;
        st.hand = st.fMean != null ? st.fMean : prev.states[bi].hand;
      });
      prev = L;
    });
    if (layers.length) {
      var last = layers[layers.length - 1], bi2 = 0;
      for (var s2 = 1; s2 < last.states.length; s2++) if (last.states[s2].cost < last.states[bi2].cost) bi2 = s2;
      for (var li2 = layers.length - 1; li2 >= 0; li2--) {
        var L2 = layers[li2], st2 = L2.states[bi2];
        for (var q2 = 0; q2 < L2.idxs.length; q2++) out[L2.idxs[q2]] = { s: st2.pos[q2].s, f: st2.pos[q2].f };
        bi2 = st2.back;
      }
    }
    return out;
  }

  // 同じ音が前の音の終わり際から続く時は1つにつなぐ(再検出)。gapが大きい設定(低音楽器)では、前より少し強いくらいの再検出もつなぐ
  function mergeRepeats(list, gap, drop) {
    var lastByMidi = {}, out = [];
    list.forEach(function (nt) {
      var p = lastByMidi[nt.midi];
      if (p && nt.t <= p.t + p.d + gap && nt.vel <= p.vel * (gap > 0.04 ? 1.3 : 0.95)) {
        p.d = Math.max(p.d, nt.t + nt.d - p.t);
        if (drop) drop.merged++;
        return;
      }
      var c = { t: nt.t, d: nt.d, midi: nt.midi, vel: nt.vel };
      out.push(c);
      lastByMidi[nt.midi] = c;
    });
    return out;
  }

  // 生のノート({t,d,midi,vel})を整える。opts: tuning,capo,maxFret,minVel,overtones(既定true),minLen(秒)
  function cleanup(raw, opts) {
    opts = opts || {};
    var tuning = opts.tuning || STD_TUNING, capo = opts.capo | 0;
    var rg = opts.lo != null ? { lo: opts.lo, hi: opts.hi } : range(tuning, capo, opts.maxFret == null ? MAX_FRET : opts.maxFret); // lo/hi=弦楽器でない譜(五線紙)用の音域
    var minVel = opts.minVel || 0, minLen = opts.minLen || 0, ratio = opts.overtoneRatio || 0.6, mergeGap = opts.mergeGap || 0.04; // ratio: 倍音とみなす強さの上限(低音楽器は倍音が強く出るので大きめ) / mergeGap: 余韻の再検出とみなす隙間(秒)
    var drop = { range: 0, weak: 0, overtone: 0, merged: 0 };
    var list = raw.slice().sort(function (a, b) { return a.t - b.t || a.midi - b.midi; });
    if (mergeGap > 0.04) list = mergeRepeats(list, mergeGap, drop); // 低音楽器: 倍音の判定の前に、再検出でちぎれた音をつないでおく

    // 倍音: 鳴っている低い音の倍音(+12/+19/+24/+28/+31/+34/+36)にあたる、弱く短い音。倍音は後から立ち上がることもあるので、低い音が鳴っている間(最大8秒遡る)を見る
    var removed = new Array(list.length);
    if (opts.overtones !== false) {
      var lo = 0;
      for (var i = 0; i < list.length; i++) {
        var n = list[i];
        while (lo < i && list[lo].t < n.t - 8) lo++;
        for (var j = lo; j < list.length && list[j].t <= n.t + 0.06; j++) {
          var m = list[j];
          if (j === i || m.t + m.d < n.t - 0.02) continue;
          if (HARMONICS.indexOf(n.midi - m.midi) >= 0 && n.vel < m.vel * ratio && n.d <= m.d + 0.02) { removed[i] = "overtone"; break; }
        }
      }
    }
    var kept = [];
    for (var a = 0; a < list.length; a++) {
      var nt = list[a];
      if (removed[a]) { drop.overtone++; continue; }
      if (nt.midi < rg.lo || nt.midi > rg.hi) { drop.range++; continue; }
      if (nt.vel < minVel || nt.d < minLen) { drop.weak++; continue; }
      kept.push({ t: nt.t, d: nt.d, midi: nt.midi, vel: nt.vel });
    }

    // 余韻の再検出: 同じ音が前の音の終わり際から連続し、強さが前より弱くない場合だけ(再アタックは残す)
    var merged = mergeRepeats(kept, mergeGap, drop);
    return { notes: merged, dropped: drop };
  }

  // 手動修正の引き継ぎ: 新しい解析結果のうち、修正済みノートと同じ音・近い時刻のものを修正版に置き換え、対応が無い修正済みノートは足す
  function mergeEdited(fresh, old) {
    var edited = old.filter(function (n) { return n.edited || n.hidden; });
    if (!edited.length) return fresh;
    var used = {};
    var out = fresh.filter(function (n) {
      for (var i = 0; i < edited.length; i++) {
        var e = edited[i];
        if (e.midi === n.midi && Math.abs(e.t - n.t) < 0.08) { used[i] = true; return false; }
      }
      return true;
    });
    edited.forEach(function (e) { out.push(e); });
    out.sort(function (a, b) { return a.t - b.t || b.midi - a.midi; });
    return out;
  }

  // ノート列に弦・フレットを入れる。edited=trueのノートは固定して前後を再計算。hiddenは計算から除く
  function fingering(notes, opts) {
    opts = opts || {};
    var live = notes.filter(function (n) { return !n.hidden; });
    var fixed = {};
    live.forEach(function (n) { if (n.edited && n.string && n.fret != null) fixed[n.id] = { s: n.string, f: n.fret }; });
    var pos = assign(live, { tuning: opts.tuning, capo: opts.capo, maxFret: opts.maxFret, weights: opts.weights, fixed: fixed });
    live.forEach(function (n, i) {
      if (n.edited && fixed[n.id]) return;
      n.string = pos[i] ? pos[i].s : 0;
      n.fret = pos[i] ? pos[i].f : 0;
    });
    return notes;
  }

  // 単音(ヴォーカルなど)に整える。重なった音は、あとから始まる音が前の音を切る。ただし後の音が前よりかなり弱く前の音の中に収まる時(倍音・にじみ)は捨てる
  function monophonic(notes) {
    var list = notes.slice().sort(function (a, b) { return a.t - b.t || b.vel - a.vel; }), out = [];
    list.forEach(function (n) {
      var p = out.length ? out[out.length - 1] : null;
      if (p && n.t < p.t + p.d - 0.03) {
        if (n.vel < p.vel * 0.6 && n.t + n.d <= p.t + p.d + 0.03) return;
        p.d = Math.max(0.03, n.t - p.t);
      }
      out.push({ t: n.t, d: n.d, midi: n.midi, vel: n.vel });
    });
    return out;
  }

  // 五線紙の位置。d=全音階の通し番号(E4=30が第1線)、acc=1なら#。黒鍵は常に#で表す
  var PC_STEP = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6], PC_ACC = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
  function staffPos(midi) {
    var pc = ((midi % 12) + 12) % 12;
    return { d: (Math.floor(midi / 12) - 1) * 7 + PC_STEP[pc], acc: PC_ACC[pc] };
  }
  // 表示用のオクターブずらし: 中央値が低い(男声など)ときは1オクターブ上げて書く(ト音記号の慣習)
  function staffShift(notes) {
    if (!notes.length) return 0;
    var m = notes.map(function (n) { return n.midi; }).sort(function (a, b) { return a - b; })[notes.length >> 1];
    return m < 55 ? 12 : 0;
  }

  var api = { monophonic: monophonic, staffPos: staffPos, staffShift: staffShift, STD_TUNING: STD_TUNING, MAX_FRET: MAX_FRET, candidates: candidates, range: range, assign: assign, cleanup: cleanup, mergeEdited: mergeEdited, fingering: fingering, openOf: openOf };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.QNTabCore = api;
})(typeof self !== "undefined" ? self : this);
