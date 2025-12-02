<template>
  <div class="my-4 mx-6" v-if="job">
    <v-row class="my-4" align="center">
      <v-col cols="auto">
        <h5 class="text-h5">{{ job.name }}</h5>
      </v-col>
      <v-spacer />
      <!-- <v-col cols="auto">
        <v-btn
          variant="text"
          color="black"
          :prepend-icon="job.status.paused ? mdiPlay : mdiPause"
          @click.stop="togglePaused(job)"
        >
          Pause/Run
        </v-btn>
      </v-col> -->
    </v-row>

    <v-toolbar color="blue-grey" rounded="t-lg">
      <h6 class="text-h6 ml-4">Data source details</h6>
    </v-toolbar>
    <v-data-table
      :headers="jobHeaders"
      :items="jobInformation"
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
        <!-- <template v-if="item.label === 'Status'">
          <JobStatus
            v-if="item.status"
            :status="item.status"
            :paused="!!item.paused"
          />
        </template> -->
        <template>
          {{ item.value }}
        </template>
      </template>
    </v-data-table>

    <v-row class="my-4">
      <v-spacer />
      <v-col cols="auto" align-self="center">
        <v-btn
          variant="outlined"
          :prepend-icon="mdiPencil"
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
          :prepend-icon="mdiTrashCanOutline"
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
  </div>
  <v-container v-else>Loading...</v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import JobForm from '@/components/Job/JobForm.vue'
import JobStatus from '@/components/Job/JobStatus.vue'
import DeleteJobCard from '@/components/Job/DeleteJobCard.vue'
import PayloadTable from '@/components/Job/Payload/PayloadTable.vue'
import { computed } from 'vue'
import { Snackbar } from '@/utils/notifications'
import { storeToRefs } from 'pinia'
import hs, { Job, WORKFLOW_TYPES } from '@hydroserver/client'
import router from '@/router/router'
import { useJobStore } from '@/store/job'

import { formatTimeWithZone } from '@/utils/time'
import {
  mdiBroadcast,
  mdiCalendarClock,
  mdiCalendarSync,
  mdiCardAccountDetails,
  mdiHistory,
  mdiInformationOutline,
  mdiMessageTextOutline,
  mdiPause,
  mdiPencil,
  mdiPlay,
  mdiRenameBoxOutline,
  mdiTrashCanOutline,
} from '@mdi/js'

const route = useRoute()

const { job, linkedDatastreams } = storeToRefs(useJobStore())

const scheduleString = computed(() => {
  if (!job.value) return ''
  const { interval, intervalUnits, crontab, startTime, endTime } =
    job.value.schedule

  let schedule = interval
    ? `Every ${interval} ${intervalUnits}`
    : `Crontab: ${crontab}`

  if (startTime && endTime)
    schedule += ` from ${formatTimeWithZone(startTime)} to ${formatTimeWithZone(
      endTime
    )}`
  else if (startTime) schedule += ` beginning ${formatTimeWithZone(startTime)}`
  else if (endTime) schedule += ` until ${formatTimeWithZone(endTime)}`

  return schedule
})

const jobHeaders = [
  { key: 'label', title: 'Label' },
  { key: 'value', title: 'Value' },
]

const orchestrationSystemHeaders = [
  { key: 'label', title: 'Label' },
  { key: 'value', title: 'Value' },
]

const jobInformation = computed(() => {
  if (!job.value) return []

  return [
    {
      icon: mdiCardAccountDetails,
      label: 'ID',
      value: job.value.id,
    },
    {
      icon: mdiCalendarClock,
      label: 'Schedule',
      value: scheduleString,
    },
    // {
    //   icon: mdiHistory,
    //   label: 'Last run',
    //   value: formatTimeWithZone(job.value.status.lastRun),
    // },
    // {
    //   icon: mdiCalendarSync,
    //   label: 'Next run',
    //   value: formatTimeWithZone(job.value.status.nextRun),
    // },
    // {
    //   icon: mdiMessageTextOutline,
    //   label: 'Last run message',
    //   value: job.value.status.lastRunMessage || '–',
    // },
    // {
    //   icon: mdiInformationOutline,
    //   label: 'Status',
    //   status: getStatusText(job.value.status),
    //   paused: job.value.status.paused,
    // },
  ].filter(Boolean)
})

const orchestrationSystemInformation = computed(() => {
  if (!job.value) return []

  return [
    {
      icon: mdiRenameBoxOutline,
      label: 'Name',
      value: job.value.orchestrationSystem.name,
    },
    {
      icon: mdiBroadcast,
      label: 'Type',
      value:
        WORKFLOW_TYPES.find(
          (t) => t.value === job.value.orchestrationSystem.type
        )?.title ?? job.value.orchestrationSystem.type,
    },
  ].filter(Boolean)
})

// async function togglePaused(ds: any) {
//   ds.status.paused = !ds.status.paused
//   await hs.jobs.updatePartial({
//     status: ds.status,
//     id: ds.id,
//   } as Job)
// }

const fetchData = async () => {
  const [source, datastreams] = await Promise.all([
    hs.jobs.getItem(route.params.id.toString(), {
      expand_related: true,
    }),
    hs.datastreams.listAllItems(),
  ])

  if (source && datastreams) {
    job.value = source
    linkedDatastreams.value = datastreams
  }
}

onMounted(async () => {
  await fetchData()
})
</script>
