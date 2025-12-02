<template>
  <v-card>
    <v-toolbar flat color="secondary">
      <v-text-field
        :disabled="!tasks?.length"
        class="mx-2"
        clearable
        v-model="search"
        :prepend-inner-icon="mdiMagnify"
        label="Search"
        hide-details
        density="compact"
        variant="underlined"
        rounded="xl"
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
      density="compact"
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
        tasks.findIndex(
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
        tasks.findIndex(
          (p) => JSON.stringify(p) === JSON.stringify(selectedTask)
        )
      "
      @close="openDelete = false"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import TaskForm from '@/components/Job/Task/TaskForm.vue'
import DeleteTaskCard from './DeleteTaskCard.vue'
import Swimlanes from './Swimlanes.vue'
import hs, { Task } from '@hydroserver/client'
import { mdiMagnify } from '@mdi/js'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/store/workspaces'
import { useTaskStore } from '@/store/task'

const { selectedWorkspace } = storeToRefs(useWorkspaceStore())
const { tasks } = storeToRefs(useTaskStore())

const selectedTask = ref<Task>()

const openCreate = ref(false)
const openEdit = ref(false)
const openDelete = ref(false)
const search = ref()
const sortBy = [{ key: 'name' as const }]

const filteredTasks = computed(() =>
  tasks.value.map((t) => {
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

onMounted(async () => {
  if (selectedWorkspace.value?.id) {
    tasks.value = await hs.tasks.listAllItems({
      workspace_id: [selectedWorkspace.value.id],
    })
  }
})
</script>
