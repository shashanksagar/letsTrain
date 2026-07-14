interface Props { label: string; current: number; target: number; color: string }

export function MacroBar({ label, current, target, color }: Props) {
  const pct = Math.min(100, Math.round((current / target) * 100))
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white">{current}g / {target}g</span>
      </div>
      <div className="w-full bg-[#0d1117] rounded-full h-2">
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}
