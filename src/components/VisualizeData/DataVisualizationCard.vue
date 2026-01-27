<template>
  <v-card class="elevation-2 plot-card" :loading="updating">
    <template v-slot:loader="{ isActive }">
      <v-progress-linear color="primary" :active="isActive" indeterminate />
    </template>

    <keep-alive>
      <v-card-text v-if="canPlot" :style="{ height: '100%' }" class="plot-shell">
        <div class="plot-body">
          <div class="plot-rail">
            <v-tooltip bottom :openDelay="0">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  :icon="mdiChartLine"
                  class="plot-rail-btn"
                  :class="{ 'plot-rail-btn--active': viewMode === 'plot' }"
                  variant="text"
                  size="small"
                  block
                  rounded="0"
                  @click="viewMode = 'plot'"
                />
              </template>
              Plot
            </v-tooltip>
            <v-tooltip bottom :openDelay="0">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  :icon="mdiTable"
                  class="plot-rail-btn"
                  :class="{ 'plot-rail-btn--active': viewMode === 'summary' }"
                  variant="text"
                  size="small"
                  block
                  rounded="0"
                  @click="viewMode = 'summary'"
                />
              </template>
              Summary statistics
            </v-tooltip>
          </div>
          <div class="plot-panel">
            <v-window v-model="viewMode" class="plot-window" :touch="false">
              <v-window-item value="plot" class="plot-window-item">
                <div ref="plotContainer" class="plotly-chart" />
                <div class="plot-toolbar">
                  <DataVisTimeFilters @copy-state="emit('copy-state')" />
                </div>
              </v-window-item>
              <v-window-item value="summary" class="plot-window-item">
                <SummaryStatisticsTable />
              </v-window-item>
            </v-window>
          </div>
        </div>
      </v-card-text>
    </keep-alive>

    <div v-if="!isDataAvailable && viewMode === 'plot'" class="plot-empty">
      <v-card-text>
        <div class="plot-empty__title">Visualize data</div>
        <v-timeline align="start" density="compact">
          <v-timeline-item size="x-small" dot-color="primary">
            <div>
              <strong> Filter: </strong>
            </div>
            <div>
              Filter the datastream table items with the filter drawer on the
              left and the search bar on the top of the datastreams table.
            </div>
          </v-timeline-item>
          <v-timeline-item size="x-small" dot-color="secondary">
            <div>
              <strong> Adjust the time range: </strong>
            </div>
            <div>
              Adjust the time range to cover the desired period you wish to
              observe.
            </div>
          </v-timeline-item>
          <v-timeline-item size="x-small" dot-color="blue-grey">
            <div>
              <strong> Select up to 5 datastreams: </strong>
            </div>
            <div>
              The plot allows up to 5 datastreams to be shown at once. If two
              datastreams share the same observed property and unit, they'll
              share a y-axis.
            </div>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>

      <v-card-text
        v-if="plottedDatastreams.length && !updating"
        class="text-center"
      >
        <v-alert type="warning" dense>
          No data available for the selected date range. Please select a
          different date range to re-plot.
        </v-alert>
      </v-card-text>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import SummaryStatisticsTable from './SummaryStatisticsTable.vue'
import DataVisTimeFilters from './DataVisTimeFilters.vue'
import { useDataVisStore } from '@/store/dataVisualization'
import { ref, watch, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { debounce } from 'lodash-es'
import { getXRangeBounds } from '@/utils/plotting/plotly'
// @ts-ignore no type definitions
import Plotly from 'plotly.js-dist'
import { mdiChartLine, mdiTable } from '@mdi/js'

const emit = defineEmits(['copy-state'])

const props = defineProps({
  cardHeight: { type: Number, required: true },
})

const { onDateBtnClick } = useDataVisStore()
const {
  showSummaryStatistics,
  dataZoomStart,
  dataZoomEnd,
  graphSeriesArray,
  plotlyOptions,
  loadingStates,
  plottedDatastreams,
  beginDate,
  endDate,
} = storeToRefs(useDataVisStore())

const plotContainer = ref<HTMLDivElement | null>(null)
const plotlyRef = ref<(HTMLDivElement & { [key: string]: any }) | null>(null)
const handlersAttached = ref(false)

const updating = computed(() =>
  Array.from(loadingStates.value.values()).some((isLoading) => isLoading)
)

const isDataAvailable = computed(() =>
  graphSeriesArray.value.some((series) => series.data && series.data.length > 0)
)

const canPlot = computed(() =>
  Boolean(plotlyOptions.value && isDataAvailable.value)
)
const viewMode = computed<'plot' | 'summary'>({
  get: () => (showSummaryStatistics.value ? 'summary' : 'plot'),
  set: (value) => {
    showSummaryStatistics.value = value === 'summary'
  },
})

const showPlot = computed(() => canPlot.value && viewMode.value === 'plot')

const clampPercent = (value: number) => Math.min(100, Math.max(0, value))
const RANGE_MATCH_TOLERANCE_MS = 5 * 60 * 1000
const PRESET_MATCH_TOLERANCE_MS = 36 * 60 * 60 * 1000

const isWithinTolerance = (value: number, target: number, tolerance: number) =>
  Math.abs(value - target) <= tolerance

const getMostRecentEndTime = () =>
  plottedDatastreams.value.reduce((latest, ds) => {
    if (!ds.phenomenonEndTime) return latest
    const dsEndDate = new Date(ds.phenomenonEndTime)
    return dsEndDate > latest ? dsEndDate : latest
  }, new Date(0))

const getOldestBeginTime = () =>
  plottedDatastreams.value.reduce((oldest, ds) => {
    if (!ds.phenomenonBeginTime) return oldest
    const dsBeginDate = new Date(ds.phenomenonBeginTime)
    return dsBeginDate < oldest ? dsBeginDate : oldest
  }, endDate.value)

const getPhenomenonRange = () => {
  let min = Infinity
  let max = -Infinity

  plottedDatastreams.value.forEach((ds) => {
    if (ds.phenomenonBeginTime) {
      const begin = new Date(ds.phenomenonBeginTime).getTime()
      if (Number.isFinite(begin)) min = Math.min(min, begin)
    }
    if (ds.phenomenonEndTime) {
      const end = new Date(ds.phenomenonEndTime).getTime()
      if (Number.isFinite(end)) max = Math.max(max, end)
    }
  })

  if (!Number.isFinite(min) || !Number.isFinite(max)) return null
  return { min, max }
}

const matchPresetRange = (rangeStart: number, rangeEnd: number) => {
  if (!plottedDatastreams.value.length) return null

  const mostRecentEnd = getMostRecentEndTime().getTime()
  if (!Number.isFinite(mostRecentEnd)) return null
  if (!isWithinTolerance(rangeEnd, mostRecentEnd, PRESET_MATCH_TOLERANCE_MS))
    return null

  const end = new Date(mostRecentEnd)
  const candidates = [
    {
      id: 0,
      begin: new Date(end.getFullYear(), end.getMonth() - 1, end.getDate()),
    },
    {
      id: 1,
      begin: new Date(end.getFullYear(), end.getMonth() - 6, end.getDate()),
    },
    {
      id: 2,
      begin: new Date(end.getFullYear(), 0, 1),
    },
    {
      id: 3,
      begin: new Date(end.getFullYear() - 1, end.getMonth(), end.getDate()),
    },
    {
      id: 4,
      begin: getOldestBeginTime(),
    },
  ]

  const match = candidates.find((candidate) =>
    isWithinTolerance(
      rangeStart,
      candidate.begin.getTime(),
      PRESET_MATCH_TOLERANCE_MS
    )
  )
  return match ? match.id : null
}

const handleRelayout = async (eventData: any) => {
  if (!plotlyRef.value) return

  if (!eventData) return

  const eventKeys = Object.keys(eventData)
  const hasYRangeChange = eventKeys.some(
    (key) => key.startsWith('yaxis') && key.includes('range[')
  )
  if (hasYRangeChange) return

  const eventRangeStart = eventData['xaxis.range[0]']
  const eventRangeEnd = eventData['xaxis.range[1]']
  if (eventRangeStart === undefined || eventRangeEnd === undefined) return

  const rangeStart =
    typeof eventRangeStart === 'string'
      ? Date.parse(eventRangeStart)
      : eventRangeStart
  const rangeEnd =
    typeof eventRangeEnd === 'string' ? Date.parse(eventRangeEnd) : eventRangeEnd
  if (!Number.isFinite(rangeStart) || !Number.isFinite(rangeEnd)) return

  const bounds =
    plotlyOptions.value?.xRange || getXRangeBounds(graphSeriesArray.value)
  if (!bounds) return

  const span = bounds.max - bounds.min
  if (span <= 0) return

  dataZoomStart.value = Math.round(
    clampPercent(((rangeStart - bounds.min) / span) * 100)
  )
  dataZoomEnd.value = Math.round(
    clampPercent(((rangeEnd - bounds.min) / span) * 100)
  )

  const currentStart = beginDate.value?.getTime()
  const currentEnd = endDate.value?.getTime()
  const rangeMatchesCurrent =
    currentStart !== undefined &&
    currentEnd !== undefined &&
    isWithinTolerance(rangeStart, currentStart, RANGE_MATCH_TOLERANCE_MS) &&
    isWithinTolerance(rangeEnd, currentEnd, RANGE_MATCH_TOLERANCE_MS)

  if (!rangeMatchesCurrent) {
    const phenomenonRange = getPhenomenonRange()
    const rangeMatchesDataBounds =
      isWithinTolerance(rangeStart, bounds.min, RANGE_MATCH_TOLERANCE_MS) &&
      isWithinTolerance(rangeEnd, bounds.max, RANGE_MATCH_TOLERANCE_MS)
    const needsFullRange =
      phenomenonRange &&
      (bounds.min > phenomenonRange.min + RANGE_MATCH_TOLERANCE_MS ||
        bounds.max < phenomenonRange.max - RANGE_MATCH_TOLERANCE_MS)
    const matchedPresetId =
      rangeMatchesDataBounds && needsFullRange
        ? 4
        : matchPresetRange(rangeStart, rangeEnd)
    if (matchedPresetId !== null) {
      onDateBtnClick(matchedPresetId)
    }
  }

}

const debouncedRelayout = debounce(handleRelayout, 250)

const attachHandlers = () => {
  if (!plotlyRef.value || handlersAttached.value) return
  plotlyRef.value.on('plotly_redraw', debouncedRelayout)
  plotlyRef.value.on('plotly_relayout', debouncedRelayout)
  handlersAttached.value = true
}

const renderPlot = async () => {
  if (!plotlyOptions.value || !plotContainer.value) return

  const { traces, layout, config } = plotlyOptions.value

  if (!plotlyRef.value) {
    plotlyRef.value = await Plotly.newPlot(
      plotContainer.value,
      traces,
      layout,
      config
    )
    attachHandlers()
  } else {
    await Plotly.react(plotlyRef.value, traces, layout, config)
  }

  queueResize()
}

const cleanupPlot = () => {
  if (plotlyRef.value) {
    Plotly.purge(plotlyRef.value)
    plotlyRef.value = null
    handlersAttached.value = false
  }
}

const queueResize = () => {
  if (!plotlyRef.value) return
  requestAnimationFrame(() => {
    if (plotlyRef.value) Plotly.Plots.resize(plotlyRef.value)
  })
  setTimeout(() => {
    if (plotlyRef.value) Plotly.Plots.resize(plotlyRef.value)
  }, 200)
}

const handleLayoutResize = () => {
  if (plotlyRef.value) {
    queueResize()
  }
}

watch([() => props.cardHeight], ([newHeight], [oldHeight]) => {
  if (Math.abs(newHeight - oldHeight) < 0.2) return
  nextTick(() => {
    queueResize()
  })
})

watch(
  () => canPlot.value,
  (shouldRender) => {
    if (!shouldRender) {
      cleanupPlot()
      return
    }
    nextTick(() => {
      renderPlot()
    })
  },
  { immediate: true }
)

watch(
  () => plotlyOptions.value,
  () => {
    if (showPlot.value) {
      nextTick(() => {
        renderPlot()
      })
    }
  }
)

watch(
  () => showPlot.value,
  (isVisible) => {
    if (isVisible) {
      nextTick(() => {
        renderPlot()
        queueResize()
      })
    }
  }
)

onBeforeUnmount(() => {
  window.removeEventListener('datavis-layout', handleLayoutResize)
  window.removeEventListener('resize', handleLayoutResize)
  cleanupPlot()
})

onMounted(() => {
  window.addEventListener('datavis-layout', handleLayoutResize)
  window.addEventListener('resize', handleLayoutResize)
  setTimeout(() => {
    queueResize()
  }, 200)
})
</script>

<style scoped>
.plot-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.plot-card :deep(.v-card-text) {
  padding: 0;
  flex: 1;
  min-height: 0;
}

.plot-empty {
  min-height: 100%;
}

.plot-empty :deep(.v-card-text) {
  margin-top: 12px;
  margin-left: 12px;
}

.plot-empty__title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 8px 8px 12px;
}

.plotly-chart {
  flex: 1;
  min-height: 0;
  width: 100%;
  height: 100%;
}

.plot-toolbar {
  padding: 0;
}

.plot-shell {
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
  min-height: 0;
  height: 100%;
}

.plot-shell :deep(.js-plotly-plot .plotly) {
  .drag.cursor-ns-resize,
  .drag.cursor-n-resize,
  .drag.cursor-s-resize,
  .drag.cursor-w-resize,
  .drag.cursor-ew-resize,
  .drag.cursor-e-resize {
    fill: #f8f8f8 !important;
    stroke: #f8f8f8 !important;
    stroke-width: 1px !important;
  }

  .drag.cursor-sw-resize,
  .drag.cursor-nw-resize,
  .drag.cursor-ne-resize,
  .drag.cursor-se-resize {
    fill: #f2f2f2 !important;
    stroke: #f2f2f2 !important;
    stroke-width: 1px !important;
  }
}

.plot-body {
  display: flex;
  min-height: 0;
  flex: 1;
  align-items: stretch;
  height: 100%;
}

.plot-rail {
  width: 44px;
  background-color: #f2f2f2;
  border-right: 1px solid #e0e0e0;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0;
  padding: 0;
  min-height: 100%;
}

.plot-rail-btn {
  border-radius: 0;
  min-width: 100%;
  min-height: 44px;
}

.plot-rail-btn--active {
  background-color: rgba(33, 150, 243, 0.12);
  color: #1e88e5;
  position: relative;
}

.plot-rail-btn--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: #1e88e5;
}

.plot-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.plot-window {
  flex: 1;
  min-height: 0;
  height: 100%;
}

.plot-window :deep(.v-window__container) {
  height: 100%;
}

.plot-window-item {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

@media (max-width: 600px) {
  .plot-body {
    flex-direction: column;
  }

  .plot-rail {
    width: 100%;
    height: 36px;
    min-height: 0;
    flex: 0 0 36px;
    flex-direction: row;
    border-right: 0;
    border-bottom: 1px solid #e0e0e0;
  }

  .plot-rail-btn {
    min-height: 36px;
    min-width: 36px;
    flex: 1;
  }

  .plot-rail-btn--active::before {
    left: 0;
    right: 0;
    top: auto;
    bottom: 0;
    width: auto;
    height: 3px;
  }
}
</style>
