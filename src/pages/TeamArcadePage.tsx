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
              className="w-full h-full object-contain mix-blend-multiply"
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
          <div
            className={`flex items-center justify-between pb-3 border-b-2 ${
              isGow ? 'border-red-950/80' : isSpiderman ? 'border-cyan-900/60' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md border ${
                  isGow
                    ? 'bg-gradient-to-br from-red-700 to-amber-600 text-white border-amber-400/40 shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                    : isSpiderman
                    ? 'bg-cyan-400 text-slate-950 border-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-300'
                }`}
              >
                <Swords className="w-5 h-5" />
              </div>
              <div>
                <h2
                  className={`text-lg font-black tracking-tight ${
                    isGow ? 'text-[#F5E8E8] font-cinzel uppercase' : isSpiderman ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {isGow ? 'War Clan Battles' : 'Squad Battle Duels'}
                </h2>
                <p
                  className={`text-xs font-medium ${
                    isGow ? 'text-stone-400' : isSpiderman ? 'text-blue-200/70' : 'text-slate-500'
                  }`}
                >
                  {isGow ? 'Head-to-head live Crucible trials' : 'Head-to-head live algorithm matches'}
                </p>
              </div>
            </div>

            {team && (
              <span
                className={`px-3 py-1 rounded-xl text-xs font-black font-mono shadow-sm border ${
                  isGow
                    ? 'bg-[#250E0E] border-red-900/70 text-amber-300 font-cinzel'
                    : isSpiderman
                    ? 'bg-[#152552] border-cyan-500/40 text-cyan-300'
                    : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                }`}
              >
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
              /* Rich Themed Empty State */
              <div
                className={`rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center gap-6 border-2 transition-all shadow-xl ${
                  isGow
                    ? 'bg-gradient-to-b from-[#180A0A] to-[#0F0505] border-red-900/70 text-rose-100 shadow-[0_0_40px_rgba(220,38,38,0.25),0_15px_40px_rgba(0,0,0,0.85)]'
                    : isSpiderman
                    ? 'bg-gradient-to-b from-[#0E1632] to-[#080E24] border-cyan-400/60 text-white shadow-[0_0_35px_rgba(0,240,255,0.18)]'
                    : 'bg-white border-purple-300/80 shadow-[0_12px_40px_rgba(147,51,234,0.08)] text-slate-900'
                }`}
              >
                <div
                  className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl shadow-xl border-2 ${
                    isGow
                      ? 'bg-gradient-to-br from-red-700 via-rose-600 to-amber-600 text-white border-amber-400/50 shadow-[0_0_25px_rgba(220,38,38,0.5)]'
                      : isSpiderman
                      ? 'bg-cyan-400 text-slate-950 border-cyan-200 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                      : 'bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 text-white border-white shadow-[0_8px_25px_rgba(99,102,241,0.35)]'
                  }`}
                >
                  ⚔️
                </div>

                <div className="flex flex-col gap-2 max-w-xl">
                  <h2
                    className={`text-2xl sm:text-3xl font-black tracking-tight ${
                      isGow ? 'text-[#F5E8E8] font-cinzel uppercase' : isSpiderman ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {isGow ? 'Clan-vs-Clan Battle Grounds' : 'Team-vs-Team Battle Arena'}
                  </h2>
                  <p
                    className={`text-xs sm:text-sm leading-relaxed font-semibold ${
                      isGow ? 'text-stone-300' : isSpiderman ? 'text-blue-100/90' : 'text-slate-600'
                    }`}
                  >
                    {isGow
                      ? 'Form or join a 4-player war clan on the right panel to challenge rival squads directly. Duel on identical algorithm trials, earn match Combat Points, claim victory, and capture enemy turf!'
                      : 'Create or join a 4-player squad on the right panel to challenge rival teams directly. Both squads duel independently on identical coding questions, earning match-local Combat Points. The squad with the higher average score claims victory and captures enemy turf!'}
                  </p>
                </div>

                {/* 3 Distinct Themed Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl pt-2">
                  <div
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-1.5 shadow-sm transition-transform hover:-translate-y-1 ${
                      isGow
                        ? 'bg-[#1E0B0B] border-red-900/80 text-rose-100'
                        : isSpiderman
                        ? 'bg-[#0E1B40] border-cyan-500/50 text-white'
                        : 'bg-gradient-to-b from-rose-50 to-white border-rose-200'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${
                        isGow
                          ? 'bg-gradient-to-br from-red-600 to-amber-600 text-white font-cinzel'
                          : isSpiderman
                          ? 'bg-cyan-400 text-slate-950 font-black'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      1
                    </span>
                    <span
                      className={`font-black text-xs ${
                        isGow ? 'text-amber-400 font-cinzel' : isSpiderman ? 'text-cyan-300' : 'text-rose-700'
                      }`}
                    >
                      {isGow ? 'Declare Clan War' : 'Challenge Squads'}
                    </span>
                    <span
                      className={`text-[11px] text-center font-medium ${
                        isGow ? 'text-stone-400' : isSpiderman ? 'text-blue-200/80' : 'text-slate-600'
                      }`}
                    >
                      {isGow ? 'Search active war clans & dispatch battle writs' : 'Search active teams & dispatch direct match duels'}
                    </span>
                  </div>

                  <div
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-1.5 shadow-sm transition-transform hover:-translate-y-1 ${
                      isGow
                        ? 'bg-[#1E110A] border-amber-900/80 text-amber-100'
                        : isSpiderman
                        ? 'bg-[#12204D] border-blue-500/50 text-white'
                        : 'bg-gradient-to-b from-amber-50 to-white border-amber-200'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${
                        isGow
                          ? 'bg-amber-600 text-white font-cinzel'
                          : isSpiderman
                          ? 'bg-blue-500 text-white font-black'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      2
                    </span>
                    <span
                      className={`font-black text-xs ${
                        isGow ? 'text-amber-400 font-cinzel' : isSpiderman ? 'text-blue-300' : 'text-amber-700'
                      }`}
                    >
                      {isGow ? 'Trial Combat' : 'Real-Time Solves'}
                    </span>
                    <span
                      className={`text-[11px] text-center font-medium ${
                        isGow ? 'text-stone-400' : isSpiderman ? 'text-blue-200/80' : 'text-slate-600'
                      }`}
                    >
                      {isGow ? 'Independent coding forge, 100 CP per trial' : 'Independent IDE workspace, 100 CP per quest'}
                    </span>
                  </div>

                  <div
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-1.5 shadow-sm transition-transform hover:-translate-y-1 ${
                      isGow
                        ? 'bg-[#0E1C14] border-emerald-900/80 text-emerald-100'
                        : isSpiderman
                        ? 'bg-[#0E2838] border-teal-500/50 text-white'
                        : 'bg-gradient-to-b from-emerald-50 to-white border-emerald-200'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${
                        isGow
                          ? 'bg-emerald-600 text-white font-cinzel'
                          : isSpiderman
                          ? 'bg-teal-400 text-slate-950 font-black'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      3
                    </span>
                    <span
                      className={`font-black text-xs ${
                        isGow ? 'text-emerald-400 font-cinzel' : isSpiderman ? 'text-teal-300' : 'text-emerald-700'
                      }`}
                    >
                      {isGow ? 'Realm Domination' : 'Turf Conquest'}
                    </span>
                    <span
                      className={`text-[11px] text-center font-medium ${
                        isGow ? 'text-stone-400' : isSpiderman ? 'text-blue-200/80' : 'text-slate-600'
                      }`}
                    >
                      {isGow ? 'Higher clan score captures enemy territory' : 'Higher team score captures opponent territory'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN (4 Cols): SQUAD MANAGEMENT / RECRUITMENT ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div
            className={`flex items-center gap-2 pb-3 border-b-2 ${
              isGow ? 'border-red-950/80' : isSpiderman ? 'border-cyan-900/60' : 'border-slate-200'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs border ${
                isGow
                  ? 'bg-[#250E0E] text-amber-300 border-red-900/70'
                  : isSpiderman
                  ? 'bg-[#12204D] text-cyan-300 border-cyan-500/50'
                  : 'bg-emerald-100 text-emerald-700 border-emerald-300'
              }`}
            >
              🛡️
            </div>
            <h2
              className={`text-base font-black uppercase tracking-wider ${
                isGow ? 'text-[#F5E8E8] font-cinzel' : isSpiderman ? 'text-white' : 'text-slate-900'
              }`}
            >
              {team ? (isGow ? 'Your War Clan' : 'Your Battle Squad') : isGow ? 'War Operations' : 'Squad Operations'}
            </h2>
          </div>

          {team ? (
            <div className="flex flex-col gap-4">
              {/* Themed Active Squad Card */}
              <div
                className={`rounded-3xl p-6 border-2 flex flex-col gap-5 shadow-xl transition-all ${
                  isGow
                    ? 'bg-gradient-to-b from-[#180A0A] to-[#100505] border-red-700/70 text-rose-100 shadow-[0_0_35px_rgba(220,38,38,0.25)]'
                    : isSpiderman
                    ? 'bg-gradient-to-b from-[#0E1632] to-[#0A1026] border-cyan-400/60 text-white shadow-[0_0_30px_rgba(0,240,255,0.2)]'
                    : 'bg-white border-emerald-400 shadow-[0_10px_35px_rgba(16,185,129,0.12)]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 shadow-md border-2 ${
                      isGow
                        ? 'bg-gradient-to-br from-red-700 via-rose-600 to-amber-600 text-white border-amber-300/40 font-cinzel shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                        : isSpiderman
                        ? 'bg-cyan-400 text-slate-950 border-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                        : 'bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-white border-white'
                    }`}
                  >
                    {team.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          isGow
                            ? 'text-amber-300 bg-[#250E0E] border-red-900/60 font-cinzel'
                            : isSpiderman
                            ? 'text-cyan-300 bg-[#12204D] border-cyan-600/40'
                            : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        }`}
                      >
                        {isGow ? 'War Clan' : 'Active Squad'}
                      </span>
                      {isCaptain && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                            isGow
                              ? 'bg-amber-950/80 text-amber-300 border-amber-500/70 font-cinzel'
                              : isSpiderman
                              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/70'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          👑 Captain
                        </span>
                      )}
                    </div>
                    <h3
                      className={`font-black text-lg truncate mt-0.5 ${
                        isGow ? 'text-[#F5E8E8] font-cinzel' : isSpiderman ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {team.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs font-bold font-mono ${
                          isGow ? 'text-stone-300' : isSpiderman ? 'text-blue-200/80' : 'text-slate-600'
                        }`}
                      >
                        {members.length} / 4 {isGow ? 'Warriors' : 'Members'}
                      </span>
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                          isGow
                            ? 'bg-red-950/80 border-red-800/80 text-rose-200 font-cinzel'
                            : isSpiderman
                            ? 'bg-cyan-950/80 border-cyan-600/60 text-cyan-300'
                            : 'bg-purple-100 border-purple-200 text-purple-800'
                        }`}
                      >
                        🏰 {team.turf_count ?? 1} Turf
                      </span>
                    </div>
                  </div>
                </div>

                {/* Squad Roster */}
                <div
                  className={`flex flex-col gap-2 pt-3 border-t ${
                    isGow ? 'border-red-900/50' : isSpiderman ? 'border-cyan-900/50' : 'border-slate-100'
                  }`}
                >
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                      isGow ? 'text-amber-400 font-cinzel' : isSpiderman ? 'text-cyan-300' : 'text-slate-700'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{isGow ? 'Clan Warriors Roster' : 'Squad Roster'}</span>
                  </span>
                  <div className="flex flex-col gap-2">
                    {members.map((m) => (
                      <div
                        key={m.id}
                        className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all text-xs ${
                          isGow
                            ? 'bg-[#1C0D0D] border-red-950 hover:border-red-700/60 hover:bg-[#251010] text-rose-100'
                            : isSpiderman
                            ? 'bg-[#0D1836] border-blue-950 hover:border-cyan-400/50 hover:bg-[#12214A] text-white'
                            : 'bg-slate-50 hover:bg-emerald-50/60 border-slate-200 hover:border-emerald-300 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-full text-white font-black flex items-center justify-center text-xs shadow-xs ${
                              isGow
                                ? 'bg-gradient-to-br from-red-700 to-amber-600 font-cinzel'
                                : isSpiderman
                                ? 'bg-cyan-500 text-slate-950'
                                : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                            }`}
                          >
                            {((m.profile?.username || m.profile?.full_name || 'M')[0]).toUpperCase()}
                          </div>
                          <span className="font-bold truncate">
                            {m.profile?.username || m.profile?.full_name || 'Squad Mate'}
                          </span>
                        </div>
                        {m.role === 'captain' && (
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${
                              isGow
                                ? 'text-amber-300 bg-amber-950/80 border-amber-600/70 font-cinzel'
                                : isSpiderman
                                ? 'text-cyan-300 bg-cyan-950/80 border-cyan-500/70'
                                : 'text-amber-800 bg-amber-100 border-amber-300'
                            }`}
                          >
                            Captain
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Squad Invite Code & Directives */}
                <div
                  className={`flex flex-col gap-3 pt-3 border-t ${
                    isGow ? 'border-red-900/50' : isSpiderman ? 'border-cyan-900/50' : 'border-slate-100'
                  }`}
                >
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider ${
                      isGow ? 'text-amber-400 font-cinzel' : isSpiderman ? 'text-cyan-300' : 'text-slate-700'
                    }`}
                  >
                    {isGow ? 'Clan War Signal Code' : 'Squad Invite Code'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(team.code)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border-2 text-xs font-mono font-bold transition-all cursor-pointer shadow-md ${
                      isGow
                        ? 'bg-gradient-to-r from-[#220B0B] to-[#180808] border-red-600/70 hover:border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(220,38,38,0.2)] font-cinzel'
                        : isSpiderman
                        ? 'bg-gradient-to-r from-[#0C1530] to-[#0A1026] border-cyan-400/70 hover:border-cyan-300 text-cyan-200'
                        : 'bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-emerald-300 text-emerald-950'
                    }`}
                  >
                    <span className="font-sans text-xs font-bold">
                      {isGow ? 'Rune Code:' : 'Invite Code:'}
                    </span>
                    <span className="font-black tracking-widest text-sm">{team.code}</span>
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLeaveConfirm(true)}
                    className={`w-full py-2.5 text-xs font-extrabold rounded-2xl transition-colors cursor-pointer text-center border ${
                      isGow
                        ? 'text-red-400 hover:text-red-300 hover:bg-[#250C0C] border-red-950 font-cinzel'
                        : isSpiderman
                        ? 'text-rose-400 hover:text-rose-300 hover:bg-[#251020] border-rose-950'
                        : 'text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200'
                    }`}
                  >
                    {isGow ? 'Abandon Clan' : 'Leave Squad'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Themed Squad Recruitment Card */
            <div
              className={`rounded-3xl p-6 sm:p-7 border-2 flex flex-col gap-6 shadow-2xl transition-all ${
                isGow
                  ? 'bg-gradient-to-b from-[#180A0A] via-[#100505] to-[#180A0A] border-red-800/80 text-rose-100 shadow-[0_0_40px_rgba(220,38,38,0.25),0_15px_40px_rgba(0,0,0,0.85)]'
                  : isSpiderman
                  ? 'bg-gradient-to-b from-[#0E1632] to-[#080E24] border-cyan-400/60 text-white shadow-[0_0_35px_rgba(0,240,255,0.2)]'
                  : 'bg-white border-indigo-200/90 shadow-[0_12px_40px_rgba(99,102,241,0.1)] text-slate-900'
              }`}
            >
              <div
                className={`text-center pb-4 border-b ${
                  isGow ? 'border-red-900/60' : isSpiderman ? 'border-cyan-900/60' : 'border-slate-100'
                }`}
              >
                <div
                  className={`w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center text-2xl shadow-lg border-2 ${
                    isGow
                      ? 'bg-gradient-to-br from-red-700 via-rose-600 to-amber-600 text-white border-amber-300/40 shadow-[0_0_20px_rgba(220,38,38,0.5)] font-cinzel'
                      : isSpiderman
                      ? 'bg-cyan-400 text-slate-950 border-cyan-200 shadow-[0_0_18px_rgba(0,240,255,0.4)]'
                      : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white border-white'
                  }`}
                >
                  👥
                </div>
                <h3
                  className={`font-black text-lg tracking-tight ${
                    isGow ? 'text-[#F5E8E8] font-cinzel uppercase' : isSpiderman ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {isGow ? 'Forge a War Clan' : 'Squad Up for Battle'}
                </h3>
                <p
                  className={`text-xs mt-1 leading-relaxed font-semibold ${
                    isGow ? 'text-stone-300' : isSpiderman ? 'text-blue-200/80' : 'text-slate-600'
                  }`}
                >
                  {isGow
                    ? 'Create or join a 4-player clan to duel rival warriors and conquer enemy realms.'
                    : 'Create or join a 4-player team to duel rival squads and capture territory together.'}
                </p>
              </div>

              {actionError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span className="font-bold">{actionError}</span>
                </div>
              )}

              {/* Form 1: Create Squad */}
              <form
                onSubmit={handleCreateTeam}
                className={`flex flex-col gap-3 pb-5 border-b ${
                  isGow ? 'border-red-900/60' : isSpiderman ? 'border-cyan-900/60' : 'border-slate-100'
                }`}
              >
                <span
                  className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    isGow ? 'text-amber-400 font-cinzel' : isSpiderman ? 'text-cyan-300' : 'text-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGow ? 'Forge New War Clan' : 'Create a Squad'}</span>
                </span>
                <input
                  type="text"
                  placeholder={isGow ? 'Clan Name (e.g. Spartan Vanguard)' : 'Squad Name (e.g. Byte Brawlers)'}
                  value={teamNameInput}
                  onChange={(e) => setTeamNameInput(e.target.value)}
                  className={`w-full text-xs px-4 py-3 rounded-2xl border-2 font-bold focus:outline-none transition-all shadow-inner ${
                    isGow
                      ? 'bg-[#140606] border-red-950/90 text-rose-100 placeholder:text-stone-500 focus:border-red-500 focus:ring-2 focus:ring-red-600/20'
                      : isSpiderman
                      ? 'bg-[#0B132B] border-blue-950 text-cyan-100 placeholder:text-blue-300/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white'
                  }`}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !teamNameInput.trim()}
                  className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-md active:translate-y-0.5 ${
                    isGow
                      ? 'bg-gradient-to-r from-red-700 via-rose-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-cinzel border-2 border-amber-400 shadow-[0_4px_0_#7f1d1d,0_0_20px_rgba(220,38,38,0.4)]'
                      : isSpiderman
                      ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 border-2 border-cyan-200 shadow-[0_4px_0_#0891b2]'
                      : 'btn-gamified-3d btn-gamified-3d-primary text-white bg-emerald-500 hover:bg-emerald-400 border-2 border-emerald-600 shadow-[0_4px_0_#065f46]'
                  }`}
                >
                  <span>{isGow ? 'Forge Clan' : 'Create Squad'}</span>
                  <Users className="w-4 h-4" />
                </button>
              </form>

              {/* Form 2: Join Squad with Invite Code */}
              <form onSubmit={handleJoinTeam} className="flex flex-col gap-3">
                <span
                  className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    isGow ? 'text-amber-400 font-cinzel' : isSpiderman ? 'text-cyan-300' : 'text-slate-800'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isGow ? 'Join Clan with War Code' : 'Join with Invite Code'}</span>
                </span>
                <input
                  type="text"
                  placeholder="6-Letter Code"
                  value={teamCodeInput}
                  onChange={(e) => setTeamCodeInput(e.target.value)}
                  maxLength={6}
                  className={`w-full text-xs px-4 py-3 rounded-2xl border-2 font-mono font-black uppercase tracking-widest focus:outline-none transition-all shadow-inner ${
                    isGow
                      ? 'bg-[#140606] border-red-950/90 text-amber-300 placeholder:text-stone-500 placeholder:font-sans placeholder:tracking-normal focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                      : isSpiderman
                      ? 'bg-[#0B132B] border-blue-950 text-cyan-200 placeholder:text-blue-300/40 placeholder:font-sans placeholder:tracking-normal focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal focus:border-indigo-500 focus:bg-white'
                  }`}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || teamCodeInput.length !== 6}
                  className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-md active:translate-y-0.5 ${
                    isGow
                      ? 'bg-[#250E0E] hover:bg-[#381414] border-2 border-red-700/80 shadow-[0_4px_0_#4c1212] text-amber-300 font-cinzel'
                      : isSpiderman
                      ? 'bg-blue-600 hover:bg-blue-500 border-2 border-blue-400 shadow-[0_4px_0_#1e3a8a] text-white'
                      : 'btn-gamified-3d btn-gamified-3d-secondary text-white bg-indigo-600 hover:bg-indigo-500 border-2 border-indigo-700 shadow-[0_4px_0_#3730a3]'
                  }`}
                >
                  <span>{isGow ? 'Enter Clan' : 'Join Squad'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ── LEAVE SQUAD CONFIRM MODAL ── */}
      {showLeaveConfirm && team && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className={`w-full max-w-sm flex flex-col p-6 gap-4 rounded-3xl border-2 shadow-2xl ${
              isGow
                ? 'bg-gradient-to-b from-[#1C0A0A] to-[#100505] border-red-700 text-rose-100 shadow-[0_0_50px_rgba(220,38,38,0.5)]'
                : isSpiderman
                ? 'bg-[#0E1632] border-cyan-400 text-white shadow-[0_0_40px_rgba(0,240,255,0.3)]'
                : 'bg-white border-rose-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 text-rose-500">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3
                className={`font-black text-lg ${
                  isGow ? 'text-[#F5E8E8] font-cinzel' : isSpiderman ? 'text-white' : 'text-slate-900'
                }`}
              >
                {isGow ? 'Abandon Clan?' : 'Leave Squad?'}
              </h3>
            </div>
            <p
              className={`text-xs leading-relaxed font-semibold ${
                isGow ? 'text-stone-300' : isSpiderman ? 'text-blue-100' : 'text-slate-600'
              }`}
            >
              {isCaptain && members.length === 1
                ? isGow
                  ? 'You are the only warrior. Abandoning will dissolve this war clan.'
                  : 'You are the only member. Leaving will disband this squad.'
                : isGow
                ? 'You will require a war signal code from the clan captain to return.'
                : 'You will need an invite code from the captain to rejoin.'}
            </p>
            <div className="flex justify-end gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  isGow
                    ? 'bg-[#250E0E] text-stone-300 hover:bg-[#341313] border border-red-950 font-cinzel'
                    : isSpiderman
                    ? 'bg-[#15234A] text-blue-200 hover:bg-[#1E3269]'
                    : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                Stay
              </button>
              <button
                type="button"
                onClick={handleLeaveTeam}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50 ${
                  isGow
                    ? 'bg-red-700 hover:bg-red-600 font-cinzel border border-red-500 shadow-md'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isSubmitting ? 'Leaving...' : isGow ? 'Sever Bond' : 'Leave Squad'}
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
