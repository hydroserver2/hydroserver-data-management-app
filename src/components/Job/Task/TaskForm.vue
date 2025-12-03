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
          label="Task name"
          :rules="rules.requiredAndMaxLength255"
          density="comfortable"
        />

        <!-- <template v-if="extractor?.type === 'HTTP'">
          <div class="section-title mb-2">
            HTTP extractor task-level configurations
          </div>
          <template
            v-for="variable in extractor.placeholderVariables"
            :key="variable.name"
          >
            <v-text-field
              v-if="variable.type === 'perTask'"
              v-model="task.extractorVariables[variable.name]"
              :label="`URL template variable: ${variable.name} *`"
              :rules="rules.requiredAndMaxLength255"
              density="comfortable"
            />
          </template>
        </template> -->
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
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useJobStore } from '@/store/job'
import SwimlanesForm from './SwimlanesForm.vue'
import hs, { Job, Task } from '@hydroserver/client'
import { useTaskStore } from '@/store/task'
import StickyForm from '@/components/Forms/StickyForm.vue'
import { useTableLogic } from '@/composables/useTableLogic'
import { useWorkspaceStore } from '@/store/workspaces'
import { Snackbar } from '@/utils/notifications'

const { selectedWorkspace } = storeToRefs(useWorkspaceStore())
const selectedWorkspaceId = computed(() => selectedWorkspace.value?.id)

const props = defineProps({
  oldTask: { type: Object as () => Task },
})

const { tasks } = storeToRefs(useTaskStore())
const { linkedDatastreams } = storeToRefs(useJobStore())

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

const task = ref<Task>(
  props.oldTask
    ? new Task(JSON.parse(JSON.stringify(props.oldTask)))
    : new Task()
)

async function onSubmit() {
  const swimlanesValid = await swimlanesRef.value.validate()
  if (!swimlanesValid) return

  await myForm.value?.validate()
  if (!valid.value) return

  submitLoading.value = true
  task.value.workspaceId = selectedWorkspace.value?.id || ''

  console.log(task.value)
  const res = isEdit.value
    ? await hs.tasks.update(task.value)
    : await hs.tasks.create(task.value)

  if (!res.ok) {
    Snackbar.error(res.message)
    console.error(res)
  } else {
    const index = tasks.value.findIndex((p) => p.id === task.value.id)
    if (index !== -1) tasks.value[index] = task.value
    else tasks.value = [...tasks.value, task.value]
  }

  // await updateLinkedDatastreams(task.value, props.oldTask)
  // linkedDatastreams.value = await hs.datastreams.listAllItems()
  submitLoading.value = false
  emit('close')
}

function ensureIsoUtc(s = ''): string {
  return s && !/([Zz]|[+-]\d{2}:\d{2})$/.test(s) ? s + 'Z' : s
}

onMounted(() => {
  const timeKeys: Array<'startTime' | 'endTime'> = ['startTime', 'endTime']
  timeKeys.forEach((k) => {
    if (task.value?.schedule)
      task.value.schedule[k] = ensureIsoUtc(task.value.schedule[k])
  })
})
</script>

<style scoped>
:deep(.v-expansion-panel-text__wrapper) {
  padding: 0 !important;
}
</style>
