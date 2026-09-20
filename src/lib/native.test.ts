import assert from "node:assert/strict";
import { test } from "node:test";
import { pathFromAppUrl } from "./native.ts";

test("https app links keep the in-house path", () => {
  assert.equal(pathFromAppUrl("https://floor-house.vercel.app/vaults"), "/vaults");
  assert.equal(pathFromAppUrl("https://floor-house.vercel.app/legal/privacy"), "/legal/privacy");
  assert.equal(pathFromAppUrl("https://floor-house.vercel.app/"), "/");
  assert.equal(pathFromAppUrl("https://floor-house.vercel.app/search?q=tape"), "/search?q=tape");
});

test("custom scheme deep links land on a path", () => {
  assert.equal(pathFromAppUrl("house.floor.app:///legal/delete"), "/legal/delete");
  assert.equal(pathFromAppUrl("house.floor.app://vaults"), "/vaults");
  assert.equal(pathFromAppUrl("house.floor.app://markets/fed-cut"), "/markets/fed-cut");
});

test("junk URLs fail closed", () => {
  assert.equal(pathFromAppUrl("not a url"), null);
  assert.equal(pathFromAppUrl(""), null);
});
