export default defineEventHandler(async () => {
  return prisma.post.findMany({
    include: { category: true, tags: true },
    orderBy: { createdAt: "desc" },
  });
});
