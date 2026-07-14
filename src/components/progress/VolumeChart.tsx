import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface DataPoint { muscle: string; sets: number }
interface Props { data: DataPoint[] }

export function VolumeChart({ data }: Props) {
  if (data.length === 0) return (
    <div className="flex items-center justify-center h-40 text-white/40 text-sm">
      No volume data yet.
    </div>
  )
  return (
    <div>
      <h3 className="text-white font-semibold mb-3">Weekly Volume by Muscle</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 40, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="muscle" tick={{ fill: '#ffffff40', fontSize: 10 }} angle={-45} textAnchor="end" />
          <YAxis tick={{ fill: '#ffffff40', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#161b22', border: '1px solid #ffffff20', borderRadius: 8 }}
            labelStyle={{ color: '#ffffff60' }}
            itemStyle={{ color: '#0080ff' }}
          />
          <Bar dataKey="sets" fill="#0080ff" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
