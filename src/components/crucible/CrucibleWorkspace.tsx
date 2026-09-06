import React, { useState, useCallback, useEffect } from 'react'
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Loader2,
  CloudCheck,
  Sparkles,
  Award,
  Flame,
  CheckCircle2,
  Code2,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import type { Challenge, ChallengeProgress } from '../../lib/challenges'
import { recordChallengeSubmission, fetchChallengeById } from '../../lib/challenges'
import { executeCode, type ExecutionResult } from '../../lib/execution'
import { getCrucibleChallenge } from './challengeData'
import { ChallengeBriefing } from './ChallengeBriefing'
import { CodeEditorPane } from './CodeEditorPane'
import { ExecutionConsole } from './ExecutionConsole'
import { VictoryModal } from './VictoryModal'
import type { TestCaseResult } from './TestCaseList'
import { useTheme } from '../../context/ThemeContext'

// ─── Naive test evaluator ────────────────────────────────────────────────────
function deriveTestCases(
  challenge: Challenge,
  result: ExecutionResult
): TestCaseResult[] {
  const stdout = (result.stdout ?? '').trim()
  const isError = result.status !== 'success'

  if (!challenge.sample_input) {
    return [
      {
        index: 0,
        label: 'Execution passes without errors',
        passed: !isError && stdout.length > 0,
        expected: 'Successful execution with valid output',
        actual: stdout || (isError ? result.stderr : 'No output'),
      },
    ]
  }

  // Split sample_input into expected lines (each line is a test expectation)
  const lines = challenge.sample_input.split('\n').map((l) => l.trim()).filter(Boolean)
  const outputLines = stdout.split('\n').map((l) => l.trim())

  return lines.map((expected, i) => {
    const actual = outputLines[i] ?? ''
    const passed = !isError && actual === expected
    return {
      index: i,
      label: `Output line ${i + 1}`,
      passed,
      expected,
      actual,
    }
  })
}

interface CrucibleWorkspaceProps {
  challenge?: Challenge
  challengeId?: string
  progress?: ChallengeProgress
  userId?: string
  onBack: () => void
  onNextChallenge?: () => void
  onCompleted?: () => void
}

export const CrucibleWorkspace: React.FC<CrucibleWorkspaceProps> = ({
  challenge: propChallenge,
  challengeId,
  progress,
  userId,
  onBack,
  onNextChallenge,
  onCompleted,
}) => {
  const { theme } = useTheme()
  const [challenge, setChallenge] = useState<Challenge>(
    propChallenge || (challengeId ? getCrucibleChallenge(challengeId) : null) || getCrucibleChallenge('reverse-string')!
  )
  const [loadingChallenge, setLoadingChallenge] = useState<boolean>(!propChallenge && !!challengeId)

  useEffect(() => {
    let isMounted = true
    if (propChallenge) {
      setChallenge(propChallenge)
      setLoadingChallenge(false)
      return
    }
    if (challengeId) {
      setLoadingChallenge(true)
      fetchChallengeById(challengeId).then((data) => {
        if (isMounted) {
          if (data) {
            setChallenge(data)
          } else {
            const fallback = getCrucibleChallenge(challengeId) || getCrucibleChallenge('reverse-string')!
            setChallenge(fallback)
          }
          setLoadingChallenge(false)
        }
      })
    }
    return () => {
      isMounted = false
    }
  }, [propChallenge, challengeId])

  const [code, setCode] = useState(challenge.starter_code ?? `# Write your solution here\n`)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<ExecutionResult | null>(null)
  const [tests, setTests] = useState<TestCaseResult[]>([])
  const [executionTimeMs, setExecutionTimeMs] = useState<number | undefined>()
  const [isCompleted, setIsCompleted] = useState(progress?.is_completed ?? false)
  const [showVictory, setShowVictory] = useState(false)

  // Pane collapse state
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)

  const lang = challenge.language ?? 'python'

  // Reset state when challenge changes
  useEffect(() => {
    setCode(challenge.starter_code ?? `# Write your solution here\n`)
    setResult(null)
    setTests([])
    setExecutionTimeMs(undefined)
    setIsCompleted(progress?.is_completed ?? false)
    setShowVictory(false)
  }, [challenge.id, challenge.starter_code, progress?.is_completed])

  // 1. Run / Test Action (Sandbox testing)
  const handleRun = useCallback(async () => {
    if (isRunning || isSubmitting) return
    setIsRunning(true)
    setResult(null)
    setTests([])
    const start = Date.now()

    try {
      const execResult = await executeCode(lang, code, '', challenge.id)
      const elapsed = Date.now() - start
      setExecutionTimeMs(execResult.execution_time ?? elapsed)
      setResult(execResult)

      const derivedTests = deriveTestCases(challenge, execResult)
      setTests(derivedTests)

      const allPassed = derivedTests.every((t) => t.passed)
      if (allPassed) {
        toast.success('Test run passed! You can now Submit Solution.', { id: 'test-run' })
      } else {
        toast('Some tests did not match. Check the Test Cases tab.', { icon: 'ℹ️', id: 'test-run' })
      }
    } catch (err: any) {
      toast.error('Execution error: ' + (err?.message || 'Failed to run code'))
    } finally {
      setIsRunning(false)
    }
  }, [isRunning, isSubmitting, lang, code, challenge])

  // 2. Official Submit Action (Evaluates and syncs with Supabase)
  const handleSubmit = useCallback(async () => {
    if (isRunning || isSubmitting) return
    setIsSubmitting(true)
    setIsRunning(true)
    setResult(null)
    setTests([])
    const start = Date.now()

    try {
      const execResult = await executeCode(lang, code, '', challenge.id)
      const elapsed = Date.now() - start
      setExecutionTimeMs(execResult.execution_time ?? elapsed)
      setResult(execResult)

      const derivedTests = deriveTestCases(challenge, execResult)
      setTests(derivedTests)

      const allPassed = derivedTests.every((t) => t.passed)

      if (allPassed) {
        setIsCompleted(true)

        // Save to Supabase
        if (userId) {
          const submission = await recordChallengeSubmission(
            userId,
            challenge.id,
            true,
            100,
            code,
            challenge.xp_reward ?? 75
          )

          if (submission.success) {
            toast.success(`Victory! +${submission.xpEarned || challenge.xp_reward || 75} XP saved to Supabase.`, {
              id: 'challenge-submit',
            })
          }
        } else {
          // Guest mode completion
          try {
            const raw = localStorage.getItem('olympus_completed_challenges') || '[]'
            const list = JSON.parse(raw)
            if (!list.includes(challenge.id)) list.push(challenge.id)
            localStorage.setItem('olympus_completed_challenges', JSON.stringify(list))
          } catch {}
          toast.success('Challenge solved! Log in to save your XP to the cloud.', { id: 'challenge-submit' })
        }

        // Trigger parent callback to refresh profile XP and streak in header
        onCompleted?.()

        // Show gamified victory modal
        setShowVictory(true)
      } else {
        if (userId) {
          recordChallengeSubmission(userId, challenge.id, false, 0, code).catch(console.error)
        }
        toast.error('Test cases failed. Check output console and try again!', { id: 'challenge-submit' })
      }
    } catch (err: any) {
      console.error('Error submitting trial:', err)
      toast.error('Submission error: ' + (err?.message || 'Could not complete submission'))
    } finally {
      setIsRunning(false)
      setIsSubmitting(false)
    }
  }, [isRunning, isSubmitting, lang, code, challenge, userId, onCompleted])

  const handleReset = useCallback(() => {
    setCode(challenge.starter_code ?? `# Write your solution here\n`)
    setResult(null)
    setTests([])
    setExecutionTimeMs(undefined)
  }, [challenge.starter_code])

  const handleInspectSolution = useCallback(() => {
    setShowVictory(false)
  }, [])

  const isGow = theme === 'gow'
  const isSpiderman = theme === 'spiderman'

  // Dynamic theme gradients and borders
  const workspaceBg = isGow
    ? 'linear-gradient(135deg, #120808 0%, #1A0E0E 50%, #0E0606 100%)'
    : isSpiderman
    ? 'linear-gradient(135deg, #090E18 0%, #0E1626 50%, #131B2D 100%)'
    : 'linear-gradient(135deg, #0B0F19 0%, #111827 50%, #0D1527 100%)'

  const topBarBg = isGow
    ? 'rgba(20, 12, 12, 0.95)'
    : isSpiderman
    ? 'rgba(15, 23, 42, 0.95)'
    : 'rgba(15, 23, 42, 0.92)'

  const borderCol = isGow
    ? 'rgba(245, 158, 11, 0.25)'
    : isSpiderman
    ? 'rgba(14, 165, 233, 0.3)'
    : 'rgba(51, 65, 85, 0.5)'

  if (loadingChallenge) {
    return (
      <div
        className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 text-slate-200"
        style={{ background: workspaceBg }}
      >
        <div className="relative">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
          <div className="absolute inset-0 blur-xl bg-emerald-500/30 -z-10" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-base font-bold tracking-wide">
            Entering Challenge Arena...
          </span>
          <span className="text-xs text-slate-400">Loading trial data from Supabase Cloud</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col select-none font-sans overflow-hidden"
      style={{ background: workspaceBg }}
    >
      {/* ── Top Workspace Header ───────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-2.5 shrink-0 border-b backdrop-blur-md shadow-md z-10"
        style={{ background: topBarBg, borderColor: borderCol }}
      >
        {/* Left: Back button & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 border transition-all active:scale-[0.97]"
            style={{ borderColor: borderCol }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Arena</span>
          </button>

          <div className="h-4 w-px bg-slate-700/60 hidden sm:block" />

          {/* Title & Language */}
          <div className="flex items-center gap-2">
            <span className="text-base">
              {challenge.language?.toLowerCase().includes('py') ? '🐍' : '⚡'}
            </span>
            <span className="font-bold text-sm text-white truncate max-w-[180px] sm:max-w-xs md:max-w-md">
              {challenge.title}
            </span>
          </div>

          {/* XP Badge */}
          <div
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border"
            style={{
              background: 'rgba(245, 158, 11, 0.12)',
              borderColor: 'rgba(245, 158, 11, 0.35)',
              color: '#F59E0B',
            }}
          >
            <Sparkles className="w-3 h-3" />
            <span>+{challenge.xp_reward ?? 75} XP</span>
          </div>
        </div>

        {/* Right: Supabase Sync Badge & Pane toggles */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cloud sync status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Supabase Cloud Connected</span>
          </div>

          {/* Pane toggles */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setLeftCollapsed(!leftCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 border transition-all"
              style={{ borderColor: borderCol }}
              title="Toggle Instructions Pane"
            >
              {leftCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setRightCollapsed(!rightCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 border transition-all"
              style={{ borderColor: borderCol }}
              title="Toggle Test Results Pane"
            >
              {rightCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Tri-Pane Layout ─────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Pane 1: Problem Briefing (28%) */}
        {!leftCollapsed && (
          <div
            className="flex flex-col shrink-0 overflow-hidden border-r shadow-lg transition-all"
            style={{
              width: '28%',
              minWidth: '260px',
              maxWidth: '420px',
              borderColor: borderCol,
            }}
          >
            <ChallengeBriefing
              challenge={challenge}
              progress={progress}
              isCompleted={isCompleted}
              themeKey={theme}
            />
          </div>
        )}

        {/* Pane 2: Code Editor Pane (center, flex-1) */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <CodeEditorPane
            code={code}
            language={lang}
            isRunning={isRunning}
            isSubmitting={isSubmitting}
            isCompleted={isCompleted}
            themeKey={theme}
            onCodeChange={setCode}
            onRun={handleRun}
            onSubmit={handleSubmit}
            onReset={handleReset}
          />
        </div>

        {/* Pane 3: Verification / Runestone Console (28%) */}
        {!rightCollapsed && (
          <div
            className="flex flex-col shrink-0 overflow-hidden border-l shadow-lg transition-all"
            style={{
              width: '28%',
              minWidth: '260px',
              maxWidth: '420px',
              borderColor: borderCol,
            }}
          >
            <ExecutionConsole
              result={result}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
              tests={tests}
              executionTimeMs={executionTimeMs}
              themeKey={theme}
            />
          </div>
        )}
      </div>

      {/* Victory Modal */}
      {showVictory && (
        <VictoryModal
          xpReward={challenge.xp_reward ?? 75}
          challengeTitle={challenge.title}
          themeKey={theme}
          onNextTrial={() => {
            setShowVictory(false)
            onNextChallenge?.()
          }}
          onInspectSolution={handleInspectSolution}
          onClose={() => setShowVictory(false)}
        />
      )}
    </div>
  )
}
