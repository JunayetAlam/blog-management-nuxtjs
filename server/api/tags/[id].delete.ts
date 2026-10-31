// DELETE /api/tags/:idOrSlug (soft delete; posts keep the link and just stop showing the tag)
export default defineEventHandler(async (event) => {
  const { id } = await findTagOr404(requireParam(event));
  await prisma.tag.update({ where: { id }, data: softDeleteData() });

  return { id };
});
