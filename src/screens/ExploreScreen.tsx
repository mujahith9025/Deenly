import React from 'react'
import { ScreenPlaceholder } from '../components/common/ScreenPlaceholder'

export const ExploreScreen: React.FC = () => {
  return (
    <div className="space-y-6">
      <ScreenPlaceholder
        title="Explore & Surah Index"
        description="Comprehensive Quran navigation by 114 Surahs, 30 Juz, thematic collections (Patience, Hope, Gratitude, Duas of the Prophets), and search index."
        stitchScreenName="Not yet created in Stitch"
        stitchScreenId="Pending Design in Stitch"
        stitchReady={false}
        currentRoute="/explore"
        featuresList={[
          '114 Surah searchable index with revelation type (Meccan/Medinan) and Ayah count',
          '30 Juz and Hizb quick-jump navigator for Ramadan & Khatm planning',
          'Curated topical collections (Duas for anxiety, morning/evening protection, repentance)',
          'Full-text Arabic and translation search engine with fuzzy matching',
          'Audio reciter library with audio download options for offline listening',
        ]}
      />
    </div>
  )
}
