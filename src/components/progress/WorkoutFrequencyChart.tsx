import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface DataPoint { week: string; sessions: number }
interface Props { data: DataPoint[] }

export function WorkoutFrequencyChart({ data }: Props) {
  if (data.length === 0) return (
    <div className="flex items-center justify-center h-40 text-white/40 text-sm">
      No sessions logged yet.
    </div>
  )
  return (
    <div>
      <h3 className="text-white font-semibold mb-3">Sessions per Week</h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="week" tick={{ fill: '#ffffff40', fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fill: '#ffffff40', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#161b22', border: '1px solid #ffffff20', borderRadius: 8 }}
            labelStyle={{ color: '#ffffff60' }}
            itemStyle={{ color: '#00d4aa' }}
          />
          <Bar dataKey="sessions" fill="#00d4aa" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
