const WGER_API = 'https://wger.de/api/v2/exerciseinfo/?format=json&language=2&limit=100'

export const WGER_NAME_MAP: Record<string, string> = {
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

let cachedMap: Map<string, string> | null = null

export async function fetchWgerImages(): Promise<Map<string, string>> {
  if (cachedMap) return cachedMap
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
  cachedMap = map
  return map
}

export function getWgerImageUrl(exId: string, wgerMap: Map<string, string>): string | undefined {
  const name = WGER_NAME_MAP[exId]
  if (!name) return undefined
  return wgerMap.get(name.toLowerCase())
}
