<template>
  <v-card>
    <v-toolbar title="Orchestration systems" flat color="blue-grey">
      <v-spacer />
      <v-text-field
        class="mx-2"
        clearable
        v-model="search"
        :prepend-inner-icon="mdiMagnify"
        label="Search"
        hide-details
        density="compact"
        variant="underlined"
        rounded="xl"
        maxWidth="300"
      />

      <v-btn
        class="mx-2"
        :append-icon="mdiChevronRight"
        color="white"
        :to="{ name: 'HydroLoader' }"
      >
        Download Streaming Data Loader
      </v-btn>
      <v-btn
        @click="openDataConnectionTableDialog = !openDataConnectionTableDialog"
        rounded="xl"
        class="mr-4"
        color="white"
        variant="outlined"
        density="comfortable"
        :append-icon="openDataConnectionTableDialog ? mdiMenuUp : mdiMenuDown"
      >
        Manage data connections
      </v-btn>
    </v-toolbar>

    <div class="px-4 py-3 border-b">
      <v-btn-toggle
        v-model="statusFilter"
        mandatory
        variant="outlined"
        density="compact"
        divided
      >
        <v-btn value="all">All</v-btn>
        <v-btn value="failed">Failed</v-btn>
        <v-btn value="behind">Behind</v-btn>
        <v-btn value="paused">Paused</v-btn>
        <v-btn value="success">Success</v-btn>
        <v-btn value="pending">Pending</v-btn>
      </v-btn-toggle>
    </div>

    <v-data-table
      :group-by="groupBy"
      :headers="headers"
      :items="tableData"
      :search="search"
      :hover="true"
      class="elevation-2 orchestration-table"
      @click:row="onRowClick"
      :loading="loading"
      fixed-header
      hide-default-header
      hide-default-footer
      :items-per-page="-1"
    >
      <template v-slot:no-data>
        <div class="text-center pa-4">
          <v-icon :icon="mdiDesktopClassic" size="48" color="grey lighten-1" />
          <h4
            class="mt-2"
            v-if="
              statusFilter === 'all' &&
              tableData.length === 0 &&
              !`${search || ''}`.trim()
            "
          >
            You have not registered any orchestration systems.
          </h4>
          <h4 class="mt-2" v-else>No tasks match your search/filter.</h4>
          <p
            class="mb-4"
            v-if="
              statusFilter === 'all' &&
              tableData.length === 0 &&
              !`${search || ''}`.trim()
            "
          >
            Click the 'download Streaming Data Loader' button to get started or
            <a href="https://hydroserver.org" target="_blank"
              >read the documentation</a
            >
            to learn more.
          </p>
        </div>
      </template>
      <template
        v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }"
      >
        <tr class="bg-blue-grey-lighten-5 group-summary-row">
          <th :colspan="columns.length" scope="colgroup">
            <div class="d-flex align-center group-summary-content" @click="toggleGroup(item)">
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
              <div class="d-flex ga-2 align-center mr-2">
                <v-chip size="small" variant="tonal" color="blue-grey-darken-2">
                  Total tasks: {{ groupHealthSummary(item.items).total }}
                </v-chip>
                <v-chip size="small" variant="tonal" color="green-darken-2">
                  OK: {{ groupHealthSummary(item.items).ok }}
                </v-chip>
                <v-chip size="small" variant="tonal" color="error">
                  Needs attention: {{ groupHealthSummary(item.items).needsAttention }}
                </v-chip>
                <v-chip size="small" variant="tonal" color="blue-grey">
                  Loading paused: {{ groupHealthSummary(item.items).loadingPaused }}
                </v-chip>
                <v-chip size="small" variant="tonal" color="orange-darken-3">
                  Behind schedule: {{ groupHealthSummary(item.items).behindSchedule }}
                </v-chip>
                <v-chip size="small" variant="tonal" color="blue">
                  Pending: {{ groupHealthSummary(item.items).pending }}
                </v-chip>
                <v-chip size="small" variant="tonal" color="grey-darken-1">
                  Unknown: {{ groupHealthSummary(item.items).unknown }}
                </v-chip>
              </div>
              <v-btn-add
                class="mx-2"
                color="white"
                @click.stop="
                  openCreateDialog(item.items[0].raw.orchestrationSystem)
                "
              >
                Add task
              </v-btn-add>

              <v-btn
                variant="text"
                color="red-darken-2"
                :icon="mdiTrashCanOutline"
                @click.stop="
                  openDeleteDialog(item.items[0].raw.orchestrationSystem)
                "
              />
            </div>
          </th>
        </tr>
        <tr v-if="isGroupOpen(item)" class="group-column-header">
          <th
            v-for="column in columns"
            :key="`${item.value}-${column.key}`"
            scope="col"
            :class="[
              'text-caption font-weight-bold text-grey-darken-2',
              (column as any).key === 'actions' ? 'text-right' : '',
            ]"
          >
            {{ (column as any).title === 'Group' ? '' : (column as any).title }}
          </th>
        </tr>
      </template>

      <template v-slot:item.status="{ item }">
        <TaskStatus
          v-if="!item.isPlaceholder"
          :status="item.statusName"
          :paused="(item as any).schedule?.paused"
        />
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn
          v-if="!item.isPlaceholder"
          variant="text"
          color="black"
          :icon="(item as any).schedule?.paused ? mdiPlay : mdiPause"
          @click.stop="togglePaused(item)"
        />
        <v-btn
          v-if="
            !item.isPlaceholder &&
            isInternalSystem(item) &&
            !item.userClickedRunNow
          "
          class="ml-2"
          variant="outlined"
          color="green-darken-3"
          :append-icon="mdiPlay"
          @click.stop="runTaskNow(item)"
          >Run now</v-btn
        >
        <span
          v-else-if="
            !item.isPlaceholder &&
            isInternalSystem(item) &&
            item.userClickedRunNow
          "
          class="ml-2"
          >Run requested</span
        >
      </template>
    </v-data-table>
  </v-card>

  <v-dialog v-model="openCreate" v-if="selectedOrchestrationSystem">
    <TaskForm
      :orchestration-system="selectedOrchestrationSystem"
      @close="openCreate = false"
      @created="refreshTable"
    />
  </v-dialog>

  <v-dialog
    v-if="selectedOrchestrationSystem"
    v-model="openDelete"
    width="40rem"
  >
    <DeleteOrchestrationSystemCard
      :orchestration-system="selectedOrchestrationSystem"
      :tasks="workspaceTasks"
      @close="openDelete = false"
      @delete="refreshTable"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import TaskForm from '@/components/Orchestration/TaskForm.vue'
import TaskStatus from '@/components/Orchestration/TaskStatus.vue'
import DeleteOrchestrationSystemCard from '@/components/Orchestration/DeleteOrchestrationSystemCard.vue'
import router from '@/router/router'
import { formatTime } from '@/utils/time'
import hs, {
  OrchestrationSystem,
  StatusType,
  Task,
} from '@hydroserver/client'
import {
  mdiChevronRight,
  mdiDesktopClassic,
  mdiMagnify,
  mdiPause,
  mdiPlay,
  mdiTrashCanOutline,
} from '@mdi/js'
import { mdiMenuDown, mdiMenuUp } from '@mdi/js'
import { storeToRefs } from 'pinia'
import { useDataConnectionStore } from '@/store/dataConnection'
import { useOrchestrationStore } from '@/store/orchestration'

const props = defineProps<{
  workspaceId: string
}>()

const { openDataConnectionTableDialog } = storeToRefs(useDataConnectionStore())
const { workspaceTasks, orchestrationSearch, orchestrationStatusFilter } =
  storeToRefs(useOrchestrationStore())

const openCreate = ref(false)
const openDelete = ref(false)
const search = orchestrationSearch
const orchestrationSystems = ref<OrchestrationSystem[]>([])
const selectedOrchestrationSystem = ref<OrchestrationSystem>()
const groupBy = [{ key: 'orchestrationSystemName', order: 'asc' }] as const
const loading = ref(false)
const runNowTriggeredByTaskId = reactive<Record<string, boolean>>({})
const statusFilter = orchestrationStatusFilter

type TaskHealthFilter =
  | 'all'
  | 'failed'
  | 'behind'
  | 'paused'
  | 'success'
  | 'pending'

const classifyTask = (task: {
  statusName: StatusType
  schedule?: { paused?: boolean } | null
}) => {
  const displayedStatus = getDisplayedStatus(task)
  if (displayedStatus === 'Loading paused') return 'paused'
  if (displayedStatus === 'Needs attention') return 'failed'
  if (displayedStatus === 'Behind schedule') return 'behind'
  if (displayedStatus === 'OK') return 'success'
  return 'pending'
}

const getDisplayedStatus = (task: {
  statusName: StatusType
  schedule?: { paused?: boolean } | null
}) => {
  if (task.schedule?.paused && task.statusName !== 'Needs attention') {
    return 'Loading paused' as StatusType
  }
  return task.statusName
}

const groupHealthSummary = (rows: readonly any[]) => {
  return rows.reduce(
    (summary, row) => {
      const task = row?.raw ?? row
      if (!task || task.isPlaceholder) return summary

      const displayedStatus = getDisplayedStatus({
        statusName: task.statusName ?? hs.tasks.getStatusText(task),
        schedule: task.schedule,
      })

      if (displayedStatus === 'OK') summary.ok += 1
      else if (displayedStatus === 'Needs attention') summary.needsAttention += 1
      else if (displayedStatus === 'Loading paused') summary.loadingPaused += 1
      else if (displayedStatus === 'Behind schedule') summary.behindSchedule += 1
      else if (displayedStatus === 'Pending') summary.pending += 1
      else summary.unknown += 1

      summary.total += 1
      return summary
    },
    {
      ok: 0,
      needsAttention: 0,
      loadingPaused: 0,
      behindSchedule: 0,
      pending: 0,
      unknown: 0,
      total: 0,
    }
  )
}

const fetchOrchestrationData = async (newId: string) => {
  loading.value = true
  try {
    const [orchestrationSystemResponse, taskItems] = await Promise.all([
      hs.orchestrationSystems.listAllItems(),
      hs.tasks.listAllItems({ expand_related: true, workspace_id: [newId] }),
    ])

    // TODO: Allow HydroShare as an option once we have archival functionality in the orchestration system
    orchestrationSystems.value = orchestrationSystemResponse.filter(
      (os) =>
        (os.workspaceId === newId || !os.workspaceId) &&
        os.type !== 'HydroShare'
    )
    workspaceTasks.value = taskItems as any
  } catch (error) {
    console.error('Error fetching orchestration data', error)
  } finally {
    loading.value = false
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
  const statusFilterValue = (statusFilter.value || 'all') as TaskHealthFilter
  const taskRows = workspaceTasks.value.map((t) => ({
    ...t,
    schedule: t.schedule ?? null,
    statusName: hs.tasks.getStatusText(t),
    lastRun: !!t.latestRun?.startedAt ? formatTime(t.latestRun.startedAt) : '-',
    nextRun: t.schedule?.nextRunAt ? formatTime(t.schedule?.nextRunAt) : '-',
    orchestrationSystemName: (t as any).orchestrationSystem?.name ?? 'Unknown',
    isPlaceholder: false,
    userClickedRunNow: !!runNowTriggeredByTaskId[t.id],
  }))

  const filteredTaskRows =
    statusFilterValue === 'all'
      ? taskRows
      : taskRows.filter((task) => classifyTask(task) === statusFilterValue)

  const existingNames = new Set(taskRows.map((task) => task.orchestrationSystemName))

  const placeholders =
    statusFilterValue === 'all'
      ? orchestrationSystems.value
          .filter((os) => !existingNames.has(os.name))
          .map((os) => ({
            id: `placeholder-${os.id}`,
            name: '',
            statusName: 'Unknown' as StatusType,
            orchestrationSystemName: os.name,
            orchestrationSystem: JSON.parse(JSON.stringify(os)),
            schedule: { paused: false, nextRunAt: null } as any,
            isPlaceholder: true,
            userClickedRunNow: false,
          }))
      : []

  const combined = [...filteredTaskRows, ...placeholders]
  return combined.sort((a, b) => {
    if (a.orchestrationSystemName === b.orchestrationSystemName) {
      return a.name.localeCompare(b.name)
    }
    return a.orchestrationSystemName.localeCompare(b.orchestrationSystemName)
  })
})

async function runTaskNow(task: Partial<Task> & Pick<Task, 'id'>) {
  runNowTriggeredByTaskId[task.id] = true
  try {
    await hs.tasks.runTask(task.id)
  } finally {
    await refreshTable()
  }
}

async function togglePaused(task: Partial<Task> & Pick<Task, 'id'>) {
  if (!task.schedule) return
  task.schedule.paused = !task.schedule.paused
  await hs.tasks.update(task)
  await refreshTable()
}

const isInternalSystem = (item: any) => {
  const directType = item.orchestrationSystem?.type
  if (directType) return directType === 'INTERNAL'
  const matched = orchestrationSystems.value.find(
    (os) => os.id === item.orchestrationSystemId
  )
  return matched?.type === 'INTERNAL'
}

const openCreateDialog = (selectedItem: any) => {
  selectedOrchestrationSystem.value = selectedItem
  openCreate.value = true
}

const openDeleteDialog = (selectedItem: any) => {
  selectedOrchestrationSystem.value = selectedItem
  openDelete.value = true
}

const onRowClick = async (event: Event, item: any) => {
  if (item.item.isPlaceholder) return
  await router.push({ name: 'Task', params: { id: item.item.id } })
}

const headers = [
  {
    title: 'Task name',
    key: 'name',
  },
  {
    title: 'Data connection',
    key: 'dataConnection.name',
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
    title: 'Actions',
    key: 'actions',
    align: 'end',
  },
] as const
</script>

<style scoped>
.orchestration-table :deep(.v-table__wrapper) {
  max-height: 62vh;
  overflow-y: auto;
  overflow-x: auto;
  position: relative;
}
.orchestration-table {
  --group-summary-row-height: 64px;
  --group-sticky-seam-fix: 1px;
}
.group-summary-row {
  position: sticky;
  top: 0;
  z-index: 5;
}
.group-summary-row th {
  position: sticky;
  top: 0;
  z-index: 5;
  background: #eceff1;
  border-bottom: 1px solid #cfd8dc;
  padding: 0;
  text-align: left;
}
.group-summary-content {
  min-height: var(--group-summary-row-height);
  padding: 8px 12px;
  flex-wrap: nowrap;
}
.group-column-header th {
  font-weight: 600;
  background: #eceff1;
  border-bottom: 1px solid #cfd8dc;
  padding: 8px 12px;
  position: sticky;
  top: calc(var(--group-summary-row-height) - var(--group-sticky-seam-fix));
  z-index: 3;
}
</style>
