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
      <v-card-title> Time Series Analyst </v-card-title>
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
import { ref, PropType, watch } from 'vue'
import { Datastream } from '@/types'
import { preProcessData } from '@/utils/observationsUtils'
import { api } from '@/services/api'
import { GraphSeries } from '@/types'
import { EChartsOption } from 'echarts'
import 'echarts'
import VChart from 'vue-echarts'
import { EChartsColors } from '@/utils/materialColors'
import { createEChartsOption } from '@/utils/plotting/echarts'
import { calculateSummaryStatistics } from '@/utils/plotting/summaryStatisticUtils'
import { storeToRefs } from 'pinia'
import { useTSAStore } from '@/store/timeSeriesAnalyst'
import SummaryStatisticsTable from './SummaryStatisticsTable.vue'
import { useObservationStore } from '@/store/observations'

const { fetchObservationsInRange } = useObservationStore()
const {
  showSummaryStatistics,
  summaryStatisticsArray,
  dataZoomStart,
  dataZoomEnd,
} = storeToRefs(useTSAStore())

const graphSeriesArray = ref<GraphSeries[]>([])
const option = ref<EChartsOption | undefined>()

const props = defineProps({
  datastreams: {
    type: Array as PropType<Datastream[]>,
    required: true,
  },
  beginDate: Date,
  endDate: Date,
})

function renderPlot() {
  option.value = createEChartsOption(graphSeriesArray.value)
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

const fetchGraphSeries = async (
  datastreams: Datastream[],
  start: string,
  end: string
) => {
  const updatedGraphSeries: GraphSeries[] = await Promise.all(
    datastreams.map(async (ds, index) => {
      const observationsPromise = fetchObservationsInRange(ds, start, end)
      const fetchUnitPromise = api.getUnit(ds.unitId).catch((error) => {
        console.error('Failed to fetch Unit:', error)
        return null
      })
      const fetchObservedPropertyPromise = api
        .fetchObservedProperty(ds.observedPropertyId)
        .catch((error) => {
          console.error('Failed to fetch ObservedProperty:', error)
          return null
        })

      const [observations, unit, observedProperty] = await Promise.all([
        observationsPromise,
        fetchUnitPromise,
        fetchObservedPropertyPromise,
      ])

      const processedData = preProcessData(observations, ds)

      const yAxisLabel =
        observedProperty && unit
          ? `${observedProperty.name} (${unit.symbol})`
          : 'Unknown'

      const lineColor = EChartsColors[index % EChartsColors.length]

      return {
        id: ds.id,
        name: ds.name,
        data: processedData,
        yAxisLabel,
        lineColor,
      }
    })
  )

  return updatedGraphSeries
}

const prevDatastreamIds = ref<string[]>([])
const prevBeginDate = ref<string>('')
const prevEndDate = ref<string>('')

const updateState = async (
  datastreams: Datastream[],
  beginDate: Date,
  endDate: Date
) => {
  updating.value = true
  const start = beginDate.toISOString()
  const end = endDate.toISOString()

  const isDateRangeChanged =
    prevBeginDate.value !== start || prevEndDate.value !== end

  // Identify new and removed datastreams
  const currentIds = datastreams.map((ds) => ds.id)

  const newIds = currentIds.filter(
    (id) => !prevDatastreamIds.value.includes(id)
  )
  const removedIds = prevDatastreamIds.value.filter(
    (id) => !currentIds.includes(id)
  )

  // Directly remove graph series for datastreams that have been removed
  if (removedIds.length > 0) {
    graphSeriesArray.value = graphSeriesArray.value.filter(
      (series) => !removedIds.includes(series.id)
    )
  }

  // Determine if there are any new datastreams or if the date range has changed, requiring data fetching
  if (newIds.length > 0 || isDateRangeChanged) {
    const datastreamsToFetch = isDateRangeChanged
      ? datastreams
      : datastreams.filter((ds) => newIds.includes(ds.id))

    const newSeriesArray = await fetchGraphSeries(
      datastreamsToFetch,
      start,
      end
    )

    // If the date range has changed, replace all series. Otherwise, append new series.
    if (isDateRangeChanged) {
      graphSeriesArray.value = newSeriesArray
    } else {
      // Remove any existing series that match the new ones to avoid duplicates
      graphSeriesArray.value = graphSeriesArray.value.filter(
        (series) => !newIds.includes(series.id)
      )
      graphSeriesArray.value.push(...newSeriesArray)
    }
  }

  // update colors
  graphSeriesArray.value.forEach((series, index) => {
    series.lineColor = EChartsColors[index % EChartsColors.length]
  })

  console.log('graphSeriesArray', graphSeriesArray.value)
  summaryStatisticsArray.value = calculateSummaryStatistics(
    graphSeriesArray.value
  )

  prevBeginDate.value = start
  prevEndDate.value = end
  prevDatastreamIds.value = currentIds
  updating.value = false
}

const clearState = () => {
  graphSeriesArray.value = []
  prevDatastreamIds.value = []
  showSummaryStatistics.value = false
  option.value = undefined
}

const updating = ref(false)

watch(
  [() => props.datastreams, () => props.beginDate, () => props.endDate],
  async ([newDatastreams, newBeginDate, newEndDate]) => {
    if (!newBeginDate || !newEndDate || !newDatastreams.length) {
      clearState()
    } else if (!updating.value) {
      await updateState(newDatastreams, newBeginDate, newEndDate)
      renderPlot()
    }
  },
  { deep: true, immediate: true }
)
</script>
