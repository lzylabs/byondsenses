'use client'

// Temporary placeholder — replaced in Step 9 with the full Z-depth experience.
// Transparent so the particle void canvas is visible behind it.

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
    }}>
      <p style={{
        fontFamily: 'var(--font-cinzel)',
        fontSize: 'clamp(0.7rem, 2vw, 1rem)',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: 'rgba(226, 232, 240, 0.35)',
      }}>
        Byond Senses
      </p>
    </div>
  )
}
