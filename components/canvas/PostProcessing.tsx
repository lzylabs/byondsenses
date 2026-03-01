'use client'

import { useEffect, useState } from 'react'
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

type Tier = 'low' | 'medium' | 'high'

function detectTier(): Tier {
  if (typeof window === 'undefined') return 'high'
  const cores    = navigator.hardwareConcurrency ?? 4
  const isMobile = /mobile|android|iphone|ipad|tablet/i.test(navigator.userAgent)
  if (isMobile || cores <= 4) return 'low'
  if (cores <= 8) return 'medium'
  return 'high'
}

// Shared chromatic aberration offset
const CA_OFFSET = new THREE.Vector2(0.0006, 0.0006)

// ─── Per-tier effect stacks ───────────────────────────────────────────────────

function LowEffects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={0.6} luminanceThreshold={0.15} luminanceSmoothing={0.9} mipmapBlur radius={0.75} />
      <Vignette blendFunction={BlendFunction.MULTIPLY} eskil={false} offset={0.3} darkness={0.85} />
    </EffectComposer>
  )
}

function MediumEffects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={1.0} luminanceThreshold={0.15} luminanceSmoothing={0.9} mipmapBlur radius={0.75} />
      <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={CA_OFFSET} radialModulation modulationOffset={0.15} />
      <Vignette blendFunction={BlendFunction.MULTIPLY} eskil={false} offset={0.3} darkness={0.85} />
    </EffectComposer>
  )
}

function HighEffects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={1.1} luminanceThreshold={0.15} luminanceSmoothing={0.9} mipmapBlur radius={0.75} />
      <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={CA_OFFSET} radialModulation modulationOffset={0.15} />
      <Noise blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.04} />
      <Vignette blendFunction={BlendFunction.MULTIPLY} eskil={false} offset={0.3} darkness={0.85} />
    </EffectComposer>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PostProcessing() {
  const [tier, setTier] = useState<Tier>('high')
  useEffect(() => { setTier(detectTier()) }, [])

  if (tier === 'low')    return <LowEffects />
  if (tier === 'medium') return <MediumEffects />
  return <HighEffects />
}
