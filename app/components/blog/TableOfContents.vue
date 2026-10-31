<script setup lang="ts">
import { useEventListener } from "@vueuse/core";

const props = defineProps<{ items: TocItem[] }>();
const activeId = ref(props.items[0]?.id ?? "");

// The active section is the last heading that has scrolled past the top (below the sticky header)
function update() {
  const offset = 120;
  let current = props.items[0]?.id ?? "";
  for (const item of props.items) {
    const el = document.getElementById(item.id);
    if (el && el.getBoundingClientRect().top - offset <= 0) current = item.id;
  }
  // At the very bottom, highlight the last heading even if it never reached the top
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
    current = props.items.at(-1)?.id ?? current;
  }
  activeId.value = current;
}

onMounted(update);
useEventListener(window, "scroll", update, { passive: true });

function go(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  history.replaceState(null, "", `#${id}`);
  activeId.value = id;
}
</script>

<template>
  <nav aria-label="Table of contents">
    <p class="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">On this page</p>
    <ul class="border-border flex flex-col border-l text-sm">
      <li v-for="item in items" :key="item.id">
        <a
          :href="`#${item.id}`"
          :class="[
            '-ml-px block border-l-2 py-1.5 leading-snug transition-colors',
            item.level === 3 ? 'pl-7 text-[0.8125rem]' : 'pl-4',
            activeId === item.id
              ? 'border-primary text-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground border-transparent',
          ]"
          :aria-current="activeId === item.id ? 'location' : undefined"
          @click.prevent="go(item.id)"
        >
          {{ item.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>
