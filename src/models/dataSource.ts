type DataSourceType = 'ETL' | 'SDL' | 'Virtual' | 'Aggregation'

interface UrlTemplateVariable {
  name: string
  isDynamic: boolean
  dynamicValue: string
}

interface ExtractorConfig {
  type: string
}

interface HTTPExtractorConfig extends ExtractorConfig {
  urlTemplate: string
  urlTemplateVariables: UrlTemplateVariable[]
}

interface TransformerConfig {
  type: string
  mapping: string
  ruleset: string
  timestamp_key: string
}

interface JSONTransformerConfig extends TransformerConfig {
  JMESPath: string
}

interface LoaderConfig {
  type: string
  destination: string
  authKey: string
}

interface EtlConfiguration {
  type: DataSourceType
  extractor: ExtractorConfig
  transformer: TransformerConfig
  loader: LoaderConfig
}

import { Datastream } from '@/types'
export type PartialDatastream = Pick<
  Datastream,
  | 'name'
  | 'description'
  | 'noDataValue'
  | 'valueCount'
  | 'phenomenonBeginTime'
  | 'phenomenonEndTime'
  | 'aggregationStatistic'
  | 'timeAggregationInterval'
  | 'timeAggregationIntervalUnit'
  | 'intendedTimeSpacing'
  | 'intendedTimeSpacingUnit'
>

export interface PayloadConfigurations {}

export interface LinkedDatastream {
  dataSourceId: string
  datastreamId: string
  etlConfigurationId: string
  etlConfigurationSettings: PayloadConfigurations
  datastream: PartialDatastream
}

export class DataSource {
  // TODO: Match with db
  type = 'ETL'
  name = ''
  id = ''
  etlSystemId = ''
  interval: number | null = null
  intervalUnits: string | null = null
  startTime: string | null = null
  endTime: string | null = null
  paused = false
  crontab = ''
  lastRunSuccessful = false
  lastRun: string | null = null
  nextRun: string | null = null
  lastRunMessage = ''
  etlConfigurationId: string = ''
  // etlConfigurationSettings: EtlConfiguration = {}
  workspaceId: string = ''
  linkedDatastreams: LinkedDatastream[] = []

  constructor(init?: Partial<DataSource>) {
    Object.assign(this, init)
  }
}
