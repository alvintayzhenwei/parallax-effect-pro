# Complete-site quality and deployment

Build the entire approved website, not only an animated hero. Preserve the project's existing stack. For new sites, native HTML/CSS/JavaScript is suitable for small static sites; choose additional tooling only for demonstrated content or interaction needs.

## Critical checks

- Navigate every internal link and primary action. Verify logical heading/focus order and keyboard controls.
- Inspect representative desktop/mobile layouts, overflow, touch behavior and text contrast. Emulated mobile is not a physical-device test.
- Verify operating-system reduced motion before loading and during use; static story stays complete. Check no-JavaScript content where practical.
- Inspect console/network failures and secret exposure in source, bundles, records and package output.

Broken core navigation, unusable mobile layout, missing reduced-motion fallback or exposed secrets block normal deployment. Fix and rerun affected checks. Do not turn unexecuted checks into passed records.

## Motion and visual acceptance

Compare start, middle and end frames for each core scene. Check visible relative travel across distinct depth planes, intentional overlap and crop margins, a stable readable text/action zone, and an exit from every sticky sequence. A sticky stage must visibly explain a relationship as scrolling progresses. Fades, uniform translations or a pinned block alone do not demonstrate differential parallax. Verify background drift moves only the background, pointer motion has a coarse-pointer alternative, and advanced storyboards are not mistaken for working media.

Record actual evidence and the owner's visual verdict separately: depth, choreography, art direction, readability, and requirements coverage. Geometric placeholders test composition and motion before final assets. Passing schemas, transform checks or runtime tests cannot certify aesthetic quality or universal improvement. Compare against a matched baseline when evaluating the product's design benefit.

## Performance and assets

Measure actual output. Report browser, viewport, device/emulation, network conditions, artifact size and method. Local fast loading does not prove mobile-network performance. Check images, poster/media size, decode cost and offscreen animation work. Do not claim 60 fps without measurements. Avoid scroll hijacking, oversized preload and excessive rendering layers.

Review copy and rights. Clearly marked drafts can remain during development; final publishing requires approved business claims and suitable asset licenses. MIT applies to project code/docs, not automatically to generated media or third-party services.

## Report and publish

Use `templates/quality-report.md`: separate executed evidence, remaining issues, manual checks and unavailable host/account features. A handoff or green unit suite is not production acceptance.

Offer deployment destinations suited to stack/user account. Prepare output and show the concrete destination/scope before approval. Publish only after explicit approval. Account settings, DNS, paid upgrades, package release and changing repository visibility are separate actions.

After deployment, verify reachable URL and meaningful navigation/actions. Report what actually ran. A build, source push, CI check and live deployment are different results.
