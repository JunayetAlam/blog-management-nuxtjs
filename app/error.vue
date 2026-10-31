<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{ error: NuxtError }>();
const notFound = computed(() => props.error.statusCode === 404);

useHead({ title: notFound.value ? "Page not found" : "Something went wrong" });
</script>

<template>
  <NuxtLayout>
    <div class="mx-auto flex min-h-[60svh] w-full max-w-xl flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <p class="text-primary text-sm font-semibold">{{ error.statusCode }}</p>
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
        {{ notFound ? "We couldn't find that page" : "Something went wrong" }}
      </h1>
      <p class="text-muted-foreground">
        {{ notFound ? "The story may have been moved or unpublished." : "Please try again in a moment." }}
      </p>
      <Button class="mt-2" @click="clearError({ redirect: '/' })">Back to all stories</Button>
    </div>
  </NuxtLayout>
</template>
