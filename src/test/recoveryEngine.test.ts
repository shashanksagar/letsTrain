import { describe, it, expect } from 'vitest'
import { analyseRecovery } from '../lib/recoveryEngine'
import type { WorkoutSession } from '../types'

function makeSession(daysAgo: number, rpe?: number): WorkoutSession {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return { id: daysAgo, programId: 1, dayLabel: 'Push', startedAt: d, finishedAt: d, rpe }
}

describe('analyseRecovery', () => {
  it('returns no suggestion when sessions are spread out', () => {
    const sessions = [makeSession(6), makeSession(4), makeSession(2)]
    expect(analyseRecovery(sessions)).toBeNull()
  })

  it('suggests rest day after 3 consecutive training days', () => {
    const sessions = [makeSession(2), makeSession(1), makeSession(0)]
    expect(analyseRecovery(sessions)?.type).toBe('rest')
  })

  it('suggests deload when avg RPE > 8 for 2+ recent sessions', () => {
    const sessions = [makeSession(1, 9), makeSession(0, 9)]
    expect(analyseRecovery(sessions)?.type).toBe('deload')
  })

  it('deload takes priority over rest day', () => {
    const sessions = [makeSession(2, 9), makeSession(1, 9), makeSession(0, 9)]
    expect(analyseRecovery(sessions)?.type).toBe('deload')
  })

  it('returns null when no sessions', () => {
    expect(analyseRecovery([])).toBeNull()
  })
})
