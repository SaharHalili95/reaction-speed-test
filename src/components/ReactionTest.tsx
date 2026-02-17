import { useState, useRef, useCallback, useEffect } from 'react'
import type { GamePhase } from '../types/game'
import { getBenchmark } from '../types/game'

interface Props {
  onResult: (time: number) => void
}

export default function ReactionTest({ onResult }: Props) {
  const [phase, setPhase] = useState<GamePhase>('idle')
  const [reactionTime, setReactionTime] = useState(0)
  const [round, setRound] = useState(0)
  const [times, setTimes] = useState<number[]>([])
  const timeoutRef = useRef<number>(0)
  const startRef = useRef<number>(0)

  const TOTAL_ROUNDS = 5

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  const startRound = useCallback(() => {
    setPhase('waiting')
    const delay = 1000 + Math.random() * 4000
    timeoutRef.current = window.setTimeout(() => {
      setPhase('ready')
      startRef.current = performance.now()
    }, delay)
  }, [])

  const handleClick = useCallback(() => {
    if (phase === 'idle') {
      setTimes([])
      setRound(1)
      startRound()
    } else if (phase === 'waiting') {
      clearTimeout(timeoutRef.current)
      setPhase('too-early')
    } else if (phase === 'ready') {
      const time = Math.round(performance.now() - startRef.current)
      setReactionTime(time)
      const newTimes = [...times, time]
      setTimes(newTimes)

      if (round >= TOTAL_ROUNDS) {
        const avg = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length)
        setReactionTime(avg)
        setPhase('result')
        onResult(avg)
      } else {
        setRound(r => r + 1)
        startRound()
      }
    } else if (phase === 'too-early') {
      startRound()
    } else if (phase === 'result') {
      setPhase('idle')
    }
  }, [phase, round, times, startRound, onResult])

  const bgColor = {
    idle: 'bg-blue-600',
    waiting: 'bg-red-500',
    ready: 'bg-green-500',
    playing: 'bg-blue-600',
    'too-early': 'bg-orange-500',
    result: 'bg-slate-800',
  }[phase]

  const benchmark = phase === 'result' ? getBenchmark('reaction', reactionTime) : null

  return (
    <div
      className={`${bgColor} min-h-[70vh] flex flex-col items-center justify-center cursor-pointer select-none rounded-2xl transition-colors duration-200 mx-4`}
      onClick={handleClick}
    >
      {phase === 'idle' && (
        <div className="text-center text-white px-6">
          <div className="text-6xl mb-6">⚡</div>
          <h2 className="text-3xl font-bold mb-3">Reaction Time</h2>
          <p className="text-xl opacity-90 mb-2">
            When the screen turns <span className="font-bold text-green-300">GREEN</span>, click as fast as you can!
          </p>
          <p className="text-lg opacity-70">{TOTAL_ROUNDS} rounds — we'll average your results</p>
          <div className="mt-8 bg-white/20 px-8 py-3 rounded-full text-xl font-semibold">
            Click to Start
          </div>
        </div>
      )}

      {phase === 'waiting' && (
        <div className="text-center text-white px-6">
          <div className="text-5xl mb-4">🔴</div>
          <h2 className="text-3xl font-bold mb-2">Wait for green...</h2>
          <p className="text-lg opacity-70">Round {round} of {TOTAL_ROUNDS}</p>
        </div>
      )}

      {phase === 'ready' && (
        <div className="text-center text-white px-6">
          <div className="text-5xl mb-4">🟢</div>
          <h2 className="text-4xl font-bold">CLICK NOW!</h2>
        </div>
      )}

      {phase === 'too-early' && (
        <div className="text-center text-white px-6">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-3xl font-bold mb-2">Too early!</h2>
          <p className="text-xl opacity-90 mb-4">Wait for the green screen</p>
          <div className="bg-white/20 px-8 py-3 rounded-full text-lg font-semibold">
            Click to try again
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div className="text-center text-white px-6">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-2xl font-semibold mb-2">Average Reaction Time</h2>
          <div className="text-7xl font-bold mb-2" style={{ color: benchmark?.color }}>
            {reactionTime}<span className="text-3xl">ms</span>
          </div>
          <div
            className="text-2xl font-semibold mb-6 px-4 py-1 rounded-full inline-block"
            style={{ backgroundColor: benchmark?.color + '30', color: benchmark?.color }}
          >
            {benchmark?.label}
          </div>

          <div className="flex gap-3 justify-center flex-wrap mb-6">
            {times.map((t, i) => (
              <div key={i} className="bg-white/10 px-3 py-2 rounded-lg">
                <div className="text-xs opacity-70">R{i + 1}</div>
                <div className="font-bold">{t}ms</div>
              </div>
            ))}
          </div>

          <div className="bg-white/20 px-8 py-3 rounded-full text-xl font-semibold">
            Click to Play Again
          </div>
        </div>
      )}
    </div>
  )
}
