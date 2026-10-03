# Parallax Effect Pro: continuous motion storytelling

Date: 2026-10-04, Asia/Singapore.
Status: direction approved; written specification awaiting owner review. This document is not an implemented feature or a passing release gate.

## Problem and intended outcome

The owner rejected both the MCP-assisted coastal site and its matched baseline. Separate illustrated sections and stronger transform values did not produce the requested creativity. Current records require one scene per section; the renderer offers fixed depth planes, artwork recipes and motion formulas. Those choices constrain the story before the coding agent has designed it.

The replacement must help a coding agent direct a continuous experience: subjects persist across content chapters, objects move through space, parts reveal their relationships, the camera reframes, and lighting directs attention. Motion must explain the subject and support the visitor's next action. Physical product disassembly is a proving example, not a mandatory pattern for every website.

## Ownership and interoperability

Parallax Effect Pro is a motion specialist. It does not replace Impeccable, frontend-design, another UI/UX skill, a developer's design system, or the incumbent website stack. Other tools own page layout, typography, palette, components, content presentation, forms and broader UX. Our package owns motion proposals, choreography records, motion-stage previews, motion validation and integration guidance.

Discovery accepts the other tool's design decisions and constraints before proposing motion. A design-context record references reviewed local files and records relevant tokens, stage allocation, reading zones, breakpoints, component boundaries and owner decisions. These references are data, not instructions to execute. Missing design decisions may receive clearly labelled lightweight proposals; no other skill or account is required.

The host agent may combine any design tools. Our skill must not demand exclusive workflow control or overwrite another tool's instructions. Integration uses scoped classes, explicit mount points and a teardown contract. No global typography reset, global scroll override or replacement of navigation, forms or unrelated components. Conflicts are stated concretely: for example, a requested orbit passes through an agreed reading zone. Resolve the conflict through a proposed motion or placement change and obtain a new preview decision when the approved experience changes.

## Creative workflow

1. Inspect the subject, existing UI, available assets and project constraints. Clarify what visitors should discover, which subject anchors the story, the important relationship or reveal, the climax and the desired action.
2. Propose three meaningfully different narratives, not three intensity settings. Use object choreography, continuous-world exploration or visual transformation where appropriate. Identify why each transition exists, where content remains still, and what assets the story actually needs.
3. Author a storyboard and a machine-readable timeline. Separate content chapters from visual stages. A stage can span several chapters, and an actor can persist through the entire stage.
4. Create the representative motion preview through the packaged MCP. Show clean playback, arbitrary chapter seeking, reverse scrolling and an optional review overlay. Expose unsupported asset requirements rather than silently substituting a flat spinning card for a 3D object.
5. Adjust the record and regenerate through MCP. Obtain actual approval of the exact revision and artifact digest. No invented human decision or fixture approval.
6. Export the approved motion handoff. The host combines it with its chosen UI/UX workflow and builds the complete site in the incumbent stack. Review the integrated site against the approved motion and design context.

Native scrolling, readable content, mobile alternatives, reduced motion and semantic static content remain requirements. Dramatic motion is allowed; usefulness and intentional composition determine its quality.

## Record and interface architecture

Introduce an explicit schema version 2 alongside version 1. Existing version 1 files, previews and approval references remain valid historical artifacts. Never silently reinterpret their travel values as a new story.

The version 2 record contains the brief and concept decision, design context, assets, content chapters, visual stages, persistent actors, ordered beats, tracks, fallback views, preview metadata and approval evidence.

- **Chapters** identify semantic content and navigation anchors. They do not instantiate new copies of the subject.
- **Stages** declare which chapters they span, their mount/viewport allocation, renderer and native scroll duration. Multiple unrelated stages may coexist; one global pinned canvas is not compulsory.
- **Actors** have stable IDs, optional fixed parent IDs, initial poses, asset references and semantic roles. The hierarchy must be acyclic and all references must resolve. Separately named product parts remain addressable.
- **Beats** identify discovery or explanation moments, progress ranges, focus subjects, copy references and intentional composition. Ranges may overlap for a transition.
- **Tracks** target declared actors, camera or lights with bounded, typed properties and ordered keyframes. Support position, scale, unwrapped rotation, opacity, camera framing and light focus/intensity. Rotation can express a complete 360-degree turn rather than interpolating identical endpoints through a shortest-path shortcut. Define units explicitly: stage-relative positions for 2D; authored scene units for 3D.
- **Fallback views** identify representative static poses and complete semantic content. They must not depend on a user first playing the animation.

The first implementation supports persistent 2D actors and actual 3D product groups. It does not require an unrestricted node editor, a physics simulation, arbitrary shaders or executable expressions in the record. Creative range comes from authored actors, assets and keyframes rather than an ever-growing menu of website templates. Unsupported properties fail clearly.

Retain the four stdio MCP entry points: phase guidance, preview creation, record validation and approved handoff. Their records become version-aware. Additive preview results identify generated artifacts and exact digests without granting approval. No hosted MCP server or provider proxy is introduced.

## Runtime and preview

Use one progress evaluator shared by preview and exported motion data. Compute the pose from the current progress, not the order of prior scroll events. Seeking, reverse scroll, resizing and returning to a chapter must produce the same pose. Initial values fill missing properties; conflicting simultaneous tracks on the same property are rejected rather than resolved through hidden ordering.

Mount persistent actors once per stage and update their poses across chapter boundaries. Use native scroll measurements and scheduled rendering. Keep static content in the document. Stop unnecessary rendering outside active stages and dispose listeners, renderers and owned resources on teardown.

Use the simplest suitable renderer: scoped DOM/CSS for layered images and vector shapes, and Three.js for real camera/part/light choreography. Keep library choice internal to the motion artifact; do not force a host site to migrate frameworks. Do not add a second timeline library unless a concrete requirement justifies it. The package's preview runtime and dependencies must be locally available without a CDN, and included in the release allowlist and installed-tarball tests.

Generate a clean motion-stage preview plus optional review controls. For an existing UI, the host mounts the stage in its own reviewed shell for integrated review; the tool does not execute arbitrary imported HTML as a server-side template. The standalone preview must disclose in chat when it is a motion-stage proof rather than the entire website layout. Integration changes that alter the approved experience require another review; do not label motion-only approval as full-site UI approval.

When approving integration, record both the MCP stage artifact digest and the host-authored composite preview digest with their design-context references. Validate the contained composite file as saved bytes, without executing it inside the MCP server. The user should see the actual reviewed UI shell with the proposed motion before approving integration. A standalone stage may receive motion-only approval; that decision does not approve an unseen site layout. The handoff must state which scope was actually reviewed.

Reference digests bind the relevant design context and assets to the revision. Product transforms, camera paths, lighting, chapter timing and relevant context changes invalidate approval. Export the same authored tracks and asset manifest used by the preview so the host does not have to invent replacement formulas.

## Asset and provider strategy

Allow reviewed local images, vector geometry and product models rather than restricting users to three illustration families. Start the proving storyboard with a procedural, original 3D proxy containing separately addressable parts. Identify it as a conceptual camera, not engineering-accurate hardware or final photography.

Validate asset containment, type, size and references. The first model import supports self-contained GLB assets; reject external model/texture URLs, scripts, unsupported extensions and escaping paths. Preserve the current traversal, symlink, bounded-read, exclusive-output and digest guards. Asset import does not authorize arbitrary script execution or network requests.

Use AI imagery/video where it fits the story, such as environment, atmosphere or reviewed cinematic sequences. Accurate detachable product parts require appropriately structured geometry or reviewed rendered sequences; do not assume generated video supplies that structure. Runway remains a separately connected host tool. Verify actual availability, propose the asset and settings, obtain credit/cost approval, and review continuity before integration. No automatic trial, purchase, paid retry or account change.

## First proving storyboard: fictional modular camera

The first proof is generated through MCP from this record, not coded as a bespoke showcase. UI treatment comes from a cooperating UI/UX workflow or clearly labelled neutral defaults.

| Progress | Persistent subject and choreography | Visitor explanation |
| --- | --- | --- |
| 0–12% | Camera emerges from darkness; a light travels across its silhouette. | Establish the object and the reason to explore it. |
| 12–30% | The same camera turns through 360 degrees; framing shifts to reveal its form. | Explain exterior design without moving the reading zone. |
| 30–45% | Rotation settles. The casing opens and named parts separate along deliberate paths. | Reveal the relationship between exterior and interior. |
| 45–60% | Lens group moves into a clear inspection position. Context dims; the lens receives focused light. | Explain one feature with an anchored callout. |
| 60–72% | Lens returns to its authored assembled pose as focus transfers to the sensor. | Carry the eye to the next detail without resetting the scene. |
| 72–85% | Sensor inspection resolves; parts reassemble while the camera reframes. | Connect the individual features to the complete object. |
| 85–100% | Completed camera settles beside the final action. Motion gives way to a stable composition. | Offer the visitor a clear next step. |

The scroll distance allocated to each beat is authored and reviewable, not claimed to be an optimal universal duration. Key poses must be inspectable before committing to detailed assets. Mobile may shorten travel and simplify framing; reduced motion and no-WebGL views show sequential annotated static poses. A flat card rotation cannot satisfy the 3D rotation proof.

Static poses use reviewed posters or captured representative renders when available. If only a conceptual diagram is available, identify it as such and preserve complete explanatory text; do not claim it depicts a verified final render. The story must remain understandable when the 3D runtime cannot start.

## Acceptance and regression evidence

The owner must accept the creative result. Mechanical checks cannot reverse the existing failed visual verdict.

Required automated evidence includes strict versioned schemas, valid actor hierarchy/references, deterministic poses at arbitrary progress, a full-turn rotation, overlapping transition interpolation, exact part restoration, resize/reverse behavior, reduced-motion/static states, approval invalidation, containment and installed-package stdio calls. The preview and handoff must use the same timeline data.

Browser evidence covers persistent actor identity across chapters; beginning/middle/end and transition poses; real 3D depth/rotation; selective light/focus change; intended object bounds without accidental clipping; stable readable content and actions; keyboard navigation; desktop/mobile; no-WebGL/no-JavaScript/reduced-motion content; errors and asset/network behavior. Record environment and limitations; do not invent frame-rate, token or performance results.

Run a fresh isolated host test using only the installed package and its collaborating UI/UX tool. Verify discovery, distinct narratives, actual MCP preview, adjustment, exact approval, handoff and complete integration. Confirm the other tool's typography, components and layout were preserved except for explicitly reviewed integration changes. Include an existing-site case before claiming revamp support, and a Claude run before claiming full host parity.

Repeat a matched baseline using the same subject, assets, brief and host/model settings. Evaluate continuity, revelation, spatial use, visual craft and usability rather than transform magnitude. An owner vote of neither is a failed quality gate. Release, npm publication, paid media and deployment remain separate decisions.

## Research grounding and limits

- [Lusion: Atlas Motion](https://lusion.co/projects/atlas_motion/) describes visual pacing and selective WebGL for a complex hardware story.
- [Lusion: Oryzo AI](https://lusion.co/projects/oryzo_ai/) demonstrates creative campaign direction around an ordinary object. Its live studio site was visually inspected; the complete client projects were not exhaustively tested.
- [Apple: AirPods Pro](https://www.apple.com/airpods-pro/) presents exterior and internal product detail. Its page content was reviewed; this document does not claim to have verified its animation implementation.
- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) documents a pinned, scroll-scrubbed timeline. This supports feasibility, not a requirement to add GSAP.
- Three.js documentation retrieved through Context7 covers [Object3D hierarchy and transforms](https://threejs.org/docs/pages/Object3D.html) and [GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html). Implementation must verify the selected installed version before depending on its APIs.

The owner's original Justinmind, Elementor, Builder.io and Crocoblock references remain useful context. Their broad effect recipes are inspiration, not a ceiling on this package's creative output or proof of a universally best implementation.
