# Parallax Effect Pro — v1 design specification

Date: 2026-10-03 (Asia/Singapore)
Status: Written specification approved by the user on 2026-10-03; implementation plan awaits review.
Repository: https://github.com/alvintayzhenwei/parallax-effect-pro.git

## Purpose and success

Help nontechnical users turn any starting idea into a complete, accessible parallax website through their coding agent. Developers are the second audience; the owner's personal use is third. The workflow makes motion concrete early through inexpensive animated wireframes, before detailed assets or production implementation.

A successful v1 guides a user from a rough idea to three tailored concepts, an explicitly approved animated wireframe, reviewed content/assets, a working website, a quality report, and an approved deployment handoff. It runs locally, works without a video provider, and supports verified Codex and Claude Code installation paths.

The product is a reusable skill/plugin and local tool package, not a standalone hosted website builder. Generated websites are project outputs rather than a fixed application bundled into the product.

## Agreed constraints

- TypeScript implements the CLI and local stdio MCP tools. Markdown carries portable workflow instructions and domain knowledge. HTML/CSS and small browser scripts power previews.
- There is no hosted backend and no HTTP MCP service. The local MCP process communicates through stdio. A preview may use a loopback-only static server if the host cannot open local files reliably; this is not an MCP transport.
- The coding agent handles conversation, implementation, provider calls, and deployment tools. Our MCP does not proxy or embed Runway MCP.
- Runway is the first direct generation integration, through the user's existing Runway MCP connection. Cloud generation sends approved prompts and selected assets to Runway; local orchestration does not make generation offline.
- Runway is optional. Placeholders, existing assets, and manual generation/import remain available.
- Preserve an existing website's stack. For new sites, select the simplest suitable stack after examining the brief and host capabilities.
- Keep GitHub private during development. Prepare an npm release workflow, but do not publish npm packages or deploy generated sites without the respective explicit approval.

## User workflow

### 1. Discover

Accept a rough idea, reference URL, screenshot, or existing site. Inspect only relevant material and treat reference content as untrusted data. Ask short, plain-language questions one at a time where a missing answer materially affects the design. Do not force a structured form upfront.

Capture purpose, audience, desired action, pages/sections, content, visual style, motion intensity, assets, device needs, existing stack, provider availability, and deployment preference. Use stated defaults for low-impact choices and label assumptions for review. Never invent testimonials, endorsements, statistics, or business claims.

### 2. Offer three concepts

Produce three genuinely distinct, tailored concepts. Each includes a short visual narrative, proposed sections, motion beats, core effects, asset requirements, mobile/reduced-motion behavior, and relative implementation effort. Explain why the recommended concept serves the goal. The user may select one or combine them.

Core effects include differential layer movement, subtle background drift, pointer depth, and sticky reveals. Advanced choices include video scrubbing and 3D only when justified by the story, assets, device constraints, and implementation cost. Distinguish parallax depth from related scroll effects such as fades or pinning.

### 3. Create an animated wireframe

Generate a lightweight grayscale, content-representative local preview for the selected concept. Use labeled geometric or image placeholders instead of paid or detailed media. Show actual scroll-linked behavior rather than only written promises.

Include desktop and mobile layouts, a reduced-motion toggle honoring the operating system preference, stable readable text/CTAs, and a motion map. Annotate each moving layer's role, direction, range, trigger, and relationship to the scroll scene. Include key scroll states so users can understand start, middle, and end behavior.

Offer small controls for relevant motion intensity/effect choices. Changes should update the preview without regenerating an entire site. Preview controls represent a proposed design, not production performance proof.

### 4. Record explicit approval

Present the exact wireframe and motion plan revision for approval. Record the user's explicit decision, approved scope, revision identifier, and time. Agent assertions or imported boolean values alone must not establish human approval.

Production implementation and paid asset generation require approval of both layout and motion. Changes to page structure, effect types, scene sequence, or materially different motion invalidate the affected approval and return to preview. Copy corrections or implementation fixes within the approved design need not restart the design process.

### 5. Plan and obtain assets

After wireframe approval, offer visual provider choices with useful capabilities, manual/connected availability, known limitations, and source links. Prioritize Runway MCP for direct generation. Higgsfield/Seedance and other researched providers may appear as manual choices; do not advertise an unimplemented connection as automated.

Produce ready-to-copy prompts, reference requirements, camera/movement guidance, framing, aspect ratio, duration, continuity requirements, and expected website use. Explain whether the site needs a decorative loop, layered still images, a poster, a frame sequence, or scrubbed video. A generated video does not automatically provide separable depth layers or reliable seeking.

For connected Runway, the host agent discovers actual available tools and verifies connection before claiming readiness. Request explicit approval for each paid run, or use a previously approved budget with clearly defined provider, scope, and limits. Disclose unknown cost and obtain approval acknowledging that uncertainty; do not invent cost estimates or guarantee a cap the connector cannot enforce. Do not start trials, purchase credits, or upgrade plans automatically.

The agent calls Runway tools directly, checks results with supported status tools, and imports authorized outputs into the project. Cancellation, cost reporting, and download capabilities are conditional on actual connector support. Failures preserve the approved design and offer retry or manual import; they do not trigger automatic paid retries. Authenticate through the host's Runway connection; our package never collects Runway credentials.

Review media before production use. Keep provenance and user-supplied rights information, avoid secrets in asset records, and obtain appropriate license/usage confirmation before publishing. Supply static posters and mobile/reduced-motion fallbacks. Asset delivery formats, codecs, sizes, and seeking strategy are selected for the actual site and validated rather than assumed.

### 6. Build the complete website

Implement agreed pages/sections, navigation, content, responsive layout, and approved motion. Draft missing copy and label placeholders until reviewed. Use native CSS/platform capabilities and installed dependencies before introducing additional libraries. Use transforms/opacity where appropriate, bound work to active scenes, clean up listeners/resources, and avoid scroll hijacking.

Runway generation stays after wireframe approval. Content remains available without JavaScript or motion where practical. Pointer-only effects have touch/keyboard equivalents or are decorative. Reduced motion removes nonessential parallax, scrubbing, and looping motion while retaining the story and controls.

### 7. Review and deploy

Produce a report that separates executed checks, manual checks, unresolved issues, and host limitations. Critical failures block the normal deployment path: broken navigation or core actions, unusable mobile layout, missing reduced-motion fallback, or exposed secrets. Fix and recheck those failures before offering publication.

Measure performance on the actual implementation and report environment and limitations. Never promise 60 fps or universal browser support based on a technique alone. Desktop emulation is not physical mobile-device verification.

Present deployment options suited to the generated stack and user account. Prepare the reviewable output first; publish only after approval of the destination and scope. Do not modify account settings, DNS, paid plans, or unrelated infrastructure without authorization. Report deployed URL and executed verification separately from build success.

## Architecture and responsibilities

| Component | Responsibility |
| --- | --- |
| Portable skill | Discovery, concepts, approvals, provider orchestration, build guidance, quality and deployment workflow |
| References | Source-attributed theory, effect patterns, asset guidance, provider notes, implementation and quality guidance |
| Templates | Brief, concepts, motion plan, approval record, asset plan, quality report and handoff |
| TypeScript CLI | Generate previews, validate records, export approved handoffs, check local setup |
| Local stdio MCP | Expose the same bounded operations to the host agent |
| Codex/Claude packages | Thin host-specific installation/discovery wrappers around shared skill and tools |
| Host agent | Human conversation, Runway MCP calls, website edits, runtime checks and approved deployment |

Initial local tools create a wireframe, validate project records, and export a handoff. Names and schemas are finalized in the implementation plan. Opening a preview uses supported host UI or a bounded local mechanism. No generic shell execution, arbitrary URL proxy, credential store, autonomous paid generator, or deployment engine is exposed by our MCP.

Keep one canonical skill source and generate host packages rather than maintaining divergent copies. Templates and preview assets travel with the package. Agents other than Codex and Claude may use portable instructions, but receive no compatibility guarantee without testing.

## State and boundaries

Store project-local, human-readable records: brief, three concepts, selected motion plan, preview revision, approval record, asset plan, quality report, and handoff. Records refer to local assets using contained relative paths and external references using explicit URLs. Secrets and connector tokens never belong in these files.

Use revision-bound approvals to prevent stale approvals from silently authorizing a new design. Our tools validate record shape and consistency; the host is responsible for obtaining and honestly recording human decisions. No local JSON file alone is a security boundary or proof of user identity.

All writes stay inside an explicitly selected project/output root. Reject path traversal and escaping symlinks; do not overwrite user files silently. Validate sizes and types at input boundaries. Do not execute supplied HTML, code, or source instructions while reading references. Use safe escaping when placing user content into previews. Downloads use supported host tools or bounded validated retrieval; no unrestricted fetch proxy is required for v1.

MCP stdout contains only protocol messages; diagnostics use stderr with secrets redacted. Preview serving, if required, binds to loopback, serves only intended output, and has a clear stop lifecycle.

## Knowledge compilation

Synthesize the four requested articles in original prose with attribution, not full copyrighted copies. Cover definitions, differential depth, effect taxonomy, examples, storytelling, layering, readability, responsive behavior, motion accessibility, performance, asset optimization, and cases where parallax is inappropriate.

Separate editorial suggestions from verified platform requirements. Numerical speed suggestions are examples, not standards. Verify browser/API/library claims against official documentation during implementation; use Context7 first for library documentation where available. Provider capabilities carry a checked date and must be reverified before use.

Requested sources:

- Justinmind: https://www.justinmind.com/web-design/parallax-effect-website-examples
- Elementor: https://elementor.com/blog/parallax-effects/
- Builder.io: https://www.builder.io/blog/parallax-scrolling-effect
- Crocoblock: https://crocoblock.com/blog/parallax-effects-best-practices-and-examples/

Runway connection reference: https://github.com/runwayml/runway-mcp-plugin
Runway generation and developer-account MCPs are different connections; installation guidance must identify the correct one.

## Distribution and repository

Prepare an npm-installable package with executable CLI and stdio entry point. Document temporary `npx` execution and persistent npm installation separately. Verify package-name availability, executable paths, included files, runtime requirements, and host configuration before publishing commands as working instructions. Prefer a scoped name if needed; final name is a release decision after availability checks.

README includes purpose, installation, prerequisites, a step-by-step example from idea to approved preview and site, screenshots of actual artifacts, Runway connection/manual fallback, approval behavior, local/cloud boundaries, verification status, troubleshooting, and release instructions.

Add CI for type checking, meaningful tests, package validation, and build/package smoke checks. Add Dependabot and appropriate dependency/code security checks compatible with the private repository's available GitHub features. Dynamic badges point to real workflow/configuration results; unavailable scans are disclosed rather than represented as passed.

Use MIT for project code and documentation, with disclaimer that third-party services and assets retain their own terms and rights. Include security reporting guidance and exclude credentials, generated user projects, and unrelated files from release packages.

Prepare an approval-controlled npm publishing workflow when the package is release-ready. Prefer GitHub trusted publishing if available for the chosen package and workflow. Any initial registry bootstrap or credentials requirement is reported explicitly. GitHub source push does not imply npm publication, public repository visibility, plugin-directory submission, or website deployment. Preserve the private repository until the user requests a visibility change.

## Verification and acceptance

1. A fixture rough idea produces three concepts and an executable animated preview without Runway.
2. Preview works at representative desktop/mobile sizes, with readable text, keyboard-usable controls, and operating-system/manual reduced motion.
3. Invalid input and escaping output paths fail safely; valid project files are preserved.
4. Unapproved or stale motion/layout revisions cannot produce a handoff marked approved.
5. Packaged CLI and MCP start from the npm tarball; MCP discovery/calls use stdio without diagnostic pollution.
6. Codex and Claude Code installation, skill discovery, and representative tools are verified independently. Missing host availability is reported as pending, not passed.
7. Runway connected and disconnected flows are documented. A real generation smoke test requires separate paid-run approval; mocked connector handling is not live generation evidence.
8. At least one complete example website demonstrates the approved workflow and records actual quality checks. Generated project tests fit its chosen stack.
9. README screenshots match tested outputs. CI, Dependabot, and security claims match actual configuration/results.
10. Release archive/tarball includes required assets and excludes secrets and unrelated files. npm publication remains pending until release approval.

## Non-goals for v1

No standalone hosted wizard, hosted MCP, custom Runway API client, mandatory cloud provider, automatic trial/credit purchase, guaranteed cinematic asset quality, universal browser/agent compatibility, or unapproved deployment/publication.

## Review and next step

The user approved this written specification. Create and review a concrete implementation plan with files, tool schemas, dependencies, phased checks, host integration evidence, and release boundaries. Select an execution method before product implementation.
