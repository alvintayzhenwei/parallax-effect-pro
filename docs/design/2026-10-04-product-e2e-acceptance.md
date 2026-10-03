# Parallax Effect Pro: corrected product acceptance

Status: acceptance plan, not executed end-to-end evidence.

## Objective confirmed by the owner

Any user should be able to start a website or revamp an existing website using Codex or Claude with Parallax Effect Pro. The package should lead a clear requirements conversation and materially improve the resulting parallax experience. A custom demonstration created with ordinary coding-agent tools does not prove that result.

## Evidence correction

The new three-direction preview was written directly by a coding agent. It did not originate from `parallax_create_preview` and is exploratory visual evidence only. Prior MCP tests prove transport, schemas, contained files, preview creation and approval-gated handoff. Browser tests prove specific runtime behaviors. Neither proves the host agent follows the complete workflow or produces superior design.

Today the MCP has only preview, validation and handoff tools. Workflow knowledge lives in the portable skill. Distinguish bare-MCP capability from installed skill-plus-MCP capability in documentation and tests. Neither may be presented as automatically producing high-quality design.

## Product gaps to address before final E2E

1. Make discovery and design guidance discoverable through MCP itself, reusing canonical knowledge rather than maintaining conflicting copies. A fresh agent must know what to clarify, when to present concepts, and where approval is required.
2. Improve the real MCP preview output so core effects have distinctive, visible choreography. A bespoke showcase that bypasses the tool does not satisfy this requirement. Keep structured motion plans and approved handoffs aligned with what the preview actually shows.
3. Strengthen the build guidance and quality gate: multiple depth planes, scroll-linked composition, useful sticky progression, stable readable content, real assets or clearly explained placeholders, and mobile/static alternatives. Treat visual acceptance as separate from passing mechanical checks.
4. Add meaningful checks for the above behavior and retain the existing path, approval, protocol and packaging regressions.

## Final isolated test protocol

After the product changes and package checks, create a separate projectless chat with a fresh output directory. Use a packaged snapshot installed outside this repository, the packaged skill, and stdio MCP rooted only to the test project. Do not grant the test agent access to source, developer notes, bespoke demonstration code, or this conversation. Record host/model/version, package version and digest, configuration and tool-call evidence. Shared host configuration or globally installed skills must be disclosed; a fresh chat alone is not hermetic isolation.

Give it a normal customer brief with deliberate material gaps. Ask it to create a complete parallax website using the installed package. Observe whether it asks focused questions about audience, purpose, desired motion, content/assets and constraints. The owner answers actual interview questions and approves the exact preview; test orchestration must not invent human answers or approval.

Required evidence:

- Discovery questions and the user's actual answers.
- Three distinct concepts and their tradeoffs.
- An actual `parallax_create_preview` invocation and its saved output, revision and digest.
- An adjustment loop that changes the plan and regenerates through MCP.
- Actual revision-specific user approval, `parallax_validate_project`, and `parallax_export_handoff` calls.
- Complete website built from that handoff, with navigation/content rather than decorative fragments.
- Desktop/mobile renders and visible beginning/middle/end motion comparison.
- Keyboard, reduced-motion, no-JavaScript/static content, overflow and runtime-error checks.
- Owner visual verdict, including unresolved limitations. Passing runtime checks cannot substitute for that verdict.

Run a matched baseline in another fresh chat with the same brief, host/model settings, assets, interview answers and production-build approval. Do not install or expose Parallax Effect Pro there. Record time/tool/model usage where available without inventing token measurements. Present both outputs with neutral labels for the owner to compare visible depth, choreography, art direction, usability and requirements coverage. A single comparison provides evidence for this brief, not a universal guarantee that every project improves.

Before claiming broad compatibility, also test an existing-site revamp and the other host. Preserve the incumbent stack and working features. If only one new-site host run has occurred, label the other scenarios pending.

No paid generation, publishing, merging, account changes or deployment is required for the design-quality test. Optional Runway assets require separate paid-run approval. Deployment preparation can be reviewed locally; publishing requires destination-specific approval.

## Completion gate

The implementation stays in draft until its real MCP output is reviewed and the isolated workflow succeeds. Report unit/protocol/browser results, host-session results, visual verdict, baseline comparison, and release/deployment status separately. Failed or blocked steps remain failed or pending. No claim of "done done" follows from a bespoke example or a green CI badge.
