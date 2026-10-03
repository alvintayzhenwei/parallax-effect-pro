(() => {
  const mode = document.querySelector("#review-toggle");
  mode?.addEventListener("click", () => {
    const review = document.body.dataset.mode !== "review";
    document.body.dataset.mode = review ? "review" : "site";
    mode.setAttribute("aria-expanded", String(review));
    mode.textContent = review ? "Return to site" : "Review design";
  });
  const reduce = document.querySelector("#reduce"),
    intensity = document.querySelector("#intensity"),
    view = document.querySelector("#view"),
    effect = document.querySelector("#effect"),
    status = document.querySelector("#status");
  const preference = matchMedia("(prefers-reduced-motion: reduce)"),
    coarse = matchMedia("(pointer: coarse)");
  const scenes = [...document.querySelectorAll(".scene")];
  for (const scene of scenes)
    scene.dataset.plannedEffect = scene.dataset.effect;
  let frame = 0,
    pointer = { x: 0, y: 0 };
  const reduced = () => preference.matches || reduce.checked;
  function update() {
    frame = 0;
    const amount = Number(intensity.value);
    const off = reduced() || amount === 0;
    document.body.dataset.enhanced = "true";
    document.body.dataset.reduced = String(off);
    const mobile = innerWidth < 700 || document.body.dataset.view === "mobile";
    for (const scene of scenes) {
      const box = scene.getBoundingClientRect();
      const visible = box.bottom > 0 && box.top < innerHeight;
      const kind = scene.dataset.effect;
      const stageHeight = scene.querySelector(".scene-stage").offsetHeight;
      const progress = Math.max(
        0,
        Math.min(
          1,
          kind === "sticky-reveal" && !mobile
            ? (96 - box.top) / Math.max(1, box.height - stageHeight)
            : (innerHeight - box.top) / (innerHeight + box.height),
        ),
      );
      const signed = progress * 2 - 1;
      const beat = progress < 0.33 ? 0 : progress < 0.67 ? 1 : 2;
      scene.dataset.beat = ["start", "middle", "end"][beat];
      for (const [i, item] of [
        ...scene.querySelectorAll(".narrative-beats li"),
      ].entries())
        item.dataset.active = String(!off && i === beat);
      for (const layer of scene.querySelectorAll(".layer")) {
        if (
          off ||
          !visible ||
          ["none", "video-scrub", "three-dimensional"].includes(
            scene.dataset.effect,
          )
        ) {
          layer.style.transform = "none";
          continue;
        }
        const travel =
          Number(layer.dataset.travel) * amount * (mobile ? 0.5 : 1);
        if (kind === "background-drift") {
          // Only the distant plane travels; the subject and reading plane stay steady.
          layer.style.transform =
            layer.dataset.depth === "background"
              ? `translate(${layer.dataset.direction === "horizontal" ? signed * travel * 800 : 0}px, ${layer.dataset.direction === "vertical" ? signed * travel * 800 : 0}px)`
              : "none";
        } else if (kind === "pointer-depth") {
          layer.style.transform = coarse.matches
            ? "none"
            : `translate(${pointer.x * travel * 160}px, ${pointer.y * travel * 160}px) rotate(${pointer.x * travel * 8}deg)`;
        } else if (kind === "sticky-reveal") {
          // Assemble, fan apart, then resolve. Travel magnitude remains authored in the record.
          const spread = Math.sin(progress * Math.PI);
          const plane = { background: -1, midground: 0.35, foreground: 1 }[
            layer.dataset.depth
          ];
          const distance = spread * travel * 800 * plane;
          const x =
            layer.dataset.direction === "horizontal"
              ? distance
              : spread * travel * 160 * plane;
          const y =
            layer.dataset.direction === "vertical"
              ? distance
              : -spread * travel * 160 * plane;
          layer.style.transform = `translate(${x}px, ${y}px) rotate(${spread * travel * 16 * plane}deg) scale(${1 + spread * Math.abs(travel) * 0.2})`;
        } else {
          layer.style.transform = `translate(${layer.dataset.direction === "horizontal" ? signed * travel * 800 : 0}px, ${layer.dataset.direction === "vertical" ? signed * travel * 800 : 0}px)`;
        }
      }
    }
  }
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  function controls() {
    document.body.dataset.view = view.value;
    for (const scene of scenes)
      scene.dataset.effect =
        effect.value === "planned" ? scene.dataset.plannedEffect : effect.value;
    reduce.disabled = preference.matches;
    status.textContent = reduced()
      ? "Reduced motion: static composition. Content remains available."
      : effect.value === "planned" && Number(intensity.value) === 1
        ? "Showing the recorded motion plan. Approve this revision in your agent chat."
        : "Exploratory override: save effect and scaled travel in the plan, then regenerate before approval.";
    schedule();
  }
  reduce.addEventListener("change", controls);
  intensity.addEventListener("input", controls);
  view.addEventListener("change", controls);
  effect.addEventListener("change", controls);
  preference.addEventListener("change", () => {
    controls();
  });
  coarse.addEventListener("change", schedule);
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule, { passive: true });
  addEventListener(
    "pointermove",
    (e) => {
      if (reduced() || coarse.matches) return;
      pointer = {
        x: (e.clientX / innerWidth) * 2 - 1,
        y: (e.clientY / innerHeight) * 2 - 1,
      };
      schedule();
    },
    { passive: true },
  );
  const providerNote = document.querySelector("#provider-note");
  const notes = {
    import:
      "Use reviewed local assets or keep placeholders. No generation runs from this preview.",
    runway:
      "Ask your agent to verify Runway MCP connection and available tools. Approve prompt, references, settings and credit use before generation.",
    higgsfield:
      "Manual route: ask your agent for tailored Higgsfield / Seedance prompts and current settings. Import reviewed outputs.",
    luma: "Manual route: ask your agent for Luma prompts and current settings. Import reviewed outputs.",
  };
  document.querySelector("#providers").addEventListener("change", (e) => {
    providerNote.textContent = notes[e.target.value] ?? notes.import;
  });
  reduce.disabled = preference.matches;
  document.body.dataset.view = view.value;
  update();
})();
