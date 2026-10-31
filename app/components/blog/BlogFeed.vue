<script setup lang="ts">
import { HugeiconsIcon } from "@hugeicons/vue";
import { Loading03Icon, News01Icon } from "@hugeicons/core-free-icons";

const props = defineProps<{ search?: string; category?: string; tag?: string }>();

const sentinel = ref<HTMLElement>();
const { posts, total, hasMore, initialLoading, loadingMore, error, loadError, retry, refresh } = await useInfinitePosts(
  () => ({ search: props.search, category: props.category, tag: props.tag }),
  sentinel,
);

defineExpose({ total });
</script>

<template>
  <div>
    <!-- First load (client-side filter change) -->
    <div v-if="initialLoading" class="divide-y">
      <div v-for="i in 4" :key="i" class="flex gap-5 py-7 sm:gap-8">
        <div class="flex flex-1 flex-col gap-3">
          <Skeleton class="h-3 w-32" />
          <Skeleton class="h-6 w-4/5" />
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-2/3" />
        </div>
        <Skeleton class="aspect-[4/3] w-28 shrink-0 rounded-lg sm:w-48" />
      </div>
    </div>

    <div v-else-if="error && !posts.length" class="flex flex-col items-center gap-3 py-20 text-center">
      <p class="font-medium">We couldn't load the posts.</p>
      <Button variant="outline" size="sm" @click="() => refresh()">Try again</Button>
    </div>

    <div v-else-if="!posts.length" class="flex flex-col items-center gap-2 py-20 text-center">
      <HugeiconsIcon :icon="News01Icon" class="text-muted-foreground size-8" />
      <p class="font-medium">No stories found</p>
      <p class="text-muted-foreground text-sm">Try a different search or browse another topic.</p>
    </div>

    <template v-else>
      <div class="divide-y">
        <BlogPostRow v-for="(post, i) in posts" :key="post.id" :post="post" :eager="i < 2" />
      </div>

      <!-- Reaching this element loads the next page -->
      <div ref="sentinel" aria-hidden="true" class="h-px" />

      <div class="flex min-h-16 items-center justify-center py-6" aria-live="polite">
        <div v-if="loadingMore" class="text-muted-foreground flex items-center gap-2 text-sm">
          <HugeiconsIcon :icon="Loading03Icon" class="size-4 animate-spin" />
          Loading more stories…
        </div>
        <div v-else-if="loadError" class="flex items-center gap-3 text-sm">
          <span class="text-muted-foreground">Couldn't load more stories.</span>
          <Button variant="outline" size="sm" @click="retry">Retry</Button>
        </div>
        <p v-else-if="!hasMore" class="text-muted-foreground text-sm">
          You're all caught up · {{ total }} {{ total === 1 ? "story" : "stories" }}
        </p>
      </div>
    </template>
  </div>
</template>
