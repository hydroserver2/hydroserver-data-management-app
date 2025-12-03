<template>
  <v-card rounded="0">
    <v-toolbar flat color="secondary">
      <v-text-field
        :disabled="!workspaceTasks?.length"
        class="mx-2"
        clearable
        v-model="search"
        :prepend-inner-icon="mdiMagnify"
        label="Search"
        hide-details
        density="compact"
        variant="underlined"
      />
      <v-spacer />
      <v-btn-add class="mx-4" @click="openCreate = true" color="white">
        Add new task
      </v-btn-add>
    </v-toolbar>

    <v-data-table-virtual
      :headers="taskHeaders"
      :items="filteredTasks"
      :sort-by="sortBy"
      :search="search"
      :style="{ 'max-height': '100vh' }"
      :virtual-scroll-props="{ itemHeight: 0, bench: 12 }"
    >
      <template #item.overview="{ item }">
        <Swimlanes
          :task="item"
          @edit="openDialog($event, 'edit')"
          @delete="openDialog($event, 'delete')"
        />
      </template>
    </v-data-table-virtual>
  </v-card>

  <v-dialog v-model="openCreate" width="95rem">
    <TaskForm @close="openCreate = false" :old-task-index="-1" />
  </v-dialog>

  <v-dialog v-model="openEdit" width="95rem">
    <TaskForm
      :oldTask="selectedTask"
      :old-task-index="
        workspaceTasks.findIndex(
          (p) => JSON.stringify(p) === JSON.stringify(selectedTask)
        )
      "
      @close="openEdit = false"
    />
  </v-dialog>

  <v-dialog v-model="openDelete" width="40rem">
    <DeleteTaskCard
      v-if="selectedTask"
      :task="selectedTask"
      :task-index="
        workspaceTasks.findIndex(
          (p) => JSON.stringify(p) === JSON.stringify(selectedTask)
        )
      "
      @close="openDelete = false"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import TaskForm from '@/components/Job/Task/TaskForm.vue'
import DeleteTaskCard from './DeleteTaskCard.vue'
import Swimlanes from './Swimlanes.vue'
import hs, { Job, Task } from '@hydroserver/client'
import { mdiMagnify } from '@mdi/js'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/store/workspaces'
import { useTableLogic } from '@/composables/useTableLogic'

const { selectedWorkspace } = storeToRefs(useWorkspaceStore())
const selectedWorkspaceId = computed(() => selectedWorkspace.value?.id)

const openCreate = ref(false)
const search = ref()
const sortBy = [{ key: 'name' as const }]

const {
  item: selectedTask,
  items: workspaceTasks,
  openEdit,
  openDelete,
  onUpdate,
  onDelete,
} = useTableLogic(
  async (wsId: string) =>
    await hs.tasks.listAllItems({
      workspace_id: [wsId],
      order_by: ['name'],
    }),
  hs.tasks.delete,
  Task,
  selectedWorkspaceId
)

const filteredTasks = computed(() =>
  workspaceTasks.value.map((t) => {
    const mapped = {
      ...t,
      searchText: '',
    }

    const sourceIds = (t.mappings ?? []).map((m) =>
      String(m.sourceIdentifier ?? '')
    )

    const targetIds = (t.mappings ?? []).flatMap((m) =>
      (m.paths ?? []).map((path) => String(path.targetIdentifier ?? ''))
    )

    // const targetNames = targetIds.map((tid) => {
    //   const ds = (linkedDatastreams.value ?? []).find(
    //     (d) => String(d.id) === tid
    //   )
    //   return ds?.name ?? ''
    // })

    mapped.searchText = [
      mapped.name,
      ...sourceIds,
      ...targetIds,
      // ...targetNames,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return mapped
  })
)

const taskHeaders = [
  {
    title: 'Source → Data transformations → Target',
    key: 'overview',
    value: 'searchText',
    sortable: false,
  },
] as const

function openDialog(selectedItem: Task, dialog: 'edit' | 'delete') {
  selectedTask.value = new Task(selectedItem)
  if (dialog === 'edit') openEdit.value = true
  else openDelete.value = true
}
</script>
