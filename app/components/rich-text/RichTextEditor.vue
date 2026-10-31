<script setup lang="ts">
import { EditorContent, useEditor } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { Placeholder } from "@tiptap/extensions";
import { toast } from "vue-sonner";
import { cn } from "~/lib/utils";

const props = withDefaults(
  defineProps<{ id?: string; placeholder?: string; invalid?: boolean; disabled?: boolean }>(),
  { placeholder: "Write your post…" },
);
// HTML string; "" when the document is empty so `required` validation works
const model = defineModel<string>({ default: "" });
const emit = defineEmits<{ uploaded: [assets: Asset[]]; blur: [] }>();

const { upload, validateFiles } = useAssets();
const uploading = ref(0);
const fileInput = ref<HTMLInputElement>();

const editor = useEditor({
  content: model.value,
  editable: !props.disabled,
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
    }),
    Image,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Placeholder.configure({ placeholder: () => props.placeholder }),
  ],
  editorProps: {
    attributes: {
      class: "prose prose-sm sm:prose-base dark:prose-invert max-w-none px-4 py-3",
      ...(props.id ? { id: props.id } : {}),
    },
    handlePaste(_view, event) {
      const files = imageFiles(event.clipboardData?.files);
      if (!files.length) return false;
      insertImages(files);
      return true;
    },
    handleDrop(view, event, _slice, moved) {
      const files = imageFiles(event.dataTransfer?.files);
      if (moved || !files.length) return false;
      event.preventDefault();
      insertImages(files, view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos);
      return true;
    },
  },
  onUpdate: ({ editor }) => {
    model.value = editor.isEmpty ? "" : editor.getHTML();
  },
  onBlur: () => emit("blur"),
});

// Keep the editor in sync when the value is changed from outside (e.g. form reset)
watch(model, (value) => {
  const instance = editor.value;
  if (!instance) return;
  const current = instance.isEmpty ? "" : instance.getHTML();
  if (value !== current) instance.commands.setContent(value || "", { emitUpdate: false });
});

watch(
  () => props.disabled,
  (disabled) => editor.value?.setEditable(!disabled),
);

function imageFiles(list?: FileList | null) {
  return Array.from(list ?? []).filter((file) => file.type.startsWith("image/"));
}

async function insertImages(files: File[], pos?: number) {
  const instance = editor.value;
  if (!instance || !files.length) return;

  try {
    validateFiles(files);
  } catch (error) {
    toast.error(errorMessage(error));
    return;
  }

  uploading.value++;
  const toastId = toast.loading(files.length > 1 ? `Uploading ${files.length} images…` : "Uploading image…");
  try {
    const assets = await upload(files);
    emit("uploaded", assets);

    const nodes = assets.map((asset, i) => ({
      type: "image",
      attrs: { src: asset.url, alt: files[i]?.name.replace(/\.[^.]+$/, "") ?? "" },
    }));
    const chain = instance.chain().focus();
    (pos === undefined ? chain.insertContent(nodes) : chain.insertContentAt(pos, nodes)).run();

    toast.success(assets.length > 1 ? `${assets.length} images uploaded` : "Image uploaded", { id: toastId });
  } catch (error) {
    toast.error(errorMessage(error, "Image upload failed"), { id: toastId });
  } finally {
    uploading.value--;
  }
}

function onPick(event: Event) {
  const input = event.target as HTMLInputElement;
  insertImages(imageFiles(input.files));
  input.value = "";
}
</script>

<template>
  <div
    :class="
      cn(
        'border-input focus-within:border-ring focus-within:ring-ring/50 overflow-hidden rounded-md border shadow-xs transition-[color,box-shadow] focus-within:ring-3',
        invalid && 'border-destructive focus-within:border-destructive focus-within:ring-destructive/20',
        disabled && 'pointer-events-none opacity-60',
      )
    "
  >
    <RichTextToolbar v-if="editor" :editor="editor" :uploading="uploading > 0" @image="fileInput?.click()" />
    <EditorContent :editor="editor" />
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
      multiple
      class="hidden"
      @change="onPick"
    >
  </div>
</template>
