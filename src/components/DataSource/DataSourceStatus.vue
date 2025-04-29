<template>
  <v-chip :color="chipColor" density="compact" class="ma-0 pa-2">
    {{ chipText }}
  </v-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DATASOURCE_STATUS_OPTIONS, StatusType } from '@/models/dataSource'

interface Props {
  status: StatusType
  paused: boolean | undefined
}
const props = defineProps<Props>()

const chipColor = computed(() => {
  if (props.paused && props.status !== 'Needs attention') {
    return 'gray'
  }
  return (
    DATASOURCE_STATUS_OPTIONS.find((s) => s.title === props.status)?.color ??
    'gray'
  )
})

const chipText = computed(() => {
  if (props.paused && props.status !== 'Needs attention') {
    return 'Loading paused'
  }
  return props.status
})
</script>
