// DELETE /api/categories/:idOrSlug (soft delete; posts keep their categoryId and show category: null)
export default defineEventHandler(async (event) => {
  const { id } = await findCategoryOr404(requireParam(event));
  await prisma.category.update({ where: { id }, data: softDeleteData() });

  return { id };
});
