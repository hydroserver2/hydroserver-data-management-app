<template>
  <v-card>
    <v-toolbar flat color="red-darken-4">
      <v-card-title class="text-h5">
        <v-icon>mdi-alert</v-icon> Confirm payload deletion
        <span class="opacity-80">- {{ payload.name }}</span>
      </v-card-title>
    </v-toolbar>
    <v-divider />

    <v-card-text>
      This action will permanently delete the payload configuration.
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn-cancel @click="emit('close')">Cancel</v-btn-cancel>
      <v-btn-delete color="delete" @click="onDelete">Delete</v-btn-delete>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { Payload } from '@/models'
import { api } from '@/services/api'
import { useETLStore } from '@/store/etl'
import { storeToRefs } from 'pinia'

const emit = defineEmits(['delete', 'close'])
const props = defineProps({
  payload: {
    type: Object as () => Payload,
    required: true,
  },
  payloadIndex: { type: Number, required: true },
})

const { dataSource, payloads } = storeToRefs(useETLStore())
const { updateLinkedDatastreams } = useETLStore()

const onDelete = async () => {
  payloads.value.splice(props.payloadIndex, 1)
  await api.updateDataSource(dataSource.value)
  await updateLinkedDatastreams(undefined, props.payload)
  emit('delete')
  emit('close')
}
</script>
