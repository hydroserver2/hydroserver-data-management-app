<template>
  <v-chip :color="chipColor" density="compact" class="ma-0 pa-2">
    {{ chipText }}
  </v-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status?: string | null
  paused?: boolean
}>()

type StatusStyle = {
  text: string
  color: string
}

const STATUS_STYLES: Record<string, StatusStyle> = {
  success: { text: 'Success', color: 'green' },
  failure: { text: 'Failure', color: 'red' },
  started: { text: 'Running', color: 'blue' },
  retry: { text: 'Retrying', color: 'orange-darken-2' },
  revoked: { text: 'Revoked', color: 'grey' },
  pending: { text: 'Pending', color: 'grey' }, // not queued yet
  paused: { text: 'Paused', color: 'grey' },
  queued: { text: 'Queued', color: 'grey' },
  // legacy statuses so older values still render sensibly
  ok: { text: 'OK', color: 'green' },
  'needs attention': { text: 'Needs attention', color: 'red' },
  'behind schedule': { text: 'Behind schedule', color: 'orange-darken-4' },
  'loading paused': { text: 'Paused', color: 'grey' },
  unknown: { text: 'Unknown', color: 'grey' },
}

const normalizedStatus = computed(() => {
  if (props.paused) return 'paused'
  const raw = props.status?.toString().trim()
  return raw ? raw.toLowerCase() : 'pending'
})

const chipConfig = computed<StatusStyle>(() => {
  const mapped = STATUS_STYLES[normalizedStatus.value]
  if (mapped) return mapped

  const fallbackText = props.status?.toString() || 'Unknown'
  return { text: fallbackText, color: 'grey' }
})

const chipColor = computed(() => chipConfig.value.color)
const chipText = computed(() => chipConfig.value.text)
</script>
