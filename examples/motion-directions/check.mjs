import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../../", import.meta.url)).replace(
  /\/$/,
  "",
);
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PARALLAX_BROWSER_EXECUTABLE
    ? { executablePath: process.env.PARALLAX_BROWSER_EXECUTABLE }
    : {}),
});
const capture = root + "/docs/design/motion-captures";
await mkdir(capture, { recursive: true });
const evidence = [];
try {
  for (const width of [1280, 390]) {
    const page = await browser.newPage({
      viewport: { width, height: width === 1280 ? 800 : 844 },
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(
      "file://" + root + "/examples/motion-directions/index.html",
    );
    for (const direction of ["atelier", "expedition", "gallery"]) {
      await page.locator("[data-direction=" + direction + "]").click();
      const bounds = await page
        .locator("#stage")
        .evaluate((e) => ({
          top: e.offsetTop,
          height: e.offsetHeight,
          frame: e.querySelector(".frame").offsetHeight,
        }));
      await page.evaluate(
        (y) => scrollTo({ top: y, behavior: "instant" }),
        bounds.top - 16,
      );
      await page.waitForTimeout(100);
      const start = await page
        .locator(".study.is-active .motion-layer")
        .evaluateAll((es) => es.map((e) => e.style.transform));
      await page.evaluate(
        (y) => scrollTo({ top: y, behavior: "instant" }),
        bounds.top - 16 + (bounds.height - bounds.frame - 16) * 0.8,
      );
      await page.waitForTimeout(100);
      const end = await page
        .locator(".study.is-active .motion-layer")
        .evaluateAll((es) => es.map((e) => e.style.transform));
      assert.notDeepEqual(start, end, direction + " scroll must change layers");
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
        "overflow",
      );
      await page.screenshot({
        path: capture + "/" + direction + "-" + width + ".png",
      });
      await page.locator("#motion-reduce").check();
      await page.waitForTimeout(100);
      const fixed = await page
        .locator(".study.is-active .motion-layer")
        .evaluateAll((es) => es.map((e) => e.style.transform));
      await page.evaluate(
        (y) => scrollTo({ top: y, behavior: "instant" }),
        bounds.top,
      );
      await page.waitForTimeout(100);
      assert.deepEqual(
        await page
          .locator(".study.is-active .motion-layer")
          .evaluateAll((es) => es.map((e) => e.style.transform)),
        fixed,
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      assert.equal(await page.locator("#motion-reduce").isChecked(), true);
      await page.locator("#motion-reduce").uncheck();
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.evaluate(
        (y) => scrollTo({ top: y, behavior: "instant" }),
        bounds.top + 300,
      );
      await page.waitForTimeout(100);
      assert.equal(
        await page
          .locator(".study.is-active .motion-layer")
          .evaluateAll((es) =>
            es.every((e) => getComputedStyle(e).transform === "none"),
          ),
        true,
      );
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      evidence.push({
        direction,
        width,
        scroll: true,
        manualReduced: true,
        overflow: false,
      });
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  const staticPage = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  await staticPage.goto(
    "file://" + root + "/examples/motion-directions/index.html",
  );
  assert.equal(await staticPage.locator(".study:visible").count(), 3);
  await staticPage.close();
  console.log(JSON.stringify({ evidence, noJs: true }, null, 2));
} finally {
  await browser.close();
}
