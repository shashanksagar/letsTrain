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
