import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useLearningProgress } from '../../lib/learning'
import { useGamification } from '../../lib/gamification'
import { useAchievementsAndNotifications } from '../../lib/achievements'
import { fetchCommunityFeed, type CommunityPost } from '../../lib/community'
import type { Challenge } from '../../lib/challenges'
import { supabase } from '../../lib/supabase'
import { LessonPage } from '../../pages/LessonPage'
import { CrucibleDashboard } from './crucible/CrucibleDashboard'
import { AppShellDashboardView } from './AppShellDashboardView'
import { Loader2 } from 'lucide-react'

interface LearnerDashboardProps {
  onNavigateTab?: (tab: 'learn' | 'practice' | 'build' | 'community' | 'arcade' | 'dashboard' | 'profile' | 'quests' | 'achievements') => void
  onSelectCourse?: (courseId: string) => void
  onSelectLesson?: (lessonId: string) => void
}

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({
  onNavigateTab,
  onSelectCourse,
  onSelectLesson,
}) => {
  const { theme } = useTheme()
  const { user, profile, refreshProfile, loading: authLoading } = useAuth()
  const { courses, learningPaths, resumePoint, overallProgress, refreshProgress, loading: learningLoading } = useLearningProgress(user?.id)
  const { stats, refreshGamification, loading: gamificationLoading } = useGamification(user?.id, profile?.xp, profile?.streak, profile?.level)
  const { badges, achievements, activities, refreshAll, loading: achievementsLoading } =
    useAchievementsAndNotifications(user?.id)

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([])
  const [dailyChallenge, setDailyChallenge] = useState<Challenge | null>(null)

  useEffect(() => {
    let isMounted = true
    async function fetchDashboardExtras() {
      try {
        const [feed, chalRes] = await Promise.all([
          fetchCommunityFeed(user?.id),
          supabase
            .from('challenges')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle(),
        ])
        if (isMounted) {
          if (feed) setCommunityPosts(feed)
          if (chalRes?.data) setDailyChallenge(chalRes.data as Challenge)
        }
      } catch (err) {
        console.error('Error loading dashboard community / daily challenge:', err)
      }
    }
    fetchDashboardExtras()
    return () => {
      isMounted = false
    }
  }, [user?.id])

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
              <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-4 gap-3.5">
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

    if (theme === 'spiderman') {
      return (
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-12">
          {/* Spider-HQ loading skeleton */}
          <div
            className="h-28 rounded-2xl animate-pulse"
            style={{ background: 'linear-gradient(135deg, #151E3A, #0B1021)', border: '1px solid #2A3A65' }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl animate-pulse"
                style={{ background: '#151E3A', border: '1px solid #2A3A65', animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div
              className="lg:col-span-3 h-56 rounded-2xl animate-pulse"
              style={{ background: '#151E3A', border: '1px solid #2A3A65' }}
            />
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="h-24 rounded-xl animate-pulse" style={{ background: '#101730', border: '1px solid #2A3A65' }} />
              <div className="h-24 rounded-xl animate-pulse" style={{ background: '#101730', border: '1px solid #2A3A65' }} />
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 py-6 text-[#00F0FF]">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs font-black tracking-widest text-[#00F0FF] uppercase">
              CALIBRATING SPIDER-NETWORK HUD...
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
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-4 gap-4">
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
          communityPosts={communityPosts}
          dailyChallenge={dailyChallenge}
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
          communityPosts={communityPosts}
          dailyChallenge={dailyChallenge}
          onOpenLesson={handleOpenLesson}
          onNavigateTab={onNavigateTab}
          onSelectCourse={onSelectCourse}
        />
      )}
    </div>
  )
}
