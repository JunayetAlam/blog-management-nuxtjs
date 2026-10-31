import { createTagSchema } from "../../validators/tag";

// POST /api/tags
export default defineEventHandler(async (event) => {
  const body = await validateBody(event, createTagSchema);
  await assertTagUnique(body);
  const slug = body.slug ?? (await uniqueSlug(body.name, tagSlugTaken));

  try {
    const tag = await prisma.tag.create({
      data: { name: body.name, slug },
      include: tagInclude,
      omit: tagOmit,
    });

    setResponseStatus(event, 201);
    return formatTag(tag);
  } catch (error) {
    rethrowPrismaError(error);
  }
});
