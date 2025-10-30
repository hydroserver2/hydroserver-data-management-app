<template>
  <v-progress-linear v-if="loading" color="secondary" indeterminate />
  <div v-else-if="!loading && sparklineObservations.length" @click="handleEmit">
    <div style="width: 300px">
      <v-chart
        :option="chartOption"
        autoresize
        style="height: 100px; width: 100%"
      />
      <div class="mt-1" style="width: 100%">
        <span class="text-subtitle-2 font-weight-medium">
          <strong>Latest Value:</strong>
          {{ mostRecentDataValue }} {{ unitName }}
        </span>
      </div>
      <div style="width: 100%">
        <span class="text-body-3 font-weight-low opacity-70">
          Sparkline is showing most recent
          {{ sparklineObservations.length }} values
        </span>
      </div>
    </div>
  </div>
  <div v-else-if="!sparklineObservations.length">
    No data for this datastream
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { PropType } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { DataArray, Datastream, TimeSpacingUnit } from '@hydroserver/client'
import { preProcessData, subtractHours } from '@/utils/observationsUtils'
import { useObservationStore } from '@/store/observations'
import {
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
} from 'echarts/components'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
])

const { fetchObservationsInRange } = useObservationStore()

const props = defineProps({
  datastream: {
    type: Object as PropType<Datastream>,
    required: true,
  },
  unitName: String,
})

const emit = defineEmits(['openChart'])
const handleEmit = () => {
  emit('openChart')
}

const sparklineObservations = ref<DataArray>([])
const loading = ref(true)

const processedObs = computed(() =>
  preProcessData(sparklineObservations.value, props.datastream)
)

const mostRecentDataValue = computed(() => {
  const arr = processedObs.value
  if (!arr.length) return ''
  const latest = arr[arr.length - 1].value
  return formatNumber(latest)
})

const chartOption = computed(() => {
  const observations = processedObs.value
  if (!observations.length) return {}

  let colors = isStale(props.datastream.phenomenonEndTime)
    ? { line: '#9E9E9E', fill: '#EEEEEE', border: '#BDBDBD' } // Grey, GL4, GL1
    : { line: '#4CAF50', fill: '#E8F5E9', border: '#BDBDBD' } // Green, GrL5, GL1

  return {
    color: [colors.line],
    grid: {
      bottom: 3,
      right: 1,
      top: 3,
      left: 1,
      borderColor: colors.border,
      borderWidth: 2,
      show: true,
    },
    xAxis: {
      type: 'time',
      show: false,
    },
    yAxis: {
      type: 'value',
      min: 'dataMin',
      max: 'dataMax',
      show: false,
    },
    series: [
      {
        type: 'line',
        data: observations.map((dp) => [dp.date.getTime(), dp.value]),
        showSymbol: false,
        areaStyle: {
          color: colors.fill,
          origin: 'start',
        },
      },
    ],
  }
})

function isStale(timestamp: string | null | undefined) {
  if (!timestamp) return true
  let endTime = new Date(timestamp)
  let seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000)
  return endTime < seventyTwoHoursAgo
}

const convertToMilliseconds = (
  amount: number,
  unit: TimeSpacingUnit
): number => {
  switch (unit) {
    case 'seconds':
      return amount * 1000
    case 'minutes':
      return amount * 60 * 1000
    case 'hours':
      return amount * 60 * 60 * 1000
    case 'days':
      return amount * 24 * 60 * 60 * 1000
  }
}

const fetchSparklineObservations = async (ds: Datastream) => {
  const {
    phenomenonEndTime: endTime,
    intendedTimeSpacing,
    intendedTimeSpacingUnit,
  } = ds

  if (!endTime) return null

  let beginTime: string
  if (intendedTimeSpacing && intendedTimeSpacingUnit) {
    const spacingMs = convertToMilliseconds(
      intendedTimeSpacing,
      intendedTimeSpacingUnit
    )

    const timeIntervalCount =
      spacingMs >= 86_400_000
        ? 30 // daily data should display 30 values
        : spacingMs >= 3_600_000
        ? 50 // hourly data should display 50 values
        : 200 // sub-hourly data should display 200 values

    const observationCount = timeIntervalCount - 1
    const totalDurationMs = spacingMs * observationCount
    beginTime = new Date(
      new Date(endTime).getTime() - totalDurationMs
    ).toISOString()
  } else {
    beginTime = subtractHours(endTime, 72)
  }

  return fetchObservationsInRange(ds, beginTime, endTime).catch((error) => {
    console.error('Failed to fetch observations:', error)
    return null
  })
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

onMounted(async () => {
  sparklineObservations.value =
    (await fetchSparklineObservations(props.datastream)) || []
  loading.value = false
})
</script>
