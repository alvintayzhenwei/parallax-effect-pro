# Parallax Effect Pro

<img src="https://raw.githubusercontent.com/alvintayzhenwei/parallax-effect-pro/main/docs/branding/logo.png" alt="Parallax Effect Pro Offset P logo" width="96">

[![CI](https://github.com/alvintayzhenwei/parallax-effect-pro/actions/workflows/ci.yml/badge.svg)](https://github.com/alvintayzhenwei/parallax-effect-pro/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Shape motion stories with your coding agent, review local previews, and integrate approved choreography into your existing site.

- Compare three tailored motion concepts before implementation.
- Preview layered or continuous motion locally, including mobile and reduced-motion views.
- Export revision-bound handoffs for your host-owned website.

## Quickstart

Requires Node.js 24+ and npm.

```sh
# Source checkout
git clone https://github.com/alvintayzhenwei/parallax-effect-pro.git
cd parallax-effect-pro
npm ci
npm run build
node dist/cli.js doctor
```

From a customer project, run the published development preview explicitly:

```sh
npx --yes @alvintayzhenwei/parallax-effect-pro@0.1.1 doctor
npm install @alvintayzhenwei/parallax-effect-pro@0.1.1
```

`doctor` reports `runtime: "supported"` and `assets: "present"`. Host and Runway connections remain `unverified` until configured.

npm installation provides the CLI and local tools. Complete [host setup](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/installation.md) separately to install a skill and configure stdio tools.

## Workflow

1. Describe your site and compare three motion concepts.
2. Preview and refine the selected story, including mobile and reduced-motion behavior.
3. Approve the exact revision, export its handoff, and build in your existing site stack.
4. Review the integrated site; approve publication separately.

**Status:** Development preview `0.1.1` is published (registry verified 2026-10-08). Visual and full end-to-end acceptance remain pending.

## Documentation

**Getting started:** [source checkout](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#start-from-a-source-checkout) · [npm usage](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#install-from-npm) · [host setup](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/installation.md)

**Preview and workflow:** [first website](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#your-first-website-step-by-step) · [Preview Mode](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#preview-mode-pinpoint-a-change) · [continuous motion](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#continuous-motion-version-2)

**Capabilities and examples:** [features](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#what-you-get) · [effects](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#effect-choices) · [media](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#ai-media-local-orchestration-optional-cloud-generation) · [complete example](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#complete-example)

**Reference and operations:** [tools and approval boundaries](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#tools-and-approval-boundaries) · [checks and evidence](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#checks-and-evidence) · [troubleshooting](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#troubleshooting) · [releasing](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/releasing.md) · [security](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/SECURITY.md) · [sources and license](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#knowledge-sources-and-license)

**Branding:** [logo options](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/branding/logo-options.md)
