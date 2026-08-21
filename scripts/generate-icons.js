import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Creates the Zoomed-In Regular App Icon:
 * - Rich cosmic midnight indigo gradient canvas (#1D163F to #0A0718)
 * - Large, bold, centered glowing lavender open book (BookOpen) filling ~70% of the canvas
 * - Crisp thick strokes and ambient purple glow for maximum recognition on mobile home screens
 */
function createZoomedDeenlyAppIconSvg(size, isMaskable = false) {
  const cornerRadius = isMaskable ? 0 : 112

  // For maskable icon, fit within Android 80% circle safe zone (scale 12.0)
  // For standard icon, make it large & bold (scale 14.8)
  const scale = isMaskable ? 12.0 : 14.8
  const iconWidth = 24 * scale
  const iconHeight = 24 * scale
  const posX = (512 - iconWidth) / 2
  const posY = (512 - iconHeight) / 2

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <defs>
    <!-- Rich Cosmic Gradient Canvas -->
    <radialGradient id="cosmicBg" cx="50%" cy="40%" r="80%">
      <stop offset="0%" stop-color="#2D215E"/>
      <stop offset="45%" stop-color="#1A133B"/>
      <stop offset="80%" stop-color="#100B25"/>
      <stop offset="100%" stop-color="#080514"/>
    </radialGradient>

    <!-- Book Lavender Glowing Gradient -->
    <linearGradient id="bookGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="30%" stop-color="#F5EEFF"/>
      <stop offset="65%" stop-color="#E2CCFF"/>
      <stop offset="100%" stop-color="#C49EFF"/>
    </linearGradient>

    <!-- Ambient Purple Glow -->
    <filter id="heroGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.5"/>
      <feDropShadow dx="0" dy="0" stdDeviation="28" flood-color="#8B5CF6" flood-opacity="0.6"/>
    </filter>

    <!-- Radial Soft Glow in center -->
    <radialGradient id="centerAura" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#7C3AED" stop-opacity="0.35"/>
      <stop offset="70%" stop-color="#7C3AED" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#7C3AED" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- App Background Canvas -->
  <rect width="512" height="512" rx="${cornerRadius}" fill="url(#cosmicBg)"/>

  <!-- Center Ambient Light Aura -->
  <circle cx="256" cy="256" r="220" fill="url(#centerAura)"/>

  <!-- 📖 Large Zoomed-In Hero BookOpen Symbol -->
  <g transform="translate(${posX.toFixed(1)}, ${posY.toFixed(1)}) scale(${scale.toFixed(2)})" 
     fill="none" 
     stroke="url(#bookGlow)" 
     stroke-width="2.2" 
     stroke-linecap="round" 
     stroke-linejoin="round"
     filter="url(#heroGlow)"
  >
    <!-- Left Page -->
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <!-- Right Page -->
    <path d="M22 3h-6a4 4 0 0 1-4 4v14a3 3 0 0 1 3-3h7z"/>
  </g>
</svg>`
}

async function run() {
  const publicDir = path.resolve(__dirname, '../public')
  const iconsDir = path.resolve(publicDir, 'icons')
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true })
  }

  console.log('Rendering zoomed-in Deenly hero app logo icons...')

  // 1. Standard 512x512
  const svg512 = createZoomedDeenlyAppIconSvg(512, false)
  await sharp(Buffer.from(svg512))
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-512x512.png'))
  console.log('✓ Created public/icons/icon-512x512.png (Zoomed in)')

  // 2. Standard 192x192
  await sharp(Buffer.from(svg512))
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-192x192.png'))
  console.log('✓ Created public/icons/icon-192x192.png (Zoomed in)')

  // 3. Apple Touch Icon 180x180
  await sharp(Buffer.from(svg512))
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'))
  console.log('✓ Created public/icons/apple-touch-icon.png (Zoomed in)')

  // 4. Maskable 512x512 (with safe zone margin)
  const svgMaskable = createZoomedDeenlyAppIconSvg(512, true)
  await sharp(Buffer.from(svgMaskable))
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'maskable-icon-512x512.png'))
  console.log('✓ Created public/icons/maskable-icon-512x512.png (Zoomed in)')

  // 5. Favicon SVG
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svg512)
  console.log('✓ Updated public/favicon.svg')

  console.log('🎉 Zoomed-in Deenly app icons generated successfully!')
}

run().catch(console.error)
