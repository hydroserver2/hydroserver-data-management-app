<template>
  <v-card v-if="loaded">
    <v-toolbar flat color="white">
      <v-card-title class="text-medium-emphasis">
        {{ isEdit ? 'Edit' : 'Add' }} data source
        <span v-if="isEdit" class="opacity-80">- {{ dataSource?.name }}</span>
      </v-card-title>
    </v-toolbar>

    <v-divider />

    <v-form
      @submit.prevent="onSubmit"
      ref="myForm"
      v-model="valid"
      validate-on="blur"
    >
      <v-row>
        <v-col cols="12" md="6">
          <v-card-item>
            <v-card-title>Workflow configurations</v-card-title>
          </v-card-item>

          <v-card-text>
            <v-select
              v-model="dataSource.settings.type"
              label="Workflow type *"
              :items="WORKFLOW_TYPES"
              variant="outlined"
              density="compact"
              class="mb-1"
            />
            <v-text-field
              class="mt-2"
              v-model="dataSource.name"
              label="Data source name *"
              :rules="rules.requiredAndMaxLength255"
              density="compact"
            />
          </v-card-text>
        </v-col>

        <v-col cols="12" md="6">
          <v-card-item>
            <v-card-title>Schedule</v-card-title>
          </v-card-item>
          <v-card-text class="pb-0">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="dataSource.schedule.startTime"
                  label="Start Time"
                  hint="Enter an optional start time for loading data. Otherwise, data loading will begin immediately."
                  type="datetime-local"
                  density="compact"
                  clearable
                  class="mb-1"
                />
              </v-col>
              <v-col>
                <v-text-field
                  v-model="dataSource.schedule.endTime"
                  label="End Time"
                  hint="Enter an optional end time for loading data. Otherwise, data will be loaded indefinitely."
                  type="datetime-local"
                  clearable
                  density="compact"
                />
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-text class="pt-2">
            <v-radio-group v-model="scheduleType" inline>
              <v-radio label="Interval" value="interval" />
              <v-radio label="Crontab" value="crontab" />
            </v-radio-group>
            <template v-if="scheduleType === 'interval'">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="dataSource.schedule.interval"
                    label="Interval *"
                    hint="Enter the interval data should be loaded on."
                    type="number"
                    :rules="[
                            (val: string) => val != null && val !== '' || 'Interval value is required.',
                            (val: string) => +val === parseInt(val, 10) || 'Interval must be an integer.',
                            (val: string) => +val > 0 || 'Interval must be greater than zero.'
                          ]"
                  />
                </v-col>
                <v-col md="6">
                  <v-select
                    v-model="dataSource.schedule.intervalUnits"
                    label="Interval Units *"
                    :items="INTERVAL_UNIT_OPTIONS"
                    variant="outlined"
                    :rules="required"
                  />
                </v-col>
              </v-row>
            </template>
            <template v-if="scheduleType === 'crontab'">
              <v-text-field
                v-model="dataSource.schedule.crontab"
                label="Crontab *"
                hint="Enter a crontab schedule for the data to be loaded on."
                :rules="rules.required"
              />
            </template>
          </v-card-text>
        </v-col>
      </v-row>

      <div class="mb-4" />

      <template v-if="dataSource.settings.type === 'Aggregation'">
        <DataSourceAggregationFields />
      </template>
      <template
        v-else-if="
          dataSource.settings.type === 'ETL' ||
          dataSource.settings.type === 'SDL'
        "
      >
        <DataSourceETLFields ref="etlFieldsRef" />
      </template>
      <template v-else-if="dataSource.settings.type === 'Virtual'">
        <DataSourceVirtualFields />
      </template>

      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn-cancel @click="emit('close')"> Cancel </v-btn-cancel>
        <v-btn-primary type="submit"> Save </v-btn-primary>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { DataSource } from '@/models'
import { required, rules } from '@/utils/rules'
import DataSourceETLFields from './DataSourceETLFields.vue'
import DataSourceAggregationFields from './Form/DataSourceAggregationFields.vue'
import DataSourceVirtualFields from './Form/DataSourceVirtualFields.vue'
import { VForm } from 'vuetify/components'
import {
  INTERVAL_UNIT_OPTIONS,
  WORKFLOW_TYPES,
  OrchestrationSystem,
} from '@/models/dataSource'
import { storeToRefs } from 'pinia'
import { useETLStore } from '@/store/etl'
import { api } from '@/services/api'
import { useWorkspaceStore } from '@/store/workspaces'

const props = defineProps({
  oldDataSource: Object as () => DataSource,
  orchestrationSystem: Object as () => OrchestrationSystem,
})
const emit = defineEmits(['created', 'updated', 'close'])
const { selectedWorkspace } = storeToRefs(useWorkspaceStore())

const isEdit = computed(() => !!props.oldDataSource || undefined)
const valid = ref(false)
const myForm = ref<VForm>()
const orchestrationSystems = ref([] as OrchestrationSystem[])
const etlFieldsRef = ref<any>(null)

const { dataSource } = storeToRefs(useETLStore())
if (props.oldDataSource) dataSource.value = new DataSource(props.oldDataSource!)
else
  dataSource.value = new DataSource({
    workspaceId: selectedWorkspace.value!.id,
    orchestrationSystem: props.orchestrationSystem,
  })

// TODO: We'll know the workflow type is SDL when we're opening this form,
// so no need to watch. But, make sure the options are limited to CSV when the form
// is open and make sure type is always SDL for an SDL orchestration system.
// watch(
//   () => dataSource.value.settings.type,
//   (newVal, oldVal) => {
//     // SDL workflows should only be run on machines running the SDL orchestration software.
//     if (newVal === 'SDL' || oldVal === 'SDL') dataSource.value.orchestrationSystemId = ''
//     if (newVal === 'SDL') {
//       if (dataSource.value.settings.extractor.type !== 'local')
//         dataSource.value.switchExtractor('local')
//       if (dataSource.value.settings.transformer.type !== 'CSV')
//         dataSource.value.switchTransformer('CSV')
//     }
//   }
// )

function toLocalDateString(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const loaded = ref(false)
const scheduleType = ref('interval')

async function onSubmit() {
  if (
    dataSource.value.settings.type === 'ETL' ||
    dataSource.value.settings.type === 'SDL'
  ) {
    const etlValid = await etlFieldsRef.value.validate()
    if (!etlValid) return
  }

  await myForm.value?.validate()
  if (!valid.value) return false

  try {
    const newItem: DataSource | null = isEdit.value
      ? await api.updateDataSource(dataSource.value, props.oldDataSource!)
      : await api.createDataSource(dataSource.value)

    if (!newItem) {
      emit('close')
      return
    }

    if (isEdit.value) {
      emit('updated', newItem)
      return
    } else {
      emit('created', newItem.id)
    }
  } catch (error) {
    console.error('Error uploading DataSource', error)
  }
  emit('close')
}

onMounted(async () => {
  if (dataSource.value.schedule.startTime) {
    dataSource.value.schedule.startTime = toLocalDateString(
      dataSource.value.schedule.startTime
    )
  }
  if (dataSource.value.schedule.endTime) {
    dataSource.value.schedule.endTime = toLocalDateString(
      dataSource.value.schedule.endTime
    )
  }
  orchestrationSystems.value = await api.fetchWorkspaceOrchestrationSystems(
    selectedWorkspace.value!.id
  )
  loaded.value = true
})
</script>
