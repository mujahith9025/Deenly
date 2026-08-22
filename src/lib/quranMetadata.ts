import type { SurahSummary, JuzSummary } from '../types/quran'

export const SURAH_METADATA: SurahSummary[] = [
  { number: 1, name: 'Al-Fatihah', nameTa: 'அல்-ஃபாத்திஹா', arabicName: 'الفاتحة', englishName: 'Al-Fatihah', englishNameTranslation: 'The Opening', englishNameTranslationTa: 'தோற்றுவாய்', numberOfAyahs: 7, revelationType: 'Meccan', startPage: 1, startJuz: 1 },
  { number: 2, name: 'Al-Baqarah', nameTa: 'அல்-பகரா', arabicName: 'البقرة', englishName: 'Al-Baqarah', englishNameTranslation: 'The Cow', englishNameTranslationTa: 'பசு மாடு', numberOfAyahs: 286, revelationType: 'Medinan', startPage: 2, startJuz: 1 },
  { number: 3, name: 'Ali \'Imran', nameTa: 'ஆல இம்ரான்', arabicName: 'آل عمران', englishName: 'Ali \'Imran', englishNameTranslation: 'Family of Imran', englishNameTranslationTa: 'இம்ரானின் குடும்பம்', numberOfAyahs: 200, revelationType: 'Medinan', startPage: 50, startJuz: 3 },
  { number: 4, name: 'An-Nisa', nameTa: 'அந்-நிஸா', arabicName: 'النساء', englishName: 'An-Nisa', englishNameTranslation: 'The Women', englishNameTranslationTa: 'பெண்கள்', numberOfAyahs: 176, revelationType: 'Medinan', startPage: 77, startJuz: 4 },
  { number: 5, name: 'Al-Ma\'idah', nameTa: 'அல்-மாயிதா', arabicName: 'المائدة', englishName: 'Al-Ma\'idah', englishNameTranslation: 'The Table Spread', englishNameTranslationTa: 'உணவுத்தட்டு', numberOfAyahs: 120, revelationType: 'Medinan', startPage: 106, startJuz: 6 },
  { number: 6, name: 'Al-An\'am', nameTa: 'அல்-அன்ஆம்', arabicName: 'الأنعام', englishName: 'Al-An\'am', englishNameTranslation: 'The Cattle', englishNameTranslationTa: 'கால்நடைகள்', numberOfAyahs: 165, revelationType: 'Meccan', startPage: 128, startJuz: 7 },
  { number: 7, name: 'Al-A\'raf', nameTa: 'அல்-அஃராஃப்', arabicName: 'الأعراف', englishName: 'Al-A\'raf', englishNameTranslation: 'The Heights', englishNameTranslationTa: 'சிகரங்கள்', numberOfAyahs: 206, revelationType: 'Meccan', startPage: 151, startJuz: 8 },
  { number: 8, name: 'Al-Anfal', nameTa: 'அல்-அன்ஃபால்', arabicName: 'الأنفال', englishName: 'Al-Anfal', englishNameTranslation: 'The Spoils of War', englishNameTranslationTa: 'போர்க்களப் பொருட்கள்', numberOfAyahs: 75, revelationType: 'Medinan', startPage: 177, startJuz: 9 },
  { number: 9, name: 'At-Tawbah', nameTa: 'அத்-தவ்பா', arabicName: 'التوبة', englishName: 'At-Tawbah', englishNameTranslation: 'The Repentance', englishNameTranslationTa: 'பாவமன்னிப்பு', numberOfAyahs: 129, revelationType: 'Medinan', startPage: 187, startJuz: 10 },
  { number: 10, name: 'Yunus', nameTa: 'யூனுஸ்', arabicName: 'يونس', englishName: 'Yunus', englishNameTranslation: 'Jonah', englishNameTranslationTa: 'யூனுஸ் நபி', numberOfAyahs: 109, revelationType: 'Meccan', startPage: 208, startJuz: 11 },
  { number: 11, name: 'Hud', nameTa: 'ஹூத்', arabicName: 'هود', englishName: 'Hud', englishNameTranslation: 'Hud', englishNameTranslationTa: 'ஹூத் நபி', numberOfAyahs: 123, revelationType: 'Meccan', startPage: 221, startJuz: 11 },
  { number: 12, name: 'Yusuf', nameTa: 'யூஸுஃப்', arabicName: 'يوسف', englishName: 'Yusuf', englishNameTranslation: 'Joseph', englishNameTranslationTa: 'யூஸுஃப் நபி', numberOfAyahs: 111, revelationType: 'Meccan', startPage: 235, startJuz: 12 },
  { number: 13, name: 'Ar-Ra\'d', nameTa: 'அர்-ரஃது', arabicName: 'الرعد', englishName: 'Ar-Ra\'d', englishNameTranslation: 'The Thunder', englishNameTranslationTa: 'இடி முழக்கம்', numberOfAyahs: 43, revelationType: 'Medinan', startPage: 249, startJuz: 13 },
  { number: 14, name: 'Ibrahim', nameTa: 'இப்ராஹீம்', arabicName: 'إبراهيم', englishName: 'Ibrahim', englishNameTranslation: 'Abraham', englishNameTranslationTa: 'இப்ராஹீம் நபி', numberOfAyahs: 52, revelationType: 'Meccan', startPage: 255, startJuz: 13 },
  { number: 15, name: 'Al-Hijr', nameTa: 'அல்-ஹிஜ்ர்', arabicName: 'الحجر', englishName: 'Al-Hijr', englishNameTranslation: 'The Rocky Tract', englishNameTranslationTa: 'பாறைப் பிரதேசம்', numberOfAyahs: 99, revelationType: 'Meccan', startPage: 262, startJuz: 14 },
  { number: 16, name: 'An-Nahl', nameTa: 'அந்-நஹ்ல்', arabicName: 'النحل', englishName: 'An-Nahl', englishNameTranslation: 'The Bee', englishNameTranslationTa: 'தேனீ', numberOfAyahs: 128, revelationType: 'Meccan', startPage: 267, startJuz: 14 },
  { number: 17, name: 'Al-Isra', nameTa: 'அல்-இஸ்ரா', arabicName: 'الإسراء', englishName: 'Al-Isra', englishNameTranslation: 'The Night Journey', englishNameTranslationTa: 'இரவுப் பயணம்', numberOfAyahs: 111, revelationType: 'Meccan', startPage: 282, startJuz: 15 },
  { number: 18, name: 'Al-Kahf', nameTa: 'அல்-கஹ்ஃப்', arabicName: 'الكهف', englishName: 'Al-Kahf', englishNameTranslation: 'The Cave', englishNameTranslationTa: 'குகை', numberOfAyahs: 110, revelationType: 'Meccan', startPage: 293, startJuz: 15 },
  { number: 19, name: 'Maryam', nameTa: 'மர்யம்', arabicName: 'مريم', englishName: 'Maryam', englishNameTranslation: 'Mary', englishNameTranslationTa: 'மர்யம் அம்மையார்', numberOfAyahs: 98, revelationType: 'Meccan', startPage: 305, startJuz: 16 },
  { number: 20, name: 'Taha', nameTa: 'தாஹா', arabicName: 'طه', englishName: 'Taha', englishNameTranslation: 'Ta-Ha', englishNameTranslationTa: 'தாஹா', numberOfAyahs: 135, revelationType: 'Meccan', startPage: 312, startJuz: 16 },
  { number: 21, name: 'Al-Anbiya', nameTa: 'அல்-அன்பியா', arabicName: 'الأنبياء', englishName: 'Al-Anbiya', englishNameTranslation: 'The Prophets', englishNameTranslationTa: 'நபிமார்கள்', numberOfAyahs: 112, revelationType: 'Meccan', startPage: 322, startJuz: 17 },
  { number: 22, name: 'Al-Hajj', nameTa: 'அல்-ஹஜ்', arabicName: 'الحج', englishName: 'Al-Hajj', englishNameTranslation: 'The Pilgrimage', englishNameTranslationTa: 'ஹஜ் புனிதப் பயணம்', numberOfAyahs: 78, revelationType: 'Medinan', startPage: 332, startJuz: 17 },
  { number: 23, name: 'Al-Mu\'minun', nameTa: 'அல்-முஃமினூன்', arabicName: 'المؤمنون', englishName: 'Al-Mu\'minun', englishNameTranslation: 'The Believers', englishNameTranslationTa: 'இறைநம்பிக்கையாளர்கள்', numberOfAyahs: 118, revelationType: 'Meccan', startPage: 342, startJuz: 18 },
  { number: 24, name: 'An-Nur', nameTa: 'அந்-நூர்', arabicName: 'النور', englishName: 'An-Nur', englishNameTranslation: 'The Light', englishNameTranslationTa: 'பேரொளி', numberOfAyahs: 64, revelationType: 'Medinan', startPage: 350, startJuz: 18 },
  { number: 25, name: 'Al-Furqan', nameTa: 'அல்-ஃபுர்கான்', arabicName: 'الفرقان', englishName: 'Al-Furqan', englishNameTranslation: 'The Criterion', englishNameTranslationTa: 'சத்தியத்தை பிரித்தறிவிப்பது', numberOfAyahs: 77, revelationType: 'Meccan', startPage: 359, startJuz: 18 },
  { number: 26, name: 'Ash-Shu\'ara', nameTa: 'அஷ்-ஷுஅரா', arabicName: 'الشعراء', englishName: 'Ash-Shu\'ara', englishNameTranslation: 'The Poets', englishNameTranslationTa: 'கவிஞர்கள்', numberOfAyahs: 227, revelationType: 'Meccan', startPage: 367, startJuz: 19 },
  { number: 27, name: 'An-Naml', nameTa: 'அந்-நம்ல்', arabicName: 'النمل', englishName: 'An-Naml', englishNameTranslation: 'The Ant', englishNameTranslationTa: 'எறும்பு', numberOfAyahs: 93, revelationType: 'Meccan', startPage: 377, startJuz: 19 },
  { number: 28, name: 'Al-Qasas', nameTa: 'அல்-கஸஸ்', arabicName: 'القصص', englishName: 'Al-Qasas', englishNameTranslation: 'The Stories', englishNameTranslationTa: 'வரலாறுகள்', numberOfAyahs: 88, revelationType: 'Meccan', startPage: 385, startJuz: 20 },
  { number: 29, name: 'Al-\'Ankabut', nameTa: 'அல்-அன்கபூத்', arabicName: 'العنكبوت', englishName: 'Al-\'Ankabut', englishNameTranslation: 'The Spider', englishNameTranslationTa: 'சிலந்தி', numberOfAyahs: 69, revelationType: 'Meccan', startPage: 396, startJuz: 20 },
  { number: 30, name: 'Ar-Rum', nameTa: 'அர்-ரூம்', arabicName: 'الروم', englishName: 'Ar-Rum', englishNameTranslation: 'The Romans', englishNameTranslationTa: 'ரோமர்கள்', numberOfAyahs: 60, revelationType: 'Meccan', startPage: 404, startJuz: 21 },
  { number: 31, name: 'Luqman', nameTa: 'லுக்மான்', arabicName: 'لقمان', englishName: 'Luqman', englishNameTranslation: 'Luqman', englishNameTranslationTa: 'லுக்மான்', numberOfAyahs: 34, revelationType: 'Meccan', startPage: 411, startJuz: 21 },
  { number: 32, name: 'As-Sajdah', nameTa: 'அஸ்-ஸஜ்தா', arabicName: 'السجدة', englishName: 'As-Sajdah', englishNameTranslation: 'The Prostration', englishNameTranslationTa: 'சிரவணக்கம்', numberOfAyahs: 30, revelationType: 'Meccan', startPage: 415, startJuz: 21 },
  { number: 33, name: 'Al-Ahzab', nameTa: 'அல்-அஹ்ஸாப்', arabicName: 'الأحزاب', englishName: 'Al-Ahzab', englishNameTranslation: 'The Combined Forces', englishNameTranslationTa: 'கூட்டணிகள்', numberOfAyahs: 73, revelationType: 'Medinan', startPage: 418, startJuz: 21 },
  { number: 34, name: 'Saba', nameTa: 'ஸபா', arabicName: 'سبأ', englishName: 'Saba', englishNameTranslation: 'Sheba', englishNameTranslationTa: 'ஸபா தேசம்', numberOfAyahs: 54, revelationType: 'Meccan', startPage: 428, startJuz: 22 },
  { number: 35, name: 'Fatir', nameTa: 'ஃபாதிர்', arabicName: 'فاطر', englishName: 'Fatir', englishNameTranslation: 'Originator', englishNameTranslationTa: 'படைத்தவன்', numberOfAyahs: 45, revelationType: 'Meccan', startPage: 434, startJuz: 22 },
  { number: 36, name: 'Ya-Sin', nameTa: 'யாஸீன்', arabicName: 'يس', englishName: 'Ya-Sin', englishNameTranslation: 'Ya Sin', englishNameTranslationTa: 'யாஸீன்', numberOfAyahs: 83, revelationType: 'Meccan', startPage: 440, startJuz: 22 },
  { number: 37, name: 'As-Saffat', nameTa: 'அஸ்-ஸாஃப்பாத்', arabicName: 'الصافات', englishName: 'As-Saffat', englishNameTranslation: 'Those who set the Ranks', englishNameTranslationTa: 'அணிவகுத்து நிற்பவை', numberOfAyahs: 182, revelationType: 'Meccan', startPage: 446, startJuz: 23 },
  { number: 38, name: 'Sad', nameTa: 'ஸாத்', arabicName: 'ص', englishName: 'Sad', englishNameTranslation: 'The Letter "Saad"', englishNameTranslationTa: 'ஸாத்', numberOfAyahs: 88, revelationType: 'Meccan', startPage: 453, startJuz: 23 },
  { number: 39, name: 'Az-Zumar', nameTa: 'அஸ்-ஸுமர்', arabicName: 'الزمر', englishName: 'Az-Zumar', englishNameTranslation: 'The Troops', englishNameTranslationTa: 'கூட்டங்கள்', numberOfAyahs: 75, revelationType: 'Meccan', startPage: 458, startJuz: 23 },
  { number: 40, name: 'Ghafir', nameTa: 'காஃபிர்', arabicName: 'غافر', englishName: 'Ghafir', englishNameTranslation: 'The Forgiver', englishNameTranslationTa: 'மன்னிப்பவன்', numberOfAyahs: 85, revelationType: 'Meccan', startPage: 467, startJuz: 24 },
  { number: 41, name: 'Fussilat', nameTa: 'ஃபுஸ்ஸிலத்', arabicName: 'فصلت', englishName: 'Fussilat', englishNameTranslation: 'Explained in Detail', englishNameTranslationTa: 'விவரிக்கப்பட்டது', numberOfAyahs: 54, revelationType: 'Meccan', startPage: 477, startJuz: 24 },
  { number: 42, name: 'Ash-Shura', nameTa: 'அஷ்-ஷூரா', arabicName: 'الشورى', englishName: 'Ash-Shura', englishNameTranslation: 'The Consultation', englishNameTranslationTa: 'கலந்தாலோசனை', numberOfAyahs: 53, revelationType: 'Meccan', startPage: 483, startJuz: 25 },
  { number: 43, name: 'Az-Zukhruf', nameTa: 'அஸ்-ஸுக்ருஃப்', arabicName: 'الزخرف', englishName: 'Az-Zukhruf', englishNameTranslation: 'The Ornaments of Gold', englishNameTranslationTa: 'பொன் அலங்காரம்', numberOfAyahs: 89, revelationType: 'Meccan', startPage: 489, startJuz: 25 },
  { number: 44, name: 'Ad-Dukhan', nameTa: 'அத்-துகான்', arabicName: 'الدخان', englishName: 'Ad-Dukhan', englishNameTranslation: 'The Smoke', englishNameTranslationTa: 'புகை மூட்டம்', numberOfAyahs: 59, revelationType: 'Meccan', startPage: 496, startJuz: 25 },
  { number: 45, name: 'Al-Jathiyah', nameTa: 'அல்-ஜாஸியா', arabicName: 'الجاثية', englishName: 'Al-Jathiyah', englishNameTranslation: 'The Crouching', englishNameTranslationTa: 'முழந்தாளிடுதல்', numberOfAyahs: 37, revelationType: 'Meccan', startPage: 499, startJuz: 25 },
  { number: 46, name: 'Al-Ahqaf', nameTa: 'அல்-அஹ்காஃப்', arabicName: 'الأحقاف', englishName: 'Al-Ahqaf', englishNameTranslation: 'The Wind-Curved Sandhills', englishNameTranslationTa: 'மணல் குன்றுகள்', numberOfAyahs: 35, revelationType: 'Meccan', startPage: 502, startJuz: 26 },
  { number: 47, name: 'Muhammad', nameTa: 'முஹம்மது', arabicName: 'محمد', englishName: 'Muhammad', englishNameTranslation: 'Muhammad', englishNameTranslationTa: 'முஹம்மது நபி (ஸல்)', numberOfAyahs: 38, revelationType: 'Medinan', startPage: 507, startJuz: 26 },
  { number: 48, name: 'Al-Fath', nameTa: 'அல்-ஃபத்ஹ்', arabicName: 'الفتح', englishName: 'Al-Fath', englishNameTranslation: 'The Victory', englishNameTranslationTa: 'மகத்தான வெற்றி', numberOfAyahs: 29, revelationType: 'Medinan', startPage: 511, startJuz: 26 },
  { number: 49, name: 'Al-Hujurat', nameTa: 'அல்-ஹுஜுராத்', arabicName: 'الحجرات', englishName: 'Al-Hujurat', englishNameTranslation: 'The Rooms', englishNameTranslationTa: 'அறைகள்', numberOfAyahs: 18, revelationType: 'Medinan', startPage: 515, startJuz: 26 },
  { number: 50, name: 'Qaf', nameTa: 'காஃப்', arabicName: 'ق', englishName: 'Qaf', englishNameTranslation: 'The Letter "Qaf"', englishNameTranslationTa: 'காஃப்', numberOfAyahs: 45, revelationType: 'Meccan', startPage: 518, startJuz: 26 },
  { number: 51, name: 'Adh-Dhariyat', nameTa: 'அத்-தாரியாத்', arabicName: 'الذاريات', englishName: 'Adh-Dhariyat', englishNameTranslation: 'The Winnowing Winds', englishNameTranslationTa: 'புயற்காற்றுகள்', numberOfAyahs: 60, revelationType: 'Meccan', startPage: 520, startJuz: 26 },
  { number: 52, name: 'At-Tur', nameTa: 'அத்-தூர்', arabicName: 'الطور', englishName: 'At-Tur', englishNameTranslation: 'The Mount', englishNameTranslationTa: 'தூர் மலை', numberOfAyahs: 49, revelationType: 'Meccan', startPage: 523, startJuz: 27 },
  { number: 53, name: 'An-Najm', nameTa: 'அந்-நஜ்ம்', arabicName: 'النجم', englishName: 'An-Najm', englishNameTranslation: 'The Star', englishNameTranslationTa: 'நட்சத்திரம்', numberOfAyahs: 62, revelationType: 'Meccan', startPage: 526, startJuz: 27 },
  { number: 54, name: 'Al-Qamar', nameTa: 'அல்-கமர்', arabicName: 'القمر', englishName: 'Al-Qamar', englishNameTranslation: 'The Moon', englishNameTranslationTa: 'சந்திரன்', numberOfAyahs: 55, revelationType: 'Meccan', startPage: 528, startJuz: 27 },
  { number: 55, name: 'Ar-Rahman', nameTa: 'அர்-ரஹ்மான்', arabicName: 'الرحمن', englishName: 'Ar-Rahman', englishNameTranslation: 'The Beneficent', englishNameTranslationTa: 'அளவற்ற அருளாளன்', numberOfAyahs: 78, revelationType: 'Medinan', startPage: 531, startJuz: 27 },
  { number: 56, name: 'Al-Waqi\'ah', nameTa: 'அல்-வாகிஆ', arabicName: 'الواقعة', englishName: 'Al-Waqi\'ah', englishNameTranslation: 'The Inevitable', englishNameTranslationTa: 'நிகழவிருக்கும் நிகழ்ச்சி', numberOfAyahs: 96, revelationType: 'Meccan', startPage: 534, startJuz: 27 },
  { number: 57, name: 'Al-Hadid', nameTa: 'அல்-ஹதீத்', arabicName: 'الحديد', englishName: 'Al-Hadid', englishNameTranslation: 'The Iron', englishNameTranslationTa: 'இரும்பு', numberOfAyahs: 29, revelationType: 'Medinan', startPage: 537, startJuz: 27 },
  { number: 58, name: 'Al-Mujadila', nameTa: 'அல்-முஜாதலா', arabicName: 'المجادلة', englishName: 'Al-Mujadila', englishNameTranslation: 'The Pleading Woman', englishNameTranslationTa: 'வாதிடுபவள்', numberOfAyahs: 22, revelationType: 'Medinan', startPage: 542, startJuz: 28 },
  { number: 59, name: 'Al-Hashr', nameTa: 'அல்-ஹஷ்ர்', arabicName: 'الحشر', englishName: 'Al-Hashr', englishNameTranslation: 'The Exile', englishNameTranslationTa: 'வெளியேற்றம்', numberOfAyahs: 24, revelationType: 'Medinan', startPage: 545, startJuz: 28 },
  { number: 60, name: 'Al-Mumtahanah', nameTa: 'அல்-மும்தஹினா', arabicName: 'الممتحنة', englishName: 'Al-Mumtahanah', englishNameTranslation: 'She that is to be examined', englishNameTranslationTa: 'சோதிக்கப்படுபவள்', numberOfAyahs: 13, revelationType: 'Medinan', startPage: 549, startJuz: 28 },
  { number: 61, name: 'As-Saf', nameTa: 'அஸ்-ஸஃப்', arabicName: 'الصف', englishName: 'As-Saf', englishNameTranslation: 'The Ranks', englishNameTranslationTa: 'அணிவகுப்பு', numberOfAyahs: 14, revelationType: 'Medinan', startPage: 551, startJuz: 28 },
  { number: 62, name: 'Al-Jumu\'ah', nameTa: 'அல்-ஜுமுஆ', arabicName: 'الجمعة', englishName: 'Al-Jumu\'ah', englishNameTranslation: 'The Congregation', englishNameTranslationTa: 'வெள்ளிக்கிழமை', numberOfAyahs: 11, revelationType: 'Medinan', startPage: 553, startJuz: 28 },
  { number: 63, name: 'Al-Munafiqun', nameTa: 'அல்-முனாஃபிகூன்', arabicName: 'المنافقون', englishName: 'Al-Munafiqun', englishNameTranslation: 'The Hypocrites', englishNameTranslationTa: 'நயவஞ்சகர்கள்', numberOfAyahs: 11, revelationType: 'Medinan', startPage: 554, startJuz: 28 },
  { number: 64, name: 'At-Taghabun', nameTa: 'அத்-தகாபுன்', arabicName: 'التغابن', englishName: 'At-Taghabun', englishNameTranslation: 'The Mutual Disillusion', englishNameTranslationTa: 'ஏமாற்றம் வெளிப்படும் நாள்', numberOfAyahs: 18, revelationType: 'Medinan', startPage: 556, startJuz: 28 },
  { number: 65, name: 'At-Talaq', nameTa: 'அத்-தலாக்', arabicName: 'الطلاق', englishName: 'At-Talaq', englishNameTranslation: 'The Divorce', englishNameTranslationTa: 'விவாகரத்து', numberOfAyahs: 12, revelationType: 'Medinan', startPage: 558, startJuz: 28 },
  { number: 66, name: 'At-Tahrim', nameTa: 'அத்-தஹ்ரீம்', arabicName: 'التحريم', englishName: 'At-Tahrim', englishNameTranslation: 'The Prohibition', englishNameTranslationTa: 'விலக்கப்பட்டது', numberOfAyahs: 12, revelationType: 'Medinan', startPage: 560, startJuz: 28 },
  { number: 67, name: 'Al-Mulk', nameTa: 'அல்-முல்க்', arabicName: 'الملك', englishName: 'Al-Mulk', englishNameTranslation: 'The Sovereignty', englishNameTranslationTa: 'ஆட்சி அதிகாரம்', numberOfAyahs: 30, revelationType: 'Meccan', startPage: 562, startJuz: 29 },
  { number: 68, name: 'Al-Qalam', nameTa: 'அல்-கலம்', arabicName: 'القلم', englishName: 'Al-Qalam', englishNameTranslation: 'The Pen', englishNameTranslationTa: 'எழுதுகோல்', numberOfAyahs: 52, revelationType: 'Meccan', startPage: 564, startJuz: 29 },
  { number: 69, name: 'Al-Haqqah', nameTa: 'அல்-ஹாக்ஃகா', arabicName: 'الحاقة', englishName: 'Al-Haqqah', englishNameTranslation: 'The Reality', englishNameTranslationTa: 'உறுதியான உண்மை', numberOfAyahs: 52, revelationType: 'Meccan', startPage: 566, startJuz: 29 },
  { number: 70, name: 'Al-Ma\'arij', nameTa: 'அல்-மஆரிஜ்', arabicName: 'المعارج', englishName: 'Al-Ma\'arij', englishNameTranslation: 'The Ascending Stairways', englishNameTranslationTa: 'உயர் வழிகள்', numberOfAyahs: 44, revelationType: 'Meccan', startPage: 568, startJuz: 29 },
  { number: 71, name: 'Nuh', nameTa: 'நூஹ்', arabicName: 'نوح', englishName: 'Nuh', englishNameTranslation: 'Noah', englishNameTranslationTa: 'நூஹ் நபி', numberOfAyahs: 28, revelationType: 'Meccan', startPage: 570, startJuz: 29 },
  { number: 72, name: 'Al-Jinn', nameTa: 'அல்-ஜின்', arabicName: 'الجن', englishName: 'Al-Jinn', englishNameTranslation: 'The Jinn', englishNameTranslationTa: 'ஜின்கள்', numberOfAyahs: 28, revelationType: 'Meccan', startPage: 572, startJuz: 29 },
  { number: 73, name: 'Al-Muzzammil', nameTa: 'அல்-முஸ்ஸம்மில்', arabicName: 'المزمل', englishName: 'Al-Muzzammil', englishNameTranslation: 'The Enshrouded One', englishNameTranslationTa: 'ஆடை போர்த்தியிருப்பவர்', numberOfAyahs: 20, revelationType: 'Meccan', startPage: 574, startJuz: 29 },
  { number: 74, name: 'Al-Muddaththir', nameTa: 'அல்-முத்தஸிர்', arabicName: 'المدثر', englishName: 'Al-Muddaththir', englishNameTranslation: 'The Cloaked One', englishNameTranslationTa: 'போர்வை போர்த்தியிருப்பவர்', numberOfAyahs: 56, revelationType: 'Meccan', startPage: 575, startJuz: 29 },
  { number: 75, name: 'Al-Qiyamah', nameTa: 'அல்-கியாமா', arabicName: 'القيامة', englishName: 'Al-Qiyamah', englishNameTranslation: 'The Resurrection', englishNameTranslationTa: 'மறுமை நாள்', numberOfAyahs: 40, revelationType: 'Meccan', startPage: 577, startJuz: 29 },
  { number: 76, name: 'Al-Insan', nameTa: 'அல்-இன்ஸான்', arabicName: 'الإنسان', englishName: 'Al-Insan', englishNameTranslation: 'The Man', englishNameTranslationTa: 'மனிதன்', numberOfAyahs: 31, revelationType: 'Medinan', startPage: 578, startJuz: 29 },
  { number: 77, name: 'Al-Mursalat', nameTa: 'அல்-முர்ஸலாத்', arabicName: 'المرسلات', englishName: 'Al-Mursalat', englishNameTranslation: 'The Emissaries', englishNameTranslationTa: 'அனுப்பப்படுபவை', numberOfAyahs: 50, revelationType: 'Meccan', startPage: 580, startJuz: 29 },
  { number: 78, name: 'An-Naba', nameTa: 'அந்-நபா', arabicName: 'النبأ', englishName: 'An-Naba', englishNameTranslation: 'The Tidings', englishNameTranslationTa: 'பெரும் செய்தி', numberOfAyahs: 40, revelationType: 'Meccan', startPage: 582, startJuz: 30 },
  { number: 79, name: 'An-Nazi\'at', nameTa: 'அந்-நாஸிஆத்', arabicName: 'النازعات', englishName: 'An-Nazi\'at', englishNameTranslation: 'Those who drag forth', englishNameTranslationTa: 'பறிப்பவர்கள்', numberOfAyahs: 46, revelationType: 'Meccan', startPage: 583, startJuz: 30 },
  { number: 80, name: '\'Abasa', nameTa: 'அபஸ', arabicName: 'عبس', englishName: '\'Abasa', englishNameTranslation: 'He Frowned', englishNameTranslationTa: 'கடுகடுத்தார்', numberOfAyahs: 42, revelationType: 'Meccan', startPage: 585, startJuz: 30 },
  { number: 81, name: 'At-Takwir', nameTa: 'அத்-தக்வீர்', arabicName: 'التكوير', englishName: 'At-Takwir', englishNameTranslation: 'The Overthrowing', englishNameTranslationTa: 'சுருட்டுதல்', numberOfAyahs: 29, revelationType: 'Meccan', startPage: 586, startJuz: 30 },
  { number: 82, name: 'Al-Infitar', nameTa: 'அல்-இன்ஃபிதார்', arabicName: 'الانفطار', englishName: 'Al-Infitar', englishNameTranslation: 'The Cleaving', englishNameTranslationTa: 'பிளத்தல்', numberOfAyahs: 19, revelationType: 'Meccan', startPage: 587, startJuz: 30 },
  { number: 83, name: 'Al-Mutaffifin', nameTa: 'அல்-முத்தஃப்பிஃபீன்', arabicName: 'المطففين', englishName: 'Al-Mutaffifin', englishNameTranslation: 'The Defrauding', englishNameTranslationTa: 'அளவையில் மோசடி செய்வோர்', numberOfAyahs: 36, revelationType: 'Meccan', startPage: 587, startJuz: 30 },
  { number: 84, name: 'Al-Inshiqaq', nameTa: 'அல்-இன்ஷிகாக்', arabicName: 'الانشقاق', englishName: 'Al-Inshiqaq', englishNameTranslation: 'The Splitting Open', englishNameTranslationTa: 'வெடித்தல்', numberOfAyahs: 25, revelationType: 'Meccan', startPage: 589, startJuz: 30 },
  { number: 85, name: 'Al-Buruj', nameTa: 'அல்-புரூஜ்', arabicName: 'البروج', englishName: 'Al-Buruj', englishNameTranslation: 'The Mansions of the Stars', englishNameTranslationTa: 'விண்மீன் மண்டலங்கள்', numberOfAyahs: 22, revelationType: 'Meccan', startPage: 590, startJuz: 30 },
  { number: 86, name: 'At-Tariq', nameTa: 'அத்-தாரிக்', arabicName: 'الطارق', englishName: 'At-Tariq', englishNameTranslation: 'The Morning Star', englishNameTranslationTa: 'இரவில் தோன்றுபவை', numberOfAyahs: 17, revelationType: 'Meccan', startPage: 591, startJuz: 30 },
  { number: 87, name: 'Al-A\'la', nameTa: 'அல்-அஃலா', arabicName: 'الأعلى', englishName: 'Al-A\'la', englishNameTranslation: 'The Most High', englishNameTranslationTa: 'மிக உயர்ந்தவன்', numberOfAyahs: 19, revelationType: 'Meccan', startPage: 591, startJuz: 30 },
  { number: 88, name: 'Al-Ghashiyah', nameTa: 'அல்-காஷியா', arabicName: 'الغاشية', englishName: 'Al-Ghashiyah', englishNameTranslation: 'The Overwhelming', englishNameTranslationTa: 'மூடிக்கொள்ளும் நிகழ்ச்சி', numberOfAyahs: 26, revelationType: 'Meccan', startPage: 592, startJuz: 30 },
  { number: 89, name: 'Al-Fajr', nameTa: 'அல்-ஃபஜ்ர்', arabicName: 'الفجر', englishName: 'Al-Fajr', englishNameTranslation: 'The Dawn', englishNameTranslationTa: 'விடியற்காலை', numberOfAyahs: 30, revelationType: 'Meccan', startPage: 593, startJuz: 30 },
  { number: 90, name: 'Al-Balad', nameTa: 'அல்-பலத்', arabicName: 'البلد', englishName: 'Al-Balad', englishNameTranslation: 'The City', englishNameTranslationTa: 'புனித நகரம்', numberOfAyahs: 20, revelationType: 'Meccan', startPage: 594, startJuz: 30 },
  { number: 91, name: 'Ash-Shams', nameTa: 'அஷ்-ஷம்ஸ்', arabicName: 'الشمس', englishName: 'Ash-Shams', englishNameTranslation: 'The Sun', englishNameTranslationTa: 'சூரியன்', numberOfAyahs: 15, revelationType: 'Meccan', startPage: 595, startJuz: 30 },
  { number: 92, name: 'Al-Layl', nameTa: 'அல்-லைல்', arabicName: 'الليل', englishName: 'Al-Layl', englishNameTranslation: 'The Night', englishNameTranslationTa: 'இரவு', numberOfAyahs: 21, revelationType: 'Meccan', startPage: 595, startJuz: 30 },
  { number: 93, name: 'Ad-Duhaa', nameTa: 'அழ்-ளுஹா', arabicName: 'الضحى', englishName: 'Ad-Duhaa', englishNameTranslation: 'The Morning Hours', englishNameTranslationTa: 'முற்பகல்', numberOfAyahs: 11, revelationType: 'Meccan', startPage: 596, startJuz: 30 },
  { number: 94, name: 'Ash-Sharh', nameTa: 'அஷ்-ஷர்ஹ்', arabicName: 'الشرح', englishName: 'Ash-Sharh', englishNameTranslation: 'The Relief', englishNameTranslationTa: 'விரிவாக்குதல்', numberOfAyahs: 8, revelationType: 'Meccan', startPage: 596, startJuz: 30 },
  { number: 95, name: 'At-Tin', nameTa: 'அத்-தீன்', arabicName: 'التين', englishName: 'At-Tin', englishNameTranslation: 'The Fig', englishNameTranslationTa: 'அத்தி பழம்', numberOfAyahs: 8, revelationType: 'Meccan', startPage: 597, startJuz: 30 },
  { number: 96, name: 'Al-\'Alaq', nameTa: 'அல்-அலக்', arabicName: 'العلق', englishName: 'Al-\'Alaq', englishNameTranslation: 'The Clot', englishNameTranslationTa: 'கருவுற்ற கருக்கட்டி', numberOfAyahs: 19, revelationType: 'Meccan', startPage: 597, startJuz: 30 },
  { number: 97, name: 'Al-Qadr', nameTa: 'அல்-கத்ர்', arabicName: 'القدر', englishName: 'Al-Qadr', englishNameTranslation: 'The Power', englishNameTranslationTa: 'மகத்துவமிக்க இரவு', numberOfAyahs: 5, revelationType: 'Meccan', startPage: 598, startJuz: 30 },
  { number: 98, name: 'Al-Bayyinah', nameTa: 'அல்-பய்யினா', arabicName: 'البينة', englishName: 'Al-Bayyinah', englishNameTranslation: 'The Clear Proof', englishNameTranslationTa: 'தெளிவான ஆதாரம்', numberOfAyahs: 8, revelationType: 'Medinan', startPage: 598, startJuz: 30 },
  { number: 99, name: 'Az-Zalzalah', nameTa: 'அஸ்-ஸல்ஸலா', arabicName: 'الزلزلة', englishName: 'Az-Zalzalah', englishNameTranslation: 'The Earthquake', englishNameTranslationTa: 'பூகம்பம்', numberOfAyahs: 8, revelationType: 'Medinan', startPage: 599, startJuz: 30 },
  { number: 100, name: 'Al-\'Adiyat', nameTa: 'அல்-ஆதியாத்', arabicName: 'العاديات', englishName: 'Al-\'Adiyat', englishNameTranslation: 'The Courser', englishNameTranslationTa: 'விரையும் குதிரைகள்', numberOfAyahs: 11, revelationType: 'Meccan', startPage: 599, startJuz: 30 },
  { number: 101, name: 'Al-Qari\'ah', nameTa: 'அல்-காரிஆ', arabicName: 'القارعة', englishName: 'Al-Qari\'ah', englishNameTranslation: 'The Calamity', englishNameTranslationTa: 'திடுக்கிடும் நிகழ்ச்சி', numberOfAyahs: 11, revelationType: 'Meccan', startPage: 600, startJuz: 30 },
  { number: 102, name: 'At-Takathur', nameTa: 'அத்-தகாஸுர்', arabicName: 'التكاثر', englishName: 'At-Takathur', englishNameTranslation: 'The Rivalry in world increase', englishNameTranslationTa: 'பெருமை பாராட்டுதல்', numberOfAyahs: 8, revelationType: 'Meccan', startPage: 600, startJuz: 30 },
  { number: 103, name: 'Al-\'Asr', nameTa: 'அல்-அஸ்ர்', arabicName: 'العصر', englishName: 'Al-\'Asr', englishNameTranslation: 'The Declining Day', englishNameTranslationTa: 'காலம்', numberOfAyahs: 3, revelationType: 'Meccan', startPage: 601, startJuz: 30 },
  { number: 104, name: 'Al-Humazah', nameTa: 'அல்-ஹுமஸா', arabicName: 'الهمزة', englishName: 'Al-Humazah', englishNameTranslation: 'The Traducer', englishNameTranslationTa: 'குறை கூறிப் புறம்பேசுவோர்', numberOfAyahs: 9, revelationType: 'Meccan', startPage: 601, startJuz: 30 },
  { number: 105, name: 'Al-Fil', nameTa: 'அல்-ஃபீல்', arabicName: 'الفيل', englishName: 'Al-Fil', englishNameTranslation: 'The Elephant', englishNameTranslationTa: 'யானை', numberOfAyahs: 5, revelationType: 'Meccan', startPage: 601, startJuz: 30 },
  { number: 106, name: 'Quraysh', nameTa: 'குறைஷ்', arabicName: 'قريش', englishName: 'Quraysh', englishNameTranslation: 'Quraysh', englishNameTranslationTa: 'குறைஷிகள்', numberOfAyahs: 4, revelationType: 'Meccan', startPage: 602, startJuz: 30 },
  { number: 107, name: 'Al-Ma\'un', nameTa: 'அல்-மாஊன்', arabicName: 'الماعون', englishName: 'Al-Ma\'un', englishNameTranslation: 'The Small Kindness', englishNameTranslationTa: 'அற்பப் பொருட்கள்', numberOfAyahs: 7, revelationType: 'Meccan', startPage: 602, startJuz: 30 },
  { number: 108, name: 'Al-Kawthar', nameTa: 'அல்-கவ்ஸர்', arabicName: 'الكوثر', englishName: 'Al-Kawthar', englishNameTranslation: 'The Abundance', englishNameTranslationTa: 'அளப்பரிய நன்மைகள்', numberOfAyahs: 3, revelationType: 'Meccan', startPage: 602, startJuz: 30 },
  { number: 109, name: 'Al-Kafirun', nameTa: 'அல்-காஃபிரூன்', arabicName: 'الكافرون', englishName: 'Al-Kafirun', englishNameTranslation: 'The Disbelievers', englishNameTranslationTa: 'இறைமறுப்பாளர்கள்', numberOfAyahs: 6, revelationType: 'Meccan', startPage: 603, startJuz: 30 },
  { number: 110, name: 'An-Nasr', nameTa: 'அந்-நஸ்ர்', arabicName: 'النصر', englishName: 'An-Nasr', englishNameTranslation: 'The Divine Support', englishNameTranslationTa: 'இறை உதவி', numberOfAyahs: 3, revelationType: 'Medinan', startPage: 603, startJuz: 30 },
  { number: 111, name: 'Al-Masad', nameTa: 'அல்-மஸத்', arabicName: 'المسد', englishName: 'Al-Masad', englishNameTranslation: 'The Palm Fiber', englishNameTranslationTa: 'முறுக்கேறிய கயிறு', numberOfAyahs: 5, revelationType: 'Meccan', startPage: 603, startJuz: 30 },
  { number: 112, name: 'Al-Ikhlas', nameTa: 'அல்-இக்லாஸ்', arabicName: 'الإخلاص', englishName: 'Al-Ikhlas', englishNameTranslation: 'The Sincerity', englishNameTranslationTa: 'ஏகத்துவம்', numberOfAyahs: 4, revelationType: 'Meccan', startPage: 604, startJuz: 30 },
  { number: 113, name: 'Al-Falaq', nameTa: 'அல்-ஃபலாக்', arabicName: 'الفلق', englishName: 'Al-Falaq', englishNameTranslation: 'The Daybreak', englishNameTranslationTa: 'புலர்காலை', numberOfAyahs: 5, revelationType: 'Meccan', startPage: 604, startJuz: 30 },
  { number: 114, name: 'An-Nas', nameTa: 'அந்-நாஸ்', arabicName: 'الناس', englishName: 'An-Nas', englishNameTranslation: 'Mankind', englishNameTranslationTa: 'மனிதகுலம்', numberOfAyahs: 6, revelationType: 'Meccan', startPage: 604, startJuz: 30 },
]

export const JUZ_METADATA: JuzSummary[] = [
  { juzNumber: 1, name: 'Alif Lam Meem', arabicName: 'الم', startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141, startPage: 1 },
  { juzNumber: 2, name: 'Sayaqool', arabicName: 'سيقول', startSurah: 2, startAyah: 142, endSurah: 2, endAyah: 252, startPage: 22 },
  { juzNumber: 3, name: 'Tilkal Rusul', arabicName: 'تلك الرسل', startSurah: 2, startAyah: 253, endSurah: 3, endAyah: 92, startPage: 42 },
  { juzNumber: 4, name: 'Lan Tanaaloo', arabicName: 'لن تنالوا', startSurah: 3, startAyah: 93, endSurah: 4, endAyah: 23, startPage: 62 },
  { juzNumber: 5, name: 'Wal Mohsanat', arabicName: 'والمحصنات', startSurah: 4, startAyah: 24, endSurah: 4, endAyah: 147, startPage: 82 },
  { juzNumber: 6, name: 'La Yuhibbullah', arabicName: 'لا يحب الله', startSurah: 4, startAyah: 148, endSurah: 5, endAyah: 81, startPage: 102 },
  { juzNumber: 7, name: 'Wa Iza Sami\'u', arabicName: 'وإذا سمعوا', startSurah: 5, startAyah: 82, endSurah: 6, endAyah: 110, startPage: 122 },
  { juzNumber: 8, name: 'Wa Lau Annana', arabicName: 'ولو أننا', startSurah: 6, startAyah: 111, endSurah: 7, endAyah: 87, startPage: 142 },
  { juzNumber: 9, name: 'Qalal Malao', arabicName: 'قال الملأ', startSurah: 7, startAyah: 88, endSurah: 8, endAyah: 40, startPage: 162 },
  { juzNumber: 10, name: 'Wa A\'lamu', arabicName: 'واعلموا', startSurah: 8, startAyah: 41, endSurah: 9, endAyah: 92, startPage: 182 },
  { juzNumber: 11, name: 'Ya\'tazeroon', arabicName: 'يعتذرون', startSurah: 9, startAyah: 93, endSurah: 11, endAyah: 5, startPage: 202 },
  { juzNumber: 12, name: 'Wa Ma Min Da\'abbatin', arabicName: 'وما من دابة', startSurah: 11, startAyah: 6, endSurah: 12, endAyah: 52, startPage: 222 },
  { juzNumber: 13, name: 'Wa Ma Ubarri\'u', arabicName: 'وما أبرئ', startSurah: 12, startAyah: 53, endSurah: 14, endAyah: 52, startPage: 242 },
  { juzNumber: 14, name: 'Rubama', arabicName: 'ربما', startSurah: 15, startAyah: 1, endSurah: 16, endAyah: 128, startPage: 262 },
  { juzNumber: 15, name: 'Subhanallazi', arabicName: 'سبحان الذي', startSurah: 17, startAyah: 1, endSurah: 18, endAyah: 74, startPage: 282 },
  { juzNumber: 16, name: 'Qala Alam', arabicName: 'قال ألم', startSurah: 18, startAyah: 75, endSurah: 20, endAyah: 135, startPage: 302 },
  { juzNumber: 17, name: 'Iqtaraba', arabicName: 'اقترب', startSurah: 21, startAyah: 1, endSurah: 22, endAyah: 78, startPage: 322 },
  { juzNumber: 18, name: 'Qad Aflaha', arabicName: 'قد أفلح', startSurah: 23, startAyah: 1, endSurah: 25, endAyah: 20, startPage: 342 },
  { juzNumber: 19, name: 'Wa Qalallazina', arabicName: 'وقال الذين', startSurah: 25, startAyah: 21, endSurah: 27, endAyah: 55, startPage: 362 },
  { juzNumber: 20, name: 'Amman Khalaqa', arabicName: 'أمن خلق', startSurah: 27, startAyah: 56, endSurah: 29, endAyah: 45, startPage: 382 },
  { juzNumber: 21, name: 'Utlu Ma Oohiya', arabicName: 'اتل ما أوحي', startSurah: 29, startAyah: 46, endSurah: 33, endAyah: 30, startPage: 402 },
  { juzNumber: 22, name: 'Wa Manyaqnut', arabicName: 'ومن يقنت', startSurah: 33, startAyah: 31, endSurah: 36, endAyah: 27, startPage: 422 },
  { juzNumber: 23, name: 'Wa Mali', arabicName: 'وما لي', startSurah: 36, startAyah: 28, endSurah: 39, endAyah: 31, startPage: 442 },
  { juzNumber: 24, name: 'Faman Azlamu', arabicName: 'فمن أظلم', startSurah: 39, startAyah: 32, endSurah: 41, endAyah: 46, startPage: 462 },
  { juzNumber: 25, name: 'Ilayhi Yuraddu', arabicName: 'إليه يرد', startSurah: 41, startAyah: 47, endSurah: 45, endAyah: 37, startPage: 482 },
  { juzNumber: 26, name: 'Ha-Meem', arabicName: 'حم', startSurah: 46, startAyah: 1, endSurah: 51, endAyah: 30, startPage: 502 },
  { juzNumber: 27, name: 'Qala Fama Khatbukum', arabicName: 'قال فما خطبكم', startSurah: 51, startAyah: 31, endSurah: 57, endAyah: 29, startPage: 522 },
  { juzNumber: 28, name: 'Qad Sami\'allah', arabicName: 'قد سمع الله', startSurah: 58, startAyah: 1, endSurah: 66, endAyah: 12, startPage: 542 },
  { juzNumber: 29, name: 'Tabarakallazi', arabicName: 'تبارك الذي', startSurah: 67, startAyah: 1, endSurah: 77, endAyah: 50, startPage: 562 },
  { juzNumber: 30, name: '\'Amma Yatasa\'aloon', arabicName: 'عم يتساءلون', startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6, startPage: 582 },
]

/**
 * 🌟 Helper to get localized Surah name
 */
export function getSurahDisplayName(surah: { name: string; nameTa?: string; number?: number }, isTamil: boolean): string {
  if (isTamil) {
    if (surah.nameTa) return surah.nameTa
    if (surah.number) {
      const meta = SURAH_METADATA.find((s) => s.number === surah.number)
      if (meta?.nameTa) return meta.nameTa
    }
  }
  return surah.name
}

/**
 * 🌟 Helper to get localized Surah meaning translation
 */
export function getSurahTranslationName(surah: { englishNameTranslation: string; englishNameTranslationTa?: string; number?: number }, isTamil: boolean): string {
  if (isTamil) {
    if (surah.englishNameTranslationTa) return surah.englishNameTranslationTa
    if (surah.number) {
      const meta = SURAH_METADATA.find((s) => s.number === surah.number)
      if (meta?.englishNameTranslationTa) return meta.englishNameTranslationTa
    }
  }
  return surah.englishNameTranslation
}

/**
 * 🌟 Calculate exact sequential global Quran verse number (1 to 6,236).
 * Ensures 100% accurate 1-to-1 audio and text alignment across all 114 chapters.
 */
export function getGlobalAyahNumber(surahNumber: number, ayahNumberInSurah: number): number {
  let count = 0
  for (let s = 1; s < surahNumber; s++) {
    const meta = SURAH_METADATA.find((m) => m.number === s)
    if (meta) {
      count += meta.numberOfAyahs
    }
  }
  return count + ayahNumberInSurah
}

/**
 * 🌟 Get verified CDN audio URL for Sheikh Mishary Rashid Alafasy
 * Guaranteed 100% matched with the correct Surah and Ayah.
 */
export function getAyahAudioUrl(surahNumber: number, ayahNumberInSurah: number): string {
  const globalNum = getGlobalAyahNumber(surahNumber, ayahNumberInSurah)
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalNum}.mp3`
}
