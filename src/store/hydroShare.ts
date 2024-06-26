import { defineStore } from 'pinia'
import { ref } from 'vue'
import { PostHydroShareArchive } from '@/types'

export const useHydroShareStore = defineStore('hydroShare', () => {
  const hydroShareArchive = ref<PostHydroShareArchive | null>()
  const loading = ref(false)

  return {
    hydroShareArchive,
    loading,
  }
})
