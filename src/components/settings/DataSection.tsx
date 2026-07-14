import { useRef } from 'react'
import { db } from '../../db/db'
import { downloadJSON } from '../../lib/sharing'
import { Button } from '../ui/Button'

export function DataSection() {
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleExport() {
    const [userProfile, programs, workoutSessions, setLogs, bodyMeasurements, nutritionLogs] = await Promise.all([
      db.userProfile.toArray(),
      db.programs.toArray(),
      db.workoutSessions.toArray(),
      db.setLogs.toArray(),
      db.bodyMeasurements.toArray(),
      db.nutritionLogs.toArray(),
    ])
    downloadJSON(
      { exportedAt: new Date().toISOString(), userProfile, programs, workoutSessions, setLogs, bodyMeasurements, nutritionLogs },
      `letstrain-backup-${new Date().toISOString().slice(0, 10)}.json`
    )
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const data = JSON.parse(text)
    if (data.userProfile) await db.userProfile.bulkPut(data.userProfile)
    if (data.programs) await db.programs.bulkPut(data.programs)
    if (data.workoutSessions) await db.workoutSessions.bulkPut(data.workoutSessions)
    if (data.setLogs) await db.setLogs.bulkPut(data.setLogs)
    if (data.bodyMeasurements) await db.bodyMeasurements.bulkPut(data.bodyMeasurements)
    if (data.nutritionLogs) await db.nutritionLogs.bulkPut(data.nutritionLogs)
    alert('Data imported successfully. Refresh the app to see changes.')
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-white font-semibold">Data</h2>
      <Button variant="secondary" size="md" onClick={handleExport}>Export Data</Button>
      <Button variant="secondary" size="md" onClick={() => fileRef.current?.click()}>Import Data</Button>
      <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      <p className="text-gray-500 text-xs">Export creates a full JSON backup. Import restores from a previous export.</p>
    </div>
  )
}
