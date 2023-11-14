<template>
  <v-card
    class="elevation-5"
    :loading="obsStore.observations[datastreamId]?.loading"
  >
    <template v-slot:loader="{ isActive }">
      <v-progress-linear color="primary" :active="isActive" indeterminate />
    </template>
    <v-card-title>
      <div class="d-flex pt-2">
        <h5 class="flex-grow-1 pl-4 text-center text-h5">
          Datastream for {{ thing?.name }}
        </h5>
        <v-icon @click="$emit('close')">mdi-close</v-icon>
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
        @click="drawObservationsSince(selection.value)"
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
import { calculateEffectiveStartTime } from '@/utils/observationsUtils'
import { useObservationsLast72Hours } from '@/store/observations72Hours'

const obsStore = useObservationStore()
const obs72Store = useObservationsLast72Hours()

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

async function getStartTime(hours: number) {
  selectedTime.value = hours
  if (
    datastream.value.phenomenonEndTime &&
    datastream.value.phenomenonBeginTime
  ) {
    return calculateEffectiveStartTime(
      datastream.value.phenomenonBeginTime,
      datastream.value.phenomenonEndTime,
      hours
    )
  }
}

async function drawObservationsSince(hours: number) {
  const startTime = await getStartTime(hours)
  const observations = await obsStore.getObservationsSince(
    datastream.value.id,
    startTime!
  )
  if (observations) drawPlot(observations)
}

onMounted(async () => {
  // Pull from the 72hourStore the first time since it should already by loaded
  const startTime = await getStartTime(72)
  if (!datastream.value.phenomenonEndTime) return
  await obs72Store.getObservationsSince(datastream.value.id, startTime!)
  drawPlot(obs72Store.observations[datastream.value.id])
})
</script>
