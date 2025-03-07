<template>
  <v-card v-if="loaded">
    <v-toolbar
      :title="`${isEdit ? 'Edit' : 'Add'} data source`"
      flat
      color="white"
    />

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
              v-model="item.type"
              label="Workflow type *"
              :items="workflowTypes"
              variant="outlined"
              density="compact"
            />
            <v-text-field
              class="mt-1"
              v-model="item.name"
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
              v-model="item.etlSystemId"
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
              v-model="item.startTime"
              label="Start Time"
              hint="Enter an optional start time for loading data. Otherwise, data loading will begin immediately."
              type="datetime-local"
              density="compact"
            />
            <v-text-field
              v-model="item.endTime"
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
                v-model="item.interval"
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
                v-model="item.intervalUnits"
                label="Interval Units"
                :items="intervalUnitValues"
                variant="outlined"
                density="comfortable"
              />
            </template>
            <template v-if="scheduleType === 'crontab'">
              <v-text-field
                v-model="item.crontab"
                label="Crontab"
                hint="Enter a crontab schedule for the data to be loaded on."
              />
            </template>
          </v-card-text>
        </v-col>
      </v-row>

      <div class="mb-4" />

      <template v-if="item.type === 'ETL'">
        <DataSourceETLFields />
      </template>
      <template v-else-if="item.type === 'HydroServer aggregation'">
        <DataSourceAggregationFields />
      </template>
      <template v-else-if="item.type === 'HydroServer virtual datastream'">
        <DataSourceVirtualFields />
      </template>
      <template v-else-if="item.type === 'Streaming ETL System'">
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
import { onMounted, ref } from 'vue'
import { useFormLogic } from '@/composables/useFormLogic'
import { api } from '@/services/api'
import { EtlSystem, DataSource } from '@/types'
import { rules } from '@/utils/rules'
import DataSourceETLFields from './ETL/DataSourceETLFields.vue'
import DataSourceAggregationFields from './DataSourceAggregationFields.vue'
import DataSourceVirtualFields from './DataSourceVirtualFields.vue'
import DataSourceSDLFields from './DataSourceSDLFields.vue'
import etlSystemFixtures from '@/utils/test/fixtures/etlSystemFixtures'

const props = defineProps({ dataSource: Object as () => DataSource })
const emit = defineEmits(['created', 'updated', 'close'])

const { item, isEdit, valid, myForm, uploadItem } = useFormLogic(
  api.createDataSource,
  api.updateDataSource,
  DataSource,
  props.dataSource || undefined
)

const etlSystems = etlSystemFixtures as EtlSystem[]
const workflowTypes = [
  'ETL',
  'HydroServer aggregation',
  'HydroServer virtual datastream',
  'Streaming ETL System',
]

const loaded = ref(false)
const scheduleType = ref('interval')

const intervalUnitValues = [
  { value: 'minutes', title: 'Minutes' },
  { value: 'hours', title: 'Hours' },
  { value: 'days', title: 'Days' },
]

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
  // etlSystems.value = await api.fetchEtlSystems()
  loaded.value = true
})
</script>
