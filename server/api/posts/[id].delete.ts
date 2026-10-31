// DELETE /api/posts/:idOrSlug (soft delete; relations are left untouched)
export default defineEventHandler(async (event) => {
  const { id } = await findPostOr404(requireParam(event));
  await prisma.post.update({ where: { id }, data: softDeleteData() });

  return { id };
});
