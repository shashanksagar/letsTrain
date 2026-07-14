# letsTrain Plan 3 — Progress Dashboard, Body Measurements & Calendar

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Progress dashboard (strength curves, PR board, streak calendar, volume charts), the Body Measurements logging screen, and the Calendar/habit tracker view.

**Architecture:** All charts use Recharts. Data is read from IndexedDB via Dexie. The Progress page is tabbed: Strength / Body / Calendar. Body Measurements is a separate logging page. The calendar is a custom month grid (no external calendar library needed).

**Tech Stack:** React 18, Recharts, Dexie.js, TypeScript, Vitest

**Depends on:** Plans 1 & 2 complete (db schema, setLogs, workoutSessions, bodyMeasurements tables, routing).

---

## File Map

```
src/
├── pages/
│   ├── Progress.tsx                  # Tabbed progress page
│   └── LogBody.tsx                   # Body measurement entry form
├── components/
│   ├── progress/
│   │   ├── StrengthChart.tsx         # Line chart: weight over time per exercise
│   │   ├── VolumeChart.tsx           # Bar chart: weekly sets per muscle group
│   │   ├── BodyweightChart.tsx       # Line chart with 7-day moving average
│   │   ├── MeasurementsChart.tsx     # Line chart for body measurements
│   │   ├── PRBoard.tsx               # All-time personal records table
│   │   ├── StreakCalendar.tsx        # GitHub-style training heatmap
│   │   └── WorkoutFrequencyChart.tsx # Bar chart: sessions per week
│   └── logbody/
│       └── MeasurementForm.tsx       # Form to log body measurements
└── test/
    ├── progress.test.tsx
    └── logBody.test.tsx
```

---

## Task 1: Install Recharts

**Files:**
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install Recharts**

```bash
npm install recharts
```

- [ ] **Step 2: Verify install**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install recharts"
```

---

## Task 2: Strength Chart

**Files:**
- Create: `src/components/progress/StrengthChart.tsx`

- [ ] **Step 1: Create `src/components/progress/StrengthChart.tsx`**

```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface DataPoint { date: string; weightKg: number }
interface Props { data: DataPoint[]; exerciseName: string }

export function StrengthChart({ data, exerciseName }: Props) {
  if (data.length < 2) return (
    <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
      Log at least 2 sessions to see your strength curve.
    </div>
  )
  return (
    <div>
      <h3 className="text-white font-semibold mb-3">{exerciseName}</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#161b22', border: '1px solid #ffffff20', borderRadius: 8 }}
            labelStyle={{ color: '#9ca3af' }}
            itemStyle={{ color: '#00d4aa' }}
          />
          <Line type="monotone" dataKey="weightKg" stroke="#00d4aa" strokeWidth={2} dot={{ fill: '#00d4aa', r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/progress/StrengthChart.tsx
git commit -m "feat: add StrengthChart component"
```

---

## Task 3: Volume, Bodyweight, Frequency Charts

**Files:**
- Create: `src/components/progress/VolumeChart.tsx`
- Create: `src/components/progress/BodyweightChart.tsx`
- Create: `src/components/progress/WorkoutFrequencyChart.tsx`

- [ ] **Step 1: Create `src/components/progress/VolumeChart.tsx`**

```typescript
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface DataPoint { muscle: string; sets: number }
interface Props { data: DataPoint[] }

export function VolumeChart({ data }: Props) {
  if (data.length === 0) return (
    <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
      No volume data yet.
    </div>
  )
  return (
    <div>
      <h3 className="text-white font-semibold mb-3">Weekly Volume by Muscle</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 40, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="muscle" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-45} textAnchor="end" />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#161b22', border: '1px solid #ffffff20', borderRadius: 8 }}
            labelStyle={{ color: '#9ca3af' }}
            itemStyle={{ color: '#0080ff' }}
          />
          <Bar dataKey="sets" fill="#0080ff" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/progress/BodyweightChart.tsx`**

```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

interface DataPoint { date: string; weightKg: number; maKg?: number }
interface Props { data: DataPoint[] }

export function BodyweightChart({ data }: Props) {
  if (data.length < 2) return (
    <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
      Log at least 2 measurements to see your trend.
    </div>
  )
  return (
    <div>
      <h3 className="text-white font-semibold mb-3">Bodyweight Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#161b22', border: '1px solid #ffffff20', borderRadius: 8 }}
            labelStyle={{ color: '#9ca3af' }}
          />
          <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
          <Line type="monotone" dataKey="weightKg" stroke="#00d4aa" strokeWidth={2} dot={{ r: 2 }} name="Weight (kg)" />
          <Line type="monotone" dataKey="maKg" stroke="#0080ff" strokeWidth={2} dot={false} strokeDasharray="4 2" name="7-day avg" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/progress/WorkoutFrequencyChart.tsx`**

```typescript
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface DataPoint { week: string; sessions: number }
interface Props { data: DataPoint[] }

export function WorkoutFrequencyChart({ data }: Props) {
  if (data.length === 0) return (
    <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
      No sessions logged yet.
    </div>
  )
  return (
    <div>
      <h3 className="text-white font-semibold mb-3">Sessions per Week</h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="week" tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#161b22', border: '1px solid #ffffff20', borderRadius: 8 }}
            labelStyle={{ color: '#9ca3af' }}
            itemStyle={{ color: '#00d4aa' }}
          />
          <Bar dataKey="sessions" fill="#00d4aa" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/progress/
git commit -m "feat: add VolumeChart, BodyweightChart, WorkoutFrequencyChart"
```

---

## Task 4: PR Board

**Files:**
- Create: `src/components/progress/PRBoard.tsx`

- [ ] **Step 1: Create `src/components/progress/PRBoard.tsx`**

```typescript
interface PREntry { exerciseName: string; weightKg: number; reps: number; date: string }
interface Props { records: PREntry[] }

export function PRBoard({ records }: Props) {
  if (records.length === 0) return (
    <div className="flex items-center justify-center h-24 text-gray-500 text-sm">
      No personal records yet — keep lifting!
    </div>
  )
  return (
    <div>
      <h3 className="text-white font-semibold mb-3">Personal Records</h3>
      <div className="flex flex-col gap-2">
        {records.map(pr => (
          <div key={pr.exerciseName} className="flex items-center justify-between bg-[#161b22] rounded-lg px-4 py-3 border border-white/10">
            <div>
              <p className="text-white text-sm font-medium">{pr.exerciseName}</p>
              <p className="text-gray-400 text-xs">{pr.date}</p>
            </div>
            <div className="text-right">
              <p className="text-teal font-bold">{pr.weightKg}kg</p>
              <p className="text-gray-400 text-xs">× {pr.reps} reps</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/progress/PRBoard.tsx
git commit -m "feat: add PR board component"
```

---

## Task 5: Streak Calendar

**Files:**
- Create: `src/components/progress/StreakCalendar.tsx`

- [ ] **Step 1: Create `src/components/progress/StreakCalendar.tsx`**

```typescript
interface Props { trainedDates: Set<string> }  // dates as "YYYY-MM-DD"

function getLastNWeeks(n: number): string[][] {
  const weeks: string[][] = []
  const today = new Date()
  // Pad to last Sunday
  const endDay = new Date(today)
  endDay.setDate(today.getDate() + (6 - today.getDay()))

  for (let w = n - 1; w >= 0; w--) {
    const week: string[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(endDay)
      date.setDate(endDay.getDate() - w * 7 - (6 - d))
      week.push(date.toISOString().slice(0, 10))
    }
    weeks.push(week)
  }
  return weeks
}

export function StreakCalendar({ trainedDates }: Props) {
  const weeks = getLastNWeeks(16)
  const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div>
      <h3 className="text-white font-semibold mb-3">Training Streak</h3>
      <div className="overflow-x-auto">
        <div className="flex gap-1">
          <div className="flex flex-col gap-1 mr-1">
            {DAY_LABELS.map(l => (
              <div key={l} className="w-3 h-3 flex items-center justify-center text-[9px] text-gray-600">{l}</div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map(date => (
                <div
                  key={date}
                  title={date}
                  className={`w-3 h-3 rounded-sm ${
                    trainedDates.has(date) ? 'bg-teal' : 'bg-[#161b22]'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="text-gray-500 text-xs mt-2">{trainedDates.size} sessions in the last 16 weeks</p>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/progress/StreakCalendar.tsx
git commit -m "feat: add GitHub-style streak calendar"
```

---

## Task 6: Progress Page (Tabbed)

**Files:**
- Create: `src/pages/Progress.tsx`
- Create: `src/test/progress.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/progress.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import 'fake-indexeddb/auto'
import { db } from '../db/db'
import { Progress } from '../pages/Progress'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }))

beforeEach(async () => {
  await db.delete()
  await db.open()
  mockNavigate.mockClear()
})

describe('Progress page', () => {
  it('renders the Strength tab by default', async () => {
    render(<Progress />)
    await waitFor(() => expect(screen.getByText('Strength')).toBeInTheDocument())
  })

  it('switches to Body tab on click', async () => {
    render(<Progress />)
    await waitFor(() => fireEvent.click(screen.getByText('Body')))
    expect(screen.getByText('Bodyweight Trend')).toBeInTheDocument()
  })

  it('switches to Calendar tab on click', async () => {
    render(<Progress />)
    await waitFor(() => fireEvent.click(screen.getByText('Calendar')))
    expect(screen.getByText('Training Streak')).toBeInTheDocument()
  })

  it('shows PR Board when no data', async () => {
    render(<Progress />)
    await waitFor(() => expect(screen.getByText(/personal records/i)).toBeInTheDocument())
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx vitest run src/test/progress.test.tsx
```
Expected: FAIL — "Cannot find module '../pages/Progress'"

- [ ] **Step 3: Create `src/pages/Progress.tsx`**

```typescript
import { useEffect, useState } from 'react'
import { db } from '../db/db'
import { StrengthChart } from '../components/progress/StrengthChart'
import { VolumeChart } from '../components/progress/VolumeChart'
import { BodyweightChart } from '../components/progress/BodyweightChart'
import { WorkoutFrequencyChart } from '../components/progress/WorkoutFrequencyChart'
import { PRBoard } from '../components/progress/PRBoard'
import { StreakCalendar } from '../components/progress/StreakCalendar'
import { cn } from '../lib/utils'
import type { MuscleGroup } from '../types'

type Tab = 'strength' | 'body' | 'calendar'

interface StrengthData { exId: string; name: string; points: { date: string; weightKg: number }[] }
interface PREntry { exerciseName: string; weightKg: number; reps: number; date: string }

export function Progress() {
  const [tab, setTab] = useState<Tab>('strength')
  const [strengthData, setStrengthData] = useState<StrengthData[]>([])
  const [prRecords, setPRRecords] = useState<PREntry[]>([])
  const [volumeData, setVolumeData] = useState<{ muscle: string; sets: number }[]>([])
  const [bwData, setBwData] = useState<{ date: string; weightKg: number; maKg?: number }[]>([])
  const [freqData, setFreqData] = useState<{ week: string; sessions: number }[]>([])
  const [trainedDates, setTrainedDates] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)

    // Strength curves & PRs
    const setLogs = await db.setLogs.toArray()
    const sessions = await db.workoutSessions.toArray()
    const exercises = await db.exerciseLibrary.toArray()
    const exMap = new Map(exercises.map(e => [e.exId, e]))

    // Group sets by exercise
    const byExercise = new Map<string, typeof setLogs>()
    for (const s of setLogs) {
      byExercise.set(s.exId, [...(byExercise.get(s.exId) ?? []), s])
    }

    // Build strength curves (max weight per session per exercise)
    const sessionMap = new Map(sessions.map(s => [s.id!, s]))
    const strengthArr: StrengthData[] = []
    const prs: PREntry[] = []
    for (const [exId, logs] of byExercise) {
      const bySession = new Map<number, typeof logs>()
      for (const l of logs) bySession.set(l.sessionId, [...(bySession.get(l.sessionId) ?? []), l])
      const points = Array.from(bySession.entries()).map(([sid, sLogs]) => {
        const session = sessionMap.get(sid)
        const maxWeight = Math.max(...sLogs.map(l => l.weightKg))
        return { date: session?.startedAt.toISOString().slice(0, 10) ?? '', weightKg: maxWeight, reps: sLogs.find(l => l.weightKg === maxWeight)?.actualReps ?? 0 }
      }).sort((a, b) => a.date.localeCompare(b.date))

      const name = exMap.get(exId)?.name ?? exId
      strengthArr.push({ exId, name, points: points.map(p => ({ date: p.date.slice(5), weightKg: p.weightKg })) })

      // PR: max weight ever
      const pr = points.reduce((best, p) => p.weightKg > best.weightKg ? p : best, points[0])
      if (pr) prs.push({ exerciseName: name, weightKg: pr.weightKg, reps: pr.reps, date: pr.date })
    }

    // Volume: total sets per muscle in the last 7 days
    const oneWeekAgo = new Date(); oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const recentSessions = sessions.filter(s => s.startedAt >= oneWeekAgo)
    const recentSessionIds = new Set(recentSessions.map(s => s.id!))
    const recentSets = setLogs.filter(l => recentSessionIds.has(l.sessionId))
    const muscleVolume = new Map<MuscleGroup, number>()
    for (const s of recentSets) {
      const muscles = exMap.get(s.exId)?.muscleGroups ?? []
      for (const m of muscles) muscleVolume.set(m, (muscleVolume.get(m) ?? 0) + 1)
    }
    setVolumeData(Array.from(muscleVolume.entries()).map(([muscle, sets]) => ({ muscle, sets })))

    // Bodyweight trend
    const measurements = await db.bodyMeasurements.orderBy('date').toArray()
    const bwPoints = measurements.filter(m => m.weightKg).map(m => ({
      date: m.date.toISOString().slice(5, 10),
      weightKg: m.weightKg!,
    }))
    // 7-day moving average
    const bwWithMA = bwPoints.map((p, i) => {
      const window = bwPoints.slice(Math.max(0, i - 6), i + 1)
      const ma = window.reduce((sum, w) => sum + w.weightKg, 0) / window.length
      return { ...p, maKg: Math.round(ma * 10) / 10 }
    })
    setBwData(bwWithMA)

    // Sessions per week (last 8 weeks)
    const weekMap = new Map<string, number>()
    for (const s of sessions) {
      const d = new Date(s.startedAt)
      const weekStart = new Date(d); weekStart.setDate(d.getDate() - d.getDay())
      const key = weekStart.toISOString().slice(5, 10)
      weekMap.set(key, (weekMap.get(key) ?? 0) + 1)
    }
    const sortedWeeks = Array.from(weekMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).slice(-8)
    setFreqData(sortedWeeks.map(([week, sessions]) => ({ week, sessions })))

    // Trained dates for streak calendar
    const trained = new Set(sessions.map(s => s.startedAt.toISOString().slice(0, 10)))
    setTrainedDates(trained)

    setStrengthData(strengthArr)
    setPRRecords(prs.sort((a, b) => b.weightKg - a.weightKg).slice(0, 10))
    setLoading(false)
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'strength', label: 'Strength' },
    { key: 'body', label: 'Body' },
    { key: 'calendar', label: 'Calendar' },
  ]

  return (
    <div className="min-h-screen bg-[#0d1117] p-4">
      <div className="max-w-sm mx-auto">
        <h1 className="text-2xl font-bold text-white pt-4 mb-6">Progress</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#161b22] rounded-lg p-1 mb-6">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex-1 py-2 rounded-md text-sm font-medium transition-all',
                tab === t.key ? 'bg-teal text-black' : 'text-gray-400 hover:text-white'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-400">Loading…</p>
          </div>
        ) : (
          <>
            {tab === 'strength' && (
              <div className="flex flex-col gap-8">
                {strengthData.length > 0
                  ? strengthData.map(d => <StrengthChart key={d.exId} data={d.points} exerciseName={d.name} />)
                  : <p className="text-gray-500 text-sm">No strength data yet. Log a workout to get started.</p>
                }
                <PRBoard records={prRecords} />
                <VolumeChart data={volumeData} />
              </div>
            )}
            {tab === 'body' && (
              <div className="flex flex-col gap-8">
                <BodyweightChart data={bwData} />
                <WorkoutFrequencyChart data={freqData} />
              </div>
            )}
            {tab === 'calendar' && (
              <div className="flex flex-col gap-8">
                <StreakCalendar trainedDates={trainedDates} />
                <WorkoutFrequencyChart data={freqData} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Add `/progress` route in `src/App.tsx`**

```typescript
import { Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './pages/Onboarding'
import { Home } from './pages/Home'
import { MyProgram } from './pages/MyProgram'
import { WorkoutLogger } from './pages/WorkoutLogger'
import { Progress } from './pages/Progress'

export default function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/home" element={<Home />} />
      <Route path="/program" element={<MyProgram />} />
      <Route path="/workout/:programId/:dayIndex" element={<WorkoutLogger />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="*" element={<Navigate to="/onboarding" replace />} />
    </Routes>
  )
}
```

- [ ] **Step 5: Run progress tests**

```bash
npx vitest run src/test/progress.test.tsx
```
Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
git add src/pages/Progress.tsx src/components/progress/PRBoard.tsx src/components/progress/StreakCalendar.tsx src/App.tsx src/test/progress.test.tsx
git commit -m "feat: add Progress page — strength curves, PR board, streak calendar, volume chart"
```

---

## Task 7: Body Measurements Form

**Files:**
- Create: `src/components/logbody/MeasurementForm.tsx`
- Create: `src/pages/LogBody.tsx`
- Create: `src/test/logBody.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/logBody.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import 'fake-indexeddb/auto'
import { db } from '../db/db'
import { LogBody } from '../pages/LogBody'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }))

beforeEach(async () => {
  await db.delete()
  await db.open()
  mockNavigate.mockClear()
})

describe('LogBody', () => {
  it('renders the body weight field', () => {
    render(<LogBody />)
    expect(screen.getByLabelText(/bodyweight/i)).toBeInTheDocument()
  })

  it('saves a measurement and navigates back', async () => {
    render(<LogBody />)
    await userEvent.type(screen.getByLabelText(/bodyweight/i), '80')
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(-1))
    const count = await db.bodyMeasurements.count()
    expect(count).toBe(1)
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx vitest run src/test/logBody.test.tsx
```
Expected: FAIL — "Cannot find module '../pages/LogBody'"

- [ ] **Step 3: Create `src/components/logbody/MeasurementForm.tsx`**

```typescript
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import type { BodyMeasurement } from '../../types'

type FormState = Omit<BodyMeasurement, 'id' | 'date'>

interface Props {
  values: FormState
  onChange: (field: keyof FormState, value: number) => void
  onSave: () => void
  saving: boolean
}

const FIELDS: { key: keyof FormState; label: string }[] = [
  { key: 'weightKg', label: 'Bodyweight (kg)' },
  { key: 'bodyFatPct', label: 'Body Fat (%)' },
  { key: 'chestCm', label: 'Chest (cm)' },
  { key: 'waistCm', label: 'Waist (cm)' },
  { key: 'hipsCm', label: 'Hips (cm)' },
  { key: 'leftArmCm', label: 'Left Arm (cm)' },
  { key: 'rightArmCm', label: 'Right Arm (cm)' },
  { key: 'leftThighCm', label: 'Left Thigh (cm)' },
  { key: 'rightThighCm', label: 'Right Thigh (cm)' },
]

export function MeasurementForm({ values, onChange, onSave, saving }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {FIELDS.map(f => (
        <Input
          key={f.key}
          id={f.key}
          label={f.label}
          type="number"
          min={0}
          placeholder="Optional"
          value={values[f.key] ?? ''}
          onChange={e => onChange(f.key, Number(e.target.value))}
        />
      ))}
      <Button size="lg" onClick={onSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save'}
      </Button>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/pages/LogBody.tsx`**

```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../db/db'
import { MeasurementForm } from '../components/logbody/MeasurementForm'
import type { BodyMeasurement } from '../types'

type FormState = Omit<BodyMeasurement, 'id' | 'date'>

const EMPTY: FormState = {
  weightKg: undefined, bodyFatPct: undefined,
  chestCm: undefined, waistCm: undefined, hipsCm: undefined,
  leftArmCm: undefined, rightArmCm: undefined,
  leftThighCm: undefined, rightThighCm: undefined,
}

export function LogBody() {
  const navigate = useNavigate()
  const [values, setValues] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)

  function handleChange(field: keyof FormState, value: number) {
    setValues(prev => ({ ...prev, [field]: value || undefined }))
  }

  async function handleSave() {
    setSaving(true)
    await db.bodyMeasurements.add({ ...values, date: new Date() })
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-[#0d1117] p-4">
      <div className="max-w-sm mx-auto">
        <h1 className="text-2xl font-bold text-white pt-4 mb-6">Log Body</h1>
        <p className="text-gray-400 text-sm mb-6">All fields are optional. Log what you have.</p>
        <MeasurementForm values={values} onChange={handleChange} onSave={handleSave} saving={saving} />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Add `/log-body` route in `src/App.tsx`**

```typescript
import { Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './pages/Onboarding'
import { Home } from './pages/Home'
import { MyProgram } from './pages/MyProgram'
import { WorkoutLogger } from './pages/WorkoutLogger'
import { Progress } from './pages/Progress'
import { LogBody } from './pages/LogBody'

export default function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/home" element={<Home />} />
      <Route path="/program" element={<MyProgram />} />
      <Route path="/workout/:programId/:dayIndex" element={<WorkoutLogger />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/log-body" element={<LogBody />} />
      <Route path="*" element={<Navigate to="/onboarding" replace />} />
    </Routes>
  )
}
```

- [ ] **Step 6: Run log body tests**

```bash
npx vitest run src/test/logBody.test.tsx
```
Expected: PASS (2 tests)

- [ ] **Step 7: Run all tests**

```bash
npx vitest run
```
Expected: All tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/logbody/ src/pages/LogBody.tsx src/App.tsx src/test/logBody.test.tsx
git commit -m "feat: add Body Measurements logging page"
```

---

## Task 8: Bottom Navigation Bar

**Files:**
- Create: `src/components/ui/BottomNav.tsx`
- Modify: `src/App.tsx` (wrap with nav)

- [ ] **Step 1: Create `src/components/ui/BottomNav.tsx`**

```typescript
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'

const TABS = [
  { path: '/home',     icon: '🏠', label: 'Home' },
  { path: '/program',  icon: '📋', label: 'Program' },
  { path: '/progress', icon: '📈', label: 'Progress' },
  { path: '/log-body', icon: '⚖️',  label: 'Body' },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  // Don't show nav on onboarding or during active workout
  if (location.pathname.startsWith('/onboarding') || location.pathname.startsWith('/workout')) return null

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-[#161b22] border-t border-white/10 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-sm mx-auto">
        {TABS.map(t => (
          <button
            key={t.path}
            onClick={() => navigate(t.path)}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors',
              location.pathname === t.path ? 'text-teal' : 'text-gray-500 hover:text-gray-300'
            )}
          >
            <span className="text-xl leading-none">{t.icon}</span>
            <span className="text-[10px] font-medium">{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Update `src/App.tsx` to include BottomNav**

```typescript
import { Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './pages/Onboarding'
import { Home } from './pages/Home'
import { MyProgram } from './pages/MyProgram'
import { WorkoutLogger } from './pages/WorkoutLogger'
import { Progress } from './pages/Progress'
import { LogBody } from './pages/LogBody'
import { BottomNav } from './components/ui/BottomNav'

export default function App() {
  return (
    <>
      <div className="pb-16">
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/home" element={<Home />} />
          <Route path="/program" element={<MyProgram />} />
          <Route path="/workout/:programId/:dayIndex" element={<WorkoutLogger />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/log-body" element={<LogBody />} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </>
  )
}
```

- [ ] **Step 3: Run all tests**

```bash
npx vitest run
```
Expected: All tests pass.

- [ ] **Step 4: Manual end-to-end test**

```bash
npm run dev
```
Test path:
1. Complete onboarding
2. Tap "Build My Program" → see program days
3. Start a workout → log 2 sets → finish
4. Tap Progress in nav → Strength tab shows a chart for the exercise you logged
5. Tap Calendar tab → streak calendar shows today filled in
6. Tap Body in nav → log weight → save → navigates back
7. Back on Progress → Body tab → bodyweight chart shows the entry

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/BottomNav.tsx src/App.tsx
git commit -m "feat: add bottom navigation bar"
```

---

## Plan 3 Complete ✅

Progress dashboard (strength curves, PR board, volume, streak calendar, bodyweight trend), Body Measurements screen, and bottom navigation — all done.

**Next:** Plan 4 — Nutrition Logger, Recovery Engine, Social/Export.
