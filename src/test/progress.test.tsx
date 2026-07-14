import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import 'fake-indexeddb/auto'
import { db } from '../db/db'
import { Progress } from '../pages/Progress'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }))

beforeEach(async () => {
  await db.delete()
  await db.open()
  mockNavigate.mockClear()
})

describe('Progress page', () => {
  it('renders the Strength tab by default', async () => {
    render(<Progress />)
    await waitFor(() => expect(screen.getByText('Strength')).toBeInTheDocument())
  })

  it('switches to Body tab on click', async () => {
    render(<Progress />)
    await waitFor(() => {
      expect(screen.getByText('Body')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Body'))
    await waitFor(() => expect(screen.getByText('Bodyweight Trend')).toBeInTheDocument())
  })

  it('switches to Calendar tab on click', async () => {
    render(<Progress />)
    await waitFor(() => {
      expect(screen.getByText('Calendar')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Calendar'))
    await waitFor(() => expect(screen.getByText('Training Streak')).toBeInTheDocument())
  })

  it('shows PR Board when no data', async () => {
    render(<Progress />)
    await waitFor(() => expect(screen.getByText(/personal records/i)).toBeInTheDocument())
  })
})
