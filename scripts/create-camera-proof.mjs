import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
const root = resolve("."),
  recordPath = "examples/continuous-camera/story.json",
  outputPath = process.argv[2] ?? "examples/continuous-camera/motion.html";
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const story = JSON.parse(await readFile(recordPath, "utf8"));
story.stages[0].allocation.mobile.height = 0.42;
const text = [
  "A quiet silhouette. A familiar tool. Look closer.",
  "Turn the object. Discover the form that surrounds the image.",
  "Lens, housing and sensor: one relationship, seen from the inside.",
  "Follow the lens into the light. The rest of the object gives it room.",
  "The lens returns. Now the sensor has its moment.",
  "Every part finds its place. The whole picture returns.",
  "A complete object, and space for your next step.",
];
story.chapters.forEach((c, i) => (c.copy = text[i]));
story.beats.forEach((b, i) => (b.purpose = text[i]));
story.designContext.references = [];
for (const path of [
  "examples/continuous-camera/shell.css",
  "examples/continuous-camera/shell.js",
  "examples/continuous-camera/DESIGN.md",
  "examples/continuous-camera/fonts/bodoni-moda.ttf",
]) {
  story.designContext.references.push({
    path,
    digest: sha(await readFile(path)),
  });
}
await writeFile(recordPath, JSON.stringify(story, null, 2) + "\n");
const client = new Client({ name: "camera-proof", version: "1.0.0" });
await client.connect(
  new StdioClientTransport({
    command: process.execPath,
    args: [resolve("dist/cli.js"), "mcp", "--root", root],
    stderr: "pipe",
  }),
);
try {
  const preview = await client.callTool({
    name: "parallax_create_preview",
    arguments: { recordPath, outputPath },
  });
  if (preview.isError) throw new Error(preview.content[0].text);
  const result = preview.structuredContent;
  story.preview = {
    revision: result.revision,
    file: outputPath,
    fileDigest: result.digest,
  };
  await writeFile(recordPath, JSON.stringify(story, null, 2) + "\n");
  const escape = (value) =>
    value.replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const chapters = story.chapters
    .map(
      (c, i) =>
        `<article class="chapter" id="${c.id}" style="--chapter-length:${(story.beats[i].end - story.beats[i].start) * 850}vh"><div class="chapter-copy"><${i ? "h2" : "h1"}>${escape(c.title)}</${i ? "h2" : "h1"}><p>${escape(c.copy)}</p>${c.action ? `<a href="#${c.action.target}">${escape(c.action.label)}</a>` : ""}</div></article>`,
    )
    .join("");
  const data = JSON.stringify(story).replace(/</g, "\\u003c");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Meridian — Inside the image</title><link rel="stylesheet" href="shell.css"></head><body><a class="skip" href="#discover">Skip to the story</a><nav class="site-nav" aria-label="Main"><a class="wordmark" href="#discover">MERIDIAN</a><a class="nav-link" href="#resolve">The whole picture</a></nav><main id="journey" class="journey"><div class="visual-stage"><div id="motion-mount" class="motion-mount"></div></div><div class="chapter-stream">${chapters}</div></main><footer class="site-footer"><span>Original conceptual camera. Representative motion preview.</span><a href="#discover">Back to the beginning</a></footer><button class="review-toggle" id="review-toggle" aria-controls="review-panel" aria-expanded="false">Review motion</button><aside id="review-panel" class="review-panel" hidden><p>Integrated preview: host UI shell guided by Impeccable; continuous motion authored as data and generated through the actual local MCP. No creative approval or final-site readiness claimed.</p><label for="seek">Inspect any pose</label><input id="seek" type="range" min="0" max="1" step="0.001" value="0"><button id="resume-scroll">Resume native scroll</button><output id="pose-status" aria-live="polite"></output><a href="${outputPath.split("/").at(-1)}">MCP stage artifact</a></aside><script id="story-data" type="application/json">${data}</script><script src="../../assets/motion-runtime.js"></script><script src="shell.js"></script><noscript><style>.visual-stage,.review-toggle{display:none}.journey{min-height:0}.chapter-stream{margin-top:0}.chapter{min-height:0;width:100%;padding:5rem 6vw 2rem}</style></noscript></body></html>`;
  await writeFile(
    process.argv[3] ?? "examples/continuous-camera/index.html",
    html,
    {
      flag: "wx",
    },
  );
  console.log(
    JSON.stringify(
      {
        preview: result,
        composite: {
          path: resolve(
            process.argv[3] ?? "examples/continuous-camera/index.html",
          ),
          digest: sha(html),
        },
        approval: "not requested or recorded",
      },
      null,
      2,
    ),
  );
} finally {
  await client.close();
}
