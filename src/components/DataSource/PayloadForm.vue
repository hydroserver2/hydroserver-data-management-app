<template>
  <v-card>
    <v-card-title> {{ isEdit ? 'Edit' : 'Add' }} Payload </v-card-title>
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
          label="Payload name *"
          :rules="rules.requiredAndMaxLength255"
        />
      </v-card-text>
      <v-card-text class="text-subtitle-2 text-medium-emphasis">
        Source to target mapping
      </v-card-text>
      <v-card-text>
        <v-data-table
          :items="[]"
          :headers="[]"
          hide-default-header
          hide-default-footer
          density="compact"
          fixed-header
          class="elevation-1 border rounded"
        >
          <!-- Table Body -->
          <template #body>
            <tr v-for="(row, index) in item.sourceTargetMap" :key="index">
              <td style="border: 1px solid #ddd; padding: 4px">
                <v-text-field
                  v-model="row.source_identifier"
                  placeholder="Source identifier"
                  density="compact"
                  class="ma-0 pa-0"
                  variant="outlined"
                  hide-details
                />
              </td>
              <td style="border: 1px solid #ddd; padding: 4px">
                <v-text-field
                  v-model="row.target_identifier"
                  placeholder="Target identifier"
                  density="compact"
                  class="ma-0 pa-0"
                  variant="outlined"
                  hide-details
                />
              </td>
              <td style="border: 1px solid #ddd; padding: 4px; width: 60px">
                <v-btn
                  icon
                  variant="text"
                  color="error"
                  @click="removeRow(index)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>

      <v-card-text>
        <v-spacer />
        <v-btn variant="text" class="mb-2" @click="addRow">
          <v-icon start>mdi-plus</v-icon>
          Add Row
        </v-btn>
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
import { Payload } from '@/types'
import { computed, ref } from 'vue'

const props = defineProps({ payload: Object as () => Payload })
const emit = defineEmits(['created', 'updated', 'close'])

const { item, isEdit, valid, myForm, uploadItem } = useFormLogic(
  () => Promise.resolve([]),
  api.createDataSourcePayload,
  api.updateDataSourcePayload,
  Payload,
  props.payload || undefined,
  false
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
    source_identifier: '',
    target_identifier: '',
  })
}

// Remove row from sourceTargetMap
function removeRow(index: number) {
  if (!item.value) return
  item.value.sourceTargetMap.splice(index, 1)
}
</script>
