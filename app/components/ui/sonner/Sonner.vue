<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner"
import { HugeiconsIcon } from "@hugeicons/vue"
import { CheckmarkCircle01Icon, InformationCircleIcon, Loading03Icon, CancelCircleIcon, Alert02Icon, Cancel01Icon } from "@hugeicons/core-free-icons"

import { cn } from "cn"
import { Toaster as Sonner } from "vue-sonner"

const props = defineProps<ToasterProps>()
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
    }"
    v-bind="props"
  >
    <template #success-icon>
      <HugeiconsIcon :icon="CheckmarkCircle01Icon" class="size-4" />
    </template>
    <template #info-icon>
      <HugeiconsIcon :icon="InformationCircleIcon" class="size-4" />
    </template>
    <template #warning-icon>
      <HugeiconsIcon :icon="Alert02Icon" class="size-4" />
    </template>
    <template #error-icon>
      <HugeiconsIcon :icon="CancelCircleIcon" class="size-4" />
    </template>
    <template #loading-icon>
      <div>
        <HugeiconsIcon :icon="Loading03Icon" class="size-4 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <HugeiconsIcon :icon="Cancel01Icon" class="size-4" />
    </template>
  </Sonner>
</template>
