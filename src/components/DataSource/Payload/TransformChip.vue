<template>
  <v-chip size="small" :color="color" variant="tonal">
    <v-icon size="14" class="mr-1">{{ icon }}</v-icon
    >{{ label }}
  </v-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DataTransformation } from '@hydroserver/client'

const props = defineProps<{ t: DataTransformation }>()

const icon = computed(() =>
  props.t.type === 'expression' ? 'mdi-function-variant' : 'mdi-table-search'
)

const color = computed(() =>
  props.t.type === 'expression' ? 'deep-purple' : 'teal'
)

const label = computed(() => {
  if (props.t.type === 'expression') return props.t.expression
  return `lookup: ${props.t.lookupTableId}`
})
</script>
