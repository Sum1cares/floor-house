import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = join(import.meta.dirname, "../..");

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("Play listing copy fits Console limits", () => {
  const listing = read("store/listing.md");
  const short = listing.match(/## Short description[\s\S]*?\n\n([^\n]+)/)?.[1] ?? "";
  assert.equal(short, "Cooperative house: social tape, vaults, markets, bazaar. Paper capital.");
  assert.ok(short.length <= 80, `short description is ${short.length} chars`);
  assert.ok("FLOOR".length <= 30);
  const full = listing.split("## Full description")[1]?.split("## Play Data safety")[0] ?? "";
  assert.ok(full.length <= 4000, `full description is ${full.length} chars`);
  assert.match(listing, /paper capital/i);
  assert.match(listing, /not an offer to sell securities/i);
  assert.match(listing, /Leave the house/);
});

test("Android packaging meets 2026 Play gates", () => {
  const manifest = read("android/app/src/main/AndroidManifest.xml");
  const gradle = read("android/app/build.gradle");
  const vars = read("android/variables.gradle");
  const gradleProps = read("android/gradle.properties");
  const net = read("android/app/src/main/res/xml/network_security_config.xml");
  const backup = read("android/app/src/main/res/xml/backup_rules.xml");
  const extract = read("android/app/src/main/res/xml/data_extraction_rules.xml");
  const files = read("android/app/src/main/res/xml/file_paths.xml");
  const shortcuts = read("android/app/src/main/res/xml/shortcuts.xml");

  assert.match(vars, /targetSdkVersion = 36/);
  assert.match(vars, /compileSdkVersion = 36/);
  assert.match(gradle, /applicationId "house\.floor\.app"/);
  assert.match(gradle, /versionName "1\.0\.0"/);
  assert.match(gradle, /useLegacyPackaging = false/);
  assert.match(gradleProps, /android\.bundle\.enableUncompressedNativeLibs=true/);
  assert.match(manifest, /android\.permission\.INTERNET/);
  assert.doesNotMatch(manifest, /ACCESS_FINE_LOCATION/);
  assert.doesNotMatch(manifest, /READ_MEDIA/);
  assert.match(manifest, /usesCleartextTraffic="false"/);
  assert.match(manifest, /allowBackup="false"/);
  assert.match(manifest, /enableOnBackInvokedCallback="true"/);
  assert.match(manifest, /android:scheme="https"/);
  assert.match(manifest, /android:host="floor-house\.vercel\.app"/);
  assert.match(manifest, /android\.app\.shortcuts/);
  assert.match(net, /cleartextTrafficPermitted="false"/);
  assert.match(backup, /exclude domain="sharedpref"/);
  assert.match(extract, /cloud-backup/);
  assert.doesNotMatch(files, /external-path/);
  assert.match(shortcuts, /shortcutId="tape"/);
  assert.match(shortcuts, /shortcutId="vaults"/);
  assert.match(shortcuts, /shortcutId="markets"/);
});

test("age gate legal paths include the web deletion door", () => {
  const age = read("src/lib/age.ts");
  assert.match(age, /pathname\.startsWith\("\/legal\/"\)/);
  const del = read("src/routes/_app/legal/delete.tsx");
  assert.match(del, /LeaveHouse/);
  assert.match(del, /support@floor\.house/);
});
