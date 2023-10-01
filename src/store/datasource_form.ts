import { ENDPOINTS } from '@/constants'
import { defineStore } from 'pinia'
import { api } from '@/utils/api/apiMethods'

type scheduleTypeValues = 'interval' | 'crontab'
type intervalUnitsValues = 'minutes' | 'hours' | 'days'
type columnTypeValues = 'index' | 'name'
type timestampFormatValues = 'iso' | 'custom'

interface DataSourceForm {
  dataSourceId: string | null
  formReady: boolean
  dataLoaders: any[]
  dataSource?: any
  dataSourceName?: string
  dataLoader?: any
  localFilePath?: string
  fileDelimiter: string
  fileHeaderRow?: number
  dataStartRow: number
  scheduleStartTime?: string
  scheduleEndTime?: string
  scheduleType: scheduleTypeValues
  interval?: number
  intervalUnits: intervalUnitsValues
  crontab?: string
  timestampType: columnTypeValues
  timestampColumn?: string | number
  timestampFormat: timestampFormatValues
  timestampCustomFormat?: string
  timestampUseTimezoneOffset: boolean
  timestampTimezoneOffset?: string
}

export const useDataSourceFormStore = defineStore('data-source-form-store', {
  state: (): DataSourceForm => ({
    dataSourceId: null,
    formReady: false,
    dataLoaders: [],
    fileDelimiter: ',',
    dataStartRow: 1,
    scheduleType: 'interval',
    intervalUnits: 'minutes',
    timestampType: 'index',
    timestampFormat: 'iso',
    timestampUseTimezoneOffset: false,
  }),
  actions: {
    async fetchDataSource() {
      if (this.dataSourceId) {
        const dataSource = await api.fetch(
          ENDPOINTS.DATA_SOURCES.ID(this.dataSourceId)
        )
        this.dataSource = dataSource
      } else {
        this.dataSource = null
      }
    },
    async fetchDataLoaders() {
      const dataLoaders = await api.fetch(ENDPOINTS.DATA_LOADERS)
      this.dataLoaders = dataLoaders
    },
    async saveDataSource() {
      let dataSourceBody = {}

      dataSourceBody['name'] = this.dataSourceName
      dataSourceBody['dataLoaderId'] = this.dataLoader.id || this.dataLoader
      dataSourceBody['path'] = this.localFilePath
      dataSourceBody['headerRow'] = this.fileHeaderRow || null
      dataSourceBody['dataStartRow'] = this.dataStartRow || null
      dataSourceBody['delimiter'] = this.fileDelimiter || null
      dataSourceBody['startTime'] = this.scheduleStartTime || null
      dataSourceBody['endTime'] = this.scheduleEndTime || null
      dataSourceBody['crontab'] = this.scheduleType === 'crontab' ? this.crontab : null
      dataSourceBody['interval'] = this.scheduleType === 'interval' ? this.interval : null
      dataSourceBody['intervalUnits'] = this.scheduleType === 'interval' ? this.intervalUnits : null
      dataSourceBody['timestampColumn'] = this.timestampColumn || null
      dataSourceBody['timestampFormat'] = this.timestampCustomFormat || 'iso'
      dataSourceBody['timestampOffset'] = this.timestampTimezoneOffset || null
      dataSourceBody['paused'] = false

      let response = null

      if (this.dataSourceId) {
        response = await api.patch(
          ENDPOINTS.DATA_SOURCES.ID(this.dataSourceId),
          dataSourceBody
        )
      } else {
        response = await api.post(ENDPOINTS.DATA_SOURCES, dataSourceBody)
      }
      return true
    },
    fillForm() {
      let dataSource = this.dataSource

      this.dataSourceName = dataSource ? dataSource['name'] : null
      this.dataSource = dataSource ? dataSource['name'] : null
      this.dataLoader = dataSource ? this.dataLoaders.find(
        dl => dl.id === dataSource['dataLoaderId']
      ) : null
      this.localFilePath = dataSource ? dataSource['path'] : null
      this.fileHeaderRow = dataSource
        ? dataSource['headerRow']
        : null
      this.dataStartRow = dataSource
        ? dataSource['dataStartRow']
        : 1
      this.fileDelimiter = dataSource
        ? dataSource['delimiter']
        : ','

      this.scheduleStartTime =
        dataSource
          ? dataSource['startTime']
          : null
      this.scheduleEndTime =
        dataSource
          ? dataSource['endTime']
          : null
      this.scheduleType =
        dataSource &&
        dataSource['interval'] == null
          ? 'crontab'
          : 'interval'
      this.interval =
        dataSource
          ? dataSource['interval']
          : null
      this.intervalUnits =
        dataSource
          ? dataSource['intervalUnits']
          : 'minutes'
      this.crontab =
        dataSource
          ? dataSource['crontab']
          : null

      if (this.scheduleStartTime) {
        this.scheduleStartTime = this.scheduleStartTime.replace('Z', '')
      }

      if (this.scheduleEndTime) {
        this.scheduleEndTime = this.scheduleEndTime.replace('Z', '')
      }

      this.timestampType =
        dataSource && typeof dataSource['timestampColumn'] === 'string'
          ? 'name'
          : 'index'
      this.timestampColumn = dataSource
        ? dataSource['timestampColumn']
        : null
      this.timestampFormat =
        dataSource && dataSource['timestampFormat'] != 'iso'
          ? 'custom'
          : 'iso'
      this.timestampCustomFormat =
        dataSource && dataSource['timestampFormat'] != 'iso'
          ? dataSource['timestampFormat']
          : null
      this.timestampTimezoneOffset = dataSource
        ? dataSource['timestampOffset']
        : null
    },
  },
})
