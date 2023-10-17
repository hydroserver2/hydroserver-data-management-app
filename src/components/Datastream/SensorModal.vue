<template>
  <v-card>
    <v-card-title> {{ isEdit ? 'Edit' : 'Add' }} Sensor </v-card-title>
    <v-card-text>
      <v-container>
        <v-form
          @submit.prevent="uploadSensor"
          ref="myForm"
          v-model="valid"
          validate-on="blur"
        >
          <v-row>
            <v-col cols="12" md="6">
              <v-row>
                <v-col cols="12">
                  <v-select
                    v-model="sensor.methodType"
                    :items="methodTypes"
                    label="Method Type *"
                    hide-details
                    density="comfortable"
                    :rules="rules.required"
                  ></v-select>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="sensor.methodLink"
                    label="Method Link"
                    :rules="sensor.methodLink ? rules.urlFormat : []"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="sensor.methodCode"
                    label="Method Code"
                    :rules="rules.name"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" md="6">
              <v-row>
                <v-col cols="12">
                  <v-textarea
                    v-model="sensor.description"
                    label="Description *"
                    rows="1"
                    :rules="rules.requiredDescription"
                  ></v-textarea>
                </v-col>
                <v-col cols="12" v-if="!isInstrument">
                  <v-text-field
                    v-model="sensor.name"
                    label="Name *"
                    :rules="rules.requiredName"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" v-if="isInstrument">
                  <v-text-field
                    v-model="sensor.manufacturer"
                    label="Manufacturer *"
                    :rules="rules.requiredName"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" v-if="isInstrument">
                  <v-text-field
                    v-model="sensor.model"
                    label="Model *"
                    :rules="rules.requiredName"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" v-if="isInstrument">
                  <v-text-field
                    v-model="sensor.modelLink"
                    label="Model Link"
                    :rules="sensor.modelLink ? rules.urlFormat : []"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="$emit('close')">Cancel</v-btn>
            <v-btn color="primary" type="submit">{{
              isEdit ? 'Update' : 'Save'
            }}</v-btn>
          </v-card-actions>
        </v-form>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VForm } from 'vuetify/components'
import { rules } from '@/utils/rules'
import { useSensorStore } from '@/store/sensors'
import { methodTypes } from '@/vocabularies'
import { useSensors } from '@/composables/useMetadata'

const sensorStore = useSensorStore()
const props = defineProps({ id: String })
const emit = defineEmits(['uploaded', 'close'])

const { isEdit, myForm, valid, selectedEntity: sensor } = useSensors(props.id)

const isInstrument = computed(
  () => sensor.value.methodType === 'Instrument Deployment'
)

async function uploadSensor() {
  await myForm.value?.validate()
  if (!valid.value) return
  if (
    sensor.value.methodType === 'Instrument Deployment' &&
    sensor.value.manufacturer &&
    sensor.value.model
  ) {
    sensor.value.name = sensor.value.manufacturer + ': ' + sensor.value.model
  }

  if (isEdit.value) await sensorStore.updateSensor(sensor.value)
  else {
    const newSensor = await sensorStore.createSensor(sensor.value)
    emit('uploaded', String(newSensor.id))
  }
  emit('close')
}
</script>
