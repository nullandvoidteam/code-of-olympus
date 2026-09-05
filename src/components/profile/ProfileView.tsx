import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useAchievementsAndNotifications, claimAchievement, type BadgeItem, type AchievementItem } from '../../lib/achievements';
import { useLearningProgress } from '../../lib/learning';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import * as LucideIcons from 'lucide-react';
import {
  User,
  Shield,
  Zap,
  Flame,
  Calendar,
  Mail,
  Loader2,
  Award,
  Target,
  Trophy,
  Globe,
  CheckCircle2,
  Lock,
  Star,
  Compass,
  ArrowRight,
  Clock,
  Sparkles,
  Edit3,
  X,
  BookOpen,
  Swords,
  ChevronRight,
  Share2,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SpiderNetDecal } from '../ui/SpiderNetDecal';
import { SpiderMaskSticker, ThwipSticker, SpiderSenseSticker } from '../ui/SpiderStickers';

export type ProfileSubTab = 'overview' | 'quests' | 'achievements' | 'badges';

interface ProfileViewProps {
  initialSubTab?: ProfileSubTab;
  onSubTabChange?: (tab: ProfileSubTab) => void;
  onNavigateTab?: (tab: string) => void;
}

// Map badges to extracted pixel art assets where available
const BADGE_ASSET_MAP: Record<string, string> = {
  'first-steps': '/extracted/badge_first_steps.png',
  'bug-hunter': '/extracted/badge_bug_hunter.png',
  'streak-master': '/extracted/badge_streak.png',
  'fast-debugger': '/extracted/badge_fast_debugger.png',
  'first-build': '/extracted/badge_first_build.png',
  'quest-master': '/extracted/badge_quest_master.png',
  'code-warrior': '/extracted/badge_code_warrior.png',
};

function getBadgeAsset(badge: BadgeItem): string | null {
  if (BADGE_ASSET_MAP[badge.slug]) return BADGE_ASSET_MAP[badge.slug];
  const titleLower = badge.title.toLowerCase();
  if (titleLower.includes('first')) return '/extracted/badge_first_steps.png';
  if (titleLower.includes('bug')) return '/extracted/badge_bug_hunter.png';
  if (titleLower.includes('streak')) return '/extracted/badge_streak.png';
  if (titleLower.includes('build')) return '/extracted/badge_first_build.png';
  if (titleLower.includes('warrior')) return '/extracted/badge_code_warrior.png';
  if (titleLower.includes('quest') || titleLower.includes('master')) return '/extracted/badge_quest_master.png';
  return null;
}

function getRarity(badge: BadgeItem): { label: string; color: string; border: string; bg: string } {
  const titleLower = badge.title.toLowerCase();
  if (titleLower.includes('master') || titleLower.includes('olympus') || titleLower.includes('god')) {
    return { label: 'Mythic', color: '#FF3D00', border: 'border-orange-500/50', bg: 'bg-orange-500/10' };
  }
  if (titleLower.includes('warrior') || titleLower.includes('streak') || titleLower.includes('champion')) {
    return { label: 'Legendary', color: '#F5D060', border: 'border-amber-500/50', bg: 'bg-amber-500/10' };
  }
  if (titleLower.includes('debugger') || titleLower.includes('builder') || titleLower.includes('build')) {
    return { label: 'Epic', color: '#A855F7', border: 'border-purple-500/50', bg: 'bg-purple-500/10' };
  }
  if (titleLower.includes('hunter') || titleLower.includes('coder')) {
    return { label: 'Rare', color: '#00E5FF', border: 'border-cyan-500/50', bg: 'bg-cyan-500/10' };
  }
  return { label: 'Common', color: '#10B981', border: 'border-emerald-500/50', bg: 'bg-emerald-500/10' };
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  initialSubTab = 'overview',
  onSubTabChange,
  onNavigateTab,
}) => {
  const { user, profile, loading: authLoading, updateProfile, addXP, refreshProfile } = useAuth();
  const { theme } = useTheme();
  const { badges, achievements, activities, refreshAll, loading: achLoading } = useAchievementsAndNotifications(user?.id);
  const { courses, overallProgress } = useLearningProgress(user?.id);

  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>(initialSubTab);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [selectedBadgeModal, setSelectedBadgeModal] = useState<BadgeItem | null>(null);
  const [achievementFilter, setAchievementFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editDailyGoalXp, setEditDailyGoalXp] = useState(50);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Global rank state
  const [globalRank, setGlobalRank] = useState<number | null>(null);

  useEffect(() => {
    const fetchGlobalRank = async () => {
      if (!profile || typeof profile.xp !== 'number') return;
      
      try {
        // Count how many users have MORE xp than the current user
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gt('xp', profile.xp);
          
        if (!error && count !== null) {
          // Rank is count of people ahead + 1
          setGlobalRank(count + 1);
        }
      } catch (err) {
        console.error('Error fetching global rank:', err);
      }
    };
    
    fetchGlobalRank();
  }, [profile?.xp]);

  // Keep subtab in sync if prop changes
  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleSubTabChange = (tab: ProfileSubTab) => {
    setActiveSubTab(tab);
    if (onSubTabChange) onSubTabChange(tab);
  };

  const isMythic = theme === 'gow';
  const isClassic = theme === 'classic';
  const isSpace = theme === 'space';
  const isLight = theme === 'light';
  const isSpiderman = theme === 'spiderman';

  // Stats calculations
  const level = profile?.level || 1;
  const xp = profile?.xp || 0;
  const streak = profile?.streak || 0;
  const nextLevelXP = level * 1000;
  const currentLevelBaseXP = (level - 1) * 1000;
  const xpIntoCurrentLevel = Math.max(0, xp - currentLevelBaseXP);
  const xpNeeded = Math.max(1, nextLevelXP - currentLevelBaseXP);
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpIntoCurrentLevel / xpNeeded) * 100)));

  const dailyGoalXp = profile?.daily_goal_xp || 50;
  const dailyXpEarned = profile?.daily_xp_earned || 0;
  const dailyGoalPercent = Math.min(100, Math.max(0, Math.round((dailyXpEarned / dailyGoalXp) * 100)));
  const isDailyQuestComplete = dailyXpEarned >= dailyGoalXp;

  const unlockedBadges = useMemo(() => badges.filter((b) => b.isUnlocked), [badges]);
  const unlockedAchievements = useMemo(() => achievements.filter((a) => a.isUnlocked), [achievements]);
  const claimedAchievements = useMemo(() => achievements.filter((a) => a.isClaimed), [achievements]);
  const unclaimedAchievements = useMemo(() => achievements.filter((a) => a.isUnlocked && !a.isClaimed), [achievements]);

  // Rank Tier Title
  const rankTier = useMemo(() => {
    if (isSpiderman) {
      if (level >= 35) return { title: 'Spider-Verse Legend', tier: 'Tier V' };
      if (level >= 20) return { title: 'Web-Slinger Champion', tier: 'Tier IV' };
      if (level >= 10) return { title: 'Queens Vigilante', tier: 'Tier III' };
      if (level >= 5) return { title: 'Midtown High Hero', tier: 'Tier II' };
      return { title: 'Friendly Neighborhood Novice', tier: 'Tier I' };
    }
    if (isClassic) {
      if (level >= 35) return { title: 'Grandmaster Coder', tier: 'Tier V' };
      if (level >= 20) return { title: 'Lead Architect', tier: 'Tier IV' };
      if (level >= 10) return { title: 'Code Vanguard', tier: 'Tier III' };
      if (level >= 5) return { title: 'Adept Apprentice', tier: 'Tier II' };
      return { title: 'Novice Adventurer', tier: 'Tier I' };
    }
    if (level >= 35) return { title: 'Grandmaster Demigod', tier: 'Tier V' };
    if (level >= 20) return { title: 'Spartan Champion', tier: 'Tier IV' };
    if (level >= 10) return { title: 'Code Vanguard', tier: 'Tier III' };
    if (level >= 5) return { title: 'Adept Apprentice', tier: 'Tier II' };
    return { title: 'Novice Adventurer', tier: 'Tier I' };
  }, [level, isSpiderman, isClassic]);

  // Handle Achievement Claim
  const handleClaimAchievement = async (achievement: AchievementItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    setClaimingId(achievement.id);

    try {
      await claimAchievement(user.id, achievement.id);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: isClassic ? ['#10B981', '#059669', '#34D399', '#F59E0B'] : ['#F5D060', '#DC2626', '#FF5722', '#00E5FF'],
      });
      await addXP(achievement.rewardXp);
      await refreshAll();
    } catch (err) {
      console.error('Error claiming achievement:', err);
    } finally {
      setClaimingId(null);
    }
  };

  // Handle Save Profile
  const handleOpenEditModal = () => {
    setEditFullName(profile?.full_name || '');
    setEditUsername(profile?.username || '');
    setEditDailyGoalXp(profile?.daily_goal_xp || 50);
    setSaveSuccessMsg('');
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const { error } = await updateProfile({
        full_name: editFullName.trim(),
        username: editUsername.trim(),
        daily_goal_xp: Number(editDailyGoalXp) || 50,
      });
      if (!error) {
        setSaveSuccessMsg('Profile updated successfully!');
        await refreshProfile();
        setTimeout(() => {
          setIsEditingProfile(false);
          setSaveSuccessMsg('');
        }, 800);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (authLoading && !profile) {
    return (
      <div className="flex-1 flex items-center justify-center w-full min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--theme-accent-primary, #DC2626)' }} />
      </div>
    );
  }

  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || (isSpiderman ? 'Peter Parker' : isClassic ? 'Alex Morgan' : 'Adventurer');

  return (
    <div
      className="flex-1 w-full p-3 sm:p-6 lg:p-8 transition-colors duration-300 select-none pb-24"
      style={{
        background: 'transparent',
        color: 'var(--theme-text-primary, #E8D5D5)',
        fontFamily: 'var(--theme-font-body, "Inter", sans-serif)',
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-6 sm:gap-8">
        {/* ====================================================================
            1. HERO PROFILE HEADER
            ==================================================================== */}
        <div
          className={cn(
            'relative rounded-3xl overflow-hidden border transition-all duration-300',
            isClassic
              ? 'bg-white border-[#ece7df] shadow-[0_8px_24px_rgba(0,0,0,0.04)]'
              : 'border-[var(--theme-border-default,#3D1C1C)] shadow-2xl'
          )}
          style={{
            background: isClassic ? '#ffffff' : 'var(--theme-surface-card, #0E0606)',
          }}
        >
          {isSpiderman && <SpiderNetDecal size={90} position="bottom-right" opacity={0.4} />}

          {/* Dynamic Theme Banner Backdrop */}
          <div
            className={cn(
              "h-36 sm:h-48 w-full relative overflow-hidden transition-all duration-300",
              isSpiderman && "animate-spider-banner"
            )}
            style={{
              background: isSpiderman
                ? 'linear-gradient(135deg, #FF1744 0%, #152452 40%, #0B1021 70%, #1A2E63 100%)'
                : isClassic
                ? 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)'
                : isSpace
                ? 'linear-gradient(135deg, #4C1D95 0%, #1E1B4B 50%, #030712 100%)'
                : isLight
                ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 60%, #0F172A 100%)'
                : 'linear-gradient(135deg, #3D1C1C 0%, #1a0808 60%, #0c0404 100%)',
            }}
          >
            {/* Ambient decorative elements */}
            {isSpiderman ? (
              <>
                <SpiderNetDecal size={110} position="top-right" glowColor="rgba(0, 240, 255, 0.7)" />
                <SpiderNetDecal size={80} position="top-left" glowColor="rgba(255, 42, 52, 0.7)" />
                <div className="absolute right-28 top-3 hidden sm:block pointer-events-none animate-spider-sense">
                  <SpiderSenseSticker size={46} />
                </div>
                <div className="absolute left-6 bottom-2 hidden sm:block pointer-events-none">
                  <ThwipSticker size={62} rotate={-8} />
                </div>
                <div className="absolute right-6 bottom-3 hidden md:block pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                  <SpiderMaskSticker size={54} />
                </div>
              </>
            ) : isClassic ? (
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:16px_16px]" />
            ) : isMythic ? (
              <>
                <div
                  className="absolute inset-0 opacity-40 mix-blend-overlay"
                  style={{
                    background: 'radial-gradient(circle at 70% 30%, rgba(220,38,38,0.7) 0%, transparent 60%)',
                  }}
                />
                <div className="absolute top-2 right-4 text-red-700/20 font-serif text-8xl font-black select-none pointer-events-none">
                  Ω
                </div>
              </>
            ) : null}

            {/* Edit Profile Action on Banner */}
            <button
              type="button"
              onClick={handleOpenEditModal}
              className={cn(
                'absolute top-4 right-4 sm:top-6 sm:right-6 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md shadow-md active:scale-95',
                isClassic
                  ? 'bg-white/90 hover:bg-white text-emerald-900 border border-emerald-200'
                  : 'bg-black/50 hover:bg-black/70 text-white border border-white/20'
              )}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* User Details & Identity Strip */}
          <div className="px-4 sm:px-8 pb-6 sm:pb-8 flex flex-col sm:flex-row gap-5 sm:gap-6 relative">
            {/* Avatar with level badge */}
            <div className="-mt-14 sm:-mt-20 relative shrink-0 self-center sm:self-auto">
              <div
                className={cn(
                  'w-28 h-28 sm:w-36 sm:h-36 rounded-2xl sm:rounded-3xl border-4 flex items-center justify-center overflow-hidden transition-colors duration-300 shadow-xl relative',
                  isClassic ? 'border-white bg-[#faf8f5]' : isSpiderman ? 'border-[#00F0FF]/60 bg-[#101730]' : 'border-[var(--theme-surface-card,#0E0606)] bg-[#160A0A]'
                )}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : isSpiderman ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#101730] to-[#0B1021] p-3">
                    <SpiderMaskSticker size={72} />
                  </div>
                ) : isClassic ? (
                  <img src="/extracted/alex_avatar.png" alt="Avatar" className="w-full h-full object-contain p-2" />
                ) : (
                  <User className="w-16 h-16 opacity-60" style={{ color: 'var(--theme-text-muted)' }} />
                )}
              </div>

              {/* Level Medallion */}
              <div
                className={cn(
                  'absolute -bottom-2 -right-2 px-2.5 py-1 rounded-xl flex items-center justify-center font-black text-xs border-2 shadow-lg',
                  isSpiderman
                    ? 'bg-gradient-to-r from-[#FF1744] to-[#1E3A8A] text-white border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : isClassic
                    ? 'bg-emerald-600 text-white border-white font-pixel'
                    : 'bg-[var(--theme-accent-primary,#DC2626)] text-white border-[#070505]'
                )}
                title={`Level ${level}`}
              >
                LVL {level}
              </div>
            </div>

            {/* Profile Info Details */}
            <div className="flex-1 flex flex-col justify-between pt-1 text-center sm:text-left gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1
                    className="text-2xl sm:text-3xl font-extrabold tracking-wide"
                    style={{
                      fontFamily: isMythic
                        ? 'var(--theme-font-heading, "Cinzel", serif)'
                        : isClassic
                        ? 'inherit'
                        : 'var(--theme-font-heading, "Inter", sans-serif)',
                      color: isClassic ? '#1c1917' : 'var(--theme-text-primary, #F5E8E8)',
                    }}
                  >
                    {displayName}
                  </h1>

                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border',
                      profile?.role === 'admin'
                        ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-400/40'
                        : isSpiderman
                        ? 'bg-cyan-500/15 text-[#00F0FF] border-[#00F0FF]/40 font-bold'
                        : isClassic
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-500/15 text-amber-500 border-amber-400/40'
                    )}
                  >
                    {profile?.role === 'admin' ? 'Grandmaster Admin' : rankTier.title}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-medium opacity-75 mt-0.5">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">@{profile?.username || 'warrior'}</span>
                  <span className="hidden sm:inline opacity-30">•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 opacity-60" />
                    {profile?.email || user?.email}
                  </span>
                  <span className="hidden sm:inline opacity-30">•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 opacity-60" />
                    Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString([], { month: 'short', year: 'numeric' }) : 'Recently'}
                  </span>
                </div>
              </div>

              {/* Level XP Progress Bar in Hero */}
              <div className="w-full max-w-xl flex flex-col gap-1.5 mt-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="opacity-70">
                    Tier Progress: Level {level} ➔ {level + 1}
                  </span>
                  <span className="font-mono text-xs font-black" style={{ color: 'var(--theme-accent-secondary, #F5D060)' }}>
                    {xpIntoCurrentLevel} / {xpNeeded} XP ({progressPercent}%)
                  </span>
                </div>

                <div
                  className={cn(
                    'w-full h-3 rounded-full overflow-hidden border p-[2px]',
                    isClassic ? 'bg-slate-100 border-slate-200' : 'bg-black/40 border-white/10'
                  )}
                >
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden',
                      isClassic ? 'bg-emerald-500' : 'bg-gradient-to-r from-red-600 via-amber-500 to-amber-400'
                    )}
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/25 w-full animate-[shimmer_2s_infinite] -skew-x-12" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Metric Cards Row */}
          <div
            className={cn(
              'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border-t divide-x sm:divide-x transition-colors duration-300',
              isClassic ? 'border-[#ece7df] divide-[#ece7df] bg-[#faf8f5]/60' : 'border-white/10 divide-white/10 bg-black/20'
            )}
          >
            {/* Stat 1: Total XP */}
            <div className="p-3.5 sm:p-4 flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  isClassic ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                )}
              >
                <Zap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Total XP</p>
                <p className="text-lg sm:text-xl font-black font-mono leading-tight">{xp.toLocaleString()}</p>
              </div>
            </div>

            {/* Stat 2: Streak */}
            <div className="p-3.5 sm:p-4 flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  isClassic ? 'bg-orange-100 text-orange-700' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                )}
              >
                <Flame className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Day Streak</p>
                <p className="text-lg sm:text-xl font-black font-mono leading-tight">{streak} Days</p>
              </div>
            </div>

            {/* Stat 3: Badges */}
            <div
              onClick={() => handleSubTabChange('badges')}
              className="p-3.5 sm:p-4 flex items-center gap-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  isClassic ? 'bg-blue-100 text-blue-700' : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                )}
              >
                <Shield className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Badges</p>
                <p className="text-lg sm:text-xl font-black font-mono leading-tight">
                  {unlockedBadges.length} / {badges.length}
                </p>
              </div>
            </div>

            {/* Stat 4: Achievements */}
            <div
              onClick={() => handleSubTabChange('achievements')}
              className="p-3.5 sm:p-4 flex items-center gap-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  isClassic ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                )}
              >
                <Trophy className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Achievements</p>
                <p className="text-lg sm:text-xl font-black font-mono leading-tight">
                  {claimedAchievements.length} / {achievements.length}
                </p>
              </div>
            </div>

            {/* Stat 5: Global Rank */}
            <div className="p-3.5 sm:p-4 flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  isClassic ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                )}
              >
                <Globe className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Global Rank</p>
                <p className="text-lg sm:text-xl font-black font-mono leading-tight flex items-center gap-2">
                  {globalRank !== null ? (
                    `#${globalRank.toLocaleString()}`
                  ) : (
                    <Loader2 className="w-4 h-4 animate-spin opacity-50" />
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================================
            2. MODERN SUB-TAB NAVIGATION BAR
            ==================================================================== */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto hide-scrollbar pb-1">
          <div
            className={cn(
              'flex items-center p-1.5 rounded-2xl border backdrop-blur-md gap-1.5 transition-all w-full sm:w-auto',
              isClassic
                ? 'bg-stone-100/90 border-[#ece7df] shadow-xs'
                : 'bg-[var(--theme-surface-card,#0E0606)] border-[var(--theme-border-default,#3D1C1C)] shadow-lg'
            )}
          >
            {/* Tab: Overview */}
            <button
              type="button"
              onClick={() => handleSubTabChange('overview')}
              className={cn(
                'flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none',
                activeSubTab === 'overview'
                  ? isClassic
                    ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                    : 'bg-[var(--theme-surface-card-alt,#160A0A)] text-white border border-[var(--theme-border-strong,#8C2828)] shadow-md'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              <User className="w-4 h-4" />
              <span>Overview</span>
            </button>

            {/* Tab: Quests */}
            <button
              type="button"
              onClick={() => handleSubTabChange('quests')}
              className={cn(
                'flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none relative',
                activeSubTab === 'quests'
                  ? isClassic
                    ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                    : 'bg-[var(--theme-surface-card-alt,#160A0A)] text-white border border-[var(--theme-border-strong,#8C2828)] shadow-md'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              <Target className="w-4 h-4 text-emerald-500" />
              <span>Quests & Bounties</span>
              {isDailyQuestComplete ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Daily bounty ready" />
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-500 font-mono">
                  {dailyXpEarned}/{dailyGoalXp}
                </span>
              )}
            </button>

            {/* Tab: Achievements */}
            <button
              type="button"
              onClick={() => handleSubTabChange('achievements')}
              className={cn(
                'flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none relative',
                activeSubTab === 'achievements'
                  ? isClassic
                    ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                    : 'bg-[var(--theme-surface-card-alt,#160A0A)] text-white border border-[var(--theme-border-strong,#8C2828)] shadow-md'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Achievements</span>
              {unclaimedAchievements.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-black animate-bounce shadow-sm">
                  {unclaimedAchievements.length}
                </span>
              )}
            </button>

            {/* Tab: Badges */}
            <button
              type="button"
              onClick={() => handleSubTabChange('badges')}
              className={cn(
                'flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none',
                activeSubTab === 'badges'
                  ? isClassic
                    ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                    : 'bg-[var(--theme-surface-card-alt,#160A0A)] text-white border border-[var(--theme-border-strong,#8C2828)] shadow-md'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              <Shield className="w-4 h-4 text-cyan-500" />
              <span>Badges</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-500 font-mono">
                {unlockedBadges.length}
              </span>
            </button>
          </div>
        </div>

        {/* ====================================================================
            3. SUB-TAB CONTENT
            ==================================================================== */}

        {/* ─── 3.1: OVERVIEW SUB-TAB ─── */}
        {activeSubTab === 'overview' && (
          <div className="flex flex-col gap-6 sm:gap-8 animate-in fade-in duration-200">
            {/* Daily Bounty Spotlight Banner */}
            <div
              className={cn(
                'p-6 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6 transition-all',
                isClassic
                  ? 'bg-white border-[#ece7df] shadow-xs'
                  : 'bg-[var(--theme-surface-card,#0E0606)] border-[var(--theme-border-default,#3D1C1C)] shadow-xl'
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border',
                    isDailyQuestComplete
                      ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                  )}
                >
                  <Target className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Today's Bounty</span>
                    {isDailyQuestComplete && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black mt-0.5" style={{ color: isClassic ? '#1c1917' : '#F5E8E8' }}>
                    {isDailyQuestComplete ? 'Daily Objective Accomplished!' : 'Accumulate Daily Learning XP'}
                  </h3>
                  <p className="text-xs opacity-70 mt-0.5">
                    Earn {dailyGoalXp} XP today to defend your {streak}-day streak and unlock bonus multipliers.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-mono font-bold">
                    {dailyXpEarned} / {dailyGoalXp} XP
                  </span>
                  <div className="w-32 h-2 rounded-full overflow-hidden bg-black/10 dark:bg-white/10 mt-1">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        isDailyQuestComplete ? 'bg-emerald-500' : 'bg-amber-500'
                      )}
                      style={{ width: `${dailyGoalPercent}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSubTabChange('quests')}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm',
                    isClassic
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-[var(--theme-accent-primary,#DC2626)] hover:bg-red-700 text-white'
                  )}
                >
                  <span>View Quests</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Two-Column Grid: Featured Badges & Trophy Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Featured Badges */}
              <div
                className={cn(
                  'p-6 rounded-3xl border flex flex-col justify-between gap-4',
                  isClassic
                    ? 'bg-white border-[#ece7df] shadow-xs'
                    : 'bg-[var(--theme-surface-card,#0E0606)] border-[var(--theme-border-default,#3D1C1C)] shadow-lg'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-cyan-500" />
                    <h3 className="font-bold text-base" style={{ color: isClassic ? '#1c1917' : '#F5E8E8' }}>
                      Featured Honor Badges
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSubTabChange('badges')}
                    className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all ({badges.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {badges.slice(0, 4).map((badge) => {
                    const isUnlocked = badge.isUnlocked;
                    const asset = getBadgeAsset(badge);
                    const rarity = getRarity(badge);

                    return (
                      <div
                        key={badge.id}
                        onClick={() => setSelectedBadgeModal(badge)}
                        className={cn(
                          'p-3 rounded-2xl border flex flex-col items-center text-center gap-2 cursor-pointer transition-all hover:-translate-y-1 group',
                          isUnlocked
                            ? isClassic
                              ? 'bg-[#faf8f5] border-[#ece7df]'
                              : 'bg-[var(--theme-surface-card-alt,#160A0A)] border-white/10 hover:border-cyan-500/40'
                            : 'opacity-50 grayscale border-dashed border-white/10'
                        )}
                      >
                        <div className="w-12 h-12 flex items-center justify-center relative">
                          {asset ? (
                            <img src={asset} alt={badge.title} className="w-10 h-10 object-contain drop-shadow" />
                          ) : (
                            <Shield className="w-8 h-8 text-cyan-500" />
                          )}
                          {!isUnlocked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                              <Lock className="w-4 h-4 text-white/70" />
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] font-bold truncate max-w-full leading-tight">{badge.title}</span>
                        <span
                          className={cn('text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded', rarity.bg)}
                          style={{ color: rarity.color }}
                        >
                          {rarity.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Achievements */}
              <div
                className={cn(
                  'p-6 rounded-3xl border flex flex-col justify-between gap-4',
                  isClassic
                    ? 'bg-white border-[#ece7df] shadow-xs'
                    : 'bg-[var(--theme-surface-card,#0E0606)] border-[var(--theme-border-default,#3D1C1C)] shadow-lg'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-base" style={{ color: isClassic ? '#1c1917' : '#F5E8E8' }}>
                      Milestone Achievements
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSubTabChange('achievements')}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all ({achievements.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-col gap-2.5">
                  {achievements.slice(0, 3).map((ach) => (
                    <div
                      key={ach.id}
                      className={cn(
                        'p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors',
                        isClassic
                          ? 'bg-[#faf8f5] border-[#ece7df]'
                          : 'bg-[var(--theme-surface-card-alt,#160A0A)] border-white/10'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{ach.title}</p>
                          <p className="text-[10px] opacity-60 truncate">{ach.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-bold text-amber-500">+{ach.rewardXp} XP</span>
                        {ach.isClaimed ? (
                          <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Done
                          </span>
                        ) : ach.isUnlocked ? (
                          <button
                            type="button"
                            onClick={(e) => handleClaimAchievement(ach, e)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500 text-black hover:bg-amber-400 transition-colors shadow-sm"
                          >
                            Claim
                          </button>
                        ) : (
                          <span className="text-[10px] opacity-40 font-mono">
                            {ach.progressCount}/{ach.targetCount}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div
              className={cn(
                'p-6 rounded-3xl border flex flex-col gap-4',
                isClassic
                  ? 'bg-white border-[#ece7df] shadow-xs'
                  : 'bg-[var(--theme-surface-card,#0E0606)] border-[var(--theme-border-default,#3D1C1C)] shadow-lg'
              )}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-base" style={{ color: isClassic ? '#1c1917' : '#F5E8E8' }}>
                  Recent Adventurer Activity
                </h3>
              </div>

              {activities && activities.length > 0 ? (
                <div className="divide-y divide-white/5 flex flex-col">
                  {activities.slice(0, 5).map((act) => (
                    <div key={act.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-medium truncate">{act.title}</span>
                      </div>
                      <span className="text-[11px] opacity-50 shrink-0 font-mono">
                        {new Date(act.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center opacity-60 text-xs flex flex-col items-center gap-2">
                  <Sparkles className="w-6 h-6 opacity-40" />
                  <span>No recent activity logged. Complete a quest or battle challenge to create history!</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── 3.2: QUESTS & BOUNTIES SUB-TAB ─── */}
        {activeSubTab === 'quests' && (
          <div className="flex flex-col gap-6 sm:gap-8 animate-in fade-in duration-200">
            {/* Daily XP Bounty Main Card */}
            <div
              className={cn(
                'rounded-3xl border shadow-xl overflow-hidden flex flex-col transition-all',
                isClassic
                  ? 'bg-white border-[#ece7df]'
                  : 'bg-[var(--theme-surface-card,#0E0606)] border-[var(--theme-border-default,#3D1C1C)]'
              )}
            >
              <div
                className={cn(
                  'px-6 py-4 border-b flex items-center justify-between',
                  isClassic ? 'bg-[#faf8f5] border-[#ece7df]' : 'bg-[var(--theme-surface-card-alt,#160A0A)] border-white/10'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h2
                      className="text-base font-black tracking-wide uppercase"
                      style={{
                        fontFamily: isMythic ? 'var(--theme-font-heading, "Cinzel", serif)' : 'inherit',
                      }}
                    >
                      Daily Bounty: The Path of Wisdom
                    </h2>
                    <p className="text-[11px] opacity-60">Resets daily at midnight • Defends your streak</p>
                  </div>
                </div>

                {isDailyQuestComplete && (
                  <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-500 flex items-center gap-1.5 border border-emerald-500/30">
                    <Star className="w-3.5 h-3.5 fill-emerald-500" /> Completed
                  </span>
                )}
              </div>

              <div className="p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                {/* Reward XP Badge */}
                <div
                  className={cn(
                    'w-28 h-28 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 shadow-md',
                    isClassic ? 'bg-[#faf8f5] border-emerald-200' : 'bg-[#160A0A] border-amber-500/40'
                  )}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Reward</span>
                  <span className="text-3xl font-black mt-0.5 text-amber-500 font-mono">+{dailyGoalXp}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">XP</span>
                </div>

                {/* Progress Details */}
                <div className="flex-1 w-full flex flex-col gap-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="font-bold text-sm">Accumulate {dailyGoalXp} XP Today</h4>
                      <p className="text-xs opacity-75 mt-0.5">
                        Solve exercises, progress through courses, or defeat arcade opponents to earn daily XP.
                      </p>
                    </div>
                    <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {dailyXpEarned} / {dailyGoalXp} XP ({dailyGoalPercent}%)
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full overflow-hidden bg-black/10 dark:bg-white/10 p-[2px]">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700 relative overflow-hidden',
                        isDailyQuestComplete ? 'bg-emerald-500' : 'bg-amber-500'
                      )}
                      style={{ width: `${dailyGoalPercent}%` }}
                    >
                      <div className="absolute inset-0 bg-white/25 w-full animate-[shimmer_2s_infinite] -skew-x-12" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] opacity-60">
                      Current Streak: <strong className="text-orange-500 font-mono">{streak} Days 🔥</strong>
                    </span>
                    {onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => onNavigateTab('learn')}
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Start Quest Session</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Active Learning Quests (Courses in Progress) */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-500" />
                  <h3
                    className="text-lg font-black tracking-wide uppercase"
                    style={{ fontFamily: isMythic ? 'var(--theme-font-heading, "Cinzel", serif)' : 'inherit' }}
                  >
                    Active Learning Quests
                  </h3>
                </div>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('learn')}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Course Catalog</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses && courses.length > 0 ? (
                  courses.slice(0, 4).map((c) => (
                    <div
                      key={c.course.id}
                      className={cn(
                        'p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all hover:shadow-md',
                        isClassic
                          ? 'bg-white border-[#ece7df]'
                          : 'bg-[var(--theme-surface-card,#0E0606)] border-[var(--theme-border-default,#3D1C1C)]'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm leading-tight">{c.course.title}</h4>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              {c.course.track} Track
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-stone-500">{c.progressPercent}%</span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="w-full h-2 rounded-full overflow-hidden bg-black/10 dark:bg-white/10">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${c.progressPercent}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] opacity-60">
                          <span>
                            {c.completedLessons} / {c.totalLessons} Lessons cleared
                          </span>
                          {onNavigateTab && (
                            <button
                              type="button"
                              onClick={() => onNavigateTab('learn')}
                              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                            >
                              Resume ➔
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-8 text-center opacity-60 text-xs flex flex-col items-center gap-2">
                    <Compass className="w-6 h-6 opacity-40" />
                    <span>No active courses yet. Visit the Learn tab to embark on your first programming quest!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Sagas & Milestone Quests */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                <h3
                  className="text-lg font-black tracking-wide uppercase"
                  style={{ fontFamily: isMythic ? 'var(--theme-font-heading, "Cinzel", serif)' : 'inherit' }}
                >
                  Weekly Sagas & Legendary Trials
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Weekly Quest 1 */}
                <div
                  className={cn(
                    'p-5 rounded-2xl border flex flex-col justify-between gap-3',
                    isClassic ? 'bg-white border-[#ece7df]' : 'bg-[var(--theme-surface-card,#0E0606)] border-white/10'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Weekly Saga</span>
                    <span className="text-[10px] font-mono text-amber-500 font-bold">+250 XP</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Clear 5 Code Lessons</h4>
                    <p className="text-xs opacity-60 mt-0.5">Maintain consistent progression throughout the week.</p>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden bg-black/10 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-purple-500"
                      style={{ width: `${Math.min(100, ((overallProgress?.completedLessons || 0) % 5) * 20)}%` }}
                    />
                  </div>
                </div>

                {/* Weekly Quest 2 */}
                <div
                  className={cn(
                    'p-5 rounded-2xl border flex flex-col justify-between gap-3',
                    isClassic ? 'bg-white border-[#ece7df]' : 'bg-[var(--theme-surface-card,#0E0606)] border-white/10'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500">Streak Trial</span>
                    <span className="text-[10px] font-mono text-amber-500 font-bold">+150 XP</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">7-Day Flame Defense</h4>
                    <p className="text-xs opacity-60 mt-0.5">Keep your code streak burning for 7 consecutive days.</p>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden bg-black/10 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{ width: `${Math.min(100, Math.round((streak / 7) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Weekly Quest 3 */}
                <div
                  className={cn(
                    'p-5 rounded-2xl border flex flex-col justify-between gap-3',
                    isClassic ? 'bg-white border-[#ece7df]' : 'bg-[var(--theme-surface-card,#0E0606)] border-white/10'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500">Arcade Arena</span>
                    <span className="text-[10px] font-mono text-amber-500 font-bold">+300 XP</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Conquer a Squad Challenge</h4>
                    <p className="text-xs opacity-60 mt-0.5">Join forces with teammates and win a real-time battle duel.</p>
                  </div>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab('arcade')}
                      className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <span>Go to Squad Arcade</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── 3.3: ACHIEVEMENTS SUB-TAB ─── */}
        {activeSubTab === 'achievements' && (
          <div className="flex flex-col gap-6 sm:gap-8 animate-in fade-in duration-200">
            {/* Unclaimed Rewards Banner */}
            {unclaimedAchievements.length > 0 && (
              <div
                className={cn(
                  'p-5 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-pulse',
                  isClassic
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border-amber-500/40 text-white'
                )}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-black text-xl shadow-md">
                    🎁
                  </div>
                  <div>
                    <h4 className="font-black text-base">You Have Unclaimed Rewards!</h4>
                    <p className="text-xs opacity-80">
                      {unclaimedAchievements.length} milestone achievements are ready to be claimed for bonus XP.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-500">
                    +{unclaimedAchievements.reduce((sum, a) => sum + a.rewardXp, 0)} XP Total
                  </span>
                </div>
              </div>
            )}

            {/* Filter Chips Bar */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                {(['all', 'unlocked', 'locked'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setAchievementFilter(filter)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer',
                      achievementFilter === filter
                        ? isClassic
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-[var(--theme-accent-primary,#DC2626)] text-white shadow-md'
                        : 'opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                    )}
                  >
                    {filter === 'all' ? 'All Milestones' : filter === 'unlocked' ? 'Claimed & Ready' : 'In Progress'}
                  </button>
                ))}
              </div>

              <span className="text-xs font-mono font-bold opacity-60">
                {claimedAchievements.length} of {achievements.length} Claimed
              </span>
            </div>

            {/* Achievement Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements
                .filter((a) => {
                  if (achievementFilter === 'unlocked') return a.isUnlocked;
                  if (achievementFilter === 'locked') return !a.isUnlocked;
                  return true;
                })
                .map((ach) => {
                  const isClaimed = ach.isClaimed;
                  const isUnlocked = ach.isUnlocked;
                  const isClaimable = isUnlocked && !isClaimed;
                  const isClaiming = claimingId === ach.id;
                  const progressPct = Math.min(100, Math.round((ach.progressCount / ach.targetCount) * 100));

                  return (
                    <div
                      key={ach.id}
                      className={cn(
                        'p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all duration-300 relative overflow-hidden',
                        isClaimed
                          ? isClassic
                            ? 'bg-white border-[#ece7df] shadow-xs'
                            : 'bg-[var(--theme-surface-card,#0E0606)] border-white/10'
                          : isClaimable
                          ? isClassic
                            ? 'bg-amber-50/70 border-amber-300 shadow-md ring-2 ring-amber-400/20'
                            : 'bg-[#1a1005] border-amber-500/50 shadow-lg ring-1 ring-amber-500/30'
                          : isClassic
                          ? 'bg-[#faf8f5]/60 border-[#ece7df] opacity-65'
                          : 'bg-[#0a0707] border-white/5 opacity-55'
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div
                            className={cn(
                              'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl border shadow-sm transition-all',
                              isClaimed
                                ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                                : isClaimable
                                ? 'bg-amber-500 text-black border-amber-400 animate-bounce'
                                : 'bg-black/20 text-stone-500 border-white/10'
                            )}
                          >
                            {ach.icon || '🏆'}
                          </div>

                          <div className="flex flex-col">
                            <h4 className="font-bold text-sm leading-snug">{ach.title}</h4>
                            <p className="text-xs opacity-70 mt-0.5 leading-relaxed">{ach.description}</p>
                          </div>
                        </div>

                        <span
                          className={cn(
                            'px-2.5 py-1 rounded-xl text-xs font-mono font-black shrink-0 border',
                            isClaimable
                              ? 'bg-amber-500/20 text-amber-500 border-amber-400/40'
                              : 'bg-black/20 opacity-70 border-white/10'
                          )}
                        >
                          +{ach.rewardXp} XP
                        </span>
                      </div>

                      {/* Progress bar or Claim Action */}
                      <div className="flex items-center justify-between gap-3 pt-2 border-t border-black/5 dark:border-white/5">
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="flex justify-between items-center text-[11px] font-mono opacity-60">
                            <span>Progress</span>
                            <span>
                              {ach.progressCount} / {ach.targetCount}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full overflow-hidden bg-black/10 dark:bg-white/10">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-500',
                                isClaimed ? 'bg-emerald-500' : isClaimable ? 'bg-amber-500' : 'bg-stone-500'
                              )}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isClaimed ? (
                            <span className="px-3 py-1 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Claimed
                            </span>
                          ) : isClaimable ? (
                            <button
                              type="button"
                              disabled={isClaiming}
                              onClick={(e) => handleClaimAchievement(ach, e)}
                              className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                            >
                              {isClaiming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                              <span>Claim Reward</span>
                            </button>
                          ) : (
                            <span className="text-[11px] font-bold opacity-40 flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5" /> Locked
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ─── 3.4: BADGES SUB-TAB ─── */}
        {activeSubTab === 'badges' && (
          <div className="flex flex-col gap-6 sm:gap-8 animate-in fade-in duration-200">
            {/* Badges Overview Stat Box */}
            <div
              className={cn(
                'p-6 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl',
                isClassic
                  ? 'bg-white border-[#ece7df]'
                  : 'bg-[var(--theme-surface-card,#0E0606)] border-[var(--theme-border-default,#3D1C1C)]'
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <Shield className="w-7 h-7" />
                </div>
                <div>
                  <h3
                    className="text-lg font-black tracking-wide uppercase"
                    style={{ fontFamily: isMythic ? 'var(--theme-font-heading, "Cinzel", serif)' : 'inherit' }}
                  >
                    Honor Badges Showcase
                  </h3>
                  <p className="text-xs opacity-70 mt-0.5">
                    Exclusive medals earned by mastering milestones, winning challenges, and completing sagas.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-mono font-bold text-cyan-500">
                    {unlockedBadges.length} / {badges.length} Unlocked
                  </span>
                  <div className="w-32 h-2 rounded-full overflow-hidden bg-black/10 dark:bg-white/10 mt-1">
                    <div
                      className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                      style={{ width: `${badges.length > 0 ? Math.round((unlockedBadges.length / badges.length) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                {(['all', 'unlocked', 'locked'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setBadgeFilter(filter)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer',
                      badgeFilter === filter
                        ? isClassic
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-[var(--theme-accent-primary,#DC2626)] text-white shadow-md'
                        : 'opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                    )}
                  >
                    {filter === 'all' ? 'All Badges' : filter === 'unlocked' ? 'Unlocked' : 'Locked'}
                  </button>
                ))}
              </div>

              <span className="text-xs font-mono opacity-50">Click any badge to inspect details</span>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {badges
                .filter((b) => {
                  if (badgeFilter === 'unlocked') return b.isUnlocked;
                  if (badgeFilter === 'locked') return !b.isUnlocked;
                  return true;
                })
                .map((badge) => {
                  const isUnlocked = badge.isUnlocked;
                  const asset = getBadgeAsset(badge);
                  const rarity = getRarity(badge);

                  return (
                    <div
                      key={badge.id}
                      onClick={() => setSelectedBadgeModal(badge)}
                      className={cn(
                        'p-5 rounded-3xl border flex flex-col items-center text-center gap-3 transition-all duration-300 cursor-pointer group relative overflow-hidden',
                        isUnlocked
                          ? isClassic
                            ? 'bg-white border-[#ece7df] shadow-xs hover:shadow-md hover:-translate-y-1'
                            : 'bg-[var(--theme-surface-card,#0E0606)] border-white/10 hover:border-cyan-500/40 hover:-translate-y-1 shadow-lg'
                          : isClassic
                          ? 'bg-[#faf8f5]/60 border-dashed border-[#ece7df] opacity-60'
                          : 'bg-[#0a0707] border-dashed border-white/10 opacity-50'
                      )}
                    >
                      {/* Rarity Pill */}
                      <span
                        className={cn(
                          'text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border',
                          rarity.bg,
                          rarity.border
                        )}
                        style={{ color: rarity.color }}
                      >
                        {rarity.label}
                      </span>

                      {/* Badge Icon / Artwork */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center relative my-1">
                        {asset ? (
                          <img
                            src={asset}
                            alt={badge.title}
                            className={cn(
                              'w-full h-full object-contain transition-transform group-hover:scale-110 drop-shadow-lg',
                              !isUnlocked && 'grayscale opacity-40'
                            )}
                          />
                        ) : (
                          <div
                            className={cn(
                              'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border',
                              isUnlocked ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' : 'bg-black/20 text-stone-500 border-white/10'
                            )}
                          >
                            <Shield className="w-8 h-8" />
                          </div>
                        )}

                        {!isUnlocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl backdrop-blur-[1px]">
                            <Lock className="w-5 h-5 text-white/80" />
                          </div>
                        )}
                      </div>

                      {/* Badge Info */}
                      <div className="w-full">
                        <h4 className="font-bold text-xs sm:text-sm truncate leading-tight">{badge.title}</h4>
                        <p className="text-[10px] opacity-60 mt-1 line-clamp-2 leading-relaxed">{badge.description}</p>
                      </div>

                      {/* Status footer */}
                      <div className="pt-2 border-t border-black/5 dark:border-white/5 w-full flex items-center justify-center">
                        {isUnlocked ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Unlocked
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono opacity-50 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> In Progress
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ====================================================================
            4. BADGE DOSSIER INSPECTION MODAL
            ==================================================================== */}
        {selectedBadgeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div
              className={cn(
                'w-full max-w-md rounded-3xl border p-6 sm:p-8 flex flex-col items-center text-center gap-5 shadow-2xl relative animate-in zoom-in-95',
                isClassic
                  ? 'bg-white border-[#ece7df] text-stone-900'
                  : 'bg-[var(--theme-surface-card,#0E0606)] border-[var(--theme-border-strong,#8C2828)] text-white'
              )}
            >
              <button
                type="button"
                onClick={() => setSelectedBadgeModal(null)}
                className="absolute top-4 right-4 p-2 rounded-xl opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Rarity & Icon */}
              <div className="flex flex-col items-center gap-3">
                <span
                  className={cn(
                    'text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border',
                    getRarity(selectedBadgeModal).bg,
                    getRarity(selectedBadgeModal).border
                  )}
                  style={{ color: getRarity(selectedBadgeModal).color }}
                >
                  {getRarity(selectedBadgeModal).label} Medallion
                </span>

                <div className="w-28 h-28 flex items-center justify-center relative my-2">
                  {getBadgeAsset(selectedBadgeModal) ? (
                    <img
                      src={getBadgeAsset(selectedBadgeModal)!}
                      alt={selectedBadgeModal.title}
                      className={cn(
                        'w-full h-full object-contain drop-shadow-2xl',
                        !selectedBadgeModal.isUnlocked && 'grayscale opacity-40'
                      )}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-3xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                      <Shield className="w-12 h-12" />
                    </div>
                  )}
                </div>

                <h3
                  className="text-xl font-black tracking-wide"
                  style={{ fontFamily: isMythic ? 'var(--theme-font-heading, "Cinzel", serif)' : 'inherit' }}
                >
                  {selectedBadgeModal.title}
                </h3>
              </div>

              <p className="text-xs opacity-75 max-w-sm leading-relaxed">{selectedBadgeModal.description}</p>

              <div
                className={cn(
                  'w-full p-4 rounded-2xl border flex items-center justify-between text-xs',
                  isClassic ? 'bg-[#faf8f5] border-[#ece7df]' : 'bg-black/30 border-white/10'
                )}
              >
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold opacity-60">Status</span>
                  <span className={cn('font-bold', selectedBadgeModal.isUnlocked ? 'text-emerald-500' : 'text-amber-500')}>
                    {selectedBadgeModal.isUnlocked ? 'Unlocked & Active' : 'Locked'}
                  </span>
                </div>

                {selectedBadgeModal.unlockedAt && (
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] uppercase font-bold opacity-60">Unlocked On</span>
                    <span className="font-mono text-xs opacity-90">
                      {new Date(selectedBadgeModal.unlockedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedBadgeModal(null)}
                className={cn(
                  'w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md',
                  isClassic
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-[var(--theme-accent-primary,#DC2626)] hover:bg-red-700 text-white'
                )}
              >
                Close Dossier
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            5. EDIT PROFILE MODAL
            ==================================================================== */}
        {isEditingProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div
              className={cn(
                'w-full max-w-md rounded-3xl border p-6 sm:p-8 flex flex-col gap-5 shadow-2xl relative animate-in zoom-in-95',
                isClassic
                  ? 'bg-white border-[#ece7df] text-stone-900'
                  : 'bg-[var(--theme-surface-card,#0E0606)] border-[var(--theme-border-strong,#8C2828)] text-white'
              )}
            >
              <div className="flex items-center justify-between border-b pb-4 border-black/10 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-lg font-black tracking-wide">Edit Profile</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="p-1.5 rounded-xl opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {saveSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-70">Display Name</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className={cn(
                      'w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border outline-none transition-all',
                      isClassic
                        ? 'bg-[#faf8f5] border-[#ece7df] focus:border-emerald-500 focus:bg-white'
                        : 'bg-black/40 border-white/10 focus:border-red-500 text-white'
                    )}
                    placeholder="e.g. Alex Morgan"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-70">Username Handle</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs opacity-50">@</span>
                    <input
                      type="text"
                      required
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className={cn(
                        'w-full pl-8 pr-3.5 py-2.5 rounded-xl text-xs font-medium border outline-none transition-all',
                        isClassic
                          ? 'bg-[#faf8f5] border-[#ece7df] focus:border-emerald-500 focus:bg-white'
                          : 'bg-black/40 border-white/10 focus:border-red-500 text-white'
                      )}
                      placeholder="alex_coder"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-70">Daily XP Target Goal</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    step="10"
                    value={editDailyGoalXp}
                    onChange={(e) => setEditDailyGoalXp(Number(e.target.value))}
                    className={cn(
                      'w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium border outline-none transition-all',
                      isClassic
                        ? 'bg-[#faf8f5] border-[#ece7df] focus:border-emerald-500 focus:bg-white'
                        : 'bg-black/40 border-white/10 focus:border-red-500 text-white'
                    )}
                    placeholder="50"
                  />
                  <span className="text-[10px] opacity-50">Earn this amount of XP daily to maintain your streak.</span>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-black/10 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className={cn(
                      'px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer',
                      isClassic
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-[var(--theme-accent-primary,#DC2626)] hover:bg-red-700 text-white'
                    )}
                  >
                    {isSavingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
