import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import 'fake-indexeddb/auto'
import { db } from '../db/db'
import { Settings } from '../pages/Settings'
import type { UserProfile } from '../types'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }))

const PROFILE: Omit<UserProfile, 'id'> = {
  name: 'Alex', age: 28, weight: 80, weightUnit: 'kg', height: 180, heightUnit: 'cm',
  experienceLevel: 'intermediate', primaryGoal: 'build_muscle', equipment: ['full_gym'],
  trainingDaysPerWeek: 4, sessionLength: 60, overloadMode: 'automatic', onboardingComplete: true,
  createdAt: new Date(), updatedAt: new Date(),
}

beforeEach(async () => {
  await db.delete()
  await db.open()
  await db.userProfile.add(PROFILE)
  mockNavigate.mockClear()
})

describe('Settings', () => {
  it('renders the profile name field with current value', async () => {
    render(<Settings />)
    await waitFor(() => {
      expect(screen.getByDisplayValue('Alex')).toBeInTheDocument()
    })
  })

  it('saves updated name to the database', async () => {
    render(<Settings />)
    await waitFor(() => screen.getByDisplayValue('Alex'))
    const input = screen.getByDisplayValue('Alex')
    await userEvent.clear(input)
    await userEvent.type(input, 'Jordan')
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(async () => {
      const p = await db.userProfile.toCollection().first()
      expect(p?.name).toBe('Jordan')
    })
  })

  it('shows Export and Import buttons', async () => {
    render(<Settings />)
    await waitFor(() => {
      expect(screen.getByText(/export data/i)).toBeInTheDocument()
      expect(screen.getByText(/import data/i)).toBeInTheDocument()
    })
  })
})
