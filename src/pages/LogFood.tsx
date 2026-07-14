import { useEffect, useState } from 'react'
import { db } from '../db/db'
import { calculateMacroTargets } from '../lib/macroTargets'
import { FoodEntryForm } from '../components/nutrition/FoodEntryForm'
import { MacroBar } from '../components/nutrition/MacroBar'
import { MacroPieChart } from '../components/nutrition/MacroPieChart'
import type { UserProfile, NutritionLog } from '../types'

export function LogFood() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [todayEntries, setTodayEntries] = useState<NutritionLog[]>([])

  useEffect(() => {
    db.userProfile.toCollection().first().then(p => setProfile(p ?? null))
    loadToday()
  }, [])

  async function loadToday() {
    const start = new Date(); start.setHours(0, 0, 0, 0)
    const end = new Date(); end.setHours(23, 59, 59, 999)
    const all = await db.nutritionLogs.toArray()
    setTodayEntries(all.filter(e => e.date >= start && e.date <= end))
  }

  async function handleAdd(entry: { mealName: string; calories: number; proteinG: number; carbsG: number; fatG: number }) {
    await db.nutritionLogs.add({ ...entry, date: new Date() })
    await loadToday()
  }

  const targets = profile ? calculateMacroTargets(profile) : null
  const totals = todayEntries.reduce(
    (sum, e) => ({ calories: sum.calories + e.calories, proteinG: sum.proteinG + e.proteinG, carbsG: sum.carbsG + e.carbsG, fatG: sum.fatG + e.fatG }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  )

  return (
    <div className="min-h-screen bg-[#0d1117] p-4">
      <div className="max-w-sm mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-white pt-4">Nutrition</h1>

        {targets && (
          <div className="bg-[#161b22] rounded-xl p-4 border border-white/10 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold">{totals.calories} / {targets.calories} kcal</span>
              <span className="text-gray-400 text-xs">today</span>
            </div>
            <MacroBar label="Protein" current={totals.proteinG} target={targets.proteinG} color="#00d4aa" />
            <MacroBar label="Carbs" current={totals.carbsG} target={targets.carbsG} color="#0080ff" />
            <MacroBar label="Fat" current={totals.fatG} target={targets.fatG} color="#f59e0b" />
            <MacroPieChart proteinG={totals.proteinG} carbsG={totals.carbsG} fatG={totals.fatG} />
          </div>
        )}

        <FoodEntryForm onAdd={handleAdd} />

        {todayEntries.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-white font-semibold">Today's meals</h2>
            {todayEntries.map(e => (
              <div key={e.id} className="flex justify-between bg-[#161b22] rounded-lg px-4 py-3 border border-white/10">
                <span className="text-white text-sm">{e.mealName}</span>
                <span className="text-gray-400 text-xs">{e.calories} kcal · {e.proteinG}g P</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
