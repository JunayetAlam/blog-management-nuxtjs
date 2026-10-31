import type { Prisma } from "@prisma/client";

export const categoryInclude = {
  _count: { select: { posts: { where: { isDeleted: false } } } },
} satisfies Prisma.CategoryInclude;

export const categoryOmit = { isDeleted: true, deletedAt: true } satisfies Prisma.CategoryOmit;

export function formatCategory<T extends { _count: { posts: number } }>(category: T) {
  const { _count, ...rest } = category;
  return { ...rest, postsCount: _count.posts };
}

export async function findCategoryOr404(param: string, deleted = false) {
  const category = await prisma.category.findFirst({
    where: { ...idOrSlug(param), isDeleted: deleted },
    select: { id: true },
  });
  if (!category) {
    throw createError({ statusCode: 404, message: deleted ? "Category not found in trash" : "Category not found" });
  }
  return category;
}

export async function assertCategoryUnique({ name, slug }: { name?: string; slug?: string }, exceptId?: string) {
  const not = exceptId ? { NOT: { id: exceptId } } : {};
  if (name) {
    const found = await prisma.category.findFirst({
      where: { name: { equals: name, mode: "insensitive" }, ...not },
      select: { isDeleted: true },
    });
    if (found) {
      throw createError({
        statusCode: 409,
        message: found.isDeleted
          ? "A deleted category with this name exists. Restore it instead"
          : "A category with this name already exists",
      });
    }
  }
  if (slug && (await prisma.category.count({ where: { slug, ...not } }))) {
    throw createError({ statusCode: 409, message: "Slug already in use" });
  }
}

export const categorySlugTaken = async (slug: string) => !!(await prisma.category.count({ where: { slug } }));
