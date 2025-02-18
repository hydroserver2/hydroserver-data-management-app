<template>
  <v-card>
    <v-card-title>Use an existing datastream as a template</v-card-title>

    <v-divider class="my-4"></v-divider>

    <v-card-text>
      <v-col cols="12">
        Filter datastreams by site
        <v-select
          v-model="selectedThingId"
          :items="things"
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
                observedProperties.find(
                  (pl) => pl.id === datastream.observedPropertyId
                )?.name
              }}</strong>
            </p>
            <p><strong class="mr-2">Identifier:</strong> {{ datastream.id }}</p>
            <p>
              <strong class="mr-2">Processing Level:</strong>
              {{
                processingLevels.find(
                  (pl) => pl.id === datastream.processingLevelId
                )?.code
              }}
            </p>
            <p>
              <strong class="mr-2">Sampled Medium:</strong>
              {{ datastream.sampledMedium }}
            </p>
            <p>
              <strong class="mr-2">Sensor:</strong>
              {{ sensors.find((pl) => pl.id === datastream.sensorId)?.name }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { api } from '@/services/api'
import { watch, onMounted, ref } from 'vue'
import { Datastream, Thing } from '@/types'
import { useMetadata } from '@/composables/useMetadata'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/store/workspaces'

const { selectedWorkspace } = storeToRefs(useWorkspaceStore())

const { sensors, observedProperties, processingLevels } = useMetadata()

const datastreamsForThing = ref<Datastream[]>([])
const things = ref<Thing[]>([])
const selectedThingId = ref('')

const emit = defineEmits(['selectedDatastreamId', 'close'])

watch(
  selectedThingId,
  async (newId) => {
    if (!newId) {
      datastreamsForThing.value = []
      return
    }
    datastreamsForThing.value = await api.fetchDatastreamsForThing(newId)
  },
  { immediate: true }
)

function datastreamSelected(id: string) {
  emit('selectedDatastreamId', id)
  emit('close')
}

onMounted(async () => {
  const [fetchedThings] = await Promise.all([
    api.fetchThingsForWorkspace(selectedWorkspace.value!.id),
  ])
  things.value = (fetchedThings as Thing[]).sort((a, b) =>
    a.name.localeCompare(b.name)
  )
})
</script>
