import React from 'react'
import { Flame, Sword } from 'lucide-react'
import type { ResumePoint } from '../../../lib/learning'

interface ResumeShrineProps {
  resumePoint: ResumePoint | null
  onResume: (lessonId?: string) => void
}

export const ResumeShrine: React.FC<ResumeShrineProps> = ({ resumePoint, onResume }) => {
  const progress = resumePoint?.progressPercent ?? 0

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 sm:p-7 shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, var(--theme-surface-card-alt, #110808) 0%, var(--theme-surface-card, #1c0d0d) 50%, var(--theme-bg-canvas, #0c0606) 100%)',
        border: '1px solid var(--theme-border-default, rgba(80, 30, 30, 0.9))',
        boxShadow: 'var(--theme-shadow-card, 0 8px 32px rgba(7,5,5,0.8))',
      }}
    >
      {/* Stone texture overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            var(--theme-accent-glow, rgba(255,61,0,0.12)) 2px,
            var(--theme-accent-glow, rgba(255,61,0,0.12)) 4px
          )`,
        }}
      />

      {/* Ember corner glows */}
      <div
        className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--theme-glow-ambient, rgba(255,61,0,0.12)) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--theme-glow-ambient, rgba(220,38,38,0.1)) 0%, transparent 70%)' }}
      />

      <div className="relative z-10">
        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{
              color: 'var(--theme-accent-glow, #FF3D00)',
              fontFamily: "var(--theme-font-heading, 'Cinzel', serif)",
              background: 'var(--theme-accent-primary-dim, rgba(255,61,0,0.12))',
              border: '1px solid var(--theme-border-strong, rgba(255,61,0,0.3))',
            }}
          >
            ⚔ CAMPFIRE RESUME SHRINE
          </span>
        </div>

        {resumePoint ? (
          <>
            {/* Course Title */}
            <h2
              className="font-bold uppercase tracking-wide mb-1 text-xl sm:text-2xl truncate"
              style={{
                fontFamily: "var(--theme-font-heading, 'Cinzel', serif)",
                letterSpacing: '0.04em',
                color: 'var(--theme-text-primary, #F5E8E8)',
              }}
            >
              {resumePoint.courseTitle}
            </h2>

            {/* Active Coordinates */}
            <p
              className="text-sm font-medium mb-4 truncate"
              style={{ color: 'var(--theme-accent-secondary, #C59B27)', fontFamily: "var(--theme-font-heading, 'Cinzel', serif)", letterSpacing: '0.05em' }}
            >
              {resumePoint.chapterTitle ? `${resumePoint.chapterTitle} • ` : ''}{resumePoint.lessonTitle}
            </p>

            {/* Lava Progress Track */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="font-bold uppercase tracking-widest text-[10px]"
                  style={{ color: 'var(--theme-text-muted, #8A7A7A)', fontFamily: "var(--theme-font-heading, 'Cinzel', serif)" }}
                >
                  SAGA MASTERY
                </span>
                <span
                  className="font-bold tracking-wider text-xs"
                  style={{ color: 'var(--theme-accent-secondary, #F5D060)', fontFamily: "var(--theme-font-heading, 'Cinzel', serif)" }}
                >
                  {progress}%
                </span>
              </div>
              <div
                className="relative w-full h-3.5 rounded-full overflow-hidden p-[1px]"
                style={{ background: 'var(--theme-bg-subtle, #090404)', border: '1px solid var(--theme-border-default, rgba(61, 28, 28, 0.9))' }}
              >
                {/* Lava fill */}
                <div
                  className="h-full rounded-full relative transition-all duration-700"
                  style={{
                    width: `${progress}%`,
                    background: 'var(--theme-btn-primary-gradient)',
                    boxShadow: '0 0 14px var(--theme-accent-glow, rgba(255, 61, 0, 0.7))',
                  }}
                >
                  {/* Ember tip */}
                  {progress > 5 && (
                    <div
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
                      style={{
                        background: '#FFF',
                        boxShadow: '0 0 6px var(--theme-accent-secondary, #F59E0B), 0 0 12px var(--theme-accent-glow, #FF3D00)',
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[11px] font-medium" style={{ color: 'var(--theme-text-muted, #8A7A7A)' }}>
                  {resumePoint.completedCount}/{resumePoint.totalCount} trials forged in blood
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onResume(resumePoint.lessonId)}
                className="btn-gamified-3d btn-gamified-3d-primary flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-[0.18em] transition-all duration-200 cursor-pointer"
                style={{
                  fontFamily: "var(--theme-font-heading, 'Cinzel', serif)",
                  background: 'var(--theme-btn-primary-gradient)',
                  border: '1px solid var(--theme-btn-primary-border, rgba(255, 61, 0, 0.4))',
                }}
              >
                <Sword className="w-4 h-4" />
                <span>Resume the Saga →</span>
              </button>
            </div>

            {/* Mimir flavor quote */}
            <div
              className="flex items-start gap-3 mt-5 p-3.5 rounded-xl"
              style={{
                background: 'rgba(25, 12, 12, 0.75)',
                border: '1px solid rgba(61, 28, 28, 0.75)',
              }}
            >
              <span className="text-xl shrink-0">🪶</span>
              <p
                className="text-xs leading-relaxed italic"
                style={{ color: '#B0A0A0', fontFamily: "'Inter', sans-serif" }}
              >
                "Sharpen your axe, brother. The code in this realm will not write itself."
              </p>
            </div>
          </>
        ) : (
          <>
            <h2
              className="font-bold uppercase tracking-wide mb-2 text-xl text-stone-100"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              THE ALTAR FLAME IS DORMANT
            </h2>
            <p className="text-sm mb-5" style={{ color: '#8A7A7A' }}>
              No trial in progress. Kindle the sacred fire by embarking on your first Saga.
            </p>
            <button
              type="button"
              onClick={() => onResume()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-[0.18em] text-white transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              style={{
                fontFamily: "'Cinzel', serif",
                background: 'linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)',
                boxShadow: '0 0 20px rgba(220,38,38,0.4)',
                border: '1px solid rgba(220,38,38,0.5)',
              }}
            >
              <Flame className="w-4 h-4" />
              <span>Begin First Trial →</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
