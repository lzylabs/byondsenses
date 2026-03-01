'use client'

import { useEffect, useRef, useState } from 'react'

// ─── Event horizon shape ──────────────────────────────────────────────────────
// Always visible, always spinning. Click activates it — spins faster, flares.

function EventHorizon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width="48"
      height="48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        animation:       `bh-spin ${active ? '0.7s' : '4s'} linear infinite`,
        transformOrigin: 'center center',
        transform:       `scale(${active ? 1.18 : 1})`,
        transition:      'transform 0.15s ease',
      }}
    >
      <defs>
        {/* Outer glow — warm amber haze */}
        <radialGradient id="eh-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="transparent" />
          <stop offset="42%"  stopColor="transparent" />
          <stop offset="58%"  stopColor="#b8860b" stopOpacity={active ? 0.85 : 0.6} />
          <stop offset="74%"  stopColor="#8b6410" stopOpacity={active ? 0.45 : 0.28} />
          <stop offset="90%"  stopColor="#6b4c0a" stopOpacity={active ? 0.2  : 0.1}  />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>

        {/* Accretion disk — muted warm gold */}
        <linearGradient id="eh-disk" x1="0" y1="0.5" x2="1" y2="0.5">
          <stop offset="0%"   stopColor="transparent" />
          <stop offset="10%"  stopColor="#a06018" stopOpacity="0.7" />
          <stop offset="36%"  stopColor="#d4a030" stopOpacity={active ? 1.0 : 0.85} />
          <stop offset="64%"  stopColor="#d4a030" stopOpacity={active ? 1.0 : 0.85} />
          <stop offset="90%"  stopColor="#a06018" stopOpacity="0.7" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* Outer ambient glow */}
      <circle cx="24" cy="24" r="23" fill="url(#eh-glow)" />

      {/* Accretion disk crossing the core */}
      <ellipse
        cx="24" cy="24"
        rx="21" ry="3.5"
        fill="url(#eh-disk)"
        opacity={active ? 0.9 : 0.72}
      />

      {/* Event horizon ring — single, clean gold */}
      <circle
        cx="24" cy="24" r="16"
        fill="none"
        stroke="#c8a020"
        strokeWidth="2"
        opacity={active ? 0.95 : 0.75}
      />

      {/* Outer halo ring — very faint */}
      <circle
        cx="24" cy="24" r="18.5"
        fill="none"
        stroke="#8b6410"
        strokeWidth="0.8"
        opacity={active ? 0.5 : 0.3}
      />

      {/* Absolute black core */}
      <circle cx="24" cy="24" r="13" fill="#000000" />

      {/* Inner rim — barely visible warm gold */}
      <circle
        cx="24" cy="24" r="13"
        fill="none"
        stroke="#c8a020"
        strokeWidth="0.8"
        opacity={active ? 0.65 : 0.45}
      />
    </svg>
  )
}

// ─── Cursor component ─────────────────────────────────────────────────────────

export function Cursor() {
  const wrapRef     = useRef<HTMLDivElement>(null)
  const [isDown,    setIsDown]    = useState(false)
  const [visible,   setVisible]   = useState(false)
  const [isPointer, setIsPointer] = useState(false)

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
      <div style={{ marginLeft: -24, marginTop: -24 }}>
        <EventHorizon active={isDown} />
      </div>
    </div>
  )
}
