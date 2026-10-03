import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createPreview } from "../src/preview.ts";
import {
  validateProject,
  exportHandoff,
  sha256,
  designContextDigest,
} from "../src/project.ts";
import { storySchema } from "../src/story-records.ts";
const fixture = JSON.parse(
  await readFile(new URL("fixtures/story.json", import.meta.url), "utf8"),
);
async function approved(t: any) {
  const root = await mkdtemp(join(tmpdir(), "story-approval-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const p = structuredClone(fixture);
  await writeFile(join(root, "design.txt"), "Host design");
  p.designContext.references = [
    { path: "design.txt", digest: sha256("Host design") },
  ];
  await writeFile(join(root, "story.json"), JSON.stringify(p));
  const preview = await createPreview(root, "story.json", "preview.html");
  p.preview = {
    revision: preview.revision,
    file: "preview.html",
    fileDigest: preview.digest,
  };
  p.approval = {
    revision: preview.revision,
    previewDigest: preview.digest,
    scope: "motion",
    decision: "approved",
    source: "human-message",
    evidence: "Fictional unit test evidence; not customer approval",
    approvedAt: "2026-10-04T01:00:00Z",
  };
  await writeFile(join(root, "story.json"), JSON.stringify(p));
  return { root, p };
}
test("motion approval exports identical authored data and scoped runtime without approving site UI", async (t) => {
  const { root, p } = await approved(t);
  assert.equal(
    (await validateProject(root, "story.json")).approvalStatus,
    "recorded",
  );
  const result = await exportHandoff(
    root,
    "story.json",
    "handoffs/approved.md",
  );
  const md = await readFile(result.path, "utf8");
  assert.ok(md.includes("Scope: motion"));
  assert.ok(md.includes("Full-site UI is not approved"));
  assert.ok(md.includes("mountMotionStage"));
  const data = JSON.parse(
    await readFile(join(root, "handoffs/approved.motion/story.json"), "utf8"),
  );
  assert.deepEqual(data.tracks, p.tracks);
  assert.ok(
    (await readdir(join(root, "handoffs/approved.motion"))).includes(
      "runtime.js",
    ),
  );
  await assert.rejects(
    exportHandoff(root, "story.json", "handoffs/approved.md"),
  );
  assert.equal(await readFile(result.path, "utf8"), md);
});
test("integration approval binds composite, stage and context without executing HTML", async (t) => {
  const { root, p } = await approved(t);
  const composite =
    '<html><script>throw new Error("must not execute")</script></html>';
  await writeFile(join(root, "composite.html"), composite);
  p.integrationPreview = {
    file: "composite.html",
    fileDigest: sha256(composite),
    stageDigest: p.preview.fileDigest,
    contextDigest: designContextDigest(p),
  };
  p.approval.scope = "integration";
  p.approval.integrationDigest = sha256(composite);
  await writeFile(join(root, "story.json"), JSON.stringify(p));
  assert.equal(
    (await validateProject(root, "story.json")).approvalStatus,
    "recorded",
  );
  await writeFile(join(root, "composite.html"), "changed");
  assert.equal(
    (await validateProject(root, "story.json")).approvalStatus,
    "stale",
  );
});
test("context edits and stage edits invalidate approval; missing human evidence fails schema", async (t) => {
  const { root, p } = await approved(t);
  await writeFile(join(root, "design.txt"), "Changed host design");
  const changed = await validateProject(root, "story.json");
  assert.equal(changed.valid, false);
  assert.equal(changed.approvalStatus, "stale");
  await assert.rejects(exportHandoff(root, "story.json", "blocked.md"));
  p.approval.evidence = "";
  assert.equal(storySchema.safeParse(p).success, false);
});
test("partial export is reported and pre-existing user content is preserved", async (t) => {
  const { root } = await approved(t);
  await writeFile(join(root, "collision.md"), "User content");
  await assert.rejects(
    exportHandoff(root, "story.json", "collision.md"),
    /Incomplete motion handoff/,
  );
  assert.equal(
    await readFile(join(root, "collision.md"), "utf8"),
    "User content",
  );
  const files = await readdir(join(root, "collision.motion"));
  assert.ok(files.includes("runtime.js"));
});
