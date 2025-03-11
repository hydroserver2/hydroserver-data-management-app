<template>
  <v-card class="mt-4" color="green-darken-4" variant="outlined" rounded="lg">
    <v-toolbar title="Transformer configurations" color="green"></v-toolbar>
    <v-card-text>
      <v-select
        v-model="transformerConfig.type"
        :items="types"
        label="Type"
        density="compact"
        rounded="lg"
        prepend-inner-icon="mdi-web"
      />
      <v-row>
        <v-col md="3">
          <v-text-field
            v-model="transformerConfig.timestamp_key"
            label="Timestamp key"
            density="compact"
            rounded="lg"
            prepend-inner-icon="mdi-table-column-width"
          />
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-text>
      <component v-if="currentForm" :is="currentForm" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import JSONTransformerForm from './JSONTransformerForm.vue'
import { computed } from 'vue'
import { useETLStore } from '@/store/etl'
import { storeToRefs } from 'pinia'

const { transformerConfig } = storeToRefs(useETLStore())
const types = ['JSON', 'CSV']

const formComponents = {
  JSON: JSONTransformerForm,
} as any

const currentForm = computed(
  () => formComponents[transformerConfig.value.type] || null
)
</script>
