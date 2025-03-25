<template>
  <v-card class="mt-4" color="green-darken-4" variant="outlined" rounded="lg">
    <v-toolbar color="green">
      <v-card-title>Transformer configurations</v-card-title>
      <v-spacer />
      <v-select
        class="mx-4"
        v-model="transformer.type"
        :items="allowedOptions"
        label="Type"
        density="compact"
        rounded="lg"
        prepend-inner-icon="mdi-web"
        hide-details
        max-width="250px"
        variant="outlined"
      />
    </v-toolbar>

    <component v-if="currentForm" :is="currentForm" />
  </v-card>
</template>

<script setup lang="ts">
import JSONTransformerForm from './JSONTransformerForm.vue'
import { computed } from 'vue'
import { useETLStore } from '@/store/etl'
import { storeToRefs } from 'pinia'
import CSVTransformerForm from './CSVTransformerForm.vue'
import { TRANSFORMER_OPTIONS } from '@/models/dataSource'

const { transformer, dataSource } = storeToRefs(useETLStore())

const formComponents = {
  JSON: JSONTransformerForm,
  CSV: CSVTransformerForm,
} as any

const allowedOptions = computed(() => {
  return dataSource.value.etlConfigurationSettings.type === 'SDL'
    ? ['CSV']
    : TRANSFORMER_OPTIONS
})

const currentForm = computed(
  () => formComponents[transformer.value.type] || null
)
</script>
