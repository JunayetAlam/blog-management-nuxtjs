// PATCH /api/posts/:idOrSlug/restore
export default defineEventHandler(async (event) => {
  const { id } = await findPostOr404(requireParam(event), true);
  const post = await prisma.post.update({
    where: { id },
    data: restoreData(),
    include: postInclude,
    omit: postOmit,
  });

  return formatPost(post);
});
