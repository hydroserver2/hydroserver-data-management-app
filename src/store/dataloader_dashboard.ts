import { ENDPOINTS } from '@/constants'
import { defineStore } from 'pinia'
import { api } from '@/utils/api/apiMethods'

interface DataLoader {
  id: string
  name: string
}

interface DataLoaders {
  [key: string]: DataLoader
}

interface DataLoaderDashboard {
  dataLoaders: DataLoaders
}

export const useDataLoaderDashboardStore = defineStore(
  'data-loader-dashboard-store',
  {
    state: (): DataLoaderDashboard => ({
      dataLoaders: {},
    }),
    getters: {
      dataLoaderRows(state) {
        return Object.values(state.dataLoaders).map((dataLoader) => {
          return dataLoader
        })
      },
    },
    actions: {
      async fetchDataLoaders() {
        const dataLoaders = await api.fetch(ENDPOINTS.DATA_LOADERS)
        this.dataLoaders = dataLoaders.reduce(
          (dataLoaders: any, dataLoader: any) => {
            dataLoaders[dataLoader['id']] = {
              id: dataLoader['id'],
              name: dataLoader['name'],
            }
            return dataLoaders
          },
          {}
        )
      },
      async deleteDataLoader(dataLoaderId: string) {
        await api.delete(ENDPOINTS.DATA_LOADERS.ID(dataLoaderId))
      },
    },
  }
)
