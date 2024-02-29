<template>
  <v-text-field
    :placeholder="placeholder"
    :value="formattedDate"
    readonly
    @click="showDatePicker = true"
    append-inner-icon="mdi-calendar"
    class="mb-2"
    hide-details
    density="compact"
  />

  <v-date-picker
    v-if="showDatePicker"
    v-model="localDate"
    @update:modelValue="dateSelected"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Date, required: true },
  placeholder: String,
})
const emit = defineEmits(['update:modelValue'])

const showDatePicker = ref(false)
const localDate = ref<Date>(props.modelValue)

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== localDate.value) {
      localDate.value = newValue
    }
  }
)

const dateSelected = (newDate: Date) => {
  localDate.value = newDate
  emit('update:modelValue', newDate)
  showDatePicker.value = false
}

const formattedDate = computed(() => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return new Date(localDate.value).toLocaleDateString(undefined, options)
})
</script>
