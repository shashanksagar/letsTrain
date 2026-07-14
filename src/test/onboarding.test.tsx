import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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
})
