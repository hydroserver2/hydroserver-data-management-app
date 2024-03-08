<template>
  <v-card class="elevation-1" :loading="false">
    <template v-slot:loader="{ isActive }">
      <v-progress-linear color="primary" :active="isActive" indeterminate />
    </template>

    <v-card-text v-if="option">
      <vue-echarts :option="option" style="height: 600px" ref="chart" />
    </v-card-text>
    <div v-else style="min-height: 632px">
      <v-img
        class="text-white"
        height="300"
        src="https://cdn.vuetifyjs.com/docs/images/cards/purple-flowers.jpg"
        cover
      >
        <v-card-title> Time Series Analyst </v-card-title>
      </v-img>
      <v-card-text>
        <!-- <div class="font-weight-bold ms-1 mb-2">Today</div> -->

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
import { fetchObservations, preProcessData } from '@/utils/observationsUtils'
import { api } from '@/services/api'
import { GraphSeries } from '@/types'
import { EChartsColors } from '@/utils/materialColors'
import { VueEcharts } from 'vue3-echarts'
import { EChartsOption } from 'echarts'
import { createEChartsOption } from '@/utils/echarts'

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

const updateState = async (
  datastreams: Datastream[],
  beginDate: Date,
  endDate: Date
) => {
  const start = beginDate.toISOString()
  const end = endDate.toISOString()

  // Fetch observations, units and processing levels
  // TODO: Use fetchObservationsParallel
  // TODO: Only fetch data we don't already have
  const updatedGraphSeries: GraphSeries[] = await Promise.all(
    datastreams.map(async (ds, index) => {
      const observationsPromise = fetchObservations(ds.id, start, end)
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
        data: processedData,
        yAxisLabel,
        lineColor,
      }
    })
  )

  graphSeriesArray.value = updatedGraphSeries

  console.log('graphSeriesArray', graphSeriesArray.value)
}

watch(
  [() => props.datastreams, () => props.beginDate, () => props.endDate],
  async ([newDatastreams, newBeginDate, newEndDate]) => {
    if (!newBeginDate || !newEndDate || !newDatastreams.length) return
    await updateState(newDatastreams, newBeginDate, newEndDate)
    renderPlot()
  },
  { deep: true, immediate: true }
)
</script>
