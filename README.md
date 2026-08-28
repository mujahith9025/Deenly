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
- **Official King Fahd Complex & Quranly Typography**: Master calligraphy of Uthman Taha bundled directly with offline WOFF2 fonts and the authentic `ara-quranuthmanihaf` script text matching the exact Quranly app typography:
  - 🏛️ **Uthmanic Hafs (Quranly Style)** (*KFGQPC Uthmanic Script HAFS* / *KFGQPC Uthman Taha Naskh* — King Fahd Glorious Quran Printing Complex master calligraphy with authentic ligatures, dagger alifs, waslas, small ya, and stop signs)
  - 🕌 **Indo-Pak Traditional** (*Lateef* / *Scheherazade New* — South Asian Tajweed orthography)
  - 🇹🇷 **Ottoman / Turkish Naskh** (*Scheherazade New* — Diyanet edition)
  - 📱 **Modern Digital Naskh** (*Noto Naskh Arabic* — High-DPI OLED standard)
  - 🏺 **Classical Early Kufic** (*Noto Kufi Arabic* — Ancient manuscript script)
- **🔤 Bilingual Phonetic Transliteration (English & Pure Tamil / தமிழ் ஒலிபெயர்ப்பு)**:
  - **On/Off Setting**: Complete toggle in Settings (`Show Phonetic Transliteration`) to enable or disable pronunciation guidance below verses.
  - **Language Selector**: Choose between **English Phonetic (Latin)** (e.g. `Bismillāhir-Raḥmānir-Raḥīm`) and **Tamil Phonetic (தமிழ் உச்சரிப்பு)** (e.g. `பிஸ்மில்லாஹிர் ரஹ்மானிர் ரஹீம்`).
  - **Live Interactive Preview in Settings**: Real-time preview card rendering the chosen language and script.
  - **Live Letter-by-Letter Hasanat Badge**: Displays pronunciation with the Sunnah-accurate letter Hasanat points badge (`+880 pts`), mirroring the Quranly visual experience.
- **📱 Enlarged Header & Footer with Fixed Aspect Ratio & Font-Aware Scroll**:
  - **Prominent Big Timer & Hasanat Header**: Enlarged high-visibility header featuring bold, large-format live session timer (`Clock`) and real-time Hasanat reward points pill (`Sparkles` + points) in prominent typography (`14px` – `24px` font-mono) with expanded Surah title display and touch-friendly controls.
  - **Enlarged Footer Controls**: Substantially larger `Previous Ayah ( ← )`, `I'm Done` center action button, and `Next Ayah ( → )` action buttons (`h-14 sm:h-18 md:h-20` and `w-20 sm:w-36 md:w-48`) with bold arrow strokes for effortless single-handed navigation.
  - **Fixed Viewport Aspect Ratio & Font-Aware Scrolling**: Fixed `100dvh` boundary protection ensuring zero distortion or header/footer collision across all mobile and desktop screen aspect ratios. The center verse container seamlessly **scrolls down** as text font size is increased (up to 54px) or on long verses while Header and Footer remain firmly pinned.
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
- **🎙️ Advanced Audio & Multi-Qari Engine (13 World-Renowned Reciters & Hifz Repeats)**:
  - **13 Authentic Global Reciters**: Seamless high-definition (128kbps – 192kbps HQ) audio streaming via EveryAyah and QuranCDN across 5 distinct recitation styles:
    - 🇰🇼 **Sheikh Mishary Rashid Alafasy** (*Murattal / Modern Studio — Default*)
    - 🇪🇬 **Sheikh Abdul Basit Abdul Samad** (*Classical Mujawwad & Murattal*)
    - 🇪🇬 **Sheikh Mahmoud Khalil Al-Husary** (*Master Tajweed Murattal & Muallim Teaching Mode*)
    - 🇪🇬 **Sheikh Mohamed Siddiq Al-Minshawi** (*Legendary Mujawwad & Emotional Murattal*)
    - 🇸🇦 **Sheikh Abdur-Rahman As-Sudais** (*Grand Mosque Makkah Haramain Imam*)
    - 🇸🇦 **Sheikh Saud Al-Shuraim** (*Former Makkah Haramain Chief Imam*)
    - 🇸🇦 **Sheikh Maher Al-Muaiqly** (*Masjid al-Haram Imam — Heart-touching*)
    - 🇸🇦 **Sheikh Abu Bakr Al-Shatri** (*Calm Studio Murattal*)
    - 🇸🇦 **Sheikh Saad Al-Ghamadi** (*Warm, Soul-Stirring Recitation*)
    - 🇸🇦 **Sheikh Hani Ar-Rifai** (*Deep Emotional Tearful Recitation*)
  - **🔁 Hifz Memorization Loop Engine**: Built-in repetition counter cycling between `1x (Off)`, `3x`, `5x`, `10x`, and `∞ (Infinite Continuous Loop)` for effortless Quran memorization.
  - **⚡ Variable Playback Speed Control**: Instant pitch-preserved speed switching (`0.75x`, `1.0x`, `1.25x`, `1.5x`, `2.0x`).
  - **🎵 Mini Floating Dynamic Island & Fullscreen Spotify-Style Player**: Sleek pill hovering with animated sound equalizer, scrubber bar, quick touch controls, Qari picker modal with live sample previews, and system MediaSession background lockscreen integration.
  - **🔘 1-Tap Verse Recitation**: Instant 1-tap verse audio triggers embedded in both the 1-Verse Quran Reader header and the 114-Chapter Explorer list.
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

### 📿 Interactive Digital Tasbih & Dhikr Analytics Engine (with Cloud Sync & Goals)
- **Target Goal Reflection on All Dhikrs**: Set universal or per-Dhikr custom targets (e.g. 33x, 100x) that reflect across all Dhikrs with individual today progress bars (`todayCount / target`) and an All-Dhikr Completionist milestone.
- **Dedicated Dhikr Analytics & Multi-Day Trends**: Interactive bar charts (7-day, 14-day, 30-day progression), Dhikr streak tracking (current & best streaks), remembrance distribution share (% of each Dhikr), and unlockable spiritual badges.
- **Multi-Device Real-Time Cloud Sync**: Real-time broadcast and Supabase cloud persistence for Dhikr counts and logs across phones, tablets, and laptops.
- **Dedicated Explore Hub (`/explore`)**: Positioned prominently in the middle of Quran and Hadith in navigation (Sidebar & BottomNav), presenting an **interactive 4-card square grid layout** with direct 1-tap navigation into **Digital Tasbih Studio**, **Dhikr Analytics & Charts**, authentic **Hisnul Muslim Supplications**, and **Asmaul Husna (All 99 Names of Allah)**.
- **Authentic Sunnah Presets & Virtues**: Scholarly citations from *Sahih al-Bukhari*, *Sahih Muslim*, and *Jami` at-Tirmidhi* in English and Tamil with post-prayer Sunnah loop (33-33-34).

### ⚡ High-Performance Architecture & Bundle Optimization
- **78% Reduction in Initial Bundle Size**: Slashed the monolithic entry chunk from `1,055 kB` down to `233 kB` (`65 kB` gzipped) through asynchronous route chunking and Rollup manual vendor partitioning.
- **Route-Level Dynamic Code Splitting (`React.lazy` + `Suspense`)**: All top-level screens (`Dashboard`, `Reading`, `Quran`, `Explore`, `Hadith`, `Profile`, `Settings`) and heavy sub-views (`DigitalTasbihEngine`, `DhikrAnalyticsView`) load strictly on-demand with a glowing, zero-flicker `<RouteLoadingFallback />` skeleton.
- **Opportunistic Idle Screen Prefetching**: Utilizes `requestIdleCallback` (with a 2.5s fallback) to pre-load critical high-traffic screens during idle browser cycles, guaranteeing instantaneous sub-10ms page transitions.
- **Dynamic Heavy Library Splitting**: `canvas-confetti` (~30kB) and animation engines are dynamically loaded via `import()` only when Khatam milestone celebration triggers.
- **Dual-Tier $O(1)$ In-Memory & IndexedDB Caching**: Ultra-fast Map-based LRU caches for letter counting (`countArabicLetters`), Tajweed tokenization (`tokenizeTajweedText`), and Surah payload retrieval.
- **Aggressive PWA & CDN Preconnects**: DNS prefetch and preconnect tags for `everyayah.com` and `cdn.jsdelivr.net`, paired with Workbox `CacheFirst` strategies for audio files (30-day quota), fonts (365 days), and metadata.

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

### ✨ Screen-by-Screen Modernization & Crisp Copywriting
- **Dashboard Screen (`/dashboard`)**: Dynamic greeting with real-time target status (`12/20 Ayahs • 60%`), Hero Recitation & Weekly Consistency cards, **Interactive Digital Tasbih dial positioned in the middle below Spiritual Metrics**, and **Daily Inspirations (Verse of the Day & Hadith of the Day)** positioned below with prominent chapter/verse numbering and canonical Hadith badges.
- **Explore Hub (`/explore`)**: Sleek **2-in-a-row square-shaped category cards** (`Digital Tasbih Studio`, `Dhikr Analytics`, `Hisnul Muslim`, `99 Names of Allah`) with instant focused single-category drilldown upon selection and seamless back-to-grid navigation.
- **Quran Catalog (`/quran`)**: High-contrast summary metrics (`114 Surahs • 6,236 Ayahs • 30 Juz`), modern Quranly Surah cards with squircle numbers and calligraphy, and clean action buttons (`▶ Play Surah` / `📖 Recite & Track`).
- **Quran Reading Screen (`/reading`)**: Enlarged fixed header & footer with monospace timer, letter rewards, dynamic font-size scrolling down to 54px, and clean bilingual translation badges (`English • Sahih` / `தமிழ் • பாகவி`).
- **Hadith Collections (`/hadith`)**: Scholarly book cards, smart interval search, and concise Hadith reader stream with segmented translation switchers (`English`, `தமிழ்`, `Dual`).
- **Profile & Spiritual Hub (`/profile`)**: High-contrast KPI widgets, 2-column spiritual repository, and 5 dedicated sub-pages (`Bookmarks`, `Favorites`, `Milestones`, `Analytics`, `Account`).
- **Settings Screen (`/settings`)**: Modular 10-category master-detail control center with crisp descriptions, live visual previews, and a comprehensive **About Deenly & Sources Showcase** detailing all 10 core built-in engines, 13 Qaris, 6 Hadith books, 8 scholarly source attribution cards, live Vercel link, and GitHub repository.

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

### 🎙️ Audio Reciters & Calligraphy Fonts
- **13 Global Reciters**: *Sheikh Mishary Rashid Alafasy*, *Sheikh Abdul Basit Abdul Samad*, *Sheikh Mahmoud Khalil Al-Husary*, *Sheikh Mohamed Siddiq Al-Minshawi*, *Sheikh Abdur-Rahman As-Sudais*, *Sheikh Saud Al-Shuraim*, *Sheikh Maher Al-Muaiqly*, *Sheikh Abu Bakr Al-Shatri*, *Sheikh Saad Al-Ghamadi*, and *Sheikh Hani Ar-Rifai* via EveryAyah.com & QuranCDN.
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
