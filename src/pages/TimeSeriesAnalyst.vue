<template>
  <TSAFiltersDrawer />

  <div class="my-4 mx-4">
    <TSAVisualizationCard
      :datastreams="selectedDatastreams"
      :begin-date="beginDate"
      :end-date="endDate"
    />

    <TSATimeFilters />
    <v-divider />

    <div class="mt-1">
      <TSADatasetsTable @copy-state="copyStateToClipboard" />
    </div>
  </div>
</template>

<script setup lang="ts">
import TSAFiltersDrawer from '@/components/TimeSeriesAnalyst/TSAFiltersDrawer.vue'
import TSADatasetsTable from '@/components/TimeSeriesAnalyst/TSADatasetsTable.vue'
import TSAVisualizationCard from '@/components/TimeSeriesAnalyst/TSAVisualizationCard.vue'
import TSATimeFilters from '@/components/TimeSeriesAnalyst/TSATimeFilters.vue'
import { onMounted, onUnmounted } from 'vue'
import { api } from '@/services/api'
import { useTSAStore } from '@/store/timeSeriesAnalyst'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { Snackbar } from '@/utils/notifications'

const route = useRoute()

const { setDateRange, resetTSAState } = useTSAStore()
const {
  things,
  selectedThings,
  selectedDatastreams,
  selectedObservedPropertyNames,
  selectedProcessingLevelNames,
  processingLevels,
  observedProperties,
  datastreams,
  beginDate,
  endDate,
  dataZoomStart,
  dataZoomEnd,
  selectedDateBtnId,
} = storeToRefs(useTSAStore())

const generateStateUrl = () => {
  const BASE_URL = `${
    import.meta.env.MODE === 'development'
      ? 'http://127.0.0.1:5173'
      : import.meta.env.VITE_APP_PROXY_BASE_URL
  }/time-series-analyst/`

  const queryParams = new URLSearchParams()

  const siteIds = selectedThings.value.map((t) => t.id).join(',')
  if (siteIds) queryParams.append('sites', siteIds)

  const datastreamIds = selectedDatastreams.value
    .map((ds) => encodeURIComponent(ds.id))
    .join(',')
  if (datastreamIds) queryParams.append('datastreams', datastreamIds)

  if (selectedProcessingLevelNames.value.length)
    queryParams.append('PLs', selectedProcessingLevelNames.value.join(','))

  if (selectedObservedPropertyNames.value.length)
    queryParams.append('OPs', selectedObservedPropertyNames.value.join(','))

  if (selectedDateBtnId.value < 0) {
    queryParams.append('beginDate', beginDate.value.toISOString())
    queryParams.append('endDate', endDate.value.toISOString())
  } else {
    // 2 is the default so no need to put it in the URL
    if (selectedDateBtnId.value !== 2)
      queryParams.append(
        'selectedDateBtnId',
        selectedDateBtnId.value.toString()
      )
  }

  if (dataZoomStart.value !== 0)
    queryParams.append('dataZoomStart', dataZoomStart.value.toString())
  if (dataZoomEnd.value !== 0 && dataZoomEnd.value !== 100)
    queryParams.append('dataZoomEnd', dataZoomEnd.value.toString())

  return `${BASE_URL}?${queryParams.toString()}`
}

const copyStateToClipboard = async () => {
  try {
    const stateUrl = generateStateUrl()
    await navigator.clipboard.writeText(stateUrl)
    Snackbar.info('Copied URL to clipboard')
  } catch (err) {
    console.error('Failed to copy URL:', err)
  }
}

const parseUrlAndSetState = () => {
  const selectedDateBtnIdParam = (route.query.selectedDateBtnId as string) || ''
  if (selectedDateBtnIdParam !== '') {
    // Convert the string to a number using the unary plus operator
    const btnId = +selectedDateBtnIdParam
    setDateRange(btnId)
  } else {
    const beginDateParam = (route.query.beginDate as string) || ''
    const endDateParam = (route.query.endDate as string) || ''
    if (beginDateParam || endDateParam) {
      selectedDateBtnId.value = -1
      if (beginDateParam) beginDate.value = new Date(beginDateParam)
      if (endDateParam) endDate.value = new Date(endDateParam)
    }
  }

  const datastreamIdString = (route.query.datastreams as string) || ''
  const datastreamIds = datastreamIdString.split(',')
  if (datastreamIds)
    selectedDatastreams.value = datastreams.value.filter((ds) =>
      datastreamIds.includes(ds.id)
    )

  const siteIdString = (route.query.sites as string) || ''
  const siteIds = siteIdString.split(',')
  if (siteIds)
    selectedThings.value = things.value.filter((t) => siteIds.includes(t.id))

  const OPNameString = (route.query.OPs as string) || ''
  const OPNames = OPNameString ? OPNameString.split(',') : []
  if (OPNames.length) selectedObservedPropertyNames.value = OPNames

  const PLNamesString = (route.query.PLs as string) || ''
  const PLNames = PLNamesString ? PLNamesString.split(',') : []
  if (PLNames.length) selectedProcessingLevelNames.value = PLNames

  const start = (route.query.dataZoomStart as string) || ''
  if (start) dataZoomStart.value = +start

  const end = (route.query.dataZoomEnd as string) || ''
  if (end) dataZoomEnd.value = +end
}

onMounted(async () => {
  const [
    thingsResponse,
    datastreamsResponse,
    processingLevelsResponse,
    observedPropertiesResponse,
  ] = await Promise.all([
    api.fetchThings(),
    api.fetchDatastreams(),
    api.fetchProcessingLevels(),
    api.fetchObservedProperties(),
  ])

  things.value = thingsResponse
  datastreams.value = datastreamsResponse
  processingLevels.value = processingLevelsResponse
  observedProperties.value = observedPropertiesResponse

  parseUrlAndSetState()
})

onUnmounted(() => {
  resetTSAState()
})
</script>
