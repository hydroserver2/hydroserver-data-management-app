<template>
  <v-container v-if="dataSource">
    <v-row class="my-4" align="center">
      <v-col cols="auto">
        <h5 class="text-h5">{{ dataSource.name }}</h5>
      </v-col>
      <v-spacer />
      <v-col cols="auto">
        <v-btn
          variant="text"
          color="black"
          :prepend-icon="dataSource.status.paused ? 'mdi-play' : 'mdi-pause'"
          @click.stop="togglePaused(dataSource)"
        >
          Pause/Run
        </v-btn>
      </v-col>
    </v-row>

    <v-toolbar color="blue-grey" rounded="t-lg">
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
          <DataSourceStatus
            v-if="item.status"
            :status="item.status"
            :paused="!!item.paused"
          />
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

    <v-toolbar color="blue-grey-darken-2" rounded="t-lg">
      <h6 class="text-h6 ml-4">Linked orchestration system</h6>
    </v-toolbar>
    <v-data-table
      :headers="orchestrationSystemHeaders"
      :items="orchestrationSystemInformation"
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
      :old-data-source="dataSource"
      @updated="fetchData"
    />
  </v-dialog>

  <v-dialog v-model="openDelete" width="40rem">
    <DeleteDataSourceCard
      @close="openDelete = false"
      @delete="onDelete"
      :itemName="dataSource.name"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import DataSourceForm from '@/components/DataSource/DataSourceForm.vue'
import DataSourceStatus from '@/components/DataSource/DataSourceStatus.vue'
import DeleteDataSourceCard from '@/components/DataSource/DeleteDataSourceCard.vue'
import PayloadTable from '@/components/DataSource/PayloadTable.vue'
import { computed } from 'vue'
import { Snackbar } from '@/utils/notifications'
import { storeToRefs } from 'pinia'
import { api } from '@/services/api'
import { DataSource, getStatusText } from '@/models/dataSource'
import router from '@/router/router'
import { useETLStore } from '@/store/etl'

const route = useRoute()
const openEdit = ref(false)
const openDelete = ref(false)
const { dataSource } = storeToRefs(useETLStore())

const formatTime = (time: string) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(time)) + ' UTC'

const scheduleString = computed(() => {
  if (!dataSource.value) return ''
  const { interval, intervalUnits, crontab, startTime, endTime } =
    dataSource.value.schedule

  let schedule = interval
    ? `Every ${interval} ${intervalUnits}`
    : `Crontab: ${crontab}`

  if (startTime && endTime)
    schedule += ` from ${formatTime(startTime)} to ${formatTime(endTime)}`
  else if (startTime) schedule += ` beginning ${formatTime(startTime)}`
  else if (endTime) schedule += ` until ${formatTime(endTime)}`

  return schedule
})

const dataSourceHeaders = [
  { key: 'label', title: 'Label' },
  { key: 'value', title: 'Value' },
]

const orchestrationSystemHeaders = [
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
      icon: 'mdi-history',
      label: 'Last run',
      value: dataSource.value.status.lastRun
        ? formatTime(dataSource.value.status.lastRun)
        : '',
    },
    {
      icon: 'mdi-calendar-sync',
      label: 'Next run',
      value: dataSource.value.status.nextRun
        ? formatTime(dataSource.value.status.nextRun)
        : '',
    },
    {
      icon: 'mdi-message-text-outline',
      label: 'Last run message',
      value: dataSource.value.status.lastRunMessage,
    },
    {
      icon: 'mdi-information-outline',
      label: 'Status',
      status: getStatusText(dataSource.value.status),
      paused: dataSource.value.status.paused,
    },
  ].filter(Boolean)
})

const orchestrationSystemInformation = computed(() => {
  if (!dataSource.value) return []

  return [
    {
      icon: 'mdi-rename-box-outline',
      label: 'Name',
      value: dataSource.value.orchestrationSystem.name,
    },
    {
      icon: 'mdi-broadcast',
      label: 'Type',
      value: dataSource.value.orchestrationSystem.type,
    },
  ].filter(Boolean)
})

async function togglePaused(ds: any) {
  ds.status.paused = !ds.status.paused
  await api.updateDataSourcePartial({
    status: ds.status,
    id: ds.id,
  } as DataSource)
}

const onDelete = async () => {
  try {
    await api.deleteDataSource(dataSource.value.id)
    await router.push({ name: 'Orchestration' })
    Snackbar.success('Datasource deleted.')
  } catch (error: any) {
    Snackbar.error(error.message)
    console.error('Error deleting datasource', error)
  }
}

const fetchData = async () => {
  try {
    const [source] = await Promise.all([
      api.fetchDataSource(route.params.id.toString()),
    ])

    dataSource.value = source
    console.log('datasource', dataSource.value)
  } catch (e) {
    Snackbar.error('Unable to fetch dataSources from the API.')
    console.error('error fetching dataSource', e)
  }
}

onMounted(async () => {
  await fetchData()
})
</script>
