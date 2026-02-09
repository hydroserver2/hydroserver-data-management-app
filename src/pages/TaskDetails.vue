<template>
  <div class="my-4 task-details-page" v-if="task">
    <v-row class="my-6" align="center">
      <v-col cols="auto">
        <v-btn
          variant="text"
          color="black"
          :icon="mdiArrowLeft"
          class="mr-2"
          @click="onBack"
        />
      </v-col>
      <v-col cols="auto">
        <h5 class="text-h5 font-weight-bold">{{ task.name }}</h5>
      </v-col>
      <v-spacer />
      <v-col cols="auto" class="d-flex ga-2">
        <v-btn
          variant="outlined"
          :prepend-icon="mdiPencil"
          rounded="xl"
          color="secondary"
          class="mr-1"
          @click="openEdit = true"
        >
          Edit task
        </v-btn>
        <v-btn-delete
          variant="outlined"
          rounded="xl"
          :prepend-icon="mdiTrashCanOutline"
          color="red-darken-3"
          class="mr-1"
          @click="openDelete = true"
        >
          Delete task
        </v-btn-delete>
        <v-btn
          variant="text"
          color="black"
          :prepend-icon="task.schedule?.paused ? mdiPlay : mdiPause"
          @click.stop="togglePaused(task)"
        >
          Pause/Run
        </v-btn>
      </v-col>
    </v-row>

    <v-toolbar color="blue-grey" rounded="t-lg" class="section-toolbar">
      <h6 class="text-h6 ml-4">Task details</h6>
    </v-toolbar>
    <v-data-table
      :headers="taskHeaders"
      :items="taskTableRows"
      :items-per-page="-1"
      hide-default-header
      hide-default-footer
      density="compact"
      class="elevation-3 rounded-b-lg section-card"
    >
      <template #item="{ item, columns }">
        <tr v-if="item.section">
          <td
            :colspan="columns.length"
            class="section-subheading detail-subheading"
          >
            {{ item.label }}
          </td>
        </tr>
        <tr v-else>
          <td class="text-body-2">
            <v-icon v-if="item?.icon" :icon="item.icon" class="mr-2" />
            <strong>{{ item?.label }}</strong>
          </td>
          <td class="text-body-2">
            <template v-if="item.label === 'Status'">
              <TaskStatus :status="item.status" :paused="!!item.paused" />
            </template>
            <template v-else>
              {{ item.value }}
            </template>
          </td>
        </tr>
      </template>
    </v-data-table>

    <v-toolbar
      color="blue-grey-darken-1"
      rounded="t-lg"
      class="section-toolbar mt-6"
    >
      <h6 class="text-h6 ml-4">
        {{ openRunHistory ? 'Run history' : 'Last run' }}
      </h6>
      <v-spacer />
      <v-btn
        variant="text"
        color="white"
        :prepend-icon="mdiHistory"
        class="mr-2"
        @click="openRunHistoryDialog"
      >
        {{ openRunHistory ? 'Hide full run history' : 'View full run history' }}
      </v-btn>
    </v-toolbar>
    <v-card
      class="elevation-3 rounded-b-lg section-card pa-4 last-run-card"
      :id="task?.latestRun?.id ? runDomId(task.latestRun.id) : undefined"
      :class="{
        'run-highlight':
          !!task?.latestRun?.id && highlightedRunId === task.latestRun.id,
      }"
    >
      <template v-if="task?.latestRun">
        <v-row dense>
          <v-col cols="12" md="3">
            <strong>Status</strong>
            <div class="mt-1">
              <TaskStatus :status="latestRunStatusText" :paused="false" />
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <strong>Started</strong>
            <div>{{ formatTimeWithZone(task.latestRun.startedAt) }}</div>
          </v-col>
          <v-col cols="12" md="3">
            <strong>Finished</strong>
            <div>{{ formatTimeWithZone(task.latestRun.finishedAt) }}</div>
          </v-col>
	          <v-col cols="12">
	            <strong>Run message</strong>
	            <div>{{ latestRunMessage }}</div>
	          </v-col>
	          <v-col cols="12" v-if="task.latestRun?.id">
	            <strong>Run link</strong>
	            <div class="d-flex align-center ga-2">
	              <a
	                class="text-blue-600 underline break-all"
	                :href="runLinkUrl(task.latestRun.id)"
	              >
	                {{ runLinkUrl(task.latestRun.id) }}
	              </a>
	              <v-btn
	                icon
	                variant="text"
	                size="small"
	                color="blue"
	                @click="copyToClipboard(runLinkUrl(task.latestRun.id))"
	              >
	                <v-icon :icon="mdiContentCopy" />
	              </v-btn>
	            </div>
	          </v-col>
		          <v-col cols="12" v-if="latestRunRuntimeUrl">
		            <strong>Runtime source URI</strong>
		            <div>
	              <div class="d-flex align-center ga-2">
	                <a
	                  class="text-blue-600 underline break-all"
	                  :href="latestRunRuntimeUrl"
	                >
	                  {{ latestRunRuntimeUrl }}
	                </a>
	                <v-btn
	                  icon
	                  variant="text"
	                  size="small"
                  color="blue"
                  @click="copyToClipboard(latestRunRuntimeUrl)"
                >
                  <v-icon :icon="mdiContentCopy" />
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
        <div class="mt-2">
          <v-btn
            variant="text"
            color="blue-grey-darken-2"
            :prepend-icon="mdiCodeBraces"
            @click="openLatestLogs = !openLatestLogs"
          >
            {{ openLatestLogs ? 'Hide full logs' : 'See full logs' }}
          </v-btn>
        </div>
        <v-expand-transition>
          <div v-if="openLatestLogs" class="mt-3">
            <div class="grid gap-3">
              <div
                v-for="(section, idx) in buildLogSections(task.latestRun)"
                :key="`${section.title}-${idx}`"
                class="grid gap-2"
              >
                <div
                  class="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-slate-600"
                >
                  {{ section.title }}
                </div>
                <div v-if="section.type === 'lines'" class="grid gap-1.5">
                  <div
                    v-for="(entry, entryIdx) in section.entries"
                    :key="entryIdx"
                    class="grid grid-cols-[minmax(120px,180px)_minmax(70px,90px)_1fr] items-start gap-2.5 font-mono text-xs text-slate-700 max-md:grid-cols-1"
                  >
                    <span
                      v-if="entry.timestamp"
                      class="tabular-nums text-slate-600"
                    >
                      {{ entry.timestamp }}
                    </span>
                    <span
                      v-if="entry.level"
                      :class="[
                        'self-start rounded-full border border-transparent px-2 py-0.5 text-center text-[0.7rem] font-semibold uppercase tracking-[0.04em] max-md:justify-self-start',
                        logLevelClass(entry.level),
                      ]"
                    >
                      {{ entry.level }}
                    </span>
                    <span class="whitespace-pre-wrap break-words">{{
                      entry.message
                    }}</span>
                  </div>
                </div>
                <pre
                  v-else
                  class="m-0 rounded-md border border-[#cfd8dc] bg-slate-100 p-3 text-xs leading-snug text-slate-800 whitespace-pre-wrap break-words"
                  >{{ section.text }}</pre
                >
              </div>
            </div>
          </div>
        </v-expand-transition>
      </template>
      <template v-else>
        No runs have been recorded for this task yet.
      </template>
	      <v-expand-transition>
	        <div v-if="openRunHistory" class="mt-4 pt-4 border-t border-[#cfd8dc]">
	          <template v-if="showRunHistoryLoading">
	            <div class="mb-4 rounded-md bg-slate-50 px-4 py-3">
	              <div class="flex items-center gap-3 text-sm text-slate-600">
	                <v-progress-circular
	                  indeterminate
	                  size="20"
	                  width="2"
	                  color="blue-grey-darken-1"
	                />
	                <span class="font-medium">Loading run history...</span>
	              </div>
	            </div>
	            <v-skeleton-loader type="paragraph, paragraph, paragraph" />
	          </template>
	          <template v-else-if="runHistoryRows.length">
	            <template v-for="(run, index) in runHistoryRows" :key="run.id">
	              <div
	                class="mb-4"
	                :id="runDomId(run.id)"
	                :class="{
	                  'run-highlight': highlightedRunId === run.id,
	                }"
	              >
	                <v-row dense>
	                  <v-col cols="12" md="3">
	                    <strong>Status</strong>
	                    <div class="mt-1">
	                      <TaskStatus
	                        :status="getRunStatusText(run.raw)"
	                        :paused="false"
	                      />
	                    </div>
	                  </v-col>
	                  <v-col cols="12" md="3">
	                    <strong>Started</strong>
	                    <div>{{ run.startedAt }}</div>
	                  </v-col>
	                  <v-col cols="12" md="3">
	                    <strong>Finished</strong>
	                    <div>{{ run.finishedAt }}</div>
	                  </v-col>
	                  <v-col cols="12">
	                    <strong>Run message</strong>
	                    <div>{{ run.message }}</div>
	                  </v-col>
	                  <v-col cols="12">
	                    <strong>Run link</strong>
	                    <div class="d-flex align-center ga-2">
	                      <a
	                        class="text-blue-600 underline break-all"
	                        :href="runLinkUrl(run.id)"
	                      >
	                        {{ runLinkUrl(run.id) }}
	                      </a>
	                      <v-btn
	                        icon
	                        variant="text"
	                        size="small"
	                        color="blue"
	                        @click="copyToClipboard(runLinkUrl(run.id))"
	                      >
	                        <v-icon :icon="mdiContentCopy" />
	                      </v-btn>
	                    </div>
	                  </v-col>
		                  <v-col cols="12" v-if="run.runtimeUrl">
		                    <strong>Runtime source URI</strong>
		                    <div>
		                      <div class="d-flex align-center ga-2">
		                        <a
		                          class="text-blue-600 underline break-all"
		                          :href="run.runtimeUrl"
		                        >
		                          {{ run.runtimeUrl }}
		                        </a>
		                        <v-btn
		                          icon
		                          variant="text"
		                          size="small"
	                          color="blue"
	                          @click="copyToClipboard(run.runtimeUrl)"
	                        >
	                          <v-icon :icon="mdiContentCopy" />
	                        </v-btn>
	                      </div>
	                    </div>
	                  </v-col>
	                </v-row>
	                <div class="mt-2">
	                  <v-btn
	                    variant="text"
	                    color="blue-grey-darken-2"
	                    :prepend-icon="mdiCodeBraces"
	                    @click="toggleRunLogs(run.id)"
	                  >
	                    {{
	                      openRunLogs[run.id] ? 'Hide full logs' : 'See full logs'
	                    }}
	                  </v-btn>
	                </div>
	                <v-expand-transition>
	                  <div v-if="openRunLogs[run.id]" class="mt-3">
	                    <div class="grid gap-3">
	                      <div
	                        v-for="(section, idx) in buildLogSections(run.raw)"
	                        :key="`${section.title}-${idx}`"
	                        class="grid gap-2"
	                      >
	                        <div
	                          class="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-slate-600"
	                        >
	                          {{ section.title }}
	                        </div>
	                        <div
	                          v-if="section.type === 'lines'"
	                          class="grid gap-1.5"
	                        >
	                          <div
	                            v-for="(entry, entryIdx) in section.entries"
	                            :key="entryIdx"
	                            class="grid grid-cols-[minmax(120px,180px)_minmax(70px,90px)_1fr] items-start gap-2.5 font-mono text-xs text-slate-700 max-md:grid-cols-1"
	                          >
	                            <span
	                              v-if="entry.timestamp"
	                              class="tabular-nums text-slate-600"
	                            >
	                              {{ entry.timestamp }}
	                            </span>
	                            <span
	                              v-if="entry.level"
	                              :class="[
	                                'self-start rounded-full border border-transparent px-2 py-0.5 text-center text-[0.7rem] font-semibold uppercase tracking-[0.04em] max-md:justify-self-start',
	                                logLevelClass(entry.level),
	                              ]"
	                            >
	                              {{ entry.level }}
	                            </span>
	                            <span class="whitespace-pre-wrap break-words">{{
	                              entry.message
	                            }}</span>
	                          </div>
	                        </div>
	                        <pre
	                          v-else
	                          class="m-0 rounded-md border border-[#cfd8dc] bg-slate-100 p-3 text-xs leading-snug text-slate-800 whitespace-pre-wrap break-words"
	                          >{{ section.text }}</pre
	                        >
	                      </div>
	                    </div>
	                  </div>
	                </v-expand-transition>
	              </div>
	              <v-divider
	                v-if="index < runHistoryRows.length - 1"
	                class="my-3"
	              />
	            </template>
	          </template>
	          <div v-else class="text-medium-emphasis">
	            No run history available yet.
	          </div>
	        </div>
	      </v-expand-transition>
    </v-card>

    <v-toolbar
      color="blue-grey-darken-1"
      rounded="t-lg"
      class="section-toolbar mt-6"
      v-if="pipelineRows.length"
    >
      <h6 class="text-h6 ml-4">Data connection</h6>
    </v-toolbar>
    <v-data-table
      v-if="pipelineRows.length"
      :headers="pipelineHeaders"
      :items="pipelineRows"
      :items-per-page="-1"
      hide-default-header
      hide-default-footer
      density="compact"
      class="elevation-3 rounded-b-lg section-card pipeline-card"
    >
      <template #item="{ item, columns }">
        <tr
          v-if="item.section"
          :class="['pipeline-section', item.sectionClass]"
        >
          <td :colspan="columns.length" class="section-subheading">
            {{ item.label }}
          </td>
        </tr>
        <tr v-else>
          <td class="text-body-2">
            <v-icon v-if="item.icon" :icon="item.icon" size="16" class="mr-1" />
            <strong>{{ item.name || '–' }}</strong>
          </td>
          <td class="text-body-2">{{ item.value ?? '–' }}</td>
        </tr>
      </template>
    </v-data-table>

    <v-toolbar
      color="blue-grey-darken-1"
      rounded="t-lg"
      class="section-toolbar mt-6"
    >
      <h6 class="text-h6 ml-4">Mappings</h6>
    </v-toolbar>
    <div
      v-if="task?.mappings?.length"
      class="elevation-3 rounded-b-lg section-card swimlanes-card"
    >
      <Swimlanes :task="task" :show-actions="false" />
    </div>
    <v-sheet
      v-else
      class="elevation-1 rounded-b-lg pa-6 text-medium-emphasis section-card"
    >
      No mappings configured for this task.
    </v-sheet>

    <div class="mb-8" />

    <!-- <PayloadTable /> -->
  </div>
  <v-container v-else>Loading...</v-container>

  <v-dialog v-model="openEdit" width="80rem" v-if="task">
    <TaskForm
      :old-task="task"
      :orchestration-system="task?.orchestrationSystem"
      @close="openEdit = false"
      @updated="onTaskUpdated"
    />
  </v-dialog>

  <v-dialog v-model="openDelete" width="40rem">
    <DeleteTaskCard
      :task="task!"
      @close="openDelete = false"
      @delete="onDelete"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Snackbar } from '@/utils/notifications'
import TaskForm from '@/components/Orchestration/TaskForm.vue'
import Swimlanes from '@/components/Orchestration/Swimlanes.vue'
import hs, {
  StatusType,
  TaskExpanded,
  TaskRun,
  WORKFLOW_TYPES,
} from '@hydroserver/client'
import router from '@/router/router'
import DeleteTaskCard from '@/components/Orchestration/DeleteTaskCard.vue'
import { formatTimeWithZone } from '@/utils/time'
import TaskStatus from '@/components/Orchestration/TaskStatus.vue'
import { useOrchestrationStore } from '@/store/orchestration'
import { useWorkspaceStore } from '@/store/workspaces'
import {
  mdiBroadcast,
  mdiArrowLeft,
  mdiCalendarClock,
  mdiCardAccountDetails,
  mdiHistory,
  mdiCodeBraces,
  mdiInformationOutline,
  mdiDatabaseSettings,
  mdiClockOutline,
  mdiFormatListNumbered,
  mdiContentCopy,
  mdiPause,
  mdiCogOutline,
  mdiPencil,
  mdiPlay,
  mdiTable,
  mdiDotsHorizontal,
  mdiRenameBoxOutline,
  mdiTrashCanOutline,
} from '@mdi/js'

const props = withDefaults(
  defineProps<{
    taskId?: string | null
    runId?: string | null
    embedded?: boolean
  }>(),
  {
    taskId: null,
    runId: null,
    embedded: false,
  }
)

const emit = defineEmits<{
  (e: 'close'): void
}>()

const route = useRoute()
const openEdit = ref(false)
const openDelete = ref(false)
const openRunHistory = ref(false)
const openLatestLogs = ref(false)
const openRunLogs = ref<Record<string, boolean>>({})
const task = ref<TaskExpanded | null>(null)
const taskRuns = ref<TaskRun[]>([])
const loadingTaskRuns = ref(false)
const runHistoryFetchFinished = ref(false)
const highlightedRunId = ref<string | null>(null)
let highlightTimeoutId: number | null = null
const { workspaceTasks, workspaceDatastreams } = storeToRefs(
  useOrchestrationStore()
)

const { workspaces } = storeToRefs(useWorkspaceStore())
const { setSelectedWorkspaceById } = useWorkspaceStore()

const effectiveTaskId = computed(() => {
  const propId = props.taskId
  if (typeof propId === 'string' && propId.trim()) return propId

  const param = route.params.id
  if (typeof param === 'string') return param
  if (Array.isArray(param)) return param[0] ?? ''
  return ''
})

const effectiveRunId = computed(() => {
  const propId = props.runId
  if (typeof propId === 'string' && propId.trim()) return propId

  const queryValue = route.query.runId
  if (typeof queryValue === 'string' && queryValue.trim()) return queryValue
  return null
})

const onBack = () => {
  if (props.embedded || props.taskId) {
    emit('close')
    return
  }
  router.push({ name: 'Orchestration' })
}

const runDomId = (runId: string) => `task-run-${runId}`

const runLinkHref = (runId: string) =>
  router.resolve({
    name: 'Orchestration',
    query: { taskId: effectiveTaskId.value, runId },
  }).href

const runLinkUrl = (runId: string) => {
  const href = runLinkHref(runId)
  if (typeof window === 'undefined') return href
  return new URL(href, window.location.origin).toString()
}

const scrollToRunAnchor = async (runId: string) => {
  const id = runDomId(runId)
  // Transitions can delay DOM insertion; retry a few frames.
  for (let attempt = 0; attempt < 12; attempt += 1) {
    await nextTick()
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      highlightedRunId.value = runId
      if (highlightTimeoutId) window.clearTimeout(highlightTimeoutId)
      highlightTimeoutId = window.setTimeout(() => {
        highlightedRunId.value = null
        highlightTimeoutId = null
      }, 2500)
      return
    }
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  }
}

const showRunHistoryLoading = computed(() => {
  if (!openRunHistory.value) return false
  if (loadingTaskRuns.value) return true
  // If the user deep-linked to a runId, avoid flashing the empty-state while the first fetch is pending.
  if (effectiveRunId.value && !runHistoryFetchFinished.value) return true
  // If the user opened the run history but we haven't finished the first fetch, show loading until we know.
  if (!runHistoryFetchFinished.value && runHistoryRows.value.length === 0)
    return true
  return false
})

const asResult = (run?: TaskRun | null) => {
  const value = run?.result as any
  return value && typeof value === 'object' ? value : {}
}

const getRunMessage = (run?: TaskRun | null) => {
  if (!run) return '–'
  const result = asResult(run)
  return (
    (run as any).failureReason ||
    result.summary ||
    result.status_message ||
    result.statusMessage ||
    result.failure_reason ||
    result.failureReason ||
    result.error ||
    result.message ||
    '–'
  )
}

const getRuntimeUrl = (run?: TaskRun | null) => {
  if (!run) return null
  const result = asResult(run)
  return (
    (run as any).runtimeUrl ||
    result.runtime_source_uri ||
    result.runtimeSourceUri ||
    result.runtime_url ||
    result.runtimeUrl ||
    null
  )
}

const resolveRuntimeUrlFromTask = (run?: TaskRun | null) => {
  const sourceUri = (task.value as any)?.dataConnection?.extractor?.settings
    ?.sourceUri
  if (!sourceUri || typeof sourceUri !== 'string') return null

  const placeholders =
    ((task.value as any)?.dataConnection?.extractor?.settings
      ?.placeholderVariables as any[]) || []

  const values: Record<string, string> = {}
  for (const placeholder of placeholders) {
    const name = placeholder?.name
    if (!name) continue

    if (placeholder?.type === 'perTask') {
      const value = (task.value as any)?.extractorVariables?.[name]
      if (value !== undefined && value !== null && value !== '') {
        values[name] = String(value)
      }
      continue
    }

    if (placeholder?.type !== 'runTime') continue

    const runTimeValue =
      placeholder?.runTimeValue ?? placeholder?.run_time_value
    if (runTimeValue === 'jobExecutionTime') {
      const startedAt = run?.startedAt ?? task.value?.latestRun?.startedAt
      if (startedAt) values[name] = String(startedAt)
      continue
    }
  }

  return sourceUri.replace(
    /\{([^}]+)\}/g,
    (_, key) => values[key] ?? `{${key}}`
  )
}

const getRunStatusText = (run?: TaskRun | null): StatusType => {
  if (!run) return 'Unknown'
  if (run.status === 'FAILURE') return 'Needs attention'
  if (run.status === 'SUCCESS') return 'OK'
  if (run.status === 'RUNNING') return 'Pending'
  return 'Unknown'
}

const formatLogPayload = (run?: TaskRun | null) => {
  if (!run) return '–'
  const result = asResult(run)
  const sections: string[] = []

  if (typeof result.logs === 'string' && result.logs.trim()) {
    sections.push(result.logs.trim())
  }

  const entries = result.log_entries || result.logEntries
  if (Array.isArray(entries) && entries.length) {
    const formatted = entries
      .map((entry: any) => {
        const timestamp = entry.timestamp || entry.time || ''
        const level = entry.level || entry.levelname || ''
        const message = entry.message || entry.msg || ''
        return [timestamp, level, message].filter(Boolean).join(' ')
      })
      .join('\n')
    if (formatted.trim()) sections.push(formatted)
  }

  if (result.error) {
    sections.push(`Error: ${result.error}`)
  }
  if (result.traceback) {
    sections.push(`Traceback:\n${result.traceback}`)
  }

  if (sections.length) return sections.join('\n\n')

  try {
    return JSON.stringify(result, null, 2)
  } catch (error) {
    return String(result)
  }
}

type LogEntry = {
  timestamp?: string
  level?: string
  message: string
}

type LogSection =
  | {
      title: string
      type: 'lines'
      entries: LogEntry[]
    }
  | {
      title: string
      type: 'text'
      text: string
    }

const logLevelClass = (level?: string) => {
  const value = (level || '').toLowerCase()
  if (value.includes('error') || value.includes('critical')) {
    return 'bg-rose-50 text-rose-700 border-rose-200'
  }
  if (value.includes('warn')) {
    return 'bg-amber-50 text-amber-700 border-amber-200'
  }
  if (value.includes('debug')) {
    return 'bg-slate-100 text-slate-600 border-slate-200'
  }
  return 'bg-sky-50 text-sky-700 border-sky-200'
}

const prettyJson = (value: any) => {
  try {
    return JSON.stringify(value, null, 2)
  } catch (error) {
    return String(value)
  }
}

const normalizeLogEntries = (result: any): LogEntry[] => {
  if (Array.isArray(result?.log_entries) || Array.isArray(result?.logEntries)) {
    const entries = (result.log_entries || result.logEntries) as any[]
    return entries.map((entry) => ({
      timestamp: entry.timestamp || entry.time || '',
      level: entry.level || entry.levelname || '',
      message: entry.message || entry.msg || String(entry),
    }))
  }

  if (typeof result?.logs === 'string') {
    return result.logs
      .split('\n')
      .map((line: string) => line.trim())
      .filter(Boolean)
      .map((line: string) => {
        const match = line.match(/^(\S+)\s+([A-Z]+)\s+(.*)$/)
        if (match) {
          return {
            timestamp: match[1],
            level: match[2],
            message: match[3],
          }
        }
        return { message: line }
      })
  }

  return []
}

const stageFromMessage = (message: string) => {
  const lower = message.toLowerCase()
  if (lower.includes('starting extract')) return 'Extract'
  if (lower.includes('starting transform')) return 'Transform'
  if (lower.includes('starting load')) return 'Load'
  if (lower.includes('resolving runtime var')) return 'Extract'
  if (lower.includes('requesting data from')) return 'Extract'
  if (lower.includes('standardized dataframe')) return 'Transform'
  if (lower.includes('uploading')) return 'Load'
  return null
}

const buildLogSections = (run?: TaskRun | null): LogSection[] => {
  if (!run) return [{ title: 'Logs', type: 'text', text: '–' }]
  const result = asResult(run)
  const sections: LogSection[] = []

  const entries = normalizeLogEntries(result)
  if (entries.length) {
    const grouped: LogSection[] = []
    let currentTitle = 'Logs'
    let currentEntries: LogEntry[] = []

    const pushSection = () => {
      if (currentEntries.length) {
        grouped.push({
          title: currentTitle,
          type: 'lines',
          entries: currentEntries,
        })
      }
    }

    entries.forEach((entry) => {
      const nextStage = stageFromMessage(entry.message || '')
      if (nextStage && nextStage !== currentTitle) {
        pushSection()
        currentTitle = nextStage
        currentEntries = []
      }
      currentEntries.push(entry)
    })
    pushSection()

    sections.push(...grouped)
  }

  if (result?.traceback) {
    sections.push({
      title: 'Traceback',
      type: 'text',
      text: String(result.traceback),
    })
  }

  if (result?.stats) {
    sections.push({
      title: 'Stats',
      type: 'text',
      text: prettyJson(result.stats),
    })
  }

  if (!sections.length && result) {
    const detail = { ...result }
    delete detail.logs
    delete detail.log_entries
    delete detail.logEntries
    if (Object.keys(detail).length) {
      sections.push({
        title: 'Details',
        type: 'text',
        text: prettyJson(detail),
      })
    }
  }

  return sections.length
    ? sections
    : [{ title: 'Logs', type: 'text', text: '–' }]
}

const toggleRunLogs = (runId: string) => {
  openRunLogs.value[runId] = !openRunLogs.value[runId]
}

const openRunHistoryDialog = async () => {
  openRunHistory.value = !openRunHistory.value
  if (!openRunHistory.value) return
  await fetchTaskRuns()
}

const copyToClipboard = async (value?: string | null) => {
  if (!value) return
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = value
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }
    Snackbar.success('Copied to clipboard.')
  } catch (error) {
    Snackbar.error('Unable to copy to clipboard.')
  }
}

const scheduleString = computed(() => {
  const schedule = task.value?.schedule
  if (!schedule) return '–'

  const { interval, intervalPeriod, crontab, startTime } = schedule
  let description: string | null = null

  if (interval && intervalPeriod) {
    description = `Every ${interval} ${intervalPeriod}`
  } else if (crontab) {
    description = `Crontab: ${crontab}`
  }

  if (!description) return '–'
  if (startTime) description += ` starting ${formatTimeWithZone(startTime)}`

  return description
})

const taskHeaders = [
  { key: 'label', title: 'Label' },
  { key: 'value', title: 'Value' },
]

const pipelineHeaders = [
  { key: 'name', title: 'Field' },
  { key: 'value', title: 'Value' },
]

function summarize(obj: any): string {
  if (!obj || typeof obj !== 'object') return '–'
  const keys = Object.keys(obj ?? {}).filter(
    (k) => obj[k] !== null && obj[k] !== undefined && obj[k] !== ''
  )
  return keys.length ? keys.join(', ') : '–'
}

const taskInformation = computed(() => {
  if (!task.value) return []

  return [
    {
      icon: mdiCardAccountDetails,
      label: 'ID',
      value: task.value.id,
    },
    {
      icon: mdiCalendarClock,
      label: 'Schedule',
      value: scheduleString,
    },
    // Removed duplicate Last run / Next run / Status from this summary card.
  ].filter(Boolean)
})

const taskTemplateInformation = computed(() => {
  const dataConnection: any = task.value?.dataConnection
  if (!dataConnection) return []

  return [
    {
      icon: mdiCardAccountDetails,
      label: 'Data connection ID',
      name: 'Data connection ID',
      value: dataConnection.id,
    },
    {
      icon: mdiRenameBoxOutline,
      label: 'Data connection',
      name: 'Data connection name',
      value: dataConnection.name,
    },
    {
      icon: mdiInformationOutline,
      label: 'Template',
      name: 'Workflow type',
      value: dataConnection.type ?? '–',
    },
  ].filter((row) => row.value !== undefined && row.value !== null)
})

const extractorInformation = computed(() => {
  const extractor: any = task.value?.dataConnection?.extractor
  if (!extractor) return []

  const placeholders: Array<{
    name: string
    type?: string
    runTimeValue?: string
  }> = extractor.settings?.placeholderVariables ?? []
  const perTaskList = placeholders
    .filter((p) => p.type === 'perTask')
    .map((p) => `${p.name}: ${task.value?.extractorVariables?.[p.name] ?? '–'}`)
  const runtimeList = placeholders
    .filter((p) => p.type === 'runTime')
    .map((p) => `${p.name}: ${p.runTimeValue ?? '–'}`)

  return [
    {
      icon: mdiCogOutline,
      label: 'Extractor',
      name: 'Type',
      value: extractor.type ?? '–',
    },
    {
      icon: mdiCodeBraces,
      label: 'Extractor',
      name: 'Source URL',
      value: extractor.settings?.sourceUri ?? '–',
    },
    {
      icon: mdiInformationOutline,
      label: 'Extractor',
      name: 'Per-task variables',
      value: perTaskList.length ? null : '–',
      list: perTaskList,
    },
    {
      icon: mdiInformationOutline,
      label: 'Extractor',
      name: 'Runtime variables',
      value: runtimeList.length ? null : '–',
      list: runtimeList,
    },
  ].filter((row) => row.value !== undefined && row.value !== null)
})

const extractorVariables = computed(() => {
  const extractor: any = task.value?.dataConnection?.extractor
  if (!extractor) return []
  const placeholders: Array<{
    name: string
    type?: string
    runTimeValue?: any
  }> = extractor.settings?.placeholderVariables ?? []

  return placeholders.map((p) => ({
    type: p.type ?? '–',
    name: p.name,
    value:
      p.type === 'perTask'
        ? task.value?.extractorVariables?.[p.name] ?? '–'
        : p.runTimeValue ?? '–',
  }))
})

const taskTableRows = computed(() => {
  const baseRows = taskInformation.value
  const rows: any[] = [...baseRows]

  if (orchestrationSystemInformation.value.length) {
    rows.push({
      section: true,
      label: 'Linked orchestration system',
    })
    rows.push(
      ...orchestrationSystemInformation.value.map((r) => ({
        ...r,
        label: r.label,
      }))
    )
  }

  return rows
})

const pipelineRows = computed(() => {
  const rows: any[] = []
  const pushSection = (label: string, sectionClass: string) =>
    rows.push({ section: true, label, sectionClass })
  const pushInfo = (items: any[], sectionClass: string) =>
    items.forEach((i) =>
      rows.push({
        label: i.label,
        name: i.name ?? '–',
        value: i.value ?? '–',
        icon: i.icon,
        sectionClass,
      })
    )

  if (taskTemplateInformation.value.length) {
    // pushSection('General', 'template-subheading')
    pushInfo(taskTemplateInformation.value, 'template-subheading')
  }

  if (extractorInformation.value.length) {
    pushSection('Extractor', 'extractor-subheading')
    pushInfo(extractorInformation.value, 'extractor-subheading')
  }
  if (extractorVariables.value.length) {
    pushSection('Extractor variables', 'extractor-subheading')
    extractorVariables.value.forEach((v) =>
      rows.push({
        label: v.type,
        name: v.name,
        value: v.value,
        sectionClass: 'extractor-subheading',
      })
    )
  }

  if (transformerInformation.value.length) {
    pushSection('Transformer', 'transformer-subheading')
    pushInfo(transformerInformation.value, 'transformer-subheading')
  }

  if (loaderInformation.value.length) {
    pushSection('Loader', 'loader-subheading')
    pushInfo(loaderInformation.value, 'loader-subheading')
  }

  return rows
})

const transformerInformation = computed(() => {
  const transformer: any = task.value?.dataConnection?.transformer
  if (!transformer) return []

  const rows: any[] = [
    {
      icon: mdiCogOutline,
      label: 'Transformer',
      name: 'Type',
      value: transformer.type ?? '–',
    },
  ]

  const settings: any = transformer.settings ?? {}
  if (transformer.type === 'JSON') {
    rows.push(
      {
        icon: mdiCodeBraces,
        label: 'Transformer',
        name: 'JMESPath',
        value: settings.JMESPath ?? '–',
      },
      {
        icon: mdiClockOutline,
        label: 'Transformer',
        name: 'Timestamp key',
        value: settings.timestamp?.key ?? '–',
      },
      {
        icon: mdiCalendarClock,
        label: 'Transformer',
        name: 'Timestamp format',
        value: settings.timestamp?.format ?? '–',
      },
      {
        icon: mdiClockOutline,
        label: 'Transformer',
        name: 'Timezone mode',
        value: settings.timestamp?.timezoneMode ?? '–',
      }
    )
  } else if (transformer.type === 'CSV') {
    rows.push(
      {
        icon: mdiFormatListNumbered,
        label: 'Transformer',
        name: 'Identifier type',
        value: settings.identifierType ?? '–',
      },
      {
        icon: mdiTable,
        label: 'Transformer',
        name: 'Header row',
        value: settings.headerRow ?? '–',
      },
      {
        icon: mdiTable,
        label: 'Transformer',
        name: 'Data start row',
        value: settings.dataStartRow ?? '–',
      },
      {
        icon: mdiDotsHorizontal,
        label: 'Transformer',
        name: 'Delimiter',
        value: settings.delimiter ?? '–',
      },
      {
        icon: mdiClockOutline,
        label: 'Transformer',
        name: 'Timestamp key',
        value: settings.timestamp?.key ?? '–',
      },
      {
        icon: mdiCalendarClock,
        label: 'Transformer',
        name: 'Timestamp format',
        value: settings.timestamp?.format ?? '–',
      },
      {
        icon: mdiClockOutline,
        label: 'Transformer',
        name: 'Timezone mode',
        value: settings.timestamp?.timezoneMode ?? '–',
      }
    )
  } else {
    rows.push({
      icon: mdiDatabaseSettings,
      label: 'Transformer',
      name: 'Settings',
      value: summarize(settings),
    })
  }

  return rows.filter((row) => row.value !== undefined && row.value !== null)
})

const loaderInformation = computed(() => {
  const loader: any = task.value?.dataConnection?.loader
  if (!loader) return []

  return [
    {
      icon: mdiCogOutline,
      label: 'Loader',
      name: 'Type',
      value: loader.type ?? '–',
    },
    // {
    //   icon: mdiDatabaseSettings,
    //   label: 'Loader',
    //   name: 'Settings',
    //   value: summarize(loader.settings),
    // },
  ].filter((row) => row.value !== undefined && row.value !== null)
})

const orchestrationSystemInformation = computed(() => {
  if (!task.value) return []

  return [
    {
      icon: mdiRenameBoxOutline,
      label: 'Name',
      value: task.value.orchestrationSystem.name,
    },
    {
      icon: mdiBroadcast,
      label: 'Type',
      value:
        WORKFLOW_TYPES.find(
          (t) => t.value === task.value?.orchestrationSystem.type
        )?.title ?? task.value.orchestrationSystem.type,
    },
  ].filter(Boolean)
})

const latestRunStatusText = computed(() =>
  getRunStatusText(task.value?.latestRun)
)
const latestRunMessage = computed(() => getRunMessage(task.value?.latestRun))
const latestRunRuntimeUrl = computed(
  () =>
    getRuntimeUrl(task.value?.latestRun) ??
    resolveRuntimeUrlFromTask(task.value?.latestRun)
)

const runHistoryRows = computed(() => {
  const latestId = task.value?.latestRun?.id
  const seen = new Set<string>()

  return taskRuns.value
    .filter((run) => {
      if (!run?.id) return false
      if (latestId && run.id === latestId) return false
      if (seen.has(run.id)) return false
      seen.add(run.id)
      return true
    })
    .map((run) => ({
      id: run.id,
      startedAt: formatTimeWithZone(run.startedAt),
      finishedAt: formatTimeWithZone(run.finishedAt),
      message: getRunMessage(run),
      runtimeUrl: getRuntimeUrl(run) ?? resolveRuntimeUrlFromTask(run),
      raw: run,
    }))
})

async function togglePaused(
  task: Partial<TaskExpanded> & Pick<TaskExpanded, 'id'>
) {
  if (!task.schedule) return
  task.schedule.paused = !task.schedule.paused
  await hs.tasks.update(task)
}

function upsertWorkspaceTask(t: TaskExpanded | null) {
  if (!t) return
  const next = [...workspaceTasks.value]
  const index = next.findIndex((p) => p.id === t.id)
  if (index !== -1) next[index] = t
  else next.push(t)
  workspaceTasks.value = next
}

async function refreshDatastreams(workspaceId?: string | null) {
  if (!workspaceId) return
  const list =
    (await hs.datastreams.listAllItems({ workspace_id: [workspaceId] })) ?? []
  workspaceDatastreams.value = list
}

const onDelete = async () => {
  try {
    await hs.tasks.delete(task.value!.id)
    await router.push({ name: 'Orchestration' })
    Snackbar.success('Task deleted.')
  } catch (error: any) {
    Snackbar.error(error.message)
    console.error('Error deleting task', error)
  }
}

const fetchTaskRuns = async () => {
  if (!task.value) return

  loadingTaskRuns.value = true
  runHistoryFetchFinished.value = false
  try {
    const response = await hs.tasks.getTaskRuns(task.value.id, {
      order_by: ['-startedAt'],
    })
    taskRuns.value = (response.data as TaskRun[]) || []
  } catch (error: any) {
    Snackbar.error(error.message || 'Unable to fetch run history.')
    console.error('Error fetching task runs', error)
  } finally {
    loadingTaskRuns.value = false
    runHistoryFetchFinished.value = true
  }
}

const openRunHistoryAndScroll = async (runId: string) => {
  if (!runId) return

  // Latest run is displayed above; scroll there if requested.
  if (task.value?.latestRun?.id && task.value.latestRun.id === runId) {
    await scrollToRunAnchor(runId)
    return
  }

  if (!openRunHistory.value) {
    openRunHistory.value = true
    await fetchTaskRuns()
  } else if (!taskRuns.value.length && !loadingTaskRuns.value) {
    await fetchTaskRuns()
  }

  await scrollToRunAnchor(runId)
}

const fetchData = async () => {
  if (!effectiveTaskId.value) return

  task.value = (await hs.tasks.getItem(effectiveTaskId.value, {
    expand_related: true,
  })) as unknown as TaskExpanded

  upsertWorkspaceTask(task.value)
  await refreshDatastreams(task.value?.workspace.id)
  if (openRunHistory.value) {
    await fetchTaskRuns()
  }

  // If the user deep-linked to a task/run in a different workspace, select it so the list matches.
  if (task.value?.workspace?.id && workspaces.value.length) {
    setSelectedWorkspaceById(task.value.workspace.id)
  }

  if (effectiveRunId.value) {
    await openRunHistoryAndScroll(effectiveRunId.value)
  }
}

const onTaskUpdated = async (updated: TaskExpanded) => {
  // Keep UI responsive with the returned task, then refresh to ensure relations are expanded
  task.value = updated
  upsertWorkspaceTask(updated)
  await refreshDatastreams(updated.workspace.id)
  await fetchData()
  openEdit.value = false
}

watch(
  effectiveTaskId,
  async (newId, oldId) => {
    if (!newId) return
    if (newId === oldId) return

    // Reset task-specific UI state when switching tasks without unmounting.
    openLatestLogs.value = false
    openRunLogs.value = {}
    runHistoryFetchFinished.value = false
    if (!effectiveRunId.value) {
      openRunHistory.value = false
    }

    await fetchData()
  },
  { immediate: true }
)

watch(
  workspaces,
  (list) => {
    if (!list?.length) return
    if (task.value?.workspace?.id) {
      setSelectedWorkspaceById(task.value.workspace.id)
    }
  },
  { immediate: true }
)

watch(
  effectiveRunId,
  async (runId) => {
    if (!runId) return
    // Ensure the page loads in "full run history" mode when deep-linked.
    openRunHistory.value = true
    if (!task.value) return
    await openRunHistoryAndScroll(runId)
  },
  { immediate: true }
)
</script>

<style scoped>
.task-details-page {
  width: 100%;
  padding: 0 16px;
  box-sizing: border-box;
}
.section-card {
  background: #f8fafc;
  border: 1px solid #e0e0e0;
}
.section-toolbar {
  color: white;
}
.variable-list {
  display: grid;
  row-gap: 4px;
}
.section-subheading {
  font-weight: 700;
  padding: 6px 12px;
  background: #eceff1;
  color: #263238;
  border: 1px solid #cfd8dc;
}
.section-card :deep(.v-data-table__wrapper) {
  padding: 10px 12px;
}
.section-card :deep(.v-table__wrapper) {
  background: transparent;
}
.section-card :deep(tr) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}
.section-card :deep(td) {
  padding: 10px 12px;
}
.swimlanes-card {
  padding: 16px 18px;
}
.swimlanes-card :deep(.swimlanes) {
  margin-bottom: 0;
}

.run-highlight {
  border-radius: 8px;
  animation: runHighlightPulse 2.5s ease-out;
}

@keyframes runHighlightPulse {
  0% {
    background: rgba(255, 235, 59, 0.35);
  }
  100% {
    background: transparent;
  }
}
</style>
