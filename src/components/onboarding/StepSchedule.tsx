import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import type { TrainingDays, SessionLength, OverloadMode } from '../../types'

interface Props {
  trainingDaysPerWeek: TrainingDays; sessionLength: SessionLength; overloadMode: OverloadMode
  onChange: (field: string, value: string | number) => void
  onSubmit: () => void; onBack: () => void
  saving: boolean
}

export function StepSchedule({ trainingDaysPerWeek, sessionLength, overloadMode, onChange, onSubmit, onBack, saving }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Schedule & Preferences</h2>
        <p className="text-white/50 mt-1">We'll build a program that fits your life.</p>
      </div>
      <Select
        label="Training Days / Week"
        options={[
          { value: '3', label: '3 days — Full Body' },
          { value: '4', label: '4 days — Upper / Lower' },
          { value: '5', label: '5 days — PPL + 2 Upper' },
          { value: '6', label: '6 days — Full PPL' },
          { value: 'flexible', label: 'Flexible' },
        ]}
        value={String(trainingDaysPerWeek)}
        onChange={e => onChange('trainingDaysPerWeek', isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value))}
      />
      <Select
        label="Session Length"
        options={[
          { value: '45', label: '45 minutes' },
          { value: '60', label: '60 minutes' },
          { value: '90', label: '90 minutes' },
          { value: 'flexible', label: 'Flexible' },
        ]}
        value={String(sessionLength)}
        onChange={e => onChange('sessionLength', isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value))}
      />
      <Select
        label="Progressive Overload Mode"
        options={[
          { value: 'automatic', label: 'Automatic — app adds weight when you hit targets' },
          { value: 'semi_automatic', label: 'Semi-automatic — app suggests, you confirm' },
          { value: 'manual', label: 'Manual — you decide everything' },
        ]}
        value={overloadMode}
        onChange={e => onChange('overloadMode', e.target.value)}
      />
      <div className="flex gap-3">
        <Button variant="secondary" size="lg" onClick={onBack} className="flex-1">Back</Button>
        <Button size="lg" onClick={onSubmit} disabled={saving} className="flex-1">
          {saving ? 'Setting up…' : "Let's go!"}
        </Button>
      </div>
    </div>
  )
}
