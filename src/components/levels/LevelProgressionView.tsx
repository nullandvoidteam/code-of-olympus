import React from 'react'
import { Trophy, Star, Shield, Swords, Crown, ChevronRight, Zap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { cn } from '../../lib/utils'

export const LevelProgressionView: React.FC = () => {
  const { user, profile } = useAuth()
  const { theme } = useTheme()
  const isMythic = theme === 'gow'

  const currentXp = profile?.xp || 0
  const currentLevel = profile?.level || Math.max(1, Math.floor(currentXp / 200) + 1)
  
  // Calculate Progress in Current Level
  const baseXp = (currentLevel - 1) * 200
  const nextXp = currentLevel * 200
  const levelRange = 200
  const progressInLevel = currentXp - baseXp
  const levelPct = Math.min(100, Math.max(0, Math.round((progressInLevel / levelRange) * 100)))

  const ranks = [
    { minLevel: 1, maxLevel: 4, title: 'Novice Coder', icon: Star, color: '#3B82F6', mythicTitle: 'Spartan Initiate' },
    { minLevel: 5, maxLevel: 9, title: 'Code Apprentice', icon: Shield, color: '#10B981', mythicTitle: 'Warrior of Sparta' },
    { minLevel: 10, maxLevel: 14, title: 'Tech Journeyman', icon: Swords, color: '#F59E0B', mythicTitle: 'Champion of Ares' },
    { minLevel: 15, maxLevel: 19, title: 'Master Developer', icon: Trophy, color: '#8B5CF6', mythicTitle: 'Hero of Olympus' },
    { minLevel: 20, maxLevel: 999, title: 'Grandmaster Hacker', icon: Crown, color: '#EF4444', mythicTitle: 'God of War' },
  ]

  const getCurrentRank = () => {
    return ranks.find(r => currentLevel >= r.minLevel && currentLevel <= r.maxLevel) || ranks[0]
  }

  const currentRank = getCurrentRank()

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 pb-16 animate-in fade-in px-4 sm:px-6" style={{ fontFamily: 'var(--theme-font-main, sans-serif)' }}>
      
      {/* ── HERO BANNER ── */}
      <div className="relative w-full rounded-[2rem] overflow-hidden shadow-md border p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 mt-4" 
           style={{ background: 'var(--theme-surface-card)', borderColor: 'var(--theme-border-default)' }}>
        
        <div className="absolute inset-0 pointer-events-none opacity-20">
           <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M0 200V150C100 130 200 170 300 140C400 110 500 150 600 120C700 90 800 130 800 130V200H0Z" fill="var(--theme-accent-primary)"/>
           </svg>
        </div>

        <div className="relative z-10 flex flex-col items-start max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 shadow-inner border" 
               style={{ background: 'var(--theme-bg-subtle)', color: 'var(--theme-accent-cyan)', borderColor: 'var(--theme-accent-cyan)' }}>
            <Zap className="w-3.5 h-3.5" /> Level {currentLevel}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2" style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text-primary)' }}>
            {isMythic ? currentRank.mythicTitle : currentRank.title}
          </h1>
          <p className="text-lg opacity-80 mt-2" style={{ color: 'var(--theme-text-secondary)' }}>
            Earn XP by completing quests and tracking your daily habits to climb the ranks.
          </p>
        </div>
        
        <div className="relative z-10 shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.1)] relative"
               style={{ background: 'var(--theme-bg-canvas)', borderColor: 'var(--theme-accent-secondary)', color: 'var(--theme-accent-secondary)' }}>
             <currentRank.icon className="w-16 h-16 md:w-20 md:h-20" />
             
             {/* Circular Progress (Simplified CSS) */}
             <div className="absolute inset-0 rounded-full border-4 opacity-20" style={{ borderColor: 'var(--theme-text-muted)' }} />
          </div>
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="p-8 rounded-[2rem] border shadow-sm" style={{ background: 'var(--theme-surface-card)', borderColor: 'var(--theme-border-default)' }}>
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>Journey to Level {currentLevel + 1}</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--theme-text-muted)' }}>{nextXp - currentXp} XP remaining</p>
          </div>
          <div className="text-right">
            <span className="font-black text-2xl" style={{ color: 'var(--theme-accent-cyan)' }}>{progressInLevel}</span>
            <span className="font-bold text-sm opacity-60" style={{ color: 'var(--theme-text-muted)' }}> / {levelRange} XP</span>
          </div>
        </div>
        <div className="h-5 w-full rounded-full overflow-hidden border p-0.5 shadow-inner" style={{ background: 'var(--theme-bg-subtle)', borderColor: 'var(--theme-border-subtle)' }}>
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
            style={{ width: `${levelPct}%`, background: 'var(--theme-accent-cyan)' }}
          >
            <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -skew-x-12" />
          </div>
        </div>
      </div>

      {/* ── THE LADDER ── */}
      <div className="flex flex-col gap-6 mt-4">
        <h2 className="text-2xl font-black mb-2" style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text-primary)' }}>
          The Progression Ladder
        </h2>
        
        <div className="grid gap-4">
          {ranks.map((rank, index) => {
            const isUnlocked = currentLevel >= rank.minLevel
            const isCurrent = currentLevel >= rank.minLevel && currentLevel <= rank.maxLevel
            
            return (
              <div key={index} className={cn(
                "relative flex items-center p-6 rounded-[2rem] border transition-all duration-300 overflow-hidden",
                isCurrent ? "shadow-md scale-[1.02] z-10" : "opacity-90 hover:opacity-100"
              )}
              style={{
                background: isCurrent ? 'var(--theme-surface-card-alt)' : 'var(--theme-surface-card)',
                borderColor: isCurrent ? 'var(--theme-accent-secondary)' : 'var(--theme-border-default)',
              }}>
                
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-inner",
                  isUnlocked ? "opacity-100" : "opacity-40 grayscale"
                )}
                style={{ 
                  background: 'var(--theme-bg-subtle)', 
                  borderColor: isUnlocked ? rank.color : 'var(--theme-border-subtle)',
                  color: isUnlocked ? rank.color : 'var(--theme-text-muted)'
                }}>
                  <rank.icon className="w-8 h-8" />
                </div>

                <div className="flex-1 ml-6 min-w-0 z-10">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                    <h3 className="text-xl font-bold truncate" style={{ color: 'var(--theme-text-primary)' }}>
                      {isMythic ? rank.mythicTitle : rank.title}
                    </h3>
                    <span className="text-sm font-bold tracking-widest uppercase opacity-70" style={{ color: 'var(--theme-text-muted)' }}>
                      Level {rank.minLevel}{rank.maxLevel < 999 ? ` - ${rank.maxLevel}` : '+'}
                    </span>
                  </div>
                  <p className="text-sm opacity-80" style={{ color: 'var(--theme-text-secondary)' }}>
                    Requires {((rank.minLevel - 1) * 200).toLocaleString()} XP to unlock.
                  </p>
                </div>
                
                {isCurrent && (
                  <div className="hidden sm:flex absolute right-6 items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border z-10"
                       style={{ background: 'var(--theme-bg-canvas)', color: 'var(--theme-accent-secondary)', borderColor: 'var(--theme-accent-secondary)' }}>
                    Current Rank
                  </div>
                )}
                {isUnlocked && !isCurrent && (
                  <div className="hidden sm:flex absolute right-6 items-center text-sm font-bold uppercase tracking-widest opacity-50 z-10"
                       style={{ color: 'var(--theme-accent-primary)' }}>
                    Unlocked
                  </div>
                )}
                
                {/* Visual Connector for Ladder */}
                {index < ranks.length - 1 && (
                  <div className="absolute left-[3.25rem] bottom-0 w-1 h-6 translate-y-full z-0 opacity-20"
                       style={{ background: 'var(--theme-border-subtle)' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
