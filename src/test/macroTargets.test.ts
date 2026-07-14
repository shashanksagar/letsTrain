import { describe, it, expect } from 'vitest'
import { calculateMacroTargets } from '../lib/macroTargets'
import type { UserProfile } from '../types'

const PROFILE: Pick<UserProfile, 'weight' | 'weightUnit' | 'primaryGoal' | 'trainingDaysPerWeek'> = {
  weight: 80, weightUnit: 'kg', primaryGoal: 'build_muscle', trainingDaysPerWeek: 4,
}

describe('calculateMacroTargets', () => {
  it('returns positive values for all macros', () => {
    const targets = calculateMacroTargets(PROFILE)
    expect(targets.calories).toBeGreaterThan(0)
    expect(targets.proteinG).toBeGreaterThan(0)
    expect(targets.carbsG).toBeGreaterThan(0)
    expect(targets.fatG).toBeGreaterThan(0)
  })

  it('protein is 1.8–2.5g per kg for muscle building', () => {
    const targets = calculateMacroTargets(PROFILE)
    const ratio = targets.proteinG / 80
    expect(ratio).toBeGreaterThanOrEqual(1.8)
    expect(ratio).toBeLessThanOrEqual(2.5)
  })

  it('recomp goal has lower calories than build_muscle', () => {
    const muscle = calculateMacroTargets({ ...PROFILE, primaryGoal: 'build_muscle' })
    const recomp = calculateMacroTargets({ ...PROFILE, primaryGoal: 'recomp' })
    expect(recomp.calories).toBeLessThan(muscle.calories)
  })

  it('converts lb weight correctly', () => {
    const lbProfile = { ...PROFILE, weight: 176, weightUnit: 'lb' as const }
    const targets = calculateMacroTargets(lbProfile)
    const kgTargets = calculateMacroTargets({ ...PROFILE, weight: 80, weightUnit: 'kg' as const })
    expect(Math.abs(targets.calories - kgTargets.calories)).toBeLessThan(100)
  })
})
