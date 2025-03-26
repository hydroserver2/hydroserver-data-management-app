import { DataSource } from '@/models'

export default [
  new DataSource({
    id: 'ds1',
    name: 'DataSource One',
    interval: 30,
    intervalUnits: 'minutes',
    crontab: '*/30 * * * *',
    startTime: '2022-01-01T00:00:00Z',
    endTime: '2022-12-31T23:59:59Z',
    paused: false,
    etlSystemId: 'orchestrator1',
    lastRunSuccessful: true,
    lastRunMessage: 'Success',
    lastRun: '2022-06-01T12:00:00Z',
    nextRun: '2022-06-01T12:30:00Z',
  }),
  new DataSource({
    id: 'ds2',
    name: 'DataSource Two',
    interval: null,
    intervalUnits: null,
    crontab: '',
    startTime: null,
    endTime: null,
    paused: true,
    etlSystemId: 'orchestrator2',

    lastRunSuccessful: false,
    lastRunMessage: 'Failure',
    lastRun: '2022-05-31T11:00:00Z',
    nextRun: null,
  }),
]
