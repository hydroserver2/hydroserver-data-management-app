<template>
  <v-card>
    <v-card-title>
      {{ isEdit ? 'Edit' : 'Add' }} Result Qualifier
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
        ></v-text-field>

        <v-textarea
          v-model="item.description"
          label="Description"
          :rules="rules.maxLength(2000)"
        ></v-textarea>

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
import { VForm } from 'vuetify/components'
import { ResultQualifier } from '@/types'
import { useFormLogic } from '@/composables/useFormLogic'
import { api } from '@/services/api'

const props = defineProps<{
  resultQualifier?: ResultQualifier
  workspaceId: string
}>()

const emit = defineEmits(['updated', 'created', 'close'])

const { item, isEdit, valid, myForm, uploadItem } = useFormLogic(
  api.createResultQualifier,
  api.updateResultQualifier,
  ResultQualifier,
  props.resultQualifier || undefined
)

async function onSubmit() {
  try {
    item.value.workspaceId = props.workspaceId
    const newItem = await uploadItem()
    if (!newItem) return
    if (isEdit.value) emit('updated', newItem)
    else emit('created', newItem.id)
  } catch (error) {
    console.error('Error uploading item', error)
  }
  emit('close')
}
</script>
