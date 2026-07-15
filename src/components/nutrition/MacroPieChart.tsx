import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface Props { proteinG: number; carbsG: number; fatG: number }

export function MacroPieChart({ proteinG, carbsG, fatG }: Props) {
  const data = [
    { name: 'Protein', value: proteinG * 4, color: '#00d4aa' },
    { name: 'Carbs', value: carbsG * 4, color: '#0080ff' },
    { name: 'Fat', value: fatG * 9, color: '#f59e0b' },
  ].filter(d => d.value > 0)

  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={160}>
      <PieChart>
        <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={60} paddingAngle={2}>
          {data.map(entry => <Cell key={entry.name} fill={entry.color} />)}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: '#161b22', border: '1px solid #ffffff20', borderRadius: 8 }}
          formatter={(value) => [`${Math.round(Number(value ?? 0))} kcal`]}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
