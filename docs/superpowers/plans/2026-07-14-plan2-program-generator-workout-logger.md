# letsTrain Plan 2 — Program Generator & Workout Logger

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the rule-based program generator engine and the in-session workout logger screen.

**Architecture:** The program generator is a pure TypeScript module (no React) — testable in isolation. It reads the `UserProfile` and `exerciseLibrary` from IndexedDB and produces a `Program` record. The workout logger is a React page that loads today's `ProgramDay`, walks the user through each exercise, logs sets, runs a rest timer, and writes `WorkoutSession` + `SetLog` records on completion.

**Tech Stack:** TypeScript (generator), React 18, Dexie.js, React Router 6, Vitest

**Depends on:** Plan 1 complete (types, db schema, exercise library, router)

---

## File Map

```
src/
├── lib/
│   └── programGenerator.ts         # Pure TS engine — generates Program from UserProfile + exercises
├── pages/
│   ├── MyProgram.tsx               # View current program, trigger regeneration
│   └── WorkoutLogger.tsx           # Active workout session screen
├── components/
│   ├── program/
│   │   ├── ProgramDayCard.tsx      # Shows one day's exercises summary
│   │   └── ExerciseRow.tsx         # Single exercise in the program view
│   └── logger/
│       ├── SetRow.tsx              # One set to log (target + actual inputs)
│       ├── RestTimer.tsx           # Countdown timer between sets
│       └── OverloadBadge.tsx       # Shows overload suggestion
└── test/
    ├── programGenerator.test.ts
    └── workoutLogger.test.tsx
```

---

## Task 1: Program Generator Engine

**Files:**
- Create: `src/lib/programGenerator.ts`
- Create: `src/test/programGenerator.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/test/programGenerator.test.ts
import { describe, it, expect } from 'vitest'
import { generateProgram } from '../lib/programGenerator'
import type { UserProfile, Exercise } from '../types'

const MOCK_EXERCISES: Exercise[] = [
  { id: 1, exId: 'barbell-bench-press', name: 'Barbell Bench Press', muscleGroups: ['chest'], secondaryMuscles: ['triceps', 'shoulders'], equipment: ['full_gym'], movementPattern: 'push', instructions: [], tips: [] },
  { id: 2, exId: 'barbell-squat', name: 'Barbell Back Squat', muscleGroups: ['quads'], secondaryMuscles: ['hamstrings', 'glutes'], equipment: ['full_gym'], movementPattern: 'squat', instructions: [], tips: [] },
  { id: 3, exId: 'barbell-row', name: 'Barbell Row', muscleGroups: ['back'], secondaryMuscles: ['biceps'], equipment: ['full_gym'], movementPattern: 'pull', instructions: [], tips: [] },
  { id: 4, exId: 'overhead-press', name: 'Overhead Press', muscleGroups: ['shoulders'], secondaryMuscles: ['triceps'], equipment: ['full_gym'], movementPattern: 'push', instructions: [], tips: [] },
  { id: 5, exId: 'romanian-deadlift', name: 'Romanian Deadlift', muscleGroups: ['hamstrings'], secondaryMuscles: ['glutes'], equipment: ['full_gym'], movementPattern: 'hinge', instructions: [], tips: [] },
  { id: 6, exId: 'barbell-curl', name: 'Barbell Curl', muscleGroups: ['biceps'], secondaryMuscles: [], equipment: ['full_gym'], movementPattern: 'pull', instructions: [], tips: [] },
  { id: 7, exId: 'close-grip-bench', name: 'Close-Grip Bench', muscleGroups: ['triceps'], secondaryMuscles: [], equipment: ['full_gym'], movementPattern: 'push', instructions: [], tips: [] },
  { id: 8, exId: 'hip-thrust', name: 'Hip Thrust', muscleGroups: ['glutes'], secondaryMuscles: [], equipment: ['full_gym'], movementPattern: 'hinge', instructions: [], tips: [] },
  { id: 9, exId: 'plank', name: 'Plank', muscleGroups: ['core'], secondaryMuscles: [], equipment: ['full_gym'], movementPattern: 'carry', instructions: [], tips: [] },
  { id: 10, exId: 'standing-calf-raise', name: 'Calf Raise', muscleGroups: ['calves'], secondaryMuscles: [], equipment: ['full_gym'], movementPattern: 'isolation', instructions: [], tips: [] },
  { id: 11, exId: 'lateral-raise', name: 'Lateral Raise', muscleGroups: ['shoulders'], secondaryMuscles: [], equipment: ['full_gym'], movementPattern: 'isolation', instructions: [], tips: [] },
  { id: 12, exId: 'pull-up', name: 'Pull-Up', muscleGroups: ['back'], secondaryMuscles: ['biceps'], equipment: ['full_gym'], movementPattern: 'pull', instructions: [], tips: [] },
  { id: 13, exId: 'leg-press', name: 'Leg Press', muscleGroups: ['quads'], secondaryMuscles: [], equipment: ['full_gym'], movementPattern: 'squat', instructions: [], tips: [] },
  { id: 14, exId: 'leg-curl', name: 'Leg Curl', muscleGroups: ['hamstrings'], secondaryMuscles: [], equipment: ['full_gym'], movementPattern: 'isolation', instructions: [], tips: [] },
  { id: 15, exId: 'barbell-shrug', name: 'Barbell Shrug', muscleGroups: ['traps'], secondaryMuscles: [], equipment: ['full_gym'], movementPattern: 'carry', instructions: [], tips: [] },
  { id: 16, exId: 'wrist-curl', name: 'Wrist Curl', muscleGroups: ['forearms'], secondaryMuscles: [], equipment: ['full_gym'], movementPattern: 'isolation', instructions: [], tips: [] },
]

const BASE_PROFILE: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt' | 'onboardingComplete'> = {
  name: 'Alex', age: 28, weight: 80, weightUnit: 'kg',
  height: 180, heightUnit: 'cm', experienceLevel: 'intermediate',
  primaryGoal: 'build_muscle', equipment: ['full_gym'],
  trainingDaysPerWeek: 4, sessionLength: 60, overloadMode: 'automatic',
}

describe('generateProgram', () => {
  it('returns a Program with the correct number of days (4)', () => {
    const program = generateProgram({ ...BASE_PROFILE, trainingDaysPerWeek: 4 }, MOCK_EXERCISES)
    expect(program.weeks[0].days).toHaveLength(4)
  })

  it('returns 3 days for 3-day schedule', () => {
    const program = generateProgram({ ...BASE_PROFILE, trainingDaysPerWeek: 3 }, MOCK_EXERCISES)
    expect(program.weeks[0].days).toHaveLength(3)
  })

  it('each day has at least 4 exercises', () => {
    const program = generateProgram({ ...BASE_PROFILE, trainingDaysPerWeek: 4 }, MOCK_EXERCISES)
    for (const day of program.weeks[0].days) {
      expect(day.exercises.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('hypertrophy goal sets rep range to 8–15', () => {
    const program = generateProgram({ ...BASE_PROFILE, primaryGoal: 'build_muscle' }, MOCK_EXERCISES)
    const firstEx = program.weeks[0].days[0].exercises[0]
    expect(firstEx.repMin).toBeGreaterThanOrEqual(8)
    expect(firstEx.repMax).toBeLessThanOrEqual(15)
  })

  it('strength goal sets rep range to 1–6', () => {
    const program = generateProgram({ ...BASE_PROFILE, primaryGoal: 'build_strength' }, MOCK_EXERCISES)
    const firstEx = program.weeks[0].days[0].exercises[0]
    expect(firstEx.repMin).toBeGreaterThanOrEqual(1)
    expect(firstEx.repMax).toBeLessThanOrEqual(6)
  })

  it('only assigns exercises that match equipment', () => {
    const dbProfile = { ...BASE_PROFILE, equipment: ['dumbbells'] as const }
    const program = generateProgram(dbProfile, MOCK_EXERCISES)
    for (const day of program.weeks[0].days) {
      for (const pe of day.exercises) {
        const ex = MOCK_EXERCISES.find(e => e.exId === pe.exId)!
        const compatible = ex.equipment.some(eq => (['dumbbells'] as string[]).includes(eq))
        expect(compatible).toBe(true)
      }
    }
  })

  it('snapshot: version is 1 and profileSnapshot is saved', () => {
    const profile = { ...BASE_PROFILE, trainingDaysPerWeek: 4 as const }
    const program = generateProgram(profile, MOCK_EXERCISES)
    expect(program.version).toBe(1)
    expect(program.profileSnapshot.name).toBe('Alex')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx vitest run src/test/programGenerator.test.ts
```
Expected: FAIL — "Cannot find module '../lib/programGenerator'"

- [ ] **Step 3: Create `src/lib/programGenerator.ts`**

```typescript
import type { UserProfile, Exercise, Program, ProgramDay, ProgramExercise, MuscleGroup } from '../types'

// Rep/set targets per goal
const GOAL_CONFIG = {
  build_muscle: { repMin: 8, repMax: 15, sets: 4, restSeconds: 90 },
  build_strength: { repMin: 1, repMax: 6, sets: 5, restSeconds: 180 },
  hybrid: { repMin: 4, repMax: 12, sets: 4, restSeconds: 120 },
  recomp: { repMin: 8, repMax: 15, sets: 3, restSeconds: 60 },
} as const

// Day labels per training frequency
const SPLIT_LABELS: Record<number | 'flexible', string[]> = {
  3: ['Full Body A', 'Full Body B', 'Full Body C'],
  4: ['Upper A', 'Lower A', 'Upper B', 'Lower B'],
  5: ['Push', 'Pull', 'Legs', 'Upper A', 'Upper B'],
  6: ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B'],
  flexible: ['Full Body A', 'Full Body B', 'Full Body C', 'Full Body D'],
}

// Which muscle groups each split day should hit (primary)
const DAY_MUSCLES: Record<string, MuscleGroup[]> = {
  'Full Body A': ['chest', 'back', 'quads', 'core'],
  'Full Body B': ['shoulders', 'back', 'hamstrings', 'biceps', 'triceps'],
  'Full Body C': ['chest', 'quads', 'glutes', 'core', 'calves'],
  'Full Body D': ['shoulders', 'back', 'hamstrings', 'biceps', 'traps'],
  'Upper A':     ['chest', 'back', 'biceps', 'triceps'],
  'Upper B':     ['shoulders', 'back', 'biceps', 'triceps', 'traps'],
  'Lower A':     ['quads', 'hamstrings', 'glutes', 'calves', 'core'],
  'Lower B':     ['quads', 'hamstrings', 'glutes', 'calves', 'forearms'],
  'Push':        ['chest', 'shoulders', 'triceps'],
  'Pull':        ['back', 'biceps', 'traps', 'forearms'],
  'Legs':        ['quads', 'hamstrings', 'glutes', 'calves', 'core'],
  'Push A':      ['chest', 'shoulders', 'triceps'],
  'Pull A':      ['back', 'biceps', 'traps'],
  'Legs A':      ['quads', 'hamstrings', 'glutes', 'calves'],
  'Push B':      ['chest', 'shoulders', 'triceps', 'core'],
  'Pull B':      ['back', 'biceps', 'forearms'],
  'Legs B':      ['quads', 'hamstrings', 'glutes', 'calves', 'core'],
}

export function generateProgram(
  profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt' | 'onboardingComplete'>,
  exercises: Exercise[],
): Program {
  const cfg = GOAL_CONFIG[profile.primaryGoal]
  const labels = SPLIT_LABELS[profile.trainingDaysPerWeek] ?? SPLIT_LABELS[4]

  const compatible = exercises.filter(ex =>
    ex.equipment.some(eq => profile.equipment.includes(eq))
  )

  const days: ProgramDay[] = labels.map((label, dayIndex) => {
    const targetMuscles: MuscleGroup[] = DAY_MUSCLES[label] ?? ['chest', 'back', 'quads']
    const picked = pickExercises(compatible, targetMuscles, profile.sessionLength)

    const programExercises: ProgramExercise[] = picked.map(ex => ({
      exId: ex.exId,
      sets: cfg.sets,
      repMin: cfg.repMin,
      repMax: cfg.repMax,
      restSeconds: cfg.restSeconds,
      alternatives: findAlternatives(ex, compatible),
    }))

    return { dayIndex, label, exercises: programExercises }
  })

  return {
    version: 1,
    createdAt: new Date(),
    profileSnapshot: { ...profile, onboardingComplete: true },
    weeks: [{ weekNumber: 1, days }],
  }
}

function pickExercises(
  pool: Exercise[],
  muscles: MuscleGroup[],
  sessionLength: number | 'flexible',
): Exercise[] {
  // How many exercises fit in the session
  const maxExercises = sessionLength === 'flexible' ? 8
    : sessionLength === 45 ? 5
    : sessionLength === 60 ? 6
    : 8  // 90 min

  const result: Exercise[] = []
  const usedMuscles = new Set<MuscleGroup>()

  // First pass: one exercise per muscle group in priority order
  for (const muscle of muscles) {
    if (result.length >= maxExercises) break
    const candidates = pool.filter(
      ex => ex.muscleGroups.includes(muscle) && !result.includes(ex)
    )
    if (candidates.length > 0) {
      // Prefer compound movements first
      const compound = candidates.find(c => ['push', 'pull', 'squat', 'hinge'].includes(c.movementPattern))
      result.push(compound ?? candidates[0])
      usedMuscles.add(muscle)
    }
  }

  // Second pass: fill remaining slots with isolation / secondary coverage
  if (result.length < maxExercises) {
    const remaining = pool.filter(ex => !result.includes(ex) && muscles.some(m => ex.muscleGroups.includes(m) || ex.secondaryMuscles.includes(m)))
    for (const ex of remaining) {
      if (result.length >= maxExercises) break
      result.push(ex)
    }
  }

  return result
}

function findAlternatives(ex: Exercise, pool: Exercise[]): string[] {
  return pool
    .filter(e =>
      e.exId !== ex.exId &&
      e.muscleGroups.some(m => ex.muscleGroups.includes(m)) &&
      e.movementPattern === ex.movementPattern
    )
    .slice(0, 2)
    .map(e => e.exId)
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/test/programGenerator.test.ts
```
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/programGenerator.ts src/test/programGenerator.test.ts
git commit -m "feat: add rule-based program generator engine"
```

---

## Task 2: My Program Page

**Files:**
- Create: `src/components/program/ExerciseRow.tsx`
- Create: `src/components/program/ProgramDayCard.tsx`
- Create: `src/pages/MyProgram.tsx`

- [ ] **Step 1: Create `src/components/program/ExerciseRow.tsx`**

```typescript
import type { ProgramExercise } from '../../types'

interface Props { exercise: ProgramExercise; name: string }

export function ExerciseRow({ exercise, name }: Props) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-white text-sm font-medium">{name}</span>
      <span className="text-gray-400 text-xs">
        {exercise.sets} × {exercise.repMin}–{exercise.repMax}
      </span>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/program/ProgramDayCard.tsx`**

```typescript
import type { ProgramDay, Exercise } from '../../types'
import { ExerciseRow } from './ExerciseRow'

interface Props {
  day: ProgramDay
  exerciseMap: Map<string, Exercise>
  onStart: () => void
}

export function ProgramDayCard({ day, exerciseMap, onStart }: Props) {
  return (
    <div className="bg-[#161b22] rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold">{day.label}</h3>
        <button
          onClick={onStart}
          className="text-xs font-semibold text-teal border border-teal/40 rounded-lg px-3 py-1 hover:bg-teal/10 transition-colors"
        >
          Start
        </button>
      </div>
      {day.exercises.map(ex => (
        <ExerciseRow
          key={ex.exId}
          exercise={ex}
          name={exerciseMap.get(ex.exId)?.name ?? ex.exId}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create `src/pages/MyProgram.tsx`**

```typescript
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../db/db'
import { generateProgram } from '../lib/programGenerator'
import { seedExercises } from '../db/seed'
import { ProgramDayCard } from '../components/program/ProgramDayCard'
import type { Program, Exercise, UserProfile } from '../types'
import { Button } from '../components/ui/Button'

export function MyProgram() {
  const navigate = useNavigate()
  const [program, setProgram] = useState<Program | null>(null)
  const [exerciseMap, setExerciseMap] = useState<Map<string, Exercise>>(new Map())
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    await seedExercises()
    const p = await db.userProfile.toCollection().first()
    if (!p?.onboardingComplete) { navigate('/onboarding'); return }
    setProfile(p)
    const exercises = await db.exerciseLibrary.toArray()
    const map = new Map(exercises.map(e => [e.exId, e]))
    setExerciseMap(map)
    const existing = await db.programs.orderBy('createdAt').last()
    if (existing) {
      setProgram(existing)
    } else {
      await generate(p, exercises, map)
    }
    setLoading(false)
  }

  async function generate(p: UserProfile, exercises: Exercise[], map: Map<string, Exercise>) {
    const prog = generateProgram(p, exercises)
    const id = await db.programs.add(prog)
    setProgram({ ...prog, id })
    setExerciseMap(map)
  }

  async function regenerate() {
    if (!profile) return
    setLoading(true)
    const exercises = await db.exerciseLibrary.toArray()
    const map = new Map(exercises.map(e => [e.exId, e]))
    await generate(profile, exercises, map)
    setLoading(false)
  }

  function startDay(dayIndex: number) {
    if (!program?.id) return
    navigate(`/workout/${program.id}/${dayIndex}`)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <p className="text-gray-400">Building your program…</p>
    </div>
  )

  if (!program) return null

  return (
    <div className="min-h-screen bg-[#0d1117] p-4">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-6 pt-4">
          <h1 className="text-2xl font-bold text-white">My Program</h1>
          <Button variant="ghost" size="sm" onClick={regenerate}>Regenerate</Button>
        </div>
        <div className="flex flex-col gap-4">
          {program.weeks[0].days.map((day, i) => (
            <ProgramDayCard
              key={day.dayIndex}
              day={day}
              exerciseMap={exerciseMap}
              onStart={() => startDay(i)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Add `/program` route to `src/App.tsx`**

```typescript
import { Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './pages/Onboarding'
import { Home } from './pages/Home'
import { MyProgram } from './pages/MyProgram'

export default function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/home" element={<Home />} />
      <Route path="/program" element={<MyProgram />} />
      <Route path="*" element={<Navigate to="/onboarding" replace />} />
    </Routes>
  )
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/program/ src/pages/MyProgram.tsx src/App.tsx
git commit -m "feat: add My Program page — generates and displays weekly program"
```

---

## Task 3: Workout Logger Components

**Files:**
- Create: `src/components/logger/OverloadBadge.tsx`
- Create: `src/components/logger/RestTimer.tsx`
- Create: `src/components/logger/SetRow.tsx`

- [ ] **Step 1: Create `src/components/logger/OverloadBadge.tsx`**

```typescript
interface Props { suggestionKg: number | null; mode: 'automatic' | 'semi_automatic' | 'manual' }

export function OverloadBadge({ suggestionKg, mode }: Props) {
  if (mode === 'manual' || suggestionKg === null) return null
  return (
    <div className="flex items-center gap-2 bg-teal/10 border border-teal/30 rounded-lg px-3 py-2 text-sm">
      <span className="text-teal font-semibold">↑</span>
      <span className="text-white">Suggested: <strong>{suggestionKg}kg</strong></span>
      {mode === 'automatic' && <span className="text-gray-400 text-xs">(auto)</span>}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/logger/RestTimer.tsx`**

```typescript
import { useEffect, useState } from 'react'

interface Props { seconds: number; onDone: () => void; active: boolean }

export function RestTimer({ seconds, onDone, active }: Props) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (!active) { setRemaining(seconds); return }
    if (remaining <= 0) { onDone(); return }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [active, remaining, seconds, onDone])

  useEffect(() => { if (active) setRemaining(seconds) }, [active, seconds])

  if (!active) return null

  const pct = ((seconds - remaining) / seconds) * 100

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="40" fill="none" stroke="#161b22" strokeWidth="8" />
          <circle
            cx="48" cy="48" r="40" fill="none"
            stroke="#00d4aa" strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - pct / 100)}`}
            className="transition-all duration-1000"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
          {remaining}
        </span>
      </div>
      <p className="text-gray-400 text-sm">Rest</p>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/logger/SetRow.tsx`**

```typescript
import { useState } from 'react'

interface Props {
  setNumber: number
  targetReps: number
  targetWeightKg: number
  completed: boolean
  onComplete: (reps: number, weightKg: number) => void
}

export function SetRow({ setNumber, targetReps, targetWeightKg, completed, onComplete }: Props) {
  const [reps, setReps] = useState(String(targetReps))
  const [weight, setWeight] = useState(String(targetWeightKg))

  if (completed) {
    return (
      <div className="flex items-center gap-3 py-2 opacity-50">
        <span className="w-6 h-6 rounded-full bg-teal flex items-center justify-center text-black text-xs font-bold flex-shrink-0">✓</span>
        <span className="text-gray-400 text-sm">Set {setNumber} — {weight}kg × {reps}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 py-2">
      <span className="w-6 h-6 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 text-xs flex-shrink-0">{setNumber}</span>
      <div className="flex gap-2 flex-1">
        <div className="flex flex-col items-center gap-0.5">
          <label className="text-xs text-gray-500">kg</label>
          <input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            className="w-16 bg-[#161b22] border border-white/10 rounded-lg px-2 py-1.5 text-white text-center text-sm focus:outline-none focus:border-teal"
          />
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <label className="text-xs text-gray-500">reps</label>
          <input
            type="number"
            value={reps}
            onChange={e => setReps(e.target.value)}
            className="w-16 bg-[#161b22] border border-white/10 rounded-lg px-2 py-1.5 text-white text-center text-sm focus:outline-none focus:border-teal"
          />
        </div>
      </div>
      <button
        onClick={() => onComplete(Number(reps), Number(weight))}
        className="px-3 py-2 bg-gradient-to-r from-teal to-[#0080ff] text-white text-sm font-semibold rounded-lg"
      >
        Done
      </button>
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
git add src/components/logger/
git commit -m "feat: add workout logger components — SetRow, RestTimer, OverloadBadge"
```

---

## Task 4: Workout Logger Page

**Files:**
- Create: `src/pages/WorkoutLogger.tsx`
- Create: `src/test/workoutLogger.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/workoutLogger.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import 'fake-indexeddb/auto'
import { db } from '../db/db'
import { WorkoutLogger } from '../pages/WorkoutLogger'
import type { Program } from '../types'

const mockNavigate = vi.fn()
const mockParams = vi.fn(() => ({ programId: '1', dayIndex: '0' }))

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams(),
}))

const MOCK_PROGRAM: Omit<Program, 'id'> = {
  version: 1,
  createdAt: new Date(),
  profileSnapshot: {
    name: 'Alex', age: 28, weight: 80, weightUnit: 'kg', height: 180, heightUnit: 'cm',
    experienceLevel: 'intermediate', primaryGoal: 'build_muscle', equipment: ['full_gym'],
    trainingDaysPerWeek: 4, sessionLength: 60, overloadMode: 'automatic', onboardingComplete: true,
  },
  weeks: [{
    weekNumber: 1,
    days: [{
      dayIndex: 0, label: 'Upper A',
      exercises: [
        { exId: 'barbell-bench-press', sets: 4, repMin: 8, repMax: 12, restSeconds: 90, alternatives: [] },
      ],
    }],
  }],
}

beforeEach(async () => {
  await db.delete()
  await db.open()
  await db.programs.add(MOCK_PROGRAM)
  await db.exerciseLibrary.add({
    exId: 'barbell-bench-press', name: 'Barbell Bench Press',
    muscleGroups: ['chest'], secondaryMuscles: [], equipment: ['full_gym'],
    movementPattern: 'push', instructions: [], tips: [],
  })
  mockNavigate.mockClear()
})

describe('WorkoutLogger', () => {
  it('renders the day label', async () => {
    render(<WorkoutLogger />)
    await waitFor(() => expect(screen.getByText('Upper A')).toBeInTheDocument())
  })

  it('renders the first exercise name', async () => {
    render(<WorkoutLogger />)
    await waitFor(() => expect(screen.getByText('Barbell Bench Press')).toBeInTheDocument())
  })

  it('shows set rows for the exercise', async () => {
    render(<WorkoutLogger />)
    await waitFor(() => {
      const doneButtons = screen.getAllByRole('button', { name: /done/i })
      expect(doneButtons.length).toBeGreaterThanOrEqual(1)
    })
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx vitest run src/test/workoutLogger.test.tsx
```
Expected: FAIL — "Cannot find module '../pages/WorkoutLogger'"

- [ ] **Step 3: Create `src/pages/WorkoutLogger.tsx`**

```typescript
import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../db/db'
import { SetRow } from '../components/logger/SetRow'
import { RestTimer } from '../components/logger/RestTimer'
import { OverloadBadge } from '../components/logger/OverloadBadge'
import { Button } from '../components/ui/Button'
import type { Program, Exercise, ProgramExercise, WorkoutSession } from '../types'

interface CompletedSet { reps: number; weightKg: number; setNumber: number }

export function WorkoutLogger() {
  const { programId, dayIndex } = useParams<{ programId: string; dayIndex: string }>()
  const navigate = useNavigate()
  const [program, setProgram] = useState<Program | null>(null)
  const [exerciseMap, setExerciseMap] = useState<Map<string, Exercise>>(new Map())
  const [currentExIdx, setCurrentExIdx] = useState(0)
  const [completedSets, setCompletedSets] = useState<Record<string, CompletedSet[]>>({})
  const [restActive, setRestActive] = useState(false)
  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [programId])

  async function load() {
    const prog = await db.programs.get(Number(programId))
    if (!prog) return
    setProgram(prog)
    const exs = await db.exerciseLibrary.toArray()
    setExerciseMap(new Map(exs.map(e => [e.exId, e])))
    // Create session record
    const sessionId = await db.workoutSessions.add({
      programId: prog.id!,
      dayLabel: prog.weeks[0].days[Number(dayIndex)].label,
      startedAt: new Date(),
    })
    const s = await db.workoutSessions.get(sessionId)
    setSession(s!)
    setLoading(false)
  }

  const handleSetDone = useCallback(async (ex: ProgramExercise, setNumber: number, reps: number, weightKg: number) => {
    if (!session?.id) return
    await db.setLogs.add({
      sessionId: session.id,
      exId: ex.exId,
      setNumber,
      targetReps: ex.repMin,
      actualReps: reps,
      weightKg,
      completedAt: new Date(),
    })
    setCompletedSets(prev => ({
      ...prev,
      [ex.exId]: [...(prev[ex.exId] ?? []), { reps, weightKg, setNumber }],
    }))
    setRestActive(true)
  }, [session])

  const handleRestDone = useCallback(() => setRestActive(false), [])

  async function finishWorkout() {
    if (!session?.id) return
    await db.workoutSessions.update(session.id, { finishedAt: new Date() })
    navigate('/home')
  }

  if (loading || !program) return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <p className="text-gray-400">Loading workout…</p>
    </div>
  )

  const day = program.weeks[0].days[Number(dayIndex)]
  const currentEx = day.exercises[currentExIdx]
  const exName = exerciseMap.get(currentEx?.exId)?.name ?? currentEx?.exId
  const completedForEx = completedSets[currentEx?.exId] ?? []
  const allSetsForEx = completedForEx.length >= currentEx?.sets
  const overloadMode = program.profileSnapshot.overloadMode

  // Calculate overload suggestion: last session's weight for this exercise + 2.5kg
  // (simplified: use last completed set weight + 2.5 if all sets hit repMax)
  const lastWeight = completedForEx.at(-1)?.weightKg ?? 0
  const hitRepMax = completedForEx.length > 0 && completedForEx.every(s => s.reps >= currentEx.repMax)
  const suggestion = hitRepMax ? lastWeight + 2.5 : null

  return (
    <div className="min-h-screen bg-[#0d1117] p-4">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pt-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">{day.label}</h1>
            <p className="text-gray-400 text-sm">Exercise {currentExIdx + 1} of {day.exercises.length}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={finishWorkout}>Finish</Button>
        </div>

        {/* Current exercise */}
        <div className="bg-[#161b22] rounded-xl p-4 border border-white/10 mb-4">
          <h2 className="text-white font-bold text-lg mb-1">{exName}</h2>
          <p className="text-gray-400 text-sm mb-3">
            {currentEx.sets} sets × {currentEx.repMin}–{currentEx.repMax} reps
          </p>
          <OverloadBadge suggestionKg={suggestion} mode={overloadMode} />
        </div>

        {/* Rest timer */}
        {restActive && (
          <RestTimer seconds={currentEx.restSeconds} onDone={handleRestDone} active={restActive} />
        )}

        {/* Sets */}
        {!restActive && (
          <div className="bg-[#161b22] rounded-xl p-4 border border-white/10 mb-4">
            {Array.from({ length: currentEx.sets }).map((_, i) => {
              const done = completedForEx.some(s => s.setNumber === i + 1)
              return (
                <SetRow
                  key={i}
                  setNumber={i + 1}
                  targetReps={currentEx.repMax}
                  targetWeightKg={lastWeight || 0}
                  completed={done}
                  onComplete={(reps, weight) => handleSetDone(currentEx, i + 1, reps, weight)}
                />
              )
            })}
          </div>
        )}

        {/* Navigation between exercises */}
        {allSetsForEx && !restActive && (
          <div className="flex gap-3">
            {currentExIdx < day.exercises.length - 1 ? (
              <Button size="lg" onClick={() => { setCurrentExIdx(i => i + 1) }} className="flex-1">
                Next Exercise
              </Button>
            ) : (
              <Button size="lg" onClick={finishWorkout} className="flex-1">
                Complete Workout 🎉
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Add workout route to `src/App.tsx`**

```typescript
import { Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './pages/Onboarding'
import { Home } from './pages/Home'
import { MyProgram } from './pages/MyProgram'
import { WorkoutLogger } from './pages/WorkoutLogger'

export default function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/home" element={<Home />} />
      <Route path="/program" element={<MyProgram />} />
      <Route path="/workout/:programId/:dayIndex" element={<WorkoutLogger />} />
      <Route path="*" element={<Navigate to="/onboarding" replace />} />
    </Routes>
  )
}
```

- [ ] **Step 6: Run workout logger tests**

```bash
npx vitest run src/test/workoutLogger.test.tsx
```
Expected: PASS (3 tests)

- [ ] **Step 7: Run all tests**

```bash
npx vitest run
```
Expected: All tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/pages/WorkoutLogger.tsx src/App.tsx src/test/workoutLogger.test.tsx
git commit -m "feat: add workout logger page with set logging, rest timer, overload suggestions"
```

---

## Task 5: Wire Home Page to Today's Workout

**Files:**
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: Update `src/pages/Home.tsx` to show today's workout**

```typescript
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../db/db'
import { Button } from '../components/ui/Button'
import type { UserProfile, Program } from '../types'

export function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [program, setProgram] = useState<Program | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    db.userProfile.toCollection().first().then(p => {
      if (!p?.onboardingComplete) { navigate('/onboarding'); return }
      setProfile(p)
    })
    db.programs.orderBy('createdAt').last().then(p => setProgram(p ?? null))
  }, [navigate])

  if (!profile) return null

  // Determine today's day index (0 = Monday offset)
  const today = new Date().getDay()
  const dayMap: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 0 }
  const dayIndex = program ? Math.min(dayMap[today] ?? 0, program.weeks[0].days.length - 1) : 0
  const todayDay = program?.weeks[0].days[dayIndex]

  return (
    <div className="min-h-screen bg-[#0d1117] p-4">
      <div className="max-w-sm mx-auto pt-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Hey, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-[#0080ff]">{profile.name}</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Ready to train?</p>
        </div>

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
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run all tests**

```bash
npx vitest run
```
Expected: All tests pass.

- [ ] **Step 3: Manual smoke test**

```bash
npm run dev
```
Flow to test:
1. Complete onboarding → lands on Home
2. Tap "Build My Program" → sees week of workouts
3. Tap "Start" on any day → WorkoutLogger opens
4. Log a set (tap Done) → set marks complete, rest timer starts
5. Complete all sets → "Next Exercise" button appears
6. Tap "Finish" → returns to Home

- [ ] **Step 4: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "feat: wire home page to today's workout — start workout from home"
```

---

## Plan 2 Complete ✅

Program generator, program view, workout logger, set logging, rest timer, overload suggestions — all wired together. The core training loop is functional end-to-end.

**Next:** Plan 3 — Progress Dashboard, Body Measurements, Calendar.
