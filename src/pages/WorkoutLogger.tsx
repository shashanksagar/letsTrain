import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../db/db'
import { SetRow } from '../components/logger/SetRow'
import { RestTimer } from '../components/logger/RestTimer'
import { OverloadBadge } from '../components/logger/OverloadBadge'
import { Button } from '../components/ui/Button'
import { fetchWgerImages, getWgerImageUrl } from '../lib/wgerImages'
import type { Program, Exercise, ProgramExercise, WorkoutSession } from '../types'

interface CompletedSet { reps: number; weightKg: number; setNumber: number }

export function WorkoutLogger() {
  const { programId, dayIndex } = useParams<{ programId: string; dayIndex: string }>()
  const navigate = useNavigate()
  const [program, setProgram] = useState<Program | null>(null)
  const [exerciseMap, setExerciseMap] = useState<Map<string, Exercise>>(new Map())
  const [currentExIdx, setCurrentExIdx] = useState(0)
  const [completedSets, setCompletedSets] = useState<Record<string, CompletedSet[]>>({})
  const [restActive, setRestActive] = useState(false)
  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [wgerMap, setWgerMap] = useState<Map<string, string>>(new Map())
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { load() }, [programId])
  useEffect(() => { fetchWgerImages().then(setWgerMap) }, [])

  async function load() {
    const prog = await db.programs.get(Number(programId))
    if (!prog) return
    setProgram(prog)
    const exs = await db.exerciseLibrary.toArray()
    setExerciseMap(new Map(exs.map(e => [e.exId, e])))
    const sessionId = await db.workoutSessions.add({
      programId: prog.id!,
      dayLabel: prog.weeks[0].days[Number(dayIndex)].label,
      startedAt: new Date(),
    })
    const s = await db.workoutSessions.get(sessionId)
    setSession(s!)
    setLoading(false)
  }

  const handleSetDone = useCallback(async (ex: ProgramExercise, setNumber: number, reps: number, weightKg: number) => {
    if (!session?.id) return
    await db.setLogs.add({
      sessionId: session.id,
      exId: ex.exId,
      setNumber,
      targetReps: ex.repMin,
      actualReps: reps,
      weightKg,
      completedAt: new Date(),
    })
    setCompletedSets(prev => ({
      ...prev,
      [ex.exId]: [...(prev[ex.exId] ?? []), { reps, weightKg, setNumber }],
    }))
    setRestActive(true)
  }, [session])

  const handleRestDone = useCallback(() => setRestActive(false), [])

  async function finishWorkout() {
    if (!session?.id) return
    await db.workoutSessions.update(session.id, { finishedAt: new Date() })
    navigate('/home')
  }

  if (loading || !program) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <p className="text-white/50">Loading workout…</p>
    </div>
  )

  const day = program.weeks[0].days[Number(dayIndex)]
  const currentEx = day.exercises[currentExIdx]
  const exDetail = exerciseMap.get(currentEx?.exId)
  const exName = exDetail?.name ?? currentEx?.exId
  const imgUrl = getWgerImageUrl(currentEx?.exId, wgerMap)
  const completedForEx = completedSets[currentEx?.exId] ?? []
  const allSetsForEx = completedForEx.length >= currentEx?.sets
  const overloadMode = program.profileSnapshot.overloadMode

  const lastWeight = completedForEx.at(-1)?.weightKg ?? 0
  const hitRepMax = completedForEx.length > 0 && completedForEx.every(s => s.reps >= currentEx.repMax)
  const suggestion = hitRepMax ? lastWeight + 2.5 : null

  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-between pt-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">{day.label}</h1>
            <p className="text-white/50 text-sm">Exercise {currentExIdx + 1} of {day.exercises.length}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={finishWorkout}>Finish</Button>
        </div>

        <div className="bg-surface rounded-xl border border-white/10 mb-4 overflow-hidden">
          {imgUrl && (
            <img
              src={imgUrl}
              alt={`${exName} demonstration`}
              className="w-full max-h-48 object-cover"
              loading="lazy"
            />
          )}
          <div className="p-4">
            <h2 className="text-white font-bold text-lg mb-1">{exName}</h2>
            <p className="text-white/50 text-sm mb-3">
              {currentEx.sets} sets × {currentEx.repMin}–{currentEx.repMax} reps
            </p>
            <OverloadBadge suggestionKg={suggestion} mode={overloadMode} />
            {exDetail && (exDetail.instructions.length > 0 || exDetail.tips.length > 0) && (
              <div className="mt-3">
                <button
                  onClick={() => setShowForm(f => !f)}
                  className="text-[#00d4aa] text-xs font-medium"
                >
                  {showForm ? '▲ Hide form guide' : '▼ Show form guide'}
                </button>
                {showForm && (
                  <div className="mt-2 flex flex-col gap-1">
                    {exDetail.instructions.map((inst, i) => (
                      <p key={i} className="text-gray-400 text-xs">{i + 1}. {inst}</p>
                    ))}
                    {exDetail.tips.map((tip, i) => (
                      <p key={i} className="text-[#00d4aa] text-xs">💡 {tip}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {restActive && (
          <RestTimer seconds={currentEx.restSeconds} onDone={handleRestDone} active={restActive} />
        )}

        {!restActive && (
          <div className="bg-surface rounded-xl p-4 border border-white/10 mb-4">
            {Array.from({ length: currentEx.sets }).map((_, i) => {
              const done = completedForEx.some(s => s.setNumber === i + 1)
              return (
                <SetRow
                  key={i}
                  setNumber={i + 1}
                  targetReps={currentEx.repMax}
                  targetWeightKg={lastWeight || 0}
                  completed={done}
                  onComplete={(reps, weight) => handleSetDone(currentEx, i + 1, reps, weight)}
                />
              )
            })}
          </div>
        )}

        {allSetsForEx && !restActive && (
          <div className="flex gap-3">
            {currentExIdx < day.exercises.length - 1 ? (
              <Button size="lg" onClick={() => { setCurrentExIdx(i => i + 1); setShowForm(false) }} className="flex-1">
                Next Exercise
              </Button>
            ) : (
              <Button size="lg" onClick={finishWorkout} className="flex-1">
                Complete Workout
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
