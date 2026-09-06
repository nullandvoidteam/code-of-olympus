import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
  useTeamChallenges,
  type ArcadeTeam,
  type EligibleTeam,
  type ArcadeTeamMatch,
} from '../../lib/arcade'
import { useTheme } from '../../context/ThemeContext'
import {
  Swords,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Users,
  Shield,
  ArrowRight,
  Sparkles,
  Trophy,
  Flame,
  Crown,
  Zap,
} from 'lucide-react'

interface TeamChallengeSectionProps {
  team: ArcadeTeam
  isCaptain: boolean
  userId?: string
  onEnterMatch?: (match: ArcadeTeamMatch) => void
}

export const TeamChallengeSection: React.FC<TeamChallengeSectionProps> = ({
  team,
  isCaptain,
  userId,
  onEnterMatch,
}) => {
  const { theme } = useTheme()
  const isGow = theme === 'gow'
  const isSpiderman = theme === 'spiderman'
  const isGamified = !isGow && !isSpiderman

  const {
    incoming,
    outgoing,
    pendingIncomingCount,
    activeMatch,
    recentMatches,
    loading,
    sendChallenge,
    respondChallenge,
    searchTeams,
    checkPool,
  } = useTeamChallenges(team.id, userId)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<EligibleTeam[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedTargetTeam, setSelectedTargetTeam] = useState<EligibleTeam | null>(null)

  // Challenge settings
  const [language, setLanguage] = useState('javascript')
  const [difficulty, setDifficulty] = useState('Medium')
  const [questionCount, setQuestionCount] = useState(3)
  const [poolAvailable, setPoolAvailable] = useState<number | null>(null)
  const [isCheckingPool, setIsCheckingPool] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [respondingId, setRespondingId] = useState<string | null>(null)

  // Check pool availability whenever modal opens or language/difficulty changes
  useEffect(() => {
    if (!isModalOpen) return
    let active = true
    setIsCheckingPool(true)
    checkPool(language, difficulty)
      .then((res) => {
        if (active) {
          setPoolAvailable(res.available_count)
          setIsCheckingPool(false)
        }
      })
      .catch(() => {
        if (active) setIsCheckingPool(false)
      })
    return () => {
      active = false
    }
  }, [isModalOpen, language, difficulty, checkPool])

  // Debounced search
  useEffect(() => {
    if (!isModalOpen) return
    const timer = setTimeout(async () => {
      setIsSearching(true)
      const results = await searchTeams(searchQuery)
      setSearchResults(results)
      setIsSearching(false)
    }, 250)

    return () => clearTimeout(timer)
  }, [isModalOpen, searchQuery, searchTeams])

  const handleSendChallenge = async () => {
    if (!selectedTargetTeam) {
      toast.error('Select an opponent squad first.')
      return
    }

    if (poolAvailable !== null && poolAvailable < questionCount) {
      toast.error(
        `Insufficient questions in pool: only ${poolAvailable} available for ${difficulty} ${language}.`
      )
      return
    }

    setIsSubmitting(true)
    const res = await sendChallenge({
      challengedTeamId: selectedTargetTeam.id,
      language,
      difficulty,
      questionCount,
    })
    setIsSubmitting(false)

    if (!res.success) {
      toast.error(res.error || 'Failed to dispatch challenge.')
    } else {
      toast.success(
        isGow
          ? `War writ dispatched to clan ${selectedTargetTeam.name}! ⚔️🩸`
          : `Challenge dispatched to ${selectedTargetTeam.name}! ⚔️`
      )
      setSelectedTargetTeam(null)
      setIsModalOpen(false)
    }
  }

  const handleRespond = async (challengeId: string, action: 'accepted' | 'declined') => {
    setRespondingId(challengeId)
    const res = await respondChallenge(challengeId, action)
    setRespondingId(null)

    if (!res.success) {
      toast.error(res.error || `Failed to ${action} challenge.`)
    } else {
      if (action === 'accepted') {
        toast.success(
          isGow
            ? 'War accepted! Enter the Crucible Arena. ⚔️🔥'
            : 'Challenge Accepted! Match lobby prepared. ⚔️'
        )
        if (res.match && onEnterMatch) {
          onEnterMatch(res.match)
        }
      } else {
        toast.success(isGow ? 'War writ declined.' : 'Challenge declined.')
      }
    }
  }

  const pendingIncoming = incoming.filter((c) => c.status === 'pending')
  const pendingOutgoing = outgoing.filter((c) => c.status === 'pending')

  return (
    <div className="flex flex-col gap-5 text-left">
      {/* ── 1. ACTIVE SQUAD MATCH BANNER ── */}
      {activeMatch && (
        <div
          className={`p-5 sm:p-6 rounded-3xl flex flex-col gap-4 shadow-xl border-2 transition-all ${
            isGow
              ? 'bg-gradient-to-r from-[#240B0B] via-[#1A0808] to-[#2B0E0E] border-red-600/70 shadow-[0_0_35px_rgba(220,38,38,0.35)]'
              : isSpiderman
              ? 'bg-gradient-to-r from-[#0C122A] via-[#101938] to-[#0A0E24] border-cyan-400/60 shadow-[0_0_35px_rgba(0,240,255,0.22)]'
              : 'bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 border-purple-300 shadow-[0_10px_30px_rgba(168,85,247,0.15)]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${
                isGow
                  ? 'bg-gradient-to-r from-red-700 to-amber-600 text-white font-cinzel border border-amber-400/40 shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                  : isSpiderman
                  ? 'bg-cyan-400 text-slate-950 border border-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'bg-rose-500 text-white'
              }`}
            >
              <Swords className="w-3.5 h-3.5 animate-pulse" />
              <span>{isGow ? 'Active Clan War' : 'Active Duel Match'}</span>
            </span>
            <span
              className={`text-xs uppercase font-black tracking-widest px-3 py-1 rounded-xl font-mono border ${
                isGow
                  ? 'bg-[#150606] border-red-800/80 text-amber-300 shadow-inner'
                  : isSpiderman
                  ? 'bg-[#080D1F] border-cyan-500/40 text-cyan-300 shadow-inner'
                  : 'bg-white border-purple-200 text-purple-900 shadow-2xs'
              }`}
            >
              Status: {activeMatch.status}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 py-2">
            <div className="flex flex-col min-w-0">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isGow ? 'text-amber-400/80 font-cinzel' : isSpiderman ? 'text-cyan-300/80' : 'text-slate-500'
                }`}
              >
                {isGow ? 'Your War Clan' : 'Your Squad'}
              </span>
              <span
                className={`font-black text-base sm:text-lg truncate ${
                  isGow ? 'text-[#F5E8E8] font-cinzel' : isSpiderman ? 'text-white' : 'text-slate-900'
                }`}
              >
                {team.name}
              </span>
            </div>

            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-lg border ${
                isGow
                  ? 'bg-gradient-to-br from-red-600 to-amber-600 text-white border-amber-300/40 shadow-[0_0_20px_rgba(220,38,38,0.6)] font-cinzel'
                  : isSpiderman
                  ? 'bg-red-600 text-white border-cyan-400/40 shadow-[0_0_15px_rgba(239,68,68,0.6)]'
                  : 'bg-rose-500 text-white border-white'
              }`}
            >
              VS
            </div>

            <div className="flex flex-col items-end min-w-0">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isGow ? 'text-amber-400/80 font-cinzel' : isSpiderman ? 'text-cyan-300/80' : 'text-slate-500'
                }`}
              >
                {isGow ? 'Enemy Clan' : 'Opponent Squad'}
              </span>
              <span
                className={`font-black text-base sm:text-lg truncate ${
                  isGow ? 'text-[#F5E8E8] font-cinzel' : isSpiderman ? 'text-white' : 'text-slate-900'
                }`}
              >
                {activeMatch.team_a_id === team.id
                  ? activeMatch.team_b?.name || 'Rival Clan'
                  : activeMatch.team_a?.name || 'Rival Clan'}
              </span>
            </div>
          </div>

          <div
            className={`flex items-center justify-between text-xs pt-3 border-t font-medium ${
              isGow
                ? 'border-red-900/60 text-rose-200/90'
                : isSpiderman
                ? 'border-cyan-900/60 text-blue-100'
                : 'border-purple-200/60 text-slate-700'
            }`}
          >
            <span className="capitalize font-bold">
              {activeMatch.language} • {activeMatch.difficulty} • {activeMatch.question_count} Quests
            </span>
            {onEnterMatch && (
              <button
                type="button"
                onClick={() => onEnterMatch(activeMatch)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md ${
                  isGow
                    ? 'bg-gradient-to-r from-red-700 via-rose-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-cinzel border-2 border-red-400 shadow-[0_3px_0_#7f1d1d,0_0_15px_rgba(220,38,38,0.4)] active:translate-y-0.5'
                    : isSpiderman
                    ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 border-2 border-cyan-200 shadow-[0_3px_0_#0891b2] active:translate-y-0.5'
                    : 'bg-emerald-500 hover:bg-emerald-400 border-2 border-emerald-600 shadow-[0_3px_0_#065f46] text-white active:translate-y-0.5'
                }`}
              >
                <span>{isGow ? 'Enter Blood Arena' : 'Enter Duel'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── 2. INCOMING CHALLENGES ── */}
      {pendingIncoming.length > 0 && (
        <div className="flex flex-col gap-3">
          <div
            className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider ${
              isGow ? 'text-amber-400 font-cinzel' : isSpiderman ? 'text-cyan-400' : 'text-amber-600'
            }`}
          >
            {isGow ? (
              <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-500" />
            )}
            <span>
              {isGow ? 'Incoming War Writs' : 'Incoming Squad Challenges'} ({pendingIncoming.length})
            </span>
          </div>

          {pendingIncoming.map((chal) => (
            <div
              key={chal.id}
              className={`p-4 rounded-3xl border-2 flex flex-col gap-3 transition-all shadow-md ${
                isGow
                  ? 'border-amber-600/70 bg-gradient-to-r from-[#200D0D] to-[#150707] text-rose-100 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                  : isSpiderman
                  ? 'border-cyan-500/60 bg-gradient-to-r from-[#0E1736] to-[#0A1026] text-white shadow-[0_0_25px_rgba(0,240,255,0.18)]'
                  : 'border-amber-300 bg-amber-50/90 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield
                    className={`w-4 h-4 ${
                      isGow ? 'text-amber-400' : isSpiderman ? 'text-cyan-400' : 'text-amber-600'
                    }`}
                  />
                  <span
                    className={`font-black text-sm ${
                      isGow ? 'font-cinzel text-rose-100' : isSpiderman ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {chal.challenger_team?.name || 'Challenger Squad'}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      isGow
                        ? 'bg-[#2E1212] text-amber-300 border border-red-900/60'
                        : isSpiderman
                        ? 'bg-[#15234A] text-cyan-300 border border-cyan-600/40'
                        : 'bg-amber-200/70 text-amber-900'
                    }`}
                  >
                    {chal.challenger_team?.code}
                  </span>
                </div>
                <span
                  className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full ${
                    isGow
                      ? 'text-amber-300 bg-amber-950/70 border border-amber-600/50 font-cinzel'
                      : isSpiderman
                      ? 'text-cyan-300 bg-cyan-950/70 border border-cyan-500/50'
                      : 'text-amber-700 bg-amber-200/50'
                  }`}
                >
                  Pending Response
                </span>
              </div>

              <div
                className={`text-xs font-medium ${
                  isGow ? 'text-stone-300' : isSpiderman ? 'text-blue-200' : 'text-slate-600'
                }`}
              >
                Rules:{' '}
                <span
                  className={`font-bold capitalize ${
                    isGow ? 'text-amber-300' : isSpiderman ? 'text-cyan-300' : 'text-slate-900'
                  }`}
                >
                  {chal.language}
                </span>{' '}
                •{' '}
                <span
                  className={`font-bold ${
                    isGow ? 'text-rose-200' : isSpiderman ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {chal.difficulty}
                </span>{' '}
                •{' '}
                <span
                  className={`font-bold ${
                    isGow ? 'text-amber-300' : isSpiderman ? 'text-cyan-300' : 'text-slate-900'
                  }`}
                >
                  {chal.question_count} Questions
                </span>
              </div>

              <div
                className={`flex items-center gap-2.5 pt-2 border-t ${
                  isGow
                    ? 'border-red-900/50'
                    : isSpiderman
                    ? 'border-cyan-900/50'
                    : 'border-amber-200/60'
                }`}
              >
                <button
                  type="button"
                  disabled={respondingId === chal.id}
                  onClick={() => handleRespond(chal.id, 'accepted')}
                  className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 ${
                    isGow
                      ? 'bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-cinzel border-2 border-amber-400 shadow-[0_3px_0_#7f1d1d,0_0_15px_rgba(220,38,38,0.4)] active:translate-y-0.5'
                      : isSpiderman
                      ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black border-2 border-cyan-200 shadow-[0_3px_0_#0891b2] active:translate-y-0.5'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-white border-2 border-emerald-600 shadow-[0_3px_0_#065f46] active:translate-y-0.5'
                  }`}
                >
                  {respondingId === chal.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isGow ? 'Accept & Spill Blood' : 'Accept & Duel'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={respondingId === chal.id}
                  onClick={() => handleRespond(chal.id, 'declined')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-50 ${
                    isGow
                      ? 'text-rose-300 bg-[#250E0E] hover:bg-[#341313] border border-red-900/70 font-cinzel'
                      : isSpiderman
                      ? 'text-rose-300 bg-[#251020] hover:bg-[#351530] border border-rose-800/60'
                      : 'text-rose-700 bg-rose-100 hover:bg-rose-200 border border-rose-300'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Decline</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 3. OUTGOING PENDING CHALLENGES ── */}
      {pendingOutgoing.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <span
            className={`text-[11px] font-black uppercase tracking-wider ${
              isGow ? 'text-amber-400/80 font-cinzel' : isSpiderman ? 'text-cyan-300/80' : 'text-slate-500'
            }`}
          >
            {isGow ? 'Dispatched War Writs' : 'Dispatched Challenges'} ({pendingOutgoing.length})
          </span>
          {pendingOutgoing.map((chal) => (
            <div
              key={chal.id}
              className={`p-3.5 rounded-2xl border-2 flex items-center justify-between text-xs shadow-md ${
                isGow
                  ? 'border-red-950/80 bg-[#150707] text-rose-100 shadow-[0_0_15px_rgba(0,0,0,0.5)]'
                  : isSpiderman
                  ? 'border-cyan-900/60 bg-[#0C122A] text-white shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                  : 'border-purple-200 bg-white text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Clock className="w-4 h-4 text-amber-500 animate-spin" />
                <span
                  className={`font-bold truncate ${
                    isGow ? 'text-rose-100 font-cinzel' : isSpiderman ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  To: {chal.challenged_team?.name || 'Rival Clan'}
                </span>
                <span
                  className={`text-xs font-mono ${
                    isGow ? 'text-amber-300/80' : isSpiderman ? 'text-cyan-300/80' : 'text-slate-500'
                  }`}
                >
                  ({chal.language}, {chal.question_count}Q)
                </span>
              </div>
              <span
                className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border shrink-0 ${
                  isGow
                    ? 'text-amber-300 bg-amber-950/60 border-amber-700/60 font-cinzel'
                    : isSpiderman
                    ? 'text-cyan-300 bg-cyan-950/60 border-cyan-700/60'
                    : 'text-amber-600 bg-amber-50 border-amber-200'
                }`}
              >
                Awaiting Response
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── 4. CHALLENGE DISPATCH BUTTON ── */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg active:translate-y-1 ${
          isGow
            ? 'font-cinzel text-white bg-gradient-to-r from-red-700 via-rose-600 to-amber-600 hover:from-red-600 hover:to-amber-500 border-2 border-amber-400 shadow-[0_4px_0_#7f1d1d,0_0_25px_rgba(220,38,38,0.45)] hover:shadow-[0_2px_0_#7f1d1d,0_0_35px_rgba(220,38,38,0.65)]'
            : isSpiderman
            ? 'text-slate-950 bg-cyan-400 hover:bg-cyan-300 border-2 border-cyan-200 shadow-[0_4px_0_#0891b2,0_0_25px_rgba(0,240,255,0.4)]'
            : 'btn-gamified-3d btn-gamified-3d-primary text-white bg-purple-600 hover:bg-purple-500 border-2 border-purple-700 shadow-[0_4px_0_#4c1d95]'
        }`}
      >
        <Swords className="w-4 h-4" />
        <span>{isGow ? 'Challenge Rival War Clan' : 'Challenge Another Squad'}</span>
      </button>

      {/* ── 5. RECENT DUELS HISTORY ── */}
      {recentMatches && recentMatches.length > 0 && (
        <div
          className={`flex flex-col gap-3 pt-4 border-t-2 ${
            isGow ? 'border-red-950/80' : isSpiderman ? 'border-cyan-900/60' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                isGow ? 'text-amber-400 font-cinzel' : isSpiderman ? 'text-cyan-400' : 'text-slate-700'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>
                {isGow ? 'Chronicle of War' : 'Recent Completed Duels'} ({recentMatches.length})
              </span>
            </span>
            <span
              className={`text-[11px] font-mono ${
                isGow ? 'text-stone-400' : isSpiderman ? 'text-blue-300/70' : 'text-slate-400'
              }`}
            >
              Persisted Match State
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {recentMatches.map((m) => {
              const isTeamA = m.team_a_id === team.id
              const rival = isTeamA ? m.team_b : m.team_a
              const myScore = isTeamA ? m.team_a_score : m.team_b_score
              const rivalScore = isTeamA ? m.team_b_score : m.team_a_score
              const won = m.winner_team_id === team.id
              const draw = m.result_type === 'WE ARE SAFE' || !m.winner_team_id

              return (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-between text-xs transition-all shadow-md ${
                    isGow
                      ? 'border-red-950/80 bg-[#150707] hover:border-red-600/70 hover:bg-[#1E0A0A] text-rose-100'
                      : isSpiderman
                      ? 'border-cyan-900/60 bg-[#0C122A] hover:border-cyan-400/70 hover:bg-[#101838] text-white'
                      : 'border-slate-200 bg-white hover:border-purple-300 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-black text-sm truncate ${
                            isGow ? 'font-cinzel text-rose-100' : isSpiderman ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          vs {rival?.name || 'Rival Squad'}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${
                            isGow
                              ? won
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/70 font-cinzel font-black shadow-[0_0_10px_rgba(245,208,96,0.3)]'
                                : draw
                                ? 'bg-stone-900 text-stone-300 border border-stone-700 font-cinzel'
                                : 'bg-red-950/90 text-rose-300 border border-red-800/80 font-cinzel'
                              : isSpiderman
                              ? won
                                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/70 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                                : draw
                                ? 'bg-slate-900 text-slate-300 border border-slate-700'
                                : 'bg-red-950/90 text-rose-300 border border-red-800/80'
                              : won
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : draw
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {won ? 'KILLER COMBAT' : draw ? 'WE ARE SAFE' : 'TURF CAPTURED'}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] capitalize mt-0.5 font-medium ${
                          isGow ? 'text-stone-400' : isSpiderman ? 'text-blue-200/70' : 'text-slate-500'
                        }`}
                      >
                        {m.language} • {m.difficulty} • Score: {Number(myScore ?? 0).toFixed(1)} -{' '}
                        {Number(rivalScore ?? 0).toFixed(1)} CP avg
                      </span>
                    </div>
                  </div>

                  {onEnterMatch && (
                    <button
                      type="button"
                      onClick={() => onEnterMatch(m)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1 shadow-sm ${
                        isGow
                          ? 'text-amber-300 bg-[#240B0B] hover:bg-[#331010] border border-red-800/80 font-cinzel'
                          : isSpiderman
                          ? 'text-cyan-300 bg-[#101C42] hover:bg-[#16275C] border border-cyan-500/50'
                          : 'text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200'
                      }`}
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>{isGow ? 'View Spoils' : 'View Result'}</span>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 6. CHALLENGE SQUAD MODAL / SEARCH (THEMED, GAMIFIED, GOD OF WAR MODERN HIGH QUALITY) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`w-full max-w-lg rounded-3xl p-6 sm:p-7 flex flex-col gap-5 shadow-2xl border-2 relative overflow-hidden text-left ${
              isGow
                ? 'bg-gradient-to-b from-[#1A0A0A] via-[#100505] to-[#1C0B0B] border-red-700/80 text-rose-100 shadow-[0_0_60px_rgba(220,38,38,0.45),0_20px_50px_rgba(0,0,0,0.95)]'
                : isSpiderman
                ? 'bg-gradient-to-b from-[#0E1632] via-[#090F24] to-[#0D1530] border-cyan-400/70 text-white shadow-[0_0_50px_rgba(0,240,255,0.3),0_20px_50px_rgba(0,0,0,0.95)]'
                : 'bg-gradient-to-b from-white via-purple-50/30 to-white border-purple-400 text-slate-900 shadow-[0_20px_60px_rgba(147,51,234,0.2),0_10px_30px_rgba(0,0,0,0.1)]'
            }`}
          >
            {/* Ambient Background Glows */}
            {isGow ? (
              <>
                <div className="absolute top-0 right-0 w-72 h-72 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
              </>
            ) : isSpiderman ? (
              <>
                <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
              </>
            ) : (
              <>
                <div className="absolute top-0 right-0 w-72 h-72 bg-purple-400/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
              </>
            )}

            {/* Header */}
            <div
              className={`flex items-center justify-between pb-4 border-b relative z-10 ${
                isGow
                  ? 'border-red-900/60'
                  : isSpiderman
                  ? 'border-cyan-900/60'
                  : 'border-purple-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-md ${
                    isGow
                      ? 'bg-gradient-to-br from-red-700 to-amber-600 text-white border-amber-400/40 shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                      : isSpiderman
                      ? 'bg-cyan-400 text-slate-950 border-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                      : 'bg-purple-600 text-white border-purple-400'
                  }`}
                >
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    className={`font-black text-base sm:text-lg tracking-tight ${
                      isGow ? 'text-[#F5E8E8] font-cinzel uppercase' : isSpiderman ? 'text-white uppercase' : 'text-slate-900'
                    }`}
                  >
                    {isGow ? 'Declare War on Rival Clan' : 'Issue Squad Challenge'}
                  </h3>
                  <p
                    className={`text-[11px] font-medium ${
                      isGow ? 'text-stone-400' : isSpiderman ? 'text-blue-200/70' : 'text-slate-500'
                    }`}
                  >
                    {isGow
                      ? 'Select an enemy clan and dispatch real-time trial terms.'
                      : 'Select an opponent squad to battle in a live coding duel.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false)
                  setSelectedTargetTeam(null)
                }}
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold cursor-pointer transition-colors ${
                  isGow
                    ? 'bg-[#250D0D] hover:bg-[#381313] text-rose-300 border border-red-900/70'
                    : isSpiderman
                    ? 'bg-[#15234A] hover:bg-[#1E3269] text-cyan-300 border border-cyan-600/50'
                    : 'bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200'
                }`}
              >
                ✕
              </button>
            </div>

            {/* Target Squad Selection */}
            {!selectedTargetTeam ? (
              <div className="flex flex-col gap-3.5 relative z-10">
                <div className="relative">
                  <Search
                    className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      isGow ? 'text-red-400' : isSpiderman ? 'text-cyan-400' : 'text-purple-500'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Search active squads by name or 6-character code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-bold focus:outline-none transition-all shadow-inner border-2 ${
                      isGow
                        ? 'bg-[#140606] border-red-950/90 text-rose-100 placeholder:text-stone-500 focus:border-red-500 focus:ring-2 focus:ring-red-600/20'
                        : isSpiderman
                        ? 'bg-[#0B132B] border-blue-950 text-cyan-100 placeholder:text-blue-300/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                        : 'bg-white border-purple-200 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {isSearching ? (
                    <div
                      className={`py-8 flex items-center justify-center gap-2 text-xs ${
                        isGow ? 'text-stone-400' : isSpiderman ? 'text-blue-200' : 'text-slate-500'
                      }`}
                    >
                      <Loader2
                        className={`w-4 h-4 animate-spin ${
                          isGow ? 'text-red-500' : isSpiderman ? 'text-cyan-400' : 'text-purple-600'
                        }`}
                      />
                      <span>{isGow ? 'Locating enemy war clans…' : 'Searching active squads…'}</span>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div
                      className={`py-8 text-center text-xs font-medium rounded-2xl border-2 border-dashed p-4 ${
                        isGow
                          ? 'border-red-950/80 text-stone-400 bg-[#140606]/60 font-cinzel'
                          : isSpiderman
                          ? 'border-blue-950 text-blue-200/70 bg-[#0B132B]/60'
                          : 'border-purple-200 text-slate-500 bg-purple-50/40'
                      }`}
                    >
                      {searchQuery
                        ? 'No active squads found matching this battle search.'
                        : 'No other squads online yet. Tell rivals to join!'}
                    </div>
                  ) : (
                    searchResults.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTargetTeam(t)}
                        className={`p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all shadow-md ${
                          isGow
                            ? 'border-red-950/80 bg-[#160808] hover:border-red-600 hover:bg-[#220B0B] text-rose-100 shadow-[0_4px_15px_rgba(0,0,0,0.5)]'
                            : isSpiderman
                            ? 'border-cyan-900/60 bg-[#0D1836] hover:border-cyan-400 hover:bg-[#12214A] text-white shadow-[0_4px_15px_rgba(0,240,255,0.15)]'
                            : 'border-purple-200 bg-white hover:border-purple-400 hover:bg-purple-50/50 text-slate-900 shadow-sm'
                        }`}
                      >
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-black text-xs truncate ${
                                isGow ? 'font-cinzel text-rose-100' : isSpiderman ? 'text-white' : 'text-slate-900'
                              }`}
                            >
                              {t.name}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                                isGow
                                  ? 'bg-[#280F0F] text-amber-300 border-red-900/60'
                                  : isSpiderman
                                  ? 'bg-[#152552] text-cyan-300 border-cyan-500/40'
                                  : 'bg-purple-100 text-purple-900 border-purple-300'
                              }`}
                            >
                              {t.code}
                            </span>
                          </div>
                          <span
                            className={`text-[11px] mt-0.5 flex items-center gap-1.5 ${
                              isGow ? 'text-stone-400' : isSpiderman ? 'text-blue-200/70' : 'text-slate-500'
                            }`}
                          >
                            <Crown className="w-3 h-3 text-amber-500" />
                            <span>Captain: {t.captain_name}</span>
                            <span>•</span>
                            <Users className="w-3 h-3 text-emerald-500" />
                            <span>{t.member_count}/4 Warriors</span>
                          </span>
                        </div>

                        <button
                          type="button"
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md transition-all ${
                            isGow
                              ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white hover:from-red-500 hover:to-amber-500 font-cinzel border border-amber-300/40 shadow-[0_2px_0_#7f1d1d]'
                              : isSpiderman
                              ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 border border-cyan-200 shadow-[0_2px_0_#0891b2]'
                              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_2px_0_#4c1d95]'
                          }`}
                        >
                          Select
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* Challenge Configuration */
              <div className="flex flex-col gap-4 relative z-10">
                {/* Target preview pill */}
                <div
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-between shadow-md ${
                    isGow
                      ? 'border-red-600/70 bg-gradient-to-r from-[#240B0B] via-[#1A0808] to-[#2B0E0E] text-rose-100 shadow-[0_0_20px_rgba(220,38,38,0.25)]'
                      : isSpiderman
                      ? 'border-cyan-400/70 bg-gradient-to-r from-[#0C1530] via-[#101C42] to-[#0A1229] text-white shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                      : 'border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-950 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col">
                    <span
                      className={`text-[10px] uppercase font-black tracking-wider block ${
                        isGow ? 'text-amber-400 font-cinzel' : isSpiderman ? 'text-cyan-300' : 'text-purple-600'
                      }`}
                    >
                      {isGow ? 'Selected Opponent Clan' : 'Selected Opponent Squad'}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`font-black text-sm sm:text-base ${
                          isGow ? 'font-cinzel text-rose-100' : isSpiderman ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {selectedTargetTeam.name}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold ${
                          isGow ? 'text-amber-300' : isSpiderman ? 'text-cyan-300' : 'text-purple-700'
                        }`}
                      >
                        [{selectedTargetTeam.code}]
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTargetTeam(null)}
                    className={`text-xs font-black underline cursor-pointer transition-colors ${
                      isGow
                        ? 'text-red-400 hover:text-red-300 font-cinzel'
                        : isSpiderman
                        ? 'text-cyan-300 hover:text-cyan-200'
                        : 'text-purple-700 hover:text-purple-900'
                    }`}
                  >
                    Change
                  </button>
                </div>

                {/* Language selection */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className={`text-xs font-black uppercase tracking-wider ${
                      isGow ? 'text-amber-400 font-cinzel' : isSpiderman ? 'text-cyan-400' : 'text-slate-700'
                    }`}
                  >
                    Battle Language
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { key: 'javascript', label: 'JavaScript' },
                      { key: 'python', label: 'Python' },
                    ].map((l) => {
                      const isSelected = language === l.key
                      return (
                        <button
                          key={l.key}
                          type="button"
                          onClick={() => setLanguage(l.key)}
                          className={`py-2.5 px-3 rounded-2xl text-xs font-black border-2 transition-all cursor-pointer shadow-xs ${
                            isSelected
                              ? isGow
                                ? 'bg-gradient-to-r from-amber-600 via-rose-600 to-red-600 text-white border-amber-400 font-cinzel shadow-[0_0_15px_rgba(245,208,96,0.35)]'
                                : isSpiderman
                                ? 'bg-cyan-400 text-slate-950 border-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                                : 'bg-purple-600 text-white border-purple-700 shadow-sm'
                              : isGow
                              ? 'bg-[#140606] border-red-950 text-stone-400 hover:text-rose-100 hover:border-red-900 font-cinzel'
                              : isSpiderman
                              ? 'bg-[#0B132B] border-blue-950 text-blue-200/70 hover:text-white hover:border-cyan-800'
                              : 'bg-white border-purple-200 text-slate-700 hover:bg-purple-50'
                          }`}
                        >
                          {l.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className={`text-xs font-black uppercase tracking-wider ${
                      isGow ? 'text-amber-400 font-cinzel' : isSpiderman ? 'text-cyan-400' : 'text-slate-700'
                    }`}
                  >
                    Difficulty Tier
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Easy', 'Medium', 'Hard'].map((d) => {
                      const isSelected = difficulty === d
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDifficulty(d)}
                          className={`py-2 px-2 rounded-2xl text-xs font-black border-2 transition-all cursor-pointer shadow-xs ${
                            isSelected
                              ? isGow
                                ? d === 'Easy'
                                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)] font-cinzel'
                                  : d === 'Medium'
                                  ? 'bg-amber-950/80 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.4)] font-cinzel'
                                  : 'bg-gradient-to-r from-red-700 to-rose-600 border-red-400 text-white shadow-[0_0_18px_rgba(220,38,38,0.6)] font-cinzel'
                                : isSpiderman
                                ? d === 'Easy'
                                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                                  : d === 'Medium'
                                  ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                                  : 'bg-red-500/20 border-red-400 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                                : d === 'Easy'
                                ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                                : d === 'Medium'
                                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                                : 'bg-rose-500 text-white border-rose-600 shadow-sm'
                              : isGow
                              ? 'bg-[#140606] border-red-950 text-stone-400 hover:text-rose-100 hover:border-red-900 font-cinzel'
                              : isSpiderman
                              ? 'bg-[#0B132B] border-blue-950 text-blue-200/70 hover:text-white hover:border-cyan-800'
                              : 'bg-white border-purple-200 text-slate-700 hover:bg-purple-50'
                          }`}
                        >
                          {d}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Question Count & Pool Status */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <label
                      className={`text-xs font-black uppercase tracking-wider ${
                        isGow ? 'text-amber-400 font-cinzel' : isSpiderman ? 'text-cyan-400' : 'text-slate-700'
                      }`}
                    >
                      {isGow ? 'Trial Quest Count (1–20)' : 'Quest Count (1–20)'}
                    </label>
                    <span
                      className={`text-xs font-black font-mono px-2 py-0.5 rounded-lg border ${
                        isGow
                          ? 'bg-[#250E0E] text-amber-300 border-red-900/60'
                          : isSpiderman
                          ? 'bg-[#15234A] text-cyan-300 border-cyan-500/40'
                          : 'bg-purple-100 text-purple-800 border-purple-300'
                      }`}
                    >
                      {questionCount} Quests
                    </span>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                    className={`w-full cursor-pointer ${
                      isGow ? 'accent-red-500' : isSpiderman ? 'accent-cyan-400' : 'accent-purple-600'
                    }`}
                  />
                  <div
                    className={`flex justify-between text-[10px] font-mono font-bold ${
                      isGow ? 'text-stone-400 font-cinzel' : isSpiderman ? 'text-blue-300/70' : 'text-slate-400'
                    }`}
                  >
                    <span>{isGow ? '1 (Single Duel)' : '1 (Duel)'}</span>
                    <span>{isGow ? '10 (Valhalla Skirmish)' : '10 (Skirmish)'}</span>
                    <span>{isGow ? '20 (Ragnarök Trial)' : '20 (Epic)'}</span>
                  </div>

                  {/* Pool Availability Feedback */}
                  <div
                    className={`flex items-center justify-between text-xs px-3.5 py-2.5 rounded-2xl border-2 shadow-inner ${
                      isGow
                        ? 'border-red-950/90 bg-[#120606] text-stone-300'
                        : isSpiderman
                        ? 'border-blue-950 bg-[#0B132B] text-blue-100'
                        : 'border-purple-200 bg-purple-50/50 text-slate-700'
                    }`}
                  >
                    <span className="text-xs font-medium">Question Pool Available:</span>
                    {isCheckingPool ? (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Loader2
                          className={`w-3.5 h-3.5 animate-spin ${
                            isGow ? 'text-red-500' : isSpiderman ? 'text-cyan-400' : 'text-purple-600'
                          }`}
                        />{' '}
                        Verifying pool...
                      </span>
                    ) : poolAvailable !== null ? (
                      <span
                        className={`text-xs font-black ${
                          poolAvailable >= questionCount
                            ? 'text-emerald-400'
                            : poolAvailable > 0
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {poolAvailable} Available {poolAvailable < questionCount ? `(Need ${questionCount})` : '✓'}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Ready</span>
                    )}
                  </div>
                </div>

                {/* Dispatch Button */}
                <button
                  type="button"
                  disabled={
                    isSubmitting ||
                    isCheckingPool ||
                    (poolAvailable !== null && poolAvailable < questionCount)
                  }
                  onClick={handleSendChallenge}
                  className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl active:translate-y-1 ${
                    isGow
                      ? 'font-cinzel text-white bg-gradient-to-r from-red-700 via-rose-600 to-amber-600 hover:from-red-600 hover:to-amber-500 border-2 border-amber-400 shadow-[0_5px_0_#7f1d1d,0_0_30px_rgba(220,38,38,0.5)]'
                      : isSpiderman
                      ? 'text-slate-950 bg-cyan-400 hover:bg-cyan-300 border-2 border-cyan-200 shadow-[0_5px_0_#0891b2,0_0_25px_rgba(0,240,255,0.4)]'
                      : 'btn-gamified-3d btn-gamified-3d-primary text-white bg-purple-600 hover:bg-purple-500 border-2 border-purple-700 shadow-[0_4px_0_#4c1d95]'
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Swords className="w-4 h-4" />
                      <span>{isGow ? 'Dispatch War Challenge ⚔️🩸' : 'Dispatch Challenge ⚔️'}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
