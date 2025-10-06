<template>
  <h5 class="text-h5 my-6">Datastreams available at this site</h5>

  <h6 class="text-h6" style="color: #b71c1c">
    {{ thing!.dataDisclaimer }}
  </h6>

  <v-card>
    <v-toolbar color="secondary">
      <v-text-field
        class="mx-4"
        clearable
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Search"
        hide-details
        density="compact"
        variant="underlined"
        rounded="xl"
        maxWidth="300"
      />
      <v-spacer />
      <v-btn
        color="white"
        variant="outlined"
        prependIcon="mdi-chart-line"
        class="mr-2"
        :to="{ name: 'VisualizeData', query: { sites: thing!.id } }"
        >View on Data Visualization Page</v-btn
      >
      <v-btn-add
        v-if="canCreateDatastreams"
        color="white"
        prependIcon="mdi-plus"
        @click="openCreate = true"
        class="mr-2"
        >Add new datastream</v-btn-add
      >
    </v-toolbar>

    <v-data-table-virtual
      :headers="headers"
      :items="visibleDatastreams"
      :search="search"
      :sort-by="sortBy"
      :style="{ 'max-height': `100vh` }"
      fixed-header
      @click:row="onRowClick"
      hover
    >
      <template
        v-slot:item.info="{ item, internalItem, isExpanded, toggleExpand }"
      >
        <p style="font-size: 1.2em" class="mt-2">
          <strong class="mr-2">Observed property:</strong>
          <strong>{{ item.OPName }}</strong>
        </p>
        <p><strong class="mr-2">Identifier:</strong> {{ item.id }}</p>
        <p>
          <strong class="mr-2">Processing level:</strong>
          {{ item.processingLevelName }}
        </p>
        <!-- <template v-if="isExpanded(internalItem)"> -->
        <p>
          <strong class="mr-2">Sampled medium:</strong>
          {{ item.sampledMedium }}
        </p>
        <p>
          <strong class="mr-2">Sensor:</strong>
          {{ sensors.find((s) => s.id === item.sensorId)?.name }}
        </p>
        <p>
          <strong class="mr-2">No data value:</strong> {{ item.noDataValue }}
        </p>
        <p class="mb-2">
          <strong class="mr-2">Aggregation statistic:</strong>
          {{ item.aggregationStatistic }}
        </p>
      </template>

      <template v-slot:item.time="{ item }">
        <p class="mt-2">
          <strong class="mr-2">Begin date:</strong>
          {{ item.beginDate }}
        </p>
        <p>
          <strong class="mr-2">End date:</strong>
          {{ item.endDate }}
        </p>
        <p>
          <strong class="mr-2">Time aggregation interval:</strong>
          {{ item.aggregationInterval }}
        </p>
        <p>
          <strong class="mr-2">Intended time spacing:</strong>
          {{ item.spacingInterval }}
        </p>
        <p>
          <strong class="mr-2">Status:</strong>
          {{ item.status }}
        </p>
        <p>
          <strong class="mr-2">Value count:</strong>
          {{ item.valueCount }}
        </p>
      </template>

      <template v-slot:item.observations="{ item }">
        <div v-if="!canViewDatastreams && !item.isVisible" class="mt-2">
          Data is private for this datastream
        </div>
        <Sparkline
          v-else
          class="mt-2"
          :datastream="item"
          @openChart="openCharts[item.id] = true"
          :unitName="item.unitName"
        />

        <v-dialog v-model="openCharts[item.id]" width="80rem">
          <DatastreamPopupPlot
            :datastream="item"
            @close="openCharts[item.id] = false"
          />
        </v-dialog>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-row align="center" style="height: 90%" class="mt-2">
          <v-tooltip
            bottom
            :openDelay="500"
            content-class="pa-0 ma-0 bg-transparent"
            v-if="canEditDatastreams"
          >
            <template #activator="{ props: tp }">
              <v-icon
                v-bind="tp"
                :icon="
                  item.isVisible ? 'mdi-file-eye-outline' : 'mdi-file-remove'
                "
                :color="item.isVisible ? 'green' : 'deep-orange-darken-4'"
                small
                @click="toggleDataVisibility(item)"
              />
            </template>

            <VisibilityTooltipCard
              title="Observations are currently"
              :items="[
                {
                  label: 'Clicking this will',
                  value: item.isVisible
                    ? 'Hide data for this datastream from guests of your site while keeping the datastream metadata publicly visible.'
                    : 'Make the observations and metadata for this datastream visible to guests of your site.',
                },
              ]"
              :is-visible="item.isVisible"
            />
          </v-tooltip>

          <v-tooltip
            bottom
            :openDelay="500"
            v-if="canEditDatastreams"
            content-class="pa-0 ma-0 bg-transparent"
          >
            <template v-slot:activator="{ props }">
              <v-icon
                :icon="item.isPrivate ? 'mdi-eye-off' : 'mdi-eye'"
                :color="item.isPrivate ? 'deep-orange-darken-4' : 'green'"
                small
                v-bind="props"
                @click="toggleVisibility(item)"
              />
            </template>

            <VisibilityTooltipCard
              title="Datastream is currently"
              :items="[
                {
                  label: 'Clicking this will',
                  value: item.isPrivate
                    ? 'Make this datastream and all its metadata and observations publicly visible.'
                    : 'Hide this datastream from guests of your site along with all its metadata and observations.',
                },
              ]"
              :is-visible="!item.isPrivate"
            />
          </v-tooltip>

          <v-tooltip
            v-if="!canViewDatastreams && !item.isVisible"
            bottom
            :openDelay="100"
          >
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" icon="mdi-lock" />
            </template>
            <span>The data for this datastream is private </span>
          </v-tooltip>

          <v-menu v-else>
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" icon="mdi-dots-vertical" />
            </template>
            <v-list>
              <v-list-item
                v-if="canEditDatastreams"
                prepend-icon="mdi-pencil"
                title="Edit datastream metadata"
                @click="openDialog(item, 'edit')"
              />
              <div v-if="canDeleteDatastreams">
                <v-list-item
                  prepend-icon="mdi-delete"
                  title="Delete datastream"
                  @click="openDialog(item, 'delete')"
                />
              </div>
              <v-list-item
                v-if="canDeleteObservations"
                prepend-icon="mdi-delete-outline"
                title="Delete data from datastream"
                @click="openObservationDialog(item)"
              />
              <v-list-item
                prepend-icon="mdi-chart-line"
                title="Visualize data"
                :to="{
                  name: 'VisualizeData',
                  query: { sites: item.thingId, datastreams: item.id },
                }"
              />
              <v-list-item
                prepend-icon="mdi-download"
                title="Download data"
                @click="onDownload(item.id)"
              />
            </v-list>
          </v-menu>
        </v-row>
        <v-row v-if="downloading[item.id]">
          <v-col class="px-0">
            <v-progress-circular
              indeterminate
              size="16"
              width="2"
              color="primary"
            />
            preparing file...
          </v-col>
        </v-row>
      </template>
    </v-data-table-virtual>
  </v-card>

  <v-dialog v-model="openCreate" width="80rem">
    <DatastreamForm
      :thing="thing!"
      :workspace="workspace"
      @close="openCreate = false"
      @created="onCreated"
    />
  </v-dialog>

  <v-dialog v-model="openEdit" width="80rem">
    <DatastreamForm
      :thing="thing!"
      :workspace="workspace"
      :datastream="item"
      @close="openEdit = false"
      @updated="updateDatastream"
    />
  </v-dialog>

  <v-dialog v-model="openDelete" width="40rem">
    <DatastreamDeleteCard
      :datastream="item"
      @close="openDelete = false"
      @delete="onDelete"
    />
  </v-dialog>

  <v-dialog v-model="openObservationsDelete" width="40rem">
    <ObservationsDeleteCard
      :datastream="item"
      @close="openObservationsDelete = false"
      @delete="onObservationsDelete"
    />
  </v-dialog>

  <v-dialog
    v-model="openInfoCard"
    width="50rem"
    v-if="selectedDatastream && thing"
  >
    <DatastreamTableInfoCard
      :datastream="selectedDatastream"
      :thing="thing"
      @close="openInfoCard = false"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import DatastreamPopupPlot from '@/components/Datastream/DatastreamPopupPlot.vue'
import DatastreamForm from '@/components/Datastream/DatastreamForm.vue'
import DatastreamDeleteCard from './DatastreamDeleteCard.vue'
import Sparkline from '@/components/Sparkline.vue'
import { computed, reactive, ref, toRef } from 'vue'
import { useMetadata } from '@/composables/useMetadata'
import { storeToRefs } from 'pinia'
import { useThingStore } from '@/store/thing'
import { Datastream, Workspace } from '@/types'
import { useWorkspacePermissions } from '@/composables/useWorkspacePermissions'
import { useTableLogic } from '@/composables/useTableLogic'
import { Snackbar } from '@/utils/notifications'
import { formatTime, getLocalTimeZone } from '@/utils/time'
import DatastreamTableInfoCard from './DatastreamTableInfoCard.vue'
import ObservationsDeleteCard from '../Observation/ObservationsDeleteCard.vue'
import VisibilityTooltipCard from '@/components/Datastream/VisibilityTooltipCard.vue'
import hs from '@hydroserver/client'

const props = defineProps({
  workspace: { type: Object as () => Workspace, required: true },
})

const { thing } = storeToRefs(useThingStore())
const actionKey = ref(1)
const openCreate = ref(false)
const workspaceRef = toRef(props, 'workspace')
const thingIdRef = computed(() => thing.value!.id)
const downloading = reactive<Record<string, boolean>>({})
const search = ref()

const openObservationsDelete = ref(false)
function openObservationDialog(selectedItem: any) {
  item.value = selectedItem
  openObservationsDelete.value = true
}

const openInfoCard = ref(false)
const selectedDatastream = ref<Datastream | null>(null)

const {
  canCreateDatastreams,
  canViewDatastreams,
  canEditDatastreams,
  canDeleteDatastreams,
  canDeleteObservations,
} = useWorkspacePermissions(workspaceRef)

const updateDatastream = async (updatedDatastream: Datastream) => {
  await fetchMetadata(props.workspace.id)
  onUpdate(updatedDatastream)
}

const onCreated = async () => {
  await fetchMetadata(props.workspace.id)
  await loadDatastreams()
}

const { item, items, openEdit, openDelete, openDialog, onUpdate, onDelete } =
  useTableLogic(
    async (thingId: string) =>
      await hs.datastreams.listAllItems({ thing: thingId }),
    hs.datastreams.delete,
    Datastream,
    thingIdRef
  )

const hey = hs.datastreams.list()

const { sensors, units, observedProperties, processingLevels, fetchMetadata } =
  useMetadata(toRef(props, 'workspace'))

const openCharts = reactive<Record<string, boolean>>({})

const visibleDatastreams = computed(() => {
  return items.value
    .filter((d) => !d.isPrivate || canViewDatastreams.value)
    .map((d) => {
      const unit = units.value.find((u) => u.id === d.unitId)
      const sensor = sensors.value.find((s) => s.id === d.sensorId)
      const op = observedProperties.value.find(
        (o) => o.id === d.observedPropertyId
      )
      const pl = processingLevels.value.find(
        (p) => p.id === d.processingLevelId
      )

      const mapped = {
        ...d,
        OPName: op ? `${op.name} (${op.code})` : '',
        processingLevelCode: pl?.code ?? '',
        processingLevelName: pl?.definition ?? '',
        sensorName: sensor?.name ?? '',
        unitName: unit?.name ?? '',
        searchText: ',',
        beginDate: formatTime(d.phenomenonBeginTime),
        endDate: formatTime(d.phenomenonEndTime),
        aggregationInterval: `${d.timeAggregationInterval} ${d.timeAggregationIntervalUnit}`,
        spacingInterval: `${d.intendedTimeSpacing} ${d.intendedTimeSpacingUnit}`,
      }

      mapped.searchText = [
        mapped.OPName,
        mapped.id,
        mapped.processingLevelName,
        mapped.sampledMedium,
        mapped.sensorName,
        mapped.noDataValue,
        mapped.aggregationStatistic,
        mapped.unitName,
        mapped.status,
        mapped.valueCount,
        mapped.beginDate,
        mapped.endDate,
        mapped.aggregationInterval,
        mapped.spacingInterval,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return mapped
    })
})

const onDownload = async (datastreamId: string) => {
  if (downloading[datastreamId]) return
  downloading[datastreamId] = true

  try {
    await hs.datastreams.downloadCsv(datastreamId)
  } catch (err: any) {
    console.error('Error downloading datastream CSV', err)
    Snackbar.error(err.message)
  } finally {
    downloading[datastreamId] = false
  }
}

async function toggleDataVisibility(computedDatastream: Datastream) {
  // mutate the original
  const datastream = items.value.find((d) => d.id === computedDatastream.id)
  if (!datastream) return

  datastream.isVisible = !datastream.isVisible
  if (datastream.isVisible) datastream.isPrivate = false
  patchDatastream({
    id: datastream.id,
    isPrivate: datastream.isPrivate,
    isVisible: datastream.isVisible,
  })
}

async function toggleVisibility(computedDatastream: Datastream) {
  // mutate the original
  const datastream = items.value.find((d) => d.id === computedDatastream.id)
  if (!datastream) return

  datastream.isPrivate = !datastream.isPrivate
  if (datastream.isPrivate) datastream.isVisible = false
  patchDatastream({
    id: datastream.id,
    isPrivate: datastream.isPrivate,
    isVisible: datastream.isVisible,
  })
}

const onRowClick = (event: Event, item: any) => {
  let targetElement = event.target as HTMLElement
  if (targetElement.tagName == 'CANVAS') return
  if (targetElement.closest('.v-icon')) return

  const selectedDatastreamId = item.item.id
  const foundDatastream = visibleDatastreams.value.find(
    (d) => d.id === selectedDatastreamId
  )
  if (foundDatastream) {
    selectedDatastream.value = foundDatastream
    openInfoCard.value = true
  } else selectedDatastream.value = null
}

const patchDatastream = async (patchBody: {}) => {
  try {
    await api.updateDatastream(patchBody as Datastream)
  } catch (error) {
    console.error('Error updating datastream', error)
  }
}

async function onObservationsDelete() {
  try {
    await api.deleteObservationsForDatastream(item.value.id)
    items.value = []
    await loadDatastreams()
  } catch (error) {
    console.error('Failed to delete observations', error)
    Snackbar.error('Failed to delete observations')
  }
  openObservationsDelete.value = false
}

const sortBy = [{ key: 'OPName' }]
const headers = [
  {
    title: 'Datastream information',
    key: 'info',
    value: 'searchText',
    sortable: false,
  },
  {
    title: `Time information (${getLocalTimeZone()})`,
    key: 'time',

    sortable: false,
  },
  {
    title: 'Observation information',
    key: 'observations',
    sortable: false,
  },
  { title: 'Actions', key: 'actions', sortable: false },
]

const loadDatastreams = async () => {
  try {
    items.value = await api.fetchDatastreamsForThing(thing.value!.id)
    actionKey.value += 1
  } catch (e) {
    console.error('Error fetching datastreams', e)
  }
}
</script>

<style scoped>
::v-deep tbody .v-data-table__td {
  vertical-align: top;
}
</style>
