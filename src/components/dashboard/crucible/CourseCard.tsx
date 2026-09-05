import React, { useState } from 'react'
import { Lock, ChevronDown, ChevronUp, Sword } from 'lucide-react'
import type { CourseProgressSummary, ChapterProgressSummary } from '../../../lib/learning'

interface ChapterAccordionProps {
  chapters: ChapterProgressSummary[]
}

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX']

export const ChapterAccordion: React.FC<ChapterAccordionProps> = ({ chapters }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!chapters || chapters.length === 0) return null

  return (
    <div className="flex flex-col gap-2 mt-4">
      {chapters.map((chapter, idx) => {
        const isExpanded = expandedId === chapter.id
        const roman = ROMAN_NUMERALS[idx] ?? String(idx + 1)

        return (
          <div
            key={chapter.id}
            className="rounded-xl overflow-hidden"
            style={{ background: '#0a0505', border: '1px solid rgba(61, 28, 28, 0.7)' }}
          >
            {/* Chapter header */}
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : chapter.id)}
              className="w-full flex items-center justify-between px-4 py-3 transition-all duration-200 hover:opacity-90 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {/* Roman numeral badge */}
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: chapter.isCompleted
                      ? 'rgba(245, 208, 96, 0.18)'
                      : 'rgba(61, 28, 28, 0.6)',
                    border: chapter.isCompleted
                      ? '1px solid rgba(245, 208, 96, 0.5)'
                      : '1px solid #3D1C1C',
                  }}
                >
                  <span
                    className="font-bold text-xs"
                    style={{
                      color: chapter.isCompleted ? '#F5D060' : '#8A7A7A',
                      fontFamily: "'Cinzel', serif",
                    }}
                  >
                    {roman}
                  </span>
                </div>

                <span
                  className="font-bold text-sm text-left leading-tight"
                  style={{
                    color: chapter.isCompleted ? '#F1E5E5' : '#A89898',
                    fontFamily: "'Cinzel', serif",
                    fontSize: '12px',
                    letterSpacing: '0.03em',
                  }}
                >
                  {chapter.title}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: chapter.isCompleted ? 'rgba(245,208,96,0.15)' : 'rgba(40,20,20,0.6)',
                    color: chapter.isCompleted ? '#F5D060' : '#8A7A7A',
                    border: '1px solid rgba(61,28,28,0.6)',
                    fontFamily: "'Cinzel', serif",
                  }}
                >
                  {chapter.completedLessons}/{chapter.totalLessons}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-stone-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                )}
              </div>
            </button>

            {/* Expanded Lessons */}
            {isExpanded && chapter.lessons && (
              <div
                className="px-4 pb-3 flex flex-col gap-1.5"
                style={{ borderTop: '1px solid rgba(61, 28, 28, 0.5)' }}
              >
                {chapter.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg"
                    style={{
                      background: lesson.isCurrent
                        ? 'rgba(220, 38, 38, 0.15)'
                        : lesson.isCompleted
                        ? 'rgba(245, 208, 96, 0.05)'
                        : 'transparent',
                      border: lesson.isCurrent ? '1px solid rgba(220, 38, 38, 0.4)' : '1px solid transparent',
                    }}
                  >
                    {/* Status indicator */}
                    <div
                      className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                      style={{
                        background: lesson.isCompleted
                          ? '#DC2626'
                          : lesson.isCurrent
                          ? 'rgba(255,61,0,0.35)'
                          : 'rgba(28,16,16,0.8)',
                        border: lesson.isCompleted
                          ? '1px solid #FF3D00'
                          : lesson.isCurrent
                          ? '1px solid rgba(255,61,0,0.6)'
                          : '1px solid #2a1010',
                      }}
                    >
                      {lesson.isCompleted && (
                        <span style={{ fontSize: '8px', color: '#fff' }}>✓</span>
                      )}
                      {!lesson.isUnlocked && !lesson.isCompleted && (
                        <Lock className="w-2.5 h-2.5" style={{ color: '#8A7A7A' }} />
                      )}
                    </div>

                    <span
                      className="text-xs flex-1 leading-tight font-medium"
                      style={{
                        color: lesson.isCompleted
                          ? '#E8D5D5'
                          : lesson.isCurrent
                          ? '#FFFFFF'
                          : lesson.isUnlocked
                          ? '#A89898'
                          : '#57534e',
                      }}
                    >
                      {lesson.title}
                    </span>

                    {lesson.isCurrent && (
                      <span
                        className="font-bold uppercase tracking-wider"
                        style={{ color: '#FF3D00', fontSize: '8px', fontFamily: "'Cinzel', serif" }}
                      >
                        ▶ CURRENT
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Course Card ────────────────────────────────────────────────────────────

interface CourseCardProps {
  courseData: CourseProgressSummary
  onStartLesson?: (lessonId?: string) => void
}

const DIFFICULTY_TIERS: Record<string, { label: string; color: string }> = {
  beginner: { label: 'MORTAL', color: '#8A7A7A' },
  intermediate: { label: 'HERO', color: '#DC2626' },
  advanced: { label: 'GOD OF WAR', color: '#F5D060' },
}

const TRACK_COLORS: Record<string, string> = {
  python: '#3B82F6',
  javascript: '#F5D060',
  web: '#10B981',
  data: '#8B5CF6',
  ai: '#EC4899',
  default: '#FF3D00',
}

export const CourseCard: React.FC<CourseCardProps> = ({ courseData, onStartLesson }) => {
  const [chaptersOpen, setChaptersOpen] = useState(false)
  const { course, completedLessons, totalLessons, progressPercent, isCompleted, isUnlocked, chapters, nextLesson, lastAccessedAt, prerequisiteCourseTitle } = courseData

  const difficulty = DIFFICULTY_TIERS[course.difficulty?.toLowerCase()] ?? { label: 'MORTAL', color: '#8A7A7A' }
  const trackColor = TRACK_COLORS[course.track?.toLowerCase()] ?? TRACK_COLORS.default

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    try {
      const d = new Date(dateStr)
      const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
      if (diff === 0) return 'Today'
      if (diff === 1) return 'Yesterday'
      if (diff < 7) return `${diff}d ago`
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    } catch { return null }
  }

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-2px] relative"
      style={{
        background: 'linear-gradient(145deg, var(--theme-surface-card-alt, #120909) 0%, var(--theme-surface-card, #090505) 100%)',
        border: isCompleted
          ? '1px solid var(--theme-accent-secondary, rgba(245, 208, 96, 0.6))'
          : isUnlocked
          ? '1px solid var(--theme-border-default, rgba(80, 30, 30, 0.85))'
          : '1px solid var(--theme-border-subtle, #201010)',
        boxShadow: isCompleted
          ? '0 0 24px var(--theme-glow-ambient, rgba(245, 208, 96, 0.12)), var(--theme-shadow-card, 0 4px 20px rgba(7,5,5,0.7))'
          : 'var(--theme-shadow-card, 0 4px 20px rgba(7,5,5,0.7))',
        opacity: isUnlocked ? 1 : 0.65,
      }}
    >
      {/* Lock overlay */}
      {!isUnlocked && (
        <div
          className="absolute inset-0 rounded-2xl z-10 flex flex-col items-center justify-center gap-2"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(3px)' }}
        >
          <Lock className="w-8 h-8" style={{ color: 'var(--theme-text-muted, #8A7A7A)' }} />
          <div className="text-center px-4">
            <p
              className="font-bold uppercase tracking-[0.2em] text-xs"
              style={{ color: 'var(--theme-text-muted, #8A7A7A)', fontFamily: "var(--theme-font-heading, 'Cinzel', serif)" }}
            >
              SEALED TRIAL
            </p>
            {prerequisiteCourseTitle && (
              <p className="text-xs mt-1 font-medium" style={{ color: 'var(--theme-accent-secondary, #C59B27)' }}>
                Conquer "{prerequisiteCourseTitle}" first
              </p>
            )}
          </div>
        </div>
      )}

      {/* Card body */}
      <div className="p-6 flex flex-col flex-1 justify-between gap-4">
        <div>
          {/* Track badge + difficulty */}
          <div className="flex items-center justify-between mb-3">
            <span
              className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: `${trackColor}18`,
                border: `1px solid ${trackColor}45`,
                color: trackColor,
                fontFamily: "var(--theme-font-heading, 'Cinzel', serif)",
              }}
            >
              {course.track?.toUpperCase() ?? 'SAGA'}
            </span>
            <span
              className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest"
              style={{
                background: `${difficulty.color}18`,
                border: `1px solid ${difficulty.color}45`,
                color: difficulty.color,
                fontFamily: "var(--theme-font-heading, 'Cinzel', serif)",
              }}
            >
              {difficulty.label}
            </span>
          </div>

          {/* Title */}
          <h3
            className="font-bold uppercase tracking-wide text-lg mb-1.5 leading-snug"
            style={{
              fontFamily: "var(--theme-font-heading, 'Cinzel', serif)",
              color: 'var(--theme-text-primary, #F1E5E5)',
            }}
          >
            {course.title}
          </h3>

          {/* Description */}
          {course.description && (
            <p
              className="text-xs line-clamp-2 leading-relaxed font-normal"
              style={{ color: 'var(--theme-text-muted, #8A7A7A)', fontFamily: "var(--theme-font-body, 'Inter', sans-serif)" }}
            >
              {course.description}
            </p>
          )}
        </div>

        <div>
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span style={{ color: 'var(--theme-text-muted, #8A7A7A)', fontSize: '10px', fontFamily: "var(--theme-font-body, 'Inter', sans-serif)" }}>
                {completedLessons}/{totalLessons} Trials
              </span>
              <span
                className="font-bold tracking-wider"
                style={{
                  color: progressPercent === 100 ? 'var(--theme-accent-secondary, #F5D060)' : 'var(--theme-accent-primary, #FF3D00)',
                  fontSize: '11px',
                  fontFamily: "var(--theme-font-heading, 'Cinzel', serif)",
                }}
              >
                {progressPercent}%
              </span>
            </div>
            <div
              className="w-full h-2 rounded-full overflow-hidden p-[0.5px]"
              style={{ background: 'var(--theme-bg-subtle, #0a0505)', border: '1px solid var(--theme-border-default, #3D1C1C)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  background: progressPercent === 100
                    ? 'linear-gradient(90deg, #B45309, #F5D060)'
                    : 'var(--theme-btn-primary-gradient)',
                  boxShadow: progressPercent > 0 ? '0 0 8px var(--theme-accent-glow, rgba(255,61,0,0.5))' : 'none',
                }}
              />
            </div>
          </div>

          {/* Last accessed */}
          {lastAccessedAt && (
            <p style={{ color: 'var(--theme-text-muted, #8A7A7A)', fontSize: '10px', marginBottom: '12px' }}>
              Last forged: {formatDate(lastAccessedAt)}
            </p>
          )}

          {/* Action button */}
          {isCompleted ? (
            <div
              className="flex items-center justify-center gap-2 py-3 rounded-xl"
              style={{
                background: 'rgba(245, 208, 96, 0.12)',
                border: '1px solid rgba(245, 208, 96, 0.4)',
              }}
            >
              <span style={{ fontSize: '14px' }}>🏆</span>
              <span
                className="font-bold uppercase tracking-[0.2em]"
                style={{ color: '#F5D060', fontSize: '10px', fontFamily: "var(--theme-font-heading, 'Cinzel', serif)" }}
              >
                SAGA COMPLETE
              </span>
            </div>
          ) : isUnlocked ? (
            <button
              type="button"
              onClick={() => onStartLesson?.(nextLesson?.id)}
              className="btn-gamified-3d btn-gamified-3d-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-[0.18em] transition-all duration-200 cursor-pointer"
              style={{
                fontFamily: "var(--theme-font-heading, 'Cinzel', serif)",
                background: 'var(--theme-btn-primary-gradient)',
                border: '1px solid var(--theme-btn-primary-border, rgba(220, 38, 38, 0.5))',
              }}
            >
              <Sword className="w-4 h-4" />
              <span>{nextLesson ? `Continue: ${nextLesson.title}` : 'Begin Saga'}</span>
            </button>
          ) : null}

          {/* Chapter accordion toggle */}
          {isUnlocked && chapters && chapters.length > 0 && (
            <button
              type="button"
              onClick={() => setChaptersOpen(!chaptersOpen)}
              className="flex items-center justify-center gap-1.5 mt-2.5 w-full py-2 rounded-lg transition-all cursor-pointer"
              style={{
                color: '#8A7A7A',
                fontSize: '11px',
                background: 'rgba(28,16,16,0.5)',
                border: '1px solid rgba(61,28,28,0.5)',
                fontFamily: "'Cinzel', serif",
                letterSpacing: '0.08em',
              }}
            >
              <span>{chaptersOpen ? 'Hide Chapters' : 'View Chapters'}</span>
              {chaptersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          {chaptersOpen && chapters && (
            <ChapterAccordion chapters={chapters} />
          )}
        </div>
      </div>
    </div>
  )
}
