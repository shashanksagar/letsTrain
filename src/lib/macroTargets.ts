import type { UserProfile } from '../types'

interface MacroTargets { calories: number; proteinG: number; carbsG: number; fatG: number }

const GOAL_MULTIPLIER: Record<string, number> = {
  build_muscle: 1.10,
  build_strength: 1.05,
  hybrid: 1.05,
  recomp: 0.90,
}

export function calculateMacroTargets(
  profile: Pick<UserProfile, 'weight' | 'weightUnit' | 'primaryGoal' | 'trainingDaysPerWeek'>
): MacroTargets {
  const weightKg = profile.weightUnit === 'lb' ? profile.weight / 2.205 : profile.weight
  const activityMult = typeof profile.trainingDaysPerWeek === 'number' && profile.trainingDaysPerWeek >= 5 ? 38 : 33
  const bmr = weightKg * activityMult
  const multiplier = GOAL_MULTIPLIER[profile.primaryGoal] ?? 1.0
  const calories = Math.round(bmr * multiplier)
  const proteinMultiplier = profile.primaryGoal === 'recomp' ? 1.8 : 2.0
  const proteinG = Math.round(weightKg * proteinMultiplier)
  const proteinKcal = proteinG * 4
  const fatKcal = Math.round(calories * 0.25)
  const fatG = Math.round(fatKcal / 9)
  const carbsKcal = calories - proteinKcal - fatKcal
  const carbsG = Math.round(Math.max(0, carbsKcal) / 4)
  return { calories, proteinG, carbsG, fatG }
}
