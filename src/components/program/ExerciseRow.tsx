import type { ProgramExercise } from '../../types'

interface Props { exercise: ProgramExercise; name: string }

export function ExerciseRow({ exercise, name }: Props) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-white text-sm font-medium">{name}</span>
      <span className="text-white/50 text-xs">
        {exercise.sets} × {exercise.repMin}–{exercise.repMax}
      </span>
    </div>
  )
}
