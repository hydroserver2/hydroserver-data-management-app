<template>
  <v-container v-if="dataSource">
    <v-row class="my-4">
      <v-col cols="auto">
        <h5 class="text-h5">{{ dataSource.name }}</h5>
      </v-col>
    </v-row>

    <v-toolbar color="blue-grey" rounded="t-lg" density="compact">
      <h6 class="text-h6 ml-4">Data source details</h6>
    </v-toolbar>
    <v-data-table
      :headers="dataSourceHeaders"
      :items="dataSourceInformation"
      :items-per-page="-1"
      hide-default-header
      hide-default-footer
      density="compact"
      class="elevation-3 rounded-b-lg"
    >
      <template v-slot:item.label="{ item }">
        <v-icon :icon="item?.icon" class="mr-2" />
        <strong>{{ item?.label }}</strong>
      </template>
      <template #item.value="{ item }">
        <template v-if="item.label === 'Status'">
          <DataSourceStatus :status="status" :paused="!!item.paused" />
        </template>
        <template v-else>
          {{ item.value }}
        </template>
      </template>
    </v-data-table>

    <v-row class="my-4">
      <v-spacer />
      <v-col cols="auto" align-self="center">
        <v-btn
          variant="outlined"
          prepend-icon="mdi-pencil"
          rounded="xl"
          color="secondary"
          class="mr-2"
          @click="openEdit = true"
        >
          Edit data source
        </v-btn>
        <v-btn-delete
          variant="outlined"
          rounded="xl"
          prepend-icon="mdi-trash-can-outline"
          color="red-darken-3"
          @click="openDelete = true"
        >
          Delete data source
        </v-btn-delete>
      </v-col>
    </v-row>

    <v-toolbar color="blue-grey-darken-2" rounded="t-lg" density="compact">
      <h6 class="text-h6 ml-4">Linked ETL system details</h6>
    </v-toolbar>
    <v-data-table
      :headers="etlSystemHeaders"
      :items="etlSystemInformation"
      :items-per-page="-1"
      hide-default-header
      hide-default-footer
      density="compact"
      class="elevation-3 mb-6 rounded-b-lg"
    >
      <template v-slot:item.label="{ item }">
        <v-icon :icon="item?.icon" class="mr-2" />
        <strong>{{ item?.label }}</strong>
      </template>
    </v-data-table>

    <PayloadTable />
  </v-container>
  <v-container v-else>Loading...</v-container>

  <v-dialog v-model="openEdit" width="80rem">
    <DataSourceForm
      @close="openEdit = false"
      :dataSource="dataSource"
      @updated="fetchData"
    />
  </v-dialog>

  <v-dialog v-model="openDelete" width="40rem">
    <DeleteDataSourceCard
      @close="openDelete = false"
      :itemName="dataSource.name"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { EtlSystem, Datastream } from '@/types'
import { DataSource } from '@/models'
import DataSourceForm from '@/components/DataSource/Form/DataSourceForm.vue'
import DataSourceStatus from '@/components/DataSource/DataSourceStatus.vue'
import DeleteDataSourceCard from '@/components/DataSource/DeleteDataSourceCard.vue'
import PayloadTable from '@/components/DataSource/PayloadTable.vue'
import { api } from '@/services/api'
import { computed } from 'vue'
import { getStatus } from '@/utils/dataSourceUtils'
import { Snackbar } from '@/utils/notifications'
import dataSourceFixtures from '@/utils/test/fixtures/dataSourceFixtures'

const route = useRoute()
const openEdit = ref(false)
const openDelete = ref(false)
const datastreams = ref<Datastream[]>([])
const etlSystem = ref<EtlSystem>(new EtlSystem())
const dataSource = ref<DataSource>(new DataSource())

const status = computed(() =>
  dataSource.value ? getStatus(dataSource.value) : 'pending'
)

const scheduleString = computed(() => {
  if (!dataSource.value) return ''
  const ds = dataSource.value
  let string = ''

  if (ds.interval) string += `Every ${ds.interval} ${ds.intervalUnits}`
  else string += `Crontab: ${ds.crontab}`

  if (ds.startTime && ds.endTime)
    string += ` from ${ds.startTime} to ${ds.endTime}`
  else if (ds.startTime) string += ` beginning ${ds.startTime}`
  else if (ds.endTime) string += ` until ${ds.endTime}`

  return string
})

const dataSourceHeaders = [
  { key: 'label', title: 'Label' },
  { key: 'value', title: 'Value' },
]

const etlSystemHeaders = [
  { key: 'label', title: 'Label' },
  { key: 'value', title: 'Value' },
]

const dataSourceInformation = computed(() => {
  if (!dataSource.value) return []

  return [
    {
      icon: 'mdi-card-account-details',
      label: 'ID',
      value: dataSource.value.id,
    },
    {
      icon: 'mdi-calendar-clock',
      label: 'Schedule',
      value: scheduleString,
    },
    {
      icon: 'mdi-clock-outline',
      label: 'Timestamp column',
      value: dataSource.value.timestampColumn,
    },
    {
      icon: 'mdi-history',
      label: 'Last synced',
      value: dataSource.value.lastSynced,
    },
    {
      icon: 'mdi-message-text-outline',
      label: 'Last sync message',
      value: dataSource.value.lastSyncMessage,
    },
    {
      icon: 'mdi-calendar-sync',
      label: 'Next sync',
      value: dataSource.value.nextSync,
    },
    {
      icon: 'mdi-information-outline',
      label: 'Status',
      status: status,
      paused: dataSource.value.paused,
    },
  ].filter(Boolean)
})

const etlSystemInformation = computed(() => {
  if (!dataSource.value || !etlSystem.value) return []

  return [
    {
      icon: 'mdi-rename-box-outline',
      label: 'Name',
      value: etlSystem.value.name,
    },
    {
      icon: 'mdi-broadcast',
      label: 'Type',
      value: etlSystem.value.type,
    },
  ].filter(Boolean)
})

// const linkedDatastreamColumns = [
//   {
//     title: 'ID',
//     key: 'name',
//   },
//   {
//     title: 'Name',
//     key: 'description',
//   },
//   {
//     title: 'Status',
//     key: 'status',
//   },
//   {
//     title: 'Last Loaded Timestamp',
//     key: 'phenomenonEndTime',
//   },
//   {
//     title: 'Data Source Column',
//     key: 'dataSourceColumn',
//   },
// ] as const

const fetchData = async () => {
  try {
    const [data, source] = await Promise.all([
      api.fetchDatastreams(),
      // api.fetchDataSource(route.params.id.toString()),
      dataSourceFixtures.find(
        (ds) => ds.id === route.params.id.toString()
      ) as DataSource,
    ])

    dataSource.value = source
    // etlSystem.value = await api.fetchEtlSystem(dataSource.value.etlSystemId)
    etlSystem.value = {
      id: 'ETL-SYS-1',
      name: 'ETL System 1',
      type: 'Aiflow Orchestrator',
      workspaceId: 'workspace 1',
    }
    datastreams.value = (data as Datastream[]).filter(
      (d) => d.dataSourceId === dataSource.value.id
    )
  } catch (e) {
    Snackbar.error('Unable to fetch dataSources from the API.')
    console.log('error fetching dataSource', e)
  }
}

onMounted(async () => {
  await fetchData()
})
</script>
