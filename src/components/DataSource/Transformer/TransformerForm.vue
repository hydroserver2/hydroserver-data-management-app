<template>
  <v-form ref="localForm" v-model="isValid" validate-on="input">
    <v-card class="mt-4" color="green-darken-4" variant="outlined" rounded="lg">
      <v-toolbar color="green">
        <v-card-title>Transformer configurations</v-card-title>
        <v-spacer />
        <v-select
          class="mx-4"
          v-model="transformer.type"
          :items="allowedOptions"
          label="Type"
          density="compact"
          rounded="lg"
          prepend-inner-icon="mdi-web"
          hide-details
          max-width="250px"
          variant="outlined"
        />
      </v-toolbar>

      <JSONTransformerForm v-if="transformer.type === 'JSON'" />
      <CSVTransformerForm v-else-if="transformer.type === 'CSV'" />
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import JSONTransformerForm from './JSONTransformerForm.vue'
import { computed, ref, watch } from 'vue'
import { useETLStore } from '@/store/etl'
import { storeToRefs } from 'pinia'
import CSVTransformerForm from './CSVTransformerForm.vue'
import { TRANSFORMER_OPTIONS, TransformerConfig } from '@/models/dataSource'
import { VForm } from 'vuetify/lib/components/index.mjs'

const localForm = ref<VForm>()

async function validate() {
  await localForm.value?.validate()
  return isValid.value
}

defineExpose({ validate })

const {
  transformer,
  dataSource,
  isTransformerValid: isValid,
} = storeToRefs(useETLStore())

const savedTransformer: TransformerConfig = JSON.parse(
  JSON.stringify(transformer.value)
)

watch(
  () => transformer.value.type,
  (newType) => {
    if (savedTransformer.type === newType)
      transformer.value = JSON.parse(JSON.stringify(savedTransformer))
    else dataSource.value.switchTransformer(newType)
  }
)

const allowedOptions = computed(() => {
  return dataSource.value.settings.type === 'SDL'
    ? ['CSV']
    : TRANSFORMER_OPTIONS
})
</script>
