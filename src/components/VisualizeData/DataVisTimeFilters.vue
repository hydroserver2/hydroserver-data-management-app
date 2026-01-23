<template>
  <div class="time-filters">
    <div class="date-fields">
      <DatePickerField
        :model-value="beginDate"
        placeholder="Begin Date"
        @update:model-value="setDateRange({ begin: $event })"
      />
      <DatePickerField
        :model-value="endDate"
        placeholder="End Date"
        @update:model-value="setDateRange({ end: $event })"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import DatePickerField from '@/components/VisualizeData/DatePickerField.vue'
import { useDataVisStore } from '@/store/dataVisualization'
import { storeToRefs } from 'pinia'

const { setDateRange } = useDataVisStore()

const { beginDate, endDate } = storeToRefs(useDataVisStore())
</script>

<style scoped>
.time-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 8px 8px 0;
}

.date-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.date-fields :deep(.v-input) {
  min-width: 160px;
}
</style>
