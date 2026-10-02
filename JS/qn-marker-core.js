// qn-marker-core.js — PLAYERとYouTube共有の判定ルール(v3.11.0)。秒数だけを扱う純粋関数(audio/YouTubeプレイヤーに触らない)。timesは表示ONマーカーの昇順配列
var QNMarkerCore = (function () {
  var EPS = 0.05;

  function pickSectionIndex(times, ct) {
    if (!times || times.length < 2) return -1;
    for (var i = 0; i < times.length - 1; i++) {
      var s = times[i], e = times[i + 1];
      if (i === times.length - 2) { if (ct >= s && ct <= e) return i; }
      else if (ct >= s && ct < e) return i;
    }
    return ct < times[0] ? 0 : times.length - 2;
  }

  function inRange(start, end, ct, preroll, dur) {
    var pr = preroll || 0;
    return ct >= Math.max(0, start - pr) - EPS && ct <= Math.min(dur || (end + pr), end + pr) + EPS;
  }

  function inSectionRange(times, idx, ct, preroll, dur) {
    if (idx === null || idx === undefined || idx < 0 || idx >= times.length - 1) return false;
    return inRange(times[idx], times[idx + 1], ct, preroll, dur);
  }

  function navRefTime(times, idx, ct, preroll, loopOn) {
    if (!loopOn || idx === null || idx === undefined || !(preroll > 0)) return ct;
    if (idx < 0 || idx >= times.length - 1) return ct;
    var start = times[idx], end = times[idx + 1];
    if (ct > end && ct <= end + preroll + EPS) return Math.max(start, end - 0.1);
    if (ct < start && ct >= start - preroll - EPS) return start;
    return ct;
  }

  function nextTime(times, ref) {
    if (!times.length) return null;
    for (var i = 0; i < times.length; i++) if (times[i] > ref + EPS) return times[i];
    return times[0];
  }

  function prevTime(times, ref) {
    if (!times.length) return null;
    var target = null, i;
    for (i = times.length - 1; i >= 0; i--) if (times[i] <= ref + EPS) { target = times[i]; break; }
    if (target === null) return times[times.length - 1];
    if (ref - target <= 0.5) {
      var earlier = null;
      for (i = times.length - 1; i >= 0; i--) if (times[i] < target - EPS) { earlier = times[i]; break; }
      return earlier !== null ? earlier : times[times.length - 1];
    }
    return target;
  }

  function isOutsideAB(a, b, t) {
    if (a === null || b === null || a === undefined || b === undefined) return false;
    var s = Math.min(a, b), e = Math.max(a, b);
    return t < s - EPS || t > e + EPS;
  }

  return {
    pickSectionIndex: pickSectionIndex, inRange: inRange, inSectionRange: inSectionRange,
    navRefTime: navRefTime, nextTime: nextTime, prevTime: prevTime, isOutsideAB: isOutsideAB
  };
})();
