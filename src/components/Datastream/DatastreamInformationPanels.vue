<template>
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
</template>

<script setup lang="ts">
import { api } from '@/services/api'
import {
  Datastream,
  ObservedProperty,
  ProcessingLevel,
  Sensor,
  Thing,
  Unit,
} from '@/types'
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  datastream: { type: Object as () => Datastream, required: true },
  thing: { type: Object as () => Thing, required: true },
})

const unit = ref<Unit | null>(null)
const sensor = ref<Sensor | null>(null)
const observedProperty = ref<ObservedProperty | null>(null)
const processingLevel = ref<ProcessingLevel | null>(null)
const expandedPanels = ref<number[]>([])

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
  if (!props.thing) return []

  const {
    name,
    samplingFeatureCode,
    siteType,
    location,
    description,
    samplingFeatureType,
    isPrivate,
    workspaceId,
    id,
  } = props.thing
  return [
    { label: 'Site name', value: name },
    { label: 'Site code', value: samplingFeatureCode },
    { label: 'Description', value: description },
    { label: 'Site type', value: siteType },
    { label: 'Latitude', value: location.latitude },
    { label: 'Longitude', value: location.longitude },
    { label: 'Elevation (m)', value: location.elevation_m },
    { label: 'Elevation datum', value: location.elevationDatum },
    { label: 'State/Province/Region', value: location.state },
    { label: 'County/District', value: location.county },
    { label: 'Country', value: location.country },

    { label: 'Sampling feature type', value: samplingFeatureType },
    { label: 'Is private', value: isPrivate ? 'Yes' : 'No' },
    { label: 'Thing id', value: id },
  ]
})

const observedPropertyItems = computed(() => {
  const op = observedProperty.value
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
  const pl = processingLevel.value
  return pl
    ? [
        { label: 'Code', value: pl.code },
        { label: 'Definition', value: pl.definition },
        { label: 'Explanation', value: pl.explanation },
      ]
    : []
})

onMounted(async () => {
  const [unitResult, sensorResult, plResult, opResult] = await Promise.all([
    api.getUnit(props.datastream.unitId),
    api.fetchSensor(props.datastream.sensorId),
    api.fetchProcessingLevel(props.datastream.processingLevelId),
    api.fetchObservedProperty(props.datastream.observedPropertyId),
  ])
  unit.value = unitResult
  sensor.value = sensorResult
  processingLevel.value = plResult
  observedProperty.value = opResult
})
</script>
