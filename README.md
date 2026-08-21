# 🌙 Deenly (دينلي) — Quran Reading & Spiritual Habit Tracking

**Deenly** is a high-performance, dark cosmic-themed Quran reading and Islamic habit-tracking progressive web application designed for spiritual reflection, daily recitation consistency, and accurate Hasanat accumulation.

---

## 🌟 Key Features

### 📖 Authentic Quran Reading Experience
- **Diacritic-Aware Arabic Typography**: Beautiful Noto Serif Uthmani script rendering with responsive typography scaling via CSS variables.
- **Precomputed Arabic Letter Counts**: Precise isolation of Quranic letters yielding **10 Hasanat points per letter** in accordance with authentic Hadith (*Sunan at-Tirmidhi 2910*).
- **Multi-Language Translations**: Simultaneous dual-language storage for **English** (*Sahih International*) and **தமிழ்** (*Abdul Hameed Baqavi*), switchable in real time without network refetches.
- **Offline First**: IndexedDB caching (`deenly_quran_cache`) ensuring chapters load instantly even without internet connectivity.

### ⏱️ Hasanat & Reading Session Engine
- **Live Session Timer**: Tracks active recitation duration down to the second.
- **Live Floating Hasanat Badges**: Real-time visual reward feedback (`+770 Hasanat`) as ayahs are recited and marked complete.
- **Dynamic Juz Progress**: Live calculation of active Juz completion percentages and remaining verses.
- **Khatm Milestones**: Real-time progress bar tracking progress through the 604 pages of the Holy Quran.

### 🔄 Multi-Device Realtime Sync & Offline Queue
- **Additive Delta Merge**: Counters (`deltaHasanat`, `deltaVerses`, `deltaTimeSeconds`, `deltaPages`) merge additively across concurrent devices, preventing accidental stat overwrites when reading on multiple devices simultaneously.
- **Offline Reconciliation**: Automatically buffers sessions in local storage when offline and flushes cleanly upon network reconnection.
- **Cross-Tab Synchronization**: Powered by browser `BroadcastChannel` and Supabase Realtime Channels.

### 🎯 Responsive Command Center
- **Mobile** (`< 768px`): Floating bottom navigation bar, 2x2 spiritual metrics grid, and single-column reader.
- **Tablet** (`768px - 1023px`): Vertical icon rail and single 4-card metric row.
- **Desktop** (`>= 1024px`): Collapsible sidebar (`w-64` $\leftrightarrow$ `w-20`), 3-column dashboard with a dedicated Suggested Surahs right rail, and a two-column Quran reader with sticky session control panel.

---

## 🏗️ Architecture & Technology Stack

```
deenly/
├── src/
│   ├── components/       # Reusable UI components (Sidebar, BottomNav, Header, ConnectionStatus)
│   ├── hooks/            # Custom hooks (useAuth)
│   ├── lib/              # Core business engines & data pipelines
│   │   ├── authService.ts        # Supabase OAuth & Email auth wrapper
│   │   ├── hasanatEngine.ts      # Pure math & streak calculation engine
│   │   ├── logger.ts             # Telemetry & silent error mitigation logger
│   │   ├── quranApi.ts           # Quran CDN fetcher & letter-counting pipeline
│   │   ├── quranCache.ts         # IndexedDB & memory caching layer
│   │   ├── quranMetadata.ts      # Static 114 Surahs & 30 Juz catalog
│   │   ├── supabase.ts           # Supabase client & environment checker
│   │   └── syncService.ts        # Multi-device Realtime & BroadcastChannel sync
│   ├── screens/          # Primary route screens (Dashboard, Reading, Settings, etc.)
│   ├── store/            # Zustand stores (useAuthStore, useReadingStore)
│   └── types/            # TypeScript domain interfaces
├── scripts/              # Automated verification & test pipelines
├── public/               # Static assets & brand icons
├── vercel.json           # Vercel SPA routing & cache configuration
├── netlify.toml          # Netlify SPA routing configuration
└── vite.config.ts        # Vite configuration
```

---

## 📜 Quran Data Source & Attribution

- **Arabic Quran Text**: Verified Uthmani script sourced from Tanzil / King Fahd Glorious Quran Printing Complex via `fawazahmed0/quran-api` (`ara-quranacademy`).
- **English Translation**: Sahih International (*Umm Muhammad*), distributed under Creative Commons Attribution.
- **Tamil Translation (தமிழ்)**: Jan Turst Foundation / Abdul Hameed Baqavi (*அப்துல் ஹமீது பாகவி*).
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
# Supabase Configuration (Optional: Deenly operates in guest mode if omitted)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- npm 9+

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/your-username/deenly.git
cd deenly

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Run automated test suites
npm test
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

## 🚢 Deployment

### Deploy to Vercel
```bash
npx vercel --prod
```

### Deploy to Netlify
```bash
npx netlify deploy --prod
```

---

## 📄 License
This project is licensed under the MIT License.
