import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
for (const path of ["../assets/preview.js", "../examples/studio/script.js"]) {
  test(`manual reduced motion survives OS changes: ${path}`, async () => {
    const listeners: Record<string, () => void> = {};
    const preference = {
      matches: false,
      addEventListener: (_: string, fn: () => void) => {
        listeners.os = fn;
      },
    };
    const control = {
      checked: false,
      disabled: false,
      value: "desktop",
      addEventListener: (_: string, fn: () => void) => {
        listeners.manual = fn;
      },
    };
    const other = { value: "0.6", addEventListener() {}, textContent: "" };
    const body = { dataset: {}, classList: { toggle() {} } };
    runInNewContext(await readFile(new URL(path, import.meta.url), "utf8"), {
      document: {
        body,
        querySelector: (id: string) => (id === "#reduce" ? control : other),
        querySelectorAll: () => [],
      },
      matchMedia: (query: string) =>
        query.includes("reduced-motion")
          ? preference
          : { matches: false, addEventListener() {} },
      requestAnimationFrame: () => 1,
      addEventListener() {},
      innerWidth: 1280,
      innerHeight: 800,
    });
    control.checked = true;
    listeners.manual!();
    preference.matches = true;
    listeners.os!();
    preference.matches = false;
    listeners.os!();
    assert.equal(control.checked, true);
    assert.equal(control.disabled, false);
  });
}
