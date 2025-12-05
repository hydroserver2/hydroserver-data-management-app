<template>
  <div class="my-4 mx-6 task-details-page" v-if="task">
    <v-row class="my-6" align="center">
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
      v-if="pipelineRows.length"
    >
      <h6 class="text-h6 ml-4">Task Template</h6>
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

  <v-dialog v-model="openEdit" width="80rem">
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
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { Snackbar } from '@/utils/notifications'
import TaskForm from '@/components/JobOrchestration/TaskForm.vue'
import Swimlanes from '@/components/JobOrchestration/Swimlanes.vue'
import hs, { Task, WORKFLOW_TYPES } from '@hydroserver/client'
import router from '@/router/router'
import DeleteTaskCard from '@/components/JobOrchestration/DeleteTaskCard.vue'
import { formatTimeWithZone } from '@/utils/time'
import TaskStatus from '@/components/JobOrchestration/TaskStatus.vue'
import { useOrchestrationStore } from '@/store/orchestration'
import {
  mdiBroadcast,
  mdiCalendarClock,
  mdiCalendarSync,
  mdiCardAccountDetails,
  mdiHistory,
  mdiCodeBraces,
  mdiInformationOutline,
  mdiDatabaseSettings,
  mdiClockOutline,
  mdiCogTransfer,
  mdiFormatListNumbered,
  mdiMessageTextOutline,
  mdiPause,
  mdiCogOutline,
  mdiPencil,
  mdiPlay,
  mdiTable,
  mdiDotsHorizontal,
  mdiRenameBoxOutline,
  mdiTrashCanOutline,
} from '@mdi/js'

const route = useRoute()
const openEdit = ref(false)
const openDelete = ref(false)
const task = ref<Task | null>(null)
const { workspaceTasks, workspaceDatastreams } = storeToRefs(
  useOrchestrationStore()
)

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
    {
      icon: mdiHistory,
      label: 'Last run',
      value: formatTimeWithZone(task.value.latestRun?.finishedAt),
    },
    {
      icon: mdiCalendarSync,
      label: 'Next run',
      value: formatTimeWithZone(task.value.schedule?.nextRunAt),
    },
    {
      icon: mdiMessageTextOutline,
      label: 'Last run message',
      value: task.value.latestRun?.result || '–',
    },
    {
      icon: mdiInformationOutline,
      label: 'Status',
      status: task.value.status,
      paused: task.value.schedule.paused,
    },
  ].filter(Boolean)
})

const taskTemplateInformation = computed(() => {
  const job: any = task.value?.job
  if (!job) return []

  return [
    {
      icon: mdiCardAccountDetails,
      label: 'Template',
      name: 'Template ID',
      value: job.id,
    },
    {
      icon: mdiRenameBoxOutline,
      label: 'Template',
      name: 'Template name',
      value: job.name,
    },
    {
      icon: mdiInformationOutline,
      label: 'Template',
      name: 'Workflow type',
      value: job.type ?? '–',
    },
  ].filter((row) => row.value !== undefined && row.value !== null)
})

const extractorInformation = computed(() => {
  const extractor: any = task.value?.job?.extractor
  if (!extractor) return []

  const placeholders: Array<{ name: string; type?: string }> =
    extractor.settings?.placeholderVariables ?? []
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
  const extractor: any = task.value?.job?.extractor
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
    pushSection('General', 'template-subheading')
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
  const transformer: any = task.value?.job?.transformer
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
  const loader: any = task.value?.job?.loader
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
          (t) => t.value === task.value.orchestrationSystem.type
        )?.title ?? task.value.orchestrationSystem.type,
    },
  ].filter(Boolean)
})

async function togglePaused(task: Partial<Task> & Pick<Task, 'id'>) {
  if (!task.schedule) return
  task.schedule.paused = !task.schedule.paused
  await hs.tasks.update(task)
}

function upsertWorkspaceTask(t: Task | null) {
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

const fetchData = async () => {
  task.value = await hs.tasks.getItem(route.params.id.toString(), {
    expand_related: true,
  })
  upsertWorkspaceTask(task.value)
  await refreshDatastreams(task.value?.workspaceId)
}

const onTaskUpdated = async (updated: Task) => {
  // Keep UI responsive with the returned task, then refresh to ensure relations are expanded
  task.value = updated
  upsertWorkspaceTask(updated)
  await refreshDatastreams(updated.workspaceId)
  await fetchData()
  openEdit.value = false
}

onMounted(async () => {
  await fetchData()
})
</script>

<style scoped>
.task-details-page {
  max-width: 1100px;
  margin: 0 auto;
}
.section-card {
  background: #f8fafc;
}
.section-toolbar {
  color: white;
}
.extractor-card {
  background: #fdf3e7;
  border: 1px solid #a1887f;
}
.transformer-card {
  background: #e8f5e9;
  border: 1px solid #66bb6a;
}
.loader-card {
  background: #eceff1;
  border: 1px solid #607d8b;
}
.variable-list {
  display: grid;
  row-gap: 4px;
}
.section-subheading {
  font-weight: 700;
  padding: 6px 12px;
  background: #f1e3d5;
  color: #4e342e;
  border: 1px solid #a1887f;
}
.template-subheading {
  background: #eceff1;
  color: #37474f;
  border-color: #90a4ae;
}
.detail-subheading {
  background: #eceff1;
  color: #263238;
  border-color: #90a4ae;
}
.extractor-subheading {
  background: #f1e3d5;
  color: #4e342e;
  border-color: #a1887f;
}
.transformer-subheading {
  background: #e8f5e9;
  color: #2e7d32;
  border-color: #66bb6a;
}
.loader-subheading {
  background: #eceff1;
  color: #37474f;
  border-color: #607d8b;
}
.section-card :deep(.v-data-table__wrapper) {
  padding: 12px 16px;
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
</style>
