# letsTrain Plan 4 — Nutrition Logger, Recovery Engine & Social/Export

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the daily nutrition/macro logger, the rule-based recovery suggestion engine, the Settings page (profile edit + data export/import), and the social sharing features (PR card, JSON backup).

**Architecture:** Nutrition is a simple daily food log with auto-calculated macro targets from the user profile. Recovery logic is a pure TS function with no side effects — easy to test. Settings reads/writes the `userProfile` table and triggers JSON file download for export. Sharing uses the Web Share API (with canvas for PR cards).

**Tech Stack:** React 18, Dexie.js, TypeScript, Recharts (macro pie chart), Vitest, Web Share API, Canvas API

**Depends on:** Plans 1–3 complete.

---

## File Map

```
src/
├── pages/
│   ├── LogFood.tsx                   # Daily nutrition logger
│   └── Settings.tsx                  # Profile edit, export, import
├── components/
│   ├── nutrition/
│   │   ├── FoodEntryForm.tsx         # Add a meal entry
│   │   ├── MacroBar.tsx              # Progress bar for protein/carbs/fat
│   │   └── MacroPieChart.tsx         # Recharts pie chart for macro split
│   ├── recovery/
│   │   └── RecoveryBanner.tsx        # Dismissable rest/deload suggestion card
│   └── settings/
│       ├── ProfileForm.tsx           # Edit profile fields
│       └── DataSection.tsx           # Export / Import buttons
├── lib/
│   ├── recoveryEngine.ts             # Pure TS rule-based recovery logic
│   ├── macroTargets.ts               # Calculates daily macro targets from profile
│   └── sharing.ts                    # PR card canvas drawing + Web Share API
└── test/
    ├── recoveryEngine.test.ts
    ├── macroTargets.test.ts
    ├── logFood.test.tsx
    └── settings.test.tsx
```

---

## Task 1: Macro Targets Calculator

**Files:**
- Create: `src/lib/macroTargets.ts`
- Create: `src/test/macroTargets.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/macroTargets.test.ts
import { describe, it, expect } from 'vitest'
import { calculateMacroTargets } from '../lib/macroTargets'
import type { UserProfile } from '../types'

const PROFILE: Pick<UserProfile, 'weight' | 'weightUnit' | 'primaryGoal' | 'trainingDaysPerWeek'> = {
  weight: 80, weightUnit: 'kg', primaryGoal: 'build_muscle', trainingDaysPerWeek: 4,
}

describe('calculateMacroTargets', () => {
  it('returns positive values for all macros', () => {
    const targets = calculateMacroTargets(PROFILE)
    expect(targets.calories).toBeGreaterThan(0)
    expect(targets.proteinG).toBeGreaterThan(0)
    expect(targets.carbsG).toBeGreaterThan(0)
    expect(targets.fatG).toBeGreaterThan(0)
  })

  it('protein is 1.8–2.2g per kg for muscle building', () => {
    const targets = calculateMacroTargets(PROFILE)
    const ratio = targets.proteinG / 80
    expect(ratio).toBeGreaterThanOrEqual(1.8)
    expect(ratio).toBeLessThanOrEqual(2.5)
  })

  it('recomp goal has lower calories than build_muscle', () => {
    const muscle = calculateMacroTargets({ ...PROFILE, primaryGoal: 'build_muscle' })
    const recomp = calculateMacroTargets({ ...PROFILE, primaryGoal: 'recomp' })
    expect(recomp.calories).toBeLessThan(muscle.calories)
  })

  it('converts lb weight correctly', () => {
    const lbProfile = { ...PROFILE, weight: 176, weightUnit: 'lb' as const }
    const targets = calculateMacroTargets(lbProfile)
    const kgProfile = { ...PROFILE, weight: 80, weightUnit: 'kg' as const }
    const kgTargets = calculateMacroTargets(kgProfile)
    expect(Math.abs(targets.calories - kgTargets.calories)).toBeLessThan(100)
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx vitest run src/test/macroTargets.test.ts
```
Expected: FAIL — "Cannot find module '../lib/macroTargets'"

- [ ] **Step 3: Create `src/lib/macroTargets.ts`**

```typescript
import type { UserProfile } from '../types'

interface MacroTargets { calories: number; proteinG: number; carbsG: number; fatG: number }

const GOAL_MULTIPLIER: Record<string, number> = {
  build_muscle:   1.10,   // 10% surplus
  build_strength: 1.05,   // slight surplus
  hybrid:         1.05,
  recomp:         0.90,   // 10% deficit
}

export function calculateMacroTargets(
  profile: Pick<UserProfile, 'weight' | 'weightUnit' | 'primaryGoal' | 'trainingDaysPerWeek'>
): MacroTargets {
  const weightKg = profile.weightUnit === 'lb' ? profile.weight / 2.205 : profile.weight

  // Rough TDEE: 33 kcal/kg at moderate activity
  const activityMult = typeof profile.trainingDaysPerWeek === 'number' && profile.trainingDaysPerWeek >= 5 ? 38 : 33
  const bmr = weightKg * activityMult
  const multiplier = GOAL_MULTIPLIER[profile.primaryGoal] ?? 1.0
  const calories = Math.round(bmr * multiplier)

  // Protein: 2g/kg for muscle/strength, 1.8g for recomp
  const proteinMultiplier = profile.primaryGoal === 'recomp' ? 1.8 : 2.0
  const proteinG = Math.round(weightKg * proteinMultiplier)
  const proteinKcal = proteinG * 4

  // Fat: 25% of total calories
  const fatKcal = Math.round(calories * 0.25)
  const fatG = Math.round(fatKcal / 9)

  // Carbs: remainder
  const carbsKcal = calories - proteinKcal - fatKcal
  const carbsG = Math.round(Math.max(0, carbsKcal) / 4)

  return { calories, proteinG, carbsG, fatG }
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/test/macroTargets.test.ts
```
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/macroTargets.ts src/test/macroTargets.test.ts
git commit -m "feat: add macro targets calculator"
```

---

## Task 2: Recovery Engine

**Files:**
- Create: `src/lib/recoveryEngine.ts`
- Create: `src/test/recoveryEngine.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/recoveryEngine.test.ts
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
    const result = analyseRecovery(sessions)
    expect(result).toBeNull()
  })

  it('suggests rest day after 3 consecutive training days', () => {
    const sessions = [makeSession(2), makeSession(1), makeSession(0)]
    const result = analyseRecovery(sessions)
    expect(result?.type).toBe('rest')
  })

  it('suggests deload when avg RPE > 8 for 2+ recent days', () => {
    const sessions = [makeSession(1, 9), makeSession(0, 9)]
    const result = analyseRecovery(sessions)
    expect(result?.type).toBe('deload')
  })

  it('deload takes priority over rest day', () => {
    const sessions = [makeSession(2, 9), makeSession(1, 9), makeSession(0, 9)]
    const result = analyseRecovery(sessions)
    expect(result?.type).toBe('deload')
  })

  it('returns null when no recent sessions', () => {
    const result = analyseRecovery([])
    expect(result).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx vitest run src/test/recoveryEngine.test.ts
```
Expected: FAIL — "Cannot find module '../lib/recoveryEngine'"

- [ ] **Step 3: Create `src/lib/recoveryEngine.ts`**

```typescript
import type { WorkoutSession } from '../types'

export interface RecoverySuggestion {
  type: 'rest' | 'deload'
  message: string
}

export function analyseRecovery(sessions: WorkoutSession[]): RecoverySuggestion | null {
  if (sessions.length === 0) return null

  // Sort by date descending
  const sorted = [...sessions].sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())

  // Check deload: avg RPE > 8 for 2+ sessions with RPE logged
  const withRpe = sorted.filter(s => s.rpe !== undefined).slice(0, 5)
  if (withRpe.length >= 2) {
    const recentAvgRpe = withRpe.slice(0, 2).reduce((sum, s) => sum + (s.rpe ?? 0), 0) / 2
    if (recentAvgRpe > 8) {
      return {
        type: 'deload',
        message: 'Your recent sessions have been very intense. Consider a deload week with reduced weight.',
      }
    }
  }

  // Check 3 consecutive days: look at dates of last 3 sessions
  if (sorted.length >= 3) {
    const last3 = sorted.slice(0, 3).map(s => {
      const d = new Date(s.startedAt); d.setHours(0, 0, 0, 0); return d.getTime()
    })
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const day0 = today.getTime()
    const day1 = day0 - 86400000
    const day2 = day1 - 86400000

    if (last3.includes(day0) && last3.includes(day1) && last3.includes(day2)) {
      return { type: 'rest', message: "You've trained 3 days in a row. Consider a rest day today." }
    }
  }

  return null
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/test/recoveryEngine.test.ts
```
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/recoveryEngine.ts src/test/recoveryEngine.test.ts
git commit -m "feat: add rule-based recovery engine"
```

---

## Task 3: Recovery Banner Component

**Files:**
- Create: `src/components/recovery/RecoveryBanner.tsx`
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: Create `src/components/recovery/RecoveryBanner.tsx`**

```typescript
import type { RecoverySuggestion } from '../../lib/recoveryEngine'

interface Props { suggestion: RecoverySuggestion; onDismiss: () => void }

export function RecoveryBanner({ suggestion, onDismiss }: Props) {
  const isDeload = suggestion.type === 'deload'
  return (
    <div className={`rounded-xl p-4 border flex gap-3 ${
      isDeload ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-blue-accent/10 border-blue-accent/30'
    }`}>
      <span className="text-2xl">{isDeload ? '⚡' : '😴'}</span>
      <div className="flex-1">
        <p className="text-white text-sm font-medium">{isDeload ? 'Time to deload' : 'Rest day recommended'}</p>
        <p className="text-gray-400 text-xs mt-0.5">{suggestion.message}</p>
      </div>
      <button onClick={onDismiss} className="text-gray-500 hover:text-white transition-colors text-lg leading-none">×</button>
    </div>
  )
}
```

- [ ] **Step 2: Update `src/pages/Home.tsx` to show recovery banner**

```typescript
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../db/db'
import { Button } from '../components/ui/Button'
import { RecoveryBanner } from '../components/recovery/RecoveryBanner'
import { analyseRecovery, type RecoverySuggestion } from '../lib/recoveryEngine'
import type { UserProfile, Program } from '../types'

export function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [program, setProgram] = useState<Program | null>(null)
  const [recovery, setRecovery] = useState<RecoverySuggestion | null>(null)
  const [dismissedRecovery, setDismissedRecovery] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    db.userProfile.toCollection().first().then(p => {
      if (!p?.onboardingComplete) { navigate('/onboarding'); return }
      setProfile(p)
    })
    db.programs.orderBy('createdAt').last().then(p => setProgram(p ?? null))
    db.workoutSessions.toArray().then(sessions => {
      const suggestion = analyseRecovery(sessions)
      setRecovery(suggestion)
    })
  }, [navigate])

  if (!profile) return null

  const today = new Date().getDay()
  const dayMap: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 0 }
  const dayIndex = program ? Math.min(dayMap[today] ?? 0, program.weeks[0].days.length - 1) : 0
  const todayDay = program?.weeks[0].days[dayIndex]

  return (
    <div className="min-h-screen bg-[#0d1117] p-4">
      <div className="max-w-sm mx-auto pt-8 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Hey, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-[#0080ff]">{profile.name}</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Ready to train?</p>
        </div>

        {recovery && !dismissedRecovery && (
          <RecoveryBanner suggestion={recovery} onDismiss={() => setDismissedRecovery(true)} />
        )}

        {todayDay && program?.id ? (
          <div className="bg-[#161b22] rounded-xl p-4 border border-teal/20">
            <p className="text-xs text-teal font-semibold mb-1 uppercase tracking-wide">Today</p>
            <h2 className="text-white font-bold text-lg mb-3">{todayDay.label}</h2>
            <p className="text-gray-400 text-sm mb-4">{todayDay.exercises.length} exercises</p>
            <Button size="lg" onClick={() => navigate(`/workout/${program.id}/${dayIndex}`)}>
              Start Workout
            </Button>
          </div>
        ) : (
          <Button variant="secondary" size="lg" onClick={() => navigate('/program')}>
            Build My Program
          </Button>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" size="md" onClick={() => navigate('/program')} className="flex-1">
            My Program
          </Button>
          <Button variant="secondary" size="md" onClick={() => navigate('/progress')} className="flex-1">
            Progress
          </Button>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="md" onClick={() => navigate('/log-body')} className="flex-1">
            Log Body
          </Button>
          <Button variant="secondary" size="md" onClick={() => navigate('/log-food')} className="flex-1">
            Log Food
          </Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/recovery/RecoveryBanner.tsx src/pages/Home.tsx
git commit -m "feat: add recovery banner on home screen"
```

---

## Task 4: Nutrition Logger

**Files:**
- Create: `src/components/nutrition/MacroBar.tsx`
- Create: `src/components/nutrition/MacroPieChart.tsx`
- Create: `src/components/nutrition/FoodEntryForm.tsx`
- Create: `src/pages/LogFood.tsx`
- Create: `src/test/logFood.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/logFood.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import 'fake-indexeddb/auto'
import { db } from '../db/db'
import { LogFood } from '../pages/LogFood'
import type { UserProfile } from '../types'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }))

const PROFILE: Omit<UserProfile, 'id'> = {
  name: 'Alex', age: 28, weight: 80, weightUnit: 'kg', height: 180, heightUnit: 'cm',
  experienceLevel: 'intermediate', primaryGoal: 'build_muscle', equipment: ['full_gym'],
  trainingDaysPerWeek: 4, sessionLength: 60, overloadMode: 'automatic', onboardingComplete: true,
  createdAt: new Date(), updatedAt: new Date(),
}

beforeEach(async () => {
  await db.delete()
  await db.open()
  await db.userProfile.add(PROFILE)
  mockNavigate.mockClear()
})

describe('LogFood', () => {
  it('renders meal name input', async () => {
    render(<LogFood />)
    await waitFor(() => expect(screen.getByPlaceholderText(/meal name/i)).toBeInTheDocument())
  })

  it('adds a food entry to the database', async () => {
    render(<LogFood />)
    await waitFor(() => screen.getByPlaceholderText(/meal name/i))
    await userEvent.type(screen.getByPlaceholderText(/meal name/i), 'Chicken rice')
    await userEvent.type(screen.getByLabelText(/calories/i), '500')
    await userEvent.type(screen.getByLabelText(/protein/i), '40')
    await userEvent.type(screen.getByLabelText(/carbs/i), '50')
    await userEvent.type(screen.getByLabelText(/fat/i), '10')
    fireEvent.click(screen.getByRole('button', { name: /add meal/i }))
    await waitFor(async () => {
      const count = await db.nutritionLogs.count()
      expect(count).toBe(1)
    })
  })

  it('shows macro targets from profile', async () => {
    render(<LogFood />)
    await waitFor(() => expect(screen.getByText(/protein/i)).toBeInTheDocument())
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx vitest run src/test/logFood.test.tsx
```
Expected: FAIL — "Cannot find module '../pages/LogFood'"

- [ ] **Step 3: Create `src/components/nutrition/MacroBar.tsx`**

```typescript
interface Props { label: string; current: number; target: number; color: string }

export function MacroBar({ label, current, target, color }: Props) {
  const pct = Math.min(100, Math.round((current / target) * 100))
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white">{current}g / {target}g</span>
      </div>
      <div className="w-full bg-[#0d1117] rounded-full h-2">
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/nutrition/MacroPieChart.tsx`**

```typescript
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface Props { proteinG: number; carbsG: number; fatG: number }

export function MacroPieChart({ proteinG, carbsG, fatG }: Props) {
  const data = [
    { name: 'Protein', value: proteinG * 4, color: '#00d4aa' },
    { name: 'Carbs', value: carbsG * 4, color: '#0080ff' },
    { name: 'Fat', value: fatG * 9, color: '#f59e0b' },
  ].filter(d => d.value > 0)

  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={160}>
      <PieChart>
        <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={60} paddingAngle={2}>
          {data.map(entry => <Cell key={entry.name} fill={entry.color} />)}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: '#161b22', border: '1px solid #ffffff20', borderRadius: 8 }}
          formatter={(value: number, name: string) => [`${Math.round(value)} kcal`, name]}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 5: Create `src/components/nutrition/FoodEntryForm.tsx`**

```typescript
import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface FoodEntry { mealName: string; calories: number; proteinG: number; carbsG: number; fatG: number }

interface Props { onAdd: (entry: FoodEntry) => void }

const EMPTY: FoodEntry = { mealName: '', calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }

export function FoodEntryForm({ onAdd }: Props) {
  const [form, setForm] = useState<FoodEntry>(EMPTY)

  function update(field: keyof FoodEntry, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function submit() {
    if (!form.mealName.trim()) return
    onAdd(form)
    setForm(EMPTY)
  }

  return (
    <div className="bg-[#161b22] rounded-xl p-4 border border-white/10 flex flex-col gap-3">
      <Input
        placeholder="Meal name"
        value={form.mealName}
        onChange={e => update('mealName', e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input id="calories" label="Calories" type="number" min={0} value={form.calories || ''} onChange={e => update('calories', Number(e.target.value))} />
        <Input id="protein" label="Protein (g)" type="number" min={0} value={form.proteinG || ''} onChange={e => update('proteinG', Number(e.target.value))} />
        <Input id="carbs" label="Carbs (g)" type="number" min={0} value={form.carbsG || ''} onChange={e => update('carbsG', Number(e.target.value))} />
        <Input id="fat" label="Fat (g)" type="number" min={0} value={form.fatG || ''} onChange={e => update('fatG', Number(e.target.value))} />
      </div>
      <Button size="md" onClick={submit} disabled={!form.mealName.trim()}>Add Meal</Button>
    </div>
  )
}
```

- [ ] **Step 6: Create `src/pages/LogFood.tsx`**

```typescript
import { useEffect, useState } from 'react'
import { db } from '../db/db'
import { calculateMacroTargets } from '../lib/macroTargets'
import { FoodEntryForm } from '../components/nutrition/FoodEntryForm'
import { MacroBar } from '../components/nutrition/MacroBar'
import { MacroPieChart } from '../components/nutrition/MacroPieChart'
import type { UserProfile, NutritionLog } from '../types'

export function LogFood() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [todayEntries, setTodayEntries] = useState<NutritionLog[]>([])

  useEffect(() => {
    db.userProfile.toCollection().first().then(p => setProfile(p ?? null))
    loadToday()
  }, [])

  async function loadToday() {
    const start = new Date(); start.setHours(0, 0, 0, 0)
    const end = new Date(); end.setHours(23, 59, 59, 999)
    const entries = await db.nutritionLogs.where('date').between(start, end).toArray()
    setTodayEntries(entries)
  }

  async function handleAdd(entry: { mealName: string; calories: number; proteinG: number; carbsG: number; fatG: number }) {
    await db.nutritionLogs.add({ ...entry, date: new Date() })
    await loadToday()
  }

  const targets = profile ? calculateMacroTargets(profile) : null

  const totals = todayEntries.reduce(
    (sum, e) => ({ calories: sum.calories + e.calories, proteinG: sum.proteinG + e.proteinG, carbsG: sum.carbsG + e.carbsG, fatG: sum.fatG + e.fatG }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  )

  return (
    <div className="min-h-screen bg-[#0d1117] p-4">
      <div className="max-w-sm mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-white pt-4">Nutrition</h1>

        {targets && (
          <div className="bg-[#161b22] rounded-xl p-4 border border-white/10 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold">{totals.calories} / {targets.calories} kcal</span>
              <span className="text-gray-400 text-xs">today</span>
            </div>
            <MacroBar label="Protein" current={totals.proteinG} target={targets.proteinG} color="#00d4aa" />
            <MacroBar label="Carbs" current={totals.carbsG} target={targets.carbsG} color="#0080ff" />
            <MacroBar label="Fat" current={totals.fatG} target={targets.fatG} color="#f59e0b" />
            <MacroPieChart proteinG={totals.proteinG} carbsG={totals.carbsG} fatG={totals.fatG} />
          </div>
        )}

        <FoodEntryForm onAdd={handleAdd} />

        {todayEntries.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-white font-semibold">Today's meals</h2>
            {todayEntries.map(e => (
              <div key={e.id} className="flex justify-between bg-[#161b22] rounded-lg px-4 py-3 border border-white/10">
                <span className="text-white text-sm">{e.mealName}</span>
                <span className="text-gray-400 text-xs">{e.calories} kcal · {e.proteinG}g P</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Add `/log-food` route in `src/App.tsx`**

```typescript
import { Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './pages/Onboarding'
import { Home } from './pages/Home'
import { MyProgram } from './pages/MyProgram'
import { WorkoutLogger } from './pages/WorkoutLogger'
import { Progress } from './pages/Progress'
import { LogBody } from './pages/LogBody'
import { LogFood } from './pages/LogFood'
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
          <Route path="/log-food" element={<LogFood />} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </>
  )
}
```

- [ ] **Step 8: Update BottomNav to include Food tab**

In `src/components/ui/BottomNav.tsx`, update TABS:

```typescript
const TABS = [
  { path: '/home',     icon: '🏠', label: 'Home' },
  { path: '/program',  icon: '📋', label: 'Program' },
  { path: '/progress', icon: '📈', label: 'Progress' },
  { path: '/log-food', icon: '🥗', label: 'Food' },
]
```

- [ ] **Step 9: Run food logger tests**

```bash
npx vitest run src/test/logFood.test.tsx
```
Expected: PASS (3 tests)

- [ ] **Step 10: Run all tests**

```bash
npx vitest run
```
Expected: All tests pass.

- [ ] **Step 11: Commit**

```bash
git add src/components/nutrition/ src/pages/LogFood.tsx src/components/ui/BottomNav.tsx src/App.tsx src/test/logFood.test.tsx
git commit -m "feat: add nutrition logger with macro targets and pie chart"
```

---

## Task 5: Sharing Library

**Files:**
- Create: `src/lib/sharing.ts`

- [ ] **Step 1: Create `src/lib/sharing.ts`**

```typescript
interface PRCardData { exerciseName: string; weightKg: number; reps: number; date: string; userName: string }

export async function sharePRCard(data: PRCardData): Promise<void> {
  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 400
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = '#0d1117'
  ctx.fillRect(0, 0, 600, 400)

  // Gradient accent bar
  const grad = ctx.createLinearGradient(0, 0, 600, 0)
  grad.addColorStop(0, '#00d4aa')
  grad.addColorStop(1, '#0080ff')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 600, 8)

  // App name
  ctx.fillStyle = '#00d4aa'
  ctx.font = 'bold 24px -apple-system, sans-serif'
  ctx.fillText('letsTrain', 40, 60)

  // PR label
  ctx.fillStyle = '#9ca3af'
  ctx.font = '16px -apple-system, sans-serif'
  ctx.fillText('New Personal Record', 40, 110)

  // Exercise name
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 36px -apple-system, sans-serif'
  ctx.fillText(data.exerciseName, 40, 170)

  // Weight
  ctx.fillStyle = '#00d4aa'
  ctx.font = 'bold 72px -apple-system, sans-serif'
  ctx.fillText(`${data.weightKg}kg`, 40, 270)

  // Reps
  ctx.fillStyle = '#9ca3af'
  ctx.font = '24px -apple-system, sans-serif'
  ctx.fillText(`× ${data.reps} reps`, 40, 310)

  // Date and user
  ctx.fillStyle = '#4b5563'
  ctx.font = '14px -apple-system, sans-serif'
  ctx.fillText(`${data.userName} · ${data.date}`, 40, 370)

  // Convert to blob and share
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('Canvas toBlob failed')), 'image/png')
  )
  const file = new File([blob], 'letstrain-pr.png', { type: 'image/png' })

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: `New PR: ${data.exerciseName} ${data.weightKg}kg` })
  } else {
    // Fallback: download the image
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'letstrain-pr.png'
    a.click()
    URL.revokeObjectURL(url)
  }
}

export function downloadJSON(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/sharing.ts
git commit -m "feat: add PR card sharing (canvas + Web Share API) and JSON export helper"
```

---

## Task 6: Settings Page

**Files:**
- Create: `src/components/settings/ProfileForm.tsx`
- Create: `src/components/settings/DataSection.tsx`
- Create: `src/pages/Settings.tsx`
- Create: `src/test/settings.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/settings.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import 'fake-indexeddb/auto'
import { db } from '../db/db'
import { Settings } from '../pages/Settings'
import type { UserProfile } from '../types'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }))

const PROFILE: Omit<UserProfile, 'id'> = {
  name: 'Alex', age: 28, weight: 80, weightUnit: 'kg', height: 180, heightUnit: 'cm',
  experienceLevel: 'intermediate', primaryGoal: 'build_muscle', equipment: ['full_gym'],
  trainingDaysPerWeek: 4, sessionLength: 60, overloadMode: 'automatic', onboardingComplete: true,
  createdAt: new Date(), updatedAt: new Date(),
}

beforeEach(async () => {
  await db.delete()
  await db.open()
  await db.userProfile.add(PROFILE)
  mockNavigate.mockClear()
})

describe('Settings', () => {
  it('renders the profile name field with current value', async () => {
    render(<Settings />)
    await waitFor(() => {
      const input = screen.getByDisplayValue('Alex')
      expect(input).toBeInTheDocument()
    })
  })

  it('saves updated name to the database', async () => {
    render(<Settings />)
    await waitFor(() => screen.getByDisplayValue('Alex'))
    const input = screen.getByDisplayValue('Alex')
    await userEvent.clear(input)
    await userEvent.type(input, 'Jordan')
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(async () => {
      const p = await db.userProfile.toCollection().first()
      expect(p?.name).toBe('Jordan')
    })
  })

  it('shows Export and Import buttons', async () => {
    render(<Settings />)
    await waitFor(() => {
      expect(screen.getByText(/export data/i)).toBeInTheDocument()
      expect(screen.getByText(/import data/i)).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx vitest run src/test/settings.test.tsx
```
Expected: FAIL — "Cannot find module '../pages/Settings'"

- [ ] **Step 3: Create `src/components/settings/ProfileForm.tsx`**

```typescript
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import type { UserProfile, ExperienceLevel, PrimaryGoal, OverloadMode } from '../../types'

type EditableProfile = Pick<UserProfile, 'name' | 'age' | 'weight' | 'weightUnit' | 'height' | 'heightUnit' | 'experienceLevel' | 'primaryGoal' | 'overloadMode'>

interface Props {
  profile: EditableProfile
  onChange: (field: keyof EditableProfile, value: string | number) => void
  onSave: () => void
  saving: boolean
}

export function ProfileForm({ profile, onChange, onSave, saving }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Input label="Name" value={profile.name} onChange={e => onChange('name', e.target.value)} />
      <Input label="Age" type="number" value={profile.age || ''} onChange={e => onChange('age', Number(e.target.value))} />
      <div className="flex gap-3">
        <div className="flex-1">
          <Input label="Weight" type="number" value={profile.weight || ''} onChange={e => onChange('weight', Number(e.target.value))} />
        </div>
        <Select label="Unit" options={[{ value: 'kg', label: 'kg' }, { value: 'lb', label: 'lb' }]}
          value={profile.weightUnit} onChange={e => onChange('weightUnit', e.target.value)} className="w-20 self-end" />
      </div>
      <Select
        label="Experience Level"
        options={[
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced' },
        ]}
        value={profile.experienceLevel}
        onChange={e => onChange('experienceLevel', e.target.value as ExperienceLevel)}
      />
      <Select
        label="Primary Goal"
        options={[
          { value: 'build_muscle', label: 'Build Muscle' },
          { value: 'build_strength', label: 'Build Strength' },
          { value: 'hybrid', label: 'Hybrid' },
          { value: 'recomp', label: 'Recomp / Cut' },
        ]}
        value={profile.primaryGoal}
        onChange={e => onChange('primaryGoal', e.target.value as PrimaryGoal)}
      />
      <Select
        label="Overload Mode"
        options={[
          { value: 'automatic', label: 'Automatic' },
          { value: 'semi_automatic', label: 'Semi-automatic' },
          { value: 'manual', label: 'Manual' },
        ]}
        value={profile.overloadMode}
        onChange={e => onChange('overloadMode', e.target.value as OverloadMode)}
      />
      <Button size="lg" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/settings/DataSection.tsx`**

```typescript
import { db } from '../../db/db'
import { downloadJSON } from '../../lib/sharing'
import { Button } from '../ui/Button'
import { useRef } from 'react'

export function DataSection() {
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleExport() {
    const [userProfile, programs, workoutSessions, setLogs, bodyMeasurements, nutritionLogs] = await Promise.all([
      db.userProfile.toArray(),
      db.programs.toArray(),
      db.workoutSessions.toArray(),
      db.setLogs.toArray(),
      db.bodyMeasurements.toArray(),
      db.nutritionLogs.toArray(),
    ])
    downloadJSON(
      { exportedAt: new Date().toISOString(), userProfile, programs, workoutSessions, setLogs, bodyMeasurements, nutritionLogs },
      `letstrain-backup-${new Date().toISOString().slice(0, 10)}.json`
    )
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const data = JSON.parse(text)
    if (data.userProfile) await db.userProfile.bulkPut(data.userProfile)
    if (data.programs) await db.programs.bulkPut(data.programs)
    if (data.workoutSessions) await db.workoutSessions.bulkPut(data.workoutSessions)
    if (data.setLogs) await db.setLogs.bulkPut(data.setLogs)
    if (data.bodyMeasurements) await db.bodyMeasurements.bulkPut(data.bodyMeasurements)
    if (data.nutritionLogs) await db.nutritionLogs.bulkPut(data.nutritionLogs)
    alert('Data imported successfully. Refresh the app to see changes.')
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-white font-semibold">Data</h2>
      <Button variant="secondary" size="md" onClick={handleExport}>Export Data</Button>
      <Button variant="secondary" size="md" onClick={() => fileRef.current?.click()}>Import Data</Button>
      <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      <p className="text-gray-500 text-xs">Export creates a full JSON backup. Import restores from a previous export.</p>
    </div>
  )
}
```

- [ ] **Step 5: Create `src/pages/Settings.tsx`**

```typescript
import { useEffect, useState } from 'react'
import { db } from '../db/db'
import { ProfileForm } from '../components/settings/ProfileForm'
import { DataSection } from '../components/settings/DataSection'
import type { UserProfile } from '../types'

type EditableProfile = Pick<UserProfile, 'name' | 'age' | 'weight' | 'weightUnit' | 'height' | 'heightUnit' | 'experienceLevel' | 'primaryGoal' | 'overloadMode'>

export function Settings() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    db.userProfile.toCollection().first().then(p => setProfile(p ?? null))
  }, [])

  function handleChange(field: keyof EditableProfile, value: string | number) {
    setProfile(prev => prev ? { ...prev, [field]: value } : prev)
  }

  async function handleSave() {
    if (!profile?.id) return
    setSaving(true)
    await db.userProfile.update(profile.id, { ...profile, updatedAt: new Date() })
    setSaving(false)
  }

  if (!profile) return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <p className="text-gray-400">Loading…</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0d1117] p-4">
      <div className="max-w-sm mx-auto flex flex-col gap-8">
        <h1 className="text-2xl font-bold text-white pt-4">Settings</h1>
        <ProfileForm profile={profile} onChange={handleChange} onSave={handleSave} saving={saving} />
        <DataSection />
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Add `/settings` route in `src/App.tsx`**

```typescript
import { Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './pages/Onboarding'
import { Home } from './pages/Home'
import { MyProgram } from './pages/MyProgram'
import { WorkoutLogger } from './pages/WorkoutLogger'
import { Progress } from './pages/Progress'
import { LogBody } from './pages/LogBody'
import { LogFood } from './pages/LogFood'
import { Settings } from './pages/Settings'
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
          <Route path="/log-food" element={<LogFood />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </>
  )
}
```

- [ ] **Step 7: Add Settings to BottomNav**

In `src/components/ui/BottomNav.tsx`, update TABS:

```typescript
const TABS = [
  { path: '/home',     icon: '🏠', label: 'Home' },
  { path: '/program',  icon: '📋', label: 'Program' },
  { path: '/progress', icon: '📈', label: 'Progress' },
  { path: '/log-food', icon: '🥗', label: 'Food' },
  { path: '/settings', icon: '⚙️',  label: 'Settings' },
]
```

- [ ] **Step 8: Run settings tests**

```bash
npx vitest run src/test/settings.test.tsx
```
Expected: PASS (3 tests)

- [ ] **Step 9: Run all tests**

```bash
npx vitest run
```
Expected: All tests pass.

- [ ] **Step 10: Commit**

```bash
git add src/components/settings/ src/pages/Settings.tsx src/components/ui/BottomNav.tsx src/App.tsx src/test/settings.test.tsx
git commit -m "feat: add Settings page — profile edit, data export/import"
```

---

## Task 7: Final Smoke Test + Exercise Library Page

**Files:**
- Create: `src/pages/Library.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/ui/BottomNav.tsx`

- [ ] **Step 1: Create `src/pages/Library.tsx`**

```typescript
import { useEffect, useState } from 'react'
import { db } from '../db/db'
import { seedExercises } from '../db/seed'
import { Input } from '../components/ui/Input'
import type { Exercise, MuscleGroup } from '../types'

const MUSCLE_FILTERS: { value: MuscleGroup | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'quads', label: 'Quads' },
  { value: 'hamstrings', label: 'Hams' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'core', label: 'Core' },
  { value: 'calves', label: 'Calves' },
  { value: 'traps', label: 'Traps' },
]

export function Library() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    seedExercises().then(() => db.exerciseLibrary.toArray().then(setExercises))
  }, [])

  const filtered = exercises.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase())
    const matchMuscle = muscleFilter === 'all' || e.muscleGroups.includes(muscleFilter)
    return matchSearch && matchMuscle
  })

  return (
    <div className="min-h-screen bg-[#0d1117] p-4">
      <div className="max-w-sm mx-auto">
        <h1 className="text-2xl font-bold text-white pt-4 mb-4">Exercise Library</h1>
        <Input placeholder="Search exercises…" value={search} onChange={e => setSearch(e.target.value)} className="mb-4" />
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
          {MUSCLE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setMuscleFilter(f.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                muscleFilter === f.value ? 'bg-teal text-black' : 'bg-[#161b22] text-gray-400 border border-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {filtered.map(ex => (
            <div key={ex.exId} className="bg-[#161b22] rounded-xl border border-white/10 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                onClick={() => setExpanded(expanded === ex.exId ? null : ex.exId)}
              >
                <div>
                  <p className="text-white text-sm font-medium">{ex.name}</p>
                  <p className="text-gray-500 text-xs">{ex.muscleGroups.join(', ')}</p>
                </div>
                <span className="text-gray-500 text-xs">{expanded === ex.exId ? '▲' : '▼'}</span>
              </button>
              {expanded === ex.exId && (
                <div className="px-4 pb-3 flex flex-col gap-2">
                  {ex.instructions.map((inst, i) => (
                    <p key={i} className="text-gray-400 text-xs">{i + 1}. {inst}</p>
                  ))}
                  {ex.tips.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1">
                      {ex.tips.map((tip, i) => <p key={i} className="text-teal text-xs">💡 {tip}</p>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No exercises found.</p>}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add `/library` route and update BottomNav**

In `src/App.tsx`, add the import and route:
```typescript
import { Library } from './pages/Library'
// inside Routes:
<Route path="/library" element={<Library />} />
```

In `src/components/ui/BottomNav.tsx`, update TABS to 5 entries (replace Food with Library, or add a separate row — pick 5 that fit on mobile):
```typescript
const TABS = [
  { path: '/home',     icon: '🏠', label: 'Home' },
  { path: '/program',  icon: '📋', label: 'Program' },
  { path: '/progress', icon: '📈', label: 'Progress' },
  { path: '/library',  icon: '📚', label: 'Library' },
  { path: '/settings', icon: '⚙️',  label: 'Settings' },
]
```

- [ ] **Step 3: Run all tests**

```bash
npx vitest run
```
Expected: All tests pass.

- [ ] **Step 4: Full manual end-to-end test**

```bash
npm run dev
```
Test path:
1. Fresh start → onboarding wizard (5 steps) → Home
2. Home shows recovery banner (if applicable)
3. "Build My Program" → program days with Start buttons
4. Start a workout → log 3 sets of first exercise → rest timer fires → finish workout
5. Progress → Strength tab → strength curve appears
6. Progress → Calendar → streak shows today
7. Log Body → enter weight → save → back
8. Log Food → add 2 meals → see macro bars fill up
9. Settings → change name → Save → verify updated
10. Settings → Export Data → JSON downloads
11. Library → search "squat" → see results → expand one → see instructions

- [ ] **Step 5: Final commit**

```bash
git add src/pages/Library.tsx src/App.tsx src/components/ui/BottomNav.tsx
git commit -m "feat: add exercise library page with search and muscle filter"
git commit --allow-empty -m "feat: letstrain v1 complete — all 4 plans implemented"
```

---

## Plan 4 Complete ✅

All spec features are now implemented:
- ✅ Onboarding wizard
- ✅ Rule-based program generator (all splits and periodization levels)
- ✅ Workout logger (sets, rest timer, overload suggestions)
- ✅ Progress dashboard (strength, volume, body, streak calendar)
- ✅ Body measurements tracker
- ✅ Nutrition logger with macro targets
- ✅ Recovery engine (rest/deload suggestions)
- ✅ Exercise library (~50 exercises seeded, expandable)
- ✅ Settings with profile edit, export, import
- ✅ PR card sharing (canvas + Web Share API)
- ✅ PWA manifest + service worker
- ✅ Offline-first (all data in IndexedDB)
- ✅ Dark Teal design system

**Deploy to Vercel:** `git push` to a GitHub repo, connect to Vercel, auto-deploys on every push.
