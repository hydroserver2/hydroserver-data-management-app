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
        @click="openJobTableDialog = !openJobTableDialog"
        rounded="xl"
        class="mr-4"
        color="white"
        variant="outlined"
        density="comfortable"
        :append-icon="openJobTableDialog ? mdiMenuUp : mdiMenuDown"
      >
        Manage task templates
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
      :loading="loading"
    >
      <template v-slot:no-data>
        <div class="text-center pa-4" v-if="tableData.length === 0">
          <v-icon :icon="mdiDesktopClassic" size="48" color="grey lighten-1" />
          <h4 class="mt-2">
            You have not registered any orchestration systems.
          </h4>
          <p class="mb-4">
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
              <!-- <v-chip
                v-if="getBehindScheduleCountText(statusesOf(item.items as any[]))"
                :prepend-icon="mdiClockAlertOutline"
                variant="text"
                class="ms-4"
                rounded="xl"
                color="orange-darken-4"
              >
                {{
                  getBehindScheduleCountText(statusesOf(item.items as any[]))
                }}
              </v-chip>
              <v-chip
                v-if="getBadCountText(statusesOf(item.items as any[]))"
                :prepend-icon="mdiAlert"
                variant="text"
                class="ms-4"
                rounded="xl"
                color="error"
              >
                {{ getBadCountText(statusesOf(item.items as any[])) }}
              </v-chip> -->
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
          </td>
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
      </template>
    </v-data-table-virtual>
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
import { ref, watch } from 'vue'
import TaskForm from '@/components/JobOrchestration/TaskForm.vue'
import TaskStatus from '@/components/JobOrchestration/TaskStatus.vue'
import DeleteOrchestrationSystemCard from '@/components/JobOrchestration/DeleteOrchestrationSystemCard.vue'
import { computed } from 'vue'
import router from '@/router/router'
import { formatTime } from '@/utils/time'
import hs, {
  OrchestrationSystem,
  Status,
  StatusType,
  Task,
} from '@hydroserver/client'
import {
  mdiAlert,
  mdiChevronRight,
  mdiClockAlertOutline,
  mdiDesktopClassic,
  mdiMagnify,
  mdiPause,
  mdiPlay,
  mdiTrashCanOutline,
} from '@mdi/js'
import { mdiMenuDown, mdiMenuUp } from '@mdi/js'
import { storeToRefs } from 'pinia'
import { useJobStore } from '@/store/job'
import { useOrchestrationStore } from '@/store/orchestration'

const props = defineProps<{
  workspaceId: string
}>()

const { openJobTableDialog } = storeToRefs(useJobStore())
const { workspaceTasks } = storeToRefs(useOrchestrationStore())

const openCreate = ref(false)
const openDelete = ref(false)
const search = ref()
const orchestrationSystems = ref<OrchestrationSystem[]>([])
const selectedOrchestrationSystem = ref<OrchestrationSystem>()
const groupBy = [{ key: 'orchestrationSystemName', order: 'asc' }] as const
const loading = ref(false)

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
  const dsList = workspaceTasks.value.map((t) => ({
    ...t,
    schedule: t.schedule ?? null,
    statusName: hs.tasks.getStatusText(t),
    lastRun: !!t.latestRun?.startedAt ? formatTime(t.latestRun.startedAt) : '-',
    nextRun: t.schedule?.nextRunAt ? formatTime(t.schedule?.nextRunAt) : '-',
    orchestrationSystemName: (t as any).orchestrationSystem?.name ?? 'Unknown',
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
      schedule: { paused: false, nextRunAt: null } as any,
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

async function togglePaused(task: Partial<Task> & Pick<Task, 'id'>) {
  if (!task.schedule) return
  task.schedule.paused = !task.schedule.paused
  await hs.tasks.update(task)
}

function statusesOf(rows: any[]): Status[] {
  return rows
    .filter((r) => !r.isPlaceholder)
    .map((r) => (r.status ?? r.raw?.status) as Status)
    .filter(Boolean)
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
    title: 'Task template',
    key: 'job.name',
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
