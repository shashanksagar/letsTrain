import { db } from './db'
import { EXERCISES } from '../data/exercises'

export async function seedExercises(): Promise<void> {
  const count = await db.exerciseLibrary.count()
  if (count > 0) return
  await db.exerciseLibrary.bulkAdd(EXERCISES as Parameters<typeof db.exerciseLibrary.bulkAdd>[0])
}
