// Cloudinary public id from a delivery URL, e.g.
// https://res.cloudinary.com/<cloud>/image/upload/v123/e-plaza/photo-ab12.webp → e-plaza/photo-ab12
export function assetNameFromUrl(url: string) {
  const match = url.match(/^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:v\d+\/)?(.+?)\.[a-z0-9]+(?:\?.*)?$/i);
  return match?.[1] ?? null;
}

// Every Cloudinary image referenced by <img> tags in a piece of HTML
export function extractAssetNames(html: string) {
  const names = new Set<string>();
  for (const [, src] of html.matchAll(/<img\b[^>]*?\ssrc=["']([^"']+)["']/gi)) {
    const name = src && assetNameFromUrl(src);
    if (name) names.add(name);
  }
  return [...names];
}
