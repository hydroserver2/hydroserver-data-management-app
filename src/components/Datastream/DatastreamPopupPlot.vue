<template>
  <v-card :loading="updating">
    <template v-slot:loader="{ isActive }">
      <v-progress-linear color="primary" :active="isActive" indeterminate />
    </template>

    <v-card-title class="d-flex pt-4">
      <h5 class="flex-grow-1 pl-4 text-center text-h5">
        {{ datastream.name }}
      </h5>
      <v-icon :icon="mdiClose" @click="$emit('close')" />
    </v-card-title>

    <div ref="plotContainer" class="plotly-popup" />

    <v-card-actions class="my-3 d-flex justify-center">
      <v-btn
        v-for="selection in timeSelections"
        rounded
        :variant="selectedTime === selection.value ? 'outlined' : 'plain'"
        @click="updateState(selection.value)"
        >{{ selection.label }}</v-btn
      >
      <v-btn
        color="grey"
        :to="{
          name: 'VisualizeData',
          query: getDatastreamQueryParams(datastream),
        }"
      >
        Visualization Page
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { Datastream, GraphSeries } from '@hydroserver/client'
import { subtractHours } from '@/utils/observationsUtils'
import { createPlotlyOption, PlotlyOptions } from '@/utils/plotting/plotly'
import { onMounted, ref, nextTick, onBeforeUnmount } from 'vue'
import { useObservationStore } from '@/store/observations'
import { mdiClose } from '@mdi/js'
// @ts-ignore no type definitions
import Plotly from 'plotly.js-dist'

const { fetchGraphSeries } = useObservationStore()

const props = defineProps({
  datastream: {
    type: Object as () => Datastream,
    required: true,
  },
})
defineEmits(['close'])

const plotlyOptions = ref<PlotlyOptions | undefined>()
const graphSeries = ref<GraphSeries | undefined>()
const updating = ref(false)
const selectedTime = ref(72)
const endTime = ref(props.datastream.phenomenonEndTime!)
let beginTime = ref(subtractHours(endTime.value, selectedTime.value))
const plotContainer = ref<HTMLDivElement | null>(null)
const plotlyRef = ref<(HTMLDivElement & { [key: string]: any }) | null>(null)

const timeSelections = [
  { label: 'Last 72 Hours', value: 72 },
  { label: 'Last Week', value: 168 },
  { label: 'Last Month', value: 720 },
  { label: 'Last Year', value: 8760 },
]

type Query = {
  sites: string
  datastreams: string
  selectedDateBtnId?: number
  beginDate?: string
  endDate?: string
}

const getDatastreamQueryParams = (datastream: Datastream) => {
  let query: Query = {
    sites: datastream.thingId,
    datastreams: datastream.id,
  }

  if (selectedTime.value === 8760) query.selectedDateBtnId = 0
  else if (selectedTime.value === 720) query.selectedDateBtnId = 1
  else if (selectedTime.value === 168) query.selectedDateBtnId = 2
  else {
    query.beginDate = beginTime.value
    query.endDate = endTime.value
  }

  return query
}

const updateState = async (hours?: number) => {
  updating.value = true
  selectedTime.value = hours || 72
  beginTime.value = subtractHours(endTime.value, selectedTime.value)

  graphSeries.value = await fetchGraphSeries(
    props.datastream,
    beginTime.value,
    endTime.value
  )

  if (!graphSeries.value) {
    updating.value = false
    return
  }

  plotlyOptions.value = createPlotlyOption([graphSeries.value], {
    addLegend: false,
    addSummaryButton: false,
    showRangeSlider: true,
    title: props.datastream.name,
  })
  nextTick(() => {
    renderPlot()
  })
  updating.value = false
}

onMounted(async () => {
  await updateState()
})

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
  } else {
    await Plotly.react(plotlyRef.value, traces, layout, config)
  }
}

onBeforeUnmount(() => {
  if (plotlyRef.value) {
    Plotly.purge(plotlyRef.value)
  }
})
</script>

<style scoped>
.plotly-popup {
  height: 600px;
  width: 100%;
}
</style>
