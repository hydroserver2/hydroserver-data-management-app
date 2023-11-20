<template>
  <v-data-table
    class="elevation-3"
    :headers="headers"
    :items="visibleDatastreams"
    v-model:sort-by="sortBy"
  >
    <template v-slot:item.info="{ item }">
      <v-col>
        <v-row style="font-size: 1.2em">
          <strong class="mr-2">Observed Property:</strong>
          <strong>{{ item.raw.OPName }}</strong>
        </v-row>
        <v-row>
          <strong class="mr-2">Identifier:</strong> {{ item.raw.id }}
        </v-row>
        <v-row>
          <strong class="mr-2">Processing Level:</strong>
          {{
            processingLevels.find((p) => p.id === item.raw.processingLevelId)
              ?.code
          }}
        </v-row>
        <v-row>
          <strong class="mr-2">Sampled Medium:</strong>
          {{ item.raw.sampledMedium }}
        </v-row>
        <v-row>
          <strong class="mr-2">Sensor:</strong>
          {{ sensors.find((s) => s.id === item.raw.sensorId)?.name }}
        </v-row>
      </v-col>
    </template>

    <template v-slot:item.observations="{ item }">
      <div v-if="loaded[item.raw.id]">
        <div v-if="observations[item.raw.id]">
          <v-dialog v-model="item.raw.chartOpen" width="80rem">
            <FocusContextPlot
              :thing-id="thingId"
              :datastream-id="item.raw.id"
              @close="item.raw.chartOpen = false"
            />
          </v-dialog>
          <Sparkline
            @click="item.raw.chartOpen = true"
            class="pt-2"
            :is-stale="isStale(item.raw.phenomenonEndTime)"
            :observations="observations[item.raw.id]"
          />
        </div>
        <div v-else>No data for this datastream</div>
      </div>
      <div v-else>
        <v-progress-linear color="secondary" indeterminate :height="25"
          >Loading...</v-progress-linear
        >
      </div>
    </template>
    <template v-slot:item.last_observation="{ item }">
      <div v-if="mostRecentObs[item.raw.id]">
        <v-row>
          {{ formatDate(mostRecentObs[item.raw.id][0]) }}
        </v-row>
        <v-row>
          {{ mostRecentObs[item.raw.id][1] }}&nbsp;
          {{ units.find((u) => u.id === item.raw.unitId)?.name }}
        </v-row>
      </div>
    </template>

    <template v-slot:item.actions="{ item }">
      <DatastreamTableActions
        v-if="isOwner !== undefined"
        :datastream="item.raw"
        :is-owner="isOwner"
        :thing-id="thingId"
        @openPlot="item.raw.chartOpen = true"
      />
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import FocusContextPlot from '@/components/Datastream/FocusContextPlot.vue'

import Sparkline from '@/components/Sparkline.vue'
import { computed, onMounted } from 'vue'
import { usePrimaryOwnerData } from '@/composables/usePrimaryOwnerData'
import { useObservationsLast72Hours } from '@/store/observations72Hours'
import { storeToRefs } from 'pinia'
import { useThingStore } from '@/store/things'
import { useDatastreamStore } from '@/store/datastreams'
import DatastreamTableActions from '@/components/Datastream/DatastreamTableActions.vue'

const props = defineProps({
  thingId: {
    type: String,
    required: true,
  },
})

const { fetchObservationsBulk } = useObservationsLast72Hours()
const { loaded, observations, mostRecentObs } = storeToRefs(
  useObservationsLast72Hours()
)
const { fetchDatastreamsByThingId } = useDatastreamStore()
const { datastreams } = storeToRefs(useDatastreamStore())

const { things } = storeToRefs(useThingStore())
const isOwner = computed(() => things.value[props.thingId]?.ownsThing)

const { sensors, units, observedProperties, processingLevels } =
  usePrimaryOwnerData(props.thingId)

const visibleDatastreams = computed(() => {
  if (!datastreams.value[props.thingId]) return []

  return datastreams.value[props.thingId]
    .filter((d) => d.isVisible || isOwner.value)
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

function formatDate(dateString: string) {
  return (
    new Date(dateString).toUTCString().split(' ').slice(1, 5).join(' ') + ' UTC'
  )
}

function isStale(timestamp: string) {
  let endTime = new Date(timestamp)
  let seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000)
  return endTime < seventyTwoHoursAgo
}

onMounted(async () => {
  await fetchDatastreamsByThingId(props.thingId)
  await fetchObservationsBulk(visibleDatastreams.value)
})
</script>
