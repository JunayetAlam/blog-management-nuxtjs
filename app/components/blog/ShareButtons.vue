<script setup lang="ts">
import { HugeiconsIcon } from "@hugeicons/vue";
import { Facebook01Icon, Link01Icon, Linkedin01Icon, NewTwitterIcon, Share08Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { toast } from "vue-sonner";

const props = defineProps<{ url: string; title: string }>();

const links = computed(() => {
  const url = encodeURIComponent(props.url);
  const text = encodeURIComponent(props.title);
  return [
    { label: "Share on X", icon: NewTwitterIcon, href: `https://x.com/intent/post?url=${url}&text=${text}` },
    { label: "Share on LinkedIn", icon: Linkedin01Icon, href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}` },
    { label: "Share on Facebook", icon: Facebook01Icon, href: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
  ];
});

const copied = ref(false);
async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.url);
    copied.value = true;
    toast.success("Link copied");
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    toast.error("Couldn't copy the link");
  }
}

const canNativeShare = ref(false);
onMounted(() => (canNativeShare.value = typeof navigator.share === "function"));
function nativeShare() {
  navigator.share({ title: props.title, url: props.url }).catch(() => {});
}
</script>

<template>
  <div class="flex items-center gap-1.5">
    <Tooltip v-for="link in links" :key="link.label">
      <TooltipTrigger as-child>
        <Button as="a" :href="link.href" target="_blank" rel="noopener noreferrer" variant="outline" size="icon-sm" :aria-label="link.label">
          <HugeiconsIcon :icon="link.icon" class="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{{ link.label }}</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="outline" size="icon-sm" :aria-label="copied ? 'Link copied' : 'Copy link'" @click="copyLink">
          <HugeiconsIcon :icon="copied ? Tick02Icon : Link01Icon" class="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{{ copied ? "Copied!" : "Copy link" }}</TooltipContent>
    </Tooltip>
    <Button v-if="canNativeShare" variant="outline" size="icon-sm" aria-label="More sharing options" class="sm:hidden" @click="nativeShare">
      <HugeiconsIcon :icon="Share08Icon" class="size-4" />
    </Button>
  </div>
</template>
