import { Datastream, ObservedProperty, ProcessingLevel, Thing } from '@/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useTSAStore = defineStore('TSAStore', () => {
  const things = ref<Thing[]>([])
  const datastreams = ref<Datastream[]>([])
  const observedProperties = ref<ObservedProperty[]>([])
  const processingLevels = ref<ProcessingLevel[]>([])

  const selectedThings = ref<Thing[]>([])
  const selectedDatastreams = ref<Datastream[]>([])
  const selectedObservedProperties = ref<ObservedProperty[]>([])
  const selectedProcessingLevels = ref<ProcessingLevel[]>([])

  const endDate = ref<Date>(new Date())
  const oneWeek = 7 * 24 * 60 * 60 * 1000
  const beginDate = ref<Date>(new Date(endDate.value.getTime() - oneWeek))

  const filteredDatastreams = computed(() => {
    return datastreams.value.filter((datastream) => {
      const matchesThing =
        selectedThings.value.length === 0 ||
        selectedThings.value.some((thing) => thing.id === datastream.thingId)
      const matchesObservedProperty =
        selectedObservedProperties.value.length === 0 ||
        selectedObservedProperties.value.some(
          (op) => op.id === datastream.observedPropertyId
        )
      const matchesProcessingLevel =
        selectedProcessingLevels.value.length === 0 ||
        selectedProcessingLevels.value.some(
          (pl) => pl.id === datastream.processingLevelId
        )
      return matchesThing && matchesObservedProperty && matchesProcessingLevel
    })
  })

  const clearFilters = () => {
    selectedThings.value = []
    selectedObservedProperties.value = []
    selectedProcessingLevels.value = []
  }

  return {
    things,
    datastreams,
    processingLevels,
    observedProperties,
    selectedThings,
    selectedObservedProperties,
    selectedProcessingLevels,
    filteredDatastreams,
    selectedDatastreams,
    beginDate,
    endDate,
    clearFilters,
  }
})
