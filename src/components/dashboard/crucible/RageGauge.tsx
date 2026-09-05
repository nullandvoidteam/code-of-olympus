import React from 'react'
import type { GamificationStats } from '../../../lib/gamification'

interface RageGaugeProps {
  stats: GamificationStats
}

export const RageGauge: React.FC<RageGaugeProps> = ({ stats }) => {
  const { dailyXpEarned, dailyGoalXp, dailyGoalPercent, dailyGoalCompleted } = stats

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: 'linear-gradient(145deg, var(--theme-surface-card-alt, #140909) 0%, var(--theme-surface-card, #0A0606) 100%)',
        border: '1px solid var(--theme-border-default, rgba(80, 30, 30, 0.9))',
        boxShadow: 'var(--theme-shadow-card, 0 4px 18px rgba(7,5,5,0.7))',
      }}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="font-bold tracking-[0.2em] uppercase flex items-center gap-1.5"
          style={{ color: 'var(--theme-accent-primary, #EF4444)', fontSize: '11px', fontFamily: "var(--theme-font-heading, 'Cinzel', serif)" }}
        >
          <span>⚔️</span>
          <span>SPARTAN RAGE</span>
        </span>
        <span
          className="font-bold tabular-nums tracking-wider"
          style={{ color: 'var(--theme-accent-secondary, #F5D060)', fontSize: '12px', fontFamily: "var(--theme-font-heading, 'Cinzel', serif)" }}
        >
          {dailyXpEarned} / {dailyGoalXp} XP
        </span>
      </div>

      {/* Rage Bar */}
      <div
        className="relative w-full h-5 rounded-lg overflow-hidden mb-2.5 p-[1px]"
        style={{
          background: 'var(--theme-bg-subtle, #090404)',
          border: '1px solid var(--theme-border-default, #3D1C1C)',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.2)',
        }}
      >
        {/* Segmented tick marks */}
        <div className="absolute inset-0 flex pointer-events-none z-10">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r last:border-r-0"
              style={{ borderColor: 'rgba(0,0,0,0.45)' }}
            />
          ))}
        </div>

        {/* Fill bar */}
        <div
          className="h-full rounded-md relative transition-all duration-700"
          style={{
            width: `${Math.min(100, dailyGoalPercent)}%`,
            background: dailyGoalCompleted
              ? 'linear-gradient(90deg, #991B1B 0%, #DC2626 30%, #FF3D00 70%, #F5D060 100%)'
              : 'linear-gradient(90deg, #7F1D1D 0%, #DC2626 60%, #FF3D00 100%)',
            boxShadow: dailyGoalCompleted
              ? '0 0 24px rgba(245, 208, 96, 0.8), 0 0 40px rgba(255, 61, 0, 0.6)'
              : '0 0 14px rgba(255, 61, 0, 0.6), 0 0 24px rgba(220, 38, 38, 0.35)',
            animation: dailyGoalCompleted ? 'rage-pulse 1s ease-in-out infinite' : undefined,
          }}
        >
          {/* Inner highlight */}
          <div
            className="absolute top-0 left-0 right-0 h-1/2 rounded-t-md"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          />
        </div>

        {/* Percent label inside bar */}
        {dailyGoalPercent > 15 && (
          <span
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white font-bold z-20"
            style={{ fontSize: '10px', textShadow: '0 1px 3px rgba(0,0,0,0.9)', fontFamily: "'Cinzel', serif" }}
          >
            {dailyGoalPercent}%
          </span>
        )}
      </div>

      {/* Rage Unleashed Victory Seal */}
      {dailyGoalCompleted && (
        <div
          className="flex items-center justify-center gap-2 mt-2 py-2 rounded-lg"
          style={{
            background: 'linear-gradient(90deg, rgba(153, 27, 27, 0.4) 0%, rgba(245, 158, 11, 0.25) 50%, rgba(153, 27, 27, 0.4) 100%)',
            border: '1px solid rgba(245, 208, 96, 0.5)',
            animation: 'rage-pulse 1.5s ease-in-out infinite',
          }}
        >
          <span style={{ fontSize: '14px' }}>🔥</span>
          <span
            className="font-bold tracking-[0.2em] uppercase"
            style={{ color: '#F5D060', fontSize: '10px', fontFamily: "'Cinzel', serif" }}
          >
            RAGE UNLEASHED
          </span>
          <span
            className="font-bold tracking-wider"
            style={{ color: '#FCD34D', fontSize: '10px', fontFamily: "'Cinzel', serif" }}
          >
            +BONUS HACKSILVER
          </span>
          <span style={{ fontSize: '14px' }}>🔥</span>
        </div>
      )}

      {!dailyGoalCompleted && (
        <div className="flex items-center justify-between mt-1">
          <span style={{ color: '#8A7A7A', fontSize: '11px', fontFamily: "'Inter', sans-serif" }}>
            {Math.max(0, dailyGoalXp - dailyXpEarned)} XP until Rage unleashed
          </span>
          <span
            style={{ color: '#C59B27', fontSize: '10px', fontFamily: "'Cinzel', serif", letterSpacing: '0.1em' }}
          >
            DAILY GOAL
          </span>
        </div>
      )}

      <style>{`
        @keyframes rage-pulse {
          0%, 100% { box-shadow: 0 0 14px rgba(245, 158, 11, 0.4), 0 0 28px rgba(255, 61, 0, 0.3); }
          50% { box-shadow: 0 0 28px rgba(245, 158, 11, 0.8), 0 0 52px rgba(255, 61, 0, 0.6); }
        }
      `}</style>
    </div>
  )
}
