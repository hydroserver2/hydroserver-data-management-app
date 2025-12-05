<template>
  <div class="my-4 mx-6 task-details-page" v-if="task">
    <v-row class="my-6" align="center">
      <v-col cols="auto">
        <h5 class="text-h5 font-weight-bold">{{ task.name }}</h5>
      </v-col>
      <v-spacer />
      <v-col cols="auto">
        <v-btn
          variant="text"
          color="black"
          :prepend-icon="task.schedule.paused ? mdiPlay : mdiPause"
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
      :items="taskInformation"
      :items-per-page="-1"
      hide-default-header
      hide-default-footer
      density="compact"
      class="elevation-3 rounded-b-lg section-card"
    >
      <template v-slot:item.label="{ item }">
        <v-icon :icon="item?.icon" class="mr-2" />
        <strong>{{ item?.label }}</strong>
      </template>
      <template #item.value="{ item }">
        <template v-if="item.label === 'Status'">
          <TaskStatus :status="item.status" :paused="!!item.paused" />
        </template>
        <template v-else>
          {{ item.value }}
        </template>
      </template>
    </v-data-table>

    <v-toolbar
      color="blue-grey-darken-1"
      rounded="t-lg"
      class="section-toolbar mt-6"
      v-if="taskTemplateInformation.length"
    >
      <h6 class="text-h6 ml-4">Task template</h6>
    </v-toolbar>
    <v-data-table
      v-if="taskTemplateInformation.length"
      :headers="taskTemplateHeaders"
      :items="taskTemplateInformation"
      :items-per-page="-1"
      hide-default-header
      hide-default-footer
      density="compact"
      class="elevation-3 rounded-b-lg section-card"
    >
      <template v-slot:item.label="{ item }">
        <v-icon :icon="item?.icon" class="mr-2" />
        <strong>{{ item?.label }}</strong>
      </template>
    </v-data-table>

    <v-row class="my-4">
      <v-spacer />
      <v-col cols="auto" align-self="center">
        <v-btn
          variant="outlined"
          :prepend-icon="mdiPencil"
          rounded="xl"
          color="secondary"
          class="mr-2"
          @click="openEdit = true"
        >
          Edit task
        </v-btn>
        <v-btn-delete
          variant="outlined"
          rounded="xl"
          :prepend-icon="mdiTrashCanOutline"
          color="red-darken-3"
          @click="openDelete = true"
        >
          Delete task
        </v-btn-delete>
      </v-col>
    </v-row>

    <v-toolbar color="blue-grey-darken-2" rounded="t-lg" class="section-toolbar mt-6">
      <h6 class="text-h6 ml-4">Linked orchestration system</h6>
    </v-toolbar>
    <v-data-table
      :headers="orchestrationSystemHeaders"
      :items="orchestrationSystemInformation"
      :items-per-page="-1"
      hide-default-header
      hide-default-footer
      density="compact"
      class="elevation-3 mb-8 rounded-b-lg section-card"
    >
      <template v-slot:item.label="{ item }">
        <v-icon :icon="item?.icon" class="mr-2" />
        <strong>{{ item?.label }}</strong>
      </template>
    </v-data-table>

    <!-- <PayloadTable /> -->
  </div>
  <v-container v-else>Loading...</v-container>

  <v-dialog v-model="openEdit" width="80rem">
    <TaskForm
      :old-task="task"
      :orchestration-system="task?.orchestrationSystem"
      @close="openEdit = false"
      @updated="fetchData"
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
import { Snackbar } from '@/utils/notifications'
import TaskForm from '@/components/JobOrchestration/TaskForm.vue'
import hs, { Task, WORKFLOW_TYPES } from '@hydroserver/client'
import router from '@/router/router'
import DeleteTaskCard from '@/components/JobOrchestration/DeleteTaskCard.vue'
import { formatTimeWithZone } from '@/utils/time'
import TaskStatus from '@/components/JobOrchestration/TaskStatus.vue'
import {
  mdiBroadcast,
  mdiCalendarClock,
  mdiCalendarSync,
  mdiCardAccountDetails,
  mdiHistory,
  mdiInformationOutline,
  mdiMessageTextOutline,
  mdiPause,
  mdiCogOutline,
  mdiPencil,
  mdiPlay,
  mdiRenameBoxOutline,
  mdiTrashCanOutline,
} from '@mdi/js'

const route = useRoute()
const openEdit = ref(false)
const openDelete = ref(false)
const task = ref<Task | null>(null)

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

const orchestrationSystemHeaders = [
  { key: 'label', title: 'Label' },
  { key: 'value', title: 'Value' },
]

const taskTemplateHeaders = [
  { key: 'label', title: 'Label' },
  { key: 'value', title: 'Value' },
]

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
      label: 'Template ID',
      value: job.id,
    },
    {
      icon: mdiRenameBoxOutline,
      label: 'Template name',
      value: job.name,
    },
    {
      icon: mdiInformationOutline,
      label: 'Workflow type',
      value: job.type ?? '–',
    },
    {
      icon: mdiCogOutline,
      label: 'Extractor',
      value: job.extractor?.type ?? '–',
    },
    {
      icon: mdiCogOutline,
      label: 'Transformer',
      value: job.transformer?.type ?? '–',
    },
    {
      icon: mdiCogOutline,
      label: 'Loader',
      value: job.loader?.type ?? '–',
    },
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
</style>
