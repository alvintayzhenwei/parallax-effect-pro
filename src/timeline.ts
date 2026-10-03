import type {
  Channel,
  NumericPose,
  StoryRecord,
  StagePose,
} from "./story-records.ts";
/** Each pose depends only on authored data and progress, never prior frames. */
export function evaluateStage(
  story: StoryRecord,
  stageId: string,
  progress: number,
): StagePose {
  if (!Number.isFinite(progress)) throw new Error("Progress must be finite");
  const stage = story.stages.find((s) => s.id === stageId);
  if (!stage) throw new Error("Stage does not exist");
  const t = Math.max(0, Math.min(1, progress));
  const pose: StagePose = {
    actors: Object.fromEntries(
      story.actors
        .filter((a) => a.stageId === stageId)
        .map((a) => [a.id, { ...a.initial }]),
    ),
    camera: { ...stage.camera.initial },
    lights: Object.fromEntries(
      stage.lights.map((l) => [l.id, { ...l.initial }]),
    ),
  };
  const groups = new Map<string, StoryRecord["tracks"]>();
  for (const track of story.tracks.filter((t) => t.stageId === stageId)) {
    const key = `${track.target.kind}:${track.target.id}:${track.property}`;
    const group = groups.get(key) ?? [];
    group.push(track);
    groups.set(key, group);
  }
  for (const tracks of groups.values()) {
    tracks.sort((a, b) => a.keyframes[0]!.progress - b.keyframes[0]!.progress);
    let track = tracks[0]!;
    for (const candidate of tracks)
      if (candidate.keyframes[0]!.progress <= t) track = candidate;
    const keys = track.keyframes;
    let value = keys[0]!.value;
    if (t >= keys.at(-1)!.progress) value = keys.at(-1)!.value;
    else
      for (let i = 1; i < keys.length; i++) {
        const end = keys[i]!,
          start = keys[i - 1]!;
        if (t < start.progress || t > end.progress) continue;
        let f = (t - start.progress) / (end.progress - start.progress);
        if (start.easing === "smoothstep") f = f * f * (3 - 2 * f);
        value = start.value + (end.value - start.value) * f;
        break;
      }
    const target: NumericPose | undefined =
      track.target.kind === "actor"
        ? pose.actors[track.target.id]
        : track.target.kind === "camera"
          ? pose.camera
          : pose.lights[track.target.id];
    if (!target) throw new Error("Track target does not exist");
    target[track.property as Channel] = value;
  }
  return pose;
}
