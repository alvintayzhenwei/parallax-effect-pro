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
