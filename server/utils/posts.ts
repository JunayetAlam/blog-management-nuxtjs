import type { Prisma } from "@prisma/client";

export const postInclude = {
  category: { select: { id: true, name: true, slug: true, isDeleted: true } },
  // Soft-deleted tags simply disappear from the post; the link stays so a restore brings them back
  tags: { where: { isDeleted: false }, select: { id: true, name: true, slug: true } },
} satisfies Prisma.PostInclude;

export const postOmit = { contentText: true, isDeleted: true, deletedAt: true } satisfies Prisma.PostOmit;

// Lists skip the (potentially large) HTML body
export const postListOmit = { ...postOmit, content: true } satisfies Prisma.PostOmit;

type PostWithCategory = { category: { id: string; name: string; slug: string; isDeleted: boolean } | null };

// Hides a soft-deleted category without breaking the post's link to it
export function formatPost<T extends PostWithCategory>(post: T) {
  const { category, ...rest } = post;
  return {
    ...rest,
    category: category && !category.isDeleted ? { id: category.id, name: category.name, slug: category.slug } : null,
  };
}

export async function findPostOr404(param: string, deleted = false) {
  const post = await prisma.post.findFirst({
    where: { ...idOrSlug(param), isDeleted: deleted },
    select: { id: true, publishedAt: true, content: true, coverImage: true },
  });
  if (!post) throw createError({ statusCode: 404, message: deleted ? "Post not found in trash" : "Post not found" });
  return post;
}

// Checks against every post, including deleted ones, because the unique index covers them too
export async function postSlugTaken(slug: string, exceptId?: string) {
  const found = await prisma.post.findFirst({
    where: { slug, ...(exceptId && { NOT: { id: exceptId } }) },
    select: { id: true },
  });
  return !!found;
}

// Cloudinary assets a post references: its cover plus every image in its content
export function postAssetNames(post: { content: string; coverImage: { name: string } | null }) {
  const names = extractAssetNames(post.content);
  if (post.coverImage) names.push(post.coverImage.name);
  return names;
}

export async function assertPostRelations({ categoryId, tagIds }: { categoryId?: string | null; tagIds?: string[] }) {
  if (categoryId) {
    const exists = await prisma.category.count({ where: { id: categoryId, isDeleted: false } });
    if (!exists) throw createError({ statusCode: 400, message: "Category not found" });
  }
  if (tagIds?.length) {
    const found = await prisma.tag.count({ where: { id: { in: tagIds }, isDeleted: false } });
    if (found !== tagIds.length) throw createError({ statusCode: 400, message: "One or more tags not found" });
  }
}
