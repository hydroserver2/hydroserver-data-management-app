<template>
  <v-form ref="localForm" v-model="isValid" validate-on="input">
    <v-card
      color="blue-grey-darken-2"
      class="mt-4"
      variant="outlined"
      rounded="lg"
    >
      <v-toolbar title="Loader configurations" color="blue-grey-darken-2">
        <v-select
          class="mx-4"
          v-model="loader.type"
          :items="LOADER_OPTIONS"
          label="Type"
          density="compact"
          rounded="lg"
          prepend-inner-icon="mdi-web"
          hide-details
          max-width="250px"
          variant="outlined"
        />
      </v-toolbar>
      <v-card-text>
        No additional configurations needed for loading into HydroServer.
      </v-card-text>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { useETLStore } from '@/store/etl'
import { storeToRefs } from 'pinia'
import { LOADER_OPTIONS } from '@/models/dataSource'
import { ref } from 'vue'
import { VForm } from 'vuetify/lib/components/index.mjs'

const localForm = ref<VForm>()

async function validate() {
  await localForm.value?.validate()
  return isValid.value
}

defineExpose({ validate })

const { loader, isLoaderValid: isValid } = storeToRefs(useETLStore())
</script>
