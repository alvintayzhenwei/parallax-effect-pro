import { z } from "zod";
const text = z.string().trim().min(1).max(8000);
const id = z.string().regex(/^[a-z][a-z0-9-]{0,63}$/);
const digest = z.string().regex(/^[a-f0-9]{64}$/);
const number = z.number().finite().min(-100000).max(100000);
const progress = z.number().finite().min(0).max(1);
const path = text.refine(
  (p) =>
    !p.startsWith("/") &&
    !p.includes("\\") &&
    !p.includes("\0") &&
    !p.split("/").includes(".."),
  "Use a contained relative path",
);
export const actorChannels = [
  "x",
  "y",
  "z",
  "scaleX",
  "scaleY",
  "scaleZ",
  "rotationX",
  "rotationY",
  "rotationZ",
  "opacity",
] as const;
export const cameraChannels = [
  "x",
  "y",
  "z",
  "targetX",
  "targetY",
  "targetZ",
  "fov",
] as const;
export const lightChannels = [
  "x",
  "y",
  "z",
  "targetX",
  "targetY",
  "targetZ",
  "intensity",
] as const;
const channels = [
  ...new Set([...actorChannels, ...cameraChannels, ...lightChannels]),
] as [string, ...string[]];
export type Channel =
  | (typeof actorChannels)[number]
  | (typeof cameraChannels)[number]
  | (typeof lightChannels)[number];
export type NumericPose = Partial<Record<Channel, number>>;
const pose = z.strictObject(
  Object.fromEntries(channels.map((c) => [c, number.optional()])),
) as z.ZodType<NumericPose>;
const rectangle = z
  .strictObject({
    x: progress,
    y: progress,
    width: progress.refine((n) => n > 0),
    height: progress.refine((n) => n > 0),
  })
  .refine(
    (r) => r.x + r.width <= 1 && r.y + r.height <= 1,
    "Rectangle must fit within stage",
  );
const reference = z.strictObject({ path, digest });
const target = z.strictObject({
  kind: z.enum(["actor", "camera", "light"]),
  id,
});
const preview = z.strictObject({
  revision: digest,
  file: path,
  fileDigest: digest,
});
export const storySchema = z
  .strictObject({
    schemaVersion: z.literal(2),
    brief: z.strictObject({
      goal: text,
      audience: text,
      primaryAction: text,
      startingPoint: text,
      assumptions: z.array(text).max(50),
    }),
    concepts: z
      .array(
        z.strictObject({
          id,
          title: text,
          story: text,
          sections: z.array(id).min(1).max(32),
          effects: z.array(text).min(1).max(10),
          assetNeeds: z.array(text).max(50),
          mobile: text,
          reducedMotion: text,
          effort: z.enum(["low", "medium", "high"]),
        }),
      )
      .length(3),
    selectedConceptId: id,
    designContext: z.strictObject({
      owner: text,
      references: z.array(reference).max(64),
      tokens: z.record(id, text),
      boundaries: z.array(text).max(50),
    }),
    assets: z
      .array(
        z.discriminatedUnion("type", [
          z.strictObject({
            id,
            type: z.literal("raster"),
            mime: z.enum(["image/png", "image/jpeg", "image/webp"]),
            path,
            digest,
          }),
          z.strictObject({ id, type: z.literal("glb"), path, digest }),
        ]),
      )
      .max(64),
    chapters: z
      .array(
        z.strictObject({
          id,
          title: text,
          copy: text,
          action: z.strictObject({ label: text, target: id }).optional(),
        }),
      )
      .min(1)
      .max(32),
    stages: z
      .array(
        z.strictObject({
          id,
          renderer: z.enum(["2d", "3d"]),
          chapterIds: z.array(id).min(1).max(32),
          scrollVh: z.number().finite().min(100).max(10000),
          allocation: z.strictObject({
            desktop: z.strictObject({
              width: progress.refine((n) => n > 0),
              height: progress.refine((n) => n > 0),
            }),
            mobile: z.strictObject({
              width: progress.refine((n) => n > 0),
              height: progress.refine((n) => n > 0),
            }),
          }),
          readingZones: z.array(rectangle).max(16),
          camera: z.strictObject({ id, initial: pose }),
          lights: z
            .array(
              z.strictObject({
                id,
                kind: z.enum(["ambient", "directional", "spot"]),
                color: z.string().regex(/^#[a-fA-F0-9]{6}$/),
                initial: pose,
              }),
            )
            .max(16),
        }),
      )
      .min(1)
      .max(8),
    actors: z
      .array(
        z.strictObject({
          id,
          stageId: id,
          parentId: id.optional(),
          role: text,
          initial: pose,
          visual: z.discriminatedUnion("kind", [
            z.strictObject({ kind: z.literal("group") }),
            z.strictObject({
              kind: z.literal("primitive"),
              shape: z.enum(["box", "cylinder", "plane"]),
              dimensions: z.tuple([
                number.refine((n) => n > 0),
                number.refine((n) => n > 0),
                number.refine((n) => n > 0),
              ]),
              color: z.string().regex(/^#[a-fA-F0-9]{6}$/),
              metalness: progress,
              roughness: progress,
            }),
            z.strictObject({
              kind: z.literal("asset"),
              assetId: id,
              partName: text.optional(),
            }),
          ]),
        }),
      )
      .min(1)
      .max(128),
    beats: z
      .array(
        z.strictObject({
          id,
          stageId: id,
          start: progress,
          end: progress,
          chapterId: id,
          focusIds: z.array(id).max(128),
          purpose: text,
        }),
      )
      .min(1)
      .max(128),
    tracks: z
      .array(
        z.strictObject({
          id,
          stageId: id,
          target,
          property: z.enum(channels),
          keyframes: z
            .array(
              z.strictObject({
                progress,
                value: number,
                easing: z.enum(["linear", "smoothstep"]),
              }),
            )
            .min(2)
            .max(64),
        }),
      )
      .max(512),
    fallbackViews: z
      .array(
        z.strictObject({
          stageId: id,
          progress,
          label: text,
          description: text,
          assetId: id.optional(),
        }),
      )
      .min(1)
      .max(128),
    preview: preview.optional(),
    integrationPreview: z
      .strictObject({
        file: path,
        fileDigest: digest,
        stageDigest: digest,
        contextDigest: digest,
      })
      .optional(),
    approval: z
      .strictObject({
        revision: digest,
        previewDigest: digest,
        scope: z.enum(["motion", "integration"]),
        decision: z.literal("approved"),
        source: z.literal("human-message"),
        evidence: text,
        approvedAt: z.iso.datetime(),
        integrationDigest: digest.optional(),
      })
      .optional(),
  })
  .superRefine((p, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: "custom", message });
    for (const entries of [
      p.concepts,
      p.assets,
      p.chapters,
      p.stages,
      p.actors,
      p.beats,
      p.tracks,
    ])
      if (new Set(entries.map((e) => e.id)).size !== entries.length)
        fail("IDs must be unique within each collection");
    const selected = p.concepts.find((c) => c.id === p.selectedConceptId);
    if (
      !selected ||
      JSON.stringify(selected.sections) !==
        JSON.stringify(p.chapters.map((c) => c.id))
    )
      fail("Selected concept must match ordered chapters");
    const chapterIds = p.chapters.map((c) => c.id),
      claimed: string[] = [];
    for (const stage of p.stages) {
      const indices = stage.chapterIds.map((c) => chapterIds.indexOf(c));
      if (indices.some((n, i) => n < 0 || (i > 0 && n !== indices[i - 1]! + 1)))
        fail("Stage chapters must exist and be contiguous");
      claimed.push(...stage.chapterIds);
      if (new Set(stage.lights.map((l) => l.id)).size !== stage.lights.length)
        fail("Light IDs must be unique within stage");
      validatePose(stage.camera.initial, "camera");
      stage.lights.forEach((l) => validatePose(l.initial, "light"));
      if (!p.fallbackViews.some((v) => v.stageId === stage.id))
        fail("Every stage requires a fallback view");
    }
    if (
      claimed.length !== chapterIds.length ||
      new Set(claimed).size !== claimed.length
    )
      fail("Every chapter must belong to exactly one stage");
    const actorMap = new Map(p.actors.map((a) => [a.id, a]));
    for (const actor of p.actors) {
      if (!p.stages.some((s) => s.id === actor.stageId))
        fail("Actor stage does not exist");
      validatePose(actor.initial, "actor");
      const visual = actor.visual;
      if (
        visual.kind === "asset" &&
        !p.assets.some((a) => a.id === visual.assetId)
      )
        fail("Actor asset does not exist");
      const seen = new Set<string>([actor.id]);
      let parentId = actor.parentId;
      while (parentId) {
        const parent = actorMap.get(parentId);
        if (!parent || parent.stageId !== actor.stageId) {
          fail("Parent must exist in same stage");
          break;
        }
        if (seen.has(parentId)) {
          fail("Actor hierarchy must be acyclic");
          break;
        }
        seen.add(parentId);
        parentId = parent.parentId;
      }
    }
    for (const beat of p.beats) {
      const stage = p.stages.find((s) => s.id === beat.stageId);
      if (
        !stage ||
        !stage.chapterIds.includes(beat.chapterId) ||
        beat.end <= beat.start ||
        beat.focusIds.some((a) => actorMap.get(a)?.stageId !== beat.stageId)
      )
        fail("Invalid beat references or interval");
    }
    for (const view of p.fallbackViews)
      if (
        !p.stages.some((s) => s.id === view.stageId) ||
        (view.assetId && !p.assets.some((a) => a.id === view.assetId))
      )
        fail("Invalid fallback references");
    for (const chapter of p.chapters)
      if (chapter.action && !chapterIds.includes(chapter.action.target))
        fail("Action target does not exist");
    for (const track of p.tracks) {
      const stage = p.stages.find((s) => s.id === track.stageId);
      const exists =
        track.target.kind === "actor"
          ? actorMap.get(track.target.id)?.stageId === track.stageId
          : track.target.kind === "camera"
            ? stage?.camera.id === track.target.id
            : stage?.lights.some((l) => l.id === track.target.id);
      if (!exists) fail("Track target must exist in stage");
      if (!allowed(track.target.kind).includes(track.property))
        fail("Property is invalid for target type");
      track.keyframes.forEach((k, i) => {
        validateValue(track.property, k.value);
        if (i > 0 && k.progress <= track.keyframes[i - 1]!.progress)
          fail("Keyframes must be strictly ordered");
      });
    }
    function allowed(kind: string): readonly string[] {
      return kind === "actor"
        ? actorChannels
        : kind === "camera"
          ? cameraChannels
          : lightChannels;
    }
    function validateValue(property: string, value: number) {
      if (property.startsWith("scale") && value <= 0)
        fail("Scale must be positive");
      if (property === "opacity" && (value < 0 || value > 1))
        fail("Opacity must be between zero and one");
      if (property === "fov" && (value <= 0 || value >= 180))
        fail("Field of view must be between zero and 180");
      if (property === "intensity" && value < 0)
        fail("Intensity cannot be negative");
    }
    function validatePose(value: NumericPose, kind: string) {
      for (const [property, n] of Object.entries(value)) {
        if (!allowed(kind).includes(property))
          fail("Initial property is invalid for target type");
        validateValue(property, n);
      }
    }
  });
export type StoryRecord = z.infer<typeof storySchema>;
export type StagePose = {
  actors: Record<string, NumericPose>;
  camera: NumericPose;
  lights: Record<string, NumericPose>;
};
export type RuntimeAsset = {
  id: string;
  type: "raster" | "glb";
  data: string;
  digest: string;
};
export type PreviewResult = {
  path: string;
  revision: string;
  digest: string;
  artifacts?: Array<{
    path: string;
    digest: string;
    role: "stage" | "runtime" | "data";
  }>;
};
