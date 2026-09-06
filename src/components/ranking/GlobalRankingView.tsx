import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Zap,
  Shield,
  Sparkles,
  Swords,
  Search,
  RefreshCw,
  Layers,
  Award,
  ChevronUp,
  User as UserIcon,
  Crosshair,
  TrendingUp,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTheme, type ThemeKey } from '../../context/ThemeContext'
import { SpiderNetDecal, SpiderEmblemIcon } from '../ui/SpiderNetDecal'

export interface LiveWarrior {
  rank: number
  id: string
  name: string
  username: string
  role: string
  xp: number
  level: number
  avatar_url?: string | null
  isCurrentUser: boolean
}

type LevelTierFilter = 'all' | 'god' | 'champion' | 'vanguard' | 'initiate'
type SortMode = 'level' | 'xp'

export const GlobalRankingView: React.FC = () => {
  const { user, profile } = useAuth()
  const { theme } = useTheme()

  const [loading, setLoading] = useState(true)
  const [warriors, setWarriors] = useState<LiveWarrior[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [tierFilter, setTierFilter] = useState<LevelTierFilter>('all')
  const [sortMode, setSortMode] = useState<SortMode>('level')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Theme helper
  const isSpiderman = theme === 'spiderman'
  const isGow = theme === 'gow'
  const isClassic = theme === 'classic' || theme === 'light' || theme === 'space'

  // Fetch real users from Supabase
  const loadLeaderboard = useCallback(async () => {
    try {
      setIsRefreshing(true)

      // Query RPC get_leaderboard first
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_leaderboard', { limit_count: 200 })

      let rawEntries: Array<{
        id: string
        username: string | null
        full_name: string | null
        role: string | null
        xp: number | null
        level: number | null
        avatar_url: string | null
      }> = []

      if (!rpcError && rpcData && rpcData.length > 0) {
        rawEntries = rpcData
      } else {
        // Fallback directly querying profiles
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, username, full_name, role, xp, level, avatar_url')
          .order('level', { ascending: false })
          .order('xp', { ascending: false })
          .limit(200)

        if (profileData && profileData.length > 0) {
          rawEntries = profileData
        }
      }

      // If current user is authenticated, ensure current user's latest profile is merged
      if (user?.id) {
        const userIndex = rawEntries.findIndex((e) => e.id === user.id)
        const currentProfileXp = profile?.xp ?? 0
        const currentProfileLevel = profile?.level ?? 1
        const currentProfileName = profile?.full_name || profile?.username || user.email?.split('@')[0] || 'You'

        if (userIndex >= 0) {
          // Update with latest in-memory profile if newer
          rawEntries[userIndex] = {
            ...rawEntries[userIndex],
            xp: Math.max(rawEntries[userIndex].xp ?? 0, currentProfileXp),
            level: Math.max(rawEntries[userIndex].level ?? 1, currentProfileLevel),
            full_name: profile?.full_name || rawEntries[userIndex].full_name,
            username: profile?.username || rawEntries[userIndex].username,
          }
        } else {
          // User not in list yet, append user
          rawEntries.push({
            id: user.id,
            username: profile?.username || user.email?.split('@')[0] || 'warrior',
            full_name: currentProfileName,
            role: profile?.role || 'student',
            xp: currentProfileXp,
            level: currentProfileLevel,
            avatar_url: profile?.avatar_url || null,
          })
        }
      }

      // Format warriors
      const formatted: LiveWarrior[] = rawEntries.map((item) => {
        const lvl = Math.max(item.level ?? 1, 1)
        const xpVal = Math.max(item.xp ?? 0, 0)
        const dispName = item.full_name || item.username || 'Warrior'
        const isCurrent = Boolean(user?.id && item.id === user.id)

        return {
          rank: 0, // will compute after sort
          id: item.id,
          name: dispName,
          username: item.username || 'hero',
          role: item.role || 'student',
          xp: xpVal,
          level: lvl,
          avatar_url: item.avatar_url,
          isCurrentUser: isCurrent,
        }
      })

      setWarriors(formatted)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching global leaderboard:', err)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [user?.id, profile])

  useEffect(() => {
    loadLeaderboard()
  }, [loadLeaderboard])

  // Process sorting by LEVEL (primary as requested) with XP tiebreaker
  const sortedWarriors = useMemo(() => {
    const list = [...warriors]

    list.sort((a, b) => {
      if (sortMode === 'level') {
        if (b.level !== a.level) {
          return b.level - a.level
        }
        return b.xp - a.xp
      } else {
        if (b.xp !== a.xp) {
          return b.xp - a.xp
        }
        return b.level - a.level
      }
    })

    // Assign dynamic ranks based on this sorted order
    return list.map((item, index) => ({
      ...item,
      rank: index + 1,
    }))
  }, [warriors, sortMode])

  // Filter warriors by tier and search query
  const filteredWarriors = useMemo(() => {
    return sortedWarriors.filter((warrior) => {
      // Tier filter based on Level
      if (tierFilter === 'god' && warrior.level < 20) return false
      if (tierFilter === 'champion' && (warrior.level < 10 || warrior.level >= 20)) return false
      if (tierFilter === 'vanguard' && (warrior.level < 5 || warrior.level >= 10)) return false
      if (tierFilter === 'initiate' && warrior.level >= 5) return false

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesName = warrior.name.toLowerCase().includes(query)
        const matchesUsername = warrior.username.toLowerCase().includes(query)
        const matchesRole = warrior.role.toLowerCase().includes(query)
        return matchesName || matchesUsername || matchesRole
      }

      return true
    })
  }, [sortedWarriors, tierFilter, searchQuery])

  // Find current user's standing
  const currentUserStanding = useMemo(() => {
    return sortedWarriors.find((w) => w.isCurrentUser) || null
  }, [sortedWarriors])

  // Player right ahead of current user (for motivation stats)
  const rivalAhead = useMemo(() => {
    if (!currentUserStanding || currentUserStanding.rank <= 1) return null
    return sortedWarriors.find((w) => w.rank === currentUserStanding.rank - 1) || null
  }, [sortedWarriors, currentUserStanding])

  // Top 3 Podium Warriors (from the overall sorted list)
  const topThree = useMemo(() => {
    return {
      first: sortedWarriors[0] || null,
      second: sortedWarriors[1] || null,
      third: sortedWarriors[2] || null,
    }
  }, [sortedWarriors])

  // Dynamic Theme-based Titles for Level Tiers
  const getLevelTierBadge = (level: number) => {
    if (isGow) {
      if (level >= 20) return { title: 'God of War', color: 'from-amber-500 to-red-600', text: 'text-amber-400', border: 'border-amber-500/50', icon: Crown }
      if (level >= 10) return { title: 'Spartan General', color: 'from-red-600 to-rose-700', text: 'text-red-400', border: 'border-red-500/40', icon: Swords }
      if (level >= 5) return { title: 'Berserker', color: 'from-orange-600 to-amber-700', text: 'text-orange-400', border: 'border-orange-500/40', icon: Flame }
      return { title: 'Spartan Recruit', color: 'from-stone-600 to-stone-800', text: 'text-stone-300', border: 'border-stone-600/40', icon: Shield }
    } else if (isSpiderman) {
      if (level >= 20) return { title: 'Multiverse Sovereign', color: 'from-cyan-400 to-blue-600', text: 'text-cyan-300', border: 'border-cyan-400/50', icon: Crown }
      if (level >= 10) return { title: 'Prime Web-Slinger', color: 'from-red-500 to-blue-600', text: 'text-blue-400', border: 'border-red-500/40', icon: Zap }
      if (level >= 5) return { title: 'Vigilante', color: 'from-blue-600 to-indigo-600', text: 'text-sky-400', border: 'border-blue-500/40', icon: Sparkles }
      return { title: 'Street Hero', color: 'from-slate-600 to-slate-800', text: 'text-slate-300', border: 'border-slate-600/40', icon: Shield }
    } else {
      // Classic Olympus
      if (level >= 20) return { title: 'Olympian Immortal', color: 'from-amber-400 to-yellow-600', text: 'text-amber-300', border: 'border-amber-400/50', icon: Crown }
      if (level >= 10) return { title: 'Demigod Champion', color: 'from-emerald-500 to-teal-700', text: 'text-emerald-400', border: 'border-emerald-500/40', icon: Medal }
      if (level >= 5) return { title: 'Heroic Seeker', color: 'from-sky-500 to-blue-700', text: 'text-sky-400', border: 'border-sky-500/40', icon: Award }
      return { title: 'Mortal Initiate', color: 'from-stone-600 to-stone-800', text: 'text-stone-300', border: 'border-stone-500/40', icon: Shield }
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-16 text-left animate-in fade-in duration-300">
      {/* ── HEADER BANNER (Gamified Theme Adaptive) ── */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border shadow-2xl backdrop-blur-xl"
        style={{
          background: isSpiderman
            ? 'linear-gradient(135deg, rgba(10, 16, 36, 0.95) 0%, rgba(18, 26, 56, 0.9) 100%)'
            : isGow
              ? 'linear-gradient(135deg, rgba(22, 10, 10, 0.98) 0%, rgba(35, 14, 14, 0.9) 100%)'
              : 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.9) 100%)',
          borderColor: isSpiderman
            ? 'rgba(0, 210, 255, 0.35)'
            : isGow
              ? 'rgba(220, 38, 38, 0.45)'
              : 'rgba(217, 119, 6, 0.35)',
          boxShadow: isSpiderman
            ? '0 0 35px rgba(0, 210, 255, 0.15)'
            : isGow
              ? '0 0 35px rgba(220, 38, 38, 0.2)'
              : '0 0 35px rgba(217, 119, 6, 0.15)',
        }}
      >
        {isSpiderman && <SpiderNetDecal size={110} position="top-right" />}

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg"
              style={{
                background: isSpiderman
                  ? 'linear-gradient(135deg, #00D2FF 0%, #0055FF 100%)'
                  : isGow
                    ? 'linear-gradient(135deg, #FF3D00 0%, #DC2626 100%)'
                    : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                borderColor: 'rgba(255,255,255,0.25)',
              }}
            >
              {isSpiderman ? (
                <SpiderEmblemIcon size={32} glowColor="rgba(255,255,255,0.8)" />
              ) : isGow ? (
                <Trophy className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
              ) : (
                <Crown className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border"
                  style={{
                    background: isSpiderman
                      ? 'rgba(0, 210, 255, 0.12)'
                      : isGow
                        ? 'rgba(220, 38, 38, 0.15)'
                        : 'rgba(245, 158, 11, 0.15)',
                    borderColor: isSpiderman
                      ? 'rgba(0, 210, 255, 0.4)'
                      : isGow
                        ? 'rgba(220, 38, 38, 0.4)'
                        : 'rgba(245, 158, 11, 0.4)',
                    color: isSpiderman ? '#00D2FF' : isGow ? '#FF4D4D' : '#FBBF24',
                  }}
                >
                  Live Supabase Realm
                </span>
                <span className="text-xs text-stone-400 font-medium">
                  {warriors.length} Active Warriors Registered
                </span>
              </div>

              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-black mt-1.5 tracking-tight text-white flex items-center gap-3 gamified-shaky-title"
                style={{
                  fontFamily: isGow
                    ? "'Cinzel', serif"
                    : isSpiderman
                      ? "'Inter', sans-serif"
                      : "'Cinzel', serif",
                }}
              >
                {isSpiderman
                  ? 'MULTIVERSE HERO HIERARCHY'
                  : isGow
                    ? 'PANTHEON OF SPARTAN WARRIORS'
                    : 'HALL OF IMMORTALS'}
              </h1>

              <p className="text-xs sm:text-sm text-stone-300 font-medium max-w-2xl mt-1 leading-relaxed">
                {isSpiderman
                  ? 'Real-time global hierarchy ranked by Level power tiers and web experience. Master high-level challenges to scale the multiverse.'
                  : isGow
                    ? 'The eternal leaderboard of Olympus. Warriors are ranked strictly by combat Level and glorious deeds accomplished in the Crucible.'
                    : 'The celestial order of Mount Olympus. Ascend higher levels through coding mastery and claim divine favor among the gods.'}
              </p>
            </div>
          </div>

          {/* Right Action: Real-time Refresh */}
          <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
            <button
              type="button"
              onClick={loadLeaderboard}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-md disabled:opacity-50"
              style={{
                background: 'rgba(255,255,255,0.06)',
                borderColor: 'rgba(255,255,255,0.15)',
                color: '#fff',
              }}
              title="Refresh live rankings from Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Ranks'}</span>
            </button>
          </div>
        </div>

        {/* CURRENT USER STATUS STRIP */}
        {currentUserStanding && (
          <div
            className="mt-6 pt-5 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border shadow-inner"
                style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(220, 38, 38, 0.3) 100%)',
                  borderColor: 'rgba(245, 158, 11, 0.5)',
                  color: '#FBBF24',
                }}
              >
                #{currentUserStanding.rank}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Your Current Standing
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    LVL {currentUserStanding.level}
                  </span>
                </div>
                <div className="text-xs text-stone-300 flex items-center gap-2 mt-0.5">
                  <span>{currentUserStanding.xp.toLocaleString()} Total XP</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">
                    Tier: {getLevelTierBadge(currentUserStanding.level).title}
                  </span>
                </div>
              </div>
            </div>

            {rivalAhead && (
              <div className="flex items-center gap-2 text-xs font-medium text-stone-300 bg-black/40 px-3.5 py-2 rounded-xl border border-white/10">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Next Rank (#{rivalAhead.rank}):{' '}
                  <strong className="text-white">{rivalAhead.name}</strong> (LVL {rivalAhead.level},{' '}
                  {rivalAhead.xp.toLocaleString()} XP)
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── TOP 3 CHAMPIONS PODIUM ── */}
      {sortedWarriors.length >= 3 && !searchQuery && tierFilter === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-end">
          {/* 2ND PLACE (SILVER) */}
          {topThree.second && (
            <div
              className="order-2 md:order-1 relative rounded-2xl p-6 border flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.02] shadow-xl backdrop-blur-md"
              style={{
                background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
                borderColor: 'rgba(203, 213, 225, 0.4)',
                boxShadow: '0 8px 30px rgba(148, 163, 184, 0.15)',
              }}
            >
              <div className="absolute -top-3.5 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-300 text-slate-900 border border-white shadow-md flex items-center gap-1.5">
                <Medal className="w-3.5 h-3.5 text-slate-800" />
                <span>#2 Silver Laurels</span>
              </div>

              <div className="w-16 h-16 mt-2 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-400 p-0.5 shadow-lg relative">
                <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xl">
                  {topThree.second.name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center border border-white shadow-sm">
                  2
                </div>
              </div>

              <h3 className="text-lg font-black text-white mt-4 truncate max-w-[200px]">
                {topThree.second.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono">@{topThree.second.username}</p>

              <div className="mt-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-800 text-slate-200 border border-slate-700">
                  LVL {topThree.second.level}
                </span>
                <span className="text-xs font-bold text-slate-300">
                  {topThree.second.xp.toLocaleString()} XP
                </span>
              </div>

              <div className="mt-3 text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <span>{getLevelTierBadge(topThree.second.level).title}</span>
              </div>
            </div>
          )}

          {/* 1ST PLACE (GOLD - ELEVATED) */}
          {topThree.first && (
            <div
              className="order-1 md:order-2 relative rounded-3xl p-8 border-2 flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.03] shadow-2xl backdrop-blur-xl md:-translate-y-4"
              style={{
                background: isGow
                  ? 'linear-gradient(180deg, rgba(60, 20, 20, 0.95) 0%, rgba(20, 6, 6, 0.98) 100%)'
                  : isSpiderman
                    ? 'linear-gradient(180deg, rgba(20, 30, 65, 0.95) 0%, rgba(10, 15, 35, 0.98) 100%)'
                    : 'linear-gradient(180deg, rgba(55, 38, 15, 0.95) 0%, rgba(20, 15, 5, 0.98) 100%)',
                borderColor: isGow
                  ? 'rgba(245, 158, 11, 0.8)'
                  : isSpiderman
                    ? 'rgba(0, 210, 255, 0.8)'
                    : 'rgba(251, 191, 36, 0.85)',
                boxShadow: isGow
                  ? '0 0 50px rgba(245, 158, 11, 0.25), 0 15px 35px rgba(0,0,0,0.8)'
                  : isSpiderman
                    ? '0 0 50px rgba(0, 210, 255, 0.25), 0 15px 35px rgba(0,0,0,0.8)'
                    : '0 0 50px rgba(251, 191, 36, 0.25), 0 15px 35px rgba(0,0,0,0.8)',
              }}
            >
              <div className="absolute -top-4 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 border border-yellow-200 shadow-xl flex items-center gap-1.5 animate-pulse">
                <Crown className="w-4 h-4 text-stone-950 fill-stone-950" />
                <span>#1 Grand Sovereign</span>
              </div>

              <div className="w-20 h-20 mt-2 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 p-1 shadow-2xl relative">
                <div className="w-full h-full rounded-2xl bg-stone-900 flex items-center justify-center text-amber-300 font-black text-3xl">
                  {topThree.first.name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-2.5 -right-2.5 w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-stone-950 font-black text-sm flex items-center justify-center border-2 border-white shadow-md">
                  👑
                </div>
              </div>

              <h2 className="text-xl font-black text-white mt-4 truncate max-w-[240px]">
                {topThree.first.name}
              </h2>
              <p className="text-xs text-amber-300/80 font-mono">@{topThree.first.username}</p>

              <div className="mt-4 flex items-center gap-2.5">
                <span className="px-3 py-1.5 rounded-xl text-sm font-black bg-amber-400 text-stone-950 shadow-md">
                  LVL {topThree.first.level}
                </span>
                <span className="text-sm font-extrabold text-amber-300">
                  {topThree.first.xp.toLocaleString()} XP
                </span>
              </div>

              <div className="mt-3 text-xs font-bold text-amber-200 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{getLevelTierBadge(topThree.first.level).title}</span>
              </div>
            </div>
          )}

          {/* 3RD PLACE (BRONZE) */}
          {topThree.third && (
            <div
              className="order-3 md:order-3 relative rounded-2xl p-6 border flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.02] shadow-xl backdrop-blur-md"
              style={{
                background: 'linear-gradient(180deg, rgba(40, 30, 25, 0.8) 0%, rgba(20, 15, 12, 0.95) 100%)',
                borderColor: 'rgba(217, 119, 6, 0.4)',
                boxShadow: '0 8px 30px rgba(180, 83, 9, 0.15)',
              }}
            >
              <div className="absolute -top-3.5 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-700 text-white border border-amber-500 shadow-md flex items-center gap-1.5">
                <Medal className="w-3.5 h-3.5 text-amber-200" />
                <span>#3 Bronze Shield</span>
              </div>

              <div className="w-16 h-16 mt-2 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 p-0.5 shadow-lg relative">
                <div className="w-full h-full rounded-2xl bg-stone-900 flex items-center justify-center text-amber-400 font-black text-xl">
                  {topThree.third.name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg bg-amber-700 text-white font-black text-xs flex items-center justify-center border border-amber-400 shadow-sm">
                  3
                </div>
              </div>

              <h3 className="text-lg font-black text-white mt-4 truncate max-w-[200px]">
                {topThree.third.name}
              </h3>
              <p className="text-xs text-amber-500/80 font-mono">@{topThree.third.username}</p>

              <div className="mt-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-stone-800 text-amber-300 border border-stone-700">
                  LVL {topThree.third.level}
                </span>
                <span className="text-xs font-bold text-stone-300">
                  {topThree.third.xp.toLocaleString()} XP
                </span>
              </div>

              <div className="mt-3 text-[11px] font-semibold text-amber-400/90 flex items-center gap-1">
                <span>{getLevelTierBadge(topThree.third.level).title}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CONTROLS & FILTER BAR ── */}
      <div
        className="p-4 sm:p-5 rounded-2xl border backdrop-blur-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-lg"
        style={{
          background: 'rgba(15, 12, 12, 0.75)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Tier Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Warriors' },
            { id: 'god', label: 'Level 20+ (God Tier)' },
            { id: 'champion', label: 'Level 10-19 (Champion)' },
            { id: 'vanguard', label: 'Level 5-9 (Vanguard)' },
            { id: 'initiate', label: 'Level 1-4 (Initiate)' },
          ].map((tab) => {
            const active = tierFilter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTierFilter(tab.id as LevelTierFilter)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  active
                    ? isSpiderman
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md'
                      : isGow
                        ? 'bg-red-600 text-white border-red-400 shadow-md'
                        : 'bg-amber-500 text-stone-950 border-amber-300 shadow-md'
                    : 'bg-white/5 text-stone-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Right Filter: Search and Sort */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Search Box */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search warrior..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/15 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center rounded-xl bg-black/40 border border-white/15 p-0.5">
            <button
              type="button"
              onClick={() => setSortMode('level')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                sortMode === 'level'
                  ? 'bg-amber-500 text-stone-950 font-black'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Rank primarily by Level"
            >
              By Level
            </button>
            <button
              type="button"
              onClick={() => setSortMode('xp')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                sortMode === 'xp'
                  ? 'bg-amber-500 text-stone-950 font-black'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Rank primarily by Total XP"
            >
              By XP
            </button>
          </div>
        </div>
      </div>

      {/* ── RANKINGS TABLE / LEADERBOARD LIST ── */}
      <div
        className="rounded-3xl border overflow-hidden shadow-2xl backdrop-blur-xl"
        style={{
          background: 'rgba(12, 10, 10, 0.85)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Table Header */}
        <div
          className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b text-[11px] font-black uppercase tracking-wider text-stone-400 select-none"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="col-span-2 sm:col-span-1 text-center">Rank</div>
          <div className="col-span-5 sm:col-span-5">Warrior Identity</div>
          <div className="col-span-3 sm:col-span-3 text-center sm:text-left">Combat Level</div>
          <div className="col-span-2 sm:col-span-3 text-right">Power XP</div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="p-8 flex flex-col gap-4">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className="h-16 rounded-2xl bg-white/5 animate-pulse border border-white/5"
              />
            ))}
          </div>
        ) : filteredWarriors.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <Shield className="w-12 h-12 text-stone-600" />
            <div className="text-base font-bold text-white">No Warriors Found in this Tier</div>
            <p className="text-xs text-stone-400 max-w-sm">
              Try changing the level tier filter or clearing your search term to see more players.
            </p>
            <button
              type="button"
              onClick={() => {
                setTierFilter('all')
                setSearchQuery('')
              }}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/15 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredWarriors.map((warrior) => {
              const tier = getLevelTierBadge(warrior.level)
              const TierIcon = tier.icon
              const isTop3 = warrior.rank <= 3

              return (
                <div
                  key={warrior.id}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-all duration-200 ${
                    warrior.isCurrentUser
                      ? 'bg-amber-500/10 border-y border-amber-500/30'
                      : 'hover:bg-white/[0.04]'
                  }`}
                >
                  {/* RANK BADGE */}
                  <div className="col-span-2 sm:col-span-1 flex justify-center">
                    {warrior.rank === 1 ? (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-stone-950 font-black text-xs flex items-center justify-center shadow-md">
                        🥇
                      </div>
                    ) : warrior.rank === 2 ? (
                      <div className="w-8 h-8 rounded-xl bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center shadow-md">
                        🥈
                      </div>
                    ) : warrior.rank === 3 ? (
                      <div className="w-8 h-8 rounded-xl bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-md">
                        🥉
                      </div>
                    ) : (
                      <div
                        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center font-mono ${
                          warrior.isCurrentUser
                            ? 'bg-amber-400 text-stone-950 font-black'
                            : 'text-stone-400 bg-white/5'
                        }`}
                      >
                        #{warrior.rank}
                      </div>
                    )}
                  </div>

                  {/* WARRIOR IDENTITY */}
                  <div className="col-span-5 sm:col-span-5 flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-black text-sm border shadow-inner ${
                        warrior.isCurrentUser
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : isTop3
                            ? 'bg-white/10 text-white border-white/20'
                            : 'bg-white/5 text-stone-300 border-white/10'
                      }`}
                    >
                      {warrior.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-black text-sm truncate ${
                            warrior.isCurrentUser ? 'text-amber-300' : 'text-white'
                          }`}
                        >
                          {warrior.name}
                        </span>
                        {warrior.isCurrentUser && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-400 text-stone-950 shrink-0">
                            YOU
                          </span>
                        )}
                        {warrior.role === 'admin' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-red-600/30 text-red-300 border border-red-500/30 shrink-0">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-400 font-mono truncate">
                        @{warrior.username}
                      </div>
                    </div>
                  </div>

                  {/* LEVEL TIER & BADGE */}
                  <div className="col-span-3 sm:col-span-3 flex flex-col sm:flex-row sm:items-center gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-black border shadow-sm ${
                          warrior.level >= 20
                            ? 'bg-gradient-to-r from-amber-500/30 to-red-500/30 text-amber-300 border-amber-500/50'
                            : warrior.level >= 10
                              ? 'bg-gradient-to-r from-red-600/30 to-orange-600/30 text-red-300 border-red-500/40'
                              : warrior.level >= 5
                                ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/30 text-sky-300 border-sky-500/40'
                                : 'bg-stone-800 text-stone-300 border-stone-700'
                        }`}
                      >
                        LVL {warrior.level}
                      </span>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-stone-400 truncate">
                      <TierIcon className="w-3 h-3 text-stone-400 shrink-0" />
                      <span className="truncate">{tier.title}</span>
                    </span>
                  </div>

                  {/* TOTAL XP */}
                  <div className="col-span-2 sm:col-span-3 text-right">
                    <div className="font-mono font-bold text-xs sm:text-sm text-stone-200">
                      {warrior.xp.toLocaleString()} <span className="text-[10px] text-stone-400">XP</span>
                    </div>
                    <div className="text-[10px] text-stone-400 hidden sm:block">
                      Score: {warrior.level * 1000 + warrior.xp} pts
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer info */}
        <div
          className="px-6 py-3 border-t flex items-center justify-between text-[11px] text-stone-400 select-none"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <span>
            Displaying {filteredWarriors.length} of {warriors.length} warriors in real-time
          </span>
          <span>
            Last synced: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  )
}
