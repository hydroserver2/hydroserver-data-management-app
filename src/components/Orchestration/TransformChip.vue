<template>
  <v-chip size="small" :color="color" variant="tonal">
    <v-icon
      :icon="t.type === 'expression' ? mdiFunctionVariant : mdiTableSearch"
      size="14"
      class="mr-1"
    />
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
  props.t.type === 'expression' ? 'deep-purple' : 'teal'
)

const label = computed(() => {
  if (props.t.type === 'expression') return props.t.expression
  const reference = getRatingCurveReference(props.t)
  return reference ? 'rating curve' : 'rating curve'
})
</script>
