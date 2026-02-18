export type GameMode = 'reaction' | 'target' | 'sequence'

export type GamePhase = 'idle' | 'waiting' | 'ready' | 'playing' | 'result' | 'too-early'

export interface GameResult {
  mode: GameMode
  time: number
  date: string
}

export interface TargetPosition {
  x: number
  y: number
  id: number
}

export interface Stats {
  best: number
  average: number
  last10Average: number
  totalGames: number
}

export interface LeaderboardEntry {
  playerName: string
  time: number
  date: string
  mode: GameMode
}

export const BENCHMARKS = {
  reaction: [
    { label: 'Incredible', max: 150, color: '#a855f7' },
    { label: 'Fast', max: 220, color: '#22c55e' },
    { label: 'Average', max: 300, color: '#eab308' },
    { label: 'Slow', max: 400, color: '#f97316' },
    { label: 'Sleepy', max: Infinity, color: '#ef4444' },
  ],
  target: [
    { label: 'Incredible', max: 350, color: '#a855f7' },
    { label: 'Fast', max: 500, color: '#22c55e' },
    { label: 'Average', max: 650, color: '#eab308' },
    { label: 'Slow', max: 800, color: '#f97316' },
    { label: 'Sleepy', max: Infinity, color: '#ef4444' },
  ],
  sequence: [
    { label: 'Incredible', max: 8000, color: '#a855f7' },
    { label: 'Fast', max: 12000, color: '#22c55e' },
    { label: 'Average', max: 18000, color: '#eab308' },
    { label: 'Slow', max: 25000, color: '#f97316' },
    { label: 'Sleepy', max: Infinity, color: '#ef4444' },
  ],
} as const

export function getBenchmark(mode: GameMode, time: number) {
  return BENCHMARKS[mode].find(b => time < b.max) || BENCHMARKS[mode][BENCHMARKS[mode].length - 1]
}

export function getStats(results: GameResult[], mode: GameMode): Stats {
  const modeResults = results.filter(r => r.mode === mode)
  if (modeResults.length === 0) {
    return { best: 0, average: 0, last10Average: 0, totalGames: 0 }
  }
  const times = modeResults.map(r => r.time)
  const last10 = times.slice(-10)
  return {
    best: Math.min(...times),
    average: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
    last10Average: Math.round(last10.reduce((a, b) => a + b, 0) / last10.length),
    totalGames: modeResults.length,
  }
}
