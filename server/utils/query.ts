export const isObjectId = (value: string) => /^[a-f\d]{24}$/i.test(value);

// Lets every :id route accept either an ObjectId or a slug
export function idOrSlug(value: string) {
  return isObjectId(value) ? { OR: [{ id: value }, { slug: value }] } : { slug: value };
}

export function requireParam(event: Parameters<typeof getRouterParam>[0], name = "id") {
  const value = getRouterParam(event, name);
  if (!value) throw createError({ statusCode: 400, message: `Missing route param: ${name}` });
  return decodeURIComponent(value);
}

export function paginate({ page, limit }: { page: number; limit: number }) {
  return { skip: (page - 1) * limit, take: limit };
}

export function paginated<T>(data: T[], total: number, { page, limit }: { page: number; limit: number }) {
  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export function softDeleteData() {
  return { isDeleted: true, deletedAt: new Date() };
}

export function restoreData() {
  return { isDeleted: false, deletedAt: null };
}
