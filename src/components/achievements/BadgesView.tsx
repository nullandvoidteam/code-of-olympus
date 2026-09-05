import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useAchievementsAndNotifications } from '../../lib/achievements';
import { cn } from '../../lib/utils';
import * as LucideIcons from 'lucide-react';
import { Shield, Lock, Loader2, Star } from 'lucide-react';

export const BadgesView: React.FC = () => {
  const { user } = useAuth();
  const { badges, loading } = useAchievementsAndNotifications(user?.id);
  const { theme } = useTheme();

  const isMythic = theme === 'gow';
  const unlockedCount = badges.filter(b => b.isUnlocked).length;
  const totalCount = badges.length;
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  if (loading && badges.length === 0) {
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
                 style={{ background: 'radial-gradient(circle, var(--theme-accent-cyan, #00E5FF) 0%, transparent 70%)' }} />
          )}

          <div className="flex items-center gap-5 z-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-colors duration-300"
                 style={{
                   background: 'var(--theme-bg-subtle, rgba(220,38,38,0.15))',
                   borderColor: 'var(--theme-accent-cyan, #00E5FF)',
                   boxShadow: isMythic ? '0 0 20px rgba(0,229,255,0.2)' : 'none'
                 }}>
              <Shield className="w-8 h-8 transition-colors duration-300" style={{ color: 'var(--theme-accent-cyan, #00E5FF)' }} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-extrabold tracking-widest uppercase drop-shadow-md transition-colors duration-300"
                  style={{ fontFamily: 'var(--theme-font-heading, "Cinzel", serif)', color: 'var(--theme-text-primary, #F5E8E8)' }}>
                {theme === 'gow' ? 'Honor Badges' : 'My Badges'}
              </h1>
              <p className="text-sm font-medium opacity-80 transition-colors duration-300" style={{ color: 'var(--theme-text-muted, #A89898)' }}>
                {theme === 'gow' ? 'Marks of your legendary deeds.' : 'Collect badges by completing milestones.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-64 z-10">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider transition-colors duration-300">
              <span style={{ color: 'var(--theme-text-muted, #A89898)' }}>Collected</span>
              <span style={{ color: 'var(--theme-accent-cyan, #00E5FF)' }}>{unlockedCount} / {totalCount}</span>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden border p-[1px] transition-colors duration-300"
                 style={{ background: 'var(--theme-bg-subtle, #120808)', borderColor: 'var(--theme-border-subtle, #2A1414)' }}>
              <div className="h-full rounded-full transition-all duration-1000 ease-out"
                   style={{
                     width: `${progressPercent}%`,
                     background: 'var(--theme-accent-cyan, #00E5FF)',
                     boxShadow: isMythic ? '0 0 10px var(--theme-accent-cyan)' : 'none'
                   }} />
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-10">
          {badges.map((badge) => {
            const isUnlocked = badge.isUnlocked;
            // @ts-ignore
            const Icon = LucideIcons[badge.icon] || Star;

            return (
              <div
                key={badge.id}
                className={cn(
                  "relative flex flex-col items-center text-center p-6 rounded-2xl border transition-all duration-300 overflow-hidden group",
                  isUnlocked ? "hover:-translate-y-1" : "opacity-60"
                )}
                style={{
                  background: isUnlocked 
                    ? 'var(--theme-surface-card-alt, #160A0A)'
                    : 'var(--theme-surface-card, #0E0606)',
                  borderColor: isUnlocked 
                    ? 'var(--theme-accent-cyan, #00E5FF)'
                    : 'var(--theme-border-subtle, #2A1414)',
                  boxShadow: (isUnlocked && isMythic) ? '0 8px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,229,255,0.05)' : 'none',
                }}
              >
                
                {/* Glow Effect for Unlocked (Mythic) */}
                {(isUnlocked && isMythic) && (
                  <div className="absolute inset-0 pointer-events-none"
                       style={{ boxShadow: '0 0 15px rgba(0,229,255,0.1)' }} />
                )}

                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-inner transition-transform duration-500 mb-4 z-10",
                  isUnlocked ? "group-hover:scale-110 group-hover:rotate-6" : "grayscale"
                )}
                style={{
                  background: isUnlocked ? 'var(--theme-bg-canvas)' : 'var(--theme-bg-subtle, #120808)',
                  borderColor: isUnlocked ? 'var(--theme-accent-cyan, #00E5FF)' : 'var(--theme-border-subtle, #2A1414)',
                }}>
                  {badge.icon.length > 2 ? (
                      <Icon className="w-8 h-8 transition-colors duration-300" style={{ color: isUnlocked ? 'var(--theme-accent-cyan, #00E5FF)' : 'var(--theme-text-muted, #8C7A7A)' }} />
                  ) : (
                      <span className="text-3xl">{badge.icon}</span>
                  )}
                </div>
                
                <h3 className="font-bold text-sm tracking-wide uppercase transition-colors duration-300 mb-2"
                    style={{ 
                      fontFamily: 'var(--theme-font-heading, "Cinzel", serif)',
                      color: isUnlocked ? 'var(--theme-text-primary, #F5E8E8)' : 'var(--theme-text-dim, #554040)'
                    }}>
                  {badge.title}
                </h3>
                
                {isUnlocked ? (
                  <p className="text-xs leading-relaxed transition-colors duration-300"
                     style={{ color: 'var(--theme-text-secondary, #D1C2C2)' }}>
                    {badge.description}
                  </p>
                ) : (
                  <div className="flex items-center gap-1.5 opacity-60">
                    <Lock className="w-3 h-3" style={{ color: 'var(--theme-text-muted)' }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>Locked</span>
                  </div>
                )}
                
                {isUnlocked && badge.unlockedAt && (
                  <div className="mt-4 px-2 py-1 rounded-md text-[10px] font-mono tracking-wider opacity-80" 
                       style={{ background: 'var(--theme-bg-canvas)', color: 'var(--theme-text-muted)' }}>
                    {new Date(badge.unlockedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
