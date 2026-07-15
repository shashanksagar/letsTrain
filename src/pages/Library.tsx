import { useEffect, useState } from 'react'
import { db } from '../db/db'
import { seedExercises } from '../db/seed'
import { Input } from '../components/ui/Input'
import type { Exercise, MuscleGroup } from '../types'

const MUSCLE_FILTERS: { value: MuscleGroup | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'quads', label: 'Quads' },
  { value: 'hamstrings', label: 'Hams' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'core', label: 'Core' },
  { value: 'calves', label: 'Calves' },
  { value: 'traps', label: 'Traps' },
]

export function Library() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editingGif, setEditingGif] = useState<string | null>(null)
  const [gifInput, setGifInput] = useState('')

  useEffect(() => {
    seedExercises().then(() => db.exerciseLibrary.toArray().then(setExercises))
  }, [])

  async function saveGif(exId: string) {
    const url = gifInput.trim()
    await db.exerciseLibrary.where('exId').equals(exId).modify({ gifUrl: url || undefined })
    const updated = await db.exerciseLibrary.toArray()
    setExercises(updated)
    setEditingGif(null)
    setGifInput('')
  }

  const filtered = exercises.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase())
    const matchMuscle = muscleFilter === 'all' || e.muscleGroups.includes(muscleFilter)
    return matchSearch && matchMuscle
  })

  return (
    <div className="min-h-screen bg-[#0d1117] p-4">
      <div className="max-w-sm mx-auto">
        <h1 className="text-2xl font-bold text-white pt-4 mb-4">Exercise Library</h1>
        <Input placeholder="Search exercises…" value={search} onChange={e => setSearch(e.target.value)} className="mb-4" />
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {MUSCLE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setMuscleFilter(f.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                muscleFilter === f.value ? 'bg-[#00d4aa] text-black' : 'bg-[#161b22] text-gray-400 border border-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {filtered.map(ex => (
            <div key={ex.exId} className="bg-[#161b22] rounded-xl border border-white/10 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                onClick={() => {
                  const next = expanded === ex.exId ? null : ex.exId
                  setExpanded(next)
                  if (next !== ex.exId) setEditingGif(null)
                }}
              >
                <div>
                  <p className="text-white text-sm font-medium">{ex.name}</p>
                  <p className="text-gray-500 text-xs">{ex.muscleGroups.join(', ')}</p>
                </div>
                <span className="text-gray-500 text-xs">{expanded === ex.exId ? '▲' : '▼'}</span>
              </button>
              {expanded === ex.exId && (
                <div className="px-4 pb-4 flex flex-col gap-3">
                  {ex.gifUrl && (
                    <img
                      src={ex.gifUrl}
                      alt={`${ex.name} demonstration`}
                      className="w-full max-w-xs mx-auto rounded-lg"
                      loading="lazy"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  )}

                  {editingGif === ex.exId ? (
                    <div className="flex gap-2 items-center">
                      <input
                        type="url"
                        value={gifInput}
                        onChange={e => setGifInput(e.target.value)}
                        placeholder="Paste GIF URL…"
                        className="flex-1 bg-[#0d1117] border border-white/20 rounded-lg px-3 py-2 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-[#00d4aa]"
                      />
                      <button
                        onClick={() => saveGif(ex.exId)}
                        className="px-3 py-2 bg-[#00d4aa] text-black text-xs font-semibold rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingGif(null)}
                        className="px-3 py-2 text-gray-400 text-xs rounded-lg hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingGif(ex.exId); setGifInput(ex.gifUrl ?? '') }}
                      className="self-start text-xs text-gray-500 hover:text-[#00d4aa] transition-colors underline underline-offset-2"
                    >
                      {ex.gifUrl ? 'Change GIF' : '+ Add GIF'}
                    </button>
                  )}

                  {ex.instructions.map((inst, i) => (
                    <p key={i} className="text-gray-400 text-xs">{i + 1}. {inst}</p>
                  ))}
                  {ex.tips.length > 0 && ex.tips.map((tip, i) => (
                    <p key={i} className="text-[#00d4aa] text-xs">💡 {tip}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No exercises found.</p>}
        </div>
      </div>
    </div>
  )
}
