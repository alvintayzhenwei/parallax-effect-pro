import { readFile } from "node:fs/promises";
import { readProject, writeContained, sha256 } from "./project.ts";
import { loadStoryAssets, verifiedStoryRevision } from "./story-assets.ts";
import type { PreviewResult } from "./story-records.ts";
const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const scriptJson = (value: unknown) =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
export async function createStoryPreview(
  root: string,
  recordPath: string,
  outputPath: string,
): Promise<PreviewResult> {
  const story = await readProject(root, recordPath);
  if (story.schemaVersion !== 2)
    throw new Error("Story preview requires schema version 2");
  const revision = await verifiedStoryRevision(root, story),
    assets = (await loadStoryAssets(root, story)).map((a) => ({
      id: a.id,
      type: a.type,
      data: a.bytes.toString("base64"),
      digest: a.digest,
    }));
  const runtime = await readFile(
      new URL("../assets/motion-runtime.js", import.meta.url),
      "utf8",
    ),
    css = await readFile(
      new URL("../assets/story-preview.css", import.meta.url),
      "utf8",
    );
  const authored = {
    ...story,
    preview: undefined,
    approval: undefined,
    integrationPreview: undefined,
  };
  const boot = `const story=${scriptJson(authored)},assets=${scriptJson(assets)};
const handles=new Map();const reduced=matchMedia('(prefers-reduced-motion: reduce)');
for(const stage of story.stages){const container=document.querySelector('[data-pep-stage="'+stage.id+'"]'),mount=container.querySelector('.pep-mount'),control=document.getElementById('pepSeek-'+stage.id),status=document.getElementById('pepStatus-'+stage.id);const handle=ParallaxMotion.mountMotionStage(mount,story,stage.id,assets);handles.set(stage.id,handle);
 let manual=false;const update=()=>{const r=container.getBoundingClientRect(),h=mount.clientHeight;const p=Math.max(0,Math.min(1,-r.top/Math.max(1,r.height-h)));if(!manual&&!reduced.matches){handle.seek(p);control.value=String(p);}if(mount.dataset.motionState==='failed')document.body.dataset.static='true';};
 control.addEventListener('input',()=>{manual=true;handle.seek(Number(control.value));status.textContent='Review pose '+Math.round(Number(control.value)*100)+'%';});
 document.getElementById('pepNative-'+stage.id).addEventListener('click',()=>{manual=false;update();});
 mount.addEventListener('pep-motion-pose',event=>{const detail=event.detail;const conflicts=Object.entries(detail.bounds??{}).filter(([id,b])=>b.clipped||b.readingConflict).map(([id,b])=>id+': '+(b.clipped?'clipping ':'')+(b.readingConflict?'reading-zone overlap':''));status.textContent='Pose '+Math.round(detail.progress*100)+'%. '+(conflicts.length?conflicts.join('; '):'No sampled object-bound conflict. Visual review remains required.');});
 addEventListener('scroll',update,{passive:true});addEventListener('resize',update);handle.ready.then(update);update();
}
document.getElementById('pepReviewToggle').addEventListener('click',event=>{const opened=document.body.dataset.review!=='open';document.body.dataset.review=opened?'open':'closed';document.getElementById('pepReviewPanel').hidden=!opened;event.currentTarget.setAttribute('aria-expanded',String(opened));});
addEventListener('pagehide',()=>{for(const handle of handles.values())handle.dispose();});`;
  const scripts = [runtime, boot],
    hashes = scripts
      .map(
        (s) => `'sha256-${Buffer.from(sha256(s), "hex").toString("base64")}'`,
      )
      .join(" ");
  const selected = story.concepts.find(
    (c) => c.id === story.selectedConceptId,
  )!;
  const stages = story.stages
    .map(
      (stage) =>
        `<section class="pep-story" data-pep-stage="${stage.id}" style="min-height:${stage.scrollVh}vh;--pep-desktop-width:${stage.allocation.desktop.width * 100}%;--pep-desktop-height:${stage.allocation.desktop.height * 100}vh;--pep-mobile-width:${stage.allocation.mobile.width * 100}%;--pep-mobile-height:${stage.allocation.mobile.height * 100}vh"><div class="pep-stage"><div class="pep-mount"></div></div><div class="pep-chapters">${stage.chapterIds
          .map((id) => {
            const c = story.chapters.find((c) => c.id === id)!;
            return `<article class="pep-chapter" id="${c.id}" style="min-height:${stage.scrollVh / stage.chapterIds.length}vh"><h2>${escape(c.title)}</h2><p>${escape(c.copy)}</p>${c.action ? `<a href="#${c.action.target}">${escape(c.action.label)}</a>` : ""}</article>`;
          })
          .join("")}</div></section>`,
    )
    .join("");
  const controls = story.stages
    .map(
      (stage) =>
        `<label for="pepSeek-${stage.id}">Seek ${escape(stage.id)}</label><input id="pepSeek-${stage.id}" type="range" min="0" max="1" step="0.001" value="0" aria-label="Seek ${escape(stage.id)}"><button id="pepNative-${stage.id}" type="button">Resume native scroll</button><output id="pepStatus-${stage.id}" aria-live="polite"></output>`,
    )
    .join("");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src ${hashes}; style-src 'unsafe-inline'; img-src data: blob:; connect-src data: blob:; base-uri 'none'; form-action 'none'; object-src 'none'"><title>${escape(selected.title)}</title><style>${css}</style></head><body class="pep-preview" data-review="closed"><header><h1>${escape(selected.title)}</h1><p>${escape(selected.story)}</p></header><main>${stages}</main><button class="pep-review-toggle" id="pepReviewToggle" type="button" aria-controls="pepReviewPanel" aria-expanded="false">Review motion</button><aside class="pep-review" id="pepReviewPanel" hidden><p>Motion-stage proof. Site layout remains owned by ${escape(story.designContext.owner)}. Preview does not approve unseen UI.</p>${controls}<p>Revision ${revision}</p></aside><noscript><style>.pep-story{display:none}</style><div class="pep-static">${story.fallbackViews.map((v) => `<h2>${escape(v.label)}</h2><p>${escape(v.description)}</p>`).join("")}${story.chapters.map((c) => `<article id="pep-static-${c.id}"><h2>${escape(c.title)}</h2><p>${escape(c.copy)}</p>${c.action ? `<a href="#pep-static-${c.action.target}">${escape(c.action.label)}</a>` : ""}</article>`).join("")}</div></noscript>${scripts.map((s) => `<script>${s}</script>`).join("")}</body></html>`;
  if (Buffer.byteLength(html) > 24 * 1024 * 1024)
    throw new Error("Story preview exceeds 24 MiB limit");
  const path = await writeContained(root, outputPath, html),
    digest = sha256(html);
  return {
    path,
    revision,
    digest,
    artifacts: [{ path, digest, role: "stage" }],
  };
}
