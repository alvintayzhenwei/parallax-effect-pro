# Continuous Motion Storytelling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking. Read the approved specification and inspect the working tree before changing code.

**Goal:** Let coding agents author and preview continuous motion stories through the local MCP while preserving another tool's UI/UX decisions.

**Architecture:** Version 2 separates chapters, stages, persistent actors and keyframed tracks. A pure evaluator drives both the packaged preview and exported integration runtime. The host retains website design ownership and approves a composite preview when integrating motion into an existing UI.

**Tech Stack:** Existing TypeScript, Zod, MCP SDK and Node test runner; DOM/CSS for 2D; Three.js for 3D; esbuild for a local browser bundle; existing Playwright browser verification. Resolve and pin Three.js, its matching types and esbuild during dependency installation, then query Context7 for the installed versions. No CDN or second animation library.

**Spec:** `docs/superpowers/specs/2026-10-04-continuous-motion-design.md`.

## Global Constraints

- Local CLI and stdio MCP; four existing entry points; no hosted server or provider proxy.
- Preserve version 1 records and historical approvals; no implicit migration.
- Other UI/UX tools own layout, typography, palette, components and forms. Mount only scoped motion content.
- No global CSS reset, scroll override, arbitrary executable JSON expressions or automatic framework migration.
- Retain bounded reads, containment, symlink refusal, exclusive outputs and exact digest approval.
- No paid media, publishing, merging, account changes or npm release through this plan.
- Owner visual acceptance remains required. Both prior coastal outputs failed that gate.

## Review Focus

1. Direct seek and reverse scroll produce the same pose as forward traversal: Task 2.
2. A UI-owned reading region remains protected when the viewport changes: Tasks 1 and 4.
3. Model or texture references cannot fetch externally or escape the project: Task 3.
4. Changed UI context, assets or composite preview cannot retain stale approval: Task 5.
5. Multiple mounts and teardown do not alter host styles, scrolling or unrelated components: Tasks 4 and 6.

## Working-tree boundary

The feature branch contains uncommitted previous preview improvements, documentation and test evidence. Identify those changes before execution; do not discard them or include them accidentally in a new task commit. Save the approved prerequisite implementation as a clearly labelled checkpoint before adding version 2. Reuse the existing managed checkout unless isolation is needed; never copy test fixtures with approvals into a customer's project.

## Files and public contracts

Keep `src/records.ts` as the version-dispatch entry point; add `src/story-records.ts` for the strict version 2 shape. Keep existing version 1 rendering in `src/preview.ts`; add `src/story-preview.ts` for version 2. Add `src/timeline.ts` for pure evaluation, `src/story-assets.ts` for asset loading/validation, and `src/browser/motion-runtime.ts` for mounting/rendering. Extend `src/project.ts` and `src/mcp.ts` without duplicating security or guidance logic.

Canonical contracts:

- `StoryRecord`: `schemaVersion: 2`, existing brief/concept decision, `designContext`, `assets`, `chapters`, `stages`, `actors`, `beats`, `tracks`, `fallbackViews`, optional `preview`, `integrationPreview` and `approval`.
- `ProjectRecord = LegacyProjectRecord | StoryRecord`.
- `evaluateStage(story: StoryRecord, stageId: string, progress: number): StagePose` in `src/timeline.ts`.
- `loadStoryAssets(root: string, story: StoryRecord): Promise<LoadedAsset[]>` in `src/story-assets.ts`; each result includes ID, type, verified bytes and digest.
- `createStoryPreview(root: string, recordPath: string, outputPath: string): Promise<PreviewResult>` in `src/story-preview.ts`; retain `path`, `revision`, `digest`, with additive stage-artifact metadata.
- `mountMotionStage(element: HTMLElement, story: StoryRecord, stageId: string, assets: RuntimeAsset[]): MotionHandle` in the browser runtime. `MotionHandle` provides `seek(progress: number): void` and `dispose(): void`.

Define shared types in `src/story-records.ts`: `StagePose = { actors: Record<string, NumericPose>; camera: NumericPose; lights: Record<string, NumericPose> }`, where `NumericPose` is a partial record of the declared numeric channel names. `LoadedAsset = { id: string; type: 'raster' | 'glb'; bytes: Buffer; digest: string }` is server-only. `RuntimeAsset = { id: string; type: 'raster' | 'glb'; data: string; digest: string }` uses base64 data in the browser. `PreviewResult = { path: string; revision: string; digest: string; artifacts?: Array<{ path: string; digest: string; role: 'stage' | 'runtime' | 'data' }> }`. Keep server-only Buffer types out of browser exports.

Track targets use tagged actor/camera/light IDs. Properties are typed numeric channels: position axes, scale axes, unwrapped rotation axes in degrees, opacity, camera field of view and light intensity. Camera look-at and spotlight target positions use declared position channels. Validate properties against target type. Actor parentage is fixed during playback; disassembly changes local transforms rather than reparents nodes.

## Task 1: Versioned story records and prerequisite checkpoint

**Files:** `src/records.ts`, new `src/story-records.ts`, `src/project.ts`, new `tests/story-records.test.ts`, new `tests/fixtures/story.json`.

- [ ] Record the current prerequisite changes, run existing checks and make a scoped prerequisite checkpoint. Label existing failed visual acceptance honestly.
- [ ] Write failing schema tests: version 1 still parses; version 2 accepts one actor spanning three chapters; duplicate IDs, cyclic parents, missing references, invalid target properties, nonfinite values and escaping paths fail.
- [ ] Run `node --experimental-strip-types --test tests/story-records.test.ts`; verify the new schema tests fail before implementation.
- [ ] Implement strict tagged records and version dispatch. Use ordered stage chapter IDs, normalized beat/keyframe progress in `[0,1]`, stage-relative 2D coordinates, 3D scene units, positive scale, opacity in `[0,1]`, and finite numeric channels. Define static fallback content, reading rectangles and responsive stage allocation as data. Cap stages at 8, chapters at 32, actors at 128, beats at 128, assets at 64, tracks at 512 and keyframes per track at 64. Keep the JSON record read cap at 1 MiB. Document these implementation limits and test each cap plus one; they are not aesthetic or performance guarantees.
- [ ] Extend project validation to dispatch by version without changing legacy interpretation. Check exclusive stage ownership of chapters and actors and contiguous chapter spans. Define `StagePose` as actor numeric poses plus camera/light poses using the same declared property names.
- [ ] Run the new tests and `npm run check`; verify legacy security/approval regressions pass. Commit only this task's changes.

## Task 2: Pure, reversible timeline evaluator

**Files:** new `src/timeline.ts`, new `tests/timeline.test.ts`, `src/story-records.ts`.

- [ ] Add failing tests: progress `0`, `0.5`, `1`; forward/reverse/direct-seek equality; midpoint of a `0` to `360` rotation equals `180`; missing channels retain initial values; isolated part returns exactly to its assembled pose.
- [ ] Test simultaneous tracks on different targets, overlapping beat descriptions, conflicting overlapping writes to one property, adjacent tracks sharing a boundary, progress clamping and nonfinite progress refusal.
- [ ] Run the focused tests and verify failure.
- [ ] Implement `evaluateStage`. Interpolate ordered keyframes from authored initial poses, with `linear` and `smoothstep` easing only. Hold first/last values outside a track's interval. Reject overlapping writes to the same target/property. Adjacent writes require equal shared-boundary values. Do not accumulate deltas or depend on event history.
- [ ] Run focused tests and full checks. Commit the evaluator independently of any browser renderer.

## Task 3: Contained assets and revision binding

**Files:** new `src/story-assets.ts`, `src/project.ts`, new `tests/story-assets.test.ts`, `tests/project.test.ts`.

- [ ] Add failing tests for accepted PNG/JPEG/WebP and self-contained GLB, MIME/signature mismatch, symlink/traversal, oversized input, external GLB buffer/image URIs, unsupported extensions and stale expected digests.
- [ ] Run focused tests and verify failure.
- [ ] Implement `loadStoryAssets` using existing `readContained`. Cap each imported asset at 5 MiB and total imported bytes at 16 MiB. Validate GLB header/chunk bounds and JSON references before renderer loading; first version refuses extensions and requires embedded buffers/images. Imported arbitrary SVG is refused initially; original vector geometry is typed primitive data, not XML strings.
- [ ] Bind verified asset bytes and reviewed design-context reference digests into version 2 revision calculation. Preserve existing version 1 `designRevision` behavior exactly. Test changed bytes with an unchanged path and changed context with unchanged tracks.
- [ ] Define procedural proxy actors as bounded box/cylinder/plane primitives with authored colors/material parameters. Permit original conceptual product groups without imported assets. Refuse arbitrary code, URLs or material shader text.
- [ ] Run focused/full checks and commit. Asset caps are implementation limits, not performance guarantees.

## Task 4: Persistent stage runtime and actual MCP preview

**Files:** new `src/browser/motion-runtime.ts`, new `src/story-preview.ts`, `src/preview.ts`, new `assets/story-preview.css`, `package.json`, lockfile, build configuration, new `tests/story-preview.test.ts`, `scripts/verify-browser.mjs`.

- [ ] Add failing preview tests for strict escaping, stage-spanning chapters, accessible review controls, clean playback, sequential static content and no external asset/script references.
- [ ] Add browser assertions for stable actor identity before/after a chapter boundary; direct seek/reverse equality; actual 3D rotations; and independently changing spotlight intensity/target. Check two mounts and disposal without changing host body styles or scroll behavior.
- [ ] Resolve/pin dependencies and retrieve matching Context7 APIs. Bundle the browser entry and the shared evaluator locally with esbuild; keep the Node CLI build separate. Add output paths to the exact release allowlist.
- [ ] Implement `mountMotionStage`: scoped DOM stage for 2D; one persistent Three.js scene/group per 3D stage. Build declared primitives or load verified embedded GLB data, resolve named parts, apply `StagePose`, update camera/lights and release owned resources on dispose. Unsupported/missing part names fail visibly. No implicit scene reset per chapter.
- [ ] Implement `createStoryPreview` and version dispatch through existing `parallax_create_preview`. Embed verified runtime/record/assets into a contained HTML artifact with restrictive CSP. Refuse a generated preview above 24 MiB; retain the legacy 5 MiB approval-read cap for version 1 and a 24 MiB cap for version 2.
- [ ] Validate records/assets and generated size before writing. Preserve exclusive output creation. On multi-artifact failure, report incomplete output instead of success; never overwrite or delete pre-existing user files. Test a collision and interrupted artifact export.
- [ ] Native scroll evaluates progress from stage bounds; review seek controls use the same evaluator. Render only on needed updates. On reduced motion, no-WebGL or failed initialization, show complete chapter explanations and declared poster/diagram fallback. Label conceptual diagrams honestly.
- [ ] Verify desktop/mobile allocation and reading regions at sampled poses. Flag observed collisions/clipping for review; do not claim an automatic aesthetic guarantee. Capture key poses and transition frames.
- [ ] Run focused/full/browser checks and commit. Passing this task establishes a working motion-stage proof, not a complete site's visual acceptance.

## Task 5: Composite approval and interoperable handoff

**Files:** `src/project.ts`, `src/mcp.ts`, `src/records.ts`, `src/story-records.ts`, `tests/project.test.ts`, `tests/mcp.test.ts`, canonical handoff/approval templates.

- [ ] Write failing tests for motion-only approval, integration approval with both artifact digests, stale context/assets/composite bytes, missing human evidence, and refusal to describe motion-only approval as approved full-site UI.
- [ ] Run focused tests and verify failure.
- [ ] Preserve version 1 approval scope. Version 2 uses explicit `motion` or `integration` scope. Integration requires a contained host-authored composite preview and matching stage/context digests. Validate saved bytes without executing imported HTML inside MCP.
- [ ] Export authored timeline data, verified assets and locally bundled runtime through the existing handoff operation: keep `outputPath` as the Markdown handoff path and create an adjacent, exclusive `<handoff-basename>.motion/` directory for version 2 artifacts. Version 1 output behavior stays unchanged. Provide the approved scope, mount/seek/dispose contract, reading-zone conflicts, host framework integration notes and pending checks. Never overwrite existing host files or report a partial export as complete.
- [ ] Integration guidance lets Impeccable, frontend-design or another tool create the UI shell and retain ownership. The host mounts exported motion into that shell and regenerates composite review whenever the approved experience changes.
- [ ] Run real SDK tool calls against both record versions and existing security cases; run full checks; commit.

## Task 6: Creative guidance, camera storyboard and packaging

**Files:** canonical `skills/parallax-effect-pro/SKILL.md`, relevant references/templates, new `templates/story.json`, `src/mcp.ts` fixed template mapping, `scripts/validate-package.mjs`, `scripts/smoke-package.mjs`, browser verifier, README and installation docs.

- [ ] Add tests showing phase guidance serves version 2 templates through fixed packaged paths and that an installed tarball creates/validates a story preview without source checkout access.
- [ ] Update discovery questions and concept comparison around subject, discovery, reveal, climax and visitor action. Explicitly allow any collaborating UI/UX tools; remove exclusive full-site-design ownership from the canonical workflow. Keep lightweight standalone proposals available.
- [ ] Author the fictional camera as record data: original body/casing/lens/sensor actors, seven storyboard beats and authored camera/light tracks. Create its proof only through the actual stdio MCP. No hardcoded camera-only animation in the renderer.
- [ ] Export and mount it in a shell authored by a cooperating UI/UX tool. Verify preserved shell typography/components and untouched unrelated UI. Test a separate generic 2D narrative to show the runtime is not limited to camera teardown.
- [ ] Verify full rotation, opening, lens isolation/return, sensor focus, reassembly and final stable action. Inspect reverse transitions and mobile/static alternatives; record all limitations and owner feedback.
- [ ] Run `npm run check`, installed-tarball smoke and browser verifier. Inspect release file allowlist and dependency audit, record results, refresh screenshots and commit. No npm publication or deployment.

## Task 7: Isolated acceptance and final review

**Files:** new dated verification report and evidence artifacts under `docs/verification/` and `docs/screenshots/`; no test fixture approvals copied into customer records.

- [ ] Freeze a tarball and record its digest/version/host/model/settings. Start the owner-authorized fresh chat outside the development checkout with only the installed package, chosen UI/UX tool and customer inputs. Disclose global host preferences and any transport bridge.
- [ ] Observe actual discovery, three distinct narratives, MCP preview, requested adjustment, exact human approval and handoff. The owner answers material questions and approves the actual revision; orchestration cannot invent those decisions.
- [ ] Build the integrated site from the handoff and independently verify desktop/mobile, keyboard, actor continuity, chapter transitions, reduced motion, no-WebGL/no-JavaScript, errors, clipping and unchanged host design boundaries.
- [ ] Run an existing-site integration fixture and a Claude workflow before claiming those capabilities. If a host or connection is unavailable, report that acceptance pending rather than passed.
- [ ] Run a matched baseline with the same subject, assets, brief and model settings but no package. Show neutral-labelled outputs and seek the owner's creative verdict. A vote of neither fails the quality gate; do not substitute a mechanical score.
- [ ] Execute one independent whole-branch review, address material findings, rerun affected checks and document final evidence. Keep the release in draft until required acceptance succeeds. Prepare private GitHub changes for review; do not merge, publish or deploy.

## Self-review and execution choice

Spec requirements map to Tasks 1–7: interoperability and contextual approval to Tasks 5–7; assets/providers to Tasks 3 and 6; persistent/runtime choreography to Tasks 1, 2 and 4; creative proof to Task 6; real host and visual acceptance to Task 7. The five review-focus conditions each have a named test/task. Preview and integration contracts use the same record/evaluator/runtime names throughout.

Recommended execution: **Native**, implementing sequentially in this chat with one independent whole-branch review. The tasks depend heavily on shared record/runtime interfaces, so parallel writers would add integration risk. The owner must review this plan and confirm the execution method before implementation. User-input and asset/account availability are acceptance dependencies, not permission to invent successful results.
