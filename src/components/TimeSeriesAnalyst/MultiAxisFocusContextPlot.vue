<template>
  <v-card class="elevation-1" :loading="false">
    <template v-slot:loader="{ isActive }">
      <v-progress-linear color="primary" :active="isActive" indeterminate />
    </template>

    <v-card-text>
      <vue-echarts :option="option" style="height: 600px" ref="chart" />
    </v-card-text>
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
