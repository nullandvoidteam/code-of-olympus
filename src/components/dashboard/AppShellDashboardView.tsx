import React, { useState } from 'react'
import {
  ArrowRight,
  Check,
  Lock,
  Star,
  Clock,
  Heart,
  Sparkles,
  Flame,
  Award,
  Layers,
  Repeat,
  Trophy,
} from 'lucide-react'
import { getTimeGreeting } from '../../lib/timeGreeting'
import { useAuth } from '../../context/AuthContext'

import type { GamificationStats } from '../../lib/gamification'
import type { ResumePoint, CourseProgressSummary, LearningPath, OverallLearnerProgress } from '../../lib/learning'
import type { BadgeItem, AchievementItem, ActivityItem } from '../../lib/achievements'
import type { CommunityPost } from '../../lib/community'
import type { Challenge } from '../../lib/challenges'

export interface AppShellDashboardViewProps {
  username?: string
  stats?: GamificationStats
  resumePoint?: ResumePoint | null
  courses?: CourseProgressSummary[]
  learningPaths?: LearningPath[]
  overallProgress?: OverallLearnerProgress
  badges?: BadgeItem[]
  achievements?: AchievementItem[]
  activities?: ActivityItem[]
  communityPosts?: CommunityPost[]
  dailyChallenge?: Challenge | null
  onOpenLesson?: (lessonId?: string) => void
  onNavigateTab?: (tab: 'learn' | 'practice' | 'build' | 'community' | 'arcade' | 'dashboard' | 'profile' | 'quests' | 'achievements') => void
  onSelectCourse?: (courseId: string) => void
  [key: string]: any
}

export const AppShellDashboardView: React.FC<AppShellDashboardViewProps> = ({
  username,
  stats,
  resumePoint,
  courses = [],
  learningPaths = [],
  overallProgress,
  badges = [],
  achievements = [],
  activities = [],
  communityPosts = [],
  dailyChallenge,
  onOpenLesson,
  onNavigateTab,
  onSelectCourse,
}) => {
  const { user, profile } = useAuth()
  const { greeting, emoji } = getTimeGreeting()
  const userName =
    username ||
    profile?.full_name ||
    profile?.username ||
    user?.user_metadata?.first_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Adventurer'

  const [lumiDismissed, setLumiDismissed] = useState(false)
  const [activeTabSection, setActiveTabSection] = useState<'path' | 'courses'>('courses')
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({})

  const handleToggleLike = (id: string) => {
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Calculated Gamified Stats from Supabase
  const currentLevel = stats?.level ?? 1
  const currentXp = stats?.xp ?? 0
  const currentStreak = stats?.streak ?? 0
  const unlockedBadges = badges.filter((b) => b.isUnlocked).length
  const baseXp = stats?.currentLevelBaseXp ?? 0
  const nextXp = stats?.nextLevelXp ?? 1000
  const levelRange = Math.max(1, nextXp - baseXp)
  const progressInLevel = Math.max(0, currentXp - baseXp)
  const levelPct = Math.min(100, Math.max(0, Math.round((progressInLevel / levelRange) * 100)))
  const xpToNext = Math.max(0, nextXp - currentXp)

  const dailyGoalXp = stats?.dailyGoalXp ?? 50
  const dailyXpEarned = stats?.dailyXpEarned ?? 0
  const dailyGoalPercent = Math.min(100, Math.max(0, Math.round((dailyXpEarned / dailyGoalXp) * 100)))

  // Active / Primary Course
  const activeCourse = courses.find((c) => c.course.id === resumePoint?.courseId) || courses[0]

  // Continue Quest Dynamic Data
  const hasResumePoint = Boolean(resumePoint && resumePoint.courseTitle)
  const courseTitle = hasResumePoint ? resumePoint!.courseTitle : activeCourse?.course?.title || 'Coding Adventure'
  const chapterTitle = hasResumePoint ? resumePoint!.chapterTitle || 'Current Chapter' : activeCourse?.chapters?.[0]?.title || 'Chapter 1'
  const lessonDesc = hasResumePoint
    ? `Continue: ${resumePoint!.lessonTitle}`
    : activeCourse?.course?.description || 'Embark on your journey and conquer coding quests.'
  const progressPct = hasResumePoint ? resumePoint!.progressPercent : activeCourse?.progressPercent ?? 0
  const remainingCount = Math.max(
    1,
    (overallProgress?.totalLessons ?? (activeCourse?.totalLessons || 1)) -
      (overallProgress?.completedLessons ?? (activeCourse?.completedLessons || 0))
  )

  // Dynamic Adventure Path Nodes derived from active course chapters or learning paths
  const dynamicPathNodes = React.useMemo(() => {
    if (activeCourse && activeCourse.chapters && activeCourse.chapters.length > 0) {
      let foundCurrent = false
      return activeCourse.chapters.map((ch, idx) => {
        let status: 'completed' | 'current' | 'locked' = 'locked'
        if (ch.isCompleted) {
          status = 'completed'
        } else if (!foundCurrent) {
          status = 'current'
          foundCurrent = true
        } else {
          status = 'locked'
        }
        return {
          id: ch.id,
          title: ch.title,
          status,
          order: idx + 1,
        }
      })
    }

    if (learningPaths && learningPaths.length > 0) {
      return learningPaths.map((lp, idx) => ({
        id: lp.id,
        title: lp.title,
        status: (lp.isCompleted ? 'completed' : idx === 0 ? 'current' : 'locked') as 'completed' | 'current' | 'locked',
        order: idx + 1,
      }))
    }

    return []
  }, [activeCourse, learningPaths])

  // Real Unlocked Achievements & Badges from Supabase
  const unlockedAchievements = achievements.filter((a) => a.isUnlocked || a.isClaimed).slice(0, 4)
  const recentBadges = badges.filter((b) => b.isUnlocked).slice(0, 4)

  // Real Community Posts (up to 3 real items)
  const displayPosts = communityPosts.slice(0, 3)

  // Helper to resolve badge image
  const getBadgeImage = (slug?: string, title?: string, fallbackIndex = 0) => {
    const s = (slug || title || '').toLowerCase()
    if (s.includes('streak')) return '/extracted/badge_streak.png'
    if (s.includes('bug')) return '/extracted/badge_bug_hunter.png'
    if (s.includes('fast') || s.includes('debug')) return '/extracted/badge_fast_debugger.png'
    if (s.includes('build') || s.includes('project')) return '/extracted/badge_first_build.png'
    if (s.includes('warrior')) return '/extracted/badge_code_warrior.png'
    if (s.includes('master')) return '/extracted/badge_quest_master.png'
    if (s.includes('step') || s.includes('quest')) return '/extracted/badge_first_steps.png'
    const fallbacks = [
      '/extracted/badge_first_steps.png',
      '/extracted/badge_streak.png',
      '/extracted/badge_code_warrior.png',
      '/extracted/badge_quest_master.png',
    ]
    return fallbacks[fallbackIndex % fallbacks.length]
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 text-left pb-16 select-none font-sans">
      {/* ========================================================================= */}
      {/* 1. FULL-WIDTH WELCOME HERO GREETING BANNER (DYNAMIC TIME & USER + ART)     */}
      {/* ========================================================================= */}
      <div
        onClick={() => (onNavigateTab ? onNavigateTab('learn') : undefined)}
        className="w-full rounded-3xl overflow-hidden border border-[#ece7df] shadow-xs cursor-pointer hover:shadow-md transition-all relative min-h-[160px] sm:min-h-[185px] bg-[#faf7f2] flex items-center justify-between p-6 sm:p-8 group"
      >
        {/* Full Banner Canvas Image Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <img
            src="/extracted/hero2_art_clean.png"
            alt="Hero Banner Canvas"
            className="w-full h-full object-cover object-right sm:object-[85%_center] select-none transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* Subtle gradient scrim to guarantee optimal text contrast and readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#faf7f2] via-[#faf7f2]/85 to-transparent sm:via-[#faf7f2]/65" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#faf7f2]/30 via-transparent to-transparent" />
        </div>

        <div className="flex flex-col gap-1.5 z-10 max-w-xl">
          <div className="flex items-center gap-1.5 text-emerald-700 font-pixel text-[10px] font-bold tracking-wider uppercase">
            <span className="text-amber-400">✦</span>
            <span>YOUR CODING ADVENTURE</span>
            <span className="text-amber-400">✦</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight flex items-center gap-2 gamified-shaky-title">
            <span>{greeting}, {userName}</span>
            <span className="text-2xl sm:text-3xl inline-block transition-transform hover:rotate-12 cursor-default">{emoji}</span>
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 font-medium">
            Ready for your next quest? Sharpen your skills and conquer today&apos;s challenges.
          </p>

          <div className="flex sm:hidden items-center gap-2 mt-2">
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-pixel font-bold">
              LVL {currentLevel}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-[10px] font-pixel font-bold">
              {currentStreak}d STREAK
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN 2-COLUMN GRID (8 COLS LEFT / 4 COLS RIGHT)                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ===================================================================== */}
        {/* LEFT COLUMN (8 Cols): Continue Quest, Progress, Path, Community        */}
        {/* ===================================================================== */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Priority #1: Dynamic CURRENT QUEST Card */}
          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-400/80 shadow-[0_4px_24px_rgba(16,185,129,0.08)] flex flex-col justify-between gap-5 relative overflow-hidden">
            {/* Header Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base text-rose-500">🚩</span>
                <span className="font-pixel text-[11px] font-bold text-stone-800 uppercase tracking-wider">
                  {hasResumePoint ? 'CONTINUE YOUR QUEST' : 'START YOUR ADVENTURE'}
                </span>
              </div>

              {/* +XP Reward Pill */}
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-pixel font-bold shadow-2xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>+100 XP</span>
              </div>
            </div>

            {/* Body content with Title, Chapter, Description & Illustration */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="p-1 rounded-2xl shrink-0 bg-stone-50 border border-stone-100 flex items-center justify-center">
                  <img
                    src={
                      courseTitle.toLowerCase().includes('python')
                        ? '/extracted/icon_python_snake.png'
                        : courseTitle.toLowerCase().includes('html') || courseTitle.toLowerCase().includes('web')
                        ? '/extracted/learn_card_html.png'
                        : '/extracted/icon_python_snake.png'
                    }
                    alt=""
                    className="w-11 h-11 object-contain"
                  />
                </div>

                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight truncate">
                      {courseTitle}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      {chapterTitle}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl">
                    {lessonDesc}
                  </p>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3 mt-3 w-full max-w-md">
                    <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="font-pixel text-[10px] font-bold text-emerald-600 shrink-0">
                      {progressPct}%
                    </span>
                    <span className="text-[11px] font-medium text-stone-400 shrink-0">
                      {remainingCount} trial{remainingCount !== 1 ? 's' : ''} remaining
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Retro Pixel Terminal Desktop Illustration from Reference */}
              <div className="hidden sm:flex shrink-0 w-36 h-24 items-center justify-center">
                <img
                  src="/extracted/quest_terminal_art.png"
                  alt="Terminal"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  if (hasResumePoint && resumePoint?.lessonId && onOpenLesson) {
                    onOpenLesson(resumePoint.lessonId)
                  } else if (activeCourse?.nextLesson?.id && onOpenLesson) {
                    onOpenLesson(activeCourse.nextLesson.id)
                  } else if (onNavigateTab) {
                    onNavigateTab('learn')
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] active:bg-[#047857] text-white text-xs font-extrabold shadow-[0_4px_0_#047857] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{hasResumePoint ? 'Continue Quest' : 'Start Quest'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const cId = resumePoint?.courseId || activeCourse?.course?.id
                  if (cId && onSelectCourse) {
                    onSelectCourse(cId)
                  } else if (onNavigateTab) {
                    onNavigateTab('learn')
                  }
                }}
                className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold shadow-[0_2px_0_#CBD5E1] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              >
                View Syllabus
              </button>
            </div>
          </div>

          {/* Section 2: YOUR PROGRESS (4-Card Row - 100% Dynamic) */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <span className="text-base">📊</span>
              <h3 className="font-bold text-base text-stone-900">Your Progress</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* Card 01: LEVEL */}
              <div className="bg-white rounded-2xl p-4 border border-[#ece7df] shadow-xs flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-[9px] font-bold text-stone-400 uppercase">LEVEL</span>
                  <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
                    <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                  </div>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-stone-900 font-pixel">{currentLevel}</span>
                  <span className="text-xs font-bold text-stone-500 font-mono">({currentXp} XP)</span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${levelPct}%` }} />
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium">
                    +{xpToNext} XP to next level
                  </span>
                </div>
              </div>

              {/* Card 02: STREAK */}
              <div className="bg-white rounded-2xl p-4 border border-[#ece7df] shadow-xs flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-[9px] font-bold text-stone-400 uppercase">STREAK</span>
                  <div className="w-6 h-6 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-500">
                    <Flame className="w-3.5 h-3.5 fill-orange-500" />
                  </div>
                </div>

                <div className="flex items-baseline gap-1 text-2xl font-black text-stone-900 font-pixel">
                  <span>{currentStreak}</span>
                  <span className="text-xs font-sans font-bold text-stone-600">days</span>
                </div>

                <div className="text-[10px] text-stone-500 font-medium">
                  {currentStreak > 0 ? 'Consecutive learning days' : 'Practice today to start streak'}
                </div>
              </div>

              {/* Card 03: BADGES */}
              <div 
                onClick={() => onNavigateTab?.('badges' as any)}
                className="bg-white rounded-2xl p-4 border border-[#ece7df] shadow-xs flex flex-col justify-between gap-2 cursor-pointer hover:border-purple-300 hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-[9px] font-bold text-stone-400 uppercase">BADGES</span>
                  <div className="w-6 h-6 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                    <Award className="w-3.5 h-3.5 fill-purple-400 text-purple-600" />
                  </div>
                </div>

                <div className="text-2xl font-black text-stone-900 font-pixel">
                  {unlockedBadges}
                </div>

                <div className="text-[10px] text-stone-500 font-medium">
                  {badges.length > 0 ? `of ${badges.length} unlocked` : 'Discover badges in quests'}
                </div>
              </div>

              {/* Card 04: TRIALS / QUESTS COMPLETED */}
              <div 
                onClick={() => onNavigateTab?.('quests')}
                className="bg-white rounded-2xl p-4 border border-[#ece7df] shadow-xs flex flex-col justify-between gap-2 cursor-pointer hover:border-sky-300 hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-[9px] font-bold text-stone-400 uppercase">TRIALS</span>
                  <div className="w-6 h-6 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="text-2xl font-black text-stone-900 font-pixel">
                  {overallProgress?.completedLessons ?? 0}
                </div>

                <div className="text-[10px] text-stone-500 font-medium">
                  {overallProgress?.completedCourses ?? 0} courses mastered
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: ADVENTURE PATH & ALL COURSES (100% Dynamic) */}
          <div className="bg-white rounded-3xl p-6 border border-[#ece7df] shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveTabSection('courses')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTabSection === 'courses'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    📚 All Courses ({courses.length})
                  </button>

                  {dynamicPathNodes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTabSection('path')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeTabSection === 'path'
                          ? 'bg-white text-emerald-700 shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      🗺️ Adventure Path ({dynamicPathNodes.length})
                    </button>
                  )}
                </div>
              </div>
              <span className="text-xs text-stone-500 font-medium">
                {activeTabSection === 'courses'
                  ? 'Explore all courses in your curriculum.'
                  : `Path for ${activeCourse?.course?.title || 'active quest'}.`}
              </span>
            </div>

            {/* Content: Dynamic All Courses Grid */}
            {activeTabSection === 'courses' ? (
              courses.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-xs">
                  No courses published yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {courses.map((c) => {
                    const titleLower = c.course.title.toLowerCase()
                    const isPython = titleLower.includes('python')
                    const isWeb = titleLower.includes('web') || titleLower.includes('html')
                    const isJs = titleLower.includes('javascript') || titleLower.includes('js')
                    const isReact = titleLower.includes('react')
                    const isAi = titleLower.includes('ai')

                    const cardImg = isPython
                      ? '/extracted/learn_card_python.png'
                      : isWeb
                      ? '/extracted/learn_card_html.png'
                      : isJs
                      ? '/extracted/learn_card_js.png'
                      : isReact
                      ? '/extracted/learn_card_react.png'
                      : isAi
                      ? '/extracted/learn_card_ai.png'
                      : '/extracted/learn_card_game.png'

                    return (
                      <div
                        key={c.course.id}
                        className="p-4 rounded-2xl border border-stone-200/80 bg-stone-50/50 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white border border-stone-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs p-1">
                            <img src={cardImg} alt="" className="w-full h-full object-contain" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-extrabold text-xs sm:text-sm text-stone-900 truncate">
                                {c.course.title}
                              </h4>
                              <span className="px-2 py-0.2 rounded-md bg-stone-100 text-stone-600 text-[10px] font-bold">
                                {c.course.difficulty || 'Beginner'}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 leading-relaxed font-medium">
                              {c.course.description || 'Master core programming skills.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                          <div className="flex items-center gap-2 flex-1 max-w-[140px]">
                            <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.progressPercent}%` }} />
                            </div>
                            <span className="font-pixel text-[9px] font-bold text-emerald-700">
                              {c.progressPercent}%
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (c.nextLesson?.id && onOpenLesson) {
                                onOpenLesson(c.nextLesson.id)
                              } else if (onSelectCourse) {
                                onSelectCourse(c.course.id)
                              } else if (onNavigateTab) {
                                onNavigateTab('learn')
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] active:bg-[#047857] text-white text-[11px] font-extrabold shadow-[0_2px_0_#047857] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                          >
                            {c.progressPercent > 0 ? 'Continue' : 'Start'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            ) : (
              /* Content: Dynamic Adventure Path Map */
              <div className="relative flex items-center justify-between gap-4 overflow-x-auto py-4 px-2">
                {dynamicPathNodes.length === 0 ? (
                  <div className="py-6 text-center text-stone-400 text-xs w-full">
                    Enroll in a course to explore chapters.
                  </div>
                ) : (
                  dynamicPathNodes.map((node) => {
                    const isCompleted = node.status === 'completed'
                    const isCurrent = node.status === 'current'
                    const isLocked = node.status === 'locked'

                    return (
                      <div
                        key={node.id}
                        onClick={() => !isLocked && onNavigateTab && onNavigateTab('learn')}
                        className={`relative z-10 flex flex-col items-center gap-2 transition-transform shrink-0 ${
                          isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-105'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shadow-xs transition-all ${
                            isCompleted
                              ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                              : isCurrent
                              ? 'bg-white text-emerald-700 border-2 border-emerald-500 ring-4 ring-emerald-300/40'
                              : 'bg-stone-100 text-stone-400 border border-stone-200'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : isCurrent ? (
                            <Repeat className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-stone-400" />
                          )}
                        </div>

                        <div className="flex flex-col items-center max-w-[100px] text-center">
                          <span
                            className={`text-[11px] truncate w-full font-medium ${
                              isCurrent
                                ? 'font-bold text-emerald-700'
                                : isCompleted
                                ? 'font-semibold text-stone-800'
                                : 'text-stone-400'
                            }`}
                          >
                            {node.title}
                          </span>
                          {isCurrent && (
                            <span className="text-[8px] font-pixel text-emerald-600 font-bold uppercase mt-0.5">
                              Current
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* Section 4: FROM THE COMMUNITY (Only Real Supabase Posts) */}
          {displayPosts.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-base text-purple-600">👥</span>
                  <h3 className="font-bold text-base text-stone-900">From the Community</h3>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('community')}
                  className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Explore Community</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {displayPosts.map((post, idx) => {
                  const author = post.author_name || 'Community Member'
                  const isLiked = Boolean(likedMap[post.id] ?? post.is_liked_by_user)
                  const likeCount = (post.likes_count ?? 0) + (likedMap[post.id] && !post.is_liked_by_user ? 1 : 0)

                  const defaultImgs = [
                    '/extracted/community_weather.png',
                    '/extracted/community_space.png',
                    '/extracted/community_ai.png',
                  ]
                  const thumbnail = post.image_url || defaultImgs[idx % defaultImgs.length]

                  return (
                    <div
                      key={post.id}
                      className="bg-white rounded-2xl p-3 border border-[#ece7df] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                    >
                      <div>
                        <img
                          src={thumbnail}
                          alt=""
                          className="w-full h-24 object-cover rounded-xl"
                        />
                        <h4 className="font-bold text-xs text-stone-900 mt-2.5 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                          {post.content}
                        </h4>
                        <div className="text-[10.5px] text-stone-500 font-medium mt-1">
                          By {author}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => handleToggleLike(post.id)}
                          className={`flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer ${
                            isLiked ? 'text-rose-500' : 'text-stone-400 hover:text-rose-500'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
                          <span>{likeCount}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onNavigateTab?.('community')}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-700 text-stone-600 text-[10.5px] font-bold transition-colors cursor-pointer"
                        >
                          Discuss
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ===================================================================== */}
        {/* RIGHT COLUMN (4 Cols): Today's Quest, Recent Achievements, Lumi       */}
        {/* ===================================================================== */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* 1. TODAY'S QUEST & DAILY GOAL (Dynamic) */}
          <div className="bg-white rounded-3xl p-6 border border-[#ece7df] shadow-xs flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎯</span>
                  <h3 className="font-bold text-base text-stone-900">Today&apos;s Quest</h3>
                </div>
                {currentStreak > 0 && (
                  <span className="text-[10px] font-bold text-orange-600 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
                    <span>Keeps your {currentStreak}-day streak alive</span>
                  </span>
                )}
              </div>

              {/* Challenge Details Card with Gamepad Icon */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 flex flex-col gap-2.5 mt-2">
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded-xl shrink-0 bg-white border border-stone-200/80 shadow-2xs">
                    <img src="/extracted/icon_gamepad.png" alt="Gamepad" className="w-10 h-10 object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900 leading-tight truncate">
                      {dailyChallenge?.title || 'Daily Code Challenge'}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[9px] font-bold">
                        {dailyChallenge?.category || 'Algorithm'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                        {dailyChallenge?.difficulty || 'Practice'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-xs">
                  <div className="flex items-center gap-1 text-[11px] text-stone-600 font-medium">
                    <span>Daily XP:</span>
                    <span className="font-bold text-emerald-600">{dailyXpEarned}/{dailyGoalXp}</span>
                  </div>

                  <div className="font-pixel text-[10px] font-bold text-amber-600">
                    +{dailyChallenge?.xp_reward ?? 100} XP ⭐
                  </div>
                </div>

                {/* Daily Goal Bar */}
                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${dailyGoalPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => (onNavigateTab ? onNavigateTab('practice') : undefined)}
              className="w-full py-2.5 bg-[#10B981] hover:bg-[#059669] active:bg-[#047857] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-[0_4px_0_#047857] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <span>{dailyGoalPercent >= 100 ? 'Practice Again' : 'Start Quest'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 2. RECENT ACHIEVEMENTS (Real Unlocked Data from Supabase + Badges Art) */}
          <div className="bg-white rounded-3xl p-6 border border-[#ece7df] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🏆</span>
                <h3 className="font-bold text-base text-stone-900">Recent Achievements</h3>
              </div>
              <button
                type="button"
                onClick={() => (onNavigateTab ? onNavigateTab('achievements') : undefined)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {unlockedAchievements.length > 0 || recentBadges.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {unlockedAchievements.map((ach, idx) => (
                  <div key={ach.id} className="p-3 rounded-2xl bg-[#faf8f4] border border-[#ece7df] flex items-center gap-2.5 min-w-0">
                    <img
                      src={getBadgeImage(ach.slug, ach.title, idx)}
                      alt=""
                      className="w-8 h-8 object-contain shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-[11px] text-stone-900 truncate">{ach.title}</h4>
                      <span className="text-[9.5px] text-amber-600 font-pixel font-bold block truncate">+{ach.rewardXp} XP</span>
                    </div>
                  </div>
                ))}

                {recentBadges.map((badge, idx) => (
                  <div key={badge.id} className="p-3 rounded-2xl bg-[#faf8f4] border border-[#ece7df] flex items-center gap-2.5 min-w-0">
                    <img
                      src={getBadgeImage(badge.slug, badge.title, idx + 2)}
                      alt=""
                      className="w-8 h-8 object-contain shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-[11px] text-stone-900 truncate">{badge.title}</h4>
                      <span className="text-[9.5px] text-emerald-600 font-bold block truncate">Unlocked</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center text-center gap-2 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                <Trophy className="w-8 h-8 text-stone-300" />
                <span className="text-xs font-bold text-stone-700">No achievements unlocked yet</span>
                <p className="text-[11px] text-stone-400 max-w-[200px]">
                  Complete lessons and challenges to earn your first trophies!
                </p>
              </div>
            )}
          </div>

          {/* 3. LUMI CONTEXTUAL TIP CARD (Dynamic Mentoring + Mascot Image) */}
          {!lumiDismissed ? (
            <div className="bg-gradient-to-b from-purple-50/70 via-white to-white rounded-3xl p-6 border border-purple-200/80 shadow-xs flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/extracted/lumi_tip_mascot.png"
                    alt="Lumi"
                    className="w-12 h-12 object-contain shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">Lumi has a tip for you</h3>
                    <span className="text-[10px] text-purple-600 font-bold font-pixel">AI MENTOR</span>
                  </div>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed font-medium bg-white/90 p-3 rounded-2xl border border-purple-100 shadow-2xs">
                  {hasResumePoint
                    ? `You're currently making progress in ${courseTitle}! Keep going or practice in the Arena to test your understanding.`
                    : currentStreak > 0
                    ? `You have an active ${currentStreak}-day streak! Complete a lesson today to maintain your momentum.`
                    : 'Welcome to Code of Olympus! Start with your first course in the Learn tab to begin earning XP.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => (onNavigateTab ? onNavigateTab('practice') : undefined)}
                  className="flex-1 py-2.5 bg-[#10B981] hover:bg-[#059669] active:bg-[#047857] text-white rounded-xl text-xs font-extrabold shadow-[0_3px_0_#047857] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  Practice Arena
                </button>

                <button
                  type="button"
                  onClick={() => setLumiDismissed(true)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-xs font-bold shadow-[0_2px_0_#CBD5E1] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-[#ece7df] shadow-xs flex flex-col items-center justify-center text-center gap-2">
              <img src="/extracted/lumi_tip_mascot.png" alt="Lumi" className="w-10 h-10 object-contain" />
              <div className="font-bold text-xs text-stone-800">Lumi is standing by</div>
              <p className="text-[11px] text-stone-500 max-w-xs">
                Click &ldquo;Ask Lumi&rdquo; anytime in the bottom right corner for instant hints or debugging assistance.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. INSPIRATIONAL BOTTOM MOTTO & DECORATION                                */}
      {/* ========================================================================= */}
      <div className="pt-4 flex items-center justify-center gap-2 text-stone-500 font-pixel text-[10px] tracking-wider uppercase">
        <span className="text-amber-400">✨</span>
        <span>Keep building. Keep learning. Keep leveling up.</span>
        <span className="text-amber-400">✨</span>
      </div>
    </div>
  )
}
