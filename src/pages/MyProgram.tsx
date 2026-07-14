import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../db/db'
import { generateProgram } from '../lib/programGenerator'
import { seedExercises } from '../db/seed'
import { ProgramDayCard } from '../components/program/ProgramDayCard'
import { Button } from '../components/ui/Button'
import type { Program, Exercise, UserProfile } from '../types'

export function MyProgram() {
  const navigate = useNavigate()
  const [program, setProgram] = useState<Program | null>(null)
  const [exerciseMap, setExerciseMap] = useState<Map<string, Exercise>>(new Map())
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    await seedExercises()
    const p = await db.userProfile.toCollection().first()
    if (!p?.onboardingComplete) { navigate('/onboarding'); return }
    setProfile(p)
    const exercises = await db.exerciseLibrary.toArray()
    const map = new Map(exercises.map(e => [e.exId, e]))
    setExerciseMap(map)
    const existing = await db.programs.orderBy('createdAt').last()
    if (existing) {
      setProgram(existing)
    } else {
      await generate(p, exercises, map)
    }
    setLoading(false)
  }

  async function generate(p: UserProfile, exercises: Exercise[], map: Map<string, Exercise>) {
    const prog = generateProgram(p, exercises)
    const id = await db.programs.add(prog)
    setProgram({ ...prog, id })
    setExerciseMap(map)
  }

  async function regenerate() {
    if (!profile) return
    setLoading(true)
    const exercises = await db.exerciseLibrary.toArray()
    const map = new Map(exercises.map(e => [e.exId, e]))
    await generate(profile, exercises, map)
    setLoading(false)
  }

  function startDay(dayIndex: number) {
    if (!program?.id) return
    navigate(`/workout/${program.id}/${dayIndex}`)
  }

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <p className="text-white/50">Building your program…</p>
    </div>
  )

  if (!program) return null

  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-6 pt-4">
          <h1 className="text-2xl font-bold text-white">My Program</h1>
          <Button variant="ghost" size="sm" onClick={regenerate}>Regenerate</Button>
        </div>
        <div className="flex flex-col gap-4">
          {program.weeks[0].days.map((day, i) => (
            <ProgramDayCard
              key={day.dayIndex}
              day={day}
              exerciseMap={exerciseMap}
              onStart={() => startDay(i)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
