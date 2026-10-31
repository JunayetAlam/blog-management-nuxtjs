<script setup lang="ts">
import type { PaginationEllipsisProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { HugeiconsIcon } from "@hugeicons/vue"
import { MoreHorizontalCircle01Icon } from "@hugeicons/core-free-icons"

import { reactiveOmit } from "@vueuse/core"
import { cn } from "cn"
import { PaginationEllipsis } from "reka-ui"

const props = defineProps<PaginationEllipsisProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <PaginationEllipsis
    data-slot="pagination-ellipsis"
    v-bind="delegatedProps"
    :class="cn('flex size-9 items-center justify-center', props.class)"
  >
    <slot>
      <HugeiconsIcon :icon="MoreHorizontalCircle01Icon" class="size-4" />
      <span class="sr-only">More pages</span>
    </slot>
  </PaginationEllipsis>
</template>
