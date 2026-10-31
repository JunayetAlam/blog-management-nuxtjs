<script setup lang="ts">
import { HugeiconsIcon } from "@hugeicons/vue";
import { Cancel01Icon, Tick02Icon, UnfoldMoreIcon } from "@hugeicons/core-free-icons";
import { toast } from "vue-sonner";
import { cn } from "~/lib/utils";

const props = withDefaults(
  defineProps<{
    endpoint: "/api/categories" | "/api/tags";
    /** Singular noun used in labels, e.g. "category" */
    noun: string;
    multiple?: boolean;
    max?: number;
    id?: string;
    placeholder?: string;
    invalid?: boolean;
    disabled?: boolean;
    /** Options already known (e.g. the post's current tags), shown before the list loads */
    initialOptions?: TaxonomyRef[];
  }>(),
  { initialOptions: () => [] },
);
// Selected ids. Single mode uses at most one entry
const model = defineModel<string[]>({ default: () => [] });
const emit = defineEmits<{ blur: [] }>();

const open = ref(false);
const creating = ref(false);
const options = ref<TaxonomyRef[]>([...props.initialOptions]);

const byId = computed(() => new Map(options.value.map((o) => [o.id, o])));
const selected = computed(() => model.value.map((id) => byId.value.get(id)).filter((o): o is TaxonomyRef => !!o));
const limitReached = computed(() => props.multiple && !!props.max && model.value.length >= props.max);

function mergeOptions(items: TaxonomyRef[]) {
  const map = new Map(options.value.map((o) => [o.id, o]));
  for (const item of items) map.set(item.id, item);
  options.value = [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

onMounted(async () => {
  try {
    const res = await $fetch<Paginated<TaxonomyRef>>(props.endpoint, { query: { limit: 100, sortBy: "name" } });
    mergeOptions(res.data);
  } catch (error) {
    toast.error(errorMessage(error, `Could not load ${props.noun} list`));
  }
});

function toggle(option: TaxonomyRef) {
  const isSelected = model.value.includes(option.id);
  if (!props.multiple) {
    model.value = isSelected ? [] : [option.id];
    open.value = false;
    return;
  }
  if (isSelected) model.value = model.value.filter((id) => id !== option.id);
  else if (!limitReached.value) model.value = [...model.value, option.id];
}

function removeOne(id: string) {
  model.value = model.value.filter((v) => v !== id);
  emit("blur");
}

async function create(name: string) {
  if (!name || creating.value) return;
  creating.value = true;
  try {
    const created = await $fetch<TaxonomyRef>(props.endpoint, { method: "POST", body: { name } });
    mergeOptions([created]);
    toggle(created);
    toast.success(`Created ${props.noun} "${created.name}"`);
  } catch (error) {
    toast.error(errorMessage(error, `Could not create ${props.noun}`));
  } finally {
    creating.value = false;
  }
}

watch(open, (value) => {
  if (!value) emit("blur");
});
</script>

<template>
  <div class="flex flex-col gap-2">
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          :id="id"
          type="button"
          variant="outline"
          role="combobox"
          :aria-expanded="open"
          :aria-invalid="invalid || undefined"
          :disabled="disabled"
          :class="cn('w-full justify-between font-normal', !selected.length && 'text-muted-foreground')"
        >
          <span class="truncate">
            <template v-if="!multiple && selected[0]">{{ selected[0].name }}</template>
            <template v-else>{{ placeholder ?? `Select ${noun}…` }}</template>
          </span>
          <HugeiconsIcon :icon="UnfoldMoreIcon" class="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent class="w-(--reka-popover-trigger-width) min-w-64 p-0" align="start">
        <Command>
          <CommandInput :placeholder="`Search or create a ${noun}…`" />
          <CommandList>
            <CommandEmpty>No {{ noun }} found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                v-for="option in options"
                :key="option.id"
                :value="option.id"
                :disabled="limitReached && !model.includes(option.id)"
                @select="toggle(option)"
              >
                <HugeiconsIcon
                  :icon="Tick02Icon"
                  :class="cn('size-4', model.includes(option.id) ? 'opacity-100' : 'opacity-0')"
                />
                <span class="truncate">{{ option.name }}</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
          <TaxonomyCreateItem
            v-if="!limitReached"
            :existing="options.map((o) => o.name)"
            :creating="creating"
            @create="create"
          />
        </Command>
      </PopoverContent>
    </Popover>

    <div v-if="multiple && selected.length" class="flex flex-wrap gap-1.5">
      <Badge v-for="option in selected" :key="option.id" variant="secondary" class="gap-1 pr-1">
        {{ option.name }}
        <button
          type="button"
          class="hover:bg-muted-foreground/20 rounded-full p-0.5"
          :aria-label="`Remove ${option.name}`"
          :disabled="disabled"
          @click="removeOne(option.id)"
        >
          <HugeiconsIcon :icon="Cancel01Icon" class="size-3" />
        </button>
      </Badge>
    </div>
  </div>
</template>
