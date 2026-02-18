import { useState, useCallback } from 'react'
import type { GameMode } from './types/game'
import { useHistory } from './hooks/useHistory'
import { useLeaderboard } from './hooks/useLeaderboard'
import ReactionTest from './components/ReactionTest'
import TargetTest from './components/TargetTest'
import SequenceTest from './components/SequenceTest'
import StatsPanel from './components/StatsPanel'
import MultiplayerMode from './components/MultiplayerMode'
import Leaderboard from './components/Leaderboard'
import TrainingMode from './components/TrainingMode'

type ViewMode = GameMode | 'multiplayer' | 'leaderboard' | 'training'

const MODES: { key: ViewMode; label: string; icon: string; color: string }[] = [
  { key: 'reaction', label: 'Reaction Time', icon: '⚡', color: 'bg-blue-600 hover:bg-blue-500' },
  { key: 'target', label: 'Target Click', icon: '🎯', color: 'bg-indigo-600 hover:bg-indigo-500' },
  { key: 'sequence', label: 'Number Sequence', icon: '🔢', color: 'bg-teal-600 hover:bg-teal-500' },
  { key: 'multiplayer', label: 'Multiplayer', icon: '👥', color: 'bg-purple-600 hover:bg-purple-500' },
  { key: 'leaderboard', label: 'Leaderboard', icon: '🏅', color: 'bg-amber-600 hover:bg-amber-500' },
  { key: 'training', label: 'Training', icon: '📈', color: 'bg-emerald-600 hover:bg-emerald-500' },
]

export default function App() {
  const [activeView, setActiveView] = useState<ViewMode>('reaction')
  const { results, addResult, clearHistory } = useHistory()
  const { entries, addEntry, getEntriesForMode, clearLeaderboard } = useLeaderboard()

  const handleResult = useCallback(
    (time: number) => {
      if (activeView === 'reaction' || activeView === 'target' || activeView === 'sequence') {
        addResult({
          mode: activeView,
          time,
          date: new Date().toISOString(),
        })
        addEntry({
          playerName: 'Anonymous',
          time,
          date: new Date().toISOString(),
          mode: activeView,
        })
      }
    },
    [activeView, addResult, addEntry]
  )

  const isGameMode = activeView === 'reaction' || activeView === 'target' || activeView === 'sequence'

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">
            <span className="mr-2">⚡</span>Reaction Speed Test
          </h1>
          <div className="flex gap-2 flex-wrap justify-center">
            {MODES.map(m => (
              <button
                key={m.key}
                onClick={() => setActiveView(m.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeView === m.key
                    ? `${m.color.split(' ')[0]} text-white shadow-lg`
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="mr-1.5">{m.icon}</span>
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Game Area */}
      <main className="max-w-4xl mx-auto py-6 space-y-6">
        {activeView === 'reaction' && <ReactionTest onResult={handleResult} />}
        {activeView === 'target' && <TargetTest onResult={handleResult} />}
        {activeView === 'sequence' && <SequenceTest onResult={handleResult} />}
        {activeView === 'multiplayer' && <MultiplayerMode />}
        {activeView === 'leaderboard' && (
          <Leaderboard
            entries={entries}
            getEntriesForMode={getEntriesForMode}
            clearLeaderboard={clearLeaderboard}
          />
        )}
        {activeView === 'training' && <TrainingMode results={results} />}

        {isGameMode && (
          <StatsPanel results={results} mode={activeView} onClear={clearHistory} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-8">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center text-white/30 text-sm">
          Built with React + TypeScript + Tailwind CSS
        </div>
      </footer>
    </div>
  )
}
