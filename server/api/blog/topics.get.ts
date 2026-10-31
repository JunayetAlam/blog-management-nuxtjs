// GET /api/blog/topics: categories and tags that have at least one published post, with counts
export default defineEventHandler(async () => {
  const count = { _count: { select: { posts: { where: publishedWhere } } } };
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ where: { isDeleted: false }, select: { name: true, slug: true, ...count }, orderBy: { name: "asc" } }),
    prisma.tag.findMany({ where: { isDeleted: false }, select: { name: true, slug: true, ...count }, orderBy: { name: "asc" } }),
  ]);

  const shape = (rows: { name: string; slug: string; _count: { posts: number } }[]) =>
    rows.filter((r) => r._count.posts > 0).map(({ _count, ...r }) => ({ ...r, count: _count.posts }));

  return { categories: shape(categories), tags: shape(tags).sort((a, b) => b.count - a.count) };
});
