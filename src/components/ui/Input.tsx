import { cn } from '../../lib/utils'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-white/80">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full bg-surface border rounded-xl px-4 py-2.5 text-white placeholder-white/30 outline-none transition-all',
          'border-white/10 focus:border-teal focus:ring-1 focus:ring-teal/40',
          error && 'border-red-500/50 focus:border-red-400 focus:ring-red-400/20',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-white/40">{hint}</p>}
    </div>
  )
}
