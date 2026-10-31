import { updateTagSchema } from "../../validators/tag";

// PATCH /api/tags/:idOrSlug
export default defineEventHandler(async (event) => {
  const { id } = await findTagOr404(requireParam(event));
  const body = await validateBody(event, updateTagSchema);
  await assertTagUnique(body, id);

  try {
    const tag = await prisma.tag.update({
      where: { id },
      data: body,
      include: tagInclude,
      omit: tagOmit,
    });
    return formatTag(tag);
  } catch (error) {
    rethrowPrismaError(error);
  }
});
