<script setup lang="ts">
defineProps<{ status: PostStatus }>();
</script>

<template>
  <Badge v-if="status === 'PUBLISHED'" class="bg-emerald-600 text-white dark:bg-emerald-500/80">Published</Badge>
  <Badge v-else variant="secondary">Draft</Badge>
</template>
