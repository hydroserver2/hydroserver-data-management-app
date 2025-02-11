<template>
  <v-card>
    <v-card-title> {{ isEdit ? 'Edit' : 'Add' }} workspace </v-card-title>
    <v-divider />

    <v-form
      @submit.prevent="onSubmit"
      ref="myForm"
      v-model="valid"
      validate-on="blur"
    >
      <v-card-text v-if="item">
        <v-text-field
          v-model="item.name"
          label="Name *"
          :rules="rules.requiredAndMaxLength255"
        />
        <v-checkbox
          v-model="item.private"
          label="Make this workspace private"
        />
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn-cancel @click="$emit('close')">Cancel</v-btn-cancel>
        <v-btn-primary type="submit">{{
          isEdit ? 'Update' : 'Save'
        }}</v-btn-primary>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { rules } from '@/utils/rules'
import { api } from '@/services/api'
import { VForm } from 'vuetify/components'
import { useFormLogic } from '@/composables/useFormLogic'
import { Workspace, PostWorkspace } from '@/types'

const props = defineProps({ workspace: Object as () => Workspace })
const emit = defineEmits(['created', 'updated', 'close'])

const { item, isEdit, valid, myForm, uploadItem } = useFormLogic(
  () => Promise.resolve([]),
  api.createWorkspace,
  api.updateWorkspace,
  PostWorkspace,
  props.workspace || undefined,
  false
)

async function onSubmit() {
  try {
    const newItem = await uploadItem()
    if (!newItem) return
    if (isEdit.value) emit('updated')
    else emit('created', newItem)
  } catch (error) {
    console.error('Error uploading unit', error)
  }
  emit('close')
}
</script>
