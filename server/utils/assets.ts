import { randomUUID } from "node:crypto";
import sharp from "sharp";
import type { H3Event } from "h3";

export interface Asset {
  url: string;
  name: string;
}

type FormPart = NonNullable<
  Awaited<ReturnType<typeof readMultipartFormData>>
>[number];

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const MAX_FILE_SIZE = 4 * 1024 * 1024; // Vercel caps request bodies at ~4.5 MB
const MAX_FILES = 10;
const MAX_WIDTH = 2560;

const assetFolder = () => process.env.CLOUDINARY_PROJECT_NAME || "assets";

export async function readAssetForm(event: H3Event) {
  const parts = (await readMultipartFormData(event)) ?? [];
  const images = parts.filter((p) => p.name === "images" && p.filename);
  const names = parts
    .filter((p) => p.name === "names")
    .map((p) => p.data.toString().trim());

  if (!images.length)
    throw createError({ statusCode: 400, message: "No images provided" });
  if (images.length > MAX_FILES) {
    throw createError({
      statusCode: 400,
      message: `Maximum ${MAX_FILES} images per request`,
    });
  }
  for (const img of images) {
    if (!img.type || !ALLOWED_TYPES.includes(img.type)) {
      throw createError({
        statusCode: 400,
        message: `Unsupported file type: ${img.filename}`,
      });
    }
    if (img.data.length > MAX_FILE_SIZE) {
      throw createError({
        statusCode: 400,
        message: `File too large (max 4 MB): ${img.filename}`,
      });
    }
  }

  return { images, names };
}

export async function toWebp(part: FormPart) {
  try {
    return await sharp(part.data, { animated: true })
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    throw createError({
      statusCode: 400,
      message: `Invalid image: ${part.filename}`,
    });
  }
}

export function newAssetName(filename = "image") {
  const base = slugify(filename.replace(/\.[^.]+$/, ""), 50);
  return `${assetFolder()}/${base || "image"}-${randomUUID().slice(0, 8)}`;
}

// Only allow touching assets inside this project's folder
export function assertAssetName(name: unknown): asserts name is string {
  if (
    typeof name !== "string" ||
    !name.startsWith(`${assetFolder()}/`) ||
    name.includes("..")
  ) {
    throw createError({
      statusCode: 400,
      message: `Invalid asset name: ${String(name)}`,
    });
  }
}

export function uploadWebp(buffer: Buffer, name: string, overwrite = false) {
  return new Promise<Asset>((resolve, reject) => {
    useCloudinary()
      .uploader.upload_stream(
        {
          public_id: name,
          resource_type: "image",
          overwrite,
          invalidate: overwrite,
        },
        (error, result) => {
          if (error || !result)
            return reject(error ?? new Error("Upload failed"));
          resolve({ url: result.secure_url, name: result.public_id });
        },
      )
      .end(buffer);
  });
}

export async function removeAsset(name: string) {
  const { result } = await useCloudinary().uploader.destroy(name, {
    invalidate: true,
  });
  return result === "ok";
}
