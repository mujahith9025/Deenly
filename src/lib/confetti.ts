import confetti from 'canvas-confetti'

/**
 * 🌟 Dual-cannon Golden & Emerald Confetti Explosion
 * Fires from both bottom corners toward the center with radiant gold, amber, emerald, and celestial purple sparkles.
 */
export function triggerGoldenConfetti() {
  if (typeof window === 'undefined') return

  const count = 180
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  }

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    })
  }

  // 1. Core gold & amber starburst
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#fbbf24', '#f59e0b', '#ffd700', '#fef08a'],
    shapes: ['star', 'circle'],
    scalar: 1.2,
  })

  // 2. High velocity emerald & gold spread
  fire(0.2, {
    spread: 60,
    colors: ['#10b981', '#34d399', '#f59e0b', '#fbbf24'],
    shapes: ['circle', 'square'],
  })

  // 3. Wide celestial purple and golden rain
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.9,
    colors: ['#8b5cf6', '#a855f7', '#ffd700', '#10b981'],
    shapes: ['star', 'circle'],
  })

  // 4. Fine glittering sparks
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    colors: ['#ffffff', '#fef08a', '#ffd700'],
    shapes: ['circle'],
    scalar: 0.7,
  })

  // 5. High arching finale
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#f59e0b', '#10b981', '#c084fc'],
    shapes: ['star'],
    scalar: 1.4,
  })
}

/**
 * 🌟 Golden Starburst Cannon
 * A high-intensity burst of golden stars exploding from the center.
 */
export function triggerStarBurst(originX = 0.5, originY = 0.5) {
  if (typeof window === 'undefined') return

  confetti({
    particleCount: 80,
    spread: 360,
    startVelocity: 35,
    ticks: 160,
    origin: { x: originX, y: originY },
    colors: ['#ffd700', '#fbbf24', '#f59e0b', '#fef08a', '#ffffff'],
    shapes: ['star'],
    scalar: 1.3,
    zIndex: 9999,
  })
}

/**
 * 🌟 Left & Right Dual Side Cannons
 */
export function triggerSideCannons() {
  if (typeof window === 'undefined') return

  const end = Date.now() + 1200
  const colors = ['#ffd700', '#10b981', '#8b5cf6', '#fbbf24']

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors,
      shapes: ['star', 'circle'],
      zIndex: 9999,
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors,
      shapes: ['star', 'circle'],
      zIndex: 9999,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  frame()
}
