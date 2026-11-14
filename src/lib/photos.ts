import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import type { ImagePickerAsset } from "expo-image-picker";

/** Wide enough to read a scratch or a part number; small enough to upload on a workshop connection. */
const MAX_WIDTH = 1600;

/** Shrinks a photo before it is uploaded (CLAUDE.md §6). */
export async function shrinkPhoto(asset: Pick<ImagePickerAsset, "uri" | "width">): Promise<string> {
  const context = ImageManipulator.manipulate(asset.uri);
  if (asset.width > MAX_WIDTH) context.resize({ width: MAX_WIDTH });
  const image = await context.renderAsync();
  const result = await image.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });
  return result.uri;
}
