// PATCH /api/tags/:idOrSlug/restore
export default defineEventHandler(async (event) => {
  const { id } = await findTagOr404(requireParam(event), true);
  const tag = await prisma.tag.update({
    where: { id },
    data: restoreData(),
    include: tagInclude,
    omit: tagOmit,
  });

  return formatTag(tag);
});
