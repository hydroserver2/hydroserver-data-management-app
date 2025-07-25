<template>
  <v-row class="my-2" align="center">
    <v-col>
      <h5 class="text-h5">Datastreams</h5>
    </v-col>

    <v-col cols="12" sm="auto">
      <v-btn
        color="blue-lighten-3"
        prepend-icon="mdi-content-copy"
        block
        @click="copyStateToClipboard"
        >Copy State as URL</v-btn
      >
    </v-col>

    <v-col cols="12" sm="3" class="ml-auto">
      <v-select
        label="Show/Hide Columns"
        v-model="selectedHeaders"
        :items="selectableHeaders"
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
    </v-col>
  </v-row>

  <v-toolbar flat color="secondary">
    <v-text-field
      class="mx-2"
      clearable
      v-model="search"
      prepend-inner-icon="mdi-magnify"
      label="Search"
      hide-details
      density="compact"
    />

    <v-spacer />

    <v-btn @click="clearSelected"> Clear Selected </v-btn>

    <v-btn variant="outlined" @click="showOnlySelected = !showOnlySelected">
      {{ showOnlySelected ? 'Show All' : 'Show Selected' }}
    </v-btn>

    <v-btn
      :loading="downloading"
      prepend-icon="mdi-download"
      @click="downloadSelected(plottedDatastreams)"
      >Download Selected</v-btn
    >
  </v-toolbar>
  <v-data-table-virtual
    :headers="headers.filter((header) => header.visible)"
    :items="tableItems"
    :sort-by="sortBy"
    multi-sort
    :search="search"
    :style="{ 'max-height': `${tableHeight}vh` }"
    fixed-header
    class="elevation-2"
    color="green"
    density="compact"
    @click:row="onRowClick"
    hover
  >
    <template v-slot:item.plot="{ item }">
      <v-checkbox
        :model-value="isChecked(item)"
        :disabled="plottedDatastreams.length >= 5 && !isChecked(item)"
        class="d-flex align-self-center"
        density="compact"
        @change="() => updatePlottedDatastreams(item)"
      />
    </template>
    <template v-slot:item.phenomenonEndTime="{ item }">
      {{ formatTime(item.phenomenonEndTime) }}
    </template>
  </v-data-table-virtual>

  <v-dialog
    v-model="openInfoCard"
    width="50rem"
    v-if="selectedDatastream && selectedThing"
  >
    <DatastreamInformationCard
      :datastream="selectedDatastream"
      :thing="selectedThing"
      @close="openInfoCard = false"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { useDataVisStore } from '@/store/dataVisualization'
import { Datastream, Thing } from '@/types'
import { storeToRefs } from 'pinia'
import { computed, reactive, ref } from 'vue'
import DatastreamInformationCard from './DatastreamInformationCard.vue'
import { downloadPlottedDatastreamsCSVs } from '@/utils/CSVDownloadUtils'
import { formatTime } from '@/utils/time'

const {
  things,
  filteredDatastreams,
  plottedDatastreams,
  observedProperties,
  processingLevels,
  tableHeight,
} = storeToRefs(useDataVisStore())

const emit = defineEmits(['copyState'])

const showOnlySelected = ref(false)
const openInfoCard = ref(false)
const downloading = ref(false)
const selectedDatastream = ref<Datastream | null>(null)
const selectedThing = ref<Thing | null>(null)

const copyStateToClipboard = async () => {
  emit('copyState')
}

const downloadSelected = async (plottedDatastreams: Datastream[]) => {
  downloading.value = true
  try {
    await downloadPlottedDatastreamsCSVs(plottedDatastreams)
  } catch (error) {
    console.error('Error downloading selected datastreams', error)
  }
  downloading.value = false
}

const onRowClick = (event: Event, item: any) => {
  // If the click came from a checkbox, do nothing.
  let targetElement = event.target as HTMLElement
  if (targetElement.id && targetElement.id.startsWith('checkbox-')) return

  const foundThing = things.value.find((t) => t.id === item.item.thingId)
  if (foundThing) selectedThing.value = foundThing

  const selectedDatastreamId = item.item.id
  const foundDatastream = filteredDatastreams.value.find(
    (d) => d.id === selectedDatastreamId
  )
  if (foundDatastream) {
    selectedDatastream.value = foundDatastream
    openInfoCard.value = true
  } else selectedDatastream.value = null
}

const displayDatastreams = computed(() => {
  if (showOnlySelected.value) {
    return filteredDatastreams.value.filter((ds) =>
      plottedDatastreams.value.some((sds) => sds.id === ds.id)
    )
  } else {
    return filteredDatastreams.value
  }
})

const tableItems = computed(() => {
  return displayDatastreams.value.map((ds) => {
    const thing = things.value.find((t) => t.id === ds.thingId)
    const observedProperty = observedProperties.value.find(
      (p) => p.id === ds.observedPropertyId
    )
    const processingLevel = processingLevels.value.find(
      (p) => p.id === ds.processingLevelId
    )
    return {
      ...ds,
      siteCodeName: thing?.samplingFeatureCode,
      observedPropertyName: observedProperty?.name,
      qualityControlLevelDefinition: processingLevel?.definition,
    }
  })
})

function clearSelected() {
  showOnlySelected.value = false
  plottedDatastreams.value = []
}

const isChecked = (item: Datastream) => {
  return computed(() =>
    plottedDatastreams.value.some((sds) => sds.id === item.id)
  ).value
}

const search = ref()
const headers = reactive([
  { title: 'Plot', key: 'plot', visible: true },
  {
    title: 'Site Code',
    key: 'siteCodeName',
    visible: true,
  },
  {
    title: 'Observed Property',
    key: 'observedPropertyName',
    visible: true,
  },
  {
    title: 'Processing Level',
    key: 'qualityControlLevelDefinition',
    visible: true,
  },
  {
    title: 'Number Observations',
    key: 'valueCount',
    visible: true,
  },
  {
    title: 'Date Last Updated',
    key: 'phenomenonEndTime',
    visible: true,
  },
])

const selectableHeaders = computed(() => {
  return headers.filter((header) => header.key !== 'plot')
})

const sortBy = [
  { key: 'siteCodeName' },
  { key: 'observedPropertyName' },
  { key: 'qualityControlLevelDefinition' },
]
const selectedHeaders = computed({
  get: () =>
    headers.filter((header) => header.visible).map((header) => header.key),
  set: (keys) => {
    headers.forEach((header) => {
      header.visible = keys.includes(header.key)
    })
  },
})

function updatePlottedDatastreams(datastream: Datastream) {
  const index = plottedDatastreams.value.findIndex(
    (ds) => ds.id === datastream.id
  )
  if (index === -1) plottedDatastreams.value.push(datastream)
  else plottedDatastreams.value.splice(index, 1)
}
</script>
