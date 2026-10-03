import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { tmpdir } from "node:os";
export function validateFiles(files) {
  const allowed = (p) =>
    [
      "package.json",
      "README.md",
      "LICENSE",
      "assets/preview.css",
      "assets/preview.js",
    ].includes(p) ||
    /^dist\/(cli|mcp|project|records|preview|story-records|timeline|story-assets)\.js$/.test(
      p,
    ) ||
    /^skills\/parallax-effect-pro\/(SKILL\.md|references\/[a-z-]+\.md|templates\/[a-z-]+\.(md|json))$/.test(
      p,
    );
  for (const { path } of files)
    if (!allowed(path)) throw new Error(`Unexpected release file: ${path}`);
  for (const required of [
    "package.json",
    "README.md",
    "LICENSE",
    "dist/cli.js",
    "dist/mcp.js",
    "dist/project.js",
    "dist/records.js",
    "dist/story-records.js",
    "dist/preview.js",
    "assets/preview.css",
    "assets/preview.js",
    "skills/parallax-effect-pro/SKILL.md",
    "skills/parallax-effect-pro/templates/project.json",
  ])
    if (!files.some((f) => f.path === required))
      throw new Error(`Missing release file: ${required}`);
  return files.length;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const result = JSON.parse(
    execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
      encoding: "utf8",
      env: {
        ...process.env,
        npm_config_cache: join(tmpdir(), "parallax-npm-cache"),
      },
    }),
  )[0];
  console.log(
    `Package allowlist verified: ${validateFiles(result.files)} files`,
  );
}
