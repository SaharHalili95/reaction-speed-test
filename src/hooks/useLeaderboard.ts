import { useState, useCallback } from 'react'
import type { GameMode, LeaderboardEntry } from '../types/game'

const STORAGE_KEY = 'reaction-speed-leaderboard'
const MAX_ENTRIES_PER_MODE = 10

function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveLeaderboard(entries: LeaderboardEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // storage full or unavailable
  }
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(loadLeaderboard)

  const addEntry = useCallback((entry: LeaderboardEntry) => {
    setEntries(prev => {
      const modeEntries = prev.filter(e => e.mode === entry.mode)
      const otherEntries = prev.filter(e => e.mode !== entry.mode)

      const updatedModeEntries = [...modeEntries, entry]
        .sort((a, b) => a.time - b.time)
        .slice(0, MAX_ENTRIES_PER_MODE)

      const updated = [...otherEntries, ...updatedModeEntries]
      saveLeaderboard(updated)
      return updated
    })
  }, [])

  const getEntriesForMode = useCallback(
    (mode: GameMode): LeaderboardEntry[] => {
      return entries
        .filter(e => e.mode === mode)
        .sort((a, b) => a.time - b.time)
        .slice(0, MAX_ENTRIES_PER_MODE)
    },
    [entries]
  )

  const clearLeaderboard = useCallback(() => {
    setEntries([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { entries, addEntry, getEntriesForMode, clearLeaderboard }
}
