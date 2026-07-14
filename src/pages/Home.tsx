import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../db/db'
import { Button } from '../components/ui/Button'
import type { UserProfile, Program } from '../types'

export function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [program, setProgram] = useState<Program | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    db.userProfile.toCollection().first().then(p => {
      if (!p?.onboardingComplete) { navigate('/onboarding'); return }
      setProfile(p)
    })
    db.programs.orderBy('createdAt').last().then(p => setProgram(p ?? null))
  }, [navigate])

  if (!profile) return null

  const today = new Date().getDay()
  const dayMap: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 0 }
  const dayIndex = program ? Math.min(dayMap[today] ?? 0, program.weeks[0].days.length - 1) : 0
  const todayDay = program?.weeks[0].days[dayIndex]

  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="max-w-sm mx-auto pt-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Hey, <span className="text-teal">{profile.name}</span>
          </h1>
          <p className="text-white/50 mt-1 text-sm">Ready to train?</p>
        </div>

        {todayDay && program?.id ? (
          <div className="bg-surface rounded-xl p-4 border border-teal/20">
            <p className="text-xs text-teal font-semibold mb-1 uppercase tracking-wide">Today</p>
            <h2 className="text-white font-bold text-lg mb-1">{todayDay.label}</h2>
            <p className="text-white/50 text-sm mb-4">{todayDay.exercises.length} exercises</p>
            <Button size="lg" fullWidth onClick={() => navigate(`/workout/${program.id}/${dayIndex}`)}>
              Start Workout
            </Button>
          </div>
        ) : (
          <Button variant="secondary" size="lg" fullWidth onClick={() => navigate('/program')}>
            Build My Program
          </Button>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" size="md" onClick={() => navigate('/program')} className="flex-1">
            My Program
          </Button>
          <Button variant="secondary" size="md" onClick={() => navigate('/progress')} className="flex-1">
            Progress
          </Button>
        </div>
      </div>
    </div>
  )
}
