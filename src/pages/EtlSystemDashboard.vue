<template>
  <v-container>
    <h5 class="text-h5 mb-4">Manage ETL systems</h5>
    <v-card>
      <v-toolbar flat color="indigo">
        <v-text-field
          class="mx-4"
          clearable
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search"
          hide-details
          density="compact"
          rounded="xl"
          maxWidth="300"
        />

        <v-spacer />

        <v-btn-add
          prepend-icon="mdi-download"
          color="white"
          :to="{ name: 'HydroLoader' }"
        >
          Download Streaming Data Loader
        </v-btn-add>
      </v-toolbar>

      <EtlSystemTable :search="search" />
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EtlSystemTable from '@/components/EtlSystem/EtlSystemTable.vue'

const search = ref()
</script>
