export const TIMEZONE_OFFSETS = [
  { title: 'UTC-12:00 (International Date Line West)', value: '-1200' },
  { title: 'UTC-11:00 (Samoa Standard Time)', value: '-1100' },
  { title: 'UTC-10:00 (Hawaii-Aleutian Standard Time)', value: '-1000' },
  { title: 'UTC-09:00 (Alaska Standard Time)', value: '-0900' },
  { title: 'UTC-08:00 (Pacific Standard Time)', value: '-0800' },
  { title: 'UTC-07:00 (Mountain Standard Time)', value: '-0700' },
  { title: 'UTC-06:00 (Central Standard Time)', value: '-0600' },
  { title: 'UTC-05:00 (Eastern Standard Time)', value: '-0500' },
  { title: 'UTC-04:30 (Venezuelan Standard Time)', value: '-0430' },
  { title: 'UTC-04:00 (Atlantic Standard Time)', value: '-0400' },
  { title: 'UTC-03:30 (Newfoundland Standard Time)', value: '-0330' },
  { title: 'UTC-03:00 (Argentina Standard Time)', value: '-0300' },
  { title: 'UTC-02:00 (Brazil Time)', value: '-0200' },
  { title: 'UTC-01:00 (Azores Standard Time)', value: '-0100' },
  { title: 'UTC+00:00 (Greenwich Mean Time)', value: '+0000' },
  { title: 'UTC+01:00 (Central European Time)', value: '+0100' },
  { title: 'UTC+02:00 (Eastern European Time)', value: '+0200' },
  { title: 'UTC+03:00 (Moscow Standard Time)', value: '+0300' },
  { title: 'UTC+03:30 (Iran Standard Time)', value: '+0330' },
  { title: 'UTC+04:00 (Azerbaijan Standard Time)', value: '+0400' },
  { title: 'UTC+04:30 (Afghanistan Time)', value: '+0430' },
  { title: 'UTC+05:00 (Pakistan Standard Time)', value: '+0500' },
  { title: 'UTC+05:30 (Indian Standard Time)', value: '+0530' },
  { title: 'UTC+05:45 (Nepal Time)', value: '+0545' },
  { title: 'UTC+06:00 (Bangladesh Standard Time)', value: '+0600' },
  { title: 'UTC+06:30 (Cocos Islands Time)', value: '+0630' },
  { title: 'UTC+07:00 (Indochina Time)', value: '+0700' },
  { title: 'UTC+08:00 (China Standard Time)', value: '+0800' },
  {
    title: 'UTC+08:45 (Australia Central Western Standard Time)',
    value: '+0845',
  },
  { title: 'UTC+09:00 (Japan Standard Time)', value: '+0900' },
  { title: 'UTC+09:30 (Australian Central Standard Time)', value: '+0930' },
  { title: 'UTC+10:00 (Australian Eastern Standard Time)', value: '+1000' },
  { title: 'UTC+10:30 (Lord Howe Standard Time)', value: '+1030' },
  { title: 'UTC+11:00 (Solomon Islands Time)', value: '+1100' },
  { title: 'UTC+11:30 (Norfolk Island Time)', value: '+1130' },
  { title: 'UTC+12:00 (Fiji Time)', value: '+1200' },
  { title: 'UTC+12:45 (Chatham Islands Time)', value: '+1245' },
  { title: 'UTC+13:00 (Tonga Time)', value: '+1300' },
  { title: 'UTC+14:00 (Line Islands Time)', value: '+1400' },
] as const
export type TimezoneOffsetType = (typeof TIMEZONE_OFFSETS)[number]['value']

export const WORKFLOW_TYPES = [
  { title: 'ETL', value: 'ETL' },
  { title: 'HydroServer aggregation', value: 'Aggregation' },
  { title: 'HydroServer virtual datastream', value: 'Virtual' },
  { title: 'Streaming Data Loader', value: 'SDL' },
] as const
export type WorkflowType = (typeof WORKFLOW_TYPES)[number]['value']

export const CSV_DELIMITER_OPTIONS = [
  { value: ',', title: 'Comma' },
  { value: '|', title: 'Pipe' },
  { value: '\\t', title: 'Tab' },
  { value: ';', title: 'Semicolon' },
  { value: ' ', title: 'Space' },
] as const
export type CSVDelimiterType = (typeof CSV_DELIMITER_OPTIONS)[number]['value']

interface UrlTemplateVariable {
  name: string
  isDynamic: boolean
  dynamicValue: string
}

export const EXTRACTOR_OPTIONS = ['HTTP', 'local'] as const
export type ExtractorType = (typeof EXTRACTOR_OPTIONS)[number]

interface BaseExtractor {
  type: ExtractorType
}

export interface HTTPExtractor extends BaseExtractor {
  type: 'HTTP'
  urlTemplate: string
  urlTemplateVariables: UrlTemplateVariable[]
}

export interface LocalFileExtractor extends BaseExtractor {
  type: 'local'
  path: string
}

export type ExtractorConfig = HTTPExtractor | LocalFileExtractor

const extractorDefaults: Record<ExtractorType, ExtractorConfig> = {
  HTTP: {
    type: 'HTTP',
    urlTemplate:
      'https://example.com/{route_variable}?query_parameter={query_parameter}',
    urlTemplateVariables: [],
  } as HTTPExtractor,
  local: {
    type: 'local',
    path: '',
  } as LocalFileExtractor,
}

export const TRANSFORMER_OPTIONS = ['JSON', 'CSV'] as const
export type TransformerType = (typeof TRANSFORMER_OPTIONS)[number]
export enum IdentifierType {
  Name = 'name',
  Index = 'index',
}

interface BaseTransformer {
  type: TransformerType
  mapping: string
  timestampKey: string
  identifierType: IdentifierType
}

interface JSONtransformer extends BaseTransformer {
  type: 'JSON'
  JMESPath: string
}

export interface CSVTransformer extends BaseTransformer {
  type: 'CSV'
  headerRow: number | null
  dataStartRow: number
  delimiter: CSVDelimiterType
  timestampFormat: string
  timestampOffset: TimezoneOffsetType
}

export type TransformerConfig = JSONtransformer | CSVTransformer

export const transformerDefaults: Record<TransformerType, TransformerConfig> = {
  JSON: {
    type: 'JSON',
    mapping: '',
    timestampKey: 'timestamp',
    JMESPath: '',
    identifierType: IdentifierType.Name,
  } as JSONtransformer,
  CSV: {
    type: 'CSV',
    mapping: '',
    timestampKey: 'timestamp',
    timestampFormat: 'ISO8601',
    headerRow: 1,
    dataStartRow: 2,
    delimiter: ',' as CSVDelimiterType,
    identifierType: IdentifierType.Name,
    timestampOffset: '+0000',
  } as CSVTransformer,
}

export const LOADER_OPTIONS = ['HydroServer'] as const
export type LoaderType = (typeof LOADER_OPTIONS)[number]

interface BaseLoaderConfig {
  type: LoaderType
}

interface HydroServerLoaderConfig extends BaseLoaderConfig {
  type: 'HydroServer'
}

export type LoaderConfig = HydroServerLoaderConfig

export const loaderDefaults: Record<LoaderType, LoaderConfig> = {
  HydroServer: {
    type: 'HydroServer',
  },
}

interface EtlConfiguration {
  type: WorkflowType
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

export const DATASOURCE_STATUS_OPTIONS = [
  { color: 'green', title: 'OK' },
  { color: 'blue', title: 'Pending' },
  { color: 'red', title: 'Needs attention' },
  { color: 'orange-darken-4', title: 'Behind schedule' },
  { color: 'gray', title: 'Unknown' },
  { color: 'gray', title: 'Loading paused' },
] as const
export type StatusType = (typeof DATASOURCE_STATUS_OPTIONS)[number]['title']

export class DataSource {
  name = ''
  id = ''
  etlSystemId = ''
  // etlSystem: {
  //   id
  //   workspaceId
  //   etlSystemPlatform: {
  //     workspaceId
  //     name // selection of SDL | aggregation | ETL | virtual
  //     intervalScheduleSupported
  //     crontabScheduleSupported
  //   }
  //   name
  // }
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
  // etlConfiguration: {
  //   id
  //   name:
  //   schema? {}
  //   etlConfigurationModel: 'datastream' or 'datasource'
  //   type: 'extractor' | 'transformer' | 'loader'
  //   workspaceId? //usually null
  // }
  // etlConfigurationId: string = ''
  etlConfigurationSettings: EtlConfiguration = {
    type: 'SDL',
    extractor: JSON.parse(JSON.stringify(extractorDefaults['HTTP'])),
    transformer: JSON.parse(JSON.stringify(transformerDefaults['CSV'])),
    loader: JSON.parse(JSON.stringify(loaderDefaults['HydroServer'])),
  }
  // // extractorConfigurationId: string = ''
  // extractorConfigurationSettings: ExtractorConfig = JSON.parse(
  //   JSON.stringify(extractorDefaults['local'])
  // )
  // // transformerConfigurationId: string = ''
  // transformerConfigurationSettings: TransformerConfig = JSON.parse(
  //   JSON.stringify(transformerDefaults['CSV'])
  // )
  // // loaderConfigurationId: string = ''
  // loaderConfigurationSettings: LoaderConfig = JSON.parse(
  //   JSON.stringify(loaderDefaults['HydroServer'])
  // )
  workspaceId: string = ''
  linkedDatastreams: LinkedDatastream[] = []

  constructor(init?: Partial<DataSource>) {
    Object.assign(this, init)
  }

  // switchExtractor(newType: ExtractorType) {
  //   this.etlConfigurationSettings.extractor = JSON.parse(
  //     JSON.stringify(extractorDefaults[newType])
  //   )
  // }

  // switchTransformer(newType: TransformerType) {
  //   this.etlConfigurationSettings.transformer = JSON.parse(
  //     JSON.stringify(transformerDefaults[newType])
  //   )
  // }

  // switchLoader(newType: LoaderType) {
  //   this.etlConfigurationSettings.loader = JSON.parse(
  //     JSON.stringify(loaderDefaults[newType])
  //   )
  // }
  getStatus(): StatusType {
    if (!this.lastRun) return 'Pending'

    let now = new Date()
    let nextRun = this.nextRun ? new Date(Date.parse(this.nextRun)) : null

    if (this.lastRunSuccessful && nextRun && nextRun >= now) {
      return 'OK'
    } else if (!this.lastRunSuccessful) {
      return 'Needs attention'
    } else if (nextRun && nextRun < now) {
      return 'Behind schedule'
    }
    return 'Unknown'
  }
}
