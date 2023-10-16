<template>
  <v-container class="mb-16">
    <h5 class="text-h5 py-5">
      {{ datastreamId ? 'Edit' : 'Create' }} Datastream
    </h5>

    <v-card
      class="outlined-container mb-10"
      v-if="!datastreamId && isPrimaryOwner"
    >
      <v-card-text class="text-subtitle-2 text-medium-emphasis"
        >Use an existing datastream as a template</v-card-text
      >
      <v-autocomplete
        v-model="selectedDatastreamID"
        label="Select datastream"
        :items="formattedDatastreams"
        item-value="id"
      ></v-autocomplete>
    </v-card>

    <v-form
      v-if="datastream"
      @submit.prevent="uploadDatastream"
      ref="myForm"
      v-model="valid"
      validate-on="blur"
    >
      <v-card class="outlined-container mb-10">
        <v-card-text class="text-subtitle-2 text-medium-emphasis">
          Select the appropriate metadata to describe the the datastream you are
          adding to the monitoring site. If you want to modify the values
          available in the drop down menus below, click the “Add New” button or
          visit the
          <router-link to="/Metadata"> Manage Metadata page. </router-link>
        </v-card-text>

        <v-card-item>
          <v-autocomplete
            :key="datastream.sensorId"
            v-model="datastream.sensorId"
            label="Select sensor *"
            :items="sensors"
            item-title="name"
            item-value="id"
            :rules="rules.required"
            no-data-text="No available sensors"
            class="py-2"
          ></v-autocomplete>
          <div v-if="isPrimaryOwner">
            <v-btn-add @click="showSensorModal = true">Add New</v-btn-add>
            <v-dialog v-model="showSensorModal" width="60rem">
              <SensorModal
                @uploaded="datastream.sensorId = $event"
                @close="showSensorModal = false"
              ></SensorModal>
            </v-dialog>
          </div>
        </v-card-item>

        <v-card-item>
          <v-autocomplete
            v-model="datastream.observedPropertyId"
            label="Select observed property *"
            :items="observedProperties"
            item-title="name"
            item-value="id"
            :rules="rules.required"
            no-data-text="No available properties"
            class="py-2"
          ></v-autocomplete>
          <div v-if="isPrimaryOwner">
            <v-btn-add @click="showOPModal = true">Add New</v-btn-add>
            <v-dialog v-model="showOPModal" width="60rem">
              <ObservedPropertyModal
                @uploaded="datastream.observedPropertyId = $event"
                @close="showOPModal = false"
              ></ObservedPropertyModal>
            </v-dialog>
          </div>
        </v-card-item>

        <v-card-item>
          <v-autocomplete
            v-model="datastream.unitId"
            label="Select unit *"
            :items="units"
            item-title="name"
            item-value="id"
            :rules="rules.required"
            no-data-text="No available units"
            class="py-2"
          ></v-autocomplete>
          <div v-if="isPrimaryOwner">
            <v-btn-add @click="showUnitModal = true">Add New</v-btn-add>
            <v-dialog v-model="showUnitModal" width="60rem">
              <UnitModal
                @uploaded="datastream.unitId = $event"
                @close="showUnitModal = false"
                >Add New</UnitModal
              >
            </v-dialog>
          </div>
        </v-card-item>

        <v-card-item>
          <v-autocomplete
            v-model="datastream.processingLevelId"
            label="Select processing level *"
            :items="processingLevels"
            item-title="title"
            item-value="id"
            :rules="rules.required"
            no-data-text="No available processing level"
            class="py-2"
          ></v-autocomplete>
          <div v-if="isPrimaryOwner">
            <v-btn-add @click="showPLModal = true">Add New</v-btn-add>
            <v-dialog v-model="showPLModal" width="60rem">
              <ProcessingLevelModal
                @uploaded="datastream.processingLevelId = $event"
                @close="showPLModal = false"
                >Add New</ProcessingLevelModal
              >
            </v-dialog>
          </div>
        </v-card-item>
      </v-card>

      <v-card class="outlined-container mb-10">
        <v-card-text class="text-subtitle-2 text-medium-emphasis">
          For the following items, select an option or type your own. Note: the
          default selections won't be available if there is custom text in the
          field.
        </v-card-text>
        <v-card-text class="d-flex">
          <v-row>
            <v-col md="4" cols="12">
              <v-combobox
                :items="mediumTypes"
                v-model="datastream.sampledMedium"
                label="Medium *"
                :rules="rules.required"
              />
            </v-col>
            <v-col md="4" cols="12">
              <v-combobox
                :items="statusTypes"
                v-model="datastream.status"
                label="Status"
              />
            </v-col>
            <v-col md="4" cols="12">
              <v-combobox
                :items="aggregationTypes"
                v-model="datastream.aggregationStatistic"
                label="Aggregation Statistic *"
                :rules="rules.required"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card class="outlined-container mb-10">
        <v-card-text class="text-subtitle-2 text-medium-emphasis">
          When observation data is missing a value, what should the default be?
        </v-card-text>
        <v-card-text>
          <v-text-field
            v-model="datastream.noDataValue"
            label="No data value"
            :rules="datastream.noDataValue ? rules.maxLength(255) : []"
            type="number"
          ></v-text-field>
        </v-card-text>
      </v-card>

      <v-card class="outlined-container mb-10">
        <v-card-text class="text-subtitle-2 text-medium-emphasis">
          Add time aggregation interval and intended time spacing. Note: in
          order to create a new unit which appears in the dropdowns below, the
          unit type must be 'Time'.
        </v-card-text>
        <v-card-text>
          <v-row>
            <v-col md="6" cols="12">
              <v-text-field
                v-model="datastream.timeAggregationInterval"
                label="Time Aggregation Interval *"
                :rules="rules.requiredNumber"
                type="number"
                class="mb-4"
              ></v-text-field>

              <v-autocomplete
                v-model="datastream.timeAggregationIntervalUnitsId"
                label="Select time aggregation unit *"
                :items="unitStore.timeUnits"
                item-title="name"
                item-value="id"
                :rules="rules.required"
                no-data-text="No available units"
                class="pb-1"
              ></v-autocomplete>
              <div v-if="isPrimaryOwner">
                <v-btn-add @click="showTimeAggUnitModal = true"
                  >Add New</v-btn-add
                >
                <v-dialog v-model="showTimeAggUnitModal" width="60rem">
                  <UnitModal
                    @uploaded="
                      datastream.timeAggregationIntervalUnitsId = $event
                    "
                    @close="showTimeAggUnitModal = false"
                    >Add New</UnitModal
                  >
                </v-dialog>
              </div>
            </v-col>

            <v-col md="6" cols="12">
              <v-text-field
                v-model="datastream.intendedTimeSpacing"
                label="Intended Time Spacing"
                type="number"
                class="mb-4"
              ></v-text-field>

              <v-autocomplete
                v-model="datastream.intendedTimeSpacingUnitsId"
                label="Select intended time spacing unit"
                :items="unitStore.timeUnits"
                item-title="name"
                item-value="id"
                no-data-text="No available units"
                class="pb-1"
                clearable
              ></v-autocomplete>
              <div v-if="isPrimaryOwner">
                <v-btn-add @click="showIntendedTimeModal = true"
                  >Add New</v-btn-add
                >
                <v-dialog v-model="showIntendedTimeModal" width="60rem">
                  <UnitModal
                    @uploaded="datastream.intendedTimeSpacingUnitsId = $event"
                    @close="showIntendedTimeModal = false"
                    >Add New</UnitModal
                  >
                </v-dialog>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-row>
        <v-col cols="auto">
          <v-btn @click="$router.go(-1)">
            <v-icon>mdi-arrow-left</v-icon>
            Return to previous page
          </v-btn>
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
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import SensorModal from '@/components/Datastream/SensorModal.vue'
import ObservedPropertyModal from '@/components/Datastream/ObservedPropertyModal.vue'
import UnitModal from '@/components/Datastream/UnitModal.vue'
import ProcessingLevelModal from '@/components/Datastream/ProcessingLevelModal.vue'
import { useUnitStore } from '@/store/unit'
import { rules } from '@/utils/rules'
import { mediumTypes, aggregationTypes, statusTypes } from '@/vocabularies'
import { usePrimaryOwnerData } from '@/composables/usePrimaryOwnerData'
import { useDatastreamForm } from '@/composables/useDatastreamForm'
import { onMounted } from 'vue'
import { useFormattedDatastreams } from '@/composables/useFormattedDatastreams'
import { useThingOwnership } from '@/composables/useThingOwnership'

const unitStore = useUnitStore()

const route = useRoute()
const thingId = route.params.id.toString()
const datastreamId = route.params.datastreamId?.toString() || ''
const { isPrimaryOwner } = useThingOwnership(thingId)

const { sensors, units, observedProperties, processingLevels } =
  usePrimaryOwnerData(thingId)

const { datastream, selectedDatastreamID, uploadDatastream, valid, myForm } =
  useDatastreamForm(thingId, datastreamId)

const { formattedDatastreams } = useFormattedDatastreams()

const showSensorModal = ref(false)
const showUnitModal = ref(false)
const showPLModal = ref(false)
const showOPModal = ref(false)
const showTimeAggUnitModal = ref(false)
const showIntendedTimeModal = ref(false)

onMounted(() => window.scrollTo(0, 0))
</script>

<style scoped>
.outlined-container {
  border: 1px solid rgba(33, 150, 243, 0.3);
  padding: 16px;
}
</style>
