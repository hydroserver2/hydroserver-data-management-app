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
import { formatTimeWithZone } from '@/utils/time'
import { onMounted, ref } from 'vue'
import hs from '@hydroserver/client'

const props = defineProps({
  datastreamId: { type: String, required: true },
})

type ListItemArray = { label: string; value: any }[]

const expandedPanels = ref<number[]>([])
const datastream = ref<any>()
let generalItems: ListItemArray = []
let locationItems: ListItemArray = []
let sensorItems: ListItemArray = []
let observedPropertyItems: ListItemArray = []
let unitItems: ListItemArray = []
let processingLevelItems: ListItemArray = []

onMounted(async () => {
  datastream.value = await hs.datastreams.getItem(props.datastreamId, {
    expand_related: true,
  })
  const d = datastream.value!

  generalItems = [
    { label: 'Workspace Name', value: d.workspace.name },
    { label: 'Datastream name', value: d.name },
    { label: 'Description', value: d.description },
    { label: 'Number Of Observations', value: d.valueCount },
    {
      label: 'Date Last Updated',
      value: formatTimeWithZone(d.phenomenonEndTime),
    },
    {
      label: 'Begin Date',
      value: formatTimeWithZone(d.phenomenonBeginTime),
    },
    {
      label: 'End Date',
      value: formatTimeWithZone(d.phenomenonEndTime),
    },
    { label: 'Data Type', value: d.observationType },
    { label: 'Value Type', value: d.resultType },
    { label: 'Sample Medium', value: d.sampledMedium },
    { label: 'Nodata value', value: d.noDataValue },
    { label: 'Id', value: d.id },
    {
      label: 'Aggregation Statistic',
      value: d.aggregationStatistic,
    },
    {
      label: 'Intended Time Spacing',
      value: d.intendedTimeSpacing,
    },
    {
      label: 'Intended Time Spacing Unit',
      value: d.intendedTimeSpacingUnit,
    },
    {
      label: 'Time Aggregation Interval',
      value: d.timeAggregationInterval,
    },
    {
      label: 'Time Aggregation Interval Unit',
      value: d.timeAggregationIntervalUnit,
    },
    { label: 'Is Private', value: d.isPrivate ? 'Yes' : 'No' },
    { label: 'Is Visible', value: d.isVisible ? 'Yes' : 'No' },

    { label: 'Datasource Id', value: d.dataSourceId },
  ]

  const op = d.observedProperty
  observedPropertyItems = [
    { label: 'Name', value: op.name },
    { label: 'Definition', value: op.definition },
    { label: 'Description', value: op.description },
    { label: 'Type', value: op.type },
    { label: 'Code', value: op.code },
  ]

  let t = d.thing
  let l = t.location
  locationItems = [
    { label: 'Site name', value: t.name },
    { label: 'Site code', value: t.samplingFeatureCode },
    { label: 'Description', value: t.description },
    { label: 'Site type', value: t.siteType },
    { label: 'Latitude', value: l.latitude },
    { label: 'Longitude', value: l.longitude },
    { label: 'Elevation (m)', value: l.elevation_m },
    { label: 'Elevation datum', value: l.elevationDatum },
    { label: 'State/Province/Region', value: l.state },
    { label: 'County/District', value: l.county },
    { label: 'Country', value: l.country },

    { label: 'Sampling feature type', value: t.samplingFeatureType },
    { label: 'Is private', value: t.isPrivate ? 'Yes' : 'No' },
    { label: 'Thing id', value: t.id },
  ]

  let u = d.unit
  unitItems = [
    { label: 'Name', value: u.name },
    { label: 'Symbol', value: u.symbol },
    { label: 'Definition', value: u.definition },
    { label: 'Type', value: u.type },
  ]

  const s = d.sensor
  sensorItems = [
    { label: 'Name', value: s.name },
    { label: 'Description', value: s.description },
    { label: 'Manufacturer', value: s.manufacturer },
    { label: 'Model', value: s.model },
    { label: 'Method Type', value: s.methodType },
    { label: 'Method Code', value: s.methodCode },
    { label: 'Method Link', value: s.methodLink },
    { label: 'Encoding Type', value: s.encodingType },
    { label: 'Model Link', value: s.modelLink },
  ]

  const pl = d.processingLevel
  processingLevelItems = [
    { label: 'Code', value: pl.code },
    { label: 'Definition', value: pl.definition },
    { label: 'Explanation', value: pl.explanation },
  ]
})
</script>
