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
