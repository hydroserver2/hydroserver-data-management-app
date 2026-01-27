<template>
  <div class="flex h-full min-h-0 flex-col">
    <v-card
      class="flex min-h-0 flex-1 flex-col elevation-2 max-[600px]:min-h-[520px]"
    >
      <v-sheet class="px-3 py-2 max-[600px]:px-2" color="secondary">
        <v-defaults-provider :defaults="{ VBtn: { variant: 'text' } }">
          <div class="flex flex-col items-stretch gap-3">
            <div
              class="flex flex-wrap items-center gap-3 max-[600px]:flex-col max-[600px]:items-stretch"
            >
              <h5
                class="m-0 px-1 whitespace-nowrap text-h5 max-[600px]:w-full max-[600px]:text-center"
              >
                Datastreams
              </h5>
              <v-text-field
                class="flex-1 basis-[240px] min-w-[200px] max-w-[360px] max-[600px]:min-w-0 max-[600px]:max-w-none"
                clearable
                v-model="search"
                :prepend-inner-icon="mdiMagnify"
                label="Search"
                hide-details
                density="compact"
                variant="underlined"
              />
              <v-select
                class="ml-auto pl-1 min-w-[220px] max-w-[260px] max-[600px]:ml-0 max-[600px]:w-full max-[600px]:max-w-none"
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
            </div>

            <div
              class="flex flex-wrap justify-end gap-2 max-[600px]:w-full max-[600px]:flex-col"
            >
              <v-btn
                class="max-[600px]:w-full"
                color="white"
                @click="clearSelected"
              >
                Clear Selected
              </v-btn>

              <v-btn
                class="max-[600px]:w-full"
                color="white"
                variant="outlined"
                @click="showOnlySelected = !showOnlySelected"
              >
                {{ showOnlySelected ? 'Show All' : 'Show Selected' }}
              </v-btn>

              <v-btn
                class="max-[600px]:w-full pr-0"
                color="white"
                :loading="downloading"
                :prepend-icon="mdiDownload"
                @click="downloadSelected(plottedDatastreams)"
                >Download Selected</v-btn
              >
            </div>
          </div>
        </v-defaults-provider>
      </v-sheet>
      <v-data-table-virtual
        v-if="isMobile"
        :headers="headers.filter((header) => header.visible)"
        :items="tableItems"
        :search="search"
        fixed-header
        hide-default-header
        class="h-full min-h-0 flex-1 elevation-2 max-[600px]:min-h-[440px] [&_.v-table__wrapper]:overflow-x-hidden"
        color="green"
        density="compact"
        hover
      >
        <template v-slot:item="{ item }">
          <tr class="align-top">
            <td class="px-4 py-3" :colspan="headers.length">
              <div class="flex flex-col items-start gap-1.5">
                <div class="pt-1 text-base font-semibold leading-snug">
                  {{ item.name }}
                </div>
                <v-checkbox
                  :model-value="isChecked(item)"
                  :disabled="plottedDatastreams.length >= 5 && !isChecked(item)"
                  density="compact"
                  label="Plot"
                  hide-details
                  @click.stop
                  @change="() => updatePlottedDatastreams(item)"
                />
              </div>
              <div class="flex flex-col gap-0.5 pt-1.5">
                <span class="text-xs uppercase tracking-[0.04em] text-black/55"
                  >Site</span
                >
                <span>{{ item.siteCodeName || '—' }}</span>
              </div>
              <div class="flex flex-col gap-0.5 pt-1.5">
                <span class="text-xs uppercase tracking-[0.04em] text-black/55"
                  >Observed property</span
                >
                <span>{{ item.observedPropertyName || '—' }}</span>
              </div>
              <div class="flex flex-col gap-0.5 pt-1.5">
                <span class="text-xs uppercase tracking-[0.04em] text-black/55"
                  >Processing level</span
                >
                <span>{{ item.qualityControlLevelDefinition || '—' }}</span>
              </div>
              <div class="flex flex-col gap-0.5 pt-1.5">
                <span class="text-xs uppercase tracking-[0.04em] text-black/55"
                  >Observations</span
                >
                <span>{{ item.valueCount ?? '—' }}</span>
              </div>
              <div class="flex flex-col gap-0.5 pt-1.5">
                <span class="text-xs uppercase tracking-[0.04em] text-black/55"
                  >Last updated</span
                >
                <span>{{ formatTime(item.phenomenonEndTime) }}</span>
              </div>
              <v-btn
                class="mt-3 mb-1 min-h-[36px] w-full"
                variant="outlined"
                color="primary"
                @click="openMetadata(item)"
              >
                Show Full Metadata
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table-virtual>
      <v-data-table-virtual
        v-else
        :headers="headers.filter((header) => header.visible)"
        :items="tableItems"
        :sort-by="sortBy"
        multi-sort
        :search="search"
        fixed-header
        class="h-full min-h-0 flex-1 elevation-2 max-[600px]:min-h-[440px]"
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
    </v-card>

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
  </div>
</template>

<script setup lang="ts">
import { useDataVisStore } from '@/store/dataVisualization'
import hs, { Datastream, Thing } from '@hydroserver/client'
import { storeToRefs } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { useDisplay } from 'vuetify'
import DatastreamInformationCard from './DatastreamInformationCard.vue'
import { formatTime } from '@/utils/time'
import { mdiDownload, mdiMagnify } from '@mdi/js'

const {
  things,
  filteredDatastreams,
  plottedDatastreams,
  observedProperties,
  processingLevels,
} = storeToRefs(useDataVisStore())

const showOnlySelected = ref(false)
const openInfoCard = ref(false)
const downloading = ref(false)
const selectedDatastream = ref<Datastream | null>(null)
const selectedThing = ref<Thing | null>(null)
const { smAndDown } = useDisplay()
const isMobile = computed(() => smAndDown.value)

const downloadSelected = async (plottedDatastreams: Datastream[]) => {
  downloading.value = true
  try {
    await hs.datastreams.downloadCsvBatchZip(plottedDatastreams)
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

const openMetadata = (item: Datastream) => {
  const foundThing = things.value.find((t) => t.id === item.thingId)
  if (foundThing) selectedThing.value = foundThing

  const foundDatastream = filteredDatastreams.value.find(
    (d) => d.id === item.id
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
