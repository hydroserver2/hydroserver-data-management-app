<template>
  <v-container>
    <v-row class="mb-4">
      <v-col cols="auto">
        <h5 class="text-h5">Manage Data Sources</h5>
      </v-col>
    </v-row>
    <v-data-table
      :headers="headers"
      :items="dataSources.dataSources.value"
      :search="search"
      :hover="true"
      class="elevation-3"
    >
      <template v-slot:top>
        <v-toolbar :flat="true" color="blue-grey">
          <v-text-field
            class="mx-2"
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
          <v-spacer></v-spacer>
          <v-btn-add
            color="white"
            prepend-icon="mdi-plus"
            variant="elevated"
            @click="handleCreateDataSource"
          >
            Add Data Source
          </v-btn-add>
        </v-toolbar>
      </template>
      <template v-slot:item.status="{ item }">
        <DataSourceStatus :status="item.columns.status" :paused="null" />
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon
          v-if="item.raw.paused === true"
          :disabled="dataSources.updatingDataSource.value"
          icon="mdi-play"
          @click="handleTogglePaused(item.raw.id)"
        />
        <v-icon
          v-else
          :disabled="dataSources.updatingDataSource.value"
          icon="mdi-pause"
          @click="handleTogglePaused(item.raw.id)"
        />
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props" icon="mdi-dots-vertical" />
          </template>
          <v-list>
            <v-list-item
              title="Data Source Details"
              prepend-icon="mdi-information"
              :to="{
                name: 'DataSource',
                params: { id: item.raw.id },
              }"
            />
            <v-list-item
              title="Edit Data Source"
              prepend-icon="mdi-pencil"
              @click="handleEditDataSource(item.raw.id)"
            />
            <v-list-item
              title="Delete Data Source"
              prepend-icon="mdi-delete"
              @click="handleDeleteDataSource(item.raw.id)"
            />
          </v-list>
        </v-menu>
      </template>
    </v-data-table>
    <v-dialog v-model="dataSourceFormOpen" :persistent="true">
      <DataSourceForm
        @close-dialog="handleCloseForm()"
        :dataSourceId="dataSources.selectedDataSource.value"
      />
    </v-dialog>
    <v-dialog v-model="confirmDeleteOpen" max-width="500">
      <v-card v-if="dataSources.selectedDataSource.value">
        <v-card-title> Confirm Delete Data Source </v-card-title>
        <v-card-text>
          Are you sure you want to delete the following data source?
        </v-card-text>
        <v-card-text>
          •
          {{
            dataSources.dataSources.value.find(
              (dl) => dl.id === dataSources.selectedDataSource.value
            )?.name
          }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn-cancel @click="confirmDeleteOpen = false">
            Cancel
          </v-btn-cancel>
          <v-btn-delete
            color="red"
            :disabled="dataSources.updatingDataSource.value"
            @click="handleConfirmDeleteDataSource()"
          >
            Delete
          </v-btn-delete>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDataSources } from '@/composables/useDataSources'
import DataSourceForm from '@/components/DataSource/DataSourceForm.vue'
import DataSourceStatus from '@/components/DataSource/DataSourceStatus.vue'

const dataSources = useDataSources()

const search = ref()
const dataSourceFormOpen = ref(false)
const confirmDeleteOpen = ref(false)

async function handleTogglePaused(dataSourceId: any) {
  dataSources.selectedDataSource.value = dataSourceId
  await dataSources
    .togglePaused()
    .then((dataSources.selectedDataSource.value = null))
}

function handleCreateDataSource() {
  dataSources.selectedDataSource.value = null
  dataSourceFormOpen.value = true
}

function handleEditDataSource(dataSourceId: any) {
  dataSources.selectedDataSource.value = dataSourceId
  dataSourceFormOpen.value = true
}

function handleDeleteDataSource(dataSourceId: any) {
  dataSources.selectedDataSource.value = dataSourceId
  confirmDeleteOpen.value = true
}

function handleCloseForm() {
  dataSourceFormOpen.value = false
  dataSources.reloadDataSources()
}

function handleConfirmDeleteDataSource() {
  dataSources.deleteDataSource()
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
    title: 'Data Loader',
    align: 'start',
    sortable: true,
    key: 'dataLoaderName',
  },
  {
    title: 'Status',
    align: 'start',
    sortable: true,
    key: 'status',
  },
  {
    title: 'Last Synced',
    align: 'start',
    sortable: true,
    key: 'lastSynced',
  },
  {
    title: 'Next Sync',
    align: 'start',
    sortable: true,
    key: 'nextSync',
  },
  {
    title: 'Actions',
    align: 'start',
    sortable: true,
    key: 'actions',
  },
] as const
</script>

<style scoped></style>
