<script setup lang="ts">
const { site } = useAppConfig();
const { data: topics } = useFetch<BlogTopics>("/api/blog/topics", { key: "blog-topics" });
const year = new Date().getFullYear();
</script>

<template>
  <TooltipProvider :delay-duration="200">
  <div class="flex min-h-svh flex-col">
    <header class="bg-background/85 sticky top-0 z-40 border-b backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div class="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
        <NuxtLink to="/" class="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
          <BrandMark />
          <span class="font-[family-name:var(--font-heading)] text-lg">{{ site.name }}</span>
        </NuxtLink>

        <nav aria-label="Categories" class="-mx-1 hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto md:flex">
          <NuxtLink
            v-for="category in topics?.categories ?? []"
            :key="category.slug"
            :to="`/category/${category.slug}`"
            class="text-muted-foreground hover:text-foreground hover:bg-accent shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            active-class="!text-accent-foreground bg-accent"
          >
            {{ category.name }}
          </NuxtLink>
        </nav>

        <div class="ml-auto shrink-0">
          <BrandThemeToggle />
        </div>
      </div>

      <!-- Small screens: categories as a swipeable row -->
      <nav
        v-if="topics?.categories.length"
        aria-label="Categories"
        class="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:px-6 md:hidden [&::-webkit-scrollbar]:hidden"
      >
        <NuxtLink
          to="/"
          class="text-muted-foreground shrink-0 rounded-full border px-3 py-1 text-sm transition-colors"
          exact-active-class="!text-primary-foreground bg-primary border-primary"
        >
          All
        </NuxtLink>
        <NuxtLink
          v-for="category in topics.categories"
          :key="category.slug"
          :to="`/category/${category.slug}`"
          class="text-muted-foreground shrink-0 rounded-full border px-3 py-1 text-sm transition-colors"
          active-class="!text-primary-foreground bg-primary border-primary"
        >
          {{ category.name }}
        </NuxtLink>
      </nav>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="bg-muted/30 border-t">
      <div class="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div class="flex flex-col gap-2">
          <NuxtLink to="/" class="flex items-center gap-2 font-semibold">
            <BrandMark size="sm" />
            {{ site.name }}
          </NuxtLink>
          <p class="text-muted-foreground max-w-sm text-sm">{{ site.description }}</p>
        </div>
        <div>
          <h2 class="mb-3 text-sm font-semibold">Categories</h2>
          <ul class="flex flex-col gap-2 text-sm">
            <li v-for="category in topics?.categories ?? []" :key="category.slug">
              <NuxtLink :to="`/category/${category.slug}`" class="text-muted-foreground hover:text-foreground">
                {{ category.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>
        <div>
          <h2 class="mb-3 text-sm font-semibold">Popular tags</h2>
          <div class="flex flex-wrap gap-1.5">
            <NuxtLink
              v-for="tag in (topics?.tags ?? []).slice(0, 10)"
              :key="tag.slug"
              :to="`/tag/${tag.slug}`"
              class="text-muted-foreground hover:text-foreground hover:border-foreground/30 rounded-full border px-2.5 py-0.5 text-xs transition-colors"
            >
              {{ tag.name }}
            </NuxtLink>
          </div>
        </div>
      </div>
      <div class="border-t">
        <p class="text-muted-foreground mx-auto w-full max-w-6xl px-4 py-5 text-xs sm:px-6">
          © {{ year }} {{ site.name }}. {{ site.tagline }}.
        </p>
      </div>
    </footer>
  </div>
  </TooltipProvider>
</template>
