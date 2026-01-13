<template>
  <StickyForm v-if="loaded">
    <template #header>
      <p class="ml-6 font-weight-bold">
        {{ isEdit ? 'Edit' : 'Create a new' }} task template
        <span v-if="isEdit" class="opacity-80">- {{ formJob?.name }}</span>
      </p>
    </template>

    <v-form
      @submit.prevent="onSubmit"
      ref="myForm"
      v-model="valid"
      validate-on="input"
      class="d-flex flex-column flex-grow-1"
    >
      <div class="form-body">
        <p class="font-weight-bold mb-2 required-label">Name your template</p>
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
    </v-form>

    <template #actions>
      <v-spacer />
      <v-btn-cancel @click="emit('close')"> Cancel </v-btn-cancel>
      <v-btn-primary type="button" @click="onSubmit"> Save </v-btn-primary>
    </template>
  </StickyForm>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { VForm } from 'vuetify/components'
import { storeToRefs } from 'pinia'
import StickyForm from '@/components/Forms/StickyForm.vue'
import { rules } from '@/utils/rules'
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
  // orchestrationSystems.value = await hs.orchestrationSystems.listAllItems({
  //   workspace_id: [selectedWorkspace.value!.id],
  // })
  loaded.value = true
})
</script>

<style scoped>
.form-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: visible;
  padding: 16px 24px;
  scrollbar-gutter: stable both-edges;
}
</style>
