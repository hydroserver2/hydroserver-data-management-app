import { ENDPOINTS } from '@/constants'
import { defineStore } from 'pinia'

interface DataLoader {
  id: string
  name: string
  last_communication: string
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
        const dataLoaders = await this.$http.get(ENDPOINTS.DATA_LOADERS)
        this.dataLoaders = dataLoaders.data.reduce(
          (dataLoaders: any, dataLoader: any) => {
            dataLoaders[dataLoader['id']] = {
              id: dataLoader['id'],
              name: dataLoader['name'],
              last_communication: dataLoader['last_communication'],
            }
            return dataLoaders
          },
          {}
        )
      },
      async deleteDataLoader(dataLoaderId: string) {
        await this.$http.delete(ENDPOINTS.DATA_LOADERS.ID(dataLoaderId))
      },
    },
  }
)
