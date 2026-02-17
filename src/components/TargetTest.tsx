import { useState, useRef, useCallback, useEffect } from 'react'
import type { GamePhase, TargetPosition } from '../types/game'
import { getBenchmark } from '../types/game'

interface Props {
  onResult: (time: number) => void
}

const TOTAL_TARGETS = 15

function randomTarget(id: number): TargetPosition {
  return {
    x: 10 + Math.random() * 75,
    y: 10 + Math.random() * 70,
    id,
  }
}

export default function TargetTest({ onResult }: Props) {
  const [phase, setPhase] = useState<GamePhase>('idle')
  const [target, setTarget] = useState<TargetPosition | null>(null)
  const [hitCount, setHitCount] = useState(0)
  const [times, setTimes] = useState<number[]>([])
  const [avgTime, setAvgTime] = useState(0)
  const startRef = useRef(0)

  useEffect(() => {
    if (phase === 'playing' && hitCount < TOTAL_TARGETS) {
      const t = randomTarget(hitCount)
      setTarget(t)
      startRef.current = performance.now()
    }
  }, [phase, hitCount])

  const handleStart = useCallback(() => {
    setHitCount(0)
    setTimes([])
    setPhase('playing')
  }, [])

  const handleTargetClick = useCallback(() => {
    const time = Math.round(performance.now() - startRef.current)
    const newTimes = [...times, time]
    setTimes(newTimes)

    if (hitCount + 1 >= TOTAL_TARGETS) {
      const avg = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length)
      setAvgTime(avg)
      setPhase('result')
      onResult(avg)
    } else {
      setHitCount(h => h + 1)
    }
  }, [times, hitCount, onResult])

  const benchmark = phase === 'result' ? getBenchmark('target', avgTime) : null

  if (phase === 'idle') {
    return (
      <div
        className="bg-indigo-600 min-h-[70vh] flex flex-col items-center justify-center cursor-pointer select-none rounded-2xl mx-4"
        onClick={handleStart}
      >
        <div className="text-center text-white px-6">
          <div className="text-6xl mb-6">🎯</div>
          <h2 className="text-3xl font-bold mb-3">Target Click</h2>
          <p className="text-xl opacity-90 mb-2">
            Click the <span className="font-bold text-yellow-300">targets</span> as fast as you can!
          </p>
          <p className="text-lg opacity-70">{TOTAL_TARGETS} targets — click each one quickly</p>
          <div className="mt-8 bg-white/20 px-8 py-3 rounded-full text-xl font-semibold">
            Click to Start
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'playing' && target) {
    return (
      <div className="bg-slate-900 min-h-[70vh] relative rounded-2xl mx-4 overflow-hidden">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 text-white px-6 py-2 rounded-full font-semibold text-lg z-10">
          {hitCount + 1} / {TOTAL_TARGETS}
        </div>

        <div className="w-full h-full min-h-[70vh]">
          <button
            onClick={handleTargetClick}
            className="absolute w-14 h-14 rounded-full bg-red-500 hover:bg-red-400 border-4 border-red-300 shadow-lg shadow-red-500/50 transition-transform hover:scale-110 cursor-pointer flex items-center justify-center"
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
            }}
            aria-label={`Target ${hitCount + 1}`}
          >
            <div className="w-6 h-6 rounded-full bg-white/30 border-2 border-white/50">
              <div className="w-2 h-2 rounded-full bg-white m-auto mt-1.5" />
            </div>
          </button>
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
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-2xl font-semibold mb-2">Average Target Time</h2>
          <div className="text-7xl font-bold mb-2" style={{ color: benchmark?.color }}>
            {avgTime}<span className="text-3xl">ms</span>
          </div>
          <div
            className="text-2xl font-semibold mb-6 px-4 py-1 rounded-full inline-block"
            style={{ backgroundColor: benchmark?.color + '30', color: benchmark?.color }}
          >
            {benchmark?.label}
          </div>

          <div className="flex gap-1 justify-center flex-wrap mb-6 max-w-md">
            {times.map((t, i) => (
              <div key={i} className="bg-white/10 px-2 py-1 rounded text-sm">
                {t}ms
              </div>
            ))}
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
