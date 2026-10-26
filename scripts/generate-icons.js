import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, r, g, b) {
  // CRC32 table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const c = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(c, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit
  ihdr[9] = 2; // RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // Raw bitmap rows with filter byte 0
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      // Gradient sky blue with center hero accent
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const isInner = dist < width * 0.35;

      if (isInner) {
        rawData[pxOffset] = 59;     // Blue hero accent #3b82f6
        rawData[pxOffset + 1] = 130;
        rawData[pxOffset + 2] = 246;
      } else {
        const factor = y / height;
        rawData[pxOffset] = Math.round(56 + (2 - 56) * factor);     // #38bdf8 to #0284c7
        rawData[pxOffset + 1] = Math.round(189 + (132 - 189) * factor);
        rawData[pxOffset + 2] = Math.round(248 + (199 - 248) * factor);
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idat = chunk('IDAT', compressed);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, chunk('IHDR', ihdr), idat, iend]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write PNG files
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, 56, 189, 248));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, 56, 189, 248));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, 56, 189, 248));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, 56, 189, 248));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(32, 32, 56, 189, 248));

console.log('PWA icons successfully generated in /public!');
