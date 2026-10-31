import { z } from "zod";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const slug = z
  .string()
  .trim()
  .toLowerCase()
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug may only contain lowercase letters, numbers and single hyphens");

export const image = z.object({
  url: z.url(),
  name: z.string().trim().min(1),
});

export const order = z.enum(["asc", "desc"]);

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  // Prisma passes `contains` to MongoDB as a raw regex, so special characters must be escaped
  search: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((s) => s?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
});
