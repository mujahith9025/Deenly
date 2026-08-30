/**
 * ⚡ DEENLY HAPTICS & TACTILE FEEDBACK UTILITY
 * Provides smooth, battery-friendly haptic vibrations for buttons,
 * Tasbih counts, Ayah navigation, and goal celebrations.
 */

export const triggerHapticLight = () => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(12)
    } catch {
      // Ignore vibration errors on unsupported platforms
    }
  }
}

export const triggerHapticMedium = () => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(28)
    } catch {
      // Ignore vibration errors on unsupported platforms
    }
  }
}

export const triggerHapticSuccess = () => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([35, 60, 35])
    } catch {
      // Ignore vibration errors on unsupported platforms
    }
  }
}

export const triggerHapticWarning = () => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([50, 80, 50])
    } catch {
      // Ignore vibration errors on unsupported platforms
    }
  }
}
