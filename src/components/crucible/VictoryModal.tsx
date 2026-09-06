import React, { useEffect, useRef } from 'react'
import { ArrowRight, CheckCircle2, Trophy, Sparkles, CloudCheck, ExternalLink, X } from 'lucide-react'
import confetti from 'canvas-confetti'

interface VictoryModalProps {
  xpReward: number
  challengeTitle: string
  themeKey?: string
  onNextTrial: () => void
  onInspectSolution: () => void
  onClose: () => void
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  xpReward,
  challengeTitle,
  themeKey = 'classic',
  onNextTrial,
  onInspectSolution,
  onClose,
}) => {
  const isGow = themeKey === 'gow'
  const isSpiderman = themeKey === 'spiderman'

  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: isGow
          ? ['#DC2626', '#EA580C', '#F59E0B']
          : isSpiderman
          ? ['#E11D48', '#0EA5E9', '#FFFFFF']
          : ['#10B981', '#06B6D4', '#6366F1', '#F59E0B'],
      })
    } catch {}
  }, [isGow, isSpiderman])

  const modalBg = isGow
    ? 'linear-gradient(145deg, #1C0F0F 0%, #291212 50%, #150A0A 100%)'
    : isSpiderman
    ? 'linear-gradient(145deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)'
    : 'linear-gradient(145deg, #0F172A 0%, #131F37 50%, #0B1324 100%)'

  const borderCol = isGow
    ? 'rgba(245, 158, 11, 0.4)'
    : isSpiderman
    ? 'rgba(14, 165, 233, 0.5)'
    : 'rgba(16, 185, 129, 0.4)'

  const accentColor = isGow
    ? '#F59E0B'
    : isSpiderman
    ? '#38BDF8'
    : '#10B981'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none"
      style={{
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(10px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Modal card */}
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden border shadow-2xl animate-in zoom-in-95 duration-300"
        style={{
          background: modalBg,
          borderColor: borderCol,
          boxShadow: isGow
            ? '0 0 50px rgba(220,38,38,0.35)'
            : isSpiderman
            ? '0 0 50px rgba(14,165,233,0.35)'
            : '0 0 50px rgba(16,185,129,0.35)',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top glow bar */}
        <div
          className="h-1.5 w-full"
          style={{
            background: isGow
              ? 'linear-gradient(90deg, #DC2626, #F59E0B, #DC2626)'
              : isSpiderman
              ? 'linear-gradient(90deg, #E11D48, #38BDF8, #E11D48)'
              : 'linear-gradient(90deg, #10B981, #06B6D4, #6366F1)',
          }}
        />

        {/* Content */}
        <div className="px-8 py-8 flex flex-col items-center text-center gap-5">
          {/* Trophy Badge */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-30"
              style={{ background: accentColor }}
            />
            <div
              className="relative w-20 h-20 rounded-full flex items-center justify-center border-2 shadow-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                borderColor: borderCol,
              }}
            >
              <Trophy
                className="w-10 h-10"
                style={{ color: accentColor, filter: `drop-shadow(0 0 10px ${accentColor})` }}
              />
            </div>
          </div>

          {/* Victory heading */}
          <div className="flex flex-col items-center gap-1.5">
            <span
              className="font-black uppercase tracking-widest text-xs"
              style={{ color: accentColor }}
            >
              ✦ TRIAL CONQUERED ✦
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight max-w-sm">
              {challengeTitle}
            </h2>
            <p className="text-sm text-slate-400 max-w-xs">
              All test requirements successfully validated. Your accomplishment is recorded.
            </p>
          </div>

          {/* XP reward banner */}
          <div
            className="flex items-center gap-3 px-6 py-3.5 rounded-2xl border shadow-inner"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderColor: borderCol,
            }}
          >
            <Sparkles className="w-6 h-6" style={{ color: accentColor }} />
            <div className="flex flex-col items-start">
              <span className="font-black text-2xl" style={{ color: accentColor, lineHeight: 1 }}>
                +{xpReward} XP
              </span>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                REWARD CREDITED
              </span>
            </div>
          </div>

          {/* Supabase status confirmation */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Saved & Synced with Supabase</span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col w-full gap-3 mt-1">
            <button
              type="button"
              onClick={onNextTrial}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg"
              style={{
                background: isGow
                  ? 'linear-gradient(135deg, #DC2626 0%, #EA580C 50%, #D97706 100%)'
                  : isSpiderman
                  ? 'linear-gradient(135deg, #E11D48 0%, #0284C7 100%)'
                  : 'linear-gradient(135deg, #059669 0%, #10B981 50%, #06B6D4 100%)',
              }}
            >
              <span>Continue Arena</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onInspectSolution}
              className="w-full py-2.5 rounded-xl font-semibold text-xs transition-all hover:bg-white/10 text-slate-300 border border-white/10"
            >
              Review Official Solution
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
