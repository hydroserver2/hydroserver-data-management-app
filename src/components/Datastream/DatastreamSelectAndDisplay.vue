<template>
  <v-row>
    <v-col cols="12">
      <v-btn
        color="primary-darken-2"
        variant="outlined"
        rounded="lg"
        @click="showModal = true"
        prepend-icon="mdi-import"
        density="comfortable"
        >{{ buttonName }}</v-btn
      >
    </v-col>
    <v-col v-if="datastream.id">
      <DatastreamOverviewCard :datastream="datastream" />
    </v-col>
  </v-row>

  <v-dialog v-model="showModal" width="80rem">
    <DatastreamSelectorCard
      card-title="Select destination datastream"
      @selected-datastream-id="selectedId = $event"
      @close="showModal = false"
      :enforce-unique-selections="true"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { api } from '@/services/api'
import { Datastream } from '@/types'
import { ref, watch } from 'vue'
import DatastreamOverviewCard from './DatastreamOverviewCard.vue'
import DatastreamSelectorCard from './DatastreamSelectorCard.vue'

const showModal = ref(false)
const datastream = ref<Datastream>(new Datastream())

const props = defineProps({
  buttonName: { type: String, required: true },
  datastreamId: { type: String },
})
const emit = defineEmits(['updateSelectedId'])

const selectedId = ref(props.datastreamId ? props.datastreamId : '')
watch(
  selectedId,
  async () => {
    if (!selectedId.value) return
    try {
      const fetchedDS = await api.fetchDatastream(selectedId.value)
      if (!fetchedDS) return
      Object.assign(datastream.value, fetchedDS)
      emit('updateSelectedId', selectedId.value)
    } catch (error) {
      console.error('Error loading datastream', error)
    }
  },
  { immediate: true }
)
</script>
