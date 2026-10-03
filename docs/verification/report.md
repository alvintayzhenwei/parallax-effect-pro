# Verification report

Checked: 2026-10-03, local macOS. This report records executed evidence and separates remaining acceptance work.

## Executed

- Strict TypeScript build and behavior tests passed (15 tests at initial package verification; final count may grow with review fixes).
- Real MCP SDK stdio client listed three tools, created a preview, validated records and refused unsafe paths/unapproved handoff. Protocol stdout parsed cleanly.
- Local tarball installed in an isolated temporary prefix; CLI doctor/preview and real stdio calls passed without source runtime paths.
- Codex CLI 0.160.0 native app-server `plugin/read` resolved the generated marketplace/package and `skills/list` discovered the canonical skill. This was a read-only test without global installation or model inference.
- Claude Code 2.1.288 passed strict plugin/component validation; `--plugin-dir ... plugin details` loaded one skill. No global configuration changed.
- Chrome 154.0.8037.93 headless checks covered 1280×800 and 390×844, actual scroll transforms, manual/initial/live OS reduced motion, keyboard skip link, navigation target existence, no horizontal overflow, and no-JavaScript content. Both wireframe and complete fictional example produced zero page/console errors. Screenshots show actual renders.
- Local file load metrics in one run: wireframe DOM content loaded 17.5 ms, load 17.6 ms; example 13.2 ms and 13.5 ms. These are file:// measurements, not production-network or physical-device performance, and do not establish frame rate.
- Runway read-only identity check authenticated the connected workspace. It exposed no video models on its free plan. No generation, trial, credit purchase or upload was performed.
- Registry lookup for `parallax-effect-pro` returned E404. This is not proof of package ownership or permission to publish.
- GitHub initially reported the empty repository public. It was made private before any source upload, matching the user's requirement. Private-repo security-service availability returned no enabled-feature detail; no CodeQL/secret-scanning pass is claimed.

## Boundaries and remaining checks

Full model-driven end-to-end site creation in both installed hosts is not inferred from manifest/discovery tests. Disconnected and failed-provider flows have static workflow walkthroughs plus deterministic local approval refusal; no failed paid generation was deliberately triggered.

Physical iOS/Android, cross-browser rendering, screen-reader testing, measured frame rate and production-network/Core Web Vitals are pending for real generated sites. Site-specific claims/assets require review. The fictional fixture approval is explicitly synthetic.

CI status is determined by actual GitHub run at the pushed SHA. Security workflow audits dependencies/package boundaries. Optional CodeQL requires eligible service activation. npm publishing, provider paid smoke, public plugin submission and website deployment remain separately approval-gated.

## Reproduce

```sh
npm ci
npm run check
npm run smoke
npx playwright install chromium
npm run browser
```

To use an existing browser, set `PARALLAX_BROWSER_EXECUTABLE`. Set `PARALLAX_CAPTURE_DIR` only when intentionally replacing development screenshots. Browser uses a fresh profile.
