<template>
  <v-card>
    <v-toolbar title="Task Templates" flat color="blue-grey">
      <v-spacer />
      <v-text-field
        label="Search"
        class="mx-4"
        clearable
        v-model="search"
        :prepend-inner-icon="mdiMagnify"
        hide-details
        density="compact"
        variant="underlined"
        maxWidth="300"
      />

      <v-btn-add class="mx-4" @click="openCreateDialog(null)"
        >Add task template</v-btn-add
      >
    </v-toolbar>

    <v-data-table-virtual
      :headers="headers"
      :items="items"
      :search="search"
      :loading="loading"
      no-data-text="There's currently no templates for this workspace"
    >
      <!-- <template v-slot:no-data>
        <div class="text-center pa-4" v-if="jobs.length === 0">
          <v-icon :icon="mdiDesktopClassic" size="48" color="grey lighten-1" />
          <h4 class="mt-2">
            You have not registered any orchestration systems.
          </h4>
          <p class="mb-4">
            Click the 'download Streaming Data Loader' button to get started or
            <a href="https://hydroserver.org" target="_blank"
              >read the documentation</a
            >
            to learn more.
          </p>
        </div>
      </template> -->

      <template v-slot:item.actions="{ item }">
        <v-icon
          color="secondary"
          :icon="mdiPencil"
          @click="openDialog(item, 'edit')"
        />
        <v-icon
          color="delete"
          :icon="mdiDelete"
          @click="openDialog(item, 'delete')"
        />
      </template>
    </v-data-table-virtual>
  </v-card>

  <v-dialog
    v-model="openCreate"
    transition="dialog-bottom-transition"
    width="60rem"
  >
    <JobForm @close="openCreate = false" @created="refreshTable" />
  </v-dialog>

  <v-dialog v-model="openEdit" width="80rem">
    <JobForm :job="item" @close="openEdit = false" @updated="onUpdate" />
  </v-dialog>

  <v-dialog v-model="openDelete" width="40rem">
    <DeleteJobCard
      @close="openDelete = false"
      @delete="onDelete"
      :itemName="item.name"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, toRef, watch } from 'vue'
import JobForm from '@/components/JobOrchestration/JobForm.vue'
import hs, { OrchestrationSystem, Job } from '@hydroserver/client'
import { mdiChevronRight, mdiMagnify, mdiPencil, mdiDelete } from '@mdi/js'
import { useTableLogic } from '@/composables/useTableLogic'
import DeleteJobCard from './DeleteJobCard.vue'

const props = defineProps<{
  workspaceId: string
}>()

const openCreate = ref(false)
const search = ref()
// const orchestrationSystems = ref<OrchestrationSystem[]>([])
const selectedOrchestrationSystem = ref<OrchestrationSystem>()
const loading = ref(false)

const { item, items, openEdit, openDelete, openDialog, onUpdate, onDelete } =
  useTableLogic(
    async (wsId: string) =>
      await hs.jobs.listAllItems({
        workspace_id: [wsId],
        expand_related: true,
        order_by: ['name'],
      }),
    hs.jobs.delete,
    Job,
    toRef(props, 'workspaceId')
  )

// const fetchOrchestrationData = async (newId: string) => {
//   loading.value = true
//   try {
//     const [orchestrationSystemResponse, jobRes] = await Promise.all([
//       hs.orchestrationSystems.listAllItems(),
//       hs.jobs.listAllItems({ expand_related: true }),
//     ])
//     // TODO: Allow HydroShare as an option once we have archival functionality in the orchestration system
//     orchestrationSystems.value = orchestrationSystemResponse.filter(
//       (os: OrchestrationSystem) =>
//         (os.workspaceId === newId || !os.workspaceId) &&
//         os.type !== 'HydroShare'
//     )
//     jobs.value = jobRes.filter((d: Job) => d.workspace.id === newId)
//   } catch (error) {
//     console.error('Error fetching orchestration data', error)
//   } finally {
//     loading.value = false
//   }
// }

const refreshTable = async () => {
  items.value = await hs.jobs.listAllItems({
    workspace_id: [props.workspaceId],
    expand_related: true,
    order_by: ['name'],
  })
  // await fetchOrchestrationData(props.workspaceId)
}

// watch(
//   () => props.workspaceId,
//   async (newId) => {
//     if (newId == null) return
//     await fetchOrchestrationData(newId)
//   },
//   { immediate: true }
// )

// const onDelete = async () => {
//   try {
//     await hs.jobs.delete(job.value.id)
//     await router.push({ name: 'Orchestration' })
//     Snackbar.success('Job deleted.')
//   } catch (error: any) {
//     Snackbar.error(error.message)
//     console.error('Error deleting task', error)
//   }
// }

// const tableData = computed(() => {
//   const dsList = jobs.value.map((d) => ({
//     ...d,
//     statusName: getStatusText(d.status),
//     lastRun: d.status.lastRun ? formatTime(d.status.lastRun) : '',
//     nextRun: d.status.nextRun ? formatTime(d.status.nextRun) : '',
//     orchestrationSystemName: d.orchestrationSystem.name,
//     isPlaceholder: false,
//   }))
//   const existingNames = new Set(dsList.map((ds) => ds.orchestrationSystemName))
//   const placeholders = orchestrationSystems.value
//     // .filter((os) => !existingNames.has(os.name))
//     .map((os) => ({
//       id: `placeholder-${os.id}`,
//       name: '',
//       statusName: 'Unknown' as StatusType,
//       status: {} as Status,
//       orchestrationSystemName: os.name,
//       orchestrationSystem: JSON.parse(JSON.stringify(os)),
//       isPlaceholder: true,
//     }))
//   const combined = [...dsList, ...placeholders]
//   return combined.sort((a, b) => {
//     if (a.orchestrationSystemName === b.orchestrationSystemName) {
//       return a.name.localeCompare(b.name)
//     }
//     return a.orchestrationSystemName.localeCompare(b.orchestrationSystemName)
//   })
// })

// async function togglePaused(ds: any) {
//   ds.status.paused = !ds.status.paused
//   await hs.jobs.updatePartial({
//     status: ds.status,
//     id: ds.id,
//   } as Job)
// }

// function statusesOf(rows: any[]): Status[] {
//   return rows
//     .filter((r) => !r.isPlaceholder)
//     .map((r) => (r.status ?? r.raw?.status) as Status)
//     .filter(Boolean)
// }

const openCreateDialog = (selectedItem: any) => {
  selectedOrchestrationSystem.value = selectedItem
  openCreate.value = true
}

const openDeleteDialog = (selectedItem: any) => {
  selectedOrchestrationSystem.value = selectedItem
  openDelete.value = true
}

// const onRowClick = async (event: Event, item: any) => {
//   if (item.item.isPlaceholder) return
//   await router.push({ name: 'Job', params: { id: item.item.id } })
// }

const headers = [
  {
    title: 'Template name',
    key: 'name',
  },
  // {
  //   title: 'Workspace',
  //   key: 'workspace.name',
  // },
  {
    title: 'Extractor',
    key: 'extractor.type',
  },
  {
    title: 'Transformer',
    key: 'transformer.type',
  },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
  // {
  //   title: 'Last run',
  //   key: 'lastRun',
  // },
  // {
  //   title: 'Next run',
  //   key: 'nextRun',
  // },
  // {
  //   title: 'Pause',
  //   key: 'actions',
  //   align: 'end',
  // },
] as const
</script>
