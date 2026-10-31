// Remove: JSON body { name } → { name }
export default defineEventHandler(async (event) => {
  const { name } = (await readBody<{ name?: string }>(event)) ?? {};
  assertAssetName(name);

  if (!(await removeAsset(name))) {
    throw createError({ statusCode: 404, message: `Asset not found: ${name}` });
  }

  return { name };
});
