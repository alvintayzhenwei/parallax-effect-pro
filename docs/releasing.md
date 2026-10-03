# Release preparation and publication

The repository is private and npm package is unpublished. Source push, CI success, package preparation and npm publication are distinct events.

## Current workflow

`release.yml` is manual, checks its dispatch SHA and expected package version, repeats tests/tarball smoke/audit, and uploads a release candidate. It contains no publish step and requests no registry token/OIDC permission. There is no automatic release from a push or tag.

Prepare locally with `npm run check`, `npm run smoke`, `npm run browser`, `npm audit`, and `npm pack --ignore-scripts`. Review tarball contents and generated host packages. Obtain explicit approval of version, artifact, package visibility and release scope before publication. Package name lookup alone establishes neither ownership nor authorization.

## Enable publishing when ready

1. Confirm intended npm account/scope and name ownership; select scoped name if necessary. Synchronize package identity/version and regenerate host packages.
2. Complete any initial registry bootstrap through the owner's normal authenticated npm flow. Keep credentials out of chat and repository. No bootstrap is performed by development tasks.
3. Configure GitHub trusted publishing for the exact owner/repository/workflow/environment using npm's current requirements. Verify GitHub environment protections actually require the intended approval for this private repo/account. A manual dispatch or an unprotected environment label is not independent approval enforcement.
4. Only after release approval and verified controls, add a publish job with minimal `id-token: write` permission, exact artifact/version validation and trusted publishing. If protection is unavailable, leave artifact-only workflow and perform an explicitly approved owner-run release.
5. Verify publication and tarball CLI/stdio startup from the registry. Then update README from future commands to verified install commands. Never mark it published merely because a job prepared artifacts.

[npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) supports private-repository workflows, but automatic provenance is not supported for private repositories. Do not make this repo public to obtain provenance without the user's instruction. Verify current CLI requirements and any needed provenance configuration before the first release.

## Security services

Dependency auditing and package allowlist checks run independently of GitHub CodeQL eligibility. The CodeQL job is disabled unless `CODEQL_ENABLED` is explicitly set after confirming eligible code-scanning activation. Setting the variable alone is not a successful scan. Secret-scanning availability also depends on account/features; no enabled/passed claim is made when service details are unavailable.

Dependabot configuration applies on the default branch. Until development changes are merged, weekly schedules/default-branch features may not activate. Private-repo badges may require authentication.
