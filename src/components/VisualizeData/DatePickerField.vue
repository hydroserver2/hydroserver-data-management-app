<template>
  <v-text-field
    :placeholder="placeholder"
    v-model="inputDate"
    @blur="handleBlur"
    append-inner-icon="mdi-calendar-blank"
    @click:append-inner="toggleDatePicker"
    hide-details
    density="compact"
  />

  <v-dialog v-model="showDatePicker" max-width="22rem">
    <v-card>
      <v-card-title class="d-flex pt-4">
        Select {{ placeholder }}
        <v-spacer />
        <v-icon color="grey-darken-1" @click="showDatePicker = false">
          mdi-close
        </v-icon>
      </v-card-title>
      <v-divider />
      <v-date-picker
        hide-header
        v-model="localDate"
        @update:modelValue="dateSelected"
      />
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Date, required: true },
  placeholder: String,
})
const emit = defineEmits(['update:modelValue'])

const showDatePicker = ref(false)
const localDate = ref<Date>(props.modelValue)
const inputDate = ref(localDate.value.toLocaleDateString('en-US'))

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== localDate.value) {
      localDate.value = newValue
      inputDate.value = newValue.toLocaleDateString('en-US')
    }
  }
)

const dateSelected = (newDate: Date) => {
  localDate.value = newDate
  inputDate.value = newDate.toLocaleDateString('en-US')
  emit('update:modelValue', newDate)
  showDatePicker.value = false
}

const handleBlur = () => {
  if (inputDate.value === props.modelValue.toLocaleDateString('en-US')) return
  const parts = inputDate.value.split('/')
  try {
    const newDate = new Date(+parts[2], +parts[0] - 1, +parts[1])
    if (!isNaN(newDate.getTime())) {
      localDate.value = newDate
      emit('update:modelValue', newDate)
    } else {
      inputDate.value = localDate.value.toLocaleDateString('en-US')
    }
  } catch (e) {
    inputDate.value = localDate.value.toLocaleDateString('en-US')
  }
}

const toggleDatePicker = () => {
  showDatePicker.value = !showDatePicker.value
}
</script>
