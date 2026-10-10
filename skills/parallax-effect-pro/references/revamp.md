# Existing-site revamp

## Deliverable and technique

For an implementation request, the deliverable is a visibly changed, verified local version of the existing website. A standalone stage or exported handoff is intermediate evidence. For an audit, concepts, prompts or preview-only request, deliver only that requested scope. Publication and paid generation remain separate decisions.

Inspect the requested routes at representative viewport sizes. Capture the baseline and trace the real flow: scroll owner, component, hook/listener, progress value, CSS/renderer, visible element. Read each affected caller. Identify existing transforms, sticky ancestors, clipping, semantic content, navigation and reduced-motion behavior. Preserve the site identity and working features unless redesign is requested.

Choose the smallest suitable route:

- **Existing DOM/CSS:** reuse the incumbent hook, native CSS or installed dependency. A story record, MCP preview and package export are not required. The host produces and reviews the real local page.
- **Authored actors/geometry:** use version 2 records, package preview, exact approval and exported runtime. Mount only the owned stage; bind progress to the real scroller and dispose on route teardown.
- **Video:** the host owns playback and scroll seeking. Verify actual media seekability, decoding, poster and static alternatives. Do not treat video as detachable geometry or claim native package video import.

Before editing, use `templates/revamp.md` to name the route and components, visible start/middle/end change, movement range, reading hold, transition/exit, stable content, asset needs and mobile/static behavior. If the user already selected a direction, apply it rather than restarting the concept interview. Otherwise compare distinct directions and obtain selection before authoring a preview. Carry authorized local preview or implementation work through; concept selection does not approve paid media or deployment.

## Runnable nested-scroll example

Save the following as a local HTML file and open it. Scroll inside the labelled region. The decorative wrapper moves while copy remains in document flow. This illustrates the native-host route; reuse an existing hook rather than adding this second driver. Its progress spans the entire scroller; a section-specific effect must measure that section relative to the same scroller. Do not substitute `window.scrollY` for a nested element's `scrollTop`.

```html
<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Nested scroll depth example</title>
<style>
  #deck { height: 320px; overflow: auto; border: 1px solid; }
  #content { min-height: 1200px; padding: 24px; }
  #art { position: sticky; top: 24px; width: 80px; height: 80px;
    background: teal; transform: translateY(var(--revamp-y, 0px)); }
</style>
<h1>Existing-site motion example</h1>
<main id="deck" tabindex="0" aria-label="Scroll to inspect depth">
  <div id="content">
    <div id="art" aria-hidden="true"></div>
    <h2>Stable reading content</h2><p>Scroll this region, then reverse direction.</p>
    <p>Reduced motion keeps the decorative wrapper still.</p>
  </div>
</main>
<button id="stop">Dispose motion</button>
<script>
  const scroller = document.getElementById('deck');
  const content = document.getElementById('content');
  const art = document.getElementById('art');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  function update() {
    frame = 0;
    const range = scroller.scrollHeight - scroller.clientHeight;
    const progress = range > 0 ? Math.min(1, Math.max(0, scroller.scrollTop / range)) : 0;
    art.style.setProperty('--revamp-y', `${reduced.matches ? 0 : progress * 40}px`);
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  const resize = new ResizeObserver(schedule);
  resize.observe(scroller);
  resize.observe(content);
  scroller.addEventListener('scroll', schedule, { passive: true });
  reduced.addEventListener('change', schedule);
  update();
  function dispose() {
    scroller.removeEventListener('scroll', schedule);
    reduced.removeEventListener('change', schedule);
    resize.disconnect();
    cancelAnimationFrame(frame);
    art.style.removeProperty('--revamp-y');
  }
  document.getElementById('stop').addEventListener('click', dispose, { once: true });
</script>
</html>
```

In a framework, return the equivalent cleanup from the effect or call it on unmount. For a packaged stage, pass measured progress to `handle.seek(progress)` after `handle.ready`, then call `handle.dispose()` on teardown. Keep one writer per animated property; use an owned wrapper if the host already transforms the subject. Observe late content/asset sizing and route changes rather than assuming initial dimensions remain correct.

## Visible-effect diagnosis

| Symptom | Inspect before changing intensity |
| --- | --- |
| Nothing moves | Does the actual scroll owner's position change? Does progress reach the hook/runtime? Is reduced motion active? Are selectors and mounts present? |
| Progress changes but artwork stays still | Is the CSS variable inherited by the target? Is another transform writer overriding it? Is the stage ready, covered or clipped? |
| Video stays at frame zero | Check metadata, nonempty seekable ranges, actual `currentTime` and painted frames. Diagnose loading/encoding/serving before using a bounded Blob fallback. |
| Mobile freezes or flashes black | Keep the poster until a frame paints, coalesce pending seeks, inspect device decoding and gesture requirements, and use measured lighter media or static content. |
| Transition pops or appears to rewind | Compare actual boundary poses/frames, subject identity and motion direction. A crossfade cannot repair incompatible compositions. |
| Mounting again duplicates motion | Check listener/frame/observer cleanup and runtime disposal. Revoke created media object URLs when no longer used. |

## Acceptance evidence

Compare the real baseline and revised site with the same viewport, route, content and scroll checkpoints. Inspect start/middle/end and immediately around each transition in both directions. Verify mobile layout, keyboard/actions, resize, initial and live reduced motion, static content and console/network failures. Record actual progress and visible movement; screenshots alone do not establish continuous behavior. Measure performance where the effect adds significant rendering or media cost. Record unavailable checks and the owner's creative verdict separately. An unchanged site is not a successful revamp; a visible difference is not automatically an improvement.

## Sources

Workflow lessons reviewed 2026-10-08: [Scroll World skill](https://github.com/oso95/scroll-world/blob/main/skills/scroll-world/SKILL.md) and [scrub engine](https://github.com/oso95/scroll-world/blob/main/skills/scroll-world/references/scrub-engine.js): concrete assembly, reading dwell, actual-frame joins and failure-specific QA. Its window-scroll, full-page video architecture needs adaptation for incumbent nested scrollers and component lifecycles. Source claims about seamless output, pricing and performance are not guarantees for this package.

Native API references: [scrollTop](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop), [scrollHeight](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight), [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame), [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver), [MediaQueryList change](https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/change_event). Resolve framework/library documentation through Context7 when adapting the example.
