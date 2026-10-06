import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
const stage = await mkdtemp(join(tmpdir(), "parallax-package-"));
const env = {
  ...process.env,
  npm_config_cache: join(tmpdir(), "parallax-npm-cache"),
};
try {
  const packed = JSON.parse(
    execFileSync("npm", ["pack", "--json", "--ignore-scripts"], {
      encoding: "utf8",
      env,
    }),
  )[0];
  execFileSync(
    "npm",
    [
      "install",
      "--prefix",
      stage,
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      resolve(packed.filename),
    ],
    { env, stdio: "pipe", timeout: 120000 },
  );
  const cli = join(
    stage,
    "node_modules/@alvintayzhenwei/parallax-effect-pro/dist/cli.js",
  );
  execFileSync(
    process.execPath,
    [
      "--experimental-strip-types",
      "--test",
      "tests/cli.test.ts",
      "tests/mcp.test.ts",
    ],
    {
      env: { ...env, PARALLAX_TEST_CLI: cli },
      stdio: "inherit",
      timeout: 30000,
    },
  );
  console.log(
    "Tarball CLI and stdio MCP smoke passed without source runtime paths",
  );
} finally {
  await rm(stage, { recursive: true, force: true });
}
