<script setup lang="ts">
import { HugeiconsIcon } from "@hugeicons/vue";
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";

const colorMode = useColorMode();

// The saved choice lives in localStorage, which the server can't see. Render the default (dark) label first,
// then switch to the real one after mount so hydration matches. The icons are CSS-driven and never mismatch.
const mounted = ref(false);
onMounted(() => (mounted.value = true));
const isDark = computed(() => (mounted.value ? colorMode.value === "dark" : true));

function toggle() {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}
</script>

<template>
  <Button
    variant="ghost"
    size="icon-sm"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  >
    <!-- Both icons render on the server; CSS shows the right one so there's no flash before hydration -->
    <HugeiconsIcon :icon="Moon02Icon" class="size-[1.15rem] dark:hidden" />
    <HugeiconsIcon :icon="Sun03Icon" class="hidden size-[1.15rem] dark:block" />
  </Button>
</template>
