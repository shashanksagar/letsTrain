import { useEffect, useState } from 'react'

interface Props { seconds: number; onDone: () => void; active: boolean }

export function RestTimer({ seconds, onDone, active }: Props) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (active) setRemaining(seconds)
  }, [active, seconds])

  useEffect(() => {
    if (!active) return
    if (remaining <= 0) { onDone(); return }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [active, remaining, onDone])

  if (!active) return null

  const pct = ((seconds - remaining) / seconds) * 100
  const circumference = 2 * Math.PI * 40

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="40" fill="none" stroke="#161b22" strokeWidth="8" />
          <circle
            cx="48" cy="48" r="40" fill="none"
            stroke="#00d4aa" strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct / 100)}
            className="transition-all duration-1000"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
          {remaining}
        </span>
      </div>
      <p className="text-white/50 text-sm">Rest</p>
    </div>
  )
}
