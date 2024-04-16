<template>
  <v-card class="elevation-0" :loading="updating">
    <template v-slot:loader="{ isActive }">
      <v-progress-linear color="primary" :active="isActive" indeterminate />
    </template>

    <div v-if="showSummaryStatistics">
      <SummaryStatisticsTable />
    </div>

    <keep-alive>
      <v-card-text v-if="option && !showSummaryStatistics && isDataAvailable">
        <v-chart
          ref="echartsRef"
          :option="option"
          @datazoom="handleDataZoom"
          autoresize
          :style="{ height: `${cardHeight}vh` }"
        />
      </v-card-text>
    </keep-alive>

    <div
      v-if="!isDataAvailable && !showSummaryStatistics"
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

      <v-card-text v-if="datastreams.length && !updating" class="text-center">
        <v-alert type="warning" dense>
          No data available for the selected date range. Please select a
          different date range to re-plot.
        </v-alert>
      </v-card-text>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, PropType, watch, computed, nextTick } from 'vue'
import { Datastream, GraphSeries } from '@/types'
import { EChartsOption } from 'echarts'
import 'echarts'
import VChart from 'vue-echarts'
import { EChartsColors } from '@/utils/materialColors'
import { createEChartsOption } from '@/utils/plotting/echarts'
import { calculateSummaryStatistics } from '@/utils/plotting/summaryStatisticUtils'
import { storeToRefs } from 'pinia'
import { useDataVisStore } from '@/store/dataVisualization'
import SummaryStatisticsTable from './SummaryStatisticsTable.vue'
import { fetchGraphSeries } from '@/utils/plotting/graphSeriesUtils'

const {
  showSummaryStatistics,
  summaryStatisticsArray,
  dataZoomStart,
  dataZoomEnd,
} = storeToRefs(useDataVisStore())

const echartsRef = ref<typeof VChart | null>(null)
const graphSeriesArray = ref<GraphSeries[]>([])
const option = ref<EChartsOption | undefined>()
const loadingStates = ref(new Map<string, boolean>()) // State to track loading status of individual datasets
const updating = computed(() => {
  return Array.from(loadingStates.value.values()).some((isLoading) => isLoading)
}) // the overall updating state based on individual loading states

const isDataAvailable = computed(() => {
  return graphSeriesArray.value.some(
    (series) => series.data && series.data.length > 0
  )
})

const props = defineProps({
  datastreams: {
    type: Array as PropType<Datastream[]>,
    required: true,
  },
  beginDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  cardHeight: { type: Number, required: true },
})

function updateVisualization() {
  graphSeriesArray.value.forEach((series, index) => {
    series.lineColor = EChartsColors[index % EChartsColors.length]
  })

  summaryStatisticsArray.value = calculateSummaryStatistics(
    graphSeriesArray.value
  )

  option.value = createEChartsOption(graphSeriesArray.value)
  prevIds.value = graphSeriesArray.value.map((series) => series.id)
}

function handleDataZoom(event: any) {
  let start, end

  if (event.batch && event.batch.length) {
    // Handle scroll wheel events
    start = event.batch[0].start
    end = event.batch[0].end
  } else if (event.start !== undefined && event.end !== undefined) {
    // Handle zoom box drag events
    start = event.start
    end = event.end
  } else {
    console.error('Unexpected event structure for dataZoom:', event)
    return
  }
  dataZoomStart.value = start
  dataZoomEnd.value = end
}

const prevIds = ref<string[]>([])

const updateDatasets = async (datastreams: Datastream[]) => {
  const currentIds = datastreams.map((ds) => ds.id)
  const newIds = currentIds.filter((id) => !prevIds.value.includes(id))
  const removedIds = prevIds.value.filter((id) => !currentIds.includes(id))

  // Remove old datasets & abort unresolved requests
  if (removedIds.length > 0) {
    graphSeriesArray.value = graphSeriesArray.value.filter(
      (series) => !removedIds.includes(series.id)
    )
    // TODO: Abort requests that haven't come back yet
    updateVisualization()
  }

  // fetch new datasets
  if (newIds.length > 0) {
    fetchDatasets(datastreams.filter((ds) => newIds.includes(ds.id)))
  }
}

const fetchDatasets = (datastreams: Datastream[]) => {
  datastreams.forEach((ds) => {
    loadingStates.value.set(ds.id, true)
    fetchGraphSeries(
      ds,
      props.beginDate.toISOString(),
      props.endDate.toISOString()
    )
      .then((newSeries) => {
        if (!props.datastreams.some((selectedDs) => selectedDs.id === ds.id)) {
          return
        }

        graphSeriesArray.value = graphSeriesArray.value.filter(
          (series) => series.id !== ds.id
        )

        graphSeriesArray.value.push(newSeries)
        updateVisualization()
      })
      .catch((error) => {
        console.error(`Failed to fetch dataset ${ds.id}:`, error)
      })
      .finally(() => {
        loadingStates.value.set(ds.id, false)
      })
  })
}

const clearState = () => {
  graphSeriesArray.value = []
  prevIds.value = []
  showSummaryStatistics.value = false
  option.value = undefined
}

let prevDatastreamIds = ''
watch(
  [() => props.datastreams],
  ([newDs]) => {
    const newDatastreamIds = JSON.stringify(newDs.map((ds) => ds.id).sort())

    if (!newDs.length || !props.beginDate || !props.endDate) {
      clearState()
    } else if (newDatastreamIds !== prevDatastreamIds) {
      updateDatasets(newDs)
    }
    prevDatastreamIds = newDatastreamIds
  },
  { deep: true, immediate: true }
)

watch(
  [() => props.beginDate, () => props.endDate],
  async ([newBeginDate, newEndDate], [oldBeginDate, oldEndDate]) => {
    if (
      newBeginDate.getTime() === oldBeginDate?.getTime() &&
      newEndDate.getTime() === oldEndDate?.getTime()
    )
      return
    clearState()
    if (!newBeginDate || !newEndDate || !props.datastreams.length) return
    updateDatasets(props.datastreams)
  },
  { deep: true }
)

watch([() => props.cardHeight], ([newHeight], [oldHeight]) => {
  if (Math.abs(newHeight - oldHeight) < 0.2) return
  nextTick(() => {
    if (echartsRef.value) echartsRef.value.resize()
  })
})
</script>

<style scoped>
.v-card-text {
  padding: 0;
}
</style>
