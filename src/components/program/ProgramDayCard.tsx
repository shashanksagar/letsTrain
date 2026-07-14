import type { ProgramDay, Exercise } from '../../types'
import { ExerciseRow } from './ExerciseRow'

interface Props {
  day: ProgramDay
  exerciseMap: Map<string, Exercise>
  onStart: () => void
}

export function ProgramDayCard({ day, exerciseMap, onStart }: Props) {
  return (
    <div className="bg-surface rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold">{day.label}</h3>
        <button
          onClick={onStart}
          className="text-xs font-semibold text-teal border border-teal/40 rounded-lg px-3 py-1 hover:bg-teal/10 transition-colors"
        >
          Start
        </button>
      </div>
      {day.exercises.map(ex => (
        <ExerciseRow
          key={ex.exId}
          exercise={ex}
          name={exerciseMap.get(ex.exId)?.name ?? ex.exId}
        />
      ))}
    </div>
  )
}
