import { useMemo } from 'react'
import type { GameMode, GameResult } from '../types/game'
import { getStats, BENCHMARKS } from '../types/game'

interface Props {
  results: GameResult[]
  mode: GameMode
  onClear: () => void
}

const MODE_LABELS: Record<GameMode, string> = {
  reaction: 'Reaction Time',
  target: 'Target Click',
  sequence: 'Number Sequence',
}

const MODE_UNIT: Record<GameMode, string> = {
  reaction: 'ms',
  target: 'ms',
  sequence: 'ms',
}

export default function StatsPanel({ results, mode, onClear }: Props) {
  const stats = useMemo(() => getStats(results, mode), [results, mode])
  const modeResults = useMemo(
    () => results.filter(r => r.mode === mode).slice(-20),
    [results, mode]
  )
  const benchmarks = BENCHMARKS[mode]

  if (stats.totalGames === 0) {
    return (
      <div className="bg-slate-800 rounded-2xl p-6 mx-4 text-center text-white/60">
        <h3 className="text-xl font-semibold text-white mb-2">{MODE_LABELS[mode]} Stats</h3>
        <p>No games played yet. Complete a round to see your stats!</p>
      </div>
    )
  }

  const maxTime = Math.max(...modeResults.map(r => r.time))

  return (
    <div className="bg-slate-800 rounded-2xl p-6 mx-4 text-white">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">{MODE_LABELS[mode]} Stats</h3>
        <button
          onClick={onClear}
          className="text-sm text-red-400 hover:text-red-300 px-3 py-1 rounded-lg hover:bg-red-400/10 transition-colors"
        >
          Clear History
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-sm text-white/60 mb-1">Best</div>
          <div className="text-2xl font-bold text-green-400">
            {stats.best}<span className="text-sm">{MODE_UNIT[mode]}</span>
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-sm text-white/60 mb-1">Average</div>
          <div className="text-2xl font-bold text-blue-400">
            {stats.average}<span className="text-sm">{MODE_UNIT[mode]}</span>
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-sm text-white/60 mb-1">Last 10 Avg</div>
          <div className="text-2xl font-bold text-purple-400">
            {stats.last10Average}<span className="text-sm">{MODE_UNIT[mode]}</span>
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-sm text-white/60 mb-1">Games</div>
          <div className="text-2xl font-bold text-yellow-400">{stats.totalGames}</div>
        </div>
      </div>

      {/* History chart */}
      <div className="mb-6">
        <h4 className="text-sm text-white/60 mb-3">Recent History (last 20)</h4>
        <div className="flex items-end gap-1 h-32">
          {modeResults.map((r, i) => {
            const height = maxTime > 0 ? (r.time / maxTime) * 100 : 0
            const benchmark = benchmarks.find(b => r.time < b.max)
            return (
              <div
                key={i}
                className="flex-1 rounded-t-sm min-w-1 transition-all hover:opacity-80 group relative"
                style={{
                  height: `${Math.max(height, 5)}%`,
                  backgroundColor: benchmark?.color || '#64748b',
                }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {r.time}{MODE_UNIT[mode]}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Benchmarks legend */}
      <div>
        <h4 className="text-sm text-white/60 mb-2">Benchmarks</h4>
        <div className="flex flex-wrap gap-3">
          {benchmarks.map(b => (
            <div key={b.label} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: b.color }}
              />
              <span className="text-sm text-white/70">
                {b.label} ({b.max === Infinity ? `>${benchmarks[benchmarks.length - 2].max}` : `<${b.max}`}{MODE_UNIT[mode]})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
