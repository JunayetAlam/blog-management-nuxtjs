// GET /api/blog/posts/:slug (a published post with its table of contents and related posts)
export default defineEventHandler(async (event) => {
  const slug = requireParam(event, "slug");
  const post = await prisma.post.findFirst({
    where: { ...publishedWhere, slug },
    select: { ...publicPostSelect, content: true, categoryId: true, tagIds: true, updatedAt: true },
  });
  if (!post) throw createError({ statusCode: 404, message: "Post not found" });

  const { content, categoryId, tagIds, updatedAt, ...rest } = post;
  const { content: html, toc } = withHeadingIds(content);

  // Related: same category or shared tags, ranked by how many tags overlap
  const candidates = await prisma.post.findMany({
    where: {
      ...publishedWhere,
      id: { not: post.id },
      OR: [...(categoryId ? [{ categoryId }] : []), ...(tagIds.length ? [{ tagIds: { hasSome: tagIds } }] : [])],
    },
    select: { ...publicPostSelect, categoryId: true, tagIds: true },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });
  const score = (c: (typeof candidates)[number]) =>
    c.tagIds.filter((id) => tagIds.includes(id)).length + (categoryId && c.categoryId === categoryId ? 1 : 0);
  const related = candidates
    .sort((a, b) => score(b) - score(a))
    .slice(0, 3)
    .map(({ categoryId: _c, tagIds: _t, ...r }) => toPublicPost(r));

  return { ...toPublicPost(rest), updatedAt, content: html, toc, related };
});
