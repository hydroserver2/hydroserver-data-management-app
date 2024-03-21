<template>
  <v-navigation-drawer v-model="drawer" width="400">
    <v-card-title class="d-flex justify-space-between align-start">
      Filters
      <v-icon v-if="drawer" @click="drawer = !drawer">mdi-menu-open</v-icon>
    </v-card-title>

    <v-divider />

    <div class="d-flex justify-end my-4 mx-2">
      <v-btn color="blue-grey-lighten-4" elevation="3" @click="clearFilters"
        >Clear Filters</v-btn
      >
    </div>

    <v-expansion-panels multiple v-model="panels">
      <v-expansion-panel title="Sites">
        <v-expansion-panel-text>
          <v-virtual-scroll
            :items="sortedThings"
            :height="sortedThings.length < 6 ? sortedThings.length * 40 : 250"
          >
            <template #default="{ item, index }">
              <v-checkbox
                :key="item.id"
                v-model="selectedThings"
                :label="item.name"
                :value="item"
                hide-details
                density="compact"
              />
            </template>
          </v-virtual-scroll>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel title="Time">
        <v-expansion-panel-text>
          <div class="d-flex justify-center mb-3">
            <v-btn
              v-for="option in dateOptions"
              :key="option.id"
              :color="
                selectedDateBtnId === option.id ? 'blue' : 'blue-grey-lighten-4'
              "
              @click="setDateRange(option.id)"
            >
              {{ option.label }}
            </v-btn>
          </div>

          <DatePickerField
            :model-value="beginDate"
            placeholder="Begin Date"
            @update:model-value="handleCustomDateSelection('begin', $event)"
          />
          <DatePickerField
            :model-value="endDate"
            placeholder="End Date"
            @update:model-value="handleCustomDateSelection('end', $event)"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel title="Observed Properties">
        <v-expansion-panel-text>
          <v-virtual-scroll
            :items="sortedObservedPropertyNames"
            :height="
              sortedObservedPropertyNames.length < 6
                ? sortedObservedPropertyNames.length * 40
                : 250
            "
          >
            <template #default="{ item }">
              <v-checkbox
                v-model="selectedObservedPropertyNames"
                :label="item"
                :value="item"
                hide-details
                density="compact"
              />
            </template>
          </v-virtual-scroll>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel title="Quality Control Level">
        <v-expansion-panel-text>
          <v-virtual-scroll
            :items="sortedProcessingLevelNames"
            :height="
              sortedProcessingLevelNames.length < 6
                ? sortedProcessingLevelNames.length * 40
                : 250
            "
          >
            <template #default="{ item }">
              <v-checkbox
                v-model="selectedProcessingLevelNames"
                :label="item"
                :value="item"
                hide-details
                density="compact"
              />
            </template>
          </v-virtual-scroll>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-navigation-drawer>

  <div class="mt-4 mx-4" v-if="!drawer">
    <v-icon @click="drawer = !drawer">mdi-menu</v-icon>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import DatePickerField from '@/components/TimeSeriesAnalyst/DatePickerField.vue'
import { useTSAStore } from '@/store/timeSeriesAnalyst'
import { storeToRefs } from 'pinia'

const { clearFilters, setDateRange } = useTSAStore()
const {
  things,
  processingLevels,
  observedProperties,
  selectedThings,
  selectedObservedPropertyNames,
  selectedProcessingLevelNames,
  beginDate,
  endDate,
  dateOptions,
  selectedDateBtnId,
} = storeToRefs(useTSAStore())

const sortedProcessingLevelNames = computed(() => {
  const names = processingLevels.value.map((pl) => pl.definition)
  return [...new Set(names)].sort()
})

const sortedThings = computed(() => {
  return things.value.slice().sort((a, b) => {
    return a.name.localeCompare(b.name)
  })
})

const sortedObservedPropertyNames = computed(() => {
  const names = observedProperties.value.map((pl) => pl.name)
  return [...new Set(names)].sort()
})

const { smAndDown } = useDisplay()
const panels = ref([0, 1, 2, 3])
const drawer = ref(!!smAndDown)

const handleCustomDateSelection = (type: 'begin' | 'end', date: Date) => {
  if (type === 'begin') beginDate.value = date
  else endDate.value = date
  selectedDateBtnId.value = -1
}
</script>
