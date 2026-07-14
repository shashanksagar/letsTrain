import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface Props { name: string; onChange: (v: string) => void; onNext: () => void }

export function StepName({ name, onChange, onNext }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white">What should we call you?</h2>
        <p className="text-white/50 mt-1">This is just for display inside the app.</p>
      </div>
      <Input
        placeholder="Your name"
        value={name}
        onChange={e => onChange(e.target.value)}
        autoFocus
      />
      <Button size="lg" fullWidth onClick={onNext} disabled={!name.trim()}>
        Next
      </Button>
    </div>
  )
}
