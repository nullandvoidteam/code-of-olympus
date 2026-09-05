import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { Target, Star, Loader2, Compass, Shield, Clock } from 'lucide-react';

export const QuestsView: React.FC = () => {
  const { profile, loading } = useAuth();
  const { theme } = useTheme();

  const isMythic = theme === 'gow';

  if (loading || !profile) {
    return (
      <div className="flex-1 flex items-center justify-center h-full w-full">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const dailyGoalXp = profile.daily_goal_xp || 50;
  const dailyXpEarned = profile.daily_xp_earned || 0;
  const dailyGoalPercent = Math.min(100, Math.max(0, Math.round((dailyXpEarned / dailyGoalXp) * 100)));
  const isCompleted = dailyXpEarned >= dailyGoalXp;

  return (
    <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 transition-colors duration-300" style={{ background: 'var(--theme-bg-canvas, #070505)' }}>
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
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
                 style={{ background: 'radial-gradient(circle, var(--theme-accent-primary, #DC2626) 0%, transparent 70%)' }} />
          )}

          <div className="flex items-center gap-5 z-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-colors duration-300"
                 style={{
                   background: 'var(--theme-bg-subtle, rgba(220,38,38,0.15))',
                   borderColor: 'var(--theme-accent-primary, #DC2626)',
                   boxShadow: isMythic ? '0 0 20px rgba(220,38,38,0.2)' : 'none'
                 }}>
              <Compass className="w-8 h-8 transition-colors duration-300" style={{ color: 'var(--theme-accent-primary, #DC2626)' }} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-extrabold tracking-widest uppercase drop-shadow-md transition-colors duration-300"
                  style={{ fontFamily: 'var(--theme-font-heading, "Cinzel", serif)', color: 'var(--theme-text-primary, #F5E8E8)' }}>
                {theme === 'gow' ? 'Saga Quests' : 'Active Quests'}
              </h1>
              <p className="text-sm font-medium opacity-80 transition-colors duration-300" style={{ color: 'var(--theme-text-muted, #A89898)' }}>
                {theme === 'gow' ? 'Fulfill your destiny today.' : 'Complete daily objectives to earn XP.'}
              </p>
            </div>
          </div>
        </div>

        {/* Daily Quest Card */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold tracking-widest uppercase" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}>
            Daily Bounties
          </h2>
          
          <div className="rounded-3xl border shadow-lg overflow-hidden flex flex-col"
               style={{ background: 'var(--theme-surface-card, #0E0606)', borderColor: 'var(--theme-border-default)' }}>
            <div className="px-6 py-5 border-b flex items-center justify-between"
                 style={{ background: 'var(--theme-surface-card-alt)', borderColor: 'var(--theme-border-subtle)' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: 'var(--theme-accent-primary-dim)', color: 'var(--theme-accent-primary)' }}>
                  <Target className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black tracking-widest uppercase" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}>Earn Daily XP</h2>
              </div>
              {isCompleted && (
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5"
                      style={{ background: 'var(--theme-accent-primary-dim)', color: 'var(--theme-accent-primary)' }}>
                  <Star className="w-3.5 h-3.5" /> Completed
                </span>
              )}
            </div>
            
            <div className="p-6 sm:p-8 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                <div className="w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0"
                     style={{ background: 'var(--theme-bg-subtle)', borderColor: 'var(--theme-border-subtle)' }}>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-50" style={{ color: 'var(--theme-text-primary)' }}>Reward</span>
                  <span className="text-2xl font-black mt-1" style={{ color: 'var(--theme-accent-secondary)' }}>+{dailyGoalXp}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-50" style={{ color: 'var(--theme-text-primary)' }}>XP</span>
                </div>
                <div className="flex-1 w-full flex flex-col gap-3">
                  <h3 className="font-bold text-lg tracking-widest uppercase" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}>
                    The Path of Knowledge
                  </h3>
                  <p className="text-sm opacity-80 leading-relaxed" style={{ color: 'var(--theme-text-primary)' }}>
                    Engage in any learning activities, practice coding challenges, or build projects to accumulate XP. Reach your daily goal to maintain your streak and earn a bonus multiplier.
                  </p>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'var(--theme-bg-subtle)' }}>
                      <div 
                        className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
                        style={{ width: `${dailyGoalPercent}%`, background: isCompleted ? 'var(--theme-accent-primary)' : 'var(--theme-accent-cyan)' }}
                      >
                        <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -skew-x-12" />
                      </div>
                    </div>
                    <span className="text-sm font-bold whitespace-nowrap opacity-80" style={{ color: 'var(--theme-text-primary)' }}>
                      {dailyXpEarned} / {dailyGoalXp} XP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="flex flex-col gap-4 mt-4">
          <h2 className="text-xl font-bold tracking-widest uppercase opacity-60" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}>
            Weekly Quests
          </h2>
          
          <div className="rounded-3xl border border-dashed flex flex-col items-center justify-center py-12 px-6 text-center opacity-60"
               style={{ borderColor: 'var(--theme-border-subtle)', background: 'var(--theme-bg-subtle)' }}>
            <Clock className="w-10 h-10 mb-4" style={{ color: 'var(--theme-text-muted)' }} />
            <h3 className="text-lg font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}>
              More quests arriving soon
            </h3>
            <p className="text-sm max-w-sm" style={{ color: 'var(--theme-text-muted)' }}>
              The gods are preparing new challenges. Check back later for weekly bounties and epic sagas.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
