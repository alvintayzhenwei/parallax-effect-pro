(() => {
  const preference = matchMedia("(prefers-reduced-motion: reduce)"),
    coarse = matchMedia("(pointer: coarse)"),
    control = document.querySelector("#reduce");
  const scenes = [...document.querySelectorAll(".scene")];
  let frame = 0,
    pointer = { x: 0, y: 0 };
  function update() {
    frame = 0;
    const off = preference.matches || control.checked;
    document.body.classList.toggle("reduced", off);
    for (const scene of scenes) {
      const box = scene.getBoundingClientRect(),
        visible = box.bottom > 0 && box.top < innerHeight,
        progress = Math.max(
          -1,
          Math.min(
            1,
            (innerHeight / 2 - box.top - box.height / 2) / innerHeight,
          ),
        );
      for (const layer of scene.querySelectorAll(".layer")) {
        if (off || !visible) {
          layer.style.transform = "none";
          continue;
        }
        const amount =
          Number(layer.dataset.travel) * (innerWidth < 700 ? 0.5 : 1);
        const pointerEffect = scene.dataset.effect === "pointer-depth";
        const x = pointerEffect
          ? coarse.matches
            ? 0
            : pointer.x * amount * 35
          : scene.dataset.effect === "sticky-reveal"
            ? progress * amount * 160
            : 0;
        const y = pointerEffect
          ? coarse.matches
            ? 0
            : pointer.y * amount * 35
          : scene.dataset.effect === "layered-depth"
            ? progress * amount * 160
            : 0;
        layer.style.transform = `translate(${x}px, ${y}px)`;
      }
    }
  }
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  function sync() {
    control.disabled = preference.matches;
    schedule();
  }
  control.addEventListener("change", schedule);
  preference.addEventListener("change", sync);
  coarse.addEventListener("change", schedule);
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule, { passive: true });
  addEventListener(
    "pointermove",
    (e) => {
      if (coarse.matches || preference.matches || control.checked) return;
      pointer = {
        x: (e.clientX / innerWidth) * 2 - 1,
        y: (e.clientY / innerHeight) * 2 - 1,
      };
      schedule();
    },
    { passive: true },
  );
  sync();
})();
