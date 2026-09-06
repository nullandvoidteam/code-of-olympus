import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import {
  useTeamArcade,
  type ArcadeTeamMatch,
} from '../lib/arcade'
import { TeamChallengeSection } from '../components/arcade/TeamChallengeSection'
import { TeamMatchLobbyModal } from '../components/arcade/TeamMatchLobbyModal'
import confetti from 'canvas-confetti'
import {
  Swords, Users, UserPlus, LogOut, AlertCircle,
  Copy, Shield, Gamepad2, Sparkles, Flame, Trophy, Zap,
  CheckCircle2, ArrowRight
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { SpiderNetDecal } from '../components/ui/SpiderNetDecal'
import { SpiderMaskSticker, ThwipSticker, FriendlyNeighborhoodBadge } from '../components/ui/SpiderStickers'

export const TeamArcadePage: React.FC = () => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const {
    team,
    members,
    loading: teamLoading,
    isCaptain,
    createTeamAction,
    joinTeamAction,
    leaveTeamAction,
  } = useTeamArcade(user?.id)

  const [activeTeamMatch, setActiveTeamMatch] = useState<ArcadeTeamMatch | null>(null)

  const [teamNameInput, setTeamNameInput] = useState('')
  const [teamCodeInput, setTeamCodeInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  const isSpiderman = theme === 'spiderman'
  const isGow = theme === 'gow'
  const isDefaultGamified = !isSpiderman && !isGow // Classic / Default Gamified White Theme

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(true)
      toast.success('Squad Code copied to clipboard! 📋')
      setTimeout(() => setCopiedCode(false), 2500)
    } catch {
      toast.error('Failed to copy code.')
    }
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError(null)

    const trimmed = teamNameInput.trim()
    if (trimmed.length < 2) return setActionError('Squad name must be at least 2 characters.')
    if (trimmed.length > 50) return setActionError('Squad name must be 50 characters or less.')

    setIsSubmitting(true)
    const result = await createTeamAction(trimmed)
    setIsSubmitting(false)

    if (!result.success) {
      setActionError(result.error || 'Failed to create squad.')
      toast.error(result.error || 'Failed to create squad.')
    } else {
      setTeamNameInput('')
      toast.success(`Squad "${result.team_name}" created! 🛡️`)
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 }, colors: ['#10B981', '#6366F1', '#F59E0B'] })
    }
  }

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError(null)

    const cleanCode = teamCodeInput.trim().toUpperCase()
    if (cleanCode.length !== 6) return setActionError('Squad code must be exactly 6 characters.')

    setIsSubmitting(true)
    const result = await joinTeamAction(cleanCode)
    setIsSubmitting(false)

    if (!result.success) {
      setActionError(result.error || 'Failed to join squad.')
      toast.error(result.error || 'Failed to join squad.')
    } else {
      setTeamCodeInput('')
      toast.success(`Joined squad "${result.team_name}"! ⚔️`)
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 }, colors: ['#10B981', '#3B82F6', '#8B5CF6'] })
    }
  }

  const handleLeaveTeam = async () => {
    setIsSubmitting(true)
    const result = await leaveTeamAction()
    setIsSubmitting(false)
    setShowLeaveConfirm(false)

    if (!result.success) {
      toast.error(result.error || 'Failed to leave squad.')
    } else {
      toast.success('You have left the squad.')
    }
  }

  // Loading state
  if (teamLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-32 gap-4">
        <div className="text-4xl animate-bounce">🎮</div>
        <div className="text-xs uppercase tracking-widest font-black text-emerald-600 font-hud">
          Loading Squad Arcade…
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8 text-left animate-in fade-in duration-300">
      {/* ── 1. HERO BANNER: DEFAULT GAMIFIED VIBRANT WHITE THEME ── */}
      {isSpiderman ? (
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 border-2 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 animate-spider-banner"
          style={{
            background: 'linear-gradient(135deg, rgba(12, 18, 42, 0.98) 0%, rgba(18, 26, 60, 0.95) 50%, rgba(8, 12, 30, 0.98) 100%)',
            borderColor: 'rgba(0, 240, 255, 0.45)',
            boxShadow: '0 0 50px rgba(0, 240, 255, 0.18), 0 16px 40px rgba(0,0,0,0.85)',
          }}
        >
          <div className="absolute right-12 top-0 w-96 h-96 rounded-full bg-red-600/30 blur-3xl pointer-events-none" />
          <SpiderNetDecal position="top-right" size={130} glow={true} />
          <div className="relative z-10 flex flex-col gap-4 max-w-xl text-left">
            <FriendlyNeighborhoodBadge />
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase gamified-shaky-title">
              Spider-Verse Arcade
            </h1>
            <p className="text-xs sm:text-sm leading-relaxed text-blue-100 font-medium">
              Form 4-player web warrior squads and sling code in real-time multiverse duels.
            </p>
          </div>
        </div>
      ) : isGow ? (
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 border-2 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8"
          style={{
            background: 'linear-gradient(135deg, rgba(35,12,12,0.98) 0%, rgba(22,8,8,0.98) 50%, rgba(12,4,4,0.98) 100%)',
            borderColor: 'rgba(220, 38, 38, 0.65)',
          }}
        >
          <div className="relative z-10 flex flex-col gap-4 max-w-xl text-left">
            <h1 className="text-3xl md:text-5xl font-black text-[#F5E8E8] tracking-wider uppercase font-cinzel gamified-shaky-title">
              Prove Your Valor
            </h1>
            <p className="text-xs sm:text-sm leading-relaxed text-stone-300 font-medium">
              Forge a war clan and spill blood in real-time competitive duels.
            </p>
          </div>
        </div>
      ) : (
        /* ── VIBRANT GAMIFIED WHITE THEME BANNER (Rich, colorful, highly engaging) ── */
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10 border-2 border-emerald-300/80 shadow-[0_12px_40px_rgba(16,185,129,0.15)] flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-emerald-50/90 via-teal-50/60 to-purple-50/80">
          {/* Subtle Ambient Gamer Pattern */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-25">
            <img
              src="/extracted/team_arcade_art.jpg"
              alt="Team Arcade Art"
              className="w-full h-full object-cover mix-blend-multiply"
            />
          </div>

          {/* Left Text Column with Rich Gamified Tokens */}
          <div className="relative z-10 flex flex-col gap-3.5 max-w-xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider w-fit bg-white/95 border-2 border-emerald-400 text-emerald-700 shadow-sm backdrop-blur-md">
              <Gamepad2 className="w-4 h-4 text-emerald-600" />
              <span>SQUAD ARCADE • LIVE BATTLE ARENA</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight gamified-shaky-title">
              Squad Challenge Arena
            </h1>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold">
              Form 4-player squads, challenge rival teams to real-time coding duels, and conquer algorithmic trials together to capture enemy turf!
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="px-3 py-1 rounded-xl bg-emerald-500 text-white text-xs font-black font-mono flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Live Squad Battles
              </span>

              <span className="px-3 py-1 rounded-xl bg-purple-100 border border-purple-300 text-purple-800 text-xs font-black font-mono flex items-center gap-1.5 shadow-2xs">
                <Users className="w-3.5 h-3.5 text-purple-600" /> 4-Player Co-op
              </span>

              <span className="px-3 py-1 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 text-xs font-black font-mono flex items-center gap-1.5 shadow-2xs">
                <Trophy className="w-3.5 h-3.5 text-amber-600" /> Turf Domination
              </span>
            </div>
          </div>

          {/* Right Mascot Artwork */}
          <div className="relative z-10 shrink-0 hidden sm:flex items-center justify-center">
            <div className="relative animate-bounce duration-1000">
              <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-2xl scale-95" />
              <img
                src="/questbot.png"
                alt="Arcade Mascot"
                className="w-40 sm:w-48 md:w-56 h-auto object-contain relative z-10 drop-shadow-[0_16px_28px_rgba(16,185,129,0.35)] transition-transform hover:scale-105"
              />
              <div className="absolute -bottom-2 -left-2 px-3 py-1 rounded-xl shadow-md border-2 border-emerald-400 bg-white flex items-center gap-1.5 z-20">
                <span className="text-[11px] font-black tracking-widest text-emerald-700 font-mono">
                  SQUAD READY 🔥
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. MAIN 2-COLUMN GRID (8 COLS LEFT / 4 COLS RIGHT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── LEFT COLUMN (8 Cols): DUEL MATCHES & SQUAD BATTLES ── */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Section Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
                <Swords className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Squad Battle Duels
                </h2>
                <p className="text-xs text-slate-500 font-medium">Head-to-head live algorithm matches</p>
              </div>
            </div>

            {team && (
              <span className="px-3 py-1 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black font-mono shadow-2xs">
                {team.name}
              </span>
            )}
          </div>

          {/* Squad Challenges Area */}
          <div className="flex flex-col gap-6">
            {team ? (
              <TeamChallengeSection
                team={team}
                isCaptain={isCaptain}
                userId={user?.id}
                onEnterMatch={(match) => setActiveTeamMatch(match)}
              />
            ) : (
              /* Rich Gamified White Theme Empty State (Vivid, Colorful, Non-Boring) */
              <div className="rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center gap-6 bg-white border-2 border-purple-300/80 shadow-[0_12px_40px_rgba(147,51,234,0.08)]">
                <div className="w-18 h-18 rounded-3xl bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 text-white flex items-center justify-center text-3xl shadow-[0_8px_25px_rgba(99,102,241,0.35)] border-2 border-white">
                  ⚔️
                </div>

                <div className="flex flex-col gap-2 max-w-xl">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Team-vs-Team Battle Arena
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
                    Create or join a 4-player squad on the right panel to challenge rival teams directly. Both squads duel independently on identical coding questions, earning match-local Combat Points. The squad with the higher average score claims victory and captures enemy turf!
                  </p>
                </div>

                {/* 3 Distinct Colorful Gamified Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl pt-2">
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-rose-50 to-white border-2 border-rose-200 flex flex-col items-center gap-1.5 shadow-xs transition-transform hover:-translate-y-1">
                    <span className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center text-xs font-black shadow-sm">
                      1
                    </span>
                    <span className="text-rose-700 font-black text-xs">Challenge Squads</span>
                    <span className="text-[11px] text-slate-600 text-center font-medium">
                      Search active teams & dispatch direct match duels
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-50 to-white border-2 border-amber-200 flex flex-col items-center gap-1.5 shadow-xs transition-transform hover:-translate-y-1">
                    <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xs font-black shadow-sm">
                      2
                    </span>
                    <span className="text-amber-700 font-black text-xs">Real-Time Solves</span>
                    <span className="text-[11px] text-slate-600 text-center font-medium">
                      Independent IDE workspace, 100 CP per quest
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-200 flex flex-col items-center gap-1.5 shadow-xs transition-transform hover:-translate-y-1">
                    <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-sm">
                      3
                    </span>
                    <span className="text-emerald-700 font-black text-xs">Turf Conquest</span>
                    <span className="text-[11px] text-slate-600 text-center font-medium">
                      Higher team score captures opponent territory
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN (4 Cols): SQUAD MANAGEMENT / RECRUITMENT ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex items-center gap-2 pb-3 border-b-2 border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs border border-emerald-300">
              🛡️
            </div>
            <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
              {team ? 'Your Battle Squad' : 'Squad Operations'}
            </h2>
          </div>

          {team ? (
            <div className="flex flex-col gap-4">
              {/* Vibrant Gamified Active Squad Card */}
              <div className="bg-white rounded-3xl p-6 border-2 border-emerald-400 shadow-[0_10px_35px_rgba(16,185,129,0.12)] flex flex-col gap-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-white flex items-center justify-center text-2xl font-black shrink-0 shadow-md border-2 border-white">
                    {team.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Active Squad
                      </span>
                      {isCaptain && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black uppercase">
                          👑 Captain
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-lg text-slate-900 truncate mt-0.5">
                      {team.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-600 font-bold font-mono">
                        {members.length} / 4 Members
                      </span>
                      <span className="text-xs font-black text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200">
                        🏰 {team.turf_count ?? 1} Turf
                      </span>
                    </div>
                  </div>
                </div>

                {/* Squad Roster */}
                <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Squad Roster</span>
                  </span>
                  <div className="flex flex-col gap-2">
                    {members.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 transition-all text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                            {((m.profile?.username || m.profile?.full_name || 'M')[0]).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-800 truncate">
                            {m.profile?.username || m.profile?.full_name || 'Squad Mate'}
                          </span>
                        </div>
                        {m.role === 'captain' && (
                          <span className="text-[9px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                            Captain
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Squad Invite Code & Directives */}
                <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                    Squad Invite Code
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(team.code)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-2 border-emerald-300 text-xs font-mono font-bold text-emerald-950 transition-all cursor-pointer shadow-xs"
                  >
                    <span className="text-emerald-700 font-sans text-xs font-bold">Invite Code:</span>
                    <span className="text-emerald-900 font-black tracking-widest text-sm">{team.code}</span>
                    <Copy className="w-4 h-4 text-emerald-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLeaveConfirm(true)}
                    className="w-full py-2.5 text-xs font-extrabold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-2xl transition-colors cursor-pointer text-center border border-rose-200"
                  >
                    Leave Squad
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Vibrant Gamified Squad Recruitment Card */
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-indigo-200/90 shadow-[0_12px_40px_rgba(99,102,241,0.1)] flex flex-col gap-6">
              <div className="text-center pb-4 border-b border-slate-100">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center text-2xl shadow-md border-2 border-white">
                  👥
                </div>
                <h3 className="font-black text-lg text-slate-900 tracking-tight">
                  Squad Up for Battle
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed font-semibold">
                  Create or join a 4-player team to duel rival squads and capture territory together.
                </p>
              </div>

              {actionError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span className="font-bold">{actionError}</span>
                </div>
              )}

              {/* Form 1: Create Squad */}
              <form onSubmit={handleCreateTeam} className="flex flex-col gap-3 pb-5 border-b border-slate-100">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Create a Squad</span>
                </span>
                <input
                  type="text"
                  placeholder="Squad Name (e.g. Byte Brawlers)"
                  value={teamNameInput}
                  onChange={(e) => setTeamNameInput(e.target.value)}
                  className="w-full text-xs px-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white shadow-inner transition-all"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !teamNameInput.trim()}
                  className="btn-gamified-3d btn-gamified-3d-primary w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-emerald-500 hover:bg-emerald-400 border-2 border-emerald-600 shadow-[0_4px_0_#065f46] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  <span>Create Squad</span>
                  <Users className="w-4 h-4" />
                </button>
              </form>

              {/* Form 2: Join Squad with Invite Code */}
              <form onSubmit={handleJoinTeam} className="flex flex-col gap-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Join with Invite Code</span>
                </span>
                <input
                  type="text"
                  placeholder="6-Letter Code"
                  value={teamCodeInput}
                  onChange={(e) => setTeamCodeInput(e.target.value)}
                  maxLength={6}
                  className="w-full text-xs px-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-mono font-black uppercase tracking-widest placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal focus:outline-none focus:border-indigo-500 focus:bg-white shadow-inner transition-all"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || teamCodeInput.length !== 6}
                  className="btn-gamified-3d btn-gamified-3d-secondary w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 border-2 border-indigo-700 shadow-[0_4px_0_#3730a3] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  <span>Join Squad</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ── LEAVE SQUAD CONFIRM MODAL ── */}
      {showLeaveConfirm && team && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm flex flex-col p-6 gap-4 border-2 border-rose-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0 text-rose-500" />
              <h3 className="font-black text-lg text-slate-900">Leave Squad?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
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
