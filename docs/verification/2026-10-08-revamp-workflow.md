# Existing-site revamp workflow verification

Date: 2026-10-08. Scope: canonical skill, fixed MCP guidance, documentation and a runnable native-host example. No customer website, provider, deployment or global plugin configuration was changed.

## Behavior comparison

A read-only worker received the existing skill and a scenario involving a React site with a nested main scroller, an incumbent CSS-variable hook, an approved concept, an authorized local integrated preview and unavailable MCP tools. It recognized that a standalone stage did not complete the task, but could not determine whether native hooks were exempt from story records/export or how to measure the nested scroller.

A fresh read-only worker received the updated skill and the same scenario, plus concepts-only and packaged-stage approval cases. It selected the incumbent hook, required actual integrated-page evidence, stated that native effects need neither records nor package export, and respected concepts-only, paid-generation and deployment boundaries. This checks scenario reasoning; it is not a model-driven customer website implementation or owner creative acceptance.

## Executed checks

- The MCP regression failed before the change because discovery omitted the revamp reference. It passed after discovery, preview, build and review exposed the canonical reference and evidence template.
- `npm run check`: formatting, typecheck, build, all 46 tests and the 34-file release allowlist passed.
- Skill Creator's `quick_validate.py` passed using an isolated `uv` environment with PyYAML; no project dependency was added.
- `npm run smoke`: all 5 CLI/stdio tests passed from an isolated tarball install without source runtime paths.
- `npm run browser`: existing fixture/stage checks and the new revamp example passed in Chromium 153.0.8010.12. Chromium required execution outside the macOS filesystem sandbox to launch.
- The targeted example check also passed after its first assertion was strengthened to inspect the computed visual transform. It verifies nested scrolling with unchanged window scroll, reversal, content resize, initial/live reduced motion, disposal and 390 × 844 mobile emulation, with no page errors.
- Local Codex/Claude skill packages were generated in `plugins/revamp-workflow`; they have not been installed into either host. Published version 0.1.1 remains unchanged.

The first mobile example check reused the same document and failed because top-level script declarations persisted. Navigating to a fresh blank document before the mobile load fixed the test isolation; the final checks above passed.

## Documentation and limits

README and the user guide describe source-only availability and native-host integration. Canonical implementation, effect, concept, handoff and quality guidance now distinguish packaged records from native host work. Workflow lessons are attributed to Scroll World in the revamp reference; no upstream runtime was copied.

Actual customer-site revamp execution, host reload/discovery, physical-device behavior, video generation/decoding, production performance, owner visual acceptance and publication remain unverified. Existing legacy-record guidance and preview size limits were not redesigned by this change.

## Release preparation recheck — 2026-10-10

Package and lockfile metadata are synchronized at `0.1.2`. Formatting, typecheck, build, all 46 tests, the 34-file package allowlist, five isolated tarball CLI/stdio smoke tests, the complete Chromium browser suite (including the revamp example), and `npm audit --audit-level=high` passed; the audit reported zero vulnerabilities. Release plugin wrappers were generated in `plugins/release-0.1.2` and the Codex manifest version was checked. Local links in README, the guide, installation instructions, and changelog resolve.

The local Codex test plugin `0.1.2-revamp.1` was previously installed and enabled, with source/cache skill equality, MCP startup, four-tool discovery, and a harmless revamp-guidance call verified. This supersedes the earlier snapshot's uninstalled-host status; it does not establish customer-site creative acceptance. No npm publication is claimed.
