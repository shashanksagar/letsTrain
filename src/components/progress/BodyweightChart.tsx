import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

interface DataPoint { date: string; weightKg: number; maKg?: number }
interface Props { data: DataPoint[] }

export function BodyweightChart({ data }: Props) {
  if (data.length < 2) return (
    <div className="flex items-center justify-center h-40 text-white/40 text-sm">
      Log at least 2 measurements to see your trend.
    </div>
  )
  return (
    <div>
      <h3 className="text-white font-semibold mb-3">Bodyweight Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="date" tick={{ fill: '#ffffff40', fontSize: 11 }} />
          <YAxis tick={{ fill: '#ffffff40', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#161b22', border: '1px solid #ffffff20', borderRadius: 8 }}
            labelStyle={{ color: '#ffffff60' }}
          />
          <Legend wrapperStyle={{ color: '#ffffff60', fontSize: 12 }} />
          <Line type="monotone" dataKey="weightKg" stroke="#00d4aa" strokeWidth={2} dot={{ r: 2 }} name="Weight (kg)" />
          <Line type="monotone" dataKey="maKg" stroke="#0080ff" strokeWidth={2} dot={false} strokeDasharray="4 2" name="7-day avg" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
