import { useMemo } from 'react'
import type { GameResult } from '../types/game'
import { getBenchmark } from '../types/game'

interface Props {
  results: GameResult[]
}

interface DayData {
  date: string
  displayDate: string
  dayOfWeek: string
  gamesPlayed: number
  bestTime: number
  averageTime: number
}

function getDayKey(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDayShort(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function getDayOfWeek(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { weekday: 'short' })
}

export default function TrainingMode({ results }: Props) {
  // Filter to reaction mode results only (primary training metric)
  const reactionResults = useMemo(
    () => results.filter(r => r.mode === 'reaction'),
    [results]
  )

  // Group results by day for the last 30 days
  const last30Days = useMemo(() => {
    const days: DayData[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayKey = getDayKey(date.toISOString())
      const dayResults = reactionResults.filter(r => getDayKey(r.date) === dayKey)

      if (dayResults.length > 0) {
        const times = dayResults.map(r => r.time)
        days.push({
          date: dayKey,
          displayDate: formatDayShort(date.toISOString()),
          dayOfWeek: getDayOfWeek(date.toISOString()),
          gamesPlayed: dayResults.length,
          bestTime: Math.min(...times),
          averageTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
        })
      } else {
        days.push({
          date: dayKey,
          displayDate: formatDayShort(date.toISOString()),
          dayOfWeek: getDayOfWeek(date.toISOString()),
          gamesPlayed: 0,
          bestTime: 0,
          averageTime: 0,
        })
      }
    }

    return days
  }, [reactionResults])

  // Weekly stats
  const weeklyStats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay())

    const lastWeekStart = new Date(thisWeekStart)
    lastWeekStart.setDate(lastWeekStart.getDate() - 7)

    const thisWeekResults = reactionResults.filter(r => {
      const d = new Date(r.date)
      return d >= thisWeekStart
    })

    const lastWeekResults = reactionResults.filter(r => {
      const d = new Date(r.date)
      return d >= lastWeekStart && d < thisWeekStart
    })

    const thisWeekAvg = thisWeekResults.length > 0
      ? Math.round(thisWeekResults.map(r => r.time).reduce((a, b) => a + b, 0) / thisWeekResults.length)
      : 0

    const lastWeekAvg = lastWeekResults.length > 0
      ? Math.round(lastWeekResults.map(r => r.time).reduce((a, b) => a + b, 0) / lastWeekResults.length)
      : 0

    let improvementPct = 0
    if (lastWeekAvg > 0 && thisWeekAvg > 0) {
      improvementPct = Math.round(((lastWeekAvg - thisWeekAvg) / lastWeekAvg) * 100)
    }

    return {
      thisWeekGames: thisWeekResults.length,
      thisWeekAvg,
      lastWeekAvg,
      improvementPct,
    }
  }, [reactionResults])

  // Current streak (consecutive days played)
  const streak = useMemo(() => {
    let count = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayKey = getDayKey(date.toISOString())
      const hasGames = reactionResults.some(r => getDayKey(r.date) === dayKey)

      if (hasGames) {
        count++
      } else if (i > 0) {
        break
      }
      // If today has no games, we still check yesterday
      if (i === 0 && !hasGames) {
        continue
      }
    }

    return count
  }, [reactionResults])

  // Chart data - daily best reaction times for days with data
  const chartData = useMemo(() => {
    return last30Days.filter(d => d.gamesPlayed > 0)
  }, [last30Days])

  const chartMax = useMemo(() => {
    if (chartData.length === 0) return 400
    return Math.max(...chartData.map(d => d.bestTime), 200)
  }, [chartData])

  const chartMin = useMemo(() => {
    if (chartData.length === 0) return 0
    return Math.max(Math.min(...chartData.map(d => d.bestTime)) - 50, 0)
  }, [chartData])

  // Training tips based on performance
  const tips = useMemo(() => {
    const allTips: string[] = []

    if (reactionResults.length === 0) {
      allTips.push('Start playing reaction time games to track your progress!')
      allTips.push('Consistency is key - try to practice a few rounds every day.')
      return allTips
    }

    const recentResults = reactionResults.slice(-10)
    const recentAvg = Math.round(recentResults.map(r => r.time).reduce((a, b) => a + b, 0) / recentResults.length)

    if (recentAvg < 200) {
      allTips.push('Excellent reflexes! Focus on consistency across all rounds.')
      allTips.push('Try the Target Click mode to test your precision along with speed.')
    } else if (recentAvg < 280) {
      allTips.push('Good performance! Try to anticipate the color change timing.')
      allTips.push('Reduce distractions and focus solely on the screen during tests.')
    } else if (recentAvg < 350) {
      allTips.push('Room for improvement! Make sure you are well-rested before testing.')
      allTips.push('Position your clicking finger directly over the mouse button.')
    } else {
      allTips.push('Keep practicing! Regular sessions will improve your reaction time.')
      allTips.push('Try warming up with a few practice rounds before serious attempts.')
    }

    if (weeklyStats.improvementPct > 0) {
      allTips.push(`Great progress! You improved ${weeklyStats.improvementPct}% compared to last week.`)
    } else if (weeklyStats.improvementPct < -5) {
      allTips.push('Your times increased this week. Ensure you are focused and rested.')
    }

    if (streak >= 3) {
      allTips.push(`${streak}-day streak! Consistency is building your muscle memory.`)
    } else if (streak === 0) {
      allTips.push('Start a daily practice streak to build consistent improvement.')
    }

    return allTips.slice(0, 3)
  }, [reactionResults, weeklyStats, streak])

  return (
    <div className="mx-4 space-y-6">
      {/* Header */}
      <div className="bg-emerald-600 rounded-2xl p-6 text-white">
        <div className="text-center">
          <div className="text-5xl mb-3">📈</div>
          <h2 className="text-3xl font-bold mb-2">Training Dashboard</h2>
          <p className="text-lg opacity-90">Track your reaction time improvement over time</p>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-2xl p-4 text-center text-white">
          <div className="text-sm text-white/60 mb-1">This Week</div>
          <div className="text-2xl font-bold text-blue-400">{weeklyStats.thisWeekGames}</div>
          <div className="text-xs text-white/40">games</div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4 text-center text-white">
          <div className="text-sm text-white/60 mb-1">Week Avg</div>
          <div className="text-2xl font-bold text-purple-400">
            {weeklyStats.thisWeekAvg > 0 ? `${weeklyStats.thisWeekAvg}ms` : '--'}
          </div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4 text-center text-white">
          <div className="text-sm text-white/60 mb-1">vs Last Week</div>
          <div className={`text-2xl font-bold ${
            weeklyStats.improvementPct > 0
              ? 'text-green-400'
              : weeklyStats.improvementPct < 0
              ? 'text-red-400'
              : 'text-white/40'
          }`}>
            {weeklyStats.lastWeekAvg > 0 && weeklyStats.thisWeekAvg > 0
              ? `${weeklyStats.improvementPct > 0 ? '+' : ''}${weeklyStats.improvementPct}%`
              : '--'}
          </div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4 text-center text-white">
          <div className="text-sm text-white/60 mb-1">Streak</div>
          <div className="text-2xl font-bold text-yellow-400">{streak}</div>
          <div className="text-xs text-white/40">days</div>
        </div>
      </div>

      {/* Best Time Trend Chart */}
      <div className="bg-slate-800 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Best Reaction Time Trend (30 Days)</h3>
        {chartData.length === 0 ? (
          <div className="text-center py-12 text-white/40">
            <p>No data yet. Play some reaction time games to see your trend!</p>
          </div>
        ) : (
          <div className="relative">
            {/* Y-axis labels */}
            <div className="flex">
              <div className="w-12 flex flex-col justify-between text-xs text-white/40 pr-2 h-40">
                <span>{chartMin}ms</span>
                <span>{Math.round((chartMax + chartMin) / 2)}ms</span>
                <span>{chartMax}ms</span>
              </div>

              {/* Chart area */}
              <div className="flex-1 h-40 flex items-end gap-1 relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-b border-white/5" />
                  <div className="border-b border-white/5" />
                  <div className="border-b border-white/5" />
                </div>

                {/* Line chart using divs */}
                {chartData.map((day, i) => {
                  const range = chartMax - chartMin || 1
                  const heightPct = ((day.bestTime - chartMin) / range) * 100
                  const benchmark = getBenchmark('reaction', day.bestTime)

                  return (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center justify-end relative group min-w-[8px]"
                    >
                      {/* Bar */}
                      <div
                        className="w-full max-w-[24px] rounded-t-sm transition-all hover:opacity-80"
                        style={{
                          height: `${Math.max(Math.min(heightPct, 100), 5)}%`,
                          backgroundColor: benchmark.color,
                        }}
                      />

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-700 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        <div className="font-semibold">{day.displayDate}</div>
                        <div>Best: {day.bestTime}ms</div>
                        <div>Avg: {day.averageTime}ms</div>
                        <div>{day.gamesPlayed} game{day.gamesPlayed !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* X-axis labels */}
            <div className="flex ml-12 mt-1">
              {chartData.length <= 10 ? (
                chartData.map(day => (
                  <div key={day.date} className="flex-1 text-center text-xs text-white/40 min-w-[8px]">
                    {day.displayDate}
                  </div>
                ))
              ) : (
                <>
                  <div className="text-xs text-white/40">{chartData[0]?.displayDate}</div>
                  <div className="flex-1" />
                  <div className="text-xs text-white/40">{chartData[chartData.length - 1]?.displayDate}</div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Calendar View */}
      <div className="bg-slate-800 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Last 30 Days</h3>
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
          {last30Days.map(day => {
            const benchmark = day.gamesPlayed > 0 ? getBenchmark('reaction', day.bestTime) : null
            const isToday = day.date === getDayKey(new Date().toISOString())

            return (
              <div
                key={day.date}
                className={`rounded-xl p-2 text-center transition-colors ${
                  day.gamesPlayed > 0 ? 'bg-white/10' : 'bg-white/5'
                } ${isToday ? 'ring-2 ring-emerald-400' : ''}`}
                title={`${day.displayDate}: ${day.gamesPlayed} games${day.gamesPlayed > 0 ? `, best: ${day.bestTime}ms` : ''}`}
              >
                <div className="text-[10px] text-white/40 mb-0.5">{day.dayOfWeek}</div>
                <div className="text-xs font-medium text-white/70 mb-1">{day.displayDate}</div>
                {day.gamesPlayed > 0 ? (
                  <>
                    <div
                      className="text-xs font-bold"
                      style={{ color: benchmark?.color }}
                    >
                      {day.bestTime}ms
                    </div>
                    <div className="text-[10px] text-white/40">{day.gamesPlayed} game{day.gamesPlayed !== 1 ? 's' : ''}</div>
                  </>
                ) : (
                  <div className="text-xs text-white/20">—</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Training Tips */}
      <div className="bg-slate-800 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>💡</span> Training Tips
        </h3>
        <div className="space-y-3">
          {tips.map((tip, i) => (
            <div key={i} className="flex gap-3 items-start bg-white/5 rounded-xl p-4">
              <div className="w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-white/80 text-sm">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
