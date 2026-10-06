import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { storySchema, type StoryRecord } from "../src/story-records.ts";
import { evaluateStage } from "../src/timeline.ts";
const fixture = JSON.parse(
  readFileSync(new URL("fixtures/story.json", import.meta.url), "utf8"),
);
const story = () => storySchema.parse(structuredClone(fixture));
test("full turn retains unwrapped degrees and initial channels at arbitrary seeks", () => {
  const p = story();
  for (const [progress, value] of [
    [0, 0],
    [0.5, 180],
    [1, 360],
    [-1, 0],
    [2, 360],
  ]) {
    const pose = evaluateStage(p, "journey", progress!);
    assert.equal(pose.actors.subject!.rotationY, value);
    assert.equal(pose.actors.subject!.x, 0.6);
  }
  const direct = evaluateStage(p, "journey", 0.5);
  for (const t of [0, 0.3, 0.7, 1, 0.9, 0.5]) evaluateStage(p, "journey", t);
  assert.deepEqual(evaluateStage(p, "journey", 0.5), direct);
  assert.throws(() => evaluateStage(p, "journey", NaN));
  assert.throws(() => evaluateStage(p, "missing", 0));
});
test("parts return exactly, separate targets coexist, overlapping descriptions are allowed", () => {
  const p = story();
  p.tracks.push({
    id: "inspect",
    stageId: "journey",
    target: { kind: "actor", id: "subject" },
    property: "x",
    keyframes: [
      { progress: 0.2, value: 0.6, easing: "smoothstep" },
      { progress: 0.5, value: 0.9, easing: "linear" },
      { progress: 0.8, value: 0.6, easing: "linear" },
    ],
  });
  p.tracks.push({
    id: "frame",
    stageId: "journey",
    target: { kind: "camera", id: "camera" },
    property: "z",
    keyframes: [
      { progress: 0, value: 5, easing: "linear" },
      { progress: 1, value: 3, easing: "linear" },
    ],
  });
  p.beats.push({ ...p.beats[0]!, id: "overlap", start: 0.4, end: 0.6 });
  const parsed = storySchema.parse(p);
  assert.equal(evaluateStage(parsed, "journey", 0).actors.subject!.x, 0.6);
  assert.equal(evaluateStage(parsed, "journey", 0.5).actors.subject!.x, 0.9);
  assert.equal(evaluateStage(parsed, "journey", 1).actors.subject!.x, 0.6);
  assert.equal(evaluateStage(parsed, "journey", 0.5).camera.z, 4);
  assert.equal(evaluateStage(parsed, "journey", 0.35).actors.subject!.x, 0.75);
});
test("overlapping property writes and mismatching adjacent boundaries are refused", () => {
  const p = story();
  p.tracks.push({ ...structuredClone(p.tracks[0]!), id: "conflict" });
  assert.equal(storySchema.safeParse(p).success, false);
  const q = story();
  q.tracks[0]!.keyframes[1]!.progress = 0.5;
  q.tracks.push({
    ...structuredClone(q.tracks[0]!),
    id: "next",
    keyframes: [
      { progress: 0.5, value: 360, easing: "linear" },
      { progress: 1, value: 720, easing: "linear" },
    ],
  });
  assert.equal(storySchema.safeParse(q).success, true);
  assert.equal(
    evaluateStage(q, "journey", 0.25).actors.subject!.rotationY,
    180,
  );
  assert.equal(
    evaluateStage(q, "journey", 0.75).actors.subject!.rotationY,
    540,
  );
  q.tracks[1]!.keyframes[0]!.value = 100;
  assert.equal(storySchema.safeParse(q).success, false);
});
test("holds values across gaps and smoothstep differs from linear", () => {
  const p = story();
  p.tracks[0]!.keyframes = [
    { progress: 0.2, value: 0, easing: "smoothstep" },
    { progress: 0.4, value: 100, easing: "linear" },
  ];
  p.tracks.push({
    ...structuredClone(p.tracks[0]!),
    id: "later",
    keyframes: [
      { progress: 0.7, value: 100, easing: "linear" },
      { progress: 0.9, value: 200, easing: "linear" },
    ],
  });
  assert.equal(evaluateStage(p, "journey", 0).actors.subject!.rotationY, 0);
  assert.ok(
    Math.abs(
      evaluateStage(p, "journey", 0.25).actors.subject!.rotationY! - 15.625,
    ) < 1e-10,
  );
  assert.equal(evaluateStage(p, "journey", 0.6).actors.subject!.rotationY, 100);
  assert.equal(evaluateStage(p, "journey", 1).actors.subject!.rotationY, 200);
});
