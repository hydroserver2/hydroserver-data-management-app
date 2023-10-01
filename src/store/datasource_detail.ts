import { ENDPOINTS } from '@/constants'
import { defineStore } from 'pinia'
import { api } from '@/utils/api/apiMethods'

interface DataSourceDetail {
  id?: string
  name?: string
  status?: string
  paused?: string
  dataLoaderId?: string
  filePath?: string
  headerRow?: number
  dataStartRow?: number
  scheduleStartTime?: string
  scheduleEndTime?: string
  scheduleValue?: string
  timestampFormat?: string
  timestampColumn?: string | number
  timezoneOffset?: string
  lastSyncSuccessful?: boolean
  lastSyncMessage?: string
  lastSynced?: string
  nextSync?: string
  dataSourceThru?: string
}

export const useDataSourceDetailStore = defineStore(
  'data-source-detail-store',
  {
    state: (): DataSourceDetail => ({}),
    actions: {
      async fetchDataSource() {
        // TODO: Are we sure this id will always be defined?
        let dataSource = await api.fetch(ENDPOINTS.DATA_SOURCES.ID(this.id!))

        let now = new Date()
        let scheduleStartTime = dataSource.startTime
          ? new Date(Date.parse(dataSource.startTime))
          : null
        let scheduleEndTime = dataSource.endTime
          ? new Date(Date.parse(dataSource.endTime))
          : null
        let dataSourceThru = dataSource.dataSourceThru
          ? new Date(Date.parse(dataSource.dataSourceThru))
          : null
        let lastSynced = dataSource.lastSynced
          ? new Date(Date.parse(dataSource.lastSynced))
          : null
        let nextSync = dataSource.nextSync
          ? new Date(Date.parse(dataSource.nextSync))
          : null

        this.name = dataSource.name
        this.dataLoaderId = dataSource.dataLoaderId
        this.filePath = dataSource.path
        this.headerRow = dataSource.headerRow
        this.dataStartRow = dataSource.dataStartRow

        this.scheduleStartTime = scheduleStartTime
          ? scheduleStartTime.toUTCString()
          : undefined
        this.scheduleEndTime = scheduleEndTime
          ? scheduleEndTime.toUTCString()
          : undefined
        this.paused = dataSource.paused ? 'True' : 'False'

        if (dataSource.crontab) {
          this.scheduleValue = `Crontab: ${dataSource.crontab}`
        } else if (dataSource.intervalUnits) {
          this.scheduleValue = `Every ${dataSource.interval} ${dataSource.intervalUnits}`
        }

        this.timestampFormat =
          (dataSource.timestampFormat === 'iso'
            ? 'ISO'
            : dataSource.timestampFormat)
        this.timestampColumn = dataSource.timestampColumn
        this.timezoneOffset = dataSource.timestampOffset

        this.lastSyncSuccessful = dataSource.lastSyncSuccessful
        this.lastSyncMessage = dataSource.lastSyncMessage
        this.lastSynced = lastSynced ? lastSynced.toUTCString() : undefined
        this.nextSync = nextSync ? nextSync.toUTCString() : undefined
        this.dataSourceThru = dataSourceThru
          ? dataSourceThru.toUTCString()
          : undefined

        if (lastSynced == null) {
          this.status = 'Pending'
        } else if (
          dataSource['lastSyncSuccessful'] === true &&
          nextSync &&
          nextSync >= now
        ) {
          this.status = 'Up-To-Date'
        } else if (dataSourceThru == null) {
          this.status = 'Needs Attention'
        } else if (dataSource['lastSyncSuccessful'] === false) {
          this.status = 'Needs Attention'
        } else if (nextSync && nextSync < now) {
          this.status = 'Behind Schedule'
        } else {
          this.status = 'Needs Attention'
        }
      },
    },
  }
)
