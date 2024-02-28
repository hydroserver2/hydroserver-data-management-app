<template>
  <v-card class="elevation-1" :loading="false">
    <template v-slot:loader="{ isActive }">
      <v-progress-linear color="primary" :active="isActive" indeterminate />
    </template>

    <v-card-text>
      <div ref="focusChart"></div>
      <div ref="contextChart"></div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, PropType, watch } from 'vue'
import { focus, context } from '@/utils/MultiAxisFocusContextPlot'
import { DataPoint, Datastream } from '@/types'
import { fetchObservations, preProcessData } from '@/utils/observationsUtils'
import { api } from '@/services/api'
import { GraphSeries } from '@/types'

const graphSeriesArray = ref<GraphSeries[]>([])

const props = defineProps({
  datastreams: {
    type: Array as PropType<Datastream[]>,
    required: true,
  },
  beginDate: Date,
  endDate: Date,
})

let focusChart = ref<any>(null)
let contextChart = ref<any>(null)

function renderPlot() {
  if (focusChart.value) {
    const focusSVG = focus(graphSeriesArray.value)
    focusChart.value.innerHTML = ''
    focusChart.value.appendChild(focusSVG)
  }
  if (contextChart.value) {
    // const contextSVG = context(data)
    // contextChart.value.innerHTML = ''
    // contextChart.value.appendChild(contextSVG)
  }
}

const updateState = async (
  datastreams: Datastream[],
  beginDate: Date,
  endDate: Date
) => {
  // TODO: Only fetch data we don't already have

  const start = beginDate.toISOString()
  const end = endDate.toISOString()

  // Fetch observations, units and processing levels
  // TODO: Use fetchObservationsParallel
  // TODO: Make sure this returns the true date range and not the last 6 months of data each set has
  const updatedGraphSeries: GraphSeries[] = await Promise.all(
    datastreams.map(async (ds) => {
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

      // TODO: Assign Colors
      const lineColor = '#2196F3'

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
  () => props.datastreams,
  async () => {
    if (props.beginDate && props.endDate && props.datastreams.length) {
      await updateState(props.datastreams, props.beginDate, props.endDate)
      renderPlot()
    }
  },
  { deep: true }
)
</script>
