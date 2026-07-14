import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../db/db'
import { MeasurementForm } from '../components/logbody/MeasurementForm'
import type { BodyMeasurement } from '../types'

type FormState = Omit<BodyMeasurement, 'id' | 'date'>

const EMPTY: FormState = {
  weightKg: undefined, bodyFatPct: undefined,
  chestCm: undefined, waistCm: undefined, hipsCm: undefined,
  leftArmCm: undefined, rightArmCm: undefined,
  leftThighCm: undefined, rightThighCm: undefined,
}

export function LogBody() {
  const navigate = useNavigate()
  const [values, setValues] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)

  function handleChange(field: keyof FormState, value: number | undefined) {
    setValues(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await db.bodyMeasurements.add({ ...values, date: new Date() })
      navigate(-1)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] p-4">
      <div className="max-w-sm mx-auto">
        <h1 className="text-2xl font-bold text-white pt-4 mb-2">Log Body</h1>
        <p className="text-gray-400 text-sm mb-6">All fields are optional. Log what you have.</p>
        <MeasurementForm values={values} onChange={handleChange} onSave={handleSave} saving={saving} />
      </div>
    </div>
  )
}
