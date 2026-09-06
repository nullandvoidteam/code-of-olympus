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
      toast.success(`Challenge dispatched to ${selectedTargetTeam.name}! ⚔️`)
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
        toast.success('Challenge Accepted! Match lobby prepared. ⚔️')
        if (res.match && onEnterMatch) {
          onEnterMatch(res.match)
        }
      } else {
        toast.success('Challenge declined.')
      }
    }
  }

  const pendingIncoming = incoming.filter((c) => c.status === 'pending')
  const pendingOutgoing = outgoing.filter((c) => c.status === 'pending')

  return (
    <div className="flex flex-col gap-4 text-left">
      {/* ── 1. ACTIVE SQUAD MATCH BANNER ── */}
      {activeMatch && (
        <div className="p-5 rounded-3xl flex flex-col gap-3.5 shadow-md bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 border-2 border-purple-300">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500 text-white shadow-xs">
              <Swords className="w-3.5 h-3.5 animate-pulse" /> Active Duel Match
            </span>
            <span className="text-xs uppercase font-black tracking-widest px-2.5 py-0.5 rounded-lg bg-white border border-purple-200 text-purple-900 shadow-2xs font-mono">
              Status: {activeMatch.status}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 py-2">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-bold">Your Squad</span>
              <span className="font-black text-base sm:text-lg text-slate-900 truncate">{team.name}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center font-black text-xs shadow-md">
              VS
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-500 font-bold">Opponent Squad</span>
              <span className="font-black text-base sm:text-lg text-slate-900 truncate">
                {activeMatch.team_a_id === team.id
                  ? activeMatch.team_b?.name || 'Rival Squad'
                  : activeMatch.team_a?.name || 'Rival Squad'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-700 pt-3 border-t border-purple-200/60 font-medium">
            <span className="capitalize font-bold">
              {activeMatch.language} • {activeMatch.difficulty} • {activeMatch.question_count} Quests
            </span>
            {onEnterMatch && (
              <button
                type="button"
                onClick={() => onEnterMatch(activeMatch)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 border-2 border-emerald-600 shadow-[0_3px_0_#065f46] text-white transition-all cursor-pointer"
              >
                <span>Enter Duel</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── 2. INCOMING CHALLENGES ── */}
      {pendingIncoming.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-600">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Incoming Squad Challenges ({pendingIncoming.length})</span>
          </div>

          {pendingIncoming.map((chal) => (
            <div
              key={chal.id}
              className="p-4 rounded-3xl border-2 border-amber-300 bg-amber-50/90 text-slate-900 shadow-sm flex flex-col gap-3 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span className="font-black text-sm text-slate-900">
                    {chal.challenger_team?.name || 'Challenger Squad'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200/70 text-amber-900 font-bold">
                    {chal.challenger_team?.code}
                  </span>
                </div>
                <span className="text-xs uppercase font-black text-amber-700 bg-amber-200/50 px-2 py-0.5 rounded-full">
                  Pending
                </span>
              </div>

              <div className="text-xs text-slate-600 font-medium">
                Rules: <span className="font-bold text-slate-900 capitalize">{chal.language}</span> •{' '}
                <span className="font-bold text-slate-900">{chal.difficulty}</span> •{' '}
                <span className="font-bold text-slate-900">{chal.question_count} Questions</span>
              </div>

              <div className="flex items-center gap-2.5 pt-2 border-t border-amber-200/60">
                <button
                  type="button"
                  disabled={respondingId === chal.id}
                  onClick={() => handleRespond(chal.id, 'accepted')}
                  className="flex-1 py-2 rounded-xl text-xs font-black text-white bg-emerald-500 hover:bg-emerald-400 border-2 border-emerald-600 shadow-[0_3px_0_#065f46] flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                >
                  {respondingId === chal.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept & Duel</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={respondingId === chal.id}
                  onClick={() => handleRespond(chal.id, 'declined')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 border border-rose-300 flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-50"
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
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
            Dispatched Challenges ({pendingOutgoing.length})
          </span>
          {pendingOutgoing.map((chal) => (
            <div
              key={chal.id}
              className="p-3 rounded-2xl border-2 border-slate-200 bg-white text-slate-800 flex items-center justify-between text-xs shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <Clock className="w-4 h-4 text-amber-500 animate-spin" />
                <span className="font-bold truncate text-slate-900">
                  To: {chal.challenged_team?.name || 'Rival Squad'}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  ({chal.language}, {chal.question_count}Q)
                </span>
              </div>
              <span className="text-xs uppercase font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
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
        className="btn-gamified-3d btn-gamified-3d-primary w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-purple-600 hover:bg-purple-500 border-2 border-purple-700 shadow-[0_4px_0_#4c1d95] flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <Swords className="w-4 h-4" />
        <span>Challenge Another Squad</span>
      </button>

      {/* ── 5. RECENT DUELS HISTORY ── */}
      {recentMatches && recentMatches.length > 0 && (
        <div className="flex flex-col gap-3 pt-3 border-t-2 border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Recent Completed Duels ({recentMatches.length})</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Persisted Match State</span>
          </div>

          <div className="flex flex-col gap-2">
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
                  className="p-3.5 rounded-2xl border-2 border-slate-200 bg-white hover:border-purple-300 flex items-center justify-between text-xs transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm truncate text-slate-900">
                          vs {rival?.name || 'Rival Squad'}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${
                            won
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : draw
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {won ? 'KILLER COMBAT' : draw ? 'WE ARE SAFE' : 'TURF CAPTURED'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 capitalize mt-0.5 font-medium">
                        {m.language} • {m.difficulty} • Score: {Number(myScore ?? 0).toFixed(1)} - {Number(rivalScore ?? 0).toFixed(1)} CP avg
                      </span>
                    </div>
                  </div>

                  {onEnterMatch && (
                    <button
                      type="button"
                      onClick={() => onEnterMatch(m)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer shrink-0 flex items-center gap-1 shadow-2xs"
                    >
                      <Trophy className="w-3.5 h-3.5 text-purple-600" />
                      <span>View Result</span>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 6. CHALLENGE SQUAD MODAL / SEARCH ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl p-6 flex flex-col gap-5 shadow-2xl border-2 border-purple-300 bg-white text-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-purple-600" />
                <h3 className="font-black text-base text-slate-900">Issue Squad Challenge</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false)
                  setSelectedTargetTeam(null)
                }}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Target Squad Selection */}
            {!selectedTargetTeam ? (
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search active squads by name or 6-character code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-purple-500 focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                  {isSearching ? (
                    <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                      <span>Searching active squads...</span>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 font-medium">
                      {searchQuery
                        ? 'No active squad found matching this search.'
                        : 'No other active squads online yet.'}
                    </div>
                  ) : (
                    searchResults.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTargetTeam(t)}
                        className="p-3.5 rounded-2xl border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 flex items-center justify-between cursor-pointer transition-all shadow-2xs"
                      >
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs text-slate-900 truncate">{t.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                              {t.code}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 mt-0.5">
                            Captain: {t.captain_name} • {t.member_count}/4 Warriors
                          </span>
                        </div>
                        <button
                          type="button"
                          className="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-purple-600 text-white hover:bg-purple-700 cursor-pointer shadow-xs"
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
              <div className="flex flex-col gap-4">
                {/* Target preview pill */}
                <div className="p-3.5 rounded-2xl border-2 border-purple-200 bg-purple-50 flex items-center justify-between text-purple-900">
                  <div>
                    <span className="text-[10px] uppercase font-black text-purple-600 block">
                      Selected Opponent
                    </span>
                    <span className="font-black text-sm text-slate-900">{selectedTargetTeam.name}</span>{' '}
                    <span className="text-xs font-mono font-bold text-purple-700">
                      [{selectedTargetTeam.code}]
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTargetTeam(null)}
                    className="text-xs font-extrabold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                {/* Language selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Language
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'javascript', label: 'JavaScript' },
                      { key: 'python', label: 'Python' },
                    ].map((l) => (
                      <button
                        key={l.key}
                        type="button"
                        onClick={() => setLanguage(l.key)}
                        className={`py-2.5 px-3 rounded-2xl text-xs font-black border-2 transition-all cursor-pointer ${
                          language === l.key
                            ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Difficulty Tier
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Easy', 'Medium', 'Hard'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        className={`py-2 px-2 rounded-2xl text-xs font-black border-2 transition-all cursor-pointer ${
                          difficulty === d
                            ? d === 'Easy'
                              ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                              : d === 'Medium'
                              ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                              : 'bg-rose-500 text-white border-rose-600 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Count & Pool Status */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Quest Count (1–20)
                    </label>
                    <span className="text-xs font-black text-purple-700 font-mono">{questionCount} Questions</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono font-bold">
                    <span>1 (Duel)</span>
                    <span>10 (Skirmish)</span>
                    <span>20 (Epic)</span>
                  </div>

                  {/* Pool Availability Feedback */}
                  <div className="flex items-center justify-between text-xs px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 bg-slate-50">
                    <span className="text-slate-500 text-xs font-medium">Published Question Pool:</span>
                    {isCheckingPool ? (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" /> Checking pool...
                      </span>
                    ) : poolAvailable !== null ? (
                      <span
                        className={`text-xs font-black ${
                          poolAvailable >= questionCount
                            ? 'text-emerald-600'
                            : poolAvailable > 0
                            ? 'text-amber-600'
                            : 'text-rose-600'
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
                  className="btn-gamified-3d btn-gamified-3d-primary w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-purple-600 hover:bg-purple-500 border-2 border-purple-700 shadow-[0_4px_0_#4c1d95] flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Swords className="w-4 h-4" />
                      <span>Dispatch Challenge ⚔️</span>
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
