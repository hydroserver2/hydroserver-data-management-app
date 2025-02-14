<template>
  <v-container v-if="!canCreateDatastreams">
    <v-row justify="center" align="center">
      <v-col class="text-center" cols="12">
        <h5 class="text-h5">
          You don't have the required permissions to add datastreams to this
          site.
        </h5>
      </v-col>
    </v-row>
  </v-container>
  <v-container v-else>
    <v-card elevation="3">
      <v-card-title class="my-2">
        <v-row align="center">
          <v-btn
            icon="mdi-arrow-left"
            size="large"
            color="black"
            variant="text"
            @click="router.go(-1)"
          >
          </v-btn>

          <v-spacer />
          {{ datastreamId ? 'Edit' : 'Create' }} datastream
          <v-spacer />

          <v-btn
            v-if="!datastreamId"
            color="primary-darken-2"
            variant="outlined"
            rounded="lg"
            @click="showTemplateModal = true"
            prepend-icon="mdi-import"
            >Load template</v-btn
          >
        </v-row>
      </v-card-title>

      <v-dialog v-model="showTemplateModal" width="60rem">
        <DatastreamTemplateModal
          @selected-datastream-id="selectedDatastreamID = $event"
          @close="showTemplateModal = false"
        />
      </v-dialog>

      <v-divider />

      <v-form
        v-if="datastream"
        @submit.prevent="uploadDatastream"
        ref="myForm"
        v-model="valid"
        validate-on="blur"
      >
        <v-row>
          <v-col cols="12" md="6">
            <v-card-title
              >Linked metadata
              <v-icon
                size="x-small"
                class="ml-2"
                @click="showLinkedMetadataHelp = !showLinkedMetadataHelp"
              >
                mdi-help-circle-outline
              </v-icon>
            </v-card-title>
            <v-card-text
              v-if="showLinkedMetadataHelp"
              class="text-subtitle-2 text-medium-emphasis"
            >
              Select the appropriate metadata to describe the the datastream you
              are adding to the monitoring site. If you want to modify the
              values available in the drop down menus below, click the "+"
              button or visit the
              <router-link to="/Metadata"> Manage metadata page. </router-link>
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
                prepend-inner-icon="mdi-signal-variant"
                density="compact"
                rounded="lg"
              >
                <template v-slot:append v-if="canCreateSensors">
                  <v-icon
                    color="secondary-darken-2"
                    @click="showSensorModal = true"
                    >mdi-plus</v-icon
                  >
                  <v-dialog v-model="showSensorModal" width="60rem">
                    <SensorFormCard
                      @created="handleMetadataUploaded('sensorId', $event)"
                      @close="showSensorModal = false"
                    />
                  </v-dialog>
                </template>
              </v-autocomplete>

              <v-autocomplete
                v-model="datastream.observedPropertyId"
                label="Select observed property *"
                :items="formattedObservedProperties"
                item-title="title"
                item-value="id"
                :rules="rules.required"
                no-data-text="No available properties"
                prepend-inner-icon="mdi-water-thermometer"
                density="compact"
                rounded="lg"
              >
                <template v-slot:item="{ props, item }">
                  <v-tooltip bottom :openDelay="1500">
                    <template v-slot:activator="{ props: tooltipProps }">
                      <v-list-item v-bind="{ ...props, ...tooltipProps }">
                      </v-list-item>
                    </template>
                    <span>{{ item.title }}</span>
                  </v-tooltip>
                </template>
                <template v-slot:append v-if="canCreateObservedProperties">
                  <v-icon color="secondary-darken-2" @click="showOPModal = true"
                    >mdi-plus</v-icon
                  >
                  <v-dialog v-model="showOPModal" width="60rem">
                    <ObservedPropertyFormCard
                      @created="
                        handleMetadataUploaded('observedPropertyId', $event)
                      "
                      @close="showOPModal = false"
                    />
                  </v-dialog>
                </template>
              </v-autocomplete>

              <v-autocomplete
                v-model="datastream.unitId"
                label="Select unit *"
                :items="units"
                item-title="name"
                item-value="id"
                :rules="rules.required"
                no-data-text="No available units"
                prepend-inner-icon="mdi-tape-measure"
                density="compact"
                rounded="lg"
              >
                <template v-slot:append v-if="canCreateUnits">
                  <v-icon
                    color="secondary-darken-2"
                    @click="openUnitForm = true"
                    >mdi-plus</v-icon
                  >
                  <v-dialog v-model="openUnitForm" width="60rem">
                    <UnitFormCard
                      @created="handleMetadataUploaded('unitId', $event)"
                      @close="openUnitForm = false"
                      >Add New</UnitFormCard
                    >
                  </v-dialog>
                </template>
              </v-autocomplete>

              <v-autocomplete
                v-model="datastream.processingLevelId"
                label="Select processing level *"
                :items="formattedProcessingLevels"
                item-title="title"
                item-value="id"
                :rules="rules.required"
                no-data-text="No available processing level"
                prepend-inner-icon="mdi-check-circle"
                density="compact"
                rounded="lg"
              >
                <template v-slot:append v-if="canCreateProcessingLevels">
                  <v-icon color="secondary-darken-2" @click="showPLModal = true"
                    >mdi-plus</v-icon
                  >
                  <v-dialog v-model="showPLModal" width="60rem">
                    <ProcessingLevelFormCard
                      @created="
                        handleMetadataUploaded('processingLevelId', $event)
                      "
                      @close="showPLModal = false"
                      >Add New</ProcessingLevelFormCard
                    >
                  </v-dialog>
                </template>
              </v-autocomplete>
            </v-card-text>
          </v-col>

          <v-col cols="12" md="6">
            <v-card-title>Time spacing</v-card-title>
            <v-card-text>
              <v-text-field
                v-model="datastream.timeAggregationInterval"
                label="Time aggregation interval *"
                :rules="[
                  ...rules.requiredNumber,
                  () =>
                    datastream.timeAggregationIntervalUnits != null ||
                    'An interval must be selected.',
                ]"
                type="number"
                density="compact"
                rounded="lg"
                prepend-inner-icon="mdi-clock-time-three"
              />

              <v-col
                cols="12"
                align="center"
                justify="center"
                class="no-wrap pt-0 mb-4"
              >
                <v-btn-toggle
                  v-model="datastream.timeAggregationIntervalUnits"
                  label="Time aggregation unit *"
                  :items="timeUnits"
                  variant="outlined"
                  color="primary"
                  density="compact"
                  rounded="xl"
                  divided
                  mandatory
                >
                  <v-btn v-for="unit in timeUnits" :value="unit">{{
                    unit
                  }}</v-btn>
                </v-btn-toggle>
              </v-col>

              <v-text-field
                v-model="datastream.intendedTimeSpacing"
                label="Intended time spacing"
                :rules="[
                  () =>
                    !datastream.intendedTimeSpacing ||
                    datastream.intendedTimeSpacingUnits != null ||
                    'Unit is required when a time spacing value is provided.',
                ]"
                type="number"
                density="compact"
                rounded="lg"
                prepend-inner-icon="mdi-timer"
              />

              <v-col
                cols="12"
                align="center"
                justify="center"
                class="no-wrap pt-0"
              >
                <v-btn-toggle
                  v-model="datastream.intendedTimeSpacingUnits"
                  label="Intended time spacing unit"
                  :items="timeUnits"
                  variant="outlined"
                  color="primary"
                  density="compact"
                  rounded="xl"
                  divided
                >
                  <v-btn v-for="unit in timeUnits" :value="unit">{{
                    unit
                  }}</v-btn>
                </v-btn-toggle>
              </v-col>
            </v-card-text>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <v-card-title>Datastream attributes</v-card-title>
            <v-card-text class="text-subtitle-2 text-medium-emphasis">
              For the following items, select an option or type your own. Note:
              the default selections won't be available if there is custom text
              in the field.
            </v-card-text>
            <v-card-text class="pb-0">
              <v-combobox
                :items="mediumTypes"
                v-model="datastream.sampledMedium"
                label="Medium *"
                :rules="rules.required"
                density="compact"
                rounded="xl"
                prepend-inner-icon="mdi-air-filter"
              />

              <v-combobox
                :items="statusTypes"
                v-model="datastream.status"
                label="Status"
                density="compact"
                rounded="xl"
                prepend-inner-icon="mdi-list-status"
              />

              <v-combobox
                :items="aggregationTypes"
                v-model="datastream.aggregationStatistic"
                label="Aggregation statistic *"
                :rules="rules.requiredAndMaxLength255"
                density="compact"
                rounded="xl"
                prepend-inner-icon="mdi-table-column"
              />
            </v-card-text>

            <v-card-text class="text-subtitle-2 text-medium-emphasis pt-2">
              When observation data is missing a value, what should the default
              be?
            </v-card-text>
            <v-card-text>
              <v-text-field
                v-model="datastream.noDataValue"
                label="No data value *"
                :rules="rules.required"
                type="number"
                density="compact"
                rounded="lg"
                prepend-inner-icon="mdi-circle-off-outline"
              />
            </v-card-text>
          </v-col>

          <v-col cols="12" md="6">
            <v-card-title>Name and description</v-card-title>
            <v-card-text class="text-subtitle-2 text-medium-emphasis">
              Enter a name and description for this datastream, or opt to
              auto-fill with default text. If you choose the defaults, make sure
              you've first filled out the rest of the form correctly as the
              website will generate text based on the current form fields.
            </v-card-text>

            <v-card-text>
              <v-text-field
                v-model="datastream.name"
                label="Datastream name *"
                :rules="rules.requiredAndMaxLength255"
                density="compact"
                rounded="lg"
              />

              <v-row justify="end">
                <v-col cols="auto">
                  <v-spacer />
                  <v-btn
                    variant="text"
                    color="grey-darken-4"
                    :disabled="datastream.name === originalName"
                    @click="datastream.name = originalName"
                  >
                    Revert
                  </v-btn>
                  <v-btn
                    color="primary-darken-2"
                    variant="outlined"
                    rounded="xl"
                    class="ml-2"
                    @click="datastream.name = generateDefaultName()"
                    >Auto-Fill from Form</v-btn
                  >
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-text>
              <v-textarea
                v-model="datastream.description"
                label="Datastream description *"
                :rules="rules.requiredDescription"
                rounded="lg"
              />

              <v-row justify="end">
                <v-col cols="auto">
                  <v-spacer />
                  <v-btn
                    variant="text"
                    color="grey-darken-4"
                    :disabled="datastream.description === originalDescription"
                    @click="datastream.description = originalDescription"
                  >
                    Revert
                  </v-btn>
                  <v-btn
                    color="primary-darken-2"
                    variant="outlined"
                    rounded="xl"
                    class="ml-2"
                    @click="
                      datastream.description = generateDefaultDescription()
                    "
                    >Auto-Fill from Form</v-btn
                  >
                </v-col>
              </v-row>
            </v-card-text>
          </v-col>
        </v-row>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn-primary type="submit" class="my-4"
            >{{ datastreamId ? 'Update' : 'Create' }} datastream</v-btn-primary
          >
        </v-card-actions>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DatastreamTemplateModal from '@/components/Datastream/DatastreamTemplateModal.vue'
import SensorFormCard from '@/components/Metadata/SensorFormCard.vue'
import ObservedPropertyFormCard from '@/components/Metadata/ObservedPropertyFormCard.vue'
import UnitFormCard from '@/components/Metadata/UnitFormCard.vue'
import ProcessingLevelFormCard from '@/components/Metadata/ProcessingLevelFormCard.vue'
import { rules } from '@/utils/rules'
import { Snackbar } from '@/utils/notifications'
import {
  mediumTypes,
  aggregationTypes,
  statusTypes,
} from '@/config/vocabularies'
import { useMetadata } from '@/composables/useMetadata'
import { Thing } from '@/types'
import { api } from '@/services/api'
import { Datastream } from '@/types'
import { VForm } from 'vuetify/components'
import router from '@/router/router'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/store/workspaces'
import { useWorkspacePermissions } from '@/composables/useWorkspacePermissions'

const { selectedWorkspace } = storeToRefs(useWorkspaceStore())
const {
  canCreateObservedProperties,
  canCreateProcessingLevels,
  canCreateSensors,
  canCreateUnits,
  canCreateDatastreams,
} = useWorkspacePermissions()

const route = useRoute()
const thingId = route.params.id.toString()
const thing = ref<Thing>()
const datastreamId = route.params.datastreamId?.toString() || ''

const timeUnits = ['seconds', 'minutes', 'hours', 'days']
const openUnitForm = ref(false)

const showTemplateModal = ref(false)
const showSensorModal = ref(false)
const showPLModal = ref(false)
const showOPModal = ref(false)
const showLinkedMetadataHelp = ref(false)

const valid = ref(false)
const myForm = ref<VForm>()
const selectedDatastreamID = ref('')
const datastream = ref<Datastream>(new Datastream(thingId))

const {
  sensors,
  units,
  observedProperties,
  processingLevels,
  formattedObservedProperties,
  formattedProcessingLevels,
  fetchMetadata,
} = useMetadata(selectedWorkspace.value!.id)

const handleMetadataUploaded = async (dsKey: string, newId: string) => {
  await fetchMetadata(thingId)
  ;(datastream.value as any)[dsKey] = newId
}

const originalName = ref('')
const originalDescription = ref('')

const generateDefaultName = () => {
  const OP = observedProperties.value.find(
    (pl) => pl.id === datastream.value.observedPropertyId
  )?.name
  const PL = processingLevels.value.find(
    (pl) => pl.id === datastream.value.processingLevelId
  )?.code
  return `${OP} at ${thing.value?.samplingFeatureCode} with processing level ${PL}`
}

const generateDefaultDescription = () => {
  const OP = observedProperties.value.find(
    (pl) => pl.id === datastream.value.observedPropertyId
  )?.name
  console.log('computing description', OP)
  const PL = processingLevels.value.find(
    (pl) => pl.id === datastream.value.processingLevelId
  )?.code
  const sensorName = sensors.value.find(
    (pl) => pl.id === datastream.value.sensorId
  )?.name
  const unitName = units.value.find(
    (pl) => pl.id === datastream.value.unitId
  )?.name
  return `A datastream of ${OP} at ${thing.value?.name} with processing level ${PL} and sampled medium ${datastream.value.sampledMedium} created using a method with name ${sensorName} having units of ${unitName}`
}

watch(selectedDatastreamID, async () => {
  try {
    const fetchedDS = await api.fetchDatastream(selectedDatastreamID.value)
    if (!fetchedDS) return
    Object.assign(datastream.value, {
      ...datastream,
      sensorId: fetchedDS.sensorId,
      observedPropertyId: fetchedDS.observedPropertyId,
      processingLevelId: fetchedDS.processingLevelId,
      unitId: fetchedDS.unitId,
      timeAggregationIntervalUnits: fetchedDS.timeAggregationIntervalUnits,
      intendedTimeSpacingUnits: fetchedDS.intendedTimeSpacingUnits,
      name: fetchedDS.name,
      description: fetchedDS.description,
      sampledMedium: fetchedDS.sampledMedium,
      noDataValue: fetchedDS.noDataValue,
      aggregationStatistic: fetchedDS.aggregationStatistic,
      status: fetchedDS.status,
      timeAggregationInterval: fetchedDS.timeAggregationInterval,
      intendedTimeSpacing: fetchedDS.intendedTimeSpacing,
    })
  } catch (error) {
    console.error('Error loading datastream template', error)
  }
  await myForm.value?.validate()
})

async function uploadDatastream() {
  await myForm.value?.validate()
  if (!valid.value) return
  datastream.value.thingId = thingId
  if (datastreamId) {
    try {
      await api.updateDatastream(datastream.value)
    } catch (error) {
      console.error('Error updating datastream', error)
    }
  } else {
    try {
      await api.createDatastream(datastream.value)
    } catch (error) {
      console.error('Error creating datastream', error)
    }
  }
  router.push({ name: 'SiteDetails', params: { id: thingId } })
}

onMounted(async () => {
  window.scrollTo(0, 0)

  let promises = [api.fetchThing(thingId)]
  if (datastreamId) promises.push(api.fetchDatastream(datastreamId))

  try {
    const results = await Promise.all(promises)

    let fetchedDatastream, fetchedThing
    if (datastreamId) [fetchedThing, fetchedDatastream] = results
    else [fetchedThing] = results

    if (fetchedDatastream) {
      datastream.value = fetchedDatastream
      originalName.value = datastream.value.name
      originalDescription.value = datastream.value.description
    }
    thing.value = fetchedThing
  } catch (error) {
    Snackbar.error('Unable to fetch data from the API.')
    console.error('Error fetching datastream data from DB.', error)
  }
})
</script>
