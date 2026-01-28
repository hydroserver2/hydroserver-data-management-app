<template>
  <v-progress-linear v-if="loading" color="secondary" indeterminate />
  <div v-else-if="!loading && canShowSparkline">
    <div class="w-[300px] max-w-full max-[600px]:w-full">
      <div class="mb-1 text-body-3 font-weight-light opacity-70">
        Sparkline is showing most recent {{ validObservations.length }}
        values
      </div>
      <div
        ref="sparklineRef"
        class="h-[100px] w-full cursor-pointer"
        :style="sparklineContainerStyle"
        @click="handleEmit"
      />
    </div>
  </div>
  <div v-else>
    No observations
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  computed,
  nextTick,
  onBeforeUnmount,
  watch,
} from 'vue'
import { PropType } from 'vue'
import { DataArray, Datastream, TimeSpacingUnit } from '@hydroserver/client'
import { preProcessData, subtractHours } from '@/utils/observationsUtils'
import { useObservationStore } from '@/store/observations'

const { fetchObservationsInRange } = useObservationStore()

const props = defineProps({
  datastream: {
    type: Object as PropType<Datastream>,
    required: true,
  },
  unitName: String,
})

type LatestValuePayload = { text: string; showUnit: boolean }

const emit = defineEmits<{
  (e: 'openChart'): void
  (e: 'latest-value', value: LatestValuePayload): void
}>()
const handleEmit = () => {
  emit('openChart')
}

const sparklineObservations = ref<DataArray>([])
const loading = ref(true)
const sparklineRef = ref<HTMLDivElement | null>(null)
let plotlyApi: any | null = null

const ensurePlotly = async () => {
  if (plotlyApi) return plotlyApi
  const PlotlyModule = await import('plotly.js-dist')
  plotlyApi = (PlotlyModule as any).default ?? PlotlyModule
  return plotlyApi
}

const processedObs = computed(() =>
  preProcessData(sparklineObservations.value, props.datastream)
)

const getNumericValue = (value: unknown) => {
  const numericValue = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

const validObservations = computed(() =>
  processedObs.value.filter((point) => getNumericValue(point.value) !== null)
)

const normalizeNoDataValue = (value: unknown) => {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') {
    const numeric = Number(value)
    return Number.isFinite(numeric) ? numeric : value
  }
  return value
}

const isNoDataValue = (value: unknown) => {
  const noDataValue = normalizeNoDataValue(props.datastream.noDataValue)
  if (noDataValue === null || noDataValue === undefined) return false
  if (typeof noDataValue === 'number') {
    const numericValue = getNumericValue(value)
    return numericValue !== null && numericValue === noDataValue
  }
  return String(value) === String(noDataValue)
}

const latestRawObservationValue = computed<unknown>(() => {
  const arr = sparklineObservations.value
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    const rawValue = arr[i]?.[1] as unknown
    if (rawValue !== undefined) {
      return rawValue
    }
  }
  return null
})

const mostRecentDataValue = computed<LatestValuePayload>(() => {
  if (!sparklineObservations.value.length) {
    return { text: 'No observations', showUnit: false }
  }
  const rawValue = latestRawObservationValue.value
  if (rawValue === undefined) {
    return { text: 'No observations', showUnit: false }
  }
  if (rawValue === null) {
    return { text: 'null', showUnit: false }
  }
  if (typeof rawValue === 'string') {
    const trimmed = rawValue.trim()
    if (trimmed === '') {
      return { text: 'empty', showUnit: false }
    }
    if (trimmed.toLowerCase() === 'nan') {
      return { text: 'NaN', showUnit: false }
    }
  }
  if (typeof rawValue === 'number' && Number.isNaN(rawValue)) {
    return { text: 'NaN', showUnit: false }
  }
  if (isNoDataValue(rawValue)) {
    const noDataValue = props.datastream.noDataValue
    return {
      text:
        noDataValue === null || noDataValue === undefined
          ? 'No data'
          : String(noDataValue),
      showUnit: false,
    }
  }
  const numericValue = getNumericValue(rawValue)
  if (numericValue !== null) {
    return { text: formatNumber(numericValue), showUnit: true }
  }
  return { text: 'No observations', showUnit: false }
})

const sparklineColors = computed(() =>
  isStale(props.datastream.phenomenonEndTime)
    ? { line: '#9E9E9E', fill: '#EEEEEE', border: '#BDBDBD' }
    : { line: '#4CAF50', fill: '#E8F5E9', border: '#BDBDBD' }
)

const sparklineContainerStyle = computed(() => ({
  height: '100px',
  width: '100%',
  border: `2px solid ${sparklineColors.value.border}`,
  borderRadius: '4px',
  overflow: 'hidden',
}))

const hasValidSparklineData = computed(() => validObservations.value.length > 0)
const canShowSparkline = computed(
  () =>
    Boolean(props.datastream.phenomenonEndTime) &&
    sparklineObservations.value.length > 0 &&
    hasValidSparklineData.value
)

const renderSparkline = async () => {
  if (!sparklineRef.value) return

  const observations = processedObs.value
  if (!observations.length || !validObservations.value.length) {
    if ((sparklineRef.value as any)?._fullLayout && plotlyApi) {
      plotlyApi.purge(sparklineRef.value)
    }
    return
  }
  const Plotly = await ensurePlotly()

  const colors = sparklineColors.value
  const xValues = observations.map((dp) => dp.date.getTime())
  const minX = xValues[0]
  const maxX = xValues[xValues.length - 1]
  const xRange =
    minX === maxX ? [minX - 1, maxX + 1] : [minX, maxX]
  const trace = {
    type: 'scattergl',
    mode: 'lines',
    x: xValues,
    y: observations.map((dp) => dp.value),
    line: { color: colors.line, width: 1 },
    fill: 'tozeroy',
    fillcolor: colors.fill,
    hoverinfo: 'skip',
  }

  const layout = {
    margin: { l: 0, r: 0, t: 0, b: 0, pad: 0 },
    xaxis: {
      type: 'date',
      visible: false,
      showgrid: false,
      zeroline: false,
      autorange: false,
      range: xRange,
      fixedrange: true,
    },
    yaxis: { visible: false, showgrid: false, zeroline: false },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
  }

  const config = {
    displayModeBar: false,
    staticPlot: true,
    responsive: true,
  }

  const hasPlot = Boolean((sparklineRef.value as any)?._fullLayout)
  if (hasPlot) {
    await Plotly.react(sparklineRef.value, [trace], layout, config)
  } else {
    await Plotly.newPlot(sparklineRef.value, [trace], layout, config)
  }
}

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
  const numericValue = typeof value === 'number' ? value : Number(value)
  if (Number.isFinite(numericValue)) {
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
    return formatter.format(numericValue)
  }

  return ''
}


onMounted(async () => {
  sparklineObservations.value =
    (await fetchSparklineObservations(props.datastream)) || []
  loading.value = false
  nextTick(() => {
    renderSparkline()
  })
})

watch(processedObs, () => {
  nextTick(() => {
    renderSparkline()
  })
})

watch(
  mostRecentDataValue,
  (value) => {
    emit('latest-value', value)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (sparklineRef.value) {
    if (plotlyApi) {
      plotlyApi.purge(sparklineRef.value)
    }
  }
})
</script>
