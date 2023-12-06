<template>
  <v-col cols="2">
    <v-combobox
      density="comfortable"
      v-model="formKey"
      :items="keyList"
      label="Key"
    >
      <template v-slot:prepend>
        <h6 class="text-h6">Filter by tags</h6>
      </template>
    </v-combobox>
  </v-col>
  <v-col cols="3">
    <v-combobox
      density="comfortable"
      v-model="formValue"
      :items="valueList"
      label="Value"
    >
      <template v-slot:append>
        <v-btn @click="filter" class="mr-2">Filter</v-btn>
        <v-btn-cancel @click="clear">Clear </v-btn-cancel>
      </template>
    </v-combobox>
  </v-col>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const formKey = ref('')
const formValue = ref('')
const keyList = ref(['commissioner', '2'])
const valueList = ref([])

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
