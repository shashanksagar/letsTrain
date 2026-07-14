import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../db/db'
import type { UserProfile } from '../types'

export function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    db.userProfile.toCollection().first().then(p => {
      if (!p?.onboardingComplete) navigate('/onboarding')
      else setProfile(p)
    })
  }, [navigate])

  if (!profile) return null

  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="max-w-sm mx-auto pt-8">
        <h1 className="text-2xl font-bold text-white">
          Hey, <span className="text-teal">{profile.name}</span>
        </h1>
        <p className="text-white/50 mt-1">Your program is coming in Plan 2.</p>
      </div>
    </div>
  )
}
