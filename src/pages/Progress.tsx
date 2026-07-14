import { useEffect, useState } from 'react'
import { db } from '../db/db'
import { cn } from '../lib/utils'
import { StrengthChart } from '../components/progress/StrengthChart'
import { PRBoard } from '../components/progress/PRBoard'
import { VolumeChart } from '../components/progress/VolumeChart'
import { BodyweightChart } from '../components/progress/BodyweightChart'
import { WorkoutFrequencyChart } from '../components/progress/WorkoutFrequencyChart'
import { StreakCalendar } from '../components/progress/StreakCalendar'
import type { SetLog, WorkoutSession, BodyMeasurement, Exercise } from '../types'

type Tab = 'Strength' | 'Body' | 'Calendar'

interface StrengthDataPoint { date: string; weightKg: number }
interface PREntry { exerciseName: string; weightKg: number; reps: number; date: string }
interface VolumeDataPoint { muscle: string; sets: number }
interface BwDataPoint { date: string; weightKg: number; maKg?: number }
interface FreqDataPoint { week: string; sessions: number }

function toYMD(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function weekLabel(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function computeMovingAvg(data: BwDataPoint[], window = 7): BwDataPoint[] {
  return data.map((pt, i) => {
    const slice = data.slice(Math.max(0, i - window + 1), i + 1)
    const avg = slice.reduce((s, p) => s + p.weightKg, 0) / slice.length
    return { ...pt, maKg: Math.round(avg * 10) / 10 }
  })
}

export function Progress() {
  const [tab, setTab] = useState<Tab>('Strength')
  const [loading, setLoading] = useState(true)

  // Strength tab
  const [strengthData, setStrengthData] = useState<Record<string, StrengthDataPoint[]>>({})
  const [prRecords, setPrRecords] = useState<PREntry[]>([])
  const [volumeData, setVolumeData] = useState<VolumeDataPoint[]>([])

  // Body tab
  const [bwData, setBwData] = useState<BwDataPoint[]>([])

  // Shared
  const [freqData, setFreqData] = useState<FreqDataPoint[]>([])
  const [trainedDates, setTrainedDates] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      const [logs, sessions, measurements, exercises] = await Promise.all([
        db.setLogs.toArray() as Promise<SetLog[]>,
        db.workoutSessions.toArray() as Promise<WorkoutSession[]>,
        db.bodyMeasurements.orderBy('date').toArray() as Promise<BodyMeasurement[]>,
        db.exerciseLibrary.toArray() as Promise<Exercise[]>,
      ])

      const exMap = new Map<string, string>(exercises.map(e => [e.exId, e.name]))
      const sessionMap = new Map<number, WorkoutSession>(sessions.map(s => [s.id!, s]))

      // --- Strength curves (group by exId, max weight per session date) ---
      const byExId = new Map<string, Map<string, { maxW: number; reps: number }>>()
      for (const log of logs) {
        if (!byExId.has(log.exId)) byExId.set(log.exId, new Map())
        const session = sessionMap.get(log.sessionId)
        const date = session ? toYMD(session.startedAt) : toYMD(log.completedAt)
        const existing = byExId.get(log.exId)!.get(date)
        if (!existing || log.weightKg > existing.maxW) {
          byExId.get(log.exId)!.set(date, { maxW: log.weightKg, reps: log.actualReps })
        }
      }
      const newStrength: Record<string, StrengthDataPoint[]> = {}
      byExId.forEach((dateMap, exId) => {
        const sorted = Array.from(dateMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, v]) => ({ date, weightKg: v.maxW }))
        newStrength[exId] = sorted
      })
      setStrengthData(newStrength)

      // --- PRs (max weight ever per exercise, top 10) ---
      const prMap = new Map<string, { weightKg: number; reps: number; date: string }>()
      for (const log of logs) {
        const session = sessionMap.get(log.sessionId)
        const date = session ? toYMD(session.startedAt) : toYMD(log.completedAt)
        const existing = prMap.get(log.exId)
        if (!existing || log.weightKg > existing.weightKg) {
          prMap.set(log.exId, { weightKg: log.weightKg, reps: log.actualReps, date })
        }
      }
      const prs: PREntry[] = Array.from(prMap.entries())
        .map(([exId, v]) => ({ exerciseName: exMap.get(exId) ?? exId, ...v }))
        .sort((a, b) => b.weightKg - a.weightKg)
        .slice(0, 10)
      setPrRecords(prs)

      // --- Volume: sets per muscle group last 7 days ---
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const recentLogs = logs.filter(l => {
        const session = sessionMap.get(l.sessionId)
        const date = session ? session.startedAt : l.completedAt
        return date >= sevenDaysAgo
      })
      const muscleSetMap = new Map<string, number>()
      for (const log of recentLogs) {
        const ex = exercises.find(e => e.exId === log.exId)
        if (ex) {
          for (const mg of ex.muscleGroups) {
            muscleSetMap.set(mg, (muscleSetMap.get(mg) ?? 0) + 1)
          }
        }
      }
      setVolumeData(Array.from(muscleSetMap.entries()).map(([muscle, sets]) => ({ muscle, sets })))

      // --- Bodyweight trend ---
      const bwPoints: BwDataPoint[] = measurements
        .filter(m => m.weightKg != null)
        .map(m => ({ date: toYMD(m.date), weightKg: m.weightKg! }))
      setBwData(computeMovingAvg(bwPoints))

      // --- Sessions per week (last 8 weeks) ---
      const now = new Date()
      const weeks: FreqDataPoint[] = []
      for (let w = 7; w >= 0; w--) {
        const start = new Date(now)
        start.setDate(now.getDate() - w * 7 - now.getDay())
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(start.getDate() + 7)
        const count = sessions.filter(s => s.startedAt >= start && s.startedAt < end).length
        weeks.push({ week: weekLabel(start), sessions: count })
      }
      setFreqData(weeks)

      // --- Trained dates ---
      const dates = new Set(sessions.map(s => toYMD(s.startedAt)))
      setTrainedDates(dates)

      setLoading(false)
    }
    load()
  }, [])

  const TABS: Tab[] = ['Strength', 'Body', 'Calendar']

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="max-w-sm mx-auto px-4 pt-6 pb-24">
        <h1 className="text-2xl font-bold text-white mb-4">Progress</h1>

        {/* Tab bar */}
        <div className="flex gap-2 mb-6 bg-[#161b22] rounded-xl p-1">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                tab === t ? 'bg-[#00d4aa] text-black' : 'text-gray-400 hover:text-white'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {loading && <p className="text-white/50 text-center">Loading…</p>}

        {!loading && tab === 'Strength' && (
          <div className="flex flex-col gap-6">
            {Object.entries(strengthData).map(([exId, data]) => (
              <div key={exId} className="bg-[#161b22] rounded-xl p-4 border border-white/10">
                <StrengthChart data={data} exerciseName={prRecords.find(p => p.exerciseName === exId)?.exerciseName ?? exId} />
              </div>
            ))}
            <div className="bg-[#161b22] rounded-xl p-4 border border-white/10">
              <PRBoard records={prRecords} />
            </div>
            <div className="bg-[#161b22] rounded-xl p-4 border border-white/10">
              <VolumeChart data={volumeData} />
            </div>
          </div>
        )}

        {!loading && tab === 'Body' && (
          <div className="flex flex-col gap-6">
            <div className="bg-[#161b22] rounded-xl p-4 border border-white/10">
              <h3 className="text-white font-semibold mb-3">Bodyweight Trend</h3>
              <BodyweightChart data={bwData} />
            </div>
            <div className="bg-[#161b22] rounded-xl p-4 border border-white/10">
              <WorkoutFrequencyChart data={freqData} />
            </div>
          </div>
        )}

        {!loading && tab === 'Calendar' && (
          <div className="flex flex-col gap-6">
            <div className="bg-[#161b22] rounded-xl p-4 border border-white/10">
              <StreakCalendar trainedDates={trainedDates} />
            </div>
            <div className="bg-[#161b22] rounded-xl p-4 border border-white/10">
              <WorkoutFrequencyChart data={freqData} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
