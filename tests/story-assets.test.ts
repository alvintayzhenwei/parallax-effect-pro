import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, readFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadStoryAssets, verifiedStoryRevision } from "../src/story-assets.ts";
import { sha256 } from "../src/project.ts";
import { storySchema } from "../src/story-records.ts";
const fixture = JSON.parse(
  await readFile(new URL("fixtures/story.json", import.meta.url), "utf8"),
);
const png = Buffer.from(
  "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000b49444154789c636000020000050001a5f645400000000049454e44ae426082",
  "hex",
);
function glb(
  json: any = {
    asset: { version: "2.0" },
    buffers: [{ byteLength: 4 }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 4 }],
  },
) {
  let encoded = Buffer.from(JSON.stringify(json));
  encoded = Buffer.concat([
    encoded,
    Buffer.alloc((4 - (encoded.length % 4)) % 4, 32),
  ]);
  const bytes = Buffer.alloc(12 + 8 + encoded.length + 8 + 4);
  bytes.write("glTF");
  bytes.writeUInt32LE(2, 4);
  bytes.writeUInt32LE(bytes.length, 8);
  bytes.writeUInt32LE(encoded.length, 12);
  bytes.writeUInt32LE(0x4e4f534a, 16);
  encoded.copy(bytes, 20);
  bytes.writeUInt32LE(4, 20 + encoded.length);
  bytes.writeUInt32LE(0x004e4942, 24 + encoded.length);
  return bytes;
}
async function setup(t: any) {
  const root = await mkdtemp(join(tmpdir(), "story-assets-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
async function asset(
  root: string,
  bytes: Buffer,
  type: "raster" | "glb" = "raster",
  mime = "image/png",
) {
  const p = structuredClone(fixture);
  await writeFile(join(root, "asset.bin"), bytes);
  p.assets = [
    {
      id: "asset",
      type,
      path: "asset.bin",
      digest: sha256(bytes),
      ...(type === "raster" ? { mime } : {}),
    },
  ];
  return storySchema.parse(p);
}
test("verified PNG JPEG WebP and self-contained GLB are loaded", async (t) => {
  const root = await setup(t);
  for (const [bytes, mime] of [
    [png, "image/png"],
    [Buffer.from("ffd8ffe00004ffd9", "hex"), "image/jpeg"],
    [
      Buffer.from("524946460c000000574542505650384c00000000", "hex"),
      "image/webp",
    ],
  ] as const) {
    const p = await asset(root, bytes, "raster", mime);
    assert.equal((await loadStoryAssets(root, p))[0]!.digest, sha256(bytes));
  }
  const p = await asset(root, glb(), "glb");
  assert.equal((await loadStoryAssets(root, p))[0]!.type, "glb");
});
test("refuses mismatched formats, changed bytes, oversized and symlink imports", async (t) => {
  const root = await setup(t);
  let p = await asset(root, png, "raster", "image/jpeg");
  await assert.rejects(loadStoryAssets(root, p));
  p = await asset(root, png);
  await writeFile(join(root, "asset.bin"), Buffer.from("changed"));
  await assert.rejects(loadStoryAssets(root, p));
  p = await asset(root, Buffer.alloc(5 * 1024 * 1024 + 1));
  await assert.rejects(loadStoryAssets(root, p));
  await writeFile(join(root, "image.png"), png);
  await symlink("image.png", join(root, "link.png"));
  p = await asset(root, png);
  p.assets[0]!.path = "link.png";
  await assert.rejects(loadStoryAssets(root, p));
  p.assets[0]!.path = "../escape.png";
  await assert.rejects(loadStoryAssets(root, p));
});
test("refuses external GLB references, extensions, malformed chunks and out-of-bounds views", async (t) => {
  const root = await setup(t);
  for (const json of [
    {
      asset: { version: "2.0" },
      buffers: [{ byteLength: 4, uri: "https://example.com/model.bin" }],
    },
    {
      asset: { version: "2.0" },
      images: [{ uri: "data:image/png;base64,AAAA" }],
    },
    {
      asset: { version: "2.0" },
      extensionsUsed: ["KHR_draco_mesh_compression"],
    },
    { asset: { version: "2.0" }, nodes: [{ extensions: { unknown: {} } }] },
    {
      asset: { version: "2.0" },
      buffers: [{ byteLength: 4 }],
      bufferViews: [{ buffer: 0, byteOffset: 3, byteLength: 4 }],
    },
  ]) {
    const p = await asset(root, glb(json), "glb");
    await assert.rejects(loadStoryAssets(root, p));
  }
  const bytes = glb();
  bytes.writeUInt32LE(bytes.length + 1, 8);
  await assert.rejects(loadStoryAssets(root, await asset(root, bytes, "glb")));
});
test("revision verifies current asset and reviewed context bytes", async (t) => {
  const root = await setup(t);
  const p = await asset(root, png);
  await writeFile(join(root, "design.txt"), "reviewed shell");
  p.designContext.references = [
    { path: "design.txt", digest: sha256("reviewed shell") },
  ];
  const initial = await verifiedStoryRevision(root, p);
  await writeFile(join(root, "design.txt"), "changed shell");
  await assert.rejects(verifiedStoryRevision(root, p));
  p.designContext.references[0]!.digest = sha256("changed shell");
  assert.notEqual(await verifiedStoryRevision(root, p), initial);
  await writeFile(
    join(root, "asset.bin"),
    Buffer.concat([png, Buffer.from("changed")]),
  );
  await assert.rejects(verifiedStoryRevision(root, p));
});
test("aggregate imported bytes have a 16 MiB ceiling", async (t) => {
  const root = await setup(t);
  const bytes = Buffer.concat([
    png,
    Buffer.alloc(4 * 1024 * 1024 - png.length),
  ]);
  const p = await asset(root, bytes);
  p.assets = Array.from({ length: 5 }, (_, i) => ({
    ...p.assets[0]!,
    id: `asset-${i}`,
  }));
  await assert.rejects(loadStoryAssets(root, p), /total/i);
});
