import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'
import { AuthPage } from './pages/AuthPage'
import { AppShell } from './components/layout/AppShell'
import { AdminShell } from './components/layout/AdminShell'
import { GameToaster } from './components/ui/GameToast'
import { CodeQuestOnboardingFlow } from './components/onboarding/CodeQuestOnboardingFlow'
import { ThemeCursor } from './components/ui/ThemeCursor'

const MainApp: React.FC = () => {
  const { user, loading, isAdmin } = useAuth()
  const { theme, bladeCursorActive } = useTheme()
  const [showPreviewOnboarding, setShowPreviewOnboarding] = useState<boolean>(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false)

  // 1. Loading State
  if (loading) {
    if (theme === 'classic') {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center gap-5 bg-blue-600 font-mono text-white">
          <div className="text-5xl animate-bounce">?</div>
          <div className="text-xl animate-pulse tracking-widest">LOADING STAGE...</div>
        </div>
      )
    }
    if (theme === 'space') {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center gap-5 bg-black text-cyan-400 font-sans tracking-widest">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" style={{ filter: 'drop-shadow(0 0 10px cyan)' }}></div>
          <div className="animate-pulse text-sm">INITIALIZING SYSTEM...</div>
        </div>
      )
    }
    if (theme === 'light') {
      return (
         <div className="min-h-screen w-full flex flex-col items-center justify-center gap-5 bg-gray-50 text-gray-900 font-sans">
           <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
           <div className="text-sm font-medium text-gray-500 tracking-wide">Loading workspace...</div>
         </div>
      )
    }
    
    // Default GOW Theme
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-5" style={{ background: 'var(--theme-bg-canvas, #070505)' }}>
        <div
          className="flex items-center justify-center text-red-600 animate-pulse"
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: '72px',
            lineHeight: 1,
            filter: 'drop-shadow(0 0 40px var(--theme-accent-primary, #dc2626))',
          }}
        >
          Ω
        </div>
        <div
          className="flex items-center gap-2 text-red-500/80 text-[11px] uppercase tracking-[0.35em]"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          <span>Entering the Crucible</span>
          <span className="inline-flex gap-1">
            <span className="w-1 h-1 rounded-full bg-red-600 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 rounded-full bg-red-600 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 rounded-full bg-red-600 animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        </div>
      </div>
    )
  }

  // 2. Unauthenticated -> Separate Auth Page
  if (!user) {
    return (
      <>
        {bladeCursorActive && <ThemeCursor theme={theme} />}
        <AuthPage onOpenOnboarding={() => setShowPreviewOnboarding(true)} />
        {showPreviewOnboarding && (
          <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: 'var(--theme-bg-canvas, #070505)' }}>
            <CodeQuestOnboardingFlow onComplete={() => setShowPreviewOnboarding(false)} />
          </div>
        )}
        <GameToaster />
      </>
    )
  }

  // 3. Authenticated -> Check Onboarding ONLY for NEW signup users
  // CRITICAL: The onboarding screen must ONLY be shown to newly registered signups!
  // Existing users logging in or returning MUST NEVER be shown the onboarding screen.
  const isNewSignup =
    Boolean(user?.id) &&
    (sessionStorage.getItem(`just_signed_up_${user.id}`) === 'true' ||
      localStorage.getItem(`new_signup_pending_onboarding_${user.id}`) === 'true')

  const hasAlreadyOnboarded =
    Boolean(user?.id) &&
    (localStorage.getItem(`onboarded_${user.id}`) === 'true' || hasCompletedOnboarding)

  const shouldShowOnboarding = isNewSignup && !hasAlreadyOnboarded && !isAdmin

  if (shouldShowOnboarding) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: 'var(--theme-bg-canvas, #070505)' }}>
        <CodeQuestOnboardingFlow onComplete={() => {
          localStorage.setItem(`onboarded_${user.id}`, 'true')
          localStorage.removeItem(`new_signup_pending_onboarding_${user.id}`)
          sessionStorage.removeItem(`just_signed_up_${user.id}`)
          setHasCompletedOnboarding(true)
        }} />
      </div>
    )
  }

  // 4. Global App Shell Framework
  return (
    <>
      {bladeCursorActive && <ThemeCursor theme={theme} />}
      {isAdmin ? <AdminShell /> : <AppShell />}
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <MainApp />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
