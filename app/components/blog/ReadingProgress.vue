<script setup lang="ts">
import { useEventListener } from "@vueuse/core";

// How far the reader is through `target` (the article), from its top to its bottom edge
const props = defineProps<{ target?: HTMLElement | null }>();
const progress = ref(0);

function update() {
  const el = props.target;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const scrollable = rect.height - window.innerHeight;
  const read = scrollable > 0 ? -rect.top / scrollable : rect.top <= 0 ? 1 : 0;
  progress.value = Math.min(1, Math.max(0, read));
}

onMounted(update);
watch(() => props.target, update);
useEventListener(window, "scroll", update, { passive: true });
useEventListener(window, "resize", update, { passive: true });
</script>

<template>
  <div
    class="fixed inset-x-0 top-0 z-50 h-1"
    role="progressbar"
    aria-label="Reading progress"
    :aria-valuenow="Math.round(progress * 100)"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div class="bg-primary h-full origin-left transition-transform duration-100 ease-out" :style="{ transform: `scaleX(${progress})` }" />
  </div>
</template>
