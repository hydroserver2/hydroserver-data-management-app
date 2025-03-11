export class DataSource {
  type = 'ETL'
  etlSystemId = ''
  id = ''
  name = ''
  lastSyncSuccessful = false
  lastSyncMessage = ''
  lastSynced: string | null = null
  nextSync: string | null = null
  interval: number | null = null
  intervalUnits: string | null = null
  startTime: string | null = null
  endTime: string | null = null
  paused = false
  jsonConfiguration: object = {}

  path = ''
  link: string | null = null
  headerRow?: number
  dataStartRow = 1
  delimiter = ','
  crontab = ''
  timestampColumn: string | number = ''
  timestampFormat = ''
  timestampOffset = ''
  dataSourceThru: string | null = null

  constructor(init?: Partial<DataSource>) {
    Object.assign(this, init)
  }
}
