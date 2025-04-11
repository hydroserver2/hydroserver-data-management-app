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

      <component v-if="currentForm" :is="currentForm" />
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import JSONTransformerForm from './JSONTransformerForm.vue'
import { computed, ref } from 'vue'
import { useETLStore } from '@/store/etl'
import { storeToRefs } from 'pinia'
import CSVTransformerForm from './CSVTransformerForm.vue'
import { TRANSFORMER_OPTIONS } from '@/models/dataSource'
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

const formComponents = {
  JSON: JSONTransformerForm,
  CSV: CSVTransformerForm,
} as any

const allowedOptions = computed(() => {
  return dataSource.value.settings.type === 'SDL'
    ? ['CSV']
    : TRANSFORMER_OPTIONS
})

const currentForm = computed(
  () => formComponents[transformer.value.type] || null
)
</script>
