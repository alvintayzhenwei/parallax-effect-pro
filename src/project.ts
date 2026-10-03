import { lstat, realpath, mkdir, open, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import {
  isAbsolute,
  resolve,
  relative,
  sep,
  dirname,
  basename,
  extname,
} from "node:path";
import { createHash } from "node:crypto";
import {
  projectSchema,
  type ProjectRecord,
  type ValidationReport,
} from "./records.ts";
import { loadStoryAssets, verifiedStoryRevision } from "./story-assets.ts";
export const sha256 = (data: string | Buffer) =>
  createHash("sha256").update(data).digest("hex");
function canonical(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  if (value !== null && typeof value === "object")
    return (
      "{" +
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b, "en"))
        .map(([k, v]) => JSON.stringify(k) + ":" + canonical(v))
        .join(",") +
      "}"
    );
  return JSON.stringify(value);
}
export function designContextDigest(
  p: Extract<ProjectRecord, { schemaVersion: 2 }>,
): string {
  return sha256(canonical(p.designContext));
}
export function designRevision(p: ProjectRecord): string {
  if (p.schemaVersion === 2) {
    const { preview, integrationPreview, approval, ...authored } = p;
    return sha256(canonical(authored));
  }
  return sha256(
    canonical({
      concept: p.concepts.find((c) => c.id === p.selectedConceptId),
      motionPlan: p.motionPlan,
    }),
  );
}
async function contained(
  root: string,
  path: string,
  createParents = false,
): Promise<string> {
  if (!isAbsolute(root)) throw new Error("Project root must be absolute");
  const stat = await lstat(root);
  if (stat.isSymbolicLink() || !stat.isDirectory())
    throw new Error(
      "Project root must be an existing directory, not a symlink",
    );
  const base = await realpath(root);
  if (
    !path ||
    isAbsolute(path) ||
    path.includes("\0") ||
    path.split(/[\\/]/).some((p) => p === "..") ||
    path.includes("\\")
  )
    throw new Error("Use a contained relative path without traversal");
  const target = resolve(base, path),
    rel = relative(base, target);
  if (!rel || rel === ".." || rel.startsWith(".." + sep))
    throw new Error("Path escapes project root");
  const parts = rel.split(sep);
  let current = base;
  for (let i = 0; i < parts.length; i++) {
    current = resolve(current, parts[i]!);
    let s;
    try {
      s = await lstat(current);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
      if (i < parts.length - 1 && createParents) {
        await mkdir(current);
        s = await lstat(current);
      } else if (i < parts.length - 1)
        throw new Error("Parent directory does not exist");
    }
    if (s?.isSymbolicLink())
      throw new Error("Symlinks are not allowed in project paths");
    if (i < parts.length - 1 && s && !s.isDirectory())
      throw new Error("Parent path must be a directory");
  }
  return target;
}
export async function readContained(
  root: string,
  path: string,
  maxBytes = 1024 * 1024,
): Promise<Buffer> {
  const target = await contained(root, path);
  const stat = await lstat(target);
  if (!stat.isFile() || stat.size > maxBytes)
    throw new Error("File must be regular and within size limit");
  const handle = await open(
    target,
    constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK,
  );
  try {
    const s = await handle.stat();
    if (!s.isFile() || s.size > maxBytes)
      throw new Error("File must be regular and within size limit");
    const b = await handle.readFile();
    if (b.length > maxBytes) throw new Error("File exceeds size limit");
    return b;
  } finally {
    await handle.close();
  }
}
export async function readProject(
  root: string,
  path: string,
): Promise<ProjectRecord> {
  try {
    return projectSchema.parse(
      JSON.parse((await readContained(root, path)).toString("utf8")),
    );
  } catch (e) {
    if (e instanceof SyntaxError)
      throw new Error("Project record is not valid JSON");
    if ((e as Error).name === "ZodError")
      throw new Error(
        "Project record does not match schema; check templates and required fields",
      );
    throw e;
  }
}
export async function writeContained(
  root: string,
  path: string,
  data: string,
): Promise<string> {
  const target = await contained(root, path, true);
  const handle = await open(
    target,
    constants.O_CREAT |
      constants.O_EXCL |
      constants.O_WRONLY |
      constants.O_NOFOLLOW,
    0o600,
  );
  try {
    await handle.writeFile(data, "utf8");
  } finally {
    await handle.close();
  }
  return target;
}
async function approvalStatus(
  root: string,
  p: ProjectRecord,
): Promise<ValidationReport["approvalStatus"]> {
  if (!p.approval) return "missing";
  if (p.schemaVersion === 2) {
    try {
      const revision = await verifiedStoryRevision(root, p);
      if (
        !p.preview ||
        p.preview.revision !== revision ||
        p.approval.revision !== revision ||
        p.approval.previewDigest !== p.preview.fileDigest ||
        sha256(await readContained(root, p.preview.file, 24 * 1024 * 1024)) !==
          p.preview.fileDigest
      )
        return "stale";
      if (p.approval.scope === "integration") {
        const composite = p.integrationPreview;
        if (
          !composite ||
          composite.stageDigest !== p.preview.fileDigest ||
          composite.contextDigest !== designContextDigest(p) ||
          p.approval.integrationDigest !== composite.fileDigest ||
          sha256(
            await readContained(root, composite.file, 24 * 1024 * 1024),
          ) !== composite.fileDigest
        )
          return "stale";
      }
      return "recorded";
    } catch {
      return "stale";
    }
  }
  const revision = designRevision(p);
  if (
    !p.preview ||
    p.approval.revision !== revision ||
    p.preview.revision !== revision ||
    p.approval.previewDigest !== p.preview.fileDigest
  )
    return "stale";
  try {
    return sha256(
      await readContained(root, p.preview.file, 5 * 1024 * 1024),
    ) === p.preview.fileDigest
      ? "recorded"
      : "stale";
  } catch {
    return "stale";
  }
}
export async function validateProject(
  root: string,
  path: string,
): Promise<ValidationReport> {
  const p = await readProject(root, path);
  const status = await approvalStatus(root, p);
  let revision = designRevision(p);
  if (p.schemaVersion === 2) {
    try {
      revision = await verifiedStoryRevision(root, p);
    } catch {
      return {
        valid: false,
        issues: ["Assets or reviewed design context are invalid or changed"],
        revision,
        approvalStatus: p.approval ? "stale" : "missing",
        motionWarnings: motionWarnings(p),
      };
    }
  }
  return {
    valid: true,
    issues:
      status === "stale"
        ? ["Approval does not match current design and preview"]
        : [],
    revision,
    approvalStatus: status,
    motionWarnings: motionWarnings(p),
  };
}
function motionWarnings(p: ProjectRecord): string[] {
  if (p.schemaVersion === 2)
    return ["Story runtime and visual acceptance require verification."];
  return p.motionPlan.scenes.flatMap((scene) => {
    if (["video-scrub", "three-dimensional"].includes(scene.effect))
      return [
        `${scene.sectionId}: advanced storyboard requires real media/rendering and runtime verification.`,
      ];
    const warnings: string[] = [];
    if (scene.layers.every((layer) => layer.travel === 0))
      warnings.push(
        `${scene.sectionId}: zero travel produces a static composition.`,
      );
    if (
      ["layered-depth", "pointer-depth", "sticky-reveal"].includes(
        scene.effect,
      ) &&
      (new Set(scene.layers.map((layer) => layer.depth)).size < 2 ||
        new Set(
          scene.layers.map((layer) => `${layer.direction}:${layer.travel}`),
        ).size < 2)
    )
      warnings.push(
        `${scene.sectionId}: use distinct depth planes and relative layer travel; fading or pinning alone does not demonstrate parallax.`,
      );
    if (
      scene.effect === "background-drift" &&
      !scene.layers.some(
        (layer) => layer.depth === "background" && layer.travel !== 0,
      )
    )
      warnings.push(
        `${scene.sectionId}: background drift needs a background plane with nonzero travel.`,
      );
    return warnings;
  });
}
export async function exportHandoff(
  root: string,
  path: string,
  output: string,
): Promise<{ path: string; revision: string }> {
  const p = await readProject(root, path);
  if ((await approvalStatus(root, p)) !== "recorded")
    throw new Error(
      "Matching human approval record and unchanged preview required; return to preview review",
    );
  if (p.schemaVersion === 2) return exportStoryHandoff(root, p, output);
  const c = p.concepts.find((c) => c.id === p.selectedConceptId)!;
  const checks = p.qualityReport?.checks ?? [];
  const blocked = checks.some((c) => c.critical && c.outcome === "failed");
  const md = [
    "# Approved design handoff",
    `Concept: ${c.title}`,
    `Revision: ${designRevision(p)}`,
    "Approval is recorded from human-message evidence; this file is not authenticated proof.",
    `Decision evidence: ${p.approval!.evidence}`,
    `Deployment: ${blocked ? "BLOCKED by critical failures" : "Requires executed quality checks and separate user approval"}`,
    "## Brief",
    p.brief.goal,
    `Audience: ${p.brief.audience}`,
    `Primary action: ${p.brief.primaryAction}`,
    "## Sections",
    ...p.motionPlan.sections.map(
      (s) =>
        `### ${s.title}\n${s.copy}\nAction: ${s.action?.label ?? "None"} ${s.action?.target ?? ""}`,
    ),
    "## Motion map",
    JSON.stringify(p.motionPlan.scenes, null, 2),
    `Mobile: ${p.motionPlan.mobileBehavior}`,
    `Reduced motion: ${p.motionPlan.reducedMotionBehavior}`,
    "## Motion review",
    motionWarnings(p).length
      ? motionWarnings(p).join("\n")
      : "No structural motion warnings. Visual quality remains unverified.",
    "Compare start, middle and end frames at desktop and mobile widths. Verify visible relative layer travel, useful sticky progression, readable copy/actions and complete static content. Passing schemas or runtime checks does not prove aesthetic quality; obtain the owner's visual verdict.",
    "## Asset plan",
    JSON.stringify(p.assetPlan, null, 2),
    "## Quality checks",
    checks.length
      ? JSON.stringify(checks, null, 2)
      : "Not run. No quality or deployment readiness claim.",
    "## Build instructions",
    "Preserve existing stack. Build the complete agreed website. Review draft copy and asset rights. Call separately connected Runway MCP only after paid-run approval. Do not publish without destination-specific approval.",
  ].join("\n\n");
  return {
    path: await writeContained(root, output, md),
    revision: designRevision(p),
  };
}

async function exportStoryHandoff(
  root: string,
  p: Extract<ProjectRecord, { schemaVersion: 2 }>,
  output: string,
): Promise<{ path: string; revision: string }> {
  const revision = await verifiedStoryRevision(root, p),
    assets = (await loadStoryAssets(root, p)).map((a) => ({
      id: a.id,
      type: a.type,
      data: a.bytes.toString("base64"),
      digest: a.digest,
    }));
  // Resolve against a contained relative output, never the process working directory.
  const relativeDirectory =
    dirname(output) === "."
      ? basename(output, extname(output)) + ".motion"
      : dirname(output) + "/" + basename(output, extname(output)) + ".motion";
  const target = await contained(root, relativeDirectory, true);
  await mkdir(target); // Exclusive directory creation; an existing export is never reused.
  const { preview, approval, integrationPreview, ...authored } = p;
  try {
    const runtime = await readFile(
      new URL("../assets/motion-runtime.js", import.meta.url),
      "utf8",
    );
    const storyData = JSON.stringify(authored, null, 2),
      assetData = JSON.stringify(assets);
    const files = [
      { name: "story.json", data: storyData },
      { name: "assets.json", data: assetData },
      { name: "runtime.js", data: runtime },
    ];
    for (const file of files)
      await writeContained(
        root,
        relativeDirectory + "/" + file.name,
        file.data,
      );
    const md = [
      "# Approved motion handoff",
      `Scope: ${approval!.scope}`,
      approval!.scope === "motion"
        ? "Full-site UI is not approved. Review the actual integrated shell separately."
        : "Integration approval binds the saved composite preview and reviewed context; it does not prove deployment readiness.",
      `Revision: ${revision}`,
      `Human-message evidence: ${approval!.evidence}`,
      "This record is not authenticated identity proof.",
      "## Ownership",
      `UI owner: ${p.designContext.owner}. Preserve host typography, palette, navigation, components and forms. Any UI/UX tool, including Impeccable or frontend-design, may collaborate.`,
      ...p.designContext.boundaries,
      "## Exported motion",
      `Directory: ${relativeDirectory}. Load runtime.js locally; it exposes ParallaxMotion.mountMotionStage. Load story.json and assets.json as data using your existing framework or build system. Include the runtime under your site's CSP. Do not use a CDN.`,
      "mountMotionStage(element, story, stageId, assets) returns { seek(progress), dispose(), ready }. The mount creates only owned descendants. Keep host content and semantic chapters outside the mount. Use native scroll measurements to call seek with clamped progress from 0 to 1, using the full stage span. Retain actor identity; do not remount at chapter boundaries. Dispose on route teardown. Do not import preview-owned CSS or reset host styles.",
      "## Responsive and reading constraints",
      JSON.stringify(
        p.stages.map((s) => ({
          id: s.id,
          allocation: s.allocation,
          readingZones: s.readingZones,
          scrollVh: s.scrollVh,
        })),
        null,
        2,
      ),
      "The pep-motion-pose event includes evaluated pose and projected bounds. Review clipping and readingConflict at transition poses after resizing. Bounds are conservative and do not guarantee aesthetic quality. Resolve observed conflicts and regenerate the composite review when the approved experience changes.",
      "## Static behavior",
      "Reduced motion and failed WebGL expose authored conceptual/poster fallbacks. Preserve every chapter and action as semantic host content, including without JavaScript. Preview diagrams are conceptual unless reviewed final assets exist.",
      "## Pending checks",
      "Verify desktop/mobile composition, keyboard, reverse seek, clipping, asset rights and host boundaries. Owner creative acceptance, real Claude-host acceptance and deployment remain separate gates.",
      "## Composite review",
      "Integration approval needs integrationPreview.file/fileDigest, stageDigest equal to the MCP preview digest and contextDigest from the current design context, plus approval.integrationDigest equal to the saved composite digest. The tool checks saved bytes without executing imported HTML. Motion-only approval never implies full-site approval.",
      "## Provider options",
      "Video generation is optional. A manual provider-ready prompt pack can be used without a video MCP. Review continuity and suitable poster fallbacks before importing outputs; paid generation requires separate approval.",
    ].join("\n\n");
    const path = await writeContained(root, output, md);
    await writeContained(
      root,
      relativeDirectory + "/manifest.json",
      JSON.stringify(
        {
          revision,
          scope: approval!.scope,
          files: files.map((f) => ({ name: f.name, digest: sha256(f.data) })),
          complete: true,
        },
        null,
        2,
      ),
    );
    return { path, revision };
  } catch {
    throw new Error(
      `Incomplete motion handoff; partial new files may remain in ${relativeDirectory}. Existing user files were not overwritten. Use a new output name after review.`,
    );
  }
}
