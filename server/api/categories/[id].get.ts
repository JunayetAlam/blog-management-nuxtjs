// GET /api/categories/:idOrSlug
export default defineEventHandler(async (event) => {
  const category = await prisma.category.findFirst({
    where: { ...idOrSlug(requireParam(event)), isDeleted: false },
    include: categoryInclude,
    omit: categoryOmit,
  });
  if (!category) throw createError({ statusCode: 404, message: "Category not found" });

  return formatCategory(category);
});
