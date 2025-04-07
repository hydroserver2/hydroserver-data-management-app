<template>
  <v-card class="mt-4" color="brown-darken-4" variant="outlined" rounded="lg">
    <v-toolbar title="Extractor configurations" color="brown">
      <v-select
        class="mx-4"
        v-model="extractor.type"
        :items="EXTRACTOR_OPTIONS"
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
import HTTPExtractorForm from './HTTPExtractorForm.vue'
import LocalFileExtractorForm from './LocalFileExtractorForm.vue'
import { computed } from 'vue'
import { useETLStore } from '@/store/etl'
import { storeToRefs } from 'pinia'
import { EXTRACTOR_OPTIONS } from '@/models/dataSource'

const { extractor, dataSource } = storeToRefs(useETLStore())
// const types = ['HTTP', 'FTP', 'S3']

const formComponents = {
  HTTP: HTTPExtractorForm,
  local: LocalFileExtractorForm,
} as any

// const allowedOptions = computed(() => {
//   return dataSource.value.etlConfigurationSettings.type === 'SDL'
//     ? ['local']
//     : EXTRACTOR_OPTIONS
// })

const currentForm = computed(
  () => formComponents[extractor.value!.type] || null
)
</script>
