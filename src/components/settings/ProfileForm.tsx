import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import type { UserProfile, ExperienceLevel, PrimaryGoal, OverloadMode } from '../../types'

type EditableProfile = Pick<UserProfile, 'name' | 'age' | 'weight' | 'weightUnit' | 'height' | 'heightUnit' | 'experienceLevel' | 'primaryGoal' | 'overloadMode'>

interface Props {
  profile: EditableProfile
  onChange: (field: keyof EditableProfile, value: string | number) => void
  onSave: () => void
  saving: boolean
}

export function ProfileForm({ profile, onChange, onSave, saving }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Input label="Name" value={profile.name} onChange={e => onChange('name', e.target.value)} />
      <Input label="Age" type="number" value={profile.age || ''} onChange={e => onChange('age', Number(e.target.value))} />
      <div className="flex gap-3">
        <div className="flex-1">
          <Input label="Weight" type="number" value={profile.weight || ''} onChange={e => onChange('weight', Number(e.target.value))} />
        </div>
        <Select
          label="Unit"
          options={[{ value: 'kg', label: 'kg' }, { value: 'lb', label: 'lb' }]}
          value={profile.weightUnit}
          onChange={e => onChange('weightUnit', e.target.value)}
        />
      </div>
      <Select
        label="Experience Level"
        options={[
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced' },
        ]}
        value={profile.experienceLevel}
        onChange={e => onChange('experienceLevel', e.target.value as ExperienceLevel)}
      />
      <Select
        label="Primary Goal"
        options={[
          { value: 'build_muscle', label: 'Build Muscle' },
          { value: 'build_strength', label: 'Build Strength' },
          { value: 'hybrid', label: 'Hybrid' },
          { value: 'recomp', label: 'Recomp / Cut' },
        ]}
        value={profile.primaryGoal}
        onChange={e => onChange('primaryGoal', e.target.value as PrimaryGoal)}
      />
      <Select
        label="Overload Mode"
        options={[
          { value: 'automatic', label: 'Automatic' },
          { value: 'semi_automatic', label: 'Semi-automatic' },
          { value: 'manual', label: 'Manual' },
        ]}
        value={profile.overloadMode}
        onChange={e => onChange('overloadMode', e.target.value as OverloadMode)}
      />
      <Button size="lg" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
    </div>
  )
}
