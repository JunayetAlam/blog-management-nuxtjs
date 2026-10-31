// PATCH /api/categories/:idOrSlug/restore
export default defineEventHandler(async (event) => {
  const { id } = await findCategoryOr404(requireParam(event), true);
  const category = await prisma.category.update({
    where: { id },
    data: restoreData(),
    include: categoryInclude,
    omit: categoryOmit,
  });

  return formatCategory(category);
});
