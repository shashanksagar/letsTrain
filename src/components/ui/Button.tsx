import { cn } from '../../lib/utils'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-teal text-bg font-semibold hover:bg-teal-dark active:scale-95',
  secondary: 'bg-surface text-white border border-white/10 hover:border-white/20 active:scale-95',
  ghost: 'text-white/70 hover:text-white hover:bg-white/5 active:scale-95',
  danger: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 active:scale-95',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-base rounded-xl',
  lg: 'px-6 py-3.5 text-lg rounded-xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
