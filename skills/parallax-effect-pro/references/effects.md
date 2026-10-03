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

## Core recipes

- **Layered depth:** Assign distant atmosphere, a focal subject and a near framing object distinct travel values. Start with overlap, separate the planes as the viewport crosses the scene, and resolve toward the action. Keep reading copy outside the moving artwork. A foreground that travels exactly like the background does not establish depth.
- **Background drift:** Move an oversized distant plane behind a stationary focal subject and stationary copy. Start with a coherent landscape, change its crop through the middle, and retain a clear destination at the end. Keep enough image margin to avoid uncovered edges. Layers without a background plane will stay static in this recipe.
- **Pointer depth:** Give background, subject and frame separate pointer responses. The background moves least; the foreground moves most. Bound travel around the reading zone, restore a coherent center, and provide the same meaning without pointer input. Coarse pointers receive the static composition; never require hover to reach content.
- **Sticky reveal:** Use a tall native-scroll section containing a shorter sticky stage. Start assembled, fan the planes apart in the middle to explain their relationship, then resolve them before the stage exits. Give start/middle/end meaningful narrative beats. Pinning plus a fade is insufficient: compare the planes' positions. Mobile, reduced motion and no-JavaScript states show a normal sequential composition with all narrative beats available.

The wireframe maps recorded direction and normalized travel to effect-specific transforms. Intensity starts at 1 so planned motion reflects the saved travel values. Changes to effect or intensity are exploratory overrides. To retain an intensity setting, multiply the corresponding recorded travel values by it, regenerate, and review the resulting revision. The preview cannot infer a superior motion plan from arbitrary labels: choose scene duties and review the actual output.

A useful comparison includes one restrained concept, one expressive narrative and one ambitious direction when suitable. Relative effort must reflect asset creation, fallback and verification—not just coding time.

Controls in the preview change only exploratory viewing. Retain chosen values in the motion plan, create a fresh preview and approve the corresponding revision before implementation. Never attach approval to a screenshot with unknown settings.
