<template>
  <v-row align="center" class="my-1">
    <v-col col="auto">
      <v-btn
        v-for="option in dateOptions"
        :key="option.id"
        :color="
          selectedDateBtnId === option.id ? 'blue' : 'blue-grey-lighten-4'
        "
        @click="onDateBtnClick(option.id)"
      >
        {{ option.label }}
      </v-btn>
    </v-col>

    <v-col cols="6" sm="3">
      <DatePickerField
        :model-value="beginDate"
        placeholder="Begin Date"
        @update:model-value="setDateRange({ begin: $event })"
      />
    </v-col>
    <v-col cols="6" sm="3">
      <DatePickerField
        :model-value="endDate"
        placeholder="End Date"
        @update:model-value="setDateRange({ end: $event })"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import DatePickerField from '@/components/VisualizeData/DatePickerField.vue'
import { useDataVisStore } from '@/store/dataVisualization'
import { storeToRefs } from 'pinia'

const { setDateRange, onDateBtnClick } = useDataVisStore()

const { dateOptions, beginDate, endDate, selectedDateBtnId } = storeToRefs(
  useDataVisStore()
)
</script>
