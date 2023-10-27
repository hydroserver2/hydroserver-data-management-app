<template>
  <v-card class="elevation-5">
    <v-card-title>
      <div class="d-flex">
        <h5 class="flex-grow-1 pt-2 pl-4 text-center text-h5">
          Datastream for {{ thing?.name }}
        </h5>
        <v-btn icon @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </v-card-title>
    <v-card-text>
      <div ref="focusChart"></div>
      <div ref="contextChart"></div>
    </v-card-text>

    <v-card-actions class="my-3 d-flex justify-center">
      <v-btn
        v-for="selection in timeSelections"
        rounded
        :variant="selectedTime === selection.value ? 'outlined' : 'plain'"
        @click="fetchDataForPeriod(selection.value)"
        >{{ selection.label }}</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDatastream } from '@/composables/useDatastream'
import { useThing } from '@/composables/useThing'
import { focus, context } from '@/utils/FocusContextPlot'
import { useObservationStore } from '@/store/observations'
import { DataArray } from '@/types'
import { usePrimaryOwnerData } from '@/composables/usePrimaryOwnerData'

const obsStore = useObservationStore()

const props = defineProps({
  thingId: {
    type: String,
    required: true,
  },
  datastreamId: {
    type: String,
    required: true,
  },
})

const timeSelections = [
  { label: 'Last 72 Hours', value: 72 },
  { label: 'Last Week', value: 168 },
  { label: 'Last Month', value: 720 },
  { label: 'Last Year', value: 8760 },
  { label: 'All Time', value: -1 },
]
const selectedTime = ref(72)
const emit = defineEmits(['close'])

const { thing } = useThing(props.thingId)
const { datastream } = useDatastream(props.thingId, props.datastreamId)

const { getUnitAttrById, getObservedPropertyAttrById } = usePrimaryOwnerData(
  props.thingId
)

let focusChart = ref<any>(null)
let contextChart = ref<any>(null)

function drawPlot(dataArray: DataArray) {
  // Observable Plot expects an array of objects so convert
  const data = dataArray.map(([dateString, value]) => ({
    date: new Date(dateString),
    value,
  }))

  if (focusChart.value) {
    const unitSymbol = datastream.value.unitId
      ? `(${getUnitAttrById(datastream.value.unitId, 'symbol')})`
      : ''

    const yAxisLabel = datastream.value
      ? `${getObservedPropertyAttrById(
          datastream.value.observedPropertyId
        )} ${unitSymbol} `
      : ''

    const focusSVG = focus(data, yAxisLabel)
    focusChart.value.innerHTML = ''
    focusChart.value.appendChild(focusSVG)
  }
  if (contextChart.value) {
    const contextSVG = context(data)
    contextChart.value.innerHTML = ''
    contextChart.value.appendChild(contextSVG)
  }
}

async function fetchDataForPeriod(hours: number) {
  selectedTime.value = hours
  if (
    datastream.value.phenomenonEndTime &&
    datastream.value.phenomenonBeginTime
  )
    await obsStore.fetchObservations(
      datastream.value.id,
      hours,
      datastream.value.phenomenonBeginTime,
      datastream.value.phenomenonEndTime
    )
  drawPlot(obsStore.observations[datastream.value.id])
}

onMounted(async () => {
  if (
    datastream.value.phenomenonEndTime &&
    datastream.value.phenomenonBeginTime
  )
    await obsStore.fetchObservations(
      datastream.value.id,
      72,
      datastream.value.phenomenonBeginTime,
      datastream.value.phenomenonEndTime
    )
  drawPlot(obsStore.observations[datastream.value.id])
})
</script>
