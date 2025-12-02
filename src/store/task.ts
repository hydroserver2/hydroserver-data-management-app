import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Task } from '@hydroserver/client'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([])

  // Remove MappingPath if datastream id is targetId. Remove mappings that now have no paths.
  function removeTargetFromTask(task: Task, id: string | number): void {
    const key = String(id)
    for (const m of task.mappings) {
      m.paths = m.paths.filter((p) => String(p.targetIdentifier) !== key)
    }
    task.mappings = task.mappings.filter((m) => m.paths.length > 0)
  }

  return {
    tasks,
    removeTargetFromTask,
  }
})
