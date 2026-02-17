import { useState, useCallback } from 'react'
import type { GameMode } from './types/game'
import { useHistory } from './hooks/useHistory'
import ReactionTest from './components/ReactionTest'
import TargetTest from './components/TargetTest'
import SequenceTest from './components/SequenceTest'
import StatsPanel from './components/StatsPanel'

const MODES: { key: GameMode; label: string; icon: string; color: string }[] = [
  { key: 'reaction', label: 'Reaction Time', icon: '⚡', color: 'bg-blue-600 hover:bg-blue-500' },
  { key: 'target', label: 'Target Click', icon: '🎯', color: 'bg-indigo-600 hover:bg-indigo-500' },
  { key: 'sequence', label: 'Number Sequence', icon: '🔢', color: 'bg-teal-600 hover:bg-teal-500' },
]

export default function App() {
  const [activeMode, setActiveMode] = useState<GameMode>('reaction')
  const { results, addResult, clearHistory } = useHistory()

  const handleResult = useCallback(
    (time: number) => {
      addResult({
        mode: activeMode,
        time,
        date: new Date().toISOString(),
      })
    },
    [activeMode, addResult]
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">
            <span className="mr-2">⚡</span>Reaction Speed Test
          </h1>
          <div className="flex gap-2">
            {MODES.map(m => (
              <button
                key={m.key}
                onClick={() => setActiveMode(m.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeMode === m.key
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
        {activeMode === 'reaction' && <ReactionTest onResult={handleResult} />}
        {activeMode === 'target' && <TargetTest onResult={handleResult} />}
        {activeMode === 'sequence' && <SequenceTest onResult={handleResult} />}

        <StatsPanel results={results} mode={activeMode} onClear={clearHistory} />
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
