# Release preparation and publication

The repository is public and `@alvintayzhenwei/parallax-effect-pro@0.1.0` is published (registry verified 2026-10-06). GitHub trusted-publisher configuration and actual workflow publication remain unverified. Source push, CI success, package preparation and npm publication are distinct events.

## Current workflow

`release.yml` prepares artifacts by default. Opt-in publication requires dispatch on `main`, `publish=true`, repository variable `NPM_PUBLISH_ENABLED=true`, and the `npm-publish` environment. It uses OIDC without stored npm tokens. The publish job rebuilds and retests the same immutable dispatch SHA before publishing its tarball. Runs are serialized.

The npm package identity is `@alvintayzhenwei/parallax-effect-pro`, owned under the `alvintayzhenwei` organization. The CLI command and MCP name remain `parallax-effect-pro`.

## Owner setup

1. Merge to `main` and confirm npm package ownership. Bootstrap the first package through your authenticated npm account if needed.
2. Create GitHub environment `npm-publish`: restrict to `main`, require human reviewers and prevent self-review. Verify protection is supported and enforced; an environment name alone is not a gate.
3. Configure npm Trusted publishing: GitHub user `alvintayzhenwei`, repository `parallax-effect-pro`, workflow filename `release.yml`, environment `npm-publish`, with direct publishing allowed.
4. Enable Actions repository variable `NPM_PUBLISH_ENABLED=true` only after verifying protection and ownership. Otherwise leave it disabled and use an explicitly approved owner-run release.
5. Dispatch on `main` with the exact package version and `publish=true`. Review preparation artifacts, then approve the environment job. Existing versions cannot be overwritten.
6. Verify registry installation and real stdio discovery in a fresh project. The workflow's registry lookup checks existence only.

Node 24 and npm 11.5.1 meet [trusted publishing requirements](https://docs.npmjs.com/trusted-publishers/). Public access is explicit; provenance depends on repository visibility. This workflow does not change visibility. Environment protection, npm account setup and actual publication remain unverified until configured and exercised.

## Security services

Dependency auditing and package allowlist checks run independently of GitHub CodeQL eligibility. The CodeQL job is disabled unless `CODEQL_ENABLED` is explicitly set after confirming eligible code-scanning activation. Setting the variable alone is not a successful scan. Secret-scanning availability also depends on account/features; no enabled/passed claim is made when service details are unavailable.

Dependabot configuration applies on the default branch. Until development changes are merged, weekly schedules/default-branch features may not activate. Private-repo badges may require authentication.
