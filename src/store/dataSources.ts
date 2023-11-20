import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DataSource } from '@/types'
import { api } from '@/services/api'

export const useDataSourceStore = defineStore('dataSources', () => {
  const dataSources = ref<DataSource[]>([])
  const loaded = ref(false)

  const sortDataSources = () => {
    dataSources.value.sort((a, b) => a.name.localeCompare(b.name))
  }

  const fetchDataSources = async (reload = false) => {
    try {
      dataSources.value = await api.fetchDataSources()
      sortDataSources()
      loaded.value = true
    } catch (error) {
      console.error('Error fetching data sources from DB', error)
    }
  }

  const updateDataSource = async (dataSource: DataSource) => {
    try {
      await api.updateDataSource(dataSource)
      const index = dataSources.value.findIndex((ds) => ds.id === dataSource.id)
      if (index !== -1) dataSources.value[index] = dataSource
      sortDataSources()
    } catch (error) {
      console.error(`Error updating data source with id`, error)
    }
  }

  const createDataSource = async (dataSource: DataSource) => {
    try {
      const data = await api.createDataSource(dataSource)
      dataSources.value.push(data)
      sortDataSources()
      return data
    } catch (error) {
      console.error('Error creating data source', error)
    }
  }

  const deleteDataSource = async (id: string) => {
    try {
      await api.deleteDataSource(id)
      dataSources.value = dataSources.value.filter((ds) => ds.id !== id)
      sortDataSources()
    } catch (error) {
      console.error('Error deleting data source', error)
    }
  }

  const getById = (dataSourceId: string) => {
    const dataSource = dataSources.value.find(
      (ds) => ds.id.toString() === dataSourceId.toString()
    )
    if (!dataSource)
      throw new Error(`Data Source with id ${dataSourceId} not found`)
    return dataSource
  }

  return {
    dataSources,
    loaded,
    sortDataSources,
    fetchDataSources,
    updateDataSource,
    createDataSource,
    deleteDataSource,
    getById,
  }
})
