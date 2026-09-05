import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { User, Shield, Zap, Flame, Calendar, MapPin, Mail, Loader2, Award } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const { theme } = useTheme();

  const isMythic = theme === 'gow';

  if (loading || !profile) {
    return (
      <div className="flex-1 flex items-center justify-center w-full h-full">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--theme-accent-primary, #DC2626)' }} />
      </div>
    );
  }

  const nextLevelXP = profile.level ? profile.level * 1000 : 1000;
  const currentLevelBaseXP = profile.level && profile.level > 1 ? (profile.level - 1) * 1000 : 0;
  const xpIntoCurrentLevel = (profile.xp || 0) - currentLevelBaseXP;
  const xpNeeded = nextLevelXP - currentLevelBaseXP;
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpIntoCurrentLevel / xpNeeded) * 100)));

  return (
    <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 transition-colors duration-300" style={{ background: 'var(--theme-bg-canvas, #070505)' }}>
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Banner and Avatar */}
        <div className="relative rounded-3xl overflow-hidden border shadow-lg transition-colors duration-300"
             style={{ 
               background: 'var(--theme-surface-card, #0E0606)',
               borderColor: 'var(--theme-border-default, #3D1C1C)'
             }}>
          
          <div className="h-48 w-full"
               style={{ background: 'var(--theme-sidebar-active-bg, linear-gradient(90deg, #3D1C1C 0%, #160A0A 100%))' }} />
          
          <div className="px-6 sm:px-10 pb-8 flex flex-col sm:flex-row gap-6 relative">
            <div className="-mt-16 relative">
              <div className="w-32 h-32 rounded-2xl border-4 flex items-center justify-center overflow-hidden transition-colors duration-300 shadow-xl"
                   style={{ 
                     background: 'var(--theme-surface-card-alt, #160A0A)',
                     borderColor: 'var(--theme-bg-canvas, #070505)' 
                   }}>
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 opacity-50" style={{ color: 'var(--theme-text-muted)' }} />
                )}
              </div>
              <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border-2 shadow-lg"
                   style={{
                     background: 'var(--theme-accent-primary, #DC2626)',
                     color: 'white',
                     borderColor: 'var(--theme-bg-canvas, #070505)'
                   }}>
                {profile.level || 1}
              </div>
            </div>

            <div className="flex-1 pt-2 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
              <div className="flex flex-col">
                <h1 className="text-3xl font-extrabold tracking-wide"
                    style={{ fontFamily: 'var(--theme-font-heading, "Cinzel", serif)', color: 'var(--theme-text-primary, #F5E8E8)' }}>
                  {profile.full_name || profile.username || 'Adventurer'}
                </h1>
                <p className="text-sm font-medium mt-1 uppercase tracking-widest opacity-80"
                   style={{ color: 'var(--theme-accent-secondary, #F5D060)' }}>
                  {profile.role === 'admin' ? 'Grandmaster (Admin)' : 'Code Warrior'}
                </p>
              </div>

              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-300 hover:opacity-80"
                        style={{ 
                          background: 'var(--theme-surface-card-alt, #160A0A)', 
                          color: 'var(--theme-text-primary)',
                          borderColor: 'var(--theme-border-subtle)'
                        }}>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl border flex items-center gap-4 transition-colors duration-300"
               style={{ background: 'var(--theme-surface-card, #0E0606)', borderColor: 'var(--theme-border-default)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                 style={{ background: 'var(--theme-accent-primary-dim)', color: 'var(--theme-accent-primary)' }}>
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: 'var(--theme-text-primary)' }}>Level</p>
              <p className="text-2xl font-black" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-mono)' }}>
                {profile.level || 1}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl border flex items-center gap-4 transition-colors duration-300"
               style={{ background: 'var(--theme-surface-card, #0E0606)', borderColor: 'var(--theme-border-default)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                 style={{ background: 'var(--theme-hud-xp-bg, rgba(245,208,96,0.15))', color: 'var(--theme-accent-secondary)' }}>
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: 'var(--theme-text-primary)' }}>Total XP</p>
              <p className="text-2xl font-black" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-mono)' }}>
                {profile.xp || 0}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl border flex items-center gap-4 transition-colors duration-300"
               style={{ background: 'var(--theme-surface-card, #0E0606)', borderColor: 'var(--theme-border-default)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                 style={{ background: 'var(--theme-hud-streak-bg, rgba(220,38,38,0.15))', color: 'var(--theme-hud-streak-text, #FF3D00)' }}>
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: 'var(--theme-text-primary)' }}>Day Streak</p>
              <p className="text-2xl font-black" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-mono)' }}>
                {profile.streak || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Next Level Progress */}
        <div className="p-6 sm:p-8 rounded-3xl border flex flex-col gap-5 transition-colors duration-300"
             style={{ background: 'var(--theme-surface-card, #0E0606)', borderColor: 'var(--theme-border-default)' }}>
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--theme-text-primary)' }}>Journey to Level { (profile.level || 1) + 1 }</h2>
              <p className="text-sm opacity-60 mt-1" style={{ color: 'var(--theme-text-primary)' }}>Keep learning to reach the next rank.</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black" style={{ color: 'var(--theme-accent-primary)' }}>{xpIntoCurrentLevel}</span>
              <span className="text-sm font-bold opacity-60" style={{ color: 'var(--theme-text-primary)' }}> / {xpNeeded} XP</span>
            </div>
          </div>

          <div className="w-full h-4 rounded-full overflow-hidden border p-[2px]"
               style={{ background: 'var(--theme-bg-subtle)', borderColor: 'var(--theme-border-subtle)' }}>
            <div className="h-full rounded-full transition-all duration-1000 ease-out"
                 style={{
                   width: `${progressPercent}%`,
                   background: isMythic 
                    ? 'linear-gradient(90deg, var(--theme-accent-primary) 0%, var(--theme-accent-secondary) 100%)'
                    : 'var(--theme-accent-primary)',
                   boxShadow: isMythic ? '0 0 10px var(--theme-accent-secondary)' : 'none'
                 }} />
          </div>
        </div>

        {/* User Details */}
        <div className="p-6 sm:p-8 rounded-3xl border flex flex-col gap-6 transition-colors duration-300"
             style={{ background: 'var(--theme-surface-card, #0E0606)', borderColor: 'var(--theme-border-default)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--theme-text-primary)' }}>Biography</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 opacity-50" style={{ color: 'var(--theme-text-primary)' }} />
              <div className="flex flex-col">
                <span className="text-xs uppercase font-bold opacity-50" style={{ color: 'var(--theme-text-primary)' }}>Email</span>
                <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>{profile.email}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 opacity-50" style={{ color: 'var(--theme-text-primary)' }} />
              <div className="flex flex-col">
                <span className="text-xs uppercase font-bold opacity-50" style={{ color: 'var(--theme-text-primary)' }}>Username</span>
                <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>@{profile.username}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 opacity-50" style={{ color: 'var(--theme-text-primary)' }} />
              <div className="flex flex-col">
                <span className="text-xs uppercase font-bold opacity-50" style={{ color: 'var(--theme-text-primary)' }}>Joined Date</span>
                <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                  {profile.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 opacity-50" style={{ color: 'var(--theme-text-primary)' }} />
              <div className="flex flex-col">
                <span className="text-xs uppercase font-bold opacity-50" style={{ color: 'var(--theme-text-primary)' }}>Daily Goal</span>
                <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>{profile.daily_goal_xp || 50} XP</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
