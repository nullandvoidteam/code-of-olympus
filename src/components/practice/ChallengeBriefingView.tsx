import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  BarChart2,
  Star,
  Bookmark,
  BookmarkCheck,
  Lightbulb,
  Sparkles,
  ChevronDown,
  Shield,
  X,
} from 'lucide-react'
import { LumiPixelBot, PixelPythonIcon } from '../brand/PixelArtAvatars'
import { useAuth } from '../../context/AuthContext'
import { checkIsChallengeSaved, saveChallenge, unsaveChallenge, fetchChallengeById, type Challenge } from '../../lib/challenges'
import { supabase } from '../../lib/supabase'
import { getCrucibleChallenge } from '../crucible/challengeData'

interface ChallengeBriefingViewProps {
  challengeId?: string
  onBack?: () => void
  onStartChallenge?: () => void
  onPreviousChallenge?: () => void
}

export const ChallengeBriefingView: React.FC<ChallengeBriefingViewProps> = ({
  challengeId,
  onBack,
  onStartChallenge,
  onPreviousChallenge,
}) => {
  const { user } = useAuth()
  const [challenge, setChallenge] = useState<Challenge | null>(
    challengeId ? getCrucibleChallenge(challengeId) : null
  )
  const [loading, setLoading] = useState<boolean>(!challenge && !!challengeId)
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hintRevealed, setHintRevealed] = useState(false)
  const [lumiOpen, setLumiOpen] = useState(false)
  const [activeLumiBtn, setActiveLumiBtn] = useState<'hint' | 'explain' | 'debug' | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    let isMounted = true
    if (challengeId) {
      // 1. Check saved status
      checkIsChallengeSaved(user?.id || '', challengeId).then((res) => {
        if (isMounted) setSaved(res)
      })

      // 2. Check completed status from local storage
      try {
        const raw = localStorage.getItem('olympus_completed_challenges') || '[]'
        const localList: string[] = JSON.parse(raw)
        if (localList.includes(challengeId)) {
          if (isMounted) setIsCompleted(true)
        }
      } catch {}

      // 3. Check completed status from Supabase
      if (user?.id) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(challengeId)
        const checkSupabase = async () => {
          let targetUuid = challengeId
          if (!isUuid) {
            const ch = await fetchChallengeById(challengeId)
            if (ch?.id) targetUuid = ch.id
          }
          const { data } = await supabase
            .from('challenge_progress')
            .select('is_completed')
            .eq('user_id', user.id)
            .eq('challenge_id', targetUuid)
            .maybeSingle()
          if (data?.is_completed && isMounted) {
            setIsCompleted(true)
          }
        }
        checkSupabase()
      }

      // 4. Fetch challenge details
      fetchChallengeById(challengeId).then((data) => {
        if (isMounted) {
          if (data) {
            setChallenge(data)
          } else {
            setChallenge(getCrucibleChallenge(challengeId) || getCrucibleChallenge('reverse-string'))
          }
          setLoading(false)
        }
      })
    }
    return () => {
      isMounted = false
    }
  }, [user?.id, challengeId])

  const handleToggleSave = async () => {
    if (!user || !challengeId || isSaving) return
    setIsSaving(true)
    if (saved) {
      const success = await unsaveChallenge(user.id, challengeId)
      if (success) setSaved(false)
    } else {
      const success = await saveChallenge(user.id, challengeId)
      if (success) setSaved(true)
    }
    setIsSaving(false)
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-6 text-left pb-16 font-sans select-none animate-in fade-in duration-300">

      {/* ================================================================ */}
      {/* 2-COLUMN LAYOUT                                                   */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

        {/* ============================================================== */}
        {/* MAIN CONTENT COLUMN (~74%)                                      */}
        {/* ============================================================== */}
        <div className="xl:col-span-9 flex flex-col gap-6">

          {/* Back link */}
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Challenges
          </button>

          {/* ── A. CHALLENGE HEADER BANNER ── */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Decorative background gradient */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-50/40 blur-3xl pointer-events-none" />

            {/* Left content */}
            <div className="flex flex-col gap-3 z-10 flex-1">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-pixel text-[10px] font-bold uppercase tracking-wider">
                  🌿 {challenge?.difficulty || 'BEGINNER'}
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200 font-pixel text-[10px] font-bold uppercase tracking-wider">
                  <PixelPythonIcon size={12} /> {(challenge?.language || 'PYTHON').toUpperCase()}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                {challenge?.title || 'Reverse the String'}
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-lg">
                {challenge?.description || 'Write a function that solves this coding challenge.'}
              </p>

              {/* Meta pill strip */}
              <div className="flex items-center gap-3 flex-wrap text-xs font-semibold mt-1">
                <span className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  ~{challenge?.difficulty?.toLowerCase() === 'hard' ? '25' : challenge?.difficulty?.toLowerCase() === 'medium' ? '15' : '5'} min
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                  <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
                  {challenge?.category || challenge?.language || 'Algorithms'}
                </span>
                <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  +{challenge?.xp_reward ?? 75} XP
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-bold">
                  Difficulty: {challenge?.difficulty || 'Easy'}
                </span>
              </div>
            </div>

            {/* Right pixel art */}
            <div className="z-10 shrink-0 flex items-center justify-center relative w-56 h-40">
              {/* Code rune floaters */}
              <div className="absolute top-1 left-3 font-mono text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded rotate-[-7deg] shadow-xs">{`{}`}</div>
              <div className="absolute top-0 right-6 font-mono text-[9px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded rotate-[5deg] shadow-xs">while</div>
              <div className="absolute bottom-5 left-4 font-mono text-[9px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded rotate-[-3deg] shadow-xs">fn()</div>

              {/* CRT monitor graphic */}
              <div className="flex flex-col items-center gap-2">
                <div className="bg-slate-800 rounded-xl px-6 py-4 border-4 border-slate-700 shadow-lg">
                  <div className="font-mono text-xs text-emerald-400 flex flex-col items-center gap-1">
                    <span className="text-slate-300">HELLO</span>
                    <span className="text-slate-500 text-[10px]">→</span>
                    <span className="text-emerald-400 font-bold">OLLEH</span>
                  </div>
                </div>
                <div className="w-12 h-1.5 bg-slate-500 rounded" />
                <div className="w-20 h-2 bg-slate-600 rounded-sm" />
              </div>

              <div className="absolute bottom-2 right-2">
                <LumiPixelBot size={28} glowing={false} />
              </div>
            </div>
          </div>

          {/* ── B. CALL-TO-ACTION STRIP ── */}
          <div className="bg-emerald-50/40 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-sm text-slate-900">
                  {isCompleted ? 'Trial already conquered!' : 'Ready to take on the challenge?'}
                </span>
                <span className="text-xs text-slate-500 leading-snug">
                  {isCompleted
                    ? 'You have already solved this challenge and earned its rewards. This trial is closed to prevent duplicate completions.'
                    : 'Read the requirements below, then enter the coding workspace and put your skills to work. You can leave and return anytime. Your progress will be saved.'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {isCompleted ? (
                <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-sm cursor-not-allowed select-none shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Solved (Closed)</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onStartChallenge}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md cursor-pointer transition-all active:scale-95"
                >
                  Start Challenge
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleToggleSave}
                disabled={isSaving}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm cursor-pointer transition-colors ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {saved ? <BookmarkCheck className="w-4 h-4 text-emerald-600" /> : <Bookmark className="w-4 h-4" />}
                {saved ? 'Saved!' : 'Save for Later'}
              </button>
            </div>
          </div>

          {/* ── C. MISSION & REQUIREMENTS GRID ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Your Mission */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
                <span>🎯</span> Your Mission
              </div>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {challenge?.instructions || challenge?.description || 'Implement the solution according to the technical requirements and tests.'}
              </p>

              {/* Starter Code Preview */}
              {challenge?.starter_code && (
                <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 space-y-1 overflow-x-auto">
                  <div className="text-[10px] font-pixel font-bold text-slate-400 uppercase tracking-wider">Starter Template</div>
                  <pre className="text-xs font-mono text-emerald-400 leading-tight">
                    {challenge.starter_code.slice(0, 200)}
                  </pre>
                </div>
              )}
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3">
              <div className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
                Requirements & Constraints
              </div>
              <div className="flex flex-col gap-2.5">
                {(challenge?.instructions
                  ? challenge.instructions.split('\n').map((s) => s.replace(/^[-*•]\s*/, '').trim()).filter((s) => s.length > 5 && !s.startsWith('#')).slice(0, 4)
                  : [
                      `Language target: ${(challenge?.language || 'python').toUpperCase()}`,
                      `Execution must pass sample inputs and outputs`,
                      `Earn ${challenge?.xp_reward ?? 75} XP upon successful validation`,
                      `Clean syntax without runtime exceptions`,
                    ]
                ).map((r) => (
                  <div key={r} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                    </div>
                    <span className="leading-relaxed">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── D. TECHNICAL SPECIFICATIONS GRID ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Constraints */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2.5">Constraints</div>
              <div className="flex flex-col gap-2 text-xs">
                {[
                  ['Language', (challenge?.language || 'python').toUpperCase()],
                  ['Category', challenge?.category || 'Algorithms'],
                  ['XP Reward', `+${challenge?.xp_reward ?? 75} XP`],
                  ['Difficulty', challenge?.difficulty || 'Easy'],
                  ['Status', challenge?.is_published ? 'Verified' : 'Draft'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-2">
                    <span className="text-slate-500 shrink-0">{k}</span>
                    <span className="font-semibold text-slate-800 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Concepts */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2.5">Concepts You'll Practice</div>
              <div className="flex flex-wrap gap-2">
                {[challenge?.language || 'Python', challenge?.category || 'Algorithms', 'Logic', 'Problem Solving', 'Data Structures'].map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Hint card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-2.5">
                <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400" />
                Need a Hint?
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {hintRevealed && challenge?.hints && challenge.hints.length > 0
                  ? challenge.hints.join(' • ')
                  : 'Think through algorithmic edge cases, inputs, and structure.'}
              </p>

              {/* Hint reveal */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setHintRevealed(!hintRevealed)}
                  className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  <span>{hintRevealed ? 'Hide Hint' : 'Reveal Hint'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${hintRevealed ? 'rotate-180' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-lumi', {
                      detail: { prompt: 'Can you give me a concise hint for the Reverse the String challenge?' }
                    }))
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  Ask Lumi instead
                </button>
              </div>

              {hintRevealed && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-900 leading-relaxed animate-in fade-in duration-150 font-mono">
                  <p><span className="text-purple-600 font-bold">for</span> i <span className="text-emerald-600">in</span> <span className="text-sky-600">range</span>(<span className="text-sky-600">len</span>(s)<span className="text-slate-400">-1</span>, <span className="text-amber-600">-1</span>, <span className="text-amber-600">-1</span>):</p>
                  <p className="pl-3">result <span className="text-emerald-600">+=</span> s[i]</p>
                </div>
              )}
            </div>
          </div>

          {/* ── E. EXAMPLES & EDGE CASES ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Examples */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2.5">Examples</div>
              <div className="flex flex-col gap-3">
                {[
                  { n: '01', input: '"hello"', output: '"olleh"' },
                  { n: '02', input: '"Python"', output: '"nohtyP"' },
                  { n: '03', input: '"Coding Conflicts"', output: '"stcilfnoC gnidoC"' },
                ].map(ex => (
                  <div key={ex.n} className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-4">
                    <span className="font-pixel text-[10px] font-bold text-slate-400 shrink-0">Example {ex.n}</span>
                    <div className="flex items-center gap-2 flex-1 flex-wrap text-[11px] font-mono font-bold">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-slate-400 font-sans">Input</span>
                        <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-700 border border-rose-200">{ex.input}</span>
                      </div>
                      <span className="text-slate-400 text-xs">→</span>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-slate-400 font-sans">Output</span>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200">{ex.output}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Edge Cases */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2.5">
                Don't Forget
                <span className="ml-2 text-[10px] font-pixel text-slate-500 uppercase tracking-wider font-normal">Edge Cases</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  { case: 'Empty input', input: '""', output: '""' },
                  { case: 'One character', input: '"A"', output: '"A"' },
                  { case: 'Spaces', input: '"hi there"', output: '"ereht ih"' },
                  { case: 'Punctuation', input: '"Hi!"', output: '"!iH"' },
                ].map(e => (
                  <div key={e.case} className="flex items-center gap-3 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="text-slate-500 font-medium w-28 shrink-0">{e.case}</span>
                    <span className="font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">{e.input}</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{e.output}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT SIDEBAR (~26%)                                            */}
        {/* ============================================================== */}
        <div className="xl:col-span-3 flex flex-col gap-4">

          {/* A. Challenge Status Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="font-pixel text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-3">
              YOUR CHALLENGE
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-extrabold text-sm text-slate-900">Reverse the String</span>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                Not Started
              </div>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Difficulty</span>
                <div className="flex items-center gap-1">
                  <span className="text-emerald-700 font-bold">Easy</span>
                  <div className="flex gap-0.5 ml-1">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Est. Time</span>
                <span className="font-bold text-slate-800">5 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Reward</span>
                <span className="flex items-center gap-1 font-bold text-amber-700">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> +75 XP
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500 shrink-0">Skills</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {['Strings', 'Functions', 'Loops'].map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* B. Your Progress Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 font-pixel text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-3">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              YOUR PROGRESS
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Current Level</span>
              <span className="font-extrabold text-slate-900">12</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">XP Progress</span>
                <span className="font-mono font-bold text-emerald-600">4,850 / 5,000</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }} />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">78% to next level</span>
            </div>
          </div>

          {/* C. Lumi Assistant Card */}
          <div className="bg-indigo-50/40 rounded-3xl p-5 border border-indigo-100 shadow-sm text-center space-y-3">
            <div className="font-pixel text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
              LUMI IS HERE
            </div>
            <div className="flex justify-center">
              <LumiPixelBot size={46} glowing={false} />
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              "I won't solve the challenge for you. But I can help you think through it."
            </p>
            <div className="flex flex-col gap-2">
              {[
                { id: 'hint' as const, label: 'Give Me a Hint' },
                { id: 'explain' as const, label: 'Explain the Concept' },
                { id: 'debug' as const, label: 'Help Me Debug' },
              ].map(btn => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => {
                    setActiveLumiBtn(activeLumiBtn === btn.id ? null : btn.id)
                    setLumiOpen(true)
                  }}
                  className={`w-full py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors border ${
                    activeLumiBtn === btn.id
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {lumiOpen && activeLumiBtn && (
              <div className="text-left bg-white border border-indigo-200 rounded-xl p-3 text-xs text-slate-700 leading-relaxed animate-in fade-in duration-150">
                {activeLumiBtn === 'hint' && "Loop backwards through the string, collecting each character into a new one!"}
                {activeLumiBtn === 'explain' && "String reversal is about accessing characters from end to start using negative indices or a range loop."}
                {activeLumiBtn === 'debug' && "Check: does your loop start at len(s)-1 and go to 0? Is your step -1? Is the result being concatenated?"}
              </div>
            )}
          </div>

          {/* D. Complete This Challenge Reward Widget */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex justify-center text-4xl">💰</div>
            <div className="text-center">
              <div className="font-bold text-sm text-slate-900">Complete This Challenge</div>
              <div className="flex items-center justify-center gap-1 text-amber-700 font-bold mt-0.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>+75 XP</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs font-medium">
              <div className="flex items-center gap-2 text-slate-700">
                <span>🔥</span> Maintains your streak
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <span>🏆</span> Counts toward Weekly Quest
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10px] font-pixel text-slate-500">
                <span>150 XP remaining to next level</span>
              </div>
              <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '78%' }} />
              </div>
            </div>

            {isCompleted ? (
              <div className="w-full py-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-sm cursor-not-allowed select-none shadow-sm flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Solved (Closed)</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onStartChallenge}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm cursor-pointer transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                Start Challenge
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* BOTTOM FOOTER NAVIGATION                                         */}
      {/* ================================================================ */}
      <div className="mt-2 pt-4 flex items-center justify-between border-t border-slate-200/60 flex-wrap gap-4">
        <button
          type="button"
          onClick={onPreviousChallenge ?? onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Previous Challenge
        </button>

        <span className="text-xs text-slate-400 font-medium">Challenge 1 of 12</span>

        {isCompleted ? (
          <div className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-sm cursor-not-allowed select-none shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Solved (Closed)</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onStartChallenge}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm cursor-pointer transition-all shadow-md active:scale-95"
          >
            Start Challenge
            <Sparkles className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Lumi modal (when opened via Ask Lumi button) */}
      {lumiOpen && !activeLumiBtn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-indigo-200 shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LumiPixelBot size={32} />
                <span className="font-extrabold text-slate-900">Ask Lumi</span>
              </div>
              <button type="button" onClick={() => setLumiOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              "I'm ready to help! Here's a nudge in the right direction: iterate through the string from the last character to the first, building your result one character at a time."
            </p>
            <button
              type="button"
              onClick={() => setLumiOpen(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm cursor-pointer transition-colors"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
