<script setup lang="ts">
import { HugeiconsIcon } from "@hugeicons/vue";
import { Delete02Icon, ImageUploadIcon, Loading03Icon } from "@hugeicons/core-free-icons";
import { toast } from "vue-sonner";
import { cn } from "~/lib/utils";

const props = defineProps<{ id?: string; invalid?: boolean; disabled?: boolean }>();
const model = defineModel<Asset | null>({ default: null });
const emit = defineEmits<{ uploaded: [asset: Asset]; blur: [] }>();

const { upload, validateFiles } = useAssets();
const uploading = ref(false);
const dragging = ref(false);
const fileInput = ref<HTMLInputElement>();

async function handleFile(file?: File) {
  if (!file || uploading.value || props.disabled) return;
  try {
    validateFiles([file]);
  } catch (error) {
    toast.error(errorMessage(error));
    return;
  }

  uploading.value = true;
  try {
    const [asset] = await upload([file]);
    if (asset) {
      emit("uploaded", asset);
      model.value = asset;
    }
  } catch (error) {
    toast.error(errorMessage(error, "Image upload failed"));
  } finally {
    uploading.value = false;
    emit("blur");
  }
}

function onPick(event: Event) {
  const input = event.target as HTMLInputElement;
  handleFile(input.files?.[0]);
  input.value = "";
}

function onDrop(event: DragEvent) {
  dragging.value = false;
  handleFile(event.dataTransfer?.files?.[0]);
}

function clear() {
  model.value = null;
  emit("blur");
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      v-if="model"
      class="group bg-muted relative aspect-video overflow-hidden rounded-md border"
    >
      <img :src="model.url" alt="Cover image" class="size-full object-cover">
      <div
        v-if="uploading"
        class="bg-background/70 absolute inset-0 flex items-center justify-center"
      >
        <HugeiconsIcon :icon="Loading03Icon" class="size-6 animate-spin" />
      </div>
      <div class="absolute right-2 bottom-2 flex gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <Button type="button" size="sm" variant="secondary" :disabled="uploading || disabled" @click="fileInput?.click()">
          Replace
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="destructive"
          aria-label="Remove cover image"
          :disabled="uploading || disabled"
          @click="clear"
        >
          <HugeiconsIcon :icon="Delete02Icon" class="size-4" />
        </Button>
      </div>
    </div>

    <button
      v-else
      :id="id"
      type="button"
      :disabled="uploading || disabled"
      :aria-invalid="invalid || undefined"
      :class="
        cn(
          'border-input hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-ring/50 flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed text-sm outline-none transition-colors focus-visible:ring-3 disabled:opacity-60',
          dragging && 'border-ring bg-muted/50',
          invalid && 'border-destructive',
        )
      "
      @click="fileInput?.click()"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
    >
      <HugeiconsIcon :icon="uploading ? Loading03Icon : ImageUploadIcon" :class="['text-muted-foreground size-6', uploading && 'animate-spin']" />
      <span class="font-medium">{{ uploading ? "Uploading…" : "Upload cover image" }}</span>
      <span class="text-muted-foreground text-xs">Click or drop · JPG, PNG, WebP, GIF, AVIF · max 4 MB</span>
    </button>

    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
      class="hidden"
      @change="onPick"
    >
  </div>
</template>
