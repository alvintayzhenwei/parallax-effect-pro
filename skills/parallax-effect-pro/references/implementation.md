# Local tools, records and implementation

## Commands

Before registry release, build from source or install the reviewed local tarball. After publication, a pinned `npx parallax-effect-pro@VERSION` provides temporary execution; `npm install -g parallax-effect-pro@VERSION` installs a persistent command. Never describe unpublished registry commands as verified.

```sh
parallax-effect-pro preview --root /absolute/project --record project.json --output previews/revision-1.html
parallax-effect-pro validate --root /absolute/project --record project.json
parallax-effect-pro handoff --root /absolute/project --record project.json --output handoffs/revision-1.md
parallax-effect-pro mcp --root /absolute/project
parallax-effect-pro doctor
```

MCP tool inputs:

| Tool | Input | Result |
| --- | --- | --- |
| `parallax_design_guidance` | `phase`: discovery, concepts, preview, assets, build, review | Canonical workflow, fixed packaged references and phase templates; read-only |
| `parallax_create_preview` | `recordPath`, `outputPath` | Absolute path, design revision, file digest |
| `parallax_validate_project` | `recordPath` | Schema validity, issues, revision, approval status |
| `parallax_export_handoff` | `recordPath`, `outputPath` | Handoff path and revision |

The root is fixed at server launch. Tools do not accept arbitrary roots or run shell commands. Output is exclusive creation: choose a new filename rather than overwrite. Read JSON limit is 1 MiB; preview validation limit is 5 MiB. Paths reject traversal and symlink components. Tools assume a trusted local workspace; they do not defend against another malicious process replacing parent directories concurrently.

## Records

Copy `../templates/project.json` as a starting schema example. Replace all fictional content. Exactly three concepts have unique ids. The selected concept's sections match the motion-plan sections in order. Actions link to existing section ids. There is one scene per section with unique layer ids. Travel is in [-1,1]; it is not a clinical comfort threshold.

Each scene may include a strict optional `beats` object with `start`, `middle`, and `end` narrative text. Omitted beats receive effect-specific wireframe labels. Authored beats participate in the design revision, so changing them invalidates old approval. These labels explain the motion; they do not generate imagery or guarantee quality.

Validation also reports structural `motionWarnings`: zero travel, missing differential planes, a background-drift scene without a moving background, or advanced storyboards. Warnings identify design review work; they do not authenticate approval or replace a visual verdict.

Preview response metadata is recorded as:

```json
{"preview":{"revision":"RETURNED_SHA256","file":"previews/revision-1.html","fileDigest":"RETURNED_DIGEST"}}
```

After an actual user decision, record approval using `templates/approval.md`. Approval covers layout/motion, selected concept and motion plan. Handoff also checks the saved preview bytes. Metadata cannot authenticate user intent: never fabricate a human-message record. Content or controls changed? Update plan, regenerate and request approval of the new design.

Validation may report structurally valid records with missing approval; handoff still refuses. Handoff is a design artifact, not evidence of production quality or deployment permission. Failed critical quality checks label deployment blocked.

## Browser technique

Use transforms/opacity rather than moving layout properties continuously. Schedule updates through requestAnimationFrame, restrict calculations to active scenes, and clean up listeners in framework lifecycles. Observe reduced-motion preference changes and preserve static content. Avoid unconditional will-change everywhere or perpetual loops while offscreen.

Native CSS scroll timelines can reduce scripting where supported, but verify current target browsers and provide fallback. Use an installed animation/rendering library only when a scene needs it. Never copy article claims about compositor use or 60 fps as guarantees.

Official references: [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame), [reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.29.0). Resolve project library documentation with Context7 where available; otherwise use official sources. Never put proprietary code or secrets in documentation queries.

## Site preview and review mode

Use authored `motionPlan.visual` palette, brand, tagline and constrained local-font typography. Select `scene.art` (`coastal`, `editorial`, `geometric`), `scene.composition` (`cover`, `split`, `immersive`) and optional coastal subtype `scene.coastalScene` (`coastline`, `villa`, `walk`). All are strict data and included in the design revision. The renderer only emits packaged SVG recipes; arbitrary SVG, external assets and CSS expressions are refused. Local artwork illustrates the intended composition; it does not prove final photograph/video quality. The site view contains customer copy and navigation; review-only metadata is hidden until the accessible review toggle is activated. One layout underlies both views. Legacy records get the editorial split fallback.
