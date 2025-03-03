export type DataPoint = {
  date: Date
  value: number
}

export type DataArray = [string, number][]

export class ObservationRecord {
  dataArray: DataArray
  beginTime: string
  endTime: string
  loading: boolean

  constructor() {
    this.dataArray = []
    this.beginTime = ''
    this.endTime = ''
    this.loading = false
  }
}

export interface GraphSeries {
  id: string
  name: string
  data: DataPoint[]
  yAxisLabel: string
  lineColor: string
}

export type TimeSpacingUnit = 'seconds' | 'minutes' | 'hours' | 'days'

export interface Tag {
  key: string
  value: string
}

export type Frequency = 'daily' | 'weekly' | 'monthly' | null

export class HydroShareArchive {
  id: string
  thingId: string
  link: string
  frequency: Frequency
  path: string
  datastreamIds: string[]
  publicResource: boolean

  constructor() {
    this.id = ''
    this.thingId = ''
    this.link = ''
    this.frequency = null
    this.path = 'HydroShare'
    this.datastreamIds = []
    this.publicResource = false
  }
}

export class PostHydroShareArchive extends HydroShareArchive {
  resourceTitle?: string
  resourceAbstract?: string
  resourceKeywords?: string[]

  constructor() {
    super()
    this.resourceTitle = undefined
    this.resourceAbstract = undefined
    this.resourceKeywords = undefined
  }
}

export class Thing {
  id: string
  workspaceId: string
  name: string
  tags: Tag[]
  hydroShareArchive?: HydroShareArchive | null
  siteType: string
  samplingFeatureCode: string
  isPrivate: boolean
  latitude?: number | ''
  longitude?: number | ''
  elevation_m?: number | ''
  elevationDatum: string
  description: string
  samplingFeatureType: string
  state: string
  county: string
  country: string
  dataDisclaimer: string

  constructor() {
    this.id = ''
    this.workspaceId = ''
    this.name = ''
    this.tags = []
    this.siteType = ''
    this.samplingFeatureCode = ''
    this.isPrivate = false
    this.elevationDatum = 'WGS84'
    this.description = ''
    this.samplingFeatureType = 'Site'
    this.state = ''
    this.county = ''
    this.country = ''
    this.dataDisclaimer = ''
  }
}

export interface ThingWithColor extends Thing {
  color?: {
    borderColor: string
    background: string
    glyphColor: string
  }
  tagValue?: string
}

export class Datastream {
  id: string
  workspaceId: string
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
  isDataVisible: boolean
  phenomenonBeginTime?: string | null
  phenomenonEndTime?: string | null
  intendedTimeSpacing?: number
  intendedTimeSpacingUnit?: string | null
  timeAggregationInterval: number | null
  timeAggregationIntervalUnit: string
  dataSourceId?: string | null
  dataSourceColumn?: string | number | null
  valueCount: number

  constructor(thingId?: string) {
    this.id = ''
    this.workspaceId = ''
    this.name = ''
    this.description = ''
    this.thingId = thingId || ''
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
    this.timeAggregationIntervalUnit = 'seconds'
    this.isVisible = true
    this.valueCount = 0
    this.isDataVisible = true
  }
}

export class Unit {
  id: string
  workspaceId: string
  name: string
  symbol: string
  definition: string
  type: string

  constructor() {
    this.id = ''
    this.workspaceId = ''
    this.name = ''
    this.symbol = ''
    this.definition = ''
    this.type = ''
  }
}

export class Sensor {
  id: string
  workspaceId: string
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
    this.workspaceId = ''
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
  workspaceId: string
  name: string
  definition: string
  description: string
  type: string
  code: string

  constructor() {
    this.id = ''
    this.workspaceId = ''
    this.name = ''
    this.definition = ''
    this.description = ''
    this.type = 'Hydrology'
    this.code = ''
  }
}

export class ProcessingLevel {
  id: string
  workspaceId: string
  code: string
  definition: string
  explanation: string

  constructor() {
    this.id = ''
    this.workspaceId = ''
    this.code = ''
    this.definition = ''
    this.explanation = ''
  }
}

export class ResultQualifier {
  id: string
  workspaceId: string
  code: string
  description: string

  constructor() {
    this.id = ''
    this.workspaceId = ''
    this.code = ''
    this.description = ''
  }
}

export class DataSource {
  // new variables
  type: string
  etlSystemId: string
  // old variables
  id: string
  name: string
  path: string
  link: string | null
  headerRow?: number
  dataStartRow: number
  delimiter: string
  interval: number | null
  intervalUnits: string | null
  crontab: string
  startTime: string | null
  endTime: string | null
  paused: boolean
  timestampColumn: string | number
  timestampFormat: string
  timestampOffset: string
  dataLoaderId: string
  dataSourceThru: string | null
  lastSyncSuccessful: boolean
  lastSyncMessage: string
  lastSynced: string | null
  nextSync: string | null

  constructor() {
    this.type = 'ETL'
    this.etlSystemId = ''
    this.id = ''
    this.name = ''
    this.path = ''
    this.link = null
    this.dataStartRow = 1
    this.delimiter = ','
    this.interval = null
    this.intervalUnits = null
    this.crontab = ''
    this.startTime = null
    this.endTime = null
    this.paused = false
    this.timestampColumn = ''
    this.timestampFormat = ''
    this.timestampOffset = ''
    this.dataLoaderId = ''
    this.dataSourceThru = null
    this.lastSyncSuccessful = false
    this.lastSyncMessage = ''
    this.lastSynced = null
    this.nextSync = null
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
  link: string
  accountType: 'admin' | 'standard' | 'limited'
  hydroShareConnected: boolean

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
    this.link = ''
    this.accountType = 'standard'
    this.hydroShareConnected = false
  }
}

export interface Photo {
  name: string
  link: string
}

export class OAuthProvider {
  id: string
  name: string
  iconLink: string
  signupEnabled: boolean
  connectEnabled: boolean

  constructor() {
    this.id = ''
    this.name = ''
    this.iconLink = ''
    this.signupEnabled = true
    this.connectEnabled = true
  }
}

export enum ResourceType {
  Global = '*',
  View = 'view',
  Create = 'create',
  Edit = 'edit',
  Delete = 'delete',
}

export enum PermissionType {
  Global = '*',
  Workspace = 'Workspace',
  Collaborator = 'Collaborator',
  Thing = 'Thing',
  Datastream = 'Datastream',
  Sensor = 'Sensor',
  Unit = 'Unit',
  ObservedProperty = 'ObservedProperty',
  ProcessingLevel = 'ProcessingLevel',
  Observation = 'Observation',
}

export interface Permission {
  resource_type: ResourceType
  permission_type: PermissionType
}

export interface CollaboratorRole {
  name: string
  description: string
  id: string
  workspaceId: string
  permissions: Permission[]
}

export interface WorkspaceData {
  id: string
  name: string
  isPrivate: boolean
  owner: User
  collaboratorRole: CollaboratorRole
  pendingTransferTo?: User | null
}

export class Workspace {
  id: string
  name: string
  isPrivate: boolean
  owner: UserInfo | null
  collaboratorRole: CollaboratorRole | null
  pendingTransferTo?: UserInfo | null

  constructor() {
    this.id = ''
    this.name = ''
    this.isPrivate = false
    this.owner = null
    this.collaboratorRole = null
    this.pendingTransferTo = null
  }
}

export interface UserInfo {
  name: string
  email: string
  phone: string
  address: string
  link: string
  type: string
  organizationName: string
}

export class Collaborator {
  user: UserInfo
  role: CollaboratorRole

  constructor() {
    this.user = {
      phone: '',
      address: '',
      link: '',
      type: '',
      name: '',
      email: '',
      organizationName: '',
    }
    this.role = {
      name: '',
      description: '',
      id: '',
      workspaceId: '',
      permissions: [],
    }
  }
}

export interface ApiError {
  status: number
  message?: string
}

export interface SourceTargetPair {
  source_identifier: string | number
  target_identifier: string | number
}

export class Payload {
  id: string
  dataSourceId: string
  name: string
  sourceTargetMap: SourceTargetPair[]

  constructor(dataSourceId?: string) {
    this.id = ''
    this.dataSourceId = dataSourceId || ''
    this.name = ''
    this.sourceTargetMap = []
  }
}
