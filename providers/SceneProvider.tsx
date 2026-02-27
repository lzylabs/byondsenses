'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import { DEFAULT_SCENE_CONFIG, SceneConfig } from '@/types/scene'

// ─── Context shape ────────────────────────────────────────────────────────────

interface SceneContextValue {
  /** Current scene config — read by the canvas */
  config: SceneConfig
  /** Set the full config (pages call this via useScene) */
  setConfig: (config: Partial<SceneConfig>) => void
  /** Reset to default (called on page unmount by useScene) */
  resetConfig: () => void
  /**
   * Ref for cursor NDC coordinates [x, y] in range -1..1.
   * Updated every mousemove — ref avoids re-renders on every frame.
   */
  cursorNDC: React.MutableRefObject<[number, number]>
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SceneContext = createContext<SceneContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SceneProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<SceneConfig>(DEFAULT_SCENE_CONFIG)

  // Cursor position as NDC — updated by the canvas/cursor component, read by shaders
  const cursorNDC = useRef<[number, number]>([0, 0])

  const setConfig = useCallback((partial: Partial<SceneConfig>) => {
    setConfigState((prev) => ({ ...prev, ...partial }))
  }, [])

  const resetConfig = useCallback(() => {
    setConfigState(DEFAULT_SCENE_CONFIG)
  }, [])

  const value = useMemo(
    () => ({ config, setConfig, resetConfig, cursorNDC }),
    [config, setConfig, resetConfig, cursorNDC],
  )

  return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>
}

// ─── Internal hook (for canvas + cursor components) ───────────────────────────

export function useSceneContext(): SceneContextValue {
  const ctx = useContext(SceneContext)
  if (!ctx) {
    throw new Error('useSceneContext must be used inside <SceneProvider>')
  }
  return ctx
}
