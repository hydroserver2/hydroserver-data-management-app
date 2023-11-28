<template>
  <v-card>
    <v-card-title>Use an existing datastream as a template</v-card-title>

    <v-divider class="my-4"></v-divider>

    <v-card-text>
      <v-col cols="12">
        Filter datastreams by site
        <v-select
          v-model="selectedThingId"
          :items="usersThings"
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
                getOPById(datastream.observedPropertyId).name
              }}</strong>
            </p>
            <p><strong class="mr-2">Identifier:</strong> {{ datastream.id }}</p>
            <p>
              <strong class="mr-2">Processing Level:</strong>
              {{ getPLById(datastream.processingLevelId).code }}
            </p>
            <p>
              <strong class="mr-2">Sampled Medium:</strong>
              {{ datastream.sampledMedium }}
            </p>
            <p>
              <strong class="mr-2">Sensor:</strong>
              {{ getSensorById(datastream.sensorId).name }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { api } from '@/services/api'
import { useDatastreamStore } from '@/store/datastreams'
import { watch, onMounted, ref, computed } from 'vue'
import { Datastream, Thing } from '@/types'
import { useSensorStore } from '@/store/sensors'
import { useProcessingLevelStore } from '@/store/processingLevels'
import { useObservedPropertyStore } from '@/store/observedProperties'

const { fetchSensors, getSensorById } = useSensorStore()
const { fetchProcessingLevels, getById: getPLById } = useProcessingLevelStore()
const { fetchObservedProperties, getById: getOPById } =
  useObservedPropertyStore()

const { fetchDatastreamsByThingId } = useDatastreamStore()

const selectedThingId = ref('')
const datastreamsForThing = ref<Datastream[]>([])
const things = ref<Thing[]>([])
const usersThings = computed(() => things.value.filter((t) => t.isPrimaryOwner))

const emit = defineEmits(['selectedDatastreamId', 'close'])

watch(
  selectedThingId,
  async (newThingId) => {
    if (newThingId) {
      datastreamsForThing.value = await fetchDatastreamsByThingId(newThingId)
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
  const [fetchedThings] = await Promise.all([
    api.fetchThings(),
    fetchSensors(),
    fetchProcessingLevels(),
    fetchObservedProperties(),
  ])
  things.value = fetchedThings
})
</script>
