<template>
  <v-card>
    <v-toolbar color="secondary-lighten-1" density="comfortable">
      <v-card-title class="text-medium-emphasis">
        {{ isEdit ? 'Edit' : 'Add' }} payload
        <span v-if="isEdit" class="opacity-80">· {{ payload?.name }}</span>
      </v-card-title>
    </v-toolbar>

    <v-form
      @submit.prevent="onSubmit"
      ref="myForm"
      v-model="valid"
      validate-on="blur"
    >
      <v-card-text v-if="payload">
        <v-text-field
          v-model="payload.name"
          label="Payload name *"
          :rules="rules.requiredAndMaxLength255"
          density="comfortable"
        />

        <template v-if="extractor?.type === 'HTTP'">
          <div class="section-title mb-2">
            HTTP extractor payload-level configurations
          </div>
          <template
            v-for="variable in extractor.placeholderVariables"
            :key="variable.name"
          >
            <v-text-field
              v-if="variable.type === 'perPayload'"
              v-model="payload.extractorVariables[variable.name]"
              :label="`URL template variable: ${variable.name} *`"
              :rules="rules.requiredAndMaxLength255"
              density="comfortable"
            />
          </template>
        </template>
        <v-divider class="mb-6" />
        <SwimlanesForm v-model:payload="payload" ref="swimlanesRef" />
      </v-card-text>

      <v-divider />
      <v-card-actions class="actions">
        <v-spacer />
        <v-btn-cancel @click="$emit('close')">Cancel</v-btn-cancel>
        <v-btn-primary :loading="submitLoading" type="submit"
          >Save</v-btn-primary
        >
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { rules } from '@/utils/rules'
import { VForm } from 'vuetify/components'
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDataSourceStore } from '@/store/datasource'
import SwimlanesForm from './SwimlanesForm.vue'
import hs, { Payload } from '@hydroserver/client'

const props = defineProps({
  oldPayload: { type: Object as () => Payload },
})

const { dataSource, payloads, extractor } = storeToRefs(useDataSourceStore())
const { updateLinkedDatastreams } = useDataSourceStore()
const { linkedDatastreams } = storeToRefs(useDataSourceStore())

const emit = defineEmits(['created', 'updated', 'close'])

const isEdit = computed(() => !!props.oldPayload || undefined)
const valid = ref<boolean | null>(null)
const myForm = ref<VForm>()
const swimlanesRef = ref<any>(null)
const submitLoading = ref(false)

const payload = ref<Payload>(
  props.oldPayload
    ? new Payload(JSON.parse(JSON.stringify(props.oldPayload)))
    : new Payload()
)

async function onSubmit() {
  const swimlanesValid = await swimlanesRef.value.validate()
  if (!swimlanesValid) return
  await myForm.value?.validate()
  if (!valid.value) return

  const index = payloads.value.findIndex((p) => p.id === payload.value.id)
  if (index !== -1) payloads.value[index] = payload.value
  else payloads.value = [...payloads.value, payload.value]

  submitLoading.value = true
  await updateLinkedDatastreams(payload.value, props.oldPayload)
  await hs.dataSources.update(dataSource.value)
  linkedDatastreams.value = await hs.datastreams.listAllItems({
    data_source_id: [dataSource.value.id],
  })
  submitLoading.value = false
  emit('close')
}
</script>

<style scoped>
:deep(.v-expansion-panel-text__wrapper) {
  padding: 0 !important;
}
</style>
