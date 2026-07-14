import type { UserProfile, Exercise, Program, ProgramDay, ProgramExercise, MuscleGroup, EquipmentType } from '../types'

const GOAL_CONFIG = {
  build_muscle:   { repMin: 8,  repMax: 15, sets: 4, restSeconds: 90 },
  build_strength: { repMin: 1,  repMax: 6,  sets: 5, restSeconds: 180 },
  hybrid:         { repMin: 4,  repMax: 12, sets: 4, restSeconds: 120 },
  recomp:         { repMin: 8,  repMax: 15, sets: 3, restSeconds: 60 },
} as const

const SPLIT_LABELS: Record<string, string[]> = {
  '3':       ['Full Body A', 'Full Body B', 'Full Body C'],
  '4':       ['Upper A', 'Lower A', 'Upper B', 'Lower B'],
  '5':       ['Push', 'Pull', 'Legs', 'Upper A', 'Upper B'],
  '6':       ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B'],
  'flexible':['Full Body A', 'Full Body B', 'Full Body C', 'Full Body D'],
}

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
  const key = String(profile.trainingDaysPerWeek)
  const labels = SPLIT_LABELS[key] ?? SPLIT_LABELS['4']

  const compatible = exercises.filter(ex =>
    ex.equipment.some(eq => (profile.equipment as EquipmentType[]).includes(eq))
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
  const maxExercises = sessionLength === 'flexible' ? 8
    : sessionLength === 45 ? 5
    : sessionLength === 60 ? 6
    : 8

  const result: Exercise[] = []

  for (const muscle of muscles) {
    if (result.length >= maxExercises) break
    const candidates = pool.filter(
      ex => ex.muscleGroups.includes(muscle) && !result.includes(ex)
    )
    if (candidates.length > 0) {
      const compound = candidates.find(c => ['push', 'pull', 'squat', 'hinge'].includes(c.movementPattern))
      result.push(compound ?? candidates[0])
    }
  }

  if (result.length < maxExercises) {
    const remaining = pool.filter(ex =>
      !result.includes(ex) &&
      muscles.some(m => ex.muscleGroups.includes(m) || ex.secondaryMuscles.includes(m))
    )
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
