import { useDataLoaderStore } from '@/store/dataLoaders'
import {computed, onMounted, ref} from 'vue'
import { DataLoader } from '@/types'

export function useDataLoaders() {
  const dataLoaderStore = useDataLoaderStore()

  const selectedDataLoader = ref(null)
  const dataLoadersLoaded = computed(() => dataLoaderStore.loaded)
  const updatingDataLoader = ref(false)

  const dataLoaders = computed(() => {
    if (!dataLoaderStore.loaded) return []
    return dataLoaderStore.dataLoaders
  })

  async function reloadDataLoaders() {
    await dataLoaderStore.fetchDataLoaders(true)
  }

  async function deleteDataLoader() {
    let dataLoaderId = selectedDataLoader.value
    if (dataLoaderId) {
      updatingDataLoader.value = true
      await dataLoaderStore.deleteDataLoader(dataLoaderId)
      updatingDataLoader.value = false
    }
  }

  onMounted(async () => {
    await dataLoaderStore.fetchDataLoaders(true)
  })

  return {
    selectedDataLoader,
    updatingDataLoader,
    reloadDataLoaders,
    dataLoadersLoaded,
    dataLoaders,
    deleteDataLoader
  }
}
