import { useState } from 'react'

interface Props {
  setNumber: number
  targetReps: number
  targetWeightKg: number
  completed: boolean
  onComplete: (reps: number, weightKg: number) => void
}

export function SetRow({ setNumber, targetReps, targetWeightKg, completed, onComplete }: Props) {
  const [reps, setReps] = useState(String(targetReps))
  const [weight, setWeight] = useState(String(targetWeightKg))

  if (completed) {
    return (
      <div className="flex items-center gap-3 py-2 opacity-50">
        <span className="w-6 h-6 rounded-full bg-teal flex items-center justify-center text-bg text-xs font-bold flex-shrink-0">✓</span>
        <span className="text-white/60 text-sm">Set {setNumber} — {weight}kg × {reps}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 py-2">
      <span className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-white/50 text-xs flex-shrink-0">{setNumber}</span>
      <div className="flex gap-2 flex-1">
        <div className="flex flex-col items-center gap-0.5">
          <label className="text-xs text-white/40">kg</label>
          <input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            className="w-16 bg-surface border border-white/10 rounded-lg px-2 py-1.5 text-white text-center text-sm focus:outline-none focus:border-teal"
          />
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <label className="text-xs text-white/40">reps</label>
          <input
            type="number"
            value={reps}
            onChange={e => setReps(e.target.value)}
            className="w-16 bg-surface border border-white/10 rounded-lg px-2 py-1.5 text-white text-center text-sm focus:outline-none focus:border-teal"
          />
        </div>
      </div>
      <button
        onClick={() => onComplete(Number(reps), Number(weight))}
        className="px-3 py-2 bg-teal text-bg text-sm font-semibold rounded-lg hover:bg-teal-dark transition-colors"
      >
        Done
      </button>
    </div>
  )
}
