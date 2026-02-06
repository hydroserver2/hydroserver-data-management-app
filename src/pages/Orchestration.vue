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
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import OrchestrationTable from '@/components/Orchestration/OrchestrationTable.vue'
import { useWorkspaceStore } from '@/store/workspaces'
import { storeToRefs } from 'pinia'
import hs from '@hydroserver/client'
import WorkspaceToolbar from '@/components/Workspace/WorkspaceToolbar.vue'
import DataConnectionTable from '@/components/Orchestration/DataConnectionTable.vue'
import { useDataConnectionStore } from '@/store/dataConnection'
import { mdiChevronRight } from '@mdi/js'

const { selectedWorkspace } = storeToRefs(useWorkspaceStore())
const { setWorkspaces } = useWorkspaceStore()

const { openDataConnectionTableDialog } = storeToRefs(useDataConnectionStore())

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
