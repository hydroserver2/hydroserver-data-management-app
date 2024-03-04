<template>
  <h5 class="text-h5">Datasets</h5>

  <div class="d-flex align-center my-4">
    <v-btn color="blue-grey-lighten-4">Show All</v-btn>
    <v-btn color="blue-grey-lighten-4" class="mx-2">Show Selected</v-btn>
    <v-btn color="blue-grey-lighten-4">Clear Selected</v-btn>

    <v-spacer />

    <v-btn color="blue-grey-lighten-4">Show/Hide Columns</v-btn>
  </div>

  <v-toolbar flat color="secondary">
    <v-text-field
      class="mx-2"
      v-model="search"
      prepend-inner-icon="mdi-magnify"
      label="Search"
      hide-details
      density="compact"
    />

    <v-spacer />

    <v-btn prepend-icon="mdi-download">Download Selected</v-btn>
  </v-toolbar>
  <v-data-table
    :headers="headers"
    :items="datastreams"
    class="elevation-2"
    color="green"
  >
    <template v-slot:item.plot="{ item }">
      <v-checkbox
        class="d-flex align-self-center"
        @change="() => updateSelectedDatastreamIds(item.id)"
      />
    </template>
    <template v-slot:item.siteCode="{ item }">
      {{ things.find((t) => t.id === item.thingId)?.name }}
    </template>
    <template v-slot:item.observedProperty="{ item }">
      {{
        observedProperties.find((p) => p.id === item.observedPropertyId)?.code
      }}
    </template>
    <template v-slot:item.qualityControlLevel="{ item }">
      {{
        processingLevels.find((p) => p.id === item.processingLevelId)
          ?.definition
      }}
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { api } from '@/services/api'
import { Datastream, ObservedProperty, ProcessingLevel, Thing } from '@/types'
import { PropType, onMounted, ref, watch } from 'vue'

const props = defineProps({
  datastreams: {
    type: Array as PropType<Datastream[]>,
    required: true,
  },
  things: {
    type: Array as PropType<Thing[]>,
    required: true,
  },
})
const emit = defineEmits(['update:selectedDatastreamIds'])

const selectedDatastreamIds = ref<string[]>([])

const observedProperties = ref<ObservedProperty[]>([])
const processingLevels = ref<ProcessingLevel[]>([])

const search = ref()
const headers = [
  { title: 'Plot', key: 'plot' },
  { title: 'Site Code', key: 'siteCode' },
  { title: 'Observed Property', key: 'observedProperty' },
  { title: 'Quality Control Level', key: 'qualityControlLevel' },
  {
    title: 'Number Observations',
    key: 'numberObservations',
    value: 'valueCount',
  },
  {
    title: 'Date Last Updated',
    key: 'dateLastUpdated',
    value: 'phenomenonEndTime',
  },
] as const

// If the parent component filters out some currently selected datastreams, deselect them and emit
watch(
  () => props.datastreams,
  (newDatastreams) => {
    selectedDatastreamIds.value = selectedDatastreamIds.value.filter((id) =>
      newDatastreams.some((datastream) => datastream.id === id)
    )
    emit('update:selectedDatastreamIds', selectedDatastreamIds.value)
  },
  { deep: true }
)

function updateSelectedDatastreamIds(id: string) {
  const i = selectedDatastreamIds.value.indexOf(id)
  if (i === -1) selectedDatastreamIds.value.push(id)
  else selectedDatastreamIds.value.splice(i, 1)
  emit('update:selectedDatastreamIds', selectedDatastreamIds.value)
}

onMounted(async () => {
  observedProperties.value = await api.fetchOwnedObservedProperties()
  processingLevels.value = await api.fetchProcessingLevels()
})
</script>
