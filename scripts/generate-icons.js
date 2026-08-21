import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 📖 Deenly Minimalist Open Book PWA Icon (matching user's design)
function createDeenlyBookSvg(size, isMaskable = false) {
  const cornerRadius = isMaskable ? 0 : 112

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <defs>
    <!-- Outer Deep Midnight Navy Gradient -->
    <radialGradient id="outerBg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1A203B"/>
      <stop offset="60%" stop-color="#121629"/>
      <stop offset="100%" stop-color="#0B0E1B"/>
    </radialGradient>

    <!-- Inner Squircle Container Gradient -->
    <linearGradient id="innerBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#242C4E"/>
      <stop offset="100%" stop-color="#181D35"/>
    </linearGradient>

    <!-- Book Lavender/Lilac Glow Gradient -->
    <linearGradient id="lavenderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F3E8FF"/>
      <stop offset="50%" stop-color="#E9D5FF"/>
      <stop offset="100%" stop-color="#D8B4FE"/>
    </linearGradient>

    <!-- Subtle Soft Glow -->
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Base App Background -->
  <rect width="512" height="512" rx="${cornerRadius}" fill="url(#outerBg)"/>

  <g transform="${isMaskable ? 'translate(38.4, 38.4) scale(0.85)' : ''}">
    <!-- Inner Squircle Container with Soft Border -->
    <rect 
      x="76" 
      y="76" 
      width="360" 
      height="360" 
      rx="96" 
      fill="url(#innerBg)" 
      stroke="#384370" 
      stroke-width="7" 
      stroke-opacity="0.85"
    />

    <!-- 📖 Minimalist Open Quran / Book Symbol -->
    <g 
      stroke="url(#lavenderGrad)" 
      stroke-width="26" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      fill="none"
      filter="url(#softGlow)"
    >
      <!-- Center Spine -->
      <line x1="256" y1="202" x2="256" y2="338" />

      <!-- Left Page Path -->
      <path d="M 256 202 
               C 220 180, 172 180, 142 195 
               C 134 199, 130 207, 130 216 
               L 130 326 
               C 130 334, 136 341, 144 338 
               C 172 326, 218 324, 256 346" />

      <!-- Right Page Path -->
      <path d="M 256 202 
               C 292 180, 340 180, 370 195 
               C 378 199, 382 207, 382 216 
               L 382 326 
               C 382 334, 376 341, 368 338 
               C 340 326, 294 324, 256 346" />
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

  console.log('Rendering new minimalist Deenly book icons...')

  // 1. Standard 512x512
  const svg512 = createDeenlyBookSvg(512, false)
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
  const svgMaskable = createDeenlyBookSvg(512, true)
  await sharp(Buffer.from(svgMaskable))
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'maskable-icon-512x512.png'))
  console.log('✓ Created public/icons/maskable-icon-512x512.png')

  // 5. Favicon SVG
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svg512)
  console.log('✓ Updated public/favicon.svg')

  console.log('🎉 All new Deenly book icons rendered successfully!')
}

run().catch(console.error)
