import { Datastream, ObservedProperty, ProcessingLevel, Thing } from '@/types'
import { SummaryStatistics } from '@/utils/plotting/summaryStatisticUtils'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

export const useTSAStore = defineStore('TSAStore', () => {
  const things = ref<Thing[]>([])
  const datastreams = ref<Datastream[]>([])
  const observedProperties = ref<ObservedProperty[]>([])
  const processingLevels = ref<ProcessingLevel[]>([])

  const selectedThings = ref<Thing[]>([])
  const selectedDatastreams = ref<Datastream[]>([])
  const selectedObservedPropertyNames = ref<string[]>([])
  const selectedProcessingLevelNames = ref<string[]>([])

  const showSummaryStatistics = ref(false)
  const summaryStatisticsArray = ref<SummaryStatistics[]>([])

  const endDate = ref<Date>(new Date())
  const oneWeek = 7 * 24 * 60 * 60 * 1000
  const beginDate = ref<Date>(new Date(endDate.value.getTime() - oneWeek))
  const selectedDateBtnId = ref(2)
  const dataZoomStart = ref(0)
  const dataZoomEnd = ref(100)

  const filteredDatastreams = computed(() => {
    return datastreams.value.filter((datastream) => {
      const matchesThing =
        selectedThings.value.length === 0 ||
        selectedThings.value.some((thing) => thing.id === datastream.thingId)

      const OPName = observedProperties.value.find(
        (op) => op.id === datastream.observedPropertyId
      )?.name

      const matchesObservedProperty =
        selectedObservedPropertyNames.value.length === 0 ||
        (OPName !== undefined &&
          selectedObservedPropertyNames.value.includes(OPName))

      const processingLevelName = processingLevels.value.find(
        (pl) => pl.id === datastream.processingLevelId
      )?.definition

      const matchesProcessingLevel =
        selectedProcessingLevelNames.value.length === 0 ||
        (processingLevelName !== undefined &&
          selectedProcessingLevelNames.value.includes(processingLevelName))

      return matchesThing && matchesObservedProperty && matchesProcessingLevel
    })
  })

  const dateOptions = ref([
    {
      id: 0,
      label: 'All',
      calculateBeginDate: () => new Date('1850-01-01'),
    },
    {
      id: 1,
      label: 'Last Month',
      calculateBeginDate: () => {
        const now = new Date()
        return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      },
    },
    {
      id: 2,
      label: 'Last Week',
      calculateBeginDate: () => {
        const now = new Date()
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
      },
    },
  ])

  const setDateRange = (selectedId: number) => {
    const selectedOption = dateOptions.value.find(
      (option) => option.id === selectedId
    )
    if (selectedOption && selectedId !== selectedDateBtnId.value) {
      beginDate.value = selectedOption.calculateBeginDate()
      endDate.value = new Date()
      selectedDateBtnId.value = selectedId
    }
  }

  // If currently selected datastreams are no longer in filteredDatastreams, deselect them
  watch(
    () => filteredDatastreams.value,
    (newDatastreams) => {
      selectedDatastreams.value = selectedDatastreams.value.filter((ds) =>
        newDatastreams.some((datastream) => datastream.id === ds.id)
      )
    },
    { deep: true }
  )

  const clearFilters = () => {
    selectedThings.value = []
    selectedObservedPropertyNames.value = []
    selectedProcessingLevelNames.value = []
  }

  return {
    things,
    datastreams,
    processingLevels,
    observedProperties,
    selectedThings,
    selectedObservedPropertyNames,
    selectedProcessingLevelNames,
    filteredDatastreams,
    selectedDatastreams,
    beginDate,
    endDate,
    dataZoomStart,
    dataZoomEnd,
    dateOptions,
    selectedDateBtnId,
    showSummaryStatistics,
    summaryStatisticsArray,
    setDateRange,
    clearFilters,
  }
})
