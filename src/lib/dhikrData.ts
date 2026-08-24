export interface DhikrItem {
  id: string
  arabic: string
  transliteration: string
  translationEn: string
  translationTa: string
  virtueEn: string
  virtueTa: string
  reference: string
  referenceTa: string
  defaultTarget: number
  category: 'after_prayer' | 'daily' | 'forgiveness' | 'salawat'
}

export const DHIKR_PRESETS: DhikrItem[] = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ ٱللَّهِ',
    transliteration: 'Subḥān Allāh',
    translationEn: 'Glory be to Allah',
    translationTa: 'அல்லாஹ் மிகத் தூய்மையானவன்',
    virtueEn: 'Plants a date-palm tree for the reciter in Paradise and wipes away sins.',
    virtueTa: 'இதனை ஓதுபவருக்கு சொர்க்கத்தில் பேரீச்ச மரம் நடப்படும்; பாவங்கள் மன்னிக்கப்படும்.',
    reference: 'Sahih Muslim 2698',
    referenceTa: 'ஸஹீஹ் முஸ்லிம் 2698',
    defaultTarget: 33,
    category: 'after_prayer',
  },
  {
    id: 'alhamdulillah',
    arabic: 'ٱلْحَمْدُ لِلَّهِ',
    transliteration: 'Al-ḥamdu lillāh',
    translationEn: 'All Praise is due to Allah',
    translationTa: 'எல்லாப் புகழும் அல்லாஹ்வுக்கே',
    virtueEn: 'Fills the divine scales of good deeds to the brim on the Day of Resurrection.',
    virtueTa: 'மறுமை நாளில் நன்மைகளின் தராசை முழுமையாக நிரப்புகிறது.',
    reference: 'Sahih Muslim 223',
    referenceTa: 'ஸஹீஹ் முஸ்லிம் 223',
    defaultTarget: 33,
    category: 'after_prayer',
  },
  {
    id: 'allahu_akbar',
    arabic: 'ٱللَّهُ أَكْبَرُ',
    transliteration: 'Allāhu Akbar',
    translationEn: 'Allah is the Greatest',
    translationTa: 'அல்லாஹ் மிகப் பெரியவன்',
    virtueEn: 'Reciting it with SubhanAllah & Alhamdulillah completes the Sunnah post-prayer remembrance.',
    virtueTa: 'தொழுகைக்குப் பின் சுப்ஹானல்லாஹ் மற்றும் அல்ஹம்துலில்லாஹ்வுடன் ஓதுவது சுன்னத்.',
    reference: 'Sahih al-Bukhari 843',
    referenceTa: 'ஸஹீஹ் அல்-புகாரி 843',
    defaultTarget: 34,
    category: 'after_prayer',
  },
  {
    id: 'astaghfirullah',
    arabic: 'أَسْتَغْفِرُ ٱللَّهَ',
    transliteration: 'Astaghfirullāh',
    translationEn: 'I seek forgiveness from Allah',
    translationTa: 'அல்லாஹ்விடம் பாவமன்னிப்புக் கோருகிறேன்',
    virtueEn: 'The Prophet ﷺ sought forgiveness more than 70 to 100 times daily; it relieves anxiety and expands provision.',
    virtueTa: 'நபி ﷺ அவர்கள் தினமும் 70 முதல் 100 முறை பாவமன்னிப்புக் கோரினார்கள்; இது கவலைகளை நீக்கி வாழ்வாதாரத்தை அதிகரிக்கும்.',
    reference: 'Sahih al-Bukhari 6307',
    referenceTa: 'ஸஹீஹ் அல்-புகாரி 6307',
    defaultTarget: 100,
    category: 'forgiveness',
  },
  {
    id: 'la_ilaha_illallah',
    arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّهُ',
    transliteration: 'Lā ilāha illallāh',
    translationEn: 'There is no deity worthy of worship except Allah',
    translationTa: 'வணக்கத்திற்குரியவன் அல்லாஹ்வைத் தவிர வேறு யாருமில்லை',
    virtueEn: 'The best form of remembrance and the highest branch of faith.',
    virtueTa: 'திக்ருகளிலேயே மிகச் சிறந்தது மற்றும் ஈமானின் உச்சக்கட்ட கிளையாகும்.',
    reference: 'Jami` at-Tirmidhi 3383',
    referenceTa: 'ஜாமிஉத் திர்மிதி 3383',
    defaultTarget: 100,
    category: 'daily',
  },
  {
    id: 'subhanallahi_wa_bihamdihi',
    arabic: 'سُبْحَانَ ٱللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ ٱللَّهِ ٱلْعَظِيمِ',
    transliteration: 'Subḥānallāhi wa bi-ḥamdih, Subḥānallāhil-‘Aẓīm',
    translationEn: 'Glory be to Allah and His is the praise; Glory be to Allah the Almighty',
    translationTa: 'அல்லாஹ்வின் புகழைக் கூறி அவனைத் துதிக்கிறேன்; மகத்தான அல்லாஹ் மிகத் தூயவன்',
    virtueEn: 'Two phrases beloved to the Most Merciful, light upon the tongue, heavy on the scales.',
    virtueTa: 'அளவற்ற அருளாளனுக்கு மிகவும் பிரியமான, நாவில் இலகுவான, தராசில் மிகக் கனமான இரு வார்த்தைகள்.',
    reference: 'Sahih al-Bukhari 6406',
    referenceTa: 'ஸஹீஹ் அல்-புகாரி 6406',
    defaultTarget: 100,
    category: 'daily',
  },
  {
    id: 'la_hawla',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّهِ',
    transliteration: 'Lā ḥawla wa lā quwwata illā billāh',
    translationEn: 'There is no power nor strength except through Allah',
    translationTa: 'அல்லாஹ்வின் உதவியின்றி எவ்வித ஆற்றலும் சக்தியும் இல்லை',
    virtueEn: 'One of the precious treasures from beneath the Throne of the Most Merciful in Jannah.',
    virtueTa: 'சொர்க்கத்தின் பொக்கிஷங்களில் ஒன்றான அரிய வார்த்தையாகும்.',
    reference: 'Sahih al-Bukhari 6384',
    referenceTa: 'ஸஹீஹ் அல்-புகாரி 6384',
    defaultTarget: 33,
    category: 'daily',
  },
  {
    id: 'salawat',
    arabic: 'ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ',
    transliteration: 'Allāhumma ṣalli ‘alā Muḥammad wa ‘alā āli Muḥammad',
    translationEn: 'O Allah, send blessings upon Muhammad and upon the family of Muhammad',
    translationTa: 'யா அல்லாஹ்! முஹம்மத் (ஸல்) அவர்களின் மீதும் அவர்களின் குடும்பத்தார் மீதும் அருள்புரிவாயாக',
    virtueEn: 'Whoever sends one blessing upon the Prophet ﷺ, Allah will send ten blessings upon him.',
    virtueTa: 'நபி ﷺ அவர்கள் மீது ஒருமுறை ஸலவாத் கூறுபவருக்கு அல்லாஹ் பத்து நன்மைகளை வழங்கி பத்து பாவங்களை மன்னிக்கிறான்.',
    reference: 'Sahih Muslim 408',
    referenceTa: 'ஸஹீஹ் முஸ்லிம் 408',
    defaultTarget: 33,
    category: 'salawat',
  },
]
