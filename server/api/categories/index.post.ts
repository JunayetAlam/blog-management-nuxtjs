import { createCategorySchema } from "../../validators/category";

// POST /api/categories
export default defineEventHandler(async (event) => {
  const body = await validateBody(event, createCategorySchema);
  await assertCategoryUnique(body);
  const slug = body.slug ?? (await uniqueSlug(body.name, categorySlugTaken));

  try {
    const category = await prisma.category.create({
      data: { name: body.name, slug, description: body.description },
      include: categoryInclude,
      omit: categoryOmit,
    });

    setResponseStatus(event, 201);
    return formatCategory(category);
  } catch (error) {
    rethrowPrismaError(error);
  }
});
