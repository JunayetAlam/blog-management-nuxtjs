// Replace: multipart fields "names" + "images" (multiple, matched by order) → Asset[]
export default defineEventHandler(async (event) => {
  const { images, names } = await readAssetForm(event);

  if (names.length !== images.length) {
    throw createError({ statusCode: 400, message: "Each image needs a matching name" });
  }
  names.forEach((name) => assertAssetName(name));

  const buffers = await Promise.all(images.map(toWebp));

  try {
    return await Promise.all(buffers.map((buf, i) => uploadWebp(buf, names[i]!, true)));
  } catch {
    throw createError({ statusCode: 502, message: "Replace on Cloudinary failed" });
  }
});
