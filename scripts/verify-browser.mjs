import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdtemp, copyFile, mkdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createPreview } from "../dist/preview.js";
const stage = await mkdtemp(join(tmpdir(), "parallax-browser-"));
const capture = process.env.PARALLAX_CAPTURE_DIR
  ? resolve(process.env.PARALLAX_CAPTURE_DIR)
  : stage;
await mkdir(capture, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PARALLAX_BROWSER_EXECUTABLE
    ? { executablePath: process.env.PARALLAX_BROWSER_EXECUTABLE }
    : {}),
});
try {
  await copyFile("tests/fixtures/project.json", join(stage, "project.json"));
  const wireframe = await createPreview(
    stage,
    "project.json",
    "wireframe.html",
  );
  const evidence = [];
  for (const [label, path] of [
    ["wireframe", wireframe.path],
    ["example-site", resolve("examples/studio/index.html")],
  ]) {
    const errors = [];
    const page = await browser.newPage({
      viewport: { width: 1280, height: 800 },
    });
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto(pathToFileURL(path).href);
    assert.ok(await page.locator("h1").isVisible());
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(() =>
        document.activeElement?.textContent?.includes("Skip"),
      ),
      true,
    );
    await page.keyboard.press("Enter");
    await page.evaluate(() => scrollTo(0, 350));
    await page.waitForFunction(() =>
      document
        .querySelector(".layer")
        ?.style.transform?.startsWith("translate"),
    );
    const before = await page
      .locator(".layer")
      .first()
      .evaluate((e) => e.style.transform);
    assert.ok(!before.includes("0px, 0px"));
    await page.locator("#reduce").check();
    await page.waitForFunction(
      () => document.querySelector(".layer").style.transform === "none",
    );
    await page.locator("#reduce").uncheck();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector(".layer")).transform === "none",
    );
    assert.equal(
      await page
        .locator(".layer")
        .first()
        .evaluate((e) => getComputedStyle(e).transform),
      "none",
    );
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: join(capture, label + "-desktop.png") });
    for (const href of await page
      .locator("nav a")
      .evaluateAll((es) => es.map((e) => e.getAttribute("href")))) {
      assert.ok(href?.startsWith("#"));
      assert.equal(await page.locator(href).count(), 1);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    await page.screenshot({ path: join(capture, label + "-mobile.png") });
    const metrics = await page.evaluate(() => {
      const n = performance.getEntriesByType("navigation")[0];
      return {
        domContentLoadedMs: n.domContentLoadedEventEnd,
        loadMs: n.loadEventEnd,
        resources: performance.getEntriesByType("resource").length,
      };
    });
    assert.deepEqual(errors, []);
    const staticPage = await browser.newPage({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    await staticPage.goto(pathToFileURL(path).href);
    assert.ok(await staticPage.locator("h1").isVisible());
    assert.equal(await staticPage.locator("main section").count(), 3);
    await staticPage.close();
    const reducedPage = await browser.newPage({ reducedMotion: "reduce" });
    await reducedPage.goto(pathToFileURL(path).href);
    await reducedPage.waitForFunction(
      () => document.querySelector("#reduce").disabled,
    );
    assert.equal(
      await reducedPage
        .locator(".layer")
        .first()
        .evaluate((e) => e.style.transform),
      "none",
    );
    await reducedPage.close();
    evidence.push({
      label,
      desktop: "1280x800",
      mobile: "390x844",
      reducedMotion: "manual, live OS and initial OS",
      noJs: "content available",
      errors,
      bytes: (await stat(path)).size,
      metrics,
    });
    await page.close();
  }
  console.log(
    JSON.stringify({ browser: await browser.version(), evidence }, null, 2),
  );
} finally {
  await browser.close();
  await rm(stage, { recursive: true, force: true });
}
