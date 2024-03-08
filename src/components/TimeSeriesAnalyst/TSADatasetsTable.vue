<template>
  <h5 class="text-h5">Datasets</h5>

  <div class="d-flex align-center my-4">
    <v-btn
      :color="showOnlySelected ? 'blue-grey-lighten-4' : 'primary'"
      @click="showOnlySelected = false"
    >
      Show All
    </v-btn>
    <v-btn
      :color="!showOnlySelected ? 'blue-grey-lighten-4' : 'primary'"
      class="mx-2"
      @click="showOnlySelected = true"
    >
      Show Selected
    </v-btn>
    <v-btn color="blue-grey-lighten-4" @click="clearSelected"
      >Clear Selected</v-btn
    >

    <v-spacer />

    <v-select
      label="Show/Hide Columns"
      v-model="selectedHeaders"
      :items="headers"
      item-text="title"
      item-value="key"
      multiple
      item-color="green"
      density="compact"
      variant="solo"
      hide-details
    >
      <template v-slot:selection="{ item, index }">
        <!-- Leave blank so nothing appears in the v-select box -->
      </template>
    </v-select>
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
    :headers="headers.filter((header) => header.visible)"
    :items="displayDatastreams"
    class="elevation-2"
    color="green"
  >
    <template v-slot:item.plot="{ item }">
      <v-checkbox
        :model-value="isChecked(item)"
        :disabled="selectedDatastreams.length >= 5 && !isChecked(item)"
        class="d-flex align-self-center"
        @change="() => updateSelectedDatastreams(item)"
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
import { useTSAStore } from '@/store/timeSeriesAnalyst'
import { Datastream, ObservedProperty, ProcessingLevel } from '@/types'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref } from 'vue'

const { things, filteredDatastreams, selectedDatastreams } = storeToRefs(
  useTSAStore()
)

const observedProperties = ref<ObservedProperty[]>([])
const processingLevels = ref<ProcessingLevel[]>([])
const showOnlySelected = ref(false)

const displayDatastreams = computed(() => {
  if (showOnlySelected.value) {
    return filteredDatastreams.value.filter((ds) =>
      selectedDatastreams.value.some((sds) => sds.id === ds.id)
    )
  } else {
    return filteredDatastreams.value
  }
})

function clearSelected() {
  showOnlySelected.value = false
  selectedDatastreams.value = []
}

const isChecked = (item: Datastream) => {
  return computed(() =>
    selectedDatastreams.value.some((sds) => sds.id === item.id)
  ).value
}

const search = ref()
const headers = reactive([
  { title: 'Plot', key: 'plot', visible: true },
  { title: 'Site Code', key: 'siteCode', visible: true },
  { title: 'Observed Property', key: 'observedProperty', visible: true },
  { title: 'Quality Control Level', key: 'qualityControlLevel', visible: true },
  {
    title: 'Number Observations',
    key: 'numberObservations',
    value: 'valueCount',
    visible: true,
  },
  {
    title: 'Date Last Updated',
    key: 'dateLastUpdated',
    value: 'phenomenonEndTime',
    visible: true,
  },
])

const selectedHeaders = computed({
  get: () =>
    headers.filter((header) => header.visible).map((header) => header.key),
  set: (keys) => {
    headers.forEach((header) => {
      header.visible = keys.includes(header.key)
    })
  },
})

function updateSelectedDatastreams(datastream: Datastream) {
  const index = selectedDatastreams.value.findIndex(
    (ds) => ds.id === datastream.id
  )
  if (index === -1) selectedDatastreams.value.push(datastream)
  else selectedDatastreams.value.splice(index, 1)
}

onMounted(async () => {
  observedProperties.value = await api.fetchOwnedObservedProperties()
  processingLevels.value = await api.fetchProcessingLevels()
})
</script>
