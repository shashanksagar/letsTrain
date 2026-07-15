import { describe, it, expect } from 'vitest'
import { generateProgram } from '../lib/programGenerator'
import type { UserProfile, Exercise, EquipmentType } from '../types'

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
    const dbProfile = { ...BASE_PROFILE, equipment: ['dumbbells'] as EquipmentType[] }
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
