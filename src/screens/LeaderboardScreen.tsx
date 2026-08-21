import React from 'react'
import { ScreenPlaceholder } from '../components/common/ScreenPlaceholder'

export const LeaderboardScreen: React.FC = () => {
  return (
    <div className="space-y-6">
      <ScreenPlaceholder
        title="Leaderboard & Community Khatm"
        description="Encouraging spiritual competition: weekly streak leaderboards, community Khatm challenges, and friend reading groups."
        stitchScreenName="Not yet created in Stitch"
        stitchScreenId="Pending Design in Stitch"
        stitchReady={false}
        currentRoute="/leaderboard"
        featuresList={[
          'Global and friends leaderboard ranked by consecutive streak days & Hasanat points',
          'Shared Community Khatm: Collaborative reading where members pledge Juz to complete the Quran together',
          'Weekly spiritual badges and milestone awards (e.g. 30-day Ramadan streak, Night Prayer champion)',
          'Supabase Realtime Postgres subscriptions for live leaderboard updates',
          'Privacy mode: Option to participate anonymously or within private friend circles only',
        ]}
      />
    </div>
  )
}
