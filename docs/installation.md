# Installation and host setup

Requires Node.js 24+, npm, and a local Codex or Claude Code host. Generated sites can use different stacks; this requirement applies to tooling only.

## Development installation

This checkout prepares `@alvintayzhenwei/parallax-effect-pro@0.1.2`; npm publication is pending. Version `0.1.1` was verified in the registry on 2026-10-08. From the source checkout:

```sh
npm ci
npm run build
npm run check
npm run plugins
npm pack --ignore-scripts
```

Install the reviewed tarball into an isolated prefix or your intended environment. Persistent installation:

```sh
npm install -g /absolute/path/alvintayzhenwei-parallax-effect-pro-0.1.2.tgz
parallax-effect-pro doctor
```

Registry installation is available with `npm install -g @alvintayzhenwei/parallax-effect-pro@0.1.1`. Temporary execution:

```sh
npx --yes @alvintayzhenwei/parallax-effect-pro@0.1.1 doctor
```

Run this from your customer project or another directory outside this package's source checkout. Inside the checkout, npm can resolve the local package without its PATH binary; use `node dist/cli.js doctor`. Temporary `npx` execution of version `0.1.1 doctor` passed outside this checkout on 2026-10-08 with supported runtime and assets present. Host and Runway connections remain unverified. npm installs the CLI and canonical skill, not generated host-plugin wrappers. Generate those separately with the repository's `npm run plugins` step below.

## Skill/plugin

`npm run plugins` creates two thin skill packages and local marketplace catalogs in `plugins/`. It refuses existing package directories: choose a new output for another revision, for example `node scripts/package-plugins.mjs --output /absolute/new-directory`.

Codex local marketplace, after building packages:

```sh
codex plugin marketplace add /absolute/path/to/plugins
codex plugin add parallax-effect-pro@parallax-effect-pro
```

Restart the host/new chat for discovery. Alternatively copy canonical `skills/parallax-effect-pro` into your project's `.agents/skills/` when that destination does not exist. Keep updates in the canonical source, not host cache.

Claude local session, without global installation:

```sh
claude --plugin-dir /absolute/path/to/plugins/parallax-effect-pro-claude
```

Or register the generated marketplace through Claude's plugin commands if persistent installation is desired. The exact host commands above are user-run setup instructions; implementation verification did not change your global configuration.

## Explicit local stdio MCP root

Install the CLI separately and select the project directory. This keeps the workflow skill portable and prevents plugin installation from granting arbitrary filesystem roots.

Codex:

```sh
codex mcp add parallax-effect-pro -- parallax-effect-pro mcp --root /absolute/project
```

Claude Code:

```sh
claude mcp add --transport stdio --scope local parallax-effect-pro -- parallax-effect-pro mcp --root /absolute/project
```

If the installed binary is not on the host's PATH, use its absolute executable path. For source development, use `node /absolute/checkout/dist/cli.js mcp --root /absolute/project` as the command/arguments instead. The root must exist and cannot be a symlink. Tool arguments are relative to this root. No HTTP service is started.

## Optional Runway

Connect the generation MCP at `https://mcp.runwayml.com/mcp` through the host's supported OAuth flow; authenticate in your browser yourself. Reuse a connection if already available. Do not substitute Runway Dev MCP or copy API keys into our records. See [official Runway guidance](https://github.com/runwayml/runway-mcp-plugin).

Ask the agent to verify connection and available models. Paid generation requires separate approval. Free-plan or disconnected users can continue with placeholders/manual imports. Our package never opens a trial or purchases credits.

## Evidence levels

Codex 0.160.0 recognized generated marketplace/plugin and discovered the skill. Claude Code 2.1.288 passed strict manifest validation and loaded skill inventory via `--plugin-dir`. Real SDK stdio client calls exercise phase guidance, preview/validation/handoff refusal from source and tarball. A full model-driven end-to-end website session in both hosts and paid Runway generation are separate acceptance checks; do not infer them from manifest validation.


## Bare MCP versus skill plus MCP

Start with `parallax_design_guidance` in phase `discovery` when using a bare MCP connection. The server exposes phase-specific packaged knowledge and a preview template; your coding agent asks material questions and develops the design. The skill provides automatic workflow routing when installed. Neither a tool call nor a manifest/discovery test proves that the model follows the full interview or produces a visually superior site. See the product E2E acceptance plan before making those claims.


## Version 2 and manual-provider use

Installed phase guidance serves both `story.json` and legacy `project.json` from fixed package paths. Prefer version 2 for continuous actors, 3D groups and selective camera/light choreography. Browser runtime and evaluator are bundled locally; no CDN is required. Exported motion mounts inside the host's existing UI stack and does not impose a design system.

The portable skill can interview, brainstorm and produce tailored video prompt packs without starting the MCP or connecting Runway. Ask for the `video-prompts.md` workflow, choose a provider, verify its supported settings and paste the final prompts manually. Asset-generation cost approval and output review remain separate. Current stage imports support PNG/JPEG/WebP and self-contained GLB; media playback stays in the host stack.

Motion-only approval does not approve a full website. For integration, include reviewed UI source/asset references in `designContext`, save the actual composite and bind its digest alongside the MCP stage digest. External dependencies of a composite are bound only when the host declares their relevant local references; the MCP checks saved bytes and does not execute imported HTML.
