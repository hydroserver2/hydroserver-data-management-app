import { defineStore } from 'pinia'
import { DataLoader } from '@/types'
import { api } from '@/utils/api/apiMethods'
import { ENDPOINTS } from '@/constants'

export const useDataLoaderStore = defineStore('dataLoaders', {
  state: () => ({
    dataLoaders: [] as DataLoader[],
    loaded: false
  }),
  actions: {
    sortDataLoaders() {
      this.dataLoaders.sort((a, b) => a.name.localeCompare(b.name))
    },
    async fetchDataLoaders(reload = false) {
      if (this.loaded && !reload) return
      this.loaded = false
      try {
        this.dataLoaders = await api.fetch(ENDPOINTS.DATA_LOADERS)
        this.loaded = true
      } catch (error) {
        console.error('Error fetching data loaders from DB', error)
      }
    },
    async updateDataLoader(dataLoader: DataLoader) {
      try {
        await api.patch(
          ENDPOINTS.DATA_LOADERS.ID(dataLoader.id),
          dataLoader,
          this.getById(dataLoader.id)
        )
        const index = this.dataLoaders.findIndex(
          (dl) => dl.id === dataLoader.id
        )
        if (index !== -1) this.dataLoaders[index] = dataLoader
        this.sortDataLoaders()
      } catch (error) {
        console.error(`Error updating data loader with id`, error)
      }
    },
    async createDataLoader(dataLoader: DataLoader) {
      try {
        const data = await api.post(
          ENDPOINTS.DATA_LOADERS,
          dataLoader
        )
        this.dataLoaders.push(data)
        this.sortDataLoaders()
        return data
      } catch (error) {
        console.error('Error creating data loader', error)
      }
    },
    async deleteDataLoader(id: string) {
      try {
        await api.delete(ENDPOINTS.DATA_LOADERS.ID(id))
        this.dataLoaders = this.dataLoaders.filter(
          (dl) => dl.id !== id
        )
        this.sortDataLoaders()
      } catch (error) {
        console.error('Error deleting data loader', error)
      }
    },
    getById(id: string) {
      const dataLoader = this.dataLoaders.find(
        (dl) => dl.id.toString() === id.toString()
      )
      if (!dataLoader)
        throw new Error(`Data Loader with id ${id} not found`)
      return dataLoader
    },
  }
})