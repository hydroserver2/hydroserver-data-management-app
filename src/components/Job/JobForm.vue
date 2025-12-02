<template>
  <v-card v-if="loaded" class="job-form-card d-flex flex-column">
    <div flat color="white" class="sticky-header">
      <div class="sticky-header-content">
        <p class="ml-6 font-weight-bold">
          {{ isEdit ? 'Edit' : 'Create a new' }} job
          <span v-if="isEdit" class="opacity-80">- {{ job?.name }}</span>
        </p>
      </div>
      <v-divider color="black" thickness="2" />
    </div>

    <v-form
      @submit.prevent="onSubmit"
      ref="myForm"
      v-model="valid"
      validate-on="input"
      class="d-flex flex-column flex-grow-1"
    >
      <div class="form-body">
        <p class="font-weight-bold mb-2 required-label">Name your job</p>
        <v-text-field
          v-model="formJob.name"
          label="Job name"
          :rules="rules.requiredAndMaxLength255"
          density="compact"
        />

        <ExtractorForm ref="extractorRef" />
        <TransformerForm ref="transformerRef" />
        <LoaderForm ref="loaderRef" />
      </div>

      <v-divider color="black" thickness="2" />
      <v-card-actions class="sticky-actions">
        <v-spacer />
        <v-btn-cancel @click="emit('close')"> Cancel </v-btn-cancel>
        <v-btn-primary type="submit"> Save </v-btn-primary>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { rules } from '@/utils/rules'
import { VForm } from 'vuetify/components'
import { storeToRefs } from 'pinia'
import { useJobStore } from '@/store/job'
import { useWorkspaceStore } from '@/store/workspaces'
import ExtractorForm from './Extractor/ExtractorForm.vue'
import TransformerForm from './Transformer/TransformerForm.vue'
import LoaderForm from './Loader/LoaderForm.vue'
import hs, { OrchestrationSystem, Job } from '@hydroserver/client'
import { Snackbar } from '@/utils/notifications'

const props = defineProps<{
  job?: Job
}>()

const emit = defineEmits(['created', 'updated', 'close'])

const { selectedWorkspace } = storeToRefs(useWorkspaceStore())
const { job: formJob } = storeToRefs(useJobStore())

const isEdit = computed(() => !!props.job)
formJob.value = !!props.job ? props.job : new Job()
const valid = ref(false)
const myForm = ref<VForm>()

// const { item, isEdit, valid, myForm, uploadItem } = useFormLogic(
//   hs.jobs.create,
//   hs.jobs.update,
//   Job,
//   props.job || undefined
// )

// const orchestrationSystems = ref([] as OrchestrationSystem[])

const extractorRef = ref<any>(null)
const transformerRef = ref<any>(null)
const loaderRef = ref<any>(null)

const loaded = ref(false)
const isSubmitting = ref(false)
// const scheduleType = ref('interval')

// let prevJob = undefined
// if (props.isEdit) prevJob = JSON.parse(JSON.stringify(toRaw(job.value)))
// else {
//   // let workflowType = 'SDL'
//   // if (props.orchestrationSystem?.type === 'airflow') {
//   const workflowType: WorkflowType = 'ETL'
//   // }
//   job.value = new Job({
//     extractor: JSON.parse(JSON.stringify(extractorDefaults['local'])),
//     transformer: JSON.parse(JSON.stringify(transformerDefaults['CSV'])),
//     loader: JSON.parse(JSON.stringify(loaderDefaults['HydroServer'])),
//     workspaceId: selectedWorkspace.value!.id,
//   })
// }

// const orchestrationOptions = computed(() => [
//   { title: 'Celery Task Queue', value: null }, // default/null option
//   ...orchestrationSystems.value.map((os) => ({
//     title: os.name,
//     value: os.id,
//   })),
// ])

// const startInput = computed<string>({
//   get: () => isoToInput(job.value.schedule.startTime, 'local'),
//   set: (v) => {
//     job.value.schedule.startTime = inputToIso(v, 'local')
//   },
// })

// const endInput = computed<string>({
//   get: () => isoToInput(job.value.schedule.endTime, 'local'),
//   set: (v) => {
//     job.value.schedule.endTime = inputToIso(v, 'local')
//   },
// })

// function ensureIsoUtc(s = ''): string {
//   return s && !/([Zz]|[+-]\d{2}:\d{2})$/.test(s) ? s + 'Z' : s
// }

// function isoToInput(iso = '', mode: 'local' | 'utc') {
//   if (!iso) return ''
//   const d = new Date(ensureIsoUtc(iso))
//   const ms =
//     mode === 'utc' ? d.getTime() : d.getTime() - d.getTimezoneOffset() * 60_000
//   return new Date(ms).toISOString().slice(0, 16)
// }

// function inputToIso(str = '', mode: 'local' | 'utc') {
//   if (!str) return ''
//   const parsed = mode === 'utc' ? new Date(str + 'Z') : new Date(str)
//   return parsed.toISOString()
// }

async function validate() {
  const validExtractor = await extractorRef.value.validate()
  const validTransformer = await transformerRef.value.validate()
  const validLoader = await loaderRef.value.validate()
  return validExtractor && validTransformer && validLoader
}

async function onSubmit() {
  const etlValid = await validate()
  if (!etlValid) return

  isSubmitting.value = true

  await myForm.value?.validate()
  if (!valid.value) return false

  formJob.value.workspace = selectedWorkspace.value
  console.log('formJob', formJob.value)
  const res = isEdit.value
    ? await hs.jobs.update(formJob.value)
    : await hs.jobs.create(formJob.value)

  if (res.ok) {
    if (isEdit.value) {
      emit('updated', res.data)
      Snackbar.success('Updated job')
    } else {
      emit('created', res.data.id)
      Snackbar.success('Created job')
    }
  } else {
    Snackbar.error(res.message)
    console.error(res)
  }

  emit('close')
}

onMounted(async () => {
  // const timeKeys: Array<'startTime' | 'endTime'> = ['startTime', 'endTime']
  // timeKeys.forEach((k) => {
  //   job.value.schedule[k] = ensureIsoUtc(job.value.schedule[k])
  // })
  // orchestrationSystems.value = await hs.orchestrationSystems.listAllItems({
  //   workspace_id: [selectedWorkspace.value!.id],
  // })
  loaded.value = true
})
</script>

<style scoped>
:deep(.required-label)::after {
  content: ' *';
  color: #f44336; /* Vuetify error color */
}

.job-form-card {
  max-height: 90vh;
  height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.job-form-card :deep(.v-form) {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

.form-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 24px;
  scrollbar-gutter: stable both-edges;
}

.sticky-actions {
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 2;
}

.sticky-header,
.sticky-title {
  position: sticky;
  top: 0;
  z-index: 2;
  background: white;
}

.sticky-header-content {
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>
