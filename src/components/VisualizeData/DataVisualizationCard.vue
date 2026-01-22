<template>
  <v-card class="elevation-0" :loading="updating">
    <template v-slot:loader="{ isActive }">
      <v-progress-linear color="primary" :active="isActive" indeterminate />
    </template>

    <keep-alive>
      <v-card-text
        v-if="canPlot"
        :style="{ height: `${cardHeight}vh` }"
        class="plot-shell"
      >
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
                  <DataVisTimeFilters />
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

    <div
      v-if="!isDataAvailable && viewMode === 'plot'"
      :style="{ 'min-height': `${cardHeight}vh` }"
    >
      <v-card-text>
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

const props = defineProps({
  cardHeight: { type: Number, required: true },
})

const {
  showSummaryStatistics,
  dataZoomStart,
  dataZoomEnd,
  graphSeriesArray,
  plotlyOptions,
  loadingStates,
  plottedDatastreams,
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

const updateTooltipState = async () => {
  if (!plotlyRef.value) return

  const nextHoverState = 'x+y'
  const nextHoverTemplate = '<b>%{y}</b><br>%{x}<extra></extra>'
  const currentHoverState = plotlyRef.value?.data?.[0]?.hoverinfo
  if (currentHoverState !== nextHoverState) {
    await Plotly.restyle(plotlyRef.value, {
      hoverinfo: nextHoverState,
      hovertemplate: nextHoverTemplate,
    })
  }
}

const handleRelayout = async (eventData: any) => {
  if (!plotlyRef.value) return

  if (
    !eventData ||
    (eventData['xaxis.range[0]'] === undefined &&
      eventData['xaxis.range[1]'] === undefined &&
      !eventData['xaxis.autorange'])
  ) {
    return
  }

  const xRange = plotlyRef.value.layout?.xaxis?.range
  if (!xRange || xRange.length < 2) return

  const rangeStart =
    typeof xRange[0] === 'string' ? Date.parse(xRange[0]) : xRange[0]
  const rangeEnd =
    typeof xRange[1] === 'string' ? Date.parse(xRange[1]) : xRange[1]

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

  await updateTooltipState()
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

  await updateTooltipState()
}

const cleanupPlot = () => {
  if (plotlyRef.value) {
    Plotly.purge(plotlyRef.value)
    plotlyRef.value = null
    handlersAttached.value = false
  }
}

const handleLayoutResize = () => {
  if (plotlyRef.value) {
    Plotly.Plots.resize(plotlyRef.value)
  }
}

watch([() => props.cardHeight], ([newHeight], [oldHeight]) => {
  if (Math.abs(newHeight - oldHeight) < 0.2) return
  nextTick(() => {
    if (plotlyRef.value) Plotly.Plots.resize(plotlyRef.value)
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
        if (plotlyRef.value) Plotly.Plots.resize(plotlyRef.value)
      })
    }
  }
)

onBeforeUnmount(() => {
  window.removeEventListener('datavis-layout', handleLayoutResize)
  cleanupPlot()
})

onMounted(() => {
  window.addEventListener('datavis-layout', handleLayoutResize)
})
</script>

<style scoped>
.v-card-text {
  padding: 0;
}

.plotly-chart {
  flex: 1;
  min-height: 0;
  width: 100%;
}

.plot-toolbar {
  padding: 0;
}

.plot-shell {
  display: flex;
  flex-direction: column;
  gap: 0;
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
}

.plot-window {
  flex: 1;
  min-height: 0;
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
</style>
