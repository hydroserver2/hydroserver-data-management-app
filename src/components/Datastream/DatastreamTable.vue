<template>
  <h5 class="text-h5 my-6">Datastreams Available at this Site</h5>

  <v-row class="pb-4">
    <v-col cols="auto" v-if="thing?.ownsThing">
      <v-btn-secondary
        prependIcon="mdi-plus"
        variant="elevated"
        :to="{ name: 'DatastreamForm', params: { id: thingId } }"
        >Add New Datastream</v-btn-secondary
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

  <v-data-table
    class="elevation-3 my-4"
    :headers="headers"
    :items="visibleDatastreams"
    v-model:sort-by="sortBy"
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
      <v-progress-linear
        v-if="observations[item.id]?.loading"
        color="secondary"
        indeterminate
      />
      <div v-else>
        <div v-if="!isOwner && !item.isDataVisible">
          Data is private for this datastream
        </div>
        <div v-else-if="observations[item.id]?.dataArray?.length">
          <v-dialog v-model="item.chartOpen" width="80rem">
            <FocusContextPlot
              :thing-name="thing?.name || 'Site'"
              :datastream="item"
              @close="item.chartOpen = false"
            />
          </v-dialog>
          <Sparkline
            @click="item.chartOpen = true"
            :observations="observations[item.id]?.dataArray"
            :datastream="item"
          />
        </div>
        <div v-else>No data for this datastream</div>
      </div>
    </template>

    <template v-slot:item.last_observation="{ item }">
      <div
        v-if="
          observations[item.id]?.dataArray?.length &&
          (isOwner || item.isDataVisible)
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
        :key="actionKey"
        v-if="isOwner !== undefined"
        :datastream="item"
        :is-owner="isOwner"
        :thing-id="thingId"
        @openPlot="item.chartOpen = true"
        @deleted="onDeleteDatastream(item.id)"
        @linkUpdated="loadDatastreams"
      />
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import FocusContextPlot from '@/components/Datastream/FocusContextPlot.vue'
import DatastreamTableActions from '@/components/Datastream/DatastreamTableActions.vue'
import Sparkline from '@/components/Sparkline.vue'
import { computed, onMounted, ref } from 'vue'
import { useMetadata } from '@/composables/useMetadata'
import { useObservationStore } from '@/store/observations'
import { storeToRefs } from 'pinia'
import { useThingStore } from '@/store/thing'
import { api } from '@/services/api'
import { DataArray, Datastream } from '@/types'
import { subtractHours } from '@/utils/observationsUtils'

const props = defineProps({
  thingId: {
    type: String,
    required: true,
  },
  isOwner: {
    type: Boolean,
    required: true,
  },
})

const { fetchObservationsInRange } = useObservationStore()
const { observations } = storeToRefs(useObservationStore())

const { thing } = storeToRefs(useThingStore())
const datastreams = ref<Datastream[]>([])
const actionKey = ref(1)

const { sensors, units, observedProperties, processingLevels } = useMetadata(
  props.thingId
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
    .filter((d) => d.isVisible || props.isOwner)
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

const fetchObsLast72Hours = async (datastreams: Datastream[]) => {
  await Promise.all(
    datastreams.map(async (ds) => {
      const { phenomenonEndTime: endTime } = ds
      if (endTime) {
        const beginTime = subtractHours(endTime, 72)
        await fetchObservationsInRange(ds, beginTime, endTime).catch(
          (error) => {
            console.error('Failed to fetch observations:', error)
            return null
          }
        )
      }
    })
  )
}

onMounted(async () => {
  await loadDatastreams()
  await fetchObsLast72Hours(visibleDatastreams.value)
})
</script>
