interface Props { trainedDates: Set<string> }

function getLastNWeeks(n: number): string[][] {
  const weeks: string[][] = []
  const today = new Date()
  const endDay = new Date(today)
  endDay.setDate(today.getDate() + (6 - today.getDay()))

  for (let w = n - 1; w >= 0; w--) {
    const week: string[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(endDay)
      date.setDate(endDay.getDate() - w * 7 - (6 - d))
      week.push(date.toISOString().slice(0, 10))
    }
    weeks.push(week)
  }
  return weeks
}

export function StreakCalendar({ trainedDates }: Props) {
  const weeks = getLastNWeeks(16)
  const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div>
      <h3 className="text-white font-semibold mb-3">Training Streak</h3>
      <div className="overflow-x-auto">
        <div className="flex gap-1">
          <div className="flex flex-col gap-1 mr-1">
            {DAY_LABELS.map((l, i) => (
              <div key={i} className="w-3 h-3 flex items-center justify-center text-[9px] text-white/20">{l}</div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map(date => (
                <div
                  key={date}
                  title={date}
                  className={`w-3 h-3 rounded-sm ${trainedDates.has(date) ? 'bg-teal' : 'bg-surface'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="text-white/30 text-xs mt-2">{trainedDates.size} sessions in the last 16 weeks</p>
    </div>
  )
}
