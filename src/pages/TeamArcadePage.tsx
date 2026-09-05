import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import {
  useTeamArcade,
  useArcadeFests,
  useStudentFestHistory,
  useStudentBattles,
  registerBattleAction,
  deriveBattleEffectiveStatus,
  computeEffectiveFestStatus,
  fetchBattleLeaderboard,
  type ArcadeFest,
  type ArcadeBattle,
  type BattleLeaderboardEntry,
} from '../lib/arcade'
import { BloodArenaBattleView } from '../components/crucible/BloodArenaBattleView'
import { RagnarokFestLobby, ClanProfileCard } from '../components/crucible/RagnarokFestLobby'
import { C, formatCountdown, formatDateTime, relativeTime, statusBadgeStyle } from '../components/crucible/crucibleTokens'
import { BattleLeaderboardTable } from '../components/arcade/BattleLeaderboardTable'
import confetti from 'canvas-confetti'
import {
  Swords, Flame, Trophy, Clock, CheckCircle2,
  Users, UserPlus, LogOut, Loader2, AlertCircle,
  Copy, Shield, X, Calendar, Crown, Gamepad2
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export const TeamArcadePage: React.FC = () => {
  const { user } = useAuth()
  const {
    team,
    members,
    registeredFestIds,
    loading: teamLoading,
    isCaptain,
    createTeamAction,
    joinTeamAction,
    leaveTeamAction,
    registerFestAction,
  } = useTeamArcade(user?.id)

  const { fests, loading: festsLoading, liveFests, upcomingFests, endedFests } = useArcadeFests()
  const { battles, registeredBattleIds, refreshBattles } = useStudentBattles(user?.id)

  const [now, setNow] = useState(() => Date.now())
  const [resultsBattle, setResultsBattle] = useState<ArcadeBattle | null>(null)
  const [resultsData, setResultsData] = useState<BattleLeaderboardEntry[]>([])
  const [isLoadingResults, setIsLoadingResults] = useState(false)

  // 1-second interval ensures live status transitions and countdowns without page refresh
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleViewResults = async (b: ArcadeBattle) => {
    setResultsBattle(b)
    setIsLoadingResults(true)
    const data = await fetchBattleLeaderboard(b.id)
    setResultsData(data)
    setIsLoadingResults(false)
  }

  const [activeArcadeTab, setActiveArcadeTab] = useState<'battles' | 'fests'>('battles')
  const [activeBattleTab, setActiveBattleTab] = useState<'all' | 'live' | 'upcoming' | 'ended'>('all')
  const [activeLobbyBattleId, setActiveLobbyBattleId] = useState<string | null>(null)
  const [isRegisteringBattle, setIsRegisteringBattle] = useState(false)

  const handleRegisterBattle = async (battleId: string) => {
    if (!user?.id) {
      toast.error('You must log in to join the slaughter.')
      return
    }
    setIsRegisteringBattle(true)
    const result = await registerBattleAction(battleId, user.id)
    setIsRegisteringBattle(false)

    if (!result.success) {
      toast.error(result.error || 'Failed to enter the Blood Arena.')
    } else {
      toast.success(`Clan Registered for ${result.battle_title || 'Battle'}! ⚔️`)
      confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 }, colors: [C.crimson, C.gold, '#fff'] })
      refreshBattles()
    }
  }

  const [activeFestTab, setActiveFestTab] = useState<'all' | 'live' | 'upcoming' | 'ended'>('all')
  const [selectedFest, setSelectedFest] = useState<ArcadeFest | null>(null)
  const [activeLobbyFest, setActiveLobbyFest] = useState<ArcadeFest | null>(null)
  const [isRegisteringFest, setIsRegisteringFest] = useState(false)

  const handleRegisterFest = async (festId: string) => {
    setIsRegisteringFest(true)
    const result = await registerFestAction(festId)
    setIsRegisteringFest(false)

    if (!result.success) {
      toast.error(result.error || 'Failed to pledge to Ragnarök.')
    } else {
      toast.success(`Clan registered for ${result.fest_title || 'Ragnarök'}! 🏆`)
      confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 }, colors: [C.crimson, C.gold, '#fff'] })
    }
  }

  const [teamNameInput, setTeamNameInput] = useState('')
  const [teamCodeInput, setTeamCodeInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(true)
      toast.success('Runic Code inscribed. 📋')
      setTimeout(() => setCopiedCode(false), 2500)
    } catch {
      toast.error('Failed to scribe code.')
    }
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError(null)

    const trimmed = teamNameInput.trim()
    if (trimmed.length < 2) return setActionError('Clan name must be at least 2 runes.')
    if (trimmed.length > 50) return setActionError('Clan name must be 50 runes or less.')

    setIsSubmitting(true)
    const result = await createTeamAction(trimmed)
    setIsSubmitting(false)

    if (!result.success) {
      setActionError(result.error || 'Failed to forge clan.')
      toast.error(result.error || 'Failed to forge clan.')
    } else {
      setTeamNameInput('')
      toast.success(`Clan "${result.team_name}" forged! 🛡️`)
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 }, colors: [C.crimson, '#fff'] })
    }
  }

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError(null)

    const cleanCode = teamCodeInput.trim().toUpperCase()
    if (cleanCode.length !== 6) return setActionError('Runic code must be exactly 6 characters.')

    setIsSubmitting(true)
    const result = await joinTeamAction(cleanCode)
    setIsSubmitting(false)

    if (!result.success) {
      setActionError(result.error || 'Failed to swear fealty.')
      toast.error(result.error || 'Failed to swear fealty.')
    } else {
      setTeamCodeInput('')
      toast.success(`Sworn to clan "${result.team_name}"! ⚔️`)
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 }, colors: [C.crimson, '#fff'] })
    }
  }

  const handleLeaveTeam = async () => {
    setIsSubmitting(true)
    const result = await leaveTeamAction()
    setIsSubmitting(false)
    setShowLeaveConfirm(false)

    if (!result.success) {
      toast.error(result.error || 'Failed to break oath.')
    } else {
      toast.success('Oath broken. You are a lone wolf again.')
    }
  }

  // Loading state
  if (teamLoading || festsLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-32 gap-4" style={{ color: C.textPrimary }}>
        <div className="text-4xl animate-pulse" style={{ fontFamily: "'Cinzel Decorative', serif", color: C.crimson }}>⚔</div>
        <div className="text-[11px] uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif", color: C.textSecondary }}>
          Summoning the Arena…
        </div>
      </div>
    )
  }

  // Active Lobbies
  if (activeLobbyBattleId) {
    return (
      <BloodArenaBattleView
        battleId={activeLobbyBattleId}
        userId={user?.id}
        onExit={() => setActiveLobbyBattleId(null)}
      />
    )
  }

  if (activeLobbyFest) {
    return (
      <RagnarokFestLobby
        fest={activeLobbyFest}
        team={team}
        members={members}
        userId={user?.id}
        onExit={() => setActiveLobbyFest(null)}
      />
    )
  }

  // Dynamic Live Filtering relative to current timestamp
  const liveBattles = battles.filter((b) => deriveBattleEffectiveStatus(b.status, b.start_time, b.end_time, now) === 'live')
  const upcomingBattles = battles.filter((b) => deriveBattleEffectiveStatus(b.status, b.start_time, b.end_time, now) === 'upcoming')
  const endedBattles = battles.filter((b) => deriveBattleEffectiveStatus(b.status, b.start_time, b.end_time, now) === 'ended')

  const displayedBattles = battles.filter((b) => {
    const eff = deriveBattleEffectiveStatus(b.status, b.start_time, b.end_time, now)
    if (activeBattleTab === 'live') return eff === 'live'
    if (activeBattleTab === 'upcoming') return eff === 'upcoming'
    if (activeBattleTab === 'ended') return eff === 'ended'
    return true
  })

  const displayedFests = fests.filter((f) => {
    const eff = computeEffectiveFestStatus(f.start_time, f.end_time, now)
    if (activeFestTab === 'live') return eff === 'live'
    if (activeFestTab === 'upcoming') return eff === 'upcoming'
    if (activeFestTab === 'ended') return eff === 'ended'
    return true
  })

  const { theme } = useTheme()

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-8 flex flex-col gap-10" style={{ color: C.textPrimary }}>
      {/* ── 1. HERO BANNER ── */}
      {theme === 'classic' ? (
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 bg-gradient-to-r from-[#064E3B] to-[#022C22] text-white shadow-md border border-emerald-900/40">
          <div className="relative z-10 flex flex-col gap-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit bg-emerald-950/70 border border-emerald-400/40 text-emerald-300">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>TEAM ARCADE • COMPETITIVE ARENA</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              Team Arcade Arena
            </h1>
            <p className="text-sm text-emerald-100/80 leading-relaxed max-w-xl">
              Form 4-player squads, register for upcoming competitive coding battles, and join the pre-match lobby to conquer ordered quests together.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl p-8 md:p-12"
          style={{
            background: 'linear-gradient(135deg, rgba(20,12,12,0.95) 0%, rgba(14,10,10,0.95) 100%)',
            border: `1px solid ${C.border}`,
            boxShadow: `0 0 30px rgba(220,38,38,0.15) inset`
          }}>
          <div className="relative z-10 flex flex-col gap-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest w-fit"
              style={{ fontFamily: "'Cinzel', serif", background: C.crimsonDim, color: C.crimson, border: `1px solid ${C.borderHot}` }}>
              <Swords className="w-3 h-3" /> The Blood Arena
            </div>
            <h1 className="text-3xl md:text-5xl font-black" style={{ fontFamily: "'Cinzel Decorative', serif", textShadow: '0 2px 20px rgba(220,38,38,0.4)' }}>
              Prove Your Valor
            </h1>
            <p className="text-sm leading-relaxed max-w-xl" style={{ color: C.textSecondary }}>
              Forge a war clan, pledge fealty to Ragnarök tournaments, and spill blood in real-time competitive duels. Only the strong survive the Crucible.
            </p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at right, rgba(220,38,38,0.4) 0%, transparent 70%)',
            }} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── LEFT: MAIN ARENA TABS ── */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Tab selector */}
          {theme === 'classic' ? (
            <div className="flex items-center gap-3">
              {[
                { key: 'battles', label: 'COMPETITIVE BATTLES', icon: <Swords className="w-3.5 h-3.5" />, count: battles.length },
                { key: 'fests', label: 'CODING FESTS', icon: <Flame className="w-3.5 h-3.5" />, count: fests.length },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveArcadeTab(t.key as any)}
                  className={`px-4 py-2.5 rounded-xl font-pixel text-xs tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                    activeArcadeTab === t.key
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.icon} {t.label} ({t.count})
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-0" style={{ borderBottom: `1px solid ${C.border}` }}>
              {[
                { key: 'battles', label: 'Gladiatorial Battles', icon: <Swords className="w-4 h-4" />, count: battles.length },
                { key: 'fests', label: 'Ragnarök Tournaments', icon: <Flame className="w-4 h-4" />, count: fests.length },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveArcadeTab(t.key as any)}
                  className="relative px-6 py-3 text-[11px] uppercase font-bold tracking-widest flex items-center gap-2 transition-all"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    color: activeArcadeTab === t.key ? C.crimson : C.textSecondary,
                    borderBottom: activeArcadeTab === t.key ? `2px solid ${C.crimson}` : '2px solid transparent',
                  }}>
                  {t.icon} {t.label} <span className="text-[9px]" style={{ color: activeArcadeTab === t.key ? C.crimson : C.textMuted }}>({t.count})</span>
                </button>
              ))}
            </div>
          )}

          {/* ── BATTLES CONTENT ── */}
          {activeArcadeTab === 'battles' && (
            <div className="flex flex-col gap-6">
              {/* Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {(['all', 'live', 'upcoming', 'ended'] as const).map(f => {
                  const labelMap: Record<string, string> = {
                    all: `All (${battles.length})`,
                    live: `Live (${liveBattles.length})`,
                    upcoming: `Upcoming (${upcomingBattles.length})`,
                    ended: `Concluded (${endedBattles.length})`,
                  }
                  if (theme === 'classic') {
                    return (
                      <button
                        key={f}
                        onClick={() => setActiveBattleTab(f)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          activeBattleTab === f
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {labelMap[f] || f}
                      </button>
                    )
                  }
                  return (
                    <button
                      key={f}
                      onClick={() => setActiveBattleTab(f)}
                      className="px-4 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-widest transition-all whitespace-nowrap"
                      style={{
                        fontFamily: "'Cinzel', serif",
                        background: activeBattleTab === f ? C.crimsonDim : 'rgba(20,12,12,0.6)',
                        color: activeBattleTab === f ? C.crimson : C.textMuted,
                        border: `1px solid ${activeBattleTab === f ? C.borderHot : C.border}`,
                      }}>
                      {f}
                    </button>
                  )
                })}
              </div>

              {displayedBattles.length === 0 ? (
                <div className="text-center py-16 rounded-2xl" style={{ border: `1px dashed ${C.border}` }}>
                  <div className="text-3xl opacity-40 mb-3 text-white">⚔</div>
                  <p className="text-sm" style={{ color: C.textSecondary, fontFamily: "'Cinzel', serif" }}>No blood currently spilled here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedBattles.map(battle => {
                    const startMs = new Date(battle.start_time).getTime()
                    const endMs = new Date(battle.end_time).getTime()
                    const effStatus = deriveBattleEffectiveStatus(battle.status, battle.start_time, battle.end_time, now)
                    const isLive = effStatus === 'live'
                    const isUpcoming = effStatus === 'upcoming'
                    const isEnded = effStatus === 'ended'
                    const isRegistered = registeredBattleIds.includes(battle.id)
                    const { bg: statusBg, color: statusColor, label: statusLabel, pulse: statusPulse } = statusBadgeStyle(effStatus)
                    const timeUntilStart = Math.max(0, startMs - now)
                    const timeUntilEnd = Math.max(0, endMs - now)

                    if (theme === 'classic') {
                      return (
                        <div
                          key={battle.id}
                          className="bg-white rounded-2xl p-5 flex flex-col gap-4 border-2 border-slate-200 hover:border-emerald-500 shadow-sm transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold border flex items-center gap-1.5 ${
                              isEnded
                                ? 'bg-slate-100 text-slate-600 border-slate-200'
                                : isLive
                                ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {isEnded ? '✓ CONCLUDED' : isLive ? '● LIVE' : 'UPCOMING'}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              {battle.exercise_count || 2} Quests
                            </span>
                          </div>

                          <div>
                            <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                              {battle.title}
                            </h3>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                              {battle.description || 'Collaborative competitive coding battle.'}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              +{battle.base_points} Base
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              +{battle.speed_bonus_max} Speed
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              -{battle.wrong_answer_penalty} Penalty
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                            {isUpcoming && (
                              <>
                                <div className="flex items-center gap-1.5 text-slate-500">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Starts: {formatDateTime(battle.start_time)}</span>
                                </div>
                                <div className="flex items-center gap-1.5 font-bold text-amber-700">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Starts in: {formatCountdown(timeUntilStart)}</span>
                                  <span className="text-[10px] text-slate-400 font-normal">({battle.duration_minutes}m)</span>
                                </div>
                              </>
                            )}

                            {isLive && (
                              <>
                                <div className="flex items-center gap-1.5 text-slate-500">
                                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Started: {formatDateTime(battle.start_time)}</span>
                                </div>
                                <div className="flex items-center gap-1.5 font-bold text-rose-600 animate-pulse">
                                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Ends in: {formatCountdown(timeUntilEnd)}</span>
                                </div>
                              </>
                            )}

                            {isEnded && (
                              <>
                                <div className="flex items-center gap-1.5 text-slate-500">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Concluded: {formatDateTime(battle.end_time)}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Duration: {battle.duration_minutes} Minutes</span>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="mt-auto pt-3 border-t border-slate-100">
                            {isLive && isRegistered ? (
                              <button
                                type="button"
                                onClick={() => setActiveLobbyBattleId(battle.id)}
                                className="btn-gamified-3d btn-gamified-3d-primary w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <Swords className="w-3.5 h-3.5" />
                                <span>ENTER THE ARENA ⚔️</span>
                              </button>
                            ) : isUpcoming && isRegistered ? (
                              <button
                                type="button"
                                onClick={() => setActiveLobbyBattleId(battle.id)}
                                className="w-full py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                              >
                                <Users className="w-3.5 h-3.5" />
                                <span>ENTER WAITING ROOM</span>
                              </button>
                            ) : isUpcoming && !isRegistered ? (
                              <button
                                type="button"
                                onClick={() => handleRegisterBattle(battle.id)}
                                disabled={!team || !isCaptain || isRegisteringBattle}
                                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 transition-colors"
                              >
                                <span>
                                  {isRegisteringBattle
                                    ? 'REGISTERING...'
                                    : !team
                                    ? 'FORM A SQUAD FIRST'
                                    : isCaptain
                                    ? 'REGISTER SQUAD'
                                    : 'CAPTAIN ONLY'}
                                </span>
                              </button>
                            ) : isLive && !isRegistered ? (
                              <button
                                type="button"
                                disabled
                                className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed"
                              >
                                <span>LIVE • REGISTRATION CLOSED</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleViewResults(battle)}
                                className="btn-gamified-3d btn-gamified-3d-primary w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                                <span>VIEW RESULTS</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div key={battle.id} className="rounded-2xl p-5 flex flex-col gap-4 transition-all"
                        style={{ background: C.bgCard, border: `1px solid ${isLive ? C.borderHot : C.border}`, boxShadow: isLive ? `0 0 20px rgba(220,38,38,0.1)` : 'none' }}>
                        
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${statusPulse ? 'animate-pulse' : ''}`}
                            style={{ background: statusBg, color: statusColor, fontFamily: "'Cinzel', serif", border: `1px solid ${statusColor}44` }}>
                            ● {statusLabel}
                          </span>
                          {isRegistered && (
                            <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold"
                              style={{ background: 'rgba(0,229,255,0.1)', color: C.frost, border: `1px solid ${C.frost}44` }}>
                              <CheckCircle2 className="w-2.5 h-2.5 inline mr-1" /> Pledged
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="font-bold text-lg mb-1" style={{ fontFamily: "'Cinzel', serif", color: C.textPrimary }}>{battle.title}</h3>
                          <p className="text-xs line-clamp-2" style={{ color: C.textSecondary }}>{battle.description || 'Collaborative competitive coding battle.'}</p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-3 text-[10px] font-mono" style={{ color: C.textMuted }}>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {battle.duration_minutes}m</span>
                          <span className="flex items-center gap-1"><Crown className="w-3 h-3 text-yellow-600" /> {battle.base_points} Base XP</span>
                          <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-red-600" /> -{battle.wrong_answer_penalty} Pen</span>
                        </div>

                        {/* Schedule & Timing */}
                        <div className="flex flex-col gap-1 text-[11px] font-mono pt-1" style={{ color: C.textSecondary }}>
                          {isUpcoming && (
                            <>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>Starts: {formatDateTime(battle.start_time)}</span>
                              </div>
                              <div className="flex items-center gap-1.5 font-bold" style={{ color: C.goldBright }}>
                                <Clock className="w-3 h-3" />
                                <span>Starts in: {formatCountdown(timeUntilStart)}</span>
                              </div>
                            </>
                          )}
                          {isLive && (
                            <>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3 h-3" style={{ color: C.frost }} />
                                <span>Started: {formatDateTime(battle.start_time)}</span>
                              </div>
                              <div className="flex items-center gap-1.5 font-bold animate-pulse" style={{ color: C.crimson }}>
                                <Clock className="w-3 h-3" />
                                <span>Ends in: {formatCountdown(timeUntilEnd)}</span>
                              </div>
                            </>
                          )}
                          {isEnded && (
                            <>
                              <div className="flex items-center gap-1.5 text-stone-400">
                                <Calendar className="w-3 h-3" />
                                <span>Concluded: {formatDateTime(battle.end_time)}</span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-auto pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                          {isLive && isRegistered ? (
                            <button onClick={() => setActiveLobbyBattleId(battle.id)} className="w-full py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all"
                              style={{ background: 'linear-gradient(135deg, #DC2626, #FF3D00)', color: '#fff', fontFamily: "'Cinzel', serif" }}>
                              Enter the Arena ⚔️
                            </button>
                          ) : isUpcoming && isRegistered ? (
                            <button onClick={() => setActiveLobbyBattleId(battle.id)} className="w-full py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all"
                              style={{ background: 'rgba(20,12,12,0.8)', border: `1px solid ${C.borderHot}`, color: C.crimson, fontFamily: "'Cinzel', serif" }}>
                              Enter War Tent
                            </button>
                          ) : isUpcoming && !isRegistered ? (
                            <button onClick={() => handleRegisterBattle(battle.id)} disabled={!team || !isCaptain || isRegisteringBattle}
                              className="w-full py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all disabled:opacity-40"
                              style={{ background: C.crimsonDim, border: `1px solid ${C.borderHot}`, color: C.crimson, fontFamily: "'Cinzel', serif" }}>
                              {isRegisteringBattle ? 'Scribing...' : !team ? 'Form a Clan First' : isCaptain ? 'Pledge Clan' : 'Warlord Only'}
                            </button>
                          ) : isLive && !isRegistered ? (
                            <button disabled className="w-full py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase opacity-50 cursor-not-allowed"
                              style={{ background: 'rgba(20,12,12,0.8)', border: `1px solid ${C.border}`, color: C.textMuted, fontFamily: "'Cinzel', serif" }}>
                              Live • Registration Closed
                            </button>
                          ) : (
                            <button onClick={() => handleViewResults(battle)} className="w-full py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5"
                              style={{ background: 'rgba(20,12,12,0.8)', border: `1px solid ${C.borderGold}`, color: C.goldBright, fontFamily: "'Cinzel', serif" }}>
                              <Trophy className="w-3 h-3" />
                              <span>View Results</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── FESTS CONTENT ── */}
          {activeArcadeTab === 'fests' && (
            <div className="flex flex-col gap-6">
              {/* Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {(['all', 'live', 'upcoming', 'ended'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFestTab(f)}
                    className="px-4 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-widest transition-all whitespace-nowrap"
                    style={{
                      fontFamily: "'Cinzel', serif",
                      background: activeFestTab === f ? C.crimsonDim : 'rgba(20,12,12,0.6)',
                      color: activeFestTab === f ? C.crimson : C.textMuted,
                      border: `1px solid ${activeFestTab === f ? C.borderHot : C.border}`,
                    }}>
                    {f}
                  </button>
                ))}
              </div>

              {displayedFests.length === 0 ? (
                <div className="text-center py-16 rounded-2xl" style={{ border: `1px dashed ${C.border}` }}>
                  <div className="text-3xl opacity-40 mb-3 text-white">🏆</div>
                  <p className="text-sm" style={{ color: C.textSecondary, fontFamily: "'Cinzel', serif" }}>No tournaments echo in the halls.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedFests.map(fest => {
                    const isRegistered = registeredFestIds.includes(fest.id)
                    const { bg: statusBg, color: statusColor, label: statusLabel, pulse: statusPulse } = statusBadgeStyle(fest.effective_status)

                    return (
                      <div key={fest.id} className="rounded-2xl flex flex-col overflow-hidden transition-all group"
                        style={{ background: C.bgCard, border: `1px solid ${C.border}` }}>
                        
                        {/* Banner */}
                        <div className="h-24 relative overflow-hidden flex items-end p-4">
                          {fest.banner_url ? (
                            <img src={fest.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" style={{ filter: 'brightness(0.5)' }} />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-red-900 to-black" />
                          )}
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(14,10,10,1) 0%, transparent 100%)' }} />
                          
                          <div className="relative z-10 w-full flex justify-between items-end">
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${statusPulse ? 'animate-pulse' : ''}`}
                              style={{ background: statusBg, color: statusColor, fontFamily: "'Cinzel', serif", border: `1px solid ${statusColor}44` }}>
                              ● {statusLabel}
                            </span>
                            {isRegistered && (
                              <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold"
                                style={{ background: 'rgba(0,229,255,0.1)', color: C.frost, border: `1px solid ${C.frost}44` }}>
                                <CheckCircle2 className="w-2.5 h-2.5 inline mr-1" /> Pledged
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-5 flex flex-col gap-3 flex-1">
                          <h3 className="font-bold text-lg" style={{ fontFamily: "'Cinzel', serif", color: C.textPrimary }}>{fest.title}</h3>
                          <p className="text-xs line-clamp-2" style={{ color: C.textSecondary }}>{fest.description}</p>
                          
                          <div className="mt-auto pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                            {isRegistered ? (
                              <button onClick={() => setActiveLobbyFest(fest)} className="w-full py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all"
                                style={{ background: fest.effective_status === 'live' ? 'linear-gradient(135deg, #DC2626, #FF3D00)' : 'rgba(20,12,12,0.8)', color: fest.effective_status === 'live' ? '#fff' : C.crimson, border: `1px solid ${fest.effective_status === 'live' ? 'transparent' : C.borderHot}`, fontFamily: "'Cinzel', serif" }}>
                                {fest.effective_status === 'live' ? 'Enter Live Fest ⚔️' : fest.effective_status === 'ended' ? 'View Standings' : 'Enter Lobby'}
                              </button>
                            ) : (
                              <button onClick={() => setSelectedFest(fest)} className="w-full py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all"
                                style={{ background: 'rgba(20,12,12,0.8)', border: `1px solid ${C.border}`, color: C.textSecondary, fontFamily: "'Cinzel', serif" }}>
                                View Runes
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: CLAN / SQUAD MANAGEMENT (SIDEBAR) ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {theme === 'classic' ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  🎮
                </div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                  Your Arcade Squad
                </h2>
              </div>

              {team ? (
                <div className="flex flex-col gap-4">
                  {/* Classic Squad Profile Card */}
                  <div className="bg-white rounded-2xl p-5 border-2 border-emerald-500 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-2xl font-black shrink-0">
                        🛡️
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                            Active Squad
                          </span>
                          {isCaptain && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold">
                              👑 Captain
                            </span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-base text-slate-900 truncate">
                          {team.name}
                        </h3>
                        <span className="text-xs text-slate-500">
                          {members.length} / 4 Members
                        </span>
                      </div>
                    </div>

                    {/* Squad Roster */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Squad Roster
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {members.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold flex items-center justify-center text-xs">
                                {((m.profile?.username || m.profile?.full_name || 'M')[0]).toUpperCase()}
                              </div>
                              <span className="font-bold text-slate-800 truncate">
                                {m.profile?.username || m.profile?.full_name || 'Squad Mate'}
                              </span>
                            </div>
                            {m.role === 'captain' && (
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                Captain
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Squad Invite Code & Directives */}
                    <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Squad Invite Code
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(team.code)}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800 transition-colors cursor-pointer shadow-2xs"
                      >
                        <span className="text-slate-400 font-sans text-[11px] font-medium">Invite Code:</span>
                        <span className="text-emerald-700 font-bold tracking-widest">{team.code}</span>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowLeaveConfirm(true)}
                        className="w-full py-2 text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-center"
                      >
                        Leave Squad
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-5">
                  <div className="text-center pb-4 border-b border-slate-100">
                    <div className="w-12 h-12 mx-auto mb-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl text-emerald-600">
                      👥
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      Squad Up for Battle
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Create or join a 4-player team to register and compete in arcade battles together.
                    </p>
                  </div>

                  {actionError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{actionError}</span>
                    </div>
                  )}

                  {/* Form 1: Create Squad */}
                  <form onSubmit={handleCreateTeam} className="flex flex-col gap-3 pb-5 border-b border-slate-100">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      Create a Squad
                    </span>
                    <input
                      type="text"
                      placeholder="Squad Name (e.g. Byte Brawlers)"
                      value={teamNameInput}
                      onChange={(e) => setTeamNameInput(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white shadow-2xs"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !teamNameInput.trim()}
                      className="btn-gamified-3d btn-gamified-3d-primary w-full py-2.5 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>Create Squad</span>
                      <Users className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {/* Form 2: Join Squad */}
                  <form onSubmit={handleJoinTeam} className="flex flex-col gap-3">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      Join with Invite Code
                    </span>
                    <input
                      type="text"
                      placeholder="6-Letter Code"
                      value={teamCodeInput}
                      onChange={(e) => setTeamCodeInput(e.target.value)}
                      maxLength={6}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono uppercase tracking-widest placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal focus:outline-none focus:border-emerald-500 focus:bg-white shadow-2xs"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || teamCodeInput.length !== 6}
                      className="btn-gamified-3d btn-gamified-3d-secondary w-full py-2.5 rounded-xl text-xs font-extrabold text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>Join Squad</span>
                      <UserPlus className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" style={{ color: C.gold }} />
                <h2 className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif", color: C.gold }}>
                  Your War Clan
                </h2>
              </div>

              {team ? (
                <div className="flex flex-col gap-4">
                  {/* Using the phase 4 Crucible Clan Profile Card */}
                  <ClanProfileCard team={team} members={members} isCaptain={isCaptain} />
                  
                  <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: C.bgCard, border: `1px solid ${C.border}` }}>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textSecondary, fontFamily: "'Cinzel', serif" }}>Clan Directives</span>
                    <button
                      onClick={() => handleCopyCode(team.code)}
                      className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-xs font-mono transition-all"
                      style={{ background: 'rgba(20,12,12,0.6)', border: `1px dashed ${C.borderHot}`, color: C.textPrimary }}
                    >
                      <span style={{ color: C.textMuted }}>Code:</span> {team.code}
                      <Copy className="w-3.5 h-3.5" style={{ color: C.crimson }} />
                    </button>
                    <button
                      onClick={() => setShowLeaveConfirm(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                      style={{ color: C.textMuted, border: `1px solid transparent` }}
                      onMouseEnter={e => { e.currentTarget.style.color = C.crimson; e.currentTarget.style.border = `1px solid ${C.borderHot}` }}
                      onMouseLeave={e => { e.currentTarget.style.color = C.textMuted; e.currentTarget.style.border = `1px solid transparent` }}
                    >
                      <LogOut className="w-3.5 h-3.5" /> Break Oath
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl p-5 flex flex-col gap-6" style={{ background: C.bgCard, border: `1px solid ${C.border}` }}>
                  <div className="text-center pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center text-xl"
                      style={{ background: 'linear-gradient(135deg, #7F1D1D, #DC2626)', boxShadow: `0 0 14px rgba(220,38,38,0.4)` }}>
                      🛡
                    </div>
                    <h3 className="font-bold text-sm" style={{ fontFamily: "'Cinzel', serif", color: C.textPrimary }}>Forge a Clan</h3>
                    <p className="text-xs mt-1" style={{ color: C.textSecondary }}>You must swear allegiance to a clan before spilling blood.</p>
                  </div>

                  {actionError && (
                    <div className="p-3 rounded-xl flex items-start gap-2 text-[10px]" style={{ background: C.crimsonDim, color: C.crimson, border: `1px solid ${C.borderHot}` }}>
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {actionError}
                    </div>
                  )}

                  {/* Form Create */}
                  <form onSubmit={handleCreateTeam} className="flex flex-col gap-3 pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: C.gold, fontFamily: "'Cinzel', serif" }}>Forge New Clan</span>
                    <input
                      type="text"
                      placeholder="Clan Name (e.g. Valhalla Vanguard)"
                      value={teamNameInput}
                      onChange={e => setTeamNameInput(e.target.value)}
                      className="w-full text-xs px-4 py-2.5 rounded-xl outline-none"
                      style={{ background: 'rgba(20,12,12,0.8)', border: `1px solid ${C.border}`, color: C.textPrimary, fontFamily: "'Cinzel', serif" }}
                      onFocus={e => (e.currentTarget.style.borderColor = C.borderHot)}
                      onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                    />
                    <button type="submit" disabled={isSubmitting || !teamNameInput.trim()}
                      className="w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-40"
                      style={{ background: 'linear-gradient(135deg, rgba(120,78,16,0.3), rgba(197,155,39,0.15))', border: `1px solid ${C.borderGold}`, color: C.goldBright, fontFamily: "'Cinzel', serif" }}>
                      Forge Clan
                    </button>
                  </form>

                  {/* Form Join */}
                  <form onSubmit={handleJoinTeam} className="flex flex-col gap-3">
                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: C.textMuted, fontFamily: "'Cinzel', serif" }}>Swear Fealty (Join)</span>
                    <input
                      type="text"
                      placeholder="6-Rune Code"
                      value={teamCodeInput}
                      onChange={e => setTeamCodeInput(e.target.value)}
                      maxLength={6}
                      className="w-full text-xs px-4 py-2.5 rounded-xl outline-none font-mono uppercase tracking-widest"
                      style={{ background: 'rgba(20,12,12,0.8)', border: `1px solid ${C.border}`, color: C.textPrimary }}
                      onFocus={e => (e.currentTarget.style.borderColor = C.borderHot)}
                      onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                    />
                    <button type="submit" disabled={isSubmitting || teamCodeInput.length !== 6}
                      className="w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-40"
                      style={{ background: C.crimsonDim, border: `1px solid ${C.borderHot}`, color: C.crimson, fontFamily: "'Cinzel', serif" }}>
                      Swear Oath
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── FEST BRIEFING MODAL ── */}
      {selectedFest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-black rounded-2xl w-full max-w-lg flex flex-col shadow-2xl"
            style={{ border: `1px solid ${C.border}`, boxShadow: `0 0 30px rgba(220,38,38,0.2)` }}>
            <div className="p-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
              <h3 className="font-bold text-lg" style={{ fontFamily: "'Cinzel', serif", color: C.textPrimary }}>Tournament Runes</h3>
              <button onClick={() => setSelectedFest(null)} className="p-1 text-xs" style={{ color: C.textMuted }}>✕</button>
            </div>
            
            <div className="p-6 flex flex-col gap-5">
              <div>
                <h4 className="text-sm font-bold mb-1" style={{ color: C.gold, fontFamily: "'Cinzel', serif" }}>{selectedFest.title}</h4>
                <p className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>{selectedFest.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono" style={{ color: C.textMuted }}>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(20,12,12,0.6)', border: `1px solid ${C.border}` }}>
                  <div className="text-[9px] uppercase mb-1 font-sans font-bold">Dawn</div>
                  <div className="text-white">{new Date(selectedFest.start_time).toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(20,12,12,0.6)', border: `1px solid ${C.border}` }}>
                  <div className="text-[9px] uppercase mb-1 font-sans font-bold">Dusk</div>
                  <div className="text-white">{new Date(selectedFest.end_time).toLocaleString()}</div>
                </div>
              </div>

              <div className="pt-2">
                {selectedFest.effective_status === 'upcoming' && team && isCaptain ? (
                  <button onClick={() => { handleRegisterFest(selectedFest.id); setSelectedFest(null) }}
                    className="w-full py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                    style={{ background: C.crimsonDim, border: `1px solid ${C.borderHot}`, color: C.crimson, fontFamily: "'Cinzel', serif" }}>
                    Pledge Clan to Ragnarök
                  </button>
                ) : selectedFest.effective_status === 'upcoming' && team && !isCaptain ? (
                  <div className="p-3 rounded-xl text-xs text-center" style={{ border: `1px dashed ${C.border}`, color: C.textMuted }}>
                    Only the Warlord (Captain) can pledge the clan.
                  </div>
                ) : selectedFest.effective_status === 'upcoming' && !team ? (
                  <div className="p-3 rounded-xl text-xs text-center" style={{ border: `1px dashed ${C.border}`, color: C.textMuted }}>
                    Forge or join a clan to compete.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LEAVE SQUAD / BREAK OATH MODAL ── */}
      {showLeaveConfirm && team && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          {theme === 'classic' ? (
            <div className="bg-white rounded-2xl w-full max-w-sm flex flex-col p-6 gap-4 border border-slate-200 shadow-xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 text-rose-600">
                <AlertCircle className="w-6 h-6 shrink-0 text-rose-500" />
                <h3 className="font-extrabold text-base text-slate-900">Leave Squad?</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isCaptain && members.length === 1
                  ? 'You are the only member. Leaving will disband this squad.'
                  : 'You will need an invite code from the captain to rejoin.'}
              </p>
              <div className="flex justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveConfirm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Stay
                </button>
                <button
                  type="button"
                  onClick={handleLeaveTeam}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Leaving...' : 'Leave Squad'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-black rounded-2xl w-full max-w-sm flex flex-col p-6 gap-4"
              style={{ border: `1px solid ${C.borderHot}`, boxShadow: `0 0 30px rgba(220,38,38,0.2)` }}>
              <div className="flex items-center gap-3" style={{ color: C.crimson }}>
                <AlertCircle className="w-6 h-6" />
                <h3 className="font-bold text-lg" style={{ fontFamily: "'Cinzel', serif" }}>Break Oath?</h3>
              </div>
              <p className="text-xs" style={{ color: C.textSecondary }}>
                {isCaptain && members.length === 1
                  ? 'You are the last warrior. Breaking the oath will shatter this clan forever.'
                  : 'You will need a new runic code to return.'}
              </p>
              <div className="flex justify-end gap-3 mt-2">
                <button onClick={() => setShowLeaveConfirm(false)} className="px-4 py-2 rounded-lg text-[10px] font-bold uppercase"
                  style={{ color: C.textMuted }}>Stay</button>
                <button onClick={handleLeaveTeam} disabled={isSubmitting} className="px-4 py-2 rounded-lg text-[10px] font-bold uppercase"
                  style={{ background: C.crimson, color: '#fff' }}>{isSubmitting ? '...' : 'Break Oath'}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── BATTLE RESULTS MODAL ── */}
      {resultsBattle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl ${
              theme === 'classic' ? 'bg-white border border-slate-200' : 'bg-stone-950 border border-amber-900/40 text-stone-100'
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between p-6 border-b ${
                theme === 'classic' ? 'border-slate-200 bg-slate-50/80' : 'border-stone-800 bg-black/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg tracking-tight">
                    {resultsBattle.title} — Standings
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-stone-400">
                    Concluded on {formatDateTime(resultsBattle.end_time)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResultsBattle(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-stone-200 hover:bg-slate-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-90px)]">
              {isLoadingResults ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                  <span className="text-xs font-mono">Fetching final scores...</span>
                </div>
              ) : (
                <BattleLeaderboardTable entries={resultsData} myTeamId={team?.id} isEnded={true} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
