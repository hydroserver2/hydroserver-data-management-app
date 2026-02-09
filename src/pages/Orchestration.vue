<template>
  <div class="my-4 mx-6">
    <v-row class="my-1">
      <v-col cols="12">
        <WorkspaceToolbar layout="orchestration" title="Job Orchestration">
          <template #actions>
            <v-btn
              :append-icon="mdiChevronRight"
              color="blue-grey-darken-4"
              :to="{ name: 'HydroLoader' }"
              density="comfortable"
              variant="tonal"
            >
              Download Streaming Data Loader
            </v-btn>
          </template>
        </WorkspaceToolbar>

        <v-expand-transition>
          <div v-if="!!selectedWorkspace && openDataConnectionTableDialog">
            <DataConnectionTable :workspace-id="selectedWorkspace.id" />
          </div>
        </v-expand-transition>
      </v-col>
    </v-row>

    <template v-if="!!selectedWorkspace">
      <OrchestrationTable :workspace-id="selectedWorkspace.id" />
    </template>
  </div>

  <!-- Fullscreen slide-over task details. Kept under the Orchestration route so page state persists. -->
  <v-dialog
    v-model="detailsOpen"
    fullscreen
    :scrim="false"
    transition="scroll-x-reverse-transition"
    class="task-details-overlay"
  >
    <v-card class="rounded-0 h-full">
      <div class="h-full overflow-y-auto">
        <TaskDetails
          v-if="selectedTaskId"
          :task-id="selectedTaskId"
          :run-id="selectedRunId"
          embedded
          @close="closeDetails"
        />
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import OrchestrationTable from '@/components/Orchestration/OrchestrationTable.vue'
import TaskDetails from '@/pages/TaskDetails.vue'
import { useWorkspaceStore } from '@/store/workspaces'
import { storeToRefs } from 'pinia'
import hs from '@hydroserver/client'
import WorkspaceToolbar from '@/components/Workspace/WorkspaceToolbar.vue'
import DataConnectionTable from '@/components/Orchestration/DataConnectionTable.vue'
import { useDataConnectionStore } from '@/store/dataConnection'
import { mdiChevronRight } from '@mdi/js'
import { useRoute } from 'vue-router'
import router from '@/router/router'

const { selectedWorkspace } = storeToRefs(useWorkspaceStore())
const { setWorkspaces } = useWorkspaceStore()

const { openDataConnectionTableDialog } = storeToRefs(useDataConnectionStore())

const route = useRoute()

const selectedTaskId = computed(() => {
  const value = route.query.taskId
  return typeof value === 'string' && value.trim() ? value : null
})

const selectedRunId = computed(() => {
  const value = route.query.runId
  return typeof value === 'string' && value.trim() ? value : null
})

const detailsOpen = computed({
  get: () => !!selectedTaskId.value,
  set: (open) => {
    if (open) return
    closeDetails()
  },
})

const closeDetails = () => {
  // Prefer going "back" when the user opened the drawer from within the app.
  const back = (router.options.history.state as any)?.back
  if (typeof back === 'string' && back.includes('/orchestration')) {
    router.back()
    return
  }

  // If the user landed directly on a deep link, don't navigate them out of the app.
  const nextQuery = { ...route.query, taskId: undefined, runId: undefined }
  router.replace({ name: 'Orchestration', query: nextQuery })
}

onMounted(async () => {
  try {
    const workspacesResponse = await hs.workspaces.listAllItems({
      is_associated: true,
    })
    setWorkspaces(workspacesResponse)
  } catch (error) {
    console.error('Error fetching workspaces', error)
  }
})
</script>
