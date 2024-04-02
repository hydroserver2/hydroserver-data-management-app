<template>
  <v-row align="center" class="my-1">
    <v-col col="auto">
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
    </v-col>

    <v-col cols="6" sm="3">
      <DatePickerField
        :model-value="beginDate"
        placeholder="Begin Date"
        @update:model-value="handleCustomDateSelection('begin', $event)"
      />
    </v-col>
    <v-col cols="6" sm="3">
      <DatePickerField
        :model-value="endDate"
        placeholder="End Date"
        @update:model-value="handleCustomDateSelection('end', $event)"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import DatePickerField from '@/components/VisualizeData/DatePickerField.vue'
import { useDataVisStore } from '@/store/dataVisualization'
import { storeToRefs } from 'pinia'

const { setDateRange } = useDataVisStore()

const { dateOptions, beginDate, endDate, selectedDateBtnId } = storeToRefs(
  useDataVisStore()
)

const handleCustomDateSelection = (type: 'begin' | 'end', date: Date) => {
  if (type === 'begin') beginDate.value = date
  else endDate.value = date
  selectedDateBtnId.value = -1
}
</script>
