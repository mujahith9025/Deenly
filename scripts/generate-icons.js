import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 🌙 Deenly Cosmic Quran & Crescent Icon
function createDeenlySvg(size, isMaskable = false) {
  const padding = isMaskable ? size * 0.15 : 0
  const innerSize = size - padding * 2
  const center = size / 2

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <defs>
    <!-- Cosmic Background Gradient -->
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#122538"/>
      <stop offset="60%" stop-color="#09131E"/>
      <stop offset="100%" stop-color="#04080D"/>
    </radialGradient>

    <!-- Emerald Aura Glow -->
    <radialGradient id="emeraldGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="#059669" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#047857" stop-opacity="0"/>
    </radialGradient>

    <!-- Gold Crescent Gradient -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="30%" stop-color="#F59E0B"/>
      <stop offset="70%" stop-color="#D97706"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>

    <!-- Emerald Star / Accent Gradient -->
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6EE7B7"/>
      <stop offset="50%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>

    <!-- Quran Book Gradient -->
    <linearGradient id="quranGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="60%" stop-color="#E2E8F0"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>

    <!-- Drop Shadow Filter -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Base Rounded Rectangle for App Icon -->
  <rect width="512" height="512" rx="${isMaskable ? '0' : '112'}" fill="url(#bgGrad)"/>

  <!-- Cosmic Stars / Sparkles in Background -->
  <circle cx="110" cy="130" r="3" fill="#6EE7B7" opacity="0.6"/>
  <circle cx="410" cy="120" r="2.5" fill="#FDE68A" opacity="0.7"/>
  <circle cx="390" cy="380" r="3" fill="#6EE7B7" opacity="0.5"/>
  <circle cx="130" cy="390" r="2" fill="#FDE68A" opacity="0.6"/>
  <circle cx="90" cy="270" r="1.5" fill="#FFFFFF" opacity="0.4"/>
  <circle cx="430" cy="250" r="2" fill="#FFFFFF" opacity="0.5"/>

  <!-- Radial Glow Behind Crescent -->
  <circle cx="256" cy="235" r="160" fill="url(#emeraldGlow)"/>

  <g transform="${isMaskable ? 'translate(25.6, 25.6) scale(0.9)' : ''}">
    <!-- 🌙 Elegant Golden Crescent Moon -->
    <path d="M 275 105 
             C 335 118, 385 168, 388 232 
             C 392 305, 335 365, 260 368 
             C 215 370, 172 348, 145 315 
             C 178 335, 222 342, 260 330 
             C 315 312, 350 258, 340 200 
             C 332 155, 305 120, 275 105 Z" 
          fill="url(#goldGrad)" 
          filter="url(#glow)" />

    <!-- ✨ 8-Point Islamic Star (Khatim) inside Crescent -->
    <g transform="translate(295, 185) scale(0.95)">
      <!-- Outer diamond -->
      <polygon points="0,-24 17,-17 24,0 17,17 0,24 -17,17 -24,0 -17,-17" fill="url(#emeraldGrad)"/>
      <!-- Inner rotated square diamond -->
      <polygon points="0,-24 7,-7 24,0 7,7 0,24 -7,7 -24,0 -7,-7" fill="#FDE68A"/>
      <!-- Center light dot -->
      <circle cx="0" cy="0" r="4" fill="#FFFFFF"/>
    </g>

    <!-- 📖 Stylized Open Quran (Rehal / Pages) at Bottom Center -->
    <g transform="translate(256, 355) scale(1)">
      <!-- Left Page -->
      <path d="M -8 -15 
               C -40 -35, -80 -25, -100 -5 
               C -90 10, -50 0, -8 15 Z" 
            fill="url(#quranGrad)" 
            opacity="0.95" />
      
      <!-- Right Page -->
      <path d="M 8 -15 
               C 40 -35, 80 -25, 100 -5 
               C 90 10, 50 0, 8 15 Z" 
            fill="url(#quranGrad)" 
            opacity="0.95" />

      <!-- Spine / Bookmark Ribbon (Emerald) -->
      <path d="M 0 -18 L 0 25 L -5 32 L 0 28 L 5 32 L 0 25 Z" fill="url(#emeraldGrad)"/>
      
      <!-- Golden Quran Calligraphy Line Accent -->
      <path d="M -75 -10 Q -45 -18 -20 -8" stroke="#D97706" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.8"/>
      <path d="M 20 -8 Q 45 -18 75 -10" stroke="#D97706" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.8"/>
    </g>
  </g>
</svg>`
}

async function run() {
  const publicDir = path.resolve(__dirname, '../public')
  const iconsDir = path.resolve(publicDir, 'icons')
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true })
  }

  console.log('Rendering high-res Deenly PWA icons...')

  // 1. Standard 512x512
  const svg512 = createDeenlySvg(512, false)
  await sharp(Buffer.from(svg512))
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-512x512.png'))
  console.log('✓ Created public/icons/icon-512x512.png')

  // 2. Standard 192x192
  await sharp(Buffer.from(svg512))
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-192x192.png'))
  console.log('✓ Created public/icons/icon-192x192.png')

  // 3. Apple Touch Icon 180x180
  await sharp(Buffer.from(svg512))
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'))
  console.log('✓ Created public/icons/apple-touch-icon.png')

  // 4. Maskable 512x512 (with safe zone margin)
  const svgMaskable = createDeenlySvg(512, true)
  await sharp(Buffer.from(svgMaskable))
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'maskable-icon-512x512.png'))
  console.log('✓ Created public/icons/maskable-icon-512x512.png')

  // 5. Favicon SVG
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svg512)
  console.log('✓ Updated public/favicon.svg')

  console.log('🎉 All Deenly PWA icons generated successfully!')
}

run().catch(console.error)
