<template>
  <v-col cols="12" md="6">
    <v-combobox
      density="comfortable"
      v-model="formKey"
      :items="keyList"
      label="Key"
      hide-details
    >
      <template v-slot:prepend>
        <h6 class="text-h6">Filter Sites</h6>
      </template>
    </v-combobox>
  </v-col>
  <v-col cols="12" md="6">
    <v-combobox
      density="comfortable"
      v-model="formValue"
      :items="valueList"
      label="Value"
      hide-details
    >
      <template v-slot:append>
        <v-btn-cancel @click="clear" class="mr-2">Clear </v-btn-cancel>
        <v-btn @click="filter">Filter</v-btn>
      </template>
    </v-combobox>
  </v-col>
</template>

<script setup lang="ts">
import { useUserTags } from '@/composables/useUserTags'

const { formKey, formValue, keyList, valueList } = useUserTags()

const emit = defineEmits(['filter'])

const filter = () => {
  emit('filter', { key: formKey.value, value: formValue.value })
}

const clear = () => {
  formKey.value = ''
  formValue.value = ''
  filter()
}
</script>
