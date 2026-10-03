import { verifyStoryBrowser } from "./verify-story-browser.mjs";
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, mkdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
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
  const client = new Client({
    name: "parallax-browser-check",
    version: "1.0.0",
  });
  let wireframe;
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [resolve("dist/cli.js"), "mcp", "--root", stage],
      stderr: "pipe",
    }),
  );
  try {
    const guide = await client.callTool({
      name: "parallax_design_guidance",
      arguments: { phase: "preview" },
    });
    assert.ok(!guide.isError);
    await writeFile(
      join(stage, "project.json"),
      JSON.stringify(guide.structuredContent.templates["project.json"]),
    );
    const result = await client.callTool({
      name: "parallax_create_preview",
      arguments: { recordPath: "project.json", outputPath: "wireframe.html" },
    });
    assert.ok(!result.isError);
    wireframe = result.structuredContent;
  } finally {
    await client.close();
  }
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
    if (label === "wireframe") {
      assert.equal(
        await page.locator("body").getAttribute("data-mode"),
        "site",
      );
      assert.equal(await page.locator(".toolbar").isVisible(), false);
      assert.equal(
        await page.locator(".effect-note").first().isVisible(),
        false,
      );
      await page.locator("#review-toggle").click();
      assert.equal(
        await page.locator("body").getAttribute("data-mode"),
        "review",
      );
      assert.ok(await page.locator(".toolbar").isVisible());
    }
    await page.locator("#reduce").check();
    await page.waitForFunction(
      () => document.querySelector(".layer").style.transform === "none",
    );
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
    assert.equal(await page.locator("#reduce").isChecked(), true);
    await page.evaluate(() => scrollTo(0, 450));
    await page.waitForFunction(
      () => document.querySelector(".layer").style.transform === "none",
    );
    await page.locator("#reduce").uncheck();
    if (label === "wireframe") {
      await page.locator("#effect").selectOption("none");
      await page.waitForFunction(() =>
        [...document.querySelectorAll(".layer")].every(
          (e) => e.style.transform === "none",
        ),
      );
      await page.locator("#effect").selectOption("planned");
    }
    await page.evaluate(() => scrollTo(0, 0));
    if (label === "wireframe") await page.locator("#review-toggle").click();
    await page.screenshot({ path: join(capture, label + "-desktop.png") });
    if (label === "wireframe") await page.locator("#review-toggle").click();
    for (const href of await page
      .locator("nav a")
      .evaluateAll((es) => es.map((e) => e.getAttribute("href")))) {
      assert.ok(href?.startsWith("#"));
      assert.equal(await page.locator(href).count(), 1);
    }
    if (label === "wireframe") {
      await page.evaluate(() => scrollTo(0, 450));
      await page.locator("#effect").selectOption("background-drift");
      await page.waitForFunction(
        () =>
          document.querySelector(".layer.midground").style.transform === "none",
      );
      assert.notEqual(
        await page
          .locator(".layer.background")
          .first()
          .evaluate((e) => e.style.transform),
        "none",
      );
      await page.locator("#effect").selectOption("pointer-depth");
      const beforePointer = await page
        .locator(".layer.foreground")
        .first()
        .evaluate((e) => e.style.transform);
      await page.mouse.move(1100, 650);
      await page.waitForFunction(
        (before) =>
          document.querySelector(".layer.foreground").style.transform !==
          before,
        beforePointer,
      );
      await page.locator("#effect").selectOption("sticky-reveal");
      await page.waitForFunction(
        () =>
          getComputedStyle(document.querySelector(".scene-stage")).position ===
          "sticky",
      );
      const scene = page.locator(".scene").first();
      const dimensions = await scene.evaluate((e) => ({
        top: scrollY + e.getBoundingClientRect().top,
        height: e.offsetHeight,
        stage: e.querySelector(".scene-stage").offsetHeight,
      }));
      assert.ok(
        dimensions.height > dimensions.stage * 2,
        "sticky has real native-scroll duration",
      );
      await page.evaluate(
        (y) => scrollTo(0, y),
        dimensions.top + (dimensions.height - dimensions.stage) * 0.5,
      );
      await page.waitForFunction(
        () => document.querySelector(".scene").dataset.beat === "middle",
      );
      assert.ok(
        await scene
          .locator(".scene-stage")
          .evaluate((e) => e.getBoundingClientRect().top < 150),
      );
      await page.locator("#effect").selectOption("planned");
      await page.evaluate(() => scrollTo(0, 0));
    }
    if (label === "wireframe") await page.locator("#review-toggle").click();
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
      source:
        label === "wireframe"
          ? "parallax_design_guidance + parallax_create_preview via real stdio MCP"
          : "existing fixture website",
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
  const storyEvidence = await verifyStoryBrowser(browser, capture);
  console.log(
    JSON.stringify(
      { browser: await browser.version(), evidence, storyEvidence },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
  await rm(stage, { recursive: true, force: true });
}
