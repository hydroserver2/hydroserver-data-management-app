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
            <v-btn-cancel @click="$emit('close')">Cancel</v-btn-cancel>
            <v-btn type="submit">{{ isEdit ? 'Update' : 'Save' }}</v-btn>
          </v-card-actions>
        </v-form>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { VForm } from 'vuetify/components'
import { rules } from '@/utils/rules'
import { useSensorStore } from '@/store/sensors'
import { Sensor } from '@/types'
import { methodTypes } from '@/vocabularies'

const sensorStore = useSensorStore()
const props = defineProps({ id: String })
const emit = defineEmits(['uploaded', 'close'])
const valid = ref(false)
const myForm = ref<VForm>()
const sensor = reactive<Sensor>(new Sensor())

const isEdit = computed(() => props.id != null)

const isInstrument = computed(
  () => sensor.methodType === 'Instrument Deployment'
)

async function uploadSensor() {
  await myForm.value?.validate()
  if (!valid.value) return
  if (
    sensor.methodType === 'Instrument Deployment' &&
    sensor.manufacturer &&
    sensor.model
  ) {
    sensor.name = sensor.manufacturer + ': ' + sensor.model
  }

  if (isEdit.value) await sensorStore.updateSensor(sensor)
  else {
    const newSensor = await sensorStore.createSensor(sensor)
    emit('uploaded', String(newSensor.id))
  }
  emit('close')
}

onMounted(async () => {
  await sensorStore.fetchSensors()
  if (props.id) Object.assign(sensor, sensorStore.getSensorById(props.id))
})
</script>
