// Generates every brand file from the canonical logo geometry (src/components/brand/logo-paths.ts,
// made by scripts/generate-logo.mjs):
//   public/brand/presence-hospitality-{logo,mark}-on-{light,dark}.{svg,png}   Canva, PDFs, partners
//   src/app/icon.svg               SVG favicon (mark, logo ink)
//   src/app/favicon.ico            16/32/48 px (Google shows favicons at multiples of 48 px)
//   src/app/icon1.png              192 px app icon (plum tile)
//   src/app/apple-icon.png         180 px Apple touch icon
//   public/brand/icon-512.png, icon-maskable-512.png   web manifest icons (src/app/manifest.ts)
//   public/brand/presence-hospitality-logo-512.png   square logo on white (structured data)
//   public/og/presence-hospitality-{en,nl}.png       1200×630 share images (tagline from messages)
// Usage: npm run brand   (needs network for the Hanken Grotesk webfont used by the OG tagline)
import { chromium } from "playwright";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { LOCKUP, MARK_PATH, WORDMARK_PATH } from "../src/components/brand/logo-paths.ts";

// "Warm Holographic Navy" (02-10): petrol navy, warm ivory, terracotta.
const INK = "#173B4D"; // petrol navy
const PLUM = "#173B4D"; // app-icon tile
const LAV_LIGHT = "#F6F2EC"; // warm ivory
const LAV = "#ECE3D6"; // warm sand

const WHITE = "#FFFFFF"; // --logo-ink-inverse
const mark = (color, size) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-51 -51 102 102" width="${size}" height="${size}"><path fill="${color}" fill-rule="evenodd" d="${MARK_PATH}"/></svg>`;
const k = LOCKUP.mark.size / 100;
const PAD = 1;
const [vx, vy, vw, vh] = LOCKUP.viewBox.split(" ").map(Number);
const padded = [vx - PAD, vy - PAD, vw + 2 * PAD, vh + 2 * PAD];
const lockup = (color, height) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${padded.join(" ")}" height="${height}" width="${+((height * padded[2]) / padded[3]).toFixed(2)}"><g fill="${color}"><path fill-rule="evenodd" transform="translate(${LOCKUP.mark.cx} ${LOCKUP.mark.cy}) scale(${k})" d="${MARK_PATH}"/><path d="${WORDMARK_PATH}"/></g></svg>`;

const page = (body, w, h, bg = "transparent") => `<!doctype html><html><head>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;800&display=block" rel="stylesheet">
<style>*{margin:0;box-sizing:border-box}html,body{width:${w}px;height:${h}px;background:${bg};overflow:hidden;font-family:'Hanken Grotesk',sans-serif}</style>
</head><body>${body}</body></html>`;

const b = await chromium.launch({ channel: "chrome" });
const shot = async (html, w, h, path, transparent = false) => {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await p.setContent(html, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  const buf = await p.screenshot({ omitBackground: transparent, type: "png" });
  await p.close();
  if (path) writeFileSync(path, buf);
  return buf;
};

// Logo exports for Canva, PDFs and partners: SVG (vector, no font needed) + transparent PNG.
mkdirSync("public/brand", { recursive: true });
for (const [tone, color] of [["on-light", INK], ["on-dark", WHITE]]) {
  writeFileSync(`public/brand/presence-hospitality-logo-${tone}.svg`, lockup(color, padded[3]));
  writeFileSync(`public/brand/presence-hospitality-mark-${tone}.svg`, mark(color, 100));
  const lw = 2400;
  const lh = Math.round((lw * padded[3]) / padded[2]);
  await shot(page(lockup(color, lh), lw, lh), lw, lh, `public/brand/presence-hospitality-logo-${tone}.png`, true);
  await shot(page(mark(color, 1024), 1024, 1024), 1024, 1024, `public/brand/presence-hospitality-mark-${tone}.png`, true);
}

// SVG favicon: the mark alone in the logo ink on transparent (white in a dark browser theme).
writeFileSync(
  "src/app/icon.svg",
  mark(INK, 32).replace("><path", "><style>@media (prefers-color-scheme: dark){path{fill:#FFFFFF}}</style><path"),
);

// App icons: ivory mark on a petrol tile (readable on light and dark result pages).
const tile = (size, radius) =>
  page(`<div style="width:${size}px;height:${size}px;border-radius:${radius}px;background:${PLUM};display:grid;place-items:center">${mark(LAV_LIGHT, Math.round(size * (size <= 48 ? 0.86 : 0.7)))}</div>`, size, size);
await shot(tile(192, 40), 192, 192, "src/app/icon1.png", true);
await shot(tile(180, 0), 180, 180, "src/app/apple-icon.png");
// Web manifest: rounded tile, and a full-bleed maskable one with the mark inside the 80% safe zone.
mkdirSync("public/brand", { recursive: true });
await shot(tile(512, 108), 512, 512, "public/brand/icon-512.png", true);
await shot(
  page(`<div style="width:512px;height:512px;background:${PLUM};display:grid;place-items:center">${mark(LAV_LIGHT, 300)}</div>`, 512, 512),
  512,
  512,
  "public/brand/icon-maskable-512.png",
);

// favicon.ico with PNG-encoded 16/32/48 entries.
const icoSizes = [16, 32, 48];
const pngs = [];
for (const s of icoSizes) pngs.push(await shot(tile(s, Math.round(s * 0.22)), s, s, null, true));
const header = Buffer.alloc(6 + 16 * pngs.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(pngs.length, 4);
let offset = header.length;
pngs.forEach((png, i) => {
  const e = 6 + i * 16;
  const s = icoSizes[i];
  header.writeUInt8(s === 256 ? 0 : s, e);
  header.writeUInt8(s === 256 ? 0 : s, e + 1);
  header.writeUInt8(0, e + 2);
  header.writeUInt8(0, e + 3);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(png.length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += png.length;
});
writeFileSync("src/app/favicon.ico", Buffer.concat([header, ...pngs]));

// Square logo on white for structured data / knowledge panel.
mkdirSync("public/brand", { recursive: true });
await shot(
  page(`<div style="width:512px;height:512px;display:grid;place-items:center;background:#fff">${mark(INK, 360)}</div>`, 512, 512, "#fff"),
  512,
  512,
  "public/brand/presence-hospitality-logo-512.png",
);

// Share images (Open Graph / X): mark + wordmark + the home title's tagline.
mkdirSync("public/og", { recursive: true });
for (const locale of ["en", "nl"]) {
  const msg = JSON.parse(readFileSync(`messages/${locale}.json`, "utf8"));
  const tagline = msg.meta.title.split(" | ")[1];
  const html = page(
    `<div style="position:relative;width:1200px;height:630px;padding:84px 96px;display:flex;flex-direction:column;justify-content:space-between;color:${INK};
      background:radial-gradient(60% 70% at 88% 12%, #dbe5e1 0%, transparent 60%), radial-gradient(50% 60% at 6% 100%, #e6dccd 0%, transparent 62%), radial-gradient(40% 50% at 60% 110%, #edd6ca 0%, transparent 60%), linear-gradient(160deg, ${LAV_LIGHT} 0%, ${LAV} 100%)">
      <div style="display:flex">${lockup(INK, 58)}</div>
      <div style="font-weight:800;font-size:68px;line-height:1.02;letter-spacing:-0.035em;max-width:940px">${tagline}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:26px;font-weight:400">
        <span>presence-hospitality.com</span>
        <span style="width:220px;height:10px;border-radius:999px;background:#B74B32"></span></div>
    </div>`,
    1200,
    630,
  );
  await shot(html, 1200, 630, `public/og/presence-hospitality-${locale}.png`);
}
await b.close();
console.log("brand assets written");
