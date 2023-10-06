<template>
  <div ref="chart"></div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import * as Plot from '@observablehq/plot'
import { PropType } from 'vue'
import { DataArray } from '@/types'

const props = defineProps({
  observations: {
    type: Array as PropType<DataArray>,
    required: true,
  },
  isStale: Boolean,
})

const chart = ref<HTMLDivElement | null>(null)

watchEffect(drawChart)

function drawChart() {
  if (!chart.value) return

  let colors = props.isStale
    ? { line: '#9E9E9E', fill: '#F5F5F5' } // Grey and grey-lighten-4
    : { line: '#4CAF50', fill: '#E8F5E9' } // Green and green-lighten-5

  const sparkline = Plot.plot({
    width: 250,
    height: 100,
    x: {
      grid: false,
      axis: null,
    },
    y: {
      grid: false,
      axis: null,
    },
    marks: [
      Plot.areaY(props.observations, {
        x: 'date',
        y: 'value',
        stroke: colors.line,
        fill: colors.fill,
      }),
      Plot.frame({
        stroke: 'grey',
      }),
    ],
  })

  chart.value.innerHTML = ''
  chart.value.appendChild(sparkline)
}
</script>
