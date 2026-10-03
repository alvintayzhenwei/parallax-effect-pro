import { readContained, sha256, designRevision } from "./project.ts";
import { storySchema, type StoryRecord } from "./story-records.ts";
export type LoadedAsset = {
  id: string;
  type: "raster" | "glb";
  bytes: Buffer;
  digest: string;
};
const assetLimit = 5 * 1024 * 1024,
  totalLimit = 16 * 1024 * 1024;
function validateRaster(bytes: Buffer, mime: string) {
  const valid =
    mime === "image/png"
      ? bytes.length >= 33 &&
        bytes.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex")) &&
        bytes.toString("ascii", 12, 16) === "IHDR"
      : mime === "image/jpeg"
        ? bytes.length >= 4 &&
          bytes[0] === 255 &&
          bytes[1] === 216 &&
          bytes[2] === 255
        : mime === "image/webp" &&
          bytes.length >= 16 &&
          bytes.toString("ascii", 0, 4) === "RIFF" &&
          bytes.toString("ascii", 8, 12) === "WEBP" &&
          ["VP8 ", "VP8L", "VP8X"].includes(bytes.toString("ascii", 12, 16));
  if (!valid) throw new Error("Raster MIME and signature do not match");
}
function validateGlb(bytes: Buffer) {
  if (
    bytes.length < 20 ||
    bytes.toString("ascii", 0, 4) !== "glTF" ||
    bytes.readUInt32LE(4) !== 2 ||
    bytes.readUInt32LE(8) !== bytes.length
  )
    throw new Error("Invalid GLB header");
  let cursor = 12,
    json: Record<string, unknown> | undefined,
    bin: Buffer | undefined,
    count = 0;
  while (cursor < bytes.length) {
    if (cursor + 8 > bytes.length)
      throw new Error("Incomplete GLB chunk header");
    const size = bytes.readUInt32LE(cursor),
      type = bytes.readUInt32LE(cursor + 4);
    cursor += 8;
    if (size % 4 !== 0 || cursor + size > bytes.length)
      throw new Error("Invalid GLB chunk bounds");
    const chunk = bytes.subarray(cursor, cursor + size);
    cursor += size;
    if (count === 0 && type === 0x4e4f534a) {
      try {
        json = JSON.parse(chunk.toString("utf8"));
      } catch {
        throw new Error("Invalid GLB JSON");
      }
    } else if (count === 1 && type === 0x004e4942) bin = chunk;
    else throw new Error("Unsupported GLB chunk");
    count++;
  }
  if (
    !json ||
    typeof json !== "object" ||
    Array.isArray(json) ||
    (json.asset as { version?: string })?.version !== "2.0"
  )
    throw new Error("GLB must declare glTF 2.0");
  // Inspect all keys, including nested extension declarations, before any browser loader runs.
  const stack: unknown[] = [json];
  let inspected = 0;
  while (stack.length) {
    const item = stack.pop();
    if (++inspected > 200000)
      throw new Error("GLB JSON exceeds inspection limit");
    if (item && typeof item === "object")
      for (const [key, value] of Object.entries(item)) {
        if (
          [
            "uri",
            "extensions",
            "extensionsUsed",
            "extensionsRequired",
          ].includes(key)
        )
          throw new Error(
            "External GLB references and extensions are unsupported",
          );
        if (value && typeof value === "object") stack.push(value);
      }
  }
  const array = (key: string): Record<string, unknown>[] => {
    const value = json![key] ?? [];
    if (
      !Array.isArray(value) ||
      value.some((v) => !v || typeof v !== "object" || Array.isArray(v))
    )
      throw new Error("Invalid GLB collection");
    return value;
  };
  const buffers = array("buffers"),
    views = array("bufferViews"),
    images = array("images");
  if (buffers.length > 1) throw new Error("GLB supports one embedded buffer");
  const length = buffers[0]?.byteLength;
  if (
    buffers.length &&
    (!Number.isSafeInteger(length) ||
      (length as number) < 0 ||
      !bin ||
      (length as number) > bin.length ||
      bin.length - (length as number) > 3)
  )
    throw new Error("Invalid embedded GLB buffer");
  for (const view of views) {
    const offset = view.byteOffset ?? 0,
      size = view.byteLength;
    if (
      view.buffer !== 0 ||
      !Number.isSafeInteger(offset) ||
      (offset as number) < 0 ||
      !Number.isSafeInteger(size) ||
      (size as number) <= 0 ||
      typeof length !== "number" ||
      (offset as number) + (size as number) > length
    )
      throw new Error("Invalid GLB buffer view bounds");
  }
  for (const image of images) {
    if (
      !Number.isSafeInteger(image.bufferView) ||
      !views[image.bufferView as number] ||
      !["image/png", "image/jpeg", "image/webp"].includes(
        String(image.mimeType),
      )
    )
      throw new Error("GLB images must use embedded supported buffer views");
    const view = views[image.bufferView as number]!;
    validateRaster(
      bin!.subarray(
        Number(view.byteOffset ?? 0),
        Number(view.byteOffset ?? 0) + Number(view.byteLength),
      ),
      String(image.mimeType),
    );
  }
}
export async function loadStoryAssets(
  root: string,
  record: StoryRecord,
): Promise<LoadedAsset[]> {
  const story = storySchema.parse(record),
    loaded: LoadedAsset[] = [];
  let total = 0;
  for (const asset of story.assets) {
    const bytes = await readContained(root, asset.path, assetLimit);
    total += bytes.length;
    if (total > totalLimit)
      throw new Error("Imported asset total exceeds 16 MiB");
    const digest = sha256(bytes);
    if (digest !== asset.digest)
      throw new Error("Asset bytes no longer match reviewed digest");
    if (asset.type === "raster") validateRaster(bytes, asset.mime);
    else validateGlb(bytes);
    loaded.push({ id: asset.id, type: asset.type, bytes, digest });
  }
  return loaded;
}
export async function verifiedStoryRevision(
  root: string,
  story: StoryRecord,
): Promise<string> {
  await loadStoryAssets(root, story);
  for (const reference of story.designContext.references) {
    const bytes = await readContained(root, reference.path);
    if (sha256(bytes) !== reference.digest)
      throw new Error("Design context bytes no longer match reviewed digest");
  }
  return designRevision(story);
}
