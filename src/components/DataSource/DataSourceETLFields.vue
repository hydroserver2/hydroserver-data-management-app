<template>
  <div class="mx-4 mb-4">
    <ETLTimeline />
    <ExtractorForm
      ref="extractorRef"
      v-show="selectedETLStep === 'extractor'"
    />
    <TransformerForm
      ref="transformerRef"
      v-show="selectedETLStep === 'transformer'"
    />
    <LoaderForm ref="loaderRef" v-show="selectedETLStep === 'loader'" />
  </div>
</template>

<script setup lang="ts">
import ETLTimeline from './ETLTimeline.vue'
import ExtractorForm from './Extractor/ExtractorForm.vue'
import TransformerForm from './Transformer/TransformerForm.vue'
import LoaderForm from './Loader/LoaderForm.vue'
import { useDataSourceStore } from '@/store/datasource'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const extractorRef = ref<any>(null)
const transformerRef = ref<any>(null)
const loaderRef = ref<any>(null)

const { selectedETLStep } = storeToRefs(useDataSourceStore())

async function validate() {
  const validExtractor = await extractorRef.value.validate()
  const validTransformer = await transformerRef.value.validate()
  const validLoader = await loaderRef.value.validate()
  return validExtractor && validTransformer && validLoader
}

defineExpose({ validate })
</script>
