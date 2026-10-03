import { readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
export async function verifyStoryBrowser(browser, capture) {
  const root = await mkdtemp(join(tmpdir(), "story-browser-"));
  const client = new Client({ name: "story-browser", version: "1.0.0" });
  try {
    const story = JSON.parse(
      await readFile("tests/fixtures/story.json", "utf8"),
    );
    const generic = structuredClone(story);
    story.stages[0].renderer = "3d";
    story.stages[0].camera.initial = { x: 0, y: 0, z: 5, fov: 45 };
    story.stages[0].lights = [
      {
        id: "key",
        kind: "spot",
        color: "#ffffff",
        initial: {
          x: 3,
          y: 3,
          z: 4,
          targetX: 0,
          targetY: 0,
          targetZ: 0,
          intensity: 80,
        },
      },
      {
        id: "fill",
        kind: "ambient",
        color: "#ffffff",
        initial: { intensity: 1 },
      },
    ];
    story.actors[0].initial = { x: 0, y: 0, z: 0, opacity: 1 };
    story.actors[0].parentId = "assembly";
    story.actors.unshift({
      id: "assembly",
      stageId: "journey",
      role: "Persistent assembly",
      initial: { opacity: 0.5 },
      visual: { kind: "group" },
    });
    story.tracks.push(
      {
        id: "spotlight",
        stageId: "journey",
        target: { kind: "light", id: "key" },
        property: "intensity",
        keyframes: [
          { progress: 0, value: 80, easing: "linear" },
          { progress: 1, value: 20, easing: "linear" },
        ],
      },
      {
        id: "light-target",
        stageId: "journey",
        target: { kind: "light", id: "key" },
        property: "targetX",
        keyframes: [
          { progress: 0, value: 0, easing: "linear" },
          { progress: 1, value: 1, easing: "linear" },
        ],
      },
    );
    await writeFile(join(root, "story.json"), JSON.stringify(story));
    await client.connect(
      new StdioClientTransport({
        command: process.execPath,
        args: [resolve("dist/cli.js"), "mcp", "--root", root],
        stderr: "pipe",
      }),
    );
    const result = await client.callTool({
      name: "parallax_create_preview",
      arguments: { recordPath: "story.json", outputPath: "story.html" },
    });
    assert.ok(!result.isError);
    const file = result.structuredContent.path;
    generic.actors[0].role = "Signal crossing a continuous space";
    generic.actors[0].visual.dimensions = [0.12, 0.12, 0.12];
    generic.actors[0].visual.shape = "cylinder";
    generic.tracks[0].property = "rotationZ";
    generic.tracks.push({
      id: "signal-travel",
      stageId: "journey",
      target: { kind: "actor", id: "subject" },
      property: "x",
      keyframes: [
        { progress: 0, value: 0.4, easing: "linear" },
        { progress: 1, value: 0.8, easing: "linear" },
      ],
    });
    await writeFile(join(root, "generic.json"), JSON.stringify(generic));
    const genericPreview = await client.callTool({
      name: "parallax_create_preview",
      arguments: { recordPath: "generic.json", outputPath: "generic.html" },
    });
    assert.ok(!genericPreview.isError);
    const genericPage = await browser.newPage();
    await genericPage.goto(
      pathToFileURL(genericPreview.structuredContent.path).href,
    );
    await genericPage.waitForFunction(
      () =>
        document.querySelector(".pep-mount").dataset.motionState === "animated",
    );
    await genericPage.evaluate(() => {
      window.genericActor = document.querySelector('[data-actor-id="subject"]');
    });
    const transforms = [];
    for (const p of [0, 0.5, 1, 0.5]) {
      await genericPage.locator("#seek-journey").evaluate((e, p) => {
        e.value = String(p);
        e.dispatchEvent(new Event("input"));
      }, p);
      assert.ok(
        await genericPage.evaluate(
          () =>
            window.genericActor ===
            document.querySelector('[data-actor-id="subject"]'),
        ),
      );
      transforms.push(
        await genericPage
          .locator('[data-actor-id="subject"]')
          .evaluate((e) => e.style.transform),
      );
    }
    assert.notEqual(transforms[0], transforms[2]);
    assert.equal(transforms[1], transforms[3]);
    await genericPage.screenshot({ path: join(capture, "story-2d.png") });
    await genericPage.close();
    const page = await browser.newPage({
        viewport: { width: 1280, height: 800 },
      }),
      errors = [],
      requests = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => {
      if (/^https?:/.test(r.url())) requests.push(r.url());
    });
    await page.goto(pathToFileURL(file).href);
    await page.waitForFunction(
      () =>
        document.querySelector(".pep-mount")?.dataset.motionState ===
        "animated",
    );
    await page.evaluate(() => {
      window.poses = [];
      document
        .querySelector(".pep-mount")
        .addEventListener("pep-motion-pose", (e) =>
          window.poses.push(e.detail),
        );
    });
    const identity = await page
      .locator('[data-actor-id="subject"]')
      .getAttribute("data-object-id");
    await page.locator(".pep-story").scrollIntoViewIfNeeded();
    const samples = [];
    for (const progress of [0, 0.15, 0.5, 0.85, 1, 0.5]) {
      await page.locator("#seek-journey").evaluate((e, p) => {
        e.value = String(p);
        e.dispatchEvent(new Event("input"));
      }, progress);
      const sample = await page.evaluate(() => window.poses.at(-1));
      assert.equal(sample.pose.actors.subject.rotationY, progress * 360);
      assert.equal(sample.pose.lights.key.intensity, 80 - 60 * progress);
      assert.equal(sample.pose.lights.key.targetX, progress);
      assert.equal(
        await page
          .locator('[data-actor-id="subject"]')
          .getAttribute("data-object-id"),
        identity,
      );
      assert.equal(sample.bounds.subject.materialOpacity, 0.5);
      assert.equal(sample.bounds.subject.clipped, false);
      assert.equal(sample.bounds.subject.readingConflict, false);
      if (progress === 0.15)
        await page.screenshot({ path: join(capture, "story-3d-turn.png") });
      samples.push(sample);
    }
    assert.deepEqual(samples[2], samples[5]);
    await page.screenshot({ path: join(capture, "story-3d-desktop.png") });
    // Two independent mounts preserve host typography and native scrolling, and disposal removes only owned nodes.
    const isolation = await page.evaluate(async (story) => {
      const before = {
        font: getComputedStyle(document.body).fontFamily,
        overflow: getComputedStyle(document.body).overflow,
        children: document.body.children.length,
      };
      const host = document.createElement("div");
      host.style.cssText = "width:300px;height:200px";
      const kept = document.createElement("button");
      kept.textContent = "Host action";
      host.append(kept);
      document.body.append(host);
      const handles = [
        ParallaxMotion.mountMotionStage(host, story, "journey", []),
        ParallaxMotion.mountMotionStage(host, story, "journey", []),
      ];
      await Promise.all(handles.map((h) => h.ready));
      handles[0].seek(0.4);
      handles[1].seek(0.8);
      const count = host.querySelectorAll("canvas").length;
      handles[0].dispose();
      const afterOne = host.querySelectorAll("canvas").length;
      handles[1].dispose();
      const preserved = host.contains(kept) && host.children.length === 1;
      host.remove();
      return {
        before,
        after: {
          font: getComputedStyle(document.body).fontFamily,
          overflow: getComputedStyle(document.body).overflow,
          children: document.body.children.length,
        },
        count,
        afterOne,
        preserved,
      };
    }, story);
    assert.deepEqual(isolation.before, isolation.after);
    assert.equal(isolation.count, 2);
    assert.equal(isolation.afterOne, 1);
    assert.ok(isolation.preserved);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: join(capture, "story-3d-mobile.png") });
    assert.ok(await page.locator("#action").count());
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator(".pep-motion-fallback").waitFor({ state: "visible" });
    assert.ok(await page.locator(".pep-motion-fallback").isVisible());
    await page.close();
    const staticPage = await browser.newPage({ javaScriptEnabled: false });
    await staticPage.goto(pathToFileURL(file).href);
    assert.ok(await staticPage.locator("noscript .pep-static").isVisible());
    assert.equal(await staticPage.locator("noscript article").count(), 3);
    await staticPage.close();
    const noWebgl = await browser.newPage();
    await noWebgl.addInitScript(() => {
      HTMLCanvasElement.prototype.getContext = function () {
        return null;
      };
    });
    await noWebgl.goto(pathToFileURL(file).href);
    await noWebgl.waitForFunction(
      () =>
        document.querySelector(".pep-mount")?.dataset.motionState === "failed",
    );
    assert.ok(await noWebgl.locator(".pep-motion-fallback").isVisible());
    await noWebgl.close();
    assert.deepEqual(errors, []);
    assert.deepEqual(requests, []);
    return {
      source: "parallax_create_preview through real stdio MCP",
      samples,
      stableActorId: identity,
      isolation,
      errors,
      requests,
    };
  } finally {
    await client.close();
    await rm(root, { recursive: true, force: true });
  }
}
