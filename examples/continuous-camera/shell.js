/* Host-owned preview integration. Choreography remains in the MCP-authored story data. */
const story = JSON.parse(document.getElementById("story-data").textContent);
const stage = story.stages[0],
  mount = document.getElementById("motion-mount"),
  journey = document.getElementById("journey");
const handle = ParallaxMotion.mountMotionStage(mount, story, stage.id, []);
const seek = document.getElementById("seek"),
  review = document.getElementById("review-panel"),
  output = document.getElementById("pose-status");
let manual = false,
  frame = 0;
function update() {
  frame = 0;
  if (manual) return;
  const bounds = journey.getBoundingClientRect();
  const progress = Math.max(
    0,
    Math.min(1, -bounds.top / Math.max(1, bounds.height - mount.clientHeight)),
  );
  handle.seek(progress);
  seek.value = String(progress);
}
function schedule() {
  if (!frame) frame = requestAnimationFrame(update);
}
addEventListener("scroll", schedule, { passive: true });
addEventListener("resize", schedule);
handle.ready.then(() => {
  if (mount.dataset.motionState === "animated")
    document.body.dataset.playing = "true";
  if (mount.dataset.motionState === "failed")
    document.body.dataset.static = "true";
  update();
});
seek.addEventListener("input", () => {
  manual = true;
  handle.seek(Number(seek.value));
});
document.getElementById("resume-scroll").addEventListener("click", () => {
  manual = false;
  update();
});
document.getElementById("review-toggle").addEventListener("click", (event) => {
  review.hidden = !review.hidden;
  event.currentTarget.setAttribute("aria-expanded", String(!review.hidden));
});
mount.addEventListener("pep-motion-pose", (event) => {
  const { progress, bounds } = event.detail;
  const current =
    story.beats.findLast((b) => progress >= b.start) ?? story.beats[0];
  for (const chapter of document.querySelectorAll(".chapter")) {
    const active = chapter.id === current.chapterId;
    chapter.dataset.active = String(active);
    chapter
      .querySelector(".chapter-copy")
      .setAttribute("aria-hidden", String(!active));
  }
  const beat = story.beats.find(
    (b) => progress >= b.start && progress <= b.end,
  );
  const conflicts = Object.entries(bounds)
    .filter(([, b]) => b.clipped || b.readingConflict)
    .map(
      ([id, b]) =>
        id +
        ": " +
        (b.clipped ? "clipping " : "") +
        (b.readingConflict ? "reading-zone overlap" : ""),
    );
  output.textContent =
    (beat?.purpose ?? "Final pose") +
    " — " +
    Math.round(progress * 100) +
    "%. " +
    (conflicts.length
      ? conflicts.join("; ")
      : "No sampled object-bound conflict. Owner visual review remains required.");
});
addEventListener("pagehide", () => {
  cancelAnimationFrame(frame);
  handle.dispose();
});

const reduced = matchMedia("(prefers-reduced-motion: reduce)");
function applyStatic() {
  if (reduced.matches || mount.dataset.motionState === "failed") {
    delete document.body.dataset.playing;
    document.body.dataset.static = "true";
    for (const copy of document.querySelectorAll(".chapter-copy"))
      copy.removeAttribute("aria-hidden");
  } else {
    delete document.body.dataset.static;
    document.body.dataset.playing = "true";
    update();
  }
}
reduced.addEventListener("change", applyStatic);
applyStatic();
