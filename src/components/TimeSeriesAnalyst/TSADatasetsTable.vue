<template>
  <h5 class="text-h5">Datasets</h5>

  <div class="d-flex align-center my-4">
    <v-btn color="blue-grey-lighten-4">Show All</v-btn>
    <v-btn color="blue-grey-lighten-4" class="mx-2">Show Selected</v-btn>
    <v-btn color="blue-grey-lighten-4">Clear Selected</v-btn>

    <v-spacer />

    <v-btn color="blue-grey-lighten-4">Show/Hide Columns</v-btn>
  </div>

  <v-toolbar flat color="secondary">
    <v-text-field
      class="mx-2"
      v-model="search"
      prepend-inner-icon="mdi-magnify"
      label="Search"
      hide-details
      density="compact"
    />

    <v-spacer />

    <v-btn prepend-icon="mdi-download">Download Selected</v-btn>
  </v-toolbar>
  <v-data-table
    :headers="headers"
    class="elevation-2"
    color="green"
  ></v-data-table>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const search = ref()
const headers = [
  { title: 'Plot', key: 'plot' },
  { title: 'Site Code', key: 'siteCode' },
  { title: 'Observed Property', key: 'observedProperty' },
  { title: 'Quality Control Level', key: 'qualityControlLevel' },
  { title: 'Number Observations', key: 'numberObservations' },
  { title: 'Date Last Updated', key: 'dateLastUpdated' },
] as const
</script>
