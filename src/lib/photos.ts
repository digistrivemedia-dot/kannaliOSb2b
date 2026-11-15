import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import type { ImagePickerAsset } from "expo-image-picker";

/** Wide enough to read a scratch or a part number; small enough for a workshop connection. */
const MAX_WIDTH = 1600;

/** Shrinks a photo as soon as it is taken (CLAUDE.md §6). */
export async function shrinkPhoto(asset: Pick<ImagePickerAsset, "uri" | "width">): Promise<string> {
  const context = ImageManipulator.manipulate(asset.uri);
  if (asset.width > MAX_WIDTH) context.resize({ width: MAX_WIDTH });
  const image = await context.renderAsync();
  const result = await image.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });
  return result.uri;
}

/** Smaller and smaller tries until a photo fits the API's limit. */
const ATTEMPTS = [
  { width: 1600, compress: 0.7 },
  { width: 1280, compress: 0.6 },
  { width: 1024, compress: 0.55 },
  { width: 800, compress: 0.5 },
  { width: 640, compress: 0.45 },
];

/**
 * A photo as the inline data URL the API stores (`data:image/jpeg;base64,…`), made small enough for
 * `maxBytes`. Links to photos the API already has are passed through unchanged.
 */
async function toDataUrl(uri: string, maxBytes: number): Promise<string> {
  if (/^https?:\/\//.test(uri) || uri.startsWith("data:")) return uri;
  let last = "";
  for (const attempt of ATTEMPTS) {
    const image = await ImageManipulator.manipulate(uri)
      .resize({ width: attempt.width })
      .renderAsync();
    const result = await image.saveAsync({
      compress: attempt.compress,
      format: SaveFormat.JPEG,
      base64: true,
    });
    last = result.base64 ?? "";
    if ((last.length * 3) / 4 <= maxBytes) break;
  }
  return `data:image/jpeg;base64,${last}`;
}

/** Turns every photo of a form into what the API takes, in order. */
export function toDataUrls(uris: string[], maxBytes: number): Promise<string[]> {
  return Promise.all(uris.map((uri) => toDataUrl(uri, maxBytes)));
}
