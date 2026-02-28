'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSceneContext } from '@/providers/SceneProvider'
import { ColorTemp } from '@/types/scene'
import { vertexShader } from './shaders/particles.vert'
import { fragmentShader } from './shaders/particles.frag'

// ─── Formation name → shader index ───────────────────────────────────────────

const FORMATION_INDEX: Record<string, number> = {
  default:   0,
  cosmic:    1,
  scattered: 2,
  orbit:     3,
  grid:      4,
  pulse:     5,
  converge:  6,
}

// ─── Color temperature → [primary, secondary, rare] hex ──────────────────────

// Colors are intentionally muted/desaturated — particles should feel like
// distant light, not neon signs. Full saturation looked too noisy in practice.
const COLOR_PALETTES: Record<ColorTemp, [string, string, string]> = {
  cool:   ['#3ab5cc', '#7b5ea7', '#a98fc4'],   // muted cyan, soft violet, dusty lavender
  warm:   ['#c47a3a', '#b89060', '#d4b896'],   // amber, sand, pale gold
  purple: ['#7a4fa8', '#b06090', '#c4a0b8'],   // deep violet, rose, dusty pink
  gold:   ['#c8a84b', '#b87840', '#e0d0a0'],   // antique gold, bronze, cream
  ice:    ['#88aac8', '#7080b8', '#b0bcd8'],   // steel blue, slate, silver
  storm:  ['#5a3a8a', '#2a3868', '#6080a8'],   // deep purple, navy, electric blue
  rose:   ['#b85068', '#9060a0', '#c090b0'],   // muted rose, mauve, dusty pink
}

// ─── Transition state (mutable, lives outside React) ─────────────────────────

interface TransitionState {
  prevFormation:    number
  currentFormation: number
  progress:         number // 0→1
  duration:         number // ms
  active:           boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ParticleVoidProps {
  /** Total particle count — pre-scaled for device performance tier */
  particleCount: number
}

export function ParticleVoid({ particleCount }: ParticleVoidProps) {
  const { config, cursorNDC } = useSceneContext()

  // ── Transition ref ──────────────────────────────────────────────────────
  const transition = useRef<TransitionState>({
    prevFormation:    0,
    currentFormation: 0,
    progress:         1.0,
    duration:         1200,
    active:           false,
  })

  // ── Uniforms — created once, mutated in-place every frame ───────────────
  const uniforms = useRef({
    uTime:               { value: 0 },
    uFormation:          { value: 0 },
    uPrevFormation:      { value: 0 },
    uTransitionProgress: { value: 1.0 },
    uColorPrimary:       { value: new THREE.Color('#00d4ff') },
    uColorSecondary:     { value: new THREE.Color('#c084fc') },
    uColorRare:          { value: new THREE.Color('#f0abfc') },
    uCursorNDC:          { value: new THREE.Vector2(0, 0) },
    uCursorInfluence:    { value: 0.22 },
    uSpeed:              { value: 0.3 },
    uParticleSize:       { value: 0.5 },
    uDensity:            { value: 1.0 },
  })

  // ── Geometry — built once at mount ─────────────────────────────────────
  const geometry = useMemo(() => {
    const count = particleCount
    const geo   = new THREE.BufferGeometry()

    // Positions: all zero — vertex shader computes real positions
    const positions = new Float32Array(count * 3)

    // Per-particle random seeds [0,1]
    const offsets  = new Float32Array(count * 3)
    const sizes    = new Float32Array(count)
    const colorMix = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      offsets[i * 3]     = Math.random()
      offsets[i * 3 + 1] = Math.random()
      offsets[i * 3 + 2] = Math.random()

      sizes[i] = 0.4 + Math.random() * 1.6  // 0.4–2.0

      // 1.5% chance of rare particle, rest blend primary→secondary
      const r = Math.random()
      colorMix[i] = r < 0.015
        ? 0.92 + Math.random() * 0.08
        : Math.pow(Math.random(), 2.0) * 0.75  // bias toward primary color
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aOffset',   new THREE.BufferAttribute(offsets,  3))
    geo.setAttribute('aSize',     new THREE.BufferAttribute(sizes,    1))
    geo.setAttribute('aColorMix', new THREE.BufferAttribute(colorMix, 1))

    return geo
  }, [particleCount])

  // ── ShaderMaterial — created once ──────────────────────────────────────
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms:     uniforms.current,
    vertexShader,
    fragmentShader,
    transparent:  true,
    depthWrite:   false,
    precision:    'highp',
    // Additive blending: overlapping particles sum to brighter glow
    blending:     THREE.AdditiveBlending,
  }), []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── React to formation changes ─────────────────────────────────────────
  useEffect(() => {
    const newIdx = FORMATION_INDEX[config.formation] ?? 0
    const tr = transition.current
    if (newIdx === tr.currentFormation) return

    tr.prevFormation    = tr.currentFormation
    tr.currentFormation = newIdx
    tr.progress         = 0
    tr.duration         = config.transitionDuration
    tr.active           = true

    uniforms.current.uPrevFormation.value      = tr.prevFormation
    uniforms.current.uFormation.value          = tr.currentFormation
    uniforms.current.uTransitionProgress.value = 0
  }, [config.formation, config.transitionDuration])

  // ── React to color temperature changes ─────────────────────────────────
  useEffect(() => {
    const palette = COLOR_PALETTES[config.colorTemp]
    if (!palette) return
    uniforms.current.uColorPrimary.value.set(palette[0])
    uniforms.current.uColorSecondary.value.set(palette[1])
    uniforms.current.uColorRare.value.set(palette[2])
  }, [config.colorTemp])

  // ── React to scalar config changes ─────────────────────────────────────
  useEffect(() => {
    uniforms.current.uSpeed.value        = config.speed
    uniforms.current.uParticleSize.value = config.particleSize
    uniforms.current.uDensity.value      = config.density

    // Convert px cursor radius to NDC fraction (viewport half-width = 1 NDC unit)
    const ndcInfluence = config.cursorInfluence / (window.innerWidth * 0.5)
    uniforms.current.uCursorInfluence.value = ndcInfluence
  }, [config.speed, config.particleSize, config.density, config.cursorInfluence])

  // ── Animation loop ──────────────────────────────────────────────────────
  useFrame((state, delta) => {
    const u  = uniforms.current
    const tr = transition.current

    // Advance time
    u.uTime.value = state.clock.elapsedTime

    // Sync cursor (no allocation — mutates existing Vector2)
    u.uCursorNDC.value.set(cursorNDC.current[0], cursorNDC.current[1])

    // Advance formation transition
    if (tr.active) {
      tr.progress = Math.min(1.0, tr.progress + (delta * 1000) / tr.duration)
      // Ease in-out cubic
      const p = tr.progress
      const eased = p < 0.5
        ? 4 * p * p * p
        : 1 - Math.pow(-2 * p + 2, 3) / 2
      u.uTransitionProgress.value = eased
      if (tr.progress >= 1.0) tr.active = false
    }
  })

  return (
    <points geometry={geometry} material={material} frustumCulled={false} />
  )
}
