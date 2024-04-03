<template>
  <v-card class="elevation-1" :loading="updating">
    <template v-slot:loader="{ isActive }">
      <v-progress-linear color="primary" :active="isActive" indeterminate />
    </template>

    <div v-if="showSummaryStatistics">
      <SummaryStatisticsTable />
    </div>

    <keep-alive>
      <v-card-text v-if="option && !showSummaryStatistics">
        <v-chart
          :option="option"
          @datazoom="handleDataZoom"
          autoresize
          style="height: 600px"
        />
      </v-card-text>
    </keep-alive>

    <div v-if="!option && !showSummaryStatistics" style="min-height: 632px">
      <v-card-title> Data Visualization </v-card-title>
      <v-card-text>
        <v-timeline align="start" density="compact">
          <v-timeline-item size="x-small" dot-color="primary">
            <div>
              <strong> Filter: </strong>
            </div>
            <div>
              Filter the dataset table items with the filter drawer on the left
              and the search bar on the top of the datasets table.
            </div>
          </v-timeline-item>
          <v-timeline-item size="x-small" dot-color="secondary">
            <div>
              <strong> Adjust the time range: </strong>
            </div>
            <div>
              Adjust the time range to cover the desired period you wish to
              observe. (Note: if a dataset has no data within the time range,
              the legend and axes will display but no data will be shown)
            </div>
          </v-timeline-item>
          <v-timeline-item size="x-small" dot-color="blue-grey">
            <div>
              <strong> Select up to 5 datasets: </strong>
            </div>
            <div>
              The plot allows up to 5 datasets to be shown at once. If two
              datasets share the same observed property and unit, they'll share
              a y-axis.
            </div>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, PropType, watch, computed } from 'vue'
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

const graphSeriesArray = ref<GraphSeries[]>([])
const option = ref<EChartsOption | undefined>()
// State to track loading status of individual datasets
const loadingStates = ref(new Map<string, boolean>())
// the overall updating state based on individual loading states
const updating = computed(() => {
  return Array.from(loadingStates.value.values()).some((isLoading) => isLoading)
})

const props = defineProps({
  datastreams: {
    type: Array as PropType<Datastream[]>,
    required: true,
  },
  beginDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
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
      newBeginDate.getTime() === oldBeginDate?.getTime() ||
      newEndDate.getTime() === oldEndDate?.getTime()
    )
      return
    clearState()
    if (!newBeginDate || !newEndDate || !props.datastreams.length) return
    updateDatasets(props.datastreams)
  },
  { deep: true }
)
</script>
