'use client'

import { useEffect, useRef, useState } from 'react'

// ─── UFO shape ────────────────────────────────────────────────────────────────

function UFOShape() {
  return (
    <svg viewBox="0 0 48 48" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ufo-dome" cx="40%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#d8f4ff" stopOpacity="0.95" />
          <stop offset="55%"  stopColor="#4090c0" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#183858" stopOpacity="0.6"  />
        </radialGradient>
        <radialGradient id="ufo-body" cx="50%" cy="22%" r="58%">
          <stop offset="0%"   stopColor="#e8f4fc" />
          <stop offset="45%"  stopColor="#5880a0" />
          <stop offset="100%" stopColor="#1a2e40" />
        </radialGradient>
        <linearGradient id="ufo-beam" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%"   stopColor="#00eeff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#00eeff" stopOpacity="0"   />
        </linearGradient>
      </defs>

      {/* Tractor beam */}
      <polygon points="19,33 29,33 37,48 11,48" fill="url(#ufo-beam)" />

      {/* Saucer body */}
      <ellipse cx="24" cy="30" rx="21" ry="6"   fill="url(#ufo-body)" />
      <ellipse cx="24" cy="29" rx="20" ry="4.5" fill="none" stroke="rgba(180,220,255,0.3)" strokeWidth="1" />

      {/* Glass dome */}
      <path d="M 15 29 Q 15 14 24 14 Q 33 14 33 29 Z" fill="url(#ufo-dome)" />
      <path d="M 15 29 Q 15 14 24 14 Q 33 14 33 29"   fill="none" stroke="rgba(140,200,240,0.55)" strokeWidth="0.6" />

      {/* Rim lights — alternating cyan / purple */}
      <circle cx="6"  cy="30" r="1.5" fill="#00ffee" opacity="0.95" />
      <circle cx="12" cy="33" r="1.5" fill="#c084fc" opacity="0.95" />
      <circle cx="19" cy="35" r="1.5" fill="#00ffee" opacity="0.95" />
      <circle cx="29" cy="35" r="1.5" fill="#c084fc" opacity="0.95" />
      <circle cx="36" cy="33" r="1.5" fill="#00ffee" opacity="0.95" />
      <circle cx="42" cy="30" r="1.5" fill="#c084fc" opacity="0.95" />
    </svg>
  )
}

// ─── Black hole shape ─────────────────────────────────────────────────────────

function BlackHoleShape() {
  return (
    <svg viewBox="0 0 48 48" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bh-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="transparent" />
          <stop offset="44%"  stopColor="transparent" />
          <stop offset="60%"  stopColor="#7c3aed" stopOpacity="0.9" />
          <stop offset="76%"  stopColor="#c084fc" stopOpacity="0.45" />
          <stop offset="90%"  stopColor="#f0abfc" stopOpacity="0.15" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="bh-disk" x1="0" y1="0.5" x2="1" y2="0.5">
          <stop offset="0%"   stopColor="transparent" />
          <stop offset="12%"  stopColor="#f97316" stopOpacity="0.8" />
          <stop offset="38%"  stopColor="#fbbf24" stopOpacity="1.0" />
          <stop offset="62%"  stopColor="#fbbf24" stopOpacity="1.0" />
          <stop offset="88%"  stopColor="#f97316" stopOpacity="0.8" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* Outer event horizon glow */}
      <circle cx="24" cy="24" r="23" fill="url(#bh-glow)" />

      {/* Accretion disk (hot orange ring crossing the hole) */}
      <ellipse cx="24" cy="24" rx="22" ry="4" fill="url(#bh-disk)" opacity="0.85" />

      {/* Event horizon rings */}
      <circle cx="24" cy="24" r="17" fill="none" stroke="#7c3aed" strokeWidth="2.5" opacity="0.85" />
      <circle cx="24" cy="24" r="19" fill="none" stroke="#4f46e5" strokeWidth="1"   opacity="0.4"  />

      {/* Dark core — absolute black */}
      <circle cx="24" cy="24" r="14" fill="#000000" />

      {/* Inner edge glow */}
      <circle cx="24" cy="24" r="14" fill="none" stroke="#c084fc" strokeWidth="1" opacity="0.7" />
    </svg>
  )
}

// ─── Cursor component ─────────────────────────────────────────────────────────

export function Cursor() {
  const wrapRef   = useRef<HTMLDivElement>(null)
  const [isDown,   setIsDown]   = useState(false)
  const [visible,  setVisible]  = useState(false)
  const [isPointer, setIsPointer] = useState(false)

  // Detect mouse device on mount (skip on touch-only)
  useEffect(() => {
    setIsPointer(window.matchMedia('(pointer: fine)').matches)
  }, [])

  useEffect(() => {
    if (!isPointer) return
    const el = wrapRef.current
    if (!el) return

    let rafId: number
    let x = -200, y = -200

    const move  = (e: MouseEvent) => { x = e.clientX; y = e.clientY }
    const down  = () => setIsDown(true)
    const up    = () => setIsDown(false)
    const enter = () => setVisible(true)
    const leave = () => setVisible(false)

    // RAF loop: update position directly on DOM — zero React re-renders per frame
    const tick = () => {
      el.style.transform = `translate(${x}px, ${y}px)`
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    window.addEventListener('mousemove',  move,  { passive: true })
    window.addEventListener('mousedown',  down)
    window.addEventListener('mouseup',    up)
    document.documentElement.addEventListener('mouseenter', enter)
    document.documentElement.addEventListener('mouseleave', leave)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove',  move)
      window.removeEventListener('mousedown',  down)
      window.removeEventListener('mouseup',    up)
      document.documentElement.removeEventListener('mouseenter', enter)
      document.documentElement.removeEventListener('mouseleave', leave)
    }
  }, [isPointer])

  if (!isPointer) return null

  return (
    <div
      ref={wrapRef}
      style={{
        position:      'fixed',
        top:           0,
        left:          0,
        pointerEvents: 'none',
        zIndex:        99999,
        willChange:    'transform',
        opacity:       visible ? 1 : 0,
        transition:    'opacity 0.3s',
      }}
    >
      {/* Center the cursor on the mouse point */}
      <div style={{ position: 'relative', marginLeft: -24, marginTop: -30 }}>

        {/* UFO — visible when not clicking */}
        <div style={{
          position:   'absolute',
          top: 0, left: 0,
          opacity:    isDown ? 0 : 1,
          transition: 'opacity 0.15s ease',
        }}>
          <UFOShape />
        </div>

        {/* Black hole — visible on click, spins */}
        <div style={{
          position:           'absolute',
          top: 0, left: 0,
          opacity:            isDown ? 1 : 0,
          transition:         'opacity 0.15s ease',
          animation:          isDown ? 'bh-spin 1.8s linear infinite' : 'none',
          transformOrigin:    'center center',
        }}>
          <BlackHoleShape />
        </div>

        {/* Invisible spacer so parent has layout size */}
        <div style={{ width: 48, height: 48, visibility: 'hidden' }} />
      </div>
    </div>
  )
}
