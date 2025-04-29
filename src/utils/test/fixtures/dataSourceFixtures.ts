// import { DataSource } from '@/models'
// import { OrchestrationSystem } from '@/types'

// const fifteenMinutesAgo = new Date(Date.now() - 15 * 60_000).toISOString()
// const fifteenMinutesFromNow = new Date(Date.now() + 15 * 60_000).toISOString()

// const orchestrator1: OrchestrationSystem = {
//   name: 'Orchestrator1',
//   type: 'SDL',
//   id: 'id_1',
//   workspaceId: 'workspace_1',
// }

// const orchestrator2: OrchestrationSystem = {
//   name: 'Orchestrator2',
//   type: 'airflow',
//   id: 'id_2',
//   workspaceId: 'workspace_2',
// }

// export default [
//   new DataSource({
//     id: 'ds1',
//     name: 'DataSource One',
//     interval: 30,
//     intervalUnits: 'minutes',
//     crontab: '*/30 * * * *',
//     startTime: '2022-01-01T00:00:00Z',
//     endTime: '2022-12-31T23:59:59Z',
//     paused: false,
//     orchestrationSystem: JSON.parse(JSON.stringify(orchestrator1)),
//     lastRunSuccessful: true,
//     lastRunMessage: 'Success',
//     lastRun: '2022-06-01T12:00:00Z',
//     nextRun: '2022-06-01T12:30:00Z',
//   }),
//   new DataSource({
//     id: 'ds5',
//     name: 'DataSource Five',
//     interval: 30,
//     intervalUnits: 'minutes',
//     crontab: '*/30 * * * *',
//     startTime: '2022-01-01T00:00:00Z',
//     endTime: '2022-12-31T23:59:59Z',
//     paused: false,
//     orchestrationSystem: JSON.parse(JSON.stringify(orchestrator1)),
//     lastRunSuccessful: false,
//     lastRunMessage: 'Success',
//     lastRun: '2022-06-01T12:00:00Z',
//     nextRun: '2022-06-01T12:30:00Z',
//   }),
//   new DataSource({
//     id: 'ds4',
//     name: 'DataSource Four',
//     interval: 30,
//     intervalUnits: 'minutes',
//     crontab: '*/30 * * * *',
//     startTime: null,
//     endTime: null,
//     paused: false,
//     orchestrationSystem: JSON.parse(JSON.stringify(orchestrator1)),
//     lastRunSuccessful: true,
//     lastRunMessage: 'Success',
//     lastRun: fifteenMinutesAgo,
//     nextRun: fifteenMinutesFromNow,
//   }),
//   new DataSource({
//     id: 'ds2',
//     name: 'DataSource Two',
//     interval: null,
//     intervalUnits: null,
//     crontab: '',
//     startTime: null,
//     endTime: null,
//     paused: true,
//     orchestrationSystem: JSON.parse(JSON.stringify(orchestrator2)),

//     lastRunSuccessful: false,
//     lastRunMessage: 'Failure',
//     lastRun: '2022-05-31T11:00:00Z',
//     nextRun: null,
//   }),
//   new DataSource({
//     id: 'ds3',
//     name: 'DataSource Three',
//     interval: 15,
//     intervalUnits: 'minutes',
//     crontab: '',
//     startTime: null,
//     endTime: null,
//     paused: false,
//     orchestrationSystem: JSON.parse(JSON.stringify(orchestrator2)),

//     lastRunSuccessful: false,
//     lastRunMessage: 'Failure',
//     lastRun: '2022-05-31T11:00:00Z',
//     nextRun: null,
//   }),
// ]
