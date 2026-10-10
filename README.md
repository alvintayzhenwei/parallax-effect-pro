# Parallax Effect Pro

<img src="https://raw.githubusercontent.com/alvintayzhenwei/parallax-effect-pro/main/docs/branding/logo.png" alt="Parallax Effect Pro Offset P logo" width="96">

[![npm version](https://img.shields.io/npm/v/@alvintayzhenwei/parallax-effect-pro)](https://www.npmjs.com/package/@alvintayzhenwei/parallax-effect-pro)
[![CI](https://github.com/alvintayzhenwei/parallax-effect-pro/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/alvintayzhenwei/parallax-effect-pro/actions/workflows/ci.yml)
[![Security checks](https://github.com/alvintayzhenwei/parallax-effect-pro/actions/workflows/security.yml/badge.svg?branch=main)](https://github.com/alvintayzhenwei/parallax-effect-pro/actions/workflows/security.yml)
[![Dependabot Updates](https://github.com/alvintayzhenwei/parallax-effect-pro/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/alvintayzhenwei/parallax-effect-pro/actions/workflows/dependabot/dependabot-updates)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Shape motion stories with your coding agent, review local previews, and integrate approved choreography into your existing site.

- Compare three tailored motion concepts before implementation.
- Preview layered or continuous motion locally, including mobile and reduced-motion views.
- Export revision-bound handoffs for your host-owned website.

## Website example: no AI video required

[lvntay.ai](https://lvntay.ai/) demonstrates parallax through layered artwork, native scrolling, and CSS transforms, without AI-generated video. Scroll through the desktop windows and watch the terminal illustration's layers move at different depths.

AI video generators such as Higgsfield and Runway are optional asset sources, not requirements for creating parallax. Existing images, SVGs, and interface elements can supply the layers; your website's code controls their motion.

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

From a customer project, install release `0.1.2` after npm publication:

```sh
npx --yes @alvintayzhenwei/parallax-effect-pro@0.1.2 doctor
npm install @alvintayzhenwei/parallax-effect-pro@0.1.2
```

`doctor` reports `runtime: "supported"` and `assets: "present"`. Host and Runway connections remain `unverified` until configured.

npm installation provides the CLI and local tools. Complete [host setup](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/installation.md) separately to install a skill and configure stdio tools.

## Workflow

1. Describe your site and compare three motion concepts.
2. Preview and refine the selected story, including mobile and reduced-motion behavior.
3. Approve the exact revision, export its handoff, and build in your existing site stack.
4. Review the integrated site; approve publication separately.

## New release: 0.1.2

Version `0.1.2` improves parallax revamps for existing websites:

- A [dedicated revamp workflow](skills/parallax-effect-pro/references/revamp.md) traces the actual scroll container, reuses existing hooks/CSS, and diagnoses motion with no visible effect.
- Native host effects need no story record or stage export; packaged stages retain revision approval and handoff requirements. AI video generation remains optional.
- Integrated local previews and [before/after evidence](skills/parallax-effect-pro/templates/revamp.md) make changes reviewable, with a runnable example checked for nested scrolling, reverse motion, reduced motion, resize, and mobile overflow.

See the [verification report](docs/verification/2026-10-08-revamp-workflow.md) for executed checks and limits. Customer-site creative acceptance and full end-to-end acceptance remain pending.

Release changes are summarized in the [changelog](CHANGELOG.md).

**Publication status:** The `0.1.2` release is being prepared; npm publication is pending. For testing before publication, use this source checkout or the local Codex plugin `0.1.2-revamp.1`.

## Documentation

**Getting started:** [source checkout](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#start-from-a-source-checkout) · [npm usage](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#install-from-npm) · [host setup](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/installation.md)

**Preview and workflow:** [first website](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#your-first-website-step-by-step) · [Preview Mode](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#preview-mode-pinpoint-a-change) · [continuous motion](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#continuous-motion-version-2)

**Capabilities and examples:** [features](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#what-you-get) · [effects](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#effect-choices) · [media](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#ai-media-local-orchestration-optional-cloud-generation) · [complete example](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#complete-example)

**Reference and operations:** [tools and approval boundaries](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#tools-and-approval-boundaries) · [checks and evidence](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#checks-and-evidence) · [troubleshooting](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#troubleshooting) · [releasing](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/releasing.md) · [security](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/SECURITY.md) · [sources and license](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/guide.md#knowledge-sources-and-license)

**Branding:** [logo options](https://github.com/alvintayzhenwei/parallax-effect-pro/blob/main/docs/branding/logo-options.md)
