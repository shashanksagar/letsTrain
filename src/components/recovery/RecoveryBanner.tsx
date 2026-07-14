import type { RecoverySuggestion } from '../../lib/recoveryEngine'

interface Props { suggestion: RecoverySuggestion; onDismiss: () => void }

export function RecoveryBanner({ suggestion, onDismiss }: Props) {
  const isDeload = suggestion.type === 'deload'
  return (
    <div className={`rounded-xl p-4 border flex gap-3 ${
      isDeload ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-blue-500/10 border-blue-500/30'
    }`}>
      <span className="text-2xl">{isDeload ? '⚡' : '😴'}</span>
      <div className="flex-1">
        <p className="text-white text-sm font-medium">{isDeload ? 'Time to deload' : 'Rest day recommended'}</p>
        <p className="text-gray-400 text-xs mt-0.5">{suggestion.message}</p>
      </div>
      <button onClick={onDismiss} className="text-gray-500 hover:text-white transition-colors text-lg leading-none">×</button>
    </div>
  )
}
