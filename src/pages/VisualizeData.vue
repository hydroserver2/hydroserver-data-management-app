<template>
  <FullScreenLoader v-if="loading" />
  <div v-else>
    <DataVisFiltersDrawer @drawer-change="handleDrawerChange" />

    <div class="my-4 mx-4 visualize-layout">
      <div
        v-if="showPlot"
        class="plot-section"
        :style="{ flex: `${cardHeight} 1 0%` }"
      >
        <DataVisualizationCard :cardHeight="cardHeight" />
      </div>

      <div
        v-if="showTable"
        class="table-section"
        :style="{ flex: `${tableHeight} 1 0%` }"
      >
        <DataVisDatasetsTable @copy-state="copyStateToClipboard" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DataVisFiltersDrawer from '@/components/VisualizeData/DataVisFiltersDrawer.vue'
import DataVisDatasetsTable from '@/components/VisualizeData/DataVisDatasetsTable.vue'
import DataVisualizationCard from '@/components/VisualizeData/DataVisualizationCard.vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import hs from '@hydroserver/client'
import { useDataVisStore } from '@/store/dataVisualization'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { Snackbar } from '@/utils/notifications'
import FullScreenLoader from '@/components/base/FullScreenLoader.vue'

const route = useRoute()

const { onDateBtnClick, resetState } = useDataVisStore()
const {
  things,
  selectedThings,
  plottedDatastreams,
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
  cardHeight,
  tableHeight,
  showPlot,
  showTable,
  showSummaryStatistics,
} = storeToRefs(useDataVisStore())

const fullHeight = 90
const defaultPlotHeight = 45
const defaultTableHeight = 35

const updateLayoutHeights = () => {
  if (showPlot.value && showTable.value) {
    cardHeight.value = defaultPlotHeight
    tableHeight.value = defaultTableHeight
  } else if (showPlot.value) {
    cardHeight.value = fullHeight
    tableHeight.value = 0
  } else if (showTable.value) {
    cardHeight.value = 0
    tableHeight.value = fullHeight
  } else {
    cardHeight.value = defaultPlotHeight
    tableHeight.value = defaultTableHeight
    showPlot.value = true
  }
}

watch([showPlot, showTable], updateLayoutHeights, { immediate: true })

watch(showPlot, (isVisible) => {
  if (!isVisible) showSummaryStatistics.value = false
})

const handleDrawerChange = () => {
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'))
    window.dispatchEvent(new Event('datavis-layout'))
  }, 250)
}

const generateStateUrl = () => {
  const BASE_URL = `${window.location.origin}/visualize-data/`

  const queryParams = new URLSearchParams()

  selectedThings.value.forEach((t) => queryParams.append('sites', t.id))

  plottedDatastreams.value.forEach((ds) =>
    queryParams.append('datastreams', ds.id)
  )

  selectedProcessingLevelNames.value.forEach((pl) =>
    queryParams.append('PLs', pl)
  )

  selectedObservedPropertyNames.value.forEach((op) =>
    queryParams.append('OPs', op)
  )

  if (selectedDateBtnId.value < 0) {
    queryParams.append('beginDate', beginDate.value.toISOString())
    queryParams.append('endDate', endDate.value.toISOString())
  } else {
    // 0 is the default so no need to put it in the URL
    if (selectedDateBtnId.value !== 0)
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
    const btnId = +selectedDateBtnIdParam
    onDateBtnClick(btnId)
  } else {
    const beginDateParam = (route.query.beginDate as string) || ''
    const endDateParam = (route.query.endDate as string) || ''
    if (beginDateParam || endDateParam) {
      selectedDateBtnId.value = -1
      if (beginDateParam) beginDate.value = new Date(beginDateParam)
      if (endDateParam) endDate.value = new Date(endDateParam)
    }
  }

  // Datastream IDs
  const datastreamIds = route.query.datastreams
  const datastreamIdsArray = Array.isArray(datastreamIds)
    ? datastreamIds
    : datastreamIds
    ? [datastreamIds]
    : []

  const datastreamIdsStrings = datastreamIdsArray.filter(
    (id): id is string => typeof id === 'string'
  )

  if (datastreamIdsStrings.length)
    plottedDatastreams.value = datastreams.value.filter((ds) =>
      datastreamIdsStrings.includes(ds.id)
    )

  // Site IDs
  const siteIds = route.query.sites
  const siteIdsArray = Array.isArray(siteIds)
    ? siteIds
    : siteIds
    ? [siteIds]
    : []

  const siteIdsStrings = siteIdsArray.filter(
    (id): id is string => typeof id === 'string'
  )

  if (siteIdsStrings.length)
    selectedThings.value = things.value.filter((t) =>
      siteIdsStrings.includes(t.id)
    )

  // Observed Property Names
  const OPNames = route.query.OPs
  const OPNamesArray = Array.isArray(OPNames)
    ? OPNames
    : OPNames
    ? [OPNames]
    : []

  const OPNamesStrings = OPNamesArray.filter(
    (op): op is string => typeof op === 'string'
  )

  if (OPNamesStrings.length)
    selectedObservedPropertyNames.value = OPNamesStrings

  // Processing Level Names
  const PLNames = route.query.PLs
  const PLNamesArray = Array.isArray(PLNames)
    ? PLNames
    : PLNames
    ? [PLNames]
    : []

  const PLNamesStrings = PLNamesArray.filter(
    (pl): pl is string => typeof pl === 'string'
  )

  if (PLNamesStrings.length) selectedProcessingLevelNames.value = PLNamesStrings

  const start = (route.query.dataZoomStart as string) || ''
  if (start) dataZoomStart.value = +start

  const end = (route.query.dataZoomEnd as string) || ''
  if (end) dataZoomEnd.value = +end
}

const loading = ref(true)

onMounted(async () => {
  try {
    const [
      thingsResponse,
      datastreamsResponse,
      processingLevelsResponse,
      observedPropertiesResponse,
    ] = await Promise.all([
      hs.things.listAllItems(),
      hs.datastreams.listAllItems(),
      hs.processingLevels.listAllItems(),
      hs.observedProperties.listAllItems(),
    ])

    things.value = thingsResponse
    datastreams.value = datastreamsResponse
    processingLevels.value = processingLevelsResponse
    observedProperties.value = observedPropertiesResponse
  } catch (error) {
    Snackbar.error('Unable to fetch data from the API.')
    console.error('Unable to fetch data from the API:', error)
  }

  parseUrlAndSetState()
  loading.value = false
})

onUnmounted(() => {
  resetState()
})
</script>

<style scoped>
.visualize-layout {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: calc(
    100dvh - var(--v-layout-top, 0px) - var(--v-layout-bottom, 0px) - 32px
  );
}

.plot-section,
.table-section {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.plot-section > *,
.table-section > * {
  flex: 1;
  min-height: 0;
}
</style>
