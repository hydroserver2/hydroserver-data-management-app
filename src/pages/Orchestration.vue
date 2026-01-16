<template>
  <div class="my-4 mx-6">
    <v-row class="my-2">
      <v-col cols="12">
        <h5 class="text-h5">Job orchestration</h5>
        <v-row>
          <v-col>
            <WorkspaceToolbar />
          </v-col>
        </v-row>

        <template v-if="!!selectedWorkspace && openDataConnectionTableDialog">
          <DataConnectionTable :workspace-id="selectedWorkspace.id" />
        </template>
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
