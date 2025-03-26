import { DataSource } from '@/models'
import { defineStore } from 'pinia'
import { ref } from 'vue'

// For having one source of truth on the DataSourceDetails page
export const useDataSourceStore = defineStore('dataSource', () => {
  const dataSource = ref(new DataSource())

  return { dataSource }
})
