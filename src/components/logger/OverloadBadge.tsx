import type { OverloadMode } from '../../types'

interface Props { suggestionKg: number | null; mode: OverloadMode }

export function OverloadBadge({ suggestionKg, mode }: Props) {
  if (mode === 'manual' || suggestionKg === null) return null
  return (
    <div className="flex items-center gap-2 bg-teal/10 border border-teal/30 rounded-xl px-3 py-2 text-sm">
      <span className="text-teal font-semibold">↑</span>
      <span className="text-white">Suggested: <strong>{suggestionKg}kg</strong></span>
      {mode === 'automatic' && <span className="text-white/40 text-xs">(auto)</span>}
    </div>
  )
}
