<script setup lang="ts">
defineProps<{
  eyebrow?: string;
  title: string;
  description?: string;
  activeCategory?: string;
  activeTag?: string;
}>();
</script>

<template>
  <div class="mx-auto w-full max-w-6xl px-4 sm:px-6">
    <section class="relative isolate border-b py-10 sm:py-14">
      <!-- Decorative: faint grid fading out, plus a soft brand glow -->
      <div
        aria-hidden="true"
        class="bg-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_80%_at_20%_0%,black,transparent)]"
      />
      <div
        aria-hidden="true"
        class="bg-brand pointer-events-none absolute -top-24 left-1/4 -z-10 h-56 w-2/3 rounded-full opacity-[0.12] blur-3xl dark:opacity-20"
      />
      <p v-if="eyebrow" class="mb-3 inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
        <span class="bg-brand size-1.5 rounded-full" aria-hidden="true" />
        <span class="text-brand">{{ eyebrow }}</span>
      </p>
      <h1 class="max-w-3xl text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">{{ title }}</h1>
      <p v-if="description" class="text-muted-foreground mt-3 max-w-2xl text-base text-pretty sm:text-lg">{{ description }}</p>
      <slot name="header" />
    </section>

    <div class="grid gap-10 py-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-14">
      <div class="min-w-0">
        <slot />
      </div>
      <div class="hidden lg:block">
        <div class="sticky top-24 py-7">
          <BlogSidebar :active-category="activeCategory" :active-tag="activeTag" />
        </div>
      </div>
    </div>
  </div>
</template>
