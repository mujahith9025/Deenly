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
- **Continuous Spotify-Grade Quran Audio Player**: Full-chapter sequential recitation by Sheikh Mishary Rashid Alafasy with MediaSession background lock screen controls, draggable seekbar, autoscroll, and automatic next chapter advancement.
- **Offline-First Storage**: IndexedDB caching layer (`deenly_quran_cache`) ensuring chapters load instantly even without an internet connection.

### ⏱️ Reading Session & Realtime Metrics
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

## 📜 Quran Data Source & Attribution

- **Arabic Quran Text**: Verified Uthmani script sourced from Tanzil / King Fahd Glorious Quran Printing Complex via `fawazahmed0/quran-api` (`ara-quranacademy`).
- **English Translation**: Sahih International (*Umm Muhammad*), distributed under Creative Commons Attribution.
- **Tamil Translation (தமிழ்)**: Jan Trust Foundation / Abdul Hameed Baqavi (*அப்துல் ஹமீது பாகவி*).
- **Attribution License**: Quran texts and translations are utilized in accordance with the open licenses provided by Tanzil.net and the respective translation contributors.

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
