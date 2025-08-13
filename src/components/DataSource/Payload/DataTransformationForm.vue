<template>
  <v-card>
    <v-toolbar :color="local.type === 'expression' ? 'deep-purple' : 'teal'">
      <v-card-title
        >{{ isEdit ? 'Edit' : 'Add' }} data transformation</v-card-title
      >
    </v-toolbar>
    <v-divider />

    <v-form
      ref="myForm"
      v-model="valid"
      validate-on="blur"
      @submit.prevent="onSubmit"
    >
      <v-card-text>
        <v-radio-group v-model="local.type" inline>
          <v-radio label="Expression" value="expression" />
          <v-radio label="Lookup table" value="lookup" />
        </v-radio-group>

        <template v-if="local.type === 'expression'">
          <v-alert
            color="deep-purple"
            type="info"
            variant="tonal"
            density="compact"
            class="mb-6"
          >
            Apply an expression to each incoming data point independently. Enter
            a single-line Python expression using
            <code>x</code> for the incoming value.
            <div class="mt-4">
              For example, if you wanted a unit conversion from degrees
              Fahrenheit (°F) to Celsius (°C), you'd type in '(x - 32) * 5/9'.
            </div>
            <div class="mt-4">
              <strong>Allowed operators:</strong>
              <span class="d-inline-flex flex-wrap ml-2">
                <v-chip
                  v-for="op in ALLOWED_OPS"
                  :key="op"
                  size="small"
                  variant="tonal"
                  class="mr-1 mb-1"
                >
                  {{ op }}
                </v-chip>
              </span>
            </div>
          </v-alert>

          <v-text-field
            v-if="local.type === 'expression'"
            v-model="local.expression"
            label="Output = *"
            placeholder="eg. (x - 32) * 5/9"
            :rules="rules.required"
            auto-grow
          />
        </template>

        <v-text-field
          v-else
          v-model="local.lookupTableId"
          label="Lookup table id *"
          :rules="rules.required"
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
import { ref, computed } from 'vue'
import type { VForm } from 'vuetify/components'
import { rules } from '@/utils/rules'
import type { DataTransformation } from '@/models/payload'

const props = defineProps<{ transformation?: DataTransformation }>()
const emit = defineEmits<{
  (e: 'created', t: DataTransformation): void
  (e: 'updated', t: DataTransformation): void
  (e: 'close'): void
}>()
const ALLOWED_OPS = ['+', '-', '*', '/', '%', '**', '//', '(', ')']

const isEdit = computed(() => !!props.transformation)

function makeInitial(): DataTransformation {
  if (props.transformation?.type === 'expression') {
    return {
      type: 'expression',
      expression: props.transformation.expression ?? '',
    }
  }
  if (props.transformation?.type === 'lookup') {
    return {
      type: 'lookup',
      lookupTableId: props.transformation.lookupTableId ?? '',
    }
  }
  return { type: 'expression', expression: '' }
}

const local = ref<DataTransformation>(makeInitial())

const valid = ref<boolean | null>(null)
const myForm = ref<VForm>()

async function onSubmit() {
  await myForm.value?.validate()
  if (!valid.value) return
  isEdit.value ? emit('updated', local.value) : emit('created', local.value)
  emit('close')
}
</script>
