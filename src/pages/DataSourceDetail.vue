<template>
  <v-container v-if="dataSource">
    <v-row class="my-4">
      <v-col cols="auto">
        <h5 class="text-h5">{{ dataSource.name }}</h5>
      </v-col>

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

    <v-data-table
      :items="dataSourceInformation"
      :items-per-page="-1"
      hide-default-header
      hide-default-footer
      density="compact"
      class="elevation-3 my-6 rounded-lg"
    >
      <template v-slot:top>
        <v-toolbar color="blue-grey-lighten-4" rounded="t-lg" density="compact">
          <h6 class="text-h6 ml-4">Data source information</h6>
        </v-toolbar>
      </template>
      <template v-slot:item.icon="{ item }">
        <v-icon :icon="item?.icon"></v-icon>
      </template>
      <template v-slot:item.label="{ item }">
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

    <v-data-table
      :items="etlSystemInformation"
      :items-per-page="-1"
      hide-default-header
      hide-default-footer
      density="compact"
      class="elevation-3 my-6 rounded-lg"
    >
      <template v-slot:top>
        <v-toolbar color="indigo-lighten-4" rounded="t-lg" density="compact">
          <h6 class="text-h6 ml-4">Linked ETL system information</h6>
        </v-toolbar>
      </template>
      <template v-slot:item.icon="{ item }">
        <v-icon :icon="item?.icon"></v-icon>
      </template>
      <template v-slot:item.label="{ item }">
        <strong>{{ item?.label }}</strong>
      </template>
    </v-data-table>

    <h5 class="text-h5 mt-8 mb-6">Payloads for this data source</h5>

    <v-row class="pb-4">
      <v-col cols="auto">
        <v-btn-secondary
          @click="openPayloadForm = true"
          prependIcon="mdi-plus"
          variant="elevated"
          >Add new payload</v-btn-secondary
        >
      </v-col>
    </v-row>

    <v-data-table-virtual
      class="elevation-3 my-4"
      :headers="payloadHeaders"
      :items="payloads"
      :sort-by="sortBy"
      :style="{ 'max-height': `100vh` }"
      fixed-header
    >
      <template v-slot:item.info="{ item }">
        <v-col>
          <v-row
            v-for="[source, target] in Object.entries(item.sourceToTargetMap)"
            style="font-size: 1.2em"
          >
            <p>
              <strong>{{ source }}: </strong> {{ target }}
            </p>
          </v-row>
        </v-col>
      </template>

      <template v-slot:item.actions="{ item }"> </template>
    </v-data-table-virtual>

    <!-- <h6 class="text-h6 my-4">Data Source Configuration</h6>

        <tr>
          <td style="width: 220px">Local File Path</td>
          <td>{{ dataSource.path }}</td>
        </tr>
        <tr>
          <td style="width: 220px">Header Row</td>
          <td>{{ dataSource.headerRow }}</td>
        </tr>
        <tr>
          <td style="width: 220px">Data Start Row</td>
          <td>{{ dataSource.dataStartRow }}</td>
        </tr>
        <tr>
          <td style="width: 220px">Timestamp Column</td>
          <td>{{ dataSource.timestampColumn }}</td>
        </tr>
   
        <tr>
          <td style="width: 220px">Status</td>
          <td>
            <DataSourceStatus :status="status" :paused="dataSource.paused" />
          </td>
        </tr>
   
  
    </v-table> -->
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

  <v-dialog v-model="openPayloadForm" width="40rem">
    <PayloadForm />
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { EtlSystem, DataSource, Datastream } from '@/types'
import DataSourceForm from '@/components/DataSource/Form/DataSourceForm.vue'
import DataSourceStatus from '@/components/DataSource/DataSourceStatus.vue'
import DeleteDataSourceCard from '@/components/DataSource/DeleteDataSourceCard.vue'
import PayloadForm from '@/components/DataSource/PayloadForm.vue'
import { api } from '@/services/api'
import { computed } from 'vue'
import { getStatus } from '@/utils/dataSourceUtils'
import { Snackbar } from '@/utils/notifications'

const route = useRoute()
const openEdit = ref(false)
const openDelete = ref(false)
const openPayloadForm = ref(false)
const datastreams = ref<Datastream[]>([])
const etlSystem = ref<EtlSystem>(new EtlSystem())
const dataSource = ref<DataSource>(new DataSource())

const sortBy = [{ key: 'name' }]
const payloadHeaders = [
  { title: 'Name', key: 'name' },
  {
    title: 'Source to target mapping',
    key: 'info',
    sortable: false,
  },
  { title: 'Actions', key: 'actions', sortable: false },
]
const payloads = [
  {
    name: 'Example payload 1',
    sourceToTargetMap: {
      water_level_ft: '1928-125-3484-8348',
      temperature_f: '0985-157-3486-3257',
    },
  },
  {
    name: 'Example payload 2',
    sourceToTargetMap: {
      water_level_ft: '1928-125-3484-8348',
      temperature_f: '0985-157-3486-3257',
    },
  },
]

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
      api.fetchDataSource(route.params.id.toString()),
    ])

    dataSource.value = source
    etlSystem.value = await api.fetchEtlSystem(dataSource.value.etlSystemId)
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
