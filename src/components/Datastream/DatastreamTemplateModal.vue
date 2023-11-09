<template>
  <v-card>
    <v-card-title>Use an existing datastream as a template</v-card-title>
    <v-divider class="my-4"></v-divider>
    <v-card-text>
      <v-col cols="12">
        Filter datastreams by site
        <v-select
          v-model="selectedThingId"
          :items="thingStore.primaryOwnedThings"
          item-title="name"
          item-value="id"
        >
        </v-select>
      </v-col>
      <v-col cols="12">
        <v-card
          class="my-2"
          v-for="datastream in datastreamsForThing"
          :key="datastream.id"
          @click="datastreamSelected(datastream.id)"
        >
          <v-card-text>
            <p style="font-size: 1.2em">
              <strong class="mr-2">Observed Property:</strong>
              <strong>{{
                opStore.getById(datastream.observedPropertyId).name
              }}</strong>
            </p>
            <p><strong class="mr-2">Identifier:</strong> {{ datastream.id }}</p>
            <p>
              <strong class="mr-2">Processing Level:</strong>
              {{ plStore.getById(datastream.processingLevelId).code }}
            </p>
            <p>
              <strong class="mr-2">Sampled Medium:</strong>
              {{ datastream.sampledMedium }}
            </p>
            <p>
              <strong class="mr-2">Sensor:</strong>
              {{ sensorStore.getSensorById(datastream.sensorId).name }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useDatastreamStore } from '@/store/datastreams'
import { useThingStore } from '@/store/things'
import { watch, onMounted, ref } from 'vue'
import { Datastream } from '@/types'
import { useSensorStore } from '@/store/sensors'
import { useProcessingLevelStore } from '@/store/processingLevels'
import { useObservedPropertyStore } from '@/store/observedProperties'

const sensorStore = useSensorStore()
const plStore = useProcessingLevelStore()
const opStore = useObservedPropertyStore()

const datastreamStore = useDatastreamStore()
const thingStore = useThingStore()
const selectedThingId = ref('')
const datastreamsForThing = ref<Datastream[]>([])

const emit = defineEmits(['selectedDatastreamId', 'close'])

watch(
  selectedThingId,
  async (newThingId) => {
    if (newThingId) {
      datastreamsForThing.value =
        await datastreamStore.fetchDatastreamsByThingId(newThingId)
    } else {
      datastreamsForThing.value = []
    }
  },
  { immediate: true }
)

function datastreamSelected(id: string) {
  emit('selectedDatastreamId', id)
  emit('close')
}

onMounted(async () => {
  await thingStore.fetchThings()
  await Promise.all([
    sensorStore.fetchSensors(),
    plStore.fetchProcessingLevels(),
    opStore.fetchObservedProperties(),
  ])
})
</script>
