import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useAchievementsAndNotifications, claimAchievement } from '../../lib/achievements';
import { cn } from '../../lib/utils';
import * as LucideIcons from 'lucide-react';
import { Trophy, Lock, Star, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AchievementsView: React.FC = () => {
  const { user, addXP } = useAuth();
  const { achievements, loading, refreshAll } = useAchievementsAndNotifications(user?.id);
  const { theme } = useTheme();
  
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const claimedCount = achievements.filter(a => a.isClaimed).length;
  const totalCount = achievements.length;
  const progressPercent = totalCount > 0 ? Math.round((claimedCount / totalCount) * 100) : 0;

  const isMythic = theme === 'gow';

  const handleClaim = async (achievementId: string, rewardXp: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    setClaimingId(achievementId);
    await claimAchievement(user.id, achievementId);
    
    // Fire confetti
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F5D060', '#DC2626', '#FF5722', '#10B981']
    });
    
    await addXP(rewardXp);
    await refreshAll();
    setClaimingId(null);
  };

  if (loading && achievements.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center h-full w-full">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 transition-colors duration-300" style={{ background: 'var(--theme-bg-canvas, #070505)' }}>
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Header Section */}
        <div className={cn(
               "flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-3xl border relative overflow-hidden transition-all duration-300",
               isMythic ? "shadow-xl" : "shadow-md"
             )}
             style={{
               background: 'var(--theme-surface-card, #0E0606)',
               borderColor: 'var(--theme-border-default, #3D1C1C)'
             }}>
          
          {isMythic && (
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-20 pointer-events-none"
                 style={{ background: 'radial-gradient(circle, var(--theme-accent-glow, #FF3D00) 0%, transparent 70%)' }} />
          )}

          <div className="flex items-center gap-5 z-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-colors duration-300"
                 style={{
                   background: 'var(--theme-accent-primary-dim, rgba(220,38,38,0.15))',
                   borderColor: 'var(--theme-accent-secondary, #F5D060)',
                   boxShadow: isMythic ? '0 0 20px rgba(245,208,96,0.2)' : 'none'
                 }}>
              <Trophy className="w-8 h-8 transition-colors duration-300" style={{ color: 'var(--theme-accent-secondary, #F5D060)' }} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-extrabold tracking-widest uppercase drop-shadow-md transition-colors duration-300"
                  style={{ fontFamily: 'var(--theme-font-heading, "Cinzel", serif)', color: 'var(--theme-text-primary, #F5E8E8)' }}>
                {theme === 'gow' ? 'Saga of Glory' : theme === 'classic' ? 'My Achievements' : 'Trophy Room'}
              </h1>
              <p className="text-sm font-medium opacity-80 transition-colors duration-300" style={{ color: 'var(--theme-text-muted, #A89898)' }}>
                {theme === 'gow' ? 'The legacy of your battles is written here.' : 'Track your progress and unlock rewards.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-64 z-10">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider transition-colors duration-300">
              <span style={{ color: 'var(--theme-text-muted, #A89898)' }}>Claimed</span>
              <span style={{ color: 'var(--theme-accent-secondary, #F5D060)' }}>{claimedCount} / {totalCount}</span>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden border p-[1px] transition-colors duration-300"
                 style={{ background: 'var(--theme-bg-subtle, #120808)', borderColor: 'var(--theme-border-subtle, #2A1414)' }}>
              <div className="h-full rounded-full transition-all duration-1000 ease-out"
                   style={{
                     width: `${progressPercent}%`,
                     background: 'var(--theme-accent-secondary, #F5D060)',
                     boxShadow: isMythic ? '0 0 10px var(--theme-accent-secondary)' : 'none'
                   }} />
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
          {achievements.map((achievement) => {
            const isClaimed = achievement.isClaimed;
            const isUnlocked = achievement.isUnlocked;
            
            // Handle icon fallback since DB might use generic names or emojis
            let iconName = achievement.icon;
            if (iconName.length <= 2) {
              const emojiMap: Record<string, string> = { '🚀': 'Rocket', '🔥': 'Flame', '⭐': 'Star', '👑': 'Crown', '🛡️': 'Shield' };
              iconName = emojiMap[iconName] || 'Star';
            }
            // @ts-ignore
            const Icon = LucideIcons[iconName] || Star;

            return (
              <div
                key={achievement.id}
                className={cn(
                  "relative flex flex-col p-5 rounded-2xl border transition-all duration-300 overflow-hidden",
                  isClaimed ? "cursor-default" : isUnlocked ? "ring-2 hover:-translate-y-1" : "cursor-not-allowed"
                )}
                style={{
                  background: isClaimed 
                    ? 'var(--theme-surface-card-alt, #160A0A)'
                    : 'var(--theme-surface-card, #0E0606)',
                  borderColor: isClaimed 
                    ? 'var(--theme-accent-primary, #DC2626)'
                    : 'var(--theme-border-subtle, #2A1414)',
                  boxShadow: (isClaimed && isMythic) ? '0 8px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(220,38,38,0.05)' : (isUnlocked && !isClaimed) ? '0 0 15px var(--theme-accent-glow, rgba(16,185,129,0.3))' : 'none',
                  opacity: isClaimed ? 1 : isUnlocked ? 1 : (theme === 'classic' || theme === 'light' ? 0.8 : 0.65),
                }}
              >
                
                {/* Glow Effect for Claimed (Mythic) */}
                {(isClaimed && isMythic) && (
                  <div className="absolute inset-0 pointer-events-none"
                       style={{ boxShadow: '0 0 15px var(--theme-accent-glow, rgba(255,61,0,0.1))' }} />
                )}

                <div className="flex items-start justify-between mb-4 z-10">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner transition-colors duration-300",
                    isClaimed ? "opacity-100" : isUnlocked ? "opacity-100" : "opacity-50 grayscale"
                  )}
                  style={{
                    background: isClaimed ? 'var(--theme-accent-primary-dim, rgba(220,38,38,0.15))' : 'var(--theme-bg-subtle, #120808)',
                    borderColor: isClaimed ? 'var(--theme-accent-secondary, #F5D060)' : 'var(--theme-border-subtle, #2A1414)',
                  }}>
                    <Icon className="w-6 h-6 transition-colors duration-300" style={{ color: isClaimed ? 'var(--theme-accent-secondary, #F5D060)' : 'var(--theme-text-muted, #8C7A7A)' }} />
                  </div>
                  
                  {!isUnlocked && (
                    <div className="p-1.5 rounded-lg border transition-colors duration-300"
                         style={{ background: 'var(--theme-bg-subtle, #120808)', borderColor: 'var(--theme-border-subtle, #2A1414)' }}>
                      <Lock className="w-3.5 h-3.5" style={{ color: 'var(--theme-text-muted, #8C7A7A)' }} />
                    </div>
                  )}
                  {isClaimed && achievement.claimedAt && (
                    <div className="text-[10px] font-mono tracking-wider opacity-80" style={{ color: 'var(--theme-accent-cyan, #00E5FF)' }}>
                      {new Date(achievement.claimedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 z-10 mb-4">
                  <h3 className="font-bold text-sm tracking-wide uppercase transition-colors duration-300"
                      style={{ 
                        fontFamily: 'var(--theme-font-heading, "Cinzel", serif)',
                        color: (isClaimed || isUnlocked) ? 'var(--theme-text-primary, #F5E8E8)' : 'var(--theme-text-dim, #554040)'
                      }}>
                    {achievement.title}
                  </h3>
                  <p className="text-xs leading-relaxed transition-colors duration-300"
                     style={{ color: (isClaimed || isUnlocked) ? 'var(--theme-text-secondary, #D1C2C2)' : 'var(--theme-text-muted, #8C7A7A)' }}>
                    {achievement.description}
                  </p>
                </div>
                
                <div className="mt-auto">
                  {!isClaimed && isUnlocked ? (
                    <button 
                      onClick={(e) => handleClaim(achievement.id, achievement.rewardXp, e)}
                      disabled={claimingId === achievement.id}
                      className="w-full py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 flex justify-center items-center gap-2"
                      style={{ 
                        background: 'var(--theme-accent-primary, #DC2626)',
                        color: 'white',
                        boxShadow: '0 4px 14px var(--theme-accent-primary-dim)'
                      }}
                    >
                      {claimingId === achievement.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        `Claim +${achievement.rewardXp} XP`
                      )}
                    </button>
                  ) : !isClaimed && !isUnlocked ? (
                    <div className="w-full flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] font-mono opacity-60" style={{ color: 'var(--theme-text-primary)' }}>
                        <span>Progress</span>
                        <span>{achievement.progressCount}/{achievement.targetCount}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--theme-bg-canvas)' }}>
                        <div className="h-full rounded-full transition-all duration-500"
                             style={{ 
                               width: `${(achievement.progressCount / achievement.targetCount) * 100}%`,
                               background: 'var(--theme-text-muted)'
                             }} />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full py-2 rounded-lg font-bold text-xs uppercase tracking-wider text-center"
                         style={{ 
                           background: 'var(--theme-bg-subtle, #120808)',
                           color: 'var(--theme-accent-primary, #DC2626)',
                           border: '1px solid var(--theme-border-subtle, #2A1414)'
                         }}>
                      Claimed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
