import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createPreview } from "../src/preview.ts";
const fixture = JSON.parse(
  await readFile(new URL("fixtures/story.json", import.meta.url), "utf8"),
);
test("continuous preview is local, clean, escaped and includes complete fallback chapters", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "story-preview-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const p = structuredClone(fixture);
  p.chapters[0].copy = '<script>alert("unsafe")</script>';
  await writeFile(join(root, "story.json"), JSON.stringify(p));
  const result = await createPreview(root, "story.json", "preview.html");
  const html = await readFile(result.path, "utf8");
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!html.includes('<script>alert("unsafe")'));
  assert.ok(
    html.includes('id="arrival"') &&
      html.includes('id="reveal"') &&
      html.includes('id="action"'),
  );
  assert.ok(html.includes('aria-label="Seek journey"'));
  assert.ok(html.includes('data-review="closed"'));
  assert.ok(html.includes("Conceptual diagram"));
  assert.ok(!/<script[^>]+src=/.test(html));
  assert.ok(!/<link[^>]+href=/.test(html));
  assert.ok(html.includes("default-src 'none'"));
  assert.ok(result.artifacts?.some((a) => a.role === "stage"));
  await assert.rejects(createPreview(root, "story.json", "preview.html"));
  assert.equal(await readFile(result.path, "utf8"), html);
});

test("chapter anchors cannot collide with controls and static actions remain reachable", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "story-anchors-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const p = structuredClone(fixture);
  p.chapters[0].id = "review";
  p.stages[0].chapterIds[0] = "review";
  p.concepts.find((c: any) => c.id === p.selectedConceptId).sections[0] =
    "review";
  for (const beat of p.beats)
    if (beat.chapterId === "arrival") beat.chapterId = "review";
  p.chapters[0].action = { label: "Explore", target: "action" };
  await writeFile(join(root, "story.json"), JSON.stringify(p));
  const result = await createPreview(root, "story.json", "preview.html");
  const html = await readFile(result.path, "utf8");
  assert.equal((html.match(/id="review"/g) ?? []).length, 1);
  const staticHtml = html.split("<noscript>")[1]!.split("</noscript>")[0]!;
  assert.ok(staticHtml.includes('id="pep-static-action"'));
  assert.ok(staticHtml.includes('href="#pep-static-action"'));
});
