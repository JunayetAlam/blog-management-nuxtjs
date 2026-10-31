<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  CodeIcon,
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  ImageAdd01Icon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  Link01Icon,
  Loading03Icon,
  MinusSignIcon,
  ParagraphIcon,
  QuoteDownIcon,
  RedoIcon,
  SourceCodeIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextBoldIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon,
  UndoIcon,
} from "@hugeicons/core-free-icons";

const props = defineProps<{ editor: Editor; uploading: boolean }>();
const emit = defineEmits<{ image: [] }>();

interface ToolbarItem {
  label: string;
  icon: typeof TextBoldIcon;
  run: () => void;
  active?: () => boolean;
  disabled?: () => boolean;
}

const chain = () => props.editor.chain().focus();

const headingIcons = { 1: Heading01Icon, 2: Heading02Icon, 3: Heading03Icon };
const alignIcons = { left: TextAlignLeftIcon, center: TextAlignCenterIcon, right: TextAlignRightIcon };

const groups: ToolbarItem[][] = [
  [
    { label: "Undo", icon: UndoIcon, run: () => chain().undo().run(), disabled: () => !props.editor.can().undo() },
    { label: "Redo", icon: RedoIcon, run: () => chain().redo().run(), disabled: () => !props.editor.can().redo() },
  ],
  [
    {
      label: "Paragraph",
      icon: ParagraphIcon,
      run: () => chain().setParagraph().run(),
      active: () => props.editor.isActive("paragraph"),
    },
    ...([1, 2, 3] as const).map((level) => ({
      label: `Heading ${level}`,
      icon: headingIcons[level],
      run: () => chain().toggleHeading({ level }).run(),
      active: () => props.editor.isActive("heading", { level }),
    })),
  ],
  [
    { label: "Bold", icon: TextBoldIcon, run: () => chain().toggleBold().run(), active: () => props.editor.isActive("bold") },
    { label: "Italic", icon: TextItalicIcon, run: () => chain().toggleItalic().run(), active: () => props.editor.isActive("italic") },
    {
      label: "Underline",
      icon: TextUnderlineIcon,
      run: () => chain().toggleUnderline().run(),
      active: () => props.editor.isActive("underline"),
    },
    {
      label: "Strikethrough",
      icon: TextStrikethroughIcon,
      run: () => chain().toggleStrike().run(),
      active: () => props.editor.isActive("strike"),
    },
    { label: "Inline code", icon: CodeIcon, run: () => chain().toggleCode().run(), active: () => props.editor.isActive("code") },
  ],
  [
    {
      label: "Bullet list",
      icon: LeftToRightListBulletIcon,
      run: () => chain().toggleBulletList().run(),
      active: () => props.editor.isActive("bulletList"),
    },
    {
      label: "Numbered list",
      icon: LeftToRightListNumberIcon,
      run: () => chain().toggleOrderedList().run(),
      active: () => props.editor.isActive("orderedList"),
    },
    {
      label: "Quote",
      icon: QuoteDownIcon,
      run: () => chain().toggleBlockquote().run(),
      active: () => props.editor.isActive("blockquote"),
    },
    {
      label: "Code block",
      icon: SourceCodeIcon,
      run: () => chain().toggleCodeBlock().run(),
      active: () => props.editor.isActive("codeBlock"),
    },
    { label: "Divider", icon: MinusSignIcon, run: () => chain().setHorizontalRule().run() },
  ],
  (["left", "center", "right"] as const).map((align) => ({
    label: `Align ${align}`,
    icon: alignIcons[align],
    run: () => chain().setTextAlign(align).run(),
    active: () => props.editor.isActive({ textAlign: align }),
  })),
];

// Link editing
const linkOpen = ref(false);
const linkUrl = ref("");

watch(linkOpen, (open) => {
  if (open) linkUrl.value = props.editor.getAttributes("link").href ?? "";
});

function applyLink() {
  const url = linkUrl.value.trim();
  const c = chain().extendMarkRange("link");
  if (url) c.setLink({ href: /^(https?:|mailto:|\/)/i.test(url) ? url : `https://${url}` }).run();
  else c.unsetLink().run();
  linkOpen.value = false;
}

function removeLink() {
  chain().extendMarkRange("link").unsetLink().run();
  linkOpen.value = false;
}
</script>

<template>
  <div class="bg-muted/40 flex flex-wrap items-center gap-0.5 border-b p-1">
    <template v-for="(group, i) in groups" :key="i">
      <Separator v-if="i" orientation="vertical" class="mx-1 !h-6" />
      <Toggle
        v-for="item in group"
        :key="item.label"
        size="sm"
        :model-value="item.active?.() ?? false"
        :disabled="item.disabled?.()"
        :aria-label="item.label"
        :title="item.label"
        @update:model-value="item.run()"
      >
        <HugeiconsIcon :icon="item.icon" class="size-4" />
      </Toggle>
    </template>

    <Separator orientation="vertical" class="mx-1 !h-6" />

    <Popover v-model:open="linkOpen">
      <PopoverTrigger as-child>
        <Toggle size="sm" :model-value="editor.isActive('link')" aria-label="Link" title="Link">
          <HugeiconsIcon :icon="Link01Icon" class="size-4" />
        </Toggle>
      </PopoverTrigger>
      <PopoverContent class="w-80" align="start">
        <form class="flex flex-col gap-3" @submit.prevent="applyLink">
          <Label for="rte-link">Link URL</Label>
          <Input id="rte-link" v-model="linkUrl" placeholder="https://example.com" autofocus />
          <div class="flex justify-end gap-2">
            <Button v-if="editor.isActive('link')" type="button" variant="ghost" size="sm" @click="removeLink">
              Remove
            </Button>
            <Button type="submit" size="sm">Apply</Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>

    <Toggle
      size="sm"
      :model-value="false"
      :disabled="uploading"
      aria-label="Insert image"
      title="Insert image (you can also paste or drop images)"
      @update:model-value="emit('image')"
    >
      <HugeiconsIcon :icon="uploading ? Loading03Icon : ImageAdd01Icon" :class="['size-4', uploading && 'animate-spin']" />
    </Toggle>
  </div>
</template>
