<template>
  <v-card>
    <v-toolbar color="secondary">
      <v-card-title>
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
      <v-card-text v-if="item">
        <v-text-field
          v-model="item.name"
          label="Payload name *"
          :rules="rules.requiredAndMaxLength255"
        />

        <v-toolbar density="compact" flat color="secondary-lighten-5">
          <v-card-title class="text-medium-emphasis"
            >Source to target mapping</v-card-title
          >

          <v-spacer />

          <v-btn-add
            variant="text"
            class="mr-2"
            @click="addRow"
            color="secondary-darken-2"
          >
            Add row
          </v-btn-add>
        </v-toolbar>
        <v-data-table
          :items="[]"
          :headers="[]"
          hide-default-footer
          density="compact"
          fixed-header
          class="border"
          :style="{ 'max-height': `40vh` }"
        >
          <template #body>
            <tr v-for="(row, index) in item.sourceTargetMap" :key="index">
              <td style="padding: 8px">
                <v-text-field
                  v-model="row.sourceIdentifier"
                  placeholder="Source identifier"
                  density="compact"
                  class="ma-0 pa-0"
                  variant="outlined"
                  hide-details
                />
              </td>
              <td style="padding: 8px">
                <v-text-field
                  v-model="row.targetIdentifier"
                  placeholder="Target identifier"
                  density="compact"
                  class="ma-0 pa-0"
                  variant="outlined"
                  hide-details
                />
              </td>
              <td style="padding: 8px; width: 50px">
                <v-btn
                  icon
                  variant="text"
                  color="error"
                  @click="removeRow(index)"
                >
                  <v-icon>mdi-trash-can-outline</v-icon>
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
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
import { useFormLogic } from '@/composables/useFormLogic'
import { Payload } from '@/types'

const props = defineProps({ payload: Object as () => Payload })
const emit = defineEmits(['created', 'updated', 'close'])

const { item, isEdit, valid, myForm, uploadItem } = useFormLogic(
  api.createDataSourcePayload,
  api.updateDataSourcePayload,
  Payload,
  props.payload || undefined
)

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

function addRow() {
  if (!item.value) return
  item.value.sourceTargetMap.push({
    sourceIdentifier: '',
    targetIdentifier: '',
  })
}

// Remove row from sourceTargetMap
function removeRow(index: number) {
  if (!item.value) return
  item.value.sourceTargetMap.splice(index, 1)
}
</script>
