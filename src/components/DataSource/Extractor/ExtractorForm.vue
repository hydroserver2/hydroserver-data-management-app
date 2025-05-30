<template>
  <v-form ref="localForm" v-model="isValid" validate-on="input">
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

      <HTTPExtractorForm v-if="extractor.type === 'HTTP'" />
      <LocalFileExtractorForm v-else-if="extractor.type === 'local'" />
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import HTTPExtractorForm from './HTTPExtractorForm.vue'
import LocalFileExtractorForm from './LocalFileExtractorForm.vue'
import { ref, watch } from 'vue'
import { useETLStore } from '@/store/etl'
import { storeToRefs } from 'pinia'
import { EXTRACTOR_OPTIONS, ExtractorConfig } from '@/models/dataSource'
import { VForm } from 'vuetify/lib/components/index.mjs'

const localForm = ref<VForm>()

async function validate() {
  await localForm.value?.validate()
  return isValid.value
}

defineExpose({ validate })

const {
  extractor,
  isExtractorValid: isValid,
  dataSource,
} = storeToRefs(useETLStore())

const savedExtractor: ExtractorConfig = JSON.parse(
  JSON.stringify(extractor.value)
)

watch(
  () => extractor.value.type,
  (newType) => {
    if (savedExtractor.type === newType)
      extractor.value = JSON.parse(JSON.stringify(savedExtractor))
    else dataSource.value.switchExtractor(newType)
  }
)
</script>
