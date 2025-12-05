import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  ExtractorConfig,
  TransformerConfig,
  LoaderConfig,
  Job,
} from '@hydroserver/client'
import { Datastream, DatastreamExtended } from '@hydroserver/client'

export const useJobStore = defineStore('job', () => {
  const job = ref(new Job())
  const openJobTableDialog = ref(false)

  const extractor = computed<ExtractorConfig>({
    get() {
      return job.value.extractor
    },
    set(newVal) {
      job.value.extractor = newVal
    },
  })

  const transformer = computed<TransformerConfig>({
    get() {
      return job.value.transformer
    },
    set(newVal) {
      job.value.transformer = newVal
    },
  })

  const loader = computed<LoaderConfig>({
    get() {
      return job.value.loader
    },
    set(newVal) {
      job.value.loader = newVal
    },
  })

  const isExtractorValid = ref(true)
  const isTransformerValid = ref(true)
  const isLoaderValid = ref(true)

  return {
    job,
    openJobTableDialog,
    extractor,
    transformer,
    loader,
    isExtractorValid,
    isTransformerValid,
    isLoaderValid,
  }
})
