<template>
  <v-card>
    <v-toolbar title="Orchestration systems" flat color="blue-grey">
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

      <v-btn
        class="mx-2"
        append-icon="mdi-chevron-right"
        color="white"
        :to="{ name: 'HydroLoader' }"
      >
        Download Streaming Data Loader
      </v-btn>
    </v-toolbar>

    <v-data-table-virtual
      :group-by="groupBy"
      :headers="headers"
      :items="tableData"
      :search="search"
      :hover="true"
      class="elevation-2"
      @click:row="onRowClick"
    >
      <template
        v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }"
      >
        <tr class="bg-blue-grey-lighten-5" @click="toggleGroup(item)">
          <td :colspan="columns.length">
            <div class="d-flex align-center">
              <v-btn
                :icon="isGroupOpen(item) ? '$expand' : '$next'"
                color="medium-emphasis"
                density="comfortable"
                size="small"
                variant="outlined"
                @click.stop="toggleGroup(item)"
              ></v-btn>

              <span class="ms-4">{{ item.value }}</span>
              <v-spacer />
              <v-chip
                v-if="getBehindScheduleCountText(item.items as any[])"
                prepend-icon="mdi-clock-alert-outline"
                variant="text"
                class="ms-4"
                rounded="xl"
                color="orange-darken-4"
              >
                {{ getBehindScheduleCountText(item.items as any[]) }}
              </v-chip>
              <v-chip
                v-if="getBadCountText(item.items as any[])"
                prepend-icon="mdi-alert"
                variant="text"
                class="ms-4"
                rounded="xl"
                color="error"
              >
                {{ getBadCountText(item.items as any[]) }}
              </v-chip>
              <v-btn-add
                class="mx-2"
                color="white"
                @click.stop="openCreate = true"
              >
                Add data source
              </v-btn-add>
            </div>
          </td>
        </tr>
      </template>

      <template v-slot:item.status="{ item }">
        <DataSourceStatus :status="item.status" :paused="item.paused" />
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn
          variant="text"
          color="black"
          :icon="item.paused ? 'mdi-play' : 'mdi-pause'"
          @click.stop="togglePaused(item)"
        />
      </template>
    </v-data-table-virtual>

    <v-dialog v-model="openEdit">
      <DataSourceForm
        :old-data-source="item"
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
import DataSourceForm from '@/components/DataSource/DataSourceForm.vue'
import DataSourceStatus from '@/components/DataSource/DataSourceStatus.vue'
import { DataSource } from '@/models'
import { EtlSystem } from '@/types'
import { api } from '@/services/api'
import { computed } from 'vue'
import { useTableLogic } from '@/composables/useTableLogic'
import DeleteDataSourceCard from '@/components/DataSource/DeleteDataSourceCard.vue'
import dataSourceFixtures from '@/utils/test/fixtures/dataSourceFixtures'
import router from '@/router/router'
import etlSystemFixtures from '@/utils/test/fixtures/etlSystemFixtures'

const groupBy = [{ key: 'etlSystemName', order: 'asc' }] as const

const props = defineProps<{
  workspaceId: string
}>()

const openCreate = ref(false)
const etlSystems = ref<EtlSystem[]>(etlSystemFixtures as EtlSystem[])
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
      status: d.getStatus(),
      etlSystemName:
        etlSystems.value.find((dl) => dl.id === d.etlSystemId)?.name || '',
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
)

async function togglePaused(ds: any) {
  ds.paused = !ds.paused
  console.log('ds', ds)
  await api.updateDataSource({ paused: ds.paused } as DataSource)
}

function getBadCountText(groupItems: any[]) {
  const badCount = groupItems.filter(
    (i) => i.raw.status === 'Needs attention'
  ).length
  if (!badCount) return ''
  if (badCount === 1) return '1 error'
  return `${badCount} errors`
}

function getBehindScheduleCountText(groupItems: any[]) {
  const behindCount = groupItems.filter(
    (i) => i.raw.status === 'Behind schedule'
  ).length
  if (!behindCount) return ''
  return `${behindCount} behind schedule`
}

const onRowClick = async (event: Event, item: any) => {
  await router.push({ name: 'DataSource', params: { id: item.item.id } })
}

const headers = [
  {
    title: 'Data source name',
    key: 'name',
  },
  {
    title: 'Status',
    key: 'status',
  },
  {
    title: 'Last run',
    key: 'lastRun',
  },
  {
    title: 'Next run',
    key: 'nextRun',
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
