export interface Asset {
  url: string;
  name: string;
}

export type PostStatus = "DRAFT" | "PUBLISHED";

export interface TaxonomyRef {
  id: string;
  name: string;
  slug: string;
}

export interface Category extends TaxonomyRef {
  description: string | null;
  postsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tag extends TaxonomyRef {
  postsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: Asset | null;
  status: PostStatus;
  publishedAt: string | null;
  categoryId: string | null;
  tagIds: string[];
  category: TaxonomyRef | null;
  tags: TaxonomyRef[];
  createdAt: string;
  updatedAt: string;
}

export interface Post extends PostListItem {
  content: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
