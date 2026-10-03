# Parallax Effect Pro

[![CI](https://github.com/alvintayzhenwei/parallax-effect-pro/actions/workflows/ci.yml/badge.svg)](https://github.com/alvintayzhenwei/parallax-effect-pro/actions/workflows/ci.yml)
[![Security checks](https://github.com/alvintayzhenwei/parallax-effect-pro/actions/workflows/security.yml/badge.svg)](https://github.com/alvintayzhenwei/parallax-effect-pro/actions/workflows/security.yml)
[![Release preparation](https://github.com/alvintayzhenwei/parallax-effect-pro/actions/workflows/release.yml/badge.svg)](https://github.com/alvintayzhenwei/parallax-effect-pro/actions/workflows/release.yml)
[![Dependabot](https://img.shields.io/badge/Dependabot-configured-025E8C?logo=dependabot)](.github/dependabot.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Turn a rough idea into a complete parallax website through Codex or Claude Code. Compare three concepts, approve an inexpensive animated wireframe, then create assets and build the site.

**Development preview — visual and end-to-end acceptance are pending; npm publication is pending.** The repository stays private. Private workflow badges and screenshots may require GitHub authentication. Dependabot's label describes configuration; the linked workflow badges report actual run state, not guaranteed security.

## What you get

- A portable skill with source-backed parallax theory and guided discovery for nontechnical users.
- Three tailored concepts with a motion story, asset requirements and effort tradeoffs.
- Local animated visual previews with a clean site view, optional review controls, illustrative scenery, desktop/mobile views and reduced-motion fallback.
- A visual asset-route chooser and optional direct generation through your separately connected Runway MCP.
- Revision-bound approval records and validated handoffs for a complete website.
- A TypeScript CLI, local stdio MCP, Codex/Claude skill packages, a fictional complete-site example and release checks.

The MCP serves phase-specific guidance from the packaged skill, creates previews, and validates handoffs. The host model conducts the conversation and authors the final design; MCP does not run a model or guarantee aesthetic quality. Your coding agent writes the actual website in its existing stack, calls approved provider tools and performs approved deployment. It is not a hosted site builder or an autonomous publisher.

![Animated wireframe at desktop size](docs/screenshots/wireframe-desktop.png)

![Mobile wireframe](docs/screenshots/wireframe-mobile.png)

## Start from this private checkout

Requirements: Node.js 24+, npm, and Codex or Claude Code with local file access.

```sh
npm ci
npm run check
node dist/cli.js doctor
```

To try the fictional brief:

```sh
node dist/cli.js preview --root "$PWD" --record tests/fixtures/project.json --output previews/my-first-wireframe.html
```

Open the returned HTML path in your browser or host file preview. Scroll to inspect real motion. The clean site view opens first. Open review controls to try mobile view, intensity and reduced motion, or inspect the motion map and asset routes. No cloud calls or generation occur from the preview. Choose a fresh filename for each revision; existing files are preserved.

## Install skill and stdio tools

```sh
npm run plugins
npm pack --ignore-scripts
```

Generated packages live in `plugins/parallax-effect-pro-codex` and `plugins/parallax-effect-pro-claude`. They share the canonical skill. The local tools are configured separately with an explicit project root. Follow [installation and host setup](docs/installation.md) for local tarball installation, Codex marketplace discovery, Claude `--plugin-dir`, and stdio configuration.

For a quick Claude session:

```sh
claude --plugin-dir /absolute/checkout/plugins/parallax-effect-pro-claude
```

For Codex:

```sh
codex plugin marketplace add /absolute/checkout/plugins
codex plugin add parallax-effect-pro@parallax-effect-pro
```

After installing the CLI, configure local tools for the selected project:

```sh
codex mcp add parallax-effect-pro -- parallax-effect-pro mcp --root /absolute/project
# Or, in Claude Code:
claude mcp add --transport stdio --scope local parallax-effect-pro -- parallax-effect-pro mcp --root /absolute/project
```

Restart/new chat where needed. Installation changes your host setup only when you run these commands. Use an absolute binary path if your host cannot find the installed CLI.

### After npm release

The following commands are future registry usage, **not available until publication**:

```sh
# Temporary execution:
npx --yes parallax-effect-pro@0.1.0 doctor
# Persistent command installation:
npm install -g parallax-effect-pro@0.1.0
```

`npx` execution does not install a persistent PATH command. Registry lookup currently returns E404; package name ownership and release configuration still need confirmation. See [release guide](docs/releasing.md).

## Your first website: step by step

1. Tell the agent: “Use Parallax Effect Pro. I want a calm studio website with layered depth. Help me shape the idea before building.” You can also provide a reference URL, screenshot or existing site.
2. Answer short questions about audience, goal, sections, style, content and constraints. Draft copy is marked for review; business facts and testimonials are never fabricated.
3. Compare three genuinely different concepts. Select one or combine elements. Each includes motion beats, mobile/static fallback, assets and effort.
4. The agent creates a visually representative animated preview. Inspect the clean site view first, then open review controls for desktop/mobile views and reduced motion. Adjust the plan cheaply. Control changes are exploratory: chosen settings must be saved to the motion plan and regenerated before approval.
5. Approve the exact layout and motion revision in chat. The agent records the actual decision and preview digest, then validates it. Structural/effect/scene changes return to preview; silent assumptions never grant approval.
6. Pick assets. Import existing files, follow manual provider prompts or connect Runway MCP. Connected paid generation requires approval of prompt, references, settings and cost/uncertainty. Failed paid calls are not automatically retried.
7. The agent exports the approved handoff and builds the complete agreed website. Existing stacks are preserved; small new sites can use native HTML/CSS/JavaScript.
8. Review content/assets and executed quality checks. Critical navigation/mobile/reduced-motion/secret failures block normal deployment. Choose a destination and approve publication separately.

## Effect choices

| Core wireframe effects | Advanced options |
| --- | --- |
| Layered depth, background drift, pointer depth, sticky reveals | Video scrubbing, 3D and richer cinematic sequences when justified |

Advanced wireframe scenes show annotated storyboards, not generated media or a working 3D renderer. The complete site needs actual assets and verified implementation. A video alone does not provide isolated depth layers or reliable seeking. Motion supports the story; it does not replace readable content.

## AI media: local orchestration, optional cloud generation

Runway is the first connected generation route through [Runway MCP](https://github.com/runwayml/runway-mcp-plugin). Authentication is handled by your host and Runway. Our package never collects API keys, starts trials, purchases credits or proxies provider calls.

Higgsfield/Seedance and Luma are manual choices: the agent supplies prompts/settings guidance and reviews imported output. Provider capabilities and account availability are checked before use. Without any provider, discovery, wireframes and imported/static assets still work.

Local records/previews remain local. Approved prompts/reference assets go to the chosen provider during generation. Website publication goes to your chosen destination after approval. Private GitHub source does not make those cloud operations offline.

## Tools and approval boundaries

| Tool | Purpose |
| --- | --- |
| `parallax_design_guidance` | Retrieve requirements, concept, preview, asset, build, or review guidance from the installed package |
| `parallax_create_preview` | Create a contained, self-contained animated HTML wireframe |
| `parallax_validate_project` | Validate schema and report missing/stale/recorded approval |
| `parallax_export_handoff` | Export complete-site specification after matching recorded approval |

CLI equivalents: `preview`, `validate`, `handoff`, plus `doctor` and `mcp`. [Schemas and examples](skills/parallax-effect-pro/references/implementation.md) explain record metadata.

Tools refuse path traversal, symlink components, oversized records and output overwrites. They do not run arbitrary shell commands or expose a network proxy. Approval records document a decision; they do not authenticate identity or defeat a malicious local agent. Host permissions and honest recording remain necessary. Root directories must be trusted against concurrent malicious changes.

## Complete example

Open [Form & Field](examples/studio/index.html), a fictional studio with original geometric assets, three complete sections, navigation and static/reduced-motion fallbacks. Its [project record](examples/studio/project.json), [wireframe](examples/studio/wireframe.html) and [handoff](examples/studio/handoff.md) demonstrate revision validation. The approval in this fixture is explicitly synthetic and cannot authorize a real website or paid generation.

The owner rejected this example's visual impact. It remains a fixture demonstration, not proof that the package meets design-quality acceptance. The separate [motion-direction studies](examples/motion-directions/index.html) were authored directly by an agent rather than MCP and are explicitly excluded from end-to-end product evidence.

![Complete fictional website](docs/screenshots/example-site-desktop.png)

## Checks and evidence

```sh
npm run check       # Types, build, behavior tests, release-file allowlist
npm run smoke       # CLI and real stdio MCP calls from an isolated tarball install
npm run browser     # Real browser layout/motion checks; requires Playwright Chromium
```

Install the development browser with `npx playwright install chromium`. Alternatively set `PARALLAX_BROWSER_EXECUTABLE` to an existing isolated-compatible Chromium executable. Browser checks include desktop/mobile, native scrolling, keyboard skip link, manual/live/initial OS reduced motion, no-JavaScript content, navigation targets, overflow and page errors. No personal browser profile is used.

The [product E2E acceptance plan](docs/design/2026-10-04-product-e2e-acceptance.md) requires a fresh project and actual packaged MCP calls, real interview answers and preview approval, complete build, and a matched baseline without this package. Existing-site revamp and the other coding host are separate scenarios. A fresh chat on a shared host is not hermetic isolation; inherited configuration must be disclosed.

See [verification report](docs/verification/report.md) for actual evidence and limitations. Host manifest/discovery checks are separate from a full model-driven website session. Runway authentication is separate from a paid generation result. Physical-device checks and production-network performance require their own evidence.

CI repeats local checks, package smoke and browser checks. Security workflow audits dependencies and checks package boundaries. CodeQL/secret-scanning service eligibility depends on private-repo account features; configuration is not a passed scan. Dependabot updates npm and GitHub Actions weekly. The release workflow prepares reviewed artifacts and never publishes automatically.

## Troubleshooting

- **Output exists:** choose a new preview/handoff filename. Tools preserve existing files.
- **Schema rejected:** start from the shipped project template, use exactly three concepts and valid section/action ids. Remove unknown fields/secrets.
- **Approval missing/stale:** review the regenerated preview, record a real human decision and matching metadata. Never fabricate approval to bypass the gate.
- **CLI not found:** source execution uses `node dist/cli.js`; permanent installation needs npm global installation and correct host PATH.
- **Runway unavailable:** continue with placeholders/imports. Check actual connection/model availability; never auto-upgrade or retry paid generation.
- **Browser executable missing:** install Playwright Chromium or point the environment variable at an existing executable.
- **Private badges unavailable:** authenticate on GitHub and inspect Actions directly. Do not infer a passed run from a badge cache.

## Knowledge sources and license

Original summaries and transferable design guidance: [Justinmind](https://www.justinmind.com/web-design/parallax-effect-website-examples), [Elementor](https://elementor.com/blog/parallax-effects/), [Builder.io](https://www.builder.io/blog/parallax-scrolling-effect), [Crocoblock](https://crocoblock.com/blog/parallax-effects-best-practices-and-examples/). Full articles are not redistributed. Reference claims and provider capabilities have checked dates and must be reverified when needed.

Code and original documentation: [MIT](LICENSE), provided without warranty. Third-party services, reference content, trademarks and media retain their own terms and rights. This project is not affiliated with Codex, Claude, Runway or other named providers. Users review generated copy, asset rights and provider costs before publication. Report vulnerabilities privately using [security guidance](SECURITY.md).
