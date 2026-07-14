import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import 'fake-indexeddb/auto'
import { db } from '../db/db'
import { LogFood } from '../pages/LogFood'
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

describe('LogFood', () => {
  it('renders meal name input', async () => {
    render(<LogFood />)
    await waitFor(() => expect(screen.getByPlaceholderText(/meal name/i)).toBeInTheDocument())
  })

  it('adds a food entry to the database', async () => {
    render(<LogFood />)
    await waitFor(() => screen.getByPlaceholderText(/meal name/i))
    await userEvent.type(screen.getByPlaceholderText(/meal name/i), 'Chicken rice')
    await userEvent.type(screen.getByLabelText(/calories/i), '500')
    await userEvent.type(screen.getByLabelText(/protein/i), '40')
    await userEvent.type(screen.getByLabelText(/carbs/i), '50')
    await userEvent.type(screen.getByLabelText(/fat/i), '10')
    fireEvent.click(screen.getByRole('button', { name: /add meal/i }))
    await waitFor(async () => {
      const count = await db.nutritionLogs.count()
      expect(count).toBe(1)
    })
  })

  it('shows macro targets from profile', async () => {
    render(<LogFood />)
    await waitFor(() => expect(screen.getByText(/protein/i)).toBeInTheDocument())
  })
})
