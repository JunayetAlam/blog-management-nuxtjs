import { createPostSchema } from "../../validators/post";

// POST /api/posts
export default defineEventHandler(async (event) => {
  const body = await validateBody(event, createPostSchema);
  const tagIds = [...new Set(body.tagIds)];
  await assertPostRelations({ categoryId: body.categoryId, tagIds });

  if (body.slug && (await postSlugTaken(body.slug))) {
    throw createError({ statusCode: 409, message: "Slug already in use" });
  }
  const slug = body.slug ?? (await uniqueSlug(body.title, (s) => postSlugTaken(s)));
  const content = cleanHtml(body.content);

  try {
    const post = await prisma.post.create({
      data: {
        title: body.title,
        slug,
        excerpt: body.excerpt,
        content,
        contentText: htmlToText(content),
        coverImage: body.coverImage ?? undefined,
        status: body.status,
        publishedAt: body.publishedAt ?? (body.status === "PUBLISHED" ? new Date() : null),
        category: body.categoryId ? { connect: { id: body.categoryId } } : undefined,
        tags: { connect: tagIds.map((id) => ({ id })) },
      },
      include: postInclude,
      omit: postOmit,
    });

    setResponseStatus(event, 201);
    return formatPost(post);
  } catch (error) {
    rethrowPrismaError(error);
  }
});
