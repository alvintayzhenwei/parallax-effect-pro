# Demo redesign: motion directions for review

Status: review-only prototypes. No production direction has been selected. The previous example remains available, but it has not passed the owner's visual acceptance.

## Intended result

Demonstrate conspicuous parallax and a coherent scroll story rather than a conventional page with barely moving decoration. Keep native scrolling, legible copy, usable mobile layout, keyboard controls, and static reduced-motion/no-JavaScript content. Compare the experience before purchasing or generating media.

## Three directions

### Kinetic Atelier

A graphic studio becomes a moving composition. Large typography separates from the artwork; folded geometric panels move through foreground and background, then settle into an editorial arrangement. A sticky stage makes the beginning, middle, and end of the transformation easy to compare. Paper-model construction is the inspiration, but the page remains a fictional studio demonstration.

Production assets: original vector forms, project compositions, and optional paper/material photography. Video is unnecessary. Main risk: excessive abstraction could distract from the studio's actual work; production chapters must connect each motion to a clear project story.

### Expedition — recommendation

A visitor travels into a landscape. Distant, middle, and near layers travel at visibly different rates while a central frame expands. Scene changes establish arrival rather than three repetitions of the same entrance. The review prototype uses visibly schematic geometry to validate movement; it does not claim to contain finished scenic photography.

Production assets: one coordinated scenic composition with foreground cutouts, middle-ground scene, distant background, and static poster. An approved Runway clip could enrich one arrival, but layered stills can carry the experience. Main risk: mismatched assets and aggressive zoom; limit motion travel and keep all essential copy separate from decorative layers.

### Gallery

A fictional studio exhibition pins the artwork while the reader moves between chapters. Type and oversized graphic plates slide along separate tracks; the artwork's scale changes as the composition moves from introduction to case study. A cobalt-and-paper direction gives dense project information a coherent home.

Production assets: original project plates and licensed/reviewed project imagery. Video is optional. Main risk: familiar portfolio treatment; the scroll choreography must be visible and tied to chapter changes.

## Preview controls and approval

Switch direction, scroll through the sticky study, compare start/middle/end, and toggle reduced motion. These controls do not record approval. Choosing a direction in chat authorizes refining that direction's complete layout and motion map; ambiguous preferences require clarification. The final production build still follows an explicit layout-and-motion decision.

## Acceptance before rebuilding

- The owner can identify the effect without being told where to look.
- The three studies have different compositions and movement, not only different colors.
- Scroll changes visibly affect multiple depth planes.
- Mobile remains readable without sideways overflow.
- Manual motion reduction survives OS preference changes.
- No paid generation, provider upload, merging, publishing, or deployment occurs during this comparison.

## Inspiration exploration

Seven grounded candidates were considered: scenic expedition, gallery exhibition, architectural section, kinetic paper atelier, editorial specimen, photographic contact sheet, and stage scrim. Kinetic paper construction carries the moving-composition study; Expedition remains the recommendation because depth is immediately legible. The review prototype uses code to make motion testable rather than judging motion from a still comp. No standing comp-first/code-first preference is set.

## Executed prototype checks

On 2026-10-04, isolated headless Chrome verified all three studies at 1280×800 and 390×844. Scroll changed their layer transforms; manual reduction held a fixed composition across scrolling and survived OS preference changes. Live OS reduction forced computed transforms to none. No horizontal overflow or JavaScript page errors occurred. With JavaScript disabled, all three studies remained visible. Desktop/mobile captures are in `motion-captures/`.

Reproduce with `PARALLAX_BROWSER_EXECUTABLE=/path/to/chrome node examples/motion-directions/check.mjs`, or omit that variable after installing Playwright Chromium. The check uses a fresh browser profile and refreshes prototype captures.

The detector flagged small functional labels; these were enlarged in one correction pass. Its Arial/body-font and warm-paper palette warnings are accepted for this motion schematic, not authority for a final visual system. Final photography, type licensing, detailed motion acceptance, physical-device performance, and the production rebuild remain pending the owner's direction decision. No production demo, package runtime, remote PR, or publishing state was changed in this preview round.
