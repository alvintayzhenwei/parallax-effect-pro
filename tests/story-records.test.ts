import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { projectSchema } from "../src/records.ts";
import { storySchema } from "../src/story-records.ts";
const fixture = JSON.parse(
  readFileSync(new URL("fixtures/story.json", import.meta.url), "utf8"),
);
const story = () => structuredClone(fixture);
test("version dispatch preserves legacy and accepts a persistent actor across three chapters", () => {
  assert.equal(
    projectSchema.parse(
      JSON.parse(
        readFileSync(
          "skills/parallax-effect-pro/templates/project.json",
          "utf8",
        ),
      ),
    ).schemaVersion,
    1,
  );
  assert.equal(projectSchema.parse(story()).schemaVersion, 2);
});
test("rejects ambiguous ownership, cycles, references, properties, values and paths", () => {
  const invalid: ((p: any) => void)[] = [
    (p) => p.actors.push(structuredClone(p.actors[0])),
    (p) => (p.actors[0].parentId = "subject"),
    (p) => (p.actors[0].parentId = "missing"),
    (p) => (p.tracks[0].target.id = "missing"),
    (p) => (p.tracks[0].property = "intensity"),
    (p) => (p.tracks[0].keyframes[1].value = Infinity),
    (p) => (p.actors[0].initial.scaleX = 0),
    (p) => (p.actors[0].initial.opacity = 2),
    (p) => (p.stages[0].chapterIds = ["arrival", "action"]),
    (p) => p.stages.push({ ...structuredClone(p.stages[0]), id: "another" }),
    (p) =>
      p.assets.push({
        id: "image",
        type: "raster",
        mime: "image/png",
        path: "../escape.png",
        digest: "a".repeat(64),
      }),
    (p) =>
      p.designContext.references.push({
        path: "/tmp/file",
        digest: "a".repeat(64),
      }),
    (p) => (p.fallbackViews = []),
    (p) => (p.beats[0].focusIds = ["missing"]),
  ];
  for (const mutate of invalid) {
    const p = story();
    mutate(p);
    assert.equal(projectSchema.safeParse(p).success, false);
  }
});
test("caps every collection and keyframes", () => {
  for (const [key, cap] of Object.entries({
    stages: 8,
    chapters: 32,
    actors: 128,
    beats: 128,
    assets: 64,
    tracks: 512,
  })) {
    const p = story();
    const item = p[key][0] ?? {
      id: "image",
      type: "raster",
      mime: "image/png",
      path: "image.png",
      digest: "a".repeat(64),
    };
    p[key] = Array.from({ length: cap + 1 }, (_, i) => ({
      ...structuredClone(item),
      id: `item-${i}`,
    }));
    const parsed = storySchema.safeParse(p);
    assert.equal(parsed.success, false, key);
    if (!parsed.success)
      assert.ok(
        parsed.error.issues.some(
          (issue) => issue.code === "too_big" && issue.path[0] === key,
        ),
        key,
      );
  }
  const p = story();
  p.tracks[0].keyframes = Array.from({ length: 65 }, (_, i) => ({
    progress: i / 64,
    value: i,
    easing: "linear",
  }));
  assert.equal(projectSchema.safeParse(p).success, false);
});
