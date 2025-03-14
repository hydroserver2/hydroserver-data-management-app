import { describe, it, expect } from 'vitest'
import { getStatus } from '@/utils/dataSourceUtils'
import dataSourceFixtures from '@/utils/test/fixtures/dataSourceFixtures'

describe('getStatus', () => {
  it('returns "pending" if lastRun is not set', () => {
    let dataSource = JSON.parse(JSON.stringify(dataSourceFixtures[0]))
    dataSource = { ...dataSource, lastRun: null }
    expect(getStatus(dataSource)).toBe('pending')
  })

  it('returns "ok" if lastRunSuccessful is false but nextRun is in the future', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1) // Set to tomorrow
    let dataSource = JSON.parse(JSON.stringify(dataSourceFixtures[0]))

    dataSource = {
      ...dataSource,
      lastRun: new Date(),
      lastRunSuccessful: false,
      nextRun: futureDate.toISOString(),
    }
    expect(getStatus(dataSource)).toBe('ok')
  })

  it('returns "bad" if lastRunSuccessful is false and dataSourceThru is null', () => {
    let dataSource = JSON.parse(JSON.stringify(dataSourceFixtures[0]))
    dataSource = {
      ...dataSource,
      lastRun: new Date(),
      lastRunSuccessful: false,
      dataSourceThru: null,
    }
    expect(getStatus(dataSource)).toBe('bad')
  })

  it('returns "stale" if nextRun is in the past', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1)

    let dataSource = JSON.parse(JSON.stringify(dataSourceFixtures[0]))
    dataSource = {
      ...dataSource,
      lastRun: new Date(),
      nextRun: pastDate.toISOString(),
    }
    expect(getStatus(dataSource)).toBe('stale')
  })

  it('returns "bad" for other conditions', () => {
    let dataSource = JSON.parse(JSON.stringify(dataSourceFixtures[1]))
    dataSource = {
      ...dataSource,
      lastRun: new Date(),
      lastRunSuccessful: true,
    }
    expect(getStatus(dataSource)).toBe('bad')
  })
})
