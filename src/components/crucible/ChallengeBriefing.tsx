import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Lightbulb, Trophy, BookOpen, Target, Sparkles, CheckCircle2, Shield } from 'lucide-react'
import type { Challenge, ChallengeProgress } from '../../lib/challenges'

interface ChallengeBriefingProps {
  challenge: Challenge
  progress?: ChallengeProgress
  isCompleted: boolean
  themeKey?: string
}

const DIFFICULTY_MAP: Record<string, { label: string; color: string; bg: string }> = {
  beginner: { label: 'BEGINNER', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
  easy:     { label: 'EASY',     color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)' },
  medium:   { label: 'MEDIUM',   color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
  hard:     { label: 'HARD',     color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' },
  expert:   { label: 'EXPERT',   color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)' },
}

function formatDate(iso?: string) {
  if (!iso) return null
  try {
    const d = new Date(iso)
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    if (diff < 7) return `${diff}d ago`
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  } catch { return null }
}

export const ChallengeBriefing: React.FC<ChallengeBriefingProps> = ({
  challenge,
  progress,
  isCompleted,
  themeKey = 'classic',
}) => {
  const [openHint, setOpenHint] = useState<number | null>(null)
  const [showSolution, setShowSolution] = useState(false)

  const isGow = themeKey === 'gow'
  const isSpiderman = themeKey === 'spiderman'

  const diffKey = (challenge.difficulty || 'easy').toLowerCase()
  const diff = DIFFICULTY_MAP[diffKey] ?? DIFFICULTY_MAP.easy
  const hints = challenge.hints ?? []

  const panelBg = isGow
    ? '#140D0D'
    : isSpiderman
    ? '#0D1424'
    : '#0F172A'

  const cardBg = isGow
    ? 'rgba(30, 18, 18, 0.8)'
    : isSpiderman
    ? 'rgba(23, 37, 84, 0.4)'
    : 'rgba(30, 41, 59, 0.6)'

  const borderCol = isGow
    ? 'rgba(245, 158, 11, 0.2)'
    : isSpiderman
    ? 'rgba(14, 165, 233, 0.25)'
    : 'rgba(51, 65, 85, 0.5)'

  const accentText = isGow ? '#F59E0B' : isSpiderman ? '#38BDF8' : '#10B981'

  return (
    <div
      className="flex flex-col h-full overflow-y-auto select-none"
      style={{ background: panelBg }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div
        className="px-5 pt-5 pb-4 flex flex-col gap-3 border-b"
        style={{ borderColor: borderCol }}
      >
        {/* Tag pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              borderColor: borderCol,
              color: '#CBD5E1',
            }}
          >
            {challenge.category || 'Algorithms'}
          </span>

          <span
            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide"
            style={{
              color: diff.color,
              background: diff.bg,
              border: `1px solid ${diff.color}40`,
            }}
          >
            {diff.label}
          </span>

          {challenge.language && (
            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider"
              style={{
                color: '#38BDF8',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              {challenge.language}
            </span>
          )}

          {isCompleted && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Solved
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
          {challenge.title}
        </h2>

        {/* XP Reward & Stat pills */}
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-xl border"
            style={{
              background: 'rgba(245, 158, 11, 0.12)',
              borderColor: 'rgba(245, 158, 11, 0.3)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-extrabold text-xs text-amber-400">
              +{challenge.xp_reward ?? 75} XP
            </span>
          </div>

          {progress && (
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>Attempts: <strong className="text-slate-200">{progress.attempts_count}</strong></span>
              <span>•</span>
              <span>Best: <strong className="text-emerald-400">{progress.best_score}%</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* ── Instructions Parchment ──────────────────────────────── */}
      <div className="px-5 py-4 flex flex-col gap-4 text-slate-300">
        <div
          className="rounded-2xl p-4 leading-relaxed text-sm border shadow-sm"
          style={{ background: cardBg, borderColor: borderCol }}
        >
          <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-wider" style={{ color: accentText }}>
            <Target className="w-3.5 h-3.5" />
            <span>Mission Objective</span>
          </div>
          <p className="whitespace-pre-wrap leading-relaxed text-slate-200 text-xs sm:text-[13px]">
            {challenge.instructions || challenge.description}
          </p>
        </div>

        {/* Sample Input / Expected Output */}
        {challenge.sample_input && (
          <div
            className="rounded-2xl overflow-hidden border"
            style={{ background: cardBg, borderColor: borderCol }}
          >
            <div
              className="px-3.5 py-2 flex items-center justify-between border-b"
              style={{ borderColor: borderCol }}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Sample Input / Output
              </span>
              <span className="text-[10px] font-mono text-slate-500">Test Preview</span>
            </div>
            <pre
              className="p-3.5 text-xs font-mono leading-relaxed overflow-x-auto text-emerald-400 m-0"
              style={{ background: 'rgba(0, 0, 0, 0.25)' }}
            >
              {challenge.sample_input}
            </pre>
          </div>
        )}

        {/* Hints */}
        {hints.length > 0 && (
          <div
            className="rounded-2xl overflow-hidden border"
            style={{ background: cardBg, borderColor: borderCol }}
          >
            <div
              className="px-4 py-2.5 flex items-center gap-2 border-b text-xs font-bold text-slate-300"
              style={{ borderColor: borderCol }}
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Strategy Hints ({hints.length})</span>
            </div>

            <div className="flex flex-col divide-y" style={{ borderColor: borderCol }}>
              {hints.map((hint, i) => (
                <div key={i}>
                  <button
                    type="button"
                    onClick={() => setOpenHint(openHint === i ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-white/5 text-left text-xs font-semibold text-slate-300"
                  >
                    <span>Hint {i + 1}</span>
                    {openHint === i ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  {openHint === i && (
                    <div className="px-4 pb-3 pt-1 text-xs leading-relaxed text-amber-200/90 font-medium bg-amber-500/10 border-t border-amber-500/20">
                      {hint}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Solution reveal */}
        {isCompleted && challenge.solution_explanation && (
          <div
            className="rounded-2xl overflow-hidden border border-amber-500/30 shadow-lg"
            style={{ background: cardBg }}
          >
            <button
              type="button"
              onClick={() => setShowSolution(!showSolution)}
              className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/5 text-left"
              style={{
                background: 'linear-gradient(90deg, rgba(245,158,11,0.15) 0%, rgba(16,185,129,0.15) 100%)',
              }}
            >
              <div className="flex items-center gap-2 font-bold text-xs text-amber-400">
                <Trophy className="w-4 h-4" />
                <span>Reference Solution</span>
              </div>
              {showSolution ? (
                <ChevronUp className="w-4 h-4 text-amber-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-amber-400" />
              )}
            </button>
            {showSolution && (
              <div className="px-4 pb-4 pt-3 flex flex-col gap-3 border-t border-amber-500/20">
                <p className="text-xs leading-relaxed text-slate-300">
                  {challenge.solution_explanation}
                </p>
                {challenge.solution_code && (
                  <pre
                    className="p-3 rounded-xl text-xs font-mono overflow-x-auto text-emerald-300"
                    style={{ background: 'rgba(0, 0, 0, 0.4)' }}
                  >
                    {challenge.solution_code}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
