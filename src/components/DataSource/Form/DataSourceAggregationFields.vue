<template>
  <v-divider />
  <v-card-item>
    <h6 class="text-h6 my-6">Source to target mapping</h6>
    <v-row>
      <v-col md="6">
        <v-row>
          <v-col cols="12">
            <v-btn
              color="primary-darken-2"
              variant="outlined"
              rounded="lg"
              @click="showSourceModal = true"
              prepend-icon="mdi-import"
              >Select source datastream</v-btn
            >
          </v-col>
          <v-col v-if="sourceDatastream.id">
            <DatastreamOverviewCard
              color="blue-grey-darken-3"
              :datastream="sourceDatastream"
            />
          </v-col>
        </v-row>
      </v-col>

      <v-col md="6">
        <v-row>
          <v-col cols="12">
            <v-btn
              color="primary-darken-2"
              variant="outlined"
              rounded="lg"
              @click="showDestinationModal = true"
              prepend-icon="mdi-import"
              >Select destination datastream</v-btn
            >
          </v-col>
          <v-col v-if="destinationDatastream.id">
            <DatastreamOverviewCard
              color="brown-darken-3"
              :datastream="destinationDatastream"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-card-item>

  <v-dialog v-model="showSourceModal" width="40rem">
    <DatastreamTemplateModal
      @selected-datastream-id="selectedSourceID = $event"
      @close="showSourceModal = false"
    />
  </v-dialog>

  <v-dialog v-model="showDestinationModal" width="40rem">
    <DatastreamTemplateModal
      @selected-datastream-id="selectedDestinationID = $event"
      @close="showDestinationModal = false"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import DatastreamTemplateModal from '@/components/Datastream/DatastreamTemplateModal.vue'
import DatastreamOverviewCard from '@/components/Datastream/DatastreamOverviewCard.vue'
import { Datastream } from '@/types'
import { api } from '@/services/api'

const sourceDatastream = ref<Datastream>(new Datastream())
const selectedSourceID = ref('')
const showSourceModal = ref(false)

const destinationDatastream = ref<Datastream>(new Datastream())
const selectedDestinationID = ref('')
const showDestinationModal = ref(false)

watch(selectedSourceID, async () => {
  try {
    const fetchedDS = await api.fetchDatastream(selectedSourceID.value)
    if (!fetchedDS) return
    Object.assign(sourceDatastream.value, fetchedDS)
  } catch (error) {
    console.error('Error loading datastream template', error)
  }
})

watch(selectedDestinationID, async () => {
  try {
    const fetchedDS = await api.fetchDatastream(selectedDestinationID.value)
    if (!fetchedDS) return
    Object.assign(destinationDatastream.value, fetchedDS)
  } catch (error) {
    console.error('Error loading datastream template', error)
  }
})
</script>
