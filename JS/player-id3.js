// player-id3.js — ID3v2(TIT2/TPE1)の最小パーサー(ID3v1フォールバック付き)。依存なし。player-playlist.jsがreadId3Tags(file)を呼ぶ

async function readId3Tags(file) {
  try {
    const headSize = Math.min(file.size, 512 * 1024);
    const headBuf = await file.slice(0, headSize).arrayBuffer();
    const head = new Uint8Array(headBuf);

    const v2 = parseId3v2(head);
    if (v2.title || v2.artist) return v2;

    if (file.size >= 128) {
      const tailBuf = await file.slice(file.size - 128, file.size).arrayBuffer();
      const tail = new Uint8Array(tailBuf);
      const v1 = parseId3v1(tail);
      if (v1.title || v1.artist) return v1;
    }

    return { title: null, artist: null };
  } catch (e) {
    console.warn("readId3Tags failed:", e);
    return { title: null, artist: null };
  }
}

function parseId3v1(bytes) {
  if (bytes.length < 128 || bytes[0] !== 0x54 || bytes[1] !== 0x41 || bytes[2] !== 0x47) {
    return { title: null, artist: null };
  }
  const decode = (start, len) => {
    const slice = bytes.slice(start, start + len);
    let text = new TextDecoder("latin1").decode(slice);
    return text.replace(/\0.*$/, "").trim() || null;
  };
  return {
    title: decode(3, 30),
    artist: decode(33, 30),
  };
}

function parseId3v2(bytes) {
  const result = { title: null, artist: null };
  if (bytes.length < 10 || bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) {
    return result;
  }
  const majorVersion = bytes[3];
  const flags = bytes[5];
  const tagSize = synchsafeToInt(bytes[6], bytes[7], bytes[8], bytes[9]);
  let offset = 10;

  const hasExtendedHeader = (flags & 0x40) !== 0;
  if (hasExtendedHeader && offset + 4 <= bytes.length) {
    const extSize = majorVersion >= 4
      ? synchsafeToInt(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3])
      : readUint32BE(bytes, offset);
    offset += extSize;
  }

  const tagEnd = Math.min(bytes.length, 10 + tagSize);

  while (offset + 10 <= tagEnd) {
    let frameId, frameSize, frameFlagsSize;
    if (majorVersion === 2) {
      frameId = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2]);
      frameSize = readUint24BE(bytes, offset + 3);
      frameFlagsSize = 0;
      offset += 6;
    } else {
      frameId = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
      frameSize = majorVersion >= 4
        ? synchsafeToInt(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7])
        : readUint32BE(bytes, offset + 4);
      frameFlagsSize = 2;
      offset += 10;
    }

    if (frameSize <= 0 || offset + frameSize > bytes.length) break;
    if (frameId.charCodeAt(0) === 0) break;

    const isTitle = frameId === "TIT2" || frameId === "TT2";
    const isArtist = frameId === "TPE1" || frameId === "TP1";
    if (isTitle || isArtist) {
      const text = decodeTextFrame(bytes, offset, frameSize);
      if (isTitle && text) result.title = text;
      if (isArtist && text) result.artist = text;
    }

    offset += frameSize;
    if (result.title && result.artist) break;
  }

  return result;
}

function decodeTextFrame(bytes, start, size) {
  if (size <= 0) return null;
  const encodingByte = bytes[start];
  const textBytes = bytes.slice(start + 1, start + size);
  let text;
  try {
    if (encodingByte === 0x01 || encodingByte === 0x02) {
      text = new TextDecoder(encodingByte === 0x02 ? "utf-16be" : "utf-16").decode(textBytes);
    } else if (encodingByte === 0x03) {
      text = new TextDecoder("utf-8").decode(textBytes);
    } else {
      text = new TextDecoder("latin1").decode(textBytes);
    }
  } catch (e) {
    return null;
  }
  text = text.replace(/\0+$/, "").trim();
  return text || null;
}

function synchsafeToInt(b0, b1, b2, b3) {
  return ((b0 & 0x7f) << 21) | ((b1 & 0x7f) << 14) | ((b2 & 0x7f) << 7) | (b3 & 0x7f);
}

function readUint32BE(bytes, offset) {
  return (bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3];
}

function readUint24BE(bytes, offset) {
  return (bytes[offset] << 16) | (bytes[offset + 1] << 8) | bytes[offset + 2];
}

function readAudioDuration(file) {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const tempAudio = new Audio();
      let settled = false;
      const timeoutId = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(null);
      }, 8000);
      const cleanup = () => {
        clearTimeout(timeoutId);
        tempAudio.removeEventListener("loadedmetadata", onLoaded);
        tempAudio.removeEventListener("durationchange", onLoaded);
        tempAudio.removeEventListener("error", onError);
        URL.revokeObjectURL(url);
      };
      const onLoaded = () => {
        if (settled) return;
        const dur = tempAudio.duration;
        if (!Number.isFinite(dur)) return;
        settled = true;
        cleanup();
        resolve(dur);
      };
      const onError = () => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(null);
      };
      tempAudio.addEventListener("loadedmetadata", onLoaded);
      tempAudio.addEventListener("durationchange", onLoaded);
      tempAudio.addEventListener("error", onError);
      tempAudio.preload = "metadata";
      tempAudio.src = url;
    } catch (e) {
      resolve(null);
    }
  });
}

// ID3v2のAPIC(v2.2はPIC)からジャケット画像を取り出してBlobで返す。無ければnull。タグ全体(上限12MB)を読む
async function readId3Art(file) {
  try {
    const h = new Uint8Array(await file.slice(0, 10).arrayBuffer());
    if (h.length < 10 || h[0] !== 0x49 || h[1] !== 0x44 || h[2] !== 0x33) return null;
    const ver = h[3];
    if (ver < 2 || ver > 4) return null;
    const total = Math.min(file.size, 10 + synchsafeToInt(h[6], h[7], h[8], h[9]), 12 * 1024 * 1024);
    const b = new Uint8Array(await file.slice(0, total).arrayBuffer());
    let o = 10;
    if ((h[5] & 0x40) && ver >= 3) {
      o += ver === 4 ? synchsafeToInt(b[o], b[o + 1], b[o + 2], b[o + 3]) : readUint32BE(b, o) + 4;
    }
    const hdr = ver === 2 ? 6 : 10;
    while (o + hdr <= b.length) {
      const id = String.fromCharCode(b[o], b[o + 1], b[o + 2], ver === 2 ? 0 : b[o + 3]).replace(/\0/g, "");
      if (!id || b[o] === 0) break;
      let size;
      if (ver === 2) size = (b[o + 3] << 16) | (b[o + 4] << 8) | b[o + 5];
      else if (ver === 3) size = readUint32BE(b, o + 4);
      else size = synchsafeToInt(b[o + 4], b[o + 5], b[o + 6], b[o + 7]);
      const start = o + hdr, end = start + size;
      if (size <= 0 || end > b.length) break;
      if (id === "APIC" || id === "PIC") {
        const enc = b[start];
        let p = start + 1, mime;
        if (id === "PIC") {
          const f = String.fromCharCode(b[p], b[p + 1], b[p + 2]).toUpperCase();
          mime = f === "PNG" ? "image/png" : "image/jpeg";
          p += 3;
        } else {
          let q = p; while (q < end && b[q] !== 0) q++;
          mime = String.fromCharCode.apply(null, b.subarray(p, q)) || "image/jpeg";
          p = q + 1;
        }
        p += 1; // picture type
        if (enc === 1 || enc === 2) {
          while (p + 1 < end && !(b[p] === 0 && b[p + 1] === 0)) p += 2;
          p += 2;
        } else {
          while (p < end && b[p] !== 0) p++;
          p += 1;
        }
        if (p >= end) return null;
        if (!/^image\//.test(mime)) mime = (b[p] === 0x89) ? "image/png" : "image/jpeg";
        return new Blob([b.slice(p, end)], { type: mime });
      }
      o = end;
    }
    return null;
  } catch (e) {
    return null;
  }
}
