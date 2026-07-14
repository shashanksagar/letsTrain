import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface FoodEntry { mealName: string; calories: number; proteinG: number; carbsG: number; fatG: number }
interface Props { onAdd: (entry: FoodEntry) => void }
const EMPTY: FoodEntry = { mealName: '', calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }

export function FoodEntryForm({ onAdd }: Props) {
  const [form, setForm] = useState<FoodEntry>(EMPTY)

  function update(field: keyof FoodEntry, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function submit() {
    if (!form.mealName.trim()) return
    onAdd(form)
    setForm(EMPTY)
  }

  return (
    <div className="bg-[#161b22] rounded-xl p-4 border border-white/10 flex flex-col gap-3">
      <Input
        placeholder="Meal name"
        value={form.mealName}
        onChange={e => update('mealName', e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Calories" type="number" min={0} value={form.calories || ''} onChange={e => update('calories', Number(e.target.value))} />
        <Input label="Protein (g)" type="number" min={0} value={form.proteinG || ''} onChange={e => update('proteinG', Number(e.target.value))} />
        <Input label="Carbs (g)" type="number" min={0} value={form.carbsG || ''} onChange={e => update('carbsG', Number(e.target.value))} />
        <Input label="Fat (g)" type="number" min={0} value={form.fatG || ''} onChange={e => update('fatG', Number(e.target.value))} />
      </div>
      <Button size="md" onClick={submit} disabled={!form.mealName.trim()}>Add Meal</Button>
    </div>
  )
}
