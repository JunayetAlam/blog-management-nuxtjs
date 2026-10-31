<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { HugeiconsIcon } from "@hugeicons/vue";
import { Add01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { useCommand } from "~/components/ui/command";

// Rendered inside <Command>, outside <CommandList>: Command's filter hides list items that mount after
// typing starts, so the "Create …" action lives below the list and reads the search term directly
const props = defineProps<{ existing: string[]; creating?: boolean }>();
const emit = defineEmits<{ create: [name: string] }>();

const { filterState } = useCommand();
const term = computed(() => filterState.search.trim());
const visible = computed(
  () => !!term.value && !props.existing.some((name) => name.toLowerCase() === term.value.toLowerCase()),
);

// Keep showing the name while the request runs, even after the search is cleared
const pending = ref("");

function create() {
  if (!term.value || props.creating) return;
  pending.value = term.value;
  emit("create", term.value);
  filterState.search = "";
}

// Enter in the search box creates when nothing in the list matches
useEventListener(document, "keydown", (event) => {
  const target = event.target as HTMLElement | null;
  if (event.key !== "Enter" || target?.dataset.slot !== "command-input") return;
  if (!visible.value || filterState.filtered.count > 0) return;
  event.preventDefault();
  create();
});
</script>

<template>
  <div v-if="visible || creating" class="border-t p-1">
    <button
      type="button"
      class="hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none disabled:opacity-50"
      :disabled="creating"
      @click="create"
    >
      <HugeiconsIcon :icon="creating ? Loading03Icon : Add01Icon" :class="['size-4 shrink-0', creating && 'animate-spin']" />
      <span class="truncate">Create "{{ creating ? pending : term }}"</span>
    </button>
  </div>
</template>
