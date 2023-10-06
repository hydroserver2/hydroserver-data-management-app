<template>
  <v-data-table
    class="elevation-3"
    :headers="headers"
    :items="visibleDatastreams"
  >
    <template v-slot:item.info="{ item }">
      <v-col>
        <v-row style="font-size: 1.2em">
          <strong class="mr-2">Observed Property:</strong>
          <strong>{{ OPName(item.raw.observedPropertyId) }}</strong>
        </v-row>
        <v-row>
          <strong class="mr-2">Identifier:</strong> {{ item.raw.id }}
        </v-row>
        <v-row>
          <strong class="mr-2">Processing Level:</strong>
          {{ PLName(item.raw.processingLevelId, 'code') }}
        </v-row>
        <v-row>
          <strong class="mr-2">Sampled Medium:</strong>
          {{ item.raw.sampledMedium }}
        </v-row>
        <v-row>
          <strong class="mr-2">Sensor:</strong>
          {{ sensorName(item.raw.sensorId) }}
        </v-row>
      </v-col>
    </template>

    <template v-slot:item.observations="{ item }">
      <div v-if="observations[item.raw.id]">
        <v-dialog v-model="item.raw.chartOpen" width="80rem">
          <SiteVisualization
            :thing-id="thingId"
            :datastream-id="item.raw.id"
            @close="item.raw.chartOpen = false"
          ></SiteVisualization>
        </v-dialog>
        <Sparkline
          @click="item.raw.chartOpen = true"
          class="pt-2"
          :is-stale="isStale(item.raw.phenomenonEndTime)"
          :observations="observations[item.raw.id]"
        />
      </div>
      <div v-else>No data for this datastream</div>
    </template>
    <template v-slot:item.last_observation="{ item }">
      <div v-if="mostRecentObs[item.raw.id]">
        <v-row>
          {{ formatDate(mostRecentObs[item.raw.id].date) }}
        </v-row>
        <v-row>
          {{ mostRecentObs[item.raw.id].value }}&nbsp;
          {{ unitName(item.raw.unitId) }}
        </v-row>
      </div>
    </template>

    <template v-slot:item.actions="{ item }">
      <v-row>
        <v-tooltip bottom :openDelay="500" v-if="item.raw.isVisible">
          <template v-slot:activator="{ props }" v-if="isOwner">
            <v-btn
              small
              color="grey"
              v-bind="props"
              icon="mdi-eye"
              @click="toggleVisibility(item.raw)"
            />
          </template>
          <span
            >Hide this datastream from guests of your site. Owners will still
            see it</span
          >
        </v-tooltip>
        <v-tooltip bottom :openDelay="500" v-else>
          <template v-slot:activator="{ props }" v-if="isOwner">
            <v-btn
              small
              color="grey-lighten-1"
              v-bind="props"
              icon="mdi-eye-off"
              @click="toggleVisibility(item.raw)"
            />
          </template>
          <span>Make this datastream publicly visible</span>
        </v-tooltip>

        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="mdi-dots-vertical" />
          </template>
          <v-list>
            <v-list-item
              v-if="isOwner"
              prepend-icon="mdi-link-variant"
              title="Link Data Source"
              @click="
                handleLinkDataSource(
                  item.raw.id,
                  item.raw.data_source_id,
                  item.raw.column
                )
              "
            />
            <v-list-item
              v-if="isOwner"
              prepend-icon="mdi-pencil"
              title="Edit Datastream Metadata"
              :to="{
                name: 'DatastreamForm',
                params: { id: thingId, datastreamId: item.raw.id },
              }"
            />
            <v-list-item
              v-if="isOwner"
              prepend-icon="mdi-chart-line"
              title="View Time Series Plot"
              @click="item.raw.chartOpen = true"
            />
            <v-list-item
              v-if="isOwner"
              prepend-icon="mdi-delete"
              title="Delete Datastream"
              @click="openDeleteModal(item.raw)"
            />
            <v-list-item
              prepend-icon="mdi-download"
              title="Download Data"
              @click="datastreamStore.downloadDatastream(item.raw.id)"
            />
          </v-list>
        </v-menu>
      </v-row>
    </template>
  </v-data-table>
  <v-dialog
    v-if="selectedDatastream"
    v-model="isDSDeleteModalOpen"
    width="40rem"
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">Confirm Deletion</span>
      </v-card-title>
      <v-card-text>
        Are you sure you want to permanently delete the this datastream and all
        the observations associated with it?
        <br />
        <br />
        <strong>ID:</strong> {{ selectedDatastream.id }} <br />
      </v-card-text>
      <v-card-text>
        Please type <strong> Delete </strong> to confirm deletion:
        <v-form>
          <v-text-field
            v-model="deleteDatastreamInput"
            solo
            @keydown.enter.prevent="deleteDatastream"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="isDSDeleteModalOpen = false">Cancel</v-btn>
        <v-btn color="delete" @click="deleteDatastream">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="linkDataSourceDialogOpen" persistent>
    <SiteLinkDataSourceForm
      @close-dialog="handleCloseDataSourceDialog"
      :thingId="thingId"
      :datastreamId="linkFormDatastreamId"
      :dataSourceId="linkFormDataSourceId"
      :column="linkFormColumn"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import SiteVisualization from '@/components/Datastream/SiteVisualization.vue'
import SiteLinkDataSourceForm from '@/components/Site/SiteLinkDataSourceForm.vue'
import Sparkline from '@/components/Sparkline.vue'
import { useDatastreams } from '@/composables/useDatastreams'
import { format } from 'date-fns'
import { useVisibleDatastreams } from '@/composables/useVisibleDatastreams'
import { ref } from 'vue'
import { useThingOwnership } from '@/composables/useThingOwnership'
import { useDatastreamStore } from '@/store/datastreams'
import {
  useUnitGetters,
  useSensorGetters,
  useProcessingLevelGetters,
  useObservedPropertiesGetters,
} from '@/composables/useMetadataGetters'

const datastreamStore = useDatastreamStore()

const props = defineProps({
  thingId: {
    type: String,
    required: true,
  },
})

const { isOwner } = useThingOwnership(props.thingId)
const { visibleDatastreams, observations, mostRecentObs } =
  useVisibleDatastreams(props.thingId)

const { getNameById: unitName } = useUnitGetters()
const { getNameById: sensorName } = useSensorGetters()
const { getNameById: PLName } = useProcessingLevelGetters()
const { getNameById: OPName } = useObservedPropertiesGetters()

const {
  toggleVisibility,
  selectedDatastream,
  openDeleteModal,
  deleteDatastream,
  isDeleteModalOpen: isDSDeleteModalOpen,
  deleteDatastreamInput,
} = useDatastreams(props.thingId)

const headers = [
  { title: 'DataStream Info', key: 'info', sortable: true },
  {
    title: 'Observations (Last 72 Hours)',
    key: 'observations',
    sortable: false,
  },
  { title: 'Last Observation', key: 'last_observation' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const linkFormDatastreamId = ref()
const linkFormDataSourceId = ref()
const linkFormColumn = ref()
const linkDataSourceDialogOpen = ref(false)

function handleLinkDataSource(
  datastreamId: string,
  dataSourceId: string,
  column: string | number
) {
  linkFormDatastreamId.value = datastreamId
  linkFormDataSourceId.value = dataSourceId
  linkFormColumn.value = column
  linkDataSourceDialogOpen.value = true
}

function handleCloseDataSourceDialog() {
  linkDataSourceDialogOpen.value = false
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return format(date, 'MMM dd, yyyy HH:mm')
}

function isStale(timestamp: string) {
  let endTime = new Date(timestamp)
  let seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000)
  return endTime < seventyTwoHoursAgo
}
</script>
