import { z } from "zod";
import { image, objectId, order, paginationQuery, slug } from "./common";

const status = z.enum(["DRAFT", "PUBLISHED"]);

// No defaults here, so a partial update never resets omitted fields
const postFields = {
  title: z.string().trim().min(1).max(200),
  slug,
  excerpt: z.string().trim().max(500).nullable(),
  content: z.string().min(1),
  coverImage: image.nullable(),
  status,
  publishedAt: z.coerce.date().nullable(),
  categoryId: objectId.nullable(),
  tagIds: z.array(objectId).max(20),
};

export const createPostSchema = z.object({
  ...postFields,
  slug: postFields.slug.optional(),
  excerpt: postFields.excerpt.optional(),
  coverImage: postFields.coverImage.optional(),
  status: status.default("DRAFT"),
  publishedAt: postFields.publishedAt.optional(),
  categoryId: postFields.categoryId.optional(),
  tagIds: postFields.tagIds.default([]),
});

export const updatePostSchema = z.object(postFields).partial();

export const postListQuery = paginationQuery.extend({
  status: status.optional(),
  category: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "publishedAt", "title"]).default("createdAt"),
  order: order.default("desc"),
});
