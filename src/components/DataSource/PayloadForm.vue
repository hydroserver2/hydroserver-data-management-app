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
              @click="() => payload.addMapping()"
              color="secondary-darken-1"
            >
              Add row
            </v-btn-add>
          </v-col>
        </v-row>

        <div v-if="showDataTransformationHelp" class="mb-4">
          A source to target mapping allows you to map columns or keys in your
          source payload to specific destinations. HydroServer uses the
          datastream's ID as its identifier.
        </div>
        <div v-if="showDataTransformationHelp" class="mb-4">
          Adding a data transformation will allow you to apply a unit conversion
          or rating curve to each data point for a mapping. Optionally, you can
          also save the raw data to a separate datastream. Configuration details
          for this step will be available on the Payload Form after creating
          this data source.
        </div>

        <v-expansion-panels variant="accordion" multiple elevation="1">
          <v-expansion-panel
            v-for="(row, index) in payload.mappings"
            :key="index"
            density="compact"
            color="blue-grey-lighten-5"
            class="no-expansion-padding"
            :title="row.getTitle()"
          >
            <v-expansion-panel-text class="pa-0 pb-2">
              <v-row class="mx-1 mt-1">
                <v-col md="6" c>
                  <v-text-field
                    v-model="row.sourceIdentifier"
                    placeholder="Source identifier"
                    density="compact"
                    variant="outlined"
                    hide-details
                  />
                </v-col>
                <v-col md="6">
                  <v-text-field
                    v-model="row.targetIdentifier"
                    placeholder="Target identifier"
                    density="compact"
                    variant="outlined"
                    hide-details
                  />
                </v-col>
              </v-row>
              <v-row align="center" class="mx-1 mt-0">
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
                <v-spacer />
                <v-col cols="12">
                  <v-text-field
                    v-model="row.dataTransformation.operation"
                    placeholder="Data transformation operation"
                    density="compact"
                    variant="outlined"
                    hide-details
                  />
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
                  <v-text-field
                    v-model="row.dataTransformation.rawTargetIdentifier"
                    placeholder="Raw data target identifier"
                    density="compact"
                    variant="outlined"
                    hide-details
                  />
                </v-col>
              </v-row>
              <v-row class="mx-1">
                <v-spacer />
                <v-col cols="auto">
                  <v-btn
                    icon
                    variant="text"
                    color="error"
                    @click="() => payload.removeMapping(index)"
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
import { computed, ref } from 'vue'

const props = defineProps({ oldPayload: Object as () => Payload })
const emit = defineEmits(['created', 'updated', 'close'])
const isEdit = computed(() => !!props.oldPayload || undefined)
const valid = ref(false)
const myForm = ref<VForm>()

const payload = ref<Payload>(new Payload())
if (props.oldPayload) payload.value = new Payload(props.oldPayload!)

const showDataTransformationHelp = ref(false)

async function uploadItem() {
  await myForm.value?.validate()
  if (!valid.value) return
  if (isEdit.value)
    return await api.updateDataSourcePayload(payload.value, props.oldPayload!)
  return await api.createDataSourcePayload(payload.value)
}

async function onSubmit() {
  try {
    const newItem = await uploadItem()
    if (!newItem) return
    if (isEdit.value) emit('updated', newItem)
    else emit('created', newItem.id)
  } catch (error) {
    console.error('Error uploading payload', error)
  }
  emit('close')
}
</script>

<style scoped>
::v-deep .v-expansion-panel-text__wrapper {
  padding: 0px 0px 0px !important;
}
</style>
