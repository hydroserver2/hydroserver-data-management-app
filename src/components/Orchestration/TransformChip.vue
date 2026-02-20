<template>
  <v-chip size="small" :color="color" variant="tonal">
    <v-icon :icon="icon" size="14" class="mr-1" />
    {{ label }}
  </v-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DataTransformation } from '@hydroserver/client'
import { mdiFunctionVariant, mdiTableSearch } from '@mdi/js'
import { getRatingCurveReference } from '@/utils/orchestration/ratingCurve'

const props = defineProps<{ t: DataTransformation }>()

const color = computed(() =>
  (props.t as any).type === 'expression'
    ? 'deep-purple'
    : (props.t as any).type === 'aggregation'
      ? 'indigo'
      : 'teal'
)

const label = computed(() => {
  if ((props.t as any).type === 'expression') return (props.t as any).expression
  if ((props.t as any).type === 'aggregation') {
    return (
      (props.t as any).aggregationStatistic
        ?.replaceAll('_', ' ')
        ?.replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'aggregation'
    )
  }
  const reference = getRatingCurveReference(props.t)
  return reference ? 'rating curve' : 'rating curve'
})

const icon = computed(() =>
  (props.t as any).type === 'rating_curve' ? mdiTableSearch : mdiFunctionVariant
)
</script>
