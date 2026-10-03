#!/usr/bin/env node
import { parseArgs } from "node:util";
import { isAbsolute } from "node:path";
import { lstat, access } from "node:fs/promises";
import { createPreview } from "./preview.ts";
import { validateProject, exportHandoff } from "./project.ts";
const help = `Parallax Effect Pro — local design tools
Usage:
  parallax-effect-pro preview --root ABSOLUTE_DIRECTORY --record project.json --output wireframe.html
  parallax-effect-pro validate --root ABSOLUTE_DIRECTORY --record project.json
  parallax-effect-pro handoff --root ABSOLUTE_DIRECTORY --record project.json --output handoff.md
  parallax-effect-pro mcp --root ABSOLUTE_DIRECTORY
  parallax-effect-pro doctor
Outputs are created exclusively. Choose a new filename for every revision.
No provider connection, paid generation, or deployment is performed by these tools.`;
async function main() {
  let parsed;
  try {
    parsed = parseArgs({
      options: {
        root: { type: "string" },
        record: { type: "string" },
        output: { type: "string" },
        help: { type: "boolean", short: "h" },
      },
      allowPositionals: true,
    });
  } catch {
    console.error(help);
    process.exitCode = 2;
    return;
  }
  const { values, positionals } = parsed;
  const command = positionals[0];
  if (values.help || !command) {
    console.log(help);
    return;
  }
  if (
    positionals.length !== 1 ||
    !["preview", "validate", "handoff", "doctor", "mcp"].includes(command)
  ) {
    console.error(help);
    process.exitCode = 2;
    return;
  }
  if (command === "doctor") {
    await access(new URL("../assets/preview.js", import.meta.url));
    await access(
      new URL("../skills/parallax-effect-pro/SKILL.md", import.meta.url),
    );
    console.log(
      JSON.stringify({
        node: process.version,
        runtime:
          Number(process.versions.node.split(".")[0]) >= 24
            ? "supported"
            : "unsupported",
        assets: "present",
        hosts: "unverified",
        runway: "unverified",
      }),
    );
    return;
  }
  if (
    !values.root ||
    !isAbsolute(values.root) ||
    (!["mcp"].includes(command) && !values.record) ||
    (["preview", "handoff"].includes(command) && !values.output)
  ) {
    console.error(help);
    process.exitCode = 2;
    return;
  }
  const stat = await lstat(values.root);
  if (!stat.isDirectory() || stat.isSymbolicLink())
    throw new Error("Root must be an existing directory, not a symlink");
  if (command === "mcp") {
    const { startMcp } = await import("./mcp.ts");
    await startMcp(values.root);
    return;
  }
  const result =
    command === "preview"
      ? await createPreview(values.root, values.record!, values.output!)
      : command === "validate"
        ? await validateProject(values.root, values.record!)
        : await exportHandoff(values.root, values.record!, values.output!);
  console.log(JSON.stringify(result, null, 2));
}
main().catch(() => {
  console.error(
    "Operation refused. Check schema, paths, output filename, required assets and matching human approval.",
  );
  process.exitCode = 1;
});
