import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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
