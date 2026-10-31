<script setup lang="ts">
defineProps<{ post: PublicPost }>();
</script>

<template>
  <article class="group relative flex flex-col gap-3">
    <div class="bg-muted aspect-[16/10] overflow-hidden rounded-lg">
      <img
        v-if="post.coverImage"
        :src="cldImage(post.coverImage.url, 'c_fill,w_640,h_400')"
        :alt="post.title"
        class="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        loading="lazy"
        decoding="async"
      >
    </div>
    <div class="flex flex-col gap-1.5">
      <p class="text-muted-foreground text-xs font-medium">
        <span v-if="post.category" class="text-primary uppercase tracking-wide">{{ post.category.name }}</span>
        <span v-if="post.category" aria-hidden="true"> · </span>
        {{ post.readingTime }} min read
      </p>
      <h3 class="leading-snug font-semibold text-balance">
        <NuxtLink :to="`/blog/${post.slug}`" class="after:absolute after:inset-0 group-hover:underline">{{ post.title }}</NuxtLink>
      </h3>
    </div>
  </article>
</template>
