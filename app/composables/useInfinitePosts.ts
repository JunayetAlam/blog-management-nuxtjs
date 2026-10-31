import type { MaybeRefOrGetter } from "vue";
import { useIntersectionObserver } from "@vueuse/core";

interface PostFilters {
  search?: string;
  category?: string;
  tag?: string;
}

const PAGE_SIZE = 8;

// First page is fetched during SSR (SEO + fast first paint); later pages load when `sentinel` scrolls into view
export async function useInfinitePosts(filters: MaybeRefOrGetter<PostFilters>, sentinel: Ref<HTMLElement | null | undefined>) {
  const query = computed(() => {
    const f = toValue(filters);
    return { limit: PAGE_SIZE, page: 1, search: f.search || undefined, category: f.category, tag: f.tag };
  });

  const { data, status, error, refresh } = await useFetch<Paginated<PublicPost>>("/api/blog/posts", {
    query,
    key: computed(() => `blog-feed:${JSON.stringify(query.value)}`),
  });

  const extra = ref<PublicPost[]>([]);
  const page = ref(1);
  const loadingMore = ref(false);
  const loadError = ref(false);

  // Filters changed: drop pages loaded for the previous filters
  watch(query, () => {
    extra.value = [];
    page.value = 1;
    loadError.value = false;
  });

  const posts = computed(() => {
    const seen = new Set<string>();
    return [...(data.value?.data ?? []), ...extra.value].filter((p) => !seen.has(p.id) && seen.add(p.id));
  });
  const total = computed(() => data.value?.meta.total ?? 0);
  const hasMore = computed(() => posts.value.length < total.value);
  const initialLoading = computed(() => status.value === "pending" && !posts.value.length);

  async function loadMore() {
    if (loadingMore.value || !hasMore.value || status.value === "pending" || loadError.value) return;
    loadingMore.value = true;
    const forQuery = query.value;
    try {
      const res = await $fetch<Paginated<PublicPost>>("/api/blog/posts", { query: { ...forQuery, page: page.value + 1 } });
      if (forQuery !== query.value) return; // filters changed while loading
      extra.value.push(...res.data);
      page.value++;
    } catch {
      loadError.value = true;
    } finally {
      loadingMore.value = false;
    }
  }

  function retry() {
    loadError.value = false;
    loadMore();
  }

  // Start loading a little before the reader reaches the end
  const { isActive } = useIntersectionObserver(sentinel, ([entry]) => entry?.isIntersecting && loadMore(), {
    rootMargin: "600px 0px",
  });

  // A short page may already show the sentinel without any scrolling, so keep filling until it leaves the viewport
  watch([posts, loadingMore], async () => {
    if (!import.meta.client || loadingMore.value || !hasMore.value || !isActive.value) return;
    await nextTick();
    const rect = sentinel.value?.getBoundingClientRect();
    if (rect && rect.top < window.innerHeight + 600) loadMore();
  });

  return { posts, total, hasMore, initialLoading, loadingMore, error, loadError, retry, refresh };
}
