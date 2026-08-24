# 🌙 Deenly (دينلي) — Quran Reading & Spiritual Habit Tracking

[![Live Production](https://img.shields.io/badge/Live%20Demo-deenly--three.vercel.app-10b981?style=for-the-badge&logo=vercel)](https://deenly-three.vercel.app/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/mujahith9025/Deenly)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Deenly** is a high-performance, dark cosmic-themed Quran reading and Islamic habit-tracking progressive web application designed for spiritual reflection, daily recitation consistency, and Hadith-accurate Hasanat accumulation.

🌐 **Live Application**: [https://deenly-three.vercel.app](https://deenly-three.vercel.app)

---

## 🌟 Key Features

### 🌐 Comprehensive App Localization (English & Pure Tamil Mode)
- **App Language Preference (பயன்பாட்டு மொழி)**: Dual-mode language architecture accessible in Settings:
  - 🇬🇧 **English (`en`) — Default**: Standard international English UI with bilingual translation switcher.
  - 🇮🇳 **தமிழ் (`ta`) — Pure Tamil Mode**: The entire user interface (Navigation, Dashboard, Quran Explorer, Reader, Hadith collections, and Settings) translates completely into pure, authentic Tamil.
  - 🔒 **Pure Tamil Mode Lock**: When Tamil is chosen as the App Language, English Quran translations are disabled and locked exclusively to authentic Tamil editions (*Abdul Hameed Baqavi* & *Jan Trust*), ensuring a distraction-free, 100% Tamil Islamic reading experience alongside original Arabic scriptures.

### 🌙 Mushaf Eye-Comfort Reading Themes (OLED, Sepia, Emerald)
- **Engineered Recitation Palettes**: 5 specially calibrated visual themes for zero eye strain and optimized lighting conditions:
  - 🌙 **Midnight OLED Pure Black**: True 100% pure black canvas with obsidian cards, zero AMOLED battery drain, and crisp high-contrast text for dark rooms and late-night Tahajjud recitation.
  - 📜 **Warm Sepia Parchment**: Soft paper-like ivory and warm espresso tones filtering harsh blue light for effortless prolonged daytime reading.
  - 🍃 **Classic Royal Emerald**: Sacred Islamic royal emerald green inspired by traditional Madinah & Istanbul Mushaf bindings.
  - 🌌 **Cosmic Obsidian**: Sleek modern dark mode with violet/celestial accents and glassmorphism.
  - ☀️ **Soft Dawn Light**: Crisp, airy daylight mode with gentle contrast and clear typography.
- **One-Tap Quick Switcher**: Palette icon button on the Quran Reader and Explorer headers for instantaneous on-the-fly theme switching.
- **Interactive Theme Gallery & Settings Live Preview**: Visual theme selection cards with color swatches and live Arabic verse rendering in Settings.

### 🎨 Scholarly Tajweed Color Rules Engine & Interactive Guide
- **Dynamic Tajweed Color Coding**: Authentic phonetic color-coding across the Quran Reader, Quran Explorer, and Settings:
  - 🔴 **Obligatory Prolongation (Madd Lazim - 6 Harakat)** (`#ef4444`)
  - 🌺 **Mandatory Connected Madd (Madd Muttasil - 4-5 Harakat)** (`#f43f5e`)
  - 🟠 **Permissible Prolongation (Madd Ja'iz / Munfasil / Arid)** (`#f59e0b`)
  - 🟡 **Natural Prolongation (Madd Tabee'i - 2 Harakat)** (`#fbbf24`)
  - 🔵 **Qalqalah (Echoing Sound: ق, ط, ب, ج, د)** (`#38bdf8`)
  - 🟢 **Ghunnah (Nasalization / 2 Harakat: نّ, مّ)** (`#34d399`)
  - 🩵 **Ikhfa (Nasal Concealment / Hiding before 15 letters)** (`#2dd4bf`)
  - 🟣 **Idgham with Ghunnah (Merging with Nasalization)** (`#a78bfa`)
  - ⚪ **Idgham without Ghunnah & Silent / Wasl Letters** (`#94a3b8`)
  - 🌸 **Iqlab (Conversion of Noon/Tanween to Meem before Baa)** (`#f472b6`)
- **One-Tap Quick Toggle**: Header button (`Sparkles`) allowing readers to toggle Tajweed color mode on/off instantly.
- **Interactive Tap-to-Learn Tooltips**: Tapping any colored Arabic segment in the recitation card reveals a micro-popover with the exact Tajweed rule name and explanation.
- **Comprehensive Bilingual Legend Modal & Settings Guide**: Detailed reference card with Arabic examples, rule classifications, and complete descriptions in English and pure Tamil.

### 📖 Authentic Quran Reading Experience
- **Official Quran Font Styles**: 5 authentic calligraphic traditions with regional badges, live previews, and instant multi-screen persistence:
  - 🏛️ **Madani Uthmani** (*Amiri Quran* / King Fahd Complex standard)
  - 🕌 **Indo-Pak Traditional** (*Lateef* / South Asian Tajweed orthography)
  - 🇹🇷 **Ottoman / Turkish Naskh** (*Scheherazade New* / Diyanet edition)
  - 📱 **Modern Digital Naskh** (*Noto Naskh Arabic* / High-DPI OLED standard)
  - 🏺 **Classical Early Kufic** (*Noto Kufi Arabic* / Ancient manuscript script)
- **Diacritic-Aware Typography Scaling**: Responsive typography scaling (18px – 54px) via dynamic CSS variables, steppers, and quick presets with instant auto-saving.
- **Pinch-to-Zoom & Gesture Scaling**: 2-finger mobile pinch gestures and trackpad wheel zooming to smoothly scale Arabic text size on the fly with live visual indicator pills.
- **Verse of the Day & Hadith of the Day**: Automatic midnight rotation of inspiring Quranic verses and authentic Prophetic Hadiths with bilingual English and Tamil translations.
- **Unified Favorites & Bookmarks**: Dedicated Heart (Favorite) and Ribbon (Bookmark) actions across Quran chapters and Hadiths with full persistence and direct deep-linking.
- **Hadith-Accurate Hasanat Engine**: Precise isolation of Quranic letters yielding **10 Hasanat points per letter** in accordance with authentic Hadith (*Sunan at-Tirmidhi 2910*).
- **Official Scholarly Translations (English & Tamil)**: Instant switching and auto-saving of recognized scholarly editions:
  - 🇬🇧 **English Translations**:
    - **Sahih International** (*Umm Muhammad* — Default)
    - **The Clear Quran** (*Dr. Mustafa Khattab* — Al-Azhar Approved, Modern)
    - **The Noble Quran** (*Dr. Al-Hilali & Dr. Muhsin Khan* — King Fahd Complex Madinah)
    - **Oxford World's Classics** (*Prof. M.A.S. Abdel Haleem* — Literary Standard)
  - 🇮🇳 / 🇱🇰 **Tamil Translations (தமிழ்)**:
    - **மௌலானா ஏ.கே. அப்துல் ஹமீது பாகவி** (*Allama A.K. Abdul Hameed Baqavi* — Default Tamil)
    - **ஜான் டிரஸ்ட் பதிப்பு** (*Jan Trust Foundation* — King Fahd Complex Madinah Official Edition)
- **Mini Floating Dynamic Island Quran Audio Player**: A sleek Apple Dynamic Island / Spotify-style floating capsule hovering gracefully over all pages with live animated sound waves, continuous verse-by-verse recitation by Sheikh Mishary Rashid Alafasy, integrated bottom scrubber track, quick skip/play touch controls, MediaSession background lock screen controls, and an expandable fullscreen immersive recitation modal.
- **Offline-First Storage**: IndexedDB caching layer (`deenly_quran_cache`) ensuring chapters load instantly even without an internet connection.

### 📜 The Six Canonical Hadith Collections (Kutub al-Sittah)
- **All 6 Major Hadith Books**: Complete access to *Sahih al-Bukhari*, *Sahih Muslim*, *Jami` at-Tirmidhi*, *Sunan Abi Dawud*, *Sunan an-Nasa'i*, and *Sunan Ibn Majah*.
- **🔢 Chapter Hadith Interval Ranges**: Each chapter across all 6 collections clearly shows its exact Hadith number interval (e.g. `Hadiths 1 – 7`, `Hadiths 8 – 58`, `Hadiths 93 – 533`) along with tradition count for rapid scholarly referencing.
- **⚡ Smart Interval Search**: Typing any Hadith number (e.g. `250`) into the chapter search bar instantly matches and filters the exact chapter containing that tradition.
- **Quick Jump by Hadith Number**: Dedicated in-chapter jump form auto-scoped to the chapter's valid interval range with smooth scrolling and instant gold highlighting.
- **Bilingual & Dual Translations**: Instant switching between Arabic text, verified English translations, and authentic Tamil translations (including dual side-by-side mode).

### ⏱️ Reading Session & Realtime Metrics
- **🎉 Celebratory Surah Khatam Milestone & Golden Confetti Burst**: Completing the final verse of any Surah triggers a radiant dual-cannon Golden & Emerald starburst explosion (`canvas-confetti`) alongside an animated Islamic golden medallion modal, displaying session Hasanat roll-up, recitation duration, active streak, Sunnah completion Du'a, and 1-tap next chapter navigation.
- **Live Session Timer**: Tracks active recitation duration down to the second.
- **Floating Hasanat Badges**: Real-time visual reward feedback (`+770 Hasanat`) popping up as verses are recited and marked complete.
- **Dynamic Juz Progress**: Live calculation of active Juz completion percentages and remaining verses.
- **Khatm Milestones**: Real-time progress bar tracking progress through the 604 pages of the Holy Quran.

### 👤 Modern Profile & Spiritual Repository
- **Favorite Verses & Hadiths**: Dedicated collection sub-page with categorized filtering (`All`, `Quran`, `Hadiths`) and 1-tap reader navigation.
- **Saved Bookmarks**: Full bookmark management with quick removal and search.
- **Spiritual Milestones & Badges**: Achievement tracking across daily streaks, Surah completions, and milestone targets.
- **Recitation Analytics**: Detailed breakdown of daily streak, pages read, ayahs completed, and accumulated Hasanat rewards.

### 🔄 Multi-Device Realtime Cloud Sync
- **Additive Delta Merge**: Counters (`deltaHasanat`, `deltaVerses`, `deltaTimeSeconds`, `deltaPages`) merge additively across concurrent devices via Supabase Realtime Channels and `BroadcastChannel`, preventing overwrites.
- **Offline Reconciliation**: Automatically buffers sessions in local storage when offline and flushes cleanly upon network reconnection.
- **Live Connection Monitor**: Real-time ping test card displaying latency (`🟢 Supabase Connected - 42ms`).

### 🎯 Responsive Command Center (Mobile, Tablet, Desktop)
- **Mobile** (`< 768px`): Floating bottom navigation bar, 2x2 spiritual metrics grid, and single-column reader.
- **Tablet** (`768px - 1023px`): Vertical icon rail and single 4-card metric row.
- **Desktop** (`>= 1024px`): Collapsible sidebar (`w-64` $\leftrightarrow$ `w-20`), 3-column dashboard with a dedicated Suggested Surahs right rail, and a two-column Quran reader with sticky session control panel.

### 🛡️ Safety & Account Controls
- **Fresh Zero-Data Default**: All new accounts (Google OAuth, Email & Guest) start with a clean 0-stat state.
- **Safety Confirmation Modals**: Built-in warning dialogs with confirmation before resetting reading stats or deleting accounts.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti
- **State Management**: Zustand (with localStorage persistence & cross-tab BroadcastChannel)
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security, Realtime Subscriptions, Google OAuth)
- **Hosting & CI/CD**: Vercel (Auto-deploy on git push)

```
deenly/
├── src/
│   ├── components/       # UI components (Sidebar, BottomNav, Header, ConnectionStatus)
│   ├── hooks/            # Custom hooks (useAuth, useReadingSession)
│   ├── lib/              # Core business engines & data pipelines
│   │   ├── authService.ts        # Supabase OAuth & Email auth wrapper
│   │   ├── hasanatEngine.ts      # Pure math & streak calculation engine
│   │   ├── logger.ts             # Telemetry & silent error mitigation logger
│   │   ├── quranApi.ts           # Quran CDN fetcher & letter-counting pipeline
│   │   ├── quranCache.ts         # IndexedDB & memory caching layer
│   │   ├── quranMetadata.ts      # Static 114 Surahs & 30 Juz catalog
│   │   ├── supabase.ts           # Supabase client & environment checker
│   │   └── syncService.ts        # Multi-device Realtime & BroadcastChannel sync
│   ├── screens/          # Route screens (Dashboard, Reading, Settings, Profile, Explore)
│   ├── store/            # Zustand stores (useAuthStore, useReadingStore)
│   └── types/            # TypeScript domain interfaces
├── supabase/
│   └── schema.sql        # PostgreSQL schema, RLS policies, & triggers
├── scripts/              # Automated verification & test pipelines
├── vercel.json           # Vercel SPA routing & cache configuration
├── netlify.toml          # Netlify SPA routing configuration
└── vite.config.ts        # Vite configuration
```

---

---

## 🌟 Inspiration & Reference Attribution

### 📱 Quranly App (Google Play Store & Apple App Store)
Deenly draws profound inspiration and architectural reference from the pioneering **[Quranly](https://play.google.com/store/apps/details?id=com.quranly.app)** app (by Muslim Tech Incubator / Quranly App team). 
- **1-Verse Recitation Engine**: Focused verse-by-verse presentation reducing overwhelm and cultivating mindful contemplation (*Tadabbur*).
- **Gamified Letter-Count Hasanat Accumulation**: Direct realization of the Prophetic Hadith (*Sunan at-Tirmidhi 2910*) allocating 10 rewards per Arabic letter recited.
- **Consistency & Daily Streaks**: Habit-forming momentum metrics that motivate believers toward daily engagement with Allah's Book.
- We extend our sincere gratitude and prayers to the Quranly team for revolutionizing digital Quran habit-building for the global Ummah.

---

## 📜 Scholarly Quran & Hadith Resource Credits

### 🏛️ Official Arabic Quran Text & Script
- **King Fahd Glorious Quran Printing Complex (مجمع الملك فهد لطباعة المصحف الشريف - Madinah Al-Munawwarah, KSA)**: Standard authentic Hafs 'an 'Asim Uthmani scripture and verse divisions.
- **Tanzil.net Project** (*Dr. Hamid Zarrabi-Zadeh / Sharif University of Technology*): Highly verified, error-free Unicode Quran text engine with full diacritics, sukun, and pause markings.
- **Quran.com API v4 & QuranCDN**: The world's leading open digital Quran initiative providing fast, dependable Surah/Ayah datasets and API infrastructure.
- **Tajweed Color Rules Engine**: Standard phonetic notation covering Obligatory Madd (🔴), Connected Madd (🌺), Permissible Madd (🟠), Natural Madd (🟡), Qalqalah (🔵), Ghunnah (🟢), Ikhfa (🩵), Idgham (🟣/⚪), and Iqlab (🌸).

### 🇬🇧 Scholarly English Translations
1. **Sahih International**: Translated by *Umm Muhammad* (Aminah Assami, Amatullah Bantley) — Published by Dar Abul-Qasim (Riyadh/Jeddah, Saudi Arabia). Standard Sunni word-for-word accuracy.
2. **The Clear Quran**: Translated by *Dr. Mustafa Khattab* — Approved by the Islamic Research Academy at Al-Azhar University (Cairo). Thematic, eloquent, and modern.
3. **The Noble Quran**: Translated by *Dr. Muhammad Taqi-ud-Din Al-Hilali & Dr. Muhammad Muhsin Khan* — Published by King Fahd Glorious Quran Printing Complex (Madinah). Integrates commentary from Tafsir Ibn Kathir and Sahih Al-Bukhari.
4. **Oxford World's Classics**: Translated by *Prof. M.A.S. Abdel Haleem* (SOAS University of London) — Published by Oxford University Press. High literary standard English.

### 🇮🇳 / 🇱🇰 Authentic Tamil Quran Translations (தமிழ் திருக்குர்ஆன்)
1. **மௌலானா ஏ.கே. அப்துல் ஹமீது பாகவி** (*Allama A.K. Abdul Hameed Baqavi*): Historical 1st classical Tamil translation (1929–1940s), published by Thawbah Publications (Baqaviyath). Revered by scholars for its rich literary Tamil and orthodox precision.
2. **ஜான் டிரஸ்ட் பதிப்பு - மதீனா கிங் ஃபஹத் அச்சகம்** (*Jan Trust Foundation / King Fahd Complex*): The official Tamil translation printed and distributed worldwide by King Fahd Glorious Quran Printing Complex (Madinah Al-Munawwarah, Saudi Arabia).

### 📜 The Six Canonical Hadith Collections (Kutub al-Sittah)
- **Sahih al-Bukhari** (*Imam Muhammad al-Bukhari*)
- **Sahih Muslim** (*Imam Muslim ibn al-Hajjaj*)
- **Sunan an-Nasa'i** (*Imam Ahmad an-Nasa'i*)
- **Sunan Abi Dawud** (*Imam Abu Dawud al-Sijistani*)
- **Jami` at-Tirmidhi** (*Imam Abu 'Isa at-Tirmidhi*)
- **Sunan Ibn Majah** (*Imam Ibn Majah*)
- **Al-Arba'in an-Nawawiyyah** (*Imam Yahya ibn Sharaf an-Nawawi*)
- *Hadith Data Source*: Sunnah.com API & verified open Hadith databases with English and authentic Tamil translations.

### 🎙️ Audio Recitation & Calligraphy Fonts
- **Reciter**: *Sheikh Mishary Rashid Alafasy* (الشيخ مشاري بن راشد العفاسي) — Crystal-clear verse-by-verse and full-chapter recitations hosted via EveryAyah.com & QuranCDN.
- **Sacred Fonts**: King Fahd Complex Uthmanic Script, *Amiri & Amiri Quran* (Dr. Khaled Hosny / Google Fonts), *Scheherazade New* (SIL International), *Lateef* (SIL International), *Noto Naskh Arabic & Noto Kufi Arabic* (Google Fonts), and *Noto Sans Tamil* (Google Fonts).

---

## 🧮 Hasanat Formula Documentation

The Prophet ﷺ said:
> *"Whoever recites a letter from the Book of Allah, he will receive one good deed as ten of its like. I do not say that Alif-Lam-Mim is one letter, but Alif is a letter, Lam is a letter, and Mim is a letter."*
> — **Sunan at-Tirmidhi 2910**

### Letter-Counting Logic:
1. Strips all diacritics / tashkeel marks (`\p{M}`).
2. Strips Quranic pause / stop signs (`\p{S}`: ۚ, ۖ, ۗ, ۘ, ۙ, ۜ).
3. Strips spaces (`\p{Z}`) and punctuation (`\p{P}`).
4. Preserves authentic Arabic alphabetic glyphs (`[\u0600-\u06FF]`).
5. Evaluates points:
$$\text{Hasanat} = \text{Cleaned Letter Count} \times 10$$

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Production Configuration
VITE_SUPABASE_URL=https://crdbbvvpwlylfcvocrji.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- npm 9+

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/mujahith9025/Deenly.git
cd Deenly

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

### Automated Verification Commands
```bash
# Verify Quran Fetching & Letter Counting (2:274)
node scripts/test-quran-pipeline.mjs

# Verify Pure Hasanat Engine & Streaks
npx tsx scripts/test-hasanat-engine.ts

# Verify Multi-Device Sync Reconciliation & Offline Queues
npx tsx scripts/test-sync-reconciliation.ts

# Spot-Check Letter Counts on Multiple Famous Surahs
npx tsx scripts/spot-check-hasanat.ts

# Compile Production Build
npm run build
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
