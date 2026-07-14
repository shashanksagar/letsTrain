import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { ProgressBar } from '../components/ui/ProgressBar'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeTruthy()
  })

  it('is disabled when prop set', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('renders fullWidth', () => {
    render(<Button fullWidth>Full</Button>)
    expect(screen.getByRole('button').className).toContain('w-full')
  })
})

describe('Input', () => {
  it('renders label', () => {
    render(<Input label="Name" />)
    expect(screen.getByLabelText('Name')).toBeTruthy()
  })

  it('shows error message', () => {
    render(<Input label="Email" error="Invalid email" />)
    expect(screen.getByText('Invalid email')).toBeTruthy()
  })

  it('shows hint when no error', () => {
    render(<Input label="Age" hint="Enter your age" />)
    expect(screen.getByText('Enter your age')).toBeTruthy()
  })
})

describe('Select', () => {
  const opts = [{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }]

  it('renders all options', () => {
    render(<Select label="Pick one" options={opts} />)
    expect(screen.getByRole('combobox')).toBeTruthy()
    expect(screen.getByText('Option A')).toBeTruthy()
    expect(screen.getByText('Option B')).toBeTruthy()
  })
})

describe('ProgressBar', () => {
  it('renders with correct aria attributes', () => {
    render(<ProgressBar value={40} max={100} />)
    const bar = screen.getByRole('progressbar')
    expect(bar.getAttribute('aria-valuenow')).toBe('40')
    expect(bar.getAttribute('aria-valuemax')).toBe('100')
  })

  it('clamps value to 0–100%', () => {
    render(<ProgressBar value={150} max={100} />)
    const bar = screen.getByRole('progressbar')
    expect((bar as HTMLElement).style.width).toBe('100%')
  })
})
