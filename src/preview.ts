import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  readProject,
  designRevision,
  sha256,
  writeContained,
} from "./project.ts";
const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const defaultBeats = {
  "layered-depth": [
    "Establish the depth planes",
    "Separate the subject from its surroundings",
    "Resolve the composition around the action",
  ],
  "background-drift": [
    "Establish the landscape",
    "Move the background behind steady content",
    "Keep the destination and action clear",
  ],
  "pointer-depth": [
    "Establish the focal object",
    "Explore its depth with the pointer",
    "Return to a stable reading composition",
  ],
  "sticky-reveal": [
    "Introduce the assembled idea",
    "Separate the parts and explain their roles",
    "Resolve the idea and continue the story",
  ],
  "video-scrub": [
    "Plan the opening frame",
    "Storyboard the explanation",
    "Plan the final frame and poster fallback",
  ],
  "three-dimensional": [
    "Plan the opening view",
    "Storyboard the spatial explanation",
    "Plan the final view and static fallback",
  ],
  none: [
    "Introduce the story",
    "Read the explanation",
    "Continue to the action",
  ],
} as const;
// Fixed local illustrations: record data selects a recipe, never executable SVG.
function illustration(
  art: string,
  depth: string,
  coastalScene = "coastline",
): string {
  const coastal = {
    background:
      '<rect width="800" height="600" fill="var(--sky)"/><circle cx="610" cy="120" r="65" fill="var(--surface)"/><path d="M0 260 Q220 225 420 275 T800 250 V600 H0Z" fill="#457e83"/><path d="M0 350 Q220 305 430 355 T800 320" fill="none" stroke="#b6d3cb" stroke-width="5"/><path d="M0 430 Q210 385 410 435 T800 400" fill="none" stroke="#b6d3cb" stroke-width="3"/>',
    midground:
      '<path d="M-50 590 L120 360 270 330 420 420 650 360 850 530 V650H-50Z" fill="#b4a38a"/><path d="M130 390 L270 345 390 425 300 450Z" fill="#d4c4a9"/><path d="M440 355V245H655V360Z" fill="var(--surface)"/><path d="M416 245L535 175 680 245Z" fill="var(--accent)"/><path d="M485 270H525V330H485ZM560 270H620V305H560Z" fill="#274b50"/><path d="M430 355H665" stroke="#887d62" stroke-width="10"/>',
    foreground:
      '<path d="M-30 640Q70 390 230 515L340 640ZM490 640Q615 410 840 460V640Z" fill="#293d35"/><path d="M30 560Q15 420 80 345M90 570Q100 450 155 405M650 565Q650 420 740 350M710 580Q745 440 790 415" fill="none" stroke="#66846a" stroke-width="9"/>',
  };
  const editorial = {
    background:
      '<rect width="800" height="600" fill="var(--sky)"/><circle cx="575" cy="240" r="190" fill="var(--accent)" opacity=".75"/><path d="M0 530L800 300V600H0Z" fill="var(--ink)" opacity=".1"/>',
    midground:
      '<path d="M190 500V195Q190 95 310 95H460Q575 95 575 195V500Z" fill="var(--surface)"/><path d="M260 480V220Q260 150 330 150H420Q500 150 500 220V480" fill="var(--accent)"/><path d="M300 480V280Q300 210 375 210Q450 210 450 280V480" fill="var(--ink)"/>',
    foreground:
      '<ellipse cx="400" cy="520" rx="300" ry="48" fill="var(--ink)" opacity=".15"/><path d="M80 530V400H270V530ZM535 530V330H710V530Z" fill="var(--accent)"/><path d="M535 330L610 280 710 330" fill="var(--surface)"/>',
  };
  const geometric = {
    background:
      '<rect width="800" height="600" fill="var(--sky)"/><circle cx="400" cy="300" r="240" fill="none" stroke="var(--accent)" stroke-width="36"/>',
    midground:
      '<path d="M180 410L400 80 620 410Z" fill="var(--surface)"/><circle cx="400" cy="300" r="105" fill="var(--accent)"/>',
    foreground:
      '<path d="M100 470H700V540H100Z" fill="var(--ink)"/><circle cx="590" cy="435" r="85" fill="var(--accent)"/>',
  };
  if (coastalScene !== "villa")
    coastal.midground = coastal.midground.slice(
      0,
      coastal.midground.indexOf('<path d="M440'),
    );
  if (coastalScene === "walk")
    coastal.midground +=
      '<path d="M350 650 Q250 475 425 420 Q550 370 510 340" fill="none" stroke="var(--surface)" stroke-width="48"/><path d="M300 500L370 475M415 425L445 405" stroke="#887d62" stroke-width="5"/>';
  const recipe =
    art === "coastal" ? coastal : art === "geometric" ? geometric : editorial;
  return `<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" focusable="false">${recipe[depth as keyof typeof recipe]}</svg>`;
}
export async function createPreview(
  root: string,
  recordPath: string,
  outputPath: string,
): Promise<{ path: string; revision: string; digest: string }> {
  const p = await readProject(root, recordPath);
  if (p.schemaVersion === 2)
    throw new Error("Version 2 preview is not yet available");
  const c = p.concepts.find((c) => c.id === p.selectedConceptId)!;
  const revision = designRevision(p);
  const visual = p.motionPlan.visual ?? {
    brand: c.title,
    tagline: "",
    typography: "editorial",
    palette: {
      background: "#f3eee4",
      ink: "#263d37",
      accent: "#a85b39",
      sky: "#c4d3c9",
      surface: "#fff7e7",
    },
  };
  const palette = Object.entries(visual.palette)
    .map(([key, value]) => `--${key}:${value}`)
    .join(";");
  const css = await readFile(
    new URL("../assets/preview.css", import.meta.url),
    "utf8",
  );
  const js = await readFile(
    new URL("../assets/preview.js", import.meta.url),
    "utf8",
  );
  const sections = p.motionPlan.sections
    .map((s, i) => {
      const scene = p.motionPlan.scenes.find((c) => c.sectionId === s.id);
      const advanced =
        scene && ["video-scrub", "three-dimensional"].includes(scene.effect);
      const beats = scene?.beats
        ? [scene.beats.start, scene.beats.middle, scene.beats.end]
        : defaultBeats[scene?.effect ?? "none"];
      return `<section id="scene-${s.id}" class="scene" data-composition="${scene?.composition ?? "split"}" data-effect="${scene?.effect ?? "none"}"><div class="scene-stage"><div class="scene-copy"><p class="eyebrow">${escape(visual.tagline)}</p><${i === 0 ? "h1" : "h2"}>${escape(s.title)}</${i === 0 ? "h1" : "h2"}><p>${escape(s.copy)}</p>${s.action ? `<a class="action" href="#scene-${s.action.target.slice(1)}">${escape(s.action.label)} <span aria-hidden="true">↗</span></a>` : ""}<p class="effect-note review-only">${escape(scene?.effect ?? "Static content")}${advanced ? " · Storyboard placeholder — detailed media/3D not generated" : ""}</p><ol class="narrative-beats review-only">${beats.map((beat, j) => `<li><span>${["Start", "Middle", "End"][j]}</span>${escape(beat)}</li>`).join("")}</ol></div><div class="scene-art" data-art="${scene?.art ?? "editorial"}" aria-hidden="true"><div class="art-grid review-only"></div><span class="art-caption review-only">${String(i + 1).padStart(2, "0")} / SPATIAL STUDY</span>${scene?.layers.map((l, j) => `<div class="layer ${l.depth}" data-depth="${l.depth}" data-travel="${l.travel}" data-direction="${l.direction}" style="--index:${j}">${illustration(scene?.art ?? "editorial", l.depth, scene?.coastalScene)}<span class="review-only">${escape(l.label)}</span></div>`).join("") ?? ""}</div></div></section>`;
    })
    .join("\n");
  const map = p.motionPlan.scenes
    .map(
      (s) =>
        `<tr><th scope="row">${s.sectionId}</th><td>${s.effect}</td><td>${s.layers.map((l) => `${escape(l.label)}: ${l.depth}, ${l.direction}, ${l.travel}`).join("<br>")}</td></tr>`,
    )
    .join("");
  const hash = (s: string) => createHash("sha256").update(s).digest("base64");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'sha256-${hash(js)}'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'; connect-src 'none'"><title>${escape(c.title)} — Site preview</title><style>${css}</style></head><body data-mode="site" data-typography="${visual.typography}" style="${palette}"><a class="skip" href="#canvas">Skip to site</a><div class="preview-switch"><button id="review-toggle" type="button" aria-expanded="false" aria-controls="motion-map">Review design</button></div><header class="toolbar review-only"><div><strong>PARALLAX / PRO</strong><span>Motion wireframe · ${escape(c.title)}</span></div><div class="controls"><label>View <select id="view"><option value="desktop">Desktop</option><option value="mobile">Mobile</option></select></label><label>Effect <select id="effect"><option value="planned">Planned effects</option><option value="layered-depth">Layered depth</option><option value="background-drift">Background drift</option><option value="pointer-depth">Pointer depth</option><option value="sticky-reveal">Sticky reveal</option><option value="none">Static</option></select></label><label>Intensity <input id="intensity" type="range" min="0" max="1" step="0.1" value="1"></label><label><input id="reduce" type="checkbox"> Reduced motion</label><a href="#motion-map">Motion map</a></div></header><p class="notice review-only" id="status" role="status">Showing the recorded motion plan. Approve layout and motion in your coding-agent chat.</p><main id="canvas"><nav class="site-nav" aria-label="Site navigation"><span>${escape(visual.brand)}</span>${p.motionPlan.sections.map((s) => `<a href="#scene-${s.id}">${escape(s.title)}</a>`).join("")}</nav>${sections}<footer>${escape(visual.brand)} · ${escape(visual.tagline)}</footer></main><aside id="motion-map" class="review-only"><p class="eyebrow">Design notes</p><h2>Motion map</h2><p>${escape(c.story)}</p><div class="table-wrap"><table><thead><tr><th>Section</th><th>Effect</th><th>Layers / travel</th></tr></thead><tbody>${map}</tbody></table></div><p><strong>Mobile:</strong> ${escape(p.motionPlan.mobileBehavior)}</p><p><strong>Reduced motion:</strong> ${escape(p.motionPlan.reducedMotionBehavior)}</p><p>Start: establish composition. Middle: compare layer travel. End: keep content and actions reachable.</p><details><summary>Approval reference</summary><p>Revision <code>${revision}</code></p><p>Control changes are exploratory and do not update this record. Tell your agent which settings to retain; regenerate and approve that revision.</p></details><h2>Asset route — after approval</h2><fieldset id="providers"><legend>Choose a route to discuss with your agent</legend><label><input type="radio" name="provider" value="import" checked> Import existing assets</label><label><input type="radio" name="provider" value="runway"> Runway MCP — connected generation when available</label><label><input type="radio" name="provider" value="higgsfield"> Higgsfield / Seedance — manual generation</label><label><input type="radio" name="provider" value="luma"> Luma — manual generation</label></fieldset><p id="provider-note" role="status">Use reviewed local assets or keep placeholders. No generation runs from this preview.</p></aside><noscript><p>Motion controls require JavaScript. All content remains available in this static view.</p></noscript><script>${js}</script></body></html>`;
  return {
    path: await writeContained(root, outputPath, html),
    revision,
    digest: sha256(html),
  };
}
