export type DataArray = [string, number][]

export class ObservationRecord {
  dataArray: DataArray
  beginTime: string
  loading: boolean

  constructor() {
    this.dataArray = []
    this.beginTime = ''
    this.loading = false
  }
}

export interface Owner {
  firstName: string
  lastName: string
  organizationName: string
  isPrimaryOwner: boolean
  email: string
}

export class Thing {
  id: string
  name: string
  owners: Owner[]
  siteType: string
  samplingFeatureCode: string
  isPrivate: boolean
  latitude?: number | ''
  longitude?: number | ''
  elevation_m?: number | ''
  elevationDatum: string
  ownsThing: boolean
  followsThing: boolean
  description: string
  samplingFeatureType: string
  state: string
  county: string
  isPrimaryOwner: boolean
  dataDisclaimer: string

  constructor() {
    this.id = ''
    this.name = ''
    this.owners = []
    this.siteType = ''
    this.samplingFeatureCode = ''
    this.isPrivate = false
    this.elevationDatum = 'WGS84'
    this.ownsThing = false
    this.followsThing = false
    this.description = ''
    this.samplingFeatureType = 'Site'
    this.state = ''
    this.county = ''
    this.isPrimaryOwner = false
    this.dataDisclaimer = ''
  }
}

export class Datastream {
  id: string
  name: string
  description: string
  thingId: string
  observationType: string
  resultType?: string
  status?: string
  sampledMedium: string
  noDataValue: number
  aggregationStatistic: string
  unitId: string
  observedPropertyId: string
  sensorId: string
  processingLevelId: string
  isVisible: boolean
  phenomenonBeginTime?: string | null
  phenomenonEndTime?: string | null
  intendedTimeSpacing?: number
  intendedTimeSpacingUnitsId?: string
  timeAggregationInterval: number | null
  timeAggregationIntervalUnitsId: string
  dataSourceId?: string
  dataSourceColumn?: string | number

  constructor(thingId: string) {
    this.id = ''
    this.name = 'Datastream'
    this.description = 'Site Datastream'
    this.thingId = thingId
    this.observationType = 'OM_Measurement'
    this.resultType = 'Time Series Coverage'
    this.sampledMedium = ''
    this.noDataValue = -9999
    this.aggregationStatistic = ''
    this.unitId = ''
    this.observedPropertyId = ''
    this.sensorId = ''
    this.processingLevelId = ''
    this.timeAggregationInterval = null
    this.timeAggregationIntervalUnitsId = ''
    this.isVisible = true
  }
}

export class Unit {
  id: string
  owner: string | null
  name: string
  symbol: string
  definition: string
  type: string

  constructor() {
    this.id = ''
    this.owner = null
    this.name = ''
    this.symbol = ''
    this.definition = ''
    this.type = ''
  }
}

export class Sensor {
  id: string
  owner: string | null
  name: string
  description: string
  manufacturer: string
  model: string
  methodType: string
  methodCode: string
  methodLink: string
  encodingType: string
  modelLink: string

  constructor() {
    this.id = ''
    this.owner = null
    this.name = ''
    this.description = ''
    this.manufacturer = ''
    this.model = ''
    this.methodType = 'Instrument Deployment'
    this.methodCode = ''
    this.methodLink = ''
    this.encodingType = 'application/json'
    this.modelLink = ''
  }
}

export class ObservedProperty {
  id: string
  name: string
  owner: string | null
  definition: string
  description: string
  type: string
  code: string

  constructor() {
    this.id = ''
    this.name = ''
    this.owner = null
    this.definition = ''
    this.description = ''
    this.type = 'Hydrology'
    this.code = ''
  }
}

export class ProcessingLevel {
  id: string
  owner: string | null
  code: string
  definition: string
  explanation: string

  constructor() {
    this.id = ''
    this.owner = null
    this.code = ''
    this.definition = ''
    this.explanation = ''
  }
}

export class ResultQualifier {
  id: string
  owner: Owner | null
  code: string
  description: string

  constructor() {
    this.id = ''
    this.owner = null
    this.code = ''
    this.description = ''
  }
}

export class DataSource {
  id: string
  name: string
  path: string
  url: string
  headerRow: number
  dataStartRow: number
  delimiter: string
  interval: number
  intervalUnits: string
  crontab: string
  startTime: string
  endTime: string
  paused: boolean
  timestampColumn: string | number
  timestampFormat: string
  timestampOffset: string
  dataLoaderId: string
  dataSourceThru: string
  lastSyncSuccessful: boolean
  lastSyncMessage: string
  lastSynced: string
  nextSync: string

  constructor() {
    this.id = ''
    this.name = ''
    this.path = ''
    this.url = ''
    this.headerRow = 0
    this.dataStartRow = 0
    this.delimiter = ''
    this.interval = 0
    this.intervalUnits = ''
    this.crontab = ''
    this.startTime = ''
    this.endTime = ''
    this.paused = false
    this.timestampColumn = ''
    this.timestampFormat = ''
    this.timestampOffset = ''
    this.dataLoaderId = ''
    this.dataSourceThru = ''
    this.lastSyncSuccessful = false
    this.lastSyncMessage = ''
    this.lastSynced = ''
    this.nextSync = ''
  }
}

export class DataLoader {
  id: string
  name: string

  constructor() {
    this.id = ''
    this.name = ''
  }
}

export class Organization {
  name?: string
  code?: string
  type?: string
  description?: string
  link?: string

  constructor() {}
}

export class User {
  id: string
  email: string
  password: string
  firstName: string
  middleName: string
  lastName: string
  phone: string
  address: string
  organization?: Organization | null
  type: string
  isVerified: boolean
  link: string

  constructor() {
    this.id = ''
    this.email = ''
    this.password = ''
    this.firstName = ''
    this.middleName = ''
    this.lastName = ''
    this.phone = ''
    this.address = ''
    this.type = ''
    this.isVerified = false
    this.link = ''
  }
}

export interface DatastreamMetadata {
  units: Unit[]
  sensors: Sensor[]
  processingLevels: ProcessingLevel[]
  observedProperties: ObservedProperty[]
}

export interface Photo {
  id: string
  thingId: string
  filePath: string
  link: string
}

export enum OAuthProvider {
  google = 'google',
  orcid = 'orcid',
}
