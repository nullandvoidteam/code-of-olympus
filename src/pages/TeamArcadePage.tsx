import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import {
  useTeamArcade,
  type ArcadeTeamMatch,
} from '../lib/arcade'
import { ClanProfileCard } from '../components/crucible/RagnarokFestLobby'
import { TeamChallengeSection } from '../components/arcade/TeamChallengeSection'
import { TeamMatchLobbyModal } from '../components/arcade/TeamMatchLobbyModal'
import { C } from '../components/crucible/crucibleTokens'
import confetti from 'canvas-confetti'
import {
  Swords, Users, UserPlus, LogOut, AlertCircle,
  Copy, Shield, Gamepad2
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { SpiderNetDecal, SpiderEmblemIcon } from '../components/ui/SpiderNetDecal'
import { SpiderMaskSticker, ThwipSticker, SpiderSenseSticker, FriendlyNeighborhoodBadge } from '../components/ui/SpiderStickers'

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
  if (teamLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-32 gap-4" style={{ color: C.textPrimary }}>
        <div className="text-4xl animate-pulse" style={{ fontFamily: "'Cinzel Decorative', serif", color: C.crimson }}>⚔</div>
        <div className="text-[11px] uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif", color: C.textSecondary }}>
          Summoning the Arena…
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-8 flex flex-col gap-10" style={{ color: C.textPrimary }}>
      {/* ── 1. HERO BANNER WITH SHADED ANIMATION & CARTOONISH IMAGE ── */}
      {theme === 'classic' ? (
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 bg-gradient-to-r from-[#064E3B] via-[#047857] to-[#022C22] text-white shadow-xl border border-emerald-800/50 flex flex-col md:flex-row items-center justify-between gap-8 animate-shade-sweep">
          {/* Shaded Ambient Glow Overlays */}
          <div className="absolute -right-16 -top-16 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none animate-shade-glow" />
          <div className="absolute left-1/3 bottom-0 w-80 h-40 bg-teal-500/15 blur-2xl pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5 pointer-events-none" />

          {/* Left Text Column */}
          <div className="relative z-10 flex flex-col gap-3 max-w-xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 shadow-sm backdrop-blur-md">
              <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>TEAM ARCADE • SQUAD CHALLENGE ARENA</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-sm font-pixel">
              Squad Challenge Arena
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
              Form 4-player squads, challenge rival teams to real-time coding duels, and conquer quests together to capture enemy turf.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Squad Battles
              </span>
            </div>
          </div>

          {/* Right Cartoonish Mascot Column */}
          <div className="relative z-10 shrink-0 flex items-center justify-center">
            <div className="relative animate-cartoon-float">
              <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-xl scale-95" />
              <img
                src="/questbot.png"
                alt="Arcade Battle Bot"
                className="w-44 sm:w-56 md:w-64 h-auto object-contain relative z-10 drop-shadow-[0_16px_28px_rgba(0,0,0,0.5)] transition-transform hover:scale-105"
              />
              <div className="absolute -bottom-2 -right-2 bg-emerald-900/90 border border-emerald-400/60 p-2 rounded-2xl shadow-lg backdrop-blur-sm flex items-center gap-1.5 z-20">
                <img src="/extracted/icon_gamepad.png" alt="" className="w-5 h-5 object-contain" />
                <span className="text-[10px] font-pixel font-bold text-emerald-200">READY</span>
              </div>
            </div>
          </div>
        </div>
      ) : theme === 'spiderman' ? (
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 border-2 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 animate-spider-banner">
          {/* Animated Ambient Glow Overlays */}
          <div className="absolute right-12 top-0 w-96 h-96 rounded-full bg-red-600/30 blur-3xl pointer-events-none animate-shade-glow" />
          <div className="absolute left-1/4 bottom-0 w-80 h-36 bg-blue-600/25 blur-2xl pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent" />

          {/* Corner Spider Web Nets */}
          <SpiderNetDecal position="top-right" size={130} glow={true} />
          <SpiderNetDecal position="bottom-left" size={100} glow={true} />

          {/* Left Text Column */}
          <div className="relative z-10 flex flex-col gap-4 max-w-xl text-left">
            <div className="flex items-center gap-2">
              <FriendlyNeighborhoodBadge />
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase drop-shadow-md">
              Spider-Verse Arcade
            </h1>
            <p className="text-xs sm:text-sm leading-relaxed text-blue-100 font-medium">
              Form 4-player web warrior squads, sling code in real-time multiverse duels, and defend Queens from bugs alongside Peter Parker.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="px-3 py-1 rounded-xl bg-blue-950/70 border border-blue-400/40 text-blue-200 text-xs font-mono font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Live Squad Battles Active
              </span>
              <ThwipSticker size={42} />
            </div>
          </div>

          {/* Right Cartoonish Mascot Column with Spider Stickers */}
          <div className="relative z-10 shrink-0 flex items-center justify-center">
            <div className="relative animate-cartoon-float">
              <div className="absolute inset-0 rounded-full bg-red-500/35 blur-2xl scale-95" />
              <img
                src="/questbot.png"
                alt="Spider-Bot Arcade Mascot"
                className="w-44 sm:w-56 md:w-64 h-auto object-contain relative z-10 drop-shadow-[0_16px_32px_rgba(230,36,41,0.5)] transition-transform hover:scale-105"
              />
              {/* Spider Mask Sticker badge on mascot */}
              <div className="absolute -top-3 -right-2 z-20">
                <SpiderMaskSticker size={52} glow={true} />
              </div>
              <div className="absolute -bottom-2 -left-2 px-3 py-1 rounded-xl shadow-lg border backdrop-blur-md flex items-center gap-1.5 z-20 bg-slate-900/90 border-cyan-400/60">
                <span className="text-[10px] font-black tracking-widest text-cyan-300 font-mono">
                  WEB SQUAD READY
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 border-2 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 animate-shade-sweep"
          style={{
            background: 'linear-gradient(135deg, rgba(30,12,12,0.98) 0%, rgba(20,8,8,0.98) 50%, rgba(10,4,4,0.98) 100%)',
            borderColor: C.borderHot,
            boxShadow: `0 0 40px rgba(220,38,38,0.2) inset, 0 12px 36px rgba(0,0,0,0.85)`,
          }}
        >
          {/* Shaded Ambient Glow Overlays */}
          <div className="absolute right-12 top-0 w-96 h-96 rounded-full bg-red-600/25 blur-3xl pointer-events-none animate-shade-glow" />
          <div className="absolute left-1/4 bottom-0 w-80 h-36 bg-orange-600/15 blur-2xl pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF3D00] to-transparent" />
          <div className="absolute -bottom-6 right-1/3 text-[140px] font-serif font-black text-red-950/20 pointer-events-none select-none leading-none">
            Ω
          </div>

          {/* Left Text Column */}
          <div className="relative z-10 flex flex-col gap-4 max-w-xl text-left">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest w-fit shadow-md"
              style={{ fontFamily: "'Cinzel', serif", background: C.crimsonDim, color: C.crimson, border: `1px solid ${C.borderHot}` }}
            >
              <Swords className="w-3.5 h-3.5 text-red-400" />
              <span>THE BLOOD ARENA • SQUAD COMBAT</span>
            </div>
            <h1
              className="text-3xl md:text-5xl font-black text-[#F5E8E8] tracking-wider uppercase"
              style={{ fontFamily: "'Cinzel Decorative', serif", textShadow: '0 2px 20px rgba(220,38,38,0.5)' }}
            >
              Prove Your Valor
            </h1>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: C.textSecondary }}>
              Forge a war clan and spill blood in real-time competitive duels. Only the strong survive the Crucible.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span
                className="px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-2 border"
                style={{ background: 'rgba(30,14,14,0.8)', borderColor: C.border, color: C.goldBright }}
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Ranked Arena Duels Active
              </span>
            </div>
          </div>

          {/* Right Cartoonish Mascot Column */}
          <div className="relative z-10 shrink-0 flex items-center justify-center">
            <div className="relative animate-cartoon-float">
              <div className="absolute inset-0 rounded-full bg-red-600/30 blur-2xl scale-95" />
              <img
                src="/questbot.png"
                alt="Crucible Combat Bot"
                className="w-44 sm:w-56 md:w-64 h-auto object-contain relative z-10 drop-shadow-[0_16px_32px_rgba(220,38,38,0.45)] transition-transform hover:scale-105"
              />
              <div
                className="absolute -bottom-2 -left-2 px-3 py-1 rounded-xl shadow-lg border backdrop-blur-md flex items-center gap-1.5 z-20"
                style={{ background: 'rgba(14,6,6,0.92)', borderColor: C.borderHot }}
              >
                <span className="text-[10px] font-black tracking-widest text-amber-400" style={{ fontFamily: "'Cinzel', serif" }}>
                  CLAN DUELS
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── LEFT: SQUAD CHALLENGE ARENA ── */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Header */}
          {theme === 'classic' ? (
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl font-pixel text-xs tracking-wider flex items-center gap-2 bg-purple-600 text-white shadow-sm">
                <Swords className="w-3.5 h-3.5" />
                <span>SQUAD BATTLES</span>
              </div>
            </div>
          ) : (
            <div className="flex gap-0" style={{ borderBottom: `1px solid ${C.border}` }}>
              <div className="relative px-6 py-3 text-[11px] uppercase font-bold tracking-widest flex items-center gap-2"
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: C.crimson,
                  borderBottom: `2px solid ${C.crimson}`,
                }}>
                <Swords className="w-4 h-4" /> Squad Battle Arena
              </div>
            </div>
          )}

          {/* ── DIRECT TEAM DUELS / SQUAD CHALLENGES ── */}
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
                      Create or join a 4-player team to compete in squad challenges together.
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
                    <p className="text-xs mt-1" style={{ color: C.textSecondary }}>You must swear allegiance to a clan before entering squad battles.</p>
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
