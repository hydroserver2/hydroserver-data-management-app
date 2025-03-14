import { DataSource } from '@/models'

export function getStatus(
  ds: DataSource
): 'ok' | 'pending' | 'bad' | 'stale' | 'unknown' {
  if (!ds.lastRun) return 'pending'

  let now = new Date()
  let nextRun = ds.nextRun ? new Date(Date.parse(ds.nextRun)) : null

  if (!ds.lastRunSuccessful && nextRun && nextRun >= now) {
    return 'ok'
  } else if (!ds.lastRunSuccessful) {
    return 'bad'
  } else if (nextRun && nextRun < now) {
    return 'stale'
  }
  return 'bad'
}
