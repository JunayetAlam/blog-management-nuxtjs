<script setup lang="ts">
import { HugeiconsIcon } from "@hugeicons/vue";
import { Image01Icon } from "@hugeicons/core-free-icons";

defineProps<{ post: PublicPost; eager?: boolean }>();
</script>

<template>
  <article class="group relative flex gap-5 py-7 sm:gap-8">
    <div class="flex min-w-0 flex-1 flex-col gap-2">
      <div class="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium">
        <NuxtLink
          v-if="post.category"
          :to="`/category/${post.category.slug}`"
          class="text-primary relative z-10 uppercase tracking-wide hover:underline"
        >
          {{ post.category.name }}
        </NuxtLink>
        <span v-if="post.category" aria-hidden="true">·</span>
        <time :datetime="post.publishedAt">{{ formatPostDate(post.publishedAt) }}</time>
      </div>

      <h2 class="text-lg leading-snug font-semibold tracking-tight text-balance sm:text-xl">
        <NuxtLink :to="`/blog/${post.slug}`" class="after:absolute after:inset-0 group-hover:underline">
          {{ post.title }}
        </NuxtLink>
      </h2>

      <p v-if="post.excerpt" class="text-muted-foreground line-clamp-2 text-sm leading-relaxed sm:line-clamp-3 sm:text-[0.95rem]">
        {{ post.excerpt }}
      </p>

      <div class="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
        <span>{{ post.readingTime }} min read</span>
        <template v-if="post.tags.length">
          <span aria-hidden="true">·</span>
          <NuxtLink
            v-for="tag in post.tags.slice(0, 2)"
            :key="tag.slug"
            :to="`/tag/${tag.slug}`"
            class="bg-muted hover:bg-muted-foreground/15 relative z-10 rounded-full px-2 py-0.5 transition-colors"
          >
            {{ tag.name }}
          </NuxtLink>
        </template>
      </div>
    </div>

    <div class="bg-muted relative aspect-[4/3] w-28 shrink-0 self-start overflow-hidden rounded-lg sm:w-48">
      <img
        v-if="post.coverImage"
        :src="cldImage(post.coverImage.url, 'c_fill,w_480,h_360')"
        :alt="post.title"
        class="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        :loading="eager ? 'eager' : 'lazy'"
        decoding="async"
      >
      <div v-else class="flex size-full items-center justify-center">
        <HugeiconsIcon :icon="Image01Icon" class="text-muted-foreground size-6" />
      </div>
    </div>
  </article>
</template>
