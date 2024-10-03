<template>
  <v-container>
    <h5 class="text-h5 mb-4">Manage data sources</h5>

    <v-card>
      <v-toolbar :flat="true" color="blue-grey" class="elevation-1">
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

        <v-btn-add color="white" @click="openCreate = true">
          Add Data Source
        </v-btn-add>
      </v-toolbar>

      <DataSourceTable :search="search" :key="key" />
    </v-card>
  </v-container>

  <v-dialog v-model="openCreate">
    <DataSourceForm @close="openCreate = false" @created="refreshTable" />
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DataSourceForm from '@/components/DataSource/DataSourceForm.vue'
import DataSourceTable from '@/components/DataSource/DataSourceTable.vue'

const search = ref()
const openCreate = ref(false)
const key = ref(0)
const refreshTable = () => (key.value += 1)
</script>
