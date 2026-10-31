<script setup lang="ts">
import { HugeiconsIcon } from "@hugeicons/vue";
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { watchDebounced } from "@vueuse/core";

const { site } = useAppConfig();
const route = useRoute();
const router = useRouter();

// Search term lives in ?q= so results can be shared and survive reloads
const activeSearch = computed(() => (typeof route.query.q === "string" ? route.query.q.trim() : ""));
const searchInput = ref(activeSearch.value);

watchDebounced(
  searchInput,
  (value) => {
    const q = value.trim();
    if (q !== activeSearch.value) router.replace({ query: q ? { q } : {} });
  },
  { debounce: 350 },
);
watch(activeSearch, (q) => {
  if (q !== searchInput.value.trim()) searchInput.value = q;
});

useSeoMeta({
  title: () => (activeSearch.value ? `Search: ${activeSearch.value}` : `${site.name} · ${site.tagline}`),
  description: site.description,
  ogTitle: site.name,
  ogDescription: site.description,
  ogType: "website",
});
</script>

<template>
  <BlogListShell
    eyebrow="The Futurescope journal"
    title="Stories about the technology shaping tomorrow"
    :description="site.description"
  >
    <template #header>
      <div class="relative mt-7 max-w-xl">
        <HugeiconsIcon :icon="Search01Icon" class="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
        <Input
          v-model="searchInput"
          type="search"
          placeholder="Search stories, topics and ideas…"
          aria-label="Search stories"
          class="h-11 rounded-full pr-10 pl-10 text-base [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          v-if="searchInput"
          type="button"
          class="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1"
          aria-label="Clear search"
          @click="searchInput = ''"
        >
          <HugeiconsIcon :icon="Cancel01Icon" class="size-4" />
        </button>
      </div>
      <p v-if="activeSearch" class="text-muted-foreground mt-3 text-sm">
        Results for <span class="text-foreground font-medium">"{{ activeSearch }}"</span>
      </p>
    </template>

    <BlogFeed :search="activeSearch" />
  </BlogListShell>
</template>
