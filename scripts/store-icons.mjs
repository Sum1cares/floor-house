import { writeFileSync, mkdirSync } from "node:fs";
import { chromium } from "playwright";

const sizes = [180, 192, 512, 1024];

const iconHtml = (size) => `<!doctype html>
<html><head><style>
  html,body{margin:0;background:#0a0a0b;width:${size}px;height:${size}px;}
  svg{display:block;width:100%;height:100%;}
</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="${size >= 512 ? 8 : 7}" fill="#0a0a0b"/>
  <rect x="7" y="8" width="18" height="2.6" rx="0.3" fill="#f4f4f5"/>
  <rect x="7" y="14.7" width="13.5" height="2.6" rx="0.3" fill="#f4f4f5" opacity="0.72"/>
  <rect x="7" y="21.4" width="9" height="2.6" rx="0.3" fill="#f4f4f5" opacity="0.42"/>
</svg>
</body></html>`;

const featureHtml = `<!doctype html>
<html><head><style>
  html,body{margin:0;width:1024px;height:500px;background:#0a0a0b;color:#f4f4f5;font-family:Georgia,serif;}
  .wrap{display:flex;height:500px;padding:56px 72px;box-sizing:border-box;align-items:center;justify-content:space-between;}
  h1{font-size:92px;font-weight:500;margin:0;letter-spacing:-0.03em;}
  p{font-family:ui-sans-serif,system-ui,sans-serif;color:#a1a1aa;max-width:20rem;line-height:1.45;font-size:20px;}
  .mark{width:120px;height:120px;}
</style></head><body>
<div class="wrap">
  <div>
    <h1>FLOOR</h1>
    <p>A cooperative house. Ground owns the wall. Penthouse is the illiquid book.</p>
  </div>
  <svg class="mark" viewBox="0 0 32 32">
    <rect x="4" y="7" width="24" height="3.2" rx="0.4" fill="#f4f4f5"/>
    <rect x="4" y="14.4" width="18" height="3.2" rx="0.4" fill="#f4f4f5" opacity="0.72"/>
    <rect x="4" y="21.8" width="12" height="3.2" rx="0.4" fill="#f4f4f5" opacity="0.42"/>
  </svg>
</div>
</body></html>`;

const browser = await chromium.launch();
mkdirSync("public", { recursive: true });
mkdirSync("store", { recursive: true });

for (const size of sizes) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(iconHtml(size), { waitUntil: "load" });
  const buf = await page.screenshot({ type: "png" });
  writeFileSync(`public/icon-${size}.png`, buf);
  if (size === 1024) writeFileSync("store/icon-appstore.png", buf);
  if (size === 512) writeFileSync("store/icon-play.png", buf);
  await page.close();
}

const feature = await browser.newPage({ viewport: { width: 1024, height: 500 } });
await feature.setContent(featureHtml, { waitUntil: "load" });
const graphic = await feature.screenshot({ type: "png" });
writeFileSync("public/feature-graphic.png", graphic);
writeFileSync("store/feature-graphic.png", graphic);
await feature.close();
await browser.close();
console.log("wrote icons and feature graphic");
