import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { paginationQuery } from "../../../validators/common";

const query = paginationQuery.extend({
  limit: z.coerce.number().int().min(1).max(30).default(8),
  category: z.string().trim().optional(),
  tag: z.string().trim().optional(),
});

// GET /api/blog/posts?page&limit&search&category&tag (published posts, newest first)
export default defineEventHandler(async (event) => {
  const q = validateQuery(event, query);
  const where: Prisma.PostWhereInput = { ...publishedWhere };

  if (q.search) {
    where.OR = (["title", "excerpt", "contentText"] as const).map((field) => ({
      [field]: { contains: q.search, mode: "insensitive" },
    }));
  }
  if (q.category) {
    const category = await prisma.category.findFirst({ where: { slug: q.category, isDeleted: false }, select: { id: true } });
    if (!category) return paginated([], 0, q);
    where.categoryId = category.id;
  }
  if (q.tag) {
    const tag = await prisma.tag.findFirst({ where: { slug: q.tag, isDeleted: false }, select: { id: true } });
    if (!tag) return paginated([], 0, q);
    where.tagIds = { has: tag.id };
  }

  const [total, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      select: publicPostSelect,
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      ...paginate(q),
    }),
  ]);

  return paginated(posts.map(toPublicPost), total, q);
});
