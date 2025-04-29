<template>
  <v-card>
    <v-toolbar color="secondary-lighten-1">
      <v-card-title class="text-medium-emphasis">
        {{ isEdit ? 'Edit' : 'Add' }} payload
        <span v-if="isEdit" class="opacity-80">- {{ payload?.name }}</span>
      </v-card-title>
    </v-toolbar>

    <v-form
      @submit.prevent="onSubmit"
      ref="myForm"
      v-model="valid"
      validate-on="blur"
    >
      <v-card-text v-if="payload">
        <v-text-field
          v-model="payload.name"
          label="Payload name *"
          :rules="rules.requiredAndMaxLength255"
        />

        <!-- TODO: Comment out once SDL supports template variables -->
        <!-- <template v-if="extractor.type === 'HTTP'">
          <v-row>
            <v-col col="auto">
              <v-card-title
                class="text-subtitle-1 text-medium-emphasis px-0 mb-1"
                >HTTP extractor payload-level configurations</v-card-title
              >
            </v-col>
          </v-row>
          <template v-for="variable in extractor.urlTemplateVariables">
            <v-text-field
              v-if="!variable.isDynamic"
              v-model="payload.extractorVariables[variable.name]"
              :label="`${variable.name} *`"
              :rules="rules.requiredAndMaxLength255"
            />
          </template>
        </template> -->

        <v-row align="center">
          <v-col cols="auto">
            <v-card-title class="text-subtitle-1 text-medium-emphasis px-0 mb-1"
              >Source to target mapping</v-card-title
            >
          </v-col>
          <v-col class="pl-0">
            <v-icon
              @click="showDataTransformationHelp = !showDataTransformationHelp"
              color="grey"
              small
            >
              mdi-help-circle-outline
            </v-icon>
          </v-col>

          <v-spacer />

          <v-col cols="auto">
            <v-btn-add
              variant="text"
              class="mr-2"
              @click="onAddMapping"
              color="secondary-darken-1"
            >
              Add row
            </v-btn-add>
          </v-col>
        </v-row>

        <div v-if="showDataTransformationHelp" class="mb-4">
          A source to target mapping allows you to map a unique source
          identifier to a unique target identifier. These identifiers depend on
          the payload type, but can be column names or indexes for CSV, object
          keys for JSON, etc. HydroServer uses the datastream's ID as its
          identifier.
        </div>
        <div v-if="showDataTransformationHelp" class="mb-4">
          Adding a data transformation will allow you to apply a unit conversion
          or rating curve to each data point for a mapping. Optionally, you can
          also save the raw data to a separate datastream. Configuration details
          for this step will be available on the Payload Form after creating
          this data source.
        </div>

        <v-expansion-panels
          v-model="expandedPanels"
          variant="accordion"
          multiple
          elevation="1"
        >
          <v-expansion-panel
            v-for="(row, index) in payload.mappings"
            :key="index"
            density="compact"
            color="blue-grey-lighten-5"
            class="no-expansion-padding"
          >
            <v-expansion-panel-title>
              <span class="text-medium-emphasis">{{
                row.sourceIdentifier
              }}</span>
              <v-icon color="green-lighten-2" small class="mx-2"
                >mdi-arrow-right</v-icon
              >
              <span>{{ row.targetIdentifier }}</span>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="pa-0 pb-2">
              <v-row class="mx-1 mt-1">
                <v-col md="6" c>
                  <v-text-field
                    v-model="row.sourceIdentifier"
                    placeholder="Source identifier"
                    label="Source identifier (column name or index)"
                    variant="outlined"
                    hide-details
                  />
                </v-col>
                <v-col md="6">
                  <template
                    v-if="dataSource.settings?.loader?.type === 'HydroServer'"
                  >
                    <DatastreamSelectAndDisplay
                      button-name="Select target datastream"
                      :datastream-id="String(row.targetIdentifier)"
                      @update-selected-id="row.targetIdentifier = $event"
                    />
                  </template>
                  <v-text-field
                    v-else
                    v-model="row.targetIdentifier"
                    placeholder="Target identifier"
                    density="compact"
                    variant="outlined"
                    hide-details
                  />
                </v-col>
              </v-row>
              <!-- <v-row align="center" class="mx-1 mt-0">
                <v-col md="6">
                  <v-checkbox
                    :v-model="!!row.dataTransformation"
                    @change="() => row.toggleDataTransformation()"
                    label="Add a data transformation step"
                    density="compact"
                    rounded="lg"
                    prepend-inner-icon="mdi-table-column-width"
                    hide-details
                  />
                </v-col>
              </v-row>
              <v-row v-if="!!row.dataTransformation" class="mx-1 mt-0">
                <v-col>
                  <v-radio-group
                    inline
                    v-model="row.dataTransformation.transformationType"
                  >
                    <v-radio
                      label="Python expression"
                      value="expression"
                      @click=""
                    />
                    <v-radio label="Lookup table" value="lookup" />
                  </v-radio-group>
                </v-col>

                <v-col cols="6">
                  <v-text-field
                    v-model="row.dataTransformation.operation"
                    placeholder="(input - 32) * 5/9"
                    density="compact"
                    variant="outlined"
                    hide-details
                  >
                    <template v-slot:prepend>output =</template>
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row v-if="!!row.dataTransformation" class="mx-1 mt-0 mb-1">
                <v-col md="6">
                  <v-checkbox
                    v-model="row.dataTransformation.doSaveRawDataCopy"
                    label="Save a copy of the raw data"
                    density="compact"
                    rounded="lg"
                    prepend-inner-icon="mdi-table-column-width"
                    hide-details
                  />
                </v-col>
                <v-col md="6" v-if="row.dataTransformation.doSaveRawDataCopy">
                  <template
                    v-if="dataSource.settings?.loader?.type === 'HydroServer'"
                  >
                    <DatastreamSelectAndDisplay
                      button-name="Select target datastream"
                      :datastream-id="
                        String(row.dataTransformation.rawTargetIdentifier)
                      "
                      @update-selected-id="
                        row.dataTransformation.rawTargetIdentifier = $event
                      "
                    />
                  </template>
                  <v-text-field
                    v-else
                    v-model="row.dataTransformation.rawTargetIdentifier"
                    placeholder="Raw data target identifier"
                    density="compact"
                    variant="outlined"
                    hide-details
                  />
                </v-col>
              </v-row> -->
              <v-row class="mx-1">
                <v-spacer />
                <v-col cols="auto">
                  <v-btn
                    icon
                    variant="text"
                    color="error"
                    @click="onRemoveMapping(index)"
                  >
                    <v-icon>mdi-trash-can-outline</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn-cancel @click="$emit('close')">Cancel</v-btn-cancel>
        <v-btn-primary type="submit">Save</v-btn-primary>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { rules } from '@/utils/rules'
import { api } from '@/services/api'
import { VForm } from 'vuetify/components'
import { Payload } from '@/models'
import { addMapping } from '@/models/payload'
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import DatastreamSelectAndDisplay from '../Datastream/DatastreamSelectAndDisplay.vue'
import { useETLStore } from '@/store/etl'

const props = defineProps({
  oldPayload: { type: Object as () => Payload },
  oldPayloadIndex: { type: Number, required: true },
})

const { dataSource, payloads, extractor } = storeToRefs(useETLStore())
const { updateLinkedDatastreams } = useETLStore()

const emit = defineEmits(['created', 'updated', 'close'])
const isEdit = computed(() => !!props.oldPayload || undefined)
const valid = ref(false)
const myForm = ref<VForm>()

const payload = ref<Payload>(
  props.oldPayload
    ? JSON.parse(JSON.stringify(props.oldPayload))
    : new Payload()
)

const showDataTransformationHelp = ref(false)
const expandedPanels = ref<number[]>([])

function onAddMapping() {
  addMapping(payload.value)
  const newIndex = payload.value.mappings.length - 1
  expandedPanels.value.push(newIndex)
}

function onRemoveMapping(index: number) {
  payload.value.mappings.splice(index, 1)
  expandedPanels.value = expandedPanels.value
    .filter((p) => p !== index)
    .map((p) => (p > index ? p - 1 : p))
}

async function onSubmit() {
  await myForm.value?.validate()
  if (!valid.value) return

  if (props.oldPayloadIndex === -1)
    // Reactivity doesn't persist in deeply nested arrays, therefore can't do arr.push()
    payloads.value = payloads.value
      ? [...payloads.value, payload.value]
      : [payload.value]
  else payloads.value[props.oldPayloadIndex] = payload.value

  await updateLinkedDatastreams(payload.value, props.oldPayload)
  const updatedDataSource = await api.updateDataSource(dataSource.value)
  emit('close')
}
</script>

<style scoped>
::v-deep .v-expansion-panel-text__wrapper {
  padding: 0px 0px 0px !important;
}
</style>
