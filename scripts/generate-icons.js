import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Creates the exact Deenly Splash / Opening Page Logo Icon:
 * - Deep midnight cosmic background (#0D0B18)
 * - Large circular badge (#1E1A38) with soft purple glow border
 * - Centered Lucide BookOpen icon in glowing lilac/lavender (#D2BBFF)
 * - Attached bottom-right emerald badge (#059669) with glowing Sparkles icon (✨)
 */
function createExactDeenlyAppIconSvg(size, isMaskable = false) {
  const cornerRadius = isMaskable ? 0 : 112

  // For maskable icon, scale slightly (0.80) to fit inside Android's 80% safe zone
  const transformGroup = isMaskable 
    ? `transform="translate(51.2, 51.2) scale(0.80)" transform-origin="256 256"` 
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <defs>
    <!-- Background Radial Gradient -->
    <radialGradient id="appBg" cx="50%" cy="45%" r="75%">
      <stop offset="0%" stop-color="#1A1535"/>
      <stop offset="60%" stop-color="#0F0C22"/>
      <stop offset="100%" stop-color="#090715"/>
    </radialGradient>

    <!-- Main Circle Badge Gradient -->
    <linearGradient id="circleBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#28224E"/>
      <stop offset="50%" stop-color="#1E193C"/>
      <stop offset="100%" stop-color="#141029"/>
    </linearGradient>

    <!-- Emerald Sparkle Badge Gradient -->
    <linearGradient id="emeraldBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>

    <!-- Book Lavender Gradient -->
    <linearGradient id="bookLavender" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5EEFF"/>
      <stop offset="50%" stop-color="#E4D4FF"/>
      <stop offset="100%" stop-color="#D2BBFF"/>
    </linearGradient>

    <!-- Purple Glow Filter -->
    <filter id="purpleGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="16" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <!-- Subtle Icon Drop Shadow -->
    <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
      <feDropShadow dx="0" dy="0" stdDeviation="24" flood-color="#7C3AED" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Base App Background Canvas -->
  <rect width="512" height="512" rx="${cornerRadius}" fill="url(#appBg)"/>

  <!-- Soft Ambient Glow behind Circle -->
  <circle cx="256" cy="245" r="160" fill="#7C3AED" opacity="0.18" filter="url(#purpleGlow)"/>

  <g ${transformGroup}>
    <!-- Center Main Circle Badge Container -->
    <circle 
      cx="256" 
      cy="245" 
      r="140" 
      fill="url(#circleBg)" 
      stroke="#7C3AED" 
      stroke-width="5.5" 
      stroke-opacity="0.65"
      filter="url(#badgeShadow)"
    />

    <!-- Inner Highlight Ring -->
    <circle 
      cx="256" 
      cy="245" 
      r="137" 
      fill="none" 
      stroke="#A78BFA" 
      stroke-width="1.5" 
      stroke-opacity="0.25"
    />

    <!-- 📖 EXACT Lucide BookOpen SVG Path scaled to center -->
    <g transform="translate(160, 149) scale(8)" 
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

    <!-- ✨ Emerald Sparkle Bottom-Right Badge -->
    <g filter="url(#badgeShadow)">
      <!-- Emerald Circle -->
      <circle 
        cx="356" 
        cy="345" 
        r="44" 
        fill="url(#emeraldBg)" 
        stroke="#34D399" 
        stroke-width="4.5"
      />

      <!-- Lucide Sparkles Icon in Emerald Circle -->
      <g transform="translate(334, 323) scale(1.85)" 
         fill="none" 
         stroke="#FFFFFF" 
         stroke-width="2.2" 
         stroke-linecap="round" 
         stroke-linejoin="round"
      >
        <!-- Main 4-point Star -->
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        <!-- Small accents -->
        <path d="M5 3v4"/>
        <path d="M19 17v4"/>
        <path d="M3 5h4"/>
        <path d="M17 19h4"/>
      </g>
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

  console.log('Rendering exact Deenly opening page app logo icons...')

  // 1. Standard 512x512
  const svg512 = createExactDeenlyAppIconSvg(512, false)
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
  const svgMaskable = createExactDeenlyAppIconSvg(512, true)
  await sharp(Buffer.from(svgMaskable))
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'maskable-icon-512x512.png'))
  console.log('✓ Created public/icons/maskable-icon-512x512.png')

  // 5. Favicon SVG
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svg512)
  console.log('✓ Updated public/favicon.svg')

  console.log('🎉 All Deenly opening page logo icons generated perfectly!')
}

run().catch(console.error)
