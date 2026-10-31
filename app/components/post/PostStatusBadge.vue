<script setup lang="ts">
defineProps<{ status: PostStatus }>();
</script>

<template>
  <Badge v-if="status === 'PUBLISHED'" class="bg-success/12 text-success border-success/25">Published</Badge>
  <Badge v-else variant="secondary">Draft</Badge>
</template>
