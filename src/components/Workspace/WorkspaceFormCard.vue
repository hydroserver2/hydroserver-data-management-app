<template>
  <v-card>
    <v-toolbar color="secondary-darken-2">
      <v-card-title> {{ isEdit ? 'Edit' : 'Add' }} workspace </v-card-title>
    </v-toolbar>

    <v-form
      @submit.prevent="onSubmit"
      ref="myForm"
      v-model="valid"
      validate-on="blur"
    >
      <v-card-text v-if="item" class="mt-4">
        <v-text-field
          v-model="item.name"
          label="Name *"
          :rules="rules.requiredAndMaxLength255"
        />
        <v-checkbox
          v-model="item.isPrivate"
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
import { VForm } from 'vuetify/components'
import { useFormLogic } from '@/composables/useFormLogic'
import hs, { Workspace } from '@hydroserver/client'
import { Snackbar } from '@/utils/notifications'

const props = defineProps({ workspace: Object as () => Workspace })
const emit = defineEmits(['created', 'updated', 'close'])

const { item, isEdit, valid, myForm, uploadItem } = useFormLogic(
  hs.workspaces.create,
  hs.workspaces.update,
  Workspace,
  props.workspace || undefined
)

async function onSubmit() {
  try {
    const newItem = await uploadItem()
    if (!newItem) return
    if (isEdit.value) {
      Snackbar.success('Workspace updated')
      emit('updated', newItem)
    } else {
      Snackbar.success('Workspace created')
      emit('created', newItem)
    }
  } catch (error: any) {
    console.error('Error uploading workspace', error)
    Snackbar.error(error.message)
  }
  emit('close')
}
</script>
