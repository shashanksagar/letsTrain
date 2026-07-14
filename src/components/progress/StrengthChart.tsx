import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface DataPoint { date: string; weightKg: number }
interface Props { data: DataPoint[]; exerciseName: string }

export function StrengthChart({ data, exerciseName }: Props) {
  if (data.length < 2) return (
    <div className="flex items-center justify-center h-40 text-white/40 text-sm">
      Log at least 2 sessions to see your strength curve.
    </div>
  )
  return (
    <div>
      <h3 className="text-white font-semibold mb-3">{exerciseName}</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="date" tick={{ fill: '#ffffff40', fontSize: 11 }} />
          <YAxis tick={{ fill: '#ffffff40', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#161b22', border: '1px solid #ffffff20', borderRadius: 8 }}
            labelStyle={{ color: '#ffffff60' }}
            itemStyle={{ color: '#00d4aa' }}
          />
          <Line type="monotone" dataKey="weightKg" stroke="#00d4aa" strokeWidth={2} dot={{ fill: '#00d4aa', r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
