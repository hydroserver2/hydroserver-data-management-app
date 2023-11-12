import { defineStore } from 'pinia'
import { DataSource } from '@/types'
import { api } from '@/services/apiMethods'
import { ENDPOINTS } from '@/constants'

export const useDataSourceStore = defineStore('dataSources', {
  state: () => ({
    dataSources: [] as DataSource[],
    loaded: false,
  }),
  actions: {
    sortDataSources() {
      this.dataSources.sort((a, b) => a.name.localeCompare(b.name))
    },
    async fetchDataSources(reload = false) {
      if (this.loaded && !reload) return
      try {
        this.dataSources = await api.fetch(ENDPOINTS.DATA_SOURCES)
        this.loaded = true
      } catch (error) {
        console.error('Error fetching data sources from DB', error)
      }
    },
    async updateDataSource(dataSource: DataSource) {
      try {
        await api.patch(
          ENDPOINTS.DATA_SOURCES.ID(dataSource.id),
          dataSource,
          this.dataSources.find(
            (ds) => ds.id.toString() === dataSource.id.toString()
          )
        )
        const index = this.dataSources.findIndex(
          (ds) => ds.id === dataSource.id
        )
        if (index !== -1) this.dataSources[index] = dataSource
        this.sortDataSources()
      } catch (error) {
        console.error(`Error updating data source with id`, error)
      }
    },
    async createDataSource(dataSource: DataSource) {
      try {
        const data = await api.post(ENDPOINTS.DATA_SOURCES, dataSource)
        this.dataSources.push(data)
        this.sortDataSources()
        return data
      } catch (error) {
        console.error('Error creating data source', error)
      }
    },
    async deleteDataSource(id: string) {
      try {
        await api.delete(ENDPOINTS.DATA_SOURCES.ID(id))
        this.dataSources = this.dataSources.filter((ds) => ds.id !== id)
        this.sortDataSources()
      } catch (error) {
        console.error('Error deleting data source', error)
      }
    },
    getById(dataSourceId: string) {
      const dataSource = this.dataSources.find(
        (ds) => ds.id.toString() === dataSourceId.toString()
      )
      if (!dataSource)
        throw new Error(`Data Source with id ${dataSourceId} not found`)
      return dataSource
    },
  },
})
