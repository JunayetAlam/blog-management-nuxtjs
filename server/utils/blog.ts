import type { Prisma } from "@prisma/client";

// Public blog: only published, non-deleted posts are ever visible
export const publishedWhere = {
  isDeleted: false,
  status: "PUBLISHED",
  publishedAt: { not: null },
} satisfies Prisma.PostWhereInput;

export const publicPostSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  publishedAt: true,
  contentText: true,
  category: { select: { name: true, slug: true, isDeleted: true } },
  tags: { where: { isDeleted: false }, select: { name: true, slug: true } },
} satisfies Prisma.PostSelect;

type PublicPostRow = Prisma.PostGetPayload<{ select: typeof publicPostSelect }>;

const WORDS_PER_MINUTE = 220;

export function toPublicPost({ contentText, category, ...post }: PublicPostRow) {
  return {
    ...post,
    category: category && !category.isDeleted ? { name: category.name, slug: category.slug } : null,
    readingTime: Math.max(1, Math.round(contentText.split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE)),
  };
}

// Gives every h2/h3 a stable id and returns the headings for the table of contents
export function withHeadingIds(html: string) {
  const toc: TocItem[] = [];
  const used = new Set<string>();

  const content = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_match, level: string, inner: string) => {
    const text = htmlToText(inner);
    const base = slugify(text, 60) || "section";
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    toc.push({ id, text, level: Number(level) as 2 | 3 });
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });

  return { content, toc };
}
