import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DataLoader } from '@/types'
import { api } from '@/services/api'

export const useDataLoaderStore = defineStore('dataLoaders', () => {
  const dataLoaders = ref<DataLoader[]>([])
  const loaded = ref(false)

  const sortDataLoaders = () => {
    dataLoaders.value.sort((a, b) => a.name.localeCompare(b.name))
  }

  const fetchDataLoaders = async (reload = false) => {
    loaded.value = false
    try {
      dataLoaders.value = await api.fetchDataLoaders()
      sortDataLoaders()
      loaded.value = true
    } catch (error) {
      console.error('Error fetching data loaders from DB', error)
    }
  }

  const updateDataLoader = async (dataLoader: DataLoader) => {
    try {
      await api.updateDataLoader(dataLoader.id, dataLoader)
      const index = dataLoaders.value.findIndex((dl) => dl.id === dataLoader.id)
      if (index !== -1) dataLoaders.value[index] = dataLoader
      sortDataLoaders()
    } catch (error) {
      console.error(`Error updating data loader with id`, error)
    }
  }

  const createDataLoader = async (dataLoader: DataLoader) => {
    try {
      const data = await api.createDataLoader(dataLoader)
      dataLoaders.value.push(data)
      sortDataLoaders()
      return data
    } catch (error) {
      console.error('Error creating data loader', error)
    }
  }

  const deleteDataLoader = async (id: string) => {
    try {
      await api.deleteDataLoader(id)
      dataLoaders.value = dataLoaders.value.filter((dl) => dl.id !== id)
    } catch (error) {
      console.error('Error deleting data loader', error)
    }
  }

  const getById = (id: string) => {
    const dataLoader = dataLoaders.value.find(
      (dl) => dl.id.toString() === id.toString()
    )
    if (!dataLoader) throw new Error(`Data Loader with id ${id} not found`)
    return dataLoader
  }

  return {
    dataLoaders,
    loaded,
    sortDataLoaders,
    fetchDataLoaders,
    updateDataLoader,
    createDataLoader,
    deleteDataLoader,
    getById,
  }
})
