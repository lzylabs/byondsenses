'use client'

import { SceneProvider } from './SceneProvider'
import { Scene } from '@/components/canvas/Scene'

/**
 * Providers — wraps the entire app with client-side context.
 *
 * Tree:
 *   <SceneProvider>        ← global particle scene state
 *     <Scene />            ← fixed full-screen canvas (z-index: 0)
 *     <div z-index: 10>   ← page content above the canvas
 *       {children}
 *     </div>
 *   </SceneProvider>
 *
 * Imported by the Server Component layout.tsx so fonts/metadata
 * remain on the server while all interactivity lives here.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SceneProvider>
      {/* Full-screen void canvas — always present across all pages */}
      <Scene />

      {/* All page content renders above the canvas */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </div>
    </SceneProvider>
  )
}
