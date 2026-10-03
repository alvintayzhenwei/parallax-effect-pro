import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

// Exercise the shipped renderer at real scroll/pointer inputs, without a browser dependency.
test("core recipes have different travel; sticky progression spans three beats; reduced motion resets", async () => {
  const handlers: Record<string, (e?: any) => void> = {};
  const controls: Record<string, any> = {};
  for (const id of [
    "reduce",
    "intensity",
    "view",
    "effect",
    "status",
    "providers",
    "provider-note",
  ])
    controls["#" + id] = {
      value: id === "intensity" ? "0.6" : id === "view" ? "desktop" : "planned",
      checked: false,
      addEventListener: (event: string, fn: any) => {
        handlers[id + event] = fn;
      },
    };
  let top = 120;
  const effects = [
    "layered-depth",
    "background-drift",
    "pointer-depth",
    "sticky-reveal",
  ];
  const scenes = effects.map((effect) => {
    const layers = ["background", "midground", "foreground"].map(
      (depth, i) => ({
        dataset: {
          depth,
          travel: String([0.12, 0.25, 0.4][i]),
          direction: "vertical",
        },
        style: { transform: "", opacity: "" },
      }),
    );
    const beats = [0, 1, 2].map(() => ({ dataset: {}, setAttribute() {} }));
    return {
      dataset: { effect },
      layers,
      beats,
      getBoundingClientRect: () => ({ top, bottom: top + 2400, height: 2400 }),
      querySelector: () => ({ offsetHeight: 600 }),
      querySelectorAll: (q: string) => (q === ".layer" ? layers : beats),
    };
  });
  let scheduled: (() => void) | undefined;
  runInNewContext(
    await readFile(new URL("../assets/preview.js", import.meta.url), "utf8"),
    {
      document: {
        body: { dataset: {} },
        querySelector: (q: string) => controls[q],
        querySelectorAll: () => scenes,
      },
      matchMedia: () => ({ matches: false, addEventListener() {} }),
      requestAnimationFrame: (fn: () => void) => {
        scheduled = fn;
        return 1;
      },
      addEventListener: (event: string, fn: any) => {
        handlers[event] = fn;
      },
      innerWidth: 1280,
      innerHeight: 800,
    },
  );
  const tick = () => {
    handlers.scroll!();
    scheduled!();
  };
  const before = scenes[0]!.layers.map((l) => l.style.transform);
  assert.equal(scenes[3]!.dataset.beat, "start");
  top = -700;
  tick();
  const middle = scenes[0]!.layers.map((l) => l.style.transform);
  assert.notDeepEqual(before, middle);
  assert.equal(new Set(middle).size, 3, "depth planes must travel differently");
  assert.notEqual(
    scenes[0]!.layers[1]!.style.transform,
    scenes[1]!.layers[1]!.style.transform,
  );
  assert.equal(
    scenes[1]!.layers[1]!.style.transform,
    "none",
    "background drift leaves focal subject stable",
  );
  assert.equal(scenes[3]!.dataset.beat, "middle");
  const pointerBefore = scenes[2]!.layers[2]!.style.transform;
  handlers.pointermove!({ clientX: 1200, clientY: 750 });
  scheduled!();
  assert.notEqual(scenes[2]!.layers[2]!.style.transform, pointerBefore);
  top = -1700;
  tick();
  assert.equal(scenes[3]!.dataset.beat, "end");
  assert.notEqual(
    scenes[3]!.layers[2]!.style.transform,
    scenes[0]!.layers[2]!.style.transform,
  );
  controls["#reduce"].checked = true;
  handlers.reducechange!();
  scheduled!();
  for (const scene of scenes)
    for (const layer of scene.layers)
      assert.equal(layer.style.transform, "none");
});
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

test("review toggle changes inspection mode only and is reversible", async () => {
  const handlers: Record<string, () => void> = {};
  const attributes: Record<string, string> = {};
  const body = { dataset: { mode: "site" } };
  const toggle = {
    textContent: "Review design",
    addEventListener: (_: string, fn: () => void) => {
      handlers.toggle = fn;
    },
    setAttribute: (key: string, value: string) => {
      attributes[key] = value;
    },
  };
  const other = { value: "planned", checked: false, addEventListener() {} };
  runInNewContext(
    await readFile(new URL("../assets/preview.js", import.meta.url), "utf8"),
    {
      document: {
        body,
        querySelector: (id: string) =>
          id === "#review-toggle" ? toggle : other,
        querySelectorAll: () => [],
      },
      matchMedia: () => ({ matches: false, addEventListener() {} }),
      requestAnimationFrame: () => 1,
      addEventListener() {},
      innerWidth: 1280,
      innerHeight: 800,
    },
  );
  handlers.toggle!();
  assert.equal(body.dataset.mode, "review");
  assert.equal(attributes["aria-expanded"], "true");
  assert.equal(toggle.textContent, "Return to site");
  handlers.toggle!();
  assert.equal(body.dataset.mode, "site");
  assert.equal(attributes["aria-expanded"], "false");
  assert.equal(toggle.textContent, "Review design");
});
