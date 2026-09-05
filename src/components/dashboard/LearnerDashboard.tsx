import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useLearningProgress } from '../../lib/learning'
import { useGamification } from '../../lib/gamification'
import { useAchievementsAndNotifications } from '../../lib/achievements'
import { LessonPage } from '../../pages/LessonPage'
import { CrucibleDashboard } from './crucible/CrucibleDashboard'
import { AppShellDashboardView } from './AppShellDashboardView'
import { Loader2 } from 'lucide-react'

interface LearnerDashboardProps {
  onNavigateTab?: (tab: 'learn' | 'practice' | 'build' | 'community' | 'arcade' | 'dashboard') => void
  onSelectCourse?: (courseId: string) => void
  onSelectLesson?: (lessonId: string) => void
}

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({
  onNavigateTab,
  onSelectCourse,
  onSelectLesson,
}) => {
  const { theme } = useTheme()
  const { user, profile, refreshProfile, loading: authLoading, addXP, incrementStreak } = useAuth()
  const { courses, learningPaths, resumePoint, overallProgress, refreshProgress, loading: learningLoading } = useLearningProgress(user?.id)
  const { stats, refreshGamification, loading: gamificationLoading } = useGamification(user?.id, profile?.xp, profile?.streak, profile?.level)
  const { badges, achievements, activities, refreshAll, loading: achievementsLoading } =
    useAchievementsAndNotifications(user?.id)

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)

  const isLoading = authLoading || (Boolean(user?.id) && (learningLoading || gamificationLoading || achievementsLoading))
  const username = profile?.full_name || profile?.username || user?.user_metadata?.full_name || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Adventurer'

  const handleOpenLesson = (lessonId?: string) => {
    if (onSelectLesson && lessonId) {
      onSelectLesson(lessonId)
      return
    }
    if (lessonId) setActiveLessonId(lessonId)
  }

  const handleLessonRefresh = () => {
    refreshProgress()
    refreshGamification()
    refreshAll()
    if (refreshProfile) refreshProfile()
  }

  if (activeLessonId) {
    return (
      <LessonPage
        lessonId={activeLessonId}
        userId={user?.id}
        onBack={() => setActiveLessonId(null)}
        onNavigateLesson={(nextId) => setActiveLessonId(nextId)}
        onLessonCompleted={handleLessonRefresh}
      />
    )
  }

  if (isLoading) {
    if (theme === 'classic') {
      return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-16">
          <div className="h-32 rounded-3xl animate-pulse bg-[#faf7f2] border border-[#ece7df]" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="h-64 rounded-3xl animate-pulse bg-white border border-[#ece7df]" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-28 rounded-2xl animate-pulse bg-white border border-[#ece7df]" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="h-64 rounded-3xl animate-pulse bg-white border border-[#ece7df]" />
              <div className="h-64 rounded-3xl animate-pulse bg-white border border-[#ece7df]" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 py-6 text-emerald-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-pixel text-[11px] tracking-wider text-emerald-700 font-bold uppercase">
              LOADING YOUR QUEST...
            </span>
          </div>
        </div>
      )
    }

    return (
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-12">
        {/* Crucible loading skeleton */}
        <div className="h-28 rounded-2xl animate-pulse"
          style={{ background: 'linear-gradient(135deg, #0E0A0A, #1a0808)', border: '1px solid #3D1C1C' }}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse"
              style={{ background: '#130909', border: '1px solid #2a1010', animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 h-56 rounded-2xl animate-pulse"
            style={{ background: '#0E0A0A', border: '1px solid #3D1C1C' }}
          />
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="h-24 rounded-xl animate-pulse" style={{ background: '#150F0F', border: '1px solid #3D1C1C' }} />
            <div className="h-24 rounded-xl animate-pulse" style={{ background: '#150F0F', border: '1px solid #3D1C1C' }} />
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 py-6"
          style={{ color: '#FF3D00' }}
        >
          <Loader2 className="w-5 h-5 animate-spin" />
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: '11px', letterSpacing: '0.2em', color: '#DC2626', fontWeight: 700 }}>
            FORGING YOUR SAGA...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {/* Developer Testing Controls */}
      <div className="absolute -top-12 right-0 flex gap-2 z-50">
        <button 
          onClick={() => addXP(500)} 
          className="text-xs font-bold uppercase tracking-wider bg-emerald-600/90 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg shadow-lg border border-emerald-500/50 transition-all cursor-pointer"
        >
          +500 XP
        </button>
        <button 
          onClick={() => incrementStreak()} 
          className="text-xs font-bold uppercase tracking-wider bg-orange-600/90 hover:bg-orange-500 text-white px-3 py-1.5 rounded-lg shadow-lg border border-orange-500/50 transition-all cursor-pointer"
        >
          +1 Streak
        </button>
      </div>

      {theme === 'classic' ? (
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
          onOpenLesson={handleOpenLesson}
          onNavigateTab={onNavigateTab}
          onSelectCourse={onSelectCourse}
        />
      ) : (
        <CrucibleDashboard
          username={username}
          stats={stats}
          resumePoint={resumePoint}
          courses={courses}
          learningPaths={learningPaths}
          overallProgress={overallProgress}
          badges={badges}
          achievements={achievements}
          activities={activities}
          onOpenLesson={handleOpenLesson}
          onNavigateTab={onNavigateTab}
          onSelectCourse={onSelectCourse}
        />
      )}
    </div>
  )
}
