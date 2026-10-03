# Parallax Effect Pro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a local, npm-ready skill/plugin and stdio MCP package that guides users from ideas through approved motion previews to complete websites.

**Architecture:** Shared TypeScript operations serve the CLI and stdio MCP adapter. A canonical Markdown skill directs the host agent's discovery, Runway MCP calls, website implementation, review, and deployment. Self-contained local HTML previews require no hosted service.

**Tech Stack:** Node.js 24 LTS, TypeScript ESM, stable MCP TypeScript SDK v1.x, Zod, HTML/CSS/browser JavaScript, Node's built-in test runner; browser verification uses available host tooling.

**Spec:** `docs/superpowers/specs/2026-10-03-parallax-effect-pro-design.md` (approved).

## Global Constraints

- TypeScript implements the CLI and local stdio MCP tools. Markdown carries portable workflow instructions and domain knowledge. HTML/CSS and small browser scripts power previews.
- There is no hosted backend and no HTTP MCP service. The local MCP process communicates through stdio.
- Runway is optional. Placeholders, existing assets, and manual generation/import remain available.
- Our MCP does not proxy or embed Runway MCP.
- Keep GitHub private during development. Do not publish npm packages or deploy generated sites without the respective explicit approval.
- Production implementation and paid asset generation require approval of both layout and motion.
- No generic shell execution, arbitrary URL proxy, credential store, autonomous paid generator, or deployment engine is exposed by our MCP.
- MCP stdout contains only protocol messages; diagnostics use stderr with secrets redacted.
- Preserve an existing website's stack. Select the simplest suitable stack for new sites.
- Use Node >=24 for v1 tooling; lock compatible dependency versions after registry verification. No runtime browser framework or video-provider SDK.

## Review Focus

1. Tampered/stale approval or changed preview files: reject approved handoff and explain required renewed approval (Task 1).
2. Path traversal, symlink escape, and existing output: refuse unsafe writes and preserve user files (Task 1).
3. Malicious user copy/reference strings: render as inert text, never execute scripts (Task 2).
4. Reduced motion enabled before or during preview: stop decorative movement without hiding content (Task 2).
5. Missing Runway tools or failed generation: keep workflow usable, require approval for paid retries (Task 4).

## File map and shared interfaces

| Files | Responsibility |
| --- | --- |
| `src/records.ts`, `src/project.ts` | Record schemas, revisions, bounded reads/writes and approval validation |
| `src/preview.ts`, `assets/preview.css`, `assets/preview.js` | Safe self-contained preview generation and browser behavior |
| `src/cli.ts`, `src/mcp.ts` | Command parsing and stdio tool registration |
| `skills/parallax-effect-pro/SKILL.md`, `references/`, `templates/` under that skill | Canonical workflow, knowledge and reusable artifacts |
| `scripts/package-plugins.mjs`, `scripts/validate-package.mjs` | Host wrappers and release allowlist checks |
| `plugins/` (generated, ignored) | Codex and Claude packages from the canonical skill |
| `examples/studio/` | Fictional complete site plus example records and review evidence |
| `tests/*.test.ts` | Behavior checks using temporary projects and fixtures |
| `README.md`, `SECURITY.md`, `LICENSE`, `docs/screenshots/` | User guide, security reporting, licensing and actual preview screenshots |
| `.github/workflows/`, `.github/dependabot.yml` | CI, security checks and approval-controlled release preparation |

Keep implementation files only where needed; do not add a generalized orchestration framework.

### Record contract

Use strict Zod schemas, a version field `schemaVersion: 1`, bounded strings, and a 1 MiB JSON input limit. Export inferred `ProjectRecord`, `MotionPlan`, `ApprovalRecord`, and `ValidationReport` types from `src/records.ts`.

`ProjectRecord` fields: `schemaVersion`, `brief` (goal, audience, primaryAction, startingPoint, assumptions), `concepts` (exactly three objects with id/title/story/sections/effects/assetNeeds/mobile/reducedMotion/effort), `selectedConceptId`, `motionPlan`, `preview` (optional revision/file/fileDigest), `approval` (optional), `assetPlan`, `qualityReport` (optional). Each concept's effort is `low|medium|high`.

`MotionPlan` contains `sections` (id/title/copy/action), `scenes` (sectionId/effect/layers), `mobileBehavior`, and `reducedMotionBehavior`. Core effect names: `layered-depth|background-drift|pointer-depth|sticky-reveal`. Each layer has id/label/depth/direction/travel; depth is `background|midground|foreground`, direction `vertical|horizontal`, travel is normalized within [-1,1]. Advanced plans may use `video-scrub|three-dimensional`; previews show clearly labeled storyboards rather than pretend to render unavailable media or 3D assets.

`ApprovalRecord` fields: `revision`, `previewDigest`, `scope: ["layout","motion"]`, `decision: "approved"`, `source: "human-message"`, `evidence` (nonempty quoted decision/reference), `approvedAt` (ISO timestamp). This is an auditable workflow record, not authenticated proof. The skill may populate it only from an actual user decision; MCP does not expose an approval-granting tool.

Revision is SHA-256 of canonical serialized selected concept and motion plan. Also verify the preview file digest at handoff, preventing edited previews from silently reusing approval. Quality outcomes are `passed|failed|not-run`, with critical flag, evidence and environment. Report records never substitute for executed checks.

### Public operations

All paths below are contained relative paths beneath an existing, absolute project root explicitly selected by the user/host configuration. MCP starts with `mcp --root <absolute-path>`; tool inputs cannot change root. Reject symlinks on every traversed component and reject overwrites. State reads do not modify files. Fail with concise actionable errors; return no raw secret-bearing records in diagnostics.

- `readProject(root: string, recordPath: string): Promise<ProjectRecord>`
- `designRevision(project: ProjectRecord): string`
- `writeContained(root: string, relativePath: string, data: string): Promise<string>` (exclusive creation)
- `createPreview(root: string, recordPath: string, outputPath: string): Promise<{path: string; revision: string; digest: string}>`
- `validateProject(root: string, recordPath: string): Promise<ValidationReport>` where report has `valid`, `issues`, `revision`, `approvalStatus: "missing"|"stale"|"recorded"`.
- `exportHandoff(root: string, recordPath: string, outputPath: string): Promise<{path: string; revision: string}>` requires matching recorded approval and preview digest.

Preview generation returns metadata; host explicitly updates project record to reference that exact preview. No implicit approval or destructive record update.

## Task 1: Validated project records and bounded storage

**Create:** `package.json`, `package-lock.json`, `tsconfig.json`, `.gitignore`, `src/records.ts`, `src/project.ts`, `tests/project.test.ts`, `tests/fixtures/project.json`.
**Interfaces:** Produces record types, `readProject`, `designRevision`, `writeContained`, `validateProject`, and `exportHandoff` defined above.

- [ ] Write failing Node tests: `validProject`, `threeConceptsRequired`, `staleMotionApproval`, `editedPreviewInvalidatesApproval`, `rejectTraversal`, `rejectSymlink`, `preserveExistingFile`, `rejectOversizeRecord`. Assert malformed records fail; valid matching approval can export; changing a scene travel value or preview bytes blocks export; outside files are unchanged.
- [ ] Bootstrap only configuration required to run tests. Scripts: `build` runs `tsc`; `typecheck` runs `tsc --noEmit`; `test` runs built tests with `node --test`; `check` runs typecheck, build, tests and package validation. Keep test output separate from published `dist/`.
- [ ] Run `npm run build` and the project test file. Confirm expected missing implementation/schema failures, not unrelated setup errors.
- [ ] Implement strict schemas and root/path checks with Node filesystem/crypto APIs. Canonicalize object key order before hashing. Generate handoff Markdown with approved sections, motion map, asset plan, recorded decision and outstanding checks. A failed critical quality check labels deployment blocked; not-run checks stay unverified.
- [ ] Rerun tests and typecheck. Confirm fixtures include no real personal/business data or credentials.
- [ ] Commit `feat: validate project records and approved handoffs`.

## Task 2: Animated wireframe and provider choices

**Create:** `src/preview.ts`, `assets/preview.css`, `assets/preview.js`, `tests/preview.test.ts`.
**Consumes:** Task 1 record types, `readProject`, `designRevision`, `writeContained`.
**Produces:** `createPreview` as defined above; one self-contained HTML output embedding trusted bundled styles/script and escaped project content.

- [ ] Write failing tests `escapeUserMarkup`, `renderMotionMap`, `showAdvancedStoryboard`, `noNetworkAssets`, `previewDigestMatchesBytes`. Inject `</script><script>` and event-handler markup into copy; assert it appears only escaped as text. Check advanced effects are labeled as storyboard placeholders and every scene maps to a section.
- [ ] Run preview tests and confirm missing renderer failures.
- [ ] Implement grayscale sections with stable copy/CTAs, layered placeholders, motion-map panel, effect/intensity controls, desktop/mobile width controls and reduced-motion toggle. Include provider cards for Runway connected/manual workflow and manual Higgsfield/Seedance, Luma options; never claim connection from a local card.
- [ ] Implement native scrolling with bounded transforms, one scheduled animation update, scene visibility gating and resize handling. Pointer depth is decorative and disabled on coarse pointer/reduced motion. OS reduced-motion changes take effect live and override requests to enable motion; disable nonessential movement and retain content.
- [ ] Run unit checks. Inspect generated preview through available browser tooling at 1280x800 and 390x844; check real scroll positions, keyboard controls, no horizontal overflow, OS/manual reduced motion and no-JavaScript content. Save executed evidence. If host cannot load file URLs, use a temporary loopback static server serving only preview directory, then stop it.
- [ ] Commit `feat: generate interactive motion wireframes`.

## Task 3: CLI and stdio MCP

**Create:** `src/cli.ts`, `src/mcp.ts`, `tests/cli.test.ts`, `tests/mcp.test.ts`.
**Consumes:** Tasks 1–2 public operations.
**Produces:** npm binary `parallax-effect-pro`; commands `preview --root --record --output`, `validate --root --record`, `handoff --root --record --output`, `doctor`, and `mcp --root`.

MCP names: `parallax_create_preview` input `{recordPath, outputPath}`, `parallax_validate_project` input `{recordPath}`, `parallax_export_handoff` input `{recordPath, outputPath}`. JSON Schema disallows extra properties; all path strings are nonempty and bounded. Return structured results plus concise text. Invalid operations return MCP tool errors; no generic command tool. CLI exit codes: 0 success, 1 operation/validation failure, 2 usage error. `doctor` checks local runtime/bundled assets only; reports host and Runway readiness as unverified.

- [ ] Write failing tests for CLI help/usage, missing root, valid preview, stale handoff and doctor not claiming Runway authentication.
- [ ] Write a stdio SDK client integration test that launches built MCP, lists exactly three tools, calls valid preview/validation and rejected traversal, and shuts down cleanly. Assert protocol parsing succeeds without stdout diagnostics.
- [ ] Confirm failures with `npm test` after building.
- [ ] Implement shared operation wrappers using Node `parseArgs`, SDK `McpServer.registerTool`, Zod and `StdioServerTransport`. Keep logs on stderr and avoid echoing untrusted records. Handle termination without persistent child processes.
- [ ] Rerun tests/typecheck and exercise the binary from a path containing spaces.
- [ ] Commit `feat: expose local CLI and stdio MCP tools`.

## Task 4: Canonical skill, knowledge and Runway orchestration

**Create:** `skills/parallax-effect-pro/SKILL.md`, `skills/parallax-effect-pro/references/{theory,effects,providers,implementation,quality-deployment}.md`, `skills/parallax-effect-pro/templates/{project.json,concepts.md,approval.md,assets.md,quality-report.md,handoff.md}`, `tests/skill.test.ts`.
**Consumes:** Tool names/record contract from Tasks 1–3.
**Produces:** Host-independent instructions that describe the approved seven-stage workflow and correctly invoke local tools and separately connected Runway tools.

- [ ] Add validation test asserting template project parses through Task 1 schemas, every referenced file exists, all three local tool names match registration, and frontmatter name matches directory. Do not use prose keyword tests as proof of agent behavior.
- [ ] Run test to confirm absent templates/references fail.
- [ ] Write concise, progressively disclosed instructions: accept any starting point; ask material questions individually; produce three concepts; preview; obtain revision-specific approval; plan assets; build full site; execute quality checks; approve deployment. Load only phase-relevant references for token efficiency.
- [ ] Synthesize all four articles in original prose, with attribution and source-specific heuristics clearly labeled. Cover taxonomy, examples, tradeoffs, layering, mobile/readability/accessibility, advanced media/3D decisions and when to skip parallax. Verify implementation claims against official platform docs/Context7 before use.
- [ ] Document Runway generation MCP connection, actual tool discovery/authentication, credit disclosure, paid-run approval, status/error handling, no automatic paid retries, and asset review/import. Do not hard-code unsupported cancellation or cost capabilities. Refresh provider capability sources and checked dates. Keep manual prompts/settings/import instructions for other providers.
- [ ] Run two scenario walkthroughs: disconnected Runway reaches approved preview without generation; failed/absent generation tools preserve progress and ask approval before a paid retry. Record walkthroughs as workflow evaluation, separate from paid live generation. Test fake approval/stale revisions cannot bypass local handoff validation.
- [ ] Commit `feat: add guided parallax skill and provider workflow`.

## Task 5: npm tarball and host plugin packages

**Create:** `scripts/package-plugins.mjs`, `scripts/validate-package.mjs`, `tests/package.test.ts`, `docs/installation.md`.
**Modify:** `package.json`, `.gitignore`.
**Consumes:** Canonical skill, compiled CLI/MCP, assets.
**Produces:** Allowlisted npm tarball and generated host plugin directories/archives with synchronized name/version and one canonical skill.

- [ ] Write failing package checks: missing preview asset fails validation; secret-like/unrelated fixture files cannot enter tarball; both host wrappers contain complete skill references and valid manifests; staged binary works without source checkout.
- [ ] Run checks and confirm missing packager failures.
- [ ] Implement explicit file allowlist for `dist/` runtime, `assets/`, `skills/`, README and license. Generate Codex/Claude compatibility manifests from current official host documentation, not guessed shared schemas. Resolve packaged local stdio launch paths without absolute developer-machine paths. Do not auto-install globally or alter user config.
- [ ] Verify npm name availability; use `parallax-effect-pro` if available, otherwise present a scoped candidate before release. Registry availability does not prove ownership. Document unpublished local-tarball installation until registry release; do not imply `npx` registry install already works.
- [ ] Run `npm pack`, install tarball in a temporary directory and test CLI plus MCP client without repo paths. Verify execution using npm exec/local install; test persistent global install only in an isolated prefix. Exercise Codex and Claude Code skill discovery and tool calls separately using temporary configuration where supported. Report unavailable hosts as pending.
- [ ] Commit `build: package portable skill and coding agent integrations`.

## Task 6: Complete example, screenshots and user guide

**Create:** `examples/studio/{index.html,styles.css,script.js,project.json,quality-report.md}`, `docs/screenshots/{wireframe-desktop,wireframe-mobile,example-site}.png`, `README.md`, `SECURITY.md`, `LICENSE`.
**Consumes:** Canonical workflow and tested preview tools.
**Produces:** Fictional complete studio website and documented end-to-end fixture journey; no paid media required.

- [ ] Define fixture goal and three distinct concepts, selected approved motion plan and clearly labeled synthetic approval for tests. Never present fixture approval as a real user's decision. Keep demo text fictional, with no fabricated testimonials/results.
- [ ] Use CLI to generate preview and validate/export fixture; verify output before implementing complete example as a fixture demonstration. Distinguish test fixture approvals from approval for a real user website.
- [ ] Build static complete example with core motion, real in-page navigation, content and CTA destination appropriate to a fictional demo. Inspect desktop/mobile/keyboard/reduced-motion behavior and browser console; report measured loading/motion limitations and critical outcomes.
- [ ] Capture actual preview/example screenshots. Write normal-prose README with install prerequisites, temporary vs persistent execution, setup/example workflow, Runway MCP and manual fallback, approval/revision handling, troubleshooting, compatibility evidence and release boundaries. Add no unexecuted success claims.
- [ ] Add MIT license, third-party/media/service disclaimer and security reporting instructions suitable for private-repo development.
- [ ] Commit `docs: demonstrate complete parallax workflow and installation`.

## Task 7: CI, security and private-repository release preparation

**Create:** `.github/workflows/{ci,security,release}.yml`, `.github/dependabot.yml`, `docs/releasing.md`.
**Modify:** `README.md` badges.
**Consumes:** `npm run check`, package validators and tarball smoke checks.
**Produces:** Real workflow definitions, honest badges, and a release dry-run artifact; no npm publication in this task.

- [ ] Configure CI on push/PR: locked install, typecheck/build/tests, tarball/plugin validation and isolated package smoke. Pin action versions/SHAs after official verification; use read-only default token permissions.
- [ ] Configure weekly npm and GitHub Actions Dependabot updates. Add dependency audit and available security analysis; verify private-repo CodeQL/secret-scanning eligibility before claiming scans enabled. If unavailable, document limitation and retain runnable local/dependency checks.
- [ ] Prepare manual release workflow with dry-run default, exact version/ref, repeatable checks and uploaded tarball. Publishing must require explicit release approval and correctly configured protection, never a push trigger. Before adding an enabled publish path, verify registry ownership, trusted-publisher configuration and GitHub environment protection; if enforcement is unavailable, keep workflow artifact-only until separately authorized release setup.
- [ ] Check npm trusted-publishing requirements for the private repo. Report bootstrap/token and provenance constraints; do not request credentials in chat or silently make repo public. Use pinned package version in release instructions and real workflow URLs in badges; private badges may require authentication.
- [ ] Run complete local checks once; push source to requested private GitHub repository, verify remote visibility remains private and inspect CI result at pushed SHA. Do not equate source push with deployment/publication. Resolve CI failures or report account/feature blockers accurately.
- [ ] Commit `ci: prepare private development checks and approved release flow`.

## Final acceptance and execution handoff

- [ ] Map spec acceptance items to executed evidence: record/path safety (Task 1), browser preview (Task 2), CLI/stdio (Task 3), knowledge/Runway scenarios (Task 4), tarball/hosts (Task 5), complete example/screenshots (Task 6), CI/release boundaries (Task 7).
- [ ] Conduct whole-branch review focused on approval honesty, file safety, reduced motion, package portability and no accidental cloud/public actions; fix findings and rerun only affected checks.
- [ ] Report completed, pending and externally blocked checks separately. Paid live Runway smoke, npm publication, public directory submission, repository visibility changes and website deployment remain outside approval for implementing this plan.

Recommend **native execution with one independent final reviewer**: operations share a small set of interfaces, and per-task delegation adds context overhead. Subagent-driven execution remains an option if the user prefers independent review after each task. Implementation begins only after plan review and execution-method selection.

## Documentation basis

- Context7 resolved `/modelcontextprotocol/typescript-sdk/v1.29.0` on 2026-10-03; confirmed `McpServer.registerTool`, Zod input validation, `StdioServerTransport` and stdio client testing. Verify installable stable version at execution.
- MCP SDK source: https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.29.0
- Runway generation connection: https://github.com/runwayml/runway-mcp-plugin
- npm trusted publishing: https://docs.npmjs.com/trusted-publishers/
- Host plugin manifests and GitHub account features must be verified against current official documentation and actual available hosts during their respective tasks.
