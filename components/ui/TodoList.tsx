'use client'

import { useState } from 'react'

const STEPS = [
  { id:  1, label: 'SceneProvider + useScene',  done: true  },
  { id:  2, label: 'Canvas shell',              done: true  },
  { id:  3, label: 'Particle void (GLSL)',      done: true  },
  { id:  4, label: 'Postprocessing',            done: false },
  { id:  5, label: 'Weather theme',             done: false },
  { id:  6, label: 'Custom cursor',             done: true  },
  { id:  7, label: 'Intro loader',              done: false },
  { id:  8, label: 'Nav + Logo',                done: false },
  { id:  9, label: 'Home Z-depth scroll',       done: false },
  { id: 10, label: 'Inner pages',               done: false },
  { id: 11, label: 'Deploy to Vercel',          done: false },
]

const DONE_COUNT = STEPS.filter(s => s.done).length

export function TodoList() {
  const [open, setOpen] = useState(true)

  return (
    <div
      style={{
        position:      'fixed',
        bottom:        '1.5rem',
        right:         '1.5rem',
        zIndex:        9998,
        fontFamily:    'var(--font-mono)',
        fontSize:      '0.62rem',
        pointerEvents: 'auto',
        userSelect:    'none',
      }}
    >
      {open && (
        <div
          style={{
            background:    'rgba(3, 3, 12, 0.88)',
            border:        '1px solid rgba(0, 212, 255, 0.18)',
            borderRadius:  '5px',
            padding:       '0.8rem 1rem',
            marginBottom:  '0.4rem',
            backdropFilter:'blur(12px)',
            minWidth:      '210px',
          }}
        >
          {/* Header */}
          <div style={{
            color:         'rgba(0, 212, 255, 0.55)',
            letterSpacing: '0.18em',
            marginBottom:  '0.55rem',
            fontSize:      '0.58rem',
            textTransform: 'uppercase',
          }}>
            ── Mission Log ──
          </div>

          {/* Steps */}
          {STEPS.map(step => (
            <div
              key={step.id}
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        '0.45rem',
                padding:    '0.14rem 0',
                color:      step.done
                  ? 'rgba(0, 212, 255, 0.75)'
                  : 'rgba(148, 163, 184, 0.45)',
              }}
            >
              <span style={{ width: 10, flexShrink: 0 }}>
                {step.done ? '✓' : '○'}
              </span>
              <span>
                {String(step.id).padStart(2, '0')} {step.label}
              </span>
            </div>
          ))}

          {/* Progress bar */}
          <div style={{
            marginTop:    '0.6rem',
            paddingTop:   '0.5rem',
            borderTop:    '1px solid rgba(0, 212, 255, 0.1)',
          }}>
            <div style={{
              display:        'flex',
              justifyContent: 'space-between',
              color:          'rgba(0, 212, 255, 0.4)',
              fontSize:       '0.56rem',
              marginBottom:   '0.3rem',
            }}>
              <span>PROGRESS</span>
              <span>{DONE_COUNT}/{STEPS.length}</span>
            </div>
            <div style={{
              height:       '2px',
              background:   'rgba(0, 212, 255, 0.1)',
              borderRadius: '1px',
            }}>
              <div style={{
                height:       '100%',
                width:        `${(DONE_COUNT / STEPS.length) * 100}%`,
                background:   'linear-gradient(90deg, #00d4ff, #c084fc)',
                borderRadius: '1px',
                transition:   'width 0.6s ease',
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display:       'block',
          marginLeft:    'auto',
          background:    'rgba(3, 3, 12, 0.88)',
          border:        '1px solid rgba(0, 212, 255, 0.18)',
          borderRadius:  '4px',
          color:         'rgba(0, 212, 255, 0.55)',
          fontFamily:    'var(--font-mono)',
          fontSize:      '0.58rem',
          letterSpacing: '0.12em',
          padding:       '0.3rem 0.6rem',
          backdropFilter:'blur(12px)',
          textTransform: 'uppercase',
          cursor:        'none',
        }}
      >
        {open ? '× log' : '≡ log'}
      </button>
    </div>
  )
}
