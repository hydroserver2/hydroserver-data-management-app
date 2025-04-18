<template>
  <v-card>
    <v-toolbar flat color="blue-darken-2">
      <v-card-title> Datastream information </v-card-title>
      <v-spacer />
      <v-btn
        :loading="downloading"
        prepend-icon="mdi-download"
        color="blue-lighten-5"
        @click="downloadDatastream(datastream.id)"
        >Download</v-btn
      >
    </v-toolbar>

    <v-expansion-panels
      v-model="expandedPanels"
      multiple
      variant="inset"
      color="grey-lighten-4"
      elevation="0"
      class="bg-grey"
    >
      <v-expansion-panel
        title="General"
        :class="{ 'mt-4': expandedPanels.includes(0) }"
        :rounded="expandedPanels.includes(0) ? 'md' : 0"
      >
        <v-expansion-panel-text>
          <v-list dense>
            <v-list-item v-for="(item, index) in generalItems" :key="index">
              <strong>{{ item.label }}</strong
              >: {{ item.value }}
            </v-list-item>
          </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel title="Site & location">
        <v-expansion-panel-text>
          <v-list dense>
            <v-list-item v-for="(item, index) in locationItems" :key="index">
              <strong>{{ item.label }}</strong
              >: {{ item.value }}
            </v-list-item>
          </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel title="Sensor">
        <v-expansion-panel-text>
          <v-list dense>
            <v-list-item v-for="(item, index) in sensorItems" :key="index">
              <strong>{{ item.label }}</strong
              >: {{ item.value }}
            </v-list-item>
          </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel title="Observed Property">
        <v-expansion-panel-text>
          <v-list dense>
            <v-list-item
              v-for="(item, index) in observedPropertyItems"
              :key="index"
            >
              <strong>{{ item.label }}</strong
              >: {{ item.value }}
            </v-list-item>
          </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel title="Unit">
        <v-expansion-panel-text>
          <v-list dense>
            <v-list-item v-for="(item, index) in unitItems" :key="index">
              <strong>{{ item.label }}</strong
              >: {{ item.value }}
            </v-list-item>
          </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel
        title="Processing Level"
        :class="{ 'mb-4': expandedPanels.includes(5) }"
        :rounded="expandedPanels.includes(5) ? 'md' : 0"
      >
        <v-expansion-panel-text>
          <v-list dense>
            <v-list-item
              v-for="(item, index) in processingLevelItems"
              :key="index"
            >
              <strong>{{ item.label }}</strong
              >: {{ item.value }}
            </v-list-item>
          </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-card-actions>
      <v-btn-primary color="blue" variant="text" @click="addToPlot(datastream)"
        >Add to Current Plot</v-btn-primary
      >
      <v-spacer />
      <v-btn-cancel @click="$emit('close')">Cancel</v-btn-cancel>
      <v-btn-primary type="submit" @click="clearAndPlot(datastream)"
        >Clear and Plot</v-btn-primary
      >
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { useDataVisStore } from '@/store/dataVisualization'
import { Datastream, Sensor, Unit } from '@/types'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { api } from '@/services/api'
import { downloadDatastreamCSV } from '@/utils/CSVDownloadUtils'

const props = defineProps({
  datastream: { type: Object as () => Datastream, required: true },
})
const emit = defineEmits(['close'])

const { processingLevels, observedProperties, things, plottedDatastreams } =
  storeToRefs(useDataVisStore())

const downloading = ref(false)
const expandedPanels = ref<number[]>([])

const downloadDatastream = async (id: string) => {
  downloading.value = true
  try {
    await downloadDatastreamCSV(id)
  } catch (error) {
    console.error('Error downloading datastream', error)
  }
  downloading.value = false
}

const addToPlot = (datastream: Datastream) => {
  const index = plottedDatastreams.value.findIndex(
    (ds) => ds.id === datastream.id
  )
  if (index === -1) plottedDatastreams.value.push(datastream)
  emit('close')
}

const clearAndPlot = (datastream: Datastream) => {
  emit('close')
  plottedDatastreams.value = []
  plottedDatastreams.value.push(datastream)
}

const unit = ref<Unit | null>(null)
const sensor = ref<Sensor | null>(null)

const matchingThing = computed(() => {
  return things.value.find((t) => t.id === props.datastream.thingId)
})

const generalItems = computed(() => [
  { label: 'Datastream name', value: props.datastream.name },
  { label: 'Description', value: props.datastream.description },
  { label: 'Number Of Observations', value: props.datastream.valueCount },
  { label: 'Date Last Updated', value: props.datastream.phenomenonEndTime },
  { label: 'Begin Date', value: props.datastream.phenomenonBeginTime },
  { label: 'End Date', value: props.datastream.phenomenonEndTime },
  { label: 'Data Type', value: props.datastream.observationType },
  { label: 'Value Type', value: props.datastream.resultType },
  { label: 'Sample Medium', value: props.datastream.sampledMedium },
  { label: 'Nodata value', value: props.datastream.noDataValue },
  { label: 'Id', value: props.datastream.id },
  { label: 'Workspace Id', value: props.datastream.workspaceId },
  {
    label: 'Aggregation Statistic',
    value: props.datastream.aggregationStatistic,
  },
  {
    label: 'Intended Time Spacing',
    value: props.datastream.intendedTimeSpacing,
  },
  {
    label: 'Intended Time Spacing Unit',
    value: props.datastream.intendedTimeSpacingUnit,
  },
  {
    label: 'Time Aggregation Interval',
    value: props.datastream.timeAggregationInterval,
  },
  {
    label: 'Time Aggregation Interval Unit',
    value: props.datastream.timeAggregationIntervalUnit,
  },
  { label: 'Is Private', value: props.datastream.isPrivate ? 'Yes' : 'No' },
  { label: 'Is Visible', value: props.datastream.isVisible ? 'Yes' : 'No' },

  { label: 'Datasource Id', value: props.datastream.dataSourceId },
])

const locationItems = computed(() => {
  if (!matchingThing.value) return []

  const {
    name,
    samplingFeatureCode,
    siteType,
    latitude,
    longitude,
    state,
    county,
    country,
    elevation_m,
    elevationDatum,
    description,
    samplingFeatureType,
    isPrivate,
    workspaceId,
    id,
  } = matchingThing.value
  return [
    { label: 'Site name', value: name },
    { label: 'Site code', value: samplingFeatureCode },
    { label: 'Description', value: description },
    { label: 'Site type', value: siteType },
    { label: 'Latitude', value: latitude },
    { label: 'Longitude', value: longitude },
    { label: 'Elevation (m)', value: elevation_m },
    { label: 'Elevation datum', value: elevationDatum },
    { label: 'State/Province/Region', value: state },
    { label: 'County/District', value: county },
    { label: 'Country', value: country },

    { label: 'Sampling feature type', value: samplingFeatureType },
    { label: 'Is private', value: isPrivate ? 'Yes' : 'No' },
    { label: 'Thing id', value: id },
  ]
})

const observedPropertyItems = computed(() => {
  if (!props.datastream.observedPropertyId) return []

  const op = observedProperties.value.find(
    (op) => op.id === props.datastream.observedPropertyId
  )
  return op
    ? [
        { label: 'Name', value: op.name },
        { label: 'Definition', value: op.definition },
        { label: 'Description', value: op.description },
        { label: 'Type', value: op.type },
        { label: 'Code', value: op.code },
      ]
    : []
})

const unitItems = computed(() => {
  return unit.value
    ? [
        { label: 'Name', value: unit.value.name },
        { label: 'Symbol', value: unit.value.symbol },
        { label: 'Definition', value: unit.value.definition },
        { label: 'Type', value: unit.value.type },
      ]
    : []
})

const sensorItems = computed(() => {
  return sensor.value
    ? [
        { label: 'Name', value: sensor.value.name },
        { label: 'Description', value: sensor.value.description },
        { label: 'Manufacturer', value: sensor.value.manufacturer },
        { label: 'Model', value: sensor.value.model },
        { label: 'Method Type', value: sensor.value.methodType },
        { label: 'Method Code', value: sensor.value.methodCode },
        { label: 'Method Link', value: sensor.value.methodLink },
        { label: 'Encoding Type', value: sensor.value.encodingType },
        { label: 'Model Link', value: sensor.value.modelLink },
      ]
    : []
})
const processingLevelItems = computed(() => {
  const pl = processingLevels.value.find(
    (pl) => pl.id === props.datastream.processingLevelId
  )
  return pl
    ? [
        { label: 'Code', value: pl.code },
        { label: 'Definition', value: pl.definition },
        { label: 'Explanation', value: pl.explanation },
      ]
    : []
})

onMounted(async () => {
  const [unitResult, sensorResult] = await Promise.all([
    api.getUnit(props.datastream.unitId),
    api.fetchSensor(props.datastream.sensorId),
  ])
  unit.value = unitResult
  sensor.value = sensorResult
})
</script>
