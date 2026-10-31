<script setup lang="ts">
withDefaults(defineProps<{ size?: "sm" | "md" }>(), { size: "md" });
</script>

<template>
  <span
    :class="[
      'bg-brand flex shrink-0 items-center justify-center font-[family-name:var(--font-heading)] font-bold text-white shadow-sm shadow-primary/30',
      size === 'sm' ? 'size-7 rounded-md text-xs' : 'size-8 rounded-lg text-sm',
    ]"
    aria-hidden="true"
  >
    F
  </span>
</template>
