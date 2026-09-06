import React, { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import confetti from 'canvas-confetti'
import { toast } from 'react-hot-toast'
import {
  type ArcadeTeamMatch,
  useTeamMatchGameplay,
  recordTeamMatchSubmissionAction,
} from '../../lib/arcade'
import { evaluateChallengeTests, type TestCaseResult } from '../../lib/submissions'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { C } from '../crucible/crucibleTokens'
import {
  Swords,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Play,
  Send,
  Loader2,
  Code2,
  Cpu,
  Bug,
  HelpCircle,
  Lightbulb,
  AlertCircle,
  ChevronRight,
  Trophy,
  Users,
  Flame,
  Award,
  Lock,
} from 'lucide-react'

interface TeamMatchLobbyModalProps {
  match: ArcadeTeamMatch
  currentTeamId?: string
  userId?: string
  onClose: () => void
}

// Normalize challenge language for Monaco Editor
function getMonacoLanguage(lang?: string): string {
  if (!lang) return 'javascript'
  const l = lang.toLowerCase()
  if (l.includes('py')) return 'python'
  if (l.includes('js') || l.includes('javascript')) return 'javascript'
  if (l.includes('ts') || l.includes('typescript')) return 'typescript'
  if (l.includes('c++') || l.includes('cpp')) return 'cpp'
  if (l.includes('java') && !l.includes('script')) return 'java'
  if (l.includes('c#') || l.includes('csharp')) return 'csharp'
  if (l.includes('html')) return 'html'
  if (l.includes('css')) return 'css'
  if (l.includes('sql')) return 'sql'
  if (l.includes('rust')) return 'rust'
  if (l.includes('go')) return 'go'
  return 'javascript'
}

export const TeamMatchLobbyModal: React.FC<TeamMatchLobbyModalProps> = ({
  match: initialMatch,
  currentTeamId,
  userId: propUserId,
  onClose,
}) => {
  const { user } = useAuth()
  const activeUserId = propUserId || user?.id
  const { theme } = useTheme()
  const isClassic = theme === 'classic'

  const {
    match,
    questions,
    submissions,
    mySubmissions,
    loading,
    isExpired,
    timeRemainingSeconds,
    startMatch,
    concludeMatch,
    reloadMatch,
    addOrUpdateSubmission,
  } = useTeamMatchGameplay(initialMatch.id, initialMatch, activeUserId)

  // Current selected question index (0-based)
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0)

  // Local independent code state per question (NO collaboration sync)
  const [codes, setCodes] = useState<Record<string, string>>({})

  // Local execution and test case states
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testResults, setTestResults] = useState<TestCaseResult[]>([])
  const [testStatus, setTestStatus] = useState<string | null>(null)
  const [showHints, setShowHints] = useState(false)
  const [showRoster, setShowRoster] = useState(false)
  const [isStartingMatch, setIsStartingMatch] = useState(false)
  const [isConcluding, setIsConcluding] = useState(false)
  const [viewMode, setViewMode] = useState<'arena' | 'result'>(
    initialMatch.status === 'completed' ? 'result' : 'arena'
  )

  const activeQuestion = questions[selectedQuestionIndex]
  const matchId = match?.id || initialMatch.id

  // Track whether initial question has been positioned on refresh/reconnect (Requirement 4 & 6)
  const hasRestoredQuestionIndex = useRef(false)

  // Restore the player's current unanswered/answered question state after refresh or reconnect
  useEffect(() => {
    if (loading || !questions || questions.length === 0 || hasRestoredQuestionIndex.current) return

    // Find the first question that has not been answered by the player yet
    const firstUnanswered = questions.findIndex(
      (q) => !mySubmissions.some((s) => s.exercise_id === q.id)
    )

    if (firstUnanswered !== -1) {
      setSelectedQuestionIndex(firstUnanswered)
      setViewMode('arena')
    } else {
      // All questions are answered by this player, immediately show Game Result screen (Requirement 4 & 7)
      setSelectedQuestionIndex(Math.max(0, questions.length - 1))
      setViewMode('result')
    }
    hasRestoredQuestionIndex.current = true
  }, [loading, questions, mySubmissions])

  // Check which questions are accessible to this player (Requirement 7 & 9)
  const isQuestionAccessible = (targetIdx: number) => {
    if (targetIdx <= 0) return true
    // Every question prior to targetIdx must have a recorded submission by this player
    for (let i = 0; i < targetIdx; i++) {
      const qId = questions[i]?.id
      if (!qId || !mySubmissions.some((s) => s.exercise_id === qId)) {
        return false
      }
    }
    return true
  }

  // Initialize starter code or restored draft when questions load or switch
  useEffect(() => {
    if (!questions || questions.length === 0) return

    setCodes((prev) => {
      const next = { ...prev }
      questions.forEach((q) => {
        // If user already submitted code for this question in this match, load it
        const existingSub = mySubmissions.find((s) => s.exercise_id === q.id)
        if (existingSub?.code && !next[q.id]) {
          next[q.id] = existingSub.code
        } else if (next[q.id] === undefined) {
          // Check sessionStorage for draft code that survives browser refresh
          let draft: string | null = null
          try {
            draft = sessionStorage.getItem(`arcade_draft_${matchId}_${q.id}`)
          } catch {
            // ignore
          }
          next[q.id] = draft ?? q.starter_code ?? ''
        }
      })
      return next
    })
  }, [questions, mySubmissions, matchId])

  const currentCode = activeQuestion ? codes[activeQuestion.id] ?? activeQuestion.starter_code ?? '' : ''
  const monacoLang = getMonacoLanguage(activeQuestion?.language || match?.language || initialMatch.language)

  // Current question submission state & results (Requirement 1, 2, 5)
  const activeSubmission = activeQuestion
    ? mySubmissions.find((s) => s.exercise_id === activeQuestion.id)
    : undefined
  const isCurrentQuestionAnswered = Boolean(activeSubmission)
  const isCurrentCorrect =
    activeSubmission?.status === 'passed' || activeSubmission?.result === 'correct'
  const currentCombatPoints =
    activeSubmission?.combat_points ?? (isCurrentCorrect ? 100 : 0)

  const handleCodeChange = (val?: string) => {
    if (!activeQuestion || isExpired || isCurrentQuestionAnswered) return
    const newCode = val ?? ''
    setCodes((prev) => ({
      ...prev,
      [activeQuestion.id]: newCode,
    }))
    try {
      sessionStorage.setItem(`arcade_draft_${matchId}_${activeQuestion.id}`, newCode)
    } catch {
      // ignore
    }
  }

  // Start match from lobby
  const handleStartMatch = async () => {
    setIsStartingMatch(true)
    const res = await startMatch()
    setIsStartingMatch(false)
    if (!res.success) {
      toast.error(res.error || 'Failed to start match.')
    } else {
      toast.success('Duel started! Good luck, warrior! ⚔️')
    }
  }

  // Run tests locally without submitting
  const handleRunTests = async () => {
    if (!activeQuestion || isCurrentQuestionAnswered) return
    setIsRunning(true)
    setTestResults([])
    setTestStatus(null)

    try {
      const result = await evaluateChallengeTests(activeQuestion.id, currentCode, monacoLang)
      setTestResults(result.testResults)
      setTestStatus(result.status)

      if (result.status === 'passed') {
        toast.success(`All ${result.totalCount} tests passed! Click Submit Solution to lock in points.`)
      } else if (result.status === 'failed') {
        toast.error(`Passed ${result.passedCount}/${result.totalCount} tests.`)
      } else {
        toast.error(`Execution error: ${result.testResults[0]?.error || 'Failed'}`)
      }
    } catch {
      toast.error('Failed to execute test cases.')
    } finally {
      setIsRunning(false)
    }
  }

  // Submit solution independently for this match (Requirement 1, 3, 4, 5, 8, 9)
  const handleSubmitSolution = async () => {
    if (!activeQuestion || !match || !activeUserId) {
      toast.error('Unable to submit solution.')
      return
    }

    if (isExpired) {
      toast.error('Match time has concluded. Submissions are closed.')
      return
    }

    if (isCurrentQuestionAnswered) {
      toast.error('This question has already been answered and submitted.')
      return
    }

    const isLastQuestion = selectedQuestionIndex === questions.length - 1

    setIsSubmitting(true)
    setTestResults([])
    setTestStatus(null)

    try {
      // 1. Evaluate tests
      const evalRes = await evaluateChallengeTests(activeQuestion.id, currentCode, monacoLang)
      setTestResults(evalRes.testResults)
      setTestStatus(evalRes.status)

      // 2. Submit must save its Correct/Wrong result first (Requirement 4)
      const recordRes = await recordTeamMatchSubmissionAction({
        matchId: match.id,
        exerciseId: activeQuestion.id,
        code: currentCode,
        language: monacoLang,
        status: evalRes.status,
        passedCount: evalRes.passedCount,
        totalCount: evalRes.totalCount,
        executionTimeMs: evalRes.executionTimeMs,
      })

      if (!recordRes.success) {
        toast.error(recordRes.error || 'Failed to record match submission.')
      } else {
        // Immediately add to local submissions so UI updates without waiting for network/realtime
        if (recordRes.submission) {
          addOrUpdateSubmission(recordRes.submission)
        }

        // Immediate visual feedback (Requirement 1 & 2)
        if (evalRes.status === 'passed') {
          confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } })
          toast.success(`Correct! +100 Combat Points earned! 🎯`, { duration: 4000 })
        } else {
          toast.error(`Wrong: 0 Combat Points. Passed ${evalRes.passedCount}/${evalRes.totalCount} tests.`, { duration: 4000 })
        }

        // On the LAST question (Requirement 6, 7, 8):
        // * Save its result first (already saved in recordRes above)
        // * Do NOT show Next Question
        // * Immediately show the total score/result screen
        // * If match is fully completed (both squads done), reload match to show finalized winners
        // * If opponent has not finished yet, do NOT prematurely force-conclude the match
        if (isLastQuestion) {
          if (recordRes.match_completed) {
            await reloadMatch()
          }
          setViewMode('result')
        } else {
          await reloadMatch()
        }
      }
    } catch {
      toast.error('An unexpected error occurred during submission.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format countdown mm:ss
  const formatTimer = (seconds: number | null) => {
    if (seconds === null) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Count passed submissions per team
  const teamAPassedCount = submissions.filter(
    (s) => s.team_id === match?.team_a_id && s.status === 'passed'
  ).length
  const teamBPassedCount = submissions.filter(
    (s) => s.team_id === match?.team_b_id && s.status === 'passed'
  ).length

  // Group submissions by user to compute participating players' Combat Points
  const playerStatsMap = new Map<string, {
    userId: string
    teamId: string
    username: string
    avatarUrl?: string | null
    combatPoints: number
    solvedCount: number
    attemptedCount: number
  }>()

  submissions.forEach((sub) => {
    const existing = playerStatsMap.get(sub.user_id) || {
      userId: sub.user_id,
      teamId: sub.team_id,
      username: sub.profile?.username || sub.profile?.full_name || 'Warrior',
      avatarUrl: sub.profile?.avatar_url,
      combatPoints: 0,
      solvedCount: 0,
      attemptedCount: 0,
    }
    existing.attemptedCount += 1
    if (sub.status === 'passed') {
      existing.solvedCount += 1
      existing.combatPoints += (sub.combat_points ?? 100)
    }
    playerStatsMap.set(sub.user_id, existing)
  })

  const teamAPlayers = Array.from(playerStatsMap.values()).filter((p) => p.teamId === match?.team_a_id)
  const teamBPlayers = Array.from(playerStatsMap.values()).filter((p) => p.teamId === match?.team_b_id)

  const teamAPlayersCount = teamAPlayers.length
  const teamBPlayersCount = teamBPlayers.length

  const teamATotalCombatPoints = teamAPlayers.reduce((acc, p) => acc + p.combatPoints, 0)
  const teamBTotalCombatPoints = teamBPlayers.reduce((acc, p) => acc + p.combatPoints, 0)

  // Use persisted match score or calculate live average
  const teamAAvgScore = match?.team_a_score !== undefined && match?.team_a_score !== null
    ? Number(match.team_a_score)
    : teamAPlayersCount > 0 ? teamATotalCombatPoints / teamAPlayersCount : 0

  const teamBAvgScore = match?.team_b_score !== undefined && match?.team_b_score !== null
    ? Number(match.team_b_score)
    : teamBPlayersCount > 0 ? teamBTotalCombatPoints / teamBPlayersCount : 0

  // Perspective determination for current user/squad
  const isTeamA = currentTeamId
    ? currentTeamId === match?.team_a_id
    : submissions.some((s) => s.user_id === activeUserId && s.team_id === match?.team_a_id)
  const isTeamB = currentTeamId
    ? currentTeamId === match?.team_b_id
    : submissions.some((s) => s.user_id === activeUserId && s.team_id === match?.team_b_id)

  const isMatchFinished = match?.status === 'completed'

  let resultHeadline: 'KILLER COMBAT' | 'WE ARE SAFE' | 'YOUR TURF CAPTURED' | 'WAITING FOR OPPONENT' = 'WE ARE SAFE'
  let resultSubtext = 'Deadlock! Scores are equal. No territory was lost or captured.'
  let resultTypeTheme: 'win' | 'loss' | 'safe' | 'waiting' = 'safe'

  if (!isMatchFinished) {
    resultHeadline = 'WAITING FOR OPPONENT'
    resultSubtext = 'You have completed all challenge quests! Waiting for the opponent squad to finish or match timer to expire.'
    resultTypeTheme = 'waiting'
  } else if (teamAAvgScore === teamBAvgScore) {
    resultHeadline = 'WE ARE SAFE'
    resultSubtext = 'Both squads fought with equal valor! No turf was captured or lost.'
    resultTypeTheme = 'safe'
  } else if (teamAAvgScore > teamBAvgScore) {
    if (isTeamA) {
      resultHeadline = 'KILLER COMBAT'
      resultSubtext = `Dominating victory! Your squad secured higher average Combat Points and captured 1 Turf from ${match?.team_b?.name || 'the enemy'}!`
      resultTypeTheme = 'win'
    } else if (isTeamB) {
      resultHeadline = 'YOUR TURF CAPTURED'
      resultSubtext = `Defeat in combat. ${match?.team_a?.name || 'Squad A'} secured a higher average score and captured 1 of your Turfs!`
      resultTypeTheme = 'loss'
    } else {
      resultHeadline = 'KILLER COMBAT'
      resultSubtext = `${match?.team_a?.name || 'Squad A'} defeated ${match?.team_b?.name || 'Squad B'} and captured their turf!`
      resultTypeTheme = 'win'
    }
  } else {
    // teamBAvgScore > teamAAvgScore
    if (isTeamB) {
      resultHeadline = 'KILLER COMBAT'
      resultSubtext = `Dominating victory! Your squad secured higher average Combat Points and captured 1 Turf from ${match?.team_a?.name || 'the enemy'}!`
      resultTypeTheme = 'win'
    } else if (isTeamA) {
      resultHeadline = 'YOUR TURF CAPTURED'
      resultSubtext = `Defeat in combat. ${match?.team_b?.name || 'Squad B'} secured a higher average score and captured 1 of your Turfs!`
      resultTypeTheme = 'loss'
    } else {
      resultHeadline = 'KILLER COMBAT'
      resultSubtext = `${match?.team_b?.name || 'Squad B'} defeated ${match?.team_a?.name || 'Squad A'} and captured their turf!`
      resultTypeTheme = 'win'
    }
  }

  // Trigger confetti for victory on completed match
  useEffect(() => {
    if (match?.status === 'completed' && resultTypeTheme === 'win') {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } })
    }
  }, [match?.status, resultTypeTheme])

  const handleConcludeMatch = async () => {
    if (!match) return
    setIsConcluding(true)
    const res = await concludeMatch()
    setIsConcluding(false)
    if (!res.success) {
      toast.error(res.error || 'Failed to conclude match.')
    } else {
      toast.success('Battle concluded! Results inscribed.')
      setViewMode('result')
    }
  }

  // Helper for question type badge
  const renderQuestionTypeBadge = (type?: string) => {
    const t = (type || 'code').toLowerCase()
    if (t === 'algorithm') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30">
          <Cpu className="w-3 h-3" /> Algorithm
        </span>
      )
    }
    if (t === 'debugging') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
          <Bug className="w-3 h-3" /> Debugging
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30">
        <Code2 className="w-3 h-3" /> Coding
      </span>
    )
  }

  if (loading || !match) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div className="flex flex-col items-center gap-3 text-white">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          <span className="text-xs font-mono">Entering match arena...</span>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. MATCH LOBBY STATE (Waiting to start)
  // ═══════════════════════════════════════════════════════════════════════════
  if (match.status === 'lobby') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
        <div
          className={`w-full max-w-xl rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl border ${
            isClassic
              ? 'bg-white border-slate-200 text-slate-900'
              : 'bg-[#120A0A] border-red-900/60 text-white'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-red-950">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-500/20 text-rose-500">
                <Swords className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-lg">Team Duel Match Lobby</h2>
                <span className="text-xs text-slate-400">Match ID: {match.id.slice(0, 8)}...</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Versus Display */}
          <div className="grid grid-cols-5 items-center gap-2 text-center py-2">
            {/* Team A */}
            <div className="col-span-2 flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800">
              <Shield className="w-8 h-8 text-blue-500" />
              <span className="font-extrabold text-sm truncate max-w-full">
                {match.team_a?.name || 'Squad A'}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                {match.team_a?.code || 'TEAM-A'}
              </span>
            </div>

            {/* VS badge */}
            <div className="col-span-1 flex flex-col items-center justify-center">
              <span className="text-xl font-black italic text-rose-500 tracking-wider">VS</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Lobby</span>
            </div>

            {/* Team B */}
            <div className="col-span-2 flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800">
              <Shield className="w-8 h-8 text-rose-500" />
              <span className="font-extrabold text-sm truncate max-w-full">
                {match.team_b?.name || 'Squad B'}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">
                {match.team_b?.code || 'TEAM-B'}
              </span>
            </div>
          </div>

          {/* Match Specs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Language</span>
              <span className="font-bold text-sm capitalize">{match.language}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Difficulty</span>
              <span className="font-bold text-sm text-amber-500">{match.difficulty}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Quest Count</span>
              <span className="font-bold text-sm text-emerald-500">{match.question_count} Quests</span>
            </div>
          </div>

          {/* Synchronized Questions Preview */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Assigned Quest Pool ({questions.length})
            </span>
            <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-500 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="font-bold truncate">{q.title}</span>
                  </div>
                  {renderQuestionTypeBadge(q.question_type)}
                </div>
              ))}
            </div>
          </div>

          {/* Actions: Start Battle / Cancel */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer text-center"
            >
              Back to Hub
            </button>
            <button
              type="button"
              disabled={isStartingMatch}
              onClick={handleStartMatch}
              className="flex-2 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest text-white bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-50"
            >
              {isStartingMatch ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Swords className="w-4 h-4" />
                  <span>Start Duel Battle ⚔️</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. MATCH RESULT SCREEN (Concluded Battle)
  // ═══════════════════════════════════════════════════════════════════════════
  const allQuestionsAnswered = questions.length > 0 && mySubmissions.length >= questions.length
  if ((match.status === 'completed' || allQuestionsAnswered) && viewMode === 'result') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
        <div className="w-full max-w-3xl my-6 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl border bg-[#0E1322] border-slate-800 text-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base md:text-lg text-white">Team Battle Concluded</h2>
                <span className="text-xs text-slate-400 font-mono">
                  {match.language.toUpperCase()} • {match.difficulty} • {questions.length} Quests
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Result Hero Banner */}
          <div
            className={`p-6 rounded-2xl border flex flex-col items-center text-center gap-3 shadow-lg ${
              resultTypeTheme === 'waiting'
                ? 'bg-gradient-to-b from-slate-900 to-amber-950/40 border-amber-500/50 text-amber-200'
                : resultTypeTheme === 'win'
                ? 'bg-gradient-to-b from-rose-950/80 to-red-950/40 border-rose-600/60 text-white'
                : resultTypeTheme === 'loss'
                ? 'bg-gradient-to-b from-slate-900 to-rose-950/30 border-rose-900/50 text-slate-200'
                : 'bg-gradient-to-b from-emerald-950/80 to-slate-900 border-emerald-500/50 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {resultTypeTheme === 'waiting' ? (
                <div className="p-2.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
                  <Clock className="w-6 h-6" />
                </div>
              ) : resultTypeTheme === 'win' ? (
                <div className="p-2.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                  <Flame className="w-6 h-6" />
                </div>
              ) : resultTypeTheme === 'loss' ? (
                <div className="p-2.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800">
                  <Shield className="w-6 h-6" />
                </div>
              ) : (
                <div className="p-2.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <Shield className="w-6 h-6" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Match Result
              </span>
              <h1 className="text-2xl md:text-3xl font-black tracking-wider uppercase">
                {resultHeadline}
              </h1>
              <p className="text-xs md:text-sm text-slate-300 max-w-lg mt-1 leading-relaxed">
                {resultSubtext}
              </p>
            </div>

            {/* Non-XP Notice */}
            <div className="mt-1 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] text-slate-400 font-mono">
              🛡️ Combat Points are battle-scoped only • No XP or global leaderboard affected
            </div>
          </div>

          {/* Head-to-Head Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-stretch">
            {/* Team A Card */}
            <div
              className={`md:col-span-2 p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                match.winner_team_id === match.team_a_id
                  ? 'bg-blue-950/40 border-blue-500/50 shadow-xs'
                  : 'bg-black/30 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Shield className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="font-extrabold text-sm truncate text-white">
                    {match.team_a?.name || 'Squad A'}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                  {match.team_a?.code}
                </span>
              </div>

              <div className="flex flex-col gap-1 my-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Team Score (Average CP)</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-blue-400">
                    {teamAAvgScore.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">PTS AVG</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {teamATotalCombatPoints} Total CP ÷ {teamAPlayersCount || 1} Participating Warriors
                </span>
              </div>

              {/* Turf Count */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Persistent Turf:</span>
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-amber-400">🏰 {match.team_a?.turf_count ?? 1} Turf</span>
                  {match.winner_team_id === match.team_a_id ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      +1 Captured
                    </span>
                  ) : match.winner_team_id === match.team_b_id ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400">
                      -1 Lost
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      Safe
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* VS Badge */}
            <div className="md:col-span-1 flex flex-col items-center justify-center gap-1 py-2">
              <span className="text-xl font-black italic text-rose-500">VS</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">FINAL</span>
            </div>

            {/* Team B Card */}
            <div
              className={`md:col-span-2 p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                match.winner_team_id === match.team_b_id
                  ? 'bg-rose-950/40 border-rose-500/50 shadow-xs'
                  : 'bg-black/30 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Shield className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="font-extrabold text-sm truncate text-white">
                    {match.team_b?.name || 'Squad B'}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold">
                  {match.team_b?.code}
                </span>
              </div>

              <div className="flex flex-col gap-1 my-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Team Score (Average CP)</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-rose-400">
                    {teamBAvgScore.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">PTS AVG</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {teamBTotalCombatPoints} Total CP ÷ {teamBPlayersCount || 1} Participating Warriors
                </span>
              </div>

              {/* Turf Count */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Persistent Turf:</span>
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-amber-400">🏰 {match.team_b?.turf_count ?? 1} Turf</span>
                  {match.winner_team_id === match.team_b_id ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      +1 Captured
                    </span>
                  ) : match.winner_team_id === match.team_a_id ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400">
                      -1 Lost
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      Safe
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Participating Players Combat Breakdown */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Participating Warriors • Combat Breakdown
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-48 overflow-y-auto pr-1">
              {/* Squad A Players */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-blue-400">
                  {match.team_a?.name || 'Squad A'} Players ({teamAPlayers.length})
                </span>
                {teamAPlayers.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No submissions recorded.</span>
                ) : (
                  teamAPlayers.map((p) => (
                    <div
                      key={p.userId}
                      className="p-2.5 rounded-xl bg-black/40 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-[10px]">
                          {p.username[0]?.toUpperCase() || 'W'}
                        </div>
                        <span className="font-bold truncate text-slate-200">{p.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {p.solvedCount}/{questions.length} solved
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          +{p.combatPoints} CP
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Squad B Players */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-rose-400">
                  {match.team_b?.name || 'Squad B'} Players ({teamBPlayers.length})
                </span>
                {teamBPlayers.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No submissions recorded.</span>
                ) : (
                  teamBPlayers.map((p) => (
                    <div
                      key={p.userId}
                      className="p-2.5 rounded-xl bg-black/40 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-[10px]">
                          {p.username[0]?.toUpperCase() || 'W'}
                        </div>
                        <span className="font-bold truncate text-slate-200">{p.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {p.solvedCount}/{questions.length} solved
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          +{p.combatPoints} CP
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('arena')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              Review Code Solutions
            </button>
            <div className="flex items-center gap-2">
              {!isMatchFinished && (
                <button
                  type="button"
                  disabled={isConcluding}
                  onClick={handleConcludeMatch}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  title="Conclude duel if opponent has abandoned"
                >
                  {isConcluding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Swords className="w-3.5 h-3.5" />}
                  <span>Conclude Duel</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 transition-all cursor-pointer shadow-md"
              >
                Return to Arcade Hub
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. ACTIVE BATTLE / PLAYGROUND WORKSPACE
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0B0F19] text-slate-100 animate-in fade-in overflow-hidden">
      {/* ── TOP NAVIGATION BAR ── */}
      <div className="h-16 px-4 md:px-6 bg-[#0E131F] border-b border-slate-800 flex items-center justify-between gap-4 shrink-0 shadow-md">
        {/* Left: VS match indicator & Quests */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/30 text-rose-400 shrink-0">
            <Swords className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs truncate">{match.team_a?.name || 'Squad A'}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                {teamAPassedCount}
              </span>
              <span className="text-xs font-bold text-rose-400 italic">vs</span>
              <span className="font-extrabold text-xs truncate">{match.team_b?.name || 'Squad B'}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold">
                {teamBPassedCount}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 capitalize">
              {match.language} • {match.difficulty} • {questions.length} Quests
            </span>
          </div>
        </div>

        {/* Center: Live Countdown Timer & Combat Scores */}
        <div className="flex items-center gap-2">
          {/* Live Averages Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-700 text-xs font-mono">
            <span className="text-slate-400 font-bold">AVG:</span>
            <span className="text-blue-400 font-bold">{teamAAvgScore.toFixed(1)}</span>
            <span className="text-slate-500">vs</span>
            <span className="text-rose-400 font-bold">{teamBAvgScore.toFixed(1)}</span>
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-mono font-bold shadow-xs ${
              isExpired || match.status === 'completed'
                ? 'bg-slate-900 border-slate-700 text-slate-400'
                : (timeRemainingSeconds ?? 999) < 180
                ? 'bg-rose-950/50 border-rose-600 text-rose-400 animate-pulse'
                : 'bg-black/40 border-amber-500/40 text-amber-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-inherit" />
            <span>
              {match.status === 'completed' ? 'CONCLUDED' : isExpired ? 'CONCLUDING...' : formatTimer(timeRemainingSeconds)}
            </span>
          </div>

          {match.status === 'completed' || (questions.length > 0 && mySubmissions.length >= questions.length) ? (
            <button
              type="button"
              onClick={() => setViewMode('result')}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold border border-amber-500/40 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Results</span>
            </button>
          ) : match.status === 'in_progress' ? (
            <button
              type="button"
              disabled={isConcluding}
              onClick={handleConcludeMatch}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold border border-rose-500/40 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 transition-all cursor-pointer flex items-center gap-1 shadow-2xs disabled:opacity-50"
              title="Conclude duel and calculate final combat points & turf"
            >
              {isConcluding ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Swords className="w-3 h-3 text-rose-400" />
              )}
              <span>Conclude</span>
            </button>
          ) : null}
        </div>

        {/* Right: Roster Toggle & Exit */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRoster(!showRoster)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              showRoster
                ? 'bg-purple-600 text-white border-purple-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Roster</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Return to Arcade Hub"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── EXPIRY / CONCLUSION BANNER ── */}
      {match.status === 'completed' ? (
        <div className="py-2 px-4 bg-amber-950/60 border-b border-amber-900/60 text-amber-300 text-xs font-bold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Battle Concluded • Result: <strong className="uppercase">{resultHeadline}</strong> (Avg: {teamAAvgScore.toFixed(1)} vs {teamBAvgScore.toFixed(1)})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setViewMode('result')}
            className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-black text-[11px] font-extrabold uppercase hover:bg-amber-400 transition-colors cursor-pointer"
          >
            View Result Screen
          </button>
        </div>
      ) : isExpired ? (
        <div className="py-2 px-4 bg-rose-950/80 border-b border-rose-900 text-rose-300 text-xs font-bold text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>Match time has concluded. All submissions are now frozen.</span>
        </div>
      ) : null}

      {/* ── QUESTION SELECTOR TABS ── */}
      <div className="px-4 md:px-6 py-2 bg-[#0A0E17] border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto shrink-0">
        {questions.map((q, idx) => {
          const isSelected = idx === selectedQuestionIndex
          const qSub = mySubmissions.find((s) => s.exercise_id === q.id)
          const isAnswered = Boolean(qSub)
          const isPassed = qSub?.status === 'passed' || qSub?.result === 'correct'
          const accessible = isQuestionAccessible(idx)

          return (
            <button
              key={q.id}
              type="button"
              disabled={!accessible}
              onClick={() => {
                if (!accessible) return
                setSelectedQuestionIndex(idx)
                setTestResults([])
                setTestStatus(null)
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap border ${
                !accessible
                  ? 'bg-slate-950/40 text-slate-600 border-slate-900 cursor-not-allowed opacity-50'
                  : isSelected
                  ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
              title={!accessible ? `Complete quest #${idx} first to unlock` : q.title}
            >
              <span className="font-mono text-[11px]">#{idx + 1}</span>
              <span className="truncate max-w-32">{q.title}</span>
              {!accessible ? (
                <Lock className="w-3 h-3 text-slate-600 shrink-0" />
              ) : isAnswered ? (
                isPassed ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>+100 CP</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-rose-400 font-mono">
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>0 CP</span>
                  </span>
                )
              ) : (
                renderQuestionTypeBadge(q.question_type)
              )}
            </button>
          )
        })}
      </div>

      {/* ── MAIN PLAYGROUND BODY ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* LEFT: Quest Details & Instructions (40% on desktop) */}
        <div className="w-full md:w-5/12 p-4 md:p-6 overflow-y-auto flex flex-col gap-4 border-r border-slate-800 bg-[#0B0F19]">
          {activeQuestion ? (
            <>
              {/* Question Header */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Quest #{selectedQuestionIndex + 1} of {questions.length}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {renderQuestionTypeBadge(activeQuestion.question_type)}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {activeQuestion.difficulty}
                    </span>
                  </div>
                </div>
                <h1 className="text-xl font-extrabold text-white leading-tight">
                  {activeQuestion.title}
                </h1>
              </div>

              {/* Persistent Answer Result Banner (Requirement 1, 2, 3) */}
              {isCurrentQuestionAnswered && activeSubmission && (
                <div
                  className={`p-3.5 rounded-xl border flex flex-col gap-2 ${
                    isCurrentCorrect
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {isCurrentCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span className="uppercase tracking-wider">
                        {isCurrentCorrect ? 'Correct Result' : 'Wrong Result'}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-black ${
                        isCurrentCorrect
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {isCurrentCorrect ? '+100 Combat Points' : '+0 Combat Points'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {isCurrentCorrect
                      ? `Passed all ${activeSubmission.total_count} test cases. Result locked in permanently.`
                      : `Passed ${activeSubmission.passed_count}/${activeSubmission.total_count} test cases. Result locked in permanently.`}
                  </p>
                </div>
              )}

              {/* Mode Explainer Banner */}
              {activeQuestion.question_type === 'debugging' && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-600/30 text-amber-300 text-xs flex items-start gap-2">
                  <Bug className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Debug Mode:</strong> Fix the bug in the provided starter code so all test cases pass cleanly.
                  </span>
                </div>
              )}
              {activeQuestion.question_type === 'algorithm' && (
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-600/30 text-purple-300 text-xs flex items-start gap-2">
                  <Cpu className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Algorithm Challenge:</strong> Implement an optimal algorithmic solution meeting the problem requirements.
                  </span>
                </div>
              )}

              {/* Instructions */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Instructions
                </span>
                <div className="text-xs leading-relaxed text-slate-300 space-y-2 whitespace-pre-line bg-black/30 p-3.5 rounded-xl border border-slate-800">
                  {activeQuestion.instructions || activeQuestion.description}
                </div>
              </div>

              {/* Sample Input */}
              {activeQuestion.sample_input && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Sample Input / Output
                  </span>
                  <pre className="p-3 rounded-xl bg-black/50 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
                    {activeQuestion.sample_input}
                  </pre>
                </div>
              )}

              {/* Hints Accordion */}
              {activeQuestion.hints && activeQuestion.hints.length > 0 && (
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowHints(!showHints)}
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{showHints ? 'Hide Hints' : 'View Runic Hints'}</span>
                  </button>
                  {showHints && (
                    <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 space-y-1">
                      {activeQuestion.hints.map((h, i) => (
                        <p key={i} className="leading-relaxed">
                          • {h}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-xs text-slate-400 text-center py-20">No quest selected.</div>
          )}
        </div>

        {/* RIGHT: Independent Monaco Workspace (60% on desktop) */}
        <div className="w-full md:w-7/12 flex flex-col bg-[#070A10]">
          {/* Editor Header Bar */}
          <div className="h-10 px-4 bg-[#0B0F19] border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 font-bold">
                Individual Workspace ({monacoLang})
              </span>
              {isCurrentQuestionAnswered && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isCurrentCorrect
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {isCurrentCorrect ? '✓ CORRECT (+100 CP)' : '✗ WRONG (0 CP)'}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {isCurrentQuestionAnswered
                ? 'Answer locked • Read only'
                : 'Independent coding • No shared sync'}
            </span>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-[300px]">
            <Editor
              height="100%"
              language={monacoLang}
              theme="vs-dark"
              value={currentCode}
              onChange={handleCodeChange}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                readOnly: isExpired || isCurrentQuestionAnswered,
              }}
            />
          </div>

          {/* Test Results Output Panel */}
          {testResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto p-3.5 bg-[#05080E] border-t border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Execution Output
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    testStatus === 'passed'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {testStatus === 'passed' ? 'PASSED ALL TESTS' : 'TESTS FAILED'}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {testResults.map((tr, idx) => (
                  <div
                    key={tr.testCaseId || idx}
                    className={`p-2 rounded-lg border text-xs font-mono flex flex-col gap-1 ${
                      tr.passed
                        ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>Test Case #{tr.orderIndex}</span>
                      <span>{tr.passed ? '✓ Passed' : '✗ Failed'}</span>
                    </div>
                    {tr.error && (
                      <div className="text-[11px] text-rose-400 break-words">{tr.error}</div>
                    )}
                    {tr.input && (
                      <div className="text-[10px] text-slate-400 truncate">Input: {tr.input}</div>
                    )}
                    {tr.expectedOutput && (
                      <div className="text-[10px] text-slate-400 truncate">
                        Expected: {tr.expectedOutput}
                      </div>
                    )}
                    {tr.actualOutput && (
                      <div className="text-[10px] text-slate-300 truncate">
                        Actual: {tr.actualOutput}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editor Action Bottom Bar (Requirement 3, 4, 5, 7, 8) */}
          <div className="p-3 bg-[#0B0F19] border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              {isCurrentQuestionAnswered ? (
                <span className="text-xs font-bold font-mono text-slate-300 flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isCurrentCorrect ? 'bg-emerald-400' : 'bg-rose-500'
                    }`}
                  />
                  <span>
                    Answer Recorded: {isCurrentCorrect ? 'Correct (+100 CP)' : 'Wrong (0 CP)'}
                  </span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                  Test locally or submit solution
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {isCurrentQuestionAnswered ? (
                selectedQuestionIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedQuestionIndex(selectedQuestionIndex + 1)
                      setTestResults([])
                      setTestStatus(null)
                    }}
                    className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <span>Next Question (#{selectedQuestionIndex + 2})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setViewMode('result')}
                    className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>View Challenge Results</span>
                  </button>
                )
              ) : (
                <>
                  <button
                    type="button"
                    disabled={isRunning || isSubmitting || isExpired}
                    onClick={handleRunTests}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isRunning ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>Run Tests</span>
                  </button>
                  <button
                    type="button"
                    disabled={isRunning || isSubmitting || isExpired}
                    onClick={handleSubmitSolution}
                    className="px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Submit Solution</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── SIDE DRAWER: REALTIME SCOREBOARD / ROSTER ── */}
        {showRoster && (
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-[#0E1322] border-l border-slate-800 p-5 flex flex-col gap-4 shadow-2xl z-20 animate-in slide-in-from-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="font-extrabold text-sm text-white">Live Duel Scoreboard</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRoster(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Score summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/40 flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold text-blue-300 block truncate">
                  {match.team_a?.name || 'Squad A'}
                </span>
                <span className="text-lg font-black text-white">
                  {teamAAvgScore.toFixed(1)}{' '}
                  <span className="text-[10px] text-slate-400 font-sans font-normal">avg</span>
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {teamAPassedCount} solved • 🏰 {match.team_a?.turf_count ?? 1} Turf
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold text-rose-300 block truncate">
                  {match.team_b?.name || 'Squad B'}
                </span>
                <span className="text-lg font-black text-white">
                  {teamBAvgScore.toFixed(1)}{' '}
                  <span className="text-[10px] text-slate-400 font-sans font-normal">avg</span>
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {teamBPassedCount} solved • 🏰 {match.team_b?.turf_count ?? 1} Turf
                </span>
              </div>
            </div>

            {/* Submissions List */}
            <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Submissions Feed ({submissions.length})
                </span>
                <span className="text-[9px] text-slate-500 font-mono">100 CP per quest</span>
              </div>
              {submissions.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-8">
                  No submissions yet in this duel.
                </div>
              ) : (
                submissions.map((s) => {
                  const isTeamA = s.team_id === match.team_a_id
                  const questObj = questions.find((q) => q.id === s.exercise_id)
                  const points = s.combat_points ?? (s.status === 'passed' ? 100 : 0)

                  return (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-xl bg-black/40 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold truncate text-slate-200">
                          {s.profile?.username || s.profile?.full_name || 'Warrior'}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                          {questObj?.title || 'Quest'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            isTeamA
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {isTeamA ? 'Team A' : 'Team B'}
                        </span>
                        {s.status === 'passed' ? (
                          <span className="text-emerald-400 font-mono font-bold text-xs">
                            +{points} CP
                          </span>
                        ) : (
                          <span className="text-rose-400 text-xs font-mono">0 CP</span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
