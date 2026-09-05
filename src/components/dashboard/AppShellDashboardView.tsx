import React from 'react'
import {
  ArrowRight,
  Flame,
  Zap,
  Shield,
  Target,
  Trophy,
  Star
} from 'lucide-react'
import { getTimeGreeting } from '../../lib/timeGreeting'
import { useAuth } from '../../context/AuthContext'
import * as LucideIcons from 'lucide-react'

import type { GamificationStats } from '../../lib/gamification'
import type { AchievementItem, BadgeItem } from '../../lib/achievements'

export interface AppShellDashboardViewProps {
  username?: string
  stats?: GamificationStats
  achievements?: AchievementItem[]
  badges?: BadgeItem[]
  onNavigateTab?: (tab: 'learn' | 'practice' | 'build' | 'community' | 'arcade' | 'dashboard' | 'profile' | 'quests' | 'achievements') => void
  [key: string]: any // To accept other props passed by LearnerDashboard that we are ignoring for now
}

export const AppShellDashboardView: React.FC<AppShellDashboardViewProps> = ({
  stats,
  achievements = [],
  onNavigateTab,
}) => {
  // Calculated Gamified Stats
  const currentLevel = stats?.level ?? 1
  const currentXp = stats?.xp ?? 0
  const currentStreak = stats?.streak ?? 0
  
  const dailyGoalXp = stats?.dailyGoalXp ?? 50
  const dailyXpEarned = stats?.dailyXpEarned ?? 0
  const dailyGoalPercent = Math.min(100, Math.max(0, Math.round((dailyXpEarned / dailyGoalXp) * 100)))

  const baseXp = stats?.currentLevelBaseXp ?? 0
  const nextXp = stats?.nextLevelXp ?? 1000
  const levelRange = nextXp - baseXp
  const progressInLevel = currentXp - baseXp
  const levelPct = levelRange > 0 ? Math.min(100, Math.max(0, Math.round((progressInLevel / levelRange) * 100))) : 0
  const xpToNext = Math.max(0, nextXp - currentXp)

  // Recent Unlocked Achievements
  const recentAchievements = [...achievements]
    .filter(a => a.isUnlocked || a.isClaimed)
    .reverse()
    .slice(0, 2)

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 pb-16 animate-in fade-in" style={{ fontFamily: 'var(--theme-font-main, sans-serif)' }}>
      
      {/* ── HERO GAMIFIED BANNER ── */}
      <div className="relative w-full rounded-[2rem] overflow-hidden shadow-sm border" style={{ background: 'var(--theme-surface-card)', borderColor: 'var(--theme-border-default)' }}>
        
        {/* Abstract Illustration Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
           <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M0 200V150C50 140 100 130 150 140C200 150 250 170 300 160C350 150 400 110 450 100C500 90 550 110 600 120C650 130 700 110 750 90C800 70 800 200 800 200H0Z" fill="var(--theme-accent-primary)"/>
             <path d="M0 200V170C80 180 160 190 240 180C320 170 400 140 480 130C560 120 640 130 720 150C800 170 800 200 800 200H0Z" fill="var(--theme-accent-secondary)" opacity="0.5"/>
             <circle cx="650" cy="60" r="30" fill="var(--theme-accent-secondary)" opacity="0.4"/>
           </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-10 gap-8">
          <div className="flex flex-col max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 shadow-sm w-fit" 
                 style={{ background: 'var(--theme-bg-subtle)', color: 'var(--theme-accent-secondary)', borderColor: 'var(--theme-accent-secondary)', borderWidth: '1px' }}>
              <SparklesIcon className="w-3.5 h-3.5" /> Adventure Awaits
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text-primary)' }}>
              Ready for your next quest?
            </h1>
            <p className="text-lg opacity-80" style={{ color: 'var(--theme-text-secondary)' }}>
              Sharpen your skills and earn daily rewards.
            </p>
          </div>
          
          {/* Main Stat Badges */}
          <div className="flex gap-4 self-stretch items-center">
            <div className="flex flex-col items-center justify-center p-6 rounded-3xl border shadow-sm backdrop-blur-md"
                 style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'var(--theme-border-subtle)' }}>
              <div className="p-3 rounded-full mb-3 shadow-inner" style={{ background: 'var(--theme-bg-canvas)', color: 'var(--theme-accent-secondary)' }}>
                <Zap className="w-8 h-8" />
              </div>
              <p className="text-3xl font-black" style={{ color: 'var(--theme-text-primary)' }}>{currentXp}</p>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70 mt-1" style={{ color: 'var(--theme-text-muted)' }}>Total XP</p>
            </div>
            <div className="flex flex-col items-center justify-center p-6 rounded-3xl border shadow-sm backdrop-blur-md"
                 style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'var(--theme-border-subtle)' }}>
              <div className="p-3 rounded-full mb-3 shadow-inner" style={{ background: 'var(--theme-bg-canvas)', color: 'var(--theme-accent-primary)' }}>
                <Flame className="w-8 h-8" />
              </div>
              <p className="text-3xl font-black" style={{ color: 'var(--theme-text-primary)' }}>{currentStreak}</p>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70 mt-1" style={{ color: 'var(--theme-text-muted)' }}>Day Streak</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Journey Progress */}
          <div className="p-8 rounded-[2rem] border shadow-sm" style={{ background: 'var(--theme-surface-card)', borderColor: 'var(--theme-border-default)' }}>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-black" style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text-primary)' }}>Journey to Level {currentLevel + 1}</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--theme-text-muted)' }}>Earn {xpToNext} more XP to level up!</p>
              </div>
              <div className="text-right">
                <span className="font-black text-2xl" style={{ color: 'var(--theme-accent-secondary)' }}>{progressInLevel}</span>
                <span className="font-bold text-sm opacity-60" style={{ color: 'var(--theme-text-muted)' }}> / {levelRange} XP</span>
              </div>
            </div>
            <div className="h-4 w-full rounded-full overflow-hidden border p-0.5" style={{ background: 'var(--theme-bg-subtle)', borderColor: 'var(--theme-border-subtle)' }}>
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${levelPct}%`, background: 'var(--theme-accent-secondary)' }}
              >
                <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -skew-x-12" />
              </div>
            </div>
          </div>

          {/* Today's Quest */}
          <div className="p-8 rounded-[2rem] border shadow-sm flex flex-col gap-6" style={{ background: 'var(--theme-surface-card)', borderColor: 'var(--theme-border-default)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl" style={{ background: 'var(--theme-bg-subtle)', color: 'var(--theme-accent-primary)' }}>
                  <Target className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black" style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text-primary)' }}>Today's Quest</h2>
              </div>
              {dailyXpEarned >= dailyGoalXp && (
                <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5 border shadow-sm"
                      style={{ background: 'var(--theme-bg-subtle)', color: 'var(--theme-accent-primary)', borderColor: 'var(--theme-accent-primary)' }}>
                  <Star className="w-3.5 h-3.5" /> Completed
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-6 p-5 rounded-2xl border" style={{ background: 'var(--theme-bg-canvas)', borderColor: 'var(--theme-border-subtle)' }}>
              <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-inner" style={{ background: 'var(--theme-surface-card)' }}>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: 'var(--theme-text-muted)' }}>Goal</span>
                <span className="text-xl font-black" style={{ color: 'var(--theme-text-primary)' }}>{dailyGoalXp}</span>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <h3 className="font-bold text-lg" style={{ color: 'var(--theme-text-primary)' }}>Daily XP Goal</h3>
                
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-1 h-3 rounded-full overflow-hidden shadow-inner" style={{ background: 'var(--theme-surface-card)' }}>
                    <div 
                      className={`h-full rounded-full transition-all duration-1000`}
                      style={{ width: `${dailyGoalPercent}%`, background: dailyXpEarned >= dailyGoalXp ? 'var(--theme-accent-primary)' : 'var(--theme-accent-secondary)' }}
                    />
                  </div>
                  <span className="text-xs font-bold whitespace-nowrap" style={{ color: 'var(--theme-text-muted)' }}>
                    {dailyXpEarned} / {dailyGoalXp} XP
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
        
        {/* ── RIGHT COLUMN ── */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          <div className="p-8 rounded-[2rem] border shadow-sm flex flex-col h-full" style={{ background: 'var(--theme-surface-card)', borderColor: 'var(--theme-border-default)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black flex items-center gap-3" style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text-primary)' }}>
                <Trophy className="w-6 h-6" style={{ color: 'var(--theme-accent-secondary)' }} /> Recent Achievements
              </h2>
              <button 
                onClick={() => onNavigateTab?.('achievements')}
                className="text-sm font-bold flex items-center gap-1 group transition-colors"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col gap-4">
              {recentAchievements.length > 0 ? (
                recentAchievements.map((ach) => {
                  // Map emojis to Lucide icon names if they exist, else default to Star
                  let iconName = ach.icon
                  if (iconName.length <= 2) {
                    const emojiMap: Record<string, string> = { '🚀': 'Rocket', '🔥': 'Flame', '⭐': 'Star', '👑': 'Crown', '🛡️': 'Shield' }
                    iconName = emojiMap[iconName] || 'Star'
                  }
                  // @ts-ignore
                  const Icon = LucideIcons[iconName] || Star
                  return (
                    <div key={ach.id} className="p-4 rounded-2xl border flex gap-5 items-center transition-transform hover:-translate-y-1 shadow-sm"
                         style={{ background: 'var(--theme-bg-canvas)', borderColor: 'var(--theme-border-subtle)' }}>
                      <div className="w-14 h-14 rounded-xl border flex items-center justify-center shrink-0 shadow-inner"
                           style={{ background: 'var(--theme-surface-card)', color: 'var(--theme-accent-secondary)', borderColor: 'var(--theme-accent-secondary)' }}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base truncate mb-1" style={{ color: 'var(--theme-text-primary)' }}>{ach.title}</h4>
                        <p className="text-xs truncate opacity-80" style={{ color: 'var(--theme-text-secondary)' }}>{ach.description}</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-10 opacity-60">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--theme-bg-subtle)' }}>
                    <Trophy className="w-8 h-8" style={{ color: 'var(--theme-text-muted)' }} />
                  </div>
                  <h4 className="font-bold text-lg" style={{ color: 'var(--theme-text-primary)' }}>No trophies yet</h4>
                  <p className="text-sm mt-1 max-w-[200px]" style={{ color: 'var(--theme-text-muted)' }}>Complete quests to unlock rewards!</p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  )
}
