import type { Prisma } from "@prisma/client";
import { tagListQuery } from "../../validators/tag";

// GET /api/tags?page&limit&search&sortBy&order
export default defineEventHandler(async (event) => {
  const query = validateQuery(event, tagListQuery);
  const where: Prisma.TagWhereInput = { isDeleted: false };

  if (query.search) where.name = { contains: query.search, mode: "insensitive" };

  const [total, tags] = await Promise.all([
    prisma.tag.count({ where }),
    prisma.tag.findMany({
      where,
      include: tagInclude,
      omit: tagOmit,
      orderBy: [{ [query.sortBy]: query.order }, { id: query.order }],
      ...paginate(query),
    }),
  ]);

  return paginated(tags.map(formatTag), total, query);
});
