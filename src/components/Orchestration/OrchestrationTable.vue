<template>
  <v-card>
    <v-toolbar flat color="blue-grey" class="gap-2">
      <v-toolbar-title class="flex-shrink-0">
        Orchestration systems
      </v-toolbar-title>
      <div class="ml-auto flex min-w-0 items-center gap-2">
        <v-text-field
          class="w-[200px] max-w-[200px]"
          clearable
          v-model="search"
          :prepend-inner-icon="mdiMagnify"
          label="Search"
          hide-details
          density="compact"
          variant="underlined"
          rounded="xl"
        />

        <v-autocomplete
          v-model="statusFilter"
          :items="statusOptions"
          item-title="title"
          item-value="value"
          label="Status filters"
          multiple
          clearable
          hide-details
          density="compact"
          variant="outlined"
          :prepend-inner-icon="mdiFilterVariant"
          autocomplete="off"
          name="orchestration-status-filter"
          spellcheck="false"
          class="w-[280px] max-w-[280px]"
        >
          <template #selection="{ item, index }">
            <v-chip
              color="primary-lighten-2"
              rounded
              density="comfortable"
              closable
              class="mr-1"
              @click:close="statusFilter.splice(index, 1)"
            >
              <span>{{ item.title }}</span>
            </v-chip>
          </template>
        </v-autocomplete>
        <v-btn
          @click="
            openDataConnectionTableDialog = !openDataConnectionTableDialog
          "
          rounded="xl"
          color="white"
          variant="outlined"
          density="comfortable"
          class="mr-2"
          :append-icon="openDataConnectionTableDialog ? mdiMenuUp : mdiMenuDown"
        >
          Manage data connections
        </v-btn>
      </div>
    </v-toolbar>

    <div class="orchestration-table">
      <div
        v-if="loading"
        class="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500"
      >
        Loading orchestration tasks...
      </div>

      <div
        v-else-if="groupList.length === 0"
        class="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500"
      >
        <h4
          class="mt-2 text-base font-semibold text-slate-700"
          v-if="statusFilter.length === 0 && !`${search || ''}`.trim()"
        >
          You have not registered any orchestration systems.
        </h4>
        <h4 class="mt-2 text-base font-semibold text-slate-700" v-else>
          No tasks match your search/filter.
        </h4>
        <p
          class="mt-2"
          v-if="statusFilter.length === 0 && !`${search || ''}`.trim()"
        >
          Click the 'download Streaming Data Loader' button to get started or
          <a
            href="https://hydroserver.org"
            target="_blank"
            class="text-blue-600 underline"
            >read the documentation</a
          >
          to learn more.
        </p>
      </div>

      <div v-else class="space-y-3">
        <section
          v-for="group in groupList"
          :key="group.name"
          class="overflow-hidden rounded-b-lg border border-slate-200 bg-white shadow-sm"
        >
          <div
            role="button"
            tabindex="0"
            class="flex w-full items-center gap-3 border-b border-slate-200 bg-[#eceff1] px-4 py-3 text-left cursor-pointer"
            @click="toggleGroup(group.name)"
            @keydown.enter.prevent="toggleGroup(group.name)"
            @keydown.space.prevent="toggleGroup(group.name)"
          >
            <v-btn
              variant="outlined"
              density="comfortable"
              size="small"
              :icon="isGroupOpen(group.name) ? mdiChevronDown : mdiChevronRight"
              class="flex-shrink-0"
            />
            <div class="flex min-w-0 flex-1 items-center gap-4">
              <span class="truncate text-sm font-semibold text-slate-800">
                {{ group.name }}
              </span>
              <div class="hidden flex-wrap items-center gap-2 md:flex">
                <v-chip size="small" variant="tonal" color="blue-grey-darken-2">
                  Total tasks: {{ group.summary.total }}
                </v-chip>
                <v-chip
                  v-if="group.summary.ok > 0"
                  size="small"
                  variant="tonal"
                  color="green-darken-2"
                >
                  OK: {{ group.summary.ok }}
                </v-chip>
                <v-chip
                  v-if="group.summary.needsAttention > 0"
                  size="small"
                  variant="tonal"
                  color="error"
                >
                  Needs attention: {{ group.summary.needsAttention }}
                </v-chip>
                <v-chip
                  v-if="group.summary.loadingPaused > 0"
                  size="small"
                  variant="tonal"
                  color="blue-grey"
                >
                  Loading paused: {{ group.summary.loadingPaused }}
                </v-chip>
                <v-chip
                  v-if="group.summary.behindSchedule > 0"
                  size="small"
                  variant="tonal"
                  color="orange-darken-3"
                >
                  Behind schedule: {{ group.summary.behindSchedule }}
                </v-chip>
                <v-chip
                  v-if="group.summary.pending > 0"
                  size="small"
                  variant="tonal"
                  color="blue"
                >
                  Pending: {{ group.summary.pending }}
                </v-chip>
                <v-chip
                  v-if="group.summary.unknown > 0"
                  size="small"
                  variant="tonal"
                  color="grey-darken-1"
                >
                  Unknown: {{ group.summary.unknown }}
                </v-chip>
              </div>
            </div>
            <div class="ml-auto flex items-center gap-2">
              <v-btn-add
                class="hidden md:inline-flex"
                color="white"
                @click.stop="openCreateDialog(group.orchestrationSystem)"
                :disabled="!group.orchestrationSystem"
              >
                Add task
              </v-btn-add>
              <v-btn
                variant="text"
                color="red-darken-2"
                :icon="mdiTrashCanOutline"
                @click.stop="openDeleteDialog(group.orchestrationSystem)"
                :disabled="!group.orchestrationSystem"
              />
            </div>
          </div>

          <div v-if="isGroupOpen(group.name)" class="border-t border-slate-200">
            <div
              class="max-h-[62vh] overflow-auto"
              ref="bodyScrollRef"
              @scroll.passive="onBodyScroll"
            >
              <table class="w-full table-fixed text-sm whitespace-nowrap">
                <thead
                  class="sticky top-0 z-10 bg-slate-50 text-xs font-semibold text-slate-600"
                >
                  <tr>
                    <th class="px-3 py-2 text-left">Task name</th>
                    <th class="px-3 py-2 text-left">Data connection</th>
                    <th class="px-3 py-2 text-left">Status</th>
                    <th class="px-3 py-2 text-left">Last / Next run</th>
                    <th class="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody v-if="openGroupRows.length === 0">
                  <tr>
                    <td
                      colspan="5"
                      class="px-3 py-6 text-center text-sm text-slate-500"
                    >
                      No tasks registered for this orchestration system.
                    </td>
                  </tr>
                </tbody>
                <tbody v-else>
                  <tr
                    class="border-0"
                    :style="{ height: `${virtualPaddingTop}px` }"
                  >
                    <td colspan="5"></td>
                  </tr>
                  <tr
                    v-for="row in virtualRows"
                    :key="row.id"
                    class="h-20 border-b border-slate-100 hover:bg-slate-50"
                    :class="
                      row.isPlaceholder ? 'text-slate-400' : 'cursor-pointer'
                    "
                    @click="onRowClick(row)"
                  >
                    <td
                      class="px-3 py-2 font-medium text-slate-800 whitespace-normal break-words"
                    >
                      {{ row.name || '—' }}
                    </td>
                    <td class="px-3 py-2 text-slate-600 truncate">
                      {{ row.dataConnection?.name || '—' }}
                    </td>
                    <td class="px-3 py-2">
                      <TaskStatus
                        v-if="!row.isPlaceholder"
                        :status="row.statusName"
                        :paused="row.schedule?.paused"
                      />
                      <span v-else class="text-slate-400">—</span>
                    </td>
                    <td class="px-3 py-2 text-slate-600">
                      <div class="flex flex-col gap-1">
                        <div
                          class="text-xs uppercase tracking-wide text-slate-400"
                        >
                          Last run
                        </div>
                        <div class="text-sm text-slate-700">
                          {{ row.lastRun }}
                        </div>
                        <div
                          class="text-xs uppercase tracking-wide text-slate-400"
                        >
                          Next run
                        </div>
                        <div class="text-sm text-slate-700">
                          {{ row.nextRun }}
                        </div>
                      </div>
                    </td>
                    <td class="px-3 py-2 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <v-btn
                          v-if="!row.isPlaceholder"
                          variant="text"
                          color="black"
                          :icon="row.schedule?.paused ? mdiPlay : mdiPause"
                          @click.stop="togglePaused(row)"
                        />
                        <v-btn
                          v-if="
                            !row.isPlaceholder &&
                            isInternalSystem(row) &&
                            !row.userClickedRunNow
                          "
                          class="ml-2"
                          variant="outlined"
                          color="green-darken-3"
                          :append-icon="mdiPlay"
                          @click.stop="runTaskNow(row)"
                        >
                          Run now
                        </v-btn>
                        <span
                          v-else-if="
                            !row.isPlaceholder &&
                            isInternalSystem(row) &&
                            row.userClickedRunNow
                          "
                          class="text-xs font-semibold text-slate-500"
                        >
                          Run requested
                        </span>
                      </div>
                    </td>
                  </tr>
                  <tr
                    class="border-0"
                    :style="{ height: `${virtualPaddingBottom}px` }"
                  >
                    <td colspan="5"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
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
import {
  computed,
  reactive,
  ref,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from 'vue'
import TaskForm from '@/components/Orchestration/TaskForm.vue'
import TaskStatus from '@/components/Orchestration/TaskStatus.vue'
import DeleteOrchestrationSystemCard from '@/components/Orchestration/DeleteOrchestrationSystemCard.vue'
import router from '@/router/router'
import { formatTime } from '@/utils/time'
import hs, { OrchestrationSystem, StatusType, Task } from '@hydroserver/client'
import {
  mdiFilterVariant,
  mdiMagnify,
  mdiPause,
  mdiPlay,
  mdiTrashCanOutline,
  mdiChevronRight,
  mdiChevronDown,
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
const loading = ref(false)
const runNowTriggeredByTaskId = reactive<Record<string, boolean>>({})
const statusFilter = orchestrationStatusFilter

const openGroupName = ref<string | null>(null)
const hasAutoOpened = ref(false)

const bodyScrollRef = ref<HTMLElement | null>(null)
const bodyScrollTop = ref(0)
const bodyHeight = ref(0)
let resizeObserver: ResizeObserver | null = null

const ROW_HEIGHT = 80
const OVERSCAN = 6

watch(
  statusFilter,
  (value) => {
    if (!Array.isArray(value)) {
      statusFilter.value = []
      return
    }
    if (value.includes('all')) {
      statusFilter.value = value.filter((entry) => entry !== 'all')
    }
  },
  { immediate: true }
)

type TaskHealthFilter =
  | 'OK'
  | 'Needs attention'
  | 'Loading paused'
  | 'Behind schedule'
  | 'Pending'
  | 'Unknown'

const statusOptions = [
  { title: 'OK', value: 'OK' },
  { title: 'Needs attention', value: 'Needs attention' },
  { title: 'Loading paused', value: 'Loading paused' },
  { title: 'Behind schedule', value: 'Behind schedule' },
  { title: 'Pending', value: 'Pending' },
  { title: 'Unknown', value: 'Unknown' },
] as const

const classifyTask = (task: {
  statusName: StatusType
  schedule?: { paused?: boolean } | null
}) => {
  const displayedStatus = getDisplayedStatus(task)
  if (
    displayedStatus === 'OK' ||
    displayedStatus === 'Needs attention' ||
    displayedStatus === 'Loading paused' ||
    displayedStatus === 'Behind schedule' ||
    displayedStatus === 'Pending'
  ) {
    return displayedStatus
  }
  return 'Unknown'
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
      else if (displayedStatus === 'Needs attention')
        summary.needsAttention += 1
      else if (displayedStatus === 'Loading paused') summary.loadingPaused += 1
      else if (displayedStatus === 'Behind schedule')
        summary.behindSchedule += 1
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

const searchText = computed(() => `${search.value || ''}`.trim().toLowerCase())

const resolveGroupName = (task: any) => {
  const directName = task?.orchestrationSystem?.name
  if (directName) return directName
  const matched = orchestrationSystems.value.find(
    (os) => os.id === task?.orchestrationSystemId
  )
  return matched?.name ?? 'Unknown'
}

const resolveOrchestrationSystem = (task: any) => {
  if (task?.orchestrationSystem) return task.orchestrationSystem
  const matchedById = orchestrationSystems.value.find(
    (os) => os.id === task?.orchestrationSystemId
  )
  if (matchedById) return matchedById
  return orchestrationSystems.value.find(
    (os) => os.name === resolveGroupName(task)
  )
}

const taskRows = computed(() =>
  workspaceTasks.value.map((t) => ({
    ...t,
    schedule: t.schedule ?? null,
    statusName: hs.tasks.getStatusText(t),
    lastRun: !!t.latestRun?.startedAt ? formatTime(t.latestRun.startedAt) : '-',
    nextRun: t.schedule?.nextRunAt ? formatTime(t.schedule?.nextRunAt) : '-',
    orchestrationSystemName: resolveGroupName(t),
    isPlaceholder: false,
    userClickedRunNow: !!runNowTriggeredByTaskId[t.id],
  }))
)

const matchesSearch = (task: any, term: string) => {
  if (!term) return true
  const haystack = [
    task.name,
    task.dataConnection?.name,
    task.statusName,
    task.lastRun,
    task.nextRun,
    task.orchestrationSystemName,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(term)
}

const filteredTaskRows = computed(() => {
  const activeFilters = new Set(statusFilter.value as TaskHealthFilter[])
  return taskRows.value.filter((task) => {
    const statusMatch =
      activeFilters.size === 0 || activeFilters.has(classifyTask(task))
    const searchMatch = matchesSearch(task, searchText.value)
    return statusMatch && searchMatch
  })
})

const sortTaskRowsByName = (rows: any[]) =>
  rows.sort((a, b) =>
    `${a?.name ?? ''}`.localeCompare(`${b?.name ?? ''}`, undefined, {
      numeric: true,
      sensitivity: 'base',
    })
  )

const includeEmptyGroups = computed(
  () =>
    searchText.value.length === 0 &&
    Array.isArray(statusFilter.value) &&
    statusFilter.value.length === 0
)

const groupList = computed(() => {
  const map = new Map<
    string,
    {
      name: string
      items: any[]
      orchestrationSystem?: OrchestrationSystem
      summary: ReturnType<typeof groupHealthSummary>
    }
  >()

  if (includeEmptyGroups.value) {
    orchestrationSystems.value.forEach((os) => {
      map.set(os.name, {
        name: os.name,
        items: [],
        orchestrationSystem: os,
        summary: groupHealthSummary([]),
      })
    })
  }

  filteredTaskRows.value.forEach((row) => {
    const name = row.orchestrationSystemName ?? 'Unknown'
    const orchestrationSystem = resolveOrchestrationSystem(row)
    const existing = map.get(name)
    if (existing) {
      existing.items.push(row)
      if (!existing.orchestrationSystem && orchestrationSystem) {
        existing.orchestrationSystem = orchestrationSystem
      }
    } else {
      map.set(name, {
        name,
        items: [row],
        orchestrationSystem,
        summary: groupHealthSummary([row]),
      })
    }
  })

  const groups = Array.from(map.values()).map((group) => ({
    ...group,
    items: sortTaskRowsByName(group.items),
    summary: groupHealthSummary(group.items),
  }))

  return groups.sort((a, b) => a.name.localeCompare(b.name))
})

const openGroupRows = computed(() => {
  if (!openGroupName.value) return []
  const group = groupList.value.find((g) => g.name === openGroupName.value)
  return group?.items ?? []
})

const totalRows = computed(() => openGroupRows.value.length)

const effectiveBodyHeight = computed(() =>
  bodyHeight.value > 0 ? bodyHeight.value : ROW_HEIGHT * 8
)

const virtualStart = computed(() =>
  Math.max(0, Math.floor(bodyScrollTop.value / ROW_HEIGHT) - OVERSCAN)
)

const virtualEnd = computed(() => {
  const base = Math.ceil(
    (bodyScrollTop.value + effectiveBodyHeight.value) / ROW_HEIGHT
  )
  return Math.min(totalRows.value, base + OVERSCAN)
})

const virtualRows = computed(() =>
  openGroupRows.value.slice(virtualStart.value, virtualEnd.value)
)

const virtualPaddingTop = computed(() => virtualStart.value * ROW_HEIGHT)
const virtualPaddingBottom = computed(() => {
  const rendered = virtualRows.value.length * ROW_HEIGHT
  return Math.max(
    0,
    totalRows.value * ROW_HEIGHT - virtualPaddingTop.value - rendered
  )
})

const isGroupOpen = (groupName: string) => openGroupName.value === groupName

const toggleGroup = (groupName: string) => {
  openGroupName.value = openGroupName.value === groupName ? null : groupName
}

const onBodyScroll = (event: Event) => {
  const target = event.target as HTMLElement
  bodyScrollTop.value = target.scrollTop
}

const resetVirtualScroll = () => {
  bodyScrollTop.value = 0
  if (bodyScrollRef.value) {
    bodyScrollRef.value.scrollTop = 0
  }
}

const observeBody = () => {
  const el = bodyScrollRef.value
  if (!el) return
  const updateHeight = () => {
    bodyHeight.value = el.clientHeight
  }
  updateHeight()
  if (resizeObserver) resizeObserver.disconnect()
  resizeObserver = new ResizeObserver(updateHeight)
  resizeObserver.observe(el)
}

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

watch(
  groupList,
  (groups) => {
    if (!groups.length) {
      openGroupName.value = null
      return
    }
    if (!hasAutoOpened.value) {
      openGroupName.value = groups[0].name
      hasAutoOpened.value = true
      return
    }
    if (
      openGroupName.value &&
      !groups.some((group) => group.name === openGroupName.value)
    ) {
      openGroupName.value = groups[0].name
    }
  },
  { immediate: true }
)

watch(
  openGroupName,
  async () => {
    await nextTick()
    observeBody()
    resetVirtualScroll()
  },
  { immediate: false }
)

onMounted(() => {
  observeBody()
})

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect()
})

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

const onRowClick = async (item: any) => {
  if (item.isPlaceholder) return
  await router.push({ name: 'Task', params: { id: item.id } })
}
</script>

<style scoped>
.orchestration-table :deep(th),
.orchestration-table :deep(td) {
  border-color: #e2e8f0;
}
</style>
