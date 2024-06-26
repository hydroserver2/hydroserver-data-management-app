<template>
  <v-card-title>
    <div class="d-flex justify-space-between w-100">
      Summary Statistics
      <v-btn
        prepend-icon="mdi-arrow-left"
        color="blue-grey-lighten-4"
        @click="showSummaryStatistics = false"
        >Back to Plot</v-btn
      >
    </div>
  </v-card-title>
  <v-divider />

  <v-data-table density="compact" class="elevation-1">
    <tbody>
      <tr v-for="header in summaryStatsHeaders" :key="header.key">
        <td>{{ header.title }}</td>
        <td v-for="stats in summaryStatisticsArray">
          {{ formatNumber(stats[header.key as keyof SummaryStatistics]) }}
        </td>
      </tr>
    </tbody>
    <template v-slot:bottom></template>
  </v-data-table>
</template>

<script setup lang="ts">
import { SummaryStatistics } from '@/utils/plotting/summaryStatisticUtils'
import { storeToRefs } from 'pinia'
import { useDataVisStore } from '@/store/dataVisualization'

const { showSummaryStatistics, summaryStatisticsArray } = storeToRefs(
  useDataVisStore()
)

const formatNumber = (value: string | number): string => {
  if (typeof value === 'number') {
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
    return formatter.format(value)
  }

  return value?.toString()
}

const summaryStatsHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Maximum', key: 'maximum' },
  { title: 'Minimum', key: 'minimum' },
  { title: 'Arithmetic Mean', key: 'arithmeticMean' },
  { title: 'Standard Deviation', key: 'standardDeviation' },
  { title: 'Observations', key: 'observations' },
  { title: 'Coefficient of Variation', key: 'coefficientOfVariation' },
  { title: '10% Quantile', key: 'quantile10' },
  { title: '25% Quantile', key: 'quantile25' },
  { title: 'Median', key: 'median' },
  { title: '75% Quantile', key: 'quantile75' },
  { title: '90% Quantile', key: 'quantile90' },
]
</script>

<style scoped>
table th + th {
  border-left: 1px solid #dddddd;
}
table td + td {
  border-left: 1px solid #dddddd;
}
</style>
