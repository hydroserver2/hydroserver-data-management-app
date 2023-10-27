<template>
  <div ref="chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as Plot from '@observablehq/plot'
import * as d3 from 'd3'
import { PropType } from 'vue'
import { DataArray, DataPoint } from '@/types'

const props = defineProps({
  observations: {
    type: Array as PropType<DataArray>,
    required: true,
  },
  isStale: Boolean,
})

const chart = ref<HTMLDivElement | null>(null)

function drawChart() {
  if (!chart.value) return

  let colors = props.isStale
    ? { line: '#9E9E9E', fill: '#F5F5F5' } // Grey and grey-lighten-4
    : { line: '#4CAF50', fill: '#E8F5E9' } // Green and green-lighten-5

  const observations = props.observations.map((item: DataPoint) => {
    return {
      date: new Date(item.date),
      value: item.value,
    }
  })

  const [minY, maxY] = d3.extent(observations, (d) => d.value)

  const sparkline = Plot.plot({
    width: 250,
    height: 100,
    x: {
      grid: false,
      axis: null,
    },
    y: {
      domain: [minY, maxY],
      grid: false,
      axis: null,
    },
    marks: [
      Plot.areaY(observations, {
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

onMounted(() => {
  drawChart()
})
</script>
