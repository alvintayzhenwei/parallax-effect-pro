# Website video prompt pack

No video MCP required. This template also works through the portable skill alone: interview, tailor the prompts, and let the user paste them into their chosen AI-video service. Do not call a provider unless asked and authorized. MCP availability must never block prompt generation.

## GUIDE — choose one route

**Do not combine all prompts into one input.** Present two alternative routes and recommend the one that fits the selected website concept and the provider's verified capabilities.

- **Route A — one continuous video:** Copy only the Master prompt into the editor. Do not append the individual shot prompts. For a continuous journey, start here if the provider supports the required duration and control; otherwise choose the multi-clip route.
- **Route B — multiple clips:** Generate each shot prompt separately. The host web agent edits or places the returned clips and checks continuity at every join. Shot prompts are an alternative to the Master prompt, not extra instructions to concatenate with it.
- **Optional variants:** Generate mobile and poster prompts separately only when needed. They are not additional main-story shots.

The host web agent implements scroll-linked seeking or layered composition, prepares media and tests playback. Generated video alone does not implement a parallax website. This package's native stage accepts raster/GLB assets; video integration belongs to the host stack.

## GUIDE — do not paste into the video editor

Each shot must have its own copy block. Paste only the text inside the block between **COPY FROM HERE** and **COPY ENDS HERE**. Keep purpose, timing notes, reference-upload instructions, provider controls, review checks and export guidance outside it. Resolve placeholders before presenting a final prompt.

## GUIDE — confirm the job

- Website/service and audience: [actual business, visitor and primary action].
- What the visitor should discover: [subject, relationship, reveal, climax].
- Placement: [hero atmosphere / continuous scene / transition / scroll-scrub sequence / product feature].
- Existing UI owner and constraints: [design tool, palette, still copy area, dimensions].
- Available references and rights: [approved images, original product model, brand details].
- Provider route: [Runway / Seedance / Higgsfield / another service / undecided]. These are choices, not verified connections or capability promises.
- Asset strategy: [one coherent shot / matched shots / prepared layers / geometry]. Do not infer detachable geometry from a flattened video.

## PROMPT — master sequence

**COPY FROM HERE — paste into the video editor’s prompt field**

```text

Create a [duration] visual sequence for [website/service] that helps [audience] understand [specific benefit or relationship] before [visitor action]. The persistent subject is [precise subject description and approved reference identity]. Begin with [discovery composition], transition through [reveal], and finish at [stable composition supporting action]. Camera movement: [one deliberate path and bounded speed]. Subject movement: [authored path distinct from the camera]. Lighting: [direction and focus transfer]. Maintain [material, proportions, markings, environment and color] consistently throughout. Keep [copy-safe area] visually quiet and unobstructed. Avoid added text, invented logos, anatomy or product changes, uncontrolled cuts, fast shakes and unwanted objects. Intended playback: [loop / native-time clip / reversible scroll seek]. Final frame: [exact stable pose]. References: [user-approved files only].

```

**COPY ENDS HERE**

### GUIDE — settings, not prompt text

Use prompt prose separately from provider settings. Verify currently supported inputs, duration, resolution, aspect ratio, seed/keyframes and negative-prompt fields in the selected service. Unsupported controls remain creative instructions, not fabricated API parameters.

## GUIDE — shot cards

For each shot include: purpose, timeline/scroll beat, duration, copy-safe region, start and end composition, camera path, subject movement, light/focus, reference identity and transition into the next shot. Provide a complete copyable prompt per shot rather than “same as above.”

| Beat | What changes | What stays fixed | Transition requirement |
| --- | --- | --- | --- |
| Discovery | [subject emerges or environment opens] | [identity, typography area] | [end pose for reveal] |
| Reveal | [feature/relationship becomes visible] | [subject/material/background] | [matched orientation/framing] |
| Inspection | [camera or light isolates detail] | [readable copy, part identity] | [exact return or purposeful handoff] |
| Resolution | [subject returns or transforms] | [brand constraints] | [settles beside visitor action] |

For every shot, use this structure:

### Shot [number] — [name]

**GUIDE — do not paste:** [Purpose, website placement, timing, reference to attach and how this shot connects to the next.]

**COPY FROM HERE — paste only the block below**

```text
[Complete self-contained generation prompt for this shot. Include its subject identity, start/end framing, camera and subject movement, lighting, continuity constraints and quiet copy area.]
```

**COPY ENDS HERE**

**GUIDE — settings and review:** [Supported controls to select separately, crop/continuity checks and export instructions.]

Do not include the words “Prompt:”, copy markers, headings or guide notes in the copied prompt. If the provider offers a separate negative-prompt field, label and bound that copy block separately; do not claim the field exists without checking.

## GUIDE — continuity and loop variants

A loop needs matching start/end composition, lighting and motion velocity; assess the actual seam. A scrubbed clip needs continuous comprehensible motion when seeking in either direction; avoid narrative dependence on audio or hidden cuts. A multi-shot edit needs matched framing, scale, reference identity and lighting at joins. Provide a motion-light alternative for mobile and a representative poster with complete explanatory text for reduced motion and no video.

For accurate product assembly/disassembly, recommend reviewed structured 3D geometry or a rendered frame sequence. AI video can propose cinematic imagery, but must not be represented as engineering-accurate parts or a guaranteed 360-degree model.

## GUIDE — export and integration checklist

Ask for the selected provider's supported master export. The host developer prepares a suitable web codec, target dimensions, duration, compression, poster and optional short keyframe interval for responsive seeking; verify actual decoding/seek behavior on target devices. Do not promise a universal bitrate, frame rate or browser performance. Preserve source and provenance locally, review identity/crop/continuity, then import into the existing project's media pipeline.

Current version 2 MCP stage assets accept reviewed PNG/JPEG/WebP and self-contained GLB, not video files. Video playback or frame-sequence integration belongs to the host's existing stack. Prompt generation remains available; never pretend a video file was rendered by the 2D/3D stage. Offer reviewed posters/layers or geometry as supported preview inputs.

## GUIDE — decision before generation

Show the chosen provider, final prompts, references, actual supported settings and known cost/credit limits. Manual copy/paste does not connect an account or authorize spending. Direct generation requires the user's applicable paid-run approval. After output review, revisit the motion/integration preview whenever the approved experience changes.
