<template>
  <v-card>
    <v-card-title>
      {{ isEdit ? 'Edit' : 'Add' }} Processing Level
    </v-card-title>

    <v-form
      @submit.prevent="onSubmit"
      ref="myForm"
      v-model="valid"
      validate-on="blur"
    >
      <v-card-text>
        <v-text-field
          v-model="item.code"
          label="Code *"
          :rules="rules.requiredCode"
        />

        <v-textarea
          v-model="item.definition"
          label="Definition"
          :rules="rules.maxLength(2000)"
        />

        <v-textarea
          v-model="item.explanation"
          label="Explanation"
          :rules="rules.maxLength(2000)"
        />

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn-cancel @click="$emit('close')">Cancel</v-btn-cancel>
          <v-btn-primary type="submit">{{
            isEdit ? 'Update' : 'Save'
          }}</v-btn-primary>
        </v-card-actions>
      </v-card-text>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { rules } from '@/utils/rules'
import { api } from '@/services/api'
import { VForm } from 'vuetify/components'
import { useFormLogic } from '@/composables/useFormLogic'
import { ProcessingLevel } from '@/types'

const props = defineProps<{
  processingLevel?: ProcessingLevel
  workspaceId: string
}>()

const emit = defineEmits(['created', 'updated', 'close'])

const { item, isEdit, valid, myForm, uploadItem } = useFormLogic(
  api.createProcessingLevel,
  api.updateProcessingLevel,
  ProcessingLevel,
  props.processingLevel || undefined
)

async function onSubmit() {
  try {
    item.value.workspaceId = props.workspaceId
    const newItem = await uploadItem()
    if (!newItem) return
    if (isEdit.value) emit('updated', newItem)
    else emit('created', newItem.id)
  } catch (error) {
    console.error('Error uploading processing level', error)
  }
  emit('close')
}
</script>
