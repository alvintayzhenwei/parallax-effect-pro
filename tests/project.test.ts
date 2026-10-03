import { execFileSync, spawnSync } from "node:child_process";
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, symlink, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { projectSchema } from "../src/records.ts";
import {
  readProject,
  writeContained,
  designRevision,
  validateProject,
  exportHandoff,
} from "../src/project.ts";
const fixture = JSON.parse(
  await readFile(new URL("./fixtures/project.json", import.meta.url), "utf8"),
);
async function project(t: any) {
  const root = await mkdtemp(join(tmpdir(), "parallax test "));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, "project.json"), JSON.stringify(fixture));
  return root;
}
test("validProject and threeConceptsRequired", () => {
  assert.equal(projectSchema.parse(fixture).selectedConceptId, "editorial");
  assert.equal(
    projectSchema.safeParse({
      ...fixture,
      concepts: fixture.concepts.slice(0, 2),
    }).success,
    false,
  );
});
test("rejectTraversal and preserveExistingFile", async (t) => {
  const root = await project(t);
  await assert.rejects(writeContained(root, "../escape", "bad"));
  await assert.rejects(writeContained(root, "project.json", "bad"));
  assert.equal(
    (await readProject(root, "project.json")).brief.goal,
    fixture.brief.goal,
  );
});
test("rejectSymlink", async (t) => {
  const root = await project(t);
  await symlink(tmpdir(), join(root, "outside"));
  await assert.rejects(writeContained(root, "outside/escape", "bad"));
  await symlink(join(root, "project.json"), join(root, "alias.json"));
  await assert.rejects(readProject(root, "alias.json"));
});
test("rejectOversizeRecord", async (t) => {
  const root = await project(t);
  await writeFile(join(root, "large.json"), " ".repeat(1024 * 1024 + 1));
  await assert.rejects(readProject(root, "large.json"));
});
test("staleMotionApproval and editedPreviewInvalidatesApproval", async (t) => {
  const root = await project(t);
  const p = structuredClone(fixture);
  const bytes = "<html>approved fixture</html>";
  await writeFile(join(root, "preview.html"), bytes);
  const digest = createHash("sha256").update(bytes).digest("hex");
  const rev = designRevision(p);
  p.preview = { revision: rev, file: "preview.html", fileDigest: digest };
  p.approval = {
    revision: rev,
    previewDigest: digest,
    scope: ["layout", "motion"],
    decision: "approved",
    source: "human-message",
    evidence: "Synthetic test fixture approval, not a human decision",
    approvedAt: "2026-10-03T15:00:00Z",
  };
  await writeFile(join(root, "project.json"), JSON.stringify(p));
  assert.equal(
    (await validateProject(root, "project.json")).approvalStatus,
    "recorded",
  );
  await exportHandoff(root, "project.json", "handoff.md");
  assert.match(await readFile(join(root, "handoff.md"), "utf8"), /Quiet depth/);
  p.motionPlan.scenes[0].layers[0].travel = 0.5;
  await writeFile(join(root, "project.json"), JSON.stringify(p));
  assert.equal(
    (await validateProject(root, "project.json")).approvalStatus,
    "stale",
  );
  await assert.rejects(exportHandoff(root, "project.json", "stale.md"));
  p.motionPlan = structuredClone(fixture.motionPlan);
  await writeFile(join(root, "project.json"), JSON.stringify(p));
  await writeFile(join(root, "preview.html"), "changed");
  assert.equal(
    (await validateProject(root, "project.json")).approvalStatus,
    "stale",
  );
});
test("missing approval blocks handoff", async (t) => {
  const root = await project(t);
  await assert.rejects(exportHandoff(root, "project.json", "handoff.md"));
});

test("reject FIFO without blocking", async (t) => {
  const root = await project(t);
  execFileSync("mkfifo", [join(root, "pipe")]);
  const moduleUrl = new URL("../src/project.ts", import.meta.url).href;
  const result = spawnSync(
    process.execPath,
    [
      "--experimental-strip-types",
      "--input-type=module",
      "-e",
      `import { readContained } from ${JSON.stringify(moduleUrl)}; try { await readContained(${JSON.stringify(root)}, "pipe"); process.exit(1); } catch { process.exit(0); }`,
    ],
    { timeout: 2000 },
  );
  assert.equal(result.status, 0, "nonregular reads must reject promptly");
});
