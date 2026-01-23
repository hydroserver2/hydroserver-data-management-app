<template>
  <div class="datasets-table">
    <v-card class="datasets-table__card">
      <v-sheet class="datasets-table__toolbar" color="secondary">
        <v-defaults-provider :defaults="{ VBtn: { variant: 'text' } }">
          <div class="datasets-table__toolbar-inner">
            <div class="datasets-table__meta">
              <h5 class="text-h5 datasets-table__title">Datastreams</h5>
              <v-text-field
                class="datasets-table__search"
                clearable
                v-model="search"
                :prepend-inner-icon="mdiMagnify"
                label="Search"
                hide-details
                density="compact"
                variant="underlined"
              />
              <v-select
                class="datasets-table__columns"
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

            <div class="datasets-table__actions">
              <v-btn color="white" @click="clearSelected">
                Clear Selected
              </v-btn>

              <v-btn
                color="white"
                variant="outlined"
                @click="showOnlySelected = !showOnlySelected"
              >
                {{ showOnlySelected ? 'Show All' : 'Show Selected' }}
              </v-btn>

              <v-btn
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
        class="elevation-2 datasets-table__table datasets-table__table--mobile"
        color="green"
        density="compact"
        hover
      >
        <template v-slot:item="{ item }">
          <tr class="mobile-row">
            <td class="mobile-row__cell" :colspan="headers.length">
              <div class="mobile-row__header">
                <div class="mobile-row__title">
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
              <div class="mobile-row__line">
                <span class="mobile-row__label">Site</span>
                <span>{{ item.siteCodeName || '—' }}</span>
              </div>
              <div class="mobile-row__line">
                <span class="mobile-row__label">Observed property</span>
                <span>{{ item.observedPropertyName || '—' }}</span>
              </div>
              <div class="mobile-row__line">
                <span class="mobile-row__label">Processing level</span>
                <span>{{ item.qualityControlLevelDefinition || '—' }}</span>
              </div>
              <div class="mobile-row__line">
                <span class="mobile-row__label">Observations</span>
                <span>{{ item.valueCount ?? '—' }}</span>
              </div>
              <div class="mobile-row__line">
                <span class="mobile-row__label">Last updated</span>
                <span>{{ formatTime(item.phenomenonEndTime) }}</span>
              </div>
              <v-btn
                class="mobile-row__meta-btn"
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
        class="elevation-2 datasets-table__table"
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

<style scoped>
.datasets-table {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.datasets-table__card {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.datasets-table__toolbar {
  padding: 8px 12px;
}

.datasets-table__toolbar-inner {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}

.datasets-table__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.datasets-table__title {
  margin: 0;
  white-space: nowrap;
}

.datasets-table__search {
  flex: 1 1 240px;
  min-width: 200px;
  max-width: 360px;
}

.datasets-table__columns {
  min-width: 220px;
  max-width: 260px;
  margin-left: auto;
}

.datasets-table__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.datasets-table__table {
  flex: 1;
  min-height: 0;
  height: 100%;
}

.datasets-table__table--mobile :deep(.v-table__wrapper) {
  overflow-x: hidden;
}

.mobile-row__cell {
  padding: 12px 16px;
}

.mobile-row__header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.mobile-row__title {
  font-weight: 600;
  line-height: 1.3;
  padding-top: 4px;
}

.mobile-row__line {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 6px;
}

.mobile-row__label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(0, 0, 0, 0.54);
}

.mobile-row__meta-btn {
  margin-top: 12px;
  min-height: 36px;
  width: 100%;
  margin-bottom: 6px;
}

@media (max-width: 600px) {
  .datasets-table__card {
    min-height: 520px;
  }

  .datasets-table__table {
    min-height: 440px;
  }

  .datasets-table__toolbar {
    padding: 8px;
  }

  .datasets-table__meta {
    flex-direction: column;
    align-items: stretch;
  }

  .datasets-table__title {
    text-align: center;
    width: 100%;
  }

  .datasets-table__search {
    max-width: 100%;
    min-width: 0;
  }

  .datasets-table__columns {
    max-width: 100%;
    width: 100%;
  }

  .datasets-table__actions {
    width: 100%;
  }

  .datasets-table__actions :deep(.v-btn) {
    flex: 1 1 100%;
  }
}
</style>
