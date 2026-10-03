import { z } from "zod";
const text = z.string().trim().min(1).max(8000);
const id = z.string().regex(/^[a-z][a-z0-9-]{0,63}$/);
const list = z.array(text).max(50);
const digest = z.string().regex(/^[a-f0-9]{64}$/);
export const effects = [
  "layered-depth",
  "background-drift",
  "pointer-depth",
  "sticky-reveal",
  "video-scrub",
  "three-dimensional",
] as const;
const effect = z.enum(effects);
const section = z.strictObject({
  id,
  title: text,
  copy: text,
  action: z
    .strictObject({
      label: text,
      target: z.string().regex(/^#[a-z][a-z0-9-]{0,63}$/),
    })
    .optional(),
});
export const motionPlanSchema = z.strictObject({
  sections: z.array(section).min(1).max(30),
  scenes: z
    .array(
      z.strictObject({
        sectionId: id,
        effect,
        layers: z
          .array(
            z.strictObject({
              id,
              label: text,
              depth: z.enum(["background", "midground", "foreground"]),
              direction: z.enum(["vertical", "horizontal"]),
              travel: z.number().min(-1).max(1),
            }),
          )
          .min(1)
          .max(8),
      }),
    )
    .min(1)
    .max(30),
  mobileBehavior: text,
  reducedMotionBehavior: text,
});
const concept = z.strictObject({
  id,
  title: text,
  story: text,
  sections: z.array(id).min(1).max(30),
  effects: z.array(effect).min(1).max(10),
  assetNeeds: list,
  mobile: text,
  reducedMotion: text,
  effort: z.enum(["low", "medium", "high"]),
});
export const approvalSchema = z.strictObject({
  revision: digest,
  previewDigest: digest,
  scope: z.tuple([z.literal("layout"), z.literal("motion")]),
  decision: z.literal("approved"),
  source: z.literal("human-message"),
  evidence: text,
  approvedAt: z.iso.datetime(),
});
const check = z.strictObject({
  name: text,
  outcome: z.enum(["passed", "failed", "not-run"]),
  critical: z.boolean(),
  evidence: text,
  environment: text,
});
export const projectSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    brief: z.strictObject({
      goal: text,
      audience: text,
      primaryAction: text,
      startingPoint: text,
      assumptions: list,
    }),
    concepts: z.array(concept).length(3),
    selectedConceptId: id,
    motionPlan: motionPlanSchema,
    preview: z
      .strictObject({ revision: digest, file: text, fileDigest: digest })
      .optional(),
    approval: approvalSchema.optional(),
    assetPlan: z.strictObject({
      provider: text,
      mode: z.enum(["import", "manual", "connected"]),
      items: z
        .array(
          z.strictObject({
            id,
            purpose: text,
            status: z.enum(["placeholder", "planned", "reviewed"]),
            provenance: text,
            path: text.optional(),
          }),
        )
        .max(50),
    }),
    qualityReport: z
      .strictObject({ checks: z.array(check).max(100) })
      .optional(),
  })
  .superRefine((p, ctx) => {
    const add = (message: string) => ctx.addIssue({ code: "custom", message });
    if (new Set(p.concepts.map((c) => c.id)).size !== 3)
      add("Concept ids must be unique");
    const selected = p.concepts.find((c) => c.id === p.selectedConceptId);
    if (!selected) add("Select an existing concept");
    const ids = p.motionPlan.sections.map((s) => s.id);
    if (new Set(ids).size !== ids.length) add("Section ids must be unique");
    if (selected && JSON.stringify(selected.sections) !== JSON.stringify(ids))
      add("Selected concept sections must match the motion plan");
    if (
      new Set(p.motionPlan.scenes.map((s) => s.sectionId)).size !==
      p.motionPlan.scenes.length
    )
      add("Only one scene per section");
    for (const s of p.motionPlan.scenes) {
      if (!ids.includes(s.sectionId)) add("Scene section does not exist");
      if (new Set(s.layers.map((l) => l.id)).size !== s.layers.length)
        add("Layer ids must be unique within each scene");
    }
    for (const s of p.motionPlan.sections) {
      if (s.action && !ids.includes(s.action.target.slice(1)))
        add("Action target does not exist");
    }
  });
export type ProjectRecord = z.infer<typeof projectSchema>;
export type MotionPlan = z.infer<typeof motionPlanSchema>;
export type ApprovalRecord = z.infer<typeof approvalSchema>;
export type ValidationReport = {
  valid: boolean;
  issues: string[];
  revision: string;
  approvalStatus: "missing" | "stale" | "recorded";
};
