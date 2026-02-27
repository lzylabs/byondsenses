'use client'

import { useEffect } from 'react'
import { useSceneContext } from '@/providers/SceneProvider'
import { SceneConfig, SCENE_PRESETS } from '@/types/scene'

/**
 * useScene — called at the top of every page component.
 *
 * Accepts either:
 *   - A named preset key: useScene('home')
 *   - A full or partial SceneConfig: useScene({ formation: 'orbit', colorTemp: 'purple' })
 *   - A preset key + overrides: useScene('work', { density: 0.8 })
 *
 * On mount: applies the config to the global SceneProvider.
 * On unmount: resets back to default so navigation feels clean.
 */
export function useScene(
  preset: keyof typeof SCENE_PRESETS | Partial<SceneConfig>,
  overrides?: Partial<SceneConfig>,
) {
  const { setConfig, resetConfig } = useSceneContext()

  useEffect(() => {
    let resolved: Partial<SceneConfig>

    if (typeof preset === 'string') {
      const base = SCENE_PRESETS[preset]
      resolved = overrides ? { ...base, ...overrides } : base
    } else {
      resolved = overrides ? { ...preset, ...overrides } : preset
    }

    setConfig(resolved)

    return () => {
      resetConfig()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally run once per mount — preset should be stable
}
