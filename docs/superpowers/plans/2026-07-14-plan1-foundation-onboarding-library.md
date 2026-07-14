# letsTrain Plan 1 — Foundation, Onboarding & Exercise Library

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Vite + React + TypeScript PWA, set up Dexie.js with the full data model, seed the exercise library, and implement the onboarding wizard.

**Architecture:** Single-page app with React Router for navigation. All data lives in IndexedDB via Dexie. The exercise library is seeded from a static JSON blob on first run. Onboarding wizard is a multi-step form that writes to the `userProfile` table; once complete, the flag `onboardingComplete: true` routes the user to Home.

**Tech Stack:** Vite 5, React 18, TypeScript 5, TailwindCSS 3, Dexie.js 3, React Router 6, Vitest, @testing-library/react

---

## File Map

```
letsTrain/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── public/
│   ├── manifest.json
│   └── icons/  (placeholder PNGs)
├── src/
│   ├── main.tsx                        # React root + router
│   ├── App.tsx                         # Route tree
│   ├── db/
│   │   ├── db.ts                       # Dexie schema + all table definitions
│   │   └── seed.ts                     # Seeds exerciseLibrary on first run
│   ├── data/
│   │   └── exercises.ts                # Static array of ~150 exercises
│   ├── types/
│   │   └── index.ts                    # All shared TypeScript types/interfaces
│   ├── pages/
│   │   ├── Onboarding.tsx              # Multi-step wizard
│   │   └── Home.tsx                    # Placeholder home screen
│   ├── components/
│   │   ├── onboarding/
│   │   │   ├── StepName.tsx
│   │   │   ├── StepPhysical.tsx
│   │   │   ├── StepGoal.tsx
│   │   │   ├── StepEquipment.tsx
│   │   │   └── StepSchedule.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       └── ProgressBar.tsx
│   └── lib/
│       └── utils.ts                    # cn() helper etc.
└── src/test/
    ├── setup.ts
    ├── db.test.ts
    ├── seed.test.ts
    └── onboarding.test.tsx
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Initialise project**

```bash
cd "c:/Users/5709xr/OneDrive - BP/Documents/VS Code/letsTrain"
npm create vite@latest . -- --template react-ts
```
When prompted "Current directory is not empty. Remove existing files?" — choose **Yes**.

- [ ] **Step 2: Install dependencies**

```bash
npm install dexie react-router-dom
npm install -D tailwindcss @tailwindcss/vite vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 3: Replace `vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

- [ ] **Step 4: Create `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0d1117',
        surface: '#161b22',
        teal: { DEFAULT: '#00d4aa', dark: '#00a882' },
        blue: { accent: '#0080ff' },
      },
    },
  },
} satisfies Config
```

- [ ] **Step 5: Replace `src/index.css`**

```css
@import "tailwindcss";
```

- [ ] **Step 6: Replace `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0d1117" />
    <title>letsTrain</title>
  </head>
  <body class="bg-[#0d1117] text-white min-h-screen">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Create `src/test/setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 8: Smoke-test the dev server**

```bash
npm run dev
```
Expected: Vite prints a localhost URL, browser shows the default React page.

- [ ] **Step 9: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold vite react-ts project with tailwind and dexie"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Create types**

```typescript
// src/types/index.ts

export type EquipmentType = 'full_gym' | 'home_barbell' | 'dumbbells' | 'bodyweight'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
export type PrimaryGoal = 'build_muscle' | 'build_strength' | 'hybrid' | 'recomp'
export type TrainingDays = 3 | 4 | 5 | 6 | 'flexible'
export type SessionLength = 45 | 60 | 90 | 'flexible'
export type OverloadMode = 'automatic' | 'semi_automatic' | 'manual'
export type WeightUnit = 'kg' | 'lb'
export type HeightUnit = 'cm' | 'ft'
export type MovementPattern = 'push' | 'pull' | 'hinge' | 'squat' | 'carry' | 'isolation'
export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps'
  | 'forearms' | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'core' | 'traps'

export interface UserProfile {
  id?: number
  name: string
  age: number
  weight: number
  weightUnit: WeightUnit
  height: number
  heightUnit: HeightUnit
  experienceLevel: ExperienceLevel
  primaryGoal: PrimaryGoal
  equipment: EquipmentType[]
  trainingDaysPerWeek: TrainingDays
  sessionLength: SessionLength
  overloadMode: OverloadMode
  onboardingComplete: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Exercise {
  id?: number
  exId: string               // stable string id e.g. "barbell-squat"
  name: string
  muscleGroups: MuscleGroup[]
  secondaryMuscles: MuscleGroup[]
  equipment: EquipmentType[]
  movementPattern: MovementPattern
  instructions: string[]
  tips: string[]
}

export interface Program {
  id?: number
  version: number
  createdAt: Date
  profileSnapshot: Omit<UserProfile, 'id'>
  weeks: ProgramWeek[]
}

export interface ProgramWeek {
  weekNumber: number
  days: ProgramDay[]
}

export interface ProgramDay {
  dayIndex: number       // 0-based day of the week
  label: string          // e.g. "Push", "Upper", "Full Body"
  exercises: ProgramExercise[]
}

export interface ProgramExercise {
  exId: string
  sets: number
  repMin: number
  repMax: number
  restSeconds: number
  alternatives: string[] // exId list
}

export interface WorkoutSession {
  id?: number
  programId: number
  dayLabel: string
  startedAt: Date
  finishedAt?: Date
  rpe?: number           // 1–10
  notes?: string
}

export interface SetLog {
  id?: number
  sessionId: number
  exId: string
  setNumber: number
  targetReps: number
  actualReps: number
  weightKg: number
  completedAt: Date
}

export interface BodyMeasurement {
  id?: number
  date: Date
  weightKg?: number
  bodyFatPct?: number
  chestCm?: number
  waistCm?: number
  hipsCm?: number
  leftArmCm?: number
  rightArmCm?: number
  leftThighCm?: number
  rightThighCm?: number
}

export interface NutritionLog {
  id?: number
  date: Date
  mealName: string
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add all shared TypeScript types"
```

---

## Task 3: Dexie Database

**Files:**
- Create: `src/db/db.ts`
- Create: `src/test/db.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/db.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../db/db'
import type { UserProfile } from '../types'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('db', () => {
  it('opens and has all tables', () => {
    expect(db.isOpen()).toBe(true)
    expect(db.tables.map(t => t.name)).toEqual(
      expect.arrayContaining([
        'userProfile', 'programs', 'workoutSessions',
        'setLogs', 'bodyMeasurements', 'nutritionLogs', 'exerciseLibrary'
      ])
    )
  })

  it('can write and read a userProfile', async () => {
    const profile: Omit<UserProfile, 'id'> = {
      name: 'Alex',
      age: 30,
      weight: 80,
      weightUnit: 'kg',
      height: 180,
      heightUnit: 'cm',
      experienceLevel: 'intermediate',
      primaryGoal: 'build_muscle',
      equipment: ['full_gym'],
      trainingDaysPerWeek: 4,
      sessionLength: 60,
      overloadMode: 'automatic',
      onboardingComplete: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const id = await db.userProfile.add(profile)
    const saved = await db.userProfile.get(id)
    expect(saved?.name).toBe('Alex')
  })
})
```

- [ ] **Step 2: Install fake-indexeddb**

```bash
npm install -D fake-indexeddb
```

- [ ] **Step 3: Run test to confirm it fails**

```bash
npx vitest run src/test/db.test.ts
```
Expected: FAIL — "Cannot find module '../db/db'"

- [ ] **Step 4: Create `src/db/db.ts`**

```typescript
import Dexie, { type EntityTable } from 'dexie'
import type {
  UserProfile, Exercise, Program,
  WorkoutSession, SetLog, BodyMeasurement, NutritionLog
} from '../types'

class LetstrainDB extends Dexie {
  userProfile!: EntityTable<UserProfile, 'id'>
  programs!: EntityTable<Program, 'id'>
  workoutSessions!: EntityTable<WorkoutSession, 'id'>
  setLogs!: EntityTable<SetLog, 'id'>
  bodyMeasurements!: EntityTable<BodyMeasurement, 'id'>
  nutritionLogs!: EntityTable<NutritionLog, 'id'>
  exerciseLibrary!: EntityTable<Exercise, 'id'>

  constructor() {
    super('letstrain')
    this.version(1).stores({
      userProfile:       '++id',
      programs:          '++id, createdAt',
      workoutSessions:   '++id, programId, startedAt',
      setLogs:           '++id, sessionId, exId',
      bodyMeasurements:  '++id, date',
      nutritionLogs:     '++id, date',
      exerciseLibrary:   '++id, exId, *muscleGroups, *equipment, movementPattern',
    })
  }
}

export const db = new LetstrainDB()
```

- [ ] **Step 5: Run test to confirm it passes**

```bash
npx vitest run src/test/db.test.ts
```
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add src/db/db.ts src/test/db.test.ts
git commit -m "feat: add dexie db schema with all tables"
```

---

## Task 4: Exercise Library Data + Seeding

**Files:**
- Create: `src/data/exercises.ts`
- Create: `src/db/seed.ts`
- Create: `src/test/seed.test.ts`

- [ ] **Step 1: Write the failing seed test**

```typescript
// src/test/seed.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../db/db'
import { seedExercises } from '../db/seed'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('seedExercises', () => {
  it('populates exerciseLibrary when empty', async () => {
    await seedExercises()
    const count = await db.exerciseLibrary.count()
    expect(count).toBeGreaterThanOrEqual(30)
  })

  it('does not duplicate on second call', async () => {
    await seedExercises()
    await seedExercises()
    const count = await db.exerciseLibrary.count()
    const first = await db.exerciseLibrary.count()
    expect(count).toBe(first)
  })

  it('every exercise has at least one muscleGroup and equipment', async () => {
    await seedExercises()
    const all = await db.exerciseLibrary.toArray()
    for (const ex of all) {
      expect(ex.muscleGroups.length).toBeGreaterThan(0)
      expect(ex.equipment.length).toBeGreaterThan(0)
    }
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx vitest run src/test/seed.test.ts
```
Expected: FAIL — "Cannot find module '../db/seed'"

- [ ] **Step 3: Create `src/data/exercises.ts`**

```typescript
import type { Exercise } from '../types'

export const EXERCISES: Omit<Exercise, 'id'>[] = [
  // ── CHEST ──
  { exId: 'barbell-bench-press', name: 'Barbell Bench Press', muscleGroups: ['chest'], secondaryMuscles: ['triceps', 'shoulders'], equipment: ['full_gym', 'home_barbell'], movementPattern: 'push', instructions: ['Lie on bench, grip bar slightly wider than shoulder-width', 'Lower bar to mid-chest under control', 'Press back to lockout'], tips: ['Keep shoulder blades retracted', 'Feet flat on floor'] },
  { exId: 'dumbbell-bench-press', name: 'Dumbbell Bench Press', muscleGroups: ['chest'], secondaryMuscles: ['triceps', 'shoulders'], equipment: ['full_gym', 'dumbbells'], movementPattern: 'push', instructions: ['Lie on bench with a dumbbell in each hand', 'Press dumbbells up until arms are extended', 'Lower with control'], tips: ['Neutral grip is easier on shoulders'] },
  { exId: 'incline-barbell-press', name: 'Incline Barbell Press', muscleGroups: ['chest'], secondaryMuscles: ['shoulders', 'triceps'], equipment: ['full_gym'], movementPattern: 'push', instructions: ['Set bench to 30–45°', 'Grip bar wider than shoulder-width', 'Lower to upper chest, press up'], tips: ['Keep elbows at ~45° to body'] },
  { exId: 'push-up', name: 'Push-Up', muscleGroups: ['chest'], secondaryMuscles: ['triceps', 'shoulders', 'core'], equipment: ['bodyweight', 'full_gym', 'home_barbell', 'dumbbells'], movementPattern: 'push', instructions: ['Start in high plank', 'Lower chest to floor', 'Push back to start'], tips: ['Core tight throughout'] },
  { exId: 'cable-fly', name: 'Cable Fly', muscleGroups: ['chest'], secondaryMuscles: [], equipment: ['full_gym'], movementPattern: 'isolation', instructions: ['Set cables at shoulder height', 'Pull handles together in front of chest', 'Control the return'], tips: ['Slight bend in elbows'] },
  { exId: 'dumbbell-fly', name: 'Dumbbell Fly', muscleGroups: ['chest'], secondaryMuscles: [], equipment: ['full_gym', 'dumbbells'], movementPattern: 'isolation', instructions: ['Lie flat, arms wide with slight elbow bend', 'Bring dumbbells together over chest', 'Lower slowly'], tips: ['Feel the stretch at the bottom'] },

  // ── BACK ──
  { exId: 'pull-up', name: 'Pull-Up', muscleGroups: ['back'], secondaryMuscles: ['biceps', 'core'], equipment: ['full_gym', 'bodyweight'], movementPattern: 'pull', instructions: ['Hang from bar with overhand grip', 'Pull chest to bar', 'Lower with control'], tips: ['Initiate with shoulder blades pulling down'] },
  { exId: 'chin-up', name: 'Chin-Up', muscleGroups: ['back'], secondaryMuscles: ['biceps'], equipment: ['full_gym', 'bodyweight'], movementPattern: 'pull', instructions: ['Hang from bar with underhand grip', 'Pull chin above bar', 'Lower slowly'], tips: ['Bicep involvement is greater than pull-ups'] },
  { exId: 'barbell-row', name: 'Barbell Row', muscleGroups: ['back'], secondaryMuscles: ['biceps', 'traps'], equipment: ['full_gym', 'home_barbell'], movementPattern: 'pull', instructions: ['Hinge at hips ~45°', 'Pull bar to lower chest', 'Lower with control'], tips: ['Keep back neutral throughout'] },
  { exId: 'dumbbell-row', name: 'Dumbbell Row', muscleGroups: ['back'], secondaryMuscles: ['biceps', 'traps'], equipment: ['full_gym', 'dumbbells', 'home_barbell'], movementPattern: 'pull', instructions: ['Support with one hand on bench', 'Pull dumbbell to hip', 'Lower slowly'], tips: ['Elbow close to body'] },
  { exId: 'lat-pulldown', name: 'Lat Pulldown', muscleGroups: ['back'], secondaryMuscles: ['biceps'], equipment: ['full_gym'], movementPattern: 'pull', instructions: ['Grip bar wider than shoulder-width', 'Pull to upper chest', 'Slow return'], tips: ['Lean back slightly for better lat activation'] },
  { exId: 'seated-cable-row', name: 'Seated Cable Row', muscleGroups: ['back'], secondaryMuscles: ['biceps', 'traps'], equipment: ['full_gym'], movementPattern: 'pull', instructions: ['Sit tall, pull handle to abdomen', 'Squeeze shoulder blades together', 'Slow return'], tips: ['Avoid rounding forward'] },
  { exId: 'deadlift', name: 'Deadlift', muscleGroups: ['back'], secondaryMuscles: ['hamstrings', 'glutes', 'traps', 'core'], equipment: ['full_gym', 'home_barbell'], movementPattern: 'hinge', instructions: ['Stand with bar over mid-foot', 'Hinge, grip just outside legs', 'Drive hips forward to stand'], tips: ['Bar stays close to legs throughout'] },

  // ── SHOULDERS ──
  { exId: 'overhead-press', name: 'Barbell Overhead Press', muscleGroups: ['shoulders'], secondaryMuscles: ['triceps', 'traps', 'core'], equipment: ['full_gym', 'home_barbell'], movementPattern: 'push', instructions: ['Grip bar at shoulder-width', 'Press bar overhead to lockout', 'Lower to clavicle level'], tips: ['Squeeze glutes for stability'] },
  { exId: 'dumbbell-shoulder-press', name: 'Dumbbell Shoulder Press', muscleGroups: ['shoulders'], secondaryMuscles: ['triceps'], equipment: ['full_gym', 'dumbbells'], movementPattern: 'push', instructions: ['Hold dumbbells at shoulder height', 'Press overhead to lockout', 'Lower with control'], tips: ['Avoid excessive lumbar extension'] },
  { exId: 'lateral-raise', name: 'Lateral Raise', muscleGroups: ['shoulders'], secondaryMuscles: [], equipment: ['full_gym', 'dumbbells'], movementPattern: 'isolation', instructions: ['Hold dumbbells at sides', 'Raise arms to shoulder height', 'Lower slowly'], tips: ['Slight forward lean targets lateral head better'] },
  { exId: 'face-pull', name: 'Face Pull', muscleGroups: ['shoulders'], secondaryMuscles: ['traps'], equipment: ['full_gym'], movementPattern: 'pull', instructions: ['Set cable at head height with rope', 'Pull to face, flare elbows out', 'Slow return'], tips: ['Great for rear delts and external rotation'] },
  { exId: 'reverse-fly', name: 'Reverse Fly', muscleGroups: ['shoulders'], secondaryMuscles: ['traps'], equipment: ['full_gym', 'dumbbells'], movementPattern: 'pull', instructions: ['Hinge forward, arms hanging', 'Raise arms to sides', 'Lower with control'], tips: ['Keep slight elbow bend'] },

  // ── BICEPS ──
  { exId: 'barbell-curl', name: 'Barbell Curl', muscleGroups: ['biceps'], secondaryMuscles: ['forearms'], equipment: ['full_gym', 'home_barbell'], movementPattern: 'pull', instructions: ['Grip bar shoulder-width underhand', 'Curl to shoulder height', 'Lower fully'], tips: ['Elbows fixed at sides'] },
  { exId: 'dumbbell-curl', name: 'Dumbbell Curl', muscleGroups: ['biceps'], secondaryMuscles: ['forearms'], equipment: ['full_gym', 'dumbbells'], movementPattern: 'pull', instructions: ['Curl one or both dumbbells', 'Supinate at top', 'Lower fully'], tips: ['Full range of motion'] },
  { exId: 'hammer-curl', name: 'Hammer Curl', muscleGroups: ['biceps'], secondaryMuscles: ['forearms'], equipment: ['full_gym', 'dumbbells'], movementPattern: 'pull', instructions: ['Hold dumbbells neutral grip', 'Curl to shoulder height', 'Lower slowly'], tips: ['Targets brachialis and brachioradialis'] },

  // ── TRICEPS ──
  { exId: 'close-grip-bench', name: 'Close-Grip Bench Press', muscleGroups: ['triceps'], secondaryMuscles: ['chest', 'shoulders'], equipment: ['full_gym', 'home_barbell'], movementPattern: 'push', instructions: ['Grip bar shoulder-width', 'Lower to chest keeping elbows close', 'Press up'], tips: ['Elbows should stay ~45° from torso'] },
  { exId: 'tricep-pushdown', name: 'Tricep Pushdown', muscleGroups: ['triceps'], secondaryMuscles: [], equipment: ['full_gym'], movementPattern: 'push', instructions: ['Grip cable attachment overhand', 'Push down to full extension', 'Slow return'], tips: ['Keep upper arms stationary'] },
  { exId: 'overhead-tricep-extension', name: 'Overhead Tricep Extension', muscleGroups: ['triceps'], secondaryMuscles: [], equipment: ['full_gym', 'dumbbells'], movementPattern: 'push', instructions: ['Hold dumbbell overhead with both hands', 'Lower behind head', 'Extend to lockout'], tips: ['Long head gets full stretch'] },
  { exId: 'dip', name: 'Dip', muscleGroups: ['triceps'], secondaryMuscles: ['chest', 'shoulders'], equipment: ['full_gym', 'bodyweight'], movementPattern: 'push', instructions: ['Grip parallel bars, arms extended', 'Lower until upper arms parallel to floor', 'Push back up'], tips: ['Lean forward to bias chest'] },

  // ── QUADS ──
  { exId: 'barbell-squat', name: 'Barbell Back Squat', muscleGroups: ['quads'], secondaryMuscles: ['hamstrings', 'glutes', 'core'], equipment: ['full_gym', 'home_barbell'], movementPattern: 'squat', instructions: ['Bar on traps, feet shoulder-width', 'Squat until thighs parallel', 'Drive back up'], tips: ['Knees track over toes'] },
  { exId: 'goblet-squat', name: 'Goblet Squat', muscleGroups: ['quads'], secondaryMuscles: ['glutes', 'core'], equipment: ['full_gym', 'dumbbells'], movementPattern: 'squat', instructions: ['Hold dumbbell at chest', 'Squat deep', 'Drive up'], tips: ['Great for beginners — teaches squat pattern'] },
  { exId: 'leg-press', name: 'Leg Press', muscleGroups: ['quads'], secondaryMuscles: ['hamstrings', 'glutes'], equipment: ['full_gym'], movementPattern: 'squat', instructions: ['Seat in machine, feet shoulder-width on platform', 'Lower platform until 90°', 'Press back'], tips: ['Do not lock out knees aggressively'] },
  { exId: 'lunge', name: 'Dumbbell Lunge', muscleGroups: ['quads'], secondaryMuscles: ['glutes', 'hamstrings'], equipment: ['full_gym', 'dumbbells', 'bodyweight'], movementPattern: 'squat', instructions: ['Step forward, lower back knee to floor', 'Drive front foot back to start', 'Alternate legs'], tips: ['Keep torso upright'] },
  { exId: 'leg-extension', name: 'Leg Extension', muscleGroups: ['quads'], secondaryMuscles: [], equipment: ['full_gym'], movementPattern: 'isolation', instructions: ['Sit in machine, extend legs fully', 'Pause at top', 'Lower slowly'], tips: ['Good isolation finisher'] },

  // ── HAMSTRINGS ──
  { exId: 'romanian-deadlift', name: 'Romanian Deadlift', muscleGroups: ['hamstrings'], secondaryMuscles: ['glutes', 'back'], equipment: ['full_gym', 'home_barbell', 'dumbbells'], movementPattern: 'hinge', instructions: ['Hold bar at hips', 'Hinge forward keeping legs almost straight', 'Return to standing'], tips: ['Feel the hamstring stretch at the bottom'] },
  { exId: 'leg-curl', name: 'Lying Leg Curl', muscleGroups: ['hamstrings'], secondaryMuscles: [], equipment: ['full_gym'], movementPattern: 'isolation', instructions: ['Lie face down in machine', 'Curl heels to glutes', 'Lower slowly'], tips: ['Slow eccentric for hypertrophy'] },
  { exId: 'nordic-hamstring-curl', name: 'Nordic Hamstring Curl', muscleGroups: ['hamstrings'], secondaryMuscles: [], equipment: ['full_gym', 'bodyweight'], movementPattern: 'hinge', instructions: ['Kneel with feet anchored', 'Lower torso to floor under control', 'Push back up'], tips: ['Very high eccentric load — great for injury prevention'] },

  // ── GLUTES ──
  { exId: 'hip-thrust', name: 'Barbell Hip Thrust', muscleGroups: ['glutes'], secondaryMuscles: ['hamstrings'], equipment: ['full_gym', 'home_barbell'], movementPattern: 'hinge', instructions: ['Upper back on bench, bar over hips', 'Drive hips to ceiling', 'Squeeze glutes at top'], tips: ['Chin to chest to protect spine'] },
  { exId: 'glute-bridge', name: 'Bodyweight Glute Bridge', muscleGroups: ['glutes'], secondaryMuscles: ['hamstrings'], equipment: ['bodyweight', 'full_gym', 'home_barbell', 'dumbbells'], movementPattern: 'hinge', instructions: ['Lie on back, feet flat on floor', 'Drive hips up', 'Squeeze at top'], tips: ['Add a band around knees for more activation'] },
  { exId: 'cable-kickback', name: 'Cable Kickback', muscleGroups: ['glutes'], secondaryMuscles: [], equipment: ['full_gym'], movementPattern: 'isolation', instructions: ['Attach ankle cuff to low cable', 'Kick leg back and up', 'Squeeze glute at top'], tips: ['Control the return'] },

  // ── CALVES ──
  { exId: 'standing-calf-raise', name: 'Standing Calf Raise', muscleGroups: ['calves'], secondaryMuscles: [], equipment: ['full_gym', 'bodyweight', 'home_barbell', 'dumbbells'], movementPattern: 'isolation', instructions: ['Stand on edge of step or flat ground', 'Rise onto toes', 'Lower fully for stretch'], tips: ['Full range of motion > heavy weight'] },
  { exId: 'seated-calf-raise', name: 'Seated Calf Raise', muscleGroups: ['calves'], secondaryMuscles: [], equipment: ['full_gym'], movementPattern: 'isolation', instructions: ['Sit in machine with pads over knees', 'Rise onto toes', 'Lower for deep stretch'], tips: ['Targets soleus more than standing variation'] },

  // ── CORE ──
  { exId: 'plank', name: 'Plank', muscleGroups: ['core'], secondaryMuscles: ['shoulders'], equipment: ['bodyweight', 'full_gym', 'home_barbell', 'dumbbells'], movementPattern: 'carry', instructions: ['Forearm plank position', 'Hold body rigid', 'Breathe steadily'], tips: ['Do not let hips sag or pike'] },
  { exId: 'ab-rollout', name: 'Ab Rollout', muscleGroups: ['core'], secondaryMuscles: ['back', 'shoulders'], equipment: ['full_gym'], movementPattern: 'carry', instructions: ['Kneel holding ab wheel', 'Roll out until hips extend', 'Pull back with abs'], tips: ['Start with short range of motion'] },
  { exId: 'hanging-leg-raise', name: 'Hanging Leg Raise', muscleGroups: ['core'], secondaryMuscles: ['hip flexors'], equipment: ['full_gym', 'bodyweight'], movementPattern: 'pull', instructions: ['Hang from bar', 'Raise legs to 90° or higher', 'Lower slowly'], tips: ['Avoid swinging'] },
  { exId: 'cable-crunch', name: 'Cable Crunch', muscleGroups: ['core'], secondaryMuscles: [], equipment: ['full_gym'], movementPattern: 'isolation', instructions: ['Kneel facing cable stack', 'Hold rope at temples', 'Crunch elbows to knees'], tips: ['Resist on the way back up'] },

  // ── TRAPS ──
  { exId: 'barbell-shrug', name: 'Barbell Shrug', muscleGroups: ['traps'], secondaryMuscles: ['forearms'], equipment: ['full_gym', 'home_barbell'], movementPattern: 'carry', instructions: ['Hold bar in front at hip height', 'Shrug shoulders to ears', 'Hold 1 second, lower'], tips: ['No neck rolling'] },
  { exId: 'dumbbell-shrug', name: 'Dumbbell Shrug', muscleGroups: ['traps'], secondaryMuscles: [], equipment: ['full_gym', 'dumbbells'], movementPattern: 'carry', instructions: ['Hold dumbbells at sides', 'Shrug to ears', 'Lower with control'], tips: ['Squeeze at top'] },

  // ── FOREARMS ──
  { exId: 'wrist-curl', name: 'Wrist Curl', muscleGroups: ['forearms'], secondaryMuscles: [], equipment: ['full_gym', 'dumbbells', 'home_barbell'], movementPattern: 'isolation', instructions: ['Sit on bench, forearms on thighs', 'Curl wrists up', 'Lower slowly'], tips: ['Light weight, high reps'] },
  { exId: 'farmers-carry', name: "Farmer's Carry", muscleGroups: ['forearms'], secondaryMuscles: ['traps', 'core', 'calves'], equipment: ['full_gym', 'dumbbells', 'home_barbell'], movementPattern: 'carry', instructions: ['Hold heavy dumbbells or trap bar', 'Walk with tall posture', 'Maintain grip throughout'], tips: ['Great full-body finisher'] },
]
```

- [ ] **Step 4: Create `src/db/seed.ts`**

```typescript
import { db } from './db'
import { EXERCISES } from '../data/exercises'

export async function seedExercises(): Promise<void> {
  const count = await db.exerciseLibrary.count()
  if (count > 0) return
  await db.exerciseLibrary.bulkAdd(EXERCISES as Parameters<typeof db.exerciseLibrary.bulkAdd>[0])
}
```

- [ ] **Step 5: Run seed tests**

```bash
npx vitest run src/test/seed.test.ts
```
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add src/data/exercises.ts src/db/seed.ts src/test/seed.test.ts
git commit -m "feat: add exercise library data and seeding logic"
```

---

## Task 5: UI Primitives

**Files:**
- Create: `src/lib/utils.ts`
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Select.tsx`
- Create: `src/components/ui/ProgressBar.tsx`

- [ ] **Step 1: Create `src/lib/utils.ts`**

```typescript
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
```

- [ ] **Step 2: Create `src/components/ui/Button.tsx`**

```typescript
import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-teal',
        variant === 'primary' && 'bg-gradient-to-r from-teal to-[#0080ff] text-white hover:opacity-90',
        variant === 'secondary' && 'bg-surface border border-teal/30 text-white hover:border-teal/60',
        variant === 'ghost' && 'text-teal hover:bg-teal/10',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-5 py-2.5 text-base',
        size === 'lg' && 'px-6 py-3 text-lg w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 3: Create `src/components/ui/Input.tsx`**

```typescript
import { cn } from '../../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-gray-400">{label}</label>}
      <input
        className={cn(
          'bg-surface border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500',
          'focus:outline-none focus:border-teal transition-colors',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <span className="text-sm text-red-400">{error}</span>}
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/ui/Select.tsx`**

```typescript
import { cn } from '../../lib/utils'

interface SelectOption { value: string; label: string }
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-gray-400">{label}</label>}
      <select
        className={cn(
          'bg-surface border border-white/10 rounded-lg px-4 py-2.5 text-white',
          'focus:outline-none focus:border-teal transition-colors',
          className
        )}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
```

- [ ] **Step 5: Create `src/components/ui/ProgressBar.tsx`**

```typescript
interface ProgressBarProps { current: number; total: number }

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="w-full bg-surface rounded-full h-1.5">
      <div
        className="h-1.5 rounded-full bg-gradient-to-r from-teal to-[#0080ff] transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/ src/components/ui/
git commit -m "feat: add UI primitives — Button, Input, Select, ProgressBar"
```

---

## Task 6: Onboarding Wizard

**Files:**
- Create: `src/components/onboarding/StepName.tsx`
- Create: `src/components/onboarding/StepPhysical.tsx`
- Create: `src/components/onboarding/StepGoal.tsx`
- Create: `src/components/onboarding/StepEquipment.tsx`
- Create: `src/components/onboarding/StepSchedule.tsx`
- Create: `src/pages/Onboarding.tsx`
- Create: `src/test/onboarding.test.tsx`

- [ ] **Step 1: Write the failing onboarding test**

```typescript
// src/test/onboarding.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import 'fake-indexeddb/auto'
import { db } from '../db/db'
import { Onboarding } from '../pages/Onboarding'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

beforeEach(async () => {
  await db.delete()
  await db.open()
  mockNavigate.mockClear()
})

describe('Onboarding', () => {
  it('renders step 1 — name input', () => {
    render(<Onboarding />)
    expect(screen.getByText(/what should we call you/i)).toBeInTheDocument()
  })

  it('advances to step 2 after entering a name', async () => {
    render(<Onboarding />)
    await userEvent.type(screen.getByRole('textbox'), 'Alex')
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText(/physical stats/i)).toBeInTheDocument()
  })

  it('does not advance without a name', async () => {
    render(<Onboarding />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText(/what should we call you/i)).toBeInTheDocument()
  })

  it('shows progress bar that increments', async () => {
    render(<Onboarding />)
    const bar = document.querySelector('[style]') as HTMLElement
    const initialWidth = bar?.style.width
    await userEvent.type(screen.getByRole('textbox'), 'Alex')
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(bar?.style.width).not.toBe(initialWidth)
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx vitest run src/test/onboarding.test.tsx
```
Expected: FAIL — "Cannot find module '../pages/Onboarding'"

- [ ] **Step 3: Create `src/components/onboarding/StepName.tsx`**

```typescript
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface Props { name: string; onChange: (v: string) => void; onNext: () => void }

export function StepName({ name, onChange, onNext }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white">What should we call you?</h2>
        <p className="text-gray-400 mt-1">This is just for display inside the app.</p>
      </div>
      <Input
        placeholder="Your name"
        value={name}
        onChange={e => onChange(e.target.value)}
        autoFocus
      />
      <Button size="lg" onClick={onNext} disabled={!name.trim()}>
        Next
      </Button>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/onboarding/StepPhysical.tsx`**

```typescript
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import type { WeightUnit, HeightUnit } from '../../types'

interface Props {
  age: number; weight: number; weightUnit: WeightUnit
  height: number; heightUnit: HeightUnit
  onChange: (field: string, value: string | number) => void
  onNext: () => void; onBack: () => void
}

export function StepPhysical({ age, weight, weightUnit, height, heightUnit, onChange, onNext, onBack }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Physical Stats</h2>
        <p className="text-gray-400 mt-1">Used to tailor your program and track progress.</p>
      </div>
      <Input label="Age" type="number" min={13} max={99} value={age || ''} onChange={e => onChange('age', Number(e.target.value))} />
      <div className="flex gap-3">
        <div className="flex-1">
          <Input label="Weight" type="number" min={20} max={400} value={weight || ''} onChange={e => onChange('weight', Number(e.target.value))} />
        </div>
        <Select
          label="Unit"
          options={[{ value: 'kg', label: 'kg' }, { value: 'lb', label: 'lb' }]}
          value={weightUnit}
          onChange={e => onChange('weightUnit', e.target.value)}
          className="w-24 self-end"
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <Input label="Height" type="number" min={100} max={250} value={height || ''} onChange={e => onChange('height', Number(e.target.value))} />
        </div>
        <Select
          label="Unit"
          options={[{ value: 'cm', label: 'cm' }, { value: 'ft', label: 'ft' }]}
          value={heightUnit}
          onChange={e => onChange('heightUnit', e.target.value)}
          className="w-24 self-end"
        />
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" size="lg" onClick={onBack} className="flex-1">Back</Button>
        <Button size="lg" onClick={onNext} disabled={!age || !weight || !height} className="flex-1">Next</Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create `src/components/onboarding/StepGoal.tsx`**

```typescript
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import type { ExperienceLevel, PrimaryGoal } from '../../types'
import { cn } from '../../lib/utils'

interface Props {
  experienceLevel: ExperienceLevel; primaryGoal: PrimaryGoal
  onChange: (field: string, value: string) => void
  onNext: () => void; onBack: () => void
}

const GOALS: { value: PrimaryGoal; label: string; desc: string }[] = [
  { value: 'build_muscle', label: 'Build Muscle', desc: 'Higher volume, 8–15 reps' },
  { value: 'build_strength', label: 'Build Strength', desc: 'Heavy compound, 1–6 reps' },
  { value: 'hybrid', label: 'Strength-Hypertrophy', desc: 'Best of both, 4–12 reps' },
  { value: 'recomp', label: 'Recomp / Cut', desc: 'Maintain muscle, reduce fat' },
]

export function StepGoal({ experienceLevel, primaryGoal, onChange, onNext, onBack }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Your Goal</h2>
        <p className="text-gray-400 mt-1">This shapes your program's rep ranges and volume.</p>
      </div>
      <Select
        label="Experience Level"
        options={[
          { value: 'beginner', label: 'Beginner (< 1 year)' },
          { value: 'intermediate', label: 'Intermediate (1–3 years)' },
          { value: 'advanced', label: 'Advanced (3+ years)' },
        ]}
        value={experienceLevel}
        onChange={e => onChange('experienceLevel', e.target.value)}
      />
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-400">Primary Goal</label>
        {GOALS.map(g => (
          <button
            key={g.value}
            onClick={() => onChange('primaryGoal', g.value)}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
              primaryGoal === g.value
                ? 'border-teal bg-teal/10 text-white'
                : 'border-white/10 bg-surface text-gray-300 hover:border-white/30'
            )}
          >
            <div className={cn('w-4 h-4 rounded-full border-2 flex-shrink-0',
              primaryGoal === g.value ? 'border-teal bg-teal' : 'border-gray-500')} />
            <div>
              <div className="font-medium">{g.label}</div>
              <div className="text-sm text-gray-400">{g.desc}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" size="lg" onClick={onBack} className="flex-1">Back</Button>
        <Button size="lg" onClick={onNext} className="flex-1">Next</Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create `src/components/onboarding/StepEquipment.tsx`**

```typescript
import { Button } from '../ui/Button'
import type { EquipmentType } from '../../types'
import { cn } from '../../lib/utils'

interface Props {
  equipment: EquipmentType[]
  onChange: (equipment: EquipmentType[]) => void
  onNext: () => void; onBack: () => void
}

const OPTIONS: { value: EquipmentType; label: string; desc: string }[] = [
  { value: 'full_gym', label: 'Full Gym', desc: 'Barbells, cables, machines' },
  { value: 'home_barbell', label: 'Home Barbell', desc: 'Barbell + rack, limited machines' },
  { value: 'dumbbells', label: 'Dumbbells Only', desc: 'Dumbbell-based workouts' },
  { value: 'bodyweight', label: 'Bodyweight', desc: 'No equipment needed' },
]

export function StepEquipment({ equipment, onChange, onNext, onBack }: Props) {
  function toggle(value: EquipmentType) {
    onChange(equipment.includes(value) ? equipment.filter(e => e !== value) : [...equipment, value])
  }
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Available Equipment</h2>
        <p className="text-gray-400 mt-1">Select all that apply. Exercises will be filtered accordingly.</p>
      </div>
      <div className="flex flex-col gap-2">
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
              equipment.includes(opt.value)
                ? 'border-teal bg-teal/10 text-white'
                : 'border-white/10 bg-surface text-gray-300 hover:border-white/30'
            )}
          >
            <div className={cn('w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center',
              equipment.includes(opt.value) ? 'border-teal bg-teal' : 'border-gray-500')}>
              {equipment.includes(opt.value) && <span className="text-black text-xs font-bold">✓</span>}
            </div>
            <div>
              <div className="font-medium">{opt.label}</div>
              <div className="text-sm text-gray-400">{opt.desc}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" size="lg" onClick={onBack} className="flex-1">Back</Button>
        <Button size="lg" onClick={onNext} disabled={equipment.length === 0} className="flex-1">Next</Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Create `src/components/onboarding/StepSchedule.tsx`**

```typescript
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import type { TrainingDays, SessionLength, OverloadMode } from '../../types'

interface Props {
  trainingDaysPerWeek: TrainingDays; sessionLength: SessionLength; overloadMode: OverloadMode
  onChange: (field: string, value: string | number) => void
  onSubmit: () => void; onBack: () => void
  saving: boolean
}

export function StepSchedule({ trainingDaysPerWeek, sessionLength, overloadMode, onChange, onSubmit, onBack, saving }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Schedule & Preferences</h2>
        <p className="text-gray-400 mt-1">We'll build a program that fits your life.</p>
      </div>
      <Select
        label="Training Days / Week"
        options={[
          { value: '3', label: '3 days — Full Body' },
          { value: '4', label: '4 days — Upper / Lower' },
          { value: '5', label: '5 days — PPL + 2 Upper' },
          { value: '6', label: '6 days — Full PPL' },
          { value: 'flexible', label: 'Flexible' },
        ]}
        value={String(trainingDaysPerWeek)}
        onChange={e => onChange('trainingDaysPerWeek', isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value))}
      />
      <Select
        label="Session Length"
        options={[
          { value: '45', label: '45 minutes' },
          { value: '60', label: '60 minutes' },
          { value: '90', label: '90 minutes' },
          { value: 'flexible', label: 'Flexible' },
        ]}
        value={String(sessionLength)}
        onChange={e => onChange('sessionLength', isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value))}
      />
      <Select
        label="Progressive Overload Mode"
        options={[
          { value: 'automatic', label: 'Automatic — app adds weight when you hit targets' },
          { value: 'semi_automatic', label: 'Semi-automatic — app suggests, you confirm' },
          { value: 'manual', label: 'Manual — you decide everything' },
        ]}
        value={overloadMode}
        onChange={e => onChange('overloadMode', e.target.value)}
      />
      <div className="flex gap-3">
        <Button variant="secondary" size="lg" onClick={onBack} className="flex-1">Back</Button>
        <Button size="lg" onClick={onSubmit} disabled={saving} className="flex-1">
          {saving ? 'Setting up…' : "Let's go!"}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Create `src/pages/Onboarding.tsx`**

```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../db/db'
import { seedExercises } from '../db/seed'
import { ProgressBar } from '../components/ui/ProgressBar'
import { StepName } from '../components/onboarding/StepName'
import { StepPhysical } from '../components/onboarding/StepPhysical'
import { StepGoal } from '../components/onboarding/StepGoal'
import { StepEquipment } from '../components/onboarding/StepEquipment'
import { StepSchedule } from '../components/onboarding/StepSchedule'
import type { UserProfile } from '../types'

const TOTAL_STEPS = 5

const defaults: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '', age: 0, weight: 0, weightUnit: 'kg',
  height: 0, heightUnit: 'cm', experienceLevel: 'beginner',
  primaryGoal: 'build_muscle', equipment: [], trainingDaysPerWeek: 4,
  sessionLength: 60, overloadMode: 'automatic', onboardingComplete: false,
}

export function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState(defaults)
  const [saving, setSaving] = useState(false)

  function update(field: string, value: unknown) {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    setSaving(true)
    const now = new Date()
    await seedExercises()
    await db.userProfile.add({ ...profile, onboardingComplete: true, createdAt: now, updatedAt: now })
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal to-[#0080ff] mb-2">
            letsTrain
          </h1>
          <ProgressBar current={step} total={TOTAL_STEPS} />
          <p className="text-xs text-gray-500 mt-1">Step {step} of {TOTAL_STEPS}</p>
        </div>

        {step === 1 && (
          <StepName name={profile.name} onChange={v => update('name', v)} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <StepPhysical
            age={profile.age} weight={profile.weight} weightUnit={profile.weightUnit}
            height={profile.height} heightUnit={profile.heightUnit}
            onChange={update} onNext={() => setStep(3)} onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepGoal
            experienceLevel={profile.experienceLevel} primaryGoal={profile.primaryGoal}
            onChange={update} onNext={() => setStep(4)} onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <StepEquipment
            equipment={profile.equipment}
            onChange={eq => setProfile(prev => ({ ...prev, equipment: eq }))}
            onNext={() => setStep(5)} onBack={() => setStep(3)}
          />
        )}
        {step === 5 && (
          <StepSchedule
            trainingDaysPerWeek={profile.trainingDaysPerWeek}
            sessionLength={profile.sessionLength}
            overloadMode={profile.overloadMode}
            onChange={update} onSubmit={handleSubmit} onBack={() => setStep(4)} saving={saving}
          />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 9: Run onboarding tests**

```bash
npx vitest run src/test/onboarding.test.tsx
```
Expected: PASS (4 tests)

- [ ] **Step 10: Commit**

```bash
git add src/components/onboarding/ src/pages/Onboarding.tsx src/test/onboarding.test.tsx
git commit -m "feat: add onboarding wizard (5-step profile setup)"
```

---

## Task 7: App Router + Home Placeholder

**Files:**
- Create: `src/pages/Home.tsx`
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Create `src/pages/Home.tsx`**

```typescript
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../db/db'
import type { UserProfile } from '../types'

export function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    db.userProfile.toCollection().first().then(p => {
      if (!p?.onboardingComplete) navigate('/onboarding')
      else setProfile(p)
    })
  }, [navigate])

  if (!profile) return null

  return (
    <div className="min-h-screen bg-[#0d1117] p-4">
      <div className="max-w-sm mx-auto pt-8">
        <h1 className="text-2xl font-bold text-white">
          Hey, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-[#0080ff]">{profile.name}</span> 👋
        </h1>
        <p className="text-gray-400 mt-1">Your program is being built in Plan 2.</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Replace `src/App.tsx`**

```typescript
import { Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './pages/Onboarding'
import { Home } from './pages/Home'

export default function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/home" element={<Home />} />
      <Route path="*" element={<Navigate to="/onboarding" replace />} />
    </Routes>
  )
}
```

- [ ] **Step 3: Replace `src/main.tsx`**

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
```

- [ ] **Step 4: Run the dev server and verify end-to-end**

```bash
npm run dev
```
Open the localhost URL. Expected: Onboarding wizard renders on dark background. Complete all 5 steps. Expected: App navigates to `/home` and shows your name.

- [ ] **Step 5: Run all tests**

```bash
npx vitest run
```
Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/main.tsx src/pages/Home.tsx
git commit -m "feat: wire up router, root redirect to onboarding, home page placeholder"
```

---

## Self-Review

**Spec coverage check:**

| Spec Section | Covered? | Task |
|---|---|---|
| Tech stack (React, Vite, TS, Tailwind, Dexie, Recharts, Vercel) | ✅ | Task 1 |
| Dark Teal design system | ✅ | Tasks 1, 5 |
| Onboarding: Name | ✅ | Task 6 |
| Onboarding: Age/Weight/Height | ✅ | Task 6 |
| Onboarding: Experience + Goal | ✅ | Task 6 |
| Onboarding: Equipment multi-select | ✅ | Task 6 |
| Onboarding: Training days/session length/overload mode | ✅ | Task 6 |
| `userProfile` table | ✅ | Tasks 2, 3 |
| `exerciseLibrary` seeded at app start | ✅ | Tasks 4, 6 |
| Exercise data model (id, name, muscleGroups, equipment, etc.) | ✅ | Tasks 2, 4 |
| All muscle groups covered | ✅ | Task 4 |
| `onboardingComplete` flag routing | ✅ | Tasks 6, 7 |
| PWA manifest | ❌ — not yet added |

**PWA manifest gap** — adding Task 8:

---

## Task 8: PWA Manifest

**Files:**
- Create: `public/manifest.json`
- Modify: `index.html`

- [ ] **Step 1: Create `public/manifest.json`**

```json
{
  "name": "letsTrain",
  "short_name": "letsTrain",
  "description": "Offline-first strength training app",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0d1117",
  "theme_color": "#00d4aa",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 2: Add manifest link to `index.html`**

In `index.html`, add inside `<head>`:
```html
    <link rel="manifest" href="/manifest.json" />
```

- [ ] **Step 3: Install vite-plugin-pwa**

```bash
npm install -D vite-plugin-pwa
```

- [ ] **Step 4: Update `vite.config.ts` to add PWA plugin**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'letsTrain',
        short_name: 'letsTrain',
        description: 'Offline-first strength training app',
        theme_color: '#00d4aa',
        background_color: '#0d1117',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

- [ ] **Step 5: Run all tests to confirm nothing broke**

```bash
npx vitest run
```
Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add public/manifest.json index.html vite.config.ts package.json package-lock.json
git commit -m "feat: add PWA manifest and service worker via vite-plugin-pwa"
```

---

## Plan 1 Complete ✅

Foundation, onboarding, exercise library, PWA setup — all done. The app can be installed and runs fully offline.

**Next:** Plan 2 — Program Generator + Workout Logger.
