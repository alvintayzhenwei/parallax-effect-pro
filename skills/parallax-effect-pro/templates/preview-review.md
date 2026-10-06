# Sample Preview Mode and targeted feedback

This sample is included in the npm tarball. It uses procedural actors and no provider account or external assets. It is a motion-stage proof, not an approved website.

## Installed package sample

From your trusted project directory after a local npm installation:

```sh
cp node_modules/@alvintayzhenwei/parallax-effect-pro/skills/parallax-effect-pro/templates/story.json story-review.json
./node_modules/.bin/parallax-effect-pro preview --root "$PWD" --record story-review.json --output previews/story-review-r1.html
```

Before registry publication, install a reviewed local tarball with `npm install /absolute/path/alvintayzhenwei-parallax-effect-pro-0.1.1.tgz`. After publication, use the reviewed registry version instead. Node.js 24 or later is required. Existing output files are never overwritten.

## Pinpoint feedback

1. Open the returned HTML and scroll to the desired stage.
2. Open **Review motion**, use the stage's **Seek** slider, and note the displayed pose percentage and revision. The percentage is local to that stage. Slider keyboard arrows allow small adjustments; the displayed percentage is rounded.
3. Send the agent the preview filename, revision, stage ID, pose, viewport size, object, desired change and affected range. Attach a screenshot if useful.
4. Select **Resume native scroll** and inspect the same range forward and backward. Manual seeking changes the stage pose without moving the page or saving the source record.
5. The agent updates the record and creates a fresh preview. Review mobile/static fallbacks and the new revision before approval.

Example feedback:

> At stage [ID], pose 62%, desktop 1280 × 800, the grass overlaps the enquiry text. Reduce foreground travel from 55% through 70%. Preserve the building/path attachment and earlier approach. Generate revision 2 for review.

For a host-owned video preview, also identify the video timestamp and its scroll mapping. Do not infer separate geometry from a flattened video. Other design tools remain responsible for the site's layout and components.
