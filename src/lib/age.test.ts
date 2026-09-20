import assert from "node:assert/strict";
import { test } from "node:test";
import { AGE_KEY, ageAttested, attestAge, isLegalPath } from "./age.ts";

test("legal paths are readable before the 18+ attestation", () => {
  assert.equal(isLegalPath("/legal"), true);
  assert.equal(isLegalPath("/legal/"), true);
  assert.equal(isLegalPath("/legal/privacy"), true);
  assert.equal(isLegalPath("/legal/terms"), true);
  assert.equal(isLegalPath("/legal/support"), true);
  assert.equal(isLegalPath("/"), false);
  assert.equal(isLegalPath("/markets"), false);
  assert.equal(isLegalPath("/membership"), false);
});

test("age attestation fails closed", () => {
  assert.equal(ageAttested(null), false);
  assert.equal(ageAttested({ getItem: () => null }), false);
  assert.equal(ageAttested({ getItem: () => "0" }), false);
  assert.equal(
    ageAttested({
      getItem: () => {
        throw new Error("blocked");
      },
    }),
    false,
  );
  assert.equal(ageAttested({ getItem: (k) => (k === AGE_KEY ? "1" : null) }), true);
});

test("attestAge writes the house key", () => {
  const store: Record<string, string> = {};
  attestAge({
    setItem: (k, v) => {
      store[k] = v;
    },
  });
  assert.equal(store[AGE_KEY], "1");
});
