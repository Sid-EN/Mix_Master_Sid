'use client'

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 5.5 + 2) % 100}%`,
  size: 3 + (i % 5) * 2,
  duration: 8 + (i % 7) * 2,
  delay: (i * 1.3) % 8,
  opacity: 0.15 + (i % 4) * 0.08,
}))

export default function HeroParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className="hero-particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: 0,
            ['--particle-opacity' as string]: p.opacity,
          }}
        />
      ))}
    </div>
  )
}
