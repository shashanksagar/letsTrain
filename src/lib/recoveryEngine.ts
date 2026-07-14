import type { WorkoutSession } from '../types'

export interface RecoverySuggestion {
  type: 'rest' | 'deload'
  message: string
}

export function analyseRecovery(sessions: WorkoutSession[]): RecoverySuggestion | null {
  if (sessions.length === 0) return null

  const sorted = [...sessions].sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())

  // Deload check: avg RPE > 8 for last 2 sessions with RPE
  const withRpe = sorted.filter(s => s.rpe !== undefined)
  if (withRpe.length >= 2) {
    const recentAvg = (withRpe[0].rpe! + withRpe[1].rpe!) / 2
    if (recentAvg > 8) {
      return { type: 'deload', message: 'Your recent sessions have been very intense. Consider a deload week with reduced weight.' }
    }
  }

  // Rest check: 3 consecutive calendar days
  if (sorted.length >= 3) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const day0 = today.getTime()
    const day1 = day0 - 86400000
    const day2 = day1 - 86400000
    const dates = sorted.slice(0, 3).map(s => { const d = new Date(s.startedAt); d.setHours(0,0,0,0); return d.getTime() })
    if (dates.includes(day0) && dates.includes(day1) && dates.includes(day2)) {
      return { type: 'rest', message: "You've trained 3 days in a row. Consider a rest day today." }
    }
  }

  return null
}
