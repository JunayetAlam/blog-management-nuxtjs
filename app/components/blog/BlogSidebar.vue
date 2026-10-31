<script setup lang="ts">
defineProps<{ activeCategory?: string; activeTag?: string }>();

const { site } = useAppConfig();
const { data: topics } = useFetch<BlogTopics>("/api/blog/topics", { key: "blog-topics" });
</script>

<template>
  <aside class="flex flex-col gap-8">
    <section class="bg-muted/40 rounded-xl border p-5">
      <h2 class="font-semibold">About {{ site.name }}</h2>
      <p class="text-muted-foreground mt-1.5 text-sm leading-relaxed">{{ site.description }}</p>
    </section>

    <section v-if="topics?.categories.length">
      <h2 class="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">Categories</h2>
      <ul class="flex flex-col">
        <li v-for="category in topics.categories" :key="category.slug">
          <NuxtLink
            :to="`/category/${category.slug}`"
            :class="[
              'hover:bg-muted flex items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors',
              activeCategory === category.slug ? 'bg-muted font-medium' : 'text-foreground/80',
            ]"
          >
            {{ category.name }}
            <span class="text-muted-foreground text-xs tabular-nums">{{ category.count }}</span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section v-if="topics?.tags.length">
      <h2 class="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">Topics</h2>
      <div class="flex flex-wrap gap-2">
        <NuxtLink
          v-for="tag in topics.tags.slice(0, 18)"
          :key="tag.slug"
          :to="`/tag/${tag.slug}`"
          :class="[
            'rounded-full border px-3 py-1 text-xs transition-colors',
            activeTag === tag.slug
              ? 'bg-primary text-primary-foreground border-primary'
              : 'text-foreground/80 hover:border-foreground/30 hover:bg-muted',
          ]"
        >
          {{ tag.name }}
        </NuxtLink>
      </div>
    </section>
  </aside>
</template>
