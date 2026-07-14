import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import type { ExperienceLevel, PrimaryGoal } from '../../types'
import { cn } from '../../lib/utils'

interface Props {
  experienceLevel: ExperienceLevel; primaryGoal: PrimaryGoal
  onChange: (field: string, value: string) => void
  onNext: () => void; onBack: () => void
}

const GOALS: { value: PrimaryGoal; label: string; desc: string }[] = [
  { value: 'build_muscle', label: 'Build Muscle', desc: 'Higher volume, 8–15 reps' },
  { value: 'build_strength', label: 'Build Strength', desc: 'Heavy compound, 1–6 reps' },
  { value: 'hybrid', label: 'Strength-Hypertrophy', desc: 'Best of both, 4–12 reps' },
  { value: 'recomp', label: 'Recomp / Cut', desc: 'Maintain muscle, reduce fat' },
]

export function StepGoal({ experienceLevel, primaryGoal, onChange, onNext, onBack }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Your Goal</h2>
        <p className="text-white/50 mt-1">This shapes your program's rep ranges and volume.</p>
      </div>
      <Select
        label="Experience Level"
        options={[
          { value: 'beginner', label: 'Beginner (< 1 year)' },
          { value: 'intermediate', label: 'Intermediate (1–3 years)' },
          { value: 'advanced', label: 'Advanced (3+ years)' },
        ]}
        value={experienceLevel}
        onChange={e => onChange('experienceLevel', e.target.value)}
      />
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/80">Primary Goal</label>
        {GOALS.map(g => (
          <button
            key={g.value}
            onClick={() => onChange('primaryGoal', g.value)}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
              primaryGoal === g.value
                ? 'border-teal bg-teal/10 text-white'
                : 'border-white/10 bg-surface text-white/70 hover:border-white/30'
            )}
          >
            <div className={cn('w-4 h-4 rounded-full border-2 flex-shrink-0',
              primaryGoal === g.value ? 'border-teal bg-teal' : 'border-white/30')} />
            <div>
              <div className="font-medium">{g.label}</div>
              <div className="text-sm text-white/50">{g.desc}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" size="lg" onClick={onBack} className="flex-1">Back</Button>
        <Button size="lg" onClick={onNext} className="flex-1">Next</Button>
      </div>
    </div>
  )
}
