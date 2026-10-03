import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { createPreview } from "../src/preview.ts";
const fixture = JSON.parse(
  await readFile(new URL("./fixtures/project.json", import.meta.url), "utf8"),
);
test("escapeUserMarkup, renderMotionMap, noNetworkAssets, previewDigestMatchesBytes", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "preview "));
  t.after(() => rm(root, { recursive: true, force: true }));
  const p = structuredClone(fixture);
  p.motionPlan.sections[0].copy =
    "</script><script>globalThis.pwned=true</script><img src=x onerror=alert(1)>";
  await writeFile(join(root, "project.json"), JSON.stringify(p));
  const result = await createPreview(root, "project.json", "preview.html");
  const html = await readFile(result.path, "utf8");
  assert.ok(!html.includes("<script>globalThis.pwned"));
  assert.ok(html.includes("&lt;/script&gt;"));
  assert.match(html, /Background plane/);
  assert.match(html, /Reduced motion/);
  assert.match(html, /select id="effect"/);
  assert.match(html, /option value="background-drift"/);
  assert.match(html, /option value="sticky-reveal"/);
  assert.match(html, /class="scene-stage"/);
  assert.match(html, /class="narrative-beats review-only"/);
  assert.ok(!/<(?:script|link|img)[^>]*(?:src|href)=["']https?:/i.test(html));
  assert.equal(result.digest, createHash("sha256").update(html).digest("hex"));
});

test("scene narrative survives static preview and changes design revision", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "beats "));
  t.after(() => rm(root, { recursive: true, force: true }));
  const p = structuredClone(fixture);
  await writeFile(join(root, "project.json"), JSON.stringify(p));
  const first = await createPreview(root, "project.json", "first.html");
  p.motionPlan.scenes[0].beats = {
    start: "Establish the object",
    middle: "Separate its components",
    end: "Reassemble for action",
  };
  await writeFile(join(root, "project.json"), JSON.stringify(p));
  const next = await createPreview(root, "project.json", "next.html");
  assert.notEqual(first.revision, next.revision);
  const html = await readFile(next.path, "utf8");
  for (const beat of Object.values(p.motionPlan.scenes[0].beats))
    assert.ok(html.includes(beat as string));
  p.motionPlan.scenes[0].beats.extra = "refuse unknown fields";
  await writeFile(join(root, "project.json"), JSON.stringify(p));
  await assert.rejects(createPreview(root, "project.json", "bad.html"));
});
test("showAdvancedStoryboard", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "advanced "));
  t.after(() => rm(root, { recursive: true, force: true }));
  const p = structuredClone(fixture);
  p.motionPlan.scenes[0].effect = "video-scrub";
  await writeFile(join(root, "project.json"), JSON.stringify(p));
  const result = await createPreview(root, "project.json", "advanced.html");
  assert.match(await readFile(result.path, "utf8"), /Storyboard placeholder/);
});

test("section IDs cannot collide with preview controls", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "collision "));
  t.after(() => rm(root, { recursive: true, force: true }));
  const p = structuredClone(fixture);
  const old = p.motionPlan.sections[0].id;
  p.motionPlan.sections[0].id = "provider-note";
  p.concepts.find((c: any) => c.id === p.selectedConceptId).sections[0] =
    "provider-note";
  p.motionPlan.scenes[0].sectionId = "provider-note";
  for (const section of p.motionPlan.sections)
    if (section.action?.target === "#" + old)
      section.action.target = "#provider-note";
  await writeFile(join(root, "project.json"), JSON.stringify(p));
  const result = await createPreview(root, "project.json", "preview.html");
  const html = await readFile(result.path, "utf8");
  assert.equal((html.match(/id="provider-note"/g) ?? []).length, 1);
  assert.match(html, /section id="scene-provider-note"/);
  assert.match(html, /href="#scene-provider-note"/);
});

test("authored visual recipe is strict, escaped and revision-bound; site view hides review notes", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "visual "));
  t.after(() => rm(root, { recursive: true, force: true }));
  const p = structuredClone(fixture);
  await writeFile(join(root, "project.json"), JSON.stringify(p));
  const original = await createPreview(root, "project.json", "original.html");
  p.motionPlan.visual = {
    brand: '<img src=x onerror="bad()">',
    tagline: "A quieter coast",
    typography: "humanist",
    palette: {
      background: "#f3eee4",
      ink: "#263d37",
      accent: "#a85b39",
      sky: "#c4d3c9",
      surface: "#fff7e7",
    },
  };
  p.motionPlan.scenes[0].art = "coastal";
  p.motionPlan.scenes[0].coastalScene = "villa";
  p.motionPlan.scenes[0].composition = "cover";
  await writeFile(join(root, "project.json"), JSON.stringify(p));
  const visual = await createPreview(root, "project.json", "visual.html");
  assert.notEqual(original.revision, visual.revision);
  const html = await readFile(visual.path, "utf8");
  assert.match(html, /data-mode="site"/);
  assert.match(html, /id="review-toggle"[^>]+aria-expanded="false"/);
  assert.match(html, /body\[data-mode="site"\] .review-only/);
  assert.match(html, /data-art="coastal"/);
  assert.match(html, /data-composition="cover"/);
  assert.match(html, /viewBox="0 0 800 600"/);
  assert.ok(!html.includes("<img src=x"));
  assert.ok(html.includes("&lt;img"));
  p.motionPlan.visual.palette.ink = "red; background:url(https://bad)";
  await writeFile(join(root, "project.json"), JSON.stringify(p));
  await assert.rejects(createPreview(root, "project.json", "invalid.html"));
  p.motionPlan.visual.palette.ink = "#263d37";
  p.motionPlan.scenes[0].art = '<svg onload="bad()">';
  await writeFile(join(root, "project.json"), JSON.stringify(p));
  await assert.rejects(createPreview(root, "project.json", "invalid-art.html"));
});
