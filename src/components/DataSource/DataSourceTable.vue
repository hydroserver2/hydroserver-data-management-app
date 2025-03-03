<template>
  <v-data-table-virtual
    :headers="headers"
    :items="tableData"
    :search="search"
    :hover="true"
    @click:row="onRowClick"
    class="elevation-2"
  >
    <template v-slot:item.status="{ item }">
      <DataSourceStatus :status="item.status" :paused="item.paused" />
    </template>

    <template v-slot:item.actions="{ item }">
      <v-icon
        :icon="item.paused ? 'mdi-play' : 'mdi-pause'"
        @click="togglePaused(item)"
      />
    </template>
  </v-data-table-virtual>
</template>

<script setup lang="ts">
import { onMounted, ref, toRef } from 'vue'
import DataSourceForm from '@/components/DataSource/DataSourceForm.vue'
import DataSourceStatus from '@/components/DataSource/DataSourceStatus.vue'
import { DataLoader, DataSource } from '@/types'
import { api } from '@/services/api'
import { computed } from 'vue'
import { getStatus } from '@/utils/dataSourceUtils'
import { useTableLogic } from '@/composables/useTableLogic'
import DataSourceStatus from '@/components/DataSource/DataSourceStatus.vue'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/store/workspaces'

const { selectedWorkspace } = storeToRefs(useWorkspaceStore())

defineProps({ search: String })
const dataLoaders = ref<DataLoader[]>([])
const router = useRouter()

// TODO: This needs a new endpoint
const { item, items, openEdit, openDelete, openDialog, onDelete, onUpdate } =
  useTableLogic(
    api.fetchDataSources,
    api.deleteDataSource,
    DataSource,
    toRef(selectedWorkspace.value?.id || '')
  )

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
