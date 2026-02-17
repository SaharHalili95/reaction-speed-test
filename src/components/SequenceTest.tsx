import { useState, useRef, useCallback, useMemo } from 'react'
import type { GamePhase } from '../types/game'
import { getBenchmark } from '../types/game'

interface Props {
  onResult: (time: number) => void
}

const GRID_SIZE = 25

function shufflePositions(): number[] {
  const positions = Array.from({ length: GRID_SIZE }, (_, i) => i + 1)
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]]
  }
  return positions
}

export default function SequenceTest({ onResult }: Props) {
  const [phase, setPhase] = useState<GamePhase>('idle')
  const [grid, setGrid] = useState<number[]>([])
  const [nextNumber, setNextNumber] = useState(1)
  const [totalTime, setTotalTime] = useState(0)
  const [wrongClick, setWrongClick] = useState<number | null>(null)
  const startRef = useRef(0)

  const handleStart = useCallback(() => {
    setGrid(shufflePositions())
    setNextNumber(1)
    setWrongClick(null)
    setPhase('playing')
    startRef.current = performance.now()
  }, [])

  const handleNumberClick = useCallback((num: number) => {
    if (num === nextNumber) {
      setWrongClick(null)
      if (nextNumber >= GRID_SIZE) {
        const time = Math.round(performance.now() - startRef.current)
        setTotalTime(time)
        setPhase('result')
        onResult(time)
      } else {
        setNextNumber(n => n + 1)
      }
    } else {
      setWrongClick(num)
      setTimeout(() => setWrongClick(null), 300)
    }
  }, [nextNumber, onResult])

  const benchmark = phase === 'result' ? getBenchmark('sequence', totalTime) : null

  const formatTime = useMemo(() => {
    return (ms: number) => {
      const seconds = (ms / 1000).toFixed(2)
      return `${seconds}s`
    }
  }, [])

  if (phase === 'idle') {
    return (
      <div
        className="bg-teal-600 min-h-[70vh] flex flex-col items-center justify-center cursor-pointer select-none rounded-2xl mx-4"
        onClick={handleStart}
      >
        <div className="text-center text-white px-6">
          <div className="text-6xl mb-6">🔢</div>
          <h2 className="text-3xl font-bold mb-3">Number Sequence</h2>
          <p className="text-xl opacity-90 mb-2">
            Click numbers <span className="font-bold text-yellow-300">1 to 25</span> in order as fast as you can!
          </p>
          <p className="text-lg opacity-70">Find and click each number in sequence</p>
          <div className="mt-8 bg-white/20 px-8 py-3 rounded-full text-xl font-semibold">
            Click to Start
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'playing') {
    return (
      <div className="bg-slate-900 min-h-[70vh] flex flex-col items-center justify-center rounded-2xl mx-4 py-6">
        <div className="text-white text-xl font-semibold mb-4">
          Find: <span className="text-3xl text-yellow-400 font-bold">{nextNumber}</span>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-3 max-w-sm mx-auto px-4">
          {grid.map((num, idx) => {
            const isClicked = num < nextNumber
            const isWrong = wrongClick === num

            return (
              <button
                key={idx}
                onClick={() => !isClicked && handleNumberClick(num)}
                disabled={isClicked}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg font-bold text-lg transition-all duration-150 ${
                  isClicked
                    ? 'bg-green-600/30 text-green-400/50 cursor-default scale-90'
                    : isWrong
                    ? 'bg-red-500 text-white scale-95 animate-pulse'
                    : 'bg-slate-700 text-white hover:bg-slate-600 hover:scale-105 cursor-pointer'
                }`}
              >
                {isClicked ? '✓' : num}
              </button>
            )
          })}
        </div>

        <div className="text-white/50 text-sm mt-4">
          {nextNumber - 1} / {GRID_SIZE} found
        </div>
      </div>
    )
  }

  if (phase === 'result') {
    return (
      <div
        className="bg-slate-800 min-h-[70vh] flex flex-col items-center justify-center cursor-pointer select-none rounded-2xl mx-4"
        onClick={() => setPhase('idle')}
      >
        <div className="text-center text-white px-6">
          <div className="text-5xl mb-4">🔢</div>
          <h2 className="text-2xl font-semibold mb-2">Total Time</h2>
          <div className="text-7xl font-bold mb-2" style={{ color: benchmark?.color }}>
            {formatTime(totalTime)}
          </div>
          <div className="text-2xl text-white/60 mb-2">{totalTime}ms</div>
          <div
            className="text-2xl font-semibold mb-8 px-4 py-1 rounded-full inline-block"
            style={{ backgroundColor: benchmark?.color + '30', color: benchmark?.color }}
          >
            {benchmark?.label}
          </div>

          <div className="bg-white/20 px-8 py-3 rounded-full text-xl font-semibold">
            Click to Play Again
          </div>
        </div>
      </div>
    )
  }

  return null
}
