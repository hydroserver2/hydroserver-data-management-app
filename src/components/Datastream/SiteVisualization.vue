<template>
  <v-card class="elevation-5">
    <v-row>
      <v-col>
        <h5 class="text-h5 pt-2 text-center">
          Datastream for {{ thing?.name }}
        </h5>
      </v-col>
      <v-col cols="auto">
        <v-btn class="pt-2 pr-2" icon @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <div ref="focusChart"></div>
    <div ref="contextChart"></div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useDatastream } from '@/composables/useDatastream'
import { useThing } from '@/composables/useThing'
import { focus, context } from '@/utils/FocusContextPlot'

const props = defineProps({
  thingId: {
    type: String,
    required: true,
  },
  datastreamId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close'])

const { thing } = useThing(props.thingId)
const { datastream, observations } = useDatastream(
  props.thingId,
  props.datastreamId
)

let focusChart = ref<any>(null)
let contextChart = ref<any>(null)

const data = observations.value.map((observation) => ({
  date: new Date(observation.phenomenonTime),
  value: Number(observation.result),
})) as any

watchEffect(drawPlot)

function drawPlot() {
  if (focusChart.value) {
    const unitSymbol = datastream.value.unitSymbol
      ? `(${datastream.value.unitSymbol})`
      : ''

    const yAxisLabel = datastream.value
      ? `${datastream.value.observedPropertyName} ${unitSymbol} `
      : ''

    const focusSVG = focus(data, yAxisLabel)
    focusChart.value.appendChild(focusSVG)
  }
  if (contextChart.value) {
    const contextSVG = context(data, 1000)
    contextChart.value.appendChild(contextSVG)
  }
}
</script>
