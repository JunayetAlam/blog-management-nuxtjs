// Appends -2, -3, ... until `exists` reports the slug is free (slugify lives in shared/utils)
export async function uniqueSlug(text: string, exists: (slug: string) => Promise<boolean>) {
  const root = slugify(text) || "item";
  let slug = root;
  for (let n = 2; await exists(slug); n++) slug = `${root}-${n}`;
  return slug;
}
