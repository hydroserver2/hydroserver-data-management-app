<template>
  <h5 class="text-h5">Datasets</h5>

  <v-row class="my-2" align="center">
    <v-col cols="12" sm="auto">
      <v-btn
        :color="showOnlySelected ? 'blue-grey-lighten-4' : 'primary'"
        block
        @click="showOnlySelected = false"
      >
        Show All
      </v-btn>
    </v-col>

    <v-col cols="12" sm="auto">
      <v-btn
        :color="!showOnlySelected ? 'blue-grey-lighten-4' : 'primary'"
        block
        @click="showOnlySelected = true"
      >
        Show Selected
      </v-btn>
    </v-col>

    <v-col cols="12" sm="auto">
      <v-btn color="blue-grey-lighten-4" block @click="clearSelected">
        Clear Selected
      </v-btn>
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
    </v-col>
  </v-row>

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

    <v-btn
      prepend-icon="mdi-download"
      @click="downloadSelectedDatastreamsCSVs(selectedDatastreams)"
      >Download Selected</v-btn
    >
  </v-toolbar>
  <v-data-table-virtual
    :headers="headers.filter((header) => header.visible)"
    :items="tableItems"
    :sort-by="sortBy"
    :search="search"
    height="400"
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
        :disabled="selectedDatastreams.length >= 5 && !isChecked(item)"
        class="d-flex align-self-center"
        density="compact"
        @change="() => updateSelectedDatastreams(item)"
      />
    </template>
  </v-data-table-virtual>

  <v-dialog v-model="openInfoCard" width="50rem" v-if="selectedDatastream">
    <DatastreamInformationCard
      :datastream="selectedDatastream"
      @close="openInfoCard = false"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { api } from '@/services/api'
import { useTSAStore } from '@/store/timeSeriesAnalyst'
import { Datastream, ProcessingLevel } from '@/types'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref } from 'vue'
import DatastreamInformationCard from './DatastreamInformationCard.vue'
import { downloadSelectedDatastreamsCSVs } from '@/utils/CSVDownloadUtils'

const {
  things,
  filteredDatastreams,
  selectedDatastreams,
  observedProperties,
  processingLevels,
} = storeToRefs(useTSAStore())

const emit = defineEmits(['copyState'])

const showOnlySelected = ref(false)
const openInfoCard = ref(false)
const selectedDatastream = ref<Datastream | null>(null)

const copyStateToClipboard = async () => {
  emit('copyState')
}

const onRowClick = (event: Event, item: any) => {
  // If the click came from a checkbox, do nothing.
  let targetElement = event.target as HTMLElement
  if (targetElement.id && targetElement.id.startsWith('checkbox-')) return

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
      selectedDatastreams.value.some((sds) => sds.id === ds.id)
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
    title: 'Quality Control Level',
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

const sortBy = [{ key: 'siteCodeName' }]
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
</script>
