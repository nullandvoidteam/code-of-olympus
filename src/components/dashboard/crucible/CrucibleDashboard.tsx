import React, { useState } from 'react'
import { Sword, Star, Flame, Trophy, Zap, Shield } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'
import type { GamificationStats } from '../../../lib/gamification'
import type { ResumePoint, CourseProgressSummary, LearningPath, OverallLearnerProgress } from '../../../lib/learning'
import type { BadgeItem, AchievementItem, ActivityItem } from '../../../lib/achievements'
import { ResumeShrine } from './ResumeShrine'
import { RageGauge } from './RageGauge'
import { RealmPath } from './RealmPath'
import { CourseCard } from './CourseCard'
import { TrophyGrid } from './TrophyGrid'
import { AppShellDashboardView } from '../AppShellDashboardView'

interface CrucibleDashboardProps {
  username: string
  stats: GamificationStats
  resumePoint: ResumePoint | null
  courses: CourseProgressSummary[]
  learningPaths: LearningPath[]
  overallProgress: OverallLearnerProgress
  badges: BadgeItem[]
  achievements: AchievementItem[]
  activities: ActivityItem[]
  onOpenLesson: (lessonId?: string) => void
  onNavigateTab?: (tab: 'learn' | 'practice' | 'build' | 'community' | 'arcade' | 'dashboard' | 'achievements' | 'profile' | 'quests') => void
  onSelectCourse?: (courseId: string) => void
  [key: string]: any
}

// God of War / Norse Stat Pillar
function StatPillar({ icon: Icon, label, value, color, subLabel, onClick }: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
  subLabel?: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] ${
        onClick ? 'cursor-pointer hover:border-red-500/50' : ''
      }`}
      style={{
        background: 'linear-gradient(145deg, var(--theme-surface-card-alt, #120A0A) 0%, var(--theme-surface-card, #080404) 100%)',
        border: '1px solid var(--theme-border-default, rgba(61, 28, 28, 0.9))',
        boxShadow: `var(--theme-shadow-card, 0 4px 20px rgba(7,5,5,0.7))`,
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center relative"
        style={{
          background: `${color}18`,
          border: `1px solid ${color}40`,
          boxShadow: `0 0 12px ${color}22`,
        }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span
        className="font-bold tabular-nums text-2xl tracking-wide"
        style={{ color: 'var(--theme-text-primary, #F1E5E5)', fontFamily: "var(--theme-font-heading, 'Cinzel', serif)" }}
      >
        {value}
      </span>
      <span
        className="font-bold uppercase tracking-[0.16em] text-center"
        style={{ color, fontSize: '10px', fontFamily: "var(--theme-font-heading, 'Cinzel', serif)" }}
      >
        {label}
      </span>
      {subLabel && (
        <span className="text-center font-medium" style={{ color: 'var(--theme-text-muted, #8A7A7A)', fontSize: '11px', fontFamily: "var(--theme-font-body, 'Inter', sans-serif)" }}>
          {subLabel}
        </span>
      )}
    </div>
  )
}

export const CrucibleDashboard: React.FC<CrucibleDashboardProps> = (props) => {
  const {
    username,
    stats,
    resumePoint,
    courses = [],
    learningPaths = [],
    overallProgress = { completedCourses: 0, totalCourses: 0, completedLessons: 0, totalLessons: 0, percent: 0, totalIslands: 0, completedIslands: 0, progressPercent: 0 },
    badges = [],
    achievements = [],
    activities = [],
    onOpenLesson,
    onNavigateTab,
    onSelectCourse,
  } = props
  const { theme } = useTheme()
  const [activeSection, setActiveSection] = useState<'sagas' | 'realms' | 'trophies'>('sagas')

  if ((theme as string) === 'classic') {
    return (
      <AppShellDashboardView
        username={username}
        stats={stats}
        resumePoint={resumePoint}
        courses={courses}
        learningPaths={learningPaths}
        overallProgress={overallProgress}
        badges={badges}
        achievements={achievements}
        activities={activities}
        onOpenLesson={onOpenLesson}
        onNavigateTab={onNavigateTab}
        onSelectCourse={onSelectCourse}
      />
    )
  }

  const earnedBadges = badges.filter((b) => b.isUnlocked)
  const completionPercent = (overallProgress as any).progressPercent ?? (overallProgress as any).percent ?? 0

  return (
    <div
      className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-12 select-none"
      style={{ fontFamily: "var(--theme-font-body, 'Inter', system-ui, sans-serif)" }}
    >
      {/* ── HERO BANNER ─────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 sm:p-7 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, var(--theme-surface-card-alt, #110808) 0%, var(--theme-surface-card, #1a0a0a) 45%, var(--theme-bg-canvas, #0c0505) 100%)',
          border: '1px solid var(--theme-border-strong, rgba(80, 30, 30, 0.85))',
          boxShadow: 'var(--theme-shadow-card, 0 8px 36px rgba(7,5,5,0.9))',
        }}
      >
        {/* Background Runic Watermark & Nordic Glyphs (GoW only) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.06] flex items-center justify-between px-10"
          style={{ display: 'var(--theme-watermark-display, block)' }}
        >
          <span className="text-9xl font-black text-red-600" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
            Ω
          </span>
          <span className="text-8xl font-black text-amber-500" style={{ fontFamily: "'Cinzel', serif" }}>
            ᛟ
          </span>
          <span className="text-9xl font-black text-red-600" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
            ᚱ
          </span>
        </div>

        {/* Ember radial glows */}
        <div
          className="absolute top-0 right-0 w-80 h-40 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, var(--theme-glow-ambient, rgba(255,61,0,0.14)) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-64 h-32 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--theme-glow-ambient, rgba(220,38,38,0.1)) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-[0.25em]"
                style={{
                  background: 'var(--theme-accent-primary-dim, rgba(220,38,38,0.18))',
                  border: '1px solid var(--theme-border-strong, rgba(220,38,38,0.45))',
                  color: 'var(--theme-accent-glow, #EF4444)',
                  fontFamily: "var(--theme-font-heading, 'Cinzel', serif)",
                }}
              >
                ⚔ BASTION OF WAR
              </span>
              <span style={{ color: 'var(--theme-text-dim, #666)' }}>•</span>
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: 'var(--theme-accent-secondary, #C59B27)', fontFamily: "var(--theme-font-heading, 'Cinzel', serif)" }}
              >
                LEVEL {stats?.level ?? 1} WARRIOR
              </span>
            </div>

            <h1
              className="font-bold uppercase tracking-wide leading-tight text-3xl sm:text-4xl text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(135deg, #FFFFFF 0%, #F5E6E6 40%, #D4A373 80%, #C59B27 100%)',
                fontFamily: "var(--theme-font-heading, 'Cinzel', serif)",
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))',
              }}
            >
              Hail, {username}
            </h1>

            <p className="mt-1 text-sm font-medium" style={{ color: 'var(--theme-text-muted, #A89898)' }}>
              {resumePoint
                ? `Your adventure awaits in the Realm — continue ${resumePoint.courseTitle}.`
                : 'Ready for your next quest? Enter the realm and forge your path.'}
            </p>
          </div>

          {/* Overall progress altar orb */}
          <div
            className="shrink-0 flex items-center sm:flex-col justify-between sm:justify-center gap-2 px-6 py-4 rounded-2xl relative"
            style={{
              background: 'linear-gradient(145deg, var(--theme-surface-card-alt, rgba(30,12,12,0.8)) 0%, var(--theme-surface-card, rgba(14,6,6,0.9)) 100%)',
              border: '1px solid var(--theme-border-default, rgba(80, 30, 30, 0.9))',
              boxShadow: 'var(--theme-shadow-card, 0 0 20px rgba(255,61,0,0.12))',
            }}
          >
            <div className="flex flex-col items-center">
              <span
                className="font-bold text-3xl sm:text-4xl tracking-tight"
                style={{
                  color: 'var(--theme-accent-glow, #FF3D00)',
                  fontFamily: "var(--theme-font-heading, 'Cinzel', serif)",
                  filter: 'drop-shadow(0 0 12px rgba(255,61,0,0.5))',
                }}
              >
                {completionPercent}%
              </span>
              <span
                className="uppercase tracking-[0.2em] font-bold mt-0.5"
                style={{ color: 'var(--theme-accent-secondary, #C59B27)', fontSize: '10px', fontFamily: "var(--theme-font-heading, 'Cinzel', serif)" }}
              >
                COMPLETED
              </span>
            </div>
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
              style={{
                background: 'var(--theme-surface-hover, rgba(61,28,28,0.7))',
                border: '1px solid var(--theme-border-default, #3D1C1C)',
                color: 'var(--theme-text-muted, #A89898)',
              }}
            >
              {overallProgress.completedLessons ?? 0}/{overallProgress.totalLessons ?? 0} Trials
            </span>
          </div>
        </div>
      </div>

      {/* ── STATS PILLARS ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatPillar
          icon={Flame}
          label="FURY STREAK"
          value={stats?.streak ?? 0}
          color="#FF3D00"
          subLabel={`${stats?.streak ?? 0} day${(stats?.streak ?? 0) !== 1 ? 's' : ''} active`}
          onClick={() => onNavigateTab?.('quests')}
        />
        <StatPillar
          icon={Star}
          label="HACKSILVER XP"
          value={(stats?.xp ?? 0).toLocaleString()}
          color="#F5D060"
          subLabel="Points Earned"
          onClick={() => onNavigateTab?.('profile')}
        />
        <StatPillar
          icon={Trophy}
          label="TROPHIES"
          value={earnedBadges.length}
          color="#DC2626"
          subLabel={`of ${badges.length} unlocked`}
          onClick={() => onNavigateTab?.('badges' as any)}
        />
        <StatPillar
          icon={Zap}
          label="ASCENSION"
          value={`Lvl ${stats?.level ?? 1}`}
          color="#00E5FF"
          subLabel={`${Math.max(0, (stats?.nextLevelXp ?? 1000) - (stats?.xp ?? 0))} XP to next`}
          onClick={() => onNavigateTab?.('profile')}
        />
      </div>

      {/* ── RESUME SHRINE + RAGE GAUGE ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <ResumeShrine
            resumePoint={resumePoint}
            onResume={(lessonId) => onOpenLesson(lessonId)}
          />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-4">
          <RageGauge stats={stats} />

          {/* Level Ascension Slab */}
          <div
            className="rounded-xl p-5 flex flex-col justify-between"
            style={{
              background: 'linear-gradient(145deg, var(--theme-surface-card-alt, #120A0A) 0%, var(--theme-surface-card, #0A0606) 100%)',
              border: '1px solid var(--theme-border-default, rgba(61, 28, 28, 0.85))',
              boxShadow: 'var(--theme-shadow-card, 0 4px 16px rgba(0,0,0,0.5))',
            }}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span
                  className="font-bold tracking-[0.18em] uppercase"
                  style={{ color: 'var(--theme-accent-cyan, #00E5FF)', fontSize: '10px', fontFamily: "var(--theme-font-heading, 'Cinzel', serif)" }}
                >
                  LEVEL ASCENSION
                </span>
              </div>
              <span
                className="font-bold uppercase tracking-wider"
                style={{ color: 'var(--theme-accent-secondary, #F5D060)', fontSize: '11px', fontFamily: "var(--theme-font-heading, 'Cinzel', serif)" }}
              >
                TIER {stats?.level ?? 1}
              </span>
            </div>

            <div
              className="w-full h-4 rounded-lg overflow-hidden p-[1px]"
              style={{ background: 'var(--theme-bg-subtle, #090404)', border: '1px solid var(--theme-border-default, #3D1C1C)' }}
            >
              {(() => {
                const progressInLevel = (stats?.xp ?? 0) - (stats?.currentLevelBaseXp ?? 0)
                const levelRange = (stats?.nextLevelXp ?? 1000) - (stats?.currentLevelBaseXp ?? 0)
                const pct = levelRange > 0 ? Math.min(100, Math.round((progressInLevel / levelRange) * 100)) : 0
                return (
                  <div
                    className="h-full rounded-md transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: 'linear-gradient(90deg, #0284C7 0%, #00E5FF 100%)',
                      boxShadow: '0 0 12px var(--theme-accent-glow, rgba(0, 229, 255, 0.6))',
                    }}
                  />
                )
              })()}
            </div>

            <div className="flex justify-between items-center mt-2">
              <span style={{ color: 'var(--theme-text-muted, #8A7A7A)', fontSize: '11px', fontFamily: "'Inter', sans-serif" }}>
                {(stats?.xp ?? 0) - (stats?.currentLevelBaseXp ?? 0)} / {(stats?.nextLevelXp ?? 1000) - (stats?.currentLevelBaseXp ?? 0)} XP
              </span>
              <span
                style={{ color: 'var(--theme-accent-cyan, #00E5FF)', fontSize: '10px', fontFamily: "var(--theme-font-heading, 'Cinzel', serif)", fontWeight: 700, letterSpacing: '0.1em' }}
              >
                TIER {(stats?.level ?? 1) + 1} ➔
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION NAVIGATION TABS ────────────────────────────────── */}
      <div
        className="flex items-center gap-2 p-1.5 rounded-xl"
        style={{
          background: 'var(--theme-surface-card, rgba(14, 10, 10, 0.95))',
          border: '1px solid var(--theme-border-default, rgba(61, 28, 28, 0.85))',
          boxShadow: 'var(--theme-shadow-card, 0 4px 20px rgba(0,0,0,0.6))',
        }}
      >
        {([
          { key: 'sagas', label: 'SAGAS & LABORS', icon: '⚔' },
          { key: 'realms', label: 'NINE REALMS', icon: 'ᛟ' },
          { key: 'trophies', label: 'VALHALLA TROPHIES', icon: '🏆' },
        ] as const).map(({ key, label, icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveSection(key)}
            className="flex-1 py-3 px-4 rounded-lg font-bold uppercase tracking-[0.18em] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            style={{
              fontFamily: "var(--theme-font-heading, 'Cinzel', serif)",
              fontSize: '11px',
              background: activeSection === key
                ? 'var(--theme-btn-primary-gradient, linear-gradient(135deg, #B91C1C 0%, #DC2626 50%, #991B1B 100%))'
                : 'transparent',
              color: activeSection === key ? '#FFFFFF' : 'var(--theme-text-muted, #8A7A7A)',
              border: activeSection === key ? '1px solid var(--theme-btn-primary-border, rgba(220,38,38,0.5))' : '1px solid transparent',
              boxShadow: activeSection === key ? '0 0 16px var(--theme-glow-ambient, rgba(220, 38, 38, 0.4))' : 'none',
            }}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── SAGAS & MYTHIC LABORS (Course Grid) ───────────────────── */}
      {activeSection === 'sagas' && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sword className="w-5 h-5" style={{ color: '#FF3D00' }} />
              <h2
                className="font-bold uppercase tracking-wide text-lg text-stone-100"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Sagas & Mythic Labors
              </h2>
            </div>
            <span
              className="font-bold tracking-widest text-[11px] px-3 py-1 rounded-full uppercase"
              style={{
                background: 'rgba(61,28,28,0.5)',
                border: '1px solid #3D1C1C',
                color: '#C59B27',
                fontFamily: "'Cinzel', serif",
              }}
            >
              {overallProgress.completedCourses ?? 0}/{overallProgress.totalCourses ?? courses.length} CONQUERED
            </span>
          </div>

          {courses.length === 0 ? (
            <div
              className="py-16 text-center rounded-2xl"
              style={{ background: '#0E0A0A', border: '1px solid #2a1010' }}
            >
              <p
                className="font-bold uppercase tracking-[0.2em]"
                style={{ color: '#8A7A7A', fontSize: '11px', fontFamily: "'Cinzel', serif" }}
              >
                NO SAGAS PUBLISHED IN THIS REALM
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((courseData) => (
                <CourseCard
                  key={courseData.course.id}
                  courseData={courseData}
                  onStartLesson={(lessonId) => onOpenLesson(lessonId)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── NINE REALMS PATH ──────────────────────────────────────── */}
      {activeSection === 'realms' && (
        <RealmPath
          islands={learningPaths}
          onSelectRealm={(islandId) => {
            if (onSelectCourse) onSelectCourse(islandId)
            else if (onNavigateTab) onNavigateTab('learn')
          }}
        />
      )}

      {/* ── VALHALLA TROPHIES & ACTIVITY ─────────────────────────── */}
      {activeSection === 'trophies' && (
        <TrophyGrid
          badges={badges}
          achievements={achievements}
          activities={activities}
        />
      )}
    </div>
  )
}
