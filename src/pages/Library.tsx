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

const WGER_BASE = 'https://wger.de'
const WGER_API = `${WGER_BASE}/api/v2/exerciseinfo/?format=json&language=2&limit=100`

// Maps our exId → exact wger exercise name (English)
const WGER_NAME_MAP: Record<string, string> = {
  'barbell-bench-press':       'Bench Press',
  'dumbbell-bench-press':      'Benchpress Dumbbells',
  'incline-barbell-press':     'Incline Bench Press - Barbell',
  'push-up':                   'Push-Up',
  'cable-fly':                 'Fly With Cable',
  'dumbbell-fly':              'Fly With Dumbbells',
  'pull-up':                   'Pull-ups',
  'chin-up':                   'Chin Up',
  'barbell-row':               'Bent Over Rowing',
  'dumbbell-row':              'Bent Over Dumbbell Rows',
  'lat-pulldown':              'Close-grip Lat Pull Down',
  'seated-cable-row':          'Seated Cable Row',
  'deadlift':                  'Deadlifts',
  'overhead-press':            'Overhead Barbell Press',
  'dumbbell-shoulder-press':   'Shoulder Press, Dumbbells',
  'lateral-raise':             'Lateral Raises',
  'face-pull':                 'Face pulls with yellow/green band',
  'reverse-fly':               'Rear Delt Raises',
  'barbell-curl':              'Biceps Curls With Barbell',
  'dumbbell-curl':             'Biceps Curls With Dumbbell',
  'hammer-curl':               'Hammer Curls',
  'close-grip-bench':          'Bench Press Narrow Grip',
  'tricep-pushdown':           'Tricep Rope Pushdowns',
  'overhead-tricep-extension': 'Overhead Triceps Extension',
  'dip':                       'Dips',
  'barbell-squat':             'Barbell Full Squat',
  'goblet-squat':              'Dumbbell Goblet Squat',
  'leg-press':                 'Leg Press',
  'lunge':                     'Dumbbell Lunges Walking',
  'leg-extension':             'Leg Extension',
  'romanian-deadlift':         'Dumbbell Romanian Deadlift',
  'leg-curl':                  'Leg Curls (laying)',
  'nordic-hamstring-curl':     'Reverse Nordic Curl',
  'hip-thrust':                'Dumbbell Hip Thrust',
  'glute-bridge':              'Hip Circles',
  'cable-kickback':            'Cable glute extension',
  'standing-calf-raise':       'Standing Calf Raises',
  'seated-calf-raise':         'Seated Dumbbell Calf Raise',
  'plank':                     'Plank',
  'ab-rollout':                'Ab wheel',
  'hanging-leg-raise':         'Leg raises pull up bar',
  'cable-crunch':              'Crunches',
  'barbell-shrug':             'Shrugs, Barbells',
  'dumbbell-shrug':            'Shrugs, Dumbbells',
  'wrist-curl':                'Barbell Wrist Curl',
  'farmers-carry':             'Axe Hold',
}

async function fetchWgerImages(): Promise<Map<string, string>> {
  // Collect only the wger names we actually need
  const needed = new Set(Object.values(WGER_NAME_MAP).map(n => n.toLowerCase()))
  const map = new Map<string, string>()
  let url: string | null = WGER_API
  while (url && map.size < needed.size) {
    const res = await fetch(url)
    if (!res.ok) break
    const data = await res.json()
    for (const ex of data.results) {
      const imgs = ex.images ?? []
      if (imgs.length === 0) continue
      const translations: { language: number; name: string }[] = ex.translations ?? []
      const en = translations.find(t => t.language === 2)
      if (en?.name && needed.has(en.name.toLowerCase())) {
        map.set(en.name.toLowerCase(), imgs[0].image)
      }
    }
    url = data.next ?? null
  }
  return map
}

function findImage(exId: string, wgerMap: Map<string, string>): string | undefined {
  const wgerName = WGER_NAME_MAP[exId]
  if (!wgerName) return undefined
  return wgerMap.get(wgerName.toLowerCase())
}

export function Library() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [wgerMap, setWgerMap] = useState<Map<string, string>>(new Map())
  const [wgerLoading, setWgerLoading] = useState(false)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [imageRetry, setImageRetry] = useState<Record<string, number>>({})

  useEffect(() => {
    seedExercises().then(() => db.exerciseLibrary.toArray().then(setExercises))
    setWgerLoading(true)
    fetchWgerImages()
      .then(m => setWgerMap(m))
      .finally(() => setWgerLoading(false))
  }, [])

  function handleImageError(exId: string) {
    setImageErrors(prev => new Set(prev).add(exId))
  }

  function retryImage(exId: string) {
    setImageErrors(prev => { const s = new Set(prev); s.delete(exId); return s })
    setImageRetry(prev => ({ ...prev, [exId]: (prev[exId] ?? 0) + 1 }))
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
          {filtered.map(ex => {
            const imgUrl = findImage(ex.exId, wgerMap)
            const hasError = imageErrors.has(ex.exId)
            const retryKey = imageRetry[ex.exId] ?? 0
            return (
              <div key={ex.exId} className="bg-[#161b22] rounded-xl border border-white/10 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                  onClick={() => setExpanded(expanded === ex.exId ? null : ex.exId)}
                >
                  <div>
                    <p className="text-white text-sm font-medium">{ex.name}</p>
                    <p className="text-gray-500 text-xs">{ex.muscleGroups.join(', ')}</p>
                  </div>
                  <span className="text-gray-500 text-xs">{expanded === ex.exId ? '▲' : '▼'}</span>
                </button>
                {expanded === ex.exId && (
                  <div className="px-4 pb-3 flex flex-col gap-3">
                    {wgerLoading && (
                      <p className="text-gray-500 text-xs text-center py-2">Loading image…</p>
                    )}
                    {!wgerLoading && imgUrl && !hasError && (
                      <img
                        key={retryKey}
                        src={imgUrl}
                        alt={`${ex.name} demonstration`}
                        className="w-full max-w-xs mx-auto rounded-lg"
                        loading="lazy"
                        onError={() => handleImageError(ex.exId)}
                      />
                    )}
                    {!wgerLoading && imgUrl && hasError && (
                      <div className="flex flex-col items-center gap-2 py-3">
                        <p className="text-gray-500 text-xs">Image failed to load</p>
                        <button
                          onClick={() => retryImage(ex.exId)}
                          className="px-3 py-1.5 bg-[#161b22] border border-white/20 rounded-lg text-xs text-[#00d4aa] hover:border-[#00d4aa] transition-colors"
                        >
                          ↻ Retry
                        </button>
                      </div>
                    )}
                    {!wgerLoading && !imgUrl && (
                      <p className="text-gray-500 text-xs text-center py-1">No image available</p>
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
            )
          })}
          {filtered.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No exercises found.</p>}
        </div>
      </div>
    </div>
  )
}
