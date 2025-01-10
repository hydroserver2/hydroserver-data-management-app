<template>
  <v-card class="mt-4" variant="outlined" rounded="lg">
    <v-card-title class="text-h6 bg-indigo-lighten-2 mb-4">
      Loader configurations
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="3">
          <v-select
            v-model="loaderConfig.type"
            :items="types"
            label="Type"
            density="compact"
            rounded="lg"
            prepend-inner-icon="mdi-web"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useETLStore } from '@/store/etl'
import { storeToRefs } from 'pinia'

const { loaderConfig } = storeToRefs(useETLStore())
const types = ['HydroServer']
</script>
