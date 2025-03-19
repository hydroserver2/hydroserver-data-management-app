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
          <v-card-title>Workflow configurations</v-card-title>

          <v-card-text>
            <v-select
              v-model="dataSource.type"
              label="Workflow type *"
              :items="workflowTypes"
              variant="outlined"
              density="compact"
            />
            <v-text-field
              class="mt-1"
              v-model="dataSource.name"
              label="Data source name *"
              :rules="rules.requiredAndMaxLength255"
              density="compact"
            />
          </v-card-text>

          <v-card-text class="text-subtitle-2 text-medium-emphasis">
            Which system would you like to run this data source workflow on?
          </v-card-text>

          <v-card-text>
            <v-select
              v-model="dataSource.etlSystemId"
              label="ETL system *"
              :items="etlSystems"
              :item-title="
                (etlSystem) =>
                  etlSystem ? `${etlSystem.name} (${etlSystem.type})` : ''
              "
              :item-value="(etlSystem) => etlSystem?.id"
              variant="outlined"
              density="compact"
            />
          </v-card-text>
        </v-col>

        <v-col cols="12" md="6">
          <v-card-title>Schedule</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="dataSource.startTime"
              label="Start Time"
              hint="Enter an optional start time for loading data. Otherwise, data loading will begin immediately."
              type="datetime-local"
              density="compact"
            />
            <v-text-field
              v-model="dataSource.endTime"
              label="End Time"
              hint="Enter an optional end time for loading data. Otherwise, data will be loaded indefinitely."
              type="datetime-local"
              density="compact"
            />
          </v-card-text>

          <v-card-text>
            <v-radio-group v-model="scheduleType" inline>
              <v-radio label="Interval" value="interval" />
              <v-radio label="Crontab" value="crontab" />
            </v-radio-group>
            <template v-if="scheduleType === 'interval'">
              <v-text-field
                v-model="dataSource.interval"
                label="Interval *"
                hint="Enter the interval data should be loaded on."
                type="number"
                :rules="[
                            (val: string) => val != null && val !== '' || 'Interval value is required.',
                            (val: string) => +val === parseInt(val, 10) || 'Interval must be an integer.',
                            (val: string) => +val > 0 || 'Interval must be greater than zero.'
                          ]"
              />
              <v-select
                v-model="dataSource.intervalUnits"
                label="Interval Units"
                :items="intervalUnitValues"
                variant="outlined"
                density="comfortable"
              />
            </template>
            <template v-if="scheduleType === 'crontab'">
              <v-text-field
                v-model="dataSource.crontab"
                label="Crontab"
                hint="Enter a crontab schedule for the data to be loaded on."
              />
            </template>
          </v-card-text>
        </v-col>
      </v-row>

      <div class="mb-4" />

      <template v-if="dataSource.type === 'ETL'">
        <DataSourceETLFields />
      </template>
      <template v-else-if="dataSource.type === 'Aggregation'">
        <DataSourceAggregationFields />
      </template>
      <template v-else-if="dataSource.type === 'Virtual'">
        <DataSourceVirtualFields />
      </template>
      <template v-else-if="dataSource.type === 'SDL'">
        <DataSourceSDLFields />
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
import { computed, onMounted, ref } from 'vue'
import { api } from '@/services/api'
import { EtlSystem } from '@/types'
import { DataSource } from '@/models'
import { rules } from '@/utils/rules'
import DataSourceETLFields from './ETL/DataSourceETLFields.vue'
import DataSourceAggregationFields from './DataSourceAggregationFields.vue'
import DataSourceVirtualFields from './DataSourceVirtualFields.vue'
import DataSourceSDLFields from './DataSourceSDLFields.vue'
import etlSystemFixtures from '@/utils/test/fixtures/etlSystemFixtures'
import { VForm } from 'vuetify/components'

const props = defineProps({ oldDataSource: Object as () => DataSource })
const emit = defineEmits(['created', 'updated', 'close'])

const isEdit = computed(() => !!props.oldDataSource || undefined)
const valid = ref(false)
const myForm = ref<VForm>()

const dataSource = ref<DataSource>(new DataSource())
if (props.oldDataSource) dataSource.value = new DataSource(props.oldDataSource!)

const etlSystems = etlSystemFixtures as EtlSystem[]
const workflowTypes = [
  { title: 'ETL', value: 'ETL' },
  { title: 'HydroServer aggregation', value: 'Aggregation' },
  { title: 'HydroServer virtual datastream', value: 'Virtual' },
  { title: 'Streaming Data Loader', value: 'SDL' },
]

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

const intervalUnitValues = [
  { value: 'minutes', title: 'Minutes' },
  { value: 'hours', title: 'Hours' },
  { value: 'days', title: 'Days' },
]

async function uploadItem() {
  await myForm.value?.validate()
  if (!valid.value) return
  if (isEdit.value)
    return await api.updateDataSource(dataSource.value, props.oldDataSource!)
  return await api.createDataSource(dataSource.value)
}

async function onSubmit() {
  try {
    const newItem = await uploadItem()
    if (!newItem) return
    if (isEdit.value) emit('updated', newItem)
    else emit('created', newItem.id)
  } catch (error) {
    console.error('Error uploading DataSource', error)
  }
  emit('close')
}

onMounted(async () => {
  if (dataSource.value.startTime) {
    dataSource.value.startTime = toLocalDateString(dataSource.value.startTime)
  }
  if (dataSource.value.endTime) {
    dataSource.value.endTime = toLocalDateString(dataSource.value.endTime)
  }
  // etlSystems.value = await api.fetchEtlSystems()
  loaded.value = true
})
</script>
