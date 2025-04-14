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
                @click.stop="
                  openCreateDialog(item.items[0].raw.orchestrationSystem)
                "
              >
                Add data source
              </v-btn-add>
            </div>
          </td>
        </tr>
      </template>

      <template v-slot:item.status="{ item }">
        <DataSourceStatus
          v-if="!item.isPlaceholder"
          :status="item.statusName"
          :paused="item.status.paused"
        />
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn
          v-if="!item.isPlaceholder"
          variant="text"
          color="black"
          :icon="item.status.paused ? 'mdi-play' : 'mdi-pause'"
          @click.stop="togglePaused(item)"
        />
      </template>
    </v-data-table-virtual>
  </v-card>

  <v-dialog v-model="openCreate" v-if="selectedOrchestrationSystem">
    <DataSourceForm
      :orchestration-system="selectedOrchestrationSystem"
      @close="openCreate = false"
      @created="refreshTable"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import DataSourceForm from '@/components/DataSource/DataSourceForm.vue'
import DataSourceStatus from '@/components/DataSource/DataSourceStatus.vue'
import { DataSource } from '@/models'
import { api } from '@/services/api'
import { computed } from 'vue'
import router from '@/router/router'
import { getStatusText, OrchestrationSystem, Status } from '@/models/dataSource'
import { StatusType } from '@/models/dataSource'

const props = defineProps<{
  workspaceId: string
}>()

const openCreate = ref(false)
const search = ref()
const orchestrationSystems = ref<OrchestrationSystem[]>([])
const dataSources = ref<DataSource[]>([])
const selectedOrchestrationSystem = ref<OrchestrationSystem>()
const groupBy = [{ key: 'orchestrationSystemName', order: 'asc' }] as const

const fetchOrchestrationData = async (newId: string) => {
  try {
    const [orchestrationSystemResponse, dataSourceResponse] = await Promise.all(
      [api.fetchOrchestrationSystems(), api.fetchDataSources()]
    )

    orchestrationSystems.value = orchestrationSystemResponse.filter(
      (os: OrchestrationSystem) => os.workspaceId === newId || !os.workspaceId
    )
    dataSources.value = dataSourceResponse.filter(
      (d: DataSource) => d.workspaceId === newId
    )
  } catch (error) {
    console.error('Error fetching orchestration data', error)
  }
}

const refreshTable = async () => {
  await fetchOrchestrationData(props.workspaceId)
}

watch(
  () => props.workspaceId,
  async (newId) => {
    if (newId == null) return
    await fetchOrchestrationData(newId)
  },
  { immediate: true }
)

const tableData = computed(() => {
  const dsList = dataSources.value.map((d) => ({
    ...d,
    statusName: getStatusText(d.status),
    lastRun: d.status.lastRun,
    nextRun: d.status.nextRun,
    orchestrationSystemName: d.orchestrationSystem.name,
    isPlaceholder: false,
  }))

  const existingNames = new Set(dsList.map((ds) => ds.orchestrationSystemName))

  const placeholders = orchestrationSystems.value
    .filter((os) => !existingNames.has(os.name))
    .map((os) => ({
      id: `placeholder-${os.id}`,
      name: '',
      statusName: 'Unknown' as StatusType,
      status: {} as Status,
      orchestrationSystemName: os.name,
      orchestrationSystem: JSON.parse(JSON.stringify(os)),
      isPlaceholder: true,
    }))

  const combined = [...dsList, ...placeholders]
  return combined.sort((a, b) => {
    if (a.orchestrationSystemName === b.orchestrationSystemName) {
      return a.name.localeCompare(b.name)
    }
    return a.orchestrationSystemName.localeCompare(b.orchestrationSystemName)
  })
})

async function togglePaused(ds: any) {
  ds.status.paused = !ds.status.paused
  await api.updateDataSource({ status: ds.status } as DataSource)
}

const openCreateDialog = (selectedItem: any) => {
  selectedOrchestrationSystem.value = selectedItem
  openCreate.value = true
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
  if (item.item.isPlaceholder) return
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
</script>
