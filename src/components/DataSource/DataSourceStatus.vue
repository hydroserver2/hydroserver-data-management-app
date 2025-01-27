<template>
  <v-chip density="compact" :color="chipData.color" class="ma-0 pa-2">
    {{ chipData.text }}
  </v-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status: 'ok' | 'pending' | 'bad' | 'stale' | 'unknown'
  paused: boolean
}

const props = defineProps<Props>()

const statusMap = {
  ok: { color: 'green', text: 'Up-To-Date' },
  pending: { color: 'blue', text: 'Pending' },
  bad: { color: 'red', text: 'Needs attention' },
  stale: { color: 'orange-darken-4', text: 'Behind schedule' },
  unknown: { color: 'gray', text: 'Unknown' },
}

const chipData = computed(() => {
  if (props.paused) {
    return { color: 'gray', text: 'Loading paused' }
  }
  return statusMap[props.status]
    ? statusMap[props.status]
    : { color: 'gray', text: 'Unknown' }
})
</script>
