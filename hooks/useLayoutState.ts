import { useState, useEffect } from 'react'

type SidebarMode = 'expanded' | 'collapsed' | 'hidden'
type VisibleSize = 'expanded' | 'collapsed'

interface LayoutState {
  mode: SidebarMode
  setMode: (mode: SidebarMode) => void
  cycle: () => void
  setVisibleSize: (size: VisibleSize) => void
  lastVisible: VisibleSize
}

const STORAGE_KEY = 'prep.sidebar.mode'
const STORAGE_KEY_LAST = 'prep.sidebar.lastVisible'

export function useLayoutState(): LayoutState {
  const [mode, setModeState] = useState<SidebarMode>('expanded')
  const [lastVisible, setLastVisible] = useState<VisibleSize>('expanded')

  // Load initial state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && ['expanded', 'collapsed', 'hidden'].includes(stored)) {
        setModeState(stored as SidebarMode)
      }
      const storedLast = localStorage.getItem(STORAGE_KEY_LAST)
      if (storedLast && ['expanded','collapsed'].includes(storedLast)) {
        setLastVisible(storedLast as VisibleSize)
      }
    } catch (error) {
      console.warn('Failed to load sidebar state from localStorage:', error)
    }
    // Sync across tabs/components via storage + custom event
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && ['expanded','collapsed','hidden'].includes(e.newValue)) {
        setModeState(e.newValue as SidebarMode)
      }
      if (e.key === STORAGE_KEY_LAST && e.newValue && ['expanded','collapsed'].includes(e.newValue)) {
        setLastVisible(e.newValue as VisibleSize)
      }
    }
    const onCustom = (e: Event) => {
      try {
        const ce = e as CustomEvent
        const { key, value } = (ce.detail || {}) as { key: string; value: string }
        if (key === STORAGE_KEY && value && ['expanded','collapsed','hidden'].includes(value)) setModeState(value as SidebarMode)
        if (key === STORAGE_KEY_LAST && value && ['expanded','collapsed'].includes(value)) setLastVisible(value as VisibleSize)
      } catch {}
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('prep:sidebar-sync', onCustom as EventListener)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('prep:sidebar-sync', onCustom as EventListener)
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
    if (newMode !== 'hidden') {
      setLastVisible(newMode)
      try { localStorage.setItem(STORAGE_KEY_LAST, newMode) } catch {}
      try { window.dispatchEvent(new CustomEvent('prep:sidebar-sync', { detail: { key: STORAGE_KEY_LAST, value: newMode } })) } catch {}
    }
    try { window.dispatchEvent(new CustomEvent('prep:sidebar-sync', { detail: { key: STORAGE_KEY, value: newMode } })) } catch {}
  }

  // Toggle size between expanded and collapsed (header open/close)
  const cycle = () => {
    if (mode === 'expanded') setMode('collapsed')
    else if (mode === 'collapsed') setMode('expanded')
    else {
      // If currently hidden, restore to last preferred size
      setMode(lastVisible)
    }
  }

  // Adjust size when visible; if hidden, only remember preference
  const setVisibleSize = (size: VisibleSize) => {
    try { localStorage.setItem(STORAGE_KEY_LAST, size) } catch {}
    setLastVisible(size)
    try { window.dispatchEvent(new CustomEvent('prep:sidebar-sync', { detail: { key: STORAGE_KEY_LAST, value: size } })) } catch {}
    if (mode !== 'hidden') setMode(size)
  }

  return {
    mode,
    setMode,
    cycle,
    setVisibleSize,
    lastVisible
  }
} 