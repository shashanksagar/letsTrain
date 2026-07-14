import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import type { BodyMeasurement } from '../../types'

type FormState = Omit<BodyMeasurement, 'id' | 'date'>

interface Props {
  values: FormState
  onChange: (field: keyof FormState, value: number | undefined) => void
  onSave: () => void
  saving: boolean
}

const FIELDS: { key: keyof FormState; label: string }[] = [
  { key: 'weightKg', label: 'Bodyweight (kg)' },
  { key: 'bodyFatPct', label: 'Body Fat (%)' },
  { key: 'chestCm', label: 'Chest (cm)' },
  { key: 'waistCm', label: 'Waist (cm)' },
  { key: 'hipsCm', label: 'Hips (cm)' },
  { key: 'leftArmCm', label: 'Left Arm (cm)' },
  { key: 'rightArmCm', label: 'Right Arm (cm)' },
  { key: 'leftThighCm', label: 'Left Thigh (cm)' },
  { key: 'rightThighCm', label: 'Right Thigh (cm)' },
]

export function MeasurementForm({ values, onChange, onSave, saving }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {FIELDS.map(f => (
        <Input
          key={f.key}
          label={f.label}
          type="number"
          min={0}
          placeholder="Optional"
          value={values[f.key] ?? ''}
          onChange={e => onChange(f.key, e.target.value ? Number(e.target.value) : undefined)}
        />
      ))}
      <Button size="lg" onClick={onSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save'}
      </Button>
    </div>
  )
}
