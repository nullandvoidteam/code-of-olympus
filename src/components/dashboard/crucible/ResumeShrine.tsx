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
        background: 'linear-gradient(135deg, #110808 0%, #1c0d0d 50%, #0c0606 100%)',
        border: '1px solid rgba(80, 30, 30, 0.9)',
        boxShadow: '0 8px 32px rgba(7,5,5,0.8), 0 0 24px rgba(220,38,38,0.08)',
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
            rgba(255,61,0,0.12) 2px,
            rgba(255,61,0,0.12) 4px
          )`,
        }}
      />

      {/* Ember corner glows */}
      <div
        className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,61,0,0.12) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.1) 0%, transparent 70%)' }}
      />

      <div className="relative z-10">
        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{
              color: '#FF3D00',
              fontFamily: "'Cinzel', serif",
              background: 'rgba(255,61,0,0.12)',
              border: '1px solid rgba(255,61,0,0.3)',
            }}
          >
            ⚔ CAMPFIRE RESUME SHRINE
          </span>
        </div>

        {resumePoint ? (
          <>
            {/* Course Title */}
            <h2
              className="font-bold uppercase tracking-wide mb-1 text-xl sm:text-2xl text-stone-100"
              style={{
                fontFamily: "'Cinzel', serif",
                letterSpacing: '0.04em',
              }}
            >
              {resumePoint.courseTitle}
            </h2>

            {/* Active Coordinates */}
            <p
              className="text-sm font-medium mb-4"
              style={{ color: '#C59B27', fontFamily: "'Cinzel', serif", letterSpacing: '0.05em' }}
            >
              {resumePoint.chapterTitle ? `${resumePoint.chapterTitle} • ` : ''}{resumePoint.lessonTitle}
            </p>

            {/* Lava Progress Track */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="font-bold uppercase tracking-widest text-[10px]"
                  style={{ color: '#8A7A7A', fontFamily: "'Cinzel', serif" }}
                >
                  SAGA MASTERY
                </span>
                <span
                  className="font-bold tracking-wider text-xs"
                  style={{ color: '#F5D060', fontFamily: "'Cinzel', serif" }}
                >
                  {progress}%
                </span>
              </div>
              <div
                className="relative w-full h-3.5 rounded-full overflow-hidden p-[1px]"
                style={{ background: '#090404', border: '1px solid rgba(61, 28, 28, 0.9)' }}
              >
                {/* Lava fill */}
                <div
                  className="h-full rounded-full relative transition-all duration-700"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #991B1B 0%, #DC2626 40%, #FF3D00 80%, #F59E0B 100%)',
                    boxShadow: '0 0 14px rgba(255, 61, 0, 0.7), 0 0 24px rgba(220, 38, 38, 0.4)',
                  }}
                >
                  {/* Ember tip */}
                  {progress > 5 && (
                    <div
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
                      style={{
                        background: '#FFF',
                        boxShadow: '0 0 6px #F59E0B, 0 0 12px #FF3D00',
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[11px] font-medium" style={{ color: '#8A7A7A' }}>
                  {resumePoint.completedCount}/{resumePoint.totalCount} trials forged in blood
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onResume(resumePoint.lessonId)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-[0.18em] text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: 'linear-gradient(135deg, #B91C1C 0%, #DC2626 50%, #EA580C 100%)',
                  boxShadow: '0 0 20px rgba(220,38,38,0.5), 0 4px 12px rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255, 61, 0, 0.4)',
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
