<template>
  <v-row align="center" class="my-1">
    <v-col col="auto">
      <v-btn-toggle
        v-model="selectedDateBtnId"
        variant="outlined"
        density="compact"
        color="primary"
        divided
        rounded="xl"
      >
        <v-tooltip bottom :openDelay="1000" v-for="option in dateOptions">
          <template v-slot:activator="{ props }">
            <v-btn
              :label="option.label"
              @click="onDateBtnClick(option.id)"
              v-bind:="props"
            >
              <p>{{ option.label }}</p>
            </v-btn>
          </template>
          {{ option.label }}
        </v-tooltip>
      </v-btn-toggle>
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
