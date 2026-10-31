import type { Prisma } from "@prisma/client";
import { postListQuery } from "../../validators/post";

// GET /api/posts?page&limit&search&status&category&tag&sortBy&order
export default defineEventHandler(async (event) => {
  const query = validateQuery(event, postListQuery);
  const where: Prisma.PostWhereInput = { isDeleted: false };

  if (query.status) where.status = query.status;

  if (query.search) {
    where.OR = (["title", "excerpt", "contentText"] as const).map((field) => ({
      [field]: { contains: query.search, mode: "insensitive" },
    }));
  }

  // category / tag accept an id or a slug
  if (query.category) {
    const category = await prisma.category.findFirst({ where: idOrSlug(query.category), select: { id: true } });
    if (!category) return paginated([], 0, query);
    where.categoryId = category.id;
  }
  if (query.tag) {
    const tag = await prisma.tag.findFirst({ where: idOrSlug(query.tag), select: { id: true } });
    if (!tag) return paginated([], 0, query);
    where.tagIds = { has: tag.id };
  }

  const [total, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      include: postInclude,
      omit: postListOmit,
      // id as tie-breaker keeps pagination stable
      orderBy: [{ [query.sortBy]: query.order }, { id: query.order }],
      ...paginate(query),
    }),
  ]);

  return paginated(posts.map(formatPost), total, query);
});
