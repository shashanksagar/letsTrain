import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import 'fake-indexeddb/auto'
import { db } from '../db/db'
import { Onboarding } from '../pages/Onboarding'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

beforeEach(async () => {
  await db.delete()
  await db.open()
  mockNavigate.mockClear()
})

describe('Onboarding', () => {
  it('renders step 1 — name input', () => {
    render(<Onboarding />)
    expect(screen.getByText(/what should we call you/i)).toBeInTheDocument()
  })

  it('advances to step 2 after entering a name', async () => {
    render(<Onboarding />)
    await userEvent.type(screen.getByRole('textbox'), 'Alex')
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText(/physical stats/i)).toBeInTheDocument()
  })

  it('does not advance without a name', async () => {
    render(<Onboarding />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText(/what should we call you/i)).toBeInTheDocument()
  })

  it('shows progress bar that increments', async () => {
    render(<Onboarding />)
    const bar = document.querySelector('[role="progressbar"]') as HTMLElement
    const initialWidth = bar?.style.width
    await userEvent.type(screen.getByRole('textbox'), 'Alex')
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(bar?.style.width).not.toBe(initialWidth)
  })

  it('saves profile and navigates to /home on submit', async () => {
    render(<Onboarding />)

    // Step 1: name
    await userEvent.type(screen.getByRole('textbox'), 'Alex')
    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    // Step 2: physical stats — fill in age, weight, height
    const inputs = screen.getAllByRole('spinbutton')
    await userEvent.clear(inputs[0])
    await userEvent.type(inputs[0], '25')
    await userEvent.clear(inputs[1])
    await userEvent.type(inputs[1], '80')
    await userEvent.clear(inputs[2])
    await userEvent.type(inputs[2], '180')
    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    // Step 3: goal — just click next (defaults are fine)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    // Step 4: equipment — select full_gym then next
    fireEvent.click(screen.getByText('Full Gym'))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    // Step 5: schedule — click submit
    fireEvent.click(screen.getByRole('button', { name: /let's go/i }))

    // Wait for async save
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/home'))

    const saved = await db.userProfile.toCollection().first()
    expect(saved?.name).toBe('Alex')
    expect(saved?.onboardingComplete).toBe(true)
  })
})
