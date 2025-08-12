import { useState, useEffect } from 'react'

type SidebarMode = 'expanded' | 'collapsed' | 'hidden'

interface LayoutState {
  mode: SidebarMode
  setMode: (mode: SidebarMode) => void
  cycle: () => void
}

const STORAGE_KEY = 'prep.sidebar.mode'

export function useLayoutState(): LayoutState {
  const [mode, setModeState] = useState<SidebarMode>('expanded')

  // Load initial state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && ['expanded', 'collapsed', 'hidden'].includes(stored)) {
        setModeState(stored as SidebarMode)
      }
    } catch (error) {
      console.warn('Failed to load sidebar state from localStorage:', error)
    }
  }, [])

  // Set mode and persist to localStorage
  const setMode = (newMode: SidebarMode) => {
    setModeState(newMode)
    try {
      localStorage.setItem(STORAGE_KEY, newMode)
    } catch (error) {
      console.warn('Failed to save sidebar state to localStorage:', error)
    }
  }

  // Toggle between expanded and hidden (skip collapsed for simplicity)
  const cycle = () => {
    if (mode === 'expanded') {
      setMode('hidden')
    } else {
      setMode('expanded')
    }
  }

  return {
    mode,
    setMode,
    cycle
  }
} 