<template>
  <TSAFiltersDrawer />

  <div class="my-4 mx-4">
    <FocusContextPlot :thing-name="'Temp'" :datastream="tempDS" />

    <v-row class="mt-4" align="center">
      <v-col>
        <div v-for="(key, index) in legendNames">
          <v-chip
            :color="materialColors[index]"
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

    <TSADatasetsTable />
  </div>
</template>

<script setup lang="ts">
import FocusContextPlot from '@/components/Datastream/FocusContextPlot.vue'
import TSAFiltersDrawer from '@/components/TimeSeriesAnalyst/TSAFiltersDrawer.vue'
import { Datastream } from '@/types'
import { ref } from 'vue'
import { materialColors } from '@/utils/materialColors'
import TSADatasetsTable from '@/components/TimeSeriesAnalyst/TSADatasetsTable.vue'

const tempDS = ref<Datastream>(new Datastream())

const legendNames = ref<string[]>([
  'abs254_SUNA: Absorbance LR_Mendon_AA: Logan River at Mendon Road (600 South) Raw Data',
  'Datastream 2',
  'Datastream 3',
  'Datastream 4',
  'Datastream 5',
])
</script>
