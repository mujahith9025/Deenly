import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Creates the clean Deenly App Icon (Without Green Accent):
 * - Deep midnight cosmic background (#0D0B18)
 * - Large circular badge (#1E1A38) with soft purple glow border (#7C3AED)
 * - Centered Lucide BookOpen icon in glowing lilac/lavender (#D2BBFF / #F5EEFF)
 */
function createCleanDeenlyAppIconSvg(size, isMaskable = false) {
  const cornerRadius = isMaskable ? 0 : 112

  // For maskable icon, scale slightly (0.80) to fit safely inside Android's 80% safe zone
  const transformGroup = isMaskable 
    ? `transform="translate(51.2, 51.2) scale(0.80)" transform-origin="256 256"` 
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <defs>
    <!-- Background Radial Gradient -->
    <radialGradient id="appBg" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#1C163A"/>
      <stop offset="60%" stop-color="#0F0C22"/>
      <stop offset="100%" stop-color="#090715"/>
    </radialGradient>

    <!-- Main Circle Badge Gradient -->
    <linearGradient id="circleBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#28214E"/>
      <stop offset="50%" stop-color="#1E193C"/>
      <stop offset="100%" stop-color="#141029"/>
    </linearGradient>

    <!-- Book Lavender/Lilac Gradient -->
    <linearGradient id="bookLavender" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="35%" stop-color="#F3E8FF"/>
      <stop offset="70%" stop-color="#E4D4FF"/>
      <stop offset="100%" stop-color="#D2BBFF"/>
    </linearGradient>

    <!-- Purple Glow Filter -->
    <filter id="purpleGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="18" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <!-- Badge Drop Shadow -->
    <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
      <feDropShadow dx="0" dy="0" stdDeviation="24" flood-color="#7C3AED" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Base App Background Canvas -->
  <rect width="512" height="512" rx="${cornerRadius}" fill="url(#appBg)"/>

  <!-- Soft Ambient Glow behind Circle -->
  <circle cx="256" cy="256" r="165" fill="#7C3AED" opacity="0.22" filter="url(#purpleGlow)"/>

  <g ${transformGroup}>
    <!-- Center Main Circle Badge Container -->
    <circle 
      cx="256" 
      cy="256" 
      r="145" 
      fill="url(#circleBg)" 
      stroke="#7C3AED" 
      stroke-width="5.5" 
      stroke-opacity="0.7"
      filter="url(#badgeShadow)"
    />

    <!-- Inner Subtle Highlight Ring -->
    <circle 
      cx="256" 
      cy="256" 
      r="142" 
      fill="none" 
      stroke="#A78BFA" 
      stroke-width="1.5" 
      stroke-opacity="0.3"
    />

    <!-- 📖 EXACT Lucide BookOpen SVG Path Centered -->
    <g transform="translate(156, 156) scale(8.33)" 
       fill="none" 
       stroke="url(#bookLavender)" 
       stroke-width="2.3" 
       stroke-linecap="round" 
       stroke-linejoin="round"
    >
      <!-- Left Page -->
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <!-- Right Page -->
      <path d="M22 3h-6a4 4 0 0 1-4 4v14a3 3 0 0 1 3-3h7z"/>
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

  console.log('Rendering clean Deenly app logo icons without green accent...')

  // 1. Standard 512x512
  const svg512 = createCleanDeenlyAppIconSvg(512, false)
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
  const svgMaskable = createCleanDeenlyAppIconSvg(512, true)
  await sharp(Buffer.from(svgMaskable))
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'maskable-icon-512x512.png'))
  console.log('✓ Created public/icons/maskable-icon-512x512.png')

  // 5. Favicon SVG
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svg512)
  console.log('✓ Updated public/favicon.svg')

  console.log('🎉 Clean Deenly app logo icons generated successfully!')
}

run().catch(console.error)
