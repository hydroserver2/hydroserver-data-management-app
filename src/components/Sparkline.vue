<template>
  <v-progress-linear v-if="loading" color="secondary" indeterminate />
  <div @click="handleEmit" ref="chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as Plot from '@observablehq/plot'
import * as d3 from 'd3'
import { PropType } from 'vue'
import { DataArray, Datastream } from '@/types'
import { preProcessData } from '@/utils/observationsUtils'
import { subtractHours } from '@/utils/observationsUtils'
import { useObservationStore } from '@/store/observations'

const { fetchObservationsInRange } = useObservationStore()

const props = defineProps({
  datastream: {
    type: Object as PropType<Datastream>,
    required: true,
  },
})
const emit = defineEmits(['openChart'])
const handleEmit = () => {
  emit('openChart')
}

const obs72 = ref<DataArray>([])
const loading = ref(true)
const chart = ref<HTMLDivElement | null>(null)

function isStale(timestamp: string | null | undefined) {
  if (!timestamp) return true
  let endTime = new Date(timestamp)
  let seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000)
  return endTime < seventyTwoHoursAgo
}

function drawChart() {
  if (!chart.value) return

  let colors = isStale(props.datastream.phenomenonEndTime)
    ? { line: '#9E9E9E', fill: '#F5F5F5' } // Grey and grey-lighten-4
    : { line: '#4CAF50', fill: '#E8F5E9' } // Green and green-lighten-5

  let observations = preProcessData(obs72.value, props.datastream)
  const [minY, maxY] = d3.extent(observations, (d) => d.value)

  const sparkline = Plot.plot({
    width: 250,
    height: 100,
    x: {
      grid: false,
      axis: null,
    },
    y: {
      domain: [minY, maxY],
      grid: false,
      axis: null,
    },
    marks: [
      Plot.areaY(observations, {
        x: 'date',
        y1: (d) => minY,
        y2: 'value',
        stroke: colors.line,
        fill: colors.fill,
      }),
      Plot.frame({
        stroke: 'grey',
      }),
    ],
  })

  chart.value.innerHTML = ''
  chart.value.appendChild(sparkline)
}

const fetchObsLast72Hours = async (ds: Datastream) => {
  const { phenomenonEndTime: endTime } = ds
  if (endTime) {
    const beginTime = subtractHours(endTime, 72)
    return fetchObservationsInRange(ds, beginTime, endTime).catch((error) => {
      console.error('Failed to fetch observations:', error)
      return null
    })
  }
}

onMounted(async () => {
  obs72.value = await fetchObsLast72Hours(props.datastream)
  loading.value = false

  if (!obs72.value?.length && chart.value) {
    chart.value.textContent = 'No data for this datastream'
  } else {
    drawChart()
  }
})
</script>
