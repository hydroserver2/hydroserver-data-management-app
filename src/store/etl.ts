import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import {
  ExtractorConfig,
  TransformerConfig,
  LoaderConfig,
  DataSource,
} from '@/models/dataSource'

export const useETLStore = defineStore('etl', () => {
  const selectedETLStep = ref('extractor')
  const dataSource = ref(new DataSource())

  const extractor = computed<ExtractorConfig>({
    get() {
      return dataSource.value.settings.extractor
    },
    set(newVal) {
      dataSource.value.settings.extractor = newVal
    },
  })

  const transformer = computed<TransformerConfig>({
    get() {
      return dataSource.value.settings.transformer
    },
    set(newVal) {
      dataSource.value.settings.transformer = newVal
    },
  })

  const loader = computed<LoaderConfig>({
    get() {
      return dataSource.value.settings.loader
    },
    set(newVal) {
      dataSource.value.settings.loader = newVal
    },
  })

  const isExtractorValid = ref(true)
  const isTransformerValid = ref(true)
  const isLoaderValid = ref(true)

  return {
    dataSource,
    extractor,
    transformer,
    loader,
    selectedETLStep,
    isExtractorValid,
    isTransformerValid,
    isLoaderValid,
  }
})
