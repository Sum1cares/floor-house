#!/usr/bin/env node
/**
 * Capture 9:16 Play phone screenshots from the running house.
 * Usage: node scripts/play-screenshots.mjs [baseUrl]
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const base = process.argv[2] || "http://127.0.0.1:8080";
const out = new URL("../store/screenshots/", import.meta.url).pathname;
mkdirSync(out, { recursive: true });

const shots = [
  ["01-tape.png", "/"],
  ["02-vaults.png", "/vaults"],
  ["03-markets.png", "/markets"],
  ["04-commons.png", "/commons"],
  ["05-bazaar.png", "/bazaar"],
  ["06-books.png", "/vaults?book=penthouse"],
];

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});
await page.goto(base, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.setItem("floor.age.ok", "1"));
for (const [file, path] of shots) {
  await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}${file}`, type: "png" });
  console.log(file);
}
await browser.close();
