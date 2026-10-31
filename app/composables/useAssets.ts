const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_FILE_SIZE = 4 * 1024 * 1024; // must match the server limit
const MAX_FILES = 10;

export function errorMessage(error: unknown, fallback = "Something went wrong") {
  const e = error as { data?: { message?: string }; message?: string };
  return e?.data?.message || e?.message || fallback;
}

export function useAssets() {
  // Throws a readable message for anything the server would reject anyway
  function validateFiles(files: File[]) {
    if (files.length > MAX_FILES) throw new Error(`You can upload up to ${MAX_FILES} images at once`);
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) throw new Error(`${file.name}: only JPG, PNG, WebP, GIF or AVIF`);
      if (file.size > MAX_FILE_SIZE) throw new Error(`${file.name} is larger than 4 MB`);
    }
  }

  async function upload(files: File[]) {
    validateFiles(files);
    const form = new FormData();
    for (const file of files) form.append("images", file);
    return $fetch<Asset[]>("/api/assets", { method: "POST", body: form });
  }

  async function remove(names: string[]) {
    await Promise.allSettled(names.map((name) => $fetch("/api/assets", { method: "DELETE", body: { name } })));
  }

  return { upload, remove, validateFiles };
}
