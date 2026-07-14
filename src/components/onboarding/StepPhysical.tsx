import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import type { WeightUnit, HeightUnit } from '../../types'

interface Props {
  age: number; weight: number; weightUnit: WeightUnit
  height: number; heightUnit: HeightUnit
  onChange: (field: string, value: string | number) => void
  onNext: () => void; onBack: () => void
}

export function StepPhysical({ age, weight, weightUnit, height, heightUnit, onChange, onNext, onBack }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Physical Stats</h2>
        <p className="text-white/50 mt-1">Used to tailor your program and track progress.</p>
      </div>
      <Input label="Age" type="number" min={13} max={99} value={age || ''} onChange={e => onChange('age', Number(e.target.value))} />
      <div className="flex gap-3">
        <div className="flex-1">
          <Input label="Weight" type="number" min={20} max={400} value={weight || ''} onChange={e => onChange('weight', Number(e.target.value))} />
        </div>
        <Select
          label="Unit"
          options={[{ value: 'kg', label: 'kg' }, { value: 'lb', label: 'lb' }]}
          value={weightUnit}
          onChange={e => onChange('weightUnit', e.target.value)}
          className="w-24 self-end"
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <Input label="Height" type="number" min={100} max={250} value={height || ''} onChange={e => onChange('height', Number(e.target.value))} />
        </div>
        <Select
          label="Unit"
          options={[{ value: 'cm', label: 'cm' }, { value: 'ft', label: 'ft' }]}
          value={heightUnit}
          onChange={e => onChange('heightUnit', e.target.value)}
          className="w-24 self-end"
        />
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" size="lg" onClick={onBack} className="flex-1">Back</Button>
        <Button size="lg" onClick={onNext} disabled={!age || !weight || !height} className="flex-1">Next</Button>
      </div>
    </div>
  )
}
