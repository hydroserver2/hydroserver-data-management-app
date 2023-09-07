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
  latitude?: number
  longitude?: number
  elevation_m?: number
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
  observations: Observation[]
  mostRecentObservation: any
  unitId: string
  unitName: string
  unitSymbol: string
  observedPropertyId: string
  observedPropertyName: string
  sensorId: string
  sensorName: string
  processingLevelId: string
  processingLevelName: string
  isVisible?: boolean
  isPrimaryOwner: boolean
  isStale?: boolean
  phenomenonBeginTime?: string | null
  phenomenonEndTime?: string | null
  intendedTimeSpacing?: number
  intendedTimeSpacingUnitsId?: string
  timeAggregationInterval: number | null
  timeAggregationIntervalUnitsId: string

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
    this.observations = []
    this.mostRecentObservation = ''
    this.unitId = ''
    this.unitName = ''
    this.unitSymbol = ''
    this.observedPropertyId = ''
    this.observedPropertyName = ''
    this.sensorId = ''
    this.sensorName = ''
    this.processingLevelId = ''
    this.processingLevelName = ''
    this.isPrimaryOwner = false
    this.timeAggregationInterval = null
    this.timeAggregationIntervalUnitsId = ''
  }
}

export interface Observation {
  id: string
  result: string
  phenomenonTime: string
}

export class Unit {
  id: string
  personId: string
  name: string
  symbol: string
  definition: string
  type: string

  constructor() {
    this.id = ''
    this.personId = ''
    this.name = ''
    this.symbol = ''
    this.definition = ''
    this.type = ''
  }
}

export class Sensor {
  id: string
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
  personId: string
  definition: string
  description: string
  type: string
  code: string

  constructor() {
    this.id = ''
    this.name = ''
    this.personId = ''
    this.definition = ''
    this.description = ''
    this.type = 'Hydrology'
    this.code = ''
  }
}

export class ProcessingLevel {
  id: string
  personId: string
  code: string
  definition: string
  explanation: string

  constructor() {
    this.id = ''
    this.personId = ''
    this.code = ''
    this.definition = ''
    this.explanation = ''
  }
}

export class Organization {
  name: string
  code: string
  type: string
  description?: string
  link?: string

  constructor() {
    this.name = ''
    this.code = ''
    this.type = ''
    this.description = ''
    this.link = ''
  }
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

export interface ThingMetadata {
  units: Unit[]
  sensors: Sensor[]
  processing_levels: ProcessingLevel[]
  observed_properties: ObservedProperty[]
}

export interface Photo {
  id: string
  thingId: string
  filePath: string
  link: string
}
