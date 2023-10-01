<template>
  <v-container>
    <v-row class="mb-4">
      <v-col cols="auto">
        <h5 class="text-h5">Manage Data Loaders</h5>
      </v-col>
    </v-row>
    <v-data-table
      :headers="headers"
      :items="dataLoaders.dataLoaders.value"
      :search="search"
      hover
      class="elevation-3"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
          <v-spacer></v-spacer>
          <v-btn
            prepend-icon="mdi-download-circle"
            color="primary"
            variant="elevated"
            :to="{
              name: 'HydroLoader',
            }"
          >
            Download Streaming Data Loader
          </v-btn>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn
          icon="mdi-delete"
          @click="handleDeleteDataLoader(item.raw.id)"
        />
      </template>
    </v-data-table>
    <v-dialog v-model="confirmDeleteOpen" max-width="500">
      <v-card v-if="dataLoaders.selectedDataLoader.value">
        <v-card-title> Confirm Delete Data Loader </v-card-title>
        <v-card-text>
          Are you sure you want to delete the following data loader?
        </v-card-text>
        <v-card-text>
          •
          {{
            dataLoaders.dataLoaders.value.find(
              (dl) => dl.id.toString() === dataLoaders.selectedDataLoader.value.toString()
            ).name
          }}
        </v-card-text>
        <v-card-text>
          Note: You should uninstall this data loader instance before deleting
          it here. Deleting this data loader instance will unlink it from all
          associated data sources.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="confirmDeleteOpen = false"> Cancel </v-btn>
          <v-btn
            color="red"
            :disabled="dataLoaders.updatingDataLoader.value"
            @click="handleConfirmDeleteDataLoader()"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDataLoaders } from '@/composables/useDataLoaders'

const dataLoaders = useDataLoaders()
const search = ref()
const confirmDeleteOpen = ref(false)

function handleDeleteDataLoader(dataLoaderId) {
  dataLoaders.selectedDataLoader.value = dataLoaderId
  confirmDeleteOpen.value = true
}

function handleConfirmDeleteDataLoader() {
  dataLoaders.deleteDataLoader()
  confirmDeleteOpen.value = false
}

const headers = [
  {
    title: 'Name',
    align: 'start',
    sortable: true,
    key: 'name',
  },
  {
    title: 'Actions',
    align: 'end',
    sortable: false,
    key: 'actions',
  },
] as const
</script>

<style scoped></style>
