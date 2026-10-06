# Isolated product test: progress

Status: started; full workflow and visual acceptance remain pending.

The upgraded package passes 22 automated tests, three installed-package smoke tests, and browser checks. The browser verifier obtains guidance and creates its preview through the actual stdio MCP. It checks distinct motion behavior, mobile layout, keyboard access, reduced motion and static content. These results do not prove superior finished design.

## Frozen test package

- Package: `parallax-effect-pro@0.1.0`, unreleased local snapshot.
- Tarball SHA-256: `08ff4448ed8cfa94e472c111b32e6a29720f4604880f069736b0652413432fee`.
- Project: `/private/tmp/parallax-e2e-20261004-UQWrb5/tide-and-timber`.
- Chat: `Parallax E2E — Tide & Timber`, ID `01a10295-328d-7322-9e93-923f5998c2b0`.
- Host: native Codex app-server; host-selected model `gpt-6.1-sol`.
- Configuration: project-rooted stdio MCP and packaged skill; no development checkout or bespoke examples supplied.
- Isolation limitation: the host loads `/Users/zhenweitay/.codex/AGENTS.md`. This is a fresh project and conversation, not a hermetic host.

The first completed turn successfully called `parallax_design_guidance`. It proposed a provisional site structure, explained motion and static alternatives, and asked the owner whether the primary audience is couples, families or small groups. No customer answer or approval was supplied by the test orchestration.

The owner must continue the interview in that chat. Concepts, MCP-generated preview, revision loop, exact approval, validated handoff, full build, visual review and matched baseline comparison remain pending. Existing-site revamp, Claude compatibility, paid Runway generation and deployment are not verified by this run.

## Visual preview correction and revision 2

The owner completed the interview and selected The Coastal Approach. The test agent called preview guidance and created revision 1 through MCP. The owner rejected the generic grayscale preview as insufficient for evaluating the real site layout. This is a product finding, not a failed customer selection.

The renderer and canonical guidance now support a clean customer-facing site view, optional review controls on the same layout, authored palette/typography/brand, local fixed illustration recipes, coastal subject variants and cover/split/immersive compositions. These strict optional fields are revision-bound. Existing records remain supported. Illustrations remain schematic; the three packaged art families do not cover every project's custom art needs or establish final photographic quality.

The corrected package passes 24 tests, three installed-tarball smoke tests, and the real-MCP browser verifier. The new frozen snapshot has SHA-256 `7de46e3f2d1d6a1b11bb5395e94bfa3097e35a90feaeeab868d88c6a810f5367`, installed under `/private/tmp/parallax-e2e-visual-Pwwo8x/installed/node_modules/parallax-effect-pro`. The initial installed snapshot remains preserved.

The existing chat retained the owner's actual answers and concept selection. Its native connection still held the initial snapshot. A second app-server connection could not resume the loaded thread (`already has an active writer`). The desktop follow-up therefore instructed the test agent to use an SDK stdio client connected to the upgraded installed package. The test agent authored the new visual plan and regenerated revision 2 through that real MCP transport. This is an executed SDK transport bridge, not proof that the desktop's cached native MCP connection reloaded automatically.

- Preview: `/private/tmp/parallax-e2e-20261004-UQWrb5/tide-and-timber/previews/revision-2.html`.
- Design revision: `17d1690b961d6012b023ae06aa727e59f480f5502aae74723d8fc63234ac2fb2`.
- Revision 1 remains unchanged. No approval or full-site build was performed.
- The test agent reported file-browser/server restrictions and did not claim browser checks passed.
- The development chat independently ran a local browser against the actual revision 2 output: desktop 1280×800, mobile 390×844, clean/review mode toggle, scroll-linked transform change, manual reduced motion, no-JavaScript scene coverage, no horizontal overflow and no page errors passed.
- Captures: `docs/screenshots/tide-and-timber/desktop.png`, `desktop-scroll.png`, `mobile.png`. Desktop/mobile captures were visually inspected for layout and readable content.

Discovery, concept selection, MCP preview creation and a user-driven preview correction have now occurred. Exact human approval, handoff, full build, owner visual verdict and matched baseline remain pending. The current run includes a documented package correction; a final unchanged-snapshot workflow should be repeated before making release-quality claims.

## Delegated adjustment test: revision 3

The owner explicitly authorized the development chat to communicate with the isolated agent. The development chat requested stronger villa reveals, calmer coastline motion and steady visitor copy/actions. The isolated agent updated the existing plan and regenerated through the same upgraded installed MCP snapshot. Villa/terrace travel changed from 0.22/0.32 to 0.36/0.44; other coastal movement was halved. Prior previews were preserved. No approval, handoff or full build was fabricated.

Revision 3 is `8c0ac0dc771ec6fd068d3db9db58af535afc3a7b0447c19e5ceb202870e09173`, saved at `previews/revision-3.html`. Record validation passed. The isolated agent correctly distinguished source checks from unavailable browser execution. The development chat independently checked the actual new file: clean/review mode toggle, scroll motion, manual reduced motion, desktop/mobile rendering, static scene coverage, horizontal overflow and page errors passed. The `docs/screenshots/tide-and-timber/` captures now reflect revision 3, replacing the earlier revision 2 captures.

The adjustment-and-regeneration step is executed. Human visual approval remains the next gate. Keyboard runtime checks of this specific revision and the full-site checks remain pending.

## Approved handoff and local site

After the coordinating chat stated that the next step was revision 3 approval followed by a full local build, the owner replied `Proceed`. The coordinator explicitly interpreted this as approval of revision 3's layout and motion and relayed the actual message to the test agent. The agent recorded the relay provenance, validated the approval through the installed MCP and exported `handoffs/revision-3.md`. It did not claim that the owner typed the approval in the isolated chat.

The agent built `site/index.html`, `site/site.css` and `site/site.js` in the isolated project. It retained the approved illustrations, compositions and motion. Disclosed additions were an accessible, non-sending enquiry form and a fictional-demo footer; design review controls were removed. The agent ran source checks and twelve simulated motion cases and correctly reported its browser limitations.

The development chat independently executed real browser checks on the finished site:

- Desktop 1280×800 and mobile 390×844 rendered; screenshots were inspected.
- Skip-link keyboard navigation and name-to-email Tab order passed. This is bounded keyboard coverage, not a complete accessibility audit.
- All navigation anchors resolve to one target.
- Scroll-linked transforms change; live and initial OS reduced-motion preference produce static layers.
- Without JavaScript, all five scenes remain and enquiry inputs are disabled.
- Invalid departure dates are rejected; valid demo submission states that nothing was sent or saved.
- No horizontal overflow, page errors or external HTTP requests were observed.

Evidence and screenshots: `docs/screenshots/tide-and-timber/site/browser-evidence.json`, `desktop.png`, `desktop-scroll.png`, `mobile.png`, `mobile-enquiry.png`. The checker initially asserted Playwright disabled state on a fieldset; it was corrected to inspect the actual disabled input. No product change was necessary for that checker correction.

Read-only Runway authentication checks succeeded for both configured links, which resolve to the same workspace. Both return no available video models on the free plan. Upgrade options were displayed; no generation, purchase, trial, account change or media upload occurred. Video-generation integration remains blocked by workspace capability and still requires concrete asset/cost approval.

The Codex new-site flow has now executed discovery, concepts, actual MCP previews, adjustment, relayed human approval, validation, approved handoff and local build. Owner acceptance of the finished site, matched baseline comparison, existing-site revamp, Claude runtime flow, unchanged-snapshot repetition and release remain pending. These results do not establish universally superior visual output.

## Matched baseline comparison

The owner authorized proceeding to comparison. A fresh projectless chat, `Parallax comparison — baseline without MCP` (`01a102d3-e6fa-70d2-9cf4-d154aea95539`), built under `/Users/zhenweitay/Documents/Codex/2026-10-04/tide-and-timber-baseline/outputs/site`. It received the actual agreed brief, visitor copy, palette and fifteen extracted illustration planes. It received no MCP skill, renderer code, developer examples, motion-plan formulas or other conversation. The asset inputs were derived from the assisted output solely to match artwork; this does not measure the MCP's ability to source better assets.

Both session turn-context records confirm `gpt-6.1-sol` with `low` effort. Global host preferences still apply. The baseline received consolidated requirements and immediate local-build authorization; the assisted run included the real interview, preview corrections and approval. This comparison assesses final output on one brief, not identical conversation histories, total cost, token savings or universal superiority.

The baseline independently built plain HTML/CSS/JavaScript and chose its own layout and parallax. It reported desktop/mobile, assets, date validation and keyboard enquiry checks; its reduced-motion/static checks were source checks. The coordinator then used Chrome 154.0.8037.93 to render both outputs at 1280×800 and 390×844 and independently check asset loading, five static chapters, reduced motion, overflow and page errors. Both passed. Scene beginning/middle/end captures follow each site's own duration; the initial capture calculation was corrected to include the baseline's shorter scenes rather than repeatedly sample one position.

Comparison artifacts: `docs/screenshots/comparison/index.html` and `evidence.json`, with A/B desktop, mobile and villa progression PNGs. A is assisted; B is baseline. Neutral labels do not make this a fully blinded trial because the owner has already seen A.

Observed result: both outputs have real differential parallax. A uses substantial translation, rotation and scaling with native sticky progression; B uses smaller translation and subtle villa scaling. A's stronger movement clips portions of the schematic illustration during the villa scene. B is a coherent alternative. The comparison therefore demonstrates a motion difference but does not establish that A has superior design. Owner preference and acceptance remain pending; no winner or release gate is inferred from mechanical checks.

## Owner verdict: neither accepted

The owner explicitly voted for neither output. Both lack creative use of space and continuous storytelling. The requested quality includes an object persisting across chapters, turning in 3D, opening, isolating and spotlighting parts, returning them and transitioning to the next reveal. This example defines a creative capability, not a requirement that every website sell a physical product.

The visual acceptance gate has failed. Prior protocol, browser and approval/handoff evidence remains valid for the exercised mechanics, but does not establish product design quality. The next work is an architectural rethink of the canonical guidance, motion record and actual preview renderer; another bespoke showcase or stronger travel values would not repair this finding.
