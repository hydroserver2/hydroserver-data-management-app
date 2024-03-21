<template>
  <TSAFiltersDrawer />

  <div class="my-4 mx-4">
    <TSAVisualizationCard
      :datastreams="selectedDatastreams"
      :begin-date="beginDate"
      :end-date="endDate"
    />

    <div class="mt-6">
      <TSADatasetsTable @copy-state="copyStateToClipboard" />
    </div>
  </div>
</template>

<script setup lang="ts">
import TSAFiltersDrawer from '@/components/TimeSeriesAnalyst/TSAFiltersDrawer.vue'
import TSADatasetsTable from '@/components/TimeSeriesAnalyst/TSADatasetsTable.vue'
import TSAVisualizationCard from '@/components/TimeSeriesAnalyst/TSAVisualizationCard.vue'
import { onMounted } from 'vue'
import { api } from '@/services/api'
import { useTSAStore } from '@/store/timeSeriesAnalyst'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { Snackbar } from '@/utils/notifications'

const route = useRoute()

const { setDateRange } = useTSAStore()
const {
  things,
  selectedThings,
  selectedDatastreams,
  selectedObservedProperties,
  selectedProcessingLevels,
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

  const PLIds = selectedProcessingLevels.value.map((pl) => pl.id).join(',')
  if (PLIds) queryParams.append('PLs', PLIds)

  const OPIds = selectedObservedProperties.value.map((op) => op.id).join(',')
  if (OPIds) queryParams.append('OPs', OPIds)

  if (selectedDateBtnId.value < 0) {
    queryParams.append('beginDate', beginDate.value.toISOString())
    queryParams.append('endDate', endDate.value.toISOString())
  } else {
    queryParams.append('selectedDateBtnId', selectedDateBtnId.value.toString())
  }

  if (dataZoomStart.value !== 0)
    queryParams.append('dataZoomStart', dataZoomStart.value.toString())
  if (dataZoomEnd.value !== 0)
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

  const OPIdString = (route.query.OPs as string) || ''
  const OPIds = OPIdString.split(',')
  if (OPIds)
    selectedObservedProperties.value = observedProperties.value.filter((op) =>
      OPIds.includes(op.id)
    )

  const PLIdString = (route.query.PLs as string) || ''
  const PLIds = PLIdString.split(',')
  if (PLIds)
    selectedProcessingLevels.value = processingLevels.value.filter((t) =>
      PLIds.includes(t.id)
    )

  const start = (route.query.dataZoomStart as string) || ''
  if (start) dataZoomStart.value = +start

  const end = (route.query.dataZoomEnd as string) || ''
  if (end) dataZoomEnd.value = +end
}

onMounted(async () => {
  // TODO: Promise.all
  things.value = await api.fetchThings()
  datastreams.value = await api.fetchDatastreams()
  // TODO: How do we get the processing levels that don't belong to the user? There will be multiple 'Raw Data' variations
  processingLevels.value = await api.fetchProcessingLevels()
  // TODO: Similarly, there will be duplicates of observed properties between users
  observedProperties.value = await api.fetchObservedProperties()

  parseUrlAndSetState()
})
</script>
