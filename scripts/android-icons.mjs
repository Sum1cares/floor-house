import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const fg = (size, pad) => `<!doctype html>
<html><head><style>
  html,body{margin:0;width:${size}px;height:${size}px;background:transparent;}
  svg{display:block;width:100%;height:100%;}
</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108">
  <rect x="${pad}" y="${28 + pad / 4}" width="${72 - pad / 2}" height="8" rx="1.2" fill="#f4f4f5"/>
  <rect x="${pad}" y="${50 + pad / 8}" width="${54 - pad / 3}" height="8" rx="1.2" fill="#f4f4f5" opacity="0.72"/>
  <rect x="${pad}" y="${72}" width="${36 - pad / 4}" height="8" rx="1.2" fill="#f4f4f5" opacity="0.42"/>
</svg>
</body></html>`;

const legacy = (size) => `<!doctype html>
<html><head><style>
  html,body{margin:0;width:${size}px;height:${size}px;background:#0a0a0b;}
</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}">
  <rect width="32" height="32" rx="7" fill="#0a0a0b"/>
  <rect x="7" y="8" width="18" height="2.6" rx="0.3" fill="#f4f4f5"/>
  <rect x="7" y="14.7" width="13.5" height="2.6" rx="0.3" fill="#f4f4f5" opacity="0.72"/>
  <rect x="7" y="21.4" width="9" height="2.6" rx="0.3" fill="#f4f4f5" opacity="0.42"/>
</svg>
</body></html>`;

const densities = [
  ["mdpi", 48, 108],
  ["hdpi", 72, 162],
  ["xhdpi", 96, 216],
  ["xxhdpi", 144, 324],
  ["xxxhdpi", 192, 432],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ deviceScaleFactor: 1 });

for (const [name, launcher, foreground] of densities) {
  const dir = `android/app/src/main/res/mipmap-${name}`;
  mkdirSync(dir, { recursive: true });

  const page = await ctx.newPage({ viewport: { width: launcher, height: launcher } });
  await page.setContent(legacy(launcher), { waitUntil: "load" });
  const icon = await page.screenshot({ type: "png", omitBackground: false });
  writeFileSync(`${dir}/ic_launcher.png`, icon);
  writeFileSync(`${dir}/ic_launcher_round.png`, icon);
  await page.close();

  const fgPage = await ctx.newPage({ viewport: { width: foreground, height: foreground } });
  await fgPage.setContent(fg(foreground, 16), { waitUntil: "load" });
  const fgBuf = await fgPage.screenshot({ type: "png", omitBackground: true });
  writeFileSync(`${dir}/ic_launcher_foreground.png`, fgBuf);
  await fgPage.close();
}

await browser.close();
console.log("android launcher icons written");
