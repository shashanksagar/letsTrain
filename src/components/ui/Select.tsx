import { cn } from '../../lib/utils'
import type { SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string | number
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  error?: string
}

export function Select({ label, options, error, className, id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-white/80">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full bg-surface border rounded-xl px-4 py-2.5 text-white outline-none transition-all appearance-none',
          'border-white/10 focus:border-teal focus:ring-1 focus:ring-teal/40',
          error && 'border-red-500/50',
          className,
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
