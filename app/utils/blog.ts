// Fixed locale + UTC so server-rendered dates match what the browser hydrates
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

export function formatPostDate(value: string | null | undefined) {
  return value ? dateFormat.format(new Date(value)) : "";
}

export function readingTime(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

// Resizes/crops a Cloudinary image on delivery, e.g. cldImage(url, "c_fill,w_800,h_450")
export function cldImage(url: string, transformation: string) {
  return url.includes("/image/upload/")
    ? url.replace("/image/upload/", `/image/upload/${transformation},q_auto,f_auto/`)
    : url;
}
