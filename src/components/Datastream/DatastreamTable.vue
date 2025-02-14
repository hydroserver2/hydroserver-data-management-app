<template>
  <h5 class="text-h5 my-6">Datastreams available at this site</h5>

  <v-row class="pb-4">
    <v-col cols="auto" v-if="canCreateDatastreams">
      <v-btn-secondary
        prependIcon="mdi-plus"
        :to="{ name: 'DatastreamForm', params: { id: thingId } }"
        >Add new datastream</v-btn-secondary
      >
    </v-col>
    <v-col v-if="datastreams.length">
      <v-btn
        color="blue-grey-lighten-2"
        prependIcon="mdi-chart-line"
        variant="elevated"
        :to="{ name: 'VisualizeData', query: { sites: thingId } }"
        >View on Data Visualization Page</v-btn
      >
    </v-col>
  </v-row>

  <h6 class="text-h6" style="color: #b71c1c">
    {{ thing?.dataDisclaimer }}
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
      <div v-if="!canViewDatastreams && !item.isDataVisible">
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
          (canViewDatastreams || item.isDataVisible) &&
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
      <DatastreamTableActions
        v-if="canEditDatastreams"
        :key="actionKey"
        :datastream="item"
        :thing-id="thingId"
        @deleted="onDeleteDatastream(item.id)"
        @linkUpdated="loadDatastreams"
      />
    </template>
  </v-data-table-virtual>
</template>

<script setup lang="ts">
import DatastreamPopupPlot from '@/components/Datastream/DatastreamPopupPlot.vue'
import DatastreamTableActions from '@/components/Datastream/DatastreamTableActions.vue'
import Sparkline from '@/components/Sparkline.vue'
import { computed, onMounted, ref } from 'vue'
import { useMetadata } from '@/composables/useMetadata'
import { useObservationStore } from '@/store/observations'
import { storeToRefs } from 'pinia'
import { useThingStore } from '@/store/thing'
import { api } from '@/services/api'
import { DataArray, Datastream } from '@/types'
import { useWorkspaceStore } from '@/store/workspaces'
import { useWorkspacePermissions } from '@/composables/useWorkspacePermissions'

const props = defineProps({
  thingId: {
    type: String,
    required: true,
  },
})

const { canEditDatastreams, canViewDatastreams, canCreateDatastreams } =
  useWorkspacePermissions()

const { observations } = storeToRefs(useObservationStore())
const { selectedWorkspace } = storeToRefs(useWorkspaceStore())

const { thing } = storeToRefs(useThingStore())
const datastreams = ref<Datastream[]>([])
const actionKey = ref(1)

const { sensors, units, observedProperties, processingLevels } = useMetadata(
  selectedWorkspace.value!.id
)

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

const visibleDatastreams = computed(() => {
  return datastreams.value
    .filter((d) => d.isVisible || canViewDatastreams)
    .map((d) => ({
      ...d,
      chartOpen: false,
      OPName: observedProperties.value.find(
        (op) => op.id === d.observedPropertyId
      )?.name,
    }))
})

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

function onDeleteDatastream(id: string) {
  datastreams.value = datastreams.value.filter((ds) => ds.id !== id)
}

const loadDatastreams = async () => {
  try {
    datastreams.value = await api.fetchDatastreamsForThing(props.thingId)
    actionKey.value += 1
  } catch (e) {
    console.error('Error fetching datastreams', e)
  }
}

onMounted(async () => {
  await loadDatastreams()
})
</script>
