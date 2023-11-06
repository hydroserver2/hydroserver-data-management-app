<template>
  <v-card>
    <v-card-title>
      <span class="headline"
        >{{ isEdit ? 'Edit' : 'Add' }} Result Qualifier</span
      >
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-form
          @submit.prevent="uploadResultQualifier"
          ref="myForm"
          v-model="valid"
          validate-on="blur"
        >
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="resultQualifier.code"
                label="Code *"
                :rules="rules.requiredCode"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="resultQualifier.description"
                label="Description"
                :rules="rules.maxLength(2000)"
              ></v-textarea>
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
import { rules } from '@/utils/rules'
import { useResultQualifierStore } from '@/store/resultQualifiers'
import { useResultQualifierModals } from '@/composables/useMetadataModals'

const rqStore = useResultQualifierStore()
const props = defineProps({ id: String })
const emit = defineEmits(['uploaded', 'close'])

const {
  isEdit,
  myForm,
  valid,
  selectedEntity: resultQualifier,
} = useResultQualifierModals(props.id)

async function uploadResultQualifier() {
  await myForm.value?.validate()
  if (!valid.value) return
  if (isEdit.value) await rqStore.updateResultQualifier(resultQualifier.value)
  else {
    const newRq = await rqStore.createResultQualifier(resultQualifier.value)
    emit('uploaded', newRq.id)
  }
  emit('close')
}
</script>
