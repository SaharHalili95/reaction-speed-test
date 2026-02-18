import { useState, useRef, useCallback, useEffect } from 'react'
import type { GamePhase } from '../types/game'
import { getBenchmark } from '../types/game'

type MultiplayerPhase = 'setup' | 'playing' | 'results'

interface PlayerData {
  name: string
  times: number[]
  currentRound: number
}

const TOTAL_ROUNDS = 5

export default function MultiplayerMode() {
  const [mpPhase, setMpPhase] = useState<MultiplayerPhase>('setup')
  const [player1, setPlayer1] = useState<PlayerData>({ name: 'Player 1', times: [], currentRound: 0 })
  const [player2, setPlayer2] = useState<PlayerData>({ name: 'Player 2', times: [], currentRound: 0 })
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1)
  const [gamePhase, setGamePhase] = useState<GamePhase>('idle')
  const timeoutRef = useRef<number>(0)
  const startRef = useRef<number>(0)
  const [name1Input, setName1Input] = useState('Player 1')
  const [name2Input, setName2Input] = useState('Player 2')

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  const currentPlayer = activePlayer === 1 ? player1 : player2
  const setCurrentPlayer = activePlayer === 1 ? setPlayer1 : setPlayer2

  const startRound = useCallback(() => {
    setGamePhase('waiting')
    const delay = 1000 + Math.random() * 4000
    timeoutRef.current = window.setTimeout(() => {
      setGamePhase('ready')
      startRef.current = performance.now()
    }, delay)
  }, [])

  const handleStartGame = useCallback(() => {
    setPlayer1({ name: name1Input || 'Player 1', times: [], currentRound: 0 })
    setPlayer2({ name: name2Input || 'Player 2', times: [], currentRound: 0 })
    setActivePlayer(1)
    setMpPhase('playing')
    setGamePhase('idle')
  }, [name1Input, name2Input])

  const handleClick = useCallback(() => {
    if (gamePhase === 'idle') {
      setCurrentPlayer(prev => ({ ...prev, currentRound: 1 }))
      startRound()
    } else if (gamePhase === 'waiting') {
      clearTimeout(timeoutRef.current)
      setGamePhase('too-early')
    } else if (gamePhase === 'ready') {
      const time = Math.round(performance.now() - startRef.current)
      const newTimes = [...currentPlayer.times, time]
      setCurrentPlayer(prev => ({
        ...prev,
        times: newTimes,
        currentRound: prev.currentRound + 1,
      }))

      if (newTimes.length >= TOTAL_ROUNDS) {
        setGamePhase('result')
      } else {
        startRound()
      }
    } else if (gamePhase === 'too-early') {
      startRound()
    } else if (gamePhase === 'result') {
      if (activePlayer === 1) {
        setActivePlayer(2)
        setGamePhase('idle')
      } else {
        setMpPhase('results')
      }
    }
  }, [gamePhase, currentPlayer, activePlayer, setCurrentPlayer, startRound])

  const handlePlayAgain = useCallback(() => {
    setMpPhase('setup')
    setGamePhase('idle')
    setActivePlayer(1)
  }, [])

  // Setup phase - enter names
  if (mpPhase === 'setup') {
    return (
      <div className="bg-purple-600 min-h-[70vh] flex flex-col items-center justify-center rounded-2xl mx-4">
        <div className="text-center text-white px-6 w-full max-w-md">
          <div className="text-6xl mb-6">🤝</div>
          <h2 className="text-3xl font-bold mb-6">Multiplayer Mode</h2>
          <p className="text-lg opacity-90 mb-8">
            Two players take turns playing {TOTAL_ROUNDS} rounds of reaction time test
          </p>

          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Player 1 Name</label>
              <input
                type="text"
                value={name1Input}
                onChange={e => setName1Input(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/50 text-center text-lg font-semibold"
                placeholder="Player 1"
                maxLength={20}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Player 2 Name</label>
              <input
                type="text"
                value={name2Input}
                onChange={e => setName2Input(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/50 text-center text-lg font-semibold"
                placeholder="Player 2"
                maxLength={20}
              />
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="bg-white/20 hover:bg-white/30 px-8 py-3 rounded-full text-xl font-semibold transition-colors cursor-pointer"
          >
            Start Game
          </button>
        </div>
      </div>
    )
  }

  // Results phase - comparison
  if (mpPhase === 'results') {
    const p1Avg = player1.times.length > 0
      ? Math.round(player1.times.reduce((a, b) => a + b, 0) / player1.times.length)
      : 0
    const p2Avg = player2.times.length > 0
      ? Math.round(player2.times.reduce((a, b) => a + b, 0) / player2.times.length)
      : 0
    const p1Best = player1.times.length > 0 ? Math.min(...player1.times) : 0
    const p2Best = player2.times.length > 0 ? Math.min(...player2.times) : 0
    const winner = p1Avg < p2Avg ? player1.name : p2Avg < p1Avg ? player2.name : null
    const p1Benchmark = getBenchmark('reaction', p1Avg)
    const p2Benchmark = getBenchmark('reaction', p2Avg)

    return (
      <div className="bg-slate-800 min-h-[70vh] flex flex-col items-center justify-center rounded-2xl mx-4 py-8">
        <div className="text-center text-white px-6 w-full max-w-lg">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-3xl font-bold mb-2">Results</h2>

          {winner ? (
            <div className="text-2xl font-bold text-yellow-400 mb-6">
              {winner} wins!
            </div>
          ) : (
            <div className="text-2xl font-bold text-yellow-400 mb-6">
              It's a tie!
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Player 1 */}
            <div className={`bg-white/5 rounded-2xl p-6 border-2 ${
              winner === player1.name ? 'border-yellow-400' : 'border-transparent'
            }`}>
              <h3 className="text-xl font-bold mb-4">{player1.name}</h3>
              <div className="text-4xl font-bold mb-1" style={{ color: p1Benchmark.color }}>
                {p1Avg}<span className="text-lg">ms</span>
              </div>
              <div
                className="text-sm font-semibold mb-4 px-3 py-0.5 rounded-full inline-block"
                style={{ backgroundColor: p1Benchmark.color + '30', color: p1Benchmark.color }}
              >
                {p1Benchmark.label}
              </div>
              <div className="text-sm text-white/60 mb-3">Average</div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-sm text-white/60 mb-1">Best</div>
                <div className="text-xl font-bold text-green-400">{p1Best}ms</div>
              </div>
              <div className="flex gap-1 justify-center flex-wrap mt-3">
                {player1.times.map((t, i) => (
                  <div key={i} className="bg-white/10 px-2 py-1 rounded text-xs">
                    R{i + 1}: {t}ms
                  </div>
                ))}
              </div>
            </div>

            {/* Player 2 */}
            <div className={`bg-white/5 rounded-2xl p-6 border-2 ${
              winner === player2.name ? 'border-yellow-400' : 'border-transparent'
            }`}>
              <h3 className="text-xl font-bold mb-4">{player2.name}</h3>
              <div className="text-4xl font-bold mb-1" style={{ color: p2Benchmark.color }}>
                {p2Avg}<span className="text-lg">ms</span>
              </div>
              <div
                className="text-sm font-semibold mb-4 px-3 py-0.5 rounded-full inline-block"
                style={{ backgroundColor: p2Benchmark.color + '30', color: p2Benchmark.color }}
              >
                {p2Benchmark.label}
              </div>
              <div className="text-sm text-white/60 mb-3">Average</div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-sm text-white/60 mb-1">Best</div>
                <div className="text-xl font-bold text-green-400">{p2Best}ms</div>
              </div>
              <div className="flex gap-1 justify-center flex-wrap mt-3">
                {player2.times.map((t, i) => (
                  <div key={i} className="bg-white/10 px-2 py-1 rounded text-xs">
                    R{i + 1}: {t}ms
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handlePlayAgain}
            className="bg-purple-600 hover:bg-purple-500 px-8 py-3 rounded-full text-xl font-semibold transition-colors cursor-pointer"
          >
            Play Again
          </button>
        </div>
      </div>
    )
  }

  // Playing phase
  const bgColor = {
    idle: 'bg-purple-600',
    waiting: 'bg-red-500',
    ready: 'bg-green-500',
    playing: 'bg-purple-600',
    'too-early': 'bg-orange-500',
    result: 'bg-slate-800',
  }[gamePhase]

  const playerAvg = currentPlayer.times.length > 0
    ? Math.round(currentPlayer.times.reduce((a, b) => a + b, 0) / currentPlayer.times.length)
    : 0
  const playerBenchmark = gamePhase === 'result' ? getBenchmark('reaction', playerAvg) : null

  return (
    <div
      className={`${bgColor} min-h-[70vh] flex flex-col items-center justify-center cursor-pointer select-none rounded-2xl transition-colors duration-200 mx-4 relative`}
      onClick={handleClick}
    >
      {/* Player indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/20 text-white px-6 py-2 rounded-full font-semibold text-lg z-10">
        {currentPlayer.name}'s Turn
      </div>

      {gamePhase === 'idle' && (
        <div className="text-center text-white px-6">
          <div className="text-6xl mb-6">⚡</div>
          <h2 className="text-3xl font-bold mb-3">{currentPlayer.name}'s Turn</h2>
          <p className="text-xl opacity-90 mb-2">
            When the screen turns <span className="font-bold text-green-300">GREEN</span>, click as fast as you can!
          </p>
          <p className="text-lg opacity-70">{TOTAL_ROUNDS} rounds</p>
          <div className="mt-8 bg-white/20 px-8 py-3 rounded-full text-xl font-semibold">
            Click to Start
          </div>
        </div>
      )}

      {gamePhase === 'waiting' && (
        <div className="text-center text-white px-6 mt-8">
          <div className="text-5xl mb-4">🔴</div>
          <h2 className="text-3xl font-bold mb-2">Wait for green...</h2>
          <p className="text-lg opacity-70">
            {currentPlayer.name} — Round {currentPlayer.times.length + 1} of {TOTAL_ROUNDS}
          </p>
        </div>
      )}

      {gamePhase === 'ready' && (
        <div className="text-center text-white px-6">
          <div className="text-5xl mb-4">🟢</div>
          <h2 className="text-4xl font-bold">CLICK NOW!</h2>
        </div>
      )}

      {gamePhase === 'too-early' && (
        <div className="text-center text-white px-6 mt-8">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-3xl font-bold mb-2">Too early!</h2>
          <p className="text-xl opacity-90 mb-4">Wait for the green screen</p>
          <div className="bg-white/20 px-8 py-3 rounded-full text-lg font-semibold">
            Click to try again
          </div>
        </div>
      )}

      {gamePhase === 'result' && (
        <div className="text-center text-white px-6 mt-8">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-2xl font-semibold mb-2">{currentPlayer.name} — Done!</h2>
          <div className="text-5xl font-bold mb-2" style={{ color: playerBenchmark?.color }}>
            {playerAvg}
            <span className="text-2xl">ms</span>
          </div>
          <div
            className="text-xl font-semibold mb-4 px-4 py-1 rounded-full inline-block"
            style={{ backgroundColor: playerBenchmark?.color + '30', color: playerBenchmark?.color }}
          >
            {playerBenchmark?.label}
          </div>

          <div className="flex gap-3 justify-center flex-wrap mb-6">
            {currentPlayer.times.map((t, i) => (
              <div key={i} className="bg-white/10 px-3 py-2 rounded-lg">
                <div className="text-xs opacity-70">R{i + 1}</div>
                <div className="font-bold">{t}ms</div>
              </div>
            ))}
          </div>

          <div className="bg-white/20 px-8 py-3 rounded-full text-xl font-semibold">
            {activePlayer === 1 ? `Next: ${player2.name}` : 'See Results'}
          </div>
        </div>
      )}
    </div>
  )
}
