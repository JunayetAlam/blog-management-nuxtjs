import { z } from "zod";
import { order, paginationQuery, slug } from "./common";

export const createTagSchema = z.object({
  name: z.string().trim().min(1).max(50),
  slug: slug.optional(),
});

export const updateTagSchema = createTagSchema.partial();

export const tagListQuery = paginationQuery.extend({
  sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("name"),
  order: order.default("asc"),
});
