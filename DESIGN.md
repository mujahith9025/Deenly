---
name: Serene Spiritual Interface
source_project: "projects/7966733937602393180"
title: "Deenly Quran Habit Tracker"
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#ccc3d8'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#958da1'
  outline-variant: '#4a4455'
  surface-tint: '#d2bbff'
  primary: '#d2bbff'
  on-primary: '#3f008e'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#732ee4'
  secondary: '#ccbeff'
  on-secondary: '#332664'
  secondary-container: '#4a3d7c'
  on-secondary-container: '#baabf3'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#007650'
  on-tertiary-container: '#76ffc2'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#e7deff'
  secondary-fixed-dim: '#ccbeff'
  on-secondary-fixed: '#1e0e4e'
  on-secondary-fixed-variant: '#4a3d7c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-quran:
    fontFamily: Noto Serif
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 180%
  display-quran-mobile:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 170%
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  container-margin: 24px
  gutter: 16px
  section-gap: 32px
  card-padding: 20px
---

# Deenly Design System (from Stitch)

## Brand & Style
The design system focuses on creating a meditative and focused environment for spiritual growth. The aesthetic is a blend of **Modern Minimalism** and **Glassmorphism**, utilizing deep atmospheric tones to reduce eye strain during long reading sessions. 

The brand personality is calm, encouraging, and premium. It avoids the clutter of traditional apps, opting instead for breathable layouts that prioritize the sacred text. Visual depth is achieved through translucent layers and subtle gradients that mimic the transition of dawn to dusk, fostering a sense of peace and consistency in the user's daily habit.

## Colors
The palette is centered around a **Deep Violet** core, symbolizing wisdom and spirituality. 

- **Primary:** A rich violet gradient (`#7c3aed` to `#d2bbff`) used for major actions and progress.
- **Secondary:** A soft lavender (`#ccbeff` / `#4a3d7c`) for accents and secondary labels.
- **Tertiary:** A vibrant emerald green (`#4edea3` / `#007650`) used exclusively for "Hasanat" metrics, streaks, and completion states.
- **Surface & Background:** Deep navy-slate (`#0b1326` background, `#171f33` surface-container, `#222a3d` high, `#2d3449` highest).

## Typography
Dual-typeface strategy:
1. **UI Text (`Plus Jakarta Sans`):** Modern, friendly, highly legible curves for navigation, metrics, buttons, and headers.
2. **Quranic Text (`Noto Serif`):** Classical serif typeface for Quranic Arabic script and translations with generous 1.7x - 1.8x line heights for tashkeel readability.

## Breakpoints
- **Mobile:** `< 640px` (Default / compact single column)
- **Tablet:** `640px – 1024px` (Dual-column / compact dashboard)
- **Desktop:** `> 1024px` (12-column layout with persistent sidebar, max 1200px container)

## Elevation & Depth
- **Level 1 (Base):** Solid `#0b1326` background.
- **Level 2 (Cards):** `#171f33` with 1px border (`#4a4455` or white at 10% opacity) and soft purple-tinted ambient glow.
- **Level 3 (Modals/Popups):** Higher contrast with 20px backdrop-blur.
