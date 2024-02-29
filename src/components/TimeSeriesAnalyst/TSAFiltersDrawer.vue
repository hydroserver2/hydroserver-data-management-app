<template>
  <v-navigation-drawer v-model="drawer" width="400">
    <v-card-title class="d-flex justify-space-between align-start">
      Filters
      <v-icon v-if="drawer" @click="drawer = !drawer">mdi-menu-open</v-icon>
    </v-card-title>

    <v-divider />

    <div class="d-flex justify-end my-4 mx-2">
      <v-btn color="blue-grey-lighten-4" elevation="3" @click="onClearFilters"
        >Clear Filters</v-btn
      >
    </div>

    <v-expansion-panels multiple v-model="panels">
      <v-expansion-panel title="Sites">
        <v-expansion-panel-text>
          <v-checkbox
            v-for="thing in things"
            v-model="selectedThings"
            :label="thing.name"
            :value="thing"
            hide-details
            density="compact"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel title="Time">
        <v-expansion-panel-text>
          <div class="d-flex justify-center mb-3">
            <v-btn
              v-for="option in dateOptions"
              :key="option.id"
              :color="
                selectedRangeId === option.id ? 'blue' : 'blue-grey-lighten-4'
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
          <v-checkbox
            label="Nitrate-N, Nitrogen, dissolved nitrate (NO3)"
            hide-details
            density="compact"
          />
          <v-checkbox
            label="fDOM, Colored Dissolved Organic Matter"
            hide-details
            density="compact"
          />
          <v-checkbox
            label="Chlorophyll, Chlorophyll Fluorescence"
            hide-details
            density="compact"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel title="Quality Control Level">
        <v-expansion-panel-text>
          <v-checkbox label="Raw Data" hide-details density="compact" />
          <v-checkbox
            label="Quality Controlled Data"
            hide-details
            density="compact"
          />
          <v-checkbox
            label="Double Quality Controlled Data"
            hide-details
            density="compact"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-navigation-drawer>

  <div class="mt-4 mx-4" v-if="!drawer">
    <v-icon @click="drawer = !drawer">mdi-menu</v-icon>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Ref } from 'vue'
import { Thing } from '@/types'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import { onMounted } from 'vue'
import { api } from '@/services/api'
import DatePickerField from '@/components/TimeSeriesAnalyst/DatePickerField.vue'

const emit = defineEmits(['update:timeRange'])

const { smAndDown } = useDisplay()
const panels = ref([0, 1, 2, 3])
const drawer = ref(!!smAndDown)

const selectedThings: Ref<string[]> = ref([])
const things = ref<Thing[]>([])

const endDate = ref<Date>(new Date())
const oneWeek = 7 * 24 * 60 * 60 * 1000
const beginDate = ref<Date>(new Date(endDate.value.getTime() - oneWeek))

const selectedRangeId = ref(2)
const dateOptions = [
  {
    id: 0,
    label: 'All',
    calculateBeginDate: () => new Date('1850-01-01'),
  },
  {
    id: 1,
    label: 'Last Month',
    calculateBeginDate: () => {
      const now = new Date()
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    },
  },
  {
    id: 2,
    label: 'Last Week',
    calculateBeginDate: () => {
      const now = new Date()
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    },
  },
]

const handleCustomDateSelection = (type: 'begin' | 'end', date: Date) => {
  if (type === 'begin') beginDate.value = date
  else endDate.value = date
  selectedRangeId.value = -1

  emit('update:timeRange', {
    beginDate: beginDate.value,
    endDate: endDate.value,
  })
}

const setDateRange = (selectedId: number) => {
  const selectedOption = dateOptions.find((option) => option.id === selectedId)
  if (selectedOption && selectedId !== selectedRangeId.value) {
    beginDate.value = selectedOption.calculateBeginDate()
    endDate.value = new Date()
    selectedRangeId.value = selectedId
    emit('update:timeRange', {
      beginDate: beginDate.value,
      endDate: endDate.value,
    })
  }
}

const onClearFilters = () => {}

onMounted(async () => {
  things.value = await api.fetchOwnedThings()
})
</script>
