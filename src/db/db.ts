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
