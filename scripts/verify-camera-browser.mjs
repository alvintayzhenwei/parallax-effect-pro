import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
export async function verifyCameraBrowser(browser, capture) {
  const story = JSON.parse(
      await readFile("examples/continuous-camera/story.json", "utf8"),
    ),
    page = await browser.newPage({ viewport: { width: 1440, height: 900 } }),
    errors = [],
    external = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (/^https?:/.test(r.url())) external.push(r.url());
  });
  await page.goto(
    pathToFileURL(resolve("examples/continuous-camera/index.html")).href,
  );
  await page.waitForFunction(
    () =>
      document.getElementById("motion-mount").dataset.motionState ===
      "animated",
  );
  await page.evaluate(() => {
    window.cameraPoses = [];
    document
      .getElementById("motion-mount")
      .addEventListener("pep-motion-pose", (e) =>
        window.cameraPoses.push(e.detail),
      );
  });
  const identity = await page
      .locator('[data-actor-id="assembly"]')
      .getAttribute("data-object-id"),
    samples = [];
  for (const p of [
    0, 0.12, 0.21, 0.3, 0.45, 0.52, 0.6, 0.66, 0.72, 0.85, 1, 0.66, 0.52,
  ]) {
    await page.locator("#seek").evaluate((e, p) => {
      e.value = String(p);
      e.dispatchEvent(new Event("input"));
    }, p);
    const snapshot = await page.evaluate(() => window.cameraPoses.at(-1));
    assert.equal(
      await page
        .locator('[data-actor-id="assembly"]')
        .getAttribute("data-object-id"),
      identity,
    );
    samples.push(snapshot);
    if ([0.12, 0.21, 0.45, 0.52, 0.66, 0.85].includes(p))
      await page.screenshot({ path: join(capture, `camera-${p}.png`) });
  }
  assert.equal(
    samples[3].pose.actors.assembly.rotationY -
      samples[1].pose.actors.assembly.rotationY,
    360,
  );
  for (const id of ["lens", "sensor", "casing"]) {
    for (const key of ["x", "y", "z"]) {
      const initial = story.actors.find((a) => a.id === id).initial[key] ?? 0;
      assert.equal(samples[10].pose.actors[id][key] ?? 0, initial);
    }
  }
  assert.deepEqual(samples[5], samples[12]);
  assert.deepEqual(samples[7], samples[11]);
  const desktopConflicts = samples.flatMap((s) =>
    Object.entries(s.bounds)
      .filter(([, b]) => b.clipped || b.readingConflict)
      .map(([id, b]) => ({ progress: s.progress, id, ...b })),
  );
  const before = await page.evaluate(() => ({
    font: getComputedStyle(document.body).fontFamily,
    heading: getComputedStyle(document.querySelector("h1")).fontFamily,
    nav: document.querySelector(".site-nav").outerHTML,
  }));
  await page.setViewportSize({ width: 390, height: 844 });
  const mobile = [];
  for (const p of [0.12, 0.45, 0.52, 0.66, 0.85]) {
    await page.locator("#seek").evaluate((e, p) => {
      e.value = String(p);
      e.dispatchEvent(new Event("input"));
    }, p);
    mobile.push(await page.evaluate(() => window.cameraPoses.at(-1)));
    if (p === 0.52)
      await page.screenshot({ path: join(capture, "camera-mobile.png") });
  }
  const mobileConflicts = mobile.flatMap((s) =>
    Object.entries(s.bounds)
      .filter(([, b]) => b.clipped || b.readingConflict)
      .map(([id, b]) => ({ progress: s.progress, id, ...b })),
  );
  assert.deepEqual(
    await page.evaluate(() => ({
      font: getComputedStyle(document.body).fontFamily,
      heading: getComputedStyle(document.querySelector("h1")).fontFamily,
      nav: document.querySelector(".site-nav").outerHTML,
    })),
    before,
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator(".pep-motion-fallback").waitFor({ state: "visible" });
  await page.close();
  const staticPage = await browser.newPage({ javaScriptEnabled: false });
  await staticPage.goto(
    pathToFileURL(resolve("examples/continuous-camera/index.html")).href,
  );
  assert.equal(await staticPage.locator(".chapter").count(), 7);
  assert.ok(await staticPage.locator("#resolve").isVisible());
  await staticPage.close();
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  const evidence = {
    source:
      "actual MCP-generated record/stage composed in host-owned shell; no owner approval",
    identity,
    desktop: "1440x900",
    mobile: "390x844",
    desktopConflicts,
    mobileConflicts,
    samples,
    mobile,
    hostDesign: before,
    errors,
    external,
  };
  await writeFile(
    join(capture, "camera-evidence.json"),
    JSON.stringify(evidence, null, 2),
  );
  return evidence;
}
