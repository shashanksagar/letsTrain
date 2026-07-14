import { cn } from '../../lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercent?: boolean
  className?: string
}

export function ProgressBar({ value, max = 100, label, showPercent = false, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between text-sm text-white/60">
          {label && <span>{label}</span>}
          {showPercent && <span>{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-teal rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  )
}
