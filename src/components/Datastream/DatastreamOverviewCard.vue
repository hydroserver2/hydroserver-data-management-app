<template>
  <v-card :loading="loading" color="blue-darken-4" variant="outlined">
    <v-card-text>
      <div class="mb-4">
        <div class="text-h6 font-weight-bold text-primary-darken-1">
          {{ observedProperty.name }}
        </div>
        <div class="text-caption font-weight-medium text-grey-darken-1">
          Observed Property
        </div>
      </div>
      <!-- Processing Level -->
      <div class="mb-3">
        <div class="text-subtitle-1 font-weight-medium">
          {{ processingLevel.definition }}
        </div>
        <div class="text-caption text-grey-darken-1">Processing Level</div>
      </div>

      <v-divider class="my-3" />

      <!-- Sensor and Sampled Medium (Less important) -->
      <div class="grid gap-y-2">
        <div class="flex items-center opacity-80">
          <span class="text-body-2 font-weight-medium text-grey-darken-2 mr-2"
            >Sensor:</span
          >
          <span class="text-body-2">
            {{ sensor.name }}
          </span>
        </div>

        <div class="flex items-center opacity-80">
          <span class="text-body-2 font-weight-medium text-grey-darken-2 mr-2"
            >Sampled Medium:</span
          >
          <span class="text-body-2">{{ datastream.sampledMedium }}</span>
        </div>

        <div class="flex items-center opacity-90">
          <span class="text-body-2 font-weight-medium text-grey-darken-2 mr-2"
            >Identifier:</span
          >
          <span class="text-body-2">{{ datastream.id }}</span>
        </div>
      </div>

      <div v-if="addAggregation" class="flex items-center opacity-80">
        <span class="text-body-2 font-weight-medium text-grey-darken-2 mr-2"
          >Aggregation Statistic:</span
        >
        <span class="text-body-2">{{ datastream?.aggregationStatistic }}</span>
      </div>

      <div v-if="addAggregation" class="flex items-center opacity-80">
        <span class="text-body-2 font-weight-medium text-grey-darken-2 mr-2"
          >Aggregation Interval:</span
        >
        <span class="text-body-2">
          {{ datastream?.timeAggregationInterval }}
          {{ datastream?.timeAggregationIntervalUnit }}
        </span>
      </div>
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
  addAggregation: {
    type: Boolean,
    default: false,
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
