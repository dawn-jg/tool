// 纯 Node.js 生成 og-image.png (1200x630)
// 用 Buffer 手写最小 PNG，无第三方依赖
const fs = require('fs');
const zlib = require('zlib');

// ── 参数 ──
const W = 1200, H = 630;

// ── CRC32 ──
const crcTable = (function () {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const d = Buffer.concat([Buffer.from(type), data]);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(d));
  return Buffer.concat([len, d, crcBuf]);
}

// ── 绘制像素 ──
// 颜色：蓝渐变背景 + 白文字(用矩形近似)
// 我们在像素层面绘制一个蓝渐变背景 + 白色大色块文字替代
const raw = Buffer.alloc(W * H * 3); // RGB

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    // 蓝渐变：从深蓝(30,58,138)到亮蓝(59,130,246)
    const t = (x + y * 0.5) / (W + H * 0.5);
    raw[i]     = Math.round(30 + (59 - 30) * t);     // R
    raw[i + 1] = Math.round(58 + (130 - 58) * t);     // G
    raw[i + 2] = Math.round(138 + (246 - 138) * t);  // B
  }
}

// 绘制白色矩形色块模拟文字区域（简化渲染）
// 品牌名区域：中心偏上白色大矩形
function fillRect(x1, y1, x2, y2, r, g, b) {
  x1 = Math.max(0, x1); y1 = Math.max(0, y1);
  x2 = Math.min(W, x2); y2 = Math.min(H, y2);
  for (let y = y1; y < y2; y++) {
    for (let x = x1; x < x2; x++) {
      const i = (y * W + x) * 3;
      raw[i] = r; raw[i + 1] = g; raw[i + 2] = b;
    }
  }
}

// 装饰圆（右上角 + 左下角）
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    // 右上装饰圆
    const cx1 = 1050, cy1 = 100, r1 = 180;
    const d1 = Math.sqrt((x - cx1) ** 2 + (y - cy1) ** 2);
    if (d1 < r1) {
      const i = (y * W + x) * 3;
      raw[i] = Math.min(255, raw[i] + 15);
      raw[i + 1] = Math.min(255, raw[i + 1] + 20);
      raw[i + 2] = Math.min(255, raw[i + 2] + 30);
    }
    // 左下装饰圆
    const cx2 = 150, cy2 = 520, r2 = 220;
    const d2 = Math.sqrt((x - cx2) ** 2 + (y - cy2) ** 2);
    if (d2 < r2) {
      const i = (y * W + x) * 3;
      raw[i] = Math.min(255, raw[i] + 12);
      raw[i + 1] = Math.min(255, raw[i + 1] + 18);
      raw[i + 2] = Math.min(255, raw[i + 2] + 28);
    }
  }
}

// 标题 "Tooltip.cc" 白色矩形 (近似)
fillRect(350, 110, 850, 250, 255, 255, 255);
// 副标题行1
fillRect(220, 290, 980, 360, 220, 240, 255);
// 副标题行2
fillRect(180, 370, 1020, 430, 180, 220, 255);
// 徽章背景
fillRect(455, 455, 745, 515, 80, 130, 200);
// 徽章文字
fillRect(470, 468, 730, 502, 255, 255, 255);

// ── PNG 编码 ──
// 1. Add filter byte (0 = none) per row
const scanlines = Buffer.alloc(H * (W * 3 + 1));
for (let y = 0; y < H; y++) {
  scanlines[y * (W * 3 + 1)] = 0;
  raw.copy(scanlines, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3);
}
const compressed = zlib.deflateSync(scanlines, { level: 6 });

// PNG signature
const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
// IHDR: W, H, 8bit, RGB
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;  // bit depth
ihdr[9] = 2;  // color type: RGB
ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

const png = Buffer.concat([
  sig,
  chunk('IHDR', ihdr),
  chunk('IDAT', compressed),
  chunk('IEND', Buffer.alloc(0)),
]);

fs.writeFileSync('D:/tooltip.cc/public/og-image.png', png);
console.log('og-image.png written:', png.length, 'bytes');
