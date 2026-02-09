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

  <!-- Slide-over task details. Kept under the Orchestration route so page state persists.
       Implemented without v-dialog so the global Navbar remains visible. -->
  <transition
    name="taskdetails-slide"
    appear
    @after-leave="afterDetailsLeave"
  >
    <div
      v-if="overlayOpen"
      ref="overlayRef"
      class="taskdetails-overlay"
      tabindex="-1"
      @keydown.esc.prevent="closeDetails"
    >
      <div class="taskdetails-scrim" @click="closeDetails" />
      <div class="taskdetails-panel" role="dialog" aria-modal="true">
        <div class="taskdetails-panel-inner">
          <TaskDetails
            v-if="selectedTaskId"
            :task-id="selectedTaskId"
            :run-id="selectedRunId"
            embedded
            @close="closeDetails"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
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

// Local visibility state so we can animate out before mutating the URL.
const overlayOpen = ref<boolean>(!!selectedTaskId.value)
type CloseMode = 'back' | 'replace' | null
const pendingCloseMode = ref<CloseMode>(null)

const overlayRef = ref<HTMLElement | null>(null)
watch(
  overlayOpen,
  async (open) => {
    if (!open) return
    await nextTick()
    overlayRef.value?.focus()
  },
  { immediate: false }
)

const closeDetails = () => {
  const back = (router.options.history.state as any)?.back
  // Prefer going "back" when the user opened the drawer from within the app.
  if (typeof back === 'string' && back.includes('/orchestration')) {
    pendingCloseMode.value = 'back'
  } else {
    pendingCloseMode.value = 'replace'
  }
  overlayOpen.value = false
}

watch(
  selectedTaskId,
  (value) => {
    // Opening: query param set -> show overlay.
    if (value) {
      overlayOpen.value = true
      return
    }
    // Closing via browser back/forward or manual URL edit -> animate out.
    overlayOpen.value = false
  },
  { immediate: true }
)

const afterDetailsLeave = () => {
  const mode = pendingCloseMode.value
  pendingCloseMode.value = null

  // If the URL is already cleared (e.g., user used the browser back button), do nothing.
  if (!selectedTaskId.value) return

  if (mode === 'back') {
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

<style scoped>
.taskdetails-overlay {
  /* Keep the app navigation visible by starting below the Vuetify app-bar layout offset. */
  position: fixed;
  top: var(--v-layout-top, 0px);
  left: var(--v-layout-left, 0px);
  right: var(--v-layout-right, 0px);
  bottom: 0;
  z-index: 1500;
  display: flex;
  justify-content: flex-end;
  overflow: hidden;
  outline: none;
}

.taskdetails-scrim {
  display: none;
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(2px);
}

.taskdetails-panel {
  position: relative;
  height: 100%;
  width: 100%;
  background: #ffffff;
  border-left: 1px solid #e2e8f0;
  box-shadow: -12px 0 32px rgba(2, 6, 23, 0.18);
}

.taskdetails-panel-inner {
  height: 100%;
  overflow: hidden;
}

.taskdetails-slide-enter-active,
.taskdetails-slide-leave-active {
  /* Keep the overlay fixed; animate the panel itself for a true slide-in-from-right feel. */
}

.taskdetails-slide-enter-active .taskdetails-panel,
.taskdetails-slide-leave-active .taskdetails-panel {
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.taskdetails-slide-enter-from .taskdetails-panel,
.taskdetails-slide-leave-to .taskdetails-panel {
  transform: translateX(100%);
}

@media (prefers-reduced-motion: reduce) {
  .taskdetails-slide-enter-active .taskdetails-panel,
  .taskdetails-slide-leave-active .taskdetails-panel {
    transition: none;
  }
}
</style>
