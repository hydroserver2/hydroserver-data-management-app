<template>
  <v-card class="mt-4" variant="outlined" rounded="lg">
    <v-card-title class="text-h6 bg-red-lighten-2 mb-4">
      Extractor configurations
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="3">
          <v-select
            v-model="extractorConfig.type"
            :items="types"
            label="Type"
            density="compact"
            rounded="lg"
            prepend-inner-icon="mdi-web"
          />
        </v-col>
      </v-row>

      <v-row v-if="currentForm">
        <v-col cols="12">
          <component :is="currentForm" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import HTTPExtractorForm from './HTTPExtractorForm.vue'
import { computed } from 'vue'
import { useETLStore } from '@/store/etl'
import { storeToRefs } from 'pinia'

const { extractorConfig } = storeToRefs(useETLStore())
const types = ['HTTP', 'FTP', 'S3']

const formComponents = {
  HTTP: HTTPExtractorForm,
} as any

const currentForm = computed(
  () => formComponents[extractorConfig.value.type] || null
)
</script>
