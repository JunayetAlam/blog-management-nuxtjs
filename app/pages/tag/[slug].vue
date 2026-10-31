<script setup lang="ts">
const route = useRoute();
const slug = computed(() => String(route.params.slug));

const { data: tag } = await useFetch<Tag>(() => `/api/tags/${slug.value}`, {
  key: computed(() => `tag:${slug.value}`),
});
if (!tag.value) throw createError({ statusCode: 404, statusMessage: "Topic not found", fatal: true });

const { site } = useAppConfig();
const description = computed(() => `Stories about ${tag.value?.name} from ${site.name}.`);
useSeoMeta({
  title: () => `${tag.value?.name} · ${site.name}`,
  description,
  ogTitle: () => tag.value?.name,
  ogDescription: description,
});
</script>

<template>
  <BlogListShell v-if="tag" eyebrow="Topic" :title="`#${tag.name}`" :description="description" :active-tag="tag.slug">
    <BlogFeed :tag="tag.slug" />
  </BlogListShell>
</template>
