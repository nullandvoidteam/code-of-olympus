import React from 'react'
import { ArrowRight, Flame, Zap, Shield, Target, Trophy, Star } from 'lucide-react'
import { getTimeGreeting } from '../../../lib/timeGreeting'
import { useAuth } from '../../../context/AuthContext'
import * as LucideIcons from 'lucide-react'

import type { GamificationStats } from '../../../lib/gamification'
import type { AchievementItem, BadgeItem } from '../../../lib/achievements'

interface CrucibleDashboardProps {
  username?: string
  stats?: GamificationStats
  achievements?: AchievementItem[]
  badges?: BadgeItem[]
  onNavigateTab?: (tab: 'learn' | 'practice' | 'build' | 'community' | 'arcade' | 'dashboard' | 'achievements' | 'profile' | 'quests') => void
  [key: string]: any
}

function StatPillar({ icon: Icon, label, value, color, subLabel }: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
  subLabel?: string
}) {
  return (
    <div
      className="flex flex-col items-center gap-2 p-4 rounded-2xl relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'var(--theme-surface-card, #0E0606)',
        border: '1px solid var(--theme-border-default, #3D1C1C)',
        boxShadow: `0 4px 20px rgba(0,0,0,0.5)`,
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center relative"
        style={{
          background: `var(--theme-accent-primary-dim)`,
          border: `1px solid var(--theme-border-subtle)`,
          boxShadow: `0 0 15px ${color}22`,
        }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span
        className="font-bold tabular-nums text-2xl tracking-wide"
        style={{ color: 'var(--theme-text-primary, #F5E8E8)', fontFamily: "var(--theme-font-heading, 'Cinzel', serif)" }}
      >
        {value}
      </span>
      <span
        className="font-bold uppercase tracking-[0.16em] text-center text-[10px]"
        style={{ color, fontFamily: "var(--theme-font-heading, 'Cinzel', serif)" }}
      >
        {label}
      </span>
      {subLabel && (
        <span className="text-center font-medium text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>
          {subLabel}
        </span>
      )}
    </div>
  )
}

export const CrucibleDashboard: React.FC<CrucibleDashboardProps> = ({
  username,
  stats,
  achievements = [],
  onNavigateTab,
}) => {
  const { user, profile } = useAuth()
  const { greeting } = getTimeGreeting()
  const userName = username || profile?.full_name || profile?.username || user?.user_metadata?.first_name || user?.user_metadata?.full_name || 'Spartan'

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

  const recentAchievements = [...achievements]
    .filter(a => a.isUnlocked || a.isClaimed)
    .reverse()
    .slice(0, 3)

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-16 animate-in fade-in">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 p-6 sm:p-8 rounded-3xl border relative overflow-hidden"
           style={{ background: 'var(--theme-surface-card)', borderColor: 'var(--theme-border-default)' }}>
        <div className="absolute right-0 top-0 w-64 h-64 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none"
             style={{ background: 'var(--theme-accent-glow)' }} />
        
        <div className="flex flex-col z-10">
          <div className="flex items-center gap-2 font-bold text-sm tracking-widest uppercase mb-2"
               style={{ color: 'var(--theme-accent-primary)' }}>
            <Sparkles className="w-4 h-4" />
            <span>{greeting}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-widest uppercase"
              style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text-primary)' }}>
            Embrace your destiny, <span style={{ color: 'var(--theme-accent-primary)' }}>{userName}</span>
          </h1>
          <p className="mt-2 font-medium max-w-lg leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
            Your daily quest awaits. Slay challenges to earn glory and ascend the ranks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ── LEFT COLUMN: METRICS & QUESTS ── */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" onClick={() => onNavigateTab?.('profile')}>
            <div className="cursor-pointer">
              <StatPillar 
                icon={Shield} 
                label="Current Rank" 
                value={currentLevel} 
                color="var(--theme-accent-cyan, #00E5FF)" 
              />
            </div>
            <div className="cursor-pointer">
              <StatPillar 
                icon={Zap} 
                label="Total Glory" 
                value={currentXp} 
                color="var(--theme-accent-secondary, #F5D060)" 
              />
            </div>
            <div className="cursor-pointer">
              <StatPillar 
                icon={Flame} 
                label="Battle Streak" 
                value={currentStreak} 
                color="var(--theme-accent-primary, #DC2626)" 
              />
            </div>
          </div>

          <div className="p-6 rounded-3xl border flex flex-col gap-4 shadow-xl"
               style={{ background: 'var(--theme-surface-card)', borderColor: 'var(--theme-border-default)' }}>
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-lg font-bold tracking-wider uppercase" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}>
                  Ascension to Rank {currentLevel + 1}
                </h2>
                <p className="text-sm font-medium opacity-60" style={{ color: 'var(--theme-text-primary)' }}>Earn {xpToNext} more glory to rise.</p>
              </div>
              <div className="text-right">
                <span className="font-black text-xl" style={{ color: 'var(--theme-accent-secondary)' }}>{progressInLevel}</span>
                <span className="font-bold text-sm opacity-50" style={{ color: 'var(--theme-text-primary)' }}> / {levelRange} XP</span>
              </div>
            </div>
            <div className="h-4 w-full rounded-full overflow-hidden border p-[2px]"
                 style={{ background: 'var(--theme-bg-subtle)', borderColor: 'var(--theme-border-subtle)' }}>
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${levelPct}%`, background: 'var(--theme-accent-secondary)' }}
              >
                <div className="absolute inset-0 w-full animate-[shimmer_2s_infinite] -skew-x-12 opacity-20 bg-white" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border shadow-xl overflow-hidden flex flex-col"
               style={{ background: 'var(--theme-surface-card)', borderColor: 'var(--theme-border-default)' }}>
            <div className="px-6 py-5 border-b flex items-center justify-between"
                 style={{ background: 'var(--theme-surface-card-alt)', borderColor: 'var(--theme-border-subtle)' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: 'var(--theme-accent-primary-dim)', color: 'var(--theme-accent-primary)' }}>
                  <Target className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black tracking-widest uppercase" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}>Daily Quest</h2>
              </div>
              {dailyXpEarned >= dailyGoalXp && (
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5"
                      style={{ background: 'var(--theme-accent-primary-dim)', color: 'var(--theme-accent-primary)' }}>
                  <Star className="w-3.5 h-3.5" /> Vanquished
                </span>
              )}
            </div>
            
            <div className="p-6 flex flex-col gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0"
                     style={{ background: 'var(--theme-bg-subtle)', borderColor: 'var(--theme-border-subtle)' }}>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-50" style={{ color: 'var(--theme-text-primary)' }}>Bounty</span>
                  <span className="text-lg font-black" style={{ color: 'var(--theme-accent-secondary)' }}>{dailyGoalXp}</span>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <h3 className="font-bold text-base tracking-widest uppercase" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}>Glory Hunter</h3>
                  <p className="text-sm opacity-60" style={{ color: 'var(--theme-text-primary)' }}>Prove your worth by earning {dailyGoalXp} XP today.</p>
                  
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--theme-bg-subtle)' }}>
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${dailyGoalPercent}%`, background: dailyXpEarned >= dailyGoalXp ? 'var(--theme-accent-primary)' : 'var(--theme-accent-cyan)' }}
                      />
                    </div>
                    <span className="text-xs font-bold whitespace-nowrap opacity-80" style={{ color: 'var(--theme-text-primary)' }}>
                      {dailyXpEarned} / {dailyGoalXp} XP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
        
        {/* ── RIGHT COLUMN: ACHIEVEMENTS ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="rounded-3xl border shadow-xl flex flex-col overflow-hidden h-full"
               style={{ background: 'var(--theme-surface-card)', borderColor: 'var(--theme-border-default)' }}>
            <div className="px-6 py-5 border-b flex items-center justify-between"
                 style={{ background: 'var(--theme-surface-card-alt)', borderColor: 'var(--theme-border-subtle)' }}>
              <h2 className="text-lg font-black tracking-widest uppercase flex items-center gap-2"
                  style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}>
                <Trophy className="w-5 h-5" style={{ color: 'var(--theme-accent-secondary)' }} /> Trophies
              </h2>
              <button 
                onClick={() => onNavigateTab?.('achievements')}
                className="text-sm font-bold flex items-center gap-1 group uppercase tracking-widest"
                style={{ color: 'var(--theme-accent-primary)' }}
              >
                View <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="flex-1 p-6 flex flex-col gap-4" style={{ background: 'var(--theme-bg-subtle)' }}>
              {recentAchievements.length > 0 ? (
                recentAchievements.map((ach) => {
                  // @ts-ignore
                  const Icon = LucideIcons[ach.icon] || Star
                  return (
                    <div key={ach.id} className="p-4 rounded-2xl border flex gap-4 items-center"
                         style={{ background: 'var(--theme-surface-card)', borderColor: 'var(--theme-border-default)' }}>
                      <div className="w-12 h-12 rounded-xl border flex items-center justify-center shrink-0"
                           style={{ background: 'var(--theme-accent-primary-dim)', borderColor: 'var(--theme-border-subtle)' }}>
                        {ach.icon.length > 2 ? <Icon className="w-6 h-6" style={{ color: 'var(--theme-accent-secondary)' }} /> : <span className="text-xl">{ach.icon}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate uppercase tracking-widest" style={{ color: 'var(--theme-text-primary)' }}>{ach.title}</h4>
                        <p className="text-xs truncate opacity-60" style={{ color: 'var(--theme-text-primary)' }}>{ach.description}</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border"
                       style={{ background: 'var(--theme-surface-card)', borderColor: 'var(--theme-border-default)', color: 'var(--theme-text-muted)' }}>
                    <Trophy className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold tracking-widest uppercase" style={{ color: 'var(--theme-text-secondary)', fontFamily: 'var(--theme-font-heading)' }}>Empty Vault</h4>
                  <p className="text-sm mt-1 max-w-[200px] opacity-60" style={{ color: 'var(--theme-text-primary)' }}>Venture forth to earn your first trophy.</p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
