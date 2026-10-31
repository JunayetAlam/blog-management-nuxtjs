export function slugify(text: string, maxLength = 100) {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/, "");
}

// Appends -2, -3, ... until `exists` reports the slug is free
export async function uniqueSlug(text: string, exists: (slug: string) => Promise<boolean>) {
  const root = slugify(text) || "item";
  let slug = root;
  for (let n = 2; await exists(slug); n++) slug = `${root}-${n}`;
  return slug;
}
