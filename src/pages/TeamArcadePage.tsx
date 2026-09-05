import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import {
  useTeamArcade,
  useArcadeFests,
  computeEffectiveFestStatus,
  type ArcadeFest,
  type ArcadeTeamMatch,
} from '../lib/arcade'
import { RagnarokFestLobby, ClanProfileCard } from '../components/crucible/RagnarokFestLobby'
import { TeamChallengeSection } from '../components/arcade/TeamChallengeSection'
import { TeamMatchLobbyModal } from '../components/arcade/TeamMatchLobbyModal'
import { C, formatCountdown, formatDateTime, relativeTime, statusBadgeStyle } from '../components/crucible/crucibleTokens'
import confetti from 'canvas-confetti'
import {
  Swords, Flame, Trophy, Clock, CheckCircle2,
  Users, UserPlus, LogOut, Loader2, AlertCircle,
  Copy, Shield, X, Calendar, Crown, Gamepad2
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export const TeamArcadePage: React.FC = () => {
  const { user } = useAuth()
  const { theme } = useTheme()
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

  const [now, setNow] = useState(() => Date.now())
  const [activeTeamMatch, setActiveTeamMatch] = useState<ArcadeTeamMatch | null>(null)
  const [activeArcadeTab, setActiveArcadeTab] = useState<'duels' | 'fests'>('duels')

  // 1-second interval ensures live status transitions and countdowns without page refresh
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

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

  const displayedFests = fests.filter((f) => {
    const eff = computeEffectiveFestStatus(f.start_time, f.end_time, now)
    if (activeFestTab === 'live') return eff === 'live'
    if (activeFestTab === 'upcoming') return eff === 'upcoming'
    if (activeFestTab === 'ended') return eff === 'ended'
    return true
  })

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
                { key: 'duels', label: 'DIRECT TEAM DUELS', icon: <Swords className="w-3.5 h-3.5" /> },
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
                  {t.icon} {t.label} {t.count !== undefined ? `(${t.count})` : ''}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-0" style={{ borderBottom: `1px solid ${C.border}` }}>
              {[
                { key: 'duels', label: 'Squad Battle Arena', icon: <Swords className="w-4 h-4" /> },
                { key: 'fests', label: 'Ragnarök Tournaments', icon: <Flame className="w-4 h-4" />, count: fests.length },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveArcadeTab(t.key as any)}
                  className="relative px-6 py-3 text-[11px] uppercase font-bold tracking-widest flex items-center gap-2 transition-all cursor-pointer"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    color: activeArcadeTab === t.key ? C.crimson : C.textSecondary,
                    borderBottom: activeArcadeTab === t.key ? `2px solid ${C.crimson}` : '2px solid transparent',
                  }}>
                  {t.icon} {t.label} {t.count !== undefined ? <span className="text-[9px]" style={{ color: activeArcadeTab === t.key ? C.crimson : C.textMuted }}>({t.count})</span> : null}
                </button>
              ))}
            </div>
          )}

          {/* ── DIRECT TEAM DUELS ARENA (SOURCE OF TRUTH) ── */}
          {activeArcadeTab === 'duels' && (
            <div className="flex flex-col gap-6">
              {team ? (
                <TeamChallengeSection
                  team={team}
                  isCaptain={isCaptain}
                  userId={user?.id}
                  onEnterMatch={(match) => setActiveTeamMatch(match)}
                />
              ) : (
                <div
                  className={`rounded-2xl p-8 flex flex-col items-center text-center gap-5 border shadow-sm ${
                    theme === 'classic'
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'border'
                  }`}
                  style={
                    theme !== 'classic'
                      ? {
                          background: C.bgCard,
                          borderColor: C.borderHot,
                          boxShadow: '0 0 25px rgba(220,38,38,0.15)',
                        }
                      : undefined
                  }
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner"
                    style={{
                      background: theme === 'classic' ? '#dcfce7' : 'linear-gradient(135deg, #7F1D1D, #DC2626)',
                      color: theme === 'classic' ? '#15803d' : '#fff',
                    }}
                  >
                    ⚔️
                  </div>
                  <div className="flex flex-col gap-2 max-w-lg">
                    <h2
                      className="text-xl md:text-2xl font-black text-white"
                      style={theme !== 'classic' ? { fontFamily: "'Cinzel', serif" } : undefined}
                    >
                      Team-vs-Team Battle Arena
                    </h2>
                    <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                      Forge or join a 4-player squad to challenge rival teams directly. Both squads duel independently on identical coding questions, earning match-local Combat Points. The squad with the higher average score claims victory and captures enemy turf!
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl text-xs font-mono pt-2">
                    <div className="p-3 rounded-xl bg-black/40 border border-slate-800 flex flex-col items-center gap-1">
                      <span className="text-rose-400 font-bold">1. Challenge Squads</span>
                      <span className="text-[10px] text-slate-400 text-center">Search & dispatch direct match duels</span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-slate-800 flex flex-col items-center gap-1">
                      <span className="text-amber-400 font-bold">2. Independent Solves</span>
                      <span className="text-[10px] text-slate-400 text-center">Personal Monaco workspace, 100 CP per quest</span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-slate-800 flex flex-col items-center gap-1">
                      <span className="text-emerald-400 font-bold">3. Turf Capture</span>
                      <span className="text-[10px] text-slate-400 text-center">Higher team average captures enemy turf</span>
                    </div>
                  </div>
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
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500">
                            {members.length} / 4 Members
                          </span>
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            🏰 {team.turf_count ?? 1} Turf
                          </span>
                        </div>
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



      {/* ── TEAM MATCH LOBBY MODAL ── */}
      {activeTeamMatch && (
        <TeamMatchLobbyModal
          match={activeTeamMatch}
          currentTeamId={team?.id}
          userId={user?.id}
          onClose={() => setActiveTeamMatch(null)}
        />
      )}
    </div>
  )
}
