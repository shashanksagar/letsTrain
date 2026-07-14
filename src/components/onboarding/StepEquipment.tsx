import { Button } from '../ui/Button'
import type { EquipmentType } from '../../types'
import { cn } from '../../lib/utils'

interface Props {
  equipment: EquipmentType[]
  onChange: (equipment: EquipmentType[]) => void
  onNext: () => void; onBack: () => void
}

const OPTIONS: { value: EquipmentType; label: string; desc: string }[] = [
  { value: 'full_gym', label: 'Full Gym', desc: 'Barbells, cables, machines' },
  { value: 'home_barbell', label: 'Home Barbell', desc: 'Barbell + rack, limited machines' },
  { value: 'dumbbells', label: 'Dumbbells Only', desc: 'Dumbbell-based workouts' },
  { value: 'bodyweight', label: 'Bodyweight', desc: 'No equipment needed' },
]

export function StepEquipment({ equipment, onChange, onNext, onBack }: Props) {
  function toggle(value: EquipmentType) {
    onChange(equipment.includes(value) ? equipment.filter(e => e !== value) : [...equipment, value])
  }
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Available Equipment</h2>
        <p className="text-white/50 mt-1">Select all that apply. Exercises will be filtered accordingly.</p>
      </div>
      <div className="flex flex-col gap-2">
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
              equipment.includes(opt.value)
                ? 'border-teal bg-teal/10 text-white'
                : 'border-white/10 bg-surface text-white/70 hover:border-white/30'
            )}
          >
            <div className={cn('w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center',
              equipment.includes(opt.value) ? 'border-teal bg-teal' : 'border-white/30')}>
              {equipment.includes(opt.value) && <span className="text-bg text-xs font-bold">✓</span>}
            </div>
            <div>
              <div className="font-medium">{opt.label}</div>
              <div className="text-sm text-white/50">{opt.desc}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" size="lg" onClick={onBack} className="flex-1">Back</Button>
        <Button size="lg" onClick={onNext} disabled={equipment.length === 0} className="flex-1">Next</Button>
      </div>
    </div>
  )
}
