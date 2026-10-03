# Complete-site quality and deployment

Build the entire approved website, not only an animated hero. Preserve the project's existing stack. For new sites, native HTML/CSS/JavaScript is suitable for small static sites; choose additional tooling only for demonstrated content or interaction needs.

## Critical checks

- Navigate every internal link and primary action. Verify logical heading/focus order and keyboard controls.
- Inspect representative desktop/mobile layouts, overflow, touch behavior and text contrast. Emulated mobile is not a physical-device test.
- Verify operating-system reduced motion before loading and during use; static story stays complete. Check no-JavaScript content where practical.
- Inspect console/network failures and secret exposure in source, bundles, records and package output.

Broken core navigation, unusable mobile layout, missing reduced-motion fallback or exposed secrets block normal deployment. Fix and rerun affected checks. Do not turn unexecuted checks into passed records.

## Performance and assets

Measure actual output. Report browser, viewport, device/emulation, network conditions, artifact size and method. Local fast loading does not prove mobile-network performance. Check images, poster/media size, decode cost and offscreen animation work. Do not claim 60 fps without measurements. Avoid scroll hijacking, oversized preload and excessive rendering layers.

Review copy and rights. Clearly marked drafts can remain during development; final publishing requires approved business claims and suitable asset licenses. MIT applies to project code/docs, not automatically to generated media or third-party services.

## Report and publish

Use `templates/quality-report.md`: separate executed evidence, remaining issues, manual checks and unavailable host/account features. A handoff or green unit suite is not production acceptance.

Offer deployment destinations suited to stack/user account. Prepare output and show the concrete destination/scope before approval. Publish only after explicit approval. Account settings, DNS, paid upgrades, package release and changing repository visibility are separate actions.

After deployment, verify reachable URL and meaningful navigation/actions. Report what actually ran. A build, source push, CI check and live deployment are different results.
