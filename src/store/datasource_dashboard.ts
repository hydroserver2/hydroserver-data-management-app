import { ENDPOINTS } from '@/constants'
import { defineStore } from 'pinia'
import { api } from '@/utils/api/apiMethods'

interface DataSource {
  id: string
  name: string
  location: string
  status: string
  statusTip: string
  paused: boolean
  dataSourceThru: string
  databaseThru: string
  lastSyncSuccessful: boolean
  lastSynced: string
  nextSync: string
}

interface DataLoader {
  id: string
  name: string
}

interface DataSources {
  [key: string]: DataSource
}

interface DataLoaders {
  [key: string]: DataLoader
}

interface DataSourceDashboard {
  dataSources: DataSources,
  dataLoaders: DataLoaders
}

export const useDataSourceDashboardStore = defineStore(
  'data-source-dashboard-store',
  {
    state: (): DataSourceDashboard => ({
      dataSources: {},
      dataLoaders: {}
    }),
    getters: {
      dataSourceRows(state) {
        return Object.values(state.dataSources).map((dataSource) => {
          return dataSource
        })
      },
    },
    actions: {
      async fetchDataSources() {
        const dataStreams = await api.fetch(ENDPOINTS.DATA_SOURCES)
        this.dataSources = dataStreams.reduce(
          (dataSources: any, dataSource: any) => {
            let status
            let statusTip = null
            let now = new Date()
            let dataSourceThru = dataSource['dataSourceThru']
              ? new Date(Date.parse(dataSource['dataSourceThru']))
              : null
            let lastSynced = dataSource['lastSynced']
              ? new Date(Date.parse(dataSource['lastSynced']))
              : null
            let nextSync = dataSource['nextSync']
              ? new Date(Date.parse(dataSource['nextSync']))
              : null

            if (lastSynced == null) {
              status = 'pending'
            } else if (
              dataSource['lastSyncSuccessful'] === true &&
              nextSync &&
              nextSync >= now
            ) {
              status = 'ok'
            } else if (dataSourceThru == null) {
              status = 'bad'
              statusTip =
                'Some datastreams from this data source may not be synced with HydroServer.'
            } else if (dataSource['lastSyncSuccessful'] === false) {
              status = 'bad'
              statusTip = 'Last data loading job failed.'
            } else if (nextSync && nextSync < now) {
              status = 'stale'
            } else {
              status = 'bad'
            }

            console.log(this.dataLoaders)

            dataSources[dataSource['id']] = {
              id: dataSource['id'],
              name: dataSource['name'],
              dataLoader: this.dataLoaders[dataSource['dataLoaderId']]['name'],
              location: dataSource['path'],
              status: status,
              statusTip: statusTip,
              paused: dataSource['paused'],
              dataSourceThru: dataSourceThru
                ? dataSourceThru.toUTCString()
                : null,
              lastSyncSuccessful: dataSource['lastSyncSuccessful'],
              lastSynced: lastSynced ? lastSynced.toUTCString() : null,
              nextSync: nextSync ? nextSync.toUTCString() : null,
            }
            return dataSources
          },
          {}
        )
      },
      async updateDataSourceStatus(dataSourceId: string, paused: boolean) {
        const body = { paused: !paused }
        await api.patch(ENDPOINTS.DATA_SOURCES.ID(dataSourceId), body)
      },
      async deleteDataSource(dataSourceId: string) {
        await api.delete(ENDPOINTS.DATA_SOURCES.ID(dataSourceId))
      },
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
    },
  }
)
