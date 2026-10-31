<script setup lang="ts">
import { HugeiconsIcon } from "@hugeicons/vue";
import { Alert02Icon } from "@hugeicons/core-free-icons";

// Create (postId = null) or edit a post in a side sheet that only closes on purpose
const props = defineProps<{ postId: string | null }>();
const open = defineModel<boolean>("open", { default: false });
const emit = defineEmits<{ saved: [post: Post] }>();

const formRef = ref<{ isDirty: boolean; isSubmitting: boolean }>();
const confirmDiscard = ref(false);

const post = ref<Post | null>(null);
const loading = ref(false);
const loadError = ref<string | null>(null);

async function load() {
  if (!props.postId) return;
  loading.value = true;
  loadError.value = null;
  try {
    post.value = await $fetch<Post>(`/api/posts/${props.postId}`);
  } catch (error) {
    loadError.value = errorMessage(error, "Could not load the post");
  } finally {
    loading.value = false;
  }
}

watch(
  () => [open.value, props.postId] as const,
  ([isOpen]) => {
    if (!isOpen) return;
    post.value = null;
    load();
  },
  { immediate: true },
);

function requestClose() {
  if (formRef.value?.isSubmitting) return;
  if (formRef.value?.isDirty) confirmDiscard.value = true;
  else open.value = false;
}

function discard() {
  confirmDiscard.value = false;
  open.value = false;
}

function onSaved(saved: Post) {
  emit("saved", saved);
  open.value = false;
}

const ready = computed(() => !props.postId || !!post.value);
</script>

<template>
  <Sheet :open="open" @update:open="(value) => (value ? (open = true) : requestClose())">
    <SheetContent
      class="w-full gap-0 p-0 sm:max-w-5xl"
      @interact-outside="(event) => event.preventDefault()"
    >
      <SheetHeader class="border-b px-6 py-4">
        <SheetTitle>{{ postId ? "Edit post" : "New post" }}</SheetTitle>
        <SheetDescription>
          {{ postId ? "Update the post and save your changes." : "Write a new post. Save it as a draft or publish it right away." }}
        </SheetDescription>
      </SheetHeader>

      <PostForm
        v-if="ready"
        :key="postId ?? 'new'"
        ref="formRef"
        :post="post"
        @saved="onSaved"
        @cancel="requestClose"
      />

      <div v-else-if="loadError" class="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <HugeiconsIcon :icon="Alert02Icon" class="text-destructive size-8" />
        <p class="text-sm">{{ loadError }}</p>
        <Button variant="outline" size="sm" @click="load">Try again</Button>
      </div>

      <div v-else class="grid flex-1 gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div class="flex flex-col gap-5">
          <Skeleton class="h-9 w-full" />
          <Skeleton class="h-9 w-full" />
          <Skeleton class="h-20 w-full" />
          <Skeleton class="h-80 w-full" />
        </div>
        <div class="flex flex-col gap-5">
          <Skeleton class="h-9 w-full" />
          <Skeleton class="h-9 w-full" />
          <Skeleton class="aspect-video w-full" />
        </div>
      </div>
    </SheetContent>
  </Sheet>

  <AlertDialog v-model:open="confirmDiscard">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
        <AlertDialogDescription>
          Your changes to this post will be lost. Images you uploaded in this session will be deleted.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Keep editing</AlertDialogCancel>
        <Button variant="destructive" @click="discard">Discard</Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
