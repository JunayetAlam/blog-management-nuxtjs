<script setup lang="ts">
import { HugeiconsIcon } from "@hugeicons/vue";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

const route = useRoute();
const slug = computed(() => String(route.params.slug));

const { data: post } = await useFetch<PublicPostDetail>(() => `/api/blog/posts/${slug.value}`, {
  key: computed(() => `blog-post:${slug.value}`),
});
if (!post.value) throw createError({ statusCode: 404, statusMessage: "Post not found", fatal: true });

const { site } = useAppConfig();
const requestUrl = useRequestURL();
const canonicalUrl = computed(() => `${requestUrl.origin}/blog/${slug.value}`);
const coverUrl = computed(() => post.value?.coverImage?.url);

useSeoMeta({
  title: () => `${post.value?.title} · ${site.name}`,
  description: () => post.value?.excerpt ?? site.description,
  ogTitle: () => post.value?.title,
  ogDescription: () => post.value?.excerpt ?? site.description,
  ogType: "article",
  ogUrl: canonicalUrl,
  ogImage: () => (coverUrl.value ? cldImage(coverUrl.value, "c_fill,w_1200,h_630") : undefined),
  twitterCard: "summary_large_image",
  articlePublishedTime: () => post.value?.publishedAt,
  articleModifiedTime: () => post.value?.updatedAt,
  articleSection: () => post.value?.category?.name,
  articleTag: () => post.value?.tags.map((t) => t.name),
});
useHead({ link: [{ rel: "canonical", href: canonicalUrl }] });

const article = ref<HTMLElement | null>(null);
</script>

<template>
  <div v-if="post">
    <BlogReadingProgress :target="article" />

    <article ref="article">
      <!-- Header -->
      <header class="mx-auto w-full max-w-3xl px-4 pt-8 sm:px-6 sm:pt-12">
        <NuxtLink to="/" class="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 text-sm">
          <HugeiconsIcon :icon="ArrowLeft01Icon" class="size-4" />
          All stories
        </NuxtLink>

        <NuxtLink
          v-if="post.category"
          :to="`/category/${post.category.slug}`"
          class="text-primary block text-xs font-semibold tracking-widest uppercase hover:underline"
        >
          {{ post.category.name }}
        </NuxtLink>
        <h1 class="mt-3 text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]">
          {{ post.title }}
        </h1>
        <p v-if="post.excerpt" class="text-muted-foreground mt-4 text-lg leading-relaxed text-pretty sm:text-xl">
          {{ post.excerpt }}
        </p>

        <div class="mt-6 flex flex-wrap items-center justify-between gap-4 border-y py-4">
          <div class="text-muted-foreground flex items-center gap-2 text-sm">
            <span class="bg-brand flex size-9 shrink-0 items-center justify-center rounded-full font-[family-name:var(--font-heading)] text-sm font-bold text-white" aria-hidden="true">F</span>
            <div class="leading-tight">
              <p class="text-foreground font-medium">{{ site.name }} Editorial</p>
              <p class="text-xs">
                <time :datetime="post.publishedAt">{{ formatPostDate(post.publishedAt) }}</time>
                · {{ post.readingTime }} min read
              </p>
            </div>
          </div>
          <BlogShareButtons :url="canonicalUrl" :title="post.title" />
        </div>
      </header>

      <!-- Cover -->
      <figure v-if="post.coverImage" class="mx-auto mt-8 w-full max-w-5xl px-4 sm:px-6">
        <img
          :src="cldImage(post.coverImage.url, 'c_limit,w_1600')"
          :alt="post.title"
          class="bg-muted aspect-[16/9] w-full rounded-xl object-cover"
          fetchpriority="high"
        >
      </figure>

      <!-- Body + table of contents -->
      <div class="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-14">
        <div class="mx-auto w-full max-w-3xl min-w-0 lg:mx-0 lg:ml-auto">
          <details v-if="post.toc.length > 2" class="bg-muted/40 mb-8 rounded-lg border px-4 py-3 lg:hidden">
            <summary class="cursor-pointer text-sm font-medium">On this page</summary>
            <div class="mt-3">
              <BlogTableOfContents :items="post.toc" />
            </div>
          </details>

          <!-- Content is sanitized on the server when the post is saved -->
          <div
            class="prose sm:prose-lg prose-headings:scroll-mt-24 prose-headings:tracking-tight prose-a:text-primary prose-a:underline-offset-2 prose-img:rounded-xl prose-img:w-full prose-pre:rounded-lg prose-blockquote:border-l-primary max-w-none"
            v-html="post.content"
          />

          <div v-if="post.tags.length" class="mt-10 flex flex-wrap gap-2 border-t pt-6">
            <NuxtLink
              v-for="tag in post.tags"
              :key="tag.slug"
              :to="`/tag/${tag.slug}`"
              class="hover:bg-muted hover:border-foreground/30 rounded-full border px-3 py-1 text-sm transition-colors"
            >
              #{{ tag.name }}
            </NuxtLink>
          </div>

          <div class="bg-muted/40 mt-8 flex flex-col items-start justify-between gap-3 rounded-xl border p-5 sm:flex-row sm:items-center">
            <p class="font-medium">Found this useful? Share it.</p>
            <BlogShareButtons :url="canonicalUrl" :title="post.title" />
          </div>
        </div>

        <aside v-if="post.toc.length" class="hidden lg:block">
          <div class="sticky top-24 max-h-[calc(100svh-8rem)] overflow-y-auto pb-4">
            <BlogTableOfContents :items="post.toc" />
          </div>
        </aside>
      </div>
    </article>

    <!-- Related -->
    <section v-if="post.related.length" class="bg-muted/30 border-t">
      <div class="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <h2 class="mb-6 text-2xl font-bold tracking-tight">Keep reading</h2>
        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <BlogPostCard v-for="item in post.related" :key="item.id" :post="item" />
        </div>
      </div>
    </section>
  </div>
</template>
