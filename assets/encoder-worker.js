// Runs inside a Web Worker so encoding never blocks the page UI.
self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.0/lame.min.js');

self.onmessage = function (e) {
  const { id, left, right, sampleRate, channels, bitrate } = e.data;
  try {
    const encoder = new self.lamejs.Mp3Encoder(channels, sampleRate, bitrate);
    const blockSize = 1152;
    const total = left.length;
    const chunks = [];
    let totalLen = 0;

    for (let i = 0; i < total; i += blockSize) {
      const l = left.subarray(i, i + blockSize);
      let buf;
      if (channels === 2 && right) {
        const r = right.subarray(i, i + blockSize);
        buf = encoder.encodeBuffer(l, r);
      } else {
        buf = encoder.encodeBuffer(l);
      }
      if (buf.length > 0) {
        const chunk = new Int8Array(buf);
        chunks.push(chunk);
        totalLen += chunk.length;
      }
      if (i % (blockSize * 40) === 0) {
        self.postMessage({ type: 'progress', id, progress: Math.min(99, Math.round((i / total) * 100)) });
      }
    }
    const end = encoder.flush();
    if (end.length > 0) {
      const chunk = new Int8Array(end);
      chunks.push(chunk);
      totalLen += chunk.length;
    }

    const merged = new Uint8Array(totalLen);
    let offset = 0;
    for (const c of chunks) { merged.set(c, offset); offset += c.length; }

    self.postMessage({ type: 'done', id, mp3: merged }, [merged.buffer]);
  } catch (err) {
    self.postMessage({ type: 'error', id, message: String(err && err.message || err) });
  }
};
