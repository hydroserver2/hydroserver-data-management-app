<template>
  <div class="my-4 mx-4">
    <v-row class="my-2">
      <v-col cols="12">
        <h5 class="text-h5">Job orchestration</h5>
        <WorkspaceToolbar />
      </v-col>
    </v-row>
  </div>

  <v-tabs v-model="tab">
    <v-tab v-for="item in tabs" :key="item.value" :value="item.value">
      {{ item.label }}
    </v-tab>
  </v-tabs>

  <v-window v-model="tab" class="mt-4">
    <v-window-item value="jobs">
      <template v-if="!!selectedWorkspace">
        <JobTable :workspace-id="selectedWorkspace.id" />
      </template>
    </v-window-item>

    <v-window-item value="tasks">
      <div class="pa-4">
        <TaskTable />
      </div>
    </v-window-item>

    <v-window-item value="runs">
      <div class="pa-4">Task runs coming soon.</div>
    </v-window-item>
  </v-window>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import hs from '@hydroserver/client'
import JobTable from '@/components/Job/JobTable.vue'
import WorkspaceToolbar from '@/components/Workspace/WorkspaceToolbar.vue'
import { useWorkspaceStore } from '@/store/workspaces'
import TaskTable from '@/components/Job/Task/TaskTable.vue'

const tabs = [
  { value: 'jobs', label: 'Job configurations' },
  { value: 'tasks', label: 'Task configurations' },
  { value: 'runs', label: 'Task runs' },
] as const

const tab = ref<(typeof tabs)[number]['value']>('jobs')
const { selectedWorkspace } = storeToRefs(useWorkspaceStore())
const { setWorkspaces } = useWorkspaceStore()

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
