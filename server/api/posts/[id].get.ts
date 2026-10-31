// GET /api/posts/:idOrSlug
export default defineEventHandler(async (event) => {
  const post = await prisma.post.findFirst({
    where: { ...idOrSlug(requireParam(event)), isDeleted: false },
    include: postInclude,
    omit: postOmit,
  });
  if (!post) throw createError({ statusCode: 404, message: "Post not found" });

  return formatPost(post);
});
