<template>
  <TSAFiltersDrawer />

  <div class="my-4 mx-4">
    <!-- <div v-if="selectedDatastreams.length"> -->
    <MultiAxisFocusContextPlot
      :datastreams="selectedDatastreams"
      :begin-date="beginDate"
      :end-date="endDate"
    />

    <v-row class="mt-4" align="center">
      <v-col>
        <div v-for="(key, index) in legendNames">
          <v-chip
            :color="materialColorsHex[index]"
            class="mr-2"
            variant="elevated"
            density="compact"
          />
          <span>{{ key }}</span>
        </div>
      </v-col>

      <v-col cols="auto">
        <v-btn>Export as PNG</v-btn>
      </v-col>
    </v-row>

    <v-divider class="my-8" />
    <!-- </div> -->

    <TSADatasetsTable />
  </div>
</template>

<script setup lang="ts">
import TSAFiltersDrawer from '@/components/TimeSeriesAnalyst/TSAFiltersDrawer.vue'
import { Datastream } from '@/types'
import { computed, ref } from 'vue'
import { materialColorsHex } from '@/utils/materialColors'
import TSADatasetsTable from '@/components/TimeSeriesAnalyst/TSADatasetsTable.vue'
import MultiAxisFocusContextPlot from '@/components/TimeSeriesAnalyst/MultiAxisFocusContextPlot.vue'
import { onMounted } from 'vue'
import { api } from '@/services/api'

const selectedDatastreams = ref<Datastream[]>([])

const legendNames = computed(() => {
  return selectedDatastreams.value.map((ds) => ds.name)
})

// TODO: Clean up hardcoded data
const endDate = ref<Date>(new Date())
const beginDate = ref<Date>(new Date())
beginDate.value.setMonth(beginDate.value.getMonth() - 12)

onMounted(async () => {
  const miami_gaps = await api.fetchDatastream(
    '10ab62a4-1908-410c-91d2-2d99d6fec1e8'
  )

  const miami_50 = await api.fetchDatastream(
    '6db96e5d-2e50-412c-b64c-06371d63891e'
  )

  const miami_normal = await api.fetchDatastream(
    '4c8dfc06-6be5-4650-91e1-30b6d4463bcf'
  )

  selectedDatastreams.value = [miami_gaps, miami_normal]
})
</script>
