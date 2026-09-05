import React, { useState } from 'react'
import { Sidebar, type NavItemKey } from './Sidebar'
import { CrucibleHeader } from './CrucibleHeader'
import { LumiAIFloatingButton } from './LumiAIFloatingButton'
import { MobileBottomNav } from './MobileBottomNav'
import { LearnCatalogView } from '../learn/LearnCatalogView'
import { CourseDetailView } from '../learn/CourseDetailView'
import { InteractiveLessonView } from '../learn/InteractiveLessonView'
import { CodingChallengeView } from '../learn/CodingChallengeView'
import { QuestIDEView } from '../learn/QuestIDEView'
import { PracticeArenaView } from '../practice/PracticeArenaView'
import { ChallengeBriefingView } from '../practice/ChallengeBriefingView'
import { CrucibleWorkspace } from '../crucible/CrucibleWorkspace'
import { getCrucibleChallenge } from '../crucible/challengeData'
import { ProjectsStudioView } from '../build/ProjectsStudioView'
import { ProjectIDEView, ProjectIDERightPanel } from '../build/ProjectIDEView'
import { DwarvenForgeWorkbench } from '../crucible/DwarvenForgeWorkbench'
import { CommunityPage } from '../../pages/CommunityPage'
import { TeamArcadePage } from '../../pages/TeamArcadePage'
import { LearnerDashboard } from '../dashboard/LearnerDashboard'
import { ThemeStudioView } from '../theme/ThemeStudioView'
import { ProfileView, type ProfileSubTab } from '../profile/ProfileView'
import { SettingsView } from '../settings/SettingsView'
import { LearningPathView } from '../learn/LearningPathView'
import { LevelProgressionView } from '../levels/LevelProgressionView'
import { GameToaster } from '../ui/GameToast'
import { AlexPixelAvatar } from '../brand/PixelArtAvatars'
import {
  Sparkles,
  HelpCircle,
  MessageSquare,
  Camera,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { saveCourseProgress } from '../../lib/courseProgress'
import { useTheme } from '../../context/ThemeContext'
import { SpiderNetDecal, SpiderEmblemIcon } from '../ui/SpiderNetDecal'
import type { DashboardMode } from './CrucibleHeader'

export const AppShell: React.FC = () => {
  const { user, profile, isAdmin } = useAuth()
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<NavItemKey>(isAdmin ? 'admin' : 'dashboard')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dashboardMode: DashboardMode = (profile?.xp ?? 0) > 50 ? 'headquarters' : 'first_time'
  const [profileSubTab, setProfileSubTab] = useState<ProfileSubTab>('overview')

  const handleSelectTab = (tab: NavItemKey | string) => {
    if (tab === 'quests') {
      setActiveTab('profile')
      setProfileSubTab('quests')
      return
    }
    if (tab === 'achievements') {
      setActiveTab('profile')
      setProfileSubTab('achievements')
      return
    }
    if (tab === 'badges') {
      setActiveTab('profile')
      setProfileSubTab('badges')
      return
    }
    setActiveTab(tab as NavItemKey)
    if (tab !== 'learn') {
      setSelectedCourseId(null)
      setSelectedLessonId(null)
      setSelectedChallengeId(null)
      setSelectedQuestId(null)
    } else {
      setSelectedCourseId(null)
      setSelectedLessonId(null)
      setSelectedChallengeId(null)
      setSelectedQuestId(null)
    }
  }
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null)
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null)
  const [practiceBriefingId, setPracticeBriefingId] = useState<string | null>(null)
  const [crucibleChallengeId, setCrucibleChallengeId] = useState<string | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedGuidedProjectId, setSelectedGuidedProjectId] = useState<string | null>(null)
  const [buildTasks, setBuildTasks] = useState([
    { label: 'Create hero section', xp: 25, done: true },
    { label: 'Add navigation', xp: 25, done: true },
    { label: 'Create project cards', xp: 25, done: true },
    { label: 'Add responsive layout', xp: 25, done: true },
    { label: 'Add contact section', xp: 25, done: false, active: true },
    { label: 'Add animations', xp: 25, done: false },
    { label: 'Test mobile layout', xp: 25, done: false },
    { label: 'Publish project', xp: 100, done: false },
  ])

  const isLevel1 = dashboardMode === 'first_time'

  return (
    <div
      className="min-h-screen w-full flex flex-col md:flex-row antialiased transition-colors duration-300"
      style={{
        background: 'var(--theme-bg-canvas, #070505)',
        color: 'var(--theme-text-primary, #E8D5D5)',
        fontFamily: "var(--theme-font-body, 'Inter', system-ui, sans-serif)",
      }}
    >
      {/* ── ATMOSPHERIC BACKGROUND CANVAS (fixed, below everything) ── */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
        style={{ opacity: 'var(--theme-watermark-opacity, 1)' }}
      >
        {/* Layer 1: Background photo (NYC skyline for Spiderman, Nordic peaks for GoW) */}
        <img
          src={
            theme === 'spiderman'
              ? 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=2400&q=85'
              : 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=2400&q=85'
          }
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          style={{
            filter: 'var(--theme-bg-image-filter, brightness(0.24) contrast(1.3) saturate(0.8))',
            display: 'var(--theme-bg-image-display, block)',
            opacity: 'var(--theme-bg-image-opacity, 1)',
          }}
        />
        {/* Layer 2: Atmosphere radial overlay */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: 'var(--theme-bg-radial-overlay, radial-gradient(circle at 50% 15%, rgba(185,28,28,0.32) 0%, transparent 55%), radial-gradient(circle at 50% 100%, rgba(153,27,27,0.40) 0%, transparent 65%), radial-gradient(circle at 15% 50%, rgba(0,229,255,0.09) 0%, transparent 45%), linear-gradient(to bottom, rgba(7,5,5,0.65) 0%, rgba(7,5,5,0.90) 100%))',
            display: 'var(--theme-bg-overlay-display, block)',
          }}
        />

        {/* Spider-Man ambient web nets on viewport corners */}
        {theme === 'spiderman' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <SpiderNetDecal position="top-right" size={240} glow={true} />
            <SpiderNetDecal position="top-left" size={240} glow={true} />
            <SpiderNetDecal position="bottom-right" size={200} glow={true} />
            <SpiderNetDecal position="bottom-left" size={200} glow={true} />
          </div>
        )}

        {/* Layer 3: Central Watermark */}
        {theme === 'spiderman' ? (
          <div
            className="absolute pointer-events-none select-none transition-all duration-300 flex items-center justify-center animate-spider-sense"
            aria-hidden="true"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              userSelect: 'none',
              display: 'var(--theme-watermark-display, block)',
              opacity: 0.18,
            }}
          >
            <SpiderEmblemIcon
              size={560}
              glowColor="rgba(0, 210, 255, 0.5)"
            />
          </div>
        ) : (
          <div
            className="absolute animate-omega-breathe pointer-events-none select-none transition-all duration-300"
            aria-hidden="true"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '620px',
              lineHeight: 1,
              fontFamily: "'Cinzel Decorative', serif",
              fontWeight: 900,
              color: 'var(--theme-watermark-color, rgba(185,28,28,0.12))',
              filter: 'drop-shadow(0 0 80px var(--theme-watermark-glow, rgba(220,38,38,0.45)))',
              userSelect: 'none',
              display: 'var(--theme-watermark-display, block)',
            }}
          >
            Ω
          </div>
        )}
      </div>
      {/* 1. LEFT PERSISTENT SIDEBAR (Desktop / Tablet) */}
      <div className="hidden md:block shrink-0">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab)
            if (tab !== 'learn') {
              setSelectedCourseId(null)
              setSelectedLessonId(null)
              setSelectedChallengeId(null)
              setSelectedQuestId(null)
            } else {
              setSelectedCourseId('python')
              setSelectedLessonId(null)
              setSelectedChallengeId(null)
              setSelectedQuestId(null)
            }
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onContinueQuest={() => {
            setActiveTab('learn')
            setSelectedCourseId('python')
            setSelectedLessonId('ch4-lesson3')
          }}
          userMode={isLevel1 ? 'level1' : 'level12'}
          isAdmin={isAdmin}
        />
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl flex flex-col animate-in slide-in-from-left">
            <Sidebar
              activeTab={activeTab === 'quests' || activeTab === 'achievements' || activeTab === 'badges' ? 'profile' : activeTab}
              onSelectTab={(tab) => {
                handleSelectTab(tab)
                setIsMobileMenuOpen(false)
              }}
              isCollapsed={false}
              onContinueQuest={() => {
                setActiveTab('learn')
                setSelectedCourseId('python')
                setSelectedLessonId('ch4-lesson3')
                setIsMobileMenuOpen(false)
              }}
              userMode={isLevel1 ? 'level1' : 'level12'}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      )}

      {/* 2. MAIN APPLICATION COLUMN */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        {/* ── The Helm of War — Mythic Global Header ── */}
        <CrucibleHeader
          activeTab={activeTab === 'quests' || activeTab === 'achievements' || activeTab === 'badges' ? 'profile' : activeTab}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          onSelectTab={(tab) => handleSelectTab(tab)}
          dashboardMode={dashboardMode}
          courseDetailTitle={
            activeTab === 'learn'
              ? selectedQuestId
                ? 'Chapter 04 / Loops & Logic ➔ Countdown Challenge'
                : selectedChallengeId
                  ? 'Loops & Logic / Exercise 03'
                  : selectedLessonId
                    ? 'Python Adventure / Chapter 04 / Lesson 03'
                    : selectedCourseId
                      ? 'Course / Python Adventure'
                      : null
              : activeTab === 'practice' && practiceBriefingId
                ? 'Practice / Challenge Arena / Reverse the String'
                : null
          }
          onOpenLumi={() => {
            const btn = document.querySelector('button[title="Ask Lumi AI Mentor"]') as HTMLButtonElement | null
            btn?.click()
          }}
        />

        {/* Dynamic Content Area (The Crucible Arena) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <LearnerDashboard
              onNavigateTab={(tab) => handleSelectTab(tab)}
              onSelectCourse={(courseId) => {
                handleSelectTab('learn')
                setSelectedCourseId(courseId)
                setSelectedLessonId(null)
                setSelectedChallengeId(null)
                setSelectedQuestId(null)
              }}
              onSelectLesson={(lessonId) => {
                handleSelectTab('learn')
                setSelectedCourseId('python')
                setSelectedLessonId(lessonId)
                setSelectedChallengeId(null)
                setSelectedQuestId(null)
              }}
            />
          )}

          {activeTab === 'learn' && (
            <>
              {selectedQuestId ? (
                <QuestIDEView
                  onBackToLesson={() => setSelectedQuestId(null)}
                  onNextLesson={() => {
                    setSelectedQuestId(null)
                    setSelectedChallengeId(null)
                    setSelectedLessonId(null)
                  }}
                />
              ) : selectedChallengeId ? (
                <CodingChallengeView
                  onBackToLesson={() => setSelectedChallengeId(null)}
                  onNextLesson={() => {
                    setSelectedQuestId('ch4-quest03')
                  }}
                />
              ) : selectedLessonId ? (
                <InteractiveLessonView
                  onBackToCourse={() => setSelectedLessonId(null)}
                  onPreviousLesson={() => setSelectedLessonId(null)}
                  onNextLesson={() => setSelectedChallengeId('ch4-ex03')}
                />
              ) : selectedCourseId ? (
                <CourseDetailView
                  courseId={selectedCourseId}
                  onBackToCourses={() => setSelectedCourseId(null)}
                  onStartQuest={() => {
                    if (user?.id) {
                      saveCourseProgress(user.id, selectedCourseId, 15)
                    }
                    setSelectedLessonId('ch4-lesson3')
                  }}
                  onSelectLesson={(lessonId) => {
                    if (user?.id) {
                      saveCourseProgress(user.id, selectedCourseId, 25)
                    }
                    setSelectedLessonId(lessonId)
                  }}
                  onOpenLumi={() => {
                    const btn = document.querySelector('button[title="Ask Lumi AI Mentor"]') as HTMLButtonElement | null
                    btn?.click()
                  }}
                />
              ) : (
                <LearnCatalogView
                  onSelectCourse={(id) => setSelectedCourseId(id)}
                  onOpenLumi={() => {
                    const btn = document.querySelector('button[title="Ask Lumi AI Mentor"]') as HTMLButtonElement | null
                    btn?.click()
                  }}
                />
              )}
            </>
          )}

          {activeTab === 'practice' && (
            crucibleChallengeId ? (
              <CrucibleWorkspace
                challenge={getCrucibleChallenge(crucibleChallengeId) ?? getCrucibleChallenge('reverse-string')!}
                userId={user?.id}
                onBack={() => setCrucibleChallengeId(null)}
                onNextChallenge={() => setCrucibleChallengeId(null)}
              />
            ) : practiceBriefingId ? (
              <ChallengeBriefingView
                challengeId={practiceBriefingId}
                onBack={() => setPracticeBriefingId(null)}
                onStartChallenge={() => {
                  setCrucibleChallengeId(practiceBriefingId)
                  setPracticeBriefingId(null)
                }}
                onPreviousChallenge={() => setPracticeBriefingId(null)}
              />
            ) : (
              <PracticeArenaView
                onStartChallenge={(id?: string) => {
                  if (id) {
                    setCrucibleChallengeId(id)
                  } else {
                    setPracticeBriefingId('reverse-string')
                  }
                }}
              />
            )
          )}

          {activeTab === 'build' && (
            selectedGuidedProjectId ? (
              <DwarvenForgeWorkbench
                projectId={selectedGuidedProjectId}
                onBack={() => setSelectedGuidedProjectId(null)}
              />
            ) : selectedProjectId ? (
              <div className="grid grid-cols-12 gap-5 items-start">
                <div className="col-span-9">
                  <ProjectIDEView onBack={() => setSelectedProjectId(null)} />
                </div>
                <div className="col-span-3">
                  <ProjectIDERightPanel
                    tasks={buildTasks}
                    onToggleTask={(i) => setBuildTasks(prev => prev.map((t, idx) => idx === i ? { ...t, done: !t.done } : t))}
                  />
                </div>
              </div>
            ) : (
              <ProjectsStudioView
                onNewProject={() => setSelectedProjectId('portfolio')}
                onSelectGuidedProject={(id) => setSelectedGuidedProjectId(id)}
              />
            )
          )}

          {activeTab === 'arcade' && <TeamArcadePage />}

          {activeTab === 'community' && <CommunityPage />}

          {(activeTab === 'profile' || activeTab === 'quests' || activeTab === 'badges' || activeTab === 'achievements') && (
            <ProfileView
              initialSubTab={
                activeTab === 'quests'
                  ? 'quests'
                  : activeTab === 'achievements'
                    ? 'achievements'
                    : activeTab === 'badges'
                      ? 'badges'
                      : profileSubTab
              }
              onSubTabChange={setProfileSubTab}
              onNavigateTab={handleSelectTab}
            />
          )}

          {activeTab === 'theme' && <ThemeStudioView />}

          {activeTab === 'settings' && (
            <SettingsView />
          )}

          {activeTab === 'help' && (
            <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 text-left animate-in fade-in pb-12">
              <div className="p-6 sm:p-8 bg-white rounded-3xl border border-[#ece7df] shadow-xs">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-stone-900">Help & Support Realm</h2>
                    <p className="text-xs text-stone-500 font-medium">Guides, documentation, and mentorship assistance</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 rounded-2xl bg-[#fbf9f4] border border-[#ece7df] flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Lumi AI Assistant</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Need immediate help on syntax errors, quest hints, or coding explanations? Click &quot;Ask Lumi&quot; on the bottom right.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#fbf9f4] border border-[#ece7df] flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                      <span>Community Discussions</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Connect with fellow learners, exchange feedback, and share your project builds in the Community Realm.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 3. GLOBAL FLOATING LUMI AI BUTTON */}
      <LumiAIFloatingButton />

      {/* 4. MOBILE BOTTOM NAVIGATION */}
      <MobileBottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* 5. GLOBAL GAME TOASTER FOR AUDIO-VISUAL FEEDBACK */}
      <GameToaster />
    </div>
  )
}
