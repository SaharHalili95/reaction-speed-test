import { useState, useMemo } from 'react'
import type { GameMode, LeaderboardEntry } from '../types/game'
import { getBenchmark } from '../types/game'

interface Props {
  entries: LeaderboardEntry[]
  getEntriesForMode: (mode: GameMode) => LeaderboardEntry[]
  clearLeaderboard: () => void
}

const MODE_TABS: { key: GameMode; label: string; icon: string }[] = [
  { key: 'reaction', label: 'Reaction', icon: '⚡' },
  { key: 'target', label: 'Target', icon: '🎯' },
  { key: 'sequence', label: 'Sequence', icon: '🔢' },
]

const MODE_UNIT: Record<GameMode, string> = {
  reaction: 'ms',
  target: 'ms',
  sequence: 'ms',
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Leaderboard({ entries, getEntriesForMode, clearLeaderboard }: Props) {
  const [activeTab, setActiveTab] = useState<GameMode>('reaction')

  const modeEntries = useMemo(
    () => getEntriesForMode(activeTab),
    [getEntriesForMode, activeTab]
  )

  const rankEmoji = (rank: number): string => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div className="mx-4 space-y-6">
      <div className="bg-slate-800 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span>🏅</span> Leaderboard
            </h2>
            <p className="text-white/50 text-sm mt-1">Top 10 scores per game mode</p>
          </div>
          {entries.length > 0 && (
            <button
              onClick={clearLeaderboard}
              className="text-sm text-red-400 hover:text-red-300 px-3 py-1 rounded-lg hover:bg-red-400/10 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Mode tabs */}
        <div className="flex gap-2 mb-6">
          {MODE_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Leaderboard entries */}
        {modeEntries.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            <div className="text-5xl mb-4">🏅</div>
            <p className="text-lg">No scores yet for this mode</p>
            <p className="text-sm mt-1">Play some games to see your rankings here!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {modeEntries.map((entry, index) => {
              const rank = index + 1
              const benchmark = getBenchmark(activeTab, entry.time)
              return (
                <div
                  key={`${entry.date}-${entry.time}-${index}`}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                    rank <= 3 ? 'bg-white/10' : 'bg-white/5'
                  }`}
                >
                  {/* Rank */}
                  <div className={`text-xl font-bold min-w-[3rem] text-center ${
                    rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-amber-600' : 'text-white/40'
                  }`}>
                    {rankEmoji(rank)}
                  </div>

                  {/* Player name */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">
                      {entry.playerName || 'Anonymous'}
                    </div>
                    <div className="text-xs text-white/40">{formatDate(entry.date)}</div>
                  </div>

                  {/* Time */}
                  <div className="text-right">
                    <div className="text-xl font-bold" style={{ color: benchmark.color }}>
                      {entry.time}<span className="text-sm">{MODE_UNIT[activeTab]}</span>
                    </div>
                    <div
                      className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block"
                      style={{ backgroundColor: benchmark.color + '30', color: benchmark.color }}
                    >
                      {benchmark.label}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
