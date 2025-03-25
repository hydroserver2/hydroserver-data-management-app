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

  // const extractor = ref<extractor>({
  //   type: 'HTTP',
  //   urlTemplate: '',
  //   urlTemplateVariables: [],
  // })

  const extractor = computed<ExtractorConfig>({
    get() {
      return dataSource.value.etlConfigurationSettings.extractor
    },
    set(newVal) {
      dataSource.value.etlConfigurationSettings.extractor = newVal
    },
  })

  watch(
    () => dataSource.value.etlConfigurationSettings.extractor.type,
    (newType) => {
      dataSource.value.switchExtractor(newType)
    }
  )

  const transformer = computed<TransformerConfig>({
    get() {
      return dataSource.value.etlConfigurationSettings.transformer
    },
    set(newVal) {
      dataSource.value.etlConfigurationSettings.transformer = newVal
    },
  })

  const loader = computed<LoaderConfig>({
    get() {
      return dataSource.value.etlConfigurationSettings.loader
    },
    set(newVal) {
      dataSource.value.etlConfigurationSettings.loader = newVal
    },
  })

  // const transformer = ref<transformer>({
  //   type: 'CSV',
  //   mapping: '',
  //   headerRow: null,
  //   dataStartRow: 1,
  //   delimiter: ',',
  //   timestampKey: '',
  //   timestampFormat: 'ISO8601',
  // })
  // // type: 'JSON',
  // // mapping: '',
  // // timestampKey: '',
  // // JMESPath: '',

  // const loader = ref<loader>({
  //   type: 'HydroServer',
  // })

  return {
    dataSource,
    extractor,
    transformer,
    loader,
    selectedETLStep,
  }
})
