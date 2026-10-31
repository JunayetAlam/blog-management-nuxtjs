import type { Prisma } from "@prisma/client";

export const tagInclude = {
  _count: { select: { posts: { where: { isDeleted: false } } } },
} satisfies Prisma.TagInclude;

export const tagOmit = { postIds: true, isDeleted: true, deletedAt: true } satisfies Prisma.TagOmit;

export function formatTag<T extends { _count: { posts: number } }>(tag: T) {
  const { _count, ...rest } = tag;
  return { ...rest, postsCount: _count.posts };
}

export async function findTagOr404(param: string, deleted = false) {
  const tag = await prisma.tag.findFirst({
    where: { ...idOrSlug(param), isDeleted: deleted },
    select: { id: true },
  });
  if (!tag) throw createError({ statusCode: 404, message: deleted ? "Tag not found in trash" : "Tag not found" });
  return tag;
}

export async function assertTagUnique({ name, slug }: { name?: string; slug?: string }, exceptId?: string) {
  const not = exceptId ? { NOT: { id: exceptId } } : {};
  if (name) {
    const found = await prisma.tag.findFirst({
      where: { name: { equals: name, mode: "insensitive" }, ...not },
      select: { isDeleted: true },
    });
    if (found) {
      throw createError({
        statusCode: 409,
        message: found.isDeleted
          ? "A deleted tag with this name exists. Restore it instead"
          : "A tag with this name already exists",
      });
    }
  }
  if (slug && (await prisma.tag.count({ where: { slug, ...not } }))) {
    throw createError({ statusCode: 409, message: "Slug already in use" });
  }
}

export const tagSlugTaken = async (slug: string) => !!(await prisma.tag.count({ where: { slug } }));
