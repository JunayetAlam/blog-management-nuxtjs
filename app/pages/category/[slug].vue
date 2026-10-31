<script setup lang="ts">
const route = useRoute();
const slug = computed(() => String(route.params.slug));

const { data: category } = await useFetch<Category>(() => `/api/categories/${slug.value}`, {
  key: computed(() => `category:${slug.value}`),
});
if (!category.value) throw createError({ statusCode: 404, statusMessage: "Category not found", fatal: true });

const { site } = useAppConfig();
useSeoMeta({
  title: () => `${category.value?.name} · ${site.name}`,
  description: () => category.value?.description ?? site.description,
  ogTitle: () => category.value?.name,
  ogDescription: () => category.value?.description ?? site.description,
});
</script>

<template>
  <BlogListShell
    v-if="category"
    eyebrow="Category"
    :title="category.name"
    :description="category.description ?? undefined"
    :active-category="category.slug"
  >
    <BlogFeed :category="category.slug" />
  </BlogListShell>
</template>
