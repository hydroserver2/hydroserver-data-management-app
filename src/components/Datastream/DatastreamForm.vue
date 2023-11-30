<template>
  <v-container class="mb-16">
    <h5 class="text-h5 py-5">
      {{ datastreamId ? 'Edit' : 'Create' }} Datastream
    </h5>

    <v-card
      class="outlined-container mb-10"
      v-if="!datastreamId && isPrimaryOwner"
    >
      <v-card-actions class="text-subtitle-2 text-medium-emphasis">
        Use an existing datastream as a template
        <v-spacer />
        <v-btn-primary @click="showTemplateModal = true"
          >Load template</v-btn-primary
        >
      </v-card-actions>
    </v-card>

    <v-dialog v-model="showTemplateModal" width="60rem">
      <DatastreamTemplateModal
        @selected-datastream-id="selectedDatastreamID = $event"
        @close="showTemplateModal = false"
      />
    </v-dialog>

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

        <v-card-text>
          <v-autocomplete
            :key="datastream.sensorId"
            v-model="datastream.sensorId"
            label="Select sensor *"
            :items="sensors"
            item-title="name"
            item-value="id"
            :rules="rules.required"
            no-data-text="No available sensors"
          >
            <template v-slot:append v-if="isPrimaryOwner">
              <v-btn-add @click="showSensorModal = true">Add New</v-btn-add>
              <v-dialog v-model="showSensorModal" width="60rem">
                <SensorModal
                  @uploaded="handleMetadataUploaded('sensorId', $event)"
                  @close="showSensorModal = false"
                />
              </v-dialog>
            </template>
          </v-autocomplete>
        </v-card-text>

        <v-card-text>
          <v-autocomplete
            v-model="datastream.observedPropertyId"
            label="Select observed property *"
            :items="observedProperties"
            item-title="name"
            item-value="id"
            :rules="rules.required"
            no-data-text="No available properties"
          >
            <template v-slot:append v-if="isPrimaryOwner">
              <v-btn-add @click="showOPModal = true">Add New</v-btn-add>
              <v-dialog v-model="showOPModal" width="60rem">
                <ObservedPropertyModal
                  @uploaded="
                    handleMetadataUploaded('observedPropertyId', $event)
                  "
                  @close="showOPModal = false"
                />
              </v-dialog>
            </template>
          </v-autocomplete>
        </v-card-text>

        <v-card-text>
          <v-autocomplete
            v-model="datastream.unitId"
            label="Select unit *"
            :items="units"
            item-title="name"
            item-value="id"
            :rules="rules.required"
            no-data-text="No available units"
          >
            <template v-slot:append v-if="isPrimaryOwner">
              <v-btn-add @click="openUnitForm = true">Add New</v-btn-add>
              <v-dialog v-model="openUnitForm" width="60rem">
                <UnitFormCard
                  @created="handleMetadataUploaded('unitId', $event)"
                  @close="openUnitForm = false"
                  >Add New</UnitFormCard
                >
              </v-dialog>
            </template>
          </v-autocomplete>
        </v-card-text>

        <v-card-text>
          <v-autocomplete
            v-model="datastream.processingLevelId"
            label="Select processing level *"
            :items="formattedProcessingLevels"
            item-title="title"
            item-value="id"
            :rules="rules.required"
            no-data-text="No available processing level"
          >
            <template v-slot:append v-if="isPrimaryOwner">
              <v-btn-add @click="showPLModal = true">Add New</v-btn-add>
              <v-dialog v-model="showPLModal" width="60rem">
                <ProcessingLevelModal
                  @uploaded="
                    handleMetadataUploaded('processingLevelId', $event)
                  "
                  @close="showPLModal = false"
                  >Add New</ProcessingLevelModal
                >
              </v-dialog>
            </template>
          </v-autocomplete>
        </v-card-text>
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
          />
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
                :items="timeUnits"
                item-title="name"
                item-value="id"
                :rules="rules.required"
                no-data-text="No available units"
                class="pb-1"
              ></v-autocomplete>
              <div v-if="isPrimaryOwner">
                <v-btn-add @click="openAggUnitForm = true">Add New</v-btn-add>
                <v-dialog v-model="openAggUnitForm" width="60rem">
                  <UnitFormCard
                    @uploaded="
                      datastream.timeAggregationIntervalUnitsId = $event
                    "
                    @close="openAggUnitForm = false"
                    >Add New</UnitFormCard
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
                :items="timeUnits"
                item-title="name"
                item-value="id"
                no-data-text="No available units"
                class="pb-1"
                clearable
              ></v-autocomplete>

              <div v-if="isPrimaryOwner">
                <v-btn-add @click="openITUnitForm = true">Add New</v-btn-add>
                <v-dialog v-model="openITUnitForm" width="60rem">
                  <UnitFormCard
                    @uploaded="datastream.intendedTimeSpacingUnitsId = $event"
                    @close="openITUnitForm = false"
                    >Add New</UnitFormCard
                  >
                </v-dialog>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-row>
        <v-col cols="auto">
          <v-btn-cancel @click="$router.go(-1)">
            <v-icon>mdi-arrow-left</v-icon>
            Return to previous page
          </v-btn-cancel>
        </v-col>
        <v-spacer></v-spacer>
        <v-col cols="auto">
          <v-btn-primary type="submit">{{
            datastreamId ? 'Update' : 'Save'
          }}</v-btn-primary>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import SensorModal from '@/components/Datastream/SensorModal.vue'
import DatastreamTemplateModal from '@/components/Datastream/DatastreamTemplateModal.vue'
import ObservedPropertyModal from '@/components/Datastream/ObservedPropertyModal.vue'
import UnitFormCard from '@/components/Metadata/UnitFormCard.vue'
import ProcessingLevelModal from '@/components/Datastream/ProcessingLevelModal.vue'
import { rules } from '@/utils/rules'
import { mediumTypes, aggregationTypes, statusTypes } from '@/vocabularies'
import { usePrimaryOwnerData } from '@/composables/usePrimaryOwnerData'
import { useDatastreamForm } from '@/composables/useDatastreamForm'
import { onMounted } from 'vue'
import { Datastream, Unit } from '@/types'
import { api } from '@/services/api'

const route = useRoute()
const thingId = route.params.id.toString()
const datastreamId = route.params.datastreamId?.toString() || ''

const timeUnits = ref<Unit[]>([])
const openUnitForm = ref(false)
const openAggUnitForm = ref(false)
const openITUnitForm = ref(false)

const isPrimaryOwner = ref(false)
const showTemplateModal = ref(false)
const showSensorModal = ref(false)
const showPLModal = ref(false)
const showOPModal = ref(false)

const { sensors, units, observedProperties, formattedProcessingLevels } =
  usePrimaryOwnerData(thingId)

const { datastream, selectedDatastreamID, uploadDatastream, valid, myForm } =
  useDatastreamForm(thingId, datastreamId)

const handleMetadataUploaded = async (
  updateId: keyof Datastream,
  newId: string
) => {
  if (datastream && updateId in datastream) {
    ;(datastream[updateId] as unknown as string) = newId
  }
}

onMounted(async () => {
  window.scrollTo(0, 0)
  const thing = await api.fetchThing(thingId)
  isPrimaryOwner.value = thing.isPrimaryOwner
  try {
    const fetchedUnits: Unit[] = await api.fetchUnits()
    timeUnits.value = fetchedUnits.filter((u) => u.type === 'Time')
  } catch (error) {
    console.error('Error fetching units from DB.', error)
  }
})
</script>

<style scoped>
.outlined-container {
  border: 1px solid rgba(33, 150, 243, 0.3);
  padding: 16px;
}
</style>
