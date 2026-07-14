import { useEffect, useState } from 'react'
import { db } from '../db/db'
import { ProfileForm } from '../components/settings/ProfileForm'
import { DataSection } from '../components/settings/DataSection'
import type { UserProfile } from '../types'

type EditableProfile = Pick<UserProfile, 'name' | 'age' | 'weight' | 'weightUnit' | 'height' | 'heightUnit' | 'experienceLevel' | 'primaryGoal' | 'overloadMode'>

export function Settings() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    db.userProfile.toCollection().first().then(p => setProfile(p ?? null))
  }, [])

  function handleChange(field: keyof EditableProfile, value: string | number) {
    setProfile(prev => prev ? { ...prev, [field]: value } : prev)
  }

  async function handleSave() {
    if (!profile?.id) return
    setSaving(true)
    try {
      await db.userProfile.update(profile.id, { ...profile, updatedAt: new Date() })
    } finally {
      setSaving(false)
    }
  }

  if (!profile) return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <p className="text-gray-400">Loading…</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0d1117] p-4">
      <div className="max-w-sm mx-auto flex flex-col gap-8">
        <h1 className="text-2xl font-bold text-white pt-4">Settings</h1>
        <ProfileForm profile={profile} onChange={handleChange} onSave={handleSave} saving={saving} />
        <DataSection />
      </div>
    </div>
  )
}
