---
name: parallax-effect-pro
description: Brainstorm, author and preview creative continuous parallax stories, export approved motion into any UI/UX workflow, and prepare optional AI-video prompt packs.
---

# Parallax Effect Pro

Act as a motion specialist. Any UI/UX tool, including Impeccable, frontend-design or a developer's design system, may own layout, typography, palette, components, forms and navigation. Preserve those decisions; collaborate instead of replacing their instructions. Keep the existing stack and use scoped mount points.

## Workflow

1. **Discover the story.** Inspect the real project and approved assets. Ask what visitors should discover, which persistent subject anchors the experience, what relationship or reveal matters, the climax, and the desired action. Clarify audience, constraints, native scrolling, UI owner, stage allocation, reading zones and mobile/static alternatives. Ask missing material questions one at a time; propose labelled defaults for small choices. Never invent business claims or human decisions.
2. **Propose three distinct narratives.** Compare object choreography, continuous-world exploration, visual transformation or other subject-specific ideas. Explain what moves, what stays still, why the transition exists, the reveal and final action. Three intensity settings are not three concepts. Physical teardown is one example, not a universal recipe. Identify actual asset needs, effort and alternatives.
3. **Author and preview early.** Prefer `templates/story.json` (version 2) for chapters, persistent stages/actors, hierarchy, beats, camera/light tracks and static views. Replace its fictional example with the actual brief and concepts. Create the preview through `parallax_create_preview`; inspect native scroll, arbitrary seek, reverse transitions, desktop/mobile and static content. Default playback should show the experience; optional review controls explain it. A stage proof does not show or approve an unseen full-site layout. Keep exploratory controls separate from saved authored data.
4. **Adjust and obtain exact approval.** Save requested changes and regenerate with a new output name. Collect actual human-message evidence for the exact revision and preview digest. `scope: motion` approves the stage only. `scope: integration` also binds the host-authored composite and design context. No copied fixture approvals. Never equate a schema check, screenshot or mechanical score with creative acceptance.
5. **Choose assets or video prompts.** Local reviewed assets and original conceptual geometry need no provider. Offer manual provider-ready prompt packs from `templates/video-prompts.md` for Runway, Seedance, Higgsfield or another chosen service; no video MCP is required. This route works through the skill alone. Prompt-only requests may stop after discovery and concepts: drafting copyable prompts does not require an MCP preview or approval. Direct provider tools are optional and need actual capability discovery and applicable credit/cost approval. Accurate detachable product parts require structured geometry or reviewed rendered sequences; a generated movie is not geometry.
6. **Export and integrate.** `parallax_export_handoff` produces approved motion data/assets and a locally bundled runtime for version 2. Let the chosen UI/UX workflow own the shell. Mount persistent actors once, call `seek` from native progress and `dispose` on teardown. Do not import global preview styles, hijack scrolling or replace host components. Review the actual integrated site and regenerate composite approval when experience or context changes.
7. **Verify and review deployment.** Check continuity, full turns, exact part returns, selective focus, reverse/resize, reading-zone conflicts, keyboard, reduced motion, no-WebGL/no-JavaScript and asset rights. Compare meaningful key and transition poses. Ask for the owner's creative verdict. Hosting, paid generation, npm publication and deployment remain separate decisions.

## Knowledge and templates

- Discovery/concepts: [Theory](references/theory.md), [Effect choices](references/effects.md), [Concept comparison](templates/concepts.md).
- Records/runtime: [Implementation](references/implementation.md), `templates/story.json`, [Approval](templates/approval.md).
- Assets/providers: [Provider workflow](references/providers.md), [Asset plan](templates/assets.md), [Video prompt pack](templates/video-prompts.md).
- Integration/review: [Handoff](templates/handoff.md), [Quality report](templates/quality-report.md), [Quality/deployment](references/quality-deployment.md).

The four local tools return fixed packaged guidance or deterministic contained artifacts. They do not perform model inference, authenticate human identity, connect providers, or deploy. The host conducts the interview and brainstorms. Ask for approval of a concrete preview, never a blank promise.

When MCP is unavailable, discovery, concepts and copyable video prompts remain usable. The host may author a clearly labelled preview using its own tools within scope; do not claim MCP validation or package runtime evidence ran. Existing version 1 `templates/project.json` remains supported without implicit migration. Its layered recipes and advanced placeholders are historical/simple options, not the creative ceiling.

## Version 2 limits and ownership

Stage-relative 2D positions and 3D scene units are explicit. Rotation is unwrapped degrees. Parents stay fixed; tracks move parts locally. Conflicting property writes fail. Imported stage assets are reviewed PNG/JPEG/WebP and self-contained GLB; arbitrary SVG, external model references, shaders and executable expressions are refused. Video prompt guidance is available, but video playback/frame sequences belong to the host stack and are not silently accepted as stage assets.

Records are capped at 1 MiB; 8 stages, 32 chapters, 128 actors, 128 beats, 64 assets, 512 tracks and 64 keys per track. Imported assets are at most 5 MiB each and 16 MiB total; version 2 preview at most 24 MiB. These implementation bounds are not aesthetic or performance guarantees. References and asset bytes bind approval. Symlinks/traversal and overwrites are refused. Keep credentials out of records, prompts and exports.
