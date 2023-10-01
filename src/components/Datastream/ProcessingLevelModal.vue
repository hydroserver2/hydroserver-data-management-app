<template>
  <v-card>
    <v-card-title>
      <span class="headline"
        >{{ isEdit ? 'Edit' : 'Add' }} Processing Level</span
      >
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-form
          @submit.prevent="uploadProcessingLevel"
          ref="myForm"
          v-model="valid"
          validate-on="blur"
        >
          <v-row>
            <v-col>
              <v-autocomplete
                v-if="!isEdit"
                v-model="selectedId"
                label="Load a template processing level"
                :items="formattedProcessingLevels"
                item-value="id"
                item-title="title"
              ></v-autocomplete>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="processingLevel.code"
                label="Code *"
                :rules="rules.requiredCode"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="processingLevel.definition"
                label="Definition"
                :rules="rules.maxLength(2000)"
              ></v-textarea>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="processingLevel.explanation"
                label="Explanation"
                :rules="rules.maxLength(2000)"
              ></v-textarea>
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
import { rules } from '@/utils/rules'
import { useProcessingLevelStore } from '@/store/processingLevels'
import { useProcessingLevels } from '@/composables/useMetadata'

const plStore = useProcessingLevelStore()
const props = defineProps({ id: String })
const emit = defineEmits(['uploaded', 'close'])

const {
  isEdit,
  selectedId,
  formattedProcessingLevels,
  myForm,
  valid,
  selectedEntity: processingLevel,
} = useProcessingLevels(props.id)

async function uploadProcessingLevel() {
  await myForm.value?.validate()
  if (!valid.value) return
  if (isEdit.value) await plStore.updateProcessingLevel(processingLevel.value)
  else {
    const newPl = await plStore.createProcessingLevel(processingLevel.value)
    emit('uploaded', newPl.id)
  }
  emit('close')
}
</script>
