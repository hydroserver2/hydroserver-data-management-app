<template>
  <TSAFiltersDrawer />

  <div class="my-4 mx-4">
    <div v-if="selectedDatastreams.length">
      <MultiAxisFocusContextPlot
        :datastreams="selectedDatastreams"
        :begin-date="beginDate"
        :end-date="endDate"
      />

      <v-row class="mt-4" align="center">
        <v-col>
          <div v-for="(key, index) in legendNames">
            <v-chip
              :color="EChartsColors[index % EChartsColors.length]"
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
    </div>

    <TSADatasetsTable />
  </div>
</template>

<script setup lang="ts">
import TSAFiltersDrawer from '@/components/TimeSeriesAnalyst/TSAFiltersDrawer.vue'
import TSADatasetsTable from '@/components/TimeSeriesAnalyst/TSADatasetsTable.vue'
import MultiAxisFocusContextPlot from '@/components/TimeSeriesAnalyst/MultiAxisFocusContextPlot.vue'
import { EChartsColors } from '@/utils/materialColors'
import { onMounted, computed } from 'vue'
import { api } from '@/services/api'
import { useTSAStore } from '@/store/timeSeriesAnalyst'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

const route = useRoute()
const thingId = route.params.thingId?.toString() || ''

const {
  things,
  selectedThings,
  processingLevels,
  observedProperties,
  selectedDatastreams,
  datastreams,
  beginDate,
  endDate,
} = storeToRefs(useTSAStore())

const legendNames = computed(() =>
  selectedDatastreams.value.map((ds) => ds.name)
)

onMounted(async () => {
  things.value = await api.fetchThings()
  if (thingId) {
    const foundThing = things.value.find((thing) => thing.id === thingId)
    if (foundThing) selectedThings.value = [foundThing]
  }
  datastreams.value = await api.fetchDatastreams()
  // TODO: How do we get the processing levels that don't belong to the user? There will be multiple 'Raw Data' variations
  processingLevels.value = await api.fetchOwnedProcessingLevels()
  // TODO: Similarly, there will be duplicates of observed properties between users
  observedProperties.value = await api.fetchOwnedObservedProperties()
})
</script>
