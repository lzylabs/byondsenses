'use client'

import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useSceneContext } from '@/providers/SceneProvider'
import { ParticleVoid } from './ParticleVoid'

// ─── Performance tier detection ──────────────────────────────────────────────
// Determines max particle count and render quality at mount time.

type PerformanceTier = 'low' | 'medium' | 'high'

function detectPerformanceTier(): PerformanceTier {
  if (typeof window === 'undefined') return 'high'
  const cores = navigator.hardwareConcurrency ?? 4
  const isMobile = /mobile|android|iphone|ipad|tablet/i.test(navigator.userAgent)
  if (isMobile || cores <= 4) return 'low'
  if (cores <= 8) return 'medium'
  return 'high'
}

export const PARTICLE_COUNT: Record<PerformanceTier, number> = {
  low: 8_000,
  medium: 18_000,
  high: 30_000,
}

// ─── Scene contents ───────────────────────────────────────────────────────────
// Lives inside the Canvas — has access to the R3F / Three.js context.

function SceneContents({ particleCount }: { particleCount: number }) {
  return (
    <>
      {/* Subtle fog softens particles at distance, enhances depth */}
      <fog attach="fog" args={['#000000', 60, 160]} />
      <ParticleVoid particleCount={particleCount} />
    </>
  )
}

// ─── Scene canvas ─────────────────────────────────────────────────────────────

export function Scene() {
  const [tier, setTier] = useState<PerformanceTier>('high')
  const [mounted, setMounted] = useState(false)
  const { cursorNDC } = useSceneContext()

  // Detect performance tier client-side only
  useEffect(() => {
    setTier(detectPerformanceTier())
    setMounted(true)
  }, [])

  // Track cursor / touch position → NDC coords for GLSL uniforms
  useEffect(() => {
    const toNDC = (clientX: number, clientY: number): [number, number] => [
      (clientX / window.innerWidth) * 2 - 1,
      -(clientY / window.innerHeight) * 2 + 1,
    ]

    const handleMouseMove = (e: MouseEvent) => {
      cursorNDC.current = toNDC(e.clientX, e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return
      const t = e.touches[0]
      cursorNDC.current = toNDC(t.clientX, t.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [cursorNDC])

  // Don't render canvas during SSR — Three.js is browser-only
  if (!mounted) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none', // clicks pass through to page content
      }}
    >
      <Canvas
        gl={{
          antialias: tier !== 'low',
          alpha: true,           // transparent so void black comes from CSS body
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        camera={{
          fov: 60,
          near: 0.1,
          far: 1000,
          position: [0, 0, 5],
        }}
        dpr={tier === 'low' ? [1, 1] : [1, 2]}
        performance={{ min: 0.5 }} // adaptive quality under load
        style={{ width: '100%', height: '100%' }}
      >
        <SceneContents particleCount={PARTICLE_COUNT[tier]} />

      </Canvas>
    </div>
  )
}
