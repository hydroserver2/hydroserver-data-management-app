<template>
  <v-container>
    <v-row>
      <v-col>
        <h5 class="text-h5">
          {{ datastreamId ? 'Edit' : 'Create' }} Datastream
        </h5>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <p class="mb-2">
          Select the appropriate metadata to describe the the datastream you are
          adding to the monitoring site. If you want to modify the values
          available in the drop down menus below, click the “Add New” button or
          visit the
          <router-link to="/Metadata"> Manage Metadata page. </router-link>
        </p>
      </v-col>
    </v-row>
    <v-row v-if="isPrimaryOwner">
      <v-col>
        <v-autocomplete
          v-if="!datastreamId"
          v-model="selectedDatastreamID"
          label="Use an existing datastream as a template"
          :items="formattedDatastreams"
          item-value="id"
        ></v-autocomplete>
      </v-col>
    </v-row>

    <v-form
      v-if="datastream"
      @submit.prevent="uploadDatastream"
      ref="myForm"
      v-model="valid"
      validate-on="blur"
    >
      <v-row>
        <v-col cols="12" md="6">
          <v-autocomplete
            :key="datastream.sensorId"
            v-model="datastream.sensorId"
            label="Select sensor *"
            :items="
              isPrimaryOwner
                ? sensorStore.sensors
                : thingStore.POMetadata[thingId].sensors
            "
            item-title="name"
            item-value="id"
            :rules="rules.required"
            no-data-text="No available sensors"
            class="pb-1"
          ></v-autocomplete>
          <v-btn-add v-if="isPrimaryOwner" @click="showSensorModal = true"
            >Add New</v-btn-add
          >
          <v-dialog
            v-if="isPrimaryOwner"
            v-model="showSensorModal"
            width="60rem"
          >
            <sensor-modal
              @uploaded="datastream.sensorId = $event"
              @close="showSensorModal = false"
            ></sensor-modal>
          </v-dialog>
        </v-col>
        <v-col cols="12" md="6">
          <v-autocomplete
            v-model="datastream.observedPropertyId"
            label="Select observed property *"
            :items="
              isPrimaryOwner
                ? opStore.ownedOP
                : thingStore.POMetadata[thingId].observed_properties
            "
            item-title="name"
            item-value="id"
            :rules="rules.required"
            no-data-text="No available properties"
            class="pb-1"
          ></v-autocomplete>
          <v-dialog v-if="isPrimaryOwner" v-model="showOPModal" width="60rem">
            <ObservedPropertyModal
              @uploaded="datastream.observedPropertyId = $event"
              @close="showOPModal = false"
            ></ObservedPropertyModal>
          </v-dialog>
          <v-btn-add v-if="isPrimaryOwner" @click="showOPModal = true"
            >Add New</v-btn-add
          >
        </v-col>
        <v-col cols="12" md="6">
          <v-autocomplete
            v-model="datastream.unitId"
            label="Select unit *"
            :items="
              isPrimaryOwner
                ? unitStore.ownedUnits
                : thingStore.POMetadata[thingId].units
            "
            item-title="name"
            item-value="id"
            :rules="rules.required"
            no-data-text="No available units"
            class="pb-1"
          ></v-autocomplete>
          <v-btn-add v-if="isPrimaryOwner" @click="showUnitModal = true"
            >Add New</v-btn-add
          >
          <v-dialog v-if="isPrimaryOwner" v-model="showUnitModal" width="60rem">
            <UnitModal
              @uploaded="datastream.unitId = $event"
              @close="showUnitModal = false"
              >Add New</UnitModal
            >
          </v-dialog>
        </v-col>
        <v-col cols="12" md="6">
          <v-autocomplete
            v-model="datastream.processingLevelId"
            label="Select processing level *"
            :items="formattedProcessingLevels"
            item-title="title"
            item-value="id"
            :rules="rules.required"
            no-data-text="No available processing level"
            class="pb-1"
          ></v-autocomplete>
          <v-btn-add v-if="isPrimaryOwner" @click="showPLModal = true"
            >Add New</v-btn-add
          >
          <v-dialog v-if="isPrimaryOwner" v-model="showPLModal" width="60rem">
            <ProcessingLevelModal
              @uploaded="datastream.processingLevelId = $event"
              @close="showPLModal = false"
              >Add New</ProcessingLevelModal
            >
          </v-dialog>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <p class="mt-2">
            For the following items, select an option or type your own. Note:
            the default selections won't be available if there is custom text in
            the field.
          </p>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="4">
          <v-combobox
            :items="mediumTypes"
            v-model="datastream.sampledMedium"
            label="Medium"
          />
        </v-col>
        <v-col cols="4">
          <v-combobox
            :items="statusTypes"
            v-model="datastream.status"
            label="Status"
          />
        </v-col>
        <v-col cols="4">
          <v-combobox
            :items="aggregationTypes"
            v-model="datastream.aggregationStatistic"
            label="Aggregation Statistic"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-model="datastream.noDataValue"
            label="No data value"
            :rules="datastream.noDataValue ? rules.maxLength(255) : []"
            type="number"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="datastream.timeAggregationInterval"
            label="Time Aggregation Interval *"
            :rules="rules.required"
            type="number"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="6">
          <v-autocomplete
            v-model="datastream.timeAggregationIntervalUnitsId"
            label="Select time aggregation unit *"
            :items="
              isPrimaryOwner
                ? unitStore.ownedUnits
                : thingStore.POMetadata[thingId].units
            "
            item-title="name"
            item-value="id"
            :rules="rules.required"
            no-data-text="No available units"
            class="pb-1"
          ></v-autocomplete>
          <v-btn-add v-if="isPrimaryOwner" @click="showTimeAggUnitModal = true"
            >Add New</v-btn-add
          >
          <v-dialog
            v-if="isPrimaryOwner"
            v-model="showTimeAggUnitModal"
            width="60rem"
          >
            <UnitModal
              @uploaded="datastream.timeAggregationIntervalUnitsId = $event"
              @close="showTimeAggUnitModal = false"
              >Add New</UnitModal
            >
          </v-dialog>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="datastream.intendedTimeSpacing"
            label="Intended Time Spacing"
            type="number"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-autocomplete
            v-model="datastream.intendedTimeSpacingUnitsId"
            label="Select intended time spacing unit"
            :items="
              isPrimaryOwner
                ? unitStore.ownedUnits
                : thingStore.POMetadata[thingId].units
            "
            item-title="name"
            item-value="id"
            no-data-text="No available units"
            class="pb-1"
            clearable
          ></v-autocomplete>
          <v-btn-add v-if="isPrimaryOwner" @click="showIntendedTimeModal = true"
            >Add New</v-btn-add
          >
          <v-dialog
            v-if="isPrimaryOwner"
            v-model="showIntendedTimeModal"
            width="60rem"
          >
            <UnitModal
              @uploaded="datastream.intendedTimeSpacingUnitsId = $event"
              @close="showIntendedTimeModal = false"
              >Add New</UnitModal
            >
          </v-dialog>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="auto">
          <v-btn-cancel @click="$router.go(-1)">
            <v-icon>mdi-arrow-left</v-icon>
            Return to previous page
          </v-btn-cancel>
        </v-col>
        <v-spacer></v-spacer>
        <v-col cols="auto">
          <v-btn type="submit" color="secondary">{{
            datastreamId ? 'Update' : 'Save'
          }}</v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router/router'
import SensorModal from '@/components/Datastream/SensorModal.vue'
import ObservedPropertyModal from '@/components/Datastream/ObservedPropertyModal.vue'
import UnitModal from '@/components/Datastream/UnitModal.vue'
import ProcessingLevelModal from '@/components/Datastream/ProcessingLevelModal.vue'
import { useDatastreamStore } from '@/store/datastreams'
import { useSensorStore } from '@/store/sensors'
import { useObservedPropertyStore } from '@/store/observedProperties'
import { useUnitStore } from '@/store/unit'
import { useProcessingLevelStore } from '@/store/processingLevels'
import { Datastream } from '@/types'
import { useThingStore } from '@/store/things'
import { VForm } from 'vuetify/components'
import { rules } from '@/utils/rules'
import { useThing } from '@/composables/useThing'
import { mediumTypes, aggregationTypes, statusTypes } from '@/vocabularies'
import {
  useSensors,
  useUnits,
  useProcessingLevels,
  useObservedProperties,
} from '@/composables/useMetadata'

const datastreamStore = useDatastreamStore()
const sensorStore = useSensorStore()
const opStore = useObservedPropertyStore()
const unitStore = useUnitStore()
const plStore = useProcessingLevelStore()
const thingStore = useThingStore()

const route = useRoute()
const thingId = route.params.id.toString()
const datastreamId = route.params.datastreamId?.toString() || ''
const selectedDatastreamID = ref(datastreamId)

const { isPrimaryOwner } = useThing(thingId)
const { isCreateEditModalOpen: showSensorModal } = useSensors()
const { isCreateEditModalOpen: showUnitModal } = useUnits()
const { isCreateEditModalOpen: showPLModal } = useProcessingLevels()
const { isCreateEditModalOpen: showOPModal } = useObservedProperties()

const showTimeAggUnitModal = ref(false)
const showIntendedTimeModal = ref(false)
const valid = ref(false)
const myForm = ref<VForm>()

const datastream = reactive<Datastream>(new Datastream(thingId))

const formattedDatastreams = computed(() => {
  return datastreamStore.primaryOwnedDatastreams.map((datastream) => ({
    id: datastream.id,
    title: `Sensor:${datastream.sensorName},  Observed Property: ${datastream.observedPropertyName},
     Unit: ${datastream.unitName},  Processing Level: ${datastream.processingLevelName},
      Sampled Medium ${datastream.sampledMedium}`,
  }))
})

const formattedProcessingLevels = computed(() => {
  let processingLevels
  if (isPrimaryOwner.value) {
    processingLevels = plStore.ownedProcessingLevels
  } else {
    processingLevels = thingStore.POMetadata[thingId].processing_levels
  }
  return processingLevels.map((pl) => ({
    id: pl.id,
    title: `${pl.code} : ${pl.definition}`,
  }))
})

watch(selectedDatastreamID, async () => {
  populateForm(selectedDatastreamID.value)
  await myForm.value?.validate()
})

function populateForm(id: string) {
  Object.assign(datastream, datastreamStore.getDatastreamById(id))
  datastream.thingId = thingId
}

async function loadDatastreams() {
  await datastreamStore.fetchDatastreams()
  if (datastreamId) populateForm(datastreamId)
}

async function uploadDatastream() {
  await myForm.value?.validate()
  if (!valid.value) return
  if (datastreamId) await datastreamStore.updateDatastream(datastream)
  else await datastreamStore.createDatastream(datastream)
  await router.push({ name: 'SingleSite', params: { id: thingId } })
}

onMounted(async () => {
  if (!isPrimaryOwner.value)
    thingStore.fetchPrimaryOwnerMetadataByThingId(thingId)

  loadDatastreams()
})
</script>
