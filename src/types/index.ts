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
  exId: string
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
  dayIndex: number
  label: string
  exercises: ProgramExercise[]
}

export interface ProgramExercise {
  exId: string
  sets: number
  repMin: number
  repMax: number
  restSeconds: number
  alternatives: string[]
}

export interface WorkoutSession {
  id?: number
  programId: number
  dayLabel: string
  startedAt: Date
  finishedAt?: Date
  rpe?: number
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
