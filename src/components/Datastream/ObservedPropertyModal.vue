<template>
  <v-card>
    <v-card-title>
      <span class="headline"
        >{{ isEdit ? 'Edit' : 'Add' }} Observed Property</span
      >
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-form
          @submit.prevent="uploadObservedProperty"
          ref="myForm"
          v-model="valid"
          validate-on="blur"
        >
          <v-row>
            <v-col cols="12">
              <v-combobox
                v-model="observedProperty.name"
                :items="OPNames"
                hide-details
                label="Name *"
                :rules="rules.requiredName"
                @update:modelValue="handleNameUpdated"
              ></v-combobox>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="observedProperty.definition"
                label="Definition *"
                :rules="rules.requiredDescription"
              ></v-textarea>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="observedProperty.description"
                label="Description *"
                :rules="rules.requiredDescription"
              ></v-textarea>
            </v-col>
            <v-col cols="12" sm="6">
              <v-combobox
                :items="OPVariableTypes"
                v-model="observedProperty.type"
                label="Variable Type *"
                :rules="rules.required"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="observedProperty.code"
                label="Variable Code *"
                :rules="rules.requiredName"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn-cancel @click="$emit('close')">Cancel</v-btn-cancel>
            <v-btn-primary type="submit">{{
              isEdit ? 'Update' : 'Save'
            }}</v-btn-primary>
          </v-card-actions>
        </v-form>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useObservedPropertyStore } from '@/store/observedProperties'
import { rules } from '@/utils/rules'
import { useObservedPropertyModals } from '@/composables/useMetadataModals'
import { OPVariableTypes, OPNameTypes } from '@/vocabularies'

const OPNames = Object.keys(OPNameTypes)

const opStore = useObservedPropertyStore()
const props = defineProps({ id: String })
const emit = defineEmits(['uploaded', 'close'])

const {
  isEdit,
  myForm,
  valid,
  selectedEntity: observedProperty,
} = useObservedPropertyModals(props.id)

const handleNameUpdated = () => {
  const name = observedProperty.value.name
  if (name && OPNames.includes(name)) {
    observedProperty.value.definition = OPNameTypes[name].definition
    observedProperty.value.description = OPNameTypes[name].description
  }
}

async function uploadObservedProperty() {
  await myForm.value?.validate()
  if (!valid.value) return
  if (isEdit.value) await opStore.updateObservedProperty(observedProperty.value)
  else {
    const newOP = await opStore.createObservedProperty(observedProperty.value)
    emit('uploaded', newOP.id)
  }
  emit('close')
}
</script>
