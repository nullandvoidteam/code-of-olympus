import React, { useState } from 'react'
import {
  ArrowLeft,
  Check,
  Copy,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Clock,
  ChevronRight,
  X,
  Flame,
  Swords,
  Shield,
  ArrowRight,
  Terminal as TerminalIcon,
  Trophy,
  HelpCircle,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { useTheme } from '../../context/ThemeContext'

interface InteractiveLessonViewProps {
  onBackToCourse?: () => void
  onPreviousLesson?: () => void
  onNextLesson?: () => void
}

/* ========================================================================= */
/* CLASSIC GAMIFIED INTERACTIVE LESSON VIEW                                  */
/* ========================================================================= */
const ClassicInteractiveLessonView: React.FC<InteractiveLessonViewProps> = ({
  onBackToCourse,
  onPreviousLesson,
  onNextLesson,
}) => {
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D'>('A')
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false)
  const [quizResult, setQuizResult] = useState<'correct' | 'incorrect' | null>(null)
  const [copiedCode, setCopiedCode] = useState<boolean>(false)

  const handleCopyCode = () => {
    const code = `count = 3\n\nwhile count > 0:\n    print("Countdown:", count)\n    count -= 1\n\nprint("Blast off! 🚀")`
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleCheckQuiz = () => {
    setQuizSubmitted(true)
    if (selectedOption === 'A') {
      setQuizResult('correct')
      try {
        confetti({
          particleCount: 100,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'],
        })
      } catch {
        /* ignore */
      }
    } else {
      setQuizResult('incorrect')
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 text-left pb-20 select-none animate-in fade-in duration-300">
      {/* 1. TOP BREADCRUMB & BACK BUTTON */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToCourse}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer py-1.5"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
          <span>Back to Course</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Learn</span>
          <span>/</span>
          <span>Python Adventure</span>
          <span>/</span>
          <span>Chapter 04</span>
          <span>/</span>
          <span className="font-bold text-emerald-600">Lesson 03</span>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Main Lesson (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* A. Hero Lesson Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500 shadow-sm flex flex-col gap-4 relative overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Python • Chapter 04
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                +50 XP
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                The While Loop: Repeating with Purpose
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-2xl">
                A while loop repeats a block of code as long as a specified test condition evaluates to True. When the condition evaluates to False, the loop stops immediately and program flow resumes.
              </p>
            </div>

            {/* Objective Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 mt-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold uppercase text-emerald-800 tracking-wider">
                  Quest Objective
                </span>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Understand how while loop conditions work, how countdown variables step down, and how to avoid infinite loops.
                </p>
              </div>
            </div>
          </div>

          {/* B. Interactive Code Demonstration */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono font-bold text-slate-600 ml-2">
                  countdown.py
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-xs"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <div className="p-6 bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto">
              <div><span className="text-slate-500"># 1. Initialize counter</span></div>
              <div><span className="text-purple-400">count</span> = <span className="text-amber-400">3</span></div>
              <br />
              <div><span className="text-slate-500"># 2. Run as long as count is greater than 0</span></div>
              <div><span className="text-rose-400 font-bold">while</span> <span className="text-purple-400">count</span> &gt; <span className="text-amber-400">0</span>:</div>
              <div className="pl-6"><span className="text-blue-400">print</span>(<span className="text-emerald-300">&quot;Countdown:&quot;</span>, <span className="text-purple-400">count</span>)</div>
              <div className="pl-6"><span className="text-purple-400">count</span> -= <span className="text-amber-400">1</span>  <span className="text-slate-500"># Decrement counter</span></div>
              <br />
              <div><span className="text-blue-400">print</span>(<span className="text-emerald-300">&quot;Blast off! 🚀&quot;</span>)</div>
            </div>

            {/* Terminal Output */}
            <div className="p-5 bg-slate-950 border-t border-slate-800 text-slate-300 font-mono text-xs flex flex-col gap-1.5">
              <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1 mb-1">
                <TerminalIcon className="w-3 h-3 text-emerald-400" />
                <span>Console Output</span>
              </div>
              <div className="text-emerald-300">Countdown: 3</div>
              <div className="text-emerald-300">Countdown: 2</div>
              <div className="text-emerald-300">Countdown: 1</div>
              <div className="text-white font-bold">Blast off! 🚀</div>
            </div>
          </div>

          {/* C. Knowledge Check Quiz */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border-2 border-emerald-500/80 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center font-bold">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Check Your Knowledge
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Question 1 of 1
              </span>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
              What will be the final value stored in variable <code className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-purple-700 text-xs">count</code> when this loop completely finishes executing?
            </p>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'A' as const, text: '0 (The condition 0 > 0 terminates)' },
                { key: 'B' as const, text: '1 (The last printed number)' },
                { key: 'C' as const, text: '3 (The starting number)' },
                { key: 'D' as const, text: '-1 (It overshoots zero)' },
              ].map((opt) => {
                const isSelected = selectedOption === opt.key
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setSelectedOption(opt.key)
                      setQuizSubmitted(false)
                      setQuizResult(null)
                    }}
                    className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-sm scale-[1.01]'
                        : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      {opt.key}
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-snug">
                      {opt.text}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Submit Button & Feedback */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={handleCheckQuiz}
                className="btn-gamified-3d btn-gamified-3d-primary py-2.5 px-6 rounded-xl text-xs font-extrabold text-white cursor-pointer w-full sm:w-auto self-start flex items-center justify-center gap-2"
              >
                <span>Check Answer</span>
                <Check className="w-4 h-4" />
              </button>

              {quizSubmitted && quizResult === 'correct' && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
                  <span className="text-base shrink-0">🎉</span>
                  <div>
                    <span className="font-bold">Outstanding!</span> In the last iteration, count is 1. It prints 1, then <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded">count -= 1</code> drops it to 0. When the condition <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded">0 &gt; 0</code> is checked, it evaluates to False and the loop cleanly terminates!
                  </div>
                </div>
              )}

              {quizSubmitted && quizResult === 'incorrect' && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
                  <span className="text-base shrink-0">💡</span>
                  <div>
                    <span className="font-bold">Not quite.</span> Look closely at the decrement step <code className="font-mono bg-rose-100 px-1 py-0.5 rounded">count -= 1</code>. When count is 1, subtracting 1 gives 0. Since <code className="font-mono bg-rose-100 px-1 py-0.5 rounded">0 &gt; 0</code> is false, the loop stops with count set to 0.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar Navigation & Lumi Guidance (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Lumi AI Guidance */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-xl shrink-0">
                🤖
              </div>
              <div className="flex flex-col">
                <h4 className="font-bold text-xs text-slate-900">
                  Lumi&apos;s Adventure Tips
                </h4>
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                  AI Code Companion
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              &ldquo;Always remember to change the loop variable inside your while loop! If you forget <code className="font-mono text-purple-700 font-bold">count -= 1</code>, count stays 3 forever and your program gets trapped in an infinite loop!&rdquo;
            </p>
          </div>

          {/* Lesson Progress Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800">
                Chapter 04 Progress
              </span>
              <span className="text-xs font-bold text-emerald-600">
                75% Completed
              </span>
            </div>

            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }} />
            </div>

            <div className="flex flex-col gap-2 pt-1 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" /> Lesson 01: For Loops
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">Done</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" /> Lesson 02: Loop Ranges
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">Done</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700 font-bold">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Lesson 03: While Loops
                </span>
                <span className="text-[10px] font-extrabold text-emerald-600">Active</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full border border-slate-300" /> Lesson 04: Loop Master
                </span>
                <span className="text-[10px]">Next</span>
              </div>
            </div>

            {/* Next Lesson / Challenge CTA */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={onNextLesson}
                className="btn-gamified-3d btn-gamified-3d-primary w-full py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Challenge</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onPreviousLesson || onBackToCourse}
                className="w-full py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-center"
              >
                Previous Lesson
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ========================================================================= */
/* GOD OF WAR INTERACTIVE LESSON VIEW (UNCHANGED)                            */
/* ========================================================================= */
const GodOfWarInteractiveLessonView: React.FC<InteractiveLessonViewProps> = ({
  onBackToCourse,
  onPreviousLesson,
  onNextLesson,
}) => {
  // 1. Interactive Quiz State
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D'>('B')
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false)
  const [quizResult, setQuizResult] = useState<'correct' | 'incorrect' | null>(null)

  // 2. Code Block Copy States
  const [copiedMainCode, setCopiedMainCode] = useState<boolean>(false)

  // 3. Mimir Oracle Interactive Help Drawer State
  const [activeMimirTip, setActiveMimirTip] = useState<'hint' | 'simple' | 'example' | null>(null)

  // Copy handler
  const handleCopyMainCode = () => {
    const code = `rage = 3\n\nwhile rage > 0:\n    print("Strike with Chaos Blades!")\n    rage -= 1`
    navigator.clipboard.writeText(code)
    setCopiedMainCode(true)
    setTimeout(() => setCopiedMainCode(false), 2000)
  }

  // Quiz Check Handler
  const handleCheckAnswer = () => {
    setQuizSubmitted(true)
    if (selectedOption === 'A') {
      setQuizResult('correct')
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.7 },
        })
      } catch {
        // ignore in test environments
      }
    } else {
      setQuizResult('incorrect')
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 text-left pb-20 select-none animate-in fade-in duration-300 font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP SUBTLE BREADCRUMB                                                   */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToCourse}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#A89898] hover:text-[#FF5722] hover:bg-[#1A0C0C] px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-[#3D1C1C]"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#FF3D00]" />
          <span style={{ fontFamily: "'Cinzel', serif" }} className="tracking-wider">
            PYTHON SAGA / HELHEIM LOOPS / CHAMBER 03
          </span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#7A6A6A] font-medium">
          <span style={{ fontFamily: "'Cinzel', serif" }}>TRIAL IV</span>
          <span>•</span>
          <span
            style={{ fontFamily: "'Cinzel', serif" }}
            className="text-[#FF5722] font-bold tracking-wider"
          >
            CHAMBER 03 OF 04
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN 2-COLUMN LAYOUT (~75% Main Content / ~25% Right Sidebar)          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================================= */}
        {/* LEFT COLUMN: MAIN LESSON CONTENT (~75% = 9 Cols on XL / 8 on LG)        */}
        {/* ======================================================================= */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
          {/* --------------------------------------------------------------------- */}
          {/* A. LESSON HEADER CARD (WAR ALTAR)                                     */}
          {/* --------------------------------------------------------------------- */}
          <div className="bg-gradient-to-br from-[#180A0A] via-[#0E0505] to-[#0A0404] rounded-2xl p-6 sm:p-7 border-2 border-[#8C2828] shadow-[0_8px_32px_rgba(0,0,0,0.85)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-32 bg-[#FF3D00]/10 blur-[80px] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FF3D00] to-transparent" />

            <div className="flex flex-col gap-1.5 flex-1 max-w-xl relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF3D00] animate-pulse" />
                <span
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="text-[#FF5722] text-[11px] font-black uppercase tracking-[0.2em]"
                >
                  TRIAL IV • CHAMBER 03
                </span>
              </div>
              <h1
                style={{ fontFamily: "'Cinzel', serif" }}
                className="text-2xl sm:text-3xl font-black text-[#F5E8E8] mt-1 tracking-wide uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              >
                Eternal Striking: The While Loop
              </h1>
              <p className="text-xs sm:text-sm text-[#A89898] mt-1 leading-relaxed">
                Harness continuous execution until combat conditions change. Keep your blades whirling until every foe falls.
              </p>
            </div>

            {/* Right Spartan Emblem */}
            <div className="shrink-0 flex items-center justify-center relative z-10">
              <div className="w-32 h-24 rounded-xl bg-gradient-to-b from-[#200A0A] to-[#120505] border border-[#8C2828] flex flex-col items-center justify-center gap-1 shadow-[0_0_16px_rgba(140,40,40,0.5)]">
                <Swords className="w-7 h-7 text-[#FF3D00]" />
                <span
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="text-[9.5px] font-bold text-[#F5D060] tracking-widest uppercase"
                >
                  SPARTAN WILL
                </span>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* B. "YOUR WAR ORDER" BANNER                                            */}
          {/* --------------------------------------------------------------------- */}
          <div className="bg-[#120707] border border-[#8C2828]/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden shadow-md">
            <div className="flex items-center gap-3.5 shrink-0">
              <div className="w-14 h-14 rounded-xl bg-[#240C0C] border border-[#8C2828] flex items-center justify-center text-2xl shrink-0 shadow-[0_0_12px_rgba(140,40,40,0.5)]">
                ⚔️
              </div>
              <div className="relative bg-[#1E0E0E] border border-[#8C2828]/60 rounded-xl px-3.5 py-2 text-[11px] text-[#D1C2C2] font-medium max-w-[210px] leading-snug">
                &ldquo;A true Spartan strikes repeatedly until the decree is fulfilled.&rdquo;
              </div>
            </div>

            {/* Right Mission Copy */}
            <div className="flex flex-col gap-1.5 flex-1 border-t sm:border-t-0 sm:border-l border-[#3D1C1C] pt-3 sm:pt-0 sm:pl-6">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#FF3D00]" />
                <h2
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="font-bold text-[#F5E8E8] text-sm uppercase tracking-wider"
                >
                  Your War Mandate
                </h2>
              </div>
              <p className="text-xs text-[#A89898] leading-relaxed">
                Instruct your code to execute relentless iterations while a vital condition holds true.
              </p>
              <div className="flex items-center gap-4 text-xs font-mono font-bold pt-1">
                <span className="text-[#F5D060] flex items-center gap-1">
                  <span>🏆</span> +80 XP Hacksilver
                </span>
                <span className="text-[#3D1C1C]">•</span>
                <span className="text-[#8C7A7A] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#8C2828]" /> 8 min Trial
                </span>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* C. CONCEPT EXPLANATION & INTERACTIVE CODE SNIPPET                     */}
          {/* --------------------------------------------------------------------- */}
          <div className="bg-[#0E0606] rounded-2xl p-6 sm:p-7 border border-[#3D1C1C] shadow-lg space-y-6">
            {/* Title & Definition */}
            <div className="flex flex-col gap-1">
              <h2
                style={{ fontFamily: "'Cinzel', serif" }}
                className="text-xl sm:text-2xl font-bold text-[#F5E8E8] tracking-wider uppercase"
              >
                The Law of the While Loop
              </h2>
              <p className="text-xs sm:text-sm text-[#A89898] leading-relaxed">
                A while loop repeats an encased block of instructions continuously as long as its gatekeeper condition yields True.
              </p>
            </div>

            {/* Formula Strip */}
            <div className="bg-[#170A0A] rounded-xl p-3.5 flex items-center gap-3 border border-[#3D1C1C] text-xs sm:text-sm font-mono text-[#F5E8E8] flex-wrap">
              <div className="w-7 h-7 rounded-lg bg-[#240C0C] border border-[#8C2828] flex items-center justify-center text-[#FF3D00] shadow-sm shrink-0">
                <Lightbulb className="w-4 h-4 fill-amber-400 text-[#FF3D00]" />
              </div>
              <span className="px-2.5 py-0.5 rounded bg-gradient-to-r from-[#8B0000] to-[#550A0A] text-white font-mono font-bold text-xs uppercase tracking-wider border border-[#8C2828]">
                WHILE
              </span>
              <span className="text-[#A89898] font-medium">condition is True</span>
              <span className="text-[#FF3D00] font-bold">→</span>
              <span className="text-[#00E5FF] font-bold">execute combat strikes</span>
            </div>

            {/* Basalt IDE Code Block */}
            <div className="rounded-xl overflow-hidden border border-[#3D1C1C] shadow-xl bg-[#090404]">
              {/* Top Bar */}
              <div className="px-4 py-2.5 bg-[#120707] border-b border-[#3D1C1C] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🐍</span>
                  <span
                    style={{ fontFamily: "'Cinzel', serif" }}
                    className="text-[10px] text-[#A89898] font-bold uppercase tracking-widest"
                  >
                    SACRED PYTHON RUNES
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyMainCode}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-[#A89898] hover:text-white hover:bg-[#200A0A] transition-colors flex items-center gap-1.5 cursor-pointer border border-[#2D1414]"
                  title="Copy code snippet"
                >
                  {copiedMainCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#00E5FF]" />
                      <span className="text-[#00E5FF] font-bold">Inscribed!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Inscription</span>
                    </>
                  )}
                </button>
              </div>

              {/* Syntax Highlighted Code */}
              <div className="p-5 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto text-[#E0D0D0]">
                <div className="flex items-center">
                  <span className="w-6 text-[#554040] select-none text-right pr-4">1</span>
                  <span>
                    <span className="text-[#F5E8E8] font-semibold">rage</span>{' '}
                    <span className="text-[#FF3D00]">=</span>{' '}
                    <span className="text-[#F5D060]">3</span>
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-6 text-[#554040] select-none text-right pr-4">2</span>
                  <span>&nbsp;</span>
                </div>
                <div className="flex items-center">
                  <span className="w-6 text-[#554040] select-none text-right pr-4">3</span>
                  <span>
                    <span className="text-[#FF5722] font-bold">while</span>{' '}
                    <span className="text-[#F5E8E8] font-semibold">rage</span>{' '}
                    <span className="text-[#FF3D00]">&gt;</span>{' '}
                    <span className="text-[#F5D060]">0</span>
                    <span className="text-[#A89898]">:</span>
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-6 text-[#554040] select-none text-right pr-4">4</span>
                  <span className="pl-6">
                    <span className="text-[#00E5FF] font-bold">print</span>
                    <span className="text-[#A89898]">(</span>
                    <span className="text-[#4ADE80]">&quot;Strike with Chaos Blades!&quot;</span>
                    <span className="text-[#A89898]">)</span>
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-6 text-[#554040] select-none text-right pr-4">5</span>
                  <span className="pl-6">
                    <span className="text-[#F5E8E8] font-semibold">rage</span>{' '}
                    <span className="text-[#FF3D00]">-=</span>{' '}
                    <span className="text-[#F5D060]">1</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Step Breakdown Flow */}
            <div className="flex flex-col gap-3 pt-2">
              <div
                style={{ fontFamily: "'Cinzel', serif" }}
                className="text-xs font-bold text-[#A89898] uppercase tracking-wider"
              >
                The Three Rites of Execution
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
                {/* Step 01 */}
                <div className="bg-[#120707] border border-[#3D1C1C] rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#240C0C] text-[#FF8A80] font-mono text-[10px] font-bold border border-[#8C2828]/50">
                      01
                    </span>
                    <span
                      style={{ fontFamily: "'Cinzel', serif" }}
                      className="font-bold text-xs text-[#F5E8E8]"
                    >
                      Judge Condition
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A89898] leading-relaxed">
                    Python evaluates whether <code className="px-1.5 py-0.5 rounded bg-[#1C0A0A] text-[#00E5FF] border border-[#3D1C1C] font-mono font-bold">rage &gt; 0</code>.
                  </p>
                </div>

                {/* Step 02 */}
                <div className="bg-[#120707] border border-[#3D1C1C] rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#240C0C] text-[#FF8A80] font-mono text-[10px] font-bold border border-[#8C2828]/50">
                      02
                    </span>
                    <span
                      style={{ fontFamily: "'Cinzel', serif" }}
                      className="font-bold text-xs text-[#F5E8E8]"
                    >
                      Unleash Block
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A89898] leading-relaxed">
                    If judged True, the indented combat code is unleashed inside the arena.
                  </p>
                </div>

                {/* Step 03 */}
                <div className="bg-[#120707] border border-[#3D1C1C] rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#240C0C] text-[#FF8A80] font-mono text-[10px] font-bold border border-[#8C2828]/50">
                      03
                    </span>
                    <span
                      style={{ fontFamily: "'Cinzel', serif" }}
                      className="font-bold text-xs text-[#F5E8E8]"
                    >
                      Update Gauge
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A89898] leading-relaxed">
                    <code className="px-1.5 py-0.5 rounded bg-[#1C0A0A] text-[#00E5FF] border border-[#3D1C1C] font-mono font-bold">rage</code> decrements by 1 until the condition is broken.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* D. "PREDICT THE STRIKE" INTERACTIVE QUIZ                             */}
          {/* --------------------------------------------------------------------- */}
          <div className="bg-gradient-to-br from-[#160909] to-[#0E0505] rounded-2xl p-6 border-2 border-[#8C2828]/80 shadow-lg flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#240C0C] border border-[#8C2828] flex items-center justify-center text-[#FF3D00] text-sm shrink-0">
                ❓
              </div>
              <div className="flex flex-col">
                <h3
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="font-black text-[#F5E8E8] text-base uppercase tracking-wider"
                >
                  Predict the Battle Echo
                </h3>
                <p className="text-xs text-[#8C7A7A] font-medium">
                  What will this combat script print before termination?
                </p>
              </div>
            </div>

            {/* Content Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-1">
              {/* Mini code snippet */}
              <div className="md:col-span-5 bg-[#090404] rounded-xl p-4 border border-[#3D1C1C] shadow-inner font-mono text-xs text-[#E0D0D0] leading-relaxed">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2A1414] text-[10px] text-[#8C7A7A]">
                  <span style={{ fontFamily: "'Cinzel', serif" }}>PYTHON 3</span>
                  <span>battle.py</span>
                </div>
                <div>
                  <p><span className="text-[#F5E8E8] font-semibold">count</span> = <span className="text-[#F5D060]">3</span></p>
                  <p><span className="text-[#FF5722] font-bold">while</span> count &gt; <span className="text-[#F5D060]">0</span>:</p>
                  <p className="pl-4"><span className="text-[#00E5FF] font-bold">print</span>(count)</p>
                  <p className="pl-4">count -= <span className="text-[#F5D060]">1</span></p>
                </div>
              </div>

              {/* Options Grid */}
              <div className="md:col-span-7 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'A' as const, text: '3 2 1', label: 'A. 3 2 1' },
                    { id: 'B' as const, text: '3 2 1 0', label: 'B. 3 2 1 0' },
                    { id: 'C' as const, text: '2 1 0', label: 'C. 2 1 0' },
                    { id: 'D' as const, text: 'Infinite loop', label: 'D. Infinite loop' },
                  ].map((opt) => {
                    const isSelected = selectedOption === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSelectedOption(opt.id)
                          setQuizSubmitted(false)
                        }}
                        className={`p-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-left flex items-center justify-between border ${
                          isSelected
                            ? 'border-2 border-[#FF3D00] bg-[#220B0B] text-[#FFEAEA] shadow-[0_0_12px_rgba(255,61,0,0.4)] scale-101'
                            : 'bg-[#120707] border-[#3D1C1C] text-[#A89898] hover:bg-[#1A0B0B] hover:border-[#8C2828]'
                        }`}
                      >
                        <span className="font-mono">{opt.label}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#FF3D00] animate-pulse" />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Check Answer Button & Validation Feedback */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleCheckAnswer}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#8B0000] to-[#550A0A] hover:from-[#A81010] text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5 border border-[#8C2828] active:scale-95"
                  >
                    <span style={{ fontFamily: "'Cinzel', serif" }}>VERIFY RITE</span>
                  </button>

                  {quizSubmitted && quizResult === 'correct' && (
                    <div className="p-2.5 rounded-xl bg-[#0F2A18] border border-[#00E5FF]/60 text-[#00E5FF] text-xs font-medium flex items-center gap-2 animate-in fade-in">
                      <span>⚡</span>
                      <span>By the gods! When count reaches 0, the condition collapses before printing 0! (+25 XP)</span>
                    </div>
                  )}

                  {quizSubmitted && quizResult === 'incorrect' && (
                    <div className="p-2.5 rounded-xl bg-[#2A1010] border border-[#8C2828] text-[#FF8A80] text-xs font-medium flex items-center gap-2 animate-in fade-in">
                      <span>⚠️</span>
                      <span>Heed the condition: <code className="font-bold font-mono">count &gt; 0</code>. When count hits 0, it flees immediately. Correct is <strong>A (3 2 1)</strong>.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* E. KEY WARNING STRIP                                                 */}
          {/* --------------------------------------------------------------------- */}
          <div className="bg-[#140808] border border-[#8C2828] rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#240C0C] border border-[#8C2828] flex items-center justify-center text-[#FF3D00] shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex flex-col gap-0.5">
                <div
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="text-[10px] font-bold text-[#FF8A80] uppercase tracking-wider"
                >
                  CURSE OF THE INFINITE LOOP
                </div>
                <p className="text-xs text-[#A89898] leading-relaxed">
                  A loop demands a gatekeeper variable that alters towards False. Neglect this, and your script shall burn in Helheim forever.
                </p>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* F. MIMIR ORACLE HELPER                                                */}
          {/* --------------------------------------------------------------------- */}
          <div className="bg-[#0E0606] rounded-xl p-4 border border-[#3D1C1C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#200A0A] border border-[#8C2828] flex items-center justify-center text-xl shrink-0">
                👁️
              </div>
              <div className="flex flex-col">
                <span
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="font-bold text-xs text-[#F5E8E8] uppercase tracking-wider"
                >
                  Mimir&apos;s Wisdom
                </span>
                <span className="text-xs text-[#8C7A7A]">
                  &ldquo;Need me to break down while loops in Norse terms, brother?&rdquo;
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveMimirTip(activeMimirTip === 'hint' ? null : 'hint')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  activeMimirTip === 'hint'
                    ? 'bg-[#8B0000] text-white border-[#FF3D00]'
                    : 'bg-[#140808] border-[#3D1C1C] text-[#C4B5B5] hover:text-white'
                }`}
              >
                <span style={{ fontFamily: "'Cinzel', serif" }}>GIVE A HINT</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMimirTip(activeMimirTip === 'simple' ? null : 'simple')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  activeMimirTip === 'simple'
                    ? 'bg-[#8B0000] text-white border-[#FF3D00]'
                    : 'bg-[#140808] border-[#3D1C1C] text-[#C4B5B5] hover:text-white'
                }`}
              >
                <span style={{ fontFamily: "'Cinzel', serif" }}>EXPLAIN SIMPLY</span>
              </button>
            </div>
          </div>

          {/* Interactive Mimir Tip Drawer */}
          {activeMimirTip && (
            <div className="p-4 rounded-xl bg-[#140808] border border-[#8C2828] shadow-md flex flex-col gap-2 text-xs text-[#C4B5B5]">
              <div className="flex items-center justify-between border-b border-[#2D1414] pb-2">
                <div className="flex items-center gap-2 font-bold text-[#F5E8E8]">
                  <Sparkles className="w-4 h-4 text-[#F5D060]" />
                  <span>
                    {activeMimirTip === 'hint' && 'Mimir: Keep an eye on your decrementer, lad!'}
                    {activeMimirTip === 'simple' && 'Mimir: Think of swinging the Leviathan Axe until the timber breaks.'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMimirTip(null)}
                  className="text-[#8C7A7A] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {activeMimirTip === 'hint' && (
                <p className="leading-relaxed">
                  Always modify the condition variable inside the loop body. If your Spartan rage never depletes, your machine will grind to a halt!
                </p>
              )}
              {activeMimirTip === 'simple' && (
                <p className="leading-relaxed">
                  Every strike checks: &ldquo;Is the Draugr still standing?&rdquo; While True, strike again. When it falls, the condition is False, and the battle ends.
                </p>
              )}
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* G. BOTTOM NAVIGATION BAR                                             */}
          {/* --------------------------------------------------------------------- */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#3D1C1C] flex-wrap gap-4">
            <button
              type="button"
              onClick={onPreviousLesson || onBackToCourse}
              className="px-4 py-2.5 rounded-xl bg-[#140808] hover:bg-[#1E0E0E] border border-[#3D1C1C] text-[#C4B5B5] hover:text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#FF3D00]" />
              <span style={{ fontFamily: "'Cinzel', serif" }}>PREVIOUS CHAMBER</span>
            </button>

            <div className="flex items-center gap-3">
              <span
                style={{ fontFamily: "'Cinzel', serif" }}
                className="px-3 py-1.5 rounded-lg bg-[#1C1206] border border-[#C59B27]/60 text-[#F5D060] text-xs font-bold"
              >
                ⭐ +80 XP HACKSILVER
              </span>

              <button
                type="button"
                onClick={onNextLesson}
                className="bg-gradient-to-r from-[#8B0000] via-[#B91C1C] to-[#EF4444] hover:from-[#991B1B] hover:to-[#FF3D00] text-white font-bold px-7 py-3 rounded-xl shadow-[0_0_16px_rgba(220,38,38,0.6)] cursor-pointer transition-all active:scale-95 text-xs flex items-center gap-2 border border-[#FF5722]/50"
              >
                <span style={{ fontFamily: "'Cinzel', serif" }}>ENTER TRIAL ARENA</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: WAR PROGRESS PANEL                                        */}
        {/* ======================================================================= */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-5">
          {/* Chapter Completion Header */}
          <div className="bg-[#0E0606] rounded-2xl p-5 border border-[#3D1C1C] shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div
                style={{ fontFamily: "'Cinzel', serif" }}
                className="text-xs font-bold text-[#A89898] uppercase tracking-wider flex items-center gap-1.5"
              >
                <span>CHAMBER 3 OF 4</span>
                <Check className="w-3.5 h-3.5 text-[#00E5FF] stroke-[3]" />
              </div>
              <span
                style={{ fontFamily: "'Cinzel', serif" }}
                className="text-[10px] font-bold text-[#FF5722]"
              >
                78%
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="grid grid-cols-4 gap-1.5">
              <div className="h-2 rounded-full bg-[#FF3D00] shadow-[0_0_6px_#FF3D00]" />
              <div className="h-2 rounded-full bg-[#FF3D00] shadow-[0_0_6px_#FF3D00]" />
              <div className="h-2 rounded-full bg-[#FF3D00] shadow-[0_0_6px_#FF3D00]" />
              <div className="h-2 rounded-full bg-[#1C0A0A] border border-[#3D1C1C]" />
            </div>
            <div className="text-[11px] font-semibold text-[#8C7A7A] text-left">
              78% of Trial IV Conquered
            </div>
          </div>

          {/* Concepts Checklist */}
          <div className="bg-[#0E0606] rounded-2xl p-5 border border-[#3D1C1C] shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#F5E8E8] border-b border-[#261010] pb-3">
              <Shield className="w-4 h-4 text-[#FF3D00]" />
              <span style={{ fontFamily: "'Cinzel', serif" }}>Doctrines</span>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2 text-[#6E5A5A] line-through">
                <Check className="w-3.5 h-3.5 text-[#00E5FF] stroke-[3] shrink-0" />
                <span>Conditional Branches</span>
              </div>
              <div className="flex items-center gap-2 text-[#6E5A5A] line-through">
                <Check className="w-3.5 h-3.5 text-[#00E5FF] stroke-[3] shrink-0" />
                <span>For Loops of Muspelheim</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#240C0C] text-[#FF8A80] font-bold border border-[#8C2828]">
                <span className="w-2 h-2 rounded-full bg-[#FF3D00] shrink-0 animate-pulse" />
                <span>While Loops Rite</span>
              </div>
              <div className="flex items-center gap-2 text-[#554040]">
                <span className="w-3 h-3 rounded-full border border-[#3D1C1C] inline-block shrink-0" />
                <span>Boss Fight Algorithm</span>
              </div>
            </div>

            {/* Skills Acquired */}
            <div className="pt-3 border-t border-[#261010] flex flex-col gap-2">
              <span
                style={{ fontFamily: "'Cinzel', serif" }}
                className="text-xs font-bold text-[#8C7A7A] uppercase tracking-wider"
              >
                Combat Runes
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-[#1C0A0A] text-[#FF8A80] border border-[#8C2828]/50 text-xs font-bold">
                  ⚔️ Iteration
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#102418] text-[#00E5FF] border border-[#00E5FF]/40 text-xs font-bold">
                  ᚦ Logic
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const InteractiveLessonView: React.FC<InteractiveLessonViewProps> = (props) => {
  const { theme } = useTheme()
  if (theme === 'classic') {
    return <ClassicInteractiveLessonView {...props} />
  }
  return <GodOfWarInteractiveLessonView {...props} />
}
