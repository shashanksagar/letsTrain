import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import 'fake-indexeddb/auto'
import { db } from '../db/db'
import { LogBody } from '../pages/LogBody'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }))

beforeEach(async () => {
  await db.delete()
  await db.open()
  mockNavigate.mockClear()
})

describe('LogBody', () => {
  it('renders the body weight field', () => {
    render(<LogBody />)
    expect(screen.getByLabelText(/bodyweight/i)).toBeInTheDocument()
  })

  it('saves a measurement and navigates back', async () => {
    render(<LogBody />)
    await userEvent.type(screen.getByLabelText(/bodyweight/i), '80')
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(-1))
    const count = await db.bodyMeasurements.count()
    expect(count).toBe(1)
  })
})
