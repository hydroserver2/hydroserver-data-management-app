<template>
  <v-card class="my-2" :loading="loading">
    <v-card-text class="py-1" style="font-size: 1.2em">
      <strong> Observed Property: {{ observedProperty?.name }} </strong>
    </v-card-text>
    <v-card-text class="py-1">
      <strong class="mr-2">Identifier:</strong> {{ datastream.id }}
    </v-card-text>
    <v-card-text class="py-1">
      <strong class="mr-2">Processing Level:</strong>
      {{ processingLevel?.code }}
    </v-card-text>
    <v-card-text class="py-1">
      <strong class="mr-2">Sampled Medium:</strong>
      {{ datastream.sampledMedium }}
    </v-card-text>
    <v-card-text class="py-1">
      <strong class="mr-2">Sensor:</strong>
      {{ sensor?.name }}
    </v-card-text>
    <v-card-text class="py-1">
      <strong class="mr-2">Aggregation statistic:</strong>
      {{ datastream?.aggregationStatistic }}
    </v-card-text>
    <v-card-text class="py-1">
      <strong class="mr-2">Aggregation statistic interval:</strong>
      {{ datastream?.timeAggregationInterval }}
      {{ datastream?.timeAggregationIntervalUnit }}
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { api } from '@/services/api'
import { Datastream, ObservedProperty, ProcessingLevel, Sensor } from '@/types'
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  datastream: {
    type: Object as () => Datastream,
    required: true,
  },
})

const processingLevel = ref(new ProcessingLevel())
const observedProperty = ref(new ObservedProperty())
const sensor = ref(new Sensor())
const loading = ref(false)

async function fetchData() {
  try {
    loading.value = true
    const [fetchedProcessingLevel, fetchedObservedProperty, fetchedSensor] =
      await Promise.all([
        api.fetchProcessingLevel(props.datastream.processingLevelId),
        api.fetchObservedProperty(props.datastream.observedPropertyId),
        api.fetchSensor(props.datastream.sensorId),
      ])
    processingLevel.value = fetchedProcessingLevel
    observedProperty.value = fetchedObservedProperty
    sensor.value = fetchedSensor
  } catch (error) {
    console.error(
      'unable to fetch linked metadata for DatastreamOverviewCard',
      error
    )
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchData()
})

watch(
  () => props.datastream.id,
  () => {
    fetchData()
  }
)
</script>
