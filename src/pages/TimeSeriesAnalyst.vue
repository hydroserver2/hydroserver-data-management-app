<template>
  <TSAFiltersDrawer
    @update:time-range="updateTimeRange"
    @update:selected-things="updateSelectedThings"
  />

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
    </div>

    <TSADatasetsTable
      :datastreams="filteredDatastreams"
      :things="selectedThings.length ? selectedThings : things"
      @update:selected-datastream-ids="updateSelectedDatastreamIds"
    />
  </div>
</template>

<script setup lang="ts">
import TSAFiltersDrawer from '@/components/TimeSeriesAnalyst/TSAFiltersDrawer.vue'
import { Datastream, Thing } from '@/types'
import { computed, ref } from 'vue'
import { materialColorsHex } from '@/utils/materialColors'
import TSADatasetsTable from '@/components/TimeSeriesAnalyst/TSADatasetsTable.vue'
import MultiAxisFocusContextPlot from '@/components/TimeSeriesAnalyst/MultiAxisFocusContextPlot.vue'
import { onMounted } from 'vue'
import { api } from '@/services/api'

const things = ref<Thing[]>([])

const beginDate = ref<Date>(new Date())
const endDate = ref<Date>(new Date())
const filteredDatastreams = ref<Datastream[]>([])
const datastreams = ref<Datastream[]>([])
// const selectedDatastreams = ref<Datastream[]>([])
const selectedDatastreams = computed(() => {
  return datastreams.value.filter((ds) =>
    selectedDatastreamIds.value.includes(ds.id)
  )
})

// TODO: This may need to be a prop instead since we want to avoid filtering datastreams rows off the table
//       while having them still selected
const selectedDatastreamIds = ref<string[]>([])

const selectedThings = ref<Thing[]>([])
const selectedObservedPropertyIDs = ref<string[]>([])
const selectedQualityControlLevelIDs = ref<string[]>([])

const updateSelectedThings = (updatedThings: Thing[]) => {
  selectedThings.value = [...updatedThings]

  if (!updatedThings.length) {
    filteredDatastreams.value = [...datastreams.value]
  } else {
    const selectedThingIds = updatedThings.map((thing) => thing.id)
    filteredDatastreams.value = datastreams.value.filter((d) =>
      selectedThingIds.includes(d.thingId)
    )
  }
}

const legendNames = computed(() =>
  selectedDatastreams.value.map((ds) => ds.name)
)

const updateSelectedDatastreamIds = (ids: string[]) => {
  selectedDatastreamIds.value = [...ids]
}

interface DateRange {
  beginDate: Date
  endDate: Date
}

const updateTimeRange = ({
  beginDate: newBeginDate,
  endDate: newEndDate,
}: DateRange) => {
  beginDate.value = new Date(newBeginDate)
  endDate.value = new Date(newEndDate)
}

// TODO: Clean up hardcoded data
beginDate.value.setMonth(beginDate.value.getMonth() - 12)

onMounted(async () => {
  things.value = await api.fetchThings()
  datastreams.value = await api.fetchDatastreams()
  filteredDatastreams.value = [...datastreams.value]
})
</script>
