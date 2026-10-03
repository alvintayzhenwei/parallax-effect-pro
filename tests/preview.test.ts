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
  assert.ok(!/<(?:script|link|img)[^>]*(?:src|href)=["']https?:/i.test(html));
  assert.equal(result.digest, createHash("sha256").update(html).digest("hex"));
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
