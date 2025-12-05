<template>
  <StickyForm>
    <template #header>
      <p class="ml-6 font-weight-bold">
        {{ isEdit ? 'Edit' : 'Add' }} task configuration
        <span v-if="isEdit" class="opacity-80">· {{ task?.name }}</span>
      </p>
    </template>

    <v-form
      @submit.prevent="onSubmit"
      ref="myForm"
      v-model="valid"
      validate-on="blur"
    >
      <v-card-text v-if="task">
        <p class="font-weight-bold mb-2 required-label">Name your task</p>
        <v-text-field
          v-model="task.name"
          label="Task name"
          :rules="rules.requiredAndMaxLength255"
          density="comfortable"
        />

        <p class="font-weight-bold mb-2 required-label">Select task template</p>
        <v-select
          v-model="task.jobId"
          :items="workspaceJobs"
          item-title="name"
          item-value="id"
          label="Task template"
          :rules="rules.requiredAndMaxLength255"
          density="comfortable"
        />

        <div v-if="perTaskPlaceholders.length" class="mb-4">
          <p class="font-weight-bold mb-2">Template variables</p>
          <v-row>
            <v-col
              cols="12"
              md="6"
              v-for="variable in perTaskPlaceholders"
              :key="variable.name"
            >
              <v-text-field
                v-model="task.extractorVariables[variable.name]"
                :label="`URL template variable: ${variable.name} *`"
                :rules="rules.requiredAndMaxLength255"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </div>

        <div class="mb-4">
          <p class="font-weight-bold mb-2">Schedule ({{ timezoneLabel }})</p>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="startInput"
                label="Start time"
                type="datetime-local"
                density="comfortable"
              />
            </v-col>
          </v-row>

          <v-radio-group v-model="scheduleMode" inline>
            <v-radio label="Interval" value="interval" />
            <v-radio label="Crontab" value="crontab" />
          </v-radio-group>

          <v-row v-if="scheduleMode === 'interval'">
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="task.schedule!.interval"
                label="Interval"
                type="number"
                min="1"
                :rules="[(v) => !!v || 'Interval is required']"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="task.schedule!.intervalPeriod"
                :items="intervalUnitOptions"
                item-title="title"
                item-value="value"
                label="Interval Units"
                :rules="[(v) => !!v || 'Units are required']"
                density="comfortable"
              />
            </v-col>
          </v-row>

          <v-text-field
            v-else
            v-model="task.schedule!.crontab"
            label="Crontab"
            hint="Five-field crontab string"
            persistent-hint
            density="comfortable"
          />
        </div>

        <v-divider class="mb-6" />
        <SwimlanesForm v-model:task="task" ref="swimlanesRef" />
      </v-card-text>
    </v-form>

    <template #actions>
      <v-spacer />
      <v-btn-cancel @click="$emit('close')">Cancel</v-btn-cancel>
      <v-btn-primary :loading="submitLoading" type="button" @click="onSubmit">
        Save
      </v-btn-primary>
    </template>
  </StickyForm>
</template>

<script setup lang="ts">
import { rules } from '@/utils/rules'
import { VForm } from 'vuetify/components'
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import SwimlanesForm from './SwimlanesForm.vue'
import hs, {
  Job,
  OrchestrationSystem,
  PlaceholderVariable,
  Task,
  TaskSchedule,
} from '@hydroserver/client'
import { useTaskStore } from '@/store/task'
import { useOrchestrationStore } from '@/store/orchestration'
import StickyForm from '@/components/Forms/StickyForm.vue'
import { useTableLogic } from '@/composables/useTableLogic'
import { useWorkspaceStore } from '@/store/workspaces'
import { Snackbar } from '@/utils/notifications'

const { selectedWorkspace } = storeToRefs(useWorkspaceStore())
const selectedWorkspaceId = computed(() => selectedWorkspace.value?.id)

const props = defineProps({
  oldTask: { type: Object as () => Task },
  orchestrationSystem: { type: Object as () => OrchestrationSystem },
})

const { tasks } = storeToRefs(useTaskStore())
const { workspaceTasks } = storeToRefs(useOrchestrationStore())

const { items: workspaceJobs } = useTableLogic(
  async (wsId: string) =>
    await hs.jobs.listAllItems({
      workspace_id: [wsId],
      expand_related: true,
      order_by: ['name'],
    }),
  hs.jobs.delete,
  Job,
  selectedWorkspaceId
)

const emit = defineEmits(['created', 'updated', 'close'])

const isEdit = computed(() => !!props.oldTask || undefined)
const valid = ref<boolean | null>(null)
const myForm = ref<VForm>()
const swimlanesRef = ref<any>(null)
const submitLoading = ref(false)
const task = ref<Task>(new Task())
const scheduleMode = ref<'interval' | 'crontab'>('interval')
const selectedJob = computed<Job | undefined>(() =>
  workspaceJobs.value.find((j) => j.id === task.value.jobId)
)
const perTaskPlaceholders = computed<PlaceholderVariable[]>(() => {
  const placeholders =
    (selectedJob.value as any)?.extractor?.settings?.placeholderVariables || []
  return placeholders.filter((v: PlaceholderVariable) => v?.type === 'perTask')
})

const intervalUnitOptions = [
  { value: 'minutes', title: 'Minutes' },
  { value: 'hours', title: 'Hours' },
  { value: 'days', title: 'Days' },
] as const

const timezoneLabel = computed(
  () => Intl.DateTimeFormat().resolvedOptions().timeZone
)

function defaultSchedule(): TaskSchedule {
  const now = new Date().toISOString()
  return {
    paused: false,
    startTime: now,
    nextRunAt: null,
    crontab: null,
    interval: 1,
    intervalPeriod: 'days',
  }
}

function ensureIsoUtc(s: string | null = ''): string | null {
  return s && !/([Zz]|[+-]\d{2}:\d{2})$/.test(s) ? s + 'Z' : s
}

function isoToInput(iso: string | null = ''): string {
  if (!iso) return ''
  const normalized = ensureIsoUtc(iso) ?? ''
  const d = new Date(normalized)
  if (Number.isNaN(d.getTime())) return ''
  const tzOffsetMs = d.getTimezoneOffset() * 60_000
  const local = new Date(d.getTime() - tzOffsetMs)
  return local.toISOString().slice(0, 16)
}

function inputToIso(str = ''): string {
  if (!str) return ''
  const parsed = new Date(str)
  return parsed.toISOString()
}

const startInput = computed({
  get: () => isoToInput(task.value.schedule?.startTime ?? ''),
  set: (v: string) => {
    if (!task.value.schedule) task.value.schedule = defaultSchedule()
    task.value.schedule.startTime = v ? inputToIso(v) : null
  },
})

function hydrateTask(source?: Task) {
  const base = source
    ? new Task(JSON.parse(JSON.stringify(source)))
    : new Task()

  if (!base.schedule) base.schedule = defaultSchedule()
  if (!base.mappings) base.mappings = []
  if (!base.jobId && (base as any).job?.id)
    base.jobId = String((base as any).job.id)

  ;(['startTime', 'nextRunAt'] as const).forEach((k) => {
    if (base.schedule && base.schedule[k])
      base.schedule[k] = ensureIsoUtc(base.schedule[k])
  })

  task.value = base
  scheduleMode.value = base.schedule?.crontab ? 'crontab' : 'interval'
}

watch(
  () => props.oldTask,
  (newTask) => hydrateTask(newTask),
  { immediate: true }
)

watch(
  () => perTaskPlaceholders.value.map((p) => p.name).join('|'),
  () => {
    if (!task.value.extractorVariables)
      task.value.extractorVariables = {} as Record<string, any>
    const names = perTaskPlaceholders.value.map((p) => p.name)
    const next: Record<string, any> = {}
    names.forEach((n) => {
      next[n] =
        task.value.extractorVariables[n] === undefined
          ? ''
          : task.value.extractorVariables[n]
    })
    task.value.extractorVariables = next
  },
  { immediate: true }
)

function upsertTaskList(listRef: { value: Task[] }, saved: Task) {
  const index = listRef.value.findIndex((p) => p.id === saved.id)
  if (index !== -1) listRef.value[index] = saved
  else listRef.value = [...listRef.value, saved]
}

async function onSubmit() {
  const swimlanesValid = await swimlanesRef.value.validate()
  if (!swimlanesValid) return

  await myForm.value?.validate()
  if (!valid.value) return

  submitLoading.value = true

  task.value.workspaceId = selectedWorkspace.value?.id || ''
  task.value.orchestrationSystemId =
    props.orchestrationSystem?.id || task.value.orchestrationSystemId
  if (!task.value.schedule) task.value.schedule = defaultSchedule()

  const res = isEdit.value
    ? await hs.tasks.update(task.value)
    : await hs.tasks.create(task.value)

  if (!res.ok) {
    Snackbar.error(res.message)
    console.error(res)
  } else {
    const saved = res.data
    upsertTaskList(tasks, saved)
    upsertTaskList(workspaceTasks, saved)
    hydrateTask(saved)

    emit(isEdit.value ? 'updated' : 'created', saved)
  }

  submitLoading.value = false
  emit('close')
}
</script>

<style scoped>
:deep(.v-expansion-panel-text__wrapper) {
  padding: 0 !important;
}
</style>
