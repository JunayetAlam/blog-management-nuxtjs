<script setup lang="ts">
const colorMode = useColorMode();
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster rich-colors position="bottom-right" :theme="colorMode.value === 'dark' ? 'dark' : 'light'" />
  </div>
</template>
