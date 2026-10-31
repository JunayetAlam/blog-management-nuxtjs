import { updateCategorySchema } from "../../validators/category";

// PATCH /api/categories/:idOrSlug
export default defineEventHandler(async (event) => {
  const { id } = await findCategoryOr404(requireParam(event));
  const body = await validateBody(event, updateCategorySchema);
  await assertCategoryUnique(body, id);

  try {
    const category = await prisma.category.update({
      where: { id },
      data: body,
      include: categoryInclude,
      omit: categoryOmit,
    });
    return formatCategory(category);
  } catch (error) {
    rethrowPrismaError(error);
  }
});
