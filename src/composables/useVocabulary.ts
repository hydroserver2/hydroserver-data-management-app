import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/services/api'

export const useVocabularyStore = defineStore('vocabulary', () => {
  const siteTypes = ref<string[]>([])
  const samplingFeatureTypes = ref<string[]>([])
  const sensorEncodingTypes = ref<string[]>([])
  const methodTypes = ref<string[]>([])
  const variableTypes = ref<string[]>([])
  const unitTypes = ref<string[]>([])
  const datastreamStatuses = ref<string[]>([])
  const datastreamAggregations = ref<string[]>([])
  const sampledMediums = ref<string[]>([])

  async function fetchSiteTypes() {
    siteTypes.value = await api.fetchSiteTypes()
  }

  async function fetchSamplingFeatureTypes() {
    samplingFeatureTypes.value = await api.fetchSamplingFeatureTypes()
  }

  async function fetchSensorEncodingTypes() {
    sensorEncodingTypes.value = await api.fetchSensorEncodingTypes()
  }

  async function fetchMethodTypes() {
    methodTypes.value = await api.fetchMethodTypes()
  }

  async function fetchVariableTypes() {
    variableTypes.value = await api.fetchVariableTypes()
  }

  async function fetchUnitTypes() {
    unitTypes.value = await api.fetchUnitTypes()
  }

  async function fetchDatastreamStatuses() {
    datastreamStatuses.value = await api.fetchDatastreamStatuses()
  }

  async function fetchDatastreamAggregations() {
    datastreamAggregations.value = await api.fetchDatastreamAggregations()
  }

  async function fetchSampledMediums() {
    sampledMediums.value = await api.fetchSampledMediums()
  }

  // Fetch all vocabularies in parallel
  async function fetchAllVocabularies() {
    await Promise.all([
      fetchSiteTypes(),
      fetchSamplingFeatureTypes(),
      fetchSensorEncodingTypes(),
      fetchMethodTypes(),
      fetchVariableTypes(),
      fetchUnitTypes(),
      fetchDatastreamStatuses(),
      fetchDatastreamAggregations(),
      fetchSampledMediums(),
    ])
  }

  return {
    siteTypes,
    samplingFeatureTypes,
    sensorEncodingTypes,
    methodTypes,
    variableTypes,
    unitTypes,
    datastreamStatuses,
    datastreamAggregations,
    sampledMediums,

    fetchSiteTypes,
    fetchSamplingFeatureTypes,
    fetchSensorEncodingTypes,
    fetchMethodTypes,
    fetchVariableTypes,
    fetchUnitTypes,
    fetchDatastreamStatuses,
    fetchDatastreamAggregations,
    fetchSampledMediums,

    fetchAllVocabularies,
  }
})
