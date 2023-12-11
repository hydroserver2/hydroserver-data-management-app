<template>
  <v-container>
    <h5 class="text-h5 mb-4">Manage Data Sources</h5>

    <v-data-table
      :headers="headers"
      :items="tableData"
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
            hide-details
          />

          <v-spacer />

          <v-btn-add color="white" @click="handleCreateDataSource">
            Add Data Source
          </v-btn-add>
        </v-toolbar>
      </template>

      <template v-slot:item.status="{ item }">
        <DataSourceStatus :status="item.raw.status" :paused="null" />
      </template>

      <template v-slot:item.actions="{ item }">
        <v-icon
          v-if="item.raw.paused"
          :disabled="isUpdating"
          icon="mdi-play"
          @click="handleTogglePaused(item.raw)"
        />
        <v-icon
          v-else
          :disabled="isUpdating"
          icon="mdi-pause"
          @click="handleTogglePaused(item.raw)"
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
              @click="handleEditDataSource(item.raw)"
            />
            <v-list-item
              title="Delete Data Source"
              prepend-icon="mdi-delete"
              @click="handleDeleteDataSource(item.raw)"
            />
          </v-list>
        </v-menu>
      </template>
    </v-data-table>
  </v-container>

  <v-dialog v-model="dataSourceFormOpen" :persistent="true">
    <DataSourceForm
      @close-dialog="handleCloseForm()"
      :dataSourceId="selectedDataSource.id || undefined"
    />
  </v-dialog>

  <v-dialog v-model="confirmDeleteOpen" max-width="500">
    <v-card v-if="selectedDataSource">
      <v-card-title> Confirm Delete Data Source </v-card-title>
      <v-card-text>
        Are you sure you want to delete
        <strong> {{ selectedDataSource.name }}? </strong>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn-cancel @click="confirmDeleteOpen = false"> Cancel </v-btn-cancel>
        <v-btn-delete
          color="red"
          :disabled="isUpdating"
          @click="handleConfirmDeleteDataSource()"
        >
          Delete
        </v-btn-delete>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import DataSourceForm from '@/components/DataSource/DataSourceForm.vue'
import DataSourceStatus from '@/components/DataSource/DataSourceStatus.vue'
import { DataLoader, DataSource } from '@/types'
import { api } from '@/services/api'
import { computed } from 'vue'
import { getStatus } from '@/utils/dataSourceUtils'

const search = ref()
const dataSourceFormOpen = ref(false)
const confirmDeleteOpen = ref(false)
const isUpdating = ref(false)
const selectedDataSource = ref<DataSource>(new DataSource())
const dataSources = ref<DataSource[]>([])
const dataLoaders = ref<DataLoader[]>([])

const tableData = computed(() =>
  dataSources.value.map((d) => ({
    ...d,
    status: getStatus(d),
    dataLoaderName:
      dataLoaders.value.find((dl) => dl.id === d.dataLoaderId)?.name || '',
  }))
)

async function handleTogglePaused(ds: DataSource) {
  selectedDataSource.value.id = ds.id

  isUpdating.value = true
  ds.paused = !ds.paused
  await api.updateDataSource(ds)
  isUpdating.value = false
  selectedDataSource.value = new DataSource()
}

function handleCreateDataSource() {
  selectedDataSource.value = new DataSource()
  dataSourceFormOpen.value = true
}

function handleEditDataSource(dataSource: DataSource) {
  selectedDataSource.value = dataSource
  dataSourceFormOpen.value = true
}

function handleDeleteDataSource(dataSource: DataSource) {
  selectedDataSource.value = dataSource
  confirmDeleteOpen.value = true
}

function handleCloseForm() {
  dataSourceFormOpen.value = false
}

function handleConfirmDeleteDataSource() {
  confirmDeleteOpen.value = false
}

const headers = [
  {
    title: 'Name',
    align: 'start',
    key: 'name',
  },
  {
    title: 'Data Loader',
    align: 'start',
    key: 'dataLoaderName',
  },
  {
    title: 'Status',
    align: 'start',
    key: 'status',
  },
  {
    title: 'Last Synced',
    align: 'start',
    key: 'lastSynced',
  },
  {
    title: 'Next Sync',
    align: 'start',
    key: 'nextSync',
  },
  {
    title: 'Actions',
    align: 'start',
    key: 'actions',
  },
] as const

onMounted(async () => {
  dataLoaders.value = await api.fetchDataLoaders()
  dataSources.value = await api.fetchDataSources()
  dataSources.value.sort((a, b) => a.name.localeCompare(b.name))
})
</script>
