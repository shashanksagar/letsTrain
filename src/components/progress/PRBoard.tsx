interface PREntry { exerciseName: string; weightKg: number; reps: number; date: string }
interface Props { records: PREntry[] }

export function PRBoard({ records }: Props) {
  if (records.length === 0) return (
    <div className="flex items-center justify-center h-24 text-white/40 text-sm">
      No personal records yet — keep lifting!
    </div>
  )
  return (
    <div>
      <h3 className="text-white font-semibold mb-3">Personal Records</h3>
      <div className="flex flex-col gap-2">
        {records.map(pr => (
          <div key={pr.exerciseName} className="flex items-center justify-between bg-surface rounded-lg px-4 py-3 border border-white/10">
            <div>
              <p className="text-white text-sm font-medium">{pr.exerciseName}</p>
              <p className="text-white/40 text-xs">{pr.date}</p>
            </div>
            <div className="text-right">
              <p className="text-teal font-bold">{pr.weightKg}kg</p>
              <p className="text-white/40 text-xs">× {pr.reps} reps</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
