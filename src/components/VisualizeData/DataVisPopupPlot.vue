<template>
  <v-card :loading="updating">
    <template v-slot:loader="{ isActive }">
      <v-progress-linear color="primary" :active="isActive" indeterminate />
    </template>

    <v-card-title class="d-flex pt-4">
      <h5 class="flex-grow-1 pl-4 text-center text-h5">
        {{ datastream.name }}
      </h5>
      <v-icon @click="$emit('close')">mdi-close</v-icon>
    </v-card-title>

    <v-chart :option="option" autoresize style="height: 600px" />

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
          query: {
            sites: datastream.thingId,
            datastreams: datastream.id,
            beginDate: beginTime,
            endDate: endTime,
          },
        }"
      >
        Visualization Page
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { Datastream, GraphSeries } from '@/types'
import { subtractHours } from '@/utils/observationsUtils'
import { createEChartsOption } from '@/utils/plotting/echarts'
import { fetchGraphSeries } from '@/utils/plotting/graphSeriesUtils'
import { EChartsOption } from 'echarts'
import { onMounted, ref } from 'vue'
import VChart from 'vue-echarts'
import 'echarts'

const props = defineProps({
  datastream: {
    type: Object as () => Datastream,
    required: true,
  },
})
const emit = defineEmits(['close'])

const option = ref<EChartsOption | undefined>()
const graphSeriesArray = ref<GraphSeries[]>([])
const updating = ref(false)
const selectedTime = ref(72)
const endTime = ref(props.datastream.phenomenonEndTime!)
let beginTime = ref(subtractHours(endTime.value, selectedTime.value))

const timeSelections = [
  { label: 'Last 72 Hours', value: 72 },
  { label: 'Last Week', value: 168 },
  { label: 'Last Month', value: 720 },
  { label: 'Last Year', value: 8760 },
]

const updateState = async (hours?: number) => {
  updating.value = true
  selectedTime.value = hours || 72
  beginTime.value = subtractHours(endTime.value, selectedTime.value)

  graphSeriesArray.value = await fetchGraphSeries(
    [props.datastream],
    beginTime.value,
    endTime.value
  )

  option.value = createEChartsOption(graphSeriesArray.value, {
    addLegend: false,
    addToolbox: false,
    initializeZoomed: false,
  })
  updating.value = false
}

onMounted(async () => {
  await updateState()
})
</script>
