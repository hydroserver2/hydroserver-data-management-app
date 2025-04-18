<template>
  <h5 class="text-h5 my-6">Datastreams available at this site</h5>

  <v-row class="pb-4">
    <v-col cols="auto" v-if="canCreateDatastreams">
      <v-btn-secondary prependIcon="mdi-plus" @click="openCreate = true"
        >Add new datastream</v-btn-secondary
      >
    </v-col>
    <v-col>
      <v-btn
        color="blue-grey-lighten-2"
        prependIcon="mdi-chart-line"
        variant="elevated"
        :to="{ name: 'VisualizeData', query: { sites: thing!.id } }"
        >View on Data Visualization Page</v-btn
      >
    </v-col>
  </v-row>

  <h6 class="text-h6" style="color: #b71c1c">
    {{ thing!.dataDisclaimer }}
  </h6>

  <v-data-table-virtual
    class="elevation-3 my-4"
    :headers="headers"
    :items="visibleDatastreams"
    :sort-by="sortBy"
    :style="{ 'max-height': `100vh` }"
    fixed-header
  >
    <template v-slot:item.info="{ item }">
      <v-col>
        <v-row style="font-size: 1.2em">
          <strong class="mr-2">Observed Property:</strong>
          <strong>{{ item.OPName }}</strong>
        </v-row>
        <v-row> <strong class="mr-2">Identifier:</strong> {{ item.id }} </v-row>
        <v-row>
          <strong class="mr-2">Processing Level:</strong>
          {{
            processingLevels.find((p) => p.id === item.processingLevelId)?.code
          }}
        </v-row>
        <v-row>
          <strong class="mr-2">Sampled Medium:</strong>
          {{ item.sampledMedium }}
        </v-row>
        <v-row>
          <strong class="mr-2">Sensor:</strong>
          {{ sensors.find((s) => s.id === item.sensorId)?.name }}
        </v-row>
      </v-col>
    </template>

    <template v-slot:item.observations="{ item }">
      <div v-if="!canViewDatastreams && !item.isVisible">
        Data is private for this datastream
      </div>
      <div v-else>
        <v-dialog v-model="item.chartOpen" width="80rem">
          <DatastreamPopupPlot
            :datastream="item"
            @close="item.chartOpen = false"
          />
        </v-dialog>
        <Sparkline :datastream="item" @open-chart="item.chartOpen = true" />
      </div>
    </template>

    <template v-slot:item.last_observation="{ item }">
      <div
        v-if="
          (canViewDatastreams || item.isVisible) &&
          observations[item.id]?.dataArray?.length
        "
      >
        <v-row>
          {{ getMostRecentObsTime(observations[item.id].dataArray) }}
        </v-row>
        <v-row>
          {{ getMostRecentObsVal(observations[item.id].dataArray) }}&nbsp;
          {{ units.find((u) => u.id === item.unitId)?.name }}
        </v-row>
      </div>
    </template>

    <template v-slot:item.actions="{ item }">
      <v-row>
        <v-tooltip bottom :openDelay="500" v-if="canEditDatastreams">
          <template v-slot:activator="{ props }">
            <v-icon
              :icon="
                item.isVisible ? 'mdi-file-eye-outline' : 'mdi-file-remove'
              "
              :color="item.isVisible ? 'grey' : 'grey-lighten-1'"
              small
              v-bind="props"
              @click="toggleDataVisibility(item)"
            />
          </template>
          <span v-if="item.isVisible"
            >Hide the data for this datastream from guests of your site while
            keeping the metadata public. Owners will still see it
          </span>
          <span v-else>Make the data for this datastream publicly visible</span>
        </v-tooltip>

        <v-tooltip bottom :openDelay="500" v-if="canEditDatastreams">
          <template v-slot:activator="{ props }">
            <v-icon
              :icon="item.isPrivate ? 'mdi-eye' : 'mdi-eye-off'"
              :color="item.isPrivate ? 'grey' : 'grey-lighten-1'"
              small
              v-bind="props"
              @click="toggleVisibility(item)"
            />
          </template>
          <span v-if="item.isPrivate"
            >Hide this datastream from guests of your site. Owners will still
            see it</span
          >
          <span v-else>Make this datastream publicly visible</span>
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
            <!-- <div v-if="canEditDatastreams"> -->
            <!-- <v-list-item
                prepend-icon="mdi-link-variant"
                title="Link Data Source"
                @click="openLinker = true"
              /> -->
            <v-list-item
              v-if="canEditDatastreams"
              prepend-icon="mdi-pencil"
              title="Edit Datastream Metadata"
              @click="openDialog(item, 'edit')"
            />
            <!-- </div> -->
            <div v-if="canDeleteDatastreams">
              <v-list-item
                prepend-icon="mdi-delete"
                title="Delete Datastream"
                @click="openDialog(item, 'delete')"
              />
            </div>
            <v-list-item
              prepend-icon="mdi-chart-line"
              title="Visualize Data"
              :to="{
                name: 'VisualizeData',
                query: { sites: item.thingId, datastreams: item.id },
              }"
            />
            <v-list-item
              prepend-icon="mdi-download"
              title="Download Data"
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
</template>

<script setup lang="ts">
import DatastreamPopupPlot from '@/components/Datastream/DatastreamPopupPlot.vue'
import DatastreamForm from '@/components/Datastream/DatastreamForm.vue'
import DatastreamDeleteCard from './DatastreamDeleteCard.vue'
import Sparkline from '@/components/Sparkline.vue'
import { computed, reactive, ref, toRef } from 'vue'
import { useMetadata } from '@/composables/useMetadata'
import { useObservationStore } from '@/store/observations'
import { storeToRefs } from 'pinia'
import { useThingStore } from '@/store/thing'
import { api } from '@/services/api'
import { DataArray, Datastream, Workspace } from '@/types'
import { useWorkspacePermissions } from '@/composables/useWorkspacePermissions'
import { useTableLogic } from '@/composables/useTableLogic'
import { downloadDatastreamCSV } from '@/utils/CSVDownloadUtils'
import { Snackbar } from '@/utils/notifications'

const props = defineProps({
  workspace: { type: Object as () => Workspace, required: true },
})

const { thing } = storeToRefs(useThingStore())
const actionKey = ref(1)
const openCreate = ref(false)
const workspaceRef = toRef(props, 'workspace')
const thingIdRef = computed(() => thing.value!.id)
const downloading = reactive<Record<string, boolean>>({})

const {
  canCreateDatastreams,
  canViewDatastreams,
  canEditDatastreams,
  canDeleteDatastreams,
} = useWorkspacePermissions(workspaceRef)

const { observations } = storeToRefs(useObservationStore())

const updateDatastream = async (updatedDatastream: Datastream) => {
  await fetchMetadata(props.workspace.id)
  onUpdate(updatedDatastream)
}

const onCreated = async () => {
  await fetchMetadata(props.workspace.id)
  await loadDatastreams()
}

// const openLinker = ref(false)
const { item, items, openEdit, openDelete, openDialog, onUpdate, onDelete } =
  useTableLogic(
    async (thingId: string) => await api.fetchDatastreamsForThing(thingId),
    api.deleteDatastream,
    Datastream,
    thingIdRef
  )

const { sensors, units, observedProperties, processingLevels, fetchMetadata } =
  useMetadata()

const visibleDatastreams = computed(() => {
  return items.value
    .filter((d) => d.isPrivate || canViewDatastreams)
    .map((d) => ({
      ...d,
      chartOpen: false,
      OPName: observedProperties.value.find(
        (op) => op.id === d.observedPropertyId
      )?.name,
    }))
})

const onDownload = async (datastreamId: string) => {
  if (downloading[datastreamId]) return
  downloading[datastreamId] = true

  try {
    await downloadDatastreamCSV(datastreamId)
  } catch (err: any) {
    console.error('Error downloading datastream CSV', err)
    Snackbar.error(err.message)
  } finally {
    downloading[datastreamId] = false
  }
}

const getMostRecentObsTime = (dataArray: DataArray) => {
  if (!dataArray.length) return undefined
  return formatDate(dataArray[dataArray.length - 1][0])
}

const getMostRecentObsVal = (dataArray: DataArray) => {
  if (!dataArray.length) return undefined
  return formatNumber(dataArray[dataArray.length - 1][1])
}

function formatDate(dateString: string) {
  return (
    new Date(dateString).toUTCString().split(' ').slice(1, 5).join(' ') + ' UTC'
  )
}

async function toggleDataVisibility(datastream: Datastream) {
  datastream.isVisible = !datastream.isVisible
  if (datastream.isVisible) datastream.isPrivate = true
  patchDatastream({
    id: datastream.id,
    isPrivate: datastream.isPrivate,
    isVisible: datastream.isVisible,
  })
}

async function toggleVisibility(datastream: Datastream) {
  datastream.isPrivate = !datastream.isPrivate
  if (!datastream.isPrivate) datastream.isVisible = false
  patchDatastream({
    id: datastream.id,
    isPrivate: datastream.isPrivate,
    isVisible: datastream.isVisible,
  })
}

const patchDatastream = async (patchBody: {}) => {
  try {
    await api.updateDatastream(patchBody as Datastream)
  } catch (error) {
    console.error('Error updating datastream', error)
  }
}

const formatNumber = (value: string | number): string => {
  if (typeof value === 'number') {
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
    return formatter.format(value)
  }

  return value?.toString()
}

const sortBy = [{ key: 'OPName' }]
const headers = [
  {
    title: 'DataStream Info',
    key: 'info',
    value: 'OPName',
    sortable: false,
  },
  {
    title: 'Observations (Last 72 Hours)',
    key: 'observations',
    sortable: false,
  },
  { title: 'Last Observation', key: 'last_observation', sortable: false },
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
