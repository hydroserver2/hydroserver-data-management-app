<template>
  <v-card>
    <v-toolbar title="Data sources" flat color="blue-grey" class="elevation-1">
      <v-spacer />
      <v-text-field
        class="mx-2"
        clearable
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Search"
        hide-details
        density="compact"
        variant="underlined"
        rounded="xl"
        maxWidth="300"
      />

      <v-btn-add class="mx-2" color="white" @click="openCreate = true">
        Add data source
      </v-btn-add>
    </v-toolbar>

    <v-data-table-virtual
      :headers="headers"
      :items="tableData"
      :search="search"
      :hover="true"
      class="elevation-2"
      @click:row="onRowClick"
    >
      <template v-slot:item.status="{ item }">
        <DataSourceStatus :status="item.status" :paused="item.paused" />
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn
          variant="text"
          color="black"
          :icon="item.paused ? 'mdi-play' : 'mdi-pause'"
          @click="togglePaused(item)"
        />
        <!-- <v-btn
          variant="text"
          icon="mdi-pencil"
          color="grey-darken-2"
          @click="openDialog(item, 'edit')"
        />
        <v-btn
          variant="text"
          icon="mdi-delete"
          color="red-darken-2"
          @click="openDialog(item, 'delete')"
        /> -->
      </template>
    </v-data-table-virtual>

    <v-dialog v-model="openEdit">
      <DataSourceForm
        :data-source="item"
        @close="openEdit = false"
        @updated="onUpdate"
      />
    </v-dialog>

    <v-dialog v-model="openDelete" max-width="500">
      <DeleteDataSourceCard
        :item-name="item.name"
        @delete="onDelete"
        @close="openDelete = false"
      />
    </v-dialog>
  </v-card>

  <v-dialog v-model="openCreate">
    <DataSourceForm @close="openCreate = false" @created="refreshTable" />
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, toRef } from 'vue'
import DataSourceForm from '@/components/DataSource/Form/DataSourceForm.vue'
import DataSourceStatus from '@/components/DataSource/DataSourceStatus.vue'
import { EtlSystem, DataSource } from '@/types'
import { api } from '@/services/api'
import { computed } from 'vue'
import { getStatus } from '@/utils/dataSourceUtils'
import { useTableLogic } from '@/composables/useTableLogic'
import DeleteDataSourceCard from '@/components/DataSource/DeleteDataSourceCard.vue'
import dataSourceFixtures from '@/utils/test/fixtures/dataSourceFixtures'
import router from '@/router/router'

const props = defineProps<{
  workspaceId: string
}>()

const openCreate = ref(false)
const etlSystems = ref<EtlSystem[]>([])
const key = ref(0)
const refreshTable = () => (key.value += 1)
const search = ref()

const { item, items, openEdit, openDelete, openDialog, onDelete, onUpdate } =
  useTableLogic(
    // async (wsId: string) => await api.fetchWorkspaceDataSources(wsId),
    async (wsId: string) => dataSourceFixtures as DataSource[],
    api.deleteDataSource,
    DataSource,
    toRef(props, 'workspaceId')
  )

const tableData = computed(() =>
  items.value
    .map((d) => ({
      ...d,
      status: getStatus(d),
      etlSystemName:
        etlSystems.value.find((dl) => dl.id === d.etlSystemId)?.name || '',
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
)

async function togglePaused(ds: DataSource) {
  ds.paused = !ds.paused
  await api.updateDataSource(ds)
}

const onRowClick = (event: Event, item: any) => {
  router.push({ name: 'DataSource', params: { id: item.item.id } })
}

const headers = [
  {
    title: 'Name',
    key: 'name',
  },
  {
    title: 'ETL System',
    key: 'etlSystemName',
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
    title: 'Pause',
    key: 'actions',
    align: 'end',
  },
] as const

onMounted(async () => {
  // etlSystems.value = await api.fetchEtlSystems()
})
</script>
