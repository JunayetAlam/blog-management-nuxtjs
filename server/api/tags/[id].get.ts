// GET /api/tags/:idOrSlug
export default defineEventHandler(async (event) => {
  const tag = await prisma.tag.findFirst({
    where: { ...idOrSlug(requireParam(event)), isDeleted: false },
    include: tagInclude,
    omit: tagOmit,
  });
  if (!tag) throw createError({ statusCode: 404, message: "Tag not found" });

  return formatTag(tag);
});
