import { defineStore } from 'pinia'
import { ref } from 'vue'

interface UrlTemplateVariable {
  name: string
  isDynamic: boolean
  dynamicValue: string
}

interface ExtractorConfig {
  type: string
  urlTemplate: string
  urlTemplateVariables: UrlTemplateVariable[]
}

interface TransformerConfig {
  type: string
  mapping: string
  ruleset: string
  timestamp_key: string
  JMESPath: string
}

interface LoaderConfig {
  type: string
  destination: string
  authKey: string
}

export const useETLStore = defineStore('etl', () => {
  const dataSourceForm = ref<boolean | object>(true)
  const dataLoaders = ref<{ id: string; name: string }[]>([])
  const timeUnits = ref(['seconds', 'minutes', 'hours', 'days'] as string[])
  const selectedETLStep = ref('extractor')

  const extractorConfig = ref<ExtractorConfig>({
    type: 'HTTP',
    urlTemplate: '',
    urlTemplateVariables: [],
  })

  const transformerConfig = ref<TransformerConfig>({
    type: 'JSON',
    mapping: '',
    ruleset: '',
    timestamp_key: '',
    JMESPath: '',
  })

  const loaderConfig = ref<LoaderConfig>({
    type: 'HydroServer',
    destination: '',
    authKey: '',
  })

  return {
    dataSourceForm,
    dataLoaders,
    timeUnits,
    extractorConfig,
    transformerConfig,
    loaderConfig,
    selectedETLStep,
  }
})
