# Installation and host setup

Requires Node.js 24+, npm, and a local Codex or Claude Code host. Generated sites can use different stacks; this requirement applies to tooling only.

## Development installation

The registry package is not published yet. From this private checkout:

```sh
npm ci
npm run build
npm run check
npm run plugins
npm pack --ignore-scripts
```

Install the reviewed tarball into an isolated prefix or your intended environment. Persistent installation:

```sh
npm install -g /absolute/path/parallax-effect-pro-0.1.0.tgz
parallax-effect-pro doctor
```

Only after approved registry publication, replace tarball installation with `npm install -g parallax-effect-pro@0.1.0`, or use temporary `npx --yes parallax-effect-pro@0.1.0 doctor`. The latter is not a persistent command installation. Name lookup returned registry E404 on 2026-10-03; ownership and publication are not established.

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
