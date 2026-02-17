import { useState, useCallback } from 'react'
import type { GameResult } from '../types/game'

const STORAGE_KEY = 'reaction-speed-history'

function loadHistory(): GameResult[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveHistory(results: GameResult[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results))
  } catch {
    // storage full or unavailable
  }
}

export function useHistory() {
  const [results, setResults] = useState<GameResult[]>(loadHistory)

  const addResult = useCallback((result: GameResult) => {
    setResults(prev => {
      const updated = [...prev, result]
      saveHistory(updated)
      return updated
    })
  }, [])

  const clearHistory = useCallback(() => {
    setResults([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { results, addResult, clearHistory }
}
