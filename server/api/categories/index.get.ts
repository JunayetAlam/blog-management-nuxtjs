import type { Prisma } from "@prisma/client";
import { categoryListQuery } from "../../validators/category";

// GET /api/categories?page&limit&search&sortBy&order
export default defineEventHandler(async (event) => {
  const query = validateQuery(event, categoryListQuery);
  const where: Prisma.CategoryWhereInput = { isDeleted: false };

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [total, categories] = await Promise.all([
    prisma.category.count({ where }),
    prisma.category.findMany({
      where,
      include: categoryInclude,
      omit: categoryOmit,
      orderBy: [{ [query.sortBy]: query.order }, { id: query.order }],
      ...paginate(query),
    }),
  ]);

  return paginated(categories.map(formatCategory), total, query);
});
