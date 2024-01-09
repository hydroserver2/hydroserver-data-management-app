<template>
  <v-card class="mb-6" elevation="2">
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <v-combobox
            density="comfortable"
            v-model="formKey"
            :items="keyList"
            label="Key"
            clearable
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
            clearable
            hide-details
          >
            <template v-slot:append>
              <v-btn-cancel @click="clear" class="mr-2">Clear </v-btn-cancel>
              <v-btn @click="filter">Filter</v-btn>
            </template>
          </v-combobox>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-text>
      <v-switch
        v-model="currentColor"
        @change="updateColors"
        color="primary"
        label="Color Map Markers by Filter"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useUserTags } from '@/composables/useUserTags'
import { ref, watch } from 'vue'

const { formKey, formValue, keyList, valueList } = useUserTags()

const emit = defineEmits(['filter', 'update:useColors'])
const props = defineProps({
  useColors: Boolean,
})
const currentColor = ref(props.useColors)

const updateColors = () => {
  emit('update:useColors', currentColor)
  filter()
}

const filter = () => {
  emit('filter', { key: formKey.value, value: formValue.value })
}

const clear = () => {
  formKey.value = ''
  formValue.value = ''
  filter()
}
</script>
