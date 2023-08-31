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
  latitude: number
  longitude: number
  elevation_m: number
  elevationDatum: string
  ownsThing: boolean
  followsThing: boolean
  description: string
  samplingFeatureType: string
  state: string
  county: string
  isPrimaryOwner: boolean
  followers: number
  dataDisclaimer: string

  constructor() {
    this.id = ''
    this.name = ''
    this.owners = []
    this.siteType = ''
    this.samplingFeatureCode = ''
    this.isPrivate = false
    this.latitude = 0
    this.longitude = 0
    this.elevation_m = 0
    this.elevationDatum = 'WGS84'
    this.ownsThing = false
    this.followsThing = false
    this.description = ''
    this.samplingFeatureType = 'Site'
    this.state = ''
    this.county = ''
    this.isPrimaryOwner = false
    this.followers = 0
    this.dataDisclaimer = ''
  }
}

export class Datastream {
  id: string
  thing_id: string
  observation_type: string
  result_type: string
  status: string
  sampled_medium: string
  no_data_value: number
  aggregation_statistic: string
  observations: Observation[]
  most_recent_observation: any
  unit_id: string
  unit_name: string
  unit_symbol: string
  observed_property_id: string
  observed_property_name: string
  method_id: string
  method_name: string
  processing_level_id: string
  processing_level_name: string
  is_visible: boolean
  isPrimaryOwner: boolean
  is_stale?: boolean

  constructor(thingId: string) {
    this.id = ''
    this.thing_id = thingId
    this.observation_type = 'OM_Measurement'
    this.result_type = 'Time Series Coverage'
    this.status = ''
    this.sampled_medium = ''
    this.no_data_value = -9999
    this.aggregation_statistic = ''
    this.observations = []
    this.most_recent_observation = ''
    this.unit_id = ''
    this.unit_name = ''
    this.unit_symbol = ''
    this.observed_property_id = ''
    this.observed_property_name = ''
    this.method_id = ''
    this.method_name = ''
    this.processing_level_id = ''
    this.processing_level_name = ''
    this.is_visible = true
    this.isPrimaryOwner = false
  }
}

export interface Observation {
  id: string
  result: string
  result_time: string
}

export class Unit {
  id: string
  person_id: string
  name: string
  symbol: string
  definition: string
  unit_type: string

  constructor() {
    this.id = ''
    this.person_id = ''
    this.name = ''
    this.symbol = ''
    this.definition = ''
    this.unit_type = ''
  }
}

export class Sensor {
  id: string
  name: string
  description: string
  manufacturer: string
  model: string
  method_type: string
  method_code: string
  method_link: string
  encoding_type: string
  model_url: string

  constructor() {
    this.id = ''
    this.name = ''
    this.description = ''
    this.manufacturer = ''
    this.model = ''
    this.method_type = 'Instrument Deployment'
    this.method_code = ''
    this.method_link = ''
    this.encoding_type = 'application/json'
    this.model_url = ''
  }
}

export class ObservedProperty {
  id: string
  name: string
  person_id: string
  definition: string
  description: string
  variable_type: string
  variable_code: string

  constructor() {
    this.id = ''
    this.name = ''
    this.person_id = ''
    this.definition = ''
    this.description = ''
    this.variable_type = 'Hydrology'
    this.variable_code = ''
  }
}

export class ProcessingLevel {
  id: string
  person_id: string
  processing_level_code: string
  definition: string
  explanation: string

  constructor() {
    this.id = ''
    this.person_id = ''
    this.processing_level_code = ''
    this.definition = ''
    this.explanation = ''
  }
}

export class Organization {
  name: string
  code: string
  description?: string
  type: string
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
  organization: Organization
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
    this.organization = new Organization()
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
  url: string
}
