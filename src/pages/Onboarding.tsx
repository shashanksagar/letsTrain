import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../db/db'
import { seedExercises } from '../db/seed'
import { ProgressBar } from '../components/ui/ProgressBar'
import { StepName } from '../components/onboarding/StepName'
import { StepPhysical } from '../components/onboarding/StepPhysical'
import { StepGoal } from '../components/onboarding/StepGoal'
import { StepEquipment } from '../components/onboarding/StepEquipment'
import { StepSchedule } from '../components/onboarding/StepSchedule'
import type { UserProfile } from '../types'

const TOTAL_STEPS = 5

const defaults: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '', age: 0, weight: 0, weightUnit: 'kg',
  height: 0, heightUnit: 'cm', experienceLevel: 'beginner',
  primaryGoal: 'build_muscle', equipment: [], trainingDaysPerWeek: 4,
  sessionLength: 60, overloadMode: 'automatic', onboardingComplete: false,
}

export function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState(defaults)
  const [saving, setSaving] = useState(false)

  function update(field: string, value: unknown) {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    setSaving(true)
    const now = new Date()
    await seedExercises()
    await db.userProfile.add({ ...profile, onboardingComplete: true, createdAt: now, updatedAt: now })
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-teal mb-3">letsTrain</h1>
          <ProgressBar value={step} max={TOTAL_STEPS} />
          <p className="text-xs text-white/40 mt-1">Step {step} of {TOTAL_STEPS}</p>
        </div>

        {step === 1 && (
          <StepName name={profile.name} onChange={v => update('name', v)} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <StepPhysical
            age={profile.age} weight={profile.weight} weightUnit={profile.weightUnit}
            height={profile.height} heightUnit={profile.heightUnit}
            onChange={update} onNext={() => setStep(3)} onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepGoal
            experienceLevel={profile.experienceLevel} primaryGoal={profile.primaryGoal}
            onChange={update} onNext={() => setStep(4)} onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <StepEquipment
            equipment={profile.equipment}
            onChange={eq => setProfile(prev => ({ ...prev, equipment: eq }))}
            onNext={() => setStep(5)} onBack={() => setStep(3)}
          />
        )}
        {step === 5 && (
          <StepSchedule
            trainingDaysPerWeek={profile.trainingDaysPerWeek}
            sessionLength={profile.sessionLength}
            overloadMode={profile.overloadMode}
            onChange={update} onSubmit={handleSubmit} onBack={() => setStep(4)} saving={saving}
          />
        )}
      </div>
    </div>
  )
}
