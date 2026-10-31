// Upload: multipart field "images" (multiple) → Asset[]
export default defineEventHandler(async (event) => {
  const { images } = await readAssetForm(event);

  // Convert everything first so a bad file fails the request before anything is stored
  const buffers = await Promise.all(images.map(toWebp));

  const results = await Promise.allSettled(
    buffers.map((buf, i) => uploadWebp(buf, newAssetName(images[i]!.filename))),
  );

  const uploaded = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
  if (uploaded.length !== results.length) {
    // Roll back partial uploads
    await Promise.allSettled(uploaded.map((a) => removeAsset(a.name)));
    throw createError({ statusCode: 502, message: "Upload to Cloudinary failed" });
  }

  return uploaded;
});
