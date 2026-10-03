# Provider selection and Runway MCP

Checked: 2026-10-03. Capabilities are vendor claims and may change; discover current tools/models before use. Do not hard-code pricing or imply all models support every feature.

| Route | Optional automation | Appropriate use |
| --- | --- | --- |
| Runway generation MCP | Host agent calls connected tools directly | Image-to-video/text-to-video, images or edits when exposed by actual connection |
| Higgsfield / Seedance | Manual prompts/settings/import | Camera-led clips or supported multimodal reference workflow |
| Luma | Manual prompts/settings/import | Image/keyframe-led sequences or extensions where currently supported |
| Existing/local assets | No generation needed | Lowest-cost preview, licensed images/video and static fallbacks |

Sources: [Runway MCP](https://github.com/runwayml/runway-mcp-plugin), [Runway generation guide](https://help.runwayml.com/hc/en-us/articles/37425232841875-Getting-Started-with-Generative-Video), [Higgsfield video](https://higgsfield.ai/ai/video), [Seedance](https://seed.bytedance.com/en/), [Luma Ray3](https://lumalabs.ai/ray3).

## Connection boundary

Runway's generation endpoint is `https://mcp.runwayml.com/mcp`. Use the host's existing connector/MCP configuration and human browser authentication. Runway Dev MCP is a different service/account workflow; do not substitute it merely because both are named Runway. Our package stores no Runway credentials, embeds no Runway client, and runs no network generation itself.

If disconnected, offer connection instructions or manual import. Do not block brainstorming or preview. A listed connector/tool does not prove authenticated access: use its supported identity/model discovery first. Model availability may vary by workspace.

## Paid generation sequence

1. Confirm layout/motion approval matches the current revision.
2. Select the approved scene's asset use: loop, isolated still layer, poster, frame sequence or scrubbed clip.
3. Present prompt, selected references, model/settings, aspect ratio, duration, known credit/cost information and uncertainty. Request explicit approval or check applicable user-approved budget. Unknown price is disclosed; do not guarantee an unenforceable budget cap.
4. Call the actual generation tool exposed by connected Runway MCP. Names can differ between hosts; do not invent tools or parameters. Upload only approved reference assets via supported upload tools. Do not start a trial or buy credits.
5. Track returned task using supported status tools. Respect terminal status; avoid duplicate generation calls. Cancellation is offered only if actual tools support it.
6. On failure, preserve brief and approval, explain failure and offer manual import or retry requiring applicable paid approval. Never auto-retry billable generation.
7. Inspect output for crop/framing, continuity, loop seam, reference fidelity and licensing before approved import. Media display/export follows host capabilities. Do not download remote media to bypass host display restrictions.

## Website-oriented prompt template

“Create [subject/action] for a [scene purpose]. Keep [composition and copy-safe region]. Camera: [bounded motion]. Lighting/style: [approved direction]. Preserve [reference identity]. Duration/aspect: [tool-supported settings]. Avoid [text/logos/unwanted movement]. Intended website use: [loop or scrub].”

Separate prompt prose from parameters; use only real model settings. For layered parallax, still assets with separately prepared subjects often work better than one flattened movie. For video scrubbing, test seeking/decoding on target devices; video generation alone does not create reliable scroll playback. Provide optimized poster and static content for mobile/reduced motion.

## Manual route

Offer provider link, tailored prompt, supported settings to verify, asset checklist and import destination. Review exported files and provenance. No API keys are needed by this package. Provider cards select an option to discuss, not a connected account or a generation action.


## Manual prompts are a first-class route

Use `templates/video-prompts.md` to generate a complete, service-specific prompt pack without any video MCP. This also works through the skill alone. Offer provider choices through the host's available selection UI or conversation; a choice does not connect an account or spend credits. Provide a master prompt, complete per-shot prompts, start/end compositions, copy-safe regions, continuity constraints, loop/scrub alternatives, mobile crop and poster/export guidance. Keep prose separate from actual supported provider parameters. Verify capabilities when a provider is selected; never promise exact detachable parts from a flattened movie.

Current version 2 stage assets support reviewed raster images and self-contained GLB. The host's existing media pipeline owns video/frame-sequence playback. Generated clips require output review and new preview approval when they alter the experience; prompt generation itself makes no provider request.
