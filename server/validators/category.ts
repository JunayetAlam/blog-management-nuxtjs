import { z } from "zod";
import { order, paginationQuery, slug } from "./common";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: slug.optional(),
  description: z.string().trim().max(500).nullable().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryListQuery = paginationQuery.extend({
  sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("name"),
  order: order.default("asc"),
});
