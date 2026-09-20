import assert from "node:assert/strict";
import { test } from "node:test";
import { computeTier, vaultBook } from "./tiers.ts";

test("Ground owns commons; Penthouse is the illiquid book", () => {
  assert.equal(vaultBook("ground"), "ground");
  assert.equal(vaultBook("second"), "climb");
  assert.equal(vaultBook("third"), "climb");
  assert.equal(vaultBook("fourth"), "climb");
  assert.equal(vaultBook("penthouse"), "penthouse");
});

test("tier follows the higher of income band and contributed capital", () => {
  assert.equal(computeTier("open", 0), "ground");
  assert.equal(computeTier("open", 250_000), "second");
  assert.equal(computeTier("independent", 0), "penthouse");
  assert.equal(computeTier("working", 25_000_000), "penthouse");
});
