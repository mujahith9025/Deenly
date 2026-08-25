import React, { useState } from 'react'
import { 
  Sparkles, 
  Compass, 
  BookOpen, 
  Check, 
  Copy, 
  Star
} from 'lucide-react'
import { DigitalTasbihEngine } from '../components/DigitalTasbihEngine'
import { useAuthStore } from '../store/useAuthStore'
import { useI18nStore } from '../lib/i18n'
import { getArabicFontFamily, type ArabicFontStyle } from '../lib/quranFonts'

// Authentic Daily Supplications (Hisnul Muslim)
interface DuaItem {
  id: string
  titleEn: string
  titleTa: string
  category: 'morning' | 'evening' | 'protection' | 'forgiveness' | 'anxiety'
  arabic: string
  transliteration: string
  translationEn: string
  translationTa: string
  reference: string
  referenceTa: string
}

const AUTHENTIC_DUAS: DuaItem[] = [
  {
    id: 'sayyidul_istighfar',
    titleEn: 'Sayyidul Istighfar (Chief of Forgiveness)',
    titleTa: 'ஸையிதுல் இஸ்திஃபார் (பாவமன்னிப்பின் தலைவர்)',
    category: 'forgiveness',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliteration: 'Allāhumma anta Rabbī lā ilāha illā ant, khalaqtanī wa anā ‘abduk, wa anā ‘alā ‘ahdika wa wa‘dika ma-staṭa‘t, a‘ūdhu bika min sharri mā ṣana‘t, abū’u laka bi-ni‘matika ‘alay, wa abū’u laka bi-dhanbī faghfir lī fa-innahū lā yaghfiru-dh-dhunūba illā ant.',
    translationEn: 'O Allah! You are my Lord; none has the right to be worshipped but You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favors upon me and I confess my sins. So forgive me, for none forgives sins except You.',
    translationTa: 'யா அல்லாஹ்! நீயே என் இறைவன். உன்னைத் தவிர வணக்கத்திற்குரியவன் யாருமில்லை. நீயே என்னை படைத்தாய்; நான் உன் அடிமை. என்னால் முடிந்த வரை உன் உடன்படிக்கையிலும் வாக்குறுதியிலும் நிலைத்திருக்கிறேன். நான் செய்த தீமைகளிலிருந்து உன்னிடம் பாதுகாப்புத் தேடுகிறேன். நீ எனக்கு அளித்த அருட்கொடைகளை ஒப்புக்கொள்கிறேன்; என் பாவங்களையும் ஒப்புக்கொள்கிறேன். எனவே என்னை மன்னித்தருள்வாயாக! நிச்சயமாக உன்னைத் தவிர வேறு எவரும் பாவங்களை மன்னிக்க முடியாது.',
    reference: 'Sahih al-Bukhari 6306',
    referenceTa: 'ஸஹீஹ் அல்-புகாரி 6306',
  },
  {
    id: 'morning_protection',
    titleEn: 'Protection in the Morning & Evening',
    titleTa: 'காலை மற்றும் மாலை நேரப் பாதுகாப்பு',
    category: 'morning',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration: 'Bismillāh-il-ladhī lā yaḍurru ma‘as-mihī shay’un fil-arḍi wa lā fis-samā’i wa huwas-Samī‘ul-‘Alīm.',
    translationEn: 'In the Name of Allah, with Whose Name nothing on the earth or in the heavens can cause harm, and He is the All-Hearing, the All-Knowing.',
    translationTa: 'எந்த அல்லாஹ்வின் திருப்பெயரைக் கொண்டு பூமியிலோ வானத்திலோ உள்ள எந்தப் பொருளும் தீங்கு செய்ய முடியாதோ அந்த அல்லாஹ்வின் திருப்பெயரால் (பாதுகாப்புத் தேடுகிறேன்); அவனே செவியேற்பவனாகவும் நன்கறிபவனாகவும் இருக்கிறான்.',
    reference: 'Sunan Abi Dawud 5088',
    referenceTa: 'ஸுனன் அபீதாவூத் 5088',
  },
  {
    id: 'anxiety_relief',
    titleEn: 'Du\'a for Anxiety, Grief & Distress',
    titleTa: 'கவலை மற்றும் துக்கத்தை நீக்கும் துஆ',
    category: 'anxiety',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ',
    transliteration: 'Allāhumma innī a‘ūdhu bika minal-hammi wal-ḥazan, wal-‘ajzi wal-kasal, wal-bukhli wal-jubn, wa ḍala‘id-dayni wa ghalabatir-rijāl.',
    translationEn: 'O Allah, I seek refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and from being overpowered by men.',
    translationTa: 'யா அல்லாஹ்! கவலை, துக்கம், இயலாமை, சோம்பல், கஞ்சத்தனம், கோழைத்தனம், கடனின் சுமை மற்றும் மனிதர்களின் அடக்குமுறை ஆகியவற்றிலிருந்து உன்னிடம் நான் பாதுகாப்புத் தேடுகிறேன்.',
    reference: 'Sahih al-Bukhari 2893',
    referenceTa: 'ஸஹீஹ் அல்-புகாரி 2893',
  },
  {
    id: 'after_prayer_kursi',
    titleEn: 'Ayat al-Kursi (After Every Obligatory Prayer)',
    titleTa: 'ஆயத்துல் குர்ஸீ (ஒவ்வொரு தொழுகைக்குப் பின்னும்)',
    category: 'protection',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ',
    transliteration: 'Allāhu lā ilāha illā huwal-Ḥayyul-Qayyūm, lā ta’khudhuhū sinatun wa lā nawm, lahū mā fis-samāwāti wa mā fil-arḍ...',
    translationEn: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep...',
    translationTa: 'அல்லாஹ் - அவனைத் தவிர வணக்கத்திற்குரிய இறைவன் வேறு யாருமில்லை; அவன் என்றென்றும் உயிருடன் இருப்பவன்; அனைத்தையும் காத்துப் பரிபாலிப்பவன்; அவனுக்கு சிறு உறக்கமோ ஆழ்ந்த தூக்கமோ ஏற்படாது...',
    reference: 'Sunan an-Nasa\'i (Kubra 9848)',
    referenceTa: 'ஸுனன் அந்-நஸாயீ (குப்ரா 9848)',
  },
]

// 99 Names of Allah sample
const ASMAUL_HUSNA_PREVIEWS = [
  { num: 1, arabic: 'الرَّحْمَٰنُ', nameEn: 'Ar-Rahmaan', nameTa: 'அர்-ரஹ்மான்', meanEn: 'The Entirely Merciful', meanTa: 'அளவற்ற அருளாளன்' },
  { num: 2, arabic: 'الرَّحِيمُ', nameEn: 'Ar-Raheem', nameTa: 'அர்-ரஹீம்', meanEn: 'The Especially Merciful', meanTa: 'நிகரற்ற அன்புடையோன்' },
  { num: 3, arabic: 'الْمَلِكُ', nameEn: 'Al-Malik', nameTa: 'அல்-மிலிக்', meanEn: 'The Sovereign King', meanTa: 'பேரரசன்' },
  { num: 4, arabic: 'الْقُدُّوسُ', nameEn: 'Al-Quddus', nameTa: 'அல்-குத்தூஸ்', meanEn: 'The Most Holy & Pure', meanTa: 'மிகப் பரிசுத்தமானவன்' },
  { num: 5, arabic: 'السَّلَامُ', nameEn: 'As-Salam', nameTa: 'அஸ்-ஸலாம்', meanEn: 'The Source of Peace', meanTa: 'சாந்தியளிப்பவன்' },
  { num: 6, arabic: 'الْمُؤْمِنُ', nameEn: 'Al-Mu\'min', nameTa: 'அல்-முஃமின்', meanEn: 'The Granter of Security', meanTa: 'அபயமளிப்பவன்' },
  { num: 7, arabic: 'الْمُهَيْمِنُ', nameEn: 'Al-Muhaymin', nameTa: 'அல்-முஹைமின்', meanEn: 'The Guardian & Protector', meanTa: 'பாதுகாவலன்' },
  { num: 8, arabic: 'الْعَزِيزُ', nameEn: 'Al-Azeez', nameTa: 'அல்-அஸீஸ்', meanEn: 'The Almighty & Invincible', meanTa: 'மிகைத்தவன்' },
]

export const ExploreScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const appLanguage = useI18nStore((state) => state.appLanguage)
  const isTamil = appLanguage === 'ta'
  const isTamilTranslation = appLanguage === 'ta' || user?.preferredTranslation === 'tamil'
  const fontStyle: ArabicFontStyle = user?.arabicFontStyle || 'madani'
  const arabicFontFamily = getArabicFontFamily(fontStyle)

  const [activeTab, setActiveTab] = useState<'tasbih' | 'duas' | 'asmaul_husna'>('tasbih')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [duaFilter, setDuaFilter] = useState<string>('all')

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const filteredDuas = duaFilter === 'all' 
    ? AUTHENTIC_DUAS 
    : AUTHENTIC_DUAS.filter((d) => d.category === duaFilter)

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* 🌟 EXPLORE HERO BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-br from-primary/15 via-surface-container to-surface-container-high border border-primary/25 relative overflow-hidden shadow-md">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold font-label-caps border border-primary/30 shadow-xs">
            <Compass className="w-3.5 h-3.5" />
            <span>{isTamil ? 'இஸ்லாமிய பொக்கிஷங்கள்' : 'Islamic Explorer'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight font-headline">
            {isTamil ? 'ஆன்மீக கருவிகள் & நபிகளாரின் சுன்னத் வழிகாட்டல்கள்' : 'Spiritual Sanctuary & Prophetic Tools'}
          </h1>

          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            {isTamil 
              ? 'டிஜிட்டல் தஸ்பீஹ், தினசரி திக்ர் இலக்குகள், ஆதாரப்பூர்வமான துஆக்கள் மற்றும் அல்லாஹ்வின் திருநாமங்களை ஆராயுங்கள்.' 
              : 'Master your daily Dhikr targets with the Interactive Digital Tasbih Studio, authentic Prophetic Du\'as, and Asmaul Husna.'
            }
          </p>
        </div>

        {/* Ambient Decorative Background Orb */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      </div>

      {/* 🌟 EXPLORE NAVIGATION TABS */}
      <div className="flex items-center gap-3 border-b border-outline-variant/25 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'tasbih', labelEn: 'Digital Tasbih & Dhikr Studio', labelTa: 'டிஜிட்டல் தஸ்பீஹ் & திக்ர்', icon: Sparkles },
          { id: 'duas', labelEn: 'Authentic Daily Du\'as (Hisnul Muslim)', labelTa: 'தினசரி துஆக்கள் (ஹிஸ்னுல் முஸ்லிம்)', icon: BookOpen },
          { id: 'asmaul_husna', labelEn: '99 Names of Allah (Asmaul Husna)', labelTa: 'அல்லாஹ்வின் 99 திருநாமங்கள்', icon: Star },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer border ${
                isActive
                  ? 'bg-primary text-on-primary border-primary shadow-md'
                  : 'bg-surface-container/60 text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-high'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isTamil ? tab.labelTa : tab.labelEn}</span>
            </button>
          )
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. 📿 TAB 1: INTERACTIVE DIGITAL TASBIH & FULL DHIKR STUDIO ENGINE       */}
      {/* ========================================================================= */}
      {activeTab === 'tasbih' && (
        <div className="space-y-6">
          <DigitalTasbihEngine />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. 🤲 TAB 2: AUTHENTIC DAILY DU'AS (HISNUL MUSLIM)                       */}
      {/* ========================================================================= */}
      {activeTab === 'duas' && (
        <div className="space-y-6">
          
          {/* Dua Category Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', labelEn: 'All Du\'as', labelTa: 'அனைத்து துஆக்கள்' },
              { id: 'morning', labelEn: 'Morning & Protection', labelTa: 'காலை & பாதுகாப்பு' },
              { id: 'forgiveness', labelEn: 'Forgiveness (Istighfar)', labelTa: 'பாவமன்னிப்பு' },
              { id: 'anxiety', labelEn: 'Anxiety & Relief', labelTa: 'கவலை & மன அமைதி' },
              { id: 'protection', labelEn: 'After Prayer', labelTa: 'தொழுகைக்குப் பின்' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setDuaFilter(cat.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  duaFilter === cat.id
                    ? 'bg-secondary text-on-secondary border-secondary shadow-sm font-bold'
                    : 'bg-surface-container/70 text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-high'
                }`}
              >
                {isTamil ? cat.labelTa : cat.labelEn}
              </button>
            ))}
          </div>

          {/* Duas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDuas.map((dua) => (
              <div
                key={dua.id}
                className="p-6 rounded-3xl glass-card border border-outline-variant/30 space-y-4 shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider font-label-caps">
                      {isTamil ? dua.titleTa : dua.titleEn}
                    </span>
                    
                    <button
                      onClick={() => handleCopy(dua.id, `${dua.arabic}\n\n${dua.translationEn}`)}
                      className="p-1.5 rounded-xl hover:bg-surface-container-high text-outline hover:text-on-surface transition cursor-pointer"
                      title="Copy Du'a"
                    >
                      {copiedId === dua.id ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Arabic Script */}
                  <p 
                    className="text-xl sm:text-2xl text-on-surface text-right leading-relaxed pt-2"
                    style={{ fontFamily: arabicFontFamily }}
                    dir="rtl"
                  >
                    {dua.arabic}
                  </p>

                  {/* Transliteration */}
                  <p className="text-xs text-secondary font-medium leading-relaxed">
                    {dua.transliteration}
                  </p>

                  {/* Translation */}
                  <p className="text-xs sm:text-sm text-on-surface-variant italic leading-relaxed">
                    "{isTamilTranslation ? dua.translationTa : dua.translationEn}"
                  </p>
                </div>

                {/* Reference Source */}
                <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-[11px] text-outline font-semibold">
                  <span>{isTamil ? 'ஆதாரம்' : 'Reference'}:</span>
                  <span className="text-on-surface-variant">{isTamil ? dua.referenceTa : dua.reference}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. 🌟 TAB 3: 99 BEAUTIFUL NAMES OF ALLAH (ASMAUL HUSNA)                  */}
      {/* ========================================================================= */}
      {activeTab === 'asmaul_husna' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/20 text-xs text-on-surface-variant">
            <p>
              {isTamil
                ? 'நபி ﷺ கூறினார்கள்: "அல்லாஹ்விற்கு தொண்ணூற்று ஒன்பது திருப்பெயர்கள் உள்ளன. அவற்றை மனனமிட்டு நம்பிக்கையுடன் விளங்குபவர் சொர்க்கத்தில் நுழைவார்." (ஸஹீஹ் புகாரி 2736)'
                : 'The Prophet ﷺ said: "Allah has ninety-nine Names, one hundred less one; and he who memorizes them and believes in their meanings will enter Paradise." (Sahih al-Bukhari 2736)'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ASMAUL_HUSNA_PREVIEWS.map((name) => (
              <div
                key={name.num}
                className="p-5 rounded-3xl glass-card border border-outline-variant/30 space-y-2 shadow-sm text-center hover:border-primary/40 transition"
              >
                <span className="w-7 h-7 rounded-full bg-surface-container-high text-[11px] font-bold text-outline inline-flex items-center justify-center">
                  {name.num}
                </span>

                <p 
                  className="text-2xl font-bold text-on-surface py-1"
                  style={{ fontFamily: arabicFontFamily }}
                  dir="rtl"
                >
                  {name.arabic}
                </p>

                <p className="text-xs font-bold text-primary">
                  {isTamil ? name.nameTa : name.nameEn}
                </p>

                <p className="text-[11px] text-on-surface-variant italic">
                  {isTamil ? name.meanTa : name.meanEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
