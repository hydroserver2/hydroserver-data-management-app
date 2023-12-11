<template>
  <v-data-table
    :headers="headers"
    :items="tableData"
    :search="search"
    :hover="true"
    class="elevation-2"
  >
    <template v-slot:item.status="{ item }">
      <DataSourceStatus :status="item.raw.status" :paused="null" />
    </template>

    <template v-slot:item.actions="{ item }">
      <v-icon
        :icon="item.raw.paused ? 'mdi-pause' : 'mdi-play'"
        @click="togglePaused(item.raw)"
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
            @click="openDialog(item.raw, 'edit')"
          />
          <v-list-item
            title="Delete Data Source"
            prepend-icon="mdi-delete"
            @click="openDialog(item.raw, 'delete')"
          />
        </v-list>
      </v-menu>
    </template>
  </v-data-table>

  <v-dialog v-model="openEdit" :persistent="true">
    <DataSourceForm
      :dataSourceId="item.id"
      @close="openEdit = false"
      @updated="onUpdated"
    />
  </v-dialog>

  <v-dialog v-model="openDelete" max-width="500">
    <DeleteDataSourceCard @delete="onDelete" @close="openDelete = false" />
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
import { useMetadataTable } from '@/composables/useMetadataTable'
import DeleteDataSourceCard from '@/components/DataSource/DeleteDataSourceCard.vue'
import { onUpdated } from 'vue'

const search = ref()
const dataLoaders = ref<DataLoader[]>([])

const { item, items, openEdit, openDelete, openDialog, onDelete } =
  useMetadataTable(api.fetchDataSources, api.deleteDataSource, DataSource)

const tableData = computed(() =>
  items.value
    .map((d) => ({
      ...d,
      status: getStatus(d),
      dataLoaderName:
        dataLoaders.value.find((dl) => dl.id === d.dataLoaderId)?.name || '',
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
)

async function togglePaused(ds: DataSource) {
  ds.paused = !ds.paused
  await api.updateDataSource(ds)
}

const headers = [
  {
    title: 'Name',
    key: 'name',
  },
  {
    title: 'Data Loader',
    key: 'dataLoaderName',
  },
  {
    title: 'Status',
    key: 'status',
  },
  {
    title: 'Last Synced',
    key: 'lastSynced',
  },
  {
    title: 'Next Sync',
    key: 'nextSync',
  },
  {
    title: 'Actions',
    key: 'actions',
  },
] as const

onMounted(async () => {
  dataLoaders.value = await api.fetchDataLoaders()
})
</script>
