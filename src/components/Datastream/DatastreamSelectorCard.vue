<template>
  <v-card>
    <v-toolbar color="primary-darken-2">
      <v-card-title>{{ cardTitle }}</v-card-title>
    </v-toolbar>

    <v-card-text>
      <v-row>
        <v-col cols="6">
          <v-list
            :items="things"
            item-title="name"
            item-value="id"
            variant="tonal"
          >
            <v-list-subheader>Sites</v-list-subheader>
            <div style="max-height: 800px; overflow-y: auto">
              <v-card
                v-for="site in things"
                :key="site.id"
                @click="selectedThingId = site.id"
                :color="
                  selectedThingId === site.id ? 'primary' : 'blue-darken-4'
                "
                :variant="selectedThingId === site.id ? 'tonal' : 'outlined'"
                class="mb-2"
              >
                <v-card-text class="py-3">
                  <div
                    class="text-subtitle-1 font-weight-bold text-primary-darken-1"
                  >
                    {{ site.name }}
                  </div>
                  <div class="text-caption text-grey-darken-1">
                    {{ site.siteType }}
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-list>
        </v-col>
        <v-col cols="6">
          <v-list>
            <v-list-subheader>Datastreams</v-list-subheader>
            <div
              style="max-height: 800px; overflow-y: auto"
              v-if="datastreamsForThing.length || !selectedThingId"
            >
              <v-card
                class="mb-2"
                v-for="datastream in datastreamsForThing"
                :key="datastream.id"
                @click="datastreamSelected(datastream.id)"
                color="blue-darken-4"
                variant="outlined"
              >
                <v-card-text class="py-4">
                  <!-- Observed Property (Most important) -->
                  <div class="mb-4">
                    <div class="text-h6 font-weight-bold text-primary-darken-1">
                      {{
                        observedProperties.find(
                          (op) => op.id === datastream.observedPropertyId
                        )?.name
                      }}
                    </div>
                    <div
                      class="text-caption font-weight-medium text-grey-darken-1"
                    >
                      Observed Property
                    </div>
                  </div>

                  <!-- Processing Level -->
                  <div class="mb-3">
                    <div class="text-subtitle-1 font-weight-medium">
                      {{
                        processingLevels.find(
                          (pl) => pl.id === datastream.processingLevelId
                        )?.definition
                      }}
                    </div>
                    <div class="text-caption text-grey-darken-1">
                      Processing Level
                    </div>
                  </div>

                  <v-divider class="my-3" />

                  <!-- Sensor and Sampled Medium (Less important) -->
                  <div class="grid gap-y-2">
                    <div class="flex items-center opacity-80">
                      <span
                        class="text-body-2 font-weight-medium text-grey-darken-2 mr-2"
                        >Sensor:</span
                      >
                      <span class="text-body-2">
                        {{
                          sensors.find((s) => s.id === datastream.sensorId)
                            ?.name
                        }}
                      </span>
                    </div>

                    <div class="flex items-center opacity-80">
                      <span
                        class="text-body-2 font-weight-medium text-grey-darken-2 mr-2"
                        >Sampled Medium:</span
                      >
                      <span class="text-body-2">{{
                        datastream.sampledMedium
                      }}</span>
                    </div>

                    <div class="flex items-center opacity-90">
                      <span
                        class="text-body-2 font-weight-medium text-grey-darken-2 mr-2"
                        >Identifier:</span
                      >
                      <span class="text-body-2">{{ datastream.id }}</span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>
            <template v-else>
              <v-card-text> No datastreams found for this site. </v-card-text>
            </template>
          </v-list>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { api } from '@/services/api'
import { watch, onMounted, ref } from 'vue'
import { Datastream, Thing, Workspace } from '@/types'
import { useMetadata } from '@/composables/useMetadata'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/store/workspaces'

const { selectedWorkspace } = storeToRefs(useWorkspaceStore())

const { sensors, observedProperties, processingLevels } = useMetadata()

const datastreamsForThing = ref<Datastream[]>([])
const things = ref<Thing[]>([])
const selectedThingId = ref('')

const emit = defineEmits(['selectedDatastreamId', 'close'])
const props = defineProps({
  cardTitle: { type: String, required: true },
  workspace: { type: Workspace, required: false },
})

watch(
  selectedThingId,
  async (newId) => {
    console.log('newID', newId)
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
  const workspaceId = props.workspace
    ? props.workspace.id
    : selectedWorkspace.value!.id
  things.value = await api.fetchThingsForWorkspace(workspaceId)
  things.value.sort((a, b) => a.name.localeCompare(b.name))
})
</script>
