# Effect selection and motion maps

These are design recommendations, not universal speed or performance thresholds. Source taxonomy: [Justinmind](https://www.justinmind.com/web-design/parallax-effect-website-examples), [Elementor](https://elementor.com/blog/parallax-effects/).

| Effect | Good fit | Assets and constraints | Fallback |
| --- | --- | --- | --- |
| Layered depth | Spatial storytelling or focal hero | Two to four distinct planes; crop margin and separable subjects | Static composition |
| Background drift | Quiet editorial transitions | One optimized image/shape; content remains steady | Static background |
| Pointer depth | Decorative desktop focal point | Small bounded movement; no essential pointer-only action | No movement on coarse pointer |
| Sticky reveal | Product explanation or staged work | Native document scroll, short scenes, clear exit | Sequential content |
| Horizontal movement | Panorama or relationships | Preserve vertical navigation and text reading order | Vertical stack |
| Video scrubbing | A movement that explains a product | Seekable media or bounded frame sequence, poster/static image, measured decoding cost | Poster plus normal content |
| 3D | Spatial inspection important to story | Verified rendering library/assets, device and GPU budget | Still image with equivalent content |

Generated assets are never guaranteed to match scene requirements.

For each scene record: section id, effect, start/middle/end, layers, direction, normalized travel, readable text/CTA zone, crop allowance, mobile and reduced-motion behavior. Travel describes relative motion, not frame rate or clinical comfort.

The shipped wireframe renders the four core effects with geometric placeholders. Video/3D appear as annotated storyboards. Do not call those final media or fully functioning advanced effects. Each complete site chooses its own verified implementation.

A useful comparison includes one restrained concept, one expressive narrative and one ambitious direction when suitable. Relative effort must reflect asset creation, fallback and verification—not just coding time.

Controls in the preview change only exploratory viewing. Retain chosen values in the motion plan, create a fresh preview and approve the corresponding revision before implementation. Never attach approval to a screenshot with unknown settings.
