import type { Prisma } from "@prisma/client";
import { updatePostSchema } from "../../validators/post";

// PATCH /api/posts/:idOrSlug (send only the fields to change)
export default defineEventHandler(async (event) => {
  const existing = await findPostOr404(requireParam(event));
  const body = await validateBody(event, updatePostSchema);
  const tagIds = body.tagIds && [...new Set(body.tagIds)];
  await assertPostRelations({ categoryId: body.categoryId, tagIds });

  const data: Prisma.PostUpdateInput = {};

  if (body.title !== undefined) data.title = body.title;
  if (body.slug !== undefined) {
    if (await postSlugTaken(body.slug, existing.id)) {
      throw createError({ statusCode: 409, message: "Slug already in use" });
    }
    data.slug = body.slug;
  }
  if (body.excerpt !== undefined) data.excerpt = body.excerpt;
  if (body.content !== undefined) {
    data.content = cleanHtml(body.content);
    data.contentText = htmlToText(data.content);
  }
  if (body.coverImage !== undefined) {
    data.coverImage = body.coverImage ? { set: body.coverImage } : { unset: true };
  }
  if (body.status !== undefined) data.status = body.status;
  if (body.publishedAt !== undefined) data.publishedAt = body.publishedAt;
  else if (body.status === "PUBLISHED" && !existing.publishedAt) data.publishedAt = new Date();
  if (body.categoryId !== undefined) {
    data.category = body.categoryId ? { connect: { id: body.categoryId } } : { disconnect: true };
  }
  if (tagIds) data.tags = { set: tagIds.map((id) => ({ id })) };

  try {
    const post = await prisma.post.update({
      where: { id: existing.id },
      data,
      include: postInclude,
      omit: postOmit,
    });
    return formatPost(post);
  } catch (error) {
    rethrowPrismaError(error);
  }
});
